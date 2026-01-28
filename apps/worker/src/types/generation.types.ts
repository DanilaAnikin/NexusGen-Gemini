/**
 * Generation Types for Agent Integration
 *
 * Type definitions for the generation service that integrates
 * ArchitectAgent and CoderAgent for code generation.
 *
 * NOTE: The TechnicalSpecification type is imported from the agents module
 * to ensure type consistency between the architect agent output and
 * the coder agent input.
 */

import { GeneratedFile } from '@nexusgen/types';
import type { TechnicalSpecification as AgentTechnicalSpecification } from '../agents/architect/types';

// Re-export TechnicalSpecification from the agents for type consistency
// This ensures the spec used throughout the generation pipeline is the same type
export type { TechnicalSpecification } from '../agents/architect/types';

// Use the imported type for local interfaces
type TechnicalSpecification = AgentTechnicalSpecification;

/**
 * Input data for a generation job
 */
export interface GenerationJobData {
  /** Unique project identifier */
  projectId: string;
  /** User prompt/description for what to generate */
  prompt: string;
  /** Optional asset URLs/paths to include in generation */
  assets?: string[];
  /** User who initiated the generation */
  userId: string;
  /** Optional generation settings */
  settings?: GenerationSettings;
}

/**
 * Generation settings/configuration
 */
export interface GenerationSettings {
  /** Framework to use (nextjs, react, vue, etc.) */
  framework?: string;
  /** Styling solution (tailwind, css-modules, etc.) */
  styling?: string;
  /** TypeScript or JavaScript */
  language?: 'typescript' | 'javascript';
  /** Additional features to include */
  features?: string[];
  /** AI model to use */
  model?: string;
  /** Temperature for AI generation */
  temperature?: number;
  /** Maximum tokens for generation */
  maxTokens?: number;
  /** Custom instructions for the AI */
  customInstructions?: string;
}

/**
 * Result of a generation operation
 */
export interface GenerationResult {
  /** Whether the generation succeeded */
  success: boolean;
  /** Technical specification (if successful) */
  spec?: TechnicalSpecification;
  /** Generated files (if successful) */
  files?: GeneratedFile[];
  /** Path to the sandbox where files were written */
  sandboxPath?: string;
  /** Error message (if failed) */
  error?: string;
  /** Error details (if failed) */
  errorDetails?: Record<string, unknown>;
}

/**
 * Asset information for generation
 */
export interface GenerationAsset {
  /** Asset ID */
  id: string;
  /** Asset type */
  type: 'image' | 'document' | 'wireframe' | 'logo' | 'other';
  /** Asset URL */
  url: string;
  /** MIME type */
  mimeType: string;
  /** File name */
  fileName?: string;
  /** Description */
  description?: string;
}

/**
 * Progress update during generation
 */
export interface GenerationProgress {
  /** Current step */
  step: 'analyzing' | 'planning' | 'generating' | 'validating' | 'writing';
  /** Progress percentage (0-100) */
  percentage: number;
  /** Current step description */
  message: string;
  /** Additional details */
  details?: Record<string, unknown>;
}
