export function google(options = {}) {
  const {
    apiKey,
    model = 'gemini-2.0-flash',
    systemPrompt,
  } = options;

  return {
    name: 'google',
    async generate(prompt) {
      if (!apiKey) throw new Error('[just-in-vibes] Google provider requires an apiKey');

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const body = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: systemPrompt || defaultSystemPrompt() }],
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`[just-in-vibes] Google AI API error (${res.status}): ${err}`);
      }

      const data = await res.json();
      const text = data.candidates[0].content.parts.map((p) => p.text).join('');
      return extractCode(text);
    },
  };
}

function defaultSystemPrompt() {
  return `You are a frontend code generator. The user will describe a UI component or page in plain text. You must respond with ONLY valid HTML that can be directly injected into a webpage. You may include inline <style> tags and <script> tags. Do not include any markdown, explanations, or code fences. Just raw HTML/CSS/JS.`;
}

function extractCode(content) {
  const fenced = content.match(/```(?:html)?\s*\n?([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return content.trim();
}
