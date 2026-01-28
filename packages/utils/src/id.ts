import { nanoid, customAlphabet } from 'nanoid';

/**
 * Generate a unique ID using nanoid
 * @param size - Length of the ID (default: 21)
 */
export function generateId(size = 21): string {
  return nanoid(size);
}

/**
 * Generate a URL-friendly unique ID
 */
export function generateUrlId(size = 10): string {
  return nanoid(size);
}

/**
 * Generate a numeric ID
 */
export function generateNumericId(size = 10): string {
  const numericNanoid = customAlphabet('0123456789', size);
  return numericNanoid();
}

/**
 * Generate a prefixed ID (e.g., "usr_abc123")
 */
export function generatePrefixedId(prefix: string, size = 12): string {
  return `${prefix}_${nanoid(size)}`;
}

/**
 * Generate IDs for common entities
 */
export const ids = {
  user: () => generatePrefixedId('usr'),
  project: () => generatePrefixedId('prj'),
  agent: () => generatePrefixedId('agt'),
  session: () => generatePrefixedId('ses'),
  message: () => generatePrefixedId('msg'),
  file: () => generatePrefixedId('fil'),
  task: () => generatePrefixedId('tsk'),
  generation: () => generatePrefixedId('gen'),
  apiKey: () => generatePrefixedId('key', 24),
} as const;
