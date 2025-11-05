require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const axios = require("axios");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Allow dev frontend and tools to call without CORS issues
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to get response from Groq API
const getGroqChatCompletion = async (pdfContent) => {
  const prompt = `${pdfContent}\n\nCompare it with new Indian laws and highlight what are added or removed (changes).`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "No response from Groq.";
  } catch (error) {
    console.error("❌ Groq API error:", error);
    return "Error processing text with Groq.";
  }
};

// POST route to extract text from PDF and send it to Groq
// Accept either field name: 'pdf' or 'contract'
app.post("/analyze", upload.fields([{ name: "pdf" }, { name: "contract" }]), async (req, res) => {
  const pdfFile = (req.files?.pdf?.[0]) || (req.files?.contract?.[0]);
  if (!pdfFile) {
    return res.status(400).json({ error: "PDF file is required. Provide field 'pdf' or 'contract'." });
  }

  try {
    // Parse the PDF text
    const pdfText = await pdfParse(pdfFile.buffer);

    // Send the extracted text to Groq API with comparison prompt
    const groqResponse = await getGroqChatCompletion(pdfText.text);

    // Return both keys for frontend compatibility
    res.json({ pdfContent: pdfText.text, groqResponse, analysis: groqResponse });
  } catch (error) {
    console.error("❌ Error processing PDF:", error);
    res.status(500).json({ error: "Error analyzing the PDF." });
  }
});

// Text analysis endpoint to support JSON { query }
app.post("/analyze-text", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "'query' text is required." });
    }
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: query }],
      model: "llama-3.3-70b-versatile",
    });
    const analysis = response.choices[0]?.message?.content || "No response";
    res.json({ analysis });
  } catch (error) {
    console.error("❌ Error analyzing text:", error);
    res.status(500).json({ error: "Failed to fetch AI insights" });
  }
});

// OpenAI chat proxy endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "'message' is required." });
    }
    // If no OpenAI key but GROQ is available, fallback directly
    if (!process.env.OPENAI_API_KEY && process.env.GROQ_API_KEY) {
      const systemPrompt = "You are a helpful AI legal assistant for the Indian legal context. Provide concise, accurate guidance with references when relevant. Avoid offering guaranteed legal outcomes and suggest consulting a lawyer for critical matters.";
      try {
        const groqResp = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...(Array.isArray(history) ? history : []),
            { role: "user", content: message },
          ],
        });
        const content = groqResp.choices?.[0]?.message?.content || "";
        return res.json({ reply: content, provider: "groq" });
      } catch (ge) {
        return res.status(500).json({ error: ge?.message || "Groq fallback failed" });
      }
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server" });
    }

    const systemPrompt = "You are a helpful AI legal assistant for the Indian legal context. Provide concise, accurate guidance with references when relevant. Avoid offering guaranteed legal outcomes and suggest consulting a lawyer for critical matters.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message },
    ];

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
        max_tokens: 600,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content || "";
    return res.json({ reply: content, provider: "openai" });
  } catch (error) {
    const status = error?.response?.status || 500;
    const payload = error?.response?.data || null;
    const msg = payload?.error?.message || error?.message || "Failed to get response from OpenAI";
    console.error("❌ OpenAI /chat error:", { status, msg, payload });

    // If quota (429) or explicit quota message, try Groq fallback when configured
    const isQuota = status === 429 || /quota/i.test(String(msg));
    if (isQuota && process.env.GROQ_API_KEY) {
      try {
        const { message, history } = req.body || {};
        const systemPrompt = "You are a helpful AI legal assistant for the Indian legal context. Provide concise, accurate guidance with references when relevant. Avoid offering guaranteed legal outcomes and suggest consulting a lawyer for critical matters.";
        const groqResp = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            ...(Array.isArray(history) ? history : []),
            { role: "user", content: message },
          ],
        });
        const content = groqResp.choices?.[0]?.message?.content || "";
        return res.json({ reply: content, provider: "groq" });
      } catch (ge) {
        console.error("❌ Groq fallback failed:", ge?.response?.data || ge.message);
        return res.status(status).json({ error: msg, details: payload });
      }
    }

    return res.status(status).json({ error: msg, details: payload });
  }
});

// Health check for chat config
app.get("/chat/health", (req, res) => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  res.json({ ok: true, openaiKey: hasKey });
});

// Root health for convenience
app.get("/health", (req, res) => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  res.json({ ok: true, service: "legal-ai-pro-backend", port: PORT, openaiKey: hasKey });
});

// Start server
const PORT = 5002;
app.listen(PORT, () => {
  const hasKey = Boolean(process.env.OPENAI_API_KEY);
  console.log(`✅ Server running on port ${PORT} (OPENAI_API_KEY: ${hasKey ? 'set' : 'missing'})`);
});

