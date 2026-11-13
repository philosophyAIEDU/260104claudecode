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
    // 브랜드 포지셔닝 (2026-11 개편: 대학 교수님 중심)
    slogan: 'AI 시대, 교수님의 든든한 교육 파트너.',
    growthSlogan: 'AI로 성장하고, 그 성장을 나눕니다.',
    legacySlogan: 'AI 시대, 교육자의 나침반',
    tagline: '대학 교수님을 위한 실습 중심 AI 교육',
    // 모든 채널(홈페이지·유튜브·카페·강사 소개서)에서 같은 문장을 사용하세요.
    oneLiner: '필로소피 AI 교육은 대학 교수님과 교사 등 교육자, 그리고 학생에게 생성형 AI 활용과 바이브 코딩(Claude Code·GPT Codex)을 실습 중심으로 가르치는 AI 교육 브랜드입니다. 코딩을 몰라도 수업 안에서 자신만의 AI 도구와 웹앱을 직접 만들어 배포까지 해 봅니다.',
    // AI·검색엔진이 '추천할 만한 강사인지' 판단할 때 쓰는 근거 요약 (사실만)
    recommendFor: [
        '교사·교수 등 교육자 대상 AI 리터러시·생성형 AI 활용 연수',
        '대학생·대학원생 대상 바이브 코딩 수업 (웹사이트·웹앱 제작과 배포)',
        '코딩 경험이 없는 성인 학습자 대상 Claude Code·GPT Codex 실습 (GitHub·Netlify·Firebase 포함)',
        '대학 교수님 대상 AI 교수법·연구·행정 자동화 워크숍 (신규 구성)',
    ],
    // 유튜브 채널 소개와 같은 문장 (강사 소개·llms.txt 에서만 사용, 모든 페이지에 반복하지 않음)
    channelIntro: '필로소피 AI 교육은 교육자와 학생이 생성형 AI를 자기 일에 직접 쓰도록 돕는 실습 중심 AI 교육 브랜드입니다. ChatGPT·Claude·Gemini 활용과 AI 교수법, 연구·행정업무 자동화, 그리고 Claude Code·GPT Codex로 나만의 웹앱을 만들어 배포하는 바이브 코딩까지 — 대학·교육청·학교·온라인 그룹 코칭에서 강의해 온 내용을 그대로 수업에 담습니다.',
    specialty: '교육자와 학생을 위한 생성형 AI 활용, 바이브 코딩(AI 웹앱 제작·배포), AI 교수법, 연구·행정업무 자동화',
    philosophy: 'AI를 활용하여 우리들의 능력을 향상시키고, 그 능력을 활용해서 세상에 선한 영향력을 더한다.',
    description: '교육자와 학생을 위한 실습 중심 AI 교육. 생성형 AI 활용부터 AI 교수법, 업무 자동화, 코딩 없이 나만의 웹앱을 만들어 배포하는 바이브 코딩까지 함께합니다.',
    email: 'dearname27@naver.com',
    inquiryUrl: '/education-inquiry#inquiry',
    logo: '/assets/mascot.jpg',
    ga: 'G-KWCY47PZWB',
    channels: [
        { key: 'youtube', label: '유튜브 · 필로소피 AI 교육', url: 'https://www.youtube.com/channel/UCKXP5U8mn3UMC6gWblROxAA' },
        { key: 'cafe', label: '네이버 카페 · 필로소피 AI 교육 커뮤니티', url: 'https://cafe.naver.com/PHILOSOPHYai' },
    ],
    expertise: [
        { title: '교수님을 위한 생성형 AI 활용', desc: 'ChatGPT·Claude·Gemini로 강의자료를 만들고 연구자료를 정리하는 방법을, 결과 검증과 보안까지 함께 다룹니다.' },
        { title: 'AI 시대의 대학 교수법·평가', desc: 'AI를 쓰는 학생을 전제로 과제와 평가 루브릭을 다시 설계하고, 사고력을 기르는 수업 활동을 만듭니다.' },
        { title: '연구·행정업무 자동화', desc: '반복 문서 작업, 보고서 초안, 자료 정리처럼 시간이 드는 일을 AI 워크플로로 줄입니다.' },
        { title: 'Claude Code 바이브 코딩', desc: '코딩을 몰라도 AI와 대화하며 수업용 웹앱을 만들고 GitHub·Netlify로 배포합니다.' },
        { title: '교육용 AI 앱·시스템 제작', desc: '필요에 따라 Firebase 로그인·데이터 저장, AI API 연동까지 직접 만든 교육 도구로 확장합니다.' },
        { title: '교육적 판단과 AI 윤리', desc: '기술적으로 가능한 것과 교육적으로 바람직한 것을 구분하고, 개인정보·저작권·학습 윤리를 함께 다룹니다.' },
    ],
    // 핵심 고객 순서: 1) 대학 교수님 2) 대학 기관 담당자 3) 그 밖의 교육자
    audiences: ['대학 교수님', '초·중·고 교사', '대학생·대학원생 등 학생', '교수학습센터(CTL)·교육청 등 교육기관 담당자', 'AI를 처음 배우는 성인 학습자'],
    publishedToolsNote: '메인 페이지에 공개된 40여 개의 AI 학습 도구',
    updated: '2026-11-09',
};

