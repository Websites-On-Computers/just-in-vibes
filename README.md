# just-in-vibes

Write `.vibe` files with plain text prompts. An LLM builds your frontend at runtime.

```
// counter.vibe
A simple counter with a big number display, plus and minus buttons,
clean modern styling, and smooth animations.
```

That's it. That's the component.

## Install

```bash
npm install just-in-vibes
```

Or use a script tag:

```html
<script src="https://unpkg.com/just-in-vibes/dist/just-in-vibes.umd.js"></script>
```

## Quick Start

### Script Tag

```html
<vibe-component src="counter.vibe"></vibe-component>

<script src="https://unpkg.com/just-in-vibes/dist/just-in-vibes.umd.js"></script>
<script>
  const engine = JustInVibes.createVibeEngine({
    provider: JustInVibes.openai({ apiKey: 'sk-...' }),
  });
  engine.init();
</script>
```

### ES Modules

```js
import { createVibeEngine, openai } from 'just-in-vibes';

const engine = createVibeEngine({
  provider: openai({ apiKey: 'sk-...' }),
});

engine.init();
```

## How It Works

1. Drop `<vibe-component>` elements in your HTML
2. Point them at `.vibe` files (or write prompts inline)
3. On load, the library sends each prompt to your chosen LLM
4. The LLM returns HTML/CSS/JS which gets injected into the page
5. Results are cached in localStorage so you only pay for the API call once

## Vibe Files

A `.vibe` file is just a plain text file with a description of what you want:

```
// todo.vibe
A fully functional todo list with add, complete, and delete.
Clean minimal design with subtle shadows. All state in JS.
```

## Providers

### OpenAI

```js
import { openai } from 'just-in-vibes';

openai({
  apiKey: 'sk-...',        // required
  model: 'gpt-4o-mini',   // default
  baseURL: 'https://...',  // optional, for proxies or compatible APIs
  systemPrompt: '...',     // optional, override the default
})
```

### Anthropic

```js
import { anthropic } from 'just-in-vibes';

anthropic({
  apiKey: 'sk-ant-...',
  model: 'claude-sonnet-4-5-20250929',  // default
  systemPrompt: '...',
})
```

### Google (Gemini)

```js
import { google } from 'just-in-vibes';

google({
  apiKey: 'AI...',
  model: 'gemini-2.0-flash',  // default
  systemPrompt: '...',
})
```

### Custom Provider

Bring your own LLM — just give it a `generate` function:

```js
import { custom } from 'just-in-vibes';

custom({
  name: 'my-local-llm',
  generate: async (prompt) => {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({ model: 'llama3', prompt }),
    });
    const data = await res.json();
    return data.response; // must return an HTML string
  },
})
```

## Usage Patterns

### Inline Vibes

No `.vibe` file needed — write the prompt right in your HTML:

```html
<vibe-component>
  A big friendly greeting that says "Hello World" with bouncy CSS animations
  and a purple-to-pink gradient.
</vibe-component>
```

### File-based Vibes

```html
<vibe-component src="components/navbar.vibe"></vibe-component>
<vibe-component src="components/hero.vibe"></vibe-component>
<vibe-component src="components/footer.vibe"></vibe-component>
```

### Programmatic Use

```js
const engine = createVibeEngine({ provider: openai({ apiKey: '...' }) });

// Compile a prompt to HTML without rendering
const html = await engine.compile('A loading spinner with neon glow');

// Render HTML into an element
engine.render(document.getElementById('target'), html);

// Clear the cache to regenerate everything
engine.clearCache();
```

## Configuration

```js
createVibeEngine({
  // Required: an LLM provider
  provider: openai({ apiKey: '...' }),

  // Cache settings
  cache: {
    ttl: 1000 * 60 * 60 * 24,  // 24 hours (default)
    storage: 'localStorage',     // 'localStorage' | 'sessionStorage' | 'none'
  },

  // Custom loading state HTML
  loading: '<div class="my-spinner">Loading...</div>',

  // Custom error handler
  onError: (err, element) => {
    element.innerHTML = `<p>Oops: ${err.message}</p>`;
  },

  // Log to console
  debug: true,
});
```

## Examples

Check the `examples/` directory for a full demo page with:
- `counter.vibe` — interactive counter component
- `todo.vibe` — full todo list app
- `weather-card.vibe` — weather display widget
- Inline vibe — animated greeting

To run it:

```bash
npm run build
cd examples
npx serve .
```

Then edit `examples/index.html` and replace `YOUR_API_KEY_HERE` with your key.

## API

### `createVibeEngine(config)` → `engine`

Creates a new engine instance.

### `engine.init(selector?)` → `Promise`

Finds all matching elements (default: `vibe-component, [data-vibe]`) and compiles them.

### `engine.compile(prompt)` → `Promise<string>`

Sends a prompt to the LLM and returns the generated HTML. Uses cache.

### `engine.render(element, html)` → `void`

Injects HTML into an element and activates any `<script>` tags.

### `engine.clearCache()` → `void`

Clears all cached vibe results from storage.

## License

MIT
