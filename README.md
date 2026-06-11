# Philosophy AI Education — AI 시대, 교육자의 나침반

빠르게 진화하는 AI 시대, 교육자분들이 길을 잃지 않도록 방향을 안내하는 웹사이트입니다.
수업에 바로 쓰는 AI 학습 도구와 엄선된 큐레이션, 그리고 함께 배우는 교육자 커뮤니티를 제공합니다.

## 파일 구조
```
260104claudecode/
├── index.html              # 메인 랜딩 페이지 (나침반 컨셉)
├── auth-system.html        # 구글 로그인 회원 시스템
├── admin-dashboard.html    # 관리자 대시보드
├── firebase-app.html       # Firebase 데모/유틸
├── database-queries.sql    # 데이터베이스 쿼리 모음
└── README.md
```

## 메인 페이지 구성 (index.html)
1. **Hero** — "AI 시대, 교육자의 나침반" 메시지와 CTA
2. **교육자분들을 위한 AI 툴** — 직접 만든 4개의 AI 학습 도구
   - 논문 학습 노트 — https://philoedu.netlify.app
   - 사고력 코치 — https://philofable5.netlify.app
   - 영어 사전 — https://philoenglishdictionary.netlify.app
   - 알파폴드 학습 도우미 — https://philoalphafold.netlify.app
3. **교육자를 위한 AI 나침반** — 교육 현장에 유용한 외부 AI 도구 큐레이션
4. **우리가 지키는 방향** — 도구보다 사람 / 비판적 활용 / 함께 배우기
5. **커뮤니티** — AI에 관심 있는 교육자들이 모이는 공간, 스터디 자료 안내
6. **문의** — 실시간 검증 문의 폼 (localStorage 저장)
7. **Footer**

## 디자인
- 인디고 → 시안 그라데이션의 프로페셔널한 컬러 시스템
- 글래스모피즘 헤더, 반응형 레이아웃, 스크롤 리빌 애니메이션
- Noto Sans KR + Font Awesome 6.5

## 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **인증**: Firebase Authentication (Google OAuth) — 네비게이션 로그인 상태 표시
- **문의 저장**: localStorage (데모용)

## 회원 시스템 (auth-system.html)
- 구글 OAuth 로그인 / 프로필 / 로그아웃
- 메인 페이지 헤더의 로그인 상태와 연동

## 수정 방법
- AI 툴 추가/변경: `index.html`의 `#tools` 섹션 `.tool-card` 편집
- 큐레이션 추가: `#compass` 섹션 `.curate-card` 편집
- 컬러 변경: `<style>` 상단 `:root` CSS 변수 수정

## 브라우저 지원
Chrome, Firefox, Safari, Edge 및 모바일 브라우저
