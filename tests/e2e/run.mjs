// 브라우저 E2E 테스트 (Playwright, 실제 Firebase·AI 호출 없음)
//   node tests/e2e/run.mjs
// Firebase SDK는 tests/e2e/fakes 의 가짜 모듈로, Firestore REST·Storage·외부 CDN은 가로채서 처리합니다.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { start, mockSummary } from './server.mjs';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'output');
mkdirSync(join(out, 'screens'), { recursive: true });
writeFileSync(join(out, 'reviews-store.json'), '[]');

const { server, port } = await start(0);
const BASE = `http://127.0.0.1:${port}`;
const results = [];
const geminiCalls = [];
let failed = 0;
async function t(name, fn) {
    try { await fn(); results.push(`✔ ${name}`); }
    catch (e) { failed++; results.push(`✖ ${name}\n    ${String(e && e.stack || e).split('\n').slice(0, 3).join('\n    ')}`); }
    console.log(results[results.length - 1]);
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

const browser = await chromium.launch();
const ADMIN = { email: 'warmcomfortforyou@gmail.com', emailVerified: true, uid: 'admin', token: 'fake-admin-token' };
const OTHER = { email: 'teacher@example.com', emailVerified: true, uid: 'u1', token: 'user-token' };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');

function storeReviews() { return JSON.parse(readFileSync(join(out, 'reviews-store.json'), 'utf8')); }

async function newContext(opts = {}, user = null) {
    const ctx = await browser.newContext({ ...opts });
    await ctx.addInitScript((u) => { window.__FAKE_USER = u; }, user);
    await ctx.route(/https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/(firebase-[a-z]+)\.js/, (route, req) => {
        const name = /(firebase-[a-z]+)\.js/.exec(req.url())[1];
        route.fulfill({ contentType: 'text/javascript', body: readFileSync(join(here, 'fakes', name + '.js')) });
    });
    await ctx.route(/firestore\.googleapis\.com\/.*:runQuery/, (route, req) => {
        const body = JSON.parse(req.postData() || '{}');
        const filters = body.structuredQuery.where.compositeFilter.filters.map(f => f.fieldFilter);
        const rows = storeReviews().filter(r => filters.every(f => r[f.field.fieldPath] === (f.value.stringValue ?? f.value.booleanValue)));
        const enc = (v) => typeof v === 'boolean' ? { booleanValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(enc) } } : (v && typeof v === 'object') ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } } : { stringValue: String(v ?? '') };
        route.fulfill({ contentType: 'application/json', body: JSON.stringify(rows.map(r => ({ document: { name: 'projects/p/databases/(default)/documents/reviews/' + r.id, fields: Object.fromEntries(Object.entries(r).map(([k, v]) => [k, enc(v)])) } }))) });
    });
    // 가짜 Gemini API: 키 'bad-key'면 400, 그 외엔 원문 문장을 근거로 한 응답
    await ctx.route(/generativelanguage\.googleapis\.com\/v1beta\/models\/([^:]+):generateContent/, (route, req) => {
        const key = req.headers()['x-goog-api-key'];
        geminiCalls.push({ url: req.url(), key });
        if (key === 'bad-key') return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ error: { message: 'API key not valid. Please pass a valid API key.' } }) });
        const body = JSON.parse(req.postData());
        const text = /<review>\n([\s\S]*)\n<\/review>/.exec(body.contents[0].parts[0].text)[1];
        route.fulfill({ contentType: 'application/json', body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(mockSummary(text)) }] }, finishReason: 'STOP' }], modelVersion: /models\/([^:]+)/.exec(req.url())[1] }) });
    });
    // 그 밖의 외부 요청(GA, 폰트, CDN, 기존 Firebase 위젯)은 테스트에서 차단
    await ctx.route(url => !url.href.startsWith(BASE) && !/gstatic\.com\/firebasejs|firestore\.googleapis|generativelanguage\.googleapis/.test(url.href), route => route.abort());
    return ctx;
}

