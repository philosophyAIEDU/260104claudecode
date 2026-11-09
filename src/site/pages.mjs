// 정적 페이지 빌더 — scripts/build-pages.mjs 가 HTML 파일로 저장합니다.
import { SITE, HISTORY, PROGRAM_DETAILS, STATUS_LABEL, STATUS_NOTE, CASE_DETAILS, historyStats, buildFaq } from './data.mjs';
import { INSIGHTS, INSIGHT_CATEGORIES, PLANNED_INSIGHTS } from './insights.mjs';
import { summarizeReviews, pickQuote, orderForDisplay, caseIdFor, caseById, CURATED_QUOTES } from './review-insights.mjs';
import { page, esc, abs, breadcrumbLd, crumbs, inquiryCta } from './layout.mjs';
import { CATEGORIES, PROGRAMS, programLabel, toPublicReview, renderReviewDetail, renderReviewCard, hasContent, PROGRAM_PAGE_KEYS } from '../../assets/js/review-core.mjs';

const fmt = (d) => d.replace(/-/g, '.');
const byId = (id) => HISTORY.find(h => h.id === id);
const historyFor = (key) => HISTORY.filter(h => h.programs.includes(key));
const inquiryHref = (topic) => `/education-inquiry?topic=${encodeURIComponent(topic)}#inquiry`;

