/**
 * Queue Module
 *
 * BullMQ job queue producers for async processing.
 * Jobs are consumed by the worker service.
 */

export {
  // Project jobs
  addProjectJob,
  addProjectCreateJob,
  addProjectUpdateJob,
  addProjectDeleteJob,
  // Generation jobs
  addGenerationJob,
  addComponentGenerationJob,
  addPageGenerationJob,
  addFullAppGenerationJob,
  // Build jobs
  addBuildJob,
  // Deploy jobs
  addDeployJob,
  addPreviewDeployJob,
  addProductionDeployJob,
  // AI task jobs
  addAITaskJob,
  addCodeReviewJob,
  addCodeExplanationJob,
  // Notification jobs
  addNotificationJob,
  addEmailNotificationJob,
  addInAppNotificationJob,
  // Queue management
  getQueueStats,
  getJob,
  removeJob,
  pauseQueue,
  resumeQueue,
  cleanQueue,
  closeQueues,
  // Types
  QueueName,
  QUEUE_CONFIGS,
  type ProjectJobData,
  type ProjectAction,
  type GenerationJobData,
  type GenerationConfig,
  type GenerationType,
  type BuildJobData,
  type DeployJobData,
  type DeploymentEnvironment,
  type AITaskJobData,
  type AITaskType,
  type NotificationJobData,
  type NotificationType,
} from './project-queue';
