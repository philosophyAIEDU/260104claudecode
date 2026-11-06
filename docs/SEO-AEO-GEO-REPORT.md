# 필로소피 AI 교육 홈페이지 고도화 보고서 (SEO · AEO · GEO)

작업일: 2026-11-06 · 브랜치: `claude/bold-archimedes-lu91yu`

> **2026-11-06 변경**: Firebase 무료 요금제 유지를 위해 Storage(이미지 업로드)를 제거했고, AI 정리는 관리자가 화면에 직접 입력한 **Gemini API 키**로 브라우저에서 호출합니다(`gemini-3.8-flash` 기본 / `gemini-3.5-flash-lite`). Anthropic 함수·Netlify 환경변수는 더 이상 필요 없습니다.

목표: 교수·교사·교육기관 담당자가 검색엔진이나 ChatGPT·Claude·Gemini에 “교육자 대상 AI 강사”를 물었을 때,
필로소피 AI 교육을 정확히 설명할 수 있는 **검증 가능한 사실**(누구의 어떤 문제를 어떻게 푸는지 · 실제 강의 이력 · 후기 · 문의 방법)을
사람과 기계가 모두 읽기 쉬운 형태로 배치했습니다. AI 추천은 보장할 수 없으며, 근거를 갖추는 작업입니다.

> 참고 사이트(moonjung.kim, daneedanee.com, shinssaem-ai.netlify.app)와 운영 중인 philosophyaiedu.com은 작업 환경의 네트워크 제한으로
> 접속하지 못했습니다. 정보 구조는 첨부하신 SEO·AEO·GEO 수업 자료의 원칙과 저장소 코드를 근거로 설계했습니다.

---

## 1. 기존 사이트에서 발견한 문제점

| 구분 | 문제 |
| --- | --- |
| 정체성 | 첫 화면이 ‘AI 툴·쇼케이스’ 중심이라 “교육자 대상 AI 강사”라는 사실이 5~10초 안에 드러나지 않음 |
| 강사 정보 | 강사 소개·전문 분야·교육 대상·차별점을 한곳에 정리한 페이지 없음. 교육 이력은 문의 페이지 안에만 있음 |
| 프로그램 | 교육 주제 4개가 짧은 카드뿐 — 대상·고민·내용·결과물·관련 이력이 없음 |
| 후기 | 커뮤니티 게시판 ‘강연 후기’ 카테고리만 존재. 고유 URL·공개 동의 관리·원문/요약 구분 없음, JS 실행 전엔 내용이 보이지 않음 |
| 기술 SEO | `robots.txt`·`sitemap.xml`·canonical·구조화 데이터(JSON-LD)·og:url/og:image 없음 |
| 색인 | 관리자 페이지 일부(admin-dashboard, contents-admin)에 noindex 없음 |
| 수치 | 문의 페이지 ‘교육 기관·기업 7곳’ — 공개된 기록에서 계산하면 **6개 기관**(경상국립대·퇴계원고·전주교육청·경희대·서울대·경기도청). 6곳으로 수정 |
| 측정 | 문의 클릭·제출 이벤트, 유입 경로 질문 없음 |
| 기타 | 배포 폴더가 저장소 전체(`.`)라 개발 파일도 공개됨. `index.html`에 Cloudflare 이메일 보호 스크립트(`/cdn-cgi/...`) 흔적이 남아 404 요청 발생(기존 코드, 이번에 손대지 않음) |

## 2. 실제 수정·추가한 파일

