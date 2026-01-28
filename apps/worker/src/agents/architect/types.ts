/**
 * Technical Specification Types for Architect Agent
 *
 * These types define the complete JSON schema that the Architect Agent
 * outputs after analyzing user requirements. The specification is detailed
 * enough for the Coder Agent to generate complete, production-ready code.
 */

// ============================================
// Project Structure Types
// ============================================

/**
 * Represents a directory in the project structure
 */
export interface DirectoryNode {
  /** Directory name */
  name: string;
  /** Type indicator for directory */
  type: 'directory';
  /** Child files and directories */
  children: (DirectoryNode | FileNode)[];
  /** Optional description of directory purpose */
  description?: string;
}

/**
 * Represents a file in the project structure
 */
export interface FileNode {
  /** File name with extension */
  name: string;
  /** Type indicator for file */
  type: 'file';
  /** Brief description of file purpose */
  description?: string;
  /** File category for organization */
  category?: 'component' | 'page' | 'api' | 'config' | 'style' | 'util' | 'type' | 'test' | 'other';
}

/**
 * Complete project directory structure
 */
export interface ProjectStructure {
  /** Root directory node */
  root: DirectoryNode;
}

// ============================================
// Component Specification Types
// ============================================

/**
 * Prop definition for a component
 */
export interface PropSpec {
  /** Prop name */
  name: string;
  /** TypeScript type string */
  type: string;
  /** Whether the prop is required */
  required: boolean;
  /** Default value if optional */
  defaultValue?: string;
  /** Description of the prop */
  description: string;
}

/**
 * State definition for a component
 */
export interface StateSpec {
  /** State variable name */
  name: string;
  /** TypeScript type string */
  type: string;
  /** Initial value */
  initialValue: string;
  /** Description of the state purpose */
  description: string;
}

/**
 * Event handler definition
 */
export interface EventHandlerSpec {
  /** Handler function name */
  name: string;
  /** Event type (e.g., 'onClick', 'onSubmit') */
  eventType: string;
  /** Description of what the handler does */
  description: string;
  /** Whether it's async */
  async: boolean;
}

/**
 * Complete component specification
 */
export interface ComponentSpec {
  /** Component name (PascalCase) */
  name: string;
  /** File path relative to project root */
  path: string;
  /** Component description */
  description: string;
  /** Component type */
  type: 'client' | 'server' | 'shared';
  /** Whether this is a client component (for backward compatibility) */
  isClientComponent?: boolean;
  /** Props definition */
  props: PropSpec[];
  /** Internal state (for client components) */
  state?: StateSpec[];
  /** Event handlers */
  eventHandlers?: EventHandlerSpec[];
  /** Component dependencies (other components used) */
  dependencies: string[];
  /** External package dependencies */
  packageDependencies?: string[];
  /** Associated styles */
  styles?: {
    /** Tailwind classes to use */
    tailwindClasses?: string[];
    /** CSS module file path if applicable */
    cssModulePath?: string;
  };
  /** Accessibility considerations */
  accessibility?: {
    /** ARIA attributes to include */
    ariaAttributes?: string[];
    /** Keyboard navigation support */
    keyboardNavigation?: boolean;
    /** Screen reader considerations */
    screenReaderNotes?: string;
  };
  /** Test specifications */
  testCases?: string[];
}

// ============================================
// Page Specification Types
// ============================================

/**
 * Metadata for a page (SEO, etc.)
 */
export interface PageMetadata {
  /** Page title */
  title: string;
  /** Meta description */
  description: string;
  /** Open Graph metadata */
  openGraph?: {
    title?: string;
    description?: string;
    images?: string[];
  };
  /** Additional meta tags */
  additionalMeta?: Record<string, string>;
}

/**
 * Data fetching specification for a page
 */
