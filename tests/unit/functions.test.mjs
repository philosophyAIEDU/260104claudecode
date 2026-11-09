import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

process.env.REVIEWS_FIXTURE = fileURLToPath(new URL('../fixtures/reviews.json', import.meta.url));
const reviews = await import('../../netlify/functions/reviews.mjs');
const sitemap = await import('../../netlify/functions/sitemap.mjs');

test('/reviews: 게시+동의 확인된 후기만 HTML에 포함 (JS 없이 읽힘)', async () => {
    const r = await reviews.handler({ path: '/reviews', queryStringParameters: {} });
    assert.equal(r.statusCode, 200);
    assert.match(r.headers['Content-Type'], /text\/html/);
    assert.ok(r.body.includes('코딩을 몰랐지만 앱을 완성한 후기'));
    assert.ok(!r.body.includes('임시저장 후기'));
    assert.ok(!r.body.includes('동의 없음'));
    assert.ok(r.body.includes('<link rel="canonical" href="https://philosophyaiedu.com/reviews">'));
    assert.ok(r.body.includes('<html lang="ko">'));
});

test('/reviews?cat=: 다른 분류 카드는 hidden', async () => {
    const r = await reviews.handler({ path: '/reviews', queryStringParameters: { cat: 'automation' } });
    assert.ok(r.body.includes('<article hidden class="rv-card"'));
    assert.ok(r.body.includes('이 분류의 후기가 아직 없습니다'));
});

test('/reviews/<slug>: 상세 — 제목·날짜·원문·프로그램·카페 링크, 비공개 문서는 404', async () => {
    const r = await reviews.handler({ path: '/reviews/teacher-vibe-coding-2026-test' });
    assert.equal(r.statusCode, 200);
    for (const s of ['<h1>', '2026.04.12', '후기 원문', '교수님만의 AI 수업 앱 만들기', 'https://cafe.naver.com/PHILOSOPHYai/1', '&lt;script&gt;']) assert.ok(r.body.includes(s), s);
    assert.ok(!r.body.includes('<script>alert'));
    assert.equal((await reviews.handler({ path: '/reviews/no-consent-2026-test' })).statusCode, 404);
    assert.equal((await reviews.handler({ path: '/reviews/draft-hidden-2026-test' })).statusCode, 404);
    assert.equal((await reviews.handler({ path: '/reviews/NOT_VALID!' })).statusCode, 404);
});

test('sitemap.xml: 정적 페이지 + 게시 후기만', async () => {
    const r = await sitemap.handler();
    assert.ok(r.body.includes('https://philosophyaiedu.com/ai-instructor'));
    assert.ok(r.body.includes('/reviews/teacher-vibe-coding-2026-test'));
    assert.ok(!r.body.includes('draft-hidden'));
});

