// 로컬 테스트 서버 — Netlify 동작을 흉내 냅니다.
//  - /ai-instructor → ai-instructor.html, /insights/ → insights/index.html (pretty URL)
//  - /reviews, /reviews/* → netlify/functions/reviews.mjs, /sitemap.xml → sitemap.mjs
//  - /.netlify/functions/review-ai → review-ai.mjs (AI_MODE=mock|off 로 테스트)
//  - /__fake/reviews (PUT) : 가짜 Firestore가 저장한 후기를 SSR 함수가 읽는 파일에 기록
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'tests', 'e2e', 'output');
mkdirSync(outDir, { recursive: true });
const fixture = join(outDir, 'reviews-store.json');
if (!existsSync(fixture)) writeFileSync(fixture, '[]');
process.env.REVIEWS_FIXTURE = fixture;

const reviews = await import('../../netlify/functions/reviews.mjs');
const sitemap = await import('../../netlify/functions/sitemap.mjs');
const ai = await import('../../netlify/functions/review-ai.mjs');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

function resolveStatic(p) {
    const f = join(root, decodeURIComponent(p));
    if (!f.startsWith(root)) return null;
    const cands = p.endsWith('/') ? [join(f, 'index.html')] : [f, f + '.html', join(f, 'index.html')];
    return cands.find(c => existsSync(c) && statSync(c).isFile()) || null;
}

const send = (res, r) => { res.writeHead(r.statusCode, r.headers); res.end(r.body); };

export function start(port = 0, { aiMode = process.env.AI_MODE || 'mock' } = {}) {
    const state = { aiMode };
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, 'http://x');
        const body = await new Promise(r => { let b = ''; req.on('data', c => { b += c; }); req.on('end', () => r(b)); });
        const event = { path: url.pathname, httpMethod: req.method, headers: req.headers, body, queryStringParameters: Object.fromEntries(url.searchParams) };
        try {
            if (url.pathname === '/__fake/reviews' && req.method === 'PUT') { writeFileSync(fixture, body); res.end('ok'); return; }
            if (url.pathname === '/__fake/ai' && req.method === 'PUT') { state.aiMode = body; res.end('ok'); return; }
            if (url.pathname === '/reviews' || url.pathname.startsWith('/reviews/')) return send(res, await reviews.handler(event));
            if (url.pathname === '/sitemap.xml') return send(res, await sitemap.handler(event));
            if (url.pathname === '/.netlify/functions/review-ai') {
                if (state.aiMode === 'off') { const k = process.env.ANTHROPIC_API_KEY; delete process.env.ANTHROPIC_API_KEY; const r = await ai.handler(event, {}, { verifyAdmin: async () => ({ ok: true }) }); if (k) process.env.ANTHROPIC_API_KEY = k; return send(res, r); }
                return send(res, await ai.handler(event, {}, {
                    verifyAdmin: async (t) => t === 'fake-admin-token' ? { ok: true } : { ok: false, status: 403, error: 'admin_only' },
                    summarize: async (text) => ({ model: 'mock', parsed: mockSummary(text) }),
                }));
            }
            const file = resolveStatic(url.pathname);
            if (!file) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(readFileSync(join(root, '404.html'))); return; }
            res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
            res.end(readFileSync(file));
        } catch (e) { console.error(e); res.writeHead(500); res.end(String(e)); }
    });
    return new Promise(r => server.listen(port, '127.0.0.1', () => r({ server, port: server.address().port, state })));
}

// 원문에서 실제 문장을 근거로 고르는 가짜 AI (실제 모델 호출 없음)
function mockSummary(text) {
    const sents = text.split(/(?<=[.!?。])\s+|\n+/).map(s => s.trim()).filter(Boolean);
    const find = (re) => sents.find(s => re.test(s)) || '';
    const c = find(/몰랐|막막|어려|고민|걱정/), p = find(/만들|실습|앱|배웠/), ch = find(/앞으로|활용해|달라|이제/);
    return {
        title: '코딩을 몰랐지만 AI를 활용해 앱을 완성한 후기',
        concernBefore: c ? { text: '코딩 경험 부족으로 앱 제작에 어려움을 느낌', evidence: c } : { text: '언급 없음', evidence: '' },
        memorablePractice: p ? { text: 'AI를 활용한 앱 제작', evidence: p } : { text: '언급 없음', evidence: '' },
        changeAfter: ch ? { text: '수업 활용 의향을 갖게 됨', evidence: ch } : { text: '언급 없음', evidence: '' },
        summary: '코딩 경험 없이 AI와 함께 앱을 완성한 후기.',
        program: 'vibe-coding', categories: ['vibe-coding'], authorType: '교사', warnings: [],
    };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const { port } = await start(Number(process.env.PORT || 8888));
    console.log('test server http://127.0.0.1:' + port);
}
