

var FocusMode = (function () {
  'use strict';

  var rulerBandHeight = 90;
  var bionicBoldFraction = 0.45;

  var currentMoveHandler = null;
  var currentWrapper = null;
  var mediaWatcher = null;

  

  function makeBionicWord(word) {
    if (word.length === 0) {
      return '';
    }

    var boldLength = Math.ceil(word.length * bionicBoldFraction);
    var boldPart = word.slice(0, boldLength);
    var restPart = word.slice(boldLength);

    var innerHtml = '<b class="ss-focus-bionic-bold">' + boldPart + '</b>';
    innerHtml += '<span class="ss-focus-bionic-rest">' + restPart + '</span>';
    var cleanWord = word.toLowerCase().replace(/[^a-z']/g, '');

    var html = '<span class="ss-focus-word" data-word="' + cleanWord + '">';
    html += innerHtml;
    html += '</span>';

    return html;
  }

  function makeBionicParagraph(paragraph) {
    var words = paragraph.split(' ');
    var bionicWords = [];

    for (var i = 0; i < words.length; i++) {
      bionicWords.push(makeBionicWord(words[i]));
    }

    return bionicWords.join(' ');
  }

  function buildTextHtml(text) {
    var paragraphs = text.split(/\n+/).filter(function (p) {
      return p.trim().length > 0;
    });

    if (paragraphs.length === 0) {
      paragraphs = [text];
    }

    var html = '';
    for (var i = 0; i < paragraphs.length; i++) {
      html += '<p>' + makeBionicParagraph(paragraphs[i]) + '</p>';
    }

    return html;
  }

  

  function moveRulerTo(pointerY, wrapper) {
    var topBar = wrapper.querySelector('.ss-focus-ruler-top');
    var bottomBar = wrapper.querySelector('.ss-focus-ruler-bottom');

    if (!topBar || !bottomBar) return;

    var wrapperHeight = wrapper.offsetHeight;
    var bandTop = pointerY - rulerBandHeight / 2;
    var bandBottom = pointerY + rulerBandHeight / 2;

    if (bandTop < 0) bandTop = 0;
    if (bandBottom > wrapperHeight) bandBottom = wrapperHeight;

    topBar.style.height = bandTop + 'px';
    bottomBar.style.height = (wrapperHeight - bandBottom) + 'px';
  }

  function getPointerY(event, wrapper) {
    var wrapperBox = wrapper.getBoundingClientRect();

    if (event.touches && event.touches.length > 0) {
      return event.touches[0].clientY - wrapperBox.top;
    }

    return event.clientY - wrapperBox.top;
  }

  function attachRulerTracking(wrapper) {
    if (currentMoveHandler && currentWrapper) {
      currentWrapper.removeEventListener('mousemove', currentMoveHandler);
      currentWrapper.removeEventListener('touchmove', currentMoveHandler);
    }

    currentMoveHandler = function (event) {
      var pointerY = getPointerY(event, wrapper);
      moveRulerTo(pointerY, wrapper);
    };

    wrapper.addEventListener('mousemove', currentMoveHandler);
    wrapper.addEventListener('touchmove', currentMoveHandler, { passive: true });

    currentWrapper = wrapper;

    moveRulerTo(wrapper.offsetHeight / 2, wrapper);
  }

  

  function pauseVideosAndAudio(wrapper) {
    var mediaElements = wrapper.querySelectorAll('video, audio');

    for (var i = 0; i < mediaElements.length; i++) {
      try {
        mediaElements[i].pause();
      } catch (error) {
        
      }
    }
  }

  function freezeGifs(wrapper) {
    var gifImages = wrapper.querySelectorAll(
      'img[src*=".gif"]:not(.ss-focus-gif-frozen)'
    );

    for (var i = 0; i < gifImages.length; i++) {
      var image = gifImages[i];

      try {
        var snapshotCanvas = document.createElement('canvas');
        snapshotCanvas.className = 'ss-focus-gif-snapshot';
        snapshotCanvas.width = image.naturalWidth || image.width;
        snapshotCanvas.height = image.naturalHeight || image.height;
        snapshotCanvas.style.width = getComputedStyle(image).width;
        snapshotCanvas.style.height = getComputedStyle(image).height;

        var context = snapshotCanvas.getContext('2d');
        context.drawImage(image, 0, 0, snapshotCanvas.width, snapshotCanvas.height);

        image.classList.add('ss-focus-gif-frozen');
        image.parentNode.insertBefore(snapshotCanvas, image.nextSibling);
      } catch (error) {
        
      }
    }
  }

  function startMotionFreeze(wrapper) {
    pauseVideosAndAudio(wrapper);
    wrapper.classList.add('ss-focus-frozen');
    freezeGifs(wrapper);

    mediaWatcher = new MutationObserver(function () {
      pauseVideosAndAudio(wrapper);
      freezeGifs(wrapper);
    });

    mediaWatcher.observe(wrapper, { childList: true, subtree: true });
  }

  

  function buildControlsHtml() {
    var html = '';
    html += '<div class="ss-focus-controls">';

    html += '  <div class="ss-focus-control-group">';
    html += '    <label for="ss-focus-font-size-slider">Font size</label>';
    html += '    <input type="range" id="ss-focus-font-size-slider" min="14" max="28" value="19" step="1">';
    html += '  </div>';

    html += '  <div class="ss-focus-control-group">';
    html += '    <label for="ss-focus-line-height-slider">Spacing</label>';
    html += '    <input type="range" id="ss-focus-line-height-slider" min="14" max="24" value="18" step="1">';
    html += '  </div>';

    html += '  <div class="ss-focus-control-group">';
    html += '    <label for="ss-focus-contrast-slider">Contrast</label>';
    html += '    <input type="range" id="ss-focus-contrast-slider" min="70" max="130" value="100" step="5">';
    html += '  </div>';

    html += '  <button type="button" class="ss-focus-read-btn">Read Aloud</button>';

    html += '</div>';

    return html;
  }

  function attachControlListeners(wrapper, text) {
    var fontSizeSlider = wrapper.querySelector('#ss-focus-font-size-slider');
    var lineHeightSlider = wrapper.querySelector('#ss-focus-line-height-slider');
    var contrastSlider = wrapper.querySelector('#ss-focus-contrast-slider');
    var readButton = wrapper.querySelector('.ss-focus-read-btn');

    fontSizeSlider.addEventListener('input', function () {
      wrapper.style.setProperty('--ss-focus-font-size', fontSizeSlider.value + 'px');
    });

    lineHeightSlider.addEventListener('input', function () {
      var ratio = lineHeightSlider.value / 10;
      wrapper.style.setProperty('--ss-focus-line-height', ratio);
    });

    contrastSlider.addEventListener('input', function () {
      wrapper.style.setProperty('--ss-focus-contrast', contrastSlider.value + '%');
    });

    readButton.addEventListener('click', function () {
      
      if (typeof Speech === 'undefined') {
        return;
      }

      if (readButton.classList.contains('ss-focus-reading')) {
        Speech.stop();
        readButton.classList.remove('ss-focus-reading');
        readButton.textContent = 'Read Aloud';
        return;
      }

      readButton.classList.add('ss-focus-reading');
      readButton.textContent = 'Stop Reading';

      Speech.read(text, function onFinished() {
        readButton.classList.remove('ss-focus-reading');
        readButton.textContent = 'Read Aloud';
      });
    });
  }

  

  function attachHoverDefine(wrapper) {

    if (typeof HoverDefine === 'undefined') {
      return;
    }

    var textBox = wrapper.querySelector('.ss-focus-text');
    HoverDefine.attach(textBox);
  }

  

  function buildWrapperHtml(text) {
    var textHtml = buildTextHtml(text);
    var controlsHtml = buildControlsHtml();

    var html = '';
    html += '<div class="ss-focus-wrapper">';
    html += '  <div class="ss-focus-ruler-top"></div>';
    html += '  <div class="ss-focus-ruler-bottom"></div>';
    html += controlsHtml;
    html += '  <div class="ss-focus-text">' + textHtml + '</div>';
    html += '</div>';

    return html;
  }

  

  function render(text, container) {
    if (!container) {
      return;
    }

    if (mediaWatcher) {
      mediaWatcher.disconnect();
      mediaWatcher = null;
    }

    if (typeof Speech !== 'undefined') {
      Speech.stop();
    }

    container.innerHTML = buildWrapperHtml(text);

    var wrapper = container.querySelector('.ss-focus-wrapper');
    attachRulerTracking(wrapper);
    startMotionFreeze(wrapper);
    attachControlListeners(wrapper, text);
    attachHoverDefine(wrapper);
  }

  return {
    render: render
  };
})();