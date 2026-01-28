/**
 * @nexusgen/config
 * Shared configurations for NexusGen AI platform
 */

// Re-export Tailwind preset
export { default as tailwindPreset, nexusgenColors, nexusgenFontFamily, nexusgenAnimation } from './tailwind/preset';

// Configuration paths for direct imports
export const CONFIG_PATHS = {
  eslint: '@nexusgen/config/eslint',
  typescript: '@nexusgen/config/typescript',
  tailwind: '@nexusgen/config/tailwind',
} as const;

// Common environment configurations
export const ENVIRONMENTS = ['development', 'staging', 'production', 'test'] as const;
export type Environment = (typeof ENVIRONMENTS)[number];

// Default port configurations
export const DEFAULT_PORTS = {
  web: 3000,
  api: 4000,
  docs: 3001,
  storybook: 6006,
} as const;

// API configuration defaults
export const API_CONFIG = {
  version: 'v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Rate limiting defaults
export const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: {
    free: 60,
    pro: 300,
    enterprise: 1000,
  },
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 10,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/json',
    'application/javascript',
    'text/typescript',
    'text/css',
    'text/html',
  ],
} as const;

// Token limits for AI
export const TOKEN_LIMITS = {
  free: {
    daily: 10000,
    perRequest: 4000,
  },
  pro: {
    daily: 100000,
    perRequest: 8000,
  },
  enterprise: {
    daily: 1000000,
    perRequest: 16000,
  },
} as const;

// Cache TTL defaults (in seconds)
export const CACHE_TTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 3600, // 1 hour
  day: 86400, // 24 hours
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const;

// Session configuration
export const SESSION_CONFIG = {
  accessTokenExpiry: 15 * 60, // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
  rememberMeExpiry: 30 * 24 * 60 * 60, // 30 days
} as const;

// Supported languages for code generation
export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'go',
  'rust',
  'java',
  'csharp',
  'cpp',
  'ruby',
  'php',
  'swift',
  'kotlin',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Supported frameworks
export const SUPPORTED_FRAMEWORKS = [
  'nextjs',
  'react',
  'vue',
  'nuxt',
  'svelte',
  'astro',
  'remix',
  'express',
  'fastapi',
  'django',
  'rails',
  'spring',
] as const;

export type SupportedFramework = (typeof SUPPORTED_FRAMEWORKS)[number];
