require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("AI Website Builder is LIVE 🚀");
});

app.use(express.static(path.join(__dirname, "../public")));


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
// Home Page
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>AI Website Generator</title>
        <style>
          body {
            font-family: Arial;
            background: #111;
            color: white;
            text-align: center;
            padding: 40px;
          }
          textarea {
            width: 80%;
            height: 120px;
            font-size: 16px;
          }
          button {
            padding: 10px 20px;
            font-size: 18px;
            background: #00ff99;
            border: none;
            cursor: pointer;
          }
          pre {
            background: #222;
            padding: 15px;
            text-align: left;
            margin-top: 20px;
            overflow: auto;
          }
        </style>
      </head>

      <body>
        <h1>🤖 AI Website Generator (Groq)</h1>

        <textarea id="prompt" placeholder="Enter website idea..."></textarea>
        <br><br>

        <button onclick="generate()">Generate</button>

        <iframe id="previewFrame" style="width:100%; height:500px; border:2px solid #00ff99; margin-top:20px;"></iframe>

        <script>
  async function generate() {
    const prompt = document.getElementById("prompt").value;

    if (!prompt.trim()) {
      alert("Please write something first!");
      return;
    }

    try {
      const res = await fetch("/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (data.result) {
        document.getElementById("previewFrame").srcdoc = data.result;
      } else {
        alert(data.error || "Something went wrong");
      }

    } catch (err) {
      console.error(err);
      alert("Server problem");
    }
  }
</script>
s

            const data = await res.json();
          if (data.result) {
  document.getElementById("previewFrame").srcdoc = data.result;
} else {
  alert(data.error || "Something went wrong");
}

        </script>
      </body>
    </html>
  `);
});

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
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
