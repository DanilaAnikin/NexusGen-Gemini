/**
 * Queue-related types for NexusGen AI platform
 *
 * Shared types for BullMQ job processing between web (producer) and worker (consumer)
 */

// ============================================
// Queue Names & Configuration
// ============================================

/**
 * Queue names used throughout the system
 */
export enum QueueName {
  /** Project generation queue */
  GENERATION = 'generation',
  /** Build/compilation queue */
  BUILD = 'build',
  /** Deployment queue */
  DEPLOY = 'deploy',
  /** AI task processing queue */
  AI_TASK = 'ai-task',
  /** Notification queue */
  NOTIFICATION = 'notification',
  /** Legacy AI processing queue */
  AI_PROCESSING = 'ai-processing',
  /** Cleanup queue */
  CLEANUP = 'cleanup',
}

/**
 * Queue configuration settings
 */
export interface QueueConfiguration {
  /** Queue name */
  name: QueueName;
  /** Number of retry attempts */
  attempts: number;
  /** Backoff type */
  backoffType: 'exponential' | 'fixed';
  /** Base delay in milliseconds */
  backoffDelay: number;
  /** Job timeout in milliseconds (optional) */
  timeout?: number;
  /** Rate limit: max jobs per interval */
  rateLimit?: {
    max: number;
    duration: number; // in milliseconds
  };
}

/**
 * Default queue configurations per queue type
 */
export const QUEUE_CONFIGS: Record<QueueName, QueueConfiguration> = {
  [QueueName.GENERATION]: {
    name: QueueName.GENERATION,
    attempts: 3,
    backoffType: 'exponential',
    backoffDelay: 5000, // 5s base
  },
  [QueueName.BUILD]: {
    name: QueueName.BUILD,
    attempts: 3,
    backoffType: 'exponential',
    backoffDelay: 10000, // 10s base
    timeout: 600000, // 10 minutes
  },
  [QueueName.DEPLOY]: {
    name: QueueName.DEPLOY,
    attempts: 2,
    backoffType: 'exponential',
    backoffDelay: 5000,
    timeout: 300000, // 5 minutes
  },
  [QueueName.AI_TASK]: {
    name: QueueName.AI_TASK,
    attempts: 3,
    backoffType: 'exponential',
    backoffDelay: 2000, // 2s base
    rateLimit: {
      max: 50,
      duration: 60000, // 50 per minute
    },
  },
  [QueueName.NOTIFICATION]: {
    name: QueueName.NOTIFICATION,
    attempts: 5,
    backoffType: 'exponential',
    backoffDelay: 1000, // 1s base
  },
  [QueueName.AI_PROCESSING]: {
    name: QueueName.AI_PROCESSING,
    attempts: 2,
    backoffType: 'exponential',
    backoffDelay: 2000,
  },
  [QueueName.CLEANUP]: {
    name: QueueName.CLEANUP,
    attempts: 1,
    backoffType: 'fixed',
    backoffDelay: 1000,
  },
};

// ============================================
// Project Job Types
// ============================================

/**
 * Project action types
 */
export type ProjectAction = 'create' | 'update' | 'delete' | 'generate' | 'build' | 'deploy';

/**
 * Project job data payload
 */
export interface ProjectJobData {
  /** Unique project identifier */
  projectId: string;
  /** User who initiated the job */
  userId: string;
  /** Action to perform */
  action: ProjectAction;
  /** Additional payload data */
  payload?: Record<string, unknown>;
  /** Job priority (lower = higher priority) */
  priority?: number;
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Timestamp when job was created */
  createdAt?: string;
}

/**
 * Project job result
 */
export interface ProjectJobResult {
  /** Whether the job succeeded */
  success: boolean;
  /** Project ID */
  projectId: string;
  /** Action that was performed */
  action: ProjectAction;
  /** Result data (action-specific) */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** Processing duration in milliseconds */
  durationMs: number;
  /** Timestamp when completed */
  completedAt: string;
}

// ============================================
// Generation Job Types
// ============================================

/**
 * Generation configuration options
 */
export interface GenerationConfig {
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
  /** Custom instructions */
  customInstructions?: string;
}

/**
 * Generation type
 */
export type GenerationType =
  | 'component'
  | 'page'
  | 'api-route'
  | 'full-app'
  | 'refactor'
  | 'fix'
  | 'documentation';

/**
 * Generation job data payload
 */
