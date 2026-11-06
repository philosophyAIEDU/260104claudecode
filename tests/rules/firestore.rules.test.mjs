// Firestore 보안 규칙 테스트 — 후기(reviews / review_private) + 기존 컬렉션 회귀 확인
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

let env;
const ADMIN = { email: 'warmcomfortforyou@gmail.com', email_verified: true };

const base = (o = {}) => ({
    slug: 'teacher-ai-literacy-2026-ab12', title: '테스트 후기', originalText: '원문입니다.', status: 'draft', consentStatus: 'pending',
    authorDisplay: '익명', anonymous: true, authorType: '교사', program: 'ai-literacy', categories: ['ai-literacy'],
    institution: '', reviewDate: '2026-06-05', concernBefore: '', memorablePractice: '', changeAfter: '', adminSummary: '',
    sourceUrl: 'https://cafe.naver.com/PHILOSOPHYai/1', images: [], featured: false, summaryOrigin: 'manual', ...o,
});

before(async () => {
    env = await initializeTestEnvironment({
        projectId: 'demo-philosophy',
        firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8085 },
    });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

const admin = () => env.authenticatedContext('admin', ADMIN).firestore();
const user = () => env.authenticatedContext('u1', { email: 'someone@example.com', email_verified: true }).firestore();
const fakeAdmin = () => env.authenticatedContext('u2', { email: 'warmcomfortforyou@gmail.com', email_verified: false }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

test('관리자는 임시저장 후기를 만들 수 있다', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'reviews', 'r1'), base()));
});

test('관리자 외 사용자는 후기를 만들거나 수정할 수 없다', async () => {
    await assertFails(setDoc(doc(user(), 'reviews', 'r1'), base()));
    await assertFails(setDoc(doc(anon(), 'reviews', 'r1'), base()));
    await assertFails(setDoc(doc(fakeAdmin(), 'reviews', 'r1'), base())); // 이메일 미인증 사칭
    await env.withSecurityRulesDisabled(c => setDoc(doc(c.firestore(), 'reviews', 'r1'), base()));
    await assertFails(setDoc(doc(user(), 'reviews', 'r1'), base({ title: '변조' })));
    await assertFails(deleteDoc(doc(user(), 'reviews', 'r1')));
});

test('공개 동의 확인 전에는 게시(published)할 수 없다 — 관리자라도', async () => {
    await assertFails(setDoc(doc(admin(), 'reviews', 'r1'), base({ status: 'published', consentStatus: 'pending' })));
    await assertFails(setDoc(doc(admin(), 'reviews', 'r1'), base({ status: 'published', consentStatus: 'denied' })));
    await assertSucceeds(setDoc(doc(admin(), 'reviews', 'r1'), base({ status: 'published', consentStatus: 'confirmed' })));
});

test('원문 없는 후기는 게시할 수 없다', async () => {
    await assertFails(setDoc(doc(admin(), 'reviews', 'r1'), base({ status: 'published', consentStatus: 'confirmed', originalText: '' })));
});

test('형식 검증: 잘못된 슬러그·URL·알 수 없는 필드 거부', async () => {
    await assertFails(setDoc(doc(admin(), 'reviews', 'r1'), base({ slug: 'Bad Slug!' })));
    await assertFails(setDoc(doc(admin(), 'reviews', 'r1'), base({ sourceUrl: 'javascript:alert(1)' })));
    await assertFails(setDoc(doc(admin(), 'reviews', 'r1'), base({ realName: '홍길동' })));
    await assertFails(setDoc(doc(admin(), 'reviews', 'r1'), base({ originalText: 'x'.repeat(20001) })));
});

test('비로그인 방문자는 게시+동의 확인된 후기만 읽는다', async () => {
    await env.withSecurityRulesDisabled(async c => {
        const f = c.firestore();
        await setDoc(doc(f, 'reviews', 'pub'), base({ slug: 'pub-1', status: 'published', consentStatus: 'confirmed' }));
        await setDoc(doc(f, 'reviews', 'draft'), base({ slug: 'draft-1', status: 'draft', consentStatus: 'confirmed' }));
        await setDoc(doc(f, 'reviews', 'priv'), base({ slug: 'priv-1', status: 'private', consentStatus: 'confirmed' }));
        await setDoc(doc(f, 'review_private', 'pub'), { realName: '홍길동', contact: '010' });
    });
    await assertSucceeds(getDoc(doc(anon(), 'reviews', 'pub')));
    await assertFails(getDoc(doc(anon(), 'reviews', 'draft')));
    await assertFails(getDoc(doc(anon(), 'reviews', 'priv')));
    await assertFails(getDoc(doc(anon(), 'review_private', 'pub')));
    await assertFails(getDoc(doc(user(), 'review_private', 'pub')));
    // 공개 쿼리는 같은 조건을 넣어야 통과
    const q = query(collection(anon(), 'reviews'), where('status', '==', 'published'), where('consentStatus', '==', 'confirmed'));
    const snap = await assertSucceeds(getDocs(q));
    assert.deepEqual(snap.docs.map(d => d.id), ['pub']);
    await assertFails(getDocs(collection(anon(), 'reviews')));
    // 관리자는 전부 읽음
    const all = await assertSucceeds(getDocs(collection(admin(), 'reviews')));
    assert.equal(all.size, 3);
    await assertSucceeds(getDoc(doc(admin(), 'review_private', 'pub')));
});

test('회귀: 기존 컬렉션 규칙은 그대로 동작한다', async () => {
    await assertSucceeds(getDocs(collection(anon(), 'ai_tools')));
    await assertFails(setDoc(doc(user(), 'ai_tools', 't1'), { name: 'x' }));
    await assertSucceeds(setDoc(doc(admin(), 'ai_tools', 't1'), { name: 'x' }));
    await assertFails(getDoc(doc(user(), 'knowledge_input', 'k1')));
    await assertSucceeds(setDoc(doc(user(), 'community_posts', 'p1'), {
        authorUid: 'u1', authorName: '교사', title: '제목입니다', content: '내용', category: '자유',
    }));
    await assertFails(setDoc(doc(user(), 'community_posts', 'p2'), {
        authorUid: 'u1', authorName: '교사', title: '제목입니다', content: '내용', category: '강연 후기',
    }));
});

test('관리자 화면이 저장하는 전체 필드 구성(타임스탬프·가져오기 배치 포함)이 규칙을 통과한다', async () => {
    const { serverTimestamp } = await import('firebase/firestore');
    const now = serverTimestamp();
    await assertSucceeds(setDoc(doc(admin(), 'reviews', 'full'), base({
        status: 'published', consentStatus: 'confirmed', featured: true, summaryOrigin: 'ai_edited',
        images: [],
        importBatch: 'import-2026-11-06-abcd', createdAt: now, updatedAt: now, publishedAt: now,
    })));
    await assertSucceeds(setDoc(doc(admin(), 'review_private', 'full'), {
        realName: '홍길동', contact: '010-0000-0000', institution: '○○고', institutionPublic: false,
        consentNote: '카페 쪽지로 동의', memo: '', aiDraft: { title: 't', checks: {}, model: 'gemini-3.8-flash' }, updatedAt: now,
    }));
});
