import re

with open('auth-system.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace Supabase CDN with Firebase modules
content = re.sub(
    r'<!-- Supabase JS -->\s*<script src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>',
    '''<!-- Firebase JS (모듈형) -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
        
        window.initializeApp = initializeApp;
        window.getAuth = getAuth;
        window.signInWithPopup = signInWithPopup;
        window.GoogleAuthProvider = GoogleAuthProvider;
        window.signOut = signOut;
        window.onAuthStateChanged = onAuthStateChanged;
        window.getFirestore = getFirestore;
        window.doc = doc;
        window.getDoc = getDoc;
        window.setDoc = setDoc;
        window.serverTimestamp = serverTimestamp;
        window.collection = collection;
        window.getDocs = getDocs;
        window.query = query;
        window.orderBy = orderBy;
        window.limit = limit;
    </script>''',
    content
)

# 2. Replace the main script tag with Firebase logic
script_start = content.find('<script>')
script_end = content.rfind('</script>') + len('</script>')

firebase_script = '''<script>
        // Firebase 설정 (philosophyaiedumain 프로젝트)
        const firebaseConfig = {
            projectId: "philosophyaiedumain",
            appId: "1:791707583638:web:b86d59d52a20330baaaeb7",
            storageBucket: "philosophyaiedumain.firebasestorage.app",
            apiKey: "AIzaSyBylDxamogm1_g2URVxGQFz_c05pOWqjEI",
            authDomain: "philosophyaiedumain.firebaseapp.com",
            messagingSenderId: "791707583638",
            measurementId: "G-KWCY47PZWB"
        };

        let app, auth, db;
        
        // DOM 요소들
        const authSection = document.getElementById('authSection');
        const profileForm = document.getElementById('profileForm');
        const adminDashboard = document.getElementById('adminDashboard');
        const userInfo = document.getElementById('userInfo');
        const loginSection = document.getElementById('loginSection');
        const authMessage = document.getElementById('authMessage');
        const authError = document.getElementById('authError');

        let currentUser = null;

        const interestCategories = [
            '철학', 'AI/인공지능', '교육학', '심리학', '사회학', 
            '정치학', '경제학', '과학철학', '윤리학', '미학'
        ];

        document.addEventListener('DOMContentLoaded', function() {
            // Firebase 로드가 완료될 때까지 대기 (모듈이 글로벌 윈도우에 바인딩됨)
            let attempts = 0;
            const initInterval = setInterval(() => {
                if (window.initializeApp) {
                    clearInterval(initInterval);
                    app = window.initializeApp(firebaseConfig);
                    auth = window.getAuth(app);
                    db = window.getFirestore(app);
                    setupEventListeners();
                    loadInterestCategories();
                    
                    window.onAuthStateChanged(auth, (user) => {
                        handleAuthStateChange(user);
                    });
                }
                attempts++;
                if (attempts > 50) { // 5초
                    clearInterval(initInterval);
                    showError('Firebase 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
                }
            }, 100);
        });

        function setupEventListeners() {
            document.getElementById('googleLogin')?.addEventListener('click', handleGoogleLogin);
            document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleLogin);
            document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
            document.getElementById('userProfileForm')?.addEventListener('submit', handleProfileSubmit);
        }

        function loadInterestCategories() {
            const container = document.getElementById('interestsContainer');
            if (!container) return;

            container.innerHTML = interestCategories.map(category => `
                <label class="interest-chip">
                    <input type="checkbox" name="interests" value="${category}" style="display: none;">
                    ${category}
                </label>
            `).join('');

            container.querySelectorAll('.interest-chip').forEach(chip => {
                chip.addEventListener('click', function(e) {
                    if (e.target.tagName === 'INPUT') return;
                    const checkbox = this.querySelector('input');
                    checkbox.checked = !checkbox.checked;
                    this.classList.toggle('selected', checkbox.checked);
                });
            });
        }

        async function handleGoogleLogin() {
            if (!auth) return;
            try {
                const provider = new window.GoogleAuthProvider();
                await window.signInWithPopup(auth, provider);
            } catch (error) {
                console.error('로그인 에러:', error);
                showError('로그인 중 오류가 발생했습니다.');
            }
        }

        async function handleLogout() {
            if (!auth) return;
            try {
                await window.signOut(auth);
                currentUser = null;
                showLoginScreen();
            } catch (error) {
                console.error('로그아웃 에러:', error);
            }
        }

        async function handleAuthStateChange(user) {
            if (user) {
                currentUser = user;
                updateUserInfo(user);
                await checkUser(user);
            } else {
                currentUser = null;
                showLoginScreen();
            }
        }

        async function checkUser(user) {
            try {
                // Check if admin
                if (user.email === 'admin@example.com' || user.email === 'hwangeu@gmail.com') {
                    await showAdminDashboard();
                    return;
                }

                const docRef = window.doc(db, 'users', user.uid);
                const docSnap = await window.getDoc(docRef);

                if (docSnap.exists() && docSnap.data().profileCompleted) {
                    showWelcomeScreen(docSnap.data());
                } else {
                    showProfileForm(user);
                }
            } catch (error) {
                console.error('사용자 확인 오류:', error);
                showError('사용자 정보를 확인하는 중 오류가 발생했습니다.');
            }
        }

        async function handleProfileSubmit(e) {
            e.preventDefault();
            if (!currentUser) return;

            const submitBtn = document.getElementById('profileSubmitBtn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="spinner"></div> 처리 중...';

            try {
                const formData = new FormData(e.target);
                const interests = Array.from(formData.getAll('interests'));
                
                if (interests.length === 0) {
                    throw new Error('최소 한 개의 관심사를 선택해주세요.');
                }

                const profileData = {
                    name: currentUser.displayName,
                    email: currentUser.email,
                    phone: formData.get('phone'),
                    company: formData.get('company'),
                    interests: interests,
                    marketingAgreed: formData.get('marketingAgreed') === 'on',
                    profileCompleted: true,
                    updatedAt: window.serverTimestamp()
                };

                // Create document only if it doesn't exist, else merge
                const userRef = window.doc(db, 'users', currentUser.uid);
                const docSnap = await window.getDoc(userRef);
                
                if (!docSnap.exists()) {
                    profileData.createdAt = window.serverTimestamp();
                }
                
                await window.setDoc(userRef, profileData, { merge: true });

                showMessage('프로필이 성공적으로 저장되었습니다.', 'profileMessage');
                setTimeout(() => showWelcomeScreen(profileData), 1500);

            } catch (error) {
                console.error('프로필 저장 오류:', error);
                showError(error.message, 'profileError');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '프로필 저장하기';
            }
        }

        async function showAdminDashboard() {
            if (!db) return;
            try {
                hideAllScreens();
                adminDashboard.style.display = 'block';
                
                const usersRef = window.collection(db, 'users');
                const q = window.query(usersRef, window.orderBy('createdAt', 'desc'), window.limit(20));
                const querySnapshot = await window.getDocs(q);
                
                let users = [];
                let totalMarketing = 0;
                
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    users.push(data);
                    if (data.marketingAgreed) totalMarketing++;
                });

                const stats = {
                    total_users: users.length, // 간이 통계
                    new_users_today: 0,
                    new_users_this_week: 0,
                    new_users_this_month: 0,
                    marketing_agreed_users: totalMarketing,
                    total_companies: new Set(users.map(u => u.company).filter(c => c)).size
                };

                renderStatsCards(stats);
                renderUsersList(users);

            } catch (error) {
                console.error('대시보드 로드 오류:', error);
                showError('대시보드를 로드할 수 없습니다: ' + error.message);
            }
        }

        function renderStatsCards(stats) {
            const statsGrid = document.getElementById('statsGrid');
            if (!statsGrid || !stats) return;

            const statsCards = [
                { label: '최근 가입자', value: stats.total_users, icon: 'fas fa-users' },
                { label: '마케팅 동의', value: stats.marketing_agreed_users, icon: 'fas fa-envelope' },
                { label: '등록 회사', value: stats.total_companies, icon: 'fas fa-building' }
            ];

            statsGrid.innerHTML = statsCards.map(stat => `
                <div class="stat-card">
                    <i class="${stat.icon}" style="color: var(--primary-color); font-size: 2rem; margin-bottom: 1rem;"></i>
                    <span class="stat-number">${stat.value || 0}</span>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');
        }

        function renderUsersList(users) {
            const usersList = document.getElementById('usersList');
            if (!usersList) return;

            if (!users || users.length === 0) {
                usersList.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-light);">아직 가입자가 없습니다.</div>';
                return;
            }

            usersList.innerHTML = users.map(user => `
                <div class="user-item">
                    <div>
                        <div class="user-email">${user.email || '이메일 없음'}</div>
                        <div style="font-weight: 600; color: var(--text-dark);">${user.name || '이름 없음'}</div>
                    </div>
                    <div>
                        <div class="user-company">${user.company || '미입력'}</div>
                        <div class="user-interests">${Array.isArray(user.interests) ? user.interests.join(', ') : '미입력'}</div>
                    </div>
                    <div class="user-date">${user.createdAt ? new Date(user.createdAt.toDate ? user.createdAt.toDate() : user.createdAt).toLocaleDateString('ko-KR') : '날짜 없음'}</div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.9rem; color: var(--text-light);">
                            ${user.marketingAgreed ? '마케팅 동의' : '마케팅 비동의'}
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function showLoginScreen() {
            hideAllScreens();
            authSection.style.display = 'block';
            userInfo.style.display = 'none';
            loginSection.style.display = 'block';
        }

        function showProfileForm(user) {
            hideAllScreens();
            profileForm.style.display = 'block';
            userInfo.style.display = 'flex';
            loginSection.style.display = 'none';
        }

        function showWelcomeScreen(profile) {
            hideAllScreens();
            authSection.style.display = 'block';
            authSection.innerHTML = `
                <h1 class="auth-title">환영합니다, ${profile.name}님!</h1>
                <p class="auth-subtitle">로그인이 완료되었습니다.<br>곧 Philosophy AI Education의 최신 소식을 받아보실 수 있습니다.</p>
                <div style="margin-top: 2rem;">
                    <a href="/" style="color: var(--primary-color); text-decoration: none;">← 메인 페이지로 돌아가기</a>
                </div>
            `;
            userInfo.style.display = 'flex';
            loginSection.style.display = 'none';
        }

        function hideAllScreens() {
            authSection.style.display = 'none';
            profileForm.style.display = 'none';
            adminDashboard.style.display = 'none';
        }

        function updateUserInfo(user) {
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');

            if (userAvatar && user.photoURL) {
                userAvatar.src = user.photoURL;
                userAvatar.alt = user.displayName || user.email;
            }

            if (userName) {
                userName.textContent = user.displayName || user.email.split('@')[0];
            }
        }

        function showMessage(message, elementId = 'authMessage') {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = message;
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 3000);
            }
        }

        function showError(message, elementId = 'authError') {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = message;
                element.style.display = 'block';
                setTimeout(() => {
                    element.style.display = 'none';
                }, 5000);
            }
        }
    </script>'''

content = content[:script_start] + firebase_script + '\n</body>\n</html>\n'

with open('auth-system.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated auth-system.html successfully.')
