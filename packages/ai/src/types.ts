import { type CoreMessage } from 'ai';

/**
 * Supported AI providers
 */
export type AIProvider = 'openai' | 'anthropic' | 'google';

/**
 * AI model configuration
 */
export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

/**
 * Chat completion request
 */
export interface ChatCompletionRequest {
  messages: CoreMessage[];
  config: AIModelConfig;
  stream?: boolean;
}

/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

/**
 * Streaming chat completion chunk
 */
export interface ChatCompletionChunk {
  delta: string;
  finishReason?: string;
}

/**
 * Available models per provider
 */
export const AVAILABLE_MODELS = {
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'o1-preview',
    'o1-mini',
  ],
  anthropic: [
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
    'claude-3-opus-latest',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ],
  google: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
} as const;

/**
 * The default AI provider used when no provider is explicitly configured
 */
export const DEFAULT_PROVIDER: AIProvider = 'openai';

/**
 * Default model configurations
 */
export const DEFAULT_MODEL_CONFIGS: Record<AIProvider, AIModelConfig> = {
  openai: {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 4096,
  },
  anthropic: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-latest',
    temperature: 0.7,
    maxTokens: 4096,
  },
  google: {
    provider: 'google',
    model: 'gemini-1.5-pro',
    temperature: 0.7,
    maxTokens: 4096,
  },
};

/**
 * The default model config (convenience alias for DEFAULT_MODEL_CONFIGS[DEFAULT_PROVIDER])
 */
export const DEFAULT_MODEL_CONFIG: AIModelConfig = DEFAULT_MODEL_CONFIGS[DEFAULT_PROVIDER];