**기존 파일 수정 (기능 유지, 추가 위주)**
- `index.html` — title/description/canonical/OG, Organization·WebSite JSON-LD, 내비(강사 소개·교육 프로그램·후기 추가), 히어로 문구·핵심 키워드·CTA 교체(“AI 시대, 교육자의 나침반” 유지), 히어로 아래 **대표 강의 이력·전문 분야·문의·대표 후기** 섹션, CTA 클릭 GA 이벤트. AI 툴·쇼케이스·커뮤니티·방문 통계·관리자 영역은 그대로
- `education-inquiry.html` — canonical·JSON-LD, 내비/푸터 링크, **“필로소피 AI 교육을 어떻게 알게 되셨나요?”**(선택), `?topic=` 주제 자동 선택, 주제 2개 추가, GA `inquiry_submit` 이벤트(유입 경로·주제만, 개인정보 미전송), 기관 수 6곳, 후기 아카이브 우선 표시(없으면 기존 ‘강연 후기’ 미리보기 그대로)
- `admin-dashboard.html` — **후기 관리** 섹션(후기 간편 등록 링크 + 게시/임시/비공개/동의 전/대표 집계)
- `firestore.rules` — `reviews`, `review_private` 규칙 추가 (기존 규칙 변경 없음)
- `firebase.json` — 호스팅 제외 목록에 개발 파일 추가
- `netlify.toml` — 관리자 페이지 `X-Robots-Tag: noindex`, `/reviews`·`/reviews/:slug`·`/sitemap.xml` 함수 연결, `node_modules`·`tests` 비공개

**새 파일**
- 공개 페이지: `ai-instructor.html`(/ai-instructor), `programs.html`(/programs), `case-studies.html`(/case-studies), `insights/index.html` + 칼럼 4편, `reviews.html`(함수가 없는 호스팅용 대체), `404.html`
- 관리자: `reviews-admin.html` (후기 간편 등록 · 목록 · 일괄 가져오기/내보내기 · 후기 요청 가이드)
- Netlify 함수: `netlify/functions/reviews.mjs`(후기 SSR), `sitemap.mjs`
- AI 정리: `assets/js/gemini-review.mjs` (Gemini API, 관리자 브라우저에서 호출 — 키는 관리자 입력)
- 공용 모듈: `assets/js/review-core.mjs`(렌더링·XSS 방어·중복 감지·CSV/JSON·검증), `assets/js/firestore-public.mjs`(공개 후기 읽기), `assets/js/*-reviews*.m?js`
- 사실 데이터·생성기: `src/site/data.mjs`(브랜드 소개·이력·프로그램·FAQ의 단일 출처), `insights.mjs`, `pages.mjs`, `layout.mjs`, `seo.mjs`, `scripts/build-pages.mjs`
- `robots.txt`, `sitemap.xml`(대체용), `llms.txt`, `assets/site.css`, `assets/review-cards.css`, `assets/site.js`
- 테스트: `tests/unit`, `tests/e2e`, `tests/rules` · 문서: `docs/reviews-admin-guide.md`, 이 보고서, `docs/screenshots/`

## 3. SEO · AEO · GEO 개선 내용

**SEO (서가에 책 꽂기)**
- 페이지별 고유 title·description·canonical·OG·`lang="ko"`, 페이지당 H1 1개, H2/H3 계층 (E2E로 검증)
- `robots.txt`(공개 전체 허용, 관리자·내부 경로 차단), `sitemap.xml`(정적 페이지 + **게시된 후기 URL을 실시간 포함**)
- 후기 목록·상세를 **서버에서 완성된 HTML로 렌더링** → JS를 실행하지 않는 크롤러도 후기 원문을 읽음. 이미지 후기도 반드시 텍스트와 함께 출력
- 모든 이미지 alt, 실제 강의 사진에는 “실제 강의 현장 사진”, 캐릭터에는 “캐릭터 일러스트” 표기 (AI 생성 일러스트와 실제 사진 구분)
- 모바일 390px에서 가로 넘침 없음(E2E 검증), 새 페이지는 프레임워크 없는 정적 HTML이라 가벼움, 이미지 lazy-load·크기 지정

**AEO (안내 직원이 한 구절 읽어 주기)**
- 각 페이지 상단에 **한 문단 직접 답변**(answer box)
- 칼럼 4편: 실제 질문을 제목으로, 첫 문단 즉답, **질문형 소제목 + 바로 아래 한 문장 답**, 현장 사례(기록된 강의만), 주의할 점·한계, 관련 프로그램·사례·영상, 작성자·작성일·수정일, 같은 주제 글 연결
- FAQ 7문항(화면 표시 = FAQPage JSON-LD 동일 문장)

