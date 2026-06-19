(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var nav = document.querySelector('[data-site-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var form = document.querySelector('[data-filter-form]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function getFormValue(name) {
    if (!form) {
      return '';
    }

    var field = form.querySelector('[name="' + name + '"]');
    return field ? normalize(field.value) : '';
  }

  function applyFilter() {
    if (!cards.length || !form) {
      return;
    }

    var keyword = getFormValue('keyword');
    var type = getFormValue('type');
    var year = getFormValue('year');
    var genre = getFormValue('genre');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));

      var ok = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }

      if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
        ok = false;
      }

      if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
        ok = false;
      }

      if (genre && normalize(card.getAttribute('data-genre')).indexOf(genre) === -1 && normalize(card.getAttribute('data-tags')).indexOf(genre) === -1) {
        ok = false;
      }

      card.style.display = ok ? '' : 'none';

      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (form && cards.length) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (field) {
      field.addEventListener('input', applyFilter);
      field.addEventListener('change', applyFilter);
    });

    var clearButton = form.querySelector('[data-filter-clear]');

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        form.reset();
        applyFilter();
      });
    }
  }
})();
