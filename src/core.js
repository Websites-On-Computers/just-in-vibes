import { createCache, hashPrompt } from './cache.js';

const DEFAULT_LOADING_HTML = `<div style="padding:1rem;color:#888;font-family:system-ui">✨ Vibing...</div>`;
const DEFAULT_ERROR_HTML = (msg) =>
  `<div style="padding:1rem;color:#c00;font-family:system-ui;border:1px solid #c00;border-radius:4px">
    <strong>vibe check failed</strong><br>${msg}
  </div>`;

export function createVibeEngine(config = {}) {
  const {
    provider,
    cache: cacheOptions = {},
    loading,
    onError,
    debug = false,
  } = config;

  if (!provider) {
    throw new Error('[just-in-vibes] A provider is required. Use openai(), anthropic(), google(), or custom().');
  }

  const cache = createCache(cacheOptions);

  function log(...args) {
    if (debug) console.log('[just-in-vibes]', ...args);
  }

  async function compileVibe(prompt) {
    const key = hashPrompt(provider.name + ':' + prompt);
    const cached = cache.get(key);
    if (cached) {
      log('cache hit for', key);
      return cached;
    }

    log('generating UI for prompt:', prompt.slice(0, 80) + '...');
    const html = await provider.generate(prompt);
    cache.set(key, html);
    return html;
  }

  function renderTo(element, html) {
    element.innerHTML = html;

    // Execute any <script> tags in the injected HTML
    const scripts = element.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  async function vibeElement(element) {
    const prompt =
      element.getAttribute('src')
        ? null // will be loaded from file
        : element.textContent.trim();

    const src = element.getAttribute('src');

    // Show loading state
    element.innerHTML = loading || DEFAULT_LOADING_HTML;

    try {
      let vibePrompt = prompt;

      if (src) {
        log('fetching .vibe file:', src);
        const res = await fetch(src);
        if (!res.ok) throw new Error(`Failed to fetch ${src}: ${res.status}`);
        vibePrompt = await res.text();
      }

      if (!vibePrompt) {
        throw new Error('No prompt found. Use src="/path/to.vibe" or put text inside the element.');
      }

      const html = await compileVibe(vibePrompt);
      renderTo(element, html);
      log('rendered:', src || 'inline vibe');
    } catch (err) {
      const msg = err.message || 'Unknown error';
      if (onError) {
        onError(err, element);
      } else {
        element.innerHTML = DEFAULT_ERROR_HTML(msg);
      }
    }
  }

  async function init(selector = 'vibe-component, [data-vibe]') {
    const elements = document.querySelectorAll(selector);
    log(`found ${elements.length} vibe element(s)`);
    await Promise.all(Array.from(elements).map(vibeElement));
  }

  return {
    init,
    compile: compileVibe,
    render: renderTo,
    clearCache: () => cache.clear(),
  };
}
