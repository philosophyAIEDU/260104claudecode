import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as RC from '../../assets/js/review-core.mjs';

test('붙여넣은 원문: 줄바꿈·문단 보존, CRLF·NBSP·제로폭 문자 정리', () => {
    const raw = '첫 문단 첫 줄\r\n첫 문단 둘째 줄   \r\n\r\n\r\n\r\n둘째 문단​';
    assert.equal(RC.cleanPastedText(raw), '첫 문단 첫 줄\n첫 문단 둘째 줄\n\n둘째 문단');
});

test('긴 글·여러 문단 → <p> 문단과 <br>로 렌더링, HTML은 이스케이프', () => {
    const long = Array.from({ length: 40 }, (_, i) => `${i + 1}번째 문단입니다.\n같은 문단의 둘째 줄`).join('\n\n');
    const html = RC.paragraphsHtml(long + '\n\n<img src=x onerror=alert(1)>');
    assert.equal((html.match(/<p>/g) || []).length, 41);
    assert.ok(html.includes('<br>'));
    assert.ok(!html.includes('<img'));
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('XSS: 카드·상세 렌더러는 모든 필드를 이스케이프하고 javascript: 링크를 버린다', () => {
    const evil = '"><script>alert(1)</script>';
    const r = { slug: 'ok-slug', title: evil, authorDisplay: evil, originalText: evil, concernBefore: evil, sourceUrl: 'javascript:alert(1)', images: [{ url: 'javascript:alert(1)', alt: evil }], program: 'vibe-coding', categories: ['vibe-coding', 'x<y'] };
    for (const html of [RC.renderReviewCard(r), RC.renderReviewDetail(r)]) {
        assert.ok(!html.includes('<script>'));
        assert.ok(!/href="javascript:/i.test(html));
        assert.ok(!/src="javascript:/i.test(html));
    }
});

test("'언급 없음'·빈 항목은 화면에 표시하지 않는다", () => {
    const html = RC.renderReviewDetail({ slug: 'a-b', title: 't', originalText: '원문', concernBefore: '언급 없음', memorablePractice: '앱 만들기', changeAfter: '' });
    assert.ok(!html.includes('교육 전 고민'));
    assert.ok(html.includes('인상 깊었던 실습'));
    assert.ok(!html.includes('교육 후 변화'));
    assert.ok(html.includes('후기 원문'));
});

test('원문과 운영자 요약을 구분해 표시한다', () => {
    const html = RC.renderReviewDetail({ slug: 'a-b', title: 't', originalText: '작성자 원문', adminSummary: '운영자가 쓴 요약' });
    assert.ok(html.indexOf('운영자 요약') < html.indexOf('후기 원문'));
    assert.ok(html.includes('작성자가 남긴 글을 그대로'));
});

test('중복 감지: 같은 카페 URL(모바일/PC·해시 차이 무시)과 유사 원문', () => {
    const existing = [
        { id: 'a', title: 'A', sourceUrl: 'https://cafe.naver.com/PHILOSOPHYai/123', originalText: '완전히 다른 글' },
        { id: 'b', title: 'B', sourceUrl: '', originalText: '저는 코딩을 전혀 몰랐는데 이번 강의를 듣고 직접 앱을 만들 수 있었습니다. 감사합니다!' },
    ];
    const d1 = RC.findDuplicates({ sourceUrl: 'https://m.cafe.naver.com/PHILOSOPHYai/123#comment', originalText: 'x' }, existing);
    assert.equal(d1[0].id, 'a'); assert.equal(d1[0].reason, 'url');
    const d2 = RC.findDuplicates({ sourceUrl: '', originalText: '저는 코딩을 전혀 몰랐는데, 이번 강의를 듣고 직접 앱을 만들 수 있었습니다 감사합니다' }, existing);
    assert.equal(d2[0].id, 'b'); assert.equal(d2[0].reason, 'text');
    assert.equal(RC.findDuplicates({ originalText: '새로운 내용의 후기입니다. 교육실무사 연수가 유익했습니다.' }, existing).length, 0);
    // 자기 자신은 제외
    assert.equal(RC.findDuplicates({ id: 'b', originalText: existing[1].originalText }, existing).length, 0);
});

test('게시 점검: 동의 확인 전·원문 없음·잘못된 슬러그는 게시 불가', () => {
    const ok = { title: 't', originalText: '원문', consentStatus: 'confirmed', slug: 'teacher-ai-literacy-2026-ab12', reviewDate: '2026-06-05' };
    assert.equal(RC.publishCheck(ok).ok, true);
    assert.equal(RC.publishCheck({ ...ok, consentStatus: 'pending' }).ok, false);
    assert.equal(RC.publishCheck({ ...ok, originalText: '' }).ok, false);
    assert.equal(RC.publishCheck({ ...ok, slug: 'Bad Slug' }).ok, false);
    assert.equal(RC.publishCheck({ ...ok, sourceUrl: 'javascript:x' }).ok, false);
});

test('슬러그: 읽기 쉬운 영문 + 접미사', () => {
    assert.equal(RC.makeSlug({ authorType: '교사', program: 'ai-literacy', reviewDate: '2026-06-05' }, 'ab12'), 'teacher-ai-literacy-2026-ab12');
    assert.ok(RC.isValidSlug(RC.makeSlug({})));
});

test('CSV 가져오기: 따옴표 안 줄바꿈·쉼표, 한국어 머리글, 날짜·프로그램 정규화', () => {
    const csv = '﻿원문,원본 URL,작성일,작성자,교육 프로그램\n"첫 줄\n둘째 줄, 쉼표 포함 ""인용""",https://cafe.naver.com/PHILOSOPHYai/9,2026.6.5,익명,바이브 코딩\n,https://x,2026-01-01,a,b\n"두 번째",not-a-url,2026-13-40,김교사,AI 리터러시\n';
    const { items, errors } = RC.parseImport(csv);
    assert.equal(items.length, 2);
    assert.equal(items[0].originalText, '첫 줄\n둘째 줄, 쉼표 포함 "인용"');
    assert.equal(items[0].reviewDate, '2026-06-05');
    assert.equal(items[0].program, 'vibe-coding');
    assert.equal(items[0].anonymous, true);
    assert.equal(items[0].status, 'draft'); assert.equal(items[0].consentStatus, 'pending');
    assert.equal(items[1].sourceUrl, ''); assert.equal(items[1].reviewDate, ''); assert.equal(items[1].program, 'ai-literacy');
    assert.ok(errors.some(e => e.includes('원문이 비어')));
    assert.ok(errors.some(e => e.includes('URL')));
});

test('JSON 가져오기: 배열 또는 {reviews:[...]}', () => {
    const { items } = RC.parseImport(JSON.stringify({ reviews: [{ originalText: '원문', sourceUrl: 'https://cafe.naver.com/a/1', reviewDate: '20260605', authorDisplay: '박선생', program: 'professor-ai' }] }));
    assert.equal(items.length, 1);
    assert.equal(items[0].reviewDate, '2026-06-05');
    assert.equal(items[0].anonymous, false);
    assert.equal(RC.parseImport('{bad').items.length, 0);
});

test('CSV 내보내기 → 다시 가져오기 왕복', () => {
    const rows = [{ originalText: '줄1\n줄2, "따옴표"', sourceUrl: 'https://cafe.naver.com/a/1', reviewDate: '2026-06-05', authorDisplay: '익명', program: 'vibe-coding' }];
    const csv = RC.toCsv(rows, ['originalText', 'sourceUrl', 'reviewDate', 'authorDisplay', 'program']);
    const back = RC.parseImport(csv).items[0];
    assert.equal(back.originalText, rows[0].originalText);
    assert.equal(back.program, 'vibe-coding');
});

test('AI 근거 확인: 공백 차이는 무시, 없는 문장은 거짓', () => {
    const orig = '처음엔 막막했지만\n선생님이 쉽게 알려주셔서 완성할 수 있었습니다.';
    assert.ok(RC.evidenceInText('처음엔 막막했지만 선생님이', orig));
    assert.ok(!RC.evidenceInText('코딩을 전혀 몰랐다', orig));
    assert.ok(!RC.evidenceInText('', orig));
});
