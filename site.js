(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function submitSearch(form) {
    var input = form.querySelector('input[name="q"]');
    var value = input ? input.value.trim() : '';
    var target = './search.html';
    if (value) {
      target += '?q=' + encodeURIComponent(value);
    }
    window.location.href = target;
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submitSearch(form);
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  if (slides.length) {
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');
    if (next) {
      next.addEventListener('click', function () { show(current + 1); });
    }
    if (prev) {
      prev.addEventListener('click', function () { show(current - 1); });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); });
    });
    show(0);
    setInterval(function () { show(current + 1); }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('[data-card]'));
    var textInput = document.querySelector('[data-filter-text]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (textInput && query) {
      textInput.value = query;
    }
    function normalize(value) {
      return (value || '').toString().toLowerCase();
    }
    function apply() {
      var q = normalize(textInput && textInput.value);
      var y = yearSelect ? yearSelect.value : '';
      var t = typeSelect ? typeSelect.value : '';
      var r = regionSelect ? regionSelect.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var hay = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type'));
        var ok = true;
        if (q && hay.indexOf(q) === -1) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (t && card.getAttribute('data-type') !== t) ok = false;
        if (r && card.getAttribute('data-region') !== r) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }
    [textInput, yearSelect, typeSelect, regionSelect].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
    apply();
  }
})();
