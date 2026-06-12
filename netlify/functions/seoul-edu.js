// 서울 교육 공공데이터 프록시 (Netlify Function)
// ─────────────────────────────────────────────────────────────
// data.seoul.go.kr API 는 http(8080/8088) + CORS 미지원이라 브라우저에서 직접 호출하면
// Mixed-content / CORS 로 차단됩니다. 이 함수가 서버에서 대신 호출해 결과만 넘겨줍니다.
//
// Netlify 환경변수 설정 (Site settings → Environment variables):
//   SEOUL_API_KEY  : data.seoul.go.kr 에서 발급받은 인증키 (필수)
//   SEOUL_SERVICE  : 가져올 서비스명(데이터셋 ID). 교육청·학교 통계 데이터셋의
//                    서비스명을 넣으세요. (선택, 기본값 neisSchoolInfo)
//
// 호출 예: /.netlify/functions/seoul-edu?start=1&end=100

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=600', // 10분 캐시
    };

    const KEY = process.env.SEOUL_API_KEY;
    if (!KEY) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'SEOUL_API_KEY 환경변수가 설정되지 않았습니다.' }),
        };
    }

    const params = event.queryStringParameters || {};
    const start = Math.max(1, parseInt(params.start, 10) || 1);
    const end = Math.min(start + 999, parseInt(params.end, 10) || start + 99); // 1회 최대 1000건
    // 서비스명은 영숫자/언더스코어만 허용 (인젝션 방지)
    const service = String(params.service || process.env.SEOUL_SERVICE || 'neisSchoolInfo')
        .replace(/[^a-zA-Z0-9_]/g, '');

    const url = `http://openapi.seoul.go.kr:8088/${KEY}/json/${service}/${start}/${end}/`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const block = data[service] || {};
        const result = block.RESULT || data.RESULT || {};
        if (result.CODE && result.CODE !== 'INFO-000') {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: result.MESSAGE || '서울 공공데이터 API 오류', code: result.CODE }),
            };
        }

        const rows = Array.isArray(block.row) ? block.row : [];
        const total = block.list_total_count || rows.length;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ service, total, rows }),
        };
    } catch (e) {
        return {
            statusCode: 502,
            headers,
            body: JSON.stringify({ error: '서울 공공데이터 호출 실패: ' + e.message }),
        };
    }
};
