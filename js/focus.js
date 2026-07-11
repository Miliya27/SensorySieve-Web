
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

    var html = '<b class="ss-focus-bionic-bold">' + boldPart + '</b>';
    html += '<span class="ss-focus-bionic-rest">' + restPart + '</span>';

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

  // 
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
        // Cross-origin images can block this. Skip and move on.
      }
    }
  }

  function startMotionFreeze(wrapper) {
    pauseVideosAndAudio(wrapper);
    wrapper.classList.add('ss-focus-frozen');
    freezeGifs(wrapper);

    // In case media gets added to the container later (e.g. a slow
    // extraction result that streams in), catch it too.
    mediaWatcher = new MutationObserver(function () {
      pauseVideosAndAudio(wrapper);
      freezeGifs(wrapper);
    });

    mediaWatcher.observe(wrapper, { childList: true, subtree: true });
  }

  
  function buildWrapperHtml(text) {
    var textHtml = buildTextHtml(text);

    var html = '';
    html += '<div class="ss-focus-wrapper">';
    html += '  <div class="ss-focus-ruler-top"></div>';
    html += '  <div class="ss-focus-ruler-bottom"></div>';
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

    container.innerHTML = buildWrapperHtml(text);

    var wrapper = container.querySelector('.ss-focus-wrapper');
    attachRulerTracking(wrapper);
    startMotionFreeze(wrapper);
  }

  return {
    render: render
  };
})();