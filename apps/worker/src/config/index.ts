export { default as configuration } from './configuration';

/**
 * Environment validation schema
 *
 * Used to validate required environment variables at startup
 */
export const envValidationSchema = {
  NODE_ENV: {
    required: false,
    default: 'development',
    enum: ['development', 'production', 'test'],
  },
  PORT: {
    required: false,
    default: '3001',
    type: 'number',
  },
  DATABASE_URL: {
    required: true,
    type: 'string',
  },
  REDIS_HOST: {
    required: false,
    default: 'localhost',
    type: 'string',
  },
  REDIS_PORT: {
    required: false,
    default: '6379',
    type: 'number',
  },
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
  },
  OPENAI_API_KEY: {
    required: false,
    type: 'string',
  },
};

/**
 * Get required environment variable or throw
 */
export function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
export function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
