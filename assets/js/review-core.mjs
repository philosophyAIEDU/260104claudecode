// 후기 시스템 공용 모듈 (브라우저 + Netlify 함수 + 테스트에서 함께 사용)
// ─────────────────────────────────────────────────────────────
// - 프로그램/카테고리 상수, 정규화·유사도(중복 감지), CSV/JSON 파싱, 슬러그 생성,
//   공개 가능 여부 판단, 안전한(HTML 이스케이프) 렌더링 함수를 한곳에 모았습니다.
// - 모든 렌더 함수는 사용자 입력을 escapeHtml()로 이스케이프하고, 링크는 http(s)만 허용합니다.
//   innerHTML에 넣어도 스크립트가 실행되지 않도록 설계되어 있습니다.

export const NOT_MENTIONED = '언급 없음';

/** 교육 프로그램 (programs 페이지의 앵커와 동일한 key) */
export const PROGRAMS = [
    { key: 'ai-literacy', label: '교육자를 위한 AI 리터러시' },
    { key: 'vibe-coding', label: '교육자를 위한 바이브 코딩' },
    { key: 'admin-automation', label: '교육행정 업무 자동화' },
    { key: 'professor-ai', label: '대학 교수자를 위한 AI 활용' },
    { key: 'special-lecture', label: '기관 맞춤 특강·기타' },
];

/** 방문자 필터 카테고리 (전체는 필터 없음) */
export const CATEGORIES = [
    { key: 'teacher-training', label: '교사 연수' },
    { key: 'professor', label: '대학 교수자 교육' },
    { key: 'vibe-coding', label: '바이브 코딩' },
    { key: 'ai-literacy', label: 'AI 리터러시' },
    { key: 'automation', label: '업무 자동화' },
];

export const AUTHOR_TYPES = ['교사', '교수', '교육담당자', '기타'];
export const STATUSES = { draft: '임시저장', published: '게시', private: '비공개' };
export const CONSENT = { pending: '확인 전', confirmed: '공개 동의 확인', denied: '공개 거부' };

/** Firestore 규칙(firestore.rules validReview)과 같은 한도 */
export const LIMITS = {
    title: 120, authorDisplay: 50, institution: 80, short: 1000,
    originalText: 20000, adminSummary: 1000, sourceUrl: 500, images: 12, alt: 200,
};

export const programLabel = (key) => (PROGRAMS.find(p => p.key === key) || {}).label || '';
export const categoryLabel = (key) => (CATEGORIES.find(c => c.key === key) || {}).label || '';

// ───────────── 문자열 유틸 ─────────────
export function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** http(s) URL만 통과. 그 외(javascript:, data: 등)는 빈 문자열 */
export function safeUrl(u) {
    const s = String(u ?? '').trim();
    if (!s) return '';
    try {
        const url = new URL(s);
        return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : '';
    } catch { return ''; }
}

export const isNaverCafeUrl = (u) => /^https?:\/\/(m\.)?cafe\.naver\.com\//i.test(String(u || '').trim());

