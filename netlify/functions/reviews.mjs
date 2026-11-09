// 후기 페이지 서버 렌더링 (Netlify Function)
// ─────────────────────────────────────────────────────────────
//   /reviews            → 게시된 후기 목록 (?cat=분류 필터)
//   /reviews/<slug>     → 후기 상세 (고유 URL)
// 검색 크롤러가 JavaScript 실행 없이도 후기 본문을 읽을 수 있도록 완성된 HTML을 돌려줍니다.
// 데이터는 공개 규칙(게시 + 공개 동의 확인)을 통과한 문서만 Firestore REST로 읽습니다.
import { readFileSync } from 'node:fs';
import { fetchPublishedReviews } from '../../assets/js/firestore-public.mjs';
import { renderReviewCard, sortReviews, isValidSlug, CATEGORIES } from '../../assets/js/review-core.mjs';
import { reviewsListPage, reviewDetailPage } from '../../src/site/pages.mjs';
import { page, crumbs } from '../../src/site/layout.mjs';

const HTML = { 'Content-Type': 'text/html; charset=utf-8' };
// 브라우저 1분, CDN 5분 캐시 (후기 수정 후 최대 5분 내 반영)
const CACHE = { 'Cache-Control': 'public, max-age=60', 'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

/** 테스트용: REVIEWS_FIXTURE=JSON 파일 경로 를 주면 Firestore 대신 파일을 읽음 */
export async function loadReviews(opts = {}) {
    if (process.env.REVIEWS_FIXTURE) {
        const all = JSON.parse(readFileSync(process.env.REVIEWS_FIXTURE, 'utf8'));
        return all.filter(r => r.status === 'published' && r.consentStatus === 'confirmed' && (!opts.slug || r.slug === opts.slug));
    }
    return fetchPublishedReviews(opts);
}

function slugFrom(event) {
    const p = String(event.path || (event.rawUrl ? new URL(event.rawUrl).pathname : '') || '');
    const m = /^\/reviews\/([^/?#]+)\/?$/.exec(p);
    if (m) return decodeURIComponent(m[1]);
    return (event.queryStringParameters || {}).slug || '';
}

function notFound() {
    return {
        statusCode: 404, headers: { ...HTML, 'Cache-Control': 'public, max-age=60' },
        body: page({
            title: '후기를 찾을 수 없습니다 | 필로소피 AI 교육', description: '요청하신 후기가 없거나 비공개로 전환되었습니다.',
            path: '/reviews', active: 'reviews', robots: 'noindex',
            body: `${crumbs([{ name: '홈', path: '/' }, { name: '교육 후기', path: '/reviews' }])}<section class="section"><div class="wrap narrow"><h1>후기를 찾을 수 없습니다</h1><p>요청하신 후기가 없거나 비공개로 전환되었습니다.</p><p><a class="btn btn-primary" href="/reviews">후기 목록 보기</a></p></div></section>`,
        }),
    };
}

export const handler = async (event) => {
    const slug = slugFrom(event);
    try {
        if (slug) {
            if (!isValidSlug(slug)) return notFound();
            const [found] = await loadReviews({ slug });
            if (!found) return notFound();
            const all = sortReviews(await loadReviews());
            const related = all.filter(r => r.slug !== slug && (r.program === found.program || (r.categories || []).some(c => (found.categories || []).includes(c))));
            return { statusCode: 200, headers: { ...HTML, ...CACHE }, body: reviewDetailPage(found, related) };
        }
        const qs = event.queryStringParameters || {};
        const cat = CATEGORIES.some(c => c.key === qs.cat) ? qs.cat : '';
        const list = sortReviews(await loadReviews());
        // 모든 카드를 렌더링하고, 선택된 분류 외 카드는 hidden (JS 필터와 같은 결과, 크롤러는 전체 텍스트를 읽음)
        const cards = list.map(r => {
            const html = renderReviewCard(r);
            return cat && !(r.categories || []).includes(cat) ? html.replace('<article class="rv-card"', '<article hidden class="rv-card"') : html;
        }).join('\n');
        const visible = list.filter(r => !cat || (r.categories || []).includes(cat)).length;
        return { statusCode: 200, headers: { ...HTML, ...CACHE }, body: reviewsListPage({ cardsHtml: cards, count: visible, cat, ssr: true, reviews: list }) };
    } catch (e) {
        console.error('reviews SSR error:', e);
        // Firestore 장애 시에도 페이지는 열리도록: 정적 대체 페이지와 같은 화면 (브라우저가 다시 시도)
        return { statusCode: 200, headers: { ...HTML, 'Cache-Control': 'no-store' }, body: reviewsListPage({ ssr: false }) };
    }
};
