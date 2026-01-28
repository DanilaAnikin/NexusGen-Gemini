/**
 * @nexusgen/utils
 * Shared utilities for NexusGen AI platform
 */

// Re-export existing utilities
export * from './string';
export {
  // Note: formatDate is exported from format.ts instead
  getRelativeTime,
  getDaysDifference,
  getHoursDifference,
  getMinutesDifference,
  addDaysToDate,
  addHoursToDate,
  getStartOfDay,
  getEndOfDay,
  // Note: isValidDate is exported from validation.ts instead
} from './date';
export * from './id';
export * from './validation';

// Format utilities
export {
  // Date formatting
  formatDate,
  formatDateISO,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  // Number formatting
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompact,
  formatBytes,
  formatOrdinal,
  // String formatting
  truncate,
  slugify,
  toTitleCase,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toKebabCase,
  pluralize,
  formatList,
  maskString,
  maskEmail,
} from './format';

// Crypto utilities
export {
  // Random generation
  generateUuid,
  randomBytes,
  randomHex,
  randomBase64,
  randomAlphanumeric,
  generateToken,
  randomBase64Url,
  randomInt,
  // Hashing
  sha256,
  sha512,
  sha1,
  hmacSha256,
  verifyHmacSha256,
  // API key
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  // Encoding/Decoding
  bytesToHex,
  hexToBytes,
  bytesToBase64,
  base64ToBytes,
  bytesToBase64Url,
  base64UrlToBytes,
  encodeBase64,
  decodeBase64,
  // Security
  timingSafeEqual,
  generateNonce,
  generateCsrfToken,
  maskSecret,
  // Key derivation
  deriveKey,
} from './crypto';

// Logger
export {
  Logger,
  createLogger,
  logger,
} from './logger';

export type {
  LogLevel,
  LogEntry,
  ErrorInfo,
  LoggerConfig,
  LogTransport,
} from './logger';

// Storage utilities (S3-compatible)
export {
  createStorageClient,
  createStorageClientFromEnv,
  uploadFile,
  getSignedUrl,
  getSignedUploadUrl,
  deleteFile,
  fileExists,
  S3Client,
} from './storage';

export type {
  StorageConfig,
  UploadOptions,
  SignedUploadOptions,
  UploadResult,
} from './storage';

// Port Manager utilities
export {
  PortManager,
  findAvailablePort,
  isPortAvailable,
  reservePort,
  releasePort,
  getDefaultPortManager,
} from './port-manager';

export const UTILS_VERSION = '0.1.0';
