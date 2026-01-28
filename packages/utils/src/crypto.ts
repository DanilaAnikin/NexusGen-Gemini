/**
 * @nexusgen/utils - Crypto utilities
 * Hash and cryptographic utilities for NexusGen AI platform
 *
 * Note: This module uses the Web Crypto API which is available in
 * modern Node.js (v15+) and all modern browsers.
 */

// Get crypto from appropriate source (Node.js or browser)
const getCrypto = (): typeof globalThis.crypto => {
  if (typeof globalThis.crypto !== 'undefined') {
    return globalThis.crypto;
  }
  // Node.js fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('crypto').webcrypto;
};

// ============ Random Generation ============

/**
 * Generate a random UUID v4
 */
export function generateUuid(): string {
  const crypto = getCrypto();
  return crypto.randomUUID();
}

/**
 * Generate random bytes as Uint8Array
 */
export function randomBytes(length: number): Uint8Array {
  const crypto = getCrypto();
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generate a random hex string
 */
export function randomHex(length: number): string {
  const bytes = randomBytes(Math.ceil(length / 2));
  return bytesToHex(bytes).slice(0, length);
}

/**
 * Generate a random base64 string
 */
export function randomBase64(length: number): string {
  const bytes = randomBytes(Math.ceil((length * 3) / 4));
  return bytesToBase64(bytes).slice(0, length);
}

/**
 * Generate a random alphanumeric string
 */
export function randomAlphanumeric(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i]! % charset.length];
  }
  return result;
}

/**
 * Generate a secure token for authentication
 */
export function generateToken(length = 32): string {
  return randomBase64Url(length);
}

/**
 * Generate a random base64url string (URL-safe)
 */
export function randomBase64Url(length: number): string {
  const bytes = randomBytes(Math.ceil((length * 3) / 4));
  return bytesToBase64Url(bytes).slice(0, length);
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  const crypto = getCrypto();
  const range = max - min + 1;
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return min + (bytes[0]! % range);
}

// ============ Hashing ============

/**
 * Hash a string using SHA-256
 */
export async function sha256(data: string): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Hash a string using SHA-512
 */
export async function sha512(data: string): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-512', dataBuffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Hash data using SHA-1 (for non-security purposes like checksums)
 */
export async function sha1(data: string): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-1', dataBuffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Create an HMAC signature
 */
export async function hmacSha256(
  data: string,
  secret: string
): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return bytesToHex(new Uint8Array(signature));
}

/**
 * Verify an HMAC signature
 */
export async function verifyHmacSha256(
  data: string,
  secret: string,
  signature: string
): Promise<boolean> {
  const expectedSignature = await hmacSha256(data, secret);
  return timingSafeEqual(signature, expectedSignature);
}

// ============ API Key Generation ============

/**
 * Generate an API key with prefix
 * Format: prefix_randomstring (e.g., nxg_abc123...)
 */
export function generateApiKey(prefix = 'nxg'): {
  key: string;
  keyPrefix: string;
  hash: Promise<string>;
} {
  const randomPart = randomBase64Url(32);
  const key = `${prefix}_${randomPart}`;
  const keyPrefix = key.slice(0, prefix.length + 5); // prefix + _ + 4 chars

  return {
    key,
    keyPrefix,
    hash: sha256(key),
  };
}

/**
 * Hash an API key for storage
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  return sha256(apiKey);
}

/**
 * Verify an API key against its hash
 */
export async function verifyApiKey(
  apiKey: string,
  hashedKey: string
): Promise<boolean> {
  const hash = await sha256(apiKey);
  return timingSafeEqual(hash, hashedKey);
}

// ============ Encoding/Decoding ============

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert bytes to base64 string
 */
export function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  // Browser fallback
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert base64 string to bytes
 */
export function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  // Browser fallback
  return new Uint8Array(
    atob(base64)
      .split('')
      .map((c) => c.charCodeAt(0))
  );
}

/**
 * Convert bytes to base64url (URL-safe base64)
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Convert base64url to bytes
 */
export function base64UrlToBytes(base64url: string): Uint8Array {
  // Add padding if needed
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64ToBytes(base64);
}

/**
 * Encode string to base64
 */
export function encodeBase64(str: string): string {
  const encoder = new TextEncoder();
  return bytesToBase64(encoder.encode(str));
}

/**
 * Decode base64 to string
 */
export function decodeBase64(base64: string): string {
  const decoder = new TextDecoder();
  return decoder.decode(base64ToBytes(base64));
}

// ============ Security Utilities ============

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a secure nonce for CSP or other purposes
 */
export function generateNonce(): string {
  return randomBase64(16);
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBase64Url(32);
}

/**
 * Mask a sensitive string (show only first and last few characters)
 */
export function maskSecret(secret: string, visibleChars = 4): string {
  if (secret.length <= visibleChars * 2) {
    return '*'.repeat(secret.length);
  }

  const start = secret.slice(0, visibleChars);
  const end = secret.slice(-visibleChars);
  const masked = '*'.repeat(Math.min(secret.length - visibleChars * 2, 10));

  return `${start}${masked}${end}`;
}

// ============ Password Hashing (for reference) ============
// Note: For production password hashing, use bcrypt, scrypt, or argon2
// through dedicated libraries. These are not included here as they
// require native dependencies or WASM.

/**
 * Derive a key from a password using PBKDF2
 * Note: For production, prefer bcrypt/argon2
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations = 100000,
  keyLength = 32
): Promise<Uint8Array> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    key,
    keyLength * 8
  );

  return new Uint8Array(derivedBits);
}
