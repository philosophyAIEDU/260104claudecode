// 정적 페이지 빌더 — scripts/build-pages.mjs 가 HTML 파일로 저장합니다.
import { SITE, HISTORY, PROGRAM_DETAILS, STATUS_LABEL, CASE_DETAILS, historyStats, buildFaq } from './data.mjs';
import { INSIGHTS } from './insights.mjs';
import { page, esc, abs, breadcrumbLd, crumbs, inquiryCta } from './layout.mjs';
import { CATEGORIES, PROGRAMS, programLabel, toPublicReview, renderReviewDetail, renderReviewCard, hasContent } from '../../assets/js/review-core.mjs';

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

function statsHtml() {
    const s = historyStats();
    return `<div class="stat-row">
  <div class="stat"><b>${s.sessions}회</b><span>진행한 강의 (공개 기록)</span></div>
  <div class="stat"><b>${s.orgs}곳</b><span>강의한 기관</span></div>
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
export function aiInstructorPage() {
    const s = historyStats();
    const faq = buildFaq();
    const path = '/ai-instructor';
    const crumb = [{ name: '홈', path: '/' }, { name: 'AI 강사 소개', path }];
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">AI Instructor for Educators</p>
      <h1>교육자를 위한 AI 강사,<br>필로소피 AI 교육</h1>
      <div class="answer-box"><p>${esc(SITE.oneLiner)}</p></div>
      <p class="lead">학교 교사와 대학 교수 등 교육자들이 생성형 AI를 실제 교육 현장에 적용할 수 있도록 실습 중심의 교육을 진행합니다. AI 리터러시부터 교육용 웹앱 제작, 업무 자동화까지 교육자의 문제를 해결하는 방법을 함께 연구하고 실습합니다.</p>
      <ul class="chips" aria-label="핵심 분야">
        <li>AI 리터러시</li><li>교수자 AI 교육</li><li>교사 AI 직무연수</li><li>바이브 코딩</li><li>교육 업무 자동화</li>
      </ul>
      <div class="btn-row">
        <a class="btn btn-primary" href="${SITE.inquiryUrl}" data-track="cta_inquiry_click" data-track-label="instructor_top">강의 및 연수 문의하기</a>
        <a class="btn btn-ghost" href="#history">강의 이력 보기</a>
      </div>
    </div>
    <aside class="profile-card" aria-label="강사 프로필">
      <img src="/assets/mascot.jpg" alt="필로소피 AI 교육의 철학자 캐릭터 일러스트" width="168" height="168">
      <p class="img-note">프로필 이미지는 필로소피 AI 교육의 캐릭터 일러스트입니다.</p>
      <h2 style="font-size:20px;margin:6px 0 2px">필로소피 AI 교육</h2>
      <p class="role">Philosophy AI Education</p>
      <dl>
        <div><dt>활동명</dt><dd>필로소피 AI 교육</dd></div>
        <div><dt>전문 분야</dt><dd>교육자 대상 생성형 AI 활용 및 바이브 코딩 실습 교육</dd></div>
        <div><dt>교육 대상</dt><dd>${esc(SITE.audiences.join(' · '))}</dd></div>
        <div><dt>강의 문의</dt><dd><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
      </dl>
    </aside>
  </div>
</section>

<section class="section section-alt" aria-labelledby="quick-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">At a Glance</p><h2 id="quick-h">강사를 찾는 담당자분께, 핵심만 먼저</h2></div>
    <div class="grid-3">
      <div class="card"><h3>어떤 교육을 하나요?</h3><p>생성형 AI 리터러시, 바이브 코딩(Claude Code·GPT Codex), 교육용 웹앱 제작, 교육행정 업무 자동화를 실습 중심으로 가르칩니다. <a href="/programs">교육 프로그램 보기</a></p></div>
      <div class="card"><h3>누구를 대상으로 하나요?</h3><p>${esc(SITE.audiences.join(', '))}을 대상으로 합니다.</p></div>
      <div class="card"><h3>실제 강의 경험이 있나요?</h3><p>${s.since}부터 ${esc(s.orgList.join(', '))}에서 ${s.sessions}회 강의했습니다. <a href="/case-studies">교육 사례 보기</a></p></div>
      <div class="card"><h3>어떤 결과물을 만드나요?</h3><p>수업용 웹앱, AI 활용 체크리스트, 업무 자동화 초안처럼 현장에서 바로 쓰는 결과물을 직접 만듭니다. 강사가 만든 도구는 <a href="/#tools">필로소피 AI 툴</a>에 공개되어 있습니다.</p></div>
      <div class="card"><h3>수강자 후기가 있나요?</h3><p>네이버 카페에 남겨 주신 후기 가운데 공개 동의를 받은 글을 원문 그대로 옮겨 게시합니다. <a href="/reviews">후기 보기</a></p></div>
      <div class="card"><h3>어떻게 문의하나요?</h3><p><a href="${SITE.inquiryUrl}">교육 문의 양식</a> 또는 <a href="mailto:${SITE.email}">${SITE.email}</a>로 기관·대상·인원·일정을 보내 주세요.</p></div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="exp-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Expertise</p><h2 id="exp-h">주요 전문 분야</h2></div>
    <div class="grid-3">${SITE.expertise.map(e => `<div class="card"><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p></div>`).join('')}</div>
  </div>
</section>

<section class="section section-alt" id="history" aria-labelledby="history-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Teaching History</p><h2 id="history-h">강의 이력</h2>
      <p>교육청·대학·대학원·고등학교·공공기관·연구실에서 진행한 강의입니다. 각 항목을 누르면 사진과 교육 내용을 볼 수 있습니다.</p></div>
    ${historyListHtml(HISTORY)}
    ${statsHtml()}
  </div>
</section>

<section class="section" aria-labelledby="diff-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Difference</p><h2 id="diff-h">AI 도구의 사용법을 알려주는 것을 넘어,<br>교육자가 직접 자신의 교육용 시스템을 만들 수 있도록 돕습니다.</h2></div>
    <div class="compare">
      <div><h3>도구 사용법 중심 교육</h3><ul><li>새로 나온 AI 도구의 기능을 소개합니다.</li><li>정해진 예시를 따라 해 봅니다.</li><li>도구가 바뀌면 다시 배워야 합니다.</li><li>결과물은 강의 시간에 만든 예제에 머뭅니다.</li></ul></div>
      <div><h3>필로소피 AI 교육의 실습</h3><ul><li>교육자의 실제 고민(수업·평가·행정)에서 출발합니다.</li><li>AI에게 맡길 일과 사람이 판단할 일을 구분하는 기준을 세웁니다.</li><li>내 수업에 맞는 웹앱·업무 도구를 직접 만들어 배포합니다.</li><li>도구가 바뀌어도 쓸 수 있는 설계 방법이 남습니다.</li></ul></div>
    </div>
  </div>
</section>

<section class="section section-alt" aria-labelledby="fit-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Honest Fit</p><h2 id="fit-h">이런 기관·교육자께 맞습니다</h2><p>섭외 전에 비교하실 수 있도록, 잘 맞는 경우와 다른 선택이 나은 경우를 함께 적었습니다.</p></div>
    <div class="fit">
      <div class="yes"><b>잘 맞는 경우</b>AI를 수업과 업무에 실제로 적용하는 실습이 필요할 때 · 코딩 경험 없이 교육용 도구를 만들어 보고 싶을 때 · 교사·교육실무사·대학원생 등 교육 현장 구성원 대상 연수</div>
      <div class="no"><b>다른 선택이 나을 수 있는 경우</b>대규모 강연 위주의 AI 트렌드 소개만 필요할 때 · 기관 전산 시스템 연동 개발이 목적일 때 · 대학 교수 대상 단독 진행 이력을 필수 조건으로 보실 때 (현재 대학원·연구실 특강 이력 보유)</div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="phil-h">
  <div class="wrap narrow">
    <p class="eyebrow">Philosophy</p>
    <h2 id="phil-h">교육 철학</h2>
    <div class="answer-box"><p><b>“${esc(SITE.philosophy)}”</b></p></div>
    <p>AI 시대에도 배움의 중심은 사람입니다. 필로소피 AI 교육은 AI를 정답 기계가 아니라 교육자의 능력을 키우는 도구로 다루고, 그렇게 키운 능력을 다시 나눕니다. 필로소피 AI 봉사단은 정기 스터디를 열고, 리퍼 노트북을 정비해 보육원·학교 등 4개 기관에 전달했습니다. (<a href="/education-inquiry#volunteer">봉사단 활동 보기</a>)</p>
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
    <p>필로소피 AI 교육은 모든 채널에서 같은 이름과 소개를 사용합니다.</p>
    <ul class="related">
      <li><a href="${SITE.origin}/">공식 홈페이지 · philosophyaiedu.com</a></li>
      ${SITE.channels.map(c => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.label)} ↗</a></li>`).join('')}
      <li><a href="/community.html">교육자 커뮤니티 게시판 · 바이브코딩 쇼케이스</a></li>
    </ul>
  </div>
