import OpenAI from 'openai';

/**
 * Supported OpenAI models
 */
export type OpenAIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'o1'
  | 'o1-mini';

/**
 * Message role types
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Chat message format
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Chat completion response
 */
export interface AIProviderChatResponse {
  content: string;
  usage: TokenUsage;
  stopReason: string | null;
  model: string;
}

/**
 * Streaming chunk
 */
export interface AIProviderStreamChunk {
  type: 'text' | 'usage' | 'end';
  text?: string;
  usage?: TokenUsage;
  stopReason?: string | null;
}

/**
 * Chat request options
 */
export interface ChatOptions {
  model?: OpenAIModel;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
  timeout?: number;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

/**
 * AI Provider service configuration
 */
export interface AIProviderServiceConfig {
  apiKey?: string;
  retry?: Partial<RetryConfig>;
  defaultModel?: OpenAIModel;
  defaultMaxTokens?: number;
  timeout?: number;
}

/**
 * Error types for classification
 */
export enum AIErrorType {
  RATE_LIMIT = 'RATE_LIMIT',
  AUTHENTICATION = 'AUTHENTICATION',
  INVALID_REQUEST = 'INVALID_REQUEST',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom AI Provider error
 */
export class AIProviderError extends Error {
  public readonly type: AIErrorType;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly originalError?: Error;

  constructor(
    message: string,
    type: AIErrorType,
    options?: {
      statusCode?: number;
      retryable?: boolean;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.type = type;
    this.statusCode = options?.statusCode;
    this.retryable = options?.retryable ?? false;
    this.originalError = options?.originalError;
  }
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 60000,
};

/**
 * AIProviderService - Robust OpenAI API wrapper with error handling and retry logic
 */
export class AIProviderService {
  private readonly client: OpenAI;
  private readonly retryConfig: RetryConfig;
  private readonly defaultModel: OpenAIModel;
  private readonly defaultMaxTokens: number;

  // Token usage tracking
  private totalInputTokens: number = 0;
  private totalOutputTokens: number = 0;
  private requestCount: number = 0;

  constructor(config: AIProviderServiceConfig = {}) {
    const apiKey = config.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new AIProviderError(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass apiKey in config.',
        AIErrorType.AUTHENTICATION
      );
    }

    this.client = new OpenAI({
      apiKey,
      timeout: config.timeout ?? 60000,
    });

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retry,
    };

    this.defaultModel = config.defaultModel ?? 'gpt-4o';
    this.defaultMaxTokens = config.defaultMaxTokens ?? 4096;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = this.retryConfig.baseDelay * Math.pow(2, attempt);
    const cappedDelay = Math.min(exponentialDelay, this.retryConfig.maxDelay);
    // Add jitter (0-25% of the delay)
    const jitter = cappedDelay * Math.random() * 0.25;
    return cappedDelay + jitter;
  }

