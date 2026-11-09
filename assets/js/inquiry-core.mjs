// 강의 문의 — 입력값 정의·검증 (브라우저와 테스트에서 공용)
// 서버 측 검증은 firestore.rules 의 validInquiry() 가 같은 규칙으로 다시 강제합니다. 한쪽을 바꾸면 다른 쪽도 함께 바꾸세요.

export const INQUIRY_PROGRAMS = [
    'A. 교수님을 위한 생성형 AI 실무 입문',
    'B. AI 시대의 대학 교수법·평가 혁신',
    'C. 교수님만의 AI 수업 앱 만들기',
    'D. 대학 연구·행정업무 AI 자동화',
    '교사·교육실무사 대상 연수',
    '아직 정하지 못했습니다 / 상담 희망',
];

export const REFERRALS = ['유튜브', '네이버 카페', '구글 검색', '네이버 검색', 'ChatGPT 등 AI 추천', '지인 추천', '기타'];

export const FIELDS = {
    org: { label: '기관명', required: true, min: 2, max: 100 },
    name: { label: '담당자명', required: true, min: 2, max: 50 },
    dept: { label: '담당 부서', required: false, max: 60 },
    email: { label: '이메일', required: true, max: 120 },
    phone: { label: '연락처', required: false, max: 30 },
    program: { label: '희망 교육 프로그램', required: false, max: 60 },
    people: { label: '예상 참여 인원', required: false, max: 50 },
    schedule: { label: '희망 교육 일정', required: false, max: 100 },
    message: { label: '교육 목적 및 요청사항', required: true, min: 10, max: 3000 },
    referral: { label: '알게 된 경로', required: false, max: 30 },
};

export const EMAIL_RE = /^[^\s@<>()"',;]+@[^\s@<>()"',;]+\.[^\s@<>()"',;]{2,}$/;
const PHONE_RE = /^[0-9+()\-\s.]{0,30}$/;

/** 입력값 정리: 앞뒤 공백 제거, 제어문자 제거, 줄바꿈은 message 에서만 허용 */
export function normalizeInquiry(raw = {}) {
    const clean = (v, multiline = false) => {
        let s = String(v ?? '').replace(/\r\n?/g, '\n');
        s = multiline ? s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '') : s.replace(/[\u0000-\u001f\u007f]/g, ' ');
        return s.trim();
    };
    const out = {};
    for (const k of Object.keys(FIELDS)) out[k] = clean(raw[k], k === 'message');
    out.consent = raw.consent === true || raw.consent === 'on' || raw.consent === 'true';
    return out;
}

/** 검증 결과: { ok, errors: { field: '메시지' } } */
export function validateInquiry(raw) {
    const d = normalizeInquiry(raw);
    const errors = {};
    for (const [k, f] of Object.entries(FIELDS)) {
        const v = d[k];
        if (f.required && !v) { errors[k] = `${f.label}을(를) 입력해 주세요.`; continue; }
        if (v && f.min && v.length < f.min) errors[k] = `${f.label}을(를) ${f.min}자 이상 입력해 주세요.`;
        if (v && v.length > f.max) errors[k] = `${f.label}은(는) ${f.max}자 이하로 입력해 주세요.`;
    }
    if (d.email && !errors.email && !EMAIL_RE.test(d.email)) errors.email = '올바른 이메일 주소를 입력해 주세요. (예: name@university.ac.kr)';
    if (d.phone && !PHONE_RE.test(d.phone)) errors.phone = '연락처는 숫자와 - 기호로 입력해 주세요.';
    if (d.program && !INQUIRY_PROGRAMS.includes(d.program) && d.program.length > 60) errors.program = '희망 프로그램을 다시 선택해 주세요.';
    if (d.referral && !REFERRALS.includes(d.referral)) errors.referral = '알게 된 경로를 다시 선택해 주세요.';
    if (!d.consent) errors.consent = '개인정보 수집·이용에 동의해 주셔야 문의를 접수할 수 있습니다.';
    return { ok: Object.keys(errors).length === 0, errors, data: d };
}

/** 스팸 의심 판정: 숨은 칸(honeypot)이 채워졌거나, 화면을 연 뒤 3초 안에 제출 */
export function looksLikeBot({ honeypot = '', openedAt = 0, now = Date.now() } = {}) {
    if (String(honeypot).trim()) return true;
    if (openedAt && now - openedAt < 3000) return true;
    return false;
}

/** 같은 내용을 짧은 시간에 다시 보내는지 확인하기 위한 지문 */
export function inquiryFingerprint(d) {
    const s = [d.email, d.org, d.message].map(x => String(x || '').toLowerCase().replace(/\s+/g, '')).join('|');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return 'iq' + (h >>> 0).toString(36);
}

/** Firestore 에 저장할 문서 (firestore.rules validInquiry() 의 허용 필드와 정확히 일치) */
export function toInquiryDoc(d, serverTimestamp) {
    return {
        org: d.org, name: d.name, dept: d.dept, email: d.email, phone: d.phone,
        program: d.program, people: d.people, schedule: d.schedule, message: d.message, referral: d.referral,
        consent: true, status: 'new', source: 'education-inquiry', createdAt: serverTimestamp,
    };
}

/** 메일 앱으로 보낼 때(저장 실패 시 대안)의 제목·본문 */
export function toMail(d) {
    const subject = `[대학 AI 연수 문의] ${d.org} ${d.name}님${d.program ? ' — ' + d.program : ''}`;
    const line = (k) => `■ ${FIELDS[k].label}: ${d[k] || '-'}`;
    const body = ['org', 'name', 'dept', 'email', 'phone', 'program', 'people', 'schedule', 'referral'].map(line).join('\n')
        + `\n\n■ ${FIELDS.message.label}\n${d.message}\n\n— 필로소피 AI 교육 홈페이지 문의 양식에서 작성`;
    return { subject, body };
}
