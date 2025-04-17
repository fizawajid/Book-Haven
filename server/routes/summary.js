const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

router.post("/", async (req, res) => {
  const { bookName, authorName } = req.body;

  if (!bookName || !authorName) {
    return res.status(400).json({ error: "Missing bookName or authorName" });
  }

  const prompt = `Summarize the book titled "${bookName}" by ${authorName}. Focus on the plot, main characters, and themes.`;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/google/pegasus-cnn_dailymail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`, // Corrected here
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Hugging Face API error:", data.error);
      return res.status(500).json({ error: "Failed to generate summary" });
    }

    res.json({ summary: data[0]?.summary_text || "No summary available." });
  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
