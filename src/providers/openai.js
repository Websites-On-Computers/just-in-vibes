export function openai(options = {}) {
  const {
    apiKey,
    model = 'gpt-4o-mini',
    baseURL = 'https://api.openai.com/v1',
    systemPrompt,
  } = options;

  return {
    name: 'openai',
    async generate(prompt) {
      if (!apiKey) throw new Error('[just-in-vibes] OpenAI provider requires an apiKey');

      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt || defaultSystemPrompt(),
            },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`[just-in-vibes] OpenAI API error (${res.status}): ${err}`);
      }

      const data = await res.json();
      return extractCode(data.choices[0].message.content);
    },
  };
}

function defaultSystemPrompt() {
  return `You are a frontend code generator. The user will describe a UI component or page in plain text. You must respond with ONLY valid HTML that can be directly injected into a webpage. You may include inline <style> tags and <script> tags. Do not include any markdown, explanations, or code fences. Just raw HTML/CSS/JS.`;
}

function extractCode(content) {
  // If the LLM wrapped it in code fences despite instructions, strip them
  const fenced = content.match(/```(?:html)?\s*\n?([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return content.trim();
}
