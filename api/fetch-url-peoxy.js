module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests allowed" });
    return;
  }

  var url = req.body.url;

  if (!url) {
    res.status(400).json({ error: "No url provided" });
    return;
  }

  var parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (err) {
    res.status(400).json({ error: "That doesn't look like a valid URL" });
    return;
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    res.status(400).json({ error: "Only http and https URLs are allowed" });
    return;
  }

  var controller = new AbortController();
  var timeoutId = setTimeout(function () {
    controller.abort();
  }, 8000);

  try {
    var response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      res.status(502).json({ error: "Could not fetch that page (status " + response.status + ")" });
      return;
    }

    var html = await response.text();
    var text = extractReadableText(html);

    res.status(200).json({ text: text });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      res.status(504).json({ error: "Fetching that page took too long" });
    } else {
      res.status(500).json({ error: "Something went wrong fetching that page" });
    }
  }
};

function extractReadableText(html) {
  
  var cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, "");

  cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, "");

  
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#39;/g, "'");

  
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}