function faqHtml(faq) {
    return `<div class="faq">${faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`;
}
const faqLd = (faq) => ({
    '@type': 'FAQPage',
    mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

// ───────── 후기 근거 블록 (후기 원문 인용 + 원문에서 센 수치) ─────────
const authorOf = (r) => (r.anonymous || !String(r.authorDisplay || '').trim()) ? '익명 수강생' : String(r.authorDisplay).trim();
function quoteCards(list, limit = 6) {
    // 대표 후기 → 운영자가 고른 문장 순서(추천 관련 문장 먼저) → 최신순, 같은 작성자는 한 번만
    const rank = (q) => { const i = CURATED_QUOTES.indexOf(q); return i < 0 ? 999 : i; };
    const seen = new Set();
    const picked = orderForDisplay(list).map((r, i) => ({ r, q: pickQuote(r), i }))
        .filter(x => x.q)
        .sort((a, b) => (b.r.featured === true) - (a.r.featured === true) || rank(a.q) - rank(b.q) || a.i - b.i)
        .filter(x => { const k = authorOf(x.r); if (seen.has(k)) return false; seen.add(k); return true; })
        .slice(0, limit);
    if (!picked.length) return '';
    return `<div class="quote-grid">${picked.map(({ r, q }) => `<figure class="quote-card">
  <blockquote cite="/reviews/${esc(r.slug)}"><p>“${esc(q)}”</p></blockquote>
  <figcaption><a href="/reviews/${esc(r.slug)}">${esc(authorOf(r))}</a>${r.institution ? ` · <span>${esc(r.institution)}</span>` : ''}</figcaption>
</figure>`).join('')}</div>`;
}
function reviewStatsHtml(rs) {
    if (!rs || !rs.total) return '';
    const m = (k) => rs.mentions.find(x => x.key === k).count;
    return `<ul class="review-stats" aria-label="후기 요약 수치">
  <li><b>${rs.total}건</b><span>공개된 수강 후기 (${rs.authors}명)</span></li>
  <li><b>${m('nocode')}건</b><span>코딩·개발 경험이 없었다고 언급</span></li>
  <li><b>${m('deploy')}건</b><span>배포까지 했다고 언급</span></li>
  <li><b>${m('care')}건</b><span>한 명씩 챙겨 줬다고 언급</span></li>
  <li><b>${m('confidence')}건</b><span>자신감·“할 수 있다”를 언급</span></li>
</ul>
<p class="stat-note">작성자 동의를 받아 공개한 후기 원문에서 해당 표현이 나온 후기 수를 셌습니다 (${esc(rs.from.replace(/-/g, '.'))}~${esc(rs.to.replace(/-/g, '.'))} 작성).</p>`;
}
export function reviewEvidenceSection(list, { id = 'review-evidence', title = '수강생 후기로 확인하는 수업', label = 'section', limit = 6 } = {}) {
    const rs = summarizeReviews(list);
    if (!rs.total) return '';
    return `<section class="section" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Reviews</p><h2 id="${id}-h">${esc(title)}</h2>
      <p>수강생들이 네이버 카페에 남긴 후기 가운데 공개 동의를 받은 글입니다. 아래 문장은 후기 원문을 그대로 옮겼습니다.</p></div>
    ${reviewStatsHtml(rs)}
    ${quoteCards(list, limit)}
    <p class="section-more"><a href="/reviews" data-track="reviews_click" data-track-label="${esc(label)}">후기 ${rs.total}건 원문 모두 보기 →</a></p>
  </div>
</section>`;
}

function statsHtml() {
    const s = historyStats();
    return `<div class="stat-row">
  <div class="stat"><b>${s.sessions}회</b><span>진행한 강의 (공개 기록)</span></div>
  <div class="stat"><b>${s.orgs}곳</b><span>강의한 기관·단체</span></div>
  <div class="stat"><b>${s.since}~</b><span>교육 활동 기간</span></div>
  <div class="stat"><b>40여 개</b><span>직접 만들어 공개한 AI 학습 도구</span></div>
</div>
<p class="stat-note">수치는 이 사이트에 사진과 함께 공개된 기록에서 계산했습니다. 같은 날 두 주제를 강의한 경희대학교 대학원 특강은 2회로 셉니다.</p>`;
}

function historyListHtml(items, { link = true } = {}) {
    return `<ol class="history-list">${items.map(h => `
  <li class="history-item">
    <time datetime="${h.date}">${fmt(h.date)}</time>
    <div>
      <h3>${link ? `<a href="/case-studies#${h.id}">${esc(h.title)}</a>` : esc(h.title)}<span class="kind">${esc(h.kind)}</span></h3>
      <p><b>${esc(h.subject)}</b>${h.audience ? ` · 대상: ${esc(h.audience)}` : ''}</p>
    </div>
  </li>`).join('')}
</ol>`;
}

// ───────────── /ai-instructor ─────────────
export function aiInstructorPage(reviews = []) {
    const s = historyStats();
    const rs = summarizeReviews(reviews);
    const faq = buildFaq(rs);
    const path = '/ai-instructor';
    const crumb = [{ name: '홈', path: '/' }, { name: 'AI 교육 강사 소개', path }];
    const uni = HISTORY.filter(h => ['경상국립대학교', '동신대학교', '경희대학교', '서울대학교'].includes(h.org));
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">AI Education Instructor</p>
      <h1>대학 교수님을 위한 AI 교육 강사,<br>필로소피 AI 교육</h1>
      <div class="answer-box"><p>${esc(SITE.oneLiner)}</p></div>
      <ul class="chips" aria-label="전문 분야">
        <li>교수님 AI 실습</li><li>대학 교수법 혁신</li><li>연구·업무 자동화</li><li>AI 수업 앱 제작</li>
      </ul>
      <div class="btn-row">
        <a class="btn btn-cta" href="${SITE.inquiryUrl}" data-track="cta_inquiry_click" data-track-label="instructor_top">대학 AI 연수 문의</a>
        ${rs.total ? `<a class="btn btn-ghost" href="#instructor-reviews">수강 후기 먼저 보기 ↓</a>` : ''}<a class="btn btn-ghost" href="#history">강의 이력 보기</a>
      </div>
    </div>
    <aside class="profile-card" aria-label="강사 프로필">
      <img src="/assets/mascot.jpg" alt="보라색 재킷을 입은 필로소피 AI 교육의 철학자 캐릭터 일러스트" width="168" height="168">
      <p class="img-note">얼굴을 공개하지 않는 대신 철학자 캐릭터로 소개합니다.</p>
      <h2 style="font-size:20px;margin:6px 0 2px">필로소피 AI 교육</h2>
      <p class="role">Philosophy AI Education</p>
      <dl>
        <div><dt>활동명</dt><dd>필로소피 AI 교육</dd></div>
        <div><dt>전문 분야</dt><dd>${esc(SITE.specialty)}</dd></div>
        <div><dt>교육 대상</dt><dd>${esc(SITE.audiences.join(' · '))}</dd></div>
        <div><dt>강의 문의</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
      </dl>
    </aside>
  </div>
</section>
${reviewEvidenceSection(reviews, { id: 'instructor-reviews', title: '수강생 후기로 먼저 확인하세요', label: 'instructor' })}

<section class="section section-alt" aria-labelledby="quick-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">For University Staff</p><h2 id="quick-h">대학 기관 담당자분께, 핵심만 먼저</h2></div>
    <div class="grid-3">
      <div class="card"><h3>어떤 분야를 가르치나요?</h3><p>${esc(SITE.specialty)}입니다. <a href="/programs">4대 대학 AI 교육 프로그램 보기</a></p></div>
      <div class="card"><h3>교육 철학은 무엇인가요?</h3><p>“${esc(SITE.growthSlogan)}” AI로 교수님의 능력을 키우고, 그 능력이 학생과 사회에 선한 영향력으로 이어지도록 돕습니다.</p></div>
      <div class="card"><h3>실제로 어떤 교육을 했나요?</h3><p>${s.since}부터 ${esc(s.orgList.join(', '))}에서 ${s.sessions}회 강의했습니다. <a href="/case-studies">교육 사례 보기</a></p></div>
      <div class="card"><h3>교육 대상과 방식은요?</h3><p>대학 교수님을 중심으로 대학 직원·연구자·교사까지, 직접 손으로 해 보는 실습 중심으로 진행합니다. 특강·워크숍·여러 회차 과정 등은 기관과 협의해 정합니다.</p></div>
      <div class="card"><h3>우리 대학에 맞출 수 있나요?</h3><p>문의 내용(대상, 인원, 목적, 일정)을 바탕으로 프로그램 A~D를 조합하거나 새로 구성해 제안드립니다.</p></div>
      <div class="card"><h3>교수님 대상 경험은 어느 정도인가요?</h3><p>교수님만을 대상으로 한 단독 강의는 아직 공개 기록에 없습니다. 대학 부설 연수원·대학 수업·대학원·연구실 강의 경험을 바탕으로 교수님용 과정을 구성했습니다.</p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="exp-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Expertise</p><h2 id="exp-h">전문 분야</h2></div>
    <div class="grid-3">${SITE.expertise.map(e => `<div class="card"><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p></div>`).join('')}</div>
  </div>
</section>

<section class="section section-alt" id="history" aria-labelledby="history-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Teaching History</p><h2 id="history-h">강의 이력</h2>
      <p>대학 연수원·대학 수업·대학원·연구실·교육청·고등학교·공공기관·온라인 그룹 코칭에서 진행한 강의입니다. 이 중 대학 현장의 강의는 ${uni.map(h => esc(h.org)).join(', ')}입니다. 각 항목을 누르면 사진과 교육 내용을 볼 수 있습니다.</p></div>
    ${historyListHtml(HISTORY)}
    ${statsHtml()}
  </div>
</section>

<section class="section" aria-labelledby="rec-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">When to Choose</p><h2 id="rec-h">이런 AI 교육을 찾는다면, 필로소피 AI 교육을 검토해 보세요</h2>
      <p>AI 교육 강사를 찾는 분이 비교하기 쉽도록, 실제로 진행한 교육과 근거를 짝지어 적었습니다.</p></div>
    <div class="rec-grid">
      <div class="card"><h3>교사·교수 등 교육자 대상 AI 연수</h3><p>AI 리터러시와 수업 활용 기준, 바이브 코딩 실습. <a href="/case-studies#gnu-2026-physics">경상국립대 교사 자격연수 — 교사 21명 학습 앱 배포</a>, <a href="/case-studies#jeonju-2026-literacy">전주교육청 직무연수</a>, <a href="/case-studies#toegyewon-2026-claude">퇴계원고 전문적학습공동체</a></p></div>
      <div class="card"><h3>대학생·대학원생 대상 바이브 코딩 수업</h3><p>각자 원하는 웹사이트·웹앱을 만들어 배포까지. <a href="/case-studies#dongshin-2026-vibe">동신대학교 학생 수업</a>, <a href="/case-studies#khu-2026-vibe">경희대학교 대학원 특강</a></p></div>
      <div class="card"><h3>코딩을 모르는 성인 학습자 대상 실습</h3><p>Claude Code·GPT Codex로 GitHub·Netlify·Firebase까지 직접. <a href="/case-studies#permes-2026-reading">퍼스널메이커스 온라인 특강·그룹 코칭 3회</a>${rs.total ? ` — <a href="/reviews">수강 후기 ${rs.total}건</a>` : ''}</p></div>
      <div class="card"><h3>대학 교수님 대상 AI 교수법·업무 자동화</h3><p>교수님용 프로그램은 위 경험을 바탕으로 새로 구성했습니다 (교수 대상 단독 강의 기록은 아직 없음). <a href="/programs">프로그램 A~D 보기</a></p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="diff-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Difference</p><h2 id="diff-h">AI 도구 사용법을 알려주는 것을 넘어,<br>교수님이 직접 자신의 교육 도구를 만들 수 있도록 돕습니다.</h2></div>
    <div class="compare">
      <div><h3>도구 사용법 중심 교육</h3><ul><li>새로 나온 AI 도구의 기능을 소개합니다.</li><li>정해진 예시를 따라 해 봅니다.</li><li>도구가 바뀌면 다시 배워야 합니다.</li><li>결과물은 강의 시간에 만든 예제에 머뭅니다.</li></ul></div>
      <div><h3>필로소피 AI 교육의 실습</h3><ul><li>교수님의 실제 고민(강의·평가·연구·행정)에서 출발합니다.</li><li>AI에게 맡길 일과 교수님이 판단할 일을 구분하는 기준을 세웁니다.</li><li>내 수업에 맞는 웹 앱·업무 도구를 직접 만들어 배포합니다.</li><li>도구가 바뀌어도 쓸 수 있는 설계 방법이 남습니다.</li></ul></div>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="fit-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Honest Fit</p><h2 id="fit-h">이런 대학·교수님께 맞습니다</h2><p>섭외 전에 비교하실 수 있도록, 잘 맞는 경우와 다른 선택이 나은 경우를 함께 적었습니다.</p></div>
    <div class="fit">
      <div class="yes"><b>잘 맞는 경우</b>교수님들이 AI를 강의·연구·행정에 직접 적용해 보는 실습이 필요할 때 · 코딩 경험 없이 수업 도구를 만들어 보고 싶을 때 · 교수학습센터에서 실습형 AI 연수를 기획할 때</div>
      <div class="no"><b>다른 선택이 나을 수 있는 경우</b>대규모 강연 위주의 AI 트렌드 소개만 필요할 때 · 학내 전산 시스템 연동 개발이 목적일 때 · 교수님 대상 단독 강의 이력을 필수 조건으로 보실 때</div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="phil-h">
  <div class="wrap narrow">
    <p class="eyebrow">Philosophy</p>
    <h2 id="phil-h">교육 철학 — ${esc(SITE.growthSlogan)}</h2>
    <div class="answer-box"><p><b>“${esc(SITE.philosophy)}”</b></p></div>
    <p>필로소피 AI 교육은 “${esc(SITE.legacySlogan)}”라는 마음으로 시작했습니다. AI 시대에도 배움의 중심은 사람이기에, AI를 정답 기계가 아니라 교육자의 능력을 키우는 도구로 다루고, 그렇게 키운 능력을 다시 나눕니다. 필로소피 AI 봉사단은 정기 스터디를 열고, 리퍼 노트북을 정비해 보육원·학교 등 4개 기관에 전달했습니다. (<a href="/education-inquiry#volunteer">봉사단 활동 보기</a>)</p>
  </div>
</section>

<section class="section section-alt" aria-labelledby="faq-h">
  <div class="wrap narrow">
    <div class="section-head"><p class="eyebrow">FAQ</p><h2 id="faq-h">자주 받는 질문</h2></div>
    ${faqHtml(faq)}
  </div>
</section>

<section class="section" aria-labelledby="ch-h">
  <div class="wrap narrow">
    <h2 id="ch-h">공식 채널</h2>
    <p>${esc(SITE.channelIntro)}</p>
    <ul class="related">
      <li><a href="${SITE.origin}/">공식 홈페이지 · philosophyaiedu.com</a></li>
      ${SITE.channels.map(c => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.label)} ↗</a></li>`).join('')}
      <li><a href="/community.html">교육자 커뮤니티 게시판 · 바이브코딩 쇼케이스</a></li>
    </ul>
  </div>
</section>
${inquiryCta('instructor_bottom')}`;
    return page({
        title: 'AI 교육 전문 강사 소개 | 필로소피 AI 교육',
        description: `대학 교수님을 위한 생성형 AI 활용, AI 교수법, 연구·행정업무 자동화, AI 수업 앱 제작을 가르치는 필로소피 AI 교육의 강사 소개. ${s.orgs}개 기관·단체 ${s.sessions}회 강의 이력과 수강 후기, 교육 철학을 확인하세요.`,
        path, active: 'ai-instructor', image: '/assets/web/edu-2607-gnu-2.jpg', ogType: 'profile',
        jsonLd: [
            { '@type': 'ProfilePage', '@id': abs(path) + '#webpage', url: abs(path), name: 'AI 교육 전문 강사 소개 — 필로소피 AI 교육', inLanguage: 'ko', mainEntity: { '@id': abs('/#organization') }, dateModified: SITE.updated },
            breadcrumbLd(crumb), faqLd(faq),
        ],
        body,
    });
}

// ───────────── /programs ─────────────
export function programsPage(reviews = []) {
    const vibe = orderForDisplay(reviews.filter(r => (r.categories || []).includes('vibe-coding')));
    const path = '/programs';
    const crumb = [{ name: '홈', path: '/' }, { name: '대학 AI 교육 프로그램', path }];
    const blocks = PROGRAM_DETAILS.map(p => {
        const hist = historyFor(p.key);
        return `
<article class="program" id="${p.key}" aria-labelledby="${p.key}-h">
  <div class="program-head"><span class="program-letter" aria-hidden="true">${p.letter}</span><h2 id="${p.key}-h"><span class="sr-only">프로그램 ${p.letter}. </span>${esc(p.title)}</h2><span class="status status-${p.status}">${esc(STATUS_LABEL[p.status])}</span></div>
  <p class="program-purpose"><b>교육 목적</b> ${esc(p.purpose)}</p>
  <div class="program-grid">
    <div><h3>추천 교육 대상</h3><ul>${p.audience.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h3>해결하는 문제</h3><p>“${esc(p.problem)}”</p></div>
    <div><h3>주요 교육 내용</h3><ul>${p.contents.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h3>실습 결과물</h3><ul>${p.artifacts.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h3>준비사항</h3><ul>${p.prep.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h3>운영 방식 <small class="muted">(협의 가능 예시)</small></h3><p>${p.formats.map(esc).join(' · ')}</p><p class="small muted">교육 시간과 회차는 기관 일정에 맞춰 협의합니다. 정해진 표준 시간표·가격표는 없습니다.</p></div>
    <div><h3>관련 교육 사례</h3>${hist.length ? `<ul>${hist.map(h => `<li><a href="/case-studies#${h.id}">${fmt(h.date)} ${esc(h.title)}</a> — ${esc(h.subject)}${h.audience ? ` (${esc(h.audience)})` : ''}</li>`).join('')}</ul>` : '<p class="muted">아직 같은 주제의 진행 이력이 없습니다.</p>'}<p class="small muted">${esc(STATUS_NOTE[p.status])}</p></div>
    <div><h3>관련 수강 후기</h3>${p.key === 'vibe-coding' && vibe.length
        ? `<p class="small">같은 실습(Claude Code·Codex 바이브 코딩)을 들은 수강생 후기 ${vibe.length}건 중 일부입니다.</p>${quoteCards(vibe, 3)}<p class="small"><a href="/reviews?cat=vibe-coding">바이브 코딩 후기 ${vibe.length}건 모두 보기 →</a></p>`
        : `<div class="program-reviews" data-program="${p.key}"><p class="muted small">공개 동의를 받은 후기가 등록되면 이곳에 표시됩니다. <a href="/reviews">전체 후기 보기</a></p></div>`}</div>
  </div>
  <div class="fit"><div class="yes"><b>이런 분께 맞습니다</b>${esc(p.fit)}</div><div class="no"><b>참고해 주세요</b>${esc(p.notFit)}</div></div>
  <p class="program-cta"><a class="btn btn-cta" href="${inquiryHref(p.title)}" data-track="cta_inquiry_click" data-track-label="program_${p.key}">프로그램 ${p.letter} 문의하기</a></p>
</article>`;
    }).join('');
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">University AI Programs</p>
    <h1>대학 교수님을 위한<br>4대 AI 교육 프로그램</h1>
    <div class="answer-box"><p>필로소피 AI 교육은 <b>A. 생성형 AI 실무 입문</b>, <b>B. AI 시대의 교수법·평가 혁신</b>, <b>C. AI 수업 앱 만들기</b>, <b>D. 연구·행정업무 AI 자동화</b> 네 가지 프로그램을 제공합니다. 대학의 대상·인원·목적에 맞춰 조합하거나 새로 구성합니다.</p></div>
    <div class="program-compare" role="table" aria-label="프로그램 한눈에 비교">
      <div role="row" class="pc-head"><span role="columnheader">프로그램</span><span role="columnheader">이런 고민에</span><span role="columnheader">실습 결과물</span></div>
      ${PROGRAM_DETAILS.map(p => `<a role="row" href="#${p.key}"><span role="cell"><b>${p.letter}</b> ${esc(p.title)}</span><span role="cell">${esc(p.problem)}</span><span role="cell">${esc(p.artifacts[0].replace(/\s*\(.*\)$/, ''))}</span></a>`).join('')}
    </div>
    <p class="trust-note">각 프로그램에 <b>같은 주제 진행 이력 있음(다른 대상)</b> / <b>일부 주제 진행 이력 · 교수님용 새 구성</b> / <b>신규 제안 프로그램</b>을 구분해 표시했습니다. 교수님만을 대상으로 한 단독 강의 이력은 아직 공개 기록에 없으며, 교육 내용은 기관과 협의해 조정하는 제안 구성입니다.</p>
  </div>
</section>
<section class="section section-alt"><div class="wrap">${blocks}</div></section>
${inquiryCta('programs_bottom', { title: '어떤 프로그램이 맞을지 고민되시나요?', text: '대상과 목적만 알려 주셔도 A~D 중 알맞은 조합을 제안드립니다.' })}`;
    const courses = PROGRAM_DETAILS.map(p => ({
        '@type': 'Course', '@id': abs(path) + '#' + p.key, name: p.title, url: abs(path) + '#' + p.key,
        description: `${p.purpose} 주요 내용: ${p.contents.join(', ')}.`, inLanguage: 'ko',
        provider: { '@id': abs('/#organization') },
        teaches: p.contents,
        audience: { '@type': 'EducationalAudience', audienceType: p.audience.join(', ') },
    }));
    return page({
        title: '대학 교수 AI 연수 프로그램 | 필로소피 AI 교육',
        description: '대학 교수님을 위한 AI 연수 프로그램 4가지 — 생성형 AI 실무 입문, AI 시대의 교수법·평가 혁신, 교수님만의 AI 수업 앱 만들기, 대학 연구·행정업무 AI 자동화. 대상·내용·실습 결과물·준비사항과 관련 강의 사례를 안내합니다.',
        path, active: 'programs', jsonLd: [breadcrumbLd(crumb), ...courses], body,
        scripts: '<script type="module" src="/assets/js/program-reviews.mjs"></script>',
    });
}

// ───────────── /case-studies ─────────────
export function caseStudiesPage(reviews = []) {
    const byCase = {};
    for (const r of reviews) { const id = caseIdFor(r); if (id) (byCase[id] ||= []).push(r); }
    const path = '/case-studies';
    const crumb = [{ name: '홈', path: '/' }, { name: '교육 사례', path }];
    const pending = '<span class="pending">기록 보완 예정</span>';
    const cases = HISTORY.map(h => {
        const d = CASE_DETAILS[h.id] || {};
        return `
<article class="case" id="${h.id}" aria-labelledby="${h.id}-h">
  <h2 id="${h.id}-h">${esc(h.title)}</h2>
  <div class="case-meta"><time datetime="${h.date}">${fmt(h.date)}</time><span>${esc(h.kind)}</span><span>${esc(h.subject)}</span></div>
  <dl>
    <dt>1. 어떤 기관의 교육이었나요?</dt><dd>${esc(h.org)} — ${esc(h.title)}</dd>
    <dt>2. 누가 참여했나요?</dt><dd>${h.audience ? esc(h.audience) : pending}</dd>
    <dt>3. 어떤 목적의 교육이었나요?</dt><dd>${d.purpose ? esc(d.purpose) : pending}</dd>
    <dt>4. 무엇을 교육했나요?</dt><dd>${esc(h.desc)}</dd>
    <dt>5. 어떤 실습을 했나요?</dt><dd>${d.practice ? esc(d.practice) : pending}</dd>
    <dt>6. 참여자 반응</dt><dd>${d.reaction ? esc(d.reaction) + (d.reviewsLink ? ` <a href="/reviews?cat=${esc(d.reviewsLink)}">참여자 후기 보기 →</a>` : '') : `${pending} · 공개 동의를 받은 후기가 등록되면 <a href="/reviews">후기</a>에 연결됩니다.`}</dd>
    <dt>7. 확인된 교육 결과</dt><dd>${d.result ? esc(d.result) : '<span class="pending">아직 공개할 수 있는 결과 자료가 없습니다</span>'}</dd>
    <dt>8. 관련 프로그램·자료</dt><dd>${h.programs.map(k => PROGRAM_DETAILS.some(p => p.key === k) ? `<a href="/programs#${k}">${esc(programLabel(k))}</a>` : esc(programLabel(k))).join(', ')}${h.links.map(l => ` · <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</dd>
  </dl>
  ${(byCase[h.id] || []).length ? `<div class="case-reviews"><h3>참여자 후기 ${byCase[h.id].length}건 <small>원문 그대로 · 공개 동의 확인</small></h3>${quoteCards(byCase[h.id], 3)}<ul class="case-review-links">${orderForDisplay(byCase[h.id]).map(r => `<li><a href="/reviews/${esc(r.slug)}">${esc(r.title)}</a> — ${esc(authorOf(r))}</li>`).join('')}</ul></div>` : ''}
  ${h.photos.length ? `<div class="photos">${h.photos.map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async" width="400" height="300"><figcaption>${esc(p.cap)} (실제 강의 현장 사진)</figcaption></figure>`).join('')}</div>` : ''}
</article>`;
    }).join('');
    const s = historyStats();
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Case Studies</p>
    <h1>AI 교육 강의 사례와 기관 연수</h1>
    <div class="answer-box"><p>필로소피 AI 교육은 ${s.since}부터 ${esc(s.orgList.join(', '))} 등 ${s.orgs}개 기관·단체에서 ${s.sessions}회 강의했습니다. 모든 사례를 같은 형식(기관·대상·목적·내용·실습·반응·결과·자료)으로 정리하고, 관련된 <a href="/programs">대학 AI 교육 프로그램</a>과 연결했습니다.</p></div>
    <p class="trust-note">대학 현장의 강의는 경상국립대학교(부설 연수원 교사 자격연수), 경희대학교 대학원, 서울대학교 생산공학연구실입니다. 교수님만을 대상으로 한 단독 강의는 아직 기록에 없습니다. 확인되지 않은 학습 성과는 적지 않으며, 기록이 없는 항목은 <b>기록 보완 예정</b>으로 표시합니다.</p>
  </div>
</section>
<section class="section section-alt"><div class="wrap">${cases}</div></section>
${inquiryCta('cases_bottom')}`;
    return page({
        title: 'AI 교육 강의 사례 및 기관 연수 | 필로소피 AI 교육',
        description: `${s.orgList.join('·')}에서 진행한 생성형 AI 활용·바이브 코딩 강의 사례. 기관, 대상, 교육 목적, 실습 내용과 현장 사진을 같은 형식으로 정리하고 관련 교육 프로그램과 연결했습니다.`,
        path, active: 'case-studies', jsonLd: [breadcrumbLd(crumb), {
            '@type': 'ItemList', name: '필로소피 AI 교육 강의 사례', itemListElement: HISTORY.map((h, i) => ({ '@type': 'ListItem', position: i + 1, name: `${fmt(h.date)} ${h.title} — ${h.subject}`, url: abs(path) + '#' + h.id })),
        }], body,
    });
}

// ───────────── /insights ─────────────
export function insightsIndexPage() {
    const path = '/insights/';
    const crumb = [{ name: '홈', path: '/' }, { name: 'AI 교육 칼럼', path }];
    const groups = INSIGHT_CATEGORIES.map(c => {
        const posts = INSIGHTS.filter(a => a.category === c.key);
        const planned = PLANNED_INSIGHTS.filter(p => p.category === c.key);
        if (!posts.length && !planned.length) return '';
        return `<section class="insight-group" aria-labelledby="cat-${c.key}">
  <h2 id="cat-${c.key}">${esc(c.label)}</h2>
  ${posts.length ? `<ul class="insight-list">${posts.map(a => `<li><a href="/insights/${a.slug}/"><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><p class="muted small">작성 필로소피 AI 교육 · <time datetime="${a.modified}">${fmt(a.modified)}</time> 수정</p></a></li>`).join('')}</ul>` : ''}
  ${planned.length ? `<ul class="planned-list" aria-label="작성 예정 글">${planned.map(p => `<li><span class="planned-badge">작성 예정</span> ${esc(p.title)}</li>`).join('')}</ul>` : ''}
  ${c.program ? `<p class="small"><a href="/programs#${c.program}">관련 프로그램: ${esc(programLabel(c.program))} →</a></p>` : ''}
</section>`;
    }).join('');
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Insights</p>
    <h1>교수님의 질문에 답하는 AI 교육 칼럼</h1>
    <div class="answer-box"><p>대학 교수님과 교육자분들이 실제로 묻는 질문을 제목으로 삼고, 첫 문단에서 바로 답합니다. 강의 현장에서 다룬 내용과 주의할 점을 함께 정리하며, 일반적인 설명과 실제 강의 경험을 구분해 적습니다.</p></div>
    <p class="small">실습 영상은 <a href="${esc(SITE.channels[0].url)}" target="_blank" rel="noopener">유튜브 필로소피 AI 교육 채널 ↗</a>에서, 함께 공부하는 이야기는 <a href="${esc(SITE.channels[1].url)}" target="_blank" rel="noopener">네이버 카페 ↗</a>에서 볼 수 있습니다.</p>
  </div>
</section>
<section class="section section-alt"><div class="wrap narrow">
  ${groups}
  <p class="trust-note">‘작성 예정’ 표시는 아직 발행하지 않은 주제입니다. 글이 완성되면 이 목록에서 바로 읽을 수 있습니다.</p>
</div></section>
${inquiryCta('insights_index')}`;
    return page({
        title: 'AI 교육 칼럼 — 교수님의 AI 활용 질문에 답합니다 | 필로소피 AI 교육',
        description: '생성형 AI 활용, AI 시대의 교수법과 평가, 연구·행정업무 자동화, Claude Code 수업 앱 제작까지 — 대학 교수님과 교육자의 실제 질문에 첫 문단에서 바로 답하는 필로소피 AI 교육 칼럼.',
        path, active: 'insights', jsonLd: [breadcrumbLd(crumb), { '@type': 'Blog', name: '필로소피 AI 교육 칼럼', url: abs(path), inLanguage: 'ko', publisher: { '@id': abs('/#organization') },
            blogPost: INSIGHTS.map(a => ({ '@type': 'BlogPosting', headline: a.title, url: abs(`/insights/${a.slug}/`), datePublished: a.published, dateModified: a.modified })) }], body,
    });
}

export function insightPage(a) {
    const path = `/insights/${a.slug}/`;
    const crumb = [{ name: '홈', path: '/' }, { name: 'AI 교육 칼럼', path: '/insights/' }, { name: a.title, path }];
    const cases = a.cases.map(byId).filter(Boolean);
    const others = INSIGHTS.filter(x => x.slug !== a.slug);
    const body = `
${crumbs(crumb)}
<article class="article"><div class="wrap narrow">
  <p class="eyebrow">AI 교육 칼럼 · ${esc((INSIGHT_CATEGORIES.find(c => c.key === a.category) || {}).label || '')}</p>
  <h1>${esc(a.title)}</h1>
  <p class="article-meta"><span>작성자: <a href="/ai-instructor">필로소피 AI 교육</a></span><span>작성일 <time datetime="${a.published}">${fmt(a.published)}</time></span><span>수정일 <time datetime="${a.modified}">${fmt(a.modified)}</time></span></p>
  <div class="answer-box"><p>${esc(a.answer)}</p></div>
  ${a.sections.map(s => `<h2>${esc(s.h)}</h2><p class="one-line">${esc(s.one)}</p>${s.body}`).join('\n')}
  <h2>교육 현장에서는 어떻게 다뤘나요?</h2>
  <p class="one-line">필로소피 AI 교육이 실제로 진행한 강의 가운데 이 주제와 관련된 기록입니다.</p>
  <ul>${a.experience.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
  <div class="photos">${cases.filter(h => h.photos.length).slice(0, 2).map(h => h.photos[0]).map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" width="400" height="300"><figcaption>${esc(p.cap)} (실제 강의 현장)</figcaption></figure>`).join('')}</div>
  <h2>주의할 점과 한계는 무엇인가요?</h2>
  <div class="callout"><ul>${a.cautions.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
  <h2>관련 교육 프로그램</h2>
  <ul class="related">${a.programs.map(k => `<li><a href="/programs#${k}">${esc(programLabel(k))} →</a></li>`).join('')}</ul>
  <h2>관련 강의 사례 · 후기 · 영상</h2>
  <ul class="related">
    ${cases.map(h => `<li><a href="/case-studies#${h.id}">${fmt(h.date)} ${esc(h.title)} — ${esc(h.subject)}</a></li>`).join('')}
    <li><a href="/reviews">수강자 후기 보기</a></li>
    <li><a href="${esc(SITE.channels[0].url)}" target="_blank" rel="noopener">유튜브 · 필로소피 AI 교육 실습 영상 ↗</a></li>
  </ul>
  <h2>같은 주제의 다른 글</h2>
  <ul class="related">${others.map(o => `<li><a href="/insights/${o.slug}/">${esc(o.title)}</a></li>`).join('')}</ul>
</div></article>
${inquiryCta('insight_' + a.slug)}`;
    return page({
        title: `${a.title} | 필로소피 AI 교육`,
        description: a.description, path, active: 'insights', ogType: 'article',
        image: (cases.find(h => h.photos.length) || { photos: [{}] }).photos[0].src,
        jsonLd: [breadcrumbLd(crumb), {
            '@type': 'BlogPosting', '@id': abs(path) + '#article', headline: a.title, description: a.description,
            articleSection: (INSIGHT_CATEGORIES.find(c => c.key === a.category) || {}).label,
            inLanguage: 'ko', datePublished: a.published, dateModified: a.modified, mainEntityOfPage: abs(path),
            author: { '@id': abs('/#organization') }, publisher: { '@id': abs('/#organization') },
            image: abs((cases.find(h => h.photos.length) || { photos: [{ src: SITE.logo }] }).photos[0].src),
            about: a.programs.map(k => programLabel(k)),
        }],
        body,
    });
}

// ───────────── /reviews (목록) — SSR 함수와 정적 대체 페이지 공용 ─────────────
export function reviewsListPage({ cardsHtml = '', count = 0, cat = '', ssr = false, reviews = [] } = {}) {
    const rs = summarizeReviews(reviews);
    const summary = rs.total ? `<div class="review-summary">
    <h2 class="rs-h">후기 ${rs.total}건 한눈에 보기</h2>
    ${reviewStatsHtml(rs)}
    <h3 class="rs-sub">어떤 수업의 후기인가요?</h3>
    <ul class="rs-lectures">${rs.lectures.filter(l => l.case).map(l => `<li><a href="/case-studies#${l.id}">${esc(l.case.title)}</a> <span>${fmt(l.case.date)} · ${esc(l.case.kind)}</span> <b>${l.count}건</b></li>`).join('')}</ul>
    <h3 class="rs-sub">이런 상황에서, 이렇게 달라졌어요 <small>운영자가 각 후기 원문을 바탕으로 정리</small></h3>
    <ul class="rs-stories">${orderForDisplay(rs.stories).slice(0, 6).map(r => `<li><span class="rs-before">${esc(r.concernBefore)}</span> <span class="rs-arrow" aria-hidden="true">→</span> <span class="rs-after">${esc(r.changeAfter)}</span> <a href="/reviews/${esc(r.slug)}">${esc(authorOf(r))}님 후기</a></li>`).join('')}</ul>
  </div>` : '';
    const path = '/reviews';
    const crumb = [{ name: '홈', path: '/' }, { name: '교육 후기', path }];
    const filters = [{ key: '', label: '전체' }, ...CATEGORIES].map(c =>
        `<li><a href="/reviews${c.key ? '?cat=' + c.key : ''}" data-cat="${c.key}"${c.key === cat ? ' aria-current="true"' : ''}>${esc(c.label)}</a></li>`).join('');
    const empty = `<div class="rv-empty" id="rvEmpty"${count ? ' hidden' : ''}><p><b>${cat ? '이 분류의 후기가 아직 없습니다.' : '공개된 후기를 준비하고 있습니다.'}</b></p><p class="small">네이버 카페에 남겨 주신 후기 가운데 작성자의 공개 동의를 받은 글만 원문 그대로 옮겨 게시합니다.</p></div>`;
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Reviews</p>
    <h1>필로소피 AI 교육 수강 후기</h1>
    <div class="answer-box"><p>강의·연수·온라인 그룹 코칭에 참여하신 선생님, 대학 구성원, 1인 사업가와 크리에이터분들이 네이버 카페에 남겨 주신 후기입니다. 코딩 경험이 없던 분들이 Claude Code·GPT Codex로 웹앱을 만들고 배포한 경험을 직접 쓴 글입니다. 작성자의 공개 동의를 확인한 글만 게시하며, <b>후기 원문</b>과 <b>운영자 요약</b>을 구분해 보여 드립니다.</p></div>
  </div>
</section>
<section class="section section-alt" aria-labelledby="rv-list-h">
  <div class="wrap">
    <h2 id="rv-list-h" class="sr-only" style="position:absolute;left:-9999px">후기 목록</h2>
    ${summary}
    <ul class="rv-filter" aria-label="후기 분류">${filters}</ul>
    <div class="rv-grid" id="rvGrid">${cardsHtml}</div>
    ${empty}
    <p class="trust-note" style="margin-top:28px">후기는 작성자가 쓴 문장을 바꾸지 않고 옮깁니다. ‘교육 전 고민·인상 깊었던 실습·교육 후 변화’는 운영자가 원문을 바탕으로 정리한 내용이며, 원문에 없는 항목은 표시하지 않습니다. 작성자 이름·소속은 공개 동의 범위 안에서만 표시합니다.</p>
  </div>
</section>
${inquiryCta('reviews_list')}`;
    return page({
        title: cat ? `${CATEGORIES.find(c => c.key === cat)?.label || ''} 후기 | 필로소피 AI 교육 수강 후기` : '수강 후기 — 교사·교수 AI 연수 후기 | 필로소피 AI 교육',
        description: '필로소피 AI 교육의 AI 리터러시·바이브 코딩·교사 연수 수강 후기. 공개 동의를 받은 후기 원문과 교육 전 고민, 인상 깊었던 실습, 교육 후 변화를 확인하세요.',
        path, active: 'reviews',
        jsonLd: [breadcrumbLd(crumb), ...(rs.total ? [{
            '@type': 'CollectionPage', '@id': abs(path) + '#webpage', url: abs(path), name: '필로소피 AI 교육 수강 후기', inLanguage: 'ko',
            about: { '@id': abs('/#organization') },
            mainEntity: { '@type': 'ItemList', numberOfItems: rs.total, itemListElement: orderForDisplay(rs.reviews).map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: abs('/reviews/' + r.slug), name: r.title })) },
        }] : [])], body,
        scripts: ssr ? '<script src="/assets/js/reviews-filter.js" defer></script>' : '<script type="module" src="/assets/js/reviews-fallback.mjs"></script>',
    });
}

export function reviewDetailPage(review, related = []) {
    const r = toPublicReview(review);
    const path = `/reviews/${r.slug}`;
    const crumb = [{ name: '홈', path: '/' }, { name: '교육 후기', path: '/reviews' }, { name: r.title, path }];
    const others = related.filter(x => x.slug !== r.slug).slice(0, 3);
    const relCase = caseById(caseIdFor(r));
    const descSrc = [r.concernBefore, r.changeAfter].filter(hasContent).join(' → ') || r.originalText;
    const body = `
${crumbs(crumb)}
<div class="section"><div class="wrap narrow">
${renderReviewDetail(r)}
${relCase ? `<p class="trust-note">이 후기의 수업: <a href="/case-studies#${esc(relCase.id)}">${esc(relCase.title)}</a> (${fmt(relCase.date)} · ${esc(relCase.kind)}) — 수업 목적과 실습 내용을 교육 사례에서 볼 수 있습니다.</p>` : ''}
<p class="trust-note">이 후기는 작성자의 공개 동의를 받아 게시했습니다. 원문은 작성자가 쓴 그대로이며, 정리 항목과 운영자 요약은 운영자가 원문을 바탕으로 작성했습니다.</p>
${others.length ? `<h2 style="margin-top:36px">다른 후기</h2><div class="rv-grid">${others.map(o => renderReviewCard(o)).join('')}</div>` : ''}
<div class="btn-row"><a class="btn btn-ghost" href="/reviews">← 후기 목록</a>${PROGRAM_PAGE_KEYS.includes(r.program) ? `<a class="btn btn-ghost" href="/programs#${esc(r.program)}">${esc(programLabel(r.program))} 프로그램 보기</a>` : `<a class="btn btn-ghost" href="/case-studies">교육 사례 보기</a>`}</div>
</div></div>
${inquiryCta('review_detail')}`;
    return page({
        title: `${r.title} — 수강 후기 | 필로소피 AI 교육`,
        description: descSrc.replace(/\s+/g, ' ').slice(0, 150),
        path, active: 'reviews', ogType: 'article',
        image: r.images[0] ? r.images[0].url : undefined,
        jsonLd: [breadcrumbLd(crumb), {
            '@type': 'WebPage', '@id': abs(path) + '#webpage', url: abs(path), name: r.title, inLanguage: 'ko',
            ...(r.reviewDate ? { datePublished: r.reviewDate } : {}),
            isPartOf: { '@type': 'WebSite', url: abs('/') }, about: { '@id': abs('/#organization') },
        }],
        body,
    });
}

export const PROGRAM_KEYS = PROGRAMS.map(p => p.key);

export function notFoundPage() {
    return page({
        title: '페이지를 찾을 수 없습니다 | 필로소피 AI 교육', description: '요청하신 페이지를 찾을 수 없습니다.',
        path: '/404.html', robots: 'noindex',
        body: `<section class="section"><div class="wrap narrow"><h1>페이지를 찾을 수 없습니다</h1><p>주소가 바뀌었거나 삭제된 페이지입니다.</p><div class="btn-row"><a class="btn btn-primary" href="/">홈으로</a><a class="btn btn-ghost" href="/ai-instructor">강사 소개</a><a class="btn btn-ghost" href="/education-inquiry">교육 문의</a></div></div></section>`,
    });
}

// ───────── 메인 페이지(index.html)에 넣는 정적 후기 근거 ─────────
// 후기에서 반복되는 이야기 3가지 — 수치는 원문에서 센 값, 인용은 원문 문장 그대로(없으면 생략)
const THEMES = [
    { key: 'nocode', title: '코딩을 몰라도, 수업 안에서 완성합니다', quotes: ['코딩 1도 모르는데, 1시간 반 만에 내 웹사이트가 세상에 나왔습니다.', '아니 저같은 초초초초보가 3시간 만에 챌린지 인증 웹을 만든다니요?'] },
    { key: 'care', title: '막히는 한 사람까지 챙깁니다', quotes: ['누락되는 사람 없도록 하나하나 꼼꼼하게 불러주시고, 챙겨주십니다.', '끝까지 놓치지 않고 제 사이트를 완성할 수 있었습니다.'] },
    { key: 'confidence', title: '“나도 할 수 있다”가 남습니다', quotes: ["강의덕분에 '할 수 있겠다'는 생각으로 바뀌었습니다!", '이제 필요한 페이지는 제가 직접 만들어볼 수 있을 것 같습니다!'] },
];
function themeCards(rs) {
    const items = THEMES.map(t => {
        const count = rs.mentions.find(m => m.key === t.key).count;
        let hit = null;
        for (const q of t.quotes) { const r = rs.reviews.find(x => x.originalText.includes(q)); if (r) { hit = { q, r }; break; } }
        if (!count) return '';
        return `<li class="theme-card"><b class="theme-count">${count}건</b><h3>${esc(t.title)}</h3>${hit ? `<blockquote cite="/reviews/${esc(hit.r.slug)}"><p>“${esc(hit.q)}”</p><footer><a href="/reviews/${esc(hit.r.slug)}">${esc(authorOf(hit.r))}</a></footer></blockquote>` : ''}</li>`;
    }).join('');
    return items ? `<ul class="theme-grid" aria-label="후기에서 반복되는 이야기">${items}</ul>` : '';
}
export function reviewEvidenceHome(list) {
    const rs = summarizeReviews(list);
    if (!rs.total) return '';
    return `            <div class="section-head">
                <span class="eyebrow">Student Reviews</span>
                <h2 class="section-title" id="reviewsHomeTitle">수강생들이 직접 쓴 <em>수업 후기</em> ${rs.total}건</h2>
                <p class="section-sub">수업을 들은 ${rs.authors}명이 네이버 카페에 남긴 후기 가운데 공개 동의를 받은 글입니다. 따옴표 안 문장은 후기 원문 그대로이고, 숫자는 원문에 그 이야기가 나온 후기 수입니다.</p>
            </div>
            ${themeCards(rs)}
            <div class="home-reviews">
                <div class="trust-reviews-head"><h3>후기 원문에서 옮긴 문장</h3><a href="/reviews" data-track="reviews_click" data-track-label="home">후기 ${rs.total}건 전체 보기 →</a></div>
                ${quoteCards(list, 6)}
                ${reviewStatsHtml(rs)}
            </div>`;
}
export function reviewHeroLine(list) {
    const rs = summarizeReviews(list);
    if (!rs.total) return '';
    const m = (k) => rs.mentions.find(x => x.key === k).count;
    return `                        <div><dt>수강 후기</dt><dd>${rs.total}건 (${rs.authors}명) — 코딩 경험 없었음 ${m('nocode')}건 · 배포까지 ${m('deploy')}건 · 한 명씩 챙겨 줌 ${m('care')}건 · “할 수 있다” ${m('confidence')}건 <a href="#reviews-home" data-track="reviews_click" data-track-label="hero_fact">후기 보기</a></dd></div>`;
}
