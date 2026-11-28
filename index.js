export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const VALID_PIN = "2026";

    if (request.method === "POST" && url.pathname === "/api/generate") {
      try {
        const body = await request.json();
        const { course, pin } = body;

        if (pin !== VALID_PIN) {
          return new Response(JSON.stringify({ error: "ያስገቡት Access PIN ትክክል አይደለም! እባክዎ ትክክለኛውን ኮድ ያስገቡ።" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
          });
        }

        if (!env.GEMINI_API_KEY) {
          return new Response(JSON.stringify({ error: "Cloudflare Settings ላይ GEMINI_API_KEY አልተገኘም! እባክዎ ስሙን ያረጋግጡ።" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const prompt = `Generate 1 unique, challenging clinical/scenario-based multiple-choice question strictly aligned with the Ethiopian Ministry of Education Pharmacy Exit Exam and EHPLE COC Blueprint on the course/topic: "${course}".
        Return ONLY a valid JSON object with no markdown formatting, using this exact structure:
        {
          "question": "The clinical scenario or question text here",
          "options": {
            "A": "Option A text",
            "B": "Option B text",
            "C": "Option C text",
            "D": "Option D text"
          },
          "correctAnswer": "A",
          "explanation": "✅ Correct Answer (A): [Explain clearly why the correct option is right].\\n\\n❌ Why other options are incorrect:\\n• Option [X]: [Explain why it is wrong].\\n• Option [Y]: [Explain why it is wrong].\\n• Option [Z]: [Explain why it is wrong]."
        }`;

        const apiResponse = await fetch(`https://googleapis.com{env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.9
            }
          })
        });

        const data = await apiResponse.json();
        const firstCandidate = data.candidates && data.candidates.at(0);

        if (!apiResponse.ok || !firstCandidate) {
          const apiErr = data.error ? data.error.message : "API ምላሽ አልሰጠም";
          return new Response(JSON.stringify({ error: "API ስህተት: " + apiErr }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const generatedText = firstCandidate.content.parts.at(0).text;

        return new Response(generatedText, {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: "ስህተት ተፈጥሯል: " + err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PHARMACY EHPLE Exit Exam and COC</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f0f4f8; margin: 0; padding: 16px; display: flex; justify-content: center; }
    .card { background: white; border-radius: 16px; padding: 20px; width: 100%; max-width: 480px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .title-group { display: flex; align-items: center; gap: 12px; }
    .icon { background: #e6f2f5; color: #007791; font-size: 28px; font-weight: bold; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    h1 { color: #007791; font-size: 18px; margin: 0; line-height: 1.3; }
    .score-box { background: #e8f5e9; color: #2e7d32; padding: 8px 12px; border-radius: 10px; font-weight: bold; text-align: center; font-size: 14px; }
    input, select { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 15px; margin-bottom: 12px; box-sizing: border-box; background: white; }
    .btn { width: 100%; padding: 14px; border: none; border-radius: 10px; background: linear-gradient(90deg, #008080, #006680); color: white; font-size: 16px; font-weight: bold; cursor: pointer; }
    .btn:disabled { opacity: 0.6; }
    .next-btn { width: 100%; padding: 14px; border: none; border-radius: 10px; background: #0284c7; color: white; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 14px; display: none; }
    .question-box { margin-top: 20px; display: none; }
    .q-text { font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 14px; line-height: 1.5; }
    .option-btn { width: 100%; text-align: left; padding: 12px; margin-bottom: 8px; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; font-size: 15px; cursor: pointer; transition: 0.2s; }
    .option-btn.correct { background: #dcfce7; border-color: #22c55e; color: #14532d; font-weight: bold; }
    .option-btn.wrong { background: #fee2e2; border-color: #ef4444; color: #7f1d1d; }
    .explanation { margin-top: 16px; padding: 14px; background: #f8fafc; border-left: 4px solid #007791; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #1e293b; display: none; white-space: pre-line; }
    .error-msg { color: #dc2626; font-size: 14px; margin-bottom: 10px; text-align: center; font-weight: 500; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title-group">
        <div class="icon">+</div>
        <h1>PHARMACY<br>EHPLE Exit Exam and COC</h1>
      </div>
      <div class="score-box">Score<br><span id="score">0 / 0</span></div>
    </div>

    <input type="password" id="pinInput" placeholder="Enter Access PIN (የመግቢያ ኮድ ያስገቡ)" />

    <select id="courseSelect">
      <option value="All Ethiopian Pharmacy Exit Exam & EHPLE Blueprint Courses (Weighted Mix)">All Blueprint Courses (ሁሉም የፈተና ኮርሶች)</option>
      
      <optgroup label="1. Pharmaceutical Care (35%)">
        <option value="Integrated Pharmacotherapeutics I-IV">Integrated Pharmacotherapeutics I–IV</option>
        <option value="Internal Medicine Clerkship">Internal Medicine Clerkship</option>
        <option value="Pediatrics Clerkship">Pediatrics Clerkship</option>
        <option value="Ambulatory Care & Gynecology/Obstetrics Clerkship">Ambulatory Care & Gyn/Obs Clerkship</option>
        <option value="Clinical Pharmacokinetics & Biopharmaceutics">Clinical Pharmacokinetics & Biopharmaceutics</option>
      </optgroup>

      <optgroup label="2. Pharmaceutical Sciences & Technology (42.5%)">
        <option value="Pharmacology I & II">Pharmacology I & II</option>
        <option value="Medicinal Chemistry I & II">Medicinal Chemistry I & II</option>
        <option value="Pharmaceutical Analysis I & II">Pharmaceutical Analysis I & II</option>
        <option value="Physical Pharmacy & Pharmaceutics I & II">Physical Pharmacy & Pharmaceutics I & II</option>
        <option value="Pharmacognosy & Alternative Medicine">Pharmacognosy & Alternative Medicine</option>
        <option value="Industrial Pharmacy & Quality Assurance">Industrial Pharmacy & Quality Assurance</option>
      </optgroup>

      <optgroup label="3. Dispensing & Drug Information Services (13.75%)">
        <option value="Pharmaceutics, Compounding & Dispensing">Pharmaceutics, Compounding & Dispensing</option>
        <option value="Drug Information Services (DIS) & Evidence-Based Medicine">Drug Information Services (DIS) & EBM</option>
        <option value="Pharmaceutical Calculations">Pharmaceutical Calculations</option>
        <option value="Social Pharmacy & Patient Counseling">Social Pharmacy & Patient Counseling</option>
      </optgroup>

      <optgroup label="4. Pharmaceutical Supply Management (6.25%)">
        <option value="Drug Supply Chain Management (SCM) & Inventory Control">Drug Supply Chain Management (SCM)</option>

        <option value="Medical Supplies, Equipment & Reagents">Medical Supplies, Equipment & Reagents</option>
        <option value="Pharmaceutical Laws, Ethics & Regulatory Affairs">Pharmaceutical Laws, Ethics & Regulatory Affairs</option>
      </optgroup>
    </select>

    <div id="errorBox" class="error-msg"></div>
    <button id="generateBtn" class="btn" onclick="generateQuestion()">Generate Question</button>

    <div id="questionBox" class="question-box">
      <div id="questionText" class="q-text"></div>
      <div id="optionsContainer"></div>
      <div id="explanationBox" class="explanation"></div>
      <button id="nextBtn" class="next-btn" onclick="generateQuestion()">Next Question ➔</button>
    </div>
  </div>

  <script>
    let score = 0;
    let total = 0;
    let answered = false;

    async function generateQuestion() {
      const pin = document.getElementById("pinInput").value.trim();
      const course = document.getElementById("courseSelect").value;
      const errorBox = document.getElementById("errorBox");
      const btn = document.getElementById("generateBtn");
      const nextBtn = document.getElementById("nextBtn");
      const qBox = document.getElementById("questionBox");

      errorBox.textContent = "";
      if (!pin) {
        errorBox.textContent = "እባክዎ መጀመሪያ Access PIN ያስገቡ!";
        return;
      }

      btn.disabled = true;
      btn.textContent = "ጥያቄ በማዘጋጀት ላይ... (Generating...)";
      nextBtn.style.display = "none";

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ course, pin })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "ጥያቄ ማምጣት አልተቻለም");
        }

        renderQuestion(data);
        qBox.style.display = "block";
        btn.style.display = "none";
      } catch (err) {
        errorBox.textContent = err.message;
        btn.disabled = false;
        btn.textContent = "Generate Question";
      }
    }

    function renderQuestion(q) {
      answered = false;
      document.getElementById("questionText").textContent = q.question;
      const container = document.getElementById("optionsContainer");
      const expBox = document.getElementById("explanationBox");
      container.innerHTML = "";
      expBox.style.display = "none";
      expBox.textContent = q.explanation;

      ["A", "B", "C", "D"].forEach(letter => {
        const optionText = q.options && q.options[letter];
        if (!optionText) return;
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = letter + ". " + optionText;
        btn.onclick = () => checkAnswer(letter, q.correctAnswer, btn);
        container.appendChild(btn);
      });
    }

    function checkAnswer(selected, correct, clickedBtn) {
      if (answered) return;
      answered = true;
      total++;

      const buttons = document.querySelectorAll(".option-btn");
      buttons.forEach(b => {
        b.disabled = true;
        if (b.textContent.startsWith(correct + ".")) {
          b.classList.add("correct");
        }
      });

      if (selected === correct) {
        score++;
      } else {
        clickedBtn.classList.add("wrong");
      }

      document.getElementById("score").textContent = score + " / " + total;
      document.getElementById("explanationBox").style.display = "block";
      document.getElementById("nextBtn").style.display = "block";
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};
