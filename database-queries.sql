-- Philosophy AI Education: 핵심 쿼리 모음

-- ======================
-- 1. 전체 가입자 목록 조회
-- ======================
SELECT 
  id,
  email,
  name,
  phone,
  company,
  interests,
  marketing_agreed,
  created_at,
  last_login,
  is_active
FROM users 
ORDER BY created_at DESC;

-- ======================
-- 2. 신규 가입자 통계 (일별)
-- ======================
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as new_users,
  COUNT(CASE WHEN marketing_agreed = true THEN 1 END) as marketing_agreed_users,
  ROUND(
    COUNT(CASE WHEN marketing_agreed = true THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as marketing_agreement_rate
FROM users
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- ======================
-- 3. 신규 가입자 통계 (월별)
-- ======================
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_users,
  COUNT(CASE WHEN marketing_agreed = true THEN 1 END) as marketing_agreed_users,
  COUNT(DISTINCT company) FILTER (WHERE company IS NOT NULL) as unique_companies,
  ROUND(AVG(
    CASE WHEN last_login IS NOT NULL 
    THEN EXTRACT(DAY FROM (last_login - created_at)) 
    END
  ), 2) as avg_days_to_return
FROM users
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- ======================
-- 4. 회사별 가입자 분석
-- ======================
SELECT 
  company,
  COUNT(*) as user_count,
  COUNT(CASE WHEN marketing_agreed = true THEN 1 END) as marketing_agreed_count,
  ROUND(
    COUNT(CASE WHEN marketing_agreed = true THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as marketing_rate,
  MIN(created_at) as first_signup,
  MAX(created_at) as latest_signup,
  COUNT(CASE WHEN last_login >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as active_last_week
FROM users
WHERE company IS NOT NULL AND company != ''
GROUP BY company
HAVING COUNT(*) >= 2  -- 2명 이상 가입한 회사만
ORDER BY user_count DESC;

-- ======================
-- 5. 관심사별 분석
-- ======================
WITH interest_breakdown AS (
  SELECT 
    unnest(interests) as interest,
    u.id,
    u.company,
    u.marketing_agreed,
    u.created_at
  FROM users u
  WHERE interests IS NOT NULL
)
SELECT 
  interest,
  COUNT(*) as user_count,
  COUNT(DISTINCT company) FILTER (WHERE company IS NOT NULL) as unique_companies,
  ROUND(
    COUNT(CASE WHEN marketing_agreed = true THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as marketing_rate,
  ROUND(AVG(
    EXTRACT(DAY FROM (CURRENT_DATE - DATE(created_at)))
  ), 1) as avg_days_since_signup
FROM interest_breakdown
GROUP BY interest
ORDER BY user_count DESC;

-- ======================
-- 6. 가입자 검색 기능
-- ======================
-- 이름이나 이메일로 검색
SELECT 
  id,
  email,
  name,
  phone,
  company,
  interests,
  marketing_agreed,
  created_at,
  last_login
FROM users 
WHERE 
  LOWER(name) LIKE LOWER('%검색어%') 
  OR LOWER(email) LIKE LOWER('%검색어%')
ORDER BY created_at DESC;

-- 회사명으로 검색
SELECT 
  id,
  email,
  name,
  phone,
  company,
  interests,
  marketing_agreed,
  created_at,
  last_login
FROM users 
WHERE LOWER(company) LIKE LOWER('%검색어%')
ORDER BY created_at DESC;

-- 관심사로 검색
SELECT 
  id,
  email,
  name,
  phone,
  company,
  interests,
  marketing_agreed,
  created_at,
  last_login
FROM users 
WHERE interests && ARRAY['철학', 'AI/인공지능']  -- 특정 관심사 포함
ORDER BY created_at DESC;

-- ======================
-- 7. 대시보드용 요약 통계
-- ======================
SELECT 
  'total_users' as metric,
  COUNT(*) as value,
  'current' as period
FROM users
WHERE is_active = true

UNION ALL

SELECT 
  'new_users_today' as metric,
  COUNT(*) as value,
  'today' as period
FROM users
WHERE DATE(created_at) = CURRENT_DATE

UNION ALL

SELECT 
  'new_users_this_week' as metric,
  COUNT(*) as value,
  'this_week' as period
FROM users
WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)

UNION ALL

SELECT 
  'new_users_this_month' as metric,
  COUNT(*) as value,
  'this_month' as period
FROM users
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)

UNION ALL

SELECT 
  'marketing_agreed_users' as metric,
  COUNT(*) as value,
  'current' as period
FROM users
WHERE marketing_agreed = true

UNION ALL

SELECT 
  'active_users_last_week' as metric,
  COUNT(*) as value,
  'last_week' as period
FROM users
WHERE last_login >= CURRENT_DATE - INTERVAL '7 days';

-- ======================
-- 8. 사용자 활동 분석
-- ======================
-- 로그인 빈도 분석
SELECT 
  u.id,
  u.email,
  u.name,
  u.company,
  COUNT(s.id) as total_logins,
  MAX(s.login_time) as last_login,
  MIN(s.login_time) as first_login,
  ROUND(
    COUNT(s.id) * 1.0 / NULLIF(
      EXTRACT(DAY FROM (CURRENT_DATE - DATE(u.created_at))) + 1, 
      0
    ), 
    2
  ) as avg_logins_per_day
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id
GROUP BY u.id, u.email, u.name, u.company, u.created_at
HAVING COUNT(s.id) > 0
ORDER BY total_logins DESC;

-- 시간대별 로그인 패턴
SELECT 
  EXTRACT(HOUR FROM login_time) as hour,
  COUNT(*) as login_count
FROM user_sessions
WHERE login_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY EXTRACT(HOUR FROM login_time)
ORDER BY hour;

-- ======================
-- 9. 관리자용 상세 뷰 생성
-- ======================
CREATE OR REPLACE VIEW admin_user_summary AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.phone,
  u.company,
  u.interests,
  u.marketing_agreed,
  u.created_at,
  u.last_login,
  u.is_active,
  -- 세션 통계
  COUNT(DISTINCT s.id) as total_sessions,
  MAX(s.login_time) as last_session_time,
  -- 활동 통계
  COUNT(DISTINCT al.id) as total_activities,
  -- 가입 후 경과일
  EXTRACT(DAY FROM (CURRENT_DATE - DATE(u.created_at))) as days_since_signup,
  -- 마지막 활동으로부터 경과일
  CASE 
    WHEN u.last_login IS NOT NULL 
    THEN EXTRACT(DAY FROM (CURRENT_DATE - DATE(u.last_login)))
    ELSE NULL 
  END as days_since_last_activity
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id
LEFT JOIN user_activity_logs al ON u.id = al.user_id
GROUP BY u.id, u.email, u.name, u.phone, u.company, u.interests, 
         u.marketing_agreed, u.created_at, u.last_login, u.is_active;

-- ======================
-- 10. 데이터 내보내기용 쿼리
-- ======================
-- CSV 내보내기용 - 기본 사용자 정보
SELECT 
  email as "이메일",
  name as "이름",
  phone as "전화번호",
  company as "회사명",
  array_to_string(interests, ', ') as "관심사",
  CASE WHEN marketing_agreed THEN '동의' ELSE '비동의' END as "마케팅 수신 동의",
  to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as "가입일시",
  CASE 
    WHEN last_login IS NOT NULL 
    THEN to_char(last_login, 'YYYY-MM-DD HH24:MI:SS')
    ELSE '로그인 기록 없음'
  END as "마지막 로그인"
FROM users
WHERE is_active = true
ORDER BY created_at DESC;