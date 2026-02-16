import { describe, it, expect } from 'vitest';
import { openai, anthropic, google, custom } from '../src/providers/index.js';

describe('openai provider', () => {
  it('returns a provider with name and generate', () => {
    const p = openai({ apiKey: 'test' });
    expect(p.name).toBe('openai');
    expect(typeof p.generate).toBe('function');
  });

  it('throws without an apiKey', async () => {
    const p = openai({});
    await expect(p.generate('hello')).rejects.toThrow('apiKey');
  });

  it('allows custom model and baseURL', () => {
    const p = openai({ apiKey: 'test', model: 'gpt-4o', baseURL: 'https://custom.api' });
    expect(p.name).toBe('openai');
  });
});

describe('anthropic provider', () => {
  it('returns a provider with name and generate', () => {
    const p = anthropic({ apiKey: 'test' });
    expect(p.name).toBe('anthropic');
    expect(typeof p.generate).toBe('function');
  });

  it('throws without an apiKey', async () => {
    const p = anthropic({});
    await expect(p.generate('hello')).rejects.toThrow('apiKey');
  });
});

describe('google provider', () => {
  it('returns a provider with name and generate', () => {
    const p = google({ apiKey: 'test' });
    expect(p.name).toBe('google');
    expect(typeof p.generate).toBe('function');
  });

  it('throws without an apiKey', async () => {
    const p = google({});
    await expect(p.generate('hello')).rejects.toThrow('apiKey');
  });
});

describe('custom provider', () => {
  it('works with a custom generate function', async () => {
    const p = custom({
      name: 'my-llm',
      generate: async (prompt) => `<div>${prompt}</div>`,
    });
    expect(p.name).toBe('my-llm');
    const result = await p.generate('test');
    expect(result).toBe('<div>test</div>');
  });

  it('throws if generate is not a function', () => {
    expect(() => custom({})).toThrow('generate(prompt) function');
  });

  it('throws if generate returns non-string', async () => {
    const p = custom({ generate: async () => 42 });
    await expect(p.generate('test')).rejects.toThrow('must return a string');
  });
});