// ───────── 1. 공개 페이지 SEO·구조 점검 ─────────
const PUBLIC = ['/', '/ai-instructor', '/programs', '/case-studies', '/reviews', '/insights/', '/insights/can-teachers-build-apps-without-coding/', '/education-inquiry', '/community.html'];
{
    const ctx = await newContext();
    const page = await ctx.newPage();
    for (const p of PUBLIC) {
        await t(`공개 페이지 ${p}: 200 · lang=ko · title · description · H1 1개 · JSON-LD 유효 · 이미지 alt`, async () => {
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            const res = await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
            assert(res.status() === 200, 'status ' + res.status());
            assert(await page.getAttribute('html', 'lang') === 'ko', 'lang');
            assert((await page.title()).length > 10, 'title');
            if (p !== '/community.html') {
                assert((await page.getAttribute('meta[name=description]', 'content') || '').length > 40, 'description');
                assert(await page.locator('link[rel=canonical]').count() === 1, 'canonical');
                const lds = await page.locator('script[type="application/ld+json"]').allTextContents();
                assert(lds.length >= 1, 'json-ld');
                lds.forEach(j => JSON.parse(j));
            }
            const h1 = await page.locator('h1').count();
            assert(h1 === 1, 'h1 count ' + h1);
            const noAlt = await page.locator('img:not([alt])').count();
            assert(noAlt === 0, 'img without alt: ' + noAlt);
            page.removeAllListeners('pageerror');
            assert(!errors.length, 'JS 오류: ' + errors.join(' | '));
        });
    }
    await t('robots.txt: 공개 허용 · 관리자 차단 · sitemap 안내 / sitemap.xml 응답', async () => {
        const r = await (await fetch(BASE + '/robots.txt')).text();
        assert(/Allow: \//.test(r) && /Disallow: \/reviews-admin/.test(r) && /Disallow: \/admin-dashboard/.test(r) && /Sitemap:/.test(r));
        const s = await (await fetch(BASE + '/sitemap.xml')).text();
        assert(s.includes('/ai-instructor') && s.includes('/insights/'));
        assert(!/admin-dashboard|reviews-admin|contents-admin|knowledge-admin/.test(s), 'sitemap에 관리자 페이지 없음');
    });
    await t('관리자 페이지는 noindex', async () => {
        for (const p of ['/reviews-admin.html', '/knowledge-admin.html']) {
            const h = await (await fetch(BASE + p)).text();
            assert(/<meta name="robots" content="noindex/.test(h), p);
        }
    });
    await t('메인 페이지: 교수님 중심 메시지 · CTA 2개(연결·우선순위) · 고민 4개 · 프로그램 A~D · 기존 섹션 유지', async () => {
        await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
        assert(await page.title() === '필로소피 AI 교육 | 대학 교수님 AI 연수·생성형 AI 실습', await page.title());
        const h1 = (await page.locator('h1').innerText()).replace(/\s+/g, ' ');
        assert(h1.includes('대학 교수님을 위한 AI 교육 강사, 필로소피 AI 교육'), h1);
        // 첫 화면 = 강사 소개: 캐릭터 프로필·전문 분야·강의 이력·철학·슬로건·강사 소개 링크
        assert((await page.locator('.hero-slogan').innerText()) === 'AI 시대, 교수님의 든든한 교육 파트너.');
        assert(await page.locator('.hero-profile img[src="assets/mascot.jpg"]').count() === 1, '캐릭터 프로필');
        const facts = await page.locator('.hero-profile-facts').innerText();
        for (const f of ['전문 분야', '교육 대상', '강의 이력', '교육 철학', '8개 기관·단체 12회']) assert(facts.includes(f), f);
        assert(await page.locator('.hero a[href="/ai-instructor"]').count() >= 1, '강사 소개 링크');
        const heroBox = await page.locator('#home .hero-content').boundingBox();
        assert(heroBox.y < 200, '강사 소개가 첫 화면 최상단');
        const cta = page.locator('.hero-buttons a');
        assert(await cta.nth(0).innerText() === '대학 AI 연수 문의' && await cta.nth(0).getAttribute('href') === '/education-inquiry', '1차 CTA');
        assert((await cta.nth(1).innerText()).startsWith('교육 프로그램 살펴보기') && await cta.nth(1).getAttribute('href') === '/programs', '2차 CTA');
        const bg = await cta.nth(0).evaluate(e => getComputedStyle(e).backgroundColor), bg2 = await cta.nth(1).evaluate(e => getComputedStyle(e).backgroundColor);
        assert(bg !== bg2, '두 버튼 시각 구분');
        assert(await page.locator('.problem-card').count() === 4, '고민 카드 4개');
        assert(await page.locator('.prog-card').count() === 4, '프로그램 4개');
        const txt = await page.locator('body').innerText();
        for (const s of ['AI로 성장하고, 그 성장을 나눕니다.', 'AI 시대, 교육자의 나침반', '좋은 질문에서 시작되는, 새로운 배움', '교수님만을 대상으로 한 단독 강의는 아직 기록에 없으며', '필로소피 AI 툴', '바이브코딩 쇼케이스', '교육자 커뮤니티'])
            assert(txt.replace(/\s+/g, ' ').includes(s) || txt.includes(s.replace(/\s+/g, '')) || (await page.content()).includes(s), '없음: ' + s);
        assert(await page.locator('#tools, #showcase, #community, #contact, #problems, #programs-home, #credentials, #learn, #philosophy').count() === 9, '섹션');
        // 섹션 순서: 고민 → 프로그램 → 이력 → 도구 → 칼럼/유튜브 → 철학 → 커뮤니티 → 문의
        const order = await page.evaluate(() => ['problems', 'programs-home', 'credentials', 'tools', 'learn', 'philosophy', 'community', 'contact'].map(id => document.getElementById(id).getBoundingClientRect().top + scrollY));
        assert(order.every((v, i) => i === 0 || v > order[i - 1]), '섹션 순서 ' + order.join(','));
        assert(await page.locator('#featuredReviews').isHidden(), '대표 후기 없으면 숨김');
    });
    await t('내부 링크: 메인·프로그램·강사 소개의 사이트 내부 링크가 모두 존재하는 페이지/앵커로 연결', async () => {
        const bad = [];
        for (const p of ['/', '/programs', '/ai-instructor', '/case-studies', '/insights/', '/education-inquiry']) {
            await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
            const links = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')).filter(h => h && !/^(https?:|mailto:|tel:|javascript:)/.test(h)));
            for (const h of [...new Set(links)]) {
                const u = new URL(h, BASE + p);
                if (u.origin !== BASE) continue;
                const res = await fetch(u.origin + u.pathname);
                if (res.status !== 200) { bad.push(`${p} → ${h} (${res.status})`); continue; }
                if (u.hash && u.hash.length > 1) {
                    const html = await res.text();
                    const id = decodeURIComponent(u.hash.slice(1));
                    if (!html.includes(`id="${id}"`)) bad.push(`${p} → ${h} (앵커 없음)`);
                }
            }
        }
        assert(!bad.length, bad.join('\n'));
    });
    await t('칼럼 목록: 5개 분류 · 작성 예정 글은 링크 없이 표시', async () => {
        await page.goto(BASE + '/insights/', { waitUntil: 'domcontentloaded' });
        assert(await page.locator('.insight-group').count() === 5);
        assert(await page.locator('.planned-list li').count() === 5);
        assert(await page.locator('.planned-list a').count() === 0, '작성 예정 글은 링크 없음');
        assert(await page.locator('.insight-list a').count() === 4);
    });
    await t('프로그램: A~D 각각 목적·대상·문제·내용·결과물·준비사항·운영 방식·관련 사례·문의 버튼', async () => {
        await page.goto(BASE + '/programs', { waitUntil: 'domcontentloaded' });
        assert(await page.title() === '대학 교수 AI 연수 프로그램 | 필로소피 AI 교육');
        for (const k of ['ai-literacy', 'professor-ai', 'vibe-coding', 'admin-automation']) {
            const t2 = await page.locator('#' + k).innerText();
            for (const h of ['교육 목적', '추천 교육 대상', '해결하는 문제', '주요 교육 내용', '실습 결과물', '준비사항', '운영 방식', '관련 교육 사례', '문의하기']) assert(t2.includes(h), `${k}: ${h}`);
            assert(t2.includes('협의 가능 예시'), k + ' 운영 방식은 예시로 표기');
        }
        assert((await page.locator('#professor-ai').innerText()).includes('신규 제안 프로그램'));
    });
    await t('교육 문의: 필드 구성 · 유입 경로 · 프로그램 페이지에서 넘어온 주제 미리 선택', async () => {
        await page.goto(BASE + '/education-inquiry?topic=' + encodeURIComponent('대학 연구·행정업무 AI 자동화') + '#inquiry', { waitUntil: 'networkidle' });
        assert(await page.title() === '대학 AI 연수·교수법 워크숍 문의 | 필로소피 AI 교육');
        assert(await page.inputValue('#program') === 'D. 대학 연구·행정업무 AI 자동화', await page.inputValue('#program'));
        for (const id of ['org', 'name', 'dept', 'email', 'phone', 'program', 'people', 'schedule', 'message', 'referral', 'consent']) assert(await page.locator('#' + id).count() === 1, id);
        assert(await page.locator('#bot-field').isHidden() || (await page.locator('.hp-field').boundingBox()).x < 0, 'honeypot 숨김');
        const opts = await page.locator('#referral option').allTextContents();
        for (const o of ['유튜브', '네이버 카페', '구글 검색', '네이버 검색', 'ChatGPT 등 AI 추천', '지인 추천', '기타']) assert(opts.includes(o), o);
        assert(await page.locator('.cred-item .num').nth(1).innerText() === '8곳', '기관 수 8곳');
        // 문의 양식이 히어로 바로 다음에 있음
        const y = await page.evaluate(() => [document.getElementById('inquiry').offsetTop, document.getElementById('history').offsetTop]);
        assert(y[0] < y[1], '양식이 이력보다 위');
    });
    await ctx.close();
}

// ───────── 2. 관리자 이외 사용자 차단 ─────────
await t('관리자 이외 사용자: 후기 관리 화면 차단 + 저장 시도 거부', async () => {
    const ctx = await newContext({}, OTHER);
    const page = await ctx.newPage();
    await page.goto(BASE + '/reviews-admin.html');
    await page.waitForSelector('#denied:not([hidden])');
    assert(await page.locator('#app').isHidden(), '편집 화면 숨김');
    const err = await page.evaluate(async () => {
        const fs = await import('https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js');
        try { await fs.setDoc(fs.doc(fs.getFirestore(), 'reviews', 'x'), { title: 'hack', status: 'published', consentStatus: 'confirmed' }); return 'saved'; }
        catch (e) { return e.code; }
    });
    assert(err === 'permission-denied', err);
    await ctx.close();
});

// ───────── 3. 관리자 전체 흐름 ─────────
const LONG = [
    '저는 코딩을 전혀 몰랐는데 이번 필로소피 AI 교육 강의를 듣고 직접 앱을 만들 수 있었습니다.',
    '처음엔 막막했지만 선생님이 쉽게 알려주셔서 완성할 수 있었습니다.',
    '',
    ...Array.from({ length: 30 }, (_, i) => `${i + 1}. 실습 기록 문단입니다. 두 줄로 된 문단의 첫 줄\n같은 문단의 둘째 줄입니다.\n`),
    '앞으로 학생들과 수업할 때 활용해 보려고 합니다.',
].join('\n');

const adminCtx = await newContext({ viewport: { width: 1400, height: 1000 } }, ADMIN);
const ap = await adminCtx.newPage();
ap.on('dialog', d => d.accept());
const jsErrors = [];
ap.on('pageerror', e => jsErrors.push(e.message));
await ap.goto(BASE + '/reviews-admin.html');
await ap.waitForSelector('#app:not([hidden])');

async function paste(selector, { text = '', html = '', files = [] } = {}) {
    await ap.evaluate(({ selector, text, html, files }) => {
        const dt = new DataTransfer();
        if (text) dt.setData('text/plain', text);
        if (html) dt.setData('text/html', html);
        for (const f of files) {
            const bin = Uint8Array.from(atob(f.b64), c => c.charCodeAt(0));
            dt.items.add(new File([bin], f.name, { type: f.type }));
        }
        const el = document.querySelector(selector);
        el.focus();
        const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
        const notCancelled = el.dispatchEvent(ev);
        // 브라우저 기본 붙여넣기(텍스트 삽입)는 합성 이벤트로 일어나지 않으므로 직접 흉내
        if (notCancelled && text && el.tagName === 'TEXTAREA') { el.value += text; el.dispatchEvent(new Event('input')); }
    }, { selector, text, html, files: files.map(f => ({ ...f, b64: f.data.toString('base64') })) });
}

await t('후기 간편 등록 화면 구성: 원문·URL·작성자/익명·작성일·프로그램·Gemini 키/모델·4개 버튼 (이미지 업로드 없음)', async () => {
    assert(await ap.locator('#dropzone, #fileInput').count() === 0, '이미지 업로드 제거');
    assert(await ap.getAttribute('#aiKey', 'type') === 'password', '키 입력 가림');
    const models = await ap.locator('#aiModel option').evaluateAll(o => o.map(x => x.value));
    assert(models[0] === 'gemini-3.8-flash' && models.includes('gemini-3.5-flash-lite'), models.join());
    for (const s of ['#fOriginal', '#fSourceUrl', 'input[name=authorMode][value=anon]', '#fReviewDate', '#fProgram', '#aiKey', '#aiModel', '#aiBtn', '#previewBtn', '#saveDraftBtn', '#publishBtn'])
        assert(await ap.locator(s).count() === 1, s);
});

await t('텍스트 + 긴 글·여러 문단 붙여넣기: 줄바꿈·문단 유지, 사진은 저장하지 않고 안내', async () => {
    await paste('#fOriginal', { text: LONG, files: [{ name: 'shot.png', type: 'image/png', data: PNG }] });
    const v = await ap.inputValue('#fOriginal');
    assert(v === LONG, '원문 그대로 유지');
    assert((v.match(/\n\n/g) || []).length >= 30, '문단 구분 유지');
    const note = await ap.locator('#pasteNote').innerText();
    assert(/사진은 저장하지 않습니다/.test(note), note);
});

await t('AI 키 없이 정리 버튼 → 키 입력 안내 (API 호출 없음)', async () => {
    await ap.click('#aiBtn');
    await ap.waitForSelector('#aiMsg.msg-warn');
    assert((await ap.locator('#aiMsg').innerText()).includes('API 키'));
    assert(geminiCalls.length === 0);
});

await t('잘못된 API 키 → 오류 안내, 화면은 그대로', async () => {
    await ap.fill('#aiKey', 'bad-key');
    await ap.click('#aiBtn');
    await ap.waitForFunction(() => /키가 올바르지/.test(document.getElementById('aiMsg').textContent));
    assert(await ap.inputValue('#fTitle') === '', '항목 비어 있음');
});

await t('AI로 후기 정리하기: 항목 자동 채움 · 근거 문장 표시 · 원문 대조 하이라이트 · 자동 게시 안 됨', async () => {
    await ap.fill('#fSourceUrl', 'https://cafe.naver.com/PHILOSOPHYai/777');
    await ap.fill('#fReviewDate', '2026-06-20');
    await ap.fill('#fAuthorDisplay', '김○○ 선생님');
    await ap.fill('#aiKey', 'AIza-good-key');
    await ap.check('#aiKeyRemember');
    await ap.click('#aiBtn');
    await ap.waitForFunction(() => document.getElementById('fTitle').value.length > 0);
    assert(await ap.inputValue('#fTitle') === '코딩을 몰랐지만 AI를 활용해 앱을 완성한 후기');
    assert(await ap.inputValue('#fConcern') === '코딩 경험 부족으로 앱 제작에 어려움을 느낌');
    assert(await ap.inputValue('#fProgram') === 'vibe-coding');
    assert(await ap.locator('#fCategories input[value=vibe-coding]').isChecked());
    assert(await ap.locator('#origView mark').count() >= 2, '원문 하이라이트');
    assert((await ap.locator('#evConcern').innerText()).includes('근거'), '근거 문장');
    assert(storeReviews().length === 0, 'AI 정리만으로는 저장·게시되지 않음');
    const last = geminiCalls[geminiCalls.length - 1];
    assert(last.url.includes('/models/gemini-3.8-flash:generateContent') && last.key === 'AIza-good-key' && !last.url.includes('AIza'), '기본 모델·헤더 키');
    assert(await ap.evaluate(() => localStorage.getItem('philo.reviewAdmin.geminiKey')) === 'AIza-good-key', '키 기억(선택)');
    assert(!JSON.stringify(storeReviews()).includes('AIza'), '키는 DB에 저장 안 됨');
});

await t('공개 동의 확인 전에는 게시 불가 (원문은 보존)', async () => {
    await ap.click('#publishBtn');
    await ap.waitForSelector('#edMsg.msg-err');
    assert((await ap.locator('#edMsg').innerText()).includes('공개 동의'));
    assert(!storeReviews().some(r => r.status === 'published'));
});

await t('미리보기: 카드와 상세(원문·정리 항목) 표시', async () => {
    await ap.click('#previewBtn');
    await ap.waitForSelector('#previewDlg[open]');
    const tx = await ap.locator('#previewDetail').innerText();
    assert(tx.includes('후기 원문') && tx.includes('교육 전 고민') && tx.includes('김○○ 선생님'), tx.slice(0, 200));
    await ap.click('#previewClose');
});

let slug;
await t('임시 저장 → 홈페이지에 표시되지 않음', async () => {
    await ap.click('#saveDraftBtn');
    await ap.waitForSelector('#edMsg.msg-info');
    const s = storeReviews();
    assert(s.length === 1 && s[0].status === 'draft', JSON.stringify(s.map(x => x.status)));
    assert(s[0].originalText === LONG.trim(), '원문 보존');
    assert(Array.isArray(s[0].images) && s[0].images.length === 0, '이미지 저장 안 함');
    assert(!JSON.stringify(s).includes('AIza'), 'API 키 미저장');
    slug = s[0].slug;
    assert((await fetch(BASE + '/reviews/' + slug)).status === 404);
});

await t('동의 확인 후 홈페이지에 게시 → /reviews 목록·고유 URL에 노출 (JS 없이도 본문 HTML)', async () => {
    await ap.selectOption('#fConsent', 'confirmed');
    await ap.fill('#fConsentNote', '2026-11-05 카페 쪽지로 동의 확인');
    await ap.fill('#fRealName', '김실명');
    await ap.check('#fFeatured');
    await ap.click('#publishBtn');
    await ap.waitForSelector('#edMsg a[href^="/reviews/"]');
    const s = storeReviews()[0];
    assert(s.status === 'published' && s.consentStatus === 'confirmed');
    assert(!JSON.stringify(s).includes('김실명'), '실명은 공개 문서에 없음');
    const list = await (await fetch(BASE + '/reviews')).text();
    assert(list.includes('코딩을 몰랐지만 AI를 활용해 앱을 완성한 후기'));
    const detail = await (await fetch(BASE + '/reviews/' + s.slug)).text();
    for (const x of ['<h1>코딩을 몰랐지만', '김○○ 선생님', '2026.06.20', '교수님만의 AI 수업 앱 만들기', '인상 깊었던 실습', 'https://cafe.naver.com/PHILOSOPHYai/777', '같은 문단의 둘째 줄입니다.'])
        assert(detail.includes(x), '상세에 없음: ' + x);
    assert(detail.includes('<br>') && (detail.match(/<p>/g) || []).length > 20, '문단 유지');
});

await t('메인 페이지에 대표 후기 노출', async () => {
    const p2 = await adminCtx.newPage();
    await p2.goto(BASE + '/');
    await p2.waitForSelector('#featuredReviews:not([hidden]) .rv-card');
    assert((await p2.locator('#featuredReviews').innerText()).includes('코딩을 몰랐지만'));
    await p2.screenshot({ path: join(out, 'screens', 'after-home-featured.png'), fullPage: false });
    await p2.goto(BASE + '/reviews/' + slug);
    await p2.screenshot({ path: join(out, 'screens', 'after-review-detail.png'), fullPage: true });
    await p2.close();
});

await t('중복 감지: 같은 카페 URL·유사 원문 경고', async () => {
    await ap.click('#newBtn');
    await ap.fill('#fSourceUrl', 'https://m.cafe.naver.com/PHILOSOPHYai/777');
    await ap.dispatchEvent('#fSourceUrl', 'change');
    await ap.waitForSelector('#dupWarn:not([hidden])');
    assert((await ap.locator('#dupWarn').innerText()).includes('같은 원본 URL'));
    await ap.fill('#fSourceUrl', '');
    await ap.fill('#fOriginal', LONG.replace('직접 앱을', '직접 앱을 정말'));
    await ap.waitForFunction(() => /유사/.test(document.getElementById('dupWarn').innerText) && !document.getElementById('dupWarn').hidden, null, { timeout: 3000 });
});

await t('AI 없이(키 지움) 수동 입력으로 게시 + 모델 변경 기억', async () => {
    await ap.click('#aiKeyForget');
    assert(await ap.evaluate(() => localStorage.getItem('philo.reviewAdmin.geminiKey')) === null, '저장된 키 삭제');
    await ap.selectOption('#aiModel', 'gemini-3.5-flash-lite');
    assert(await ap.evaluate(() => localStorage.getItem('philo.reviewAdmin.geminiModel')) === 'gemini-3.5-flash-lite');
    await ap.click('#newBtn');
    await ap.fill('#fOriginal', '교육실무사 연수에서 공문 초안 만드는 법을 배웠습니다.\n\n개인정보를 지우고 쓰는 습관이 생겼습니다.');
    await ap.click('#aiBtn');
    await ap.waitForFunction(() => /API 키/.test(document.getElementById('aiMsg').textContent));
    await ap.fill('#fTitle', '공문 초안 작성을 배운 교육실무사 연수 후기');
    await ap.fill('#fChange', '개인정보를 지우고 AI를 쓰는 습관이 생김');
    await ap.check('input[name=authorMode][value=anon]');
    await ap.selectOption('#fProgram', 'admin-automation');
    await ap.check('#fCategories input[value=automation]');
    await ap.selectOption('#fConsent', 'confirmed');
    await ap.click('#publishBtn');
    await ap.waitForSelector('#edMsg a[href^="/reviews/"]');
    const r = storeReviews().find(x => x.title.startsWith('공문 초안'));
    assert(r && r.status === 'published' && r.anonymous && r.summaryOrigin === 'manual');
    const html = await (await fetch(BASE + '/reviews/' + r.slug)).text();
    assert(html.includes('익명') && !html.includes('교육 전 고민'), '없는 항목은 표시 안 함');
});

await t('후기 수정 및 다시 저장 (목록 → 편집 → 제목 변경 → 게시 유지)', async () => {
    await ap.click('#tab-list');
    await ap.fill('#lq', '공문');
    await ap.click('#listBox button[data-act=edit]');
    await ap.waitForSelector('#panel-editor:not([hidden])');
    assert(await ap.locator('#fSlug').isDisabled(), '게시된 후기는 주소 고정');
    await ap.fill('#fTitle', '공문 초안 작성을 배운 연수 후기 (수정)');
    await ap.click('#publishBtn');
    await ap.waitForSelector('#edMsg a[href^="/reviews/"]');
    const r = storeReviews().find(x => x.title.includes('(수정)'));
    assert(r && r.status === 'published');
    assert((await fetch(BASE + '/reviews/' + r.slug)).status === 200);
});

await t('비공개 전환 → 공개 페이지에서 사라짐', async () => {
    await ap.click('#tab-list');
    await ap.fill('#lq', '(수정)');
    await ap.click('#listBox button[data-act=private]');
    await ap.waitForFunction(() => document.querySelector('#listBox .pill-private'));
    const r = storeReviews().find(x => x.title.includes('(수정)'));
    assert(r.status === 'private');
    assert((await fetch(BASE + '/reviews/' + r.slug)).status === 404);
    assert(!(await (await fetch(BASE + '/reviews')).text()).includes('(수정)'));
});

await t('CSV 일괄 가져오기 → 모두 임시저장·동의 확인 전, 중복 표시', async () => {
    await ap.click('#tab-import');
    const csv = '원문,원본 URL,작성일,작성자,교육 프로그램\n"첫 번째 가져온 후기\n둘째 줄",https://cafe.naver.com/PHILOSOPHYai/900,2026.05.01,익명,AI 리터러시\n"두 번째 가져온 후기",https://cafe.naver.com/PHILOSOPHYai/777,2026-05-02,박선생,바이브 코딩\n';
    await ap.fill('#importText', csv);
    await ap.click('#importParseBtn');
    await ap.waitForSelector('#importPreview table');
    assert((await ap.locator('#importPreview').innerText()).includes('중복 의심'), '기존 URL 중복 표시');
    await ap.click('#importSaveBtn');
    await ap.waitForFunction(() => /임시저장으로 가져왔습니다/.test(document.getElementById('importMsg').textContent));
    const imported = storeReviews().filter(x => x.importBatch);
    assert(imported.length === 1 && imported[0].status === 'draft' && imported[0].consentStatus === 'pending', JSON.stringify(imported.map(x => [x.status, x.consentStatus])));
    assert(imported[0].originalText === '첫 번째 가져온 후기\n둘째 줄');
});

await t('hidden 처리된 요소는 실제로 숨겨짐 (로그인 게이트·가져오기 버튼)', async () => {
    assert(await ap.locator('#gate').isHidden(), 'gate');
    assert(await ap.locator('#importSaveBtn').isHidden(), 'import button');
});
await t('JSON 가져오기(정리 항목 포함) → 여러 개 선택 → 공개 동의 확인 후 한 번에 게시 → 후기·사례 페이지', async () => {
    await ap.click('#tab-import');
    const data = { reviews: [1, 2].map(i => ({
        title: `[테스트] 온라인 특강 후기 ${i}`, originalText: `테스트 원문 ${i}번입니다.\n\n두 번째 문단입니다.`, reviewDate: '2026-09-1' + i,
        authorDisplay: '', anonymous: true, authorType: '기타', program: 'special-lecture', categories: ['vibe-coding'],
        institution: '테스트 그룹 코칭 (2026.09)', concernBefore: '코딩을 몰랐음', memorablePractice: '웹앱 배포', changeAfter: '',
        cafeNickname: '테스트닉' + i, consentStatus: 'confirmed', status: 'published',
    })) };
    await ap.fill('#importText', JSON.stringify(data));
    await ap.click('#importParseBtn');
    await ap.waitForSelector('#importPreview table');
    await ap.click('#importSaveBtn');
    await ap.waitForFunction(() => /임시저장으로 가져왔습니다/.test(document.getElementById('importMsg').textContent));
    let imp = storeReviews().filter(r => r.title.startsWith('[테스트] 온라인'));
    assert(imp.length === 2 && imp.every(r => r.status === 'draft' && r.consentStatus === 'pending'), '파일에 게시 값이 있어도 임시저장·동의 전으로');
    assert(imp[0].concernBefore === '코딩을 몰랐음' && imp[0].institution === '테스트 그룹 코칭 (2026.09)' && imp[0].categories[0] === 'vibe-coding', '정리 항목 보존');
    assert(!JSON.stringify(imp).includes('테스트닉'), '카페 닉네임은 공개 문서에 없음');
    const priv = await ap.evaluate(() => Object.values(JSON.parse(localStorage.getItem('__fakeDb')).review_private || {}).map(x => x.memo).join('|'));
    assert(priv.includes('카페 닉네임: 테스트닉1'), '닉네임은 비공개 메모로');
    await ap.click('#tab-list');
    await ap.fill('#lq', '[테스트] 온라인');
    await ap.check('#selectAll');
    assert((await ap.locator('#selCount').innerText()) === '2개 선택');
    ap.removeAllListeners('dialog');
    const msgs = [];
    ap.on('dialog', d => { msgs.push(d.message()); d.type() === 'prompt' ? d.accept('2026-11-10 카페 쪽지로 게시 동의 확인') : d.accept(); });
    await ap.click('#bulkPublishBtn');
    await ap.waitForFunction(() => document.querySelectorAll('#listBox .pill-published').length >= 2);
    await ap.waitForTimeout(200);
    ap.removeAllListeners('dialog'); ap.on('dialog', d => d.accept());
    assert(msgs[0].includes('게시 동의를 받으셨나요') && msgs.some(m => m.includes('2건을 게시했습니다')), msgs.join(' / '));
    imp = storeReviews().filter(r => r.title.startsWith('[테스트] 온라인'));
    assert(imp.every(r => r.status === 'published' && r.consentStatus === 'confirmed'), '게시됨');
    const html = await (await fetch(BASE + '/reviews/' + imp[0].slug)).text();
    for (const x of ['익명 수강생', '수강한 교육', '테스트 그룹 코칭 (2026.09)', '교육 전 고민', '테스트 원문']) assert(html.includes(x), x);
    assert(!html.includes('/programs#special-lecture'), '없는 앵커로 링크하지 않음');
});
await t('관리자 화면 JS 오류 없음', async () => { assert(!jsErrors.length, jsErrors.join(' | ')); });
await ap.click('#tab-editor'); await ap.evaluate(() => window.scrollTo(0, 0));
await ap.screenshot({ path: join(out, 'screens', 'admin-desktop.png'), fullPage: false });
await adminCtx.close();

await t('기존 관리자 대시보드: 정상 로드 + 후기 관리 메뉴(후기 간편 등록) 통합', async () => {
    const ctx = await newContext({}, ADMIN);
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.goto(BASE + '/admin-dashboard.html');
    await page.waitForFunction(() => document.getElementById('adminGate').style.display === 'none');
    await page.waitForFunction(() => /게시 \d+/.test(document.getElementById('reviewsAdminStats').textContent));
    assert(await page.locator('.reviews-mgmt-section a[href="reviews-admin.html"]').innerText() !== '', '메뉴');
    assert(await page.locator('#toolsListContainer').count() === 1 && await page.locator('#reportsListContainer').count() === 1, '기존 섹션 유지');
    const relevant = errs.filter(e => !/Chart is not defined/.test(e));
    assert(!relevant.length, relevant.join(' | '));
    await page.screenshot({ path: join(out, 'screens', 'admin-dashboard.png') });
    await ctx.close();
});

// ───────── 3-1. 교육 문의 접수 ─────────
{
    const ctx = await newContext({});
    const page = await ctx.newPage();
    page.on('dialog', d => d.accept());
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    const fill = async (o) => { for (const [k, v] of Object.entries(o)) await page.fill('#' + k, v); };
    const stored = () => page.evaluate(() => Object.values(JSON.parse(localStorage.getItem('__fakeDb') || '{}').inquiries || {}));
    await page.goto(BASE + '/education-inquiry#inquiry', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3100); // 3초 미만 제출은 자동 입력으로 간주하므로 대기

    await t('문의: 필수 항목 누락 → 항목별 오류 · 저장 안 됨', async () => {
        await page.click('.submit-btn');
        await page.waitForSelector('#inquiryResult.error');
        for (const id of ['org', 'name', 'email', 'message', 'consent']) assert(await page.locator('#' + id + 'Error.show').count() === 1, id);
        assert((await stored()).length === 0);
    });
    await t('문의: 잘못된 이메일 → 이메일 오류만', async () => {
        await fill({ org: '○○대학교 교수학습센터', name: '홍길동', email: 'ctl@univ', message: '신임 교수 대상 생성형 AI 연수를 문의드립니다.' });
        await page.check('#consent');
        await page.click('.submit-btn');
        await page.waitForSelector('#emailError.show');
        assert(await page.locator('.error-message.show').count() === 1, '이메일만 오류');
        assert((await stored()).length === 0);
    });
    await t('문의: 정상 입력 → Firestore 접수 · 성공 안내 · 양식 초기화', async () => {
        await page.fill('#email', 'ctl@univ.ac.kr');
        await page.selectOption('#program', 'B. AI 시대의 대학 교수법·평가 혁신');
        await page.selectOption('#referral', 'ChatGPT 등 AI 추천');
        await page.click('.submit-btn');
        await page.waitForSelector('#inquiryResult.success');
        assert((await page.locator('#inquiryResult').innerText()).includes('문의가 접수되었습니다'));
        const st = await stored();
        assert(st.length === 1 && st[0].org === '○○대학교 교수학습센터' && st[0].consent === true && st[0].status === 'new' && st[0].referral === 'ChatGPT 등 AI 추천', JSON.stringify(st));
        assert(await page.inputValue('#org') === '', '초기화');
    });
    await t('문의: 접수 직후 연타는 무시 (빈 양식 재제출로 성공 안내가 사라지지 않음)', async () => {
        await page.click('.submit-btn');
        await page.waitForTimeout(300);
        assert((await page.locator('#inquiryResult').innerText()).includes('문의가 접수되었습니다'));
    });
    await t('문의: 같은 내용 재제출 시 중복 확인 · 버튼 연타해도 1건만', async () => {
        await page.waitForTimeout(4200);
        await fill({ org: '○○대학교 교수학습센터', name: '홍길동', email: 'ctl@univ.ac.kr', message: '신임 교수 대상 생성형 AI 연수를 문의드립니다.' });
        await page.check('#consent');
        let asked = 0; page.once('dialog', () => { asked++; });
        await Promise.all([page.click('.submit-btn'), page.click('.submit-btn').catch(() => {}), page.click('.submit-btn').catch(() => {})]);
        await page.waitForSelector('#inquiryResult.success');
        assert(asked >= 1, '중복 확인 창');
        assert((await stored()).length === 2, '연타해도 1건 추가: ' + (await stored()).length);
    });
    await t('문의: 저장 실패 → "접수되지 않았습니다" + 메일 대안, 입력 내용 유지', async () => {
        await page.waitForTimeout(4200);
        await page.evaluate(() => { window.__FAIL_WRITES = true; });
        await fill({ org: '△△대학교 교육혁신원', name: '김담당', email: 'edu@univ.ac.kr', message: '교수법 워크숍 일정을 문의드립니다.' });
        await page.check('#consent');
        await page.click('.submit-btn');
        await page.waitForSelector('#inquiryResult.error');
        const tx = await page.locator('#inquiryResult').innerText();
        assert(tx.includes('접수되지 않았습니다') && !tx.includes('접수되었습니다'), tx);
        assert(await page.locator('#inquiryResult a[href^="mailto:dearname27@naver.com?subject="]').count() === 1, '메일 대안');
        assert(await page.inputValue('#org') === '△△대학교 교육혁신원', '입력 유지');
        await page.evaluate(() => { window.__FAIL_WRITES = false; });
    });
    await t('문의: 숨은 칸(봇) 입력 시 접수 거부', async () => {
        await page.evaluate(() => { document.getElementById('bot-field').value = 'spam'; });
        const before = (await stored()).length;
        await page.click('.submit-btn');
        await page.waitForFunction(() => /자동 입력/.test(document.getElementById('inquiryResult').textContent));
        assert((await stored()).length === before);
        await page.evaluate(() => { document.getElementById('bot-field').value = ''; });
    });
    await t('문의 페이지 JS 오류 없음', async () => { assert(!errs.length, errs.join(' | ')); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE + '/education-inquiry#inquiry');
    await page.screenshot({ path: join(out, 'screens', 'inquiry-mobile.png') });
    await ctx.close();
}

// ───────── 4. 모바일 ─────────
{
    const ctx = await newContext({ ...devices['iPhone 13'] }, ADMIN);
    const page = await ctx.newPage();
    for (const p of ['/', '/ai-instructor', '/programs', '/case-studies', '/reviews', '/insights/how-educators-verify-ai-answers/', '/education-inquiry', '/reviews-admin.html']) {
        await t(`모바일(390px) 가로 넘침 없음: ${p}`, async () => {
            await page.goto(BASE + p);
            if (p.includes('admin')) await page.waitForSelector('#app:not([hidden])');
            const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            assert(over <= 1, `가로 넘침 ${over}px`);
        });
    }
    await t('모바일 관리자: 붙여넣기 → 버튼 접근 가능', async () => {
        await page.goto(BASE + '/reviews-admin.html');
        await page.waitForSelector('#app:not([hidden])');
        await page.fill('#fOriginal', '모바일에서 붙여넣은 후기입니다.\n\n두 번째 문단.');
        assert(await page.locator('#publishBtn').isVisible() && await page.locator('#aiBtn').isVisible());
        await page.screenshot({ path: join(out, 'screens', 'admin-mobile.png'), fullPage: false });
    });
    await t('모바일 메인: 메뉴 열기 · CTA 버튼 크기(44px 이상) · 제목 넘침 없음', async () => {
        await page.goto(BASE + '/');
        await page.click('#hamburger');
        await page.locator('#navMenu a[href="/programs"]').waitFor({ state: 'visible', timeout: 3000 });
        await page.click('#hamburger');
        const h = await page.locator('.hero-buttons .btn-cta').boundingBox();
        assert(h.height >= 44, 'CTA 높이 ' + h.height);
        const over = await page.evaluate(() => { const h1 = document.querySelector('h1'); return h1.scrollWidth - h1.clientWidth; });
        assert(over <= 1, '제목 넘침');
        await page.screenshot({ path: join(out, 'screens', 'home-mobile.png') });
    });
    await t('모바일 메뉴 열기 (강사 소개 페이지)', async () => {
        await page.goto(BASE + '/ai-instructor');
        await page.click('.nav-toggle');
        assert(await page.locator('#siteNav a[href="/programs"]').isVisible());
        await page.screenshot({ path: join(out, 'screens', 'after-instructor-mobile.png') });
    });
    await ctx.close();
}

// ───────── 4-1. 태블릿 ─────────
{
    const ctx = await newContext({ ...devices['iPad (gen 7)'] });
    const page = await ctx.newPage();
    for (const p of ['/', '/programs', '/ai-instructor', '/case-studies', '/education-inquiry', '/insights/']) {
        await t(`태블릿(810px) 가로 넘침 없음: ${p}`, async () => {
            await page.goto(BASE + p);
            const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
            assert(over <= 1, `가로 넘침 ${over}px`);
        });
    }
    await page.goto(BASE + '/'); await page.screenshot({ path: join(out, 'screens', 'home-tablet.png') });
    await ctx.close();
}

// ───────── 5. 화면 캡처 (변경 후) ─────────
{
    const ctx = await newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const [p, n] of [['/', 'after-home'], ['/education-inquiry', 'after-inquiry'], ['/ai-instructor', 'after-instructor'], ['/programs', 'after-programs'], ['/case-studies', 'after-cases'], ['/reviews', 'after-reviews'], ['/insights/can-teachers-build-apps-without-coding/', 'after-insight']]) {
        await page.goto(BASE + p);
        await page.waitForTimeout(150);
        await page.screenshot({ path: join(out, 'screens', n + '.png'), fullPage: p !== '/' });
    }
    await ctx.close();
}

await browser.close();
server.close();
console.log(`\n${results.length - failed}/${results.length} 통과`);
process.exit(failed ? 1 : 0);
