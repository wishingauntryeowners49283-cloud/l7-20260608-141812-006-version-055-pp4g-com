(function () {
  function attachPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var cover = wrapper.querySelector('.video-cover');
    var source = video ? video.getAttribute('data-source') : '';
    var hlsInstance = null;
    var attached = false;

    function start() {
      if (!video || !source) {
        return;
      }

      wrapper.classList.add('is-playing');

      if (!attached) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        attached = true;
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached) {
          start();
        }
      });
      video.addEventListener('play', function () {
        wrapper.classList.add('is-playing');
      });
      video.addEventListener('error', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    }
  }

  document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
