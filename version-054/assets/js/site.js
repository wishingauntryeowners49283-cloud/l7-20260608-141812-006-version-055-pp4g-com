(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', mobileNav.classList.contains('is-open'));
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    var showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    var startTimer = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var searchBox = scope.querySelector('[data-search-box]');
    var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
    var container = scope.parentElement || document;
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
    var emptyState = scope.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    var applyFilter = function () {
      var keyword = searchBox ? searchBox.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var filterText = activeFilter === 'all' ? '' : activeFilter.toLowerCase();
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var filterMatched = !filterText || text.indexOf(filterText) !== -1;
        var shouldShow = keywordMatched && filterMatched;

        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    };

    if (searchBox) {
      searchBox.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-filter') || 'all';
        applyFilter();
      });
    });
  });
}());
