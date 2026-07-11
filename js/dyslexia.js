

var DyslexiaMode = {
  render: function (text, container) {
    // clear whatever was in there before
    container.innerHTML = "";


    var wrapper = document.createElement("div");
    wrapper.className = "dyslexia-text dyslexia-cream";
    wrapper.id = "dyslexia-wrapper";

    
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.length > 0) {
        var p = document.createElement("p");
        p.textContent = line;
        p.style.marginBottom = "8px";
        wrapper.appendChild(p);
      }
    }


    var picker = document.createElement("div");
    picker.className = "dyslexia-tint-picker";

    var tints = ["cream", "yellow", "blue", "green"];
    for (var j = 0; j < tints.length; j++) {
      var tint = tints[j];
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