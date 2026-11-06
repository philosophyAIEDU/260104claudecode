// 공용 레이아웃 — 정적 페이지 생성기(scripts/build-pages.mjs)와 후기 SSR 함수가 함께 사용
import { SITE } from './data.mjs';
import { escapeHtml as esc } from '../../assets/js/review-core.mjs';

export { esc };

export const NAV = [
    { href: '/ai-instructor', label: '강사 소개', key: 'ai-instructor' },
    { href: '/programs', label: '교육 프로그램', key: 'programs' },
    { href: '/case-studies', label: '교육 사례', key: 'case-studies' },
    { href: '/reviews', label: '후기', key: 'reviews' },
    { href: '/insights/', label: 'AI 교육 칼럼', key: 'insights' },
    { href: '/#tools', label: 'AI 툴', key: 'tools' },
    { href: '/community.html', label: '커뮤니티', key: 'community' },
];

export const abs = (path) => SITE.origin + path;

export function organizationLd() {
    return {
        '@type': 'Organization',
        '@id': abs('/#organization'),
        name: SITE.name,
        alternateName: SITE.nameEn,
        url: abs('/'),
        logo: abs(SITE.logo),
        image: abs(SITE.logo),
        description: SITE.oneLiner,
        slogan: SITE.slogan,
        email: SITE.email,
        areaServed: { '@type': 'Country', name: '대한민국' },
        knowsAbout: SITE.expertise.map(e => e.title),
        sameAs: SITE.channels.map(c => c.url),
    };
}

export function breadcrumbLd(items) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
    };
}

function ldScript(graph) {
    // </script> 주입 방지
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
    return `<script type="application/ld+json">${json}</script>`;
}

/**
 * @param {object} o
 *  title, description, path(canonical), active(nav key), body(html), jsonLd([...]), ogType, image, robots, extraHead, scripts
 */
export function page(o) {
    const canonical = abs(o.path);
    const image = abs(o.image || '/assets/web/edu-2607-gnu-2.jpg');
    const graph = [organizationLd(), ...(o.jsonLd || [])];
    return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(o.description)}">
<link rel="canonical" href="${esc(canonical)}">
${o.robots ? `<meta name="robots" content="${esc(o.robots)}">` : ''}
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:locale" content="ko_KR">
<meta property="og:type" content="${esc(o.ogType || 'website')}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(image)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%23faf7ef'/%3E%3Cpath d='M50 16 L57 43 L84 50 L57 57 L50 84 L43 57 L16 50 L43 43 Z' fill='%23315b4c'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/assets/review-cards.css">
<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${SITE.ga}');</script>
${ldScript(graph)}
${o.extraHead || ''}
</head>
<body>
<a class="skip-link" href="#main">본문 바로가기</a>
${header(o.active)}
<main id="main">
${o.body}
</main>
${footer()}
<script src="/assets/site.js" defer></script>
${o.scripts || ''}
</body>
</html>
`;
}

export function header(active) {
    return `<header class="site-header">
  <div class="wrap header-row">
    <a class="brand" href="/" aria-label="${esc(SITE.name)} 홈"><svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><ellipse cx="16" cy="16" rx="14" ry="9" transform="rotate(-35 16 16)" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="16" cy="16" r="4" fill="currentColor"/><circle cx="25" cy="7" r="2" fill="#b98a3a"/></svg><span>필로소피 AI 교육</span></a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="siteNav" aria-label="메뉴 열기"><span></span><span></span><span></span></button>
    <nav id="siteNav" class="site-nav" aria-label="주요 메뉴">
      <ul>
        ${NAV.map(n => `<li><a href="${n.href}"${n.key === active ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`).join('\n        ')}
        <li><a class="nav-cta" href="${SITE.inquiryUrl}" data-track="cta_inquiry_click" data-track-label="header">강의 문의</a></li>
      </ul>
    </nav>
  </div>
</header>`;
}

export function footer() {
    return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <p class="footer-brand">필로소피 AI 교육 <span>Philosophy AI Education</span></p>
      <p class="footer-one">${esc(SITE.oneLiner)}</p>
      <p class="footer-phil">“${esc(SITE.philosophy)}”</p>
    </div>
    <div>
      <h2 class="footer-h">둘러보기</h2>
      <ul class="footer-links">
        <li><a href="/">홈</a></li>
        ${NAV.map(n => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}
        <li><a href="/education-inquiry">교육 문의</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">공식 채널</h2>
      <ul class="footer-links">
        <li><a href="${SITE.origin}/">홈페이지 · philosophyaiedu.com</a></li>
        ${SITE.channels.map(c => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.label)}</a></li>`).join('')}
        <li><a href="mailto:${SITE.email}">이메일 · ${SITE.email}</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom"><span>&copy; 2026 Philosophy AI Education</span><span>${esc(SITE.slogan)}</span></div>
</footer>`;
}

/** 페이지 상·하단에 반복하는 섭외 CTA (같은 문의 기능으로만 연결) */
export function inquiryCta(label = 'section') {
    return `<section class="cta-band" aria-label="강의 문의">
  <div class="wrap cta-inner">
    <div>
      <p class="eyebrow">Lecture Inquiry</p>
      <h2>기관에 맞는 AI 교육을 함께 설계합니다</h2>
      <p>기관·대상·인원·희망 일정을 알려 주시면 교육 구성과 진행 방식을 제안드립니다.</p>
    </div>
    <div class="cta-actions">
      <a class="btn btn-primary" href="${SITE.inquiryUrl}" data-track="cta_inquiry_click" data-track-label="${esc(label)}">강의 및 연수 문의하기</a>
      <a class="btn btn-ghost" href="mailto:${SITE.email}" data-track="cta_email_click" data-track-label="${esc(label)}">${SITE.email}</a>
    </div>
  </div>
</section>`;
}

export function crumbs(items) {
    return `<nav class="crumbs wrap" aria-label="현재 위치"><ol>${items.map((it, i) =>
        i === items.length - 1 ? `<li aria-current="page">${esc(it.name)}</li>` : `<li><a href="${it.path}">${esc(it.name)}</a></li>`).join('')}</ol></nav>`;
}
