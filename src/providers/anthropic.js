export function anthropic(options = {}) {
  const {
    apiKey,
    model = 'claude-sonnet-4-5-20250929',
    baseURL = 'https://api.anthropic.com',
    systemPrompt,
  } = options;

  return {
    name: 'anthropic',
    async generate(prompt) {
      if (!apiKey) throw new Error('[just-in-vibes] Anthropic provider requires an apiKey');

      const res = await fetch(`${baseURL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: systemPrompt || defaultSystemPrompt(),
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`[just-in-vibes] Anthropic API error (${res.status}): ${err}`);
      }

      const data = await res.json();
      const text = data.content.map((b) => b.text).join('');
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
