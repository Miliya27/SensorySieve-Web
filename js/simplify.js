

window.addEventListener("textExtracted", function (event) {
  var originalText = event.detail.text;
  simplifyText(originalText);
});

function simplifyText(originalText) {
  var controller = new AbortController();
  var timeoutId = setTimeout(function () {
    controller.abort();
  }, 6000);

  fetch("/api/simplify-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: originalText }),
    signal: controller.signal
  })
    .then(function (response) {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error("proxy returned an error status");
      }
      return response.json();
    })
    .then(function (data) {
      if (data.text) {
        fireTextReady(data.text);
      } else {
        fireTextReady(originalText);
      }
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      
      fireTextReady(originalText);
    });
}

function fireTextReady(finalText) {
  window.dispatchEvent(new CustomEvent("textReady", { detail: { text: finalText } }));
}