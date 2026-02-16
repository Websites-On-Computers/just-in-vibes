export interface Provider {
  name: string;
  generate(prompt: string): Promise<string>;
}

export interface OpenAIOptions {
  apiKey: string;
  model?: string;
  baseURL?: string;
  systemPrompt?: string;
}

export interface AnthropicOptions {
  apiKey: string;
  model?: string;
  baseURL?: string;
  systemPrompt?: string;
}

export interface GoogleOptions {
  apiKey: string;
  model?: string;
  systemPrompt?: string;
}

export interface CustomOptions {
  name?: string;
  generate: (prompt: string) => Promise<string>;
}

export interface CacheOptions {
  ttl?: number;
  storage?: 'localStorage' | 'sessionStorage' | 'none';
}

export interface VibeEngineConfig {
  provider: Provider;
  cache?: CacheOptions;
  loading?: string;
  onError?: (error: Error, element: Element) => void;
  debug?: boolean;
}

export interface VibeEngine {
  init(selector?: string): Promise<void>;
  compile(prompt: string): Promise<string>;
  render(element: Element, html: string): void;
  clearCache(): void;
}

export function createVibeEngine(config: VibeEngineConfig): VibeEngine;
export function openai(options: OpenAIOptions): Provider;
export function anthropic(options: AnthropicOptions): Provider;
export function google(options: GoogleOptions): Provider;
export function custom(options: CustomOptions): Provider;