export interface GenerationJobData {
  /** Unique generation ID */
  generationId: string;
  /** Associated project ID */
  projectId: string;
  /** User who initiated the generation */
  userId: string;
  /** The prompt/description for generation */
  prompt: string;
  /** Type of generation */
  type: GenerationType;
  /** Asset URLs/paths to include */
  assets?: string[];
  /** Generation configuration */
  config?: GenerationConfig;
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Priority (lower = higher priority) */
  priority?: number;
  /** Created timestamp */
  createdAt?: string;
}

/**
 * Generated file result
 */
export interface GeneratedFile {
  /** File path relative to project root */
  path: string;
  /** File content */
  content: string;
  /** Programming language */
  language: string;
  /** Whether this is a new file */
  isNew: boolean;
  /** Diff from original if modified */
  diff?: string;
}

/**
 * Generation job result
 */
export interface GenerationJobResult {
  /** Whether the generation succeeded */
  success: boolean;
  /** Generation ID */
  generationId: string;
  /** Generated files */
  files?: GeneratedFile[];
  /** Preview URL if available */
  previewUrl?: string;
  /** Error message if failed */
  error?: string;
  /** Token usage statistics */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Model used for generation */
  modelUsed?: string;
  /** Processing duration in milliseconds */
  durationMs: number;
  /** Completion timestamp */
  completedAt: string;
}

// ============================================
// Build Job Types
// ============================================

/**
 * Build job data payload
 */
export interface BuildJobData {
  /** Build ID */
  buildId: string;
  /** Associated project ID */
  projectId: string;
  /** User who initiated the build */
  userId: string;
  /** Generation ID that triggered the build (optional) */
  generationId?: string;
  /** Build configuration */
  config: {
    /** Build command to run */
    buildCommand: string;
    /** Output directory */
    outputDirectory: string;
    /** Install command */
    installCommand: string;
    /** Environment variables */
    environmentVariables: Record<string, string>;
    /** Node.js version */
    nodeVersion: string;
  };
  /** Git commit info */
  gitInfo?: {
    branch: string;
    commit: string;
    message?: string;
  };
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Created timestamp */
  createdAt?: string;
}

/**
 * Build job result
 */
export interface BuildJobResult {
  /** Whether the build succeeded */
  success: boolean;
  /** Build ID */
  buildId: string;
  /** Project ID */
  projectId: string;
  /** Build output path */
  outputPath?: string;
  /** Build logs */
  logs?: string[];
  /** Docker image ID (if containerized build) */
  imageId?: string;
  /** Docker image name (if containerized build) */
  imageName?: string;
  /** Error message if failed */
  error?: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Completion timestamp */
  completedAt: string;
}

// ============================================
// Deploy Job Types
// ============================================

/**
 * Deployment environment
 */
export type DeploymentEnvironment = 'preview' | 'staging' | 'production';

/**
 * Deploy job data payload
 */
export interface DeployJobData {
  /** Deployment ID */
  deploymentId: string;
  /** Associated project ID */
  projectId: string;
  /** User who initiated the deployment */
  userId: string;
  /** Build ID to deploy */
  buildId: string;
  /** Target environment */
  environment: DeploymentEnvironment;
  /** Domain configuration */
  domain?: {
    name: string;
    ssl: boolean;
  };
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Created timestamp */
  createdAt?: string;
}

/**
 * Deploy job result
 */
export interface DeployJobResult {
  /** Whether the deployment succeeded */
  success: boolean;
  /** Deployment ID */
  deploymentId: string;
  /** Project ID */
  projectId: string;
  /** Deployed URL */
  url?: string;
  /** Docker container ID (if containerized deployment) */
  containerId?: string;
  /** Assigned port (if containerized deployment) */
  port?: number;
  /** Docker image ID used for deployment */
  imageId?: string;
  /** Error message if failed */
  error?: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Completion timestamp */
  completedAt: string;
}

// ============================================
// AI Task Job Types
// ============================================

/**
 * AI task type
 */
export type AITaskType =
  | 'code-generation'
  | 'code-review'
  | 'code-explanation'
  | 'code-refactoring'
  | 'documentation'
  | 'testing'
  | 'debugging'
  | 'conversation';

/**
 * AI task job data payload
 */
export interface AITaskJobData {
  /** Task ID */
  taskId: string;
  /** User who initiated the task */
  userId: string;
  /** Task type */
  type: AITaskType;
  /** Input prompt/context */
  input: string;
  /** Associated context (files, code, etc.) */
  context?: {
    files?: Array<{ path: string; content: string }>;
    selectedCode?: string;
    projectId?: string;
  };
  /** AI model configuration */
  modelConfig?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Created timestamp */
  createdAt?: string;
}

/**
 * AI task job result
 */
