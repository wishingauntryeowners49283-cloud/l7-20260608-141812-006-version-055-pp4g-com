(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupLocalFilters() {
    var inputs = document.querySelectorAll("[data-filter-input]");
    inputs.forEach(function (input) {
      var list = document.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item"));
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region")
          ].join(" "));
          card.classList.toggle("is-filter-hidden", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  function setupSearchPage() {
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!input || !results || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render(query) {
      var keyword = normalize(query);
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags
        ].join(" "));
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 80);
      title.textContent = keyword ? "与“" + query + "”相关的影片" : "热门影片检索";
      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">未找到匹配影片</div>';
        return;
      }
      results.innerHTML = matches.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster-link" href="' + movie.href + '">',
          '    <div class="poster-image" style="background-image: linear-gradient(180deg, rgba(17, 24, 39, 0.06), rgba(17, 24, 39, 0.82)), url(\'./' + movie.image + '.jpg\');">',
          '      <span class="poster-badge">' + movie.year + '</span>',
          '      <span class="poster-play">▶</span>',
          '    </div>',
          '    <div class="card-content">',
          '      <div class="card-meta"><span>' + movie.type + '</span><span>' + movie.region + '</span></div>',
          '      <h3>' + movie.title + '</h3>',
          '      <p>' + movie.oneLine + '</p>',
          '      <div class="tag-row"><span>' + movie.genre + '</span></div>',
          '    </div>',
          '  </a>',
          '</article>'
        ].join("");
      }).join("");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initial);
  }

  function setupPlayers() {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var message = player.querySelector("[data-player-message]");
      var hls = null;
      var initialized = false;
      if (!video || !button) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
      }

      function clearMessage() {
        if (!message) {
          return;
        }
        message.textContent = "";
        message.classList.remove("is-visible");
      }

      function attachSource() {
        var source = button.getAttribute("data-video-src");
        if (!source) {
          showMessage("视频暂时无法加载");
          return Promise.reject(new Error("missing source"));
        }
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;
        clearMessage();
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            clearMessage();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("视频加载失败，请稍后重试");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          showMessage("当前浏览器不支持 HLS 播放");
          return Promise.reject(new Error("unsupported hls"));
        }
        return Promise.resolve();
      }

      function playVideo() {
        attachSource().then(function () {
          button.classList.add("is-hidden");
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              button.classList.remove("is-hidden");
              showMessage("请再次点击播放按钮开始播放");
            });
          }
        }).catch(function () {});
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
        clearMessage();
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
