import { Module, OnModuleInit, Logger, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue, Job } from 'bullmq';
import {
  QueueName,
  QUEUE_CONFIGS,
  GenerationJobData,
  BuildJobData,
  DeployJobData,
  AITaskJobData,
  NotificationJobData,
  QueueStats,
} from '../types';
import { ProjectProcessor } from './project.processor';
import { DockerModule } from '../services/docker.module';
import { PortManagerModule } from '../services/port-manager.module';
import { AIModule } from '../ai/ai.module';

/**
 * Queue configuration for BullMQ
 */
interface RedisQueueConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

/**
 * Create a queue with standard configuration
 */
function createQueue(
  name: QueueName,
  config: RedisQueueConfig,
): Queue {
  const queueConfig = QUEUE_CONFIGS[name];

  return new Queue(name, {
    connection: {
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db,
    },
    defaultJobOptions: {
      attempts: queueConfig.attempts,
      backoff: {
        type: queueConfig.backoffType,
        delay: queueConfig.backoffDelay,
      },
      removeOnComplete: {
        age: 3600, // 1 hour
        count: 1000,
      },
      removeOnFail: {
        age: 86400, // 24 hours
      },
    },
  });
}

/**
 * Queues Module
 *
 * Sets up BullMQ queues for background job processing.
 * Manages queues for generation, builds, deployments, AI tasks, and notifications.
 */
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => DockerModule),
    PortManagerModule,
    AIModule,
  ],
  providers: [
    // Redis configuration
    {
      provide: 'QUEUE_CONFIG',
      useFactory: (configService: ConfigService): RedisQueueConfig => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (redisUrl) {
          try {
            const parsedUrl = new URL(redisUrl);
            return {
              host: parsedUrl.hostname,
              port: parseInt(parsedUrl.port, 10) || 6379,
              password: parsedUrl.password || undefined,
              db: parseInt(parsedUrl.pathname.slice(1), 10) || 0,
            };
          } catch {
            // Fall through to default config
          }
        }

        return {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        };
      },
      inject: [ConfigService],
    },

    // Generation Queue
    {
      provide: 'GENERATION_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.GENERATION, config),
      inject: ['QUEUE_CONFIG'],
    },

    // Build Queue
    {
      provide: 'BUILD_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.BUILD, config),
      inject: ['QUEUE_CONFIG'],
    },

    // Deploy Queue
    {
      provide: 'DEPLOY_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.DEPLOY, config),
      inject: ['QUEUE_CONFIG'],
    },

    // AI Task Queue (with rate limiting)
    {
      provide: 'AI_TASK_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.AI_TASK, config),
      inject: ['QUEUE_CONFIG'],
    },

    // AI Processing Queue (legacy)
    {
      provide: 'AI_PROCESSING_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.AI_PROCESSING, config),
      inject: ['QUEUE_CONFIG'],
    },

    // Deployment Queue (legacy alias)
    {
      provide: 'DEPLOYMENT_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.DEPLOY, config),
      inject: ['QUEUE_CONFIG'],
    },

    // Notification Queue
    {
      provide: 'NOTIFICATION_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.NOTIFICATION, config),
      inject: ['QUEUE_CONFIG'],
    },

    // Cleanup Queue
    {
      provide: 'CLEANUP_QUEUE',
      useFactory: (config: RedisQueueConfig) => createQueue(QueueName.CLEANUP, config),
      inject: ['QUEUE_CONFIG'],
    },

    // Queue Service
    {
      provide: 'QUEUE_SERVICE',
      useFactory: (
        generationQueue: Queue,
        buildQueue: Queue,
        deployQueue: Queue,
        aiTaskQueue: Queue,
        aiProcessingQueue: Queue,
        notificationQueue: Queue,
        cleanupQueue: Queue,
      ) => {
        return new QueuesService(
          generationQueue,
          buildQueue,
          deployQueue,
          aiTaskQueue,
          aiProcessingQueue,
          notificationQueue,
          cleanupQueue,
        );
      },
      inject: [
        'GENERATION_QUEUE',
        'BUILD_QUEUE',
        'DEPLOY_QUEUE',
        'AI_TASK_QUEUE',
        'AI_PROCESSING_QUEUE',
        'NOTIFICATION_QUEUE',
        'CLEANUP_QUEUE',
      ],
    },

    // Project Processor
    ProjectProcessor,
  ],
  exports: [
    'QUEUE_CONFIG',
    'GENERATION_QUEUE',
    'BUILD_QUEUE',
    'DEPLOY_QUEUE',
    'AI_TASK_QUEUE',
    'AI_PROCESSING_QUEUE',
    'DEPLOYMENT_QUEUE',
    'NOTIFICATION_QUEUE',
    'CLEANUP_QUEUE',
    'QUEUE_SERVICE',
    ProjectProcessor,
  ],
})
export class QueuesModule implements OnModuleInit {
  private readonly logger = new Logger(QueuesModule.name);

  async onModuleInit() {
    this.logger.log('Queues module initialized');
    this.logger.log(
      `Available queues: ${Object.values(QueueName).join(', ')}`,
    );
  }
}

/**
 * Queues Service
 *
 * Provides methods for adding jobs to queues and managing queue state.
 */
class QueuesService {
  private readonly logger = new Logger(QueuesService.name);

  constructor(
    private readonly generationQueue: Queue,
    private readonly buildQueue: Queue,
    private readonly deployQueue: Queue,
    private readonly aiTaskQueue: Queue,
    private readonly aiProcessingQueue: Queue,
    private readonly notificationQueue: Queue,
    private readonly cleanupQueue: Queue,
  ) {}

