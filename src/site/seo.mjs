// llms.txt · sitemap.xml 생성 (사실 데이터와 같은 출처)
import { SITE, HISTORY, PROGRAM_DETAILS, STATUS_LABEL, historyStats, buildFaq } from './data.mjs';
import { INSIGHTS } from './insights.mjs';
import { abs } from './layout.mjs';

export const STATIC_PAGES = [
    { path: '/', lastmod: SITE.updated, priority: '1.0' },
    { path: '/ai-instructor', lastmod: SITE.updated, priority: '0.9' },
    { path: '/programs', lastmod: SITE.updated, priority: '0.9' },
    { path: '/case-studies', lastmod: SITE.updated, priority: '0.8' },
    { path: '/reviews', lastmod: SITE.updated, priority: '0.8' },
    { path: '/education-inquiry', lastmod: SITE.updated, priority: '0.9' },
    { path: '/insights/', lastmod: SITE.updated, priority: '0.7' },
    ...INSIGHTS.map(a => ({ path: `/insights/${a.slug}/`, lastmod: a.modified, priority: '0.6' })),
    { path: '/community.html', lastmod: SITE.updated, priority: '0.5' },
];

const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** reviews: [{slug, reviewDate, updatedAt}] — 게시된 후기 */
export function buildSitemapXml(reviews = []) {
    const urls = [
        ...STATIC_PAGES,
        ...reviews.filter(r => r.slug).map(r => ({
            path: `/reviews/${encodeURIComponent(r.slug)}`,
            lastmod: String(r.updatedAt || r.reviewDate || SITE.updated).slice(0, 10),
            priority: '0.6',
        })),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${xmlEsc(abs(u.path))}</loc><lastmod>${xmlEsc(u.lastmod)}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`;
}

export function buildLlmsTxt() {
    const s = historyStats();
    const faq = buildFaq();
    return `# ${SITE.name} (${SITE.nameEn})

> ${SITE.oneLiner}

${SITE.channelIntro}

- 공식 홈페이지: ${SITE.origin}/
${SITE.channels.map(c => `- ${c.label}: ${c.url}`).join('\n')}
- 강의 문의: ${SITE.origin}/education-inquiry (이메일 ${SITE.email})
- 슬로건: ${SITE.slogan}
- 철학: ${SITE.growthSlogan} (${SITE.philosophy})
- 전문 분야: ${SITE.specialty}
- 핵심 고객: 대학 교수님 및 대학 교육기관(교수학습센터·교육혁신원·학과·연구소)
- 활동명: 필로소피 AI 교육 (운영자의 실명·학력은 이 사이트에 공개하지 않습니다)
- 최종 갱신: ${SITE.updated}

## 교육 대상
${SITE.audiences.map(a => `- ${a}`).join('\n')}

## 전문 분야
${SITE.expertise.map(e => `- ${e.title}: ${e.desc}`).join('\n')}

## 강의 이력 (공개 기록 기준 ${s.orgs}개 기관, ${s.sessions}회 강의, ${s.since}~; 대학 교수님만을 대상으로 한 단독 강의는 아직 기록에 없음)
${HISTORY.map(h => `- ${h.date} ${h.title} — ${h.subject}${h.audience ? ` (대상: ${h.audience})` : ''}`).join('\n')}

## 교육 프로그램
${PROGRAM_DETAILS.map(p => `- ${p.letter}. ${p.title} [${STATUS_LABEL[p.status]}]: ${p.purpose} 주요 내용: ${p.contents.join(', ')}. 실습 결과물: ${p.artifacts.join(' / ')}`).join('\n')}

## 자주 받는 질문
${faq.map(f => `### ${f.q}\n${f.a}`).join('\n\n')}

## 주요 페이지
- [AI 강사 소개](${SITE.origin}/ai-instructor): 전문 분야, 강의 이력, 차별점, FAQ
- [교육 프로그램](${SITE.origin}/programs): 프로그램별 대상·내용·결과물·관련 이력
- [교육 사례](${SITE.origin}/case-studies): 기관별 강의 사례와 현장 사진
- [수강 후기](${SITE.origin}/reviews): 공개 동의를 받은 후기 원문
- [AI 교육 칼럼](${SITE.origin}/insights/): 교육자의 질문에 답하는 글
${INSIGHTS.map(a => `  - [${a.title}](${SITE.origin}/insights/${a.slug}/)`).join('\n')}
- [교육 문의](${SITE.origin}/education-inquiry)
`;
}