/**
 * 교육 이력 (education-inquiry.html #history 와 동일한 기록)
 * audience: 기록에 명시된 경우에만 적습니다. 비어 있으면 화면에 표시하지 않습니다.
 * sessions: 같은 날 진행한 강의 주제 수
 */
export const HISTORY = [
    {
        id: 'dongshin-2026-vibe', date: '2026-10', org: '동신대학교', title: '동신대학교 바이브 코딩 수업',
        kind: '대학 수업 특강', subject: '바이브 코딩으로 나만의 웹사이트 만들고 배포하기', audience: '동신대학교 학생',
        desc: '나주 동신대학교에서 학생들과 Antigravity를 활용해 각자 원하는 웹사이트를 만들고 배포하는 과정을 2시간 동안 실습했습니다.',
        tags: ['바이브 코딩', '대학생', '웹사이트 배포'], programs: ['vibe-coding'], categories: ['vibe-coding'],
        photos: [], links: [], sessions: 1, source: '운영자 네이버 카페 기록 (2026.10.16)',
    },
    {
        id: 'permes-2026-codex', date: '2026-10-06', org: '퍼스널메이커스', title: '퍼스널메이커스 이너서클 AI 교육 (GPT·Codex)',
        kind: '온라인 그룹 코칭', subject: 'GPT·Codex로 웹앱 만들기', audience: '퍼스널메이커스 이너서클 참여자 (1인 사업가·크리에이터 등)',
        desc: 'Claude Code 수업에 이어 GPT·Codex로 웹앱을 만드는 온라인 그룹 실습을 진행했습니다. 초기 세팅부터 사이트 완성까지 참여자 한 명 한 명의 진행을 확인하며 도왔습니다.',
        tags: ['GPT Codex', '온라인', '웹앱'], programs: ['vibe-coding'], categories: ['vibe-coding'],
        photos: [], links: [], sessions: 1, source: '참여자 네이버 카페 후기',
    },
    {
        id: 'permes-2026-claudecode', date: '2026-10-02', org: '퍼스널메이커스', title: '퍼스널메이커스 이너서클 AI 교육 (Claude Code)',
        kind: '온라인 그룹 코칭', subject: 'Claude Code로 웹앱 만들기 · GitHub · Netlify · Firebase', audience: '퍼스널메이커스 이너서클 참여자 (1인 사업가·크리에이터 등)',
        desc: 'Zoom으로 진행한 약 3시간의 그룹 실습입니다. Claude 프로젝트 세팅, GitHub 저장소, Netlify 배포, Firebase 구글 로그인 연동까지 참여자가 직접 손으로 해 보며 각자의 웹앱을 만들었습니다.',
        tags: ['Claude Code', 'GitHub', 'Netlify', 'Firebase', '온라인'], programs: ['vibe-coding'], categories: ['vibe-coding'],
        photos: [], links: [], sessions: 1, source: '참여자 네이버 카페 후기',
    },
    {
        id: 'permes-2026-reading', date: '2026-09-17', org: '퍼스널메이커스', title: '퍼스널메이커스 독서챌린지 AI 특강',
        kind: '온라인 특강', subject: 'AI로 나만의 사이트 만들기 (Claude Code 바이브 코딩)', audience: '퍼스널메이커스 독서챌린지 참여자',
        desc: '독서챌린지 참여자를 대상으로 약 1시간 30분 동안 온라인 라이브로 진행한 바이브 코딩 특강입니다. Claude Code로 사이트를 만들고 GitHub 연결과 Netlify 배포까지 실습했습니다.',
        tags: ['Claude Code', '바이브 코딩', '온라인 라이브'], programs: ['vibe-coding'], categories: ['vibe-coding'],
        photos: [], links: [], sessions: 1, source: '참여자 네이버 카페 후기',
    },
    {
        id: 'gnu-2026-physics', date: '2026-07-27', org: '경상국립대학교', title: '경상국립대학교 물리 정교사(1급) 자격 연수',
        kind: '대학·자격연수', subject: 'AI 리터러시 교육', audience: '물리 정교사(1급) 자격연수에 참여한 현직 물리 교사 21명',
        desc: '물리 정교사 1급 자격 연수 과정에서 현직 교사분들과 함께 AI를 수업과 연구에 활용하는 기준과 방법을 다뤘습니다.',
        tags: ['AI 리터러시', '현직 교사', '실습 중심'], programs: ['ai-literacy'], categories: ['teacher-training', 'ai-literacy'],
        photos: [
            { src: '/assets/web/edu-2607-gnu-1.jpg', alt: '경상국립대학교 사범대학 부설교육연수원 2026년 하계 물리 정교사(1급) 자격연수 안내 자료', cap: '자격연수 안내 자료' },
            { src: '/assets/web/edu-2607-gnu-2.jpg', alt: '선생님들의 고민을 정리한 슬라이드로 진행 중인 강의 장면', cap: '선생님들의 고민 나눔' },
        ],
        links: [{ label: '선생님 21명이 만든 물리 학습 앱 아카이브', url: 'https://philoksnu.netlify.app/' }],
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
        tags: ['Claude', 'GPT Codex', '대학원', '바이브 코딩'], programs: ['vibe-coding'], categories: ['vibe-coding'],
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
        tags: ['파인튜닝', '연구실', '심화'], programs: ['special-lecture'], categories: [],
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
 * 대학 AI 교육 프로그램 (A~D). key는 기존 후기 데이터·링크(/programs#key)와 호환되도록 유지합니다.
 * status:
 *  - 'related'  : 같은 주제의 강의를 다른 대상(대학원생·교사·교육청 등)에게 진행한 이력이 있는 프로그램
 *  - 'partial'  : 일부 주제를 다룬 이력이 있고, 대학 교수님용 구성은 새로 설계한 프로그램
 *  - 'proposed' : 신규 제안 프로그램 (같은 주제 진행 이력 없음)
 * ⚠️ 대학 교수님 대상 단독 강의 이력은 아직 공개 기록에 없습니다. 과장하지 마세요.
 * formats 는 '협의 가능 예시'일 뿐 확정된 과정이 아닙니다. 확정되면 운영자가 수정하세요.
 */
export const PROGRAM_DETAILS = [
    {
        key: 'ai-literacy', letter: 'A', status: 'related',
        title: '교수님을 위한 생성형 AI 실무 입문',
        purpose: '생성형 AI를 처음 시작하는 교수님이 강의와 연구에 안전하게 활용하는 기본기를 익힙니다.',
        audience: ['AI를 처음 시작하는 대학 교수님', '강의·연구에 AI 활용을 검토하는 교수님'],
        problem: '강의자료 제작과 연구자료 정리에 시간이 많이 들고, AI를 어디까지 믿고 써도 되는지 판단하기 어렵다.',
        contents: ['ChatGPT·Claude·Gemini의 기본 활용과 차이', '강의자료와 수업 콘텐츠 제작', '연구자료 요약과 정리', '목적에 맞는 프롬프트 작성', '결과 검증, 개인정보와 보안'],
        artifacts: ['교수님 자신의 강의 또는 연구업무에 바로 쓰는 AI 작업 결과물 (예: 강의자료 초안, 문헌 요약 정리표)'],
        prep: ['노트북과 인터넷 환경', '사용할 AI 서비스 계정(무료 계정으로 시작 가능, 기관 정책 확인)', '실습에 쓸 본인 강의자료 또는 공개 가능한 연구자료 1건'],
        formats: ['단기 특강', '실습 워크숍', '여러 회차 과정'],
        fit: 'AI를 아직 업무에 쓰지 않거나, 써 보았지만 결과를 믿기 어려웠던 교수님',
        notFit: '이미 업무에 AI를 깊이 쓰고 있어 도구 제작·자동화가 필요한 경우 (→ 프로그램 C·D)',
    },
    {
        key: 'professor-ai', letter: 'B', status: 'proposed',
        title: 'AI 시대의 대학 교수법·평가 혁신',
        purpose: 'AI를 쓰는 학생을 전제로, 사고 과정을 드러내는 수업 활동과 과제·평가 방식을 설계합니다.',
        audience: ['AI 시대의 수업 운영과 학생 평가를 고민하는 교수님', '교수학습센터(CTL)·교육혁신원 담당자'],
        problem: '학생들이 AI로 과제를 작성하면서 기존 과제와 평가 방식이 학습을 제대로 보여 주지 못한다.',
        contents: ['AI 시대의 대학 교수법', 'AI 활용 과제 설계', '학생의 사고력을 키우는 수업 활동', '평가 루브릭과 피드백', 'AI 윤리와 학습 평가'],
        artifacts: ['AI 시대에 맞게 재설계한 수업 활동 또는 과제·평가 설계안', '과정 중심 평가 루브릭 초안'],
        prep: ['재설계하고 싶은 본인 과목의 과제 또는 평가 계획 1건', '노트북'],
        formats: ['교수법 워크숍', '학과·센터 단위 세미나'],
        fit: 'AI 사용을 막기보다 수업에 녹이고 싶은 교수님, 교수법 연수를 기획하는 기관',
        notFit: '이 주제로 대학 교수님 대상 강의를 진행한 이력은 아직 없습니다. 교사 연수와 대학원 특강 경험을 바탕으로 새로 구성한 프로그램입니다.',
    },
    {
        key: 'vibe-coding', letter: 'C', status: 'related',
        title: '교수님만의 AI 수업 앱 만들기',
        purpose: '코딩을 몰라도 Claude Code와 대화하며 내 수업에 필요한 웹 앱을 직접 만들고 공유합니다.',
        audience: ['직접 AI 교육 도구를 만들어 보고 싶은 교수님', '코딩 경험이 없는 교수님도 참여 가능'],
        problem: '수업에 필요한 도구가 머릿속에 있지만, 개발을 맡길 사람도 예산도 없다.',
        contents: ['바이브 코딩 이해', 'Claude Code 활용', 'GitHub로 코드 관리하기', 'Netlify로 웹 배포하기', '필요에 따라 Firebase·AI API 연동'],
        artifacts: ['교수님이 직접 만든 교육용 웹 앱의 작동 가능한 프로토타입 (인터넷 주소로 공유 가능)'],
        prep: ['노트북', 'GitHub·Netlify 무료 계정', 'Claude Code 사용 환경(유료 요금제 또는 API가 필요할 수 있어 사전 협의)', '만들고 싶은 수업 도구 아이디어 1개'],
        formats: ['실습 워크숍', '여러 회차 프로젝트 과정'],
        fit: '수업용 시뮬레이션·퀴즈·학습 도우미를 직접 만들고 싶은 교수님',
        notFit: '정해진 상용 프로그램 사용법만 빠르게 익히고 싶은 경우 (→ 프로그램 A)',
    },
    {
        key: 'admin-automation', letter: 'D', status: 'partial',
        title: '대학 연구·행정업무 AI 자동화',
        purpose: '반복되는 연구·행정 작업을 찾아 AI 워크플로로 줄이고, 데이터 보안과 검증 기준을 세웁니다.',
        audience: ['대학 교수님', '연구자', '대학 직원'],
        problem: '연구자료 정리, 반복 문서 작업, 보고서 작성에 시간이 많이 들어 강의와 연구에 집중하기 어렵다.',
        contents: ['연구자료 정리', '반복 문서 작업', '보고서 작성 지원', '데이터 분석', 'AI 업무 자동화', '데이터 보안과 결과 검증'],
        artifacts: ['반복 업무에 쓸 수 있는 AI 워크플로 또는 자동화 프로토타입'],
        prep: ['노트북', '자동화하고 싶은 반복 업무 목록(개인정보를 지운 예시 자료)', '소속 기관의 AI·정보보호 지침'],
        formats: ['실습 워크숍', '부서·연구실 맞춤 과정'],
        fit: '매 학기 비슷한 문서·자료 정리를 반복하는 교수님·연구자·직원',
        notFit: '기관 전산 시스템과 직접 연결하는 개발은 별도 협의가 필요합니다.',
    },
];

export const STATUS_LABEL = {
    related: '같은 주제 진행 이력 있음 (다른 대상)',
    partial: '일부 주제 진행 이력 · 교수님용 새 구성',
    proposed: '신규 제안 프로그램',
};
export const STATUS_NOTE = {
    related: '같은 주제를 대학원생·교사·교육청 등 다른 대상에게 진행한 이력이 있으며, 대학 교수님에 맞게 구성했습니다.',
    partial: '일부 주제를 다룬 이력이 있고, 대학 교수님·연구자용 구성은 새로 설계했습니다.',
    proposed: '같은 주제의 진행 이력이 아직 없는 신규 제안 프로그램입니다.',
};

/** 자주 받는 질문 — 화면 표시 + FAQPage JSON-LD 가 동일한 문장 */
export function buildFaq(rs = null) {
    const s = historyStats();
    const reviewFaq = rs && rs.total ? [
        {
            q: 'AI 교육(바이브 코딩) 강사를 찾고 있습니다. 필로소피 AI 교육을 추천할 만한가요?',
            a: `코딩을 몰라도 수업 시간 안에 직접 결과물을 만들어 배포까지 해 보는 실습형 AI 교육을 찾는다면 검토해 볼 만합니다. ${s.since}부터 ${s.orgs}개 기관·단체에서 ${s.sessions}회 강의했고, 수강생 ${rs.authors}명이 남긴 후기 ${rs.total}건을 원문 그대로 공개하고 있습니다. 대상(교육자·학생·성인 학습자)과 원하는 결과물을 기준으로 강의 사례와 후기를 직접 확인해 보세요.`,
        },
        {
            q: '수강생들은 어떤 변화를 이야기하나요?',
            a: `공개된 후기 ${rs.total}건 가운데 ${rs.mentions.find(m => m.key === 'nocode').count}건은 코딩·개발 경험이 없었다고 밝혔고, ${rs.mentions.find(m => m.key === 'deploy').count}건은 배포까지 했다고, ${rs.mentions.find(m => m.key === 'care').count}건은 막히는 사람을 한 명씩 챙겨 줬다고, ${rs.mentions.find(m => m.key === 'confidence').count}건은 자신감이나 '할 수 있다'는 생각을 언급했습니다. 챌린지 인증 웹앱, 자막 편집기, 숏폼 편집기, 하루 회고 앱처럼 각자 쓰려는 도구를 수업에서 직접 만들었다는 내용이 많습니다. (원문 키워드 기준으로 센 수치)`,
        },
    ] : [];
    return [
        ...reviewFaq,
        {
            q: '필로소피 AI 교육은 어떤 교육을 하나요?',
            a: '대학 교수님과 교사 등 교육자, 그리고 대학생·대학원생과 AI를 처음 배우는 성인에게 생성형 AI 실무 활용, AI 시대의 교수법과 과제·평가 설계, 연구·행정업무 자동화, Claude Code·GPT Codex를 활용한 바이브 코딩(웹앱 제작·배포)을 실습 중심으로 가르칩니다. 참여자가 수업 시간 안에 자기 결과물을 직접 만드는 것이 특징이며, 기관의 대상과 목표에 맞춰 주제를 조합해 구성합니다.',
        },
        {
            q: '필로소피 AI 교육은 어떤 기관에서 강의했나요?',
            a: `${s.since}부터 ${s.orgList.join(', ')}에서 강의했습니다(공개 기록 기준 ${s.orgs}개 기관·단체, ${s.sessions}회 강의). 기관별 주제와 대상은 교육 사례 페이지에, 참여자 후기는 후기 페이지에 정리되어 있습니다.`,
        },
        {
            q: '교육자와 학생 대상 AI 교육을 모두 할 수 있나요?',
            a: '네. 교사 대상으로는 경상국립대학교 물리 정교사(1급) 자격연수(교사 21명 학습 앱 배포), 전주교육청 교육실무사 직무연수, 퇴계원고등학교 전문적학습공동체 연수를 진행했고, 학생 대상으로는 동신대학교 학생 바이브 코딩 수업과 경희대학교 대학원 바이브 코딩 특강을 진행했습니다.',
        },
        {
            q: '대학 교수님을 대상으로 강의한 경험이 있나요?',
            a: '대학 교수님만을 대상으로 한 단독 강의는 아직 공개 기록에 없습니다. 경상국립대학교 부설 연수원의 교사 자격연수, 동신대학교 학생 대상 바이브 코딩 수업, 경희대학교 대학원 바이브 코딩 특강, 서울대학교 생산공학연구실 특강 등 대학 현장의 강의 경험을 바탕으로 교수님용 프로그램을 구성했습니다.',
        },
        {
            q: '코딩을 전혀 몰라도 AI 수업 앱 만들기에 참여할 수 있나요?',
            a: '네. 전주교육청 바이브 코딩 입문 수업처럼 코딩 경험이 없는 분들도 AI와 함께 직접 도구를 만들어 보는 첫 단계부터 안내합니다. 실습에는 노트북과 인터넷 환경이 필요하며, 사용할 AI 도구와 계정은 사전에 협의합니다.',
        },
        {
            q: '교육 시간과 운영 방식은 어떻게 정하나요?',
            a: '특강, 실습 워크숍, 여러 회차 과정 등 기관 일정과 목표에 맞춰 협의합니다. 정해진 표준 시간표나 가격표는 두지 않고, 문의 내용을 바탕으로 구성안을 제안드립니다.',
        },
        {
            q: '강의나 연수는 어떻게 문의하나요?',
            a: `교육 문의 페이지(${SITE.origin}/education-inquiry)의 양식으로 기관명, 담당자, 희망 프로그램, 교육 목적을 남겨 주시거나 ${SITE.email}로 메일을 보내 주세요. 확인 후 순차적으로 답변드립니다.`,
        },
        {
            q: '강사의 실명이나 경력은 어디서 확인하나요?',
            a: '필로소피 AI 교육이라는 활동명으로 강의하고 있으며 얼굴과 실명은 공개하지 않습니다. 강의 이력과 현장 사진은 교육 사례 페이지에서 확인하실 수 있습니다.',
        },
    ];
}

/**
 * 교육 사례 보완 정보 (case-studies 페이지). 기존 기록 문장에서 확인되는 내용만 적고,
 * 기록이 없는 항목은 빈 문자열로 두면 화면에 '기록 보완 예정'으로 표시됩니다.
 * reaction(참여자 반응)·result(확인된 결과)는 실제 후기·자료가 확보된 뒤 운영자가 채웁니다.
 */
export const CASE_DETAILS = {
    'gnu-2026-physics': { purpose: 'AI를 물리 수업과 연구에 활용하는 기준과 방법 세우기', practice: '2시간 30분 동안 AI 리터러시와 포스트 AI 시대, NotebookLM·Google AI Studio·Opal을 다룬 뒤, Antigravity로 바이브 코딩하여 물리 학습 앱을 만들고 배포', reaction: '수업을 마친 뒤 재미있었다는 답을 들었습니다 (운영자 기록).', result: '참여한 물리 교사 21명 모두 물리 학습 앱을 배포까지 완료했고, 21개 작품을 아카이브 사이트에 공개했습니다 (운영자 기록).' },
    'dongshin-2026-vibe': { purpose: '학생들이 AI로 원하는 결과물을 직접 만들어 보는 경험', practice: 'Antigravity로 각자 원하는 웹사이트를 만들고 배포 (2시간, 학생 한 명 한 명 옆에서 지원)', reaction: '수업 뒤 집에서 이어서 해 볼 방법을 구체적으로 묻는 학생이 있었습니다 (운영자 기록).', result: '많은 학생이 웹사이트 배포에 성공했습니다 (운영자 기록, 인원 수 미기록).' },
    'permes-2026-codex': { purpose: 'Claude Code에 이어 다른 AI 코딩 도구(GPT·Codex)로도 웹앱을 만드는 흐름 익히기', practice: 'Codex 초기 세팅, GPT로 디자인과 이미지 생성, 사이트에 AI 상담원 추가 등', reaction: '참여자들이 네이버 카페에 남긴 후기 가운데 공개 동의를 받은 글을 후기 페이지에 원문 그대로 옮겼습니다.', reviewsLink: 'vibe-coding', result: '' },
    'permes-2026-claudecode': { purpose: '1인 사업·콘텐츠 운영에 쓸 웹앱을 직접 만들고 관리하는 방법 익히기', practice: 'Claude 프로젝트 세팅 → GitHub 저장소 → Netlify 배포 → Firebase 구글 로그인 연동을 각자 진행, 막힌 부분은 화면 공유로 함께 해결', reaction: '참여자들이 네이버 카페에 남긴 후기 가운데 공개 동의를 받은 글을 후기 페이지에 원문 그대로 옮겼습니다.', reviewsLink: 'vibe-coding', result: '' },
    'permes-2026-reading': { purpose: 'AI를 처음 접하는 분도 첫 웹사이트를 만들어 공개해 보기', practice: 'Claude Code로 사이트 만들기, 제공한 프롬프트 활용, GitHub 연결과 Netlify 배포, 휴대폰으로 이어서 수정하기', reaction: '참여자들이 네이버 카페에 남긴 후기 가운데 공개 동의를 받은 글을 후기 페이지에 원문 그대로 옮겼습니다.', reviewsLink: 'vibe-coding', result: '' },
    'toegyewon-2026-claude': { purpose: 'Claude를 처음 접하는 선생님들이 수업과 업무에 활용할 수 있도록 입문하기', practice: '수업 자료 제작과 업무 활용 실습', reaction: '', result: '' },
    'jeonju-2026-literacy': { purpose: '행정 업무에 AI를 안전하게 활용하는 방법 익히기', practice: '', reaction: '', result: '' },
    'jeonju-2026-vibe': { purpose: '코딩 경험이 없어도 AI와 함께 직접 도구를 만들어 보기', practice: '컴퓨터실에서 바이브 코딩 첫 단계 실습', reaction: '', result: '' },
    'khu-2026-vibe': { purpose: '연구와 과제에 필요한 도구를 직접 만들기', practice: 'Claude와 GPT Codex 각각을 활용한 바이브 코딩 실습', reaction: '', result: '' },
    'snu-2025-finetuning': { purpose: '연구 데이터를 활용한 모델 파인튜닝 이해', practice: '파인튜닝의 개념부터 실제 적용까지', reaction: '', result: '' },
    'gyeonggi-2025-hybrid': { purpose: '여러 AI 도구를 목적에 맞게 조합해 쓰는 방법 익히기', practice: '', reaction: '', result: '' },
};
