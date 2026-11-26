export default {
  async fetch(request, env) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharmacy Exit Exam & COC</title>
    <style>
        body { font-family: sans-serif; background: #f0f4f3; margin: 0; padding: 15px; }
        .header { background: #0d6e52; color: white; padding: 20px; border-radius: 12px 12px 0 0; text-align: center; }
        .container { background: white; padding: 20px; border-radius: 0 0 12px 12px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
        select, button { width: 100%; padding: 12px; margin-top: 12px; border-radius: 8px; font-size: 16px; }
        button { background: #0d6e52; color: white; border: none; font-weight: bold; cursor: pointer; }
        button:disabled { background: #88b5a8; }
        .option { background: #f8f9fa; color: #222; border: 1px solid #ddd; text-align: left; font-weight: normal; }
        .correct { background: #d4edda !important; border-color: #28a745 !important; }
        .wrong { background: #f8d7da !important; border-color: #dc3545 !important; }
        .exp { margin-top: 15px; padding: 15px; background: #f9fbfb; border-left: 4px solid #0d6e52; display: none; line-height: 1.5; }
    </style>
</head>
<body>
<div class="header"><h2>Pharmacy Exit Exam & COC</h2><p>Cloudflare Native AI (Blueprint Weighted)</p></div>
<div class="container">
    <select id="domain">
        <option value="ALL">All Domains (National Blueprint Weighted)</option>
        <option value="Patient Care: Pharmaceutical Care (25%)">Patient Care: Pharmaceutical Care (25%)</option>
        <option value="Patient Care: Dispensing (21%)">Patient Care: Dispensing (21%)</option>
        <option value="Patient Care: DIS (7%)">Patient Care: DIS (7%)</option>
        <option value="Leadership: Health Commodities Supply Chain (12%)">Leadership: Supply Chain Management (12%)</option>
        <option value="Leadership & Management (2%)">Leadership & Management (2%)</option>
        <option value="Pharmaceutical Technology: Development & Manufacturing (11%)">Pharm Tech: Development & Manufacturing (11%)</option>
        <option value="Pharmaceutical Technology: Drug Discovery (1%)">Pharm Tech: Drug Discovery (1%)</option>
        <option value="Pharmacy Law & Regulatory Affairs (10%)">Pharmacy Law & Regulatory Affairs (10%)</option>
        <option value="Professionalism & Ethics (5%)">Professionalism & Ethics (5%)</option>
        <option value="Scholar (3%)">Scholar (3%)</option>
        <option value="Health Promotion & Disease Prevention (3%)">Health Promotion & Disease Prevention (3%)</option>
    </select>
    <button id="btn" onclick="getQ()">Generate New Question</button>
    <div id="quiz" style="display:none; margin-top:20px;">
        <h4 id="qTitle" style="color:#0d6e52;"></h4>
        <p id="qText" style="font-weight:bold;"></p>
        <div id="opts"></div>
        <div id="exp" class="exp"></div>
    </div>
</div>
<script>
    let qData = null;
    function getWeighted() {
        const r = Math.random() * 100;
        if (r < 25) return "Patient Care: Pharmaceutical Care (25%)";
        if (r < 46) return "Patient Care: Dispensing (21%)";
        if (r < 53) return "Patient Care: DIS (7%)";
        if (r < 65) return "Leadership: Supply Chain Management (12%)";
        if (r < 67) return "Leadership & Management (2%)";
        if (r < 78) return "Pharm Tech: Development & Manufacturing (11%)";
        if (r < 79) return "Pharm Tech: Drug Discovery (1%)";
        if (r < 89) return "Pharmacy Law & Regulatory Affairs (10%)";
        if (r < 94) return "Professionalism & Ethics (5%)";
        if (r < 97) return "Scholar (3%)";
        return "Health Promotion & Disease Prevention (3%)";
    }
    async function getQ() {
        const btn = document.getElementById('btn');
        btn.disabled = true; btn.innerText = "Generating...";
        let d = document.getElementById('domain').value;
        if (d === "ALL") d = getWeighted();
        try {
            const res = await fetch(window.location.href, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: d })
            });
            qData = await res.json();
            document.getElementById('qTitle').innerText = qData.domain;
            document.getElementById('qText').innerText = qData.question;
            const opts = document.getElementById('opts');
            opts.innerHTML = '';
            document.getElementById('exp').style.display = 'none';
            qData.options.forEach((o, i) => {
                const b = document.createElement('button');
                b.className = 'option'; b.innerText = o;
                b.onclick = () => check(i, b);
                opts.appendChild(b);
            });
            document.getElementById('quiz').style.display = 'block';
        } catch (e) { alert("Error: " + e.message); }
        btn.disabled = false; btn.innerText = "Generate New Question";
    }
    function check(i, b) {
        document.querySelectorAll('.option').forEach(x => x.disabled = true);
        if (i === qData.correctIndex) b.classList.add('correct');
        else { b.classList.add('wrong'); document.querySelectorAll('.option')[qData.correctIndex].classList.add('correct'); }
        const exp = document.getElementById('exp');
        exp.innerHTML = "<b>Explanation:</b><br>" + qData.explanation.replace(/\\n/g, '<br>');
        exp.style.display = 'block';
    }
</script>
</body>
</html>`;

    if (request.method === "GET") {
      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    if (request.method === "POST") {
      const { domain } = await request.json();
      const prompt = \`Create 1 Ethiopian Pharmacy Exit Exam & COC multiple-choice question strictly under domain: "\${domain}". Reply ONLY in valid JSON format: {"domain":"\${domain}","question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctIndex":0,"explanation":"Why correct answer is right AND why each of the other 3 choices is wrong."}\`;
      
      const aiRes = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "user", content: prompt }]
      });

      let text = aiRes.response.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      return new Response(text, { headers: { "Content-Type": "application/json" } });
    }
  }
};
