
var DyslexiaMode = {
  render: function (text, container) {
    container.innerHTML = "";

    var wrapper = document.createElement("div");
    wrapper.className = "dyslexia-text dyslexia-cream";
    wrapper.id = "dyslexia-wrapper";

    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.length > 0) {
        addParagraph(line, wrapper);
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

function addParagraph(lineText, wrapper) {
  var paraBlock = document.createElement("div");
  paraBlock.style.marginBottom = "12px";

  var p = document.createElement("p");
  p.textContent = lineText;
  p.style.cursor = "pointer";
  paraBlock.appendChild(p);

  var explainBtn = document.createElement("button");
  explainBtn.textContent = "Explain simpler";
  explainBtn.className = "dyslexia-explain-btn";
  explainBtn.style.display = "none";
  paraBlock.appendChild(explainBtn);

  var explainOutput = document.createElement("p");
  explainOutput.className = "dyslexia-explain-output";
  explainOutput.style.display = "none";
  paraBlock.appendChild(explainOutput);

  p.addEventListener("click", function () {
    explainBtn.style.display = "inline-block";
  });

  explainBtn.addEventListener("click", function () {
    explainBtn.textContent = "Thinking...";
    explainBtn.disabled = true;

    fetch("/api/simplify-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lineText, mode: "explain" })
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        explainOutput.textContent = data.text || "Could not explain this right now.";
        explainOutput.style.display = "block";
        explainBtn.style.display = "none";
      })
      .catch(function (err) {
        explainOutput.textContent = "Could not explain this right now.";
        explainOutput.style.display = "block";
        explainBtn.style.display = "none";
      });
  });

  wrapper.appendChild(paraBlock);
}

function getTintColor(tint) {
  if (tint === "cream") return "#f5f0dc";
  if (tint === "yellow") return "#fdf6b2";
  if (tint === "blue") return "#e0f0fa";
  if (tint === "green") return "#e3f2e1";
  return "#ffffff";
}