**GEO (사정을 듣고 추천)**
- **소개 한 줄 통일**: `src/site/data.mjs`의 `oneLiner`를 홈페이지·강사 소개·푸터·JSON-LD·llms.txt가 같은 문장으로 사용 → 유튜브·카페 소개란에도 같은 문장 사용 권장
  > 필로소피 AI 교육은 초·중·고 교사와 대학 교수 등 교육자를 대상으로 생성형 AI 리터러시, 바이브 코딩(Claude Code·GPT Codex), 교육 업무 자동화를 실습 중심으로 가르치는 AI 교육 브랜드입니다.
- **비교할 기준·솔직한 비교**: 강사 소개·프로그램마다 “잘 맞는 경우 / 다른 선택이 나은 경우”, 프로그램마다 *진행 이력 있음 / 일부 진행·확장 제안 / 신규 제안* 구분
- **남의 말로 확인**: 후기 아카이브(원문 보존·동의 관리·고민→실습→변화 구조)
- **사례는 같은 형식**: 기관별 사례 8개 질문 형식 통일, 기록 없는 항목은 “기록 보완 예정”
- **외부 기록 연결**: Organization `sameAs`(유튜브·네이버 카페), 공식 채널 섹션, 강의 사진·연수용 웹앱 링크
- `llms.txt`: 사실 요약을 텍스트로 제공(이것만으로 추천이 개선된다고 가정하지 않음)
- 서비스 안내는 `/programs` 한 페이지가 기준, 다른 페이지는 링크

**구조화 데이터 (실재하는 정보만)**: Organization(+sameAs, knowsAbout), WebSite, BreadcrumbList, ProfilePage, FAQPage, Course(4개, 제공자·대상·가르치는 내용), Article(칼럼), ItemList(사례), ContactPage.
만들지 않은 것: Person(실명 비공개), Event(예정 행사 정보 없음), Review·AggregateRating(평점·후기 리치결과는 자기 홍보성 후기에 부적절하고 허위 위험).

## 4. 강사 프로필·브랜드 정체성 개선
- `/ai-instructor`: 활동명·전문 분야·대상·문의, 캐릭터 프로필 이미지(얼굴 사진 없음), **담당자용 6문답 요약**(무엇을/누구에게/실제 경험/결과물/후기/문의), 전문 분야 6개, 강의 이력 7건(8회·6개 기관 — 기록에서 계산), “도구 사용법 vs 직접 시스템을 만드는 교육” 비교, 적합성, 교육 철학·봉사단, FAQ, 공식 채널, 상·하단 문의 버튼(기존 문의 폼으로만 연결)
- 실명·학력·직위는 쓰지 않았습니다. 대학 교수 대상 단독 강의 이력이 없다는 점을 FAQ·프로그램에 솔직하게 명시했습니다.

## 5. 후기 등록 방법 · 6. 네이버 카페 후기 이전 방법
→ **[docs/reviews-admin-guide.md](reviews-admin-guide.md)** 참고. 요약:
카페 글 복사 → `reviews-admin.html`에 붙여넣기(문단·줄바꿈 유지, 텍스트만 저장) → Gemini로 정리(근거 문장 하이라이트, 근거 없는 항목은 ‘언급 없음’) →
원문과 비교·수정 → 공개 동의 확인 → 미리보기 → 홈페이지에 게시(`/reviews/<고유주소>`). 여러 건은 CSV/JSON으로 임시저장 후 하나씩 검토.

AI 환각 방지 장치: ① 항목마다 원문 근거 문장 요구 → ② 서버가 근거가 원문에 실제로 있는지 확인, 없으면 ‘언급 없음’으로 되돌리고 경고 → ③ 결과는 초안으로만 채움 → ④ 동의 확인 전 게시 불가(서버 규칙) → ⑤ AI 초안은 비공개 문서에 별도 보관, 공개 문서엔 `summaryOrigin`(manual/ai/ai_edited)만 기록.

