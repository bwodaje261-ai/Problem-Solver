export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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

    return new Response(renderHTML(), {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  },
};

const API_BASE = "https://" + "://googleapis.com";

async function getAvailableModels(apiKey) {
  const defaultModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash"
  ];

  try {
    const res = await fetch(API_BASE + "?key=" + apiKey);
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
  } catch (e) {}
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
      const fullUrl = API_BASE + "/" + currentModel + ":generateContent?key=" + apiKey;

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
  return `
