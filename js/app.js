

var currentText = "";

window.addEventListener("textReady", function (event) {
  currentText = event.detail.text;
  renderCurrentMode();
});

var dyslexiaToggle = document.getElementById("dyslexia-toggle");
var focusToggle = document.getElementById("focus-toggle");

dyslexiaToggle.addEventListener("change", function () {
  if (dyslexiaToggle.checked) {
    focusToggle.checked = false;
  }
  renderCurrentMode();
});

focusToggle.addEventListener("change", function () {
  if (focusToggle.checked) {
    dyslexiaToggle.checked = false;
  }
  renderCurrentMode();
});

function renderCurrentMode() {
  var outputBox = document.getElementById("reader-output");

  if (!currentText) {
    return;
  }

  if (dyslexiaToggle.checked) {
    DyslexiaMode.render(currentText, outputBox);
  } else if (focusToggle.checked) {
    FocusMode.render(currentText, outputBox);
  } else {
    
    outputBox.innerHTML = "";
    var p = document.createElement("p");
    p.textContent = currentText;
    outputBox.appendChild(p);
  }
}