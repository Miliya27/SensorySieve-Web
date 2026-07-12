

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests allowed" });
    return;
  }

  var text = req.body.text;
  var mode = req.body.mode || "simplify";

  if (!text) {
    res.status(400).json({ error: "No text provided" });
    return;
  }

  var promptText;
  if (mode === "explain") {
    promptText = "Explain the following sentence or passage in much simpler, plain everyday words. Keep it short, one or two sentences max. Do not add extra information, just rephrase it simpler.\n\n" + text;
  } else {
    promptText = "Restructure the following text into clear bullet points, without losing any meaning or important detail. Only return the bullet points, nothing else.\n\n" + text;
  }

  var apiKey = process.env.LLM_API_KEY;

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: promptText
          }
        ]
      })
    });

    var data = await response.json();

    if (!data.choices || !data.choices[0]) {
      res.status(500).json({ error: "Simplify call failed" });
      return;
    }

    var resultText = data.choices[0].message.content;

    res.status(200).json({ text: resultText });
  } catch (err) {
    res.status(500).json({ error: "Simplify call failed" });
  }
};