/** 붙여넣은 원문 정리: 줄바꿈 통일, 줄 끝 공백 제거, 3줄 이상 빈 줄은 2줄로. 문단은 보존 */
export function cleanPastedText(s) {
    return String(s ?? '')
        .replace(/\r\n?/g, '\n')
        .replace(/ /g, ' ')
        .replace(/[​‌‍﻿]/g, '')
        .split('\n').map(l => l.replace(/[ \t]+$/g, '')).join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/** '언급 없음'·빈 값은 표시하지 않기 위한 판단 */
export function hasContent(v) {
    const s = String(v ?? '').trim();
    return !!s && s !== NOT_MENTIONED && s !== '-';
}

/** 텍스트를 <p> 문단으로 (이스케이프 후 줄바꿈 → <br>) */
export function paragraphsHtml(text) {
    return cleanPastedText(text).split(/\n{2,}/).filter(Boolean)
        .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('\n');
}

// ───────────── 중복 감지 ─────────────
/** 비교용 정규화: 공백·문장부호 제거, 소문자 */
export function normalizeForCompare(s) {
    return String(s ?? '').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
}

function shingles(s, n = 3) {
    const set = new Set();
    for (let i = 0; i + n <= s.length; i++) set.add(s.slice(i, i + n));
    if (!set.size && s) set.add(s);
    return set;
}

/** 0~1 유사도 (글자 3-gram Jaccard). 긴 글은 앞 4000자로 비교 */
export function textSimilarity(a, b) {
    const x = normalizeForCompare(a).slice(0, 4000), y = normalizeForCompare(b).slice(0, 4000);
    if (!x || !y) return 0;
    if (x === y) return 1;
    const A = shingles(x), B = shingles(y);
    let inter = 0;
    for (const g of A) if (B.has(g)) inter++;
    return inter / (A.size + B.size - inter);
}

export function normalizeUrlForCompare(u) {
    const s = safeUrl(u);
    if (!s) return '';
    const url = new URL(s);
    url.hash = '';
    // 네이버 카페 모바일/PC 주소 차이 무시
    const host = url.hostname.replace(/^m\./, '').replace(/^www\./, '');
    return (host + url.pathname.replace(/\/+$/, '') + url.search).toLowerCase();
}

/**
 * 중복 후보 찾기. existing: [{id, title, sourceUrl, originalText}]
 * 반환: [{id, title, reason: 'url'|'text', score}]
 */
export function findDuplicates(candidate, existing, { threshold = 0.8 } = {}) {
    const out = [];
    const cu = normalizeUrlForCompare(candidate.sourceUrl);
    for (const r of existing || []) {
        if (!r || (candidate.id && r.id === candidate.id)) continue;
        if (cu && cu === normalizeUrlForCompare(r.sourceUrl)) {
            out.push({ id: r.id, title: r.title || '', reason: 'url', score: 1 });
            continue;
        }
        const score = textSimilarity(candidate.originalText, r.originalText);
        if (score >= threshold) out.push({ id: r.id, title: r.title || '', reason: 'text', score });
    }
    return out.sort((a, b) => b.score - a.score);
}

// ───────────── 슬러그 ─────────────
const ROMAN = {
    'ai-literacy': 'ai-literacy', 'vibe-coding': 'vibe-coding', 'admin-automation': 'automation',
    'professor-ai': 'professor-ai', 'special-lecture': 'lecture',
};
const TYPE_SLUG = { '교사': 'teacher', '교수': 'professor', '교육담당자': 'staff', '기타': 'educator' };

/** 예: teacher-ai-literacy-2026-ab12 (사람이 읽기 쉬운 영문 슬러그 + 충돌 방지 접미사) */
export function makeSlug({ authorType, program, reviewDate } = {}, suffix) {
    const parts = [TYPE_SLUG[authorType] || 'educator', ROMAN[program] || 'review'];
    const y = /^(\d{4})/.exec(reviewDate || '');
    if (y) parts.push(y[1]);
    const sfx = suffix || Math.random().toString(36).slice(2, 6);
    return sanitizeSlug(parts.join('-') + '-' + sfx);
}

export function sanitizeSlug(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '').slice(0, 80);
}
export const isValidSlug = (s) => /^[a-z0-9][a-z0-9-]{1,79}$/.test(String(s || ''));