  /**
   * Add a generation job to the queue
   */
  async addGenerationJob(data: GenerationJobData, priority: number = 0): Promise<Job> {
    this.logger.log(`Adding generation job: ${data.generationId}`);

    return this.generationQueue.add(
      'generation:process',
      data,
      {
        priority,
        jobId: data.generationId,
      },
    );
  }

  /**
   * Add a build job to the queue
   */
  async addBuildJob(data: BuildJobData, priority: number = 0): Promise<Job> {
    this.logger.log(`Adding build job: ${data.buildId}`);

    return this.buildQueue.add(
      'build:process',
      data,
      {
        priority,
        jobId: data.buildId,
      },
    );
  }

  /**
   * Add a deploy job to the queue
   */
  async addDeployJob(data: DeployJobData, priority: number = 0): Promise<Job> {
    this.logger.log(`Adding deploy job: ${data.deploymentId}`);

    return this.deployQueue.add(
      'deploy:process',
      data,
      {
        priority,
        jobId: data.deploymentId,
      },
    );
  }

  /**
   * Add an AI task job to the queue
   */
  async addAITaskJob(data: AITaskJobData, priority: number = 0): Promise<Job> {
    this.logger.log(`Adding AI task job: ${data.taskId}`);

    return this.aiTaskQueue.add(
      `ai:${data.type}`,
      data,
      {
        priority,
        jobId: data.taskId,
      },
    );
  }

  /**
   * Add a notification job to the queue
   */
  async addNotificationJob(data: NotificationJobData, priority: number = 0): Promise<Job> {
    this.logger.log(`Adding notification job: ${data.notificationId}`);

    return this.notificationQueue.add(
      `notification:${data.type}`,
      data,
      {
        priority,
        jobId: data.notificationId,
      },
    );
  }

  /**
   * Add a cleanup job to the queue
   */
  async addCleanupJob(data: {
    type: 'generations' | 'files' | 'sessions' | 'builds' | 'deployments';
    olderThan: Date;
  }): Promise<Job> {
    return this.cleanupQueue.add('cleanup', data);
  }

  /**
   * Get queue stats for all queues
   */
  async getQueueStats(): Promise<{
    generation: QueueStats;
    build: QueueStats;
    deploy: QueueStats;
    aiTask: QueueStats;
    aiProcessing: QueueStats;
    notification: QueueStats;
    cleanup: QueueStats;
  }> {
    const [generation, build, deploy, aiTask, aiProcessing, notification, cleanup] =
      await Promise.all([
        this.getStats(this.generationQueue),
        this.getStats(this.buildQueue),
        this.getStats(this.deployQueue),
        this.getStats(this.aiTaskQueue),
        this.getStats(this.aiProcessingQueue),
        this.getStats(this.notificationQueue),
        this.getStats(this.cleanupQueue),
      ]);

    return { generation, build, deploy, aiTask, aiProcessing, notification, cleanup };
  }

  private async getStats(queue: Queue): Promise<QueueStats> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.isPaused().then(isPaused => isPaused ? 1 : 0),
    ]);

    return { waiting, active, completed, failed, delayed, paused };
  }

  /**
   * Pause a queue
   */
  async pauseQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueueByName(queueName);
    await queue.pause();
    this.logger.log(`Queue paused: ${queueName}`);
  }

  /**
   * Resume a queue
   */
  async resumeQueue(queueName: QueueName): Promise<void> {
    const queue = this.getQueueByName(queueName);
    await queue.resume();
    this.logger.log(`Queue resumed: ${queueName}`);
  }

  /**
   * Clean old jobs from a queue
   */
  async cleanQueue(
    queueName: QueueName,
    grace: number = 3600000,
    status: 'completed' | 'failed' = 'completed',
    limit: number = 1000,
  ): Promise<string[]> {
    const queue = this.getQueueByName(queueName);
    const cleaned = await queue.clean(grace, limit, status);
    this.logger.log(`Queue cleaned: ${queueName}, removed ${cleaned.length} jobs`);
    return cleaned;
  }

  /**
   * Get a job by ID from a specific queue
   */
  async getJob<T>(queueName: QueueName, jobId: string): Promise<Job<T> | undefined> {
    const queue = this.getQueueByName(queueName);
    return queue.getJob(jobId) as Promise<Job<T> | undefined>;
  }

  /**
   * Remove a job from a queue
   */
  async removeJob(queueName: QueueName, jobId: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`Job removed: ${jobId} from ${queueName}`);
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(queueName: QueueName, jobId: string): Promise<void> {
    const queue = this.getQueueByName(queueName);
    const job = await queue.getJob(jobId);
    if (job) {
      await job.retry();
      this.logger.log(`Job retried: ${jobId} from ${queueName}`);
    }
  }

  private getQueueByName(name: QueueName): Queue {
    switch (name) {
      case QueueName.GENERATION:
        return this.generationQueue;
      case QueueName.BUILD:
        return this.buildQueue;
      case QueueName.DEPLOY:
        return this.deployQueue;
      case QueueName.AI_TASK:
        return this.aiTaskQueue;
      case QueueName.AI_PROCESSING:
        return this.aiProcessingQueue;
      case QueueName.NOTIFICATION:
        return this.notificationQueue;
      case QueueName.CLEANUP:
        return this.cleanupQueue;
      default:
        throw new Error(`Unknown queue: ${name}`);
    }
  }
}

// Export the service type for dependency injection
export { QueuesService };