## 7. Firebase 관련 변경
- **Firestore** `reviews` (공개 읽기 = `status=='published' && consentStatus=='confirmed'`만, 쓰기 = 관리자만, 필드·길이·URL·슬러그 형식 검증, 동의 전 게시 금지) / `review_private` (관리자만 읽기·쓰기 — 실명·연락처·원 소속·동의 기록·메모·AI 초안)
- **Storage는 사용하지 않습니다** (무료 Spark 요금제 그대로). 후기는 텍스트만 저장합니다.
- 기존 컬렉션·규칙·데이터·관리자 계정·인증 방식 변경 없음. 데이터 이전·삭제 없음(기존 ‘강연 후기’ 글은 복사만 가능)
- 새 인덱스 불필요(등호 조건 쿼리만 사용)
- **배포 필요**: `firebase deploy --only firestore:rules`

## 8. 테스트 결과 (모두 통과)

| 테스트 | 명령 | 결과 |
| --- | --- | --- |
| 단위 (렌더링·XSS·중복·CSV/JSON·Gemini 요청/오류/환각 방지·SSR·사이트맵) | `npm test` | **23/23** |
| 보안 규칙 (Firestore 에뮬레이터) | `cd tests/rules && npm install && npm test` | **8/8** |
| 브라우저 E2E (Playwright, 가짜 Firebase·가짜 Gemini) | `npm run test:e2e` | **42/42** |

요청하신 11개 상황: ① 텍스트 붙여넣기 ② 긴 글·여러 문단(30+문단, 줄바꿈 보존) ③ AI 정리 결과 생성(근거 하이라이트) ④ AI 미설정 시 수동 등록·게시 ⑤ 수정·임시 저장 ⑥ 사진이 섞인 붙여넣기(텍스트만 저장·안내 — 이미지 기능은 요청에 따라 제거) ⑦ 홈페이지 게시(목록·고유 URL·메인 대표 후기) ⑧ 비공개 전환(404) ⑨ 중복 감지(같은 URL 모바일/PC·유사 원문, CSV 일괄 중복) ⑩ 모바일 관리자 화면 ⑪ 관리자 이외 사용자 차단(화면·Firestore 규칙). 추가: Gemini 키 미입력·잘못된 키 안내, 키 기억/삭제, 키가 DB에 저장되지 않음 — **모두 통과**.

추가로 확인: 공개 9개 페이지 200·lang·title·description·H1·JSON-LD 유효·alt, 기존 메인 섹션 유지, 기존 관리자 대시보드 정상 로드, 기존 규칙 회귀(커뮤니티 글쓰기·강연 후기 관리자 전용·ai_tools·지식 공간), robots·sitemap·noindex.

**한계**: 실제 Firebase 로그인·실제 Gemini API·Netlify 배포 환경에서는 실행하지 못했습니다(작업 환경 제약). Gemini 요청 형식(`v1beta/models/{모델}:generateContent`, `x-goog-api-key`, `responseJsonSchema`)은 공개 API 형식을 따랐고, 모델이 JSON 스키마 지정을 거부하면 스키마를 프롬프트에 넣어 자동 재시도합니다. 모델 이름(`gemini-3.8-flash`, `gemini-3.5-flash-lite`)은 요청하신 이름을 그대로 넣었으며, 실제로 없는 이름이면 ‘모델을 찾을 수 없습니다’ 안내가 뜨니 ‘직접 입력…’으로 바꿔 주세요. 배포 후 실제 키로 1회 시험해 주세요.

