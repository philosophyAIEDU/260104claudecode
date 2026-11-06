// 필로소피 AI 교육 — 사이트 공용 사실 데이터 (Single source of truth)
// ─────────────────────────────────────────────────────────────
// 이 파일의 내용이 강사 소개·프로그램·교육 사례·칼럼 페이지와 JSON-LD, llms.txt,
// 후기 페이지(SSR)에 함께 쓰입니다. 사실이 바뀌면 여기만 고친 뒤
//   npm run build:pages
// 를 실행하면 모든 정적 페이지가 같은 날 같은 내용으로 갱신됩니다.
//
// ⚠️ 원칙: 검증된 기록만 적습니다. 확인되지 않은 수치·경력·성과는 넣지 마세요.
//    교육 이력은 education-inquiry.html의 기존 기록(사진 파일명 포함)을 근거로 합니다.

export const SITE = {
    origin: 'https://philosophyaiedu.com',
    name: '필로소피 AI 교육',
    nameEn: 'Philosophy AI Education',
    slogan: 'AI 시대, 교육자의 나침반',
    tagline: '교수님과 선생님을 위한 실습 중심 AI 교육',
    // 모든 채널(홈페이지·유튜브·카페·강사 소개서)에 같은 문장을 사용하세요.
    oneLiner: '필로소피 AI 교육은 초·중·고 교사와 대학 교수 등 교육자를 대상으로 생성형 AI 리터러시, 바이브 코딩(Claude Code·GPT Codex), 교육 업무 자동화를 실습 중심으로 가르치는 AI 교육 브랜드입니다.',
    philosophy: 'AI를 활용하여 우리들의 능력을 향상시키고, 그 능력을 활용해서 세상에 선한 영향력을 더한다.',
    description: '필로소피 AI 교육은 교육자분들이 AI를 활용하여 수업을 개선하고, 반복적인 업무를 줄이며, 자신만의 교육용 AI 시스템을 만들 수 있도록 돕습니다.',
    email: 'dearname27@naver.com',
    inquiryUrl: '/education-inquiry#inquiry',
    logo: '/assets/mascot.jpg',
    ga: 'G-KWCY47PZWB',
    channels: [
        { key: 'youtube', label: '유튜브 · 필로소피 AI 교육', url: 'https://www.youtube.com/channel/UCKXP5U8mn3UMC6gWblROxAA' },
        { key: 'cafe', label: '네이버 카페 · 필로소피 AI 교육 커뮤니티', url: 'https://cafe.naver.com/PHILOSOPHYai' },
    ],
    expertise: [
        { title: '생성형 AI 리터러시', desc: 'AI의 원리와 한계, 환각 검증, 개인정보·저작권까지 교육 현장의 판단 기준을 세웁니다.' },
        { title: '교육자를 위한 실무 AI 활용', desc: '수업 자료 제작, 평가 문항 설계, 연구 자료 정리에 AI를 바로 적용합니다.' },
        { title: '바이브 코딩 (Claude Code · GPT Codex)', desc: '코딩을 몰라도 AI와 대화하며 수업 도구를 직접 만들고 배포합니다.' },
        { title: '교육용 웹앱 제작', desc: '기획부터 GitHub 관리, Netlify 배포, Firebase 로그인·데이터 저장까지 다룹니다.' },
        { title: '교육행정 업무 자동화', desc: '문서 작성과 반복 업무를 분석해 AI로 줄이는 방법을 실습합니다.' },
        { title: 'AI 에이전트 · 교육용 시스템 구축', desc: '교육자 자신의 지식과 자료를 활용하는 맞춤형 AI 시스템을 설계합니다.' },
    ],
    audiences: ['초·중·고 교사', '대학 교수 및 강사', '교육기관 담당자', '교육 관련 연구자', 'AI 활용에 관심 있는 교육자'],
    // 메인 페이지에 공개된 필로소피 AI 툴 개수 (index.html DEFAULT_TOOLS 기준, 2026-11 확인)
    publishedToolsNote: '메인 페이지에 공개된 40여 개의 AI 학습 도구',
    updated: '2026-11-06',
};

/**
 * 교육 이력 (education-inquiry.html #history 와 동일한 기록)
 * audience: 기록에 명시된 경우에만 적습니다. 비어 있으면 화면에 표시하지 않습니다.
 * sessions: 같은 날 진행한 강의 주제 수
 */
