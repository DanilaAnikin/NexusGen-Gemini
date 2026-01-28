/**
 * @nexusgen/utils - Validation utilities
 * Common validation helpers for NexusGen AI platform
 */

import { z } from 'zod';

// ============ Zod Schemas ============

/**
 * Common validation schemas
 */
export const schemas = {
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  url: z.string().url('Invalid URL'),
  uuid: z.string().uuid('Invalid UUID'),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ),
  positiveInt: z.number().int().positive(),
  nonNegativeInt: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
} as const;

// ============ Type Guards ============

/**
 * Check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Check if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if value is an array
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Check if value is an object (excluding null and arrays)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is a function
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Check if value is a valid Date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// ============ String Validation ============

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return false;
}

/**
 * Check if a value is not empty
 */
export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return schemas.email.safeParse(email).success;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  return schemas.url.safeParse(url).success;
}

/**
 * Validate UUID format
 */
export function isValidUuid(uuid: string): boolean {
  return schemas.uuid.safeParse(uuid).success;
}

/**
 * Validate slug format (lowercase, alphanumeric, hyphens)
 */
export function isValidSlug(slug: string): boolean {
  return schemas.slug.safeParse(slug).success;
}

/**
 * Validate username format
 */
export function isValidUsername(
  username: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowUnderscore?: boolean;
    allowHyphen?: boolean;
  } = {}
): boolean {
  const {
    minLength = 3,
    maxLength = 30,
    allowUnderscore = true,
    allowHyphen = true,
  } = options;

  if (username.length < minLength || username.length > maxLength) {
    return false;
  }

  let pattern = '^[a-zA-Z0-9';
  if (allowUnderscore) pattern += '_';
  if (allowHyphen) pattern += '-';
  pattern += ']+$';

  const regex = new RegExp(pattern);
  return regex.test(username);
}

/**
 * Validate phone number format (basic international format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate hex color code
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

// ============ Password Validation ============

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number;
}

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    maxLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}
): PasswordValidationResult {
  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options;

  const errors: string[] = [];
  let score = 0;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  } else {
    score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }

  if (password.length > maxLength) {
    errors.push(`Password must be no more than ${maxLength} characters`);
  }

  const hasUppercase = /[A-Z]/.test(password);
  if (requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (hasUppercase) {
    score += 1;
  }

  const hasLowercase = /[a-z]/.test(password);
  if (requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (hasLowercase) {
    score += 1;
  }

  const hasNumber = /[0-9]/.test(password);
  if (requireNumbers && !hasNumber) {
    errors.push('Password must contain at least one number');
  } else if (hasNumber) {
    score += 1;
  }

  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  if (requireSpecialChars && !hasSpecial) {
    errors.push('Password must contain at least one special character');
  } else if (hasSpecial) {
    score += 2;
  }

  let strength: PasswordValidationResult['strength'];
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'fair';
  } else if (score <= 6) {
    strength = 'good';
  } else {
    strength = 'strong';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(score, 8),
  };
}

// ============ Number Validation ============

/**
 * Check if number is within range
 */
export function isInRange(
  value: number,
  min: number,
  max: number,
  inclusive = true
): boolean {
  if (inclusive) {
    return value >= min && value <= max;
  }
  return value > min && value < max;
}

/**
 * Check if value is a positive number
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Check if value is a non-negative number
 */
export function isNonNegative(value: number): boolean {
  return value >= 0;
}

/**
 * Check if value is an integer
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

/**
 * Check if value is a valid port number
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

// ============ Array Validation ============

/**
 * Check if array is empty
 */
export function isEmptyArray<T>(arr: T[]): boolean {
  return arr.length === 0;
}

/**
 * Check if array is not empty
 */
export function isNonEmptyArray<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

/**
 * Check if all items in array satisfy condition
 */
export function allMatch<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.every(predicate);
}

/**
 * Check if any item in array satisfies condition
 */
export function anyMatch<T>(arr: T[], predicate: (item: T) => boolean): boolean {
  return arr.some(predicate);
}

/**
 * Check if array contains unique values
 */
export function hasUniqueValues<T>(arr: T[]): boolean {
  return new Set(arr).size === arr.length;
}

// ============ Object Validation ============

/**
 * Check if object has a specific key
 */
export function hasKey<K extends string>(
  obj: unknown,
  key: K
): obj is { [P in K]: unknown } {
  return isObject(obj) && key in obj;
}

/**
 * Check if object has all specified keys
 */
export function hasKeys<K extends string>(
  obj: unknown,
  keys: K[]
): obj is { [P in K]: unknown } {
  return isObject(obj) && keys.every((key) => key in obj);
}

/**
 * Check if object is empty (no own properties)
 */
export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

// ============ File Validation ============

/**
 * Validate file extension
 */
export function isValidFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}

/**
 * Validate MIME type
 */
export function isValidMimeType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some((allowed) => {
    if (allowed.endsWith('/*')) {
      const prefix = allowed.slice(0, -1);
      return mimeType.startsWith(prefix);
    }
    return mimeType === allowed;
  });
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

// ============ Date Validation ============

/**
 * Check if date is in the past
 */
export function isInPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if date is in the future
 */
export function isInFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Check if date is between two dates
 */
export function isBetweenDates(
  date: Date,
  startDate: Date,
  endDate: Date,
  inclusive = true
): boolean {
  const time = date.getTime();
  const start = startDate.getTime();
  const end = endDate.getTime();

  if (inclusive) {
    return time >= start && time <= end;
  }
  return time > start && time < end;
}

// ============ Zod Helpers ============

/**
 * Validate and parse data with a Zod schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validate that returns success/error result
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