// ───────────── 공개 가능 여부 ─────────────
/** 게시 전 점검. errors가 비어야 게시 가능 (firestore.rules에서도 같은 조건을 강제) */
export function publishCheck(r) {
    const errors = [], warnings = [];
    if (!String(r.title || '').trim()) errors.push('후기 제목이 비어 있습니다.');
    if (!String(r.originalText || '').trim()) errors.push('후기 원문이 비어 있습니다. 원문 없이 요약만 게시할 수 없습니다.');
    if (r.consentStatus !== 'confirmed') errors.push('작성자의 공개 동의가 확인되지 않았습니다. 동의 확인 전에는 게시할 수 없습니다.');
    if (!isValidSlug(r.slug)) errors.push('고유 주소(slug)가 올바르지 않습니다. 영문 소문자·숫자·하이픈만 사용하세요.');
    if (!r.anonymous && !String(r.authorDisplay || '').trim()) warnings.push('작성자 표시 이름이 비어 있어 "익명"으로 표시됩니다.');
    if (r.sourceUrl && !safeUrl(r.sourceUrl)) errors.push('원본 링크가 올바른 http(s) 주소가 아닙니다.');
    if (r.sourceUrl && safeUrl(r.sourceUrl) && !isNaverCafeUrl(r.sourceUrl)) warnings.push('원본 링크가 네이버 카페 주소가 아닙니다. 맞는지 확인해 주세요.');
    if (!r.reviewDate) warnings.push('후기 작성일이 비어 있습니다. 원본 게시일을 확인해 입력해 주세요.');
    if (r.aiDraft && r.summaryOrigin === 'ai') warnings.push('AI 정리 결과를 수정 없이 사용합니다. 원문과 다시 한 번 대조해 주세요.');
    return { ok: errors.length === 0, errors, warnings };
}

/** 공개 페이지에서 보여줄 작성자 표기 */
export function displayAuthor(r) {
    const name = String(r.authorDisplay || '').trim();
    const base = (r.anonymous || !name) ? '익명' : name;
    return r.authorType ? `${base} · ${r.authorType}` : base;
}

export function formatDate(d) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || '');
    return m ? `${m[1]}.${m[2]}.${m[3]}` : '';
}

/** 공개용 문서로 정리 (렌더 전 방어적 정규화) */
export function toPublicReview(r) {
    return {
        slug: String(r.slug || ''),
        title: String(r.title || '').slice(0, LIMITS.title),
        authorDisplay: String(r.authorDisplay || ''),
        anonymous: !!r.anonymous,
        authorType: AUTHOR_TYPES.includes(r.authorType) ? r.authorType : '',
        program: String(r.program || ''),
        categories: Array.isArray(r.categories) ? r.categories.filter(c => CATEGORIES.some(x => x.key === c)) : [],
        institution: String(r.institution || ''),
        reviewDate: String(r.reviewDate || ''),
        concernBefore: String(r.concernBefore || ''),
        memorablePractice: String(r.memorablePractice || ''),
        changeAfter: String(r.changeAfter || ''),
        adminSummary: String(r.adminSummary || ''),
        originalText: String(r.originalText || ''),
        sourceUrl: safeUrl(r.sourceUrl),
        images: (Array.isArray(r.images) ? r.images : []).map(im => ({ url: safeUrl(im && im.url), alt: String((im && im.alt) || '') })).filter(im => im.url),
        featured: !!r.featured,
    };
}

export function sortReviews(list) {
    return [...list].sort((a, b) => String(b.reviewDate || '').localeCompare(String(a.reviewDate || '')) || String(a.title).localeCompare(String(b.title)));
}

// ───────────── 렌더링 (SSR·클라이언트·관리자 미리보기 공용) ─────────────
const STORY_FIELDS = [
    ['concernBefore', '교육 전 고민'],
    ['memorablePractice', '인상 깊었던 실습'],
    ['changeAfter', '교육 후 변화'],
];

function tagsHtml(r) {
    const tags = [];
    const pl = programLabel(r.program);
    if (pl) tags.push(`<span class="rv-tag rv-tag-program">${escapeHtml(pl)}</span>`);
    for (const c of r.categories || []) {
        const l = categoryLabel(c);
        if (l) tags.push(`<span class="rv-tag">${escapeHtml(l)}</span>`);
    }
    return tags.length ? `<div class="rv-tags">${tags.join('')}</div>` : '';
}

