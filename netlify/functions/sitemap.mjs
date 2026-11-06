// /sitemap.xml — 정적 페이지 + 게시된 후기의 고유 URL (Netlify Function)
import { buildSitemapXml } from '../../src/site/seo.mjs';
import { loadReviews } from './reviews.mjs';

export const handler = async () => {
    let reviews = [];
    try { reviews = await loadReviews(); } catch (e) { console.error('sitemap: 후기 조회 실패, 정적 페이지만 출력', e); }
    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
        body: buildSitemapXml(reviews),
    };
};
