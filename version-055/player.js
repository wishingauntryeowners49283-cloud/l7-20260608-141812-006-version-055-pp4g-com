(function () {
  var box = document.querySelector('[data-player]');
  if (!box) return;
  var video = box.querySelector('video');
  var cover = box.querySelector('.play-cover');
  var button = box.querySelector('.play-trigger');
  if (!video) return;
  var stream = video.getAttribute('data-stream');
  var started = false;

  function start() {
    if (!stream) return;
    if (!started) {
      if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
      started = true;
    }
    if (cover) cover.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (cover) cover.classList.remove('is-hidden');
      });
    }
  }

  if (cover) cover.addEventListener('click', start);
  if (button) button.addEventListener('click', function (event) {
    event.stopPropagation();
    start();
  });
  video.addEventListener('play', function () {
    if (cover) cover.classList.add('is-hidden');
  });
})();