export const HISTORY = [
    {
        id: 'gnu-2026-physics', date: '2026-07-27', org: '경상국립대학교', title: '경상국립대학교 물리 정교사(1급) 자격 연수',
        kind: '대학·자격연수', subject: 'AI 리터러시 교육', audience: '물리 정교사(1급) 자격연수에 참여한 현직 교사',
        desc: '물리 정교사 1급 자격 연수 과정에서 현직 교사분들과 함께 AI를 수업과 연구에 활용하는 기준과 방법을 다뤘습니다.',
        tags: ['AI 리터러시', '현직 교사', '실습 중심'], programs: ['ai-literacy'], categories: ['teacher-training', 'ai-literacy'],
        photos: [
            { src: '/assets/web/edu-2607-gnu-1.jpg', alt: '경상국립대학교 사범대학 부설교육연수원 2026년 하계 물리 정교사(1급) 자격연수 안내 자료', cap: '자격연수 안내 자료' },
            { src: '/assets/web/edu-2607-gnu-2.jpg', alt: '선생님들의 고민을 정리한 슬라이드로 진행 중인 강의 장면', cap: '선생님들의 고민 나눔' },
        ],
        links: [{ label: '연수 과정용으로 제작·공개한 웹앱 (26년 하계 물리 정교사(1급) 자격연수 과정)', url: 'https://philoksnu.netlify.app/' }],
        sessions: 1,
    },
    {
        id: 'toegyewon-2026-claude', date: '2026-06-12', org: '퇴계원고등학교', title: '퇴계원고등학교 전문적학습공동체',
        kind: '고등학교 연수', subject: '교육자분들을 위한 클로드 입문', audience: '전문적학습공동체 선생님들',
        desc: '학교 전문적학습공동체 선생님들과 Claude를 처음부터 함께 다뤘습니다. 수업 자료 제작과 업무 활용을 실습으로 익히는 시간이었습니다.',
        tags: ['Claude 입문', '전문적학습공동체', '수업 활용'], programs: ['ai-literacy', 'admin-automation'], categories: ['teacher-training'],
        photos: [
            { src: '/assets/web/edu-2606-toegyewon-1.jpg', alt: '퇴계원고등학교 전문적학습공동체 연수 현장', cap: '연수 현장' },
            { src: '/assets/web/edu-2606-toegyewon-2.jpg', alt: '퇴계원고등학교 연수에서 실습이 진행되는 장면', cap: '실습 진행' },
        ],
        links: [], sessions: 1,
    },
    {
        id: 'jeonju-2026-literacy', date: '2026-06-05', org: '전주교육청', title: '전주교육청 교육실무사 직무연수',
        kind: '교육청 직무연수', subject: 'AI 리터러시 수업', audience: '교육실무사 선생님들',
        desc: '교육실무사 선생님들을 대상으로 한 직무연수입니다. 행정 업무에 AI를 안전하게 활용하는 방법을 중심으로 구성했습니다.',
        tags: ['AI 리터러시', '교육실무사', '업무 자동화'], programs: ['ai-literacy', 'admin-automation'], categories: ['teacher-training', 'ai-literacy', 'automation'],
        photos: [
            { src: '/assets/web/edu-2606-jeonju-1.jpg', alt: '전주교육청 교육실무사 직무연수 강의 현장', cap: '직무연수 현장' },
            { src: '/assets/web/edu-2606-jeonju-2.jpg', alt: '대강당에서 진행된 전주교육청 직무연수 강의 장면', cap: '대강당 강의' },
            { src: '/assets/web/edu-2606-jeonju-3.jpg', alt: '전주교육청 직무연수에 참여한 선생님들의 모습', cap: '참여 선생님들' },
        ],
        links: [], sessions: 1,
    },
    {
        id: 'jeonju-2026-vibe', date: '2026-04-10', org: '전주교육청', title: '전주교육청 바이브 코딩 입문 수업',
        kind: '교육청 교육', subject: '바이브 코딩 입문 수업', audience: '',
        desc: '코딩 경험이 없는 분들도 AI와 함께 직접 도구를 만들어 볼 수 있도록 바이브 코딩의 첫 단계를 실습으로 안내했습니다.',
        tags: ['바이브 코딩', '입문', '실습'], programs: ['vibe-coding'], categories: ['vibe-coding'],
        photos: [{ src: '/assets/web/edu-2604-jeonju.jpg', alt: '전주교육청 바이브 코딩 입문 수업 실습 현장', cap: '컴퓨터실 실습 수업' }],
        links: [], sessions: 1,
    },
    {
        id: 'khu-2026-vibe', date: '2026-02-23', org: '경희대학교', title: '경희대학교 대학원 바이브 코딩 특강',
        kind: '대학원 특강', subject: 'Claude 활용 바이브 코딩 · GPT Codex 활용 바이브 코딩', audience: '대학원생',
        desc: '대학원생을 대상으로 두 가지 도구를 각각 다룬 바이브 코딩 특강입니다. 연구와 과제에 필요한 도구를 직접 만들어 보는 과정으로 진행했습니다.',
        tags: ['Claude', 'GPT Codex', '대학원', '바이브 코딩'], programs: ['vibe-coding', 'professor-ai'], categories: ['vibe-coding'],
        photos: [
            { src: '/assets/web/edu-2602-khu-claude.jpg', alt: '경희대학교 대학원 Claude 활용 바이브 코딩 특강 현장', cap: 'Claude 활용 바이브 코딩' },
            { src: '/assets/web/edu-2602-khu-codex.jpg', alt: '경희대학교 대학원 GPT Codex 활용 바이브 코딩 특강 현장', cap: 'GPT Codex 활용 바이브 코딩' },
        ],
        links: [], sessions: 2,
    },
    {
        id: 'snu-2025-finetuning', date: '2025-07-07', org: '서울대학교', title: '서울대학교 생산공학연구실 특강',
        kind: '연구실 특강', subject: '파인튜닝 수업', audience: '연구실 구성원',
        desc: '연구실 구성원들과 함께 모델 파인튜닝의 개념부터 실제 적용까지 다뤘습니다. 연구 데이터를 활용하는 방향을 중심으로 구성했습니다.',
        tags: ['파인튜닝', '연구실', '심화'], programs: ['special-lecture', 'professor-ai'], categories: [],
        photos: [{ src: '/assets/web/edu-2507-snu.jpg', alt: '서울대학교 생산공학연구실 파인튜닝 수업 현장', cap: '파인튜닝 수업' }],
        links: [], sessions: 1,
    },
    {
        id: 'gyeonggi-2025-hybrid', date: '2025-04-30', org: '경기도청', title: '경기도청 특강',
        kind: '공공기관 특강', subject: '하이브리드 AI 사용법', audience: '',
        desc: '여러 AI 도구를 목적에 맞게 조합해 쓰는 방법을 공공기관 실무 관점에서 다뤘습니다.',
        tags: ['하이브리드 AI', '공공기관', '실무 활용'], programs: ['special-lecture', 'admin-automation'], categories: ['automation'],
        photos: [{ src: '/assets/web/edu-2504-gyeonggi.jpg', alt: '경기도청 하이브리드 AI 사용법 특강 현장', cap: '하이브리드 AI 사용법' }],
        links: [], sessions: 1,
    },
];

