// 가짜 Storage — 업로드 바이트는 버리고 https://fake-storage.test/<경로> 주소를 돌려줍니다 (테스트가 이 호스트를 가로챔)
window.__fakeUploads = window.__fakeUploads || [];
export function getStorage() { return {}; }
export function ref(s, path) { return { path }; }
export async function uploadBytes(r, blob, meta) {
    if (!window.__FAKE_USER || window.__FAKE_USER.email !== 'warmcomfortforyou@gmail.com') { const e = new Error('unauthorized'); e.code = 'storage/unauthorized'; throw e; }
    window.__fakeUploads.push({ path: r.path, size: blob.size, type: (meta && meta.contentType) || blob.type });
}
export async function getDownloadURL(r) { return 'https://fake-storage.test/' + r.path; }
export async function deleteObject(r) { window.__fakeUploads = window.__fakeUploads.filter(u => u.path !== r.path); }
