(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero-slider]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var root = panel.parentElement;
    var input = panel.querySelector('[data-search-input]');
    var regionSelect = panel.querySelector('[data-region-filter]');
    var yearSelect = panel.querySelector('[data-year-filter]');
    var typeSelect = panel.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .rank-row'));
    var status = root.querySelector('[data-result-status]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    function fillSelect(select, values) {
      if (!select) {
        return;
      }
      values.filter(Boolean).sort().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    fillSelect(regionSelect, Array.from(new Set(cards.map(function (card) { return card.dataset.region || ''; }))));
    fillSelect(yearSelect, Array.from(new Set(cards.map(function (card) { return card.dataset.year || ''; }))).sort(function (a, b) { return Number(b) - Number(a); }));
    fillSelect(typeSelect, Array.from(new Set(cards.map(function (card) { return card.dataset.type || ''; }))));

    if (input && query) {
      input.value = query;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' ').toLowerCase();
        var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
          (!region || card.dataset.region === region) &&
          (!year || card.dataset.year === year) &&
          (!type || card.dataset.type === type);

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = visible ? '已匹配到 ' + visible + ' 个结果' : '没有匹配结果';
      }
    }

    [input, regionSelect, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });

  var playerShell = document.querySelector('[data-player-shell]');

  if (playerShell) {
    var video = playerShell.querySelector('video');
    var playButton = playerShell.querySelector('[data-play-button]');
    var prepared = false;
    var hls = null;

    function preparePlayer() {
      if (prepared || !video) {
        return;
      }
      prepared = true;
      var stream = video.dataset.stream;
      if (!stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startPlayer() {
      preparePlayer();
      playerShell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayer);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayer();
      }
    });

    video.addEventListener('play', function () {
      playerShell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      playerShell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }
})();
