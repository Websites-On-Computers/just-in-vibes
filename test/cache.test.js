import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCache, hashPrompt } from '../src/cache.js';

// Mock localStorage
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

// Inject mock before each test
beforeEach(() => {
  mockStorage.clear();
  vi.stubGlobal('localStorage', mockStorage);
});

describe('hashPrompt', () => {
  it('returns a string', () => {
    expect(typeof hashPrompt('hello')).toBe('string');
  });

  it('returns the same hash for the same input', () => {
    expect(hashPrompt('test prompt')).toBe(hashPrompt('test prompt'));
  });

  it('returns different hashes for different inputs', () => {
    expect(hashPrompt('prompt a')).not.toBe(hashPrompt('prompt b'));
  });
});

describe('createCache', () => {
  it('stores and retrieves values', () => {
    const cache = createCache();
    cache.set('key1', '<div>Hello</div>');
    expect(cache.get('key1')).toBe('<div>Hello</div>');
  });

  it('returns null for missing keys', () => {
    const cache = createCache();
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('respects TTL', () => {
    const cache = createCache({ ttl: 100 });
    cache.set('key1', '<div>Hi</div>');

    // Mock time passing
    const original = Date.now;
    Date.now = () => original() + 200;

    expect(cache.get('key1')).toBeNull();
    Date.now = original;
  });

  it('clears only jiv: prefixed keys', () => {
    const cache = createCache();
    cache.set('a', 'html-a');
    mockStorage.setItem('other-key', 'should-stay');

    cache.clear();

    expect(cache.get('a')).toBeNull();
    expect(mockStorage.getItem('other-key')).toBe('should-stay');
  });

  it('does nothing when storage is "none"', () => {
    const cache = createCache({ storage: 'none' });
    cache.set('key1', 'html');
    expect(cache.get('key1')).toBeNull();
  });
});
