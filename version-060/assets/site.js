(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5200);
      }
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var scope = form.parentElement ? form.parentElement.parentElement : document;
      var input = form.querySelector("[data-filter-input]");
      var year = form.querySelector("[data-filter-year]");
      var region = form.querySelector("[data-filter-region]");
      function cards() {
        var main = form.closest("main") || document;
        return Array.prototype.slice.call(main.querySelectorAll("[data-movie-card]"));
      }
      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }
      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        cards().forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var visible = true;
          if (keyword && text.indexOf(keyword) === -1) {
            visible = false;
          }
          if (yearValue && cardYear !== yearValue) {
            visible = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            visible = false;
          }
          card.classList.toggle("is-hidden", !visible);
        });
      }
      form.addEventListener("input", apply);
      form.addEventListener("change", apply);
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      form.addEventListener("reset", function () {
        setTimeout(apply, 0);
      });
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var source = player.getAttribute("data-video");
      var layer = player.querySelector("[data-play-layer]");
      var loaded = false;
      var hlsInstance = null;
      function load() {
        if (!video || !source || loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }
      function start() {
        load();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }
      player.querySelectorAll("[data-play]").forEach(function (button) {
        button.addEventListener("click", start);
      });
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          }
        });
      }
      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
