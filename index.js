export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      let domain = "All Domains";
      try {
        const body = await request.json();
        if (body.domain) domain = body.domain;
      } catch (e) {}

      const randomSeed = Math.floor(Math.random() * 1000000);
      const prompt = `Generate ONE brand-new, unique Ethiopian Pharmacy Exit Exam MCQ (Seed: ${randomSeed}) focusing on: ${domain}.
Blueprint: Patient Care(53%), Leadership & Management(14%), Pharm Tech(12%), Pharmacy Law(10%), Professionalism(5%), Scholar(3%), Health Promotion(3%).
Ensure this question is completely different from common textbook examples, using varied clinical cases, drugs, or scenarios.
Return ONLY raw JSON (no markdown):
{"domain":"${domain}","question":"Question text","options":{"A":"...","B":"...","C":"...","D":"..."},"correctAnswer":"A","explanation":"Why it is right and why others are wrong."}`;

      try {
        const res = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
          messages: [{ role: "user", content: prompt }],
          temperature: 0.85
        });
        const match = res.response.match(/\{[\s\S]*\}/);
        return new Response(match, { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Error: " + err.message }), { status: 500 });
      }
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pharmacy Exit Exam</title>
  <style>
    body{font-family:sans-serif;max-width:650px;margin:20px auto;padding:15px;background:#f0f4f8}
    .card{background:#fff;padding:20px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}
    .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}
    .score{background:#e6f2ff;color:#0056b3;padding:6px 12px;border-radius:15px;font-weight:bold}
    select,button{width:100%;padding:12px;margin-bottom:10px;border-radius:8px;font-size:15px}
    .gen{background:#007bff;color:#fff;border:none;font-weight:bold;cursor:pointer}
    .opt{text-align:left;background:#f8f9fa;border:2px solid #ddd;cursor:pointer}
    .correct{background:#d4edda!important;border-color:#28a745!important;color:#155724;font-weight:bold}
    .wrong{background:#f8d7da!important;border-color:#dc3545!important;color:#721c24}
    .exp{background:#fff8e6;padding:15px;border-left:4px solid #ffc107;margin-top:15px;display:none}
    .next{background:#28a745;color:#fff;border:none;font-weight:bold;margin-top:10px;display:none;cursor:pointer}
  </style>
</head>
<body>
  <div class="card">
    <div class="top"><h3>Pharmacy Exam (Unlimited)</h3><span class="score">Score: <b id="sc">0</b>/<b id="tot">0</b></span></div>
    <select id="dom">
      <option value="All Domains">All Domains (Blueprint Mix)</option>
      <option value="Pharmacology and Therapeutics">Pharmacology & Therapeutics</option>
      <option value="Clinical Pharmacy and Pharmaceutical Care">Clinical Pharmacy & Patient Care (53%)</option>
      <option value="Pharmaceutics and Pharmaceutical Technology">Pharmaceutics & Pharm Tech (12%)</option>
      <option value="Medicinal Chemistry and Pharmacognosy">Medicinal Chemistry & Pharmacognosy</option>
      <option value="Leadership and Supply Chain Management">Leadership & Supply Chain Mgmt (14%)</option>
      <option value="Pharmacy Law and Regulatory Affairs">Pharmacy Law & Regulatory (10%)</option>
      <option value="Professionalism and Ethics">Professionalism & Ethics (5%)</option>
      <option value="Scholar, Research and Biostatistics">Scholar & Research (3%)</option>
      <option value="Health Promotion and Public Health">Health Promotion & Public Health (3%)</option>
    </select>
    <button class="gen" id="gBtn" onclick="loadQ()">Generate Question</button>
    <p id="msg">Select a subject and click Generate.</p>
    <div id="quiz" style="display:none">
      <small id="dTag" style="color:#666;font-weight:bold"></small>
      <p id="qTxt" style="font-weight:bold;font-size:16px"></p>
      <div id="opts"></div>
      <div id="expBox" class="exp"><b>Explanation:</b> <span id="expTxt"></span></div>
      <button class="next" id="nBtn" onclick="loadQ()">Next Question ➔</button>
    </div>
  </div>
  <script>
    let cur=null,sc=0,tot=0,done=false;
    async function loadQ(){
      const b=document.getElementById('gBtn'),m=document.getElementById('msg'),q=document.getElementById('quiz');
      b.disabled=true;q.style.display='none';m.style.display='block';m.innerText='Loading new question...';done=false;
      try{
        const r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({domain:document.getElementById('dom').value})});
        cur=await r.json();
        if(cur.error){m.innerText=cur.error;return;}
        m.style.display='none';q.style.display='block';
        document.getElementById('expBox').style.display='none';
        document.getElementById('nBtn').style.display='none';
        document.getElementById('dTag').innerText=cur.domain;
        document.getElementById('qTxt').innerText=cur.question;
        const o=document.getElementById('opts');o.innerHTML='';
        ['A','B','C','D'].forEach(k=>{
          if(cur.options[k]){
            const btn=document.createElement('button');
            btn.className='opt';btn.id='o-'+k;btn.innerText=k+') '+cur.options[k];
            btn.onclick=()=>ans(k);o.appendChild(btn);
          }
        });
      }catch(e){m.innerText='Error: '+e.message;}finally{b.disabled=false;}
    }
    function ans(k){
      if(done)return;done=true;tot++;
      const c=cur.correctAnswer.trim().toUpperCase();
      if(k===c){document.getElementById('o-'+k).classList.add('correct');sc++;}
      else{document.getElementById('o-'+k).classList.add('wrong');if(document.getElementById('o-'+c))document.getElementById('o-'+c).classList.add('correct');}
      ['A','B','C','D'].forEach(x=>{const b=document.getElementById('o-'+x);if(b)b.disabled=true;});
      document.getElementById('sc').innerText=sc;document.getElementById('tot').innerText=tot;
      document.getElementById('expTxt').innerText=cur.explanation;
      document.getElementById('expBox').style.display='block';
      document.getElementById('nBtn').style.display='block';
    }
  </script>
</body>
</html>`;
    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }
};