/** 기록에서 계산한 통계 (임의로 늘리지 않음) */
export function historyStats() {
    const orgs = new Set(HISTORY.map(h => h.org));
    const sessions = HISTORY.reduce((n, h) => n + (h.sessions || 1), 0);
    const first = [...HISTORY].sort((a, b) => a.date.localeCompare(b.date))[0];
    return { events: HISTORY.length, sessions, orgs: orgs.size, orgList: [...orgs], since: first.date.slice(0, 7).replace('-', '.') };
}

/**
 * 교육 프로그램. status:
 *  - 'delivered' : 같은 주제로 실제 진행한 이력이 있는 프로그램
 *  - 'partial'   : 일부 주제를 다룬 이력이 있고, 전체 구성은 새로 제안하는 프로그램
 *  - 'proposed'  : 신규 제안 프로그램 (해당 대상 진행 이력 없음)
 * 커리큘럼은 모두 기관 요청에 맞춰 조정하는 '제안 구성'입니다.
 */
export const PROGRAM_DETAILS = [
    {
        key: 'ai-literacy', status: 'delivered',
        title: '교육자를 위한 AI 리터러시',
        audience: ['초·중·고 교사', '대학 교수', '교육기관 담당자'],
        problem: '생성형 AI를 교육 현장에서 어디까지, 어떻게 사용해야 할지 판단하기 어렵다.',
        contents: ['생성형 AI의 기본 원리와 한계', 'AI 환각과 검증 방법', '학생의 AI 활용과 교수학습 설계', '개인정보 보호와 AI 윤리'],
        outcomes: ['AI에게 맡길 일과 사람이 판단할 일을 구분하는 기준', 'AI 답변을 근거와 대조해 검증하는 절차', '학교·기관 상황에 맞는 AI 활용 원칙 초안'],
        artifacts: ['수업·업무용 AI 활용 체크리스트', '검증 과정을 기록한 실습 활동지'],
        fit: '처음 AI를 체계적으로 배우는 분, 학교·기관 차원의 활용 기준이 필요한 분',
        notFit: '이미 업무에 AI를 깊이 쓰고 있고 제작·자동화 실습이 필요한 분 (→ 바이브 코딩·업무 자동화 추천)',
    },
    {
        key: 'vibe-coding', status: 'delivered',
        title: '교육자를 위한 바이브 코딩',
        audience: ['코딩 경험이 없는 교사·교수', '수업 도구를 직접 만들고 싶은 교육자', '대학원생·연구자'],
        problem: '코딩을 모르지만 자신만의 수업 도구나 교육용 앱을 만들고 싶다.',
        contents: ['Claude Code 또는 GPT Codex 활용', 'AI와 대화하며 웹앱 만들기', 'GitHub로 코드 관리하기', 'Netlify로 배포하기', 'Firebase 로그인·데이터 저장 기초'],
        outcomes: ['아이디어를 AI가 이해할 수 있는 요구사항으로 정리하는 방법', '만든 앱을 인터넷 주소로 공유하는 경험', '오류가 나도 AI와 함께 고쳐 나가는 작업 흐름'],
        artifacts: ['교육용 웹앱 (예: 퀴즈, 학습 도우미, 수업 시뮬레이션)'],
        fit: '수업에 쓸 도구가 머릿속에 있는데 만들 방법이 없던 분',
        notFit: '정해진 상용 프로그램 사용법만 빠르게 익히고 싶은 분 (→ AI 리터러시 추천)',
    },
    {
        key: 'admin-automation', status: 'partial',
        title: '교육행정 업무 자동화',
        audience: ['교사', '교육실무사', '교육기관 행정 담당자'],
        problem: '보고서, 자료 정리, 반복적인 행정 업무에 시간이 많이 소요된다.',
        contents: ['AI 기반 문서 작성', '반복 업무 분석', '간단한 자동화 워크플로 만들기', '교육기관 맞춤형 업무 도구 제작'],
        outcomes: ['내 업무 중 AI로 줄일 수 있는 부분 목록', '개인정보를 지키며 AI에 업무를 맡기는 방법', '반복 업무 한 가지의 자동화 초안'],
        artifacts: ['업무 분석표', '문서 작성 프롬프트 모음', '간단한 업무 도구'],
        fit: '매 학기 비슷한 문서·자료 정리를 반복하는 분',
        notFit: '기관 시스템(NEIS 등) 연동 개발이 필요한 경우 (별도 협의 필요)',
    },
    {
        key: 'professor-ai', status: 'proposed',
        title: '대학 교수자를 위한 AI 활용',
        audience: ['대학 교수 및 강사', '교수학습센터 담당자'],
        problem: 'AI 시대에 적합한 수업, 과제, 평가 방법을 고민하고 있다.',
        contents: ['AI 활용 수업 설계', 'AI를 활용한 사고력 향상 활동', 'AI와의 토론 활용', '교수자 전용 지식 아카이브 만들기', '강의·연구 자료 활용'],
        outcomes: ['AI에 답을 맡기면 풀리지 않는 과제 설계 원칙', '과정 중심 평가 기준 초안', '내 강의 자료로 만드는 지식 아카이브 구조'],
        artifacts: ['재설계한 과제 1건', '과정 중심 평가 루브릭 초안'],
        fit: '학생의 AI 사용을 막기보다 수업에 녹이고 싶은 교수자',
        notFit: '대학 교수 대상 단독 진행 이력은 아직 없습니다. 대학원 특강·연구실 특강 경험을 바탕으로 새로 설계하는 프로그램입니다.',
    },
];

