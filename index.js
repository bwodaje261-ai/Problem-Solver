export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      let selectedDomain = "All Domains (Random based on Blueprint)";
      try {
        const body = await request.json();
        if (body && body.domain) {
          selectedDomain = body.domain;
        }
      } catch (e) {}

      const systemPrompt = `You are an expert Ethiopian Pharmacy Exit Exam and COC question generator.
Generate ONE realistic multiple-choice question (MCQ) based on the official Ethiopian Pharmacy Exit Exam Blueprint.
Target Domain requested by user: ${selectedDomain}

Official Ethiopian Pharmacy Exit Exam Blueprint (100%):
1. Patient Care (53%) - Pharmaceutical care (25%), Dispensing (21%), Drug Information Service / DIS (7%)
2. Leadership and Management (14%) - Health commodities supply chain management (12%), Management / Leadership (2%)
3. Pharmaceutical Technology (12%) - Drug discovery (1%), Pharmaceutical development and manufacturing (11%)
4. Pharmacy Law and Regulatory Affairs (10%) - Institution regulation (4%), Product regulation (4%), Professional regulation (1%), Pharmacy law (1%)
5. Professionalism (5%) - Ethical principles (2%), Communication and collaboration (2%), Standards of professional conduct and practice (1%)
6. Scholar (3%) - Research methodology, Biostatistics, Evidence-Based Medicine
7. Health Promotion and Disease Prevention (3%) - Public health, Epidemiology, Immunization

CRITICAL: You MUST return ONLY a valid JSON object with NO extra text, markdown, or code blocks before or after it. Use this exact JSON structure:
{
  "domain": "Selected Domain & Percentage",
  "question": "The clinical scenario or question text",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correctAnswer": "A",
  "explanation": "Detailed explanation of why the correct option is right, and briefly why the other options are incorrect."
}`;

      try {
        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Generate one Pharmacy Exit Exam question for domain: ${selectedDomain}. Return ONLY raw JSON.` }
          ],
          temperature: 0.6
        });

        let rawText = aiResponse.response.trim();
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("AI did not return valid JSON format. Please try again.");
        }
        const parsedQuestion = JSON.parse(jsonMatch[0]);

        return new Response(JSON.stringify(parsedQuestion), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "ጥያቄውን ማመንጨት አልተቻለም፣ እባክዎ እንደገና ይሞክሩ። (" + err.message + ")" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const pageContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pharmacy Exit Exam & COC Practice</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 720px; margin: 20px auto; padding: 15px; background: #f0f4f8; color: #333; }
    .card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eef2f5; padding-bottom: 15px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    .header h2 { margin: 0; font-size: 20px; color: #0056b3; }
    .score-badge { background: #e6f2ff; color: #0056b3; padding: 8px 14px; border-radius: 20px; font-weight: bold; font-size: 14px; }
    .controls { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    select { flex: 1; min-width: 200px; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px; background: #fff; }
    .gen-btn { background: #007bff; color: white; border: none; padding: 12px 20px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .gen-btn:hover { background: #0056b3; }
    .gen-btn:disabled { background: #a0c4ff; cursor: not-allowed; }
    .domain-tag { display: inline-block; background: #eef2f5; color: #555; padding: 5px 10px; border-radius: 6px; font-size: 13px; font-weight: bold; margin-bottom: 12px; }
    .question-text { font-size: 17px; line-height: 1.6; font-weight: 500; margin-bottom: 20px; }
    .options-list { display: flex; flex-direction: column; gap: 12px; }
    .option-btn { text-align: left; background: #f8f9fa; border: 2px solid #dee2e6; padding: 14px 16px; border-radius: 8px; font-size: 15px; cursor: pointer; transition: all 0.2s; line-height: 1.4; }
    .option-btn:hover:not(:disabled) { background: #e9ecef; border-color: #adb5bd; }
    .option-btn:disabled { cursor: default; }
    .option-btn.correct { background: #d4edda !important; border-color: #28a745 !important; color: #155724 !important; font-weight: bold; }
    .option-btn.wrong { background: #f8d7da !important; border-color: #dc3545 !important; color: #721c24 !important; }
    .explanation-box { margin-top: 20px; padding: 18px; background: #fff8e6; border-left: 5px solid #ffc107; border-radius: 6px; display: none; line-height: 1.6; }
    .explanation-box h4 { margin: 0 0 8px 0; color: #856404; }
    .next-btn { margin-top: 15px; width: 100%; background: #28a745; color: white; border: none; padding: 14px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer; display: none; }
    .next-btn:hover { background: #218838; }
    .status-msg { text-align: center; color: #666; padding: 30px 10px; font-size: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>Pharmacy Exit Exam Practice</h2>
      <div class="score-badge">Score: <span id="score">0</span> / <span id="total">0</span></div>
    </div>

    <div class="controls">
      <select id="domainSelect">
        <option value="All Domains (Random based on Blueprint)">All Domains (Blueprint Mix)</option>
        <option value="Patient Care (53%)">1. Patient Care (53%)</option>
        <option value="Leadership and Management (14%)">2. Leadership & Management (14%)</option>
        <option value="Pharmaceutical Technology (12%)">3. Pharmaceutical Technology (12%)</option>
        <option value="Pharmacy Law and Regulatory Affairs (10%)">4. Pharmacy Law & Regulatory (10%)</option>
        <option value="Professionalism (5%)">5. Professionalism (5%)</option>
        <option value="Scholar (3%)">6. Scholar / Research (3%)</option>
        <option value="Health Promotion and Disease Prevention (3%)">7. Health Promotion & Public Health (3%)</option>
      </select>
      <button id="genBtn" class="gen-btn" onclick="generateQuestion()">Generate Question</button>
    </div>

    <div id="statusMsg" class="status-msg">Select a domain and click "Generate Question" to start practicing!</div>

    <div id="quizArea" style="display: none;">
      <div id="domainTag" class="domain-tag"></div>
      <div id="questionText" class="question-text"></div>
      <div id="optionsContainer" class="options-list"></div>
      
      <div id="explanationBox" class="explanation-box">
        <h4>Explanation:</h4>
        <div id="explanationText"></div>
      </div>

      <button id="nextBtn" class="next-btn" onclick="generateQuestion()">Next Question ➔</button>
    </div>
  </div>

  <script>
    let currentQuestion = null;
    let score = 0;
    let totalAttempted = 0;
    let isAnswered = false;

    async function generateQuestion() {
      const btn = document.getElementById('genBtn');
      const nextBtn = document.getElementById('nextBtn');
      const statusMsg = document.getElementById('statusMsg');
      const quizArea = document.getElementById('quizArea');
      const domain = document.getElementById('domainSelect').value;

      btn.disabled = true;
      nextBtn.style.display = 'none';
      quizArea.style.display = 'none';
      statusMsg.style.display = 'block';
      statusMsg.innerText = '⏳ AI is preparing a question... Please wait...';
      isAnswered = false;

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: domain })
        });
        const data = await res.json();

        if (data.error) {
          statusMsg.innerText = '❌ ' + data.error;
          return;
        }

        currentQuestion = data;
        renderQuestion(data);
      } catch (e) {
        statusMsg.innerText = '❌ Network error: ' + e.message;
      } finally {
        btn.disabled = false;
      }
    }

    function renderQuestion(data) {
      document.getElementById('statusMsg').style.display = 'none';
      document.getElementById('quizArea').style.display = 'block';
      document.getElementById('explanationBox').style.display = 'none';

      document.getElementById('domainTag').innerText = 'Domain: ' + data.domain;
      document.getElementById('questionText').innerText = data.question;

      const optionsContainer = document.getElementById('optionsContainer');
      optionsContainer.innerHTML = '';

      ['A', 'B', 'C', 'D'].forEach(letter => {
        if (data.options[letter]) {
          const button = document.createElement('button');
          button.className = 'option-btn';
          button.id = 'opt-' + letter;
          button.innerText = letter + ') ' + data.options[letter];
          button.onclick = () => checkAnswer(letter);
          optionsContainer.appendChild(button);
        }
      });
    }

    function checkAnswer(selectedLetter) {
      if (isAnswered) return;
      isAnswered = true;
      totalAttempted++;

