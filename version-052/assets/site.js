(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterPanel && filterList) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var year = filterPanel.querySelector('[data-filter-year]');
    var type = filterPanel.querySelector('[data-filter-type]');
    var reset = filterPanel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));

    function applyFilters() {
      var query = input.value.trim().toLowerCase();
      var selectedYear = year.value;
      var selectedType = type.value;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        card.style.display = matchQuery && matchYear && matchType ? '' : 'none';
      });
    }

    input.addEventListener('input', applyFilters);
    year.addEventListener('change', applyFilters);
    type.addEventListener('change', applyFilters);
    reset.addEventListener('click', function () {
      input.value = '';
      year.value = '';
      type.value = '';
      applyFilters();
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');

  if (searchForm && searchInput && searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function renderSearch(query) {
      var normalized = query.trim().toLowerCase();
      var matches = window.SEARCH_MOVIES.filter(function (movie) {
        if (!normalized) {
          return false;
        }
        return movie.text.indexOf(normalized) !== -1;
      }).slice(0, 120);

      if (!normalized) {
        searchResults.innerHTML = '<div class="text-panel"><h2>输入关键词开始搜索</h2><p>可搜索片名、地区、年份、类型、标签或剧情关键词。</p></div>';
        return;
      }

      if (!matches.length) {
        searchResults.innerHTML = '<div class="text-panel"><h2>没有找到相关影片</h2><p>请尝试更换片名、地区、年份或类型关键词。</p></div>';
        return;
      }

      searchResults.innerHTML = '<div class="section-heading"><div><h2>搜索结果</h2><p>共显示 ' + matches.length + ' 条相关影片</p></div></div><div class="movie-grid standard-grid">' + matches.map(function (movie) {
        return '<article class="movie-card standard">' +
          '<a class="poster-link" href="' + movie.url + '">' +
          '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
          '<span class="duration">' + movie.duration + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>' +
          '<p class="line-clamp-2">' + movie.desc + '</p>' +
          '<div class="meta-row"><span>★ ' + movie.rating + '</span><span>' + movie.year + '</span><span>' + movie.type + '</span></div>' +
          '<div class="meta-row muted"><span>' + movie.region + '</span><span>' + movie.genre + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('') + '</div>';
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      renderSearch(query);
    });

    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });

    renderSearch(initialQuery);
  }
})();
