import re

with open('admin-dashboard.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace CDN link
content = re.sub(
    r'<!-- Supabase JS -->\s*<script src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>',
    '''<!-- Firebase JS -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
        import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
        
        window.initializeApp = initializeApp;
        window.getFirestore = getFirestore;
        window.collection = collection;
        window.getDocs = getDocs;
    </script>''',
    content
)

script_start = content.find('<script>')
script_end = content.rfind('</script>') + len('</script>')

firebase_script = '''<script>
        // Firebase 설정
        const firebaseConfig = {
            projectId: "philosophyaiedumain",
            appId: "1:791707583638:web:b86d59d52a20330baaaeb7",
            storageBucket: "philosophyaiedumain.firebasestorage.app",
            apiKey: "AIzaSyBylDxamogm1_g2URVxGQFz_c05pOWqjEI",
            authDomain: "philosophyaiedumain.firebaseapp.com",
            messagingSenderId: "791707583638",
            measurementId: "G-KWCY47PZWB"
        };

        let app, db;

        // 차트 인스턴스
        let signupChart = null;
        let interestChart = null;

        // 데이터 캐시
        let dashboardData = {
            stats: null,
            users: [],
            companies: [],
            interests: [],
            dailySignups: []
        };

        // 검색 상태
        let searchTerm = '';
        let filteredUsers = [];

        // 초기화
        document.addEventListener('DOMContentLoaded', function() {
            let attempts = 0;
            const initInterval = setInterval(() => {
                if (window.initializeApp) {
                    clearInterval(initInterval);
                    app = window.initializeApp(firebaseConfig);
                    db = window.getFirestore(app);
                    setupEventListeners();
                    loadDashboardData();
                    setInterval(loadDashboardData, 5 * 60 * 1000);
                }
                attempts++;
                if (attempts > 50) {
                    clearInterval(initInterval);
                    showError('Firebase 초기화 실패');
                }
            }, 100);
        });

        function setupEventListeners() {
            document.getElementById('refreshBtn')?.addEventListener('click', loadDashboardData);
            document.getElementById('exportUsersBtn')?.addEventListener('click', exportUsersCSV);
            document.getElementById('exportAllBtn')?.addEventListener('click', exportAllData);
            document.getElementById('userSearch')?.addEventListener('input', handleUserSearch);
        }

        async function loadDashboardData() {
            if (!db) return;
            try {
                updateLastUpdateTime();
                
                const usersRef = window.collection(db, 'users');
                const querySnapshot = await window.getDocs(usersRef);
                
                const users = [];
                let totalMarketing = 0;
                const companyMap = {};
                const interestMap = {};
                const dateMap = {};
                const now = new Date();
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : now;
                    data.created_at = createdAt.toISOString();
                    users.push(data);
                    
                    if (data.marketingAgreed) totalMarketing++;
                    
                    if (data.company) {
                        if (!companyMap[data.company]) companyMap[data.company] = { count: 0, marketing: 0 };
                        companyMap[data.company].count++;
                        if (data.marketingAgreed) companyMap[data.company].marketing++;
                    }
                    
                    if (Array.isArray(data.interests)) {
                        data.interests.forEach(interest => {
                            if (!interestMap[interest]) interestMap[interest] = { count: 0, companies: new Set(), marketing: 0 };
                            interestMap[interest].count++;
                            if (data.company) interestMap[interest].companies.add(data.company);
                            if (data.marketingAgreed) interestMap[interest].marketing++;
                        });
                    }
                    
                    const dateStr = createdAt.toISOString().split('T')[0];
                    if (!dateMap[dateStr]) dateMap[dateStr] = 0;
                    dateMap[dateStr]++;
                });

                users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                const companies = Object.entries(companyMap).map(([name, data]) => ({
                    company_name: name,
                    user_count: data.count,
                    marketing_rate: Math.round((data.marketing / data.count) * 100)
                })).sort((a, b) => b.user_count - a.user_count);

                const interests = Object.entries(interestMap).map(([name, data]) => ({
                    interest: name,
                    user_count: data.count,
                    unique_companies: data.companies.size,
                    marketing_rate: Math.round((data.marketing / data.count) * 100)
                })).sort((a, b) => b.user_count - a.user_count);

                const dailySignups = Object.entries(dateMap).map(([date, count]) => ({
                    date: date,
                    count: count
                })).sort((a, b) => new Date(a.date) - new Date(b.date));

                dashboardData = {
                    stats: {
                        total_users: users.length,
                        new_users_today: dailySignups.length > 0 && dailySignups[dailySignups.length-1].date === now.toISOString().split('T')[0] ? dailySignups[dailySignups.length-1].count : 0,
                        new_users_this_week: 0, // Simplified
                        new_users_this_month: 0, // Simplified
                        marketing_agreed_users: totalMarketing,
                        total_companies: companies.length
                    },
                    users: users,
                    companies: companies,
                    interests: interests,
                    dailySignups: dailySignups
                };

                renderStatsCards();
                renderCharts();
                renderDataTables();
                renderUsersTable();

            } catch (error) {
                console.error('대시보드 데이터 로드 오류:', error);
                showError('데이터 로드 실패: ' + error.message);
            }
        }

        function renderStatsCards() {
            const statsGrid = document.getElementById('statsGrid');
            const stats = dashboardData.stats;

            if (!statsGrid || !stats) return;

            statsGrid.innerHTML = `
                <div class="stat-card">
                    <i class="fas fa-users stat-icon"></i>
                    <span class="stat-number">${stats.total_users}</span>
                    <span class="stat-label">총 가입자</span>
                </div>
                <div class="stat-card">
                    <i class="fas fa-user-plus stat-icon"></i>
                    <span class="stat-number">${stats.new_users_today}</span>
                    <span class="stat-label">오늘 신규 가입</span>
                </div>
                <div class="stat-card">
                    <i class="fas fa-envelope stat-icon"></i>
                    <span class="stat-number">${stats.marketing_agreed_users}</span>
                    <span class="stat-label">마케팅 수신 동의</span>
                </div>
                <div class="stat-card">
                    <i class="fas fa-building stat-icon"></i>
                    <span class="stat-number">${stats.total_companies}</span>
                    <span class="stat-label">등록된 회사/기관</span>
                </div>
            `;
        }

        function renderCharts() {
            const ctxSignup = document.getElementById('signupChart');
            const ctxInterest = document.getElementById('interestChart');

            if (!ctxSignup || !ctxInterest) return;

            // Chart.js defaults
            Chart.defaults.font.family = "'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
            Chart.defaults.color = '#7f8c8d';

            // 1. 가입자 추이 차트
            if (signupChart) signupChart.destroy();
            
            const signupData = dashboardData.dailySignups.slice(-14); // 최근 14일
            
            signupChart = new Chart(ctxSignup, {
                type: 'line',
                data: {
                    labels: signupData.map(d => d.date.substring(5)), // MM-DD
                    datasets: [{
                        label: '신규 가입자',
                        data: signupData.map(d => d.count),
                        borderColor: '#e67e22',
                        backgroundColor: 'rgba(230, 126, 34, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#e67e22',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(44, 62, 80, 0.9)',
                            padding: 12,
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { precision: 0 },
                            grid: { borderDash: [5, 5], color: '#ecf0f1' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });

            // 2. 관심사 분포 차트
            if (interestChart) interestChart.destroy();
            
            const topInterests = dashboardData.interests.slice(0, 5);
            
            interestChart = new Chart(ctxInterest, {
                type: 'doughnut',
                data: {
                    labels: topInterests.map(i => i.interest),
                    datasets: [{
                        data: topInterests.map(i => i.user_count),
                        backgroundColor: [
                            '#e67e22', '#f39c12', '#3498db', '#2ecc71', '#9b59b6'
                        ],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { padding: 20, usePointStyle: true, pointStyle: 'circle' }
                        }
                    }
                }
            });
        }

        function renderDataTables() {
            // 1. 회사별 가입자 테이블
            const companyTable = document.getElementById('companyTable');
            const companyCount = document.getElementById('companyCount');
            const companies = dashboardData.companies.slice(0, 10); // 상위 10개

            if (companyCount) companyCount.textContent = `${dashboardData.companies.length}개`;
            
            if (!companies.length) {
                companyTable.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-light);">데이터가 없습니다.</div>';
            } else {
                companyTable.innerHTML = companies.map((company, index) => `
                    <div class="table-item">
                        <div>
                            <strong>#${index + 1} ${company.company_name}</strong>
                            <div style="font-size: 0.9rem; color: var(--text-light);">
                                마케팅 동의율: ${company.marketing_rate}%
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-weight: 600; color: var(--primary-color);">${company.user_count}명</span>
                        </div>
                    </div>
                `).join('');
            }

            // 2. 관심사 TOP 10 테이블
            const interestTable = document.getElementById('interestTable');
            const interestCount = document.getElementById('interestCount');
            const interests = dashboardData.interests.slice(0, 10);

            if (interestCount) interestCount.textContent = `${dashboardData.interests.length}개`;
            
            if (!interests.length) {
                interestTable.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-light);">데이터가 없습니다.</div>';
            } else {
                interestTable.innerHTML = interests.map((interest, index) => `
                    <div class="table-item">
                        <div>
                            <strong>#${index + 1} ${interest.interest}</strong>
                            <div style="font-size: 0.9rem; color: var(--text-light);">
                                ${interest.unique_companies}개 회사 • 마케팅 동의율: ${interest.marketing_rate}%
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-weight: 600; color: var(--primary-color);">${interest.user_count}명</span>
                        </div>
                    </div>
                `).join('');
            }
        }

        function renderUsersTable() {
            const tbody = document.getElementById('usersTableBody');
            const users = searchTerm ? filteredUsers : dashboardData.users;

            if (!users.length) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-light);">
                            ${searchTerm ? '검색 결과가 없습니다.' : '가입자가 없습니다.'}
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>
                        <img src="${user.profile_image_url || 'https://via.placeholder.com/32'}" 
                             alt="${user.name}" class="user-avatar">
                    </td>
                    <td><strong>${user.name || '이름 없음'}</strong></td>
                    <td style="color: var(--accent-color);">${user.email}</td>
                    <td>${user.company || '미입력'}</td>
                    <td>
                        <div class="interests-tags">
                            ${(user.interests || []).slice(0, 3).map(interest => 
                                `<span class="interest-tag">${interest}</span>`
                            ).join('')}
                            ${(user.interests || []).length > 3 ? 
                                `<span class="interest-tag">+${(user.interests || []).length - 3}</span>` : ''
                            }
                        </div>
                    </td>
                    <td>${new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                    <td>${user.last_login ? new Date(user.last_login).toLocaleDateString('ko-KR') : '없음'}</td>
                    <td>
                        <span class="user-status status-active">
                            활성
                        </span>
                    </td>
                </tr>
            `).join('');
        }

        function handleUserSearch(e) {
            searchTerm = e.target.value.toLowerCase().trim();
            
            if (!searchTerm) {
                filteredUsers = [];
                renderUsersTable();
                return;
            }

            filteredUsers = dashboardData.users.filter(user => 
                (user.name && user.name.toLowerCase().includes(searchTerm)) ||
                (user.email && user.email.toLowerCase().includes(searchTerm)) ||
                (user.company && user.company.toLowerCase().includes(searchTerm))
            );

            renderUsersTable();
        }

        function exportUsersCSV() {
            const users = searchTerm ? filteredUsers : dashboardData.users;
            
            if (!users.length) {
                alert('내보낼 데이터가 없습니다.');
                return;
            }

            const headers = ['이름', '이메일', '전화번호', '회사', '관심사', '마케팅 동의', '가입일'];
            const csvData = [
                headers.join(','),
                ...users.map(user => [
                    `"${user.name || ''}"`,
                    `"${user.email || ''}"`,
                    `"${user.phone || ''}"`,
                    `"${user.company || ''}"`,
                    `"${(user.interests || []).join(', ')}"`,
                    `"${user.marketingAgreed ? '동의' : '비동의'}"`,
                    `"${new Date(user.created_at).toLocaleDateString('ko-KR')}"`
                ].join(','))
            ].join('\\n');

            downloadCSV(csvData, 'philosophy-ai-users');
        }

        function exportAllData() {
            const data = {
                stats: dashboardData.stats,
                users: dashboardData.users,
                companies: dashboardData.companies,
                interests: dashboardData.interests,
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `philosophy-ai-dashboard-${new Date().toISOString().slice(0, 16)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function downloadCSV(csvContent, filename) {
            const BOM = '\\uFEFF';
            const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}-${new Date().toISOString().slice(0, 16)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function updateLastUpdateTime() {
            const element = document.getElementById('lastUpdate');
            if (element) {
                element.textContent = '마지막 업데이트: ' + new Date().toLocaleTimeString('ko-KR');
            }
        }

        function showError(message) {
            console.error(message);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '20px';
            errorDiv.style.right = '20px';
            errorDiv.style.zIndex = '9999';
            errorDiv.style.maxWidth = '400px';
            errorDiv.style.background = '#e74c3c';
            errorDiv.style.color = 'white';
            errorDiv.style.padding = '10px 20px';
            errorDiv.style.borderRadius = '8px';
            errorDiv.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                if (document.body.contains(errorDiv)) {
                    document.body.removeChild(errorDiv);
                }
            }, 5000);
        }
    </script>'''

content = content[:script_start] + firebase_script + '\n</body>\n</html>\n'

with open('admin-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated admin-dashboard.html successfully.')
