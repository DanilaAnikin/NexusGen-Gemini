import { AppConfig } from '../types';

/**
 * Application configuration factory
 *
 * Loads and validates all environment variables
 */
export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nexusgen?schema=public',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    defaultModel: process.env.AI_MODEL_DEFAULT || 'gpt-4-turbo-preview',
  },

  websocket: {
    port: parseInt(process.env.WS_PORT || '3002', 10),
    corsOrigin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
  },

  queue: {
    defaultAttempts: parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS || '3', 10),
    defaultBackoff: parseInt(process.env.QUEUE_DEFAULT_BACKOFF || '1000', 10),
  },
});
