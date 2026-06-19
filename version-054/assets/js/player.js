(function () {
  window.setupMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.getElementById('play-overlay');

    if (!video || !streamUrl) {
      return;
    }

    var attachStream = function () {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    var beginPlay = function () {
      if (!video.getAttribute('src') && !(window.Hls && window.Hls.isSupported())) {
        attachStream();
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    attachStream();

    if (overlay) {
      overlay.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        beginPlay();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });
  };
}());