/** 목록 카드: 고민 → 배움 → 변화 우선 */
export function renderReviewCard(raw, { basePath = '/reviews/' } = {}) {
    const r = toPublicReview(raw);
    const href = basePath + encodeURIComponent(r.slug);
    const story = STORY_FIELDS.filter(([k]) => hasContent(r[k]))
        .map(([k, label]) => `<div class="rv-story-row"><dt>${label}</dt><dd>${escapeHtml(r[k])}</dd></div>`).join('');
    const excerptSrc = hasContent(r.adminSummary) ? '' : r.originalText;
    const excerpt = excerptSrc ? `<p class="rv-excerpt">“${escapeHtml(excerptSrc.replace(/\s+/g, ' ').slice(0, 140))}${excerptSrc.length > 140 ? '…' : ''}”</p>` : '';
    const summary = hasContent(r.adminSummary) ? `<p class="rv-summary"><span class="rv-label">운영자 요약</span>${escapeHtml(r.adminSummary)}</p>` : '';
    return `<article class="rv-card" data-categories="${escapeHtml((r.categories || []).join(' '))}">
  ${tagsHtml(r)}
  <h3 class="rv-card-title"><a href="${escapeHtml(href)}">${escapeHtml(r.title)}</a></h3>
  ${story ? `<dl class="rv-story">${story}</dl>` : ''}
  ${summary}${excerpt}
  <div class="rv-meta"><span>${escapeHtml(displayAuthor(r))}</span>${r.reviewDate ? `<time datetime="${escapeHtml(r.reviewDate)}">${formatDate(r.reviewDate)}</time>` : ''}</div>
  <a class="rv-more" href="${escapeHtml(href)}">후기 원문 보기 <span aria-hidden="true">→</span></a>
</article>`;
}

/** 상세 본문 (h1 포함). 원문과 운영자 요약을 시각적으로 분리 */
export function renderReviewDetail(raw) {
    const r = toPublicReview(raw);
    const story = STORY_FIELDS.filter(([k]) => hasContent(r[k]))
        .map(([k, label]) => `<div class="rv-story-row"><dt>${label}</dt><dd>${escapeHtml(r[k])}</dd></div>`).join('');
    const imgs = r.images.length ? `<div class="rv-images">${r.images.map(im =>
        `<figure><img src="${escapeHtml(im.url)}" alt="${escapeHtml(im.alt || '후기 첨부 이미지')}" loading="lazy" decoding="async"></figure>`).join('')}</div>` : '';
    const meta = [
        `<div><dt>작성자</dt><dd>${escapeHtml(displayAuthor(r))}</dd></div>`,
        programLabel(r.program) ? `<div><dt>교육 프로그램</dt><dd><a href="/programs#${escapeHtml(r.program)}">${escapeHtml(programLabel(r.program))}</a></dd></div>` : '',
        r.institution ? `<div><dt>교육기관</dt><dd>${escapeHtml(r.institution)}</dd></div>` : '',
        r.reviewDate ? `<div><dt>후기 작성일</dt><dd><time datetime="${escapeHtml(r.reviewDate)}">${formatDate(r.reviewDate)}</time></dd></div>` : '',
    ].join('');
    return `<article class="rv-detail">
  ${tagsHtml(r)}
  <h1>${escapeHtml(r.title)}</h1>
  <dl class="rv-detail-meta">${meta}</dl>
  ${story ? `<section class="rv-detail-story" aria-labelledby="rv-story-h"><h2 id="rv-story-h">한눈에 보는 후기 <small>운영자가 원문을 바탕으로 정리했습니다</small></h2><dl class="rv-story">${story}</dl></section>` : ''}
  ${hasContent(r.adminSummary) ? `<section class="rv-detail-summary"><h2>운영자 요약</h2><p>${escapeHtml(r.adminSummary)}</p></section>` : ''}
  <section class="rv-original" aria-labelledby="rv-orig-h">
    <h2 id="rv-orig-h">후기 원문 <small>작성자가 남긴 글을 그대로 옮겼습니다</small></h2>
    <blockquote class="rv-original-text"${r.sourceUrl ? ` cite="${escapeHtml(r.sourceUrl)}"` : ''}>${paragraphsHtml(r.originalText)}</blockquote>
    ${r.sourceUrl ? `<p class="rv-source"><a href="${escapeHtml(r.sourceUrl)}" target="_blank" rel="noopener nofollow">네이버 카페 원문 보기 ↗</a></p>` : ''}
  </section>
  ${imgs}
</article>`;
}

