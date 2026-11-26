<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharmacy Exit Exam & COC Prep</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f3; margin: 0; padding: 15px; color: #222; }
        .header { background-color: #0d6e52; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h2 { margin: 0; font-size: 22px; }
        .header p { margin: 5px 0 0; font-size: 13px; opacity: 0.9; }
        .container { background: white; padding: 20px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); max-width: 600px; margin: auto; }
        label { font-weight: bold; display: block; margin-top: 15px; margin-bottom: 6px; font-size: 14px; }
        select, input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 15px; box-sizing: border-box; background: #fff; }
        button { width: 100%; background-color: #0d6e52; color: white; border: none; padding: 14px; font-size: 16px; font-weight: bold; border-radius: 8px; margin-top: 18px; cursor: pointer; }
        button:hover { background-color: #09523d; }
        button:disabled { background-color: #88b5a8; }
        .quiz-box { margin-top: 25px; display: none; border-top: 2px solid #eee; padding-top: 20px; }
        .domain-badge { background: #e0f2ed; color: #0d6e52; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
        .question { font-size: 17px; font-weight: 600; line-height: 1.5; margin-bottom: 15px; }
        .option { display: block; width: 100%; text-align: left; background: #f8f9fa; color: #222; border: 1px solid #ddd; padding: 12px; margin-bottom: 10px; border-radius: 8px; font-weight: normal; font-size: 15px; }
        .option:hover { background: #eef5f3; border-color: #0d6e52; }
        .correct { background-color: #d4edda !important; border-color: #28a745 !important; color: #155724 !important; font-weight: bold; }
        .wrong { background-color: #f8d7da !important; border-color: #dc3545 !important; color: #721c24 !important; }
        .explanation { margin-top: 20px; padding: 15px; background: #f9fbfb; border-left: 4px solid #0d6e52; border-radius: 6px; font-size: 14.5px; line-height: 1.6; display: none; }
        .loader { text-align: center; display: none; margin-top: 15px; color: #0d6e52; font-weight: bold; }
    </style>
</head>
<body>

<div class="header">
    <h2>Pharmacy Exit Exam & COC</h2>
    <p>Blueprint-Based AI Question Generator</p>
</div>

<div class="container">
    <label for="apiKey">Gemini API Key (Free from aistudio.google.com):</label>
    <input type="password" id="apiKey" placeholder="Paste your API key here...">

    <label for="domain">Select Domain:</label>
    <select id="domain">
        <option value="ALL">All Domains (National Blueprint Weighted)</option>
        <option value="Patient Care - Pharmaceutical Care (25%)">Patient Care: Pharmaceutical Care (25%)</option>
        <option value="Patient Care - Dispensing (21%)">Patient Care: Dispensing (21%)</option>
        <option value="Patient Care - Drug Information Services / DIS (7%)">Patient Care: DIS (7%)</option>
        <option value="Leadership & Management - Supply Chain Management (12%)">Leadership: Health Commodities Supply Chain (12%)</option>
        <option value="Leadership & Management - Management/Leadership (2%)">Leadership & Management (2%)</option>
        <option value="Pharmaceutical Technology - Development & Manufacturing (11%)">Pharm Tech: Development & Manufacturing (11%)</option>
        <option value="Pharmaceutical Technology - Drug Discovery (1%)">Pharm Tech: Drug Discovery (1%)</option>
        <option value="Pharmacy Law & Regulatory Affairs (10%)">Pharmacy Law & Regulatory Affairs (10%)</option>
        <option value="Professionalism & Ethics (5%)">Professionalism & Ethics (5%)</option>
        <option value="Scholar (3%)">Scholar / Research (3%)</option>
        <option value="Health Promotion & Disease Prevention (3%)">Health Promotion & Disease Prevention (3%)</option>
    </select>

    <button id="genBtn" onclick="generateQuestion()">Generate New Question</button>
    <div class="loader" id="loader">Generating clinical scenario question...</div>

    <div class="quiz-box" id="quizBox">
        <span class="domain-badge" id="qDomain">Domain</span>
        <div class="question" id="qText"></div>
        <div id="optionsContainer"></div>
        <div class="explanation" id="expBox"></div>
    </div>
</div>

<script>
    let currentData = null;

    function pickWeightedDomain() {
        const rand = Math.random() * 100;
        if (rand < 25) return "Patient Care: Pharmaceutical Care (25%)";
        if (rand < 46) return "Patient Care: Dispensing (21%)";
        if (rand < 53) return "Patient Care: Drug Information Services / DIS (7%)";
        if (rand < 65) return "Leadership & Management: Health Commodities Supply Chain Management (12%)";
        if (rand < 67) return "Leadership & Management: Management and Leadership (2%)";
        if (rand < 78) return "Pharmaceutical Technology: Pharmaceutical Development and Manufacturing (11%)";
        if (rand < 79) return "Pharmaceutical Technology: Drug Discovery (1%)";
        if (rand < 83) return "Pharmacy Law & Regulatory Affairs: Institution Regulation (4%)";
        if (rand < 87) return "Pharmacy Law & Regulatory Affairs: Product Regulation (4%)";
        if (rand < 88) return "Pharmacy Law & Regulatory Affairs: Professional Regulation (1%)";
        if (rand < 89) return "Pharmacy Law & Regulatory Affairs: Pharmacy Law (1%)";
        if (rand < 91) return "Professionalism: Ethical Principles (2%)";
        if (rand < 93) return "Professionalism: Communication and Collaboration (2%)";
        if (rand < 94) return "Professionalism: Standards of Professional Conduct and Practice (1%)";
        if (rand < 97) return "Scholar / Evidence-Based Pharmacy Practice (3%)";
        return "Health Promotion and Disease Prevention (3%)";
    }

    async function generateQuestion() {
        const apiKey = document.getElementById('apiKey').value.trim();
        if (!apiKey) {
            alert("Please enter a valid Gemini API Key first.");
            return;
        }

        let selectedDomain = document.getElementById('domain').value;
        if (selectedDomain === "ALL") {
            selectedDomain = pickWeightedDomain();
        }

        const btn = document.getElementById('genBtn');
        const loader = document.getElementById('loader');
        const quizBox = document.getElementById('quizBox');
        
        btn.disabled = true;
        loader.style.display = 'block';
        quizBox.style.display = 'none';

        const prompt = `Create 1 challenging multiple-choice question for the Ethiopian Pharmacy Exit Exam & COC strictly under the domain: "${selectedDomain}". 
        Return ONLY valid JSON with no markdown formatting, using this exact structure:
        {
          "domain": "${selectedDomain}",
          "question": "Scenario-based question text...",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctIndex": 0,
          "explanation": "Detailed explanation of why the correct option is right, followed by a clear breakdown of why each of the other three options is incorrect."
        }`;

        try {
            const response = await fetch(`https://googleapis.com{apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error.message);

            const text = result.candidates[0].content.parts[0].text;
            currentData = JSON.parse(text);
            renderQuestion(currentData);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            btn.disabled = false;
            loader.style.display = 'none';
        }
    }

    function renderQuestion(data) {
        document.getElementById('qDomain').innerText = data.domain;
        document.getElementById('qText').innerText = data.question;
        const container = document.getElementById('optionsContainer');
        const expBox = document.getElementById('expBox');
        
        container.innerHTML = '';
        expBox.style.display = 'none';
        expBox.innerHTML = '';

        data.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option';
            btn.innerText = opt;
            btn.onclick = () => checkAnswer(index, btn);
            container.appendChild(btn);
        });

        document.getElementById('quizBox').style.display = 'block';
    }

    function checkAnswer(selectedIndex, clickedBtn) {
        const buttons = document.querySelectorAll('.option');
        buttons.forEach(b => b.disabled = true);

        if (selectedIndex === currentData.correctIndex) {
            clickedBtn.classList.add('correct');
        } else {
            clickedBtn.classList.add('wrong');
            buttons[currentData.correctIndex].classList.add('correct');
        }

        const expBox = document.getElementById('expBox');
        expBox.innerHTML = `<strong>Explanation:</strong><br>${currentData.explanation.replace(/\n/g, '<br>')}`;
        expBox.style.display = 'block';
    }
</script>

</body>
</html>
