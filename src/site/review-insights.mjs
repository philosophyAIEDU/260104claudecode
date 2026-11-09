// 게시된 후기(공개 동의 확인)에서 사실만 뽑아 요약 — 강사 소개·사례·프로그램·후기 페이지·llms.txt 가 함께 사용
// 원칙: 숫자는 원문에서 직접 센 값, 인용은 원문 문장을 그대로(글자 수정 없음), 해석·평가를 덧붙이지 않음.
import { HISTORY } from './data.mjs';

/** 후기의 '수강한 교육' → 교육 사례 id */
const CASE_MATCHERS = [
    [/독서챌린지/, 'permes-2026-reading'],
    [/이너서클.*Claude Code/i, 'permes-2026-claudecode'],
    [/이너서클.*(GPT|Codex)/i, 'permes-2026-codex'],
    [/동신대/, 'dongshin-2026-vibe'],
    [/경상국립대/, 'gnu-2026-physics'],
];
export function caseIdFor(review) {
    const s = String(review.institution || '');
    const hit = CASE_MATCHERS.find(([re]) => re.test(s));
    return hit ? hit[1] : '';
}
export const caseById = (id) => HISTORY.find(h => h.id === id);

/** 원문에서 함께 언급된 실습 요소 (원문 키워드 기준으로 센 '언급한 후기 수') */
export const MENTIONS = [
    { key: 'deploy', label: '배포(Netlify 등)까지 했다고 언급', re: /배포|netlify|네트리파이/i },
    { key: 'github', label: 'GitHub를 언급', re: /github|깃허브|깃퍼브/i },
    { key: 'firebase', label: 'Firebase·구글 로그인을 언급', re: /firebase|파이어베이스|구글 로그인|구글 인증/i },
    { key: 'nocode', label: '코딩·개발 경험이 없었다고 언급', re: /코딩\s*1도|코딩을\s*(전혀\s*)?몰|개발을\s*(하나도|전혀)\s*모르|제로베이스|초초+보|컴맹|AI 신생아|한번도 안해본/ },
    { key: 'care', label: '막히는 사람을 한 명씩 챙겨 줬다고 언급', re: /하나\s?하나\s?(다|알려|짚어|봐|꼼꼼|떠먹|아주|쉽게|따라할|차근)|한\s*명\s*한\s*명|챙겨|놓치지 않|누락되는|놓친 부분|막히는 부분/ },
    { key: 'confidence', label: '자신감·"할 수 있다"를 언급', re: /자신감|할 수 있겠|할 수 있구나|할 수 있을 것|할 수 있다는/ },
];

export function summarizeReviews(list) {
    const reviews = (list || []).filter(r => r && r.slug && r.originalText);
    const mentions = MENTIONS.map(m => ({ ...m, count: reviews.filter(r => m.re.test(r.originalText)).length }));
    const byCase = {};
    for (const r of reviews) {
        const id = caseIdFor(r) || 'other';
        (byCase[id] ||= []).push(r);
    }
    const lectures = Object.entries(byCase).map(([id, rs]) => ({ id, case: caseById(id), count: rs.length, reviews: rs }))
        .sort((a, b) => b.count - a.count);
    const authors = new Set(reviews.map(r => (r.anonymous ? '' : String(r.authorDisplay || '').trim()) || r.slug));
    const dates = reviews.map(r => r.reviewDate).filter(Boolean).sort();
    // 교육 전 고민과 교육 후 변화가 둘 다 원문에서 확인된 후기 (운영자 정리 항목)
    const stories = reviews.filter(r => r.concernBefore && r.changeAfter);
    return { total: reviews.length, authors: authors.size, from: dates[0] || '', to: dates[dates.length - 1] || '', mentions, lectures, stories, reviews };
}

/**
 * 원문에서 인용할 한 문장 고르기 — 원문 줄을 그대로 사용(수정 없음).
 * 결과·변화를 말하는 완결된 문장(15~90자)을 점수로 고르고, 없으면 빈 문자열.
 */
