// 가짜 Firestore (메모리 + localStorage). 실제 보안 규칙은 tests/rules 에서 에뮬레이터로 검증합니다.
// 여기서는 규칙의 핵심(관리자만 쓰기, 동의 확인 전 게시 금지)만 흉내 냅니다.
const KEY = '__fakeDb';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const save = (db) => {
    localStorage.setItem(KEY, JSON.stringify(db));
    const reviews = Object.entries(db.reviews || {}).map(([id, d]) => ({ id, ...plain(d) }));
    return fetch('/__fake/reviews', { method: 'PUT', body: JSON.stringify(reviews) });
};
const plain = (v) => {
    if (v && typeof v === 'object' && '__seconds' in v) return new Date(v.__seconds * 1000).toISOString();
    if (Array.isArray(v)) return v.map(plain);
    if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = plain(x); return o; }
    return v;
};
const hydrate = (v) => {
    if (v && typeof v === 'object' && '__seconds' in v) return { seconds: v.__seconds, toMillis: () => v.__seconds * 1000, toDate: () => new Date(v.__seconds * 1000), __seconds: v.__seconds };
    if (Array.isArray(v)) return v.map(hydrate);
    if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = hydrate(x); return o; }
    return v;
};
const dehydrate = (v) => {
    if (v && v.__serverTs) return { __seconds: Math.floor(Date.now() / 1000) };
    if (v && typeof v === 'object' && '__seconds' in v) return { __seconds: v.__seconds };
    if (Array.isArray(v)) return v.map(dehydrate);
    if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) if (typeof x !== 'function') o[k] = dehydrate(x); return o; }
    return v;
};
const isAdmin = () => window.__FAKE_USER && window.__FAKE_USER.email === 'warmcomfortforyou@gmail.com';
function denied() { const e = new Error('Missing or insufficient permissions.'); e.code = 'permission-denied'; return e; }
function checkWrite(col, data) {
    if (['reviews', 'review_private', 'ai_tools'].includes(col) && !isAdmin()) throw denied();
    if (col === 'reviews' && data && data.status === 'published' && data.consentStatus !== 'confirmed') throw denied();
}
window.__fakeDbWrites = window.__fakeDbWrites || [];

export function getFirestore() { return { kind: 'db' }; }
export function collection(db, name) { return { kind: 'col', name }; }
export function doc(a, name, id) {
    if (a && a.kind === 'col') return { kind: 'doc', col: a.name, id: Math.random().toString(36).slice(2, 12) + 'AbC' };
    return { kind: 'doc', col: name, id };
}
const snap = (ref, d) => ({ id: ref.id, exists: () => !!d, data: () => hydrate(d) });
export async function getDoc(ref) { const db = load(); return snap(ref, (db[ref.col] || {})[ref.id]); }
export function where(field, op, value) { return { field, op, value }; }
export function query(col, ...w) { return { ...col, wheres: w }; }
export async function getDocs(q) {
    const db = load();
    const ws = (q.wheres || []).filter(w => w.field);
    const lim = (q.wheres || []).find(w => w.limit);
    let rows = Object.entries(db[q.name] || {}).filter(([, d]) => ws.every(w => d[w.field] === w.value));
    if (lim) rows = rows.slice(0, lim.limit);
    const docs = rows.map(([id, d]) => snap({ id }, d));
    return { docs, size: docs.length, empty: !docs.length };
}
export async function setDoc(ref, data) {
    checkWrite(ref.col, data);
    const db = load(); db[ref.col] = db[ref.col] || {}; db[ref.col][ref.id] = dehydrate(data);
    window.__fakeDbWrites.push({ col: ref.col, id: ref.id });
    await save(db);
}
export async function deleteDoc(ref) {
    if (['reviews', 'review_private'].includes(ref.col) && !isAdmin()) throw denied();
    const db = load(); if (db[ref.col]) delete db[ref.col][ref.id]; await save(db);
}
export function serverTimestamp() { return { __serverTs: true }; }
export function writeBatch() {
    const ops = [];
    return { set: (ref, data) => ops.push([ref, data]), commit: async () => { for (const [r, d] of ops) await setDoc(r, d); } };
}

// 기존 페이지(index·community·education-inquiry·admin-dashboard)가 쓰는 나머지 API — 정렬·제한은 단순 흉내
export function orderBy(field, dir) { return { orderBy: field, dir }; }
export function limit(n) { return { limit: n }; }
export function increment(n) { return { __increment: n }; }
export async function addDoc(col, data) { const ref = doc(col); await setDoc(ref, data); return ref; }
export async function updateDoc(ref, data) {
    const db = load(); const cur = (db[ref.col] || {})[ref.id] || {};
    const next = { ...cur };
    for (const [k, v] of Object.entries(data)) next[k] = v && v.__increment ? (cur[k] || 0) + v.__increment : v;
    await setDoc(ref, next);
}