// ───────────── CSV / JSON 가져오기 ─────────────
/** RFC4180 수준 CSV 파서 (따옴표 안 줄바꿈·쉼표·"" 이스케이프 지원, BOM 제거) */
export function parseCsv(text) {
    const s = String(text ?? '').replace(/^﻿/, '');
    const rows = [];
    let row = [], field = '', q = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (q) {
            if (ch === '"') {
                if (s[i + 1] === '"') { field += '"'; i++; } else q = false;
            } else field += ch;
        } else if (ch === '"') q = true;
        else if (ch === ',') { row.push(field); field = ''; }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && s[i + 1] === '\n') i++;
            row.push(field); rows.push(row); row = []; field = '';
        } else field += ch;
    }
    if (field !== '' || row.length) { row.push(field); rows.push(row); }
    return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

const FIELD_ALIASES = {
    originalText: ['originaltext', 'original', 'text', 'content', '원문', '후기원문', '후기 원문', '본문'],
    sourceUrl: ['sourceurl', 'url', 'link', '원본url', '원본 url', '원본링크', '원본 링크', '카페링크', '카페 링크'],
    reviewDate: ['reviewdate', 'date', '작성일', '후기작성일', '후기 작성일'],
    authorDisplay: ['authordisplay', 'author', 'name', '작성자', '작성자표시이름', '작성자 표시 이름', '이름'],
    program: ['program', '교육프로그램', '교육 프로그램', '프로그램'],
    title: ['title', '제목', '후기제목', '후기 제목'],
    authorType: ['authortype', '작성자유형', '작성자 유형', '유형'],
};

function canonicalField(h) {
    const k = String(h || '').trim().toLowerCase();
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
        if (aliases.includes(k) || aliases.includes(k.replace(/\s+/g, ''))) return field;
    }
    return null;
}

/** 프로그램 값: key 또는 한국어 라벨(부분 일치) 허용 */
export function resolveProgram(v) {
    const s = String(v || '').trim();
    if (!s) return '';
    const byKey = PROGRAMS.find(p => p.key === s);
    if (byKey) return byKey.key;
    const n = s.replace(/\s+/g, '');
    const byLabel = PROGRAMS.find(p => p.label.replace(/\s+/g, '').includes(n) || n.includes(p.label.replace(/\s+/g, '')));
    if (byLabel) return byLabel.key;
    if (/리터러시/.test(s)) return 'ai-literacy';
    if (/바이브|코딩|codex|claude ?code/i.test(s)) return 'vibe-coding';
    if (/행정|자동화/.test(s)) return 'admin-automation';
    if (/교수/.test(s)) return 'professor-ai';
    return 'special-lecture';
}

/** 'YYYY-MM-DD' 로 정규화. 2026.11.05 / 2026/11/5 / 20261105 허용. 해석 불가면 '' */
export function normalizeDate(v) {
    const s = String(v || '').trim();
    let m = /^(\d{4})[.\-/년\s]+(\d{1,2})[.\-/월\s]+(\d{1,2})/.exec(s) || /^(\d{4})(\d{2})(\d{2})$/.exec(s);
    if (!m) return '';
    const [y, mo, d] = [m[1], m[2].padStart(2, '0'), m[3].padStart(2, '0')];
    const dt = new Date(`${y}-${mo}-${d}T00:00:00Z`);
    if (isNaN(dt) || dt.getUTCMonth() + 1 !== Number(mo)) return '';
    return `${y}-${mo}-${d}`;
}

