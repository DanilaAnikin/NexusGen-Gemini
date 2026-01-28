/**
 * Project Queue Producer
 *
 * BullMQ producer for adding jobs to the project processing queues.
 * This module is used by the web application to enqueue jobs for the worker service.
 */

import { Queue, QueueOptions, JobsOptions, Job } from 'bullmq';
import IORedis, { RedisOptions } from 'ioredis';
import {
  QueueName,
  QUEUE_CONFIGS,
  ProjectJobData,
  ProjectAction,
  GenerationJobData,
  GenerationConfig,
  GenerationType,
  BuildJobData,
  DeployJobData,
  DeploymentEnvironment,
  AITaskJobData,
  AITaskType,
  NotificationJobData,
  NotificationType,
} from '@nexusgen/types';

// ============================================
// Redis Connection
// ============================================

/**
 * Parse Redis URL into connection options
 */
function parseRedisUrl(url: string): RedisOptions {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port, 10) || 6379,
      password: parsedUrl.password || undefined,
      db: parseInt(parsedUrl.pathname.slice(1), 10) || 0,
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
    };
  } catch {
    // Fallback for non-URL format
    return {
      host: 'localhost',
      port: 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    };
  }
}

/**
 * Get Redis connection options from environment
 */
function getRedisOptions(): RedisOptions {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    return parseRedisUrl(redisUrl);
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

/**
 * Shared Redis connection instance
 */
let redisConnection: IORedis | null = null;

/**
 * Get or create Redis connection
 */
function getRedisConnection(): IORedis {
  if (!redisConnection) {
    redisConnection = new IORedis(getRedisOptions());

    redisConnection.on('error', (err) => {
      console.error('[ProjectQueue] Redis connection error:', err);
    });

    redisConnection.on('connect', () => {
      console.log('[ProjectQueue] Redis connected');
    });
  }

  return redisConnection;
}

// ============================================
// Queue Instances
// ============================================

/** Queue instance cache */
const queues = new Map<QueueName, Queue>();

/**
 * Get or create a queue instance
 */
function getQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    const config = QUEUE_CONFIGS[name];
    const connection = getRedisConnection();

    const queueOptions: QueueOptions = {
      connection,
      defaultJobOptions: {
        attempts: config.attempts,
        backoff: {
          type: config.backoffType,
          delay: config.backoffDelay,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    };

    const queue = new Queue(name, queueOptions);
    queues.set(name, queue);
  }

  return queues.get(name)!;
}

// ============================================
// Job ID Generators
// ============================================

/**
 * Generate a unique job ID
 */
function generateJobId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

// ============================================
// Project Jobs
// ============================================

/**
 * Add a project job to the queue
 */
export async function addProjectJob(
  data: Omit<ProjectJobData, 'createdAt'>,
  options?: JobsOptions
): Promise<Job<ProjectJobData>> {
  const queue = getQueue(QueueName.GENERATION);

  const jobData: ProjectJobData = {
    ...data,
    correlationId: data.correlationId || generateJobId('corr'),
    createdAt: new Date().toISOString(),
  };

  const jobId = `project_${data.projectId}_${data.action}_${Date.now()}`;

  return queue.add(`project:${data.action}`, jobData, {
    jobId,
    priority: data.priority || 0,
    ...options,
  });
}

/**
 * Add a project creation job
 */
export async function addProjectCreateJob(
  projectId: string,
  userId: string,
  payload?: Record<string, unknown>,
  options?: JobsOptions
): Promise<Job<ProjectJobData>> {
  return addProjectJob(
    {
      projectId,
      userId,
      action: 'create',
      payload,
    },
    options
  );
}

/**
 * Add a project update job
 */
export async function addProjectUpdateJob(
  projectId: string,
  userId: string,
  payload?: Record<string, unknown>,
  options?: JobsOptions
): Promise<Job<ProjectJobData>> {
  return addProjectJob(
    {
      projectId,
      userId,
      action: 'update',
      payload,
    },
    options
  );
}

/**
 * Add a project deletion job
 */
export async function addProjectDeleteJob(
  projectId: string,
  userId: string,
  options?: JobsOptions
): Promise<Job<ProjectJobData>> {
  return addProjectJob(
    {
      projectId,
      userId,
      action: 'delete',
    },
    options
  );
}

// ============================================
// Generation Jobs
// ============================================

/**
 * Add a generation job to the queue
 */
export async function addGenerationJob(
  data: Omit<GenerationJobData, 'generationId' | 'createdAt'> & {
    generationId?: string;
  },
  options?: JobsOptions
): Promise<Job<GenerationJobData>> {
  const queue = getQueue(QueueName.GENERATION);
  const config = QUEUE_CONFIGS[QueueName.GENERATION];

  const generationId = data.generationId || generateJobId('gen');

  const jobData: GenerationJobData = {
    ...data,
    generationId,
    correlationId: data.correlationId || generateJobId('corr'),
    createdAt: new Date().toISOString(),
  };

  return queue.add('generation:process', jobData, {
    jobId: generationId,
    priority: data.priority || 0,
    attempts: config.attempts,
    backoff: {
      type: config.backoffType,
      delay: config.backoffDelay,
    },
    ...options,
  });
}

/**
 * Add a component generation job
 */
export async function addComponentGenerationJob(
  projectId: string,
  userId: string,
  prompt: string,
  config?: GenerationConfig,
  options?: JobsOptions
): Promise<Job<GenerationJobData>> {
  return addGenerationJob(
    {
      projectId,
      userId,
      prompt,
      type: 'component',
      config,
    },
    options
  );
}

/**
 * Add a page generation job
 */
export async function addPageGenerationJob(
  projectId: string,
  userId: string,
  prompt: string,
  config?: GenerationConfig,
  options?: JobsOptions
): Promise<Job<GenerationJobData>> {
  return addGenerationJob(
    {
      projectId,
      userId,
      prompt,
      type: 'page',
      config,
    },
    options
  );
}

/**
 * Add a full app generation job
 */
export async function addFullAppGenerationJob(
  projectId: string,
  userId: string,
  prompt: string,
  assets?: string[],
  config?: GenerationConfig,
  options?: JobsOptions
): Promise<Job<GenerationJobData>> {
  return addGenerationJob(
    {
      projectId,
      userId,
      prompt,
      type: 'full-app',
      assets,
      config,
    },
    { priority: 10, ...options } // Lower priority for resource-intensive jobs
  );
}

// ============================================
// Build Jobs
// ============================================

/**
 * Add a build job to the queue
 */
export async function addBuildJob(
  data: Omit<BuildJobData, 'buildId' | 'createdAt'> & { buildId?: string },
  options?: JobsOptions
): Promise<Job<BuildJobData>> {
  const queue = getQueue(QueueName.BUILD);
  const config = QUEUE_CONFIGS[QueueName.BUILD];

  const buildId = data.buildId || generateJobId('build');

  const jobData: BuildJobData = {
    ...data,
    buildId,
    correlationId: data.correlationId || generateJobId('corr'),
    createdAt: new Date().toISOString(),
  };

  return queue.add('build:process', jobData, {
    jobId: buildId,
    priority: 0,
    attempts: config.attempts,
    backoff: {
      type: config.backoffType,
      delay: config.backoffDelay,
    },
    timeout: config.timeout,
    ...options,
  });
}

// ============================================
// Deploy Jobs
// ============================================

/**
 * Add a deploy job to the queue
 */
export async function addDeployJob(
  data: Omit<DeployJobData, 'deploymentId' | 'createdAt'> & {
    deploymentId?: string;
  },
  options?: JobsOptions
): Promise<Job<DeployJobData>> {
  const queue = getQueue(QueueName.DEPLOY);
  const config = QUEUE_CONFIGS[QueueName.DEPLOY];

  const deploymentId = data.deploymentId || generateJobId('deploy');

  const jobData: DeployJobData = {
    ...data,
    deploymentId,
    correlationId: data.correlationId || generateJobId('corr'),
    createdAt: new Date().toISOString(),
  };

  // Production deployments get higher priority
  const priority = data.environment === 'production' ? 0 : 5;

  return queue.add('deploy:process', jobData, {
    jobId: deploymentId,
    priority,
    attempts: config.attempts,
    backoff: {
      type: config.backoffType,
      delay: config.backoffDelay,
    },
    timeout: config.timeout,
    ...options,
  });
}

/**
 * Add a preview deployment job
 */
export async function addPreviewDeployJob(
  projectId: string,
  userId: string,
  buildId: string,
  options?: JobsOptions
): Promise<Job<DeployJobData>> {
  return addDeployJob(
    {
      projectId,
      userId,
      buildId,
      environment: 'preview',
    },
    options
  );
}

/**
 * Add a production deployment job
 */
export async function addProductionDeployJob(
  projectId: string,
  userId: string,
  buildId: string,
  domain?: { name: string; ssl: boolean },
  options?: JobsOptions
): Promise<Job<DeployJobData>> {
  return addDeployJob(
    {
      projectId,
      userId,
      buildId,
      environment: 'production',
      domain,
    },
    options
  );
}

// ============================================
// AI Task Jobs
// ============================================

/**
 * Add an AI task job to the queue
 */
export async function addAITaskJob(
  data: Omit<AITaskJobData, 'taskId' | 'createdAt'> & { taskId?: string },
  options?: JobsOptions
): Promise<Job<AITaskJobData>> {
  const queue = getQueue(QueueName.AI_TASK);
  const config = QUEUE_CONFIGS[QueueName.AI_TASK];

  const taskId = data.taskId || generateJobId('ai');

  const jobData: AITaskJobData = {
    ...data,
    taskId,
    correlationId: data.correlationId || generateJobId('corr'),
    createdAt: new Date().toISOString(),
  };

  return queue.add(`ai:${data.type}`, jobData, {
    jobId: taskId,
    priority: 0,
    attempts: config.attempts,
    backoff: {
      type: config.backoffType,
      delay: config.backoffDelay,
    },
    ...options,
  });
}

/**
 * Add a code review task
 */
export async function addCodeReviewJob(
  userId: string,
  code: string,
  projectId?: string,
  options?: JobsOptions
): Promise<Job<AITaskJobData>> {
  return addAITaskJob(
    {
      userId,
      type: 'code-review',
      input: code,
      context: projectId ? { projectId } : undefined,
    },
    options
  );
}

/**
 * Add a code explanation task
 */
export async function addCodeExplanationJob(
  userId: string,
  code: string,
  options?: JobsOptions
): Promise<Job<AITaskJobData>> {
  return addAITaskJob(
    {
      userId,
      type: 'code-explanation',
      input: code,
    },
    options
  );
}

// ============================================
// Notification Jobs
// ============================================

/**
 * Add a notification job to the queue
 */
export async function addNotificationJob(
  data: Omit<NotificationJobData, 'notificationId' | 'createdAt'> & {
    notificationId?: string;
  },
  options?: JobsOptions
): Promise<Job<NotificationJobData>> {
  const queue = getQueue(QueueName.NOTIFICATION);
  const config = QUEUE_CONFIGS[QueueName.NOTIFICATION];

  const notificationId = data.notificationId || generateJobId('notif');

  const jobData: NotificationJobData = {
    ...data,
    notificationId,
    correlationId: data.correlationId || generateJobId('corr'),
    createdAt: new Date().toISOString(),
  };

  return queue.add(`notification:${data.type}`, jobData, {
    jobId: notificationId,
    priority: 0,
    attempts: config.attempts,
    backoff: {
      type: config.backoffType,
      delay: config.backoffDelay,
    },
    ...options,
  });
}

/**
 * Add an email notification job
 */
export async function addEmailNotificationJob(
  userId: string,
  subject: string,
  body: string,
  actionUrl?: string,
  options?: JobsOptions
): Promise<Job<NotificationJobData>> {
  return addNotificationJob(
    {
      userId,
      type: 'email',
      subject,
      body,
      actionUrl,
    },
    options
  );
}

/**
 * Add an in-app notification job
 */
export async function addInAppNotificationJob(
  userId: string,
  subject: string,
  body: string,
  data?: Record<string, unknown>,
  options?: JobsOptions
): Promise<Job<NotificationJobData>> {
  return addNotificationJob(
    {
      userId,
      type: 'in-app',
      subject,
      body,
      data,
    },
    options
  );
}

// ============================================
// Queue Management
// ============================================

/**
 * Get queue statistics
 */
export async function getQueueStats(queueName: QueueName) {
  const queue = getQueue(queueName);

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}

/**
 * Get job by ID
 */
export async function getJob<T>(
  queueName: QueueName,
  jobId: string
): Promise<Job<T> | undefined> {
  const queue = getQueue(queueName);
  return queue.getJob(jobId) as Promise<Job<T> | undefined>;
}

/**
 * Remove a job from the queue
 */
export async function removeJob(
  queueName: QueueName,
  jobId: string
): Promise<void> {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);
  if (job) {
    await job.remove();
  }
}

