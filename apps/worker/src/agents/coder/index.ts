/**
 * Coder Agent Module
 *
 * Exports all types, prompts, and the agent class for the Coder Agent.
 * The Coder Agent generates production-ready code files from Technical
 * Specifications provided by the Architect Agent.
 */

// Export types
export type {
  GeneratedFile,
  CoderOutput,
  CodeGenerationContext,
  ChunkConfig,
} from './types';

export { DEFAULT_CHUNK_CONFIG } from './types';

// Re-export TechnicalSpecification from architect for convenience
export type { TechnicalSpecification } from './types';

// Export prompts
export { CODER_SYSTEM_PROMPT } from './prompts/system.prompt';

// Export agent class and factory
export {
  CoderAgent,
  createCoderAgent,
  type CoderAgentOptions,
} from './coder.agent';
