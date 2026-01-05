# Philosophy AI Education 웹사이트 & 회원 시스템

## 프로젝트 개요
Philosophy AI Education의 공식 웹사이트입니다. 회사 소개, 강의 문의, 구글 OAuth 로그인 회원 시스템, 관리자 대시보드까지 포함한 완전한 웹 애플리케이션입니다.

## 파일 구조
```
philosophy-ai-project/
├── index.html              # 메인 랜딩 페이지
├── auth-system.html        # 구글 로그인 회원 시스템
├── admin-dashboard.html    # 관리자 대시보드
├── database-queries.sql    # Supabase 데이터베이스 쿼리 모음
└── README.md              # 프로젝트 문서
```

## 주요 기능

### 🎨 디자인 특징
- 따뜻하고 교육적인 브랜드 컬러 (오렌지/앰버 톤)
- 완전 반응형 디자인 (모바일 우선)
- 부드러운 스크롤 애니메이션
- 프로페셔널한 타이포그래피

### 🏠 메인 랜딩 페이지 (index.html)
1. **Hero** - 회사명 + "AI로 미래를 교육합니다" + CTA 버튼
2. **About** - 회사 소개 (AI 교육 전문성 강조)
3. **Services** - 3가지 서비스 카드
   - Claude 활용 교육
   - 맞춤형 AI 워크샵
   - 기업 교육 프로그램
4. **Why Us** - 3가지 핵심 강점
   - 전문 강사진
   - 체계적 커리큘럼
   - 지속적 지원
5. **Contact** - 실시간 검증 문의 폼
6. **Footer** - 저작권 정보

### 🔐 회원 시스템 (auth-system.html)
- **구글 OAuth 로그인**: 간편한 소셜 로그인
- **사용자 프로필**: 추가 정보 입력 (전화번호, 회사, 관심사)
- **마케팅 동의**: 선택적 마케팅 정보 수신 동의
- **자동 데이터 저장**: Supabase 데이터베이스 연동
- **세션 관리**: 로그인/로그아웃 상태 추적

### 📊 관리자 대시보드 (admin-dashboard.html)
- **실시간 통계**: 가입자 현황, 신규 가입자, 마케팅 동의율
- **시각화 차트**: 가입자 추이, 관심사별 분포 (Chart.js)
- **사용자 관리**: 가입자 목록, 검색, 필터링
- **데이터 분석**: 회사별/관심사별 통계
- **데이터 내보내기**: CSV/JSON 형태로 내보내기
- **자동 새로고침**: 5분마다 데이터 자동 업데이트

### ⚡ 기술 스택
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Auth, Functions)
- **인증**: Google OAuth 2.0
- **데이터 시각화**: Chart.js
- **스타일링**: CSS Grid, Flexbox, CSS Variables
- **보안**: Row Level Security (RLS), SQL Injection 방지

## 설치 및 설정

### 1. Supabase 프로젝트 설정
```bash
# Supabase 프로젝트 URL
https://dpnfgibvpbwsetorhhsn.supabase.co

# 필요한 설정:
1. Google OAuth 설정 (Supabase Dashboard > Authentication > Providers)
2. Redirect URL: https://dpnfgibvpbwsetorhhsn.supabase.co/auth/v1/callback
3. API 키 설정 (auth-system.html, admin-dashboard.html에서 YOUR_SUPABASE_ANON_KEY 교체)
```

### 2. 데이터베이스 설정
```bash
# database-queries.sql 파일의 마이그레이션을 Supabase에서 실행
1. users 테이블
2. user_sessions 테이블  
3. interest_categories 테이블
4. user_activity_logs 테이블
5. RLS 정책
6. 관리자용 뷰 및 함수
```

### 3. Google Cloud Console 설정
```bash
# OAuth 2.0 클라이언트 ID 생성
1. Google Cloud Console > APIs & Services > Credentials
2. OAuth client ID 생성 (Web application)
3. Authorized redirect URIs: https://dpnfgibvpbwsetorhhsn.supabase.co/auth/v1/callback
4. Client ID와 Secret을 Supabase에 설정
```

## 사용법

### 메인 웹사이트
1. `index.html` 파일을 더블클릭하거나 웹서버에 호스팅
2. 우하단 ⚙️ 버튼으로 관리자 패널 접근 가능

### 회원 시스템
1. `auth-system.html` 파일 열기
2. "구글 계정으로 로그인" 버튼 클릭
3. 추가 프로필 정보 입력
4. 자동으로 데이터베이스에 저장

### 관리자 대시보드
1. `admin-dashboard.html` 파일 열기 (관리자 권한 필요)
2. 실시간 가입자 통계 확인
3. 사용자 검색 및 데이터 내보내기

## 수정 및 발전 방법

### 1. 콘텐츠 수정
- `index.html` 파일의 HTML 부분에서 텍스트 내용 변경
- 회사 정보, 서비스 설명, 연락처 정보 등

### 2. 스타일 변경
- `<style>` 태그 내의 CSS 변수 수정:
  ```css
  :root {
      --primary-color: #e67e22;    /* 메인 컬러 */
      --secondary-color: #f39c12;  /* 보조 컬러 */
      /* 기타 색상 변수들... */
  }
  ```

### 3. 새로운 섹션 추가
1. HTML 구조 추가
2. 해당 섹션의 CSS 스타일 추가
3. JavaScript 애니메이션 적용 (필요시)

### 4. 기능 개선
- 서버 연동: LocalStorage 대신 실제 데이터베이스 연결
- 이메일 발송: 문의 폼 제출 시 자동 이메일 발송
- 다국어 지원: 영어/중국어 등 다국어 버전
- SEO 최적화: 메타 태그, 구조화된 데이터 추가

## 브라우저 지원
- Chrome (권장)
- Firefox
- Safari
- Edge
- 모바일 브라우저 전체

## 성능 최적화
- Hardware acceleration (GPU 활용)
- Intersection Observer로 효율적인 애니메이션
- 이미지 최적화 및 lazy loading
- CSS 애니메이션 최적화

## 보안 고려사항
- XSS 방지: HTML 이스케이프 처리
- 클라이언트 사이드 검증 + 서버 사이드 검증 권장
- HTTPS 사용 권장

## 향후 개선 계획
- [ ] 서버 백엔드 연동
- [ ] CMS(콘텐츠 관리 시스템) 도입
- [ ] A/B 테스트 기능
- [ ] 웹 접근성(WCAG) 완전 준수
- [ ] PWA(Progressive Web App) 기능

## 문의
프로젝트 관련 문의는 Philosophy AI Education으로 연락주세요.