  /**
   * Classify error type from OpenAI API errors
   */
  private classifyError(error: unknown): AIProviderError {
    if (error instanceof AIProviderError) {
      return error;
    }

    // Handle OpenAI SDK errors
    if (error instanceof OpenAI.APIError) {
      const statusCode = error.status;
      const message = error.message;

      if (statusCode === 429) {
        return new AIProviderError(
          `Rate limit exceeded: ${message}`,
          AIErrorType.RATE_LIMIT,
          { statusCode, retryable: true, originalError: error }
        );
      }

      if (statusCode === 401 || statusCode === 403) {
        return new AIProviderError(
          `Authentication error: ${message}`,
          AIErrorType.AUTHENTICATION,
          { statusCode, retryable: false, originalError: error }
        );
      }

      if (statusCode === 400 || statusCode === 422) {
        return new AIProviderError(
          `Invalid request: ${message}`,
          AIErrorType.INVALID_REQUEST,
          { statusCode, retryable: false, originalError: error }
        );
      }

      if (statusCode && statusCode >= 500) {
        return new AIProviderError(
          `Server error: ${message}`,
          AIErrorType.SERVER_ERROR,
          { statusCode, retryable: true, originalError: error }
        );
      }

      return new AIProviderError(
        `API error: ${message}`,
        AIErrorType.UNKNOWN,
        { statusCode, retryable: false, originalError: error }
      );
    }

    // Handle generic errors
    if (error instanceof Error) {
      // Check for timeout-like errors
      if (error.message.toLowerCase().includes('timeout')) {
        return new AIProviderError(
          `Timeout: ${error.message}`,
          AIErrorType.TIMEOUT,
          { retryable: true, originalError: error }
        );
      }

      // Check for network-like errors
      if (
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('econnrefused') ||
        error.message.toLowerCase().includes('enotfound')
      ) {
        return new AIProviderError(
          `Network error: ${error.message}`,
          AIErrorType.NETWORK,
          { retryable: true, originalError: error }
        );
      }

      return new AIProviderError(
        `Unknown error: ${error.message}`,
        AIErrorType.UNKNOWN,
        { retryable: false, originalError: error }
      );
    }

    return new AIProviderError(
      `Unknown error: ${String(error)}`,
      AIErrorType.UNKNOWN,
      { retryable: false }
    );
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log retry attempt
   */
  private logRetry(attempt: number, delay: number, error: AIProviderError): void {
    console.warn(
      `[AIProviderService] Retry attempt ${attempt + 1}/${this.retryConfig.maxRetries} ` +
        `after ${Math.round(delay)}ms delay. Error: ${error.type} - ${error.message}`
    );
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: AIProviderError | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = this.classifyError(error);

        // Don't retry if not retryable or max retries reached
        if (!lastError.retryable || attempt === this.retryConfig.maxRetries) {
          throw lastError;
        }

        const delay = this.calculateBackoffDelay(attempt);
        this.logRetry(attempt, delay, lastError);
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError ?? new AIProviderError(
      `${operationName} failed after retries`,
      AIErrorType.UNKNOWN
    );
  }

  /**
   * Track token usage
   */
  private trackUsage(usage: TokenUsage): void {
    this.totalInputTokens += usage.inputTokens;
    this.totalOutputTokens += usage.outputTokens;
    this.requestCount++;
  }

  /**
   * Get cumulative token usage statistics
   */
  public getUsageStats(): {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    requestCount: number;
  } {
    return {
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      totalTokens: this.totalInputTokens + this.totalOutputTokens,
      requestCount: this.requestCount,
    };
  }

  /**
   * Reset usage statistics
   */
  public resetUsageStats(): void {
    this.totalInputTokens = 0;
    this.totalOutputTokens = 0;
    this.requestCount = 0;
  }

  /**
   * Regular chat completion
   */
  public async chat(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<AIProviderChatResponse> {
    const model = options.model ?? this.defaultModel;
    const maxTokens = options.maxTokens ?? this.defaultMaxTokens;

    return this.executeWithRetry(async () => {
      const requestMessages: OpenAI.ChatCompletionMessageParam[] = [];

      if (options.systemPrompt) {
        requestMessages.push({
          role: 'system' as const,
          content: options.systemPrompt,
        });
      }

      requestMessages.push(
        ...messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
      );

      const response = await this.client.chat.completions.create({
        model,
        messages: requestMessages,
        max_tokens: maxTokens,
        temperature: options.temperature,
        top_p: options.topP,
      });

      // Extract text content from response
      const content = response.choices[0]?.message?.content ?? '';

      const usage: TokenUsage = {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
        totalTokens:
          (response.usage?.prompt_tokens ?? 0) +
          (response.usage?.completion_tokens ?? 0),
      };

      this.trackUsage(usage);

      const stopReason = response.choices[0]?.finish_reason ?? 'unknown';

      return {
        content,
        usage,
        stopReason,
        model: response.model,
      };
    }, 'chat');
  }

  /**
   * Streaming chat completion
   */
  public async *streamChat(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): AsyncGenerator<AIProviderStreamChunk, void, unknown> {
    const model = options.model ?? this.defaultModel;
    const maxTokens = options.maxTokens ?? this.defaultMaxTokens;

    // We need to handle retries differently for streaming
    let attempt = 0;
    let lastError: AIProviderError | null = null;

    while (attempt <= this.retryConfig.maxRetries) {
      try {
        const requestMessages: OpenAI.ChatCompletionMessageParam[] = [];

        if (options.systemPrompt) {
          requestMessages.push({
            role: 'system' as const,
            content: options.systemPrompt,
          });
        }

        requestMessages.push(
          ...messages.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }))
        );

        const stream = await this.client.chat.completions.create({
          model,
          messages: requestMessages,
          max_tokens: maxTokens,
          temperature: options.temperature,
          top_p: options.topP,
          stream: true,
        });

        let fullText = '';
        let lastFinishReason: string | null = null;
        let streamInputTokens = 0;
        let streamOutputTokens = 0;

        for await (const chunk of stream) {
          const deltaText = chunk.choices[0]?.delta?.content;
          if (deltaText) {
            fullText += deltaText;
            yield {
              type: 'text',
              text: deltaText,
            };
          }

          const finishReason = chunk.choices[0]?.finish_reason;
          if (finishReason) {
            lastFinishReason = finishReason;
          }

          // Check for usage data in the chunk (available with stream_options)
          if (chunk.usage) {
            streamInputTokens = chunk.usage.prompt_tokens ?? 0;
            streamOutputTokens = chunk.usage.completion_tokens ?? 0;
          }
        }

        const usage: TokenUsage = {
          inputTokens: streamInputTokens,
          outputTokens: streamOutputTokens,
          totalTokens: streamInputTokens + streamOutputTokens,
        };

        this.trackUsage(usage);

        yield {
          type: 'usage',
          usage,
        };

        yield {
          type: 'end',
          stopReason: lastFinishReason ?? 'end_turn',
        };

        // Successfully completed, exit the retry loop
        return;
      } catch (error) {
        lastError = this.classifyError(error);

        if (!lastError.retryable || attempt === this.retryConfig.maxRetries) {
          throw lastError;
        }

        const delay = this.calculateBackoffDelay(attempt);
        this.logRetry(attempt, delay, lastError);
        await this.sleep(delay);
        attempt++;
      }
    }

    // This should never be reached
    throw lastError ?? new AIProviderError(
      'streamChat failed after retries',
      AIErrorType.UNKNOWN
    );
  }

  /**
   * Convenience method for single-turn chat
   */
  public async complete(
    prompt: string,
    options: ChatOptions = {}
  ): Promise<AIProviderChatResponse> {
    return this.chat([{ role: 'user', content: prompt }], options);
  }

  /**
   * Convenience method for streaming single-turn chat
   */
  public async *streamComplete(
    prompt: string,
    options: ChatOptions = {}
  ): AsyncGenerator<AIProviderStreamChunk, void, unknown> {
    yield* this.streamChat([{ role: 'user', content: prompt }], options);
  }

  /**
   * Get the underlying OpenAI client for advanced usage
   */
  public getClient(): OpenAI {
    return this.client;
  }

  /**
   * Check if a model is supported
   */
  public static isSupportedModel(model: string): model is OpenAIModel {
    const supportedModels: string[] = [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'o1',
      'o1-mini',
    ];
    return supportedModels.includes(model);
  }

  /**
   * Get list of supported models
   */
  public static getSupportedModels(): OpenAIModel[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'o1',
      'o1-mini',
    ];
  }
}