</section>
${inquiryCta('instructor_bottom')}`;
    return page({
        title: 'AI 강사 소개 — 교사·교수 대상 AI 교육 | 필로소피 AI 교육',
        description: `교사와 대학 교수 등 교육자를 위한 AI 강사, 필로소피 AI 교육. ${s.orgList.slice(0, 4).join('·')} 등 ${s.orgs}개 기관 ${s.sessions}회 강의. AI 리터러시·바이브 코딩·업무 자동화 실습 교육.`,
        path, active: 'ai-instructor', image: '/assets/web/edu-2607-gnu-2.jpg', ogType: 'profile',
        jsonLd: [
            { '@type': 'ProfilePage', '@id': abs(path) + '#webpage', url: abs(path), name: 'AI 강사 소개 — 필로소피 AI 교육', inLanguage: 'ko', mainEntity: { '@id': abs('/#organization') }, dateModified: SITE.updated },
            breadcrumbLd(crumb), faqLd(faq),
        ],
        body,
    });
}

// ───────────── /programs ─────────────
export function programsPage() {
    const path = '/programs';
    const crumb = [{ name: '홈', path: '/' }, { name: '교육 프로그램', path }];
    const blocks = PROGRAM_DETAILS.map(p => {
        const hist = historyFor(p.key);
        return `
