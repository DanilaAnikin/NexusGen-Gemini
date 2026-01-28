/**
 * Agents Module
 *
 * Central export point for all AI agents in the NexusGen Worker Service.
 * Each agent is responsible for a specific task in the code generation pipeline.
 */

// ============================================
// Architect Agent
// ============================================
// Converts user prompts into Technical Specifications

export {
  // Types
  type DirectoryNode,
  type FileNode,
  type ProjectStructure,
  type PropSpec,
  type StateSpec,
  type EventHandlerSpec,
  type ComponentSpec,
  type PageMetadata,
  type DataFetchingSpec,
  type PageSpec,
  type RequestBodySpec,
  type ResponseSpec,
  type ApiRouteSpec,
  type DependencySpec,
  type DataFieldSpec,
  type DataRelationSpec,
  type DataModelSpec,
  type EnvVarSpec,
  type ThemeSpec,
  type GlobalStylesSpec,
  type TechnicalSpecification,
  type UploadedAsset,
  type ArchitectAgentResponse,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  // Backward Compatibility Types
  type FrameworkConfig,
  type StylingConfig,
  type StructureConfig,
  type ColorScale,
  type DesignSystemConfig,
  type DependenciesConfig,
  // Prompts
  ARCHITECT_SYSTEM_PROMPT,
  ARCHITECT_USER_PROMPT_TEMPLATE,
  ARCHITECT_RETRY_PROMPT,
  // Agent
  ArchitectAgent,
  createArchitectAgent,
  type ArchitectAgentConfig,
} from './architect';

// ============================================
// Coder Agent
// ============================================
// Generates code from Technical Specifications

export * from './coder';
