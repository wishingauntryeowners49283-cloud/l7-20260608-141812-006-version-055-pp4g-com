(function () {
  var video = document.querySelector('[data-video-url]');
  var button = document.querySelector('.play-overlay');
  var ready = false;

  function attachVideo() {
    if (!video || ready) {
      return;
    }

    var source = video.getAttribute('data-video-url');

    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = source;
    ready = true;
  }

  function playVideo() {
    attachVideo();

    if (!video) {
      return;
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }

    if (button) {
      button.classList.add('is-hidden');
    }
  }

  if (video) {
    video.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }
})();