/**
 * CSV 또는 JSON 텍스트 → 후기 초안 배열. 모두 '임시저장 + 동의 확인 전'으로 들어갑니다.
 * 반환: { items: [...], errors: ['3행: 원문 없음', ...] }
 */
export function parseImport(text, format) {
    const errors = [];
    let records = [];
    const fmt = format || (/^\s*[[{]/.test(text) ? 'json' : 'csv');
    if (fmt === 'json') {
        let data;
        try { data = JSON.parse(text); } catch (e) { return { items: [], errors: ['JSON 형식이 올바르지 않습니다: ' + e.message] }; }
        if (data && !Array.isArray(data) && Array.isArray(data.reviews)) data = data.reviews;
        if (!Array.isArray(data)) return { items: [], errors: ['JSON은 배열([ ... ]) 또는 { "reviews": [ ... ] } 형식이어야 합니다.'] };
        records = data.map(o => {
            const rec = {};
            for (const [k, v] of Object.entries(o || {})) { const f = canonicalField(k); if (f) rec[f] = v; }
            return rec;
        });
    } else {
        const rows = parseCsv(text);
        if (rows.length < 2) return { items: [], errors: ['CSV에 머리글 행과 1개 이상의 데이터 행이 필요합니다.'] };
        const head = rows[0].map(canonicalField);
        if (!head.includes('originalText')) return { items: [], errors: ['CSV 머리글에 "원문"(originalText) 열이 필요합니다.'] };
        records = rows.slice(1).map(cells => {
            const rec = {};
            head.forEach((f, i) => { if (f) rec[f] = cells[i] ?? ''; });
            return rec;
        });
    }
    const items = [];
    records.forEach((rec, i) => {
        const line = fmt === 'csv' ? `${i + 2}행` : `${i + 1}번째 항목`;
        const originalText = cleanPastedText(rec.originalText);
        if (!originalText) { errors.push(`${line}: 원문이 비어 있어 건너뜁니다.`); return; }
        if (originalText.length > LIMITS.originalText) { errors.push(`${line}: 원문이 ${LIMITS.originalText}자를 넘어 건너뜁니다.`); return; }
        const reviewDate = normalizeDate(rec.reviewDate);
        if (rec.reviewDate && !reviewDate) errors.push(`${line}: 작성일 "${rec.reviewDate}"을 해석하지 못해 비워 두었습니다.`);
        const sourceUrl = safeUrl(rec.sourceUrl);
        if (rec.sourceUrl && !sourceUrl) errors.push(`${line}: 원본 URL이 올바르지 않아 비워 두었습니다.`);
        const authorDisplay = String(rec.authorDisplay || '').trim().slice(0, LIMITS.authorDisplay);
        const authorType = AUTHOR_TYPES.includes(String(rec.authorType || '').trim()) ? String(rec.authorType).trim() : '';
        const program = resolveProgram(rec.program);
        items.push({
            title: String(rec.title || '').trim().slice(0, LIMITS.title),
            originalText, sourceUrl, reviewDate, authorDisplay,
            anonymous: !authorDisplay || authorDisplay === '익명',
            authorType, program,
            status: 'draft', consentStatus: 'pending',
        });
    });
    return { items, errors };
}

/** 내보내기용 CSV (백업). 개인정보(review_private)는 포함하지 않음 */
export function toCsv(rows, columns) {
    const esc = (v) => {
        const s = Array.isArray(v) ? v.join('|') : String(v ?? '');
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return '﻿' + [columns.join(','), ...rows.map(r => columns.map(c => esc(r[c])).join(','))].join('\r\n');
}

// ───────────── AI 정리 결과 검증 ─────────────
/** 근거 인용(evidence)이 원문에 실제로 있는지 확인. 공백 차이는 무시 */
export function evidenceInText(evidence, original) {
    const e = String(evidence || '').replace(/\s+/g, '');
    if (!e) return false;
    return String(original || '').replace(/\s+/g, '').includes(e);
}