export interface AITaskJobResult {
  /** Whether the task succeeded */
  success: boolean;
  /** Task ID */
  taskId: string;
  /** Generated output */
  output?: string;
  /** Structured data (if applicable) */
  data?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** Token usage */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** Model used */
  modelUsed?: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Completion timestamp */
  completedAt: string;
}

// ============================================
// Notification Job Types
// ============================================

/**
 * Notification type
 */
export type NotificationType =
  | 'email'
  | 'push'
  | 'in-app'
  | 'webhook'
  | 'slack'
  | 'discord';

/**
 * Notification job data payload
 */
export interface NotificationJobData {
  /** Notification ID */
  notificationId: string;
  /** Target user ID */
  userId: string;
  /** Notification type */
  type: NotificationType;
  /** Notification channel (for specific delivery) */
  channel?: string;
  /** Notification subject/title */
  subject: string;
  /** Notification body/message */
  body: string;
  /** Additional data */
  data?: Record<string, unknown>;
  /** Action URL (optional) */
  actionUrl?: string;
  /** Correlation ID for tracing */
  correlationId?: string;
  /** Created timestamp */
  createdAt?: string;
}

/**
 * Notification job result
 */
export interface NotificationJobResult {
  /** Whether the notification was sent successfully */
  success: boolean;
  /** Notification ID */
  notificationId: string;
  /** Delivery status */
  delivered: boolean;
  /** Error message if failed */
  error?: string;
  /** External ID (from email service, etc.) */
  externalId?: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Completion timestamp */
  completedAt: string;
}

// ============================================
// Generic Queue Types
// ============================================

/**
 * Job status
 */
export type JobStatus =
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'delayed'
  | 'paused';

/**
 * Generic job metadata
 */
export interface JobMetadata {
  /** Job ID */
  id: string;
  /** Queue name */
  queue: QueueName;
  /** Current status */
  status: JobStatus;
  /** Number of attempts made */
  attempts: number;
  /** Maximum attempts allowed */
  maxAttempts: number;
  /** Job priority */
  priority: number;
  /** When the job was created */
  createdAt: Date;
  /** When the job started processing */
  processedAt?: Date;
  /** When the job completed/failed */
  finishedAt?: Date;
  /** Failure reason if failed */
  failedReason?: string;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  /** Number of waiting jobs */
  waiting: number;
  /** Number of active jobs */
  active: number;
  /** Number of completed jobs */
  completed: number;
  /** Number of failed jobs */
  failed: number;
  /** Number of delayed jobs */
  delayed: number;
  /** Number of paused jobs */
  paused: number;
}

/**
 * Job event types for real-time updates
 */
export type JobEventType =
  | 'job:added'
  | 'job:active'
  | 'job:progress'
  | 'job:completed'
  | 'job:failed'
  | 'job:stalled'
  | 'job:removed';

/**
 * Job event payload
 */
export interface JobEvent<TData = unknown, TResult = unknown> {
  /** Event type */
  type: JobEventType;
  /** Job ID */
  jobId: string;
  /** Queue name */
  queue: QueueName;
  /** Job data (for added/active events) */
  data?: TData;
  /** Job result (for completed events) */
  result?: TResult;
  /** Error (for failed events) */
  error?: string;
  /** Progress (for progress events) */
  progress?: number;
  /** Timestamp */
  timestamp: Date;
}

// ============================================
// Type Guards
// ============================================

/**
 * Type guard for ProjectJobData
 */
export function isProjectJobData(data: unknown): data is ProjectJobData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'projectId' in data &&
    'userId' in data &&
    'action' in data
  );
}

/**
 * Type guard for GenerationJobData
 */
export function isGenerationJobData(data: unknown): data is GenerationJobData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'generationId' in data &&
    'projectId' in data &&
    'userId' in data &&
    'prompt' in data &&
    'type' in data
  );
}

/**
 * Type guard for BuildJobData
 */
export function isBuildJobData(data: unknown): data is BuildJobData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'buildId' in data &&
    'projectId' in data &&
    'userId' in data &&
    'config' in data
  );
}

/**
 * Type guard for DeployJobData
 */
export function isDeployJobData(data: unknown): data is DeployJobData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'deploymentId' in data &&
    'projectId' in data &&
    'buildId' in data &&
    'environment' in data
  );
}

/**
 * Type guard for AITaskJobData
 */
export function isAITaskJobData(data: unknown): data is AITaskJobData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'taskId' in data &&
    'userId' in data &&
    'type' in data &&
    'input' in data
  );
}

/**
 * Type guard for NotificationJobData
 */
export function isNotificationJobData(data: unknown): data is NotificationJobData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'notificationId' in data &&
    'userId' in data &&
    'type' in data &&
    'subject' in data &&
    'body' in data
  );
}
