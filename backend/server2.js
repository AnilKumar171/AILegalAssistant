require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const axios = require("axios");
const bcrypt = require("bcryptjs");

const { connectMongo } = require("./db");
const User = require("./models/User");

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Allow requests from any localhost port (covers Vite at 5173 AND the random
// ephemeral port the Google OAuth popup uses) plus any future prod domain.
const IS_PROD = process.env.NODE_ENV === "production";
const ALLOWED_ORIGINS = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // In development, allow any origin to avoid localhost/127.0.0.1/LAN mismatches.
      if (!IS_PROD) {
        return callback(null, true);
      }
      // Allow requests with no origin (curl / mobile clients / same-origin)
      if (!origin || ALLOWED_ORIGINS.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Minimal auth request logging to debug UI issues
app.use((req, _res, next) => {
  if (req.path.startsWith("/auth/")) {
    console.log(`🔐 ${req.method} ${req.path}`);
  }
  next();
});

// Connect MongoDB Atlas (fail fast on misconfig)
connectMongo()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((e) => {
    console.error("❌ MongoDB connection failed:", e?.message || e);
    process.exit(1);
  });

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  // Mongoose doc or plain object
  const obj = typeof userDoc.toJSON === "function" ? userDoc.toJSON() : userDoc;
  return {
    id: String(obj._id || obj.id || ""),
    email: obj.email,
    name: obj.name,
    picture: obj.picture,
    provider: obj.provider,
  };
}

// ─── Email/Password Auth ──────────────────────────────────────────────────────
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) {
      return res.status(400).json({ error: "email, name, and password are required" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(409).json({ error: "User already exists. Please sign in." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      name: String(name).trim(),
      provider: "email",
      passwordHash,
      lastLoginAt: new Date(),
    });

    return res.json({ ok: true, user: sanitizeUser(user) });
  } catch (e) {
    console.error("❌ /auth/signup error:", e);
    return res.status(500).json({ error: "Signup failed" });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || user.provider !== "email" || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.json({ ok: true, user: sanitizeUser(user) });
  } catch (e) {
    console.error("❌ /auth/login error:", e);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ─── Google OAuth verification endpoint ──────────────────────────────────────
// Supports either:
// - { credential } (Google ID token from @react-oauth/google)
// - { access_token } (legacy flow)
app.post("/auth/google", async (req, res) => {
  try {
    const { credential, access_token } = req.body || {};

    let email, name, picture, sub;
    if (credential) {
      // Validate ID token server-side
      const tokenInfo = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
        params: { id_token: credential },
        timeout: 15000,
      });
      email = tokenInfo.data?.email;
      name = tokenInfo.data?.name;
      picture = tokenInfo.data?.picture;
      sub = tokenInfo.data?.sub;
    } else if (access_token) {
      const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 15000,
      });
      ({ email, name, picture, sub } = response.data || {});
    } else {
      return res.status(400).json({ error: "credential or access_token is required" });
    }

    if (!email) {
      return res.status(401).json({ error: "Unable to retrieve email from Google" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const updated = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          email: normalizedEmail,
          name: String(name || normalizedEmail.split("@")[0]),
          picture: picture || undefined,
          provider: "google",
          googleId: sub || undefined,
          lastLoginAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return res.json({ ok: true, user: sanitizeUser(updated) });
  } catch (err) {
    console.error("❌ Google token verification failed:", err?.response?.data || err.message);
    return res.status(401).json({ error: "Invalid or expired Google token" });
  }
});

// ─── Case Outcome Predictor ───────────────────────────────────────────────────
app.post("/api/predict-case", async (req, res) => {
  const { description, caseType, jurisdiction } = req.body || {};

  if (!description || !caseType || !jurisdiction) {
    return res.status(400).json({ error: "description, caseType, and jurisdiction are required." });
  }
  if (description.trim().length < 30) {
    return res.status(400).json({ error: "Case description must be at least 30 characters." });
  }

  const systemPrompt = `You are an expert Indian legal analyst with deep knowledge of Indian case law, statutes, and judicial precedents. Analyze cases objectively and provide data-driven predictions.`;

  const userPrompt = `Analyze the following legal case and predict its outcome in the Indian legal context.

Case Type: ${caseType}
Jurisdiction: ${jurisdiction}
Case Description: ${description}

Respond ONLY with a valid JSON object — no explanation, no markdown — in this exact format:
{
  "probability": <integer 0-100 representing the petitioner/plaintiff win probability>,
  "factors": [<4-6 strings, each a specific legal factor affecting the outcome — mix of favourable and unfavourable>],
  "similar_cases": [
    {
      "name": "<Indian case name with citation if possible>",
      "year": "<year>",
      "outcome": "<Favourable/Unfavourable/Mixed>",
      "relevance": "<one sentence explaining why this case is a precedent here>"
    }
  ],
  "analysis": "<2-3 sentence overall legal analysis explaining the prediction>"
}

Ensure similar_cases has 2-3 real or representative Indian legal cases.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const raw = chatCompletion.choices[0]?.message?.content || "";
    console.log("🔍 Raw Groq response:", raw.slice(0, 300));

    // Extract JSON — handle potential markdown code fences
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in response:", raw);
      return res.status(500).json({ error: "AI returned an unexpected format. Please try again." });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate & sanitize
    const result = {
      probability: Math.min(100, Math.max(0, Number(parsed.probability) || 50)),
      factors: Array.isArray(parsed.factors) ? parsed.factors.slice(0, 8) : [],
      similar_cases: Array.isArray(parsed.similar_cases) ? parsed.similar_cases.slice(0, 4) : [],
      analysis: parsed.analysis || "",
    };

    return res.json(result);
  } catch (err) {
    console.error("❌ /api/predict-case error:", err);
    return res.status(500).json({ error: "Failed to generate prediction. Please try again." });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

// ─── AI Legal Document Generator ──────────────────────────────────────────────
app.post("/api/generate-document", async (req, res) => {
  const { docType, partyA, partyB, jurisdiction, keyTerms } = req.body || {};

  if (!docType || !partyA || !partyB || !jurisdiction || !keyTerms) {
    return res.status(400).json({ error: "All fields are required (docType, partyA, partyB, jurisdiction, keyTerms)." });
  }

  const systemPrompt = `You are an expert Indian legal drafter. Generate a precise, formal, and legally sound document based on the user's inputs. The output MUST be the plain text of the document ONLY, with NO introductory conversational text and NO markdown formatting (like asterisks or bold tags) because it will be displayed directly in a text editor. Use standard legal clauses appropriate for Indian jurisdiction.`;

  const userPrompt = `Generate a ${docType} with the following details:
- Party A (First Party): ${partyA}
- Party B (Second Party): ${partyB}
- Jurisdiction: ${jurisdiction}
- Key Terms to Include: ${keyTerms}

Please provide the full legal document. Remember: NO markdown formatting.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const generatedText = chatCompletion.choices[0]?.message?.content || "";
    
    return res.json({ document: generatedText });
  } catch (err) {
    console.error("❌ /api/generate-document error:", err);
    return res.status(500).json({ error: "Failed to generate document. Please try again." });
  }
});
// ─────────────────────────────────────────────────────────────────────────────

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
    const { message, history, language = "en-IN" } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "'message' is required." });
    }

    const languageMap = {
      'en-IN': 'English',
      'hi-IN': 'Hindi',
      'te-IN': 'Telugu'
    };
    const targetLanguage = languageMap[language] || 'English';

    const baseSystemPrompt = "You are a helpful AI legal assistant for the Indian legal context. Provide concise, accurate guidance with references when relevant. Avoid offering guaranteed legal outcomes and suggest consulting a lawyer for critical matters.";
    const systemPrompt = `${baseSystemPrompt} You MUST reply entirely in ${targetLanguage}. If the user speaks in ${targetLanguage}, match their language and tone perfectly.`;

    // If no OpenAI key but GROQ is available, fallback directly
    if (!process.env.OPENAI_API_KEY && process.env.GROQ_API_KEY) {
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



// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const Groq = require("groq-sdk");
// const axios = require("axios");

// const app = express();
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// // Allow dev frontend and tools to call without CORS issues
// app.use(cors());
// app.use(express.json());

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Function to get response from Groq API
// const getGroqChatCompletion = async (pdfContent) => {
//   const prompt = `${pdfContent}\n\nCompare it with new Indian laws and highlight what are added or removed (changes).`;

//   try {
//     const chatCompletion = await groq.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: "llama-3.3-70b-versatile",
//     });

//     return chatCompletion.choices[0]?.message?.content || "No response from Groq.";
//   } catch (error) {
//     console.error("❌ Groq API error:", error);
//     return "Error processing text with Groq.";
//   }
// };

// // POST route to extract text from PDF and send it to Groq
// // Accept either field name: 'pdf' or 'contract'
// app.post("/analyze", upload.fields([{ name: "pdf" }, { name: "contract" }]), async (req, res) => {
//   const pdfFile = (req.files?.pdf?.[0]) || (req.files?.contract?.[0]);
//   if (!pdfFile) {
//     return res.status(400).json({ error: "PDF file is required. Provide field 'pdf' or 'contract'." });
//   }

//   try {
//     // Parse the PDF text
//     const pdfText = await pdfParse(pdfFile.buffer);

//     // Send the extracted text to Groq API with comparison prompt
//     const groqResponse = await getGroqChatCompletion(pdfText.text);

//     // Return both keys for frontend compatibility
//     res.json({ pdfContent: pdfText.text, groqResponse, analysis: groqResponse });
//   } catch (error) {
//     console.error("❌ Error processing PDF:", error);
//     res.status(500).json({ error: "Error analyzing the PDF." });
//   }
// });

// // Text analysis endpoint to support JSON { query }
// app.post("/analyze-text", async (req, res) => {
//   try {
//     const { query } = req.body || {};
//     if (!query || typeof query !== 'string') {
//       return res.status(400).json({ error: "'query' text is required." });
//     }
//     const response = await groq.chat.completions.create({
//       messages: [{ role: "user", content: query }],
//       model: "llama-3.3-70b-versatile",
//     });
//     const analysis = response.choices[0]?.message?.content || "No response";
//     res.json({ analysis });
//   } catch (error) {
//     console.error("❌ Error analyzing text:", error);
//     res.status(500).json({ error: "Failed to fetch AI insights" });
//   }
// });

// // OpenAI chat proxy endpoint
// app.post("/chat", async (req, res) => {
//   try {
//     const { message, history } = req.body || {};
//     if (!message || typeof message !== "string") {
//       return res.status(400).json({ error: "'message' is required." });
//     }
//     // If no OpenAI key but GROQ is available, fallback directly
//     if (!process.env.OPENAI_API_KEY && process.env.GROQ_API_KEY) {
//       const systemPrompt = "You are a helpful AI legal assistant for the Indian legal context. Provide concise, accurate guidance with references when relevant. Avoid offering guaranteed legal outcomes and suggest consulting a lawyer for critical matters.";
//       try {
//         const groqResp = await groq.chat.completions.create({
//           model: "llama-3.3-70b-versatile",
//           messages: [
//             { role: "system", content: systemPrompt },
//             ...(Array.isArray(history) ? history : []),
//             { role: "user", content: message },
//           ],
//         });
//         const content = groqResp.choices?.[0]?.message?.content || "";
//         return res.json({ reply: content, provider: "groq" });
//       } catch (ge) {
//         return res.status(500).json({ error: ge?.message || "Groq fallback failed" });
//       }
//     }
//     if (!process.env.OPENAI_API_KEY) {
//       return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server" });
//     }

//     const systemPrompt = "You are a helpful AI legal assistant for the Indian legal context. Provide concise, accurate guidance with references when relevant. Avoid offering guaranteed legal outcomes and suggest consulting a lawyer for critical matters.";

//     const messages = [
//       { role: "system", content: systemPrompt },
//       ...(Array.isArray(history) ? history : []),
//       { role: "user", content: message },
//     ];

//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-4o-mini",
//         messages,
//         temperature: 0.3,
//         max_tokens: 600,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         timeout: 30000,
//       }
//     );

//     const content = response.data?.choices?.[0]?.message?.content || "";
//     return res.json({ reply: content, provider: "openai" });
//   } catch (error) {
//     const status = error?.response?.status || 500;
//     const payload = error?.response?.data || null;
//     const msg = payload?.error?.message || error?.message || "Failed to get response from OpenAI";
//     console.error("❌ OpenAI /chat error:", { status, msg, payload });

//     // If quota (429) or explicit quota message, try Groq fallback when configured
//     const isQuota = status === 429 || /quota/i.test(String(msg));
//     if (isQuota && process.env.GROQ_API_KEY) {
//       try {
//         const { message, history } = req.body || {};
//         const systemPrompt = "You are a helpful AI legal assistant for the Indian legal context. Provide concise, accurate guidance with references when relevant. Avoid offering guaranteed legal outcomes and suggest consulting a lawyer for critical matters.";
//         const groqResp = await groq.chat.completions.create({
//           model: "llama-3.3-70b-versatile",
//           messages: [
//             { role: "system", content: systemPrompt },
//             ...(Array.isArray(history) ? history : []),
//             { role: "user", content: message },
//           ],
//         });
//         const content = groqResp.choices?.[0]?.message?.content || "";
//         return res.json({ reply: content, provider: "groq" });
//       } catch (ge) {
//         console.error("❌ Groq fallback failed:", ge?.response?.data || ge.message);
//         return res.status(status).json({ error: msg, details: payload });
//       }
//     }

//     return res.status(status).json({ error: msg, details: payload });
//   }
// });

// // Health check for chat config
// app.get("/chat/health", (req, res) => {
//   const hasKey = Boolean(process.env.OPENAI_API_KEY);
//   res.json({ ok: true, openaiKey: hasKey });
// });

// // Root health for convenience
// app.get("/health", (req, res) => {
//   const hasKey = Boolean(process.env.OPENAI_API_KEY);
//   res.json({ ok: true, service: "legal-ai-pro-backend", port: PORT, openaiKey: hasKey });
// });

// // Start server
// const PORT = 5002;
// app.listen(PORT, () => {
//   const hasKey = Boolean(process.env.OPENAI_API_KEY);
//   console.log(`✅ Server running on port ${PORT} (OPENAI_API_KEY: ${hasKey ? 'set' : 'missing'})`);
// });

