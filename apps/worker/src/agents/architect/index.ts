/**
 * Architect Agent Module
 *
 * Exports all types, prompts, and the agent class for the Architect Agent.
 * The Architect Agent converts user prompts into comprehensive Technical
 * Specifications that can be used by the Coder Agent.
 */

// Export all types
export type {
  // Project Structure
  DirectoryNode,
  FileNode,
  ProjectStructure,
  // Component Specification
  PropSpec,
  StateSpec,
  EventHandlerSpec,
  ComponentSpec,
  // Page Specification
  PageMetadata,
  DataFetchingSpec,
  PageSpec,
  // API Route Specification
  RequestBodySpec,
  ResponseSpec,
  ApiRouteSpec,
  // Dependency Specification
  DependencySpec,
  // Data Model Specification
  DataFieldSpec,
  DataRelationSpec,
  DataModelSpec,
  // Environment Variables
  EnvVarSpec,
  // Styling
  ThemeSpec,
  GlobalStylesSpec,
  // Main Specification
  TechnicalSpecification,
  // Assets
  UploadedAsset,
  // Response Types
  ArchitectAgentResponse,
  // Validation
  ValidationResult,
  ValidationError,
  ValidationWarning,
  // Backward Compatibility Types
  FrameworkConfig,
  StylingConfig,
  StructureConfig,
  ColorScale,
  DesignSystemConfig,
  DependenciesConfig,
} from './types';

// Export prompts
export {
  ARCHITECT_SYSTEM_PROMPT,
  ARCHITECT_USER_PROMPT_TEMPLATE,
  ARCHITECT_RETRY_PROMPT,
} from './prompts/system.prompt';

// Export agent class and factory
export {
  ArchitectAgent,
  createArchitectAgent,
  type ArchitectAgentConfig,
} from './architect.agent';
