// /reviews 정적 대체 페이지 (서버 렌더링 함수가 없는 호스팅에서 사용)
// 공개 규칙을 통과한 후기만 Firestore REST로 읽어 같은 렌더러로 그립니다.
import { fetchPublishedReviews } from './firestore-public.mjs';
import { renderReviewCard, renderReviewDetail, sortReviews } from './review-core.mjs';

const grid = document.getElementById('rvGrid');
const empty = document.getElementById('rvEmpty');
const params = new URLSearchParams(location.search);

async function main() {
    const slug = params.get('review') || '';
    let list = [];
    try { list = sortReviews(await fetchPublishedReviews({ slug })); }
    catch (e) { console.warn('후기 불러오기 실패:', e); }
    if (slug && list[0]) {
        grid.outerHTML = renderReviewDetail(list[0]);
        if (empty) empty.hidden = true;
        document.title = list[0].title + ' — 수강 후기 | 필로소피 AI 교육';
        return;
    }
    const cat = params.get('cat') || '';
    const shown = list.filter(r => !cat || (r.categories || []).includes(cat));
    grid.innerHTML = shown.map(r => renderReviewCard(r, { basePath: '/reviews?review=' })).join('');
    if (empty) empty.hidden = shown.length > 0;
    document.querySelectorAll('.rv-filter a[data-cat]').forEach(a => {
        if ((a.getAttribute('data-cat') || '') === cat) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
}
main();