export const STATUS_LABEL = {
    delivered: '진행 이력 있음',
    partial: '일부 주제 진행 이력 · 확장 제안',
    proposed: '신규 제안 프로그램',
};

/** 자주 받는 질문 — 화면 표시 + FAQPage JSON-LD 가 동일한 문장 */
export function buildFaq() {
    const s = historyStats();
    return [
        {
            q: '필로소피 AI 교육은 어떤 강의를 하나요?',
            a: `교육자를 대상으로 생성형 AI 리터러시, 바이브 코딩(Claude Code·GPT Codex를 활용한 교육용 웹앱 제작), 교육행정 업무 자동화, 대학 교수자를 위한 AI 활용 수업 설계를 실습 중심으로 진행합니다. 기관의 대상과 목표에 맞춰 주제를 조합해 구성합니다.`,
        },
        {
            q: '필로소피 AI 교육은 어떤 기관에서 강의했나요?',
            a: `${s.since}부터 ${s.orgList.join(', ')}에서 강의했습니다(공개 기록 기준 ${s.orgs}개 기관, ${s.sessions}회 강의). 기관별 주제와 대상은 교육 사례 페이지에 정리되어 있습니다.`,
        },
        {
            q: '필로소피 AI 교육은 어떤 교육자에게 적합한가요?',
            a: 'AI를 수업과 업무에 실제로 적용하고 싶은 초·중·고 교사, 대학 교수와 강사, 교육기관 담당자에게 적합합니다. 도구 사용법 소개보다 직접 실습하고, 교육자가 자신의 수업 도구와 시스템을 만들어 보는 과정을 원하는 분께 맞습니다.',
        },
        {
            q: '코딩을 전혀 몰라도 바이브 코딩 실습에 참여할 수 있나요?',
            a: '네. 전주교육청 바이브 코딩 입문 수업처럼 코딩 경험이 없는 분들도 AI와 함께 직접 도구를 만들어 보는 첫 단계부터 안내합니다. 실습에는 노트북과 인터넷 환경이 필요하며, 사용할 AI 도구와 계정은 사전에 협의합니다.',
        },
        {
            q: '대학 교수 대상 강의도 가능한가요?',
            a: '가능합니다. 다만 대학 교수 대상 단독 강의 이력은 아직 없으며, 경희대학교 대학원 바이브 코딩 특강과 서울대학교 생산공학연구실 특강 경험을 바탕으로 교수자용 프로그램을 새로 설계해 제안드립니다.',
        },
        {
            q: '강의나 연수는 어떻게 문의하나요?',
            a: `교육 문의 페이지(${SITE.origin}/education-inquiry)의 양식을 작성하시거나 ${SITE.email}로 기관, 대상, 인원, 희망 일정을 보내 주세요. 확인 후 순차적으로 교육 구성과 진행 방식을 제안드립니다.`,
        },
        {
            q: '강사의 실명이나 경력은 어디서 확인하나요?',
            a: '필로소피 AI 교육이라는 활동명으로 강의하고 있습니다. 강의 이력과 사진은 교육 사례 페이지에서 확인하실 수 있고, 섭외 과정에서 필요한 강사 정보는 문의 시 별도로 안내드립니다.',
        },
    ];
}

