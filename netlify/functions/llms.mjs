// /llms.txt — 사이트 사실 요약 + 게시된 후기 목록을 실시간으로 (Netlify Function)
// 후기를 새로 게시하면 다시 빌드하지 않아도 이 파일에 반영됩니다. Firestore를 못 읽으면 후기 없이 출력합니다.
import { buildLlmsTxt } from '../../src/site/seo.mjs';
import { loadReviews } from './reviews.mjs';

export const handler = async () => {
    let reviews = [];
    try { reviews = await loadReviews(); } catch (e) { console.error('llms: 후기 조회 실패', e); }
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=600' },
        body: buildLlmsTxt(reviews),
    };
};
