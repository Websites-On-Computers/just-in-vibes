// Auto-init entry point for <script> tag usage.
// Include this after setting window.VIBE_CONFIG.
import { createVibeEngine } from './core.js';

function boot() {
  const config = window.VIBE_CONFIG;
  if (!config) {
    console.warn(
      '[just-in-vibes] No window.VIBE_CONFIG found. Set it before loading the script.\n' +
      'Example:\n' +
      '  <script>\n' +
      '    window.VIBE_CONFIG = { provider: JustInVibes.openai({ apiKey: "..." }) }\n' +
      '  </script>'
    );
    return;
  }

  const engine = createVibeEngine(config);
  engine.init();
  window.__vibeEngine = engine;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