/**
 * 교육 사례 보완 정보 (case-studies 페이지). 기존 기록 문장에서 확인되는 내용만 적고,
 * 기록이 없는 항목은 빈 문자열로 두면 화면에 '기록 보완 예정'으로 표시됩니다.
 * reaction(참여자 반응)·result(확인된 결과)는 실제 후기·자료가 확보된 뒤 운영자가 채웁니다.
 */
export const CASE_DETAILS = {
    'gnu-2026-physics': { purpose: 'AI를 물리 수업과 연구에 활용하는 기준과 방법 세우기', practice: '선생님들의 고민을 모아 정리한 내용에서 출발한 실습 중심 강의', reaction: '', result: '' },
    'toegyewon-2026-claude': { purpose: 'Claude를 처음 접하는 선생님들이 수업과 업무에 활용할 수 있도록 입문하기', practice: '수업 자료 제작과 업무 활용 실습', reaction: '', result: '' },
    'jeonju-2026-literacy': { purpose: '행정 업무에 AI를 안전하게 활용하는 방법 익히기', practice: '', reaction: '', result: '' },
    'jeonju-2026-vibe': { purpose: '코딩 경험이 없어도 AI와 함께 직접 도구를 만들어 보기', practice: '컴퓨터실에서 바이브 코딩 첫 단계 실습', reaction: '', result: '' },
    'khu-2026-vibe': { purpose: '연구와 과제에 필요한 도구를 직접 만들기', practice: 'Claude와 GPT Codex 각각을 활용한 바이브 코딩 실습', reaction: '', result: '' },
    'snu-2025-finetuning': { purpose: '연구 데이터를 활용한 모델 파인튜닝 이해', practice: '파인튜닝의 개념부터 실제 적용까지', reaction: '', result: '' },
    'gyeonggi-2025-hybrid': { purpose: '여러 AI 도구를 목적에 맞게 조합해 쓰는 방법 익히기', practice: '', reaction: '', result: '' },
};
