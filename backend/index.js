require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Generate API
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.json({ error: "Prompt missing" });
    }

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content:
            "You are an expert web developer. Generate a complete HTML page with inline CSS and JS.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res.json({
      result: chatCompletion.choices[0].message.content,
    });

  } catch (err) {
    console.error(err);
    res.json({ error: "Groq API Error" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
