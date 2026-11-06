// 공용 스크립트: 모바일 메뉴 + 성과 측정 이벤트(GA4)
// data-track="이벤트명" data-track-label="위치" 를 단 링크/버튼을 누르면 GA4 이벤트를 보냅니다.
// (기존 GA4 G-KWCY47PZWB 설정을 재사용하며 개인정보는 보내지 않습니다)
(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('siteNav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }
    document.addEventListener('click', function (e) {
        var el = e.target.closest && e.target.closest('[data-track]');
        if (!el || typeof window.gtag !== 'function') return;
        window.gtag('event', el.getAttribute('data-track'), {
            link_label: el.getAttribute('data-track-label') || '',
            page_path: location.pathname,
        });
    });
})();