const QUOTE_GOOD = /완성|만들었|만들게|만들어졌|배포|자신감|할 수 있겠|할 수 있구나|생겼|바뀌었|뿌듯|체계적으로|해냈|신세계|처음으로/;
const QUOTE_SKIP = /^(안녕하세요|감사합니다|필로소피님.{0,8}감사|https?:|・|-|\*)/;
/**
 * 운영자가 고른 인용 문장 — 각 후기 원문에 '글자 그대로' 들어 있는 문장만 씁니다.
 * (원문에 없으면 자동으로 건너뜀 → 원문이 바뀌어도 잘못된 인용이 나가지 않음)
 */
export const CURATED_QUOTES = [
    '만약에 앞으로 AI 강의가 필요하다면 필로소피님을 찾을 정도로요!',
    '그냥 AI로 뭘 하고 싶으면 필로소피님과 함께 하면 될 것 같아요.',
    '덕분에 유튜버가 사용할 수 있는 자막 편집기 하나 진짜로 완성했습니다',
    '코딩 1도 모르는데, 1시간 반 만에 내 웹사이트가 세상에 나왔습니다.',
    '아니 저같은 초초초초보가 3시간 만에 챌린지 인증 웹을 만든다니요?',
    '평소에는 앱이나 홈페이지를 만드는 사람들을 보면서 ‘저건 나와는 다른 세계의 일’이라고 생각했는데, 오늘 직접 해보니 “나도 할 수 있구나.” 라는 생각이 들었습니다.',
    '완성된 웹앱에서 로그인 화면이 딱 뜨는 순간, 정말 너무 뿌듯했어요.',
    '두 번의 수업을 들으면서 느낀 건, 도구가 바뀌어도 "이렇게 하면 되는구나" 하는 흐름이 점점 더 선명해진다는 거예요.',
    '덕분에 어디서든 제 웹사이트를 편집할 수 있게 되었고',
    '누락되는 사람 없도록 하나하나 꼼꼼하게 불러주시고, 챙겨주십니다.',
    '저같은 AI 신생아들에게 이유식 먹이듯이 하나하나 다 떠먹여주셔서 진짜 너무 감사했어요!',
    "강의덕분에 '할 수 있겠다'는 생각으로 바뀌었습니다!",
    '덕분에 여기저기 흩어져있는 내용들을 한 곳에 모아서 체계적으로 관리할 수 있게 되었습니다!',
    '재미있게 운영을 할 수 있는 어플을 만들게 되었습니다!!',
    '소피님 덕분에 AI로 앱, 홈페이지 만드는 첫발 내딛을 수 있었습니다!',
    '이제 필요한 페이지는 제가 직접 만들어볼 수 있을 것 같습니다!',
    '한 번 사이클을 돌리면서 뭐라도 만들어내면 일단 뇌가 바뀝니다.',
    '이제는 일단 한번 만들어보고 싶어집니다ㅋㅋㅋ',
    '끝까지 놓치지 않고 제 사이트를 완성할 수 있었습니다.',
    '필로소피님의 AI 라이브수업을 들으며 저는 누군가를 가르쳐준다는 것에 진심을 담는게 어떤것인지 배웠던 것 같아요.',
    '따라갔더니 글쎄 결과물이 뚝딱 나오네요!!!',
    '완전 제로베이스인 저도 하나 하나 쉽게 따라할 수 있게 설명과 가이드를 너무 잘 해 주시고',
    '그 결과 제가 원하는 숏폼편집기를 만들었고',
];

export function pickQuote(r) {
    const text = String(r.originalText || '');
    const curated = CURATED_QUOTES.find(q => text.includes(q));
    if (curated) return curated;
    const lines = String(r.originalText || '').split(/\n+/).map(s => s.trim())
        .filter(s => s.length >= 15 && s.length <= 90 && !QUOTE_SKIP.test(s));
    let best = '', bestScore = 0;
    for (const s of lines) {
        let sc = 0;
        if (QUOTE_GOOD.test(s)) sc += 3;
        if (/[.!~)😆]$|다$|요$|요!+$|니다!*$/.test(s)) sc += 2;
        if (/[,?]$|\?|“|"$|^"/.test(s)) sc -= 4;
        if (/필로소피님/.test(s)) sc += 1;
        if (sc > bestScore) { best = s; bestScore = sc; }
    }
    return bestScore >= 4 ? best : '';
}

/** 날짜 최신순 + 대표 후기 우선 */
export function orderForDisplay(list) {
    return [...list].sort((a, b) => (b.featured === true) - (a.featured === true) || String(b.reviewDate).localeCompare(String(a.reviewDate)));
}
