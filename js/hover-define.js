

var HoverDefine = (function () {
  'use strict';

  var DICTIONARY_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  var LOOKUP_TIMEOUT_MS = 6000;
  var MIN_WORD_LENGTH = 6;

  
  var commonWords = [
    'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this',
    'but', 'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its',
    'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about',
    'would', 'there', 'could', 'other', 'after', 'first', 'well',
    'also', 'because', 'people', 'through', 'these', 'should', 'over',
    'think', 'most', 'even', 'find', 'many', 'here', 'thing', 'give',
    'still', 'name', 'good', 'sentence', 'great', 'where', 'help',
    'through', 'much', 'before', 'line', 'right', 'too', 'same',
    'tell', 'boy', 'follow', 'came', 'want', 'show', 'also', 'around',
    'form', 'three', 'small', 'set', 'put', 'end', 'does', 'another',
    'well', 'large', 'must', 'big', 'even', 'such', 'because', 'turn',
    'here', 'why', 'ask', 'went', 'men', 'read', 'need', 'land',
    'different', 'home', 'move', 'try', 'kind', 'hand', 'picture',
    'again', 'change', 'off', 'play', 'spell', 'air', 'away', 'animal',
    'house', 'point', 'page', 'letter', 'mother', 'answer', 'found',
    'study', 'still', 'learn', 'should', 'america', 'world', 'high',
    'every', 'near', 'add', 'food', 'between', 'own', 'below',
    'country', 'plant', 'last', 'school', 'father', 'keep', 'tree',
    'never', 'start', 'city', 'earth', 'eye', 'light', 'thought',
    'head', 'under', 'story', 'saw', 'left', 'don\u2019t', 'few',
    'while', 'along', 'might', 'close', 'something', 'seem', 'next',
    'hard', 'open', 'example', 'begin', 'life', 'always', 'those',
    'both', 'paper', 'together', 'got', 'group', 'often', 'run',
    'important', 'until', 'children', 'side', 'feet', 'car', 'mile',
    'night', 'walk', 'white', 'sea', 'began', 'grow', 'took', 'river',
    'four', 'carry', 'state', 'once', 'book', 'hear', 'stop', 'without',
    'second', 'later', 'miss', 'idea', 'enough', 'eat', 'face', 'watch',
    'far', 'indian', 'really', 'almost', 'let', 'above', 'girl',
    'sometimes', 'mountain', 'cut', 'young', 'talk', 'soon', 'list',
    'song', 'being', 'leave', 'family'
  ];

  var commonWordSet = {};
  for (var i = 0; i < commonWords.length; i++) {
    commonWordSet[commonWords[i]] = true;
  }

  var definitionCache = {};

  var activeTooltip = null;

  

  function isDifficultWord(word) {
    if (!word) return false;
    if (word.length < MIN_WORD_LENGTH) return false;
    if (commonWordSet[word]) return false;

    return true;
  }

  function markDefinableWords(container) {
    var wordSpans = container.querySelectorAll('.ss-focus-word');

    for (var i = 0; i < wordSpans.length; i++) {
      var span = wordSpans[i];
      var word = span.getAttribute('data-word');

      if (isDifficultWord(word)) {
        span.classList.add('ss-focus-definable');
      }
    }
  }

  

  function fetchDefinition(word, onSuccess) {
    if (definitionCache[word]) {
      onSuccess(definitionCache[word]);
      return;
    }

    var controller = new AbortController();
    var timeoutId = setTimeout(function () {
      controller.abort();
    }, LOOKUP_TIMEOUT_MS);

    fetch(DICTIONARY_API_BASE + encodeURIComponent(word), { signal: controller.signal })
      .then(function (response) {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error('word not found');
        }
        return response.json();
      })
      .then(function (data) {
        var entry = data[0];
        var meaning = entry.meanings && entry.meanings[0];
        var definitionText = meaning && meaning.definitions && meaning.definitions[0]
          ? meaning.definitions[0].definition
          : null;

        if (!definitionText) {
          return; 
        }

        var result = {
          word: word,
          definition: definitionText,
          phonetic: entry.phonetic || ''
        };

        definitionCache[word] = result;
        onSuccess(result);
      })
      .catch(function () {
        
      });
  }

  function showTooltip(span, info) {
    hideTooltip();

    var tooltip = document.createElement('div');
    tooltip.className = 'ss-focus-tooltip';

    var wordLine = document.createElement('div');
    wordLine.className = 'ss-focus-tooltip-word';
    wordLine.textContent = info.word;
    tooltip.appendChild(wordLine);

    if (info.phonetic) {
      var phoneticLine = document.createElement('div');
      phoneticLine.className = 'ss-focus-tooltip-phonetic';
      phoneticLine.textContent = info.phonetic;
      tooltip.appendChild(phoneticLine);
    }

    var definitionLine = document.createElement('div');
    definitionLine.textContent = info.definition;
    tooltip.appendChild(definitionLine);

    document.body.appendChild(tooltip);

    var spanBox = span.getBoundingClientRect();
    var tooltipBox = tooltip.getBoundingClientRect();

    var top = window.scrollY + spanBox.top - tooltipBox.height - 8;
    var left = window.scrollX + spanBox.left;

    // Keep the tooltip from running off the top of the page.
    if (top < window.scrollY) {
      top = window.scrollY + spanBox.bottom + 8;
    }

    
    var maxLeft = window.scrollX + document.documentElement.clientWidth - tooltipBox.width - 12;
    if (left > maxLeft) {
      left = maxLeft;
    }

    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';

    activeTooltip = tooltip;
  }

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  function attachHoverEvents(container) {
    var definableSpans = container.querySelectorAll('.ss-focus-definable');

    for (var i = 0; i < definableSpans.length; i++) {
      var span = definableSpans[i];

      span.addEventListener('mouseenter', function (event) {
        var target = event.currentTarget;
        var word = target.getAttribute('data-word');

        fetchDefinition(word, function (info) {
          showTooltip(target, info);
        });
      });

      span.addEventListener('mouseleave', function () {
        hideTooltip();
      });
    }
  }


  function attach(container) {
    if (!container) return;

    markDefinableWords(container);
    attachHoverEvents(container);
  }

  return {
    attach: attach
  };
})();