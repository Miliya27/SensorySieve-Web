

var DyslexiaMode = {
  render: function (text, container) {
    
    container.innerHTML = "";
    var wrapper = document.createElement("div");
    wrapper.className = "dyslexia-text dyslexia-cream";
    var p = document.createElement("p");
    p.textContent = text;
    wrapper.appendChild(p);

    
    var picker = document.createElement("div");
    picker.className = "dyslexia-tint-picker";

    var tints = ["cream", "yellow", "blue", "green"];
    for (var i = 0; i < tints.length; i++) {
      var tint = tints[i];
      var btn = document.createElement("button");
      btn.style.backgroundColor = getTintColor(tint);
      btn.onclick = (function (tintName) {
        return function () {
          wrapper.className = "dyslexia-text dyslexia-" + tintName;
        };
      })(tint);
      picker.appendChild(btn);
    }

    container.appendChild(picker);
    container.appendChild(wrapper);
  }
};

function getTintColor(tint) {
  if (tint === "cream") return "#f5f0dc";
  if (tint === "yellow") return "#fdf6b2";
  if (tint === "blue") return "#e0f0fa";
  if (tint === "green") return "#e3f2e1";
  return "#ffffff";
}