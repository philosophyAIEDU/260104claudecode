// 정적 페이지 생성기 — 의존성 없이 Node 18+ 에서 실행
//   npm run build:pages
// src/site/data.mjs · insights.mjs 의 사실 데이터를 바탕으로 아래 파일을 다시 씁니다.
//   ai-instructor.html, programs.html, case-studies.html, reviews.html(정적 대체),
//   insights/index.html, insights/<slug>/index.html, llms.txt, sitemap.xml(정적 대체)
// Netlify 에서는 /reviews 와 /sitemap.xml 을 함수가 실시간으로 응답합니다(netlify.toml).
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { notFoundPage, aiInstructorPage, programsPage, caseStudiesPage, insightsIndexPage, insightPage, reviewsListPage } from '../src/site/pages.mjs';
import { INSIGHTS } from '../src/site/insights.mjs';
import { buildLlmsTxt, buildSitemapXml } from '../src/site/seo.mjs';
import { reviewEvidenceHome, reviewHeroLine, homeLd, homeFaq } from '../src/site/pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ───────── 게시된 후기 스냅샷 ─────────
// 공개 규칙(게시 + 공개 동의 확인)을 통과한 후기만 읽어 정적 페이지(강사 소개·프로그램·사례·메인)에 근거로 넣습니다.
// 네트워크가 안 되면 마지막 스냅샷을 그대로 씁니다. 후기를 새로 게시했다면 이 스크립트를 다시 실행하세요.
import { fetchPublishedReviews } from '../assets/js/firestore-public.mjs';
const SNAP = join(root, 'src/site/reviews-snapshot.json');
const PUBLIC_FIELDS = ['slug', 'title', 'authorDisplay', 'anonymous', 'authorType', 'program', 'categories', 'institution', 'reviewDate',
    'concernBefore', 'memorablePractice', 'changeAfter', 'adminSummary', 'originalText', 'featured'];
let reviews = [];
try {
    const live = await fetchPublishedReviews({ limit: 500 });
    reviews = live.map(r => Object.fromEntries(PUBLIC_FIELDS.map(k => [k, r[k] ?? (k === 'categories' ? [] : '')])))
        .sort((a, b) => String(b.reviewDate).localeCompare(String(a.reviewDate)) || a.slug.localeCompare(b.slug));
    writeFileSync(SNAP, JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), reviews }, null, 1) + '\n');
    console.log(`reviews snapshot: ${reviews.length}건 (Firestore)`);
} catch (e) {
    if (existsSync(SNAP)) { reviews = JSON.parse(readFileSync(SNAP, 'utf8')).reviews; console.log(`reviews snapshot: ${reviews.length}건 (저장된 스냅샷 사용 — ${e.message})`); }
    else console.log('reviews snapshot: 없음 (' + e.message + ')');
}
const out = (rel, content) => {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
    console.log('wrote', rel, `(${Buffer.byteLength(content)} bytes)`);
};

out('ai-instructor.html', aiInstructorPage(reviews));
out('programs.html', programsPage(reviews));
out('case-studies.html', caseStudiesPage(reviews));
out('reviews.html', reviewsListPage({ ssr: false }));
out('insights/index.html', insightsIndexPage());
for (const a of INSIGHTS) out(`insights/${a.slug}/index.html`, insightPage(a));
out('404.html', notFoundPage());
out('llms.txt', buildLlmsTxt(reviews));
out('sitemap.xml', buildSitemapXml(reviews));

// ───────── 손으로 관리하는 페이지(index.html)의 표시 구역만 채우기 ─────────
function fillBlock(file, name, html) {
    const p = join(root, file);
    const src = readFileSync(p, 'utf8');
    const re = new RegExp(`(<!-- BUILD:${name}[^>]*-->)[\\s\\S]*?(<!-- /BUILD:${name} -->)`);
    if (!re.test(src)) { console.log(`skip ${file} (${name} 표시 없음)`); return; }
    writeFileSync(p, src.replace(re, (_, a, b) => `${a}\n${html}\n${b}`));
    console.log('filled', file, name);
}
fillBlock('index.html', 'reviews-home', reviewEvidenceHome(reviews));
fillBlock('index.html', 'reviews-hero', reviewHeroLine(reviews));
fillBlock('index.html', 'home-ld', homeLd(reviews));
fillBlock('index.html', 'home-faq', homeFaq(reviews));
