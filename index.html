<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pharmacy Exam & COC</title>
<style>
body{font-family:sans-serif;background:#f0fdfa;padding:15px;color:#1e293b}
.hd{background:#0f766e;color:#fff;padding:18px;border-radius:10px;text-align:center;margin-bottom:15px}
.cd{background:#fff;padding:15px;border-radius:10px;box-shadow:0 2px 5px #0001;margin-bottom:15px}
.kb{background:#fef3c7;border:1px solid #f59e0b}
input,select,button{width:100%;padding:12px;margin:8px 0;border-radius:8px;font-size:16px;box-sizing:border-box}
input,select{border:1px solid #cbd5e1}
button{border:none;color:#fff;font-weight:bold;cursor:pointer}
.sb{background:#d97706}
.gb{background:#0f766e}
.opt{background:#f8fafc;color:#0f172a;border:1px solid #cbd5e1;text-align:left;font-weight:normal}
.ok{background:#dcfce7;border-color:#16a34a}
.no{background:#fee2e2;border-color:#dc2626}
.exp{background:#eff6ff;padding:12px;border-radius:8px;margin-top:10px;display:none}
</style>
</head>
<body>
<div class="hd"><h2>AI Pharmacy Exam & COC</h2><p>Clinical Cases & Full Rationales</p></div>
<div class="cd kb">
<b>Gemini API Key:</b>
<input type="password" id="k" placeholder="Paste API Key here...">
<button class="sb" onclick="sk()">Save Key</button>
<div id="ks" style="font-weight:bold;color:#0f766e"></div>
</div>
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
<div id="qt" style="font-weight:bold;margin-bottom:12px"></div>
<div id="op"></div>
<div class="exp" id="ex"></div>
</div>
<script>
var mk="";
window.onload=function(){var s="";try{s=localStorage.getItem("gk")||"";}catch(e){}if(s){document.getElementById("k").value=s;document.getElementById("ks").innerText="✅ Key Ready!";}};
function sk(){var v=document.getElementById("k").value.trim();var ks=document.getElementById("ks");if(!v){ks.style.color="#dc2626";ks.innerText="⚠️ Paste API Key first!";return;}mk=v;try{localStorage.setItem("gk",v);}catch(e){}ks.style.color="#0f766e";ks.innerText="✅ Key Saved!";}
async function gq(){
var s="";try{s=localStorage.getItem("gk")||"";}catch(e){}
var v=document.getElementById("k").value.trim()||s||mk;
var er=document.getElementById("er"),gb=document.getElementById("gb");
if(!v){er.innerText="⚠️ Enter API Key first!";return;}
mk=v;try{localStorage.setItem("gk",v);}catch(e){}
er.innerText="";gb.disabled=true;gb.innerText="Generating...";
document.getElementById("qb").style.display="none";
var p="Create 1 challenging Ethiopian Pharmacy Exit Exam clinical case MCQ on "+document.getElementById("d").value+". Include standard lab reference ranges. Return ONLY JSON: {\"q\":\"question\",\"o\":[\"A. ...\",\"B. ...\",\"C. ...\",\"D. ...\"],\"a\":0,\"r\":\"Detailed rationale for all choices\"}";
try{
var res=await fetch("https://googleapis.com"+encodeURIComponent(v),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:p}]}]})});
var data=await res.json();
if(data.error)throw new Error(data.error.message);
var t=data.candidates[0].content.parts[0].text.replace(/```json/gi,"").replace(/```/g,"").trim();
var j=JSON.parse(t);
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
</html>
