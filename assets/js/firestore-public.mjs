// 공개 후기 읽기 (Firestore REST, 로그인 없이) — 브라우저와 Netlify 함수에서 함께 사용
// firestore.rules 에서 status=='published' && consentStatus=='confirmed' 인 문서만 공개 읽기를 허용하므로,
// 쿼리에도 같은 조건을 반드시 넣어야 합니다 (규칙은 필터가 아니라서 조건이 없으면 거부됩니다).
// Firebase 웹 API 키는 공개용 식별자이며, 접근 권한은 보안 규칙이 결정합니다.

export const FIREBASE_PUBLIC = {
    projectId: 'philosophyaiedumain',
    apiKey: 'AIzaSyBylDxamogm1_g2URVxGQFz_c05pOWqjEI',
};

function decodeValue(v) {
    if (!v || typeof v !== 'object') return null;
    if ('stringValue' in v) return v.stringValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('timestampValue' in v) return v.timestampValue;
    if ('nullValue' in v) return null;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
    if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
    return null;
}
export function decodeFields(fields) {
    const o = {};
    for (const [k, v] of Object.entries(fields || {})) o[k] = decodeValue(v);
    return o;
}

const eq = (field, value) => ({
    fieldFilter: {
        field: { fieldPath: field }, op: 'EQUAL',
        value: typeof value === 'boolean' ? { booleanValue: value } : { stringValue: String(value) },
    },
});

/**
 * 게시된(동의 확인된) 후기 목록.
 * @param {{featuredOnly?: boolean, slug?: string, limit?: number, fetchImpl?: Function, timeoutMs?: number}} opts
 */
export async function fetchPublishedReviews(opts = {}) {
    const { featuredOnly = false, slug = '', limit = 300, fetchImpl = globalThis.fetch, timeoutMs = 6000 } = opts;
    const filters = [eq('status', 'published'), eq('consentStatus', 'confirmed')];
    if (featuredOnly) filters.push(eq('featured', true));
    if (slug) filters.push(eq('slug', slug));
    const body = {
        structuredQuery: {
            from: [{ collectionId: 'reviews' }],
            where: { compositeFilter: { op: 'AND', filters } },
            limit,
        },
    };
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PUBLIC.projectId}/databases/(default)/documents:runQuery?key=${FIREBASE_PUBLIC.apiKey}`;
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    try {
        const res = await fetchImpl(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined,
        });
        if (!res.ok) throw new Error(`Firestore ${res.status}`);
        const rows = await res.json();
        return (Array.isArray(rows) ? rows : [])
            .filter(r => r && r.document)
            .map(r => ({ id: r.document.name.split('/').pop(), ...decodeFields(r.document.fields) }))
            // 방어적 재확인 (규칙과 동일 조건)
            .filter(r => r.status === 'published' && r.consentStatus === 'confirmed');
    } finally {
        if (timer) clearTimeout(timer);
    }
}
