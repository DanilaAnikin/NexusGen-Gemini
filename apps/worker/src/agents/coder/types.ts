import type { TechnicalSpecification } from '../architect/types';

export type { TechnicalSpecification } from '../architect/types';

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface CoderOutput {
  files: GeneratedFile[];
  summary: string;
}

export interface CodeGenerationContext {
  spec: TechnicalSpecification;
  additionalInstructions?: string;
  existingFiles?: GeneratedFile[];
  targetDirectory?: string;
}

export interface ChunkConfig {
  maxFilesPerChunk: number;
  priorityOrder: ('core' | 'components' | 'pages' | 'api' | 'utils')[];
}

export const DEFAULT_CHUNK_CONFIG: ChunkConfig = {
  maxFilesPerChunk: 10,
  priorityOrder: ['core', 'components', 'pages', 'api', 'utils'],
};