export interface DataFetchingSpec {
  /** Fetching method */
  method: 'server-component' | 'client-fetch' | 'server-action' | 'static' | 'isr';
  /** Data fetching type (alias for method, for backward compatibility) */
  type?: 'server-component' | 'client-fetch' | 'server-action' | 'static' | 'isr';
  /** Data source description */
  source: string;
  /** Cache configuration */
  caching?: {
    /** Revalidation time in seconds */
    revalidate?: number;
    /** Cache tags for on-demand revalidation */
    tags?: string[];
  };
  /** Error handling strategy */
  errorHandling: 'error-boundary' | 'fallback-ui' | 'redirect' | 'not-found';
  /** Loading state specification */
  loadingState?: {
    /** Use Suspense */
    useSuspense: boolean;
    /** Skeleton component name */
    skeletonComponent?: string;
  };
}

/**
 * Complete page specification
 */
export interface PageSpec {
  /** Page name (for backward compatibility) */
  name?: string;
  /** Route path (e.g., '/dashboard', '/users/[id]') */
  route: string;
  /** Page file path */
  filePath: string;
  /** Page description */
  description: string;
  /** Whether this is a server component (for backward compatibility) */
  isServerComponent?: boolean;
  /** Components used on this page */
  components: string[];
  /** Data fetching requirements */
  dataFetching?: DataFetchingSpec;
  /** Page metadata */
  metadata: PageMetadata;
  /** Layout to use (if not default) */
  layout?: string;
  /** Route parameters */
  params?: {
    name: string;
    type: string;
    description: string;
  }[];
  /** Search params */
  searchParams?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  /** Middleware requirements */
  middleware?: string[];
  /** Authentication required */
  requiresAuth?: boolean;
  /** Required permissions/roles */
  requiredRoles?: string[];
}

// ============================================
// API Route Specification Types
// ============================================

/**
 * Request body schema
 */
export interface RequestBodySpec {
  /** Content type */
  contentType: 'application/json' | 'multipart/form-data' | 'text/plain';
  /** Schema description */
  schema: {
    /** Field definitions */
    fields: {
      name: string;
      type: string;
      required: boolean;
      description: string;
      validation?: string;
    }[];
  };
}

/**
 * Response specification
 */
export interface ResponseSpec {
  /** HTTP status code */
  statusCode: number;
  /** Response description */
  description: string;
  /** Response body schema */
  schema?: {
    type: string;
    properties?: Record<string, { type: string; description: string }>;
  };
}

/**
 * Complete API route specification
 */
export interface ApiRouteSpec {
  /** API path (e.g., '/api/users', '/api/posts/[id]') */
  path: string;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Handler description */
  description: string;
  /** Request body specification */
  requestBody?: RequestBodySpec;
  /** Response body schema (for backward compatibility) */
  responseBody?: ResponseSpec['schema'];
  /** Response specifications */
  responses: ResponseSpec[];
  /** Query parameters */
  queryParams?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  /** Path parameters */
  pathParams?: {
    name: string;
    type: string;
    description: string;
  }[];
  /** Authentication required */
  requiresAuth: boolean;
  /** Authentication required (alias for backward compatibility) */
  authentication?: boolean;
  /** Required permissions */
  requiredPermissions?: string[];
  /** Rate limiting configuration */
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  /** Middleware to apply */
  middleware?: string[];
}

// ============================================
// Dependency Specification Types
// ============================================

/**
 * Package dependency specification
 */
export interface DependencySpec {
  /** Package name */
  name: string;
  /** Version (semver or 'latest') */
  version: string;
  /** Whether it's a dev dependency */
  devDependency: boolean;
  /** Why this dependency is needed */
  reason: string;
}

// ============================================
// Data Model Specification Types
// ============================================

/**
 * Field in a data model
 */
