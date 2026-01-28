import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { type LanguageModel } from 'ai';

import { type AIProvider, type AIModelConfig } from './types';

/**
 * Create an OpenAI provider instance
 */
export function createOpenAIProvider(apiKey?: string) {
  return createOpenAI({
    apiKey: apiKey ?? process.env.OPENAI_API_KEY,
  });
}

/**
 * Create an Anthropic provider instance
 */
export function createAnthropicProvider(apiKey?: string) {
  return createAnthropic({
    apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
  });
}

/**
 * Create a Google AI provider instance
 */
export function createGoogleProvider(apiKey?: string) {
  return createGoogleGenerativeAI({
    apiKey: apiKey ?? process.env.GOOGLE_AI_API_KEY,
  });
}

/**
 * Get a language model from configuration
 */
export function getLanguageModel(config: AIModelConfig): LanguageModel {
  const { provider, model } = config;

  switch (provider) {
    case 'openai': {
      const openai = createOpenAIProvider();
      return openai(model);
    }
    case 'anthropic': {
      const anthropic = createAnthropicProvider();
      return anthropic(model);
    }
    case 'google': {
      const google = createGoogleProvider();
      return google(model);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Check if a provider API key is configured
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  switch (provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'google':
      return !!process.env.GOOGLE_AI_API_KEY;
    default:
      return false;
  }
}

/**
 * Get all configured providers
 */
export function getConfiguredProviders(): AIProvider[] {
  const providers: AIProvider[] = ['openai', 'anthropic', 'google'];
  return providers.filter(isProviderConfigured);
}
