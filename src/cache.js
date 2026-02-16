const STORAGE_PREFIX = 'jiv:';

export function createCache(options = {}) {
  const { ttl = 1000 * 60 * 60 * 24, storage = 'localStorage' } = options;

  const store =
    storage === 'none'
      ? null
      : storage === 'sessionStorage'
        ? globalThis.sessionStorage
        : globalThis.localStorage;

  return {
    get(key) {
      if (!store) return null;
      try {
        const raw = store.getItem(STORAGE_PREFIX + key);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.ts > ttl) {
          store.removeItem(STORAGE_PREFIX + key);
          return null;
        }
        return entry.html;
      } catch {
        return null;
      }
    },

    set(key, html) {
      if (!store) return;
      try {
        store.setItem(
          STORAGE_PREFIX + key,
          JSON.stringify({ html, ts: Date.now() })
        );
      } catch {
        // storage full or unavailable — silently skip
      }
    },

    clear() {
      if (!store) return;
      const toRemove = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k.startsWith(STORAGE_PREFIX)) toRemove.push(k);
      }
      toRemove.forEach((k) => store.removeItem(k));
    },
  };
}

export function hashPrompt(prompt) {
  // Simple djb2 hash — good enough for cache keys
  let hash = 5381;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) + hash + prompt.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}