export interface DataFieldSpec {
  /** Field name */
  name: string;
  /** Field type */
  type: string;
  /** Whether field is required */
  required: boolean;
  /** Whether field is unique */
  unique?: boolean;
  /** Default value */
  defaultValue?: string;
  /** Field description */
  description: string;
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

/**
 * Relation between data models
 */
export interface DataRelationSpec {
  /** Relation name */
  name: string;
  /** Relation type */
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  /** Related model name */
  relatedModel: string;
  /** Foreign key field */
  foreignKey?: string;
  /** Description of relation */
  description: string;
}

/**
 * Complete data model specification
 */
export interface DataModelSpec {
  /** Model name (PascalCase) */
  name: string;
  /** Model description */
  description: string;
  /** Fields in the model */
  fields: DataFieldSpec[];
  /** Relations to other models */
  relations?: DataRelationSpec[];
  /** Indexes to create */
  indexes?: {
    fields: string[];
    unique?: boolean;
  }[];
  /** Timestamps */
  timestamps?: {
    createdAt: boolean;
    updatedAt: boolean;
  };
}

// ============================================
// Environment Variable Specification Types
// ============================================

/**
 * Environment variable specification
 */
export interface EnvVarSpec {
  /** Variable name */
  name: string;
  /** Description of the variable */
  description: string;
  /** Whether it's required */
  required: boolean;
  /** Example value */
  example: string;
  /** Variable category */
  category?: 'database' | 'auth' | 'api' | 'feature-flag' | 'third-party' | 'other';
  /** Whether it contains sensitive data */
  sensitive?: boolean;
}

// ============================================
// Styling Specification Types
// ============================================

/**
 * Theme configuration
 */
export interface ThemeSpec {
  /** Color palette */
  colors?: {
    name: string;
    value: string;
    cssVariable?: string;
  }[];
  /** Typography settings */
  typography?: {
    fontFamily: string[];
    fontSizes: Record<string, string>;
  };
  /** Spacing scale */
  spacing?: Record<string, string>;
  /** Border radius values */
  borderRadius?: Record<string, string>;
  /** Shadow definitions */
  shadows?: Record<string, string>;
}

/**
 * Global styles specification
 */
export interface GlobalStylesSpec {
  /** CSS reset preferences */
  cssReset?: boolean;
  /** Theme configuration */
  theme?: ThemeSpec;
  /** Dark mode support */
  darkMode?: {
    enabled: boolean;
    strategy: 'class' | 'media';
  };
  /** Responsive breakpoints */
  breakpoints?: Record<string, string>;
}

// ============================================
// Framework and Structure Types (for backward compatibility)
// ============================================

/**
 * Framework configuration
 */
export interface FrameworkConfig {
  /** Framework name */
  name: string;
  /** Framework version */
  version: string;
  /** TypeScript enabled */
  typescript: boolean;
  /** Framework-specific features */
  features: string[];
}

/**
 * Styling configuration
 */
export interface StylingConfig {
  /** Styling solution name */
  solution: string;
  /** Version */
  version?: string;
}

/**
 * Project structure configuration
 */
export interface StructureConfig {
  /** Source directory */
  srcDirectory: string;
  /** Components directory */
  componentsDirectory: string;
  /** Pages directory */
  pagesDirectory: string;
  /** Library/utilities directory */
  libDirectory: string;
}

/**
 * Color scale (50-950)
 */
export interface ColorScale {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
  950?: string;
  [key: string]: string | undefined;
}

/**
 * Design system configuration
 */
export interface DesignSystemConfig {
  /** Color palette */
  colors: {
    primary: ColorScale;
    secondary?: ColorScale;
    neutral: ColorScale;
    success?: ColorScale;
    warning?: ColorScale;
    error?: ColorScale;
    [key: string]: ColorScale | undefined;
  };
  /** Typography settings */
  typography: {
    fontFamily: {
      sans: string;
      serif?: string;
      mono?: string;
    };
    fontSize?: Record<string, string>;
  };
  /** Responsive breakpoints */
  breakpoints: Record<string, string>;
  /** Spacing scale */
  spacing?: Record<string, string>;
  /** Border radius */
  borderRadius?: Record<string, string>;
}

/**
 * Dependencies configuration (for backward compatibility)
 */
export interface DependenciesConfig {
  /** Production dependencies */
  production: Record<string, string>;
  /** Development dependencies */
  development: Record<string, string>;
}

// ============================================
// Main Technical Specification Type
// ============================================

/**
 * Complete Technical Specification output by the Architect Agent
 *
 * This specification provides all the information needed for the
 * Coder Agent to generate complete, production-ready code.
 */
export interface TechnicalSpecification {
  /** Project name */
  projectName: string;
  /** Project description */
  description: string;
  /** Project description (alias for backward compatibility with coder agent) */
  projectDescription?: string;
  /** Technical summary */
  technicalSummary: string;
  /** Project directory structure */
  projectStructure: ProjectStructure;
  /** Component specifications */
  components: ComponentSpec[];
  /** Page specifications */
  pages: PageSpec[];
  /** API route specifications */
  apiRoutes: ApiRouteSpec[];
  /** Package dependencies (new format) */
  dependencies: DependencySpec[] | DependenciesConfig;
  /** Data model specifications */
  dataModels: DataModelSpec[];
  /** Environment variables */
  envVariables: EnvVarSpec[];
  /** Global styling configuration */
  globalStyles?: GlobalStylesSpec;
  /** Additional configuration */
  config?: {
    /** Next.js specific configuration */
    nextConfig?: Record<string, unknown>;
    /** TypeScript configuration overrides */
    tsConfig?: Record<string, unknown>;
    /** Tailwind configuration */
    tailwindConfig?: Record<string, unknown>;
  };
  /** Implementation notes for the Coder Agent */
  implementationNotes?: string[];
  /** Potential challenges and solutions */
  challenges?: {
    challenge: string;
    solution: string;
  }[];

