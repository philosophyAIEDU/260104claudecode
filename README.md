# Philosophy AI Education — AI 시대, 교육자의 나침반

빠르게 진화하는 AI 시대, 교육자분들이 길을 잃지 않도록 방향을 안내하는 웹사이트입니다.
수업에 바로 쓰는 AI 학습 도구와 엄선된 큐레이션, 그리고 함께 배우는 교육자 커뮤니티를 제공합니다.

## 파일 구조
```
260104claudecode/
├── index.html                    # 메인 랜딩 페이지 (나침반 컨셉)
├── auth-system.html              # 구글 로그인 회원 시스템 (닉네임/소속/이메일/직업 수집)
├── admin-dashboard.html          # 관리자 대시보드 (방문 통계 + GA)
├── firebase-app.html             # Firebase 데모/유틸
├── firestore.rules               # Firestore 보안 규칙 (방문자 카운터 포함)
├── netlify.toml                  # Netlify 배포 + 서버리스 함수 설정
├── netlify/functions/seoul-edu.js # 서울 교육 공공데이터 프록시 (환경변수 키 사용)
├── database-queries.sql          # 데이터베이스 쿼리 모음
└── README.md
```

## 주요 기능 (2026-06 업데이트)
1. **방문자 통계** — 누적/오늘 방문자수를 Firestore(`stats/visitors`, `daily_visits/{날짜}`)에 기록하고
   푸터에 표시. 한 세션당 1회 집계(`sessionStorage`)로 새로고침 중복을 방지합니다.
2. **관리자 애널리틱스** — 관리자(`warmcomfortforyou@gmail.com`) 로그인 시 메인 페이지에
   "방문 통계 & 애널리틱스" 패널이 노출되며, Google Analytics(GA4 `G-KWCY47PZWB`) 바로가기 제공.
3. **회원 가입 정보** — 가입 시 닉네임, 소속(학교·기관), 이메일, 직업(드롭다운, '기타' 직접입력)을 받습니다.
   닉네임·소속은 `leaderboard/{uid}` 문서에도 공개용으로 저장되어 게시판·랭킹에 노출됩니다 (이메일 등 민감정보는 미포함).
4. **서울 교육 공공데이터** — `data.seoul.go.kr` 교육청·학교 통계를 교육자가 보기 쉽게 표로 제공.
   Netlify 서버리스 함수가 환경변수 키로 서버에서 호출(CORS/Mixed-content/키 노출 해결).
5. **좋아요 크레딧 · 레벨 · 랭킹** — 게시글이 좋아요를 받으면 작성자의 `leaderboard/{uid}.likeCredits`가 +1(좋아요 취소 시 -1) 되고,
   크레딧 구간(0/5/15/30/60)에 따라 새싹→성장하는→나침반→등대→마스터 교육자로 레벨이 올라갑니다.
   `community.html` 상단 🏆 랭킹 버튼에서 크레딧 상위 10명(닉네임·소속·레벨)을 확인할 수 있습니다.

### Netlify 환경변수 설정 (서울 공공데이터)
Site settings → Environment variables 에 등록:
- `SEOUL_API_KEY` : data.seoul.go.kr 인증키 (필수)
- `SEOUL_SERVICE` : 교육 데이터셋 서비스명/ID (선택, 미설정 시 기본값 사용)

## 메인 페이지 구성 (index.html)
1. **Hero** — "AI 시대, 교육자의 나침반" 메시지와 CTA. 배지·버튼 모두 **필로소피 AI 툴 → 바이브코딩 쇼케이스** 순으로 우선순위를 두어 첫 화면부터 두 핵심 기능에 집중하도록 구성 (필로소피 AI 툴 · 바이브코딩 쇼케이스 · 카페 · 유튜브 바로가기 버튼)
2. **필로소피 AI 툴** — 직접 만든 AI 학습 도구 (카테고리 탭으로 분류 표시)
   - 언어·독서
     - 영어 사전 — https://philoenglishdictionary.netlify.app
     - AI 독서 코치 — https://philoreading.netlify.app/
     - 문장나무 (문장 분석 학습 앱) — https://philolang.netlify.app/
   - 수학·물리
     - 미분적분 학습 도우미 — https://philomath77.netlify.app
     - AI 뉴턴 역학 학습 도우미 — https://philophysics1.netlify.app/
     - 역학 물리 샌드박스 — https://philophysics2.netlify.app/
   - 과학·자연
     - 알파폴드 학습 도우미 — https://philoalphafold.netlify.app
     - 신체 해부 레이어 뷰어 — https://philoanatomy.netlify.app/
     - 원소 배틀 아레나 (주기율표 학습) — https://philoatom.netlify.app/
     - 지구 속 탐험대 (지구 내부 탐험) — https://philoearth.netlify.app/
     - 먹이사슬 라이브 (생태계 학습) — https://philoeco.netlify.app/
   - 인문·사고력
     - 논문 학습 노트 — https://philoedu.netlify.app
     - 사고력 코치 — https://philofable5.netlify.app
     - AI 토론 메이트 — https://philodiscussion.netlify.app/
     - 단종 이야기 — https://philohistory.netlify.app
   - 진로·AI·게임
     - AI 커리어 코치 — https://philocareer.netlify.app/
     - AI 확률 프롬프트 실험실 — https://philoailab.netlify.app/
     - 바둑·장기·체스 게임 — https://philogo1.netlify.app/
