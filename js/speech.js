

var Speech = (function () {
  'use strict';

  var currentUtterance = null;

  function read(text, onFinished) {
    if (typeof window.speechSynthesis === 'undefined') {
      if (onFinished) onFinished();
      return;
    }

    stop();

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onend = function () {
      currentUtterance = null;
      if (onFinished) onFinished();
    };

    utterance.onerror = function () {
      currentUtterance = null;
      if (onFinished) onFinished();
    };

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (typeof window.speechSynthesis === 'undefined') {
      return;
    }

    window.speechSynthesis.cancel();
    currentUtterance = null;
  }

  return {
    read: read,
    stop: stop
  };
})();