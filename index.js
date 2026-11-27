export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. ጥያቄ የሚያመነጭ የAPI መስመር (Backend)
    if (request.method === "POST" && url.pathname === "/api/generate") {
      try {
        const { domain } = await request.json();
        const questionData = await generatePharmacyQuestion(domain, env);
        return new Response(JSON.stringify(questionData), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "ጥያቄውን ማመንጨት አልተቻለም፣ እባክዎ በድጋሚ ይሞክሩ። (" + err.message + ")" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 2. ዋናው የድረ-ገጽ ገጽታ (Frontend HTML/CSS/JS)
    return new Response(renderHTML(), {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};

async function getAvailableModels(apiKey) {
  const defaultModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash"
  ];

  try {
    const res = await fetch(`https://googleapis.com{apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (data.models && Array.isArray(data.models)) {
        const liveFlashModels = data.models
          .filter(m => 
            m.name.includes("flash") && 
            !m.name.includes("2.5") && 
            !m.name.includes("2.0") &&
            m.supportedGenerationMethods?.includes("generateContent")
          )
          .map(m => m.name.replace("models/", ""));
        
        return [...new Set([...defaultModels, ...liveFlashModels])];
      }
    }
  } catch (e) {
    // ዝርዝሩን ማምጣት ካልቻለ ነባሮቹን ይጠቀማል
  }
  return defaultModels;
}

async function generatePharmacyQuestion(domain, env) {
  const apiKey = (env.GEMINI_API_KEY || env.GoogleGeminiApiKey || env.API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("API Key በCloudflare Settings ውስጥ አልተጨመረም።");
  }

  const prompt = `Generate 1 challenging multiple-choice Ethiopian Pharmacy licensing exam (EHPLE / COC) question for the domain: "${domain}".
Return ONLY a valid JSON object. Do NOT include markdown formatting like \`\`\`json. Ensure all quotes inside text are properly escaped.
Use this exact JSON structure:
{
  "question": "Detailed clinical or pharmaceutical question here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Clear explanation why the answer is correct and others are wrong."
}`;

  const models = await getAvailableModels(apiKey);
  let lastError = null;

  for (let i = 0; i < models.length; i++) {
    const currentModel = models[i];
    try {
      const fullUrl = `https://googleapis.com{currentModel}:generateContent?key=${apiKey}`;

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error (${currentModel}): ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const candidate = data.candidates && data.candidates.at(0);
      const part = candidate && candidate.content && candidate.content.parts && candidate.content.parts.at(0);
      let rawText = part && part.text;

      if (!rawText) {
        throw new Error("AI ባዶ መልስ ልኳል።");
      }

      const cleaned = cleanJSON(rawText);
      const parsed = JSON.parse(cleaned);

      if (parsed.question && Array.isArray(parsed.options) && typeof parsed.correctIndex === "number") {
        return parsed;
      }
      throw new Error("ያልተሟላ የጥያቄ ቅርጸት");
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  throw lastError;
}

function cleanJSON(text) {
  let str = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBrace = str.indexOf("{");
  const lastBrace = str.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    str = str.substring(firstBrace, lastBrace + 1);
  }
  return str;
}

function renderHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PHARMACY EHPLE Exit Exam and COC</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f3f4f6;
      display: flex;
      justify-content: center;
      padding: 20px;
      margin: 0;
    }
    .card {
      background: white;
      border-radius: 18px;
      padding: 24px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 22px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }
    h1 {
      font-size: 18px;
      line-height: 1.25;
      margin: 0;
      font-weight: 800;
      background: linear-gradient(135deg, #0d9488, #1d4ed8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .score-box {
      background: #e6f4f1;
      color: #0f766e;
      padding: 8px 14px;
      border-radius: 12px;
      font-weight: 700;
      text-align: center;
      font-size: 14px;
      flex-shrink: 0;
      border: 1px solid #ccfbf1;
    }
    select, button {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      font-size: 15px;
      margin-bottom: 14px;
      box-sizing: border-box;
    }
    select {
      border: 1px solid #d1d5db;
      background: #f9fafb;
      color: #111827;
      font-weight: 500;
    }
    button.primary {
      background: linear-gradient(135deg, #0d9488, #026aa7);
      color: white;
      border: none;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(2, 106, 167, 0.25);
      transition: transform 0.15s, opacity 0.2s;
    }
    button.primary:hover {
      opacity: 0.95;
    }
    button.primary:disabled {
      background: #93c5fd;
      box-shadow: none;
      cursor: not-allowed;
    }
    .question-text {
      font-size: 16px;
      line-height: 1.55;
      color: #1f2937;
      margin: 16px 0;
      font-weight: 600;
    }
    .option-btn {
      text-align: left;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      color: #111827;
      margin-bottom: 10px;
      cursor: pointer;
      transition: 0.2s;
    }
    .option-btn:hover:not(:disabled) {
      background: #f0fdfa;
      border-color: #0d9488;
    }
    .option-btn.correct {
      background: #dcfce7;
      border-color: #22c55e;
      color: #166534;
      font-weight: 600;
    }
    .option-btn.wrong {
      background: #fee2e2;
      border-color: #ef4444;
      color: #991b1b;
    }
    .explanation {
      background: #f0fdfa;
      border-left: 4px solid #0d9488;
      padding: 12px;
      margin-top: 14px;
      font-size: 14px;
      color: #1e293b;
      line-height: 1.5;
      border-radius: 6px;
    }
    .error-msg {
      color: #b91c1c;
      background: #fef2f2;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 10px;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="brand">
        <svg class="logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://w3.org">
          <defs>
            <linearGradient id="pharmGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#0d9488"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#pharmGrad)" fill-opacity="0.12"/>
          <path d="M27 16H37V27H48V37H37V48H27V37H16V27H27V16Z" fill="url(#pharmGrad)"/>
        </svg>
        <h1>PHARMACY EHPLE Exit Exam and COC</h1>
      </div>
      <div class="score-box" id="scoreBox">Score<br/>0 / 0</div>
    </div>

    <select id="domainSelect">
      <option value="Pharmacology and Pharmacotherapy">Pharmacology & Pharmacotherapy</option>
      <option value="Clinical Pharmacy and Patient Care">Clinical Pharmacy & Patient Care</option>
      <option value="Pharmaceutics and Dispensing">Pharmaceutics & Dispensing</option>
      <option value="Pharmaceutical Chemistry and Analysis">Pharmaceutical Chemistry & Analysis</option>
      <option value="Pharmacognosy and Alternative Medicine">Pharmacognosy & Alternative Medicine</option>
      <option value="Social and Administrative Pharmacy">Social & Administrative Pharmacy</option>
    </select>

    <button id="generateBtn" class="primary" onclick="generateQuestion()">Generate Question</button>

    <div id="quizContainer"></div>
  </div>

  <script>
    let score = 0;
    let total = 0;
    let answered = false;

    async function generateQuestion() {
      const btn = document.getElementById("generateBtn");
      const container = document.getElementById("quizContainer");
      const domain = document.getElementById("domainSelect").value;

      btn.disabled = true;
      btn.textContent = "ጥያቄ በማመንጨት ላይ...";
      container.innerHTML = "";
      answered = false;

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain })
        });

