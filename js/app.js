var currentText = "";
window.currentMode = null;

window.addEventListener("textReady", function (event) {
  currentText = event.detail.text;
  showScreen("screen-mode-select");
});

document.getElementById("pick-dyslexia").addEventListener("click", function () {
  window.currentMode = "dyslexia";
  showScreen("screen-dyslexia");
  var outputBox = document.getElementById("dyslexia-output");
  DyslexiaMode.render(currentText, outputBox);
});

document.getElementById("pick-focus").addEventListener("click", function () {
  window.currentMode = "focus";
  showScreen("screen-focus");
  var outputBox = document.getElementById("focus-output");
  FocusMode.render(currentText, outputBox);
});

document.getElementById("back-from-dyslexia").addEventListener("click", function () {
  window.currentMode = null;
  showScreen("screen-mode-select");
});

document.getElementById("back-from-focus").addEventListener("click", function () {
  window.currentMode = null;
  showScreen("screen-mode-select");
});

document.getElementById("nav-home").addEventListener("click", function (e) {
  e.preventDefault();
  window.currentMode = null;
  showScreen("screen-home");
});

document.getElementById("logo-home-link").addEventListener("click", function () {
  window.currentMode = null;
  showScreen("screen-home");
});

function showScreen(screenId) {
  var allScreens = document.querySelectorAll(".screen");
  for (var i = 0; i < allScreens.length; i++) {
    allScreens[i].classList.remove("active");
  }
  document.getElementById(screenId).classList.add("active");
  window.scrollTo(0, 0);
}