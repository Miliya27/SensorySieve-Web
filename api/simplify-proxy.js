

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests allowed" });
    return;
  }

  var text = req.body.text;

  if (!text) {
    res.status(400).json({ error: "No text provided" });
    return;
  }

  var apiKey = process.env.LLM_API_KEY;

  try {
    var response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: "Restructure the following text into clear bullet points, without losing any meaning or important detail. Only return the bullet points, nothing else.\n\n" + text
          }
        ]
      })
    });

    var data = await response.json();
    var bulletText = data.content[0].text;

    res.status(200).json({ text: bulletText });
  } catch (err) {
    res.status(500).json({ error: "Simplify call failed" });
  }
};