/**
 * Pause a queue
 */
export async function pauseQueue(queueName: QueueName): Promise<void> {
  const queue = getQueue(queueName);
  await queue.pause();
}

/**
 * Resume a queue
 */
export async function resumeQueue(queueName: QueueName): Promise<void> {
  const queue = getQueue(queueName);
  await queue.resume();
}

/**
 * Clean old jobs from a queue
 */
export async function cleanQueue(
  queueName: QueueName,
  grace: number = 3600000, // 1 hour
  status: 'completed' | 'failed' = 'completed',
  limit: number = 1000
): Promise<string[]> {
  const queue = getQueue(queueName);
  return queue.clean(grace, limit, status);
}

/**
 * Close all queue connections
 */
export async function closeQueues(): Promise<void> {
  const closePromises: Promise<void>[] = [];

  queues.forEach((queue) => {
    closePromises.push(queue.close());
  });

  await Promise.all(closePromises);
  queues.clear();

  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
}

// ============================================
// Re-export types for convenience
// ============================================

export type {
  ProjectJobData,
  ProjectAction,
  GenerationJobData,
  GenerationConfig,
  GenerationType,
  BuildJobData,
  DeployJobData,
  DeploymentEnvironment,
  AITaskJobData,
  AITaskType,
  NotificationJobData,
  NotificationType,
};

export { QueueName, QUEUE_CONFIGS };