3. **교육자를 위한 바이브코딩 쇼케이스** (`#showcase`) — Firestore `community_posts` 중 `바이브코딩 쇼케이스` 카테고리 최신 6개를 카드로 미리보기 (AI 툴 카드와 동일한 `tool-card` 스타일 재사용). 각 카드는 프로젝트 바로가기 링크와 `community.html?post=ID`로 연결되는 "만든 과정 보기" 링크를 제공하며, 하단 버튼으로 전체 게시판(`community.html`)에서 직접 글쓰기로 이동
4. **교육자를 위한 AI 나침반** — 교육 현장에 유용한 외부 AI 도구 큐레이션
5. **우리가 지키는 방향** — 도구보다 사람 / 비판적 활용 / 함께 배우기
6. **커뮤니티** (`#community`) — 가입한 회원끼리 서로 교류·소통하도록 안내하는 섹션. `community.html` 게시판과 회원가입(`auth-system.html`) 버튼 제공
7. **카페 · 유튜브 안내** — AI 학습 자료·봉사단 소식 등 그 외 이야기는 네이버 카페로, 강의·실습 영상은 유튜브 채널로 자연스럽게 연결하는 배너. 이 사이트 자체는 필로소피 AI 툴과 바이브코딩 쇼케이스에 집중합니다 (스터디 실습 자료용 Padlet 링크는 제외)
8. **문의** — 실시간 검증 문의 폼 (localStorage 저장)
9. **Footer**

## 교육자 커뮤니티 게시판 (community.html)
- Google 로그인 후 수업 사례·질문·자료 공유 글 작성, 댓글, 분류 탭·검색. 본인 글/댓글 및 관리자만 삭제 가능 (Firestore `community_posts` + `comments` 하위 컬렉션)
- 글 작성 시 작성자의 닉네임·소속(`leaderboard/{uid}`에서 조회)이 `authorName`/`authorAffiliation`으로 함께 저장되어 목록·상세에 "닉네임 · 소속" 형태로 표시됩니다
- 부가 기능: 좋아요(`likes` 하위 컬렉션)·인기순 정렬, 내 글 댓글 알림(`notifications`), 게시글/댓글 신고(`reports`, 관리자 대시보드에서 처리), 커뮤니티 규칙 안내, AI 툴 카드 → `community.html?tool=툴이름` 후기 연동, `?post=ID` 딥링크, `?cat=분류명` 분류 필터 딥링크
- 🏆 랭킹 버튼 — 좋아요를 받으면 글 작성자의 크레딧이 오르는 구조를 이용해, `leaderboard` 컬렉션을 크레딧 내림차순으로 조회한 상위 10명을 닉네임·소속·레벨과 함께 모달로 보여줍니다
- **바이브코딩 쇼케이스** — 교육자가 바이브코딩으로 직접 만든 AI 도구를 전시·연구하는 전용 카테고리. 글쓰기 시 프로젝트 URL·사용한 AI 툴(Claude Code, Cursor 등)·제작 스토리(프롬프트, 삽질기, 배포 방법)를 함께 입력하면 목록/상세에서 "프로젝트 보러가기" 버튼과 제작 과정 박스로 노출되고, index.html `#showcase` 섹션에도 최신 글이 미리보기로 노출 (`community_posts` 문서의 `projectUrl`/`aiTool`/`process` 필드)

## 디자인
- 인디고 → 시안 그라데이션의 프로페셔널한 컬러 시스템
- 글래스모피즘 헤더, 반응형 레이아웃, 스크롤 리빌 애니메이션
- Noto Sans KR + Font Awesome 6.5

## 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **인증**: Firebase Authentication (Google OAuth) — 네비게이션 로그인 상태 표시
- **문의 저장**: localStorage (데모용)

## 회원 시스템 (auth-system.html)
- 구글 OAuth 로그인 / 프로필(닉네임·소속·이메일·직업) 입력 / 로그아웃
- 프로필 저장 시 `users/{uid}`(비공개: 이메일·직업 등)와 `leaderboard/{uid}`(공개: 닉네임·소속·좋아요 크레딧)에 함께 기록
- 가입 완료 화면의 "닉네임·소속 수정하기" 링크로 언제든 프로필 재입력 가능
- 메인 페이지 헤더의 로그인 상태와 연동

## 수정 방법
- AI 툴 추가/변경: `index.html`의 `DEFAULT_TOOLS` 배열 편집 (또는 관리자 대시보드에서 Firestore `ai_tools`로 관리, `category` 필드로 분류)
- 큐레이션 추가: `#compass` 섹션 `.curate-card` 편집
- 컬러 변경: `<style>` 상단 `:root` CSS 변수 수정

## 브라우저 지원
Chrome, Firefox, Safari, Edge 및 모바일 브라우저
