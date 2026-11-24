export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const prompt = "Create 1 challenging Ethiopian Pharmacy Exit Exam clinical case MCQ on " + body.domain + ". Include standard lab reference ranges. Return ONLY valid JSON with no extra text: {\"q\":\"question\",\"o\":[\"A. ...\",\"B. ...\",\"C. ...\",\"D. ...\"],\"a\":0,\"r\":\"Detailed rationale for all choices\"}";

        if (env.AI) {
          const aiRes = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [
              { role: "system", content: "You are a clinical pharmacy professor. Output ONLY raw valid JSON." },
              { role: "user", content: prompt }
            ]
          });
          return new Response(JSON.stringify({ text: aiRes.response }), {
            headers: { "Content-Type": "application/json" }
          });
        }

        const apiRes = await fetch("https://googleapis.com" + encodeURIComponent(body.key), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await apiRes.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: { message: err.message } }), { status: 500 });
      }
    }

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pharmacy Exam & COC</title>
<style>
body{font-family:sans-serif;background:#f0fdfa;padding:15px;color:#1e293b}
.hd{background:#0f766e;color:#fff;padding:18px;border-radius:10px;text-align:center;margin-bottom:15px}
.cd{background:#fff;padding:15px;border-radius:10px;box-shadow:0 2px 5px #0001;margin-bottom:15px}
input,select,button{width:100%;padding:12px;margin:8px 0;border-radius:8px;font-size:16px;box-sizing:border-box}
select{border:1px solid #cbd5e1}
button{border:none;color:#fff;font-weight:bold;cursor:pointer}
.gb{background:#0f766e}
.opt{background:#f8fafc;color:#0f172a;border:1px solid #cbd5e1;text-align:left;font-weight:normal}
.ok{background:#dcfce7;border-color:#16a34a}
.no{background:#fee2e2;border-color:#dc2626}
.exp{background:#eff6ff;padding:12px;border-radius:8px;margin-top:10px;display:none;line-height:1.5}
</style>
</head>
<body>
<div class="hd"><h2>AI Pharmacy Exam & COC</h2><p>Cloudflare Native AI (v4)</p></div>
<div class="cd">
<b>Select Domain:</b>
<select id="d">
<option value="All Pharmacy Exit Exam Domains">All Domains (National Exam Mix)</option>
<option value="Pharmaceutical Care and Clinical Pharmacy">Pharmaceutical Care (25%)</option>
<option value="Dispensing and Dosage Calculation">Dispensing (21%)</option>
<option value="Drug Information Service and Toxicology">Drug Information Service (7%)</option>
<option value="Health Commodities Supply Chain Management">Supply Chain Management (12%)</option>
<option value="Pharmaceutical Manufacturing and Pharmaceutics">Pharmaceutical Technology (11%)</option>
<option value="Pharmacy Law and Regulatory Affairs">Pharmacy Law & Regulation (10%)</option>
</select>
<button class="gb" id="gb" onclick="gq()">Generate New Question</button>
<div id="er" style="color:#dc2626;font-weight:bold;margin-top:8px"></div>
</div>
<div class="cd" id="qb" style="display:none">
<div id="qt" style="font-weight:bold;margin-bottom:12px;line-height:1.5"></div>
<div id="op"></div>
<div class="exp" id="ex"></div>
</div>
<script>
async function gq(){
var er=document.getElementById("er"),gb=document.getElementById("gb");
er.innerText="";gb.disabled=true;gb.innerText="Generating...";
document.getElementById("qb").style.display="none";
try{
var res=await fetch(window.location.href,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({domain:document.getElementById("d").value})
});
var data=await res.json();
if(data.error)throw new Error(data.error.message);
var rawText=data.text||data.candidates.shift().content.parts.shift().text;
var clean=rawText.substring(rawText.indexOf("{"),rawText.lastIndexOf("}")+1);
var j=JSON.parse(clean);
document.getElementById("qt").innerText=j.q;
var od=document.getElementById("op");od.innerHTML="";
j.o.forEach(function(x,i){
var b=document.createElement("button");b.className="opt";b.innerText=x;
b.onclick=function(){
document.querySelectorAll(".opt").forEach(function(btn,idx){btn.disabled=true;if(idx===j.a)btn.classList.add("ok");else if(idx===i)btn.classList.add("no");});
var ex=document.getElementById("ex");ex.innerHTML="<b>Rationale:</b><br>"+j.r;ex.style.display="block";
};
od.appendChild(b);
});
document.getElementById("qb").style.display="block";
}catch(e){er.innerText="❌ Error: "+e.message;}
gb.disabled=false;gb.innerText="Generate New Question";
}
</script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8", "Cache-Control": "no-store" } });
  }
};
