/**
 * Queue Types for Worker Service
 *
 * Re-exports shared queue types from @nexusgen/types package
 * and adds any worker-specific extensions.
 */

// Re-export all queue types from the shared types package
export {
  // Enums and constants
  QueueName,
  QUEUE_CONFIGS,
  // Type guards
  isProjectJobData,
  isGenerationJobData,
  isBuildJobData,
  isDeployJobData,
  isAITaskJobData,
  isNotificationJobData,
} from '@nexusgen/types';

export type {
  // Configuration
  QueueConfiguration,
  // Project jobs
  ProjectAction,
  ProjectJobData,
  ProjectJobResult,
  // Generation jobs
  GenerationConfig,
  GenerationType,
  GenerationJobData,
  GeneratedFile,
  GenerationJobResult,
  // Build jobs
  BuildJobData,
  BuildJobResult,
  // Deploy jobs
  DeploymentEnvironment,
  DeployJobData,
  DeployJobResult,
  // AI task jobs
  AITaskType,
  AITaskJobData,
  AITaskJobResult,
  // Notification jobs
  NotificationType,
  NotificationJobData,
  NotificationJobResult,
  // Generic types
  JobStatus,
  JobMetadata,
  QueueStats,
  JobEventType,
  JobEvent,
} from '@nexusgen/types';

/**
 * Worker-specific job context
 */
export interface WorkerJobContext {
  /** Worker instance ID */
  workerId: string;
  /** Attempt number (1-based) */
  attemptNumber: number;
  /** Whether this is the last attempt */
  isLastAttempt: boolean;
  /** Original job timestamp */
  jobCreatedAt: Date;
  /** When this attempt started */
  attemptStartedAt: Date;
}

/**
 * Job processing options
 */
export interface JobProcessingOptions {
  /** Skip notification on completion */
  skipNotification?: boolean;
  /** Force re-processing even if already completed */
  forceReprocess?: boolean;
  /** Custom timeout override (in ms) */
  timeoutOverride?: number;
}

/**
 * Job progress update
 */
export interface JobProgressUpdate {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Current step description */
  step?: string;
  /** Additional progress data */
  data?: Record<string, unknown>;
}

/**
 * Processor configuration
 */
export interface ProcessorConfig {
  /** Queue name to process */
  queue: QueueName;
  /** Number of concurrent jobs */
  concurrency: number;
  /** Whether to enable rate limiting */
  rateLimitEnabled: boolean;
  /** Lock duration in milliseconds */
  lockDuration: number;
  /** Maximum job duration before considered stalled */
  stalledInterval: number;
}

/**
 * Default processor configurations
 */
export const DEFAULT_PROCESSOR_CONFIGS: Record<QueueName, ProcessorConfig> = {
  [QueueName.GENERATION]: {
    queue: QueueName.GENERATION,
    concurrency: 3,
    rateLimitEnabled: false,
    lockDuration: 30000,
    stalledInterval: 60000,
  },
  [QueueName.BUILD]: {
    queue: QueueName.BUILD,
    concurrency: 2,
    rateLimitEnabled: false,
    lockDuration: 60000,
    stalledInterval: 120000,
  },
  [QueueName.DEPLOY]: {
    queue: QueueName.DEPLOY,
    concurrency: 2,
    rateLimitEnabled: false,
    lockDuration: 60000,
    stalledInterval: 120000,
  },
  [QueueName.AI_TASK]: {
    queue: QueueName.AI_TASK,
    concurrency: 5,
    rateLimitEnabled: true,
    lockDuration: 30000,
    stalledInterval: 60000,
  },
  [QueueName.NOTIFICATION]: {
    queue: QueueName.NOTIFICATION,
    concurrency: 10,
    rateLimitEnabled: false,
    lockDuration: 10000,
    stalledInterval: 30000,
  },
  [QueueName.AI_PROCESSING]: {
    queue: QueueName.AI_PROCESSING,
    concurrency: 3,
    rateLimitEnabled: true,
    lockDuration: 30000,
    stalledInterval: 60000,
  },
  [QueueName.CLEANUP]: {
    queue: QueueName.CLEANUP,
    concurrency: 1,
    rateLimitEnabled: false,
    lockDuration: 60000,
    stalledInterval: 300000,
  },
};
