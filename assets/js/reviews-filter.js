// /reviews (서버 렌더링 페이지) — 분류 링크를 누르면 새로고침 없이 카드만 걸러 보여줍니다.
// JS가 꺼져 있어도 링크(?cat=)로 서버가 같은 결과를 렌더링합니다.
(function () {
    var grid = document.getElementById('rvGrid');
    var empty = document.getElementById('rvEmpty');
    if (!grid) return;
    var links = document.querySelectorAll('.rv-filter a[data-cat]');
    function apply(cat) {
        var shown = 0;
        grid.querySelectorAll('.rv-card').forEach(function (card) {
            var cats = (card.getAttribute('data-categories') || '').split(' ');
            var ok = !cat || cats.indexOf(cat) !== -1;
            card.hidden = !ok;
            if (ok) shown++;
        });
        links.forEach(function (a) {
            if (a.getAttribute('data-cat') === cat) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
        });
        if (empty) empty.hidden = shown > 0;
    }
    links.forEach(function (a) {
        a.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            var cat = a.getAttribute('data-cat') || '';
            history.replaceState(null, '', cat ? '?cat=' + cat : location.pathname);
            apply(cat);
        });
    });
})();
