/**
 * Environment Variable Validation
 *
 * This file validates and exports environment variables.
 * Import this file to ensure type-safe access to env vars.
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
}

function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Server-side environment variables (not exposed to the client)
 */
export const serverEnv = {
  // Node environment
  NODE_ENV: getOptionalEnvVar("NODE_ENV", "development") as
    | "development"
    | "production"
    | "test",

  // Database
  DATABASE_URL: getEnvVar("DATABASE_URL", false),

  // Authentication
  AUTH_SECRET: getEnvVar("AUTH_SECRET", false),
  AUTH_URL: getEnvVar("AUTH_URL", false),

  // OAuth providers
  GOOGLE_CLIENT_ID: getEnvVar("GOOGLE_CLIENT_ID", false),
  GOOGLE_CLIENT_SECRET: getEnvVar("GOOGLE_CLIENT_SECRET", false),
  GITHUB_CLIENT_ID: getEnvVar("GITHUB_CLIENT_ID", false),
  GITHUB_CLIENT_SECRET: getEnvVar("GITHUB_CLIENT_SECRET", false),

  // AI services
  OPENAI_API_KEY: getEnvVar("OPENAI_API_KEY", false),
  ANTHROPIC_API_KEY: getEnvVar("ANTHROPIC_API_KEY", false),

  // Redis
  REDIS_URL: getEnvVar("REDIS_URL", false),

  // External services
  STRIPE_SECRET_KEY: getEnvVar("STRIPE_SECRET_KEY", false),
  STRIPE_WEBHOOK_SECRET: getEnvVar("STRIPE_WEBHOOK_SECRET", false),
} as const;

/**
 * Client-side environment variables (exposed to the browser)
 * These must be prefixed with NEXT_PUBLIC_
 */
export const clientEnv = {
  NEXT_PUBLIC_APP_URL: getOptionalEnvVar(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000"
  ),
  NEXT_PUBLIC_API_URL: getOptionalEnvVar(
    "NEXT_PUBLIC_API_URL",
    "http://localhost:3000/api"
  ),
  NEXT_PUBLIC_WS_URL: getOptionalEnvVar(
    "NEXT_PUBLIC_WS_URL",
    "ws://localhost:3000"
  ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: getEnvVar(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    false
  ),
} as const;

/**
 * Check if we're in production
 */
export const isProduction = serverEnv.NODE_ENV === "production";

/**
 * Check if we're in development
 */
export const isDevelopment = serverEnv.NODE_ENV === "development";

/**
 * Check if we're in test
 */
export const isTest = serverEnv.NODE_ENV === "test";
