// 가짜 Firebase Auth — window.__FAKE_USER (addInitScript로 주입) 를 로그인 사용자로 사용
const listeners = [];
const cur = () => window.__FAKE_USER ? { ...window.__FAKE_USER, getIdToken: async () => window.__FAKE_USER.token || 'fake-user-token' } : null;
export function getAuth() { return { get currentUser() { return cur(); } }; }
export function onAuthStateChanged(auth, cb) { listeners.push(cb); setTimeout(() => cb(cur()), 0); return () => {}; }
export class GoogleAuthProvider {}
export async function signInWithPopup() { return { user: cur() }; }
export async function signOut() { window.__FAKE_USER = null; listeners.forEach(l => l(null)); }
export async function signInWithEmailAndPassword() { return { user: cur() }; }