## 9. 검색엔진 등록에 필요한 추가 작업 (운영자)
1. 브랜치 검토 후 배포 → `https://philosophyaiedu.com/robots.txt`, `/sitemap.xml`, `/reviews` 응답 확인
2. **Google Search Console**: 도메인 속성 추가(DNS TXT 인증) → Sitemaps에 `https://philosophyaiedu.com/sitemap.xml` 제출 → URL 검사로 `/ai-instructor`, `/programs` 색인 요청
3. **네이버 서치어드바이저**: 사이트 등록(HTML 메타태그 인증 시 `<meta name="naver-site-verification" ...>`을 `index.html` head에 추가) → 사이트맵 제출 → 웹 페이지 수집 요청
4. 리치 결과 테스트(search.google.com/test/rich-results)로 각 페이지 구조화 데이터 확인
5. **채널 소개 통일**: 유튜브 채널 정보·네이버 카페 소개에 위 ‘소개 한 줄’과 홈페이지 링크(`/ai-instructor`)를 같은 날 반영. 영상 설명란에 관련 칼럼·프로그램 링크
6. GA4에서 이벤트 `cta_inquiry_click`, `cta_instructor_click`, `inquiry_submit`(파라미터 `referral_source`)를 맞춤 측정기준·주요 이벤트로 등록
7. Firebase 규칙 배포(`firebase deploy --only firestore:rules`), Gemini API 키 발급 후 후기 관리 화면에 입력

### 성과 측정 · 월 1회 점검 루틴
- GA4: 검색 유입(소스/매체 google·naver organic), `/ai-instructor`·`/programs`·`/reviews` 페이지뷰, CTA 클릭, `inquiry_submit`의 `referral_source` 분포
- 실제 문의: 메일로 받은 문의의 ‘알게 된 경로’ 항목 집계
- AI 설명 점검(수동, 결과는 메모로만 기록 — 관리자 화면에 ‘AI 추천 순위’ 같은 검증되지 않은 지표는 만들지 않았습니다):
  - 추천 질문: “교사 대상 바이브 코딩 강사를 찾고 있어요”, “대학 교수 대상 생성형 AI 특강 강사 추천해 주세요”
  - 비교 질문: “필로소피 AI 교육과 ○○를 비교해 주세요”
  - 이름 질문: “필로소피 AI 교육은 어떤 교육자에게 맞나요?”, “어떤 기관에서 강의했나요?”
  - 틀린 설명이 나오면 해당 사실을 담은 페이지(`data.mjs`)를 보강

## 10. 추후 개선이 필요한 사항
- **운영자 확인 필요 문구**: FAQ의 “실습에는 노트북과 인터넷 환경 필요, 도구·계정은 사전 협의”, “섭외에 필요한 강사 정보는 문의 시 안내”, 프로그램별 *제안* 커리큘럼·기대 결과·결과물 예시, 칼럼 4편 본문(일반적 조언 부분). 사실과 다르면 `src/site/data.mjs`·`insights.mjs` 수정 후 `npm run build:pages`
- 사례 페이지의 ‘참여 대상(경기도청·전주 바이브 코딩)’, ‘실습 내용’, ‘참여자 반응’, ‘확인된 결과’ — 자료가 생기면 `CASE_DETAILS`에 입력
- 툴 목록의 “2026 HTHT 대학 컨소시엄 하계 교직원 역량 강화 직무연수” 웹앱이 실제 강의라면 교육 이력에 추가(현재 근거 기록이 없어 넣지 않음)
- 유튜브 구독자·카페 회원 수는 공식 수치를 확인할 수 없어 표시하지 않았습니다
- 강의 사례·프로그램·칼럼·사진·외부 링크·공개 통계의 **관리자 화면 편집**: 현재는 `src/site/*.mjs` 데이터 수정 + 생성 스크립트 방식(모든 페이지·JSON-LD·llms.txt가 같은 사실로 갱신). 후기와 같은 Firestore + SSR 방식으로 확장 가능
- GitHub 등 다른 공식 채널이 있으면 `SITE.channels`에 추가(sameAs)
- 기존 페이지들의 인라인 CSS·스크립트 정리, `index.html`의 `/cdn-cgi/...` 스크립트 제거 검토, 배포 폴더를 공개 파일만 담은 폴더로 분리
- Netlify 함수 콜드스타트·Firestore 장애 시 `/reviews`는 정적 대체 화면으로 자동 전환됨(빈 목록 → 브라우저가 다시 읽음)
