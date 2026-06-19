(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearchForms() {
    var forms = document.querySelectorAll(".site-search-form");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";

        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
      });
    });
  }

  function initPageFilters() {
    var toolbar = document.querySelector("[data-filter-toolbar]");

    if (!toolbar) {
      return;
    }

    var input = toolbar.querySelector("[data-filter-input]");
    var year = toolbar.querySelector("[data-year-filter]");
    var type = toolbar.querySelector("[data-type-filter]");
    var reset = toolbar.querySelector("[data-filter-reset]");
    var counter = toolbar.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !selectedYear || cardYear === selectedYear;
        var matchedType = !selectedType || cardType.indexOf(selectedType) !== -1;
        var matched = matchedKeyword && matchedYear && matchedType;

        card.classList.toggle("hidden-by-filter", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = "当前显示 " + visible + " / " + cards.length + " 部";
      }
    }

    [input, year, type].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilter);
        element.addEventListener("change", applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (year) {
          year.value = "";
        }
        if (type) {
          type.value = "";
        }
        applyFilter();
      });
    }

    applyFilter();
  }

  function movieCardTemplate(movie) {
    var tags = Array.isArray(movie.tags) ? movie.tags : [];
    var firstTag = tags[0] || movie.type || "高清";

    return [
      "<article class=\"movie-card\" data-movie-card>",
      "  <a class=\"poster-link\" href=\"" + escapeHtml(movie.detail) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
      "    <div class=\"poster-wrap\">",
      "      <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" decoding=\"async\">",
      "      <span class=\"poster-mask\"></span>",
      "      <span class=\"play-chip\">播放</span>",
      "    </div>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <div class=\"card-meta\">",
      "      <span>" + escapeHtml(movie.year) + "</span>",
      "      <span>" + escapeHtml(movie.region) + "</span>",
      "      <span>" + escapeHtml(movie.type) + "</span>",
      "    </div>",
      "    <h3><a href=\"" + escapeHtml(movie.detail) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p>" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"tag-row\">",
      "      <a href=\"category-" + escapeHtml(movie.categorySlug) + ".html\">" + escapeHtml(movie.categoryName) + "</a>",
      "      <span>" + escapeHtml(firstTag) + "</span>",
      "    </div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function initSearchPage() {
    var container = document.querySelector("[data-search-page]");

    if (!container) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = container.querySelector("[data-search-page-input]");
    var summary = container.querySelector("[data-search-summary]");
    var results = container.querySelector("[data-search-results]");
    var movies = window.MOVIE_SEARCH_INDEX || [];

    if (input) {
      input.value = query;
    }

    if (!query.trim()) {
      return;
    }

    var normalizedQuery = normalize(query);
    var matchedMovies = movies.filter(function (movie) {
      return normalize(movie.searchText).indexOf(normalizedQuery) !== -1;
    });

    if (summary) {
      summary.textContent = "搜索“" + query + "”找到 " + matchedMovies.length + " 个结果。";
    }

    if (results) {
      results.innerHTML = matchedMovies.map(movieCardTemplate).join("\n");
    }
  }

  function canPlayNativeHls(video) {
    return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
  }

  function setMessage(player, message) {
    var messageBox = player.querySelector("[data-player-message]");

    if (messageBox) {
      messageBox.textContent = message || "";
    }
  }

  function initPlayers() {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var overlay = player.querySelector("[data-player-overlay]");
      var source = player.getAttribute("data-video-url");
      var started = false;

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener("click", function () {
        if (started) {
          video.play();
          return;
        }

        started = true;
        setMessage(player, "正在加载播放源...");

        if (canPlayNativeHls(video)) {
          video.src = source;
          video.controls = true;
          if (overlay) {
            overlay.classList.add("hidden");
          }
          video.play().catch(function () {
            setMessage(player, "浏览器阻止了自动播放，请再次点击视频播放。 ");
          });
          return;
        }

        import("./hls-dru42stk.js")
          .then(function (module) {
            var Hls = module.H;

            if (!Hls || !Hls.isSupported()) {
              throw new Error("当前浏览器不支持 HLS 播放。 ");
            }

            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            video.controls = true;

            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              if (overlay) {
                overlay.classList.add("hidden");
              }
              setMessage(player, "");
              video.play().catch(function () {
                setMessage(player, "播放源已就绪，请再次点击视频播放。 ");
              });
            });

            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage(player, "播放源加载失败，请刷新页面后重试。 ");
              }
            });
          })
          .catch(function (error) {
            setMessage(player, error.message || "播放器初始化失败。 ");
          });
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initSearchForms();
    initPageFilters();
    initSearchPage();
    initPlayers();
  });
})();
