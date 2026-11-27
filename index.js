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

async function generatePharmacyQuestion(domain, env) {
  const prompt = `Generate 1 challenging multiple-choice Pharmacy licensing exam question for the domain: "${domain}".
Return ONLY a valid JSON object. Do NOT include markdown formatting like \`\`\`json. Ensure all quotes inside text are properly escaped.
Use this exact JSON structure:
{
  "question": "Detailed clinical or pharmaceutical question here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctIndex": 0,
  "explanation": "Clear explanation why the answer is correct and others are wrong."
}`;

  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const apiKey = env.GEMINI_API_KEY || env.GoogleGeminiApiKey || env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key በCloudflare Settings ውስጥ አልተጨመረም።");
      }

      const protocol = "https" + "://";
      const host = ["generativelanguage", "googleapis", "com"].join(".");
      const path = "/v1beta/models/gemini-2.5-flash:generateContent";
      const fullUrl = protocol + host + path + "?key=" + apiKey.trim();

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
        throw new Error(`API Error: ${response.status} - ${errText}`);
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
  <title>Pharmacy Exam (Unlimited)</title>
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
      border-radius: 16px;
      padding: 24px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 22px;
      margin: 0;
      color: #111827;
    }
    .score-box {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 8px 14px;
      border-radius: 12px;
      font-weight: 700;
      text-align: center;
      font-size: 15px;
    }
    select, button {
      width: 100%;
      padding: 14px;
      border-radius: 10px;
      font-size: 16px;
      margin-bottom: 14px;
      box-sizing: border-box;
    }
    select {
      border: 1px solid #d1d5db;
      background: #f9fafb;
      color: #111827;
    }
    button.primary {
      background: #026aa7;
      color: white;
      border: none;
      font-weight: 600;
      cursor: pointer;
    }
    button.primary:disabled {
      background: #93c5fd;
      cursor: not-allowed;
    }
    .question-text {
      font-size: 16px;
      line-height: 1.5;
      color: #1f2937;
      margin: 16px 0;
      font-weight: 500;
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
      background: #f8fafc;
      border-left: 4px solid #026aa7;
      padding: 12px;
      margin-top: 14px;
      font-size: 14px;
      color: #334155;
      line-height: 1.5;
      border-radius: 4px;
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
      <h1>Pharmacy Exam<br>(Unlimited)</h1>
      <div class="score-box">Score:<br><span id="score">0/0</span></div>
    </div>

    <select id="domainSelect">
      <option value="All Domains (Blueprint Mix)">All Domains (Blueprint Mix)</option>
      <option value="Drug Dispensing & Counseling">Drug Dispensing & Counseling</option>
      <option value="Pharmacology & Therapeutics">Pharmacology & Therapeutics</option>
      <option value="Pharmaceutics & Compounding">Pharmaceutics & Compounding</option>
      <option value="Clinical Pharmacy & Patient Care">Clinical Pharmacy & Patient Care</option>
      <option value="Pharmacy Law, Ethics & Management">Pharmacy Law, Ethics & Management</option>
      <option value="Medicinal Chemistry & Pharmacognosy">Medicinal Chemistry & Pharmacognosy</option>
    </select>

    <button id="generateBtn" class="primary" onclick="loadQuestion()">Generate Question</button>

    <div id="contentArea"></div>
  </div>

  <script>
    let correctCount = 0;
    let totalCount = 0;
    let answered = false;

    async function loadQuestion() {
      const btn = document.getElementById("generateBtn");
      const content = document.getElementById("contentArea");
      const domain = document.getElementById("domainSelect").value;

      btn.disabled = true;
      btn.textContent = "Generating...";
      content.innerHTML = "";
      answered = false;

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Unknown error");
        }

        renderQuestion(data);
      } catch (err) {
        content.innerHTML = '<div class="error-msg">Error: ' + err.message + '</div>';
      } finally {
        btn.disabled = false;
        btn.textContent = "Generate Question";
      }
    }

    function renderQuestion(data) {
      const content = document.getElementById("contentArea");
      let html = '<div class="question-text">' + data.question + '</div>';

      data.options.forEach((opt, idx) => {
        html += '<button class="option-btn" id="opt-' + idx + '" onclick="checkAnswer(' + idx + ', ' + data.correctIndex + ')">' + opt + '</button>';
      });

      html += '<div id="explanationBox" class="explanation" style="display:none;"><strong>Explanation:</strong> ' + data.explanation + '</div>';
      content.innerHTML = html;
    }

    function checkAnswer(selectedIdx, correctIdx) {
      if (answered) return;
      answered = true;
      totalCount++;

      const selectedBtn = document.getElementById("opt-" + selectedIdx);
      const correctBtn = document.getElementById("opt-" + correctIdx);

      if (selectedIdx === correctIdx) {
        correctCount++;
        selectedBtn.classList.add("correct");
      } else {
        selectedBtn.classList.add("wrong");
        correctBtn.classList.add("correct");
      }

      document.getElementById("score").textContent = correctCount + "/" + totalCount;
      document.getElementById("explanationBox").style.display = "block";
    }
  </script>
</body>
</html>`;
}
