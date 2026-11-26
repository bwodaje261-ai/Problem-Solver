export default {
  async fetch(request, env) {
    // 1. ተጠቃሚው "Generate" የሚለውን ቁልፍ ሲነካ (POST request) AI ጥያቄና መልስ ያወጣል
    if (request.method === "POST") {
      const systemPrompt = `You are an expert Ethiopian Pharmacy Exit Exam and COC question generator and tutor. 
Generate ONE realistic multiple-choice question (MCQ) based on the official Ethiopian Pharmacy Exit Exam Blueprint below, and immediately provide the correct answer with detailed explanations for why it is right and why the other options are wrong.

Official Ethiopian Pharmacy Exit Exam Blueprint (100%):
1. Patient Care (53%) - Pharmaceutical care (25%), Dispensing (21%), Drug Information Service / DIS (7%)
2. Leadership and Management (14%) - Health commodities supply chain management (12%), Management / Leadership (2%)
3. Pharmaceutical Technology (12%) - Drug discovery (1%), Pharmaceutical development and manufacturing (11%)
4. Pharmacy Law and Regulatory Affairs (10%) - Institution regulation (4%), Product regulation (4%), Professional regulation (1%), Pharmacy law (1%)
5. Professionalism (5%) - Ethical principles (2%), Communication and collaboration (2%), Standards of professional conduct and practice (1%)
6. Scholar (3%) - Research methodology, Biostatistics, Evidence-Based Medicine
7. Health Promotion and Disease Prevention (3%) - Public health, Epidemiology, Immunization

Format your response clearly:
Domain: [Selected Domain & Percentage]
Question: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]

Correct Answer: [Letter and Option]
Why it is correct: [Detailed explanation]
Why other choices are incorrect:
- [Wrong Option 1]: [Reason]
- [Wrong Option 2]: [Reason]
- [Wrong Option 3]: [Reason]`;

      try {
        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Generate a new Pharmacy Exit Exam question with the correct answer and explanations." }
          ],
          temperature: 0.7
        });

        return new Response(JSON.stringify({ result: aiResponse.response }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // 2. ተጠቃሚው ሊንኩን ሲከፍት (GET request) የሚታየው ገጽ እና "Generate" ቁልፍ
    const pageContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pharmacy Exit Exam & COC AI Generator</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; background: #f4f7f6; }
    .card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    button { background: #007bff; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 5px; cursor: pointer; width: 100%; }
    button:hover { background: #0056b3; }
    button:disabled { background: #cccccc; }
    pre { white-space: pre-wrap; font-family: inherit; background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Pharmacy Exit Exam & COC Practice</h2>
    <p>Click the button below to generate a new question with detailed explanations.</p>
    <button id="genBtn" onclick="generateQuestion()">Generate Question</button>
    <pre id="output">Your generated question and explanation will appear here...</pre>
  </div>

  <script>
    async function generateQuestion() {
      const btn = document.getElementById('genBtn');
      const output = document.getElementById('output');
      btn.disabled = true;
      btn.innerText = 'Generating... Please wait...';
      output.innerText = 'AI is preparing a Pharmacy Exit Exam question...';

      try {
        const res = await fetch('/', { method: 'POST' });
        const data = await res.json();
        if (data.result) {
          output.innerText = data.result;
        } else {
          output.innerText = 'Error: ' + (data.error || 'Failed to generate.');
        }
      } catch (e) {
        output.innerText = 'Network error: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerText = 'Generate Question';
      }
    }
  </script>
</body>
</html>`;

    return new Response(pageContent, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};
