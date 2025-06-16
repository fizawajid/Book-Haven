const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const router = express.Router();
require("dotenv").config();

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  const { bookName, authorName } = req.body;

  if (!bookName || !authorName) {
    return res.status(400).json({ error: "Missing bookName or authorName" });
  }

  try {
    // Get the text generation model
    // Use "gemini-1.5-pro" instead of "gemini-pro"
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create the prompt for the summary
    const prompt = `Please provide a concise summary of the book "${bookName}" by ${authorName}. 
    Include key plot points, main characters, themes, and literary significance. 
    Keep the summary informative but brief, around 150-200 words.`;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    res.json({ summary });
  } catch (err) {
    console.error("Gemini API error:", err);
    
    // More detailed error handling
    let errorMessage = "Failed to generate summary";
    if (err.message && err.message.includes("models/")) {
      errorMessage = "Invalid model name or API configuration. Please check your API key and model name.";
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      message: err.message 
    });
  }
});

module.exports = router;