  // ============================================
  // Backward Compatibility Fields (for coder agent)
  // ============================================

  /** Framework configuration (for backward compatibility) */
  framework?: FrameworkConfig;
  /** Styling configuration (for backward compatibility) */
  styling?: StylingConfig;
  /** Project structure configuration (for backward compatibility) */
  structure?: StructureConfig;
  /** Design system configuration (for backward compatibility) */
  designSystem?: DesignSystemConfig;
}

// ============================================
// Uploaded Asset Types
// ============================================

/**
 * Uploaded asset (image, screenshot, etc.)
 */
export interface UploadedAsset {
  /** Asset ID */
  id: string;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** Storage URL */
  url: string;
  /** Asset description (from user or AI analysis) */
  description?: string;
  /** Analysis result if AI-analyzed */
  analysis?: {
    /** Detected UI components */
    detectedComponents?: string[];
    /** Detected layout patterns */
    layoutPatterns?: string[];
    /** Color palette extracted */
    colorPalette?: string[];
    /** Additional insights */
    insights?: string;
  };
}

// ============================================
// Agent Response Types
// ============================================

/**
 * Architect Agent response wrapper
 */
export interface ArchitectAgentResponse {
  /** Whether the analysis was successful */
  success: boolean;
  /** The technical specification */
  specification?: TechnicalSpecification;
  /** Error details if unsuccessful */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  /** Metadata about the analysis */
  metadata: {
    /** Time taken in milliseconds */
    durationMs: number;
    /** AI model used */
    model: string;
    /** Token usage */
    tokens: {
      prompt: number;
      completion: number;
      total: number;
    };
    /** Number of retries needed */
    retries: number;
  };
}

// ============================================
// Validation Types
// ============================================

/**
 * Validation result for technical specification
 */
export interface ValidationResult {
  /** Whether the specification is valid */
  valid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Path to the invalid field */
  path: string;
  /** Error message */
  message: string;
  /** Expected value or type */
  expected?: string;
  /** Actual value */
  actual?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  /** Path to the field */
  path: string;
  /** Warning message */
  message: string;
  /** Suggestion for improvement */
  suggestion?: string;
}
