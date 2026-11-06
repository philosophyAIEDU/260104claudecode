// 정적 페이지 생성기 — 의존성 없이 Node 18+ 에서 실행
//   npm run build:pages
// src/site/data.mjs · insights.mjs 의 사실 데이터를 바탕으로 아래 파일을 다시 씁니다.
//   ai-instructor.html, programs.html, case-studies.html, reviews.html(정적 대체),
//   insights/index.html, insights/<slug>/index.html, llms.txt, sitemap.xml(정적 대체)
// Netlify 에서는 /reviews 와 /sitemap.xml 을 함수가 실시간으로 응답합니다(netlify.toml).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { notFoundPage, aiInstructorPage, programsPage, caseStudiesPage, insightsIndexPage, insightPage, reviewsListPage } from '../src/site/pages.mjs';
import { INSIGHTS } from '../src/site/insights.mjs';
import { buildLlmsTxt, buildSitemapXml } from '../src/site/seo.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (rel, content) => {
    const p = join(root, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, content);
    console.log('wrote', rel, `(${Buffer.byteLength(content)} bytes)`);
};

out('ai-instructor.html', aiInstructorPage());
out('programs.html', programsPage());
out('case-studies.html', caseStudiesPage());
out('reviews.html', reviewsListPage({ ssr: false }));
out('insights/index.html', insightsIndexPage());
for (const a of INSIGHTS) out(`insights/${a.slug}/index.html`, insightPage(a));
out('404.html', notFoundPage());
out('llms.txt', buildLlmsTxt());
out('sitemap.xml', buildSitemapXml([]));