<article class="program" id="${p.key}" aria-labelledby="${p.key}-h">
  <div class="program-head"><h2 id="${p.key}-h">${esc(p.title)}</h2><span class="status status-${p.status}">${esc(STATUS_LABEL[p.status])}</span></div>
  <div class="program-grid">
    <div><h3>1. 적합한 교육 대상</h3><p>${esc(p.audience.join(', '))}</p></div>
    <div><h3>2. 교육 전의 고민</h3><p>“${esc(p.problem)}”</p></div>
    <div><h3>3. 강의 내용 (제안 구성)</h3><ul>${p.contents.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h3>4. 기대하는 학습 결과</h3><ul>${p.outcomes.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h3>5. 실습 결과물 예시</h3><ul>${p.artifacts.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
    <div><h3>6. 관련 강의 이력</h3>${hist.length ? `<ul>${hist.map(h => `<li><a href="/case-studies#${h.id}">${fmt(h.date)} ${esc(h.title)}</a> — ${esc(h.subject)}</li>`).join('')}</ul>` : '<p class="muted">아직 같은 주제의 진행 이력이 없습니다.</p>'}</div>
    <div><h3>7. 관련 수강 후기</h3><div class="program-reviews" data-program="${p.key}"><p class="muted small">공개 동의를 받은 후기가 등록되면 이곳에 표시됩니다. <a href="/reviews">전체 후기 보기</a></p></div></div>
    <div><h3>8. 강의 문의</h3><p><a class="btn btn-primary" href="${inquiryHref(p.title)}" data-track="cta_inquiry_click" data-track-label="program_${p.key}">이 프로그램 문의하기</a></p></div>
  </div>
  <div class="fit"><div class="yes"><b>이런 분께 맞습니다</b>${esc(p.fit)}</div><div class="no"><b>참고해 주세요</b>${esc(p.notFit)}</div></div>
</article>`;
    }).join('');
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Programs</p>
    <h1>교육자의 실제 고민에서 출발하는<br>AI 교육 프로그램</h1>
    <div class="answer-box"><p>필로소피 AI 교육은 <b>AI 리터러시</b>, <b>바이브 코딩</b>, <b>교육행정 업무 자동화</b>, <b>대학 교수자를 위한 AI 활용</b> 네 가지 프로그램을 운영합니다. 기관의 대상·시간·환경에 맞춰 조합하거나 새로 설계합니다.</p></div>
    <p class="trust-note">각 프로그램에는 <b>진행 이력 있음</b> / <b>일부 주제 진행 이력 · 확장 제안</b> / <b>신규 제안 프로그램</b>을 구분해 표시했습니다. 강의 내용은 기관 요청에 맞춰 조정하는 제안 구성입니다.</p>
    <div class="btn-row">${PROGRAM_DETAILS.map(p => `<a class="btn btn-ghost" href="#${p.key}">${esc(p.title)}</a>`).join('')}</div>
  </div>
</section>
<section class="section section-alt"><div class="wrap">${blocks}</div></section>
${inquiryCta('programs_bottom')}`;
    const courses = PROGRAM_DETAILS.map(p => ({
        '@type': 'Course', '@id': abs(path) + '#' + p.key, name: p.title, url: abs(path) + '#' + p.key,
        description: `${p.problem} — ${p.contents.join(', ')}`, inLanguage: 'ko',
        provider: { '@id': abs('/#organization') },
        teaches: p.contents,
        audience: { '@type': 'EducationalAudience', audienceType: p.audience.join(', ') },
    }));
    return page({
        title: '교육 프로그램 — AI 리터러시·바이브 코딩·업무 자동화 | 필로소피 AI 교육',
        description: '교사·교수·교육기관을 위한 AI 교육 프로그램: 교육자를 위한 AI 리터러시, 바이브 코딩(Claude Code·GPT Codex), 교육행정 업무 자동화, 대학 교수자를 위한 AI 활용. 대상·내용·결과물·강의 이력 안내.',
        path, active: 'programs', jsonLd: [breadcrumbLd(crumb), ...courses], body,
        scripts: '<script type="module" src="/assets/js/program-reviews.mjs"></script>',
    });
}

// ───────────── /case-studies ─────────────
export function caseStudiesPage() {
    const path = '/case-studies';
    const crumb = [{ name: '홈', path: '/' }, { name: '교육 사례', path }];
    const pending = '<span class="pending">기록 보완 예정</span>';
    const cases = HISTORY.map(h => {
        const d = CASE_DETAILS[h.id] || {};
        const progs = h.programs.map(k => programLabel(k)).filter(Boolean);
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
    <dt>6. 참여자 반응</dt><dd>${d.reaction ? esc(d.reaction) : `${pending} · 공개 동의를 받은 후기가 등록되면 <a href="/reviews">후기</a>에 연결됩니다.`}</dd>
    <dt>7. 확인된 교육 결과</dt><dd>${d.result ? esc(d.result) : '<span class="pending">아직 공개할 수 있는 결과 자료가 없습니다</span>'}</dd>
    <dt>8. 관련 프로그램·자료</dt><dd>${progs.map((l, i) => `<a href="/programs#${h.programs[i]}">${esc(l)}</a>`).join(', ')}${h.links.map(l => ` · <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</dd>
  </dl>
  <div class="photos">${h.photos.map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async" width="400" height="300"><figcaption>${esc(p.cap)} (실제 강의 현장 사진)</figcaption></figure>`).join('')}</div>
</article>`;
    }).join('');
    const s = historyStats();
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Case Studies</p>
    <h1>기관별 AI 교육 사례</h1>
    <div class="answer-box"><p>필로소피 AI 교육은 ${s.since}부터 ${esc(s.orgList.join(', '))} 등 ${s.orgs}개 기관에서 ${s.sessions}회 강의했습니다. 모든 사례를 같은 형식(기관·대상·목적·내용·실습·반응·결과·자료)으로 정리합니다.</p></div>
    <p class="trust-note">확인되지 않은 학습 성과는 적지 않습니다. 기록이 없는 항목은 <b>기록 보완 예정</b>으로 표시하고, 자료가 확보되면 업데이트합니다.</p>
  </div>
</section>
<section class="section section-alt"><div class="wrap">${cases}</div></section>
${inquiryCta('cases_bottom')}`;
    return page({
        title: '기관별 AI 교육 사례 — 교육청·대학·학교 강의 | 필로소피 AI 교육',
        description: `${s.orgList.join('·')}에서 진행한 AI 리터러시·바이브 코딩 교육 사례. 기관, 대상, 교육 목적, 실습 내용, 강의 사진을 같은 형식으로 정리했습니다.`,
        path, active: 'case-studies', jsonLd: [breadcrumbLd(crumb), {
            '@type': 'ItemList', name: '필로소피 AI 교육 강의 사례', itemListElement: HISTORY.map((h, i) => ({ '@type': 'ListItem', position: i + 1, name: `${fmt(h.date)} ${h.title} — ${h.subject}`, url: abs(path) + '#' + h.id })),
        }], body,
    });
}

// ───────────── /insights ─────────────
export function insightsIndexPage() {
    const path = '/insights/';
    const crumb = [{ name: '홈', path: '/' }, { name: 'AI 교육 칼럼', path }];
    const body = `
${crumbs(crumb)}
<section class="page-hero">
  <div class="wrap narrow">
    <p class="eyebrow">Insights</p>
    <h1>교육자의 질문에 답하는 AI 교육 칼럼</h1>
    <div class="answer-box"><p>교사·교수·교육기관 담당자분들이 실제로 묻는 질문을 제목으로 삼고, 첫 문단에서 바로 답합니다. 강의 현장에서 다룬 내용과 주의할 점을 함께 정리합니다.</p></div>
  </div>
</section>
<section class="section section-alt"><div class="wrap narrow">
  <ul class="insight-list">${INSIGHTS.map(a => `<li><a href="/insights/${a.slug}/"><h2>${esc(a.title)}</h2><p>${esc(a.description)}</p><p class="muted small">작성 필로소피 AI 교육 · <time datetime="${a.modified}">${fmt(a.modified)}</time> 수정</p></a></li>`).join('')}</ul>
</div></section>
${inquiryCta('insights_index')}`;
    return page({
        title: 'AI 교육 칼럼 — 교사·교수의 AI 활용 질문에 답합니다 | 필로소피 AI 교육',
        description: '교사가 코딩 없이 앱을 만들 수 있을까? AI 답변은 어떻게 검증할까? 교육자의 실제 질문에 첫 문단에서 바로 답하는 필로소피 AI 교육 칼럼.',
        path, active: 'insights', jsonLd: [breadcrumbLd(crumb), { '@type': 'Blog', name: '필로소피 AI 교육 칼럼', url: abs(path), inLanguage: 'ko', publisher: { '@id': abs('/#organization') } }], body,
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
  <p class="eyebrow">AI 교육 칼럼</p>
  <h1>${esc(a.title)}</h1>
  <p class="article-meta"><span>작성자: <a href="/ai-instructor">필로소피 AI 교육</a></span><span>작성일 <time datetime="${a.published}">${fmt(a.published)}</time></span><span>수정일 <time datetime="${a.modified}">${fmt(a.modified)}</time></span></p>
  <div class="answer-box"><p>${esc(a.answer)}</p></div>
  ${a.sections.map(s => `<h2>${esc(s.h)}</h2><p class="one-line">${esc(s.one)}</p>${s.body}`).join('\n')}
  <h2>교육 현장에서는 어떻게 다뤘나요?</h2>
  <p class="one-line">필로소피 AI 교육이 실제로 진행한 강의 가운데 이 주제와 관련된 기록입니다.</p>
  <ul>${a.experience.map(e => `<li>${esc(e)}</li>`).join('')}</ul>
  <div class="photos">${cases.slice(0, 2).map(h => h.photos[0]).map(p => `<figure><img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" width="400" height="300"><figcaption>${esc(p.cap)} (실제 강의 현장)</figcaption></figure>`).join('')}</div>
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
        image: cases[0] ? cases[0].photos[0].src : undefined,
        jsonLd: [breadcrumbLd(crumb), {
            '@type': 'Article', '@id': abs(path) + '#article', headline: a.title, description: a.description,
            inLanguage: 'ko', datePublished: a.published, dateModified: a.modified, mainEntityOfPage: abs(path),
            author: { '@id': abs('/#organization') }, publisher: { '@id': abs('/#organization') },
            image: cases[0] ? abs(cases[0].photos[0].src) : abs(SITE.logo),
            about: a.programs.map(k => programLabel(k)),
        }],
        body,
    });
}

// ───────────── /reviews (목록) — SSR 함수와 정적 대체 페이지 공용 ─────────────
export function reviewsListPage({ cardsHtml = '', count = 0, cat = '', ssr = false } = {}) {
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
    <div class="answer-box"><p>강의와 연수에 참여하신 선생님·교수님·교육 담당자분들이 네이버 카페 등에 남겨 주신 후기입니다. 작성자의 공개 동의를 확인한 글만 게시하며, <b>후기 원문</b>과 <b>운영자 요약</b>을 구분해 보여 드립니다.</p></div>
  </div>
</section>
<section class="section section-alt" aria-labelledby="rv-list-h">
  <div class="wrap">
    <h2 id="rv-list-h" class="sr-only" style="position:absolute;left:-9999px">후기 목록</h2>
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
        jsonLd: [breadcrumbLd(crumb)], body,
        scripts: ssr ? '<script src="/assets/js/reviews-filter.js" defer></script>' : '<script type="module" src="/assets/js/reviews-fallback.mjs"></script>',
    });
}

export function reviewDetailPage(review, related = []) {
    const r = toPublicReview(review);
    const path = `/reviews/${r.slug}`;
    const crumb = [{ name: '홈', path: '/' }, { name: '교육 후기', path: '/reviews' }, { name: r.title, path }];
    const others = related.filter(x => x.slug !== r.slug).slice(0, 3);
    const descSrc = [r.concernBefore, r.changeAfter].filter(hasContent).join(' → ') || r.originalText;
    const body = `
${crumbs(crumb)}
<div class="section"><div class="wrap narrow">
${renderReviewDetail(r)}
<p class="trust-note">이 후기는 작성자의 공개 동의를 받아 게시했습니다. 원문은 작성자가 쓴 그대로이며, 정리 항목과 운영자 요약은 운영자가 원문을 바탕으로 작성했습니다.</p>
${others.length ? `<h2 style="margin-top:36px">다른 후기</h2><div class="rv-grid">${others.map(o => renderReviewCard(o)).join('')}</div>` : ''}
<div class="btn-row"><a class="btn btn-ghost" href="/reviews">← 후기 목록</a>${r.program ? `<a class="btn btn-ghost" href="/programs#${esc(r.program)}">${esc(programLabel(r.program))} 프로그램 보기</a>` : ''}</div>
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
