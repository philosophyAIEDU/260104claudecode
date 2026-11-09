import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateInquiry, looksLikeBot, inquiryFingerprint, toInquiryDoc, toMail, normalizeInquiry, INQUIRY_PROGRAMS } from '../../assets/js/inquiry-core.mjs';

const ok = { org: '○○대학교 교수학습센터', name: '홍길동', email: 'ctl@univ.ac.kr', message: '신임 교수 대상 AI 연수를 문의드립니다.', consent: true };

test('정상 입력: 필수 4개 + 동의만으로 접수 가능', () => {
    const r = validateInquiry(ok);
    assert.equal(r.ok, true, JSON.stringify(r.errors));
});

test('필수 항목 누락·동의 누락', () => {
    const r = validateInquiry({});
    assert.deepEqual(Object.keys(r.errors).sort(), ['consent', 'email', 'message', 'name', 'org']);
    assert.equal(validateInquiry({ ...ok, consent: false }).errors.consent.includes('동의'), true);
});

test('잘못된 이메일 형식', () => {
    for (const e of ['abc', 'a@b', 'a b@c.com', 'a@b.c', '<x>@y.com']) assert.ok(validateInquiry({ ...ok, email: e }).errors.email, e);
    for (const e of ['name@univ.ac.kr', 'first.last+tag@gmail.com']) assert.equal(validateInquiry({ ...ok, email: e }).errors.email, undefined, e);
});

test('길이 제한과 연락처 형식', () => {
    assert.ok(validateInquiry({ ...ok, message: '짧음' }).errors.message);
    assert.ok(validateInquiry({ ...ok, message: 'x'.repeat(3001) }).errors.message);
    assert.ok(validateInquiry({ ...ok, phone: '010-1234-abcd' }).errors.phone);
    assert.equal(validateInquiry({ ...ok, phone: '010-1234-5678' }).errors.phone, undefined);
});

test('입력 정리: 공백·제어문자 제거, 문의 내용 줄바꿈 유지', () => {
    const d = normalizeInquiry({ org: '  대학\u0000교  ', message: '첫 줄\r\n둘째 줄', consent: 'on' });
    assert.equal(d.org, '대학 교');
    assert.equal(d.message, '첫 줄\n둘째 줄');
    assert.equal(d.consent, true);
});

test('스팸 방어: 숨은 칸 입력 또는 3초 안 제출', () => {
    assert.equal(looksLikeBot({ honeypot: 'http://spam' }), true);
    assert.equal(looksLikeBot({ openedAt: 1000, now: 2500 }), true);
    assert.equal(looksLikeBot({ openedAt: 1000, now: 9000 }), false);
});

test('중복 제출 지문: 같은 이메일·기관·내용이면 같고, 내용이 다르면 다름', () => {
    const a = inquiryFingerprint(normalizeInquiry(ok));
    assert.equal(a, inquiryFingerprint(normalizeInquiry({ ...ok, email: 'CTL@univ.ac.kr ' })));
    assert.notEqual(a, inquiryFingerprint(normalizeInquiry({ ...ok, message: '다른 내용의 문의입니다.' })));
});

test('저장 문서는 규칙의 허용 필드만, 상태 new·동의 true', () => {
    const doc = toInquiryDoc(validateInquiry(ok).data, 'TS');
    assert.deepEqual(Object.keys(doc).sort(), ['consent', 'createdAt', 'dept', 'email', 'message', 'name', 'org', 'people', 'phone', 'program', 'referral', 'schedule', 'source', 'status'].sort());
    assert.equal(doc.status, 'new'); assert.equal(doc.consent, true); assert.equal(doc.createdAt, 'TS');
});

test('메일 대안 본문에 모든 항목 포함', () => {
    const m = toMail(validateInquiry({ ...ok, program: INQUIRY_PROGRAMS[2] }).data);
    assert.ok(m.subject.includes('○○대학교 교수학습센터') && m.subject.includes('C.'));
    assert.ok(m.body.includes('교육 목적 및 요청사항') && m.body.includes('ctl@univ.ac.kr'));
});
