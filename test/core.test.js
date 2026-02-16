import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createVibeEngine } from '../src/core.js';

// Mock localStorage for cache
const mockStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, val) => { store[key] = val; },
    removeItem: (key) => { delete store[key]; },
    get length() { return Object.keys(store).length; },
    key: (i) => Object.keys(store)[i],
    clear: () => { store = {}; },
  };
})();

beforeEach(() => {
  mockStorage.clear();
  vi.stubGlobal('localStorage', mockStorage);
});

function mockProvider(html = '<div>mocked</div>') {
  return {
    name: 'mock',
    generate: vi.fn().mockResolvedValue(html),
  };
}

describe('createVibeEngine', () => {
  it('throws without a provider', () => {
    expect(() => createVibeEngine()).toThrow('provider is required');
  });

  it('creates an engine with required methods', () => {
    const engine = createVibeEngine({ provider: mockProvider() });
    expect(typeof engine.init).toBe('function');
    expect(typeof engine.compile).toBe('function');
    expect(typeof engine.render).toBe('function');
    expect(typeof engine.clearCache).toBe('function');
  });

  it('compile() calls provider.generate', async () => {
    const provider = mockProvider('<p>hello</p>');
    const engine = createVibeEngine({ provider });

    const result = await engine.compile('make a paragraph');
    expect(result).toBe('<p>hello</p>');
    expect(provider.generate).toHaveBeenCalledWith('make a paragraph');
  });

  it('compile() returns cached result on second call', async () => {
    const provider = mockProvider('<p>hello</p>');
    const engine = createVibeEngine({ provider });

    await engine.compile('same prompt');
    await engine.compile('same prompt');

    expect(provider.generate).toHaveBeenCalledTimes(1);
  });

  it('clearCache() busts the cache', async () => {
    const provider = mockProvider('<p>hello</p>');
    const engine = createVibeEngine({ provider });

    await engine.compile('prompt');
    engine.clearCache();
    await engine.compile('prompt');

    expect(provider.generate).toHaveBeenCalledTimes(2);
  });
});
