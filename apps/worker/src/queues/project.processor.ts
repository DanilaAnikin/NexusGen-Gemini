import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import {
  QueueName,
  QUEUE_CONFIGS,
  ProjectJobData,
  ProjectJobResult,
  GenerationJobData,
  GenerationJobResult,
  BuildJobData,
  BuildJobResult,
  DeployJobData,
  DeployJobResult,
  AITaskJobData,
  AITaskJobResult,
  NotificationJobData,
  NotificationJobResult,
  isProjectJobData,
  isGenerationJobData,
  isBuildJobData,
  isDeployJobData,
  isAITaskJobData,
  isNotificationJobData,
} from '../types/queue.types';
import { GenerationService } from '../ai/generation.service';
import { GenerationJobData as AgentGenerationJobData } from '../types/generation.types';
import { DockerService, BuildResult, ContainerResult } from '../services/docker.service';
import { PortManager } from '../services/port-manager';

/**
 * Deployment status enum for tracking deployment state
 */
export enum DeploymentStatus {
  PENDING = 'pending',
  BUILDING = 'building',
  DEPLOYING = 'deploying',
  RUNNING = 'running',
  FAILED = 'failed',
  STOPPED = 'stopped',
}

/**
 * Deployment tracking record
 */
export interface DeploymentRecord {
  deploymentId: string;
  projectId: string;
  userId: string;
  status: DeploymentStatus;
  imageId?: string;
  imageName?: string;
  containerId?: string;
  port?: number;
  url?: string;
  buildLogs: string[];
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Project Processor
 *
 * BullMQ worker that processes jobs from the project-related queues.
 * Handles project operations, generation, builds, deployments, AI tasks, and notifications.
 */
@Injectable()
export class ProjectProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProjectProcessor.name);
  private readonly workers: Map<QueueName, Worker> = new Map();
  private connection: IORedis | null = null;

  // In-memory deployment tracking (in production, use database)
  private readonly deployments: Map<string, DeploymentRecord> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @Inject('GENERATION_QUEUE') private readonly generationQueue: Queue,
    @Inject('DEPLOYMENT_QUEUE') private readonly deploymentQueue: Queue,
    @Inject('NOTIFICATION_QUEUE') private readonly notificationQueue: Queue,
    private readonly generationService: GenerationService,
    private readonly dockerService: DockerService,
    private readonly portManager: PortManager,
    @Optional() @Inject('WEBSOCKETS_GATEWAY') private readonly websocketsGateway?: any,
  ) {}

  /**
   * Initialize workers when module starts
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing project processor workers...');

    // Create Redis connection
    this.connection = this.createRedisConnection();

    // Initialize workers for each queue
    await this.initializeWorker(QueueName.GENERATION, this.processGenerationJob.bind(this));
    await this.initializeWorker(QueueName.BUILD, this.processBuildJob.bind(this));
    await this.initializeWorker(QueueName.DEPLOY, this.processDeployJob.bind(this));
    await this.initializeWorker(QueueName.AI_TASK, this.processAITaskJob.bind(this));
    await this.initializeWorker(QueueName.NOTIFICATION, this.processNotificationJob.bind(this));

    this.logger.log('Project processor workers initialized');
  }

  /**
   * Cleanup workers when module is destroyed
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down project processor workers...');

    const closePromises: Promise<void>[] = [];

    this.workers.forEach((worker, name) => {
      this.logger.log(`Closing worker for queue: ${name}`);
      closePromises.push(worker.close());
    });

    await Promise.all(closePromises);
    this.workers.clear();

    if (this.connection) {
      await this.connection.quit();
      this.connection = null;
    }

    this.logger.log('Project processor workers shut down');
  }

  /**
   * Create Redis connection from configuration
   */
  private createRedisConnection(): IORedis {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      return new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });
    }

    return new IORedis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  /**
   * Initialize a worker for a specific queue
   */
  private async initializeWorker(
    queueName: QueueName,
    processor: (job: Job) => Promise<unknown>,
  ): Promise<void> {
    const config = QUEUE_CONFIGS[queueName];

    const worker = new Worker(
      queueName,
      async (job: Job) => {
        const startTime = Date.now();
        this.logger.log(`[${queueName}] Processing job ${job.id}: ${job.name}`);

        try {
          const result = await processor(job);
          const duration = Date.now() - startTime;
          this.logger.log(`[${queueName}] Job ${job.id} completed in ${duration}ms`);
          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${queueName}] Job ${job.id} failed after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          throw error;
        }
      },
      {
        connection: this.connection!,
        concurrency: this.getConcurrencyForQueue(queueName),
        limiter: config.rateLimit
          ? {
              max: config.rateLimit.max,
              duration: config.rateLimit.duration,
            }
          : undefined,
      },
    );

    // Set up event handlers
    worker.on('completed', (job: Job, result: unknown) => {
      this.logger.debug(`[${queueName}] Job ${job.id} completed`);
      this.onJobCompleted(queueName, job, result);
    });

    worker.on('failed', (job: Job | undefined, error: Error) => {
      this.logger.error(`[${queueName}] Job ${job?.id} failed: ${error.message}`);
      if (job) {
        this.onJobFailed(queueName, job, error);
      }
    });

    worker.on('error', (error: Error) => {
      this.logger.error(`[${queueName}] Worker error: ${error.message}`);
    });

    worker.on('stalled', (jobId: string) => {
      this.logger.warn(`[${queueName}] Job ${jobId} stalled`);
    });

    this.workers.set(queueName, worker);
    this.logger.log(`Worker initialized for queue: ${queueName}`);
  }

  /**
   * Get concurrency setting for a specific queue
   */
  private getConcurrencyForQueue(queueName: QueueName): number {
    switch (queueName) {
      case QueueName.GENERATION:
        return 3;
      case QueueName.BUILD:
        return 2;
      case QueueName.DEPLOY:
        return 2;
      case QueueName.AI_TASK:
        return 5;
      case QueueName.NOTIFICATION:
        return 10;
      default:
        return 3;
    }
  }

  // ============================================
  // Job Processors
  // ============================================

  /**
   * Process generation jobs (project creation, updates, generation)
   */
  private async processGenerationJob(job: Job): Promise<GenerationJobResult | ProjectJobResult> {
    const startTime = Date.now();

    // Handle project actions
    if (isProjectJobData(job.data)) {
      return this.handleProjectAction(job.data, startTime);
    }

    // Handle generation jobs
    if (isGenerationJobData(job.data)) {
      return this.handleGeneration(job.data, job, startTime);
    }

    throw new Error(`Unknown job data format for generation queue: ${job.name}`);
  }

  /**
   * Handle project action jobs
   */
  private async handleProjectAction(
    data: ProjectJobData,
    startTime: number,
  ): Promise<ProjectJobResult> {
    const { projectId, userId, action, payload } = data;

    this.logger.log(`Processing project ${action} for project ${projectId}`);

    try {
      let result: Record<string, unknown> | undefined;

      switch (action) {
        case 'create':
          result = await this.createProject(projectId, userId, payload);
          break;
        case 'update':
          result = await this.updateProject(projectId, userId, payload);
          break;
        case 'delete':
          result = await this.deleteProject(projectId, userId);
          break;
        case 'generate':
        case 'build':
        case 'deploy':
          // These should be handled by specific queues
          this.logger.warn(`Action ${action} should use dedicated queue`);
          break;
        default:
          throw new Error(`Unknown project action: ${action}`);
      }

      return {
        success: true,
        projectId,
        action,
        data: result,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        projectId,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Handle code generation jobs
   */
  private async handleGeneration(
    data: GenerationJobData,
    job: Job,
    startTime: number,
  ): Promise<GenerationJobResult> {
    const { generationId, projectId, userId, prompt, type, config, assets } = data;

    this.logger.log(`Processing ${type} generation ${generationId} for project ${projectId}`);

    try {
      // Update progress
      await job.updateProgress(10);
      this.emitProgressUpdate(projectId, generationId, 10, 'Starting generation...');

      // Validate input
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Generation prompt cannot be empty');
      }

      await job.updateProgress(20);
      this.emitProgressUpdate(projectId, generationId, 20, 'Analyzing requirements...');

      // Prepare job data for GenerationService
      const agentJobData: AgentGenerationJobData = {
        projectId,
        prompt,
        assets,
        userId,
        settings: {
          framework: config?.framework,
          styling: config?.styling,
          language: config?.language,
          features: config?.features,
          model: config?.model,
          temperature: config?.temperature,
          maxTokens: config?.maxTokens,
          customInstructions: config?.customInstructions,
        },
      };

      await job.updateProgress(30);
      this.emitProgressUpdate(projectId, generationId, 30, 'Creating technical specification...');

      // Call GenerationService for actual generation
      const result = await this.generationService.processGeneration(agentJobData);

      await job.updateProgress(90);
      this.emitProgressUpdate(projectId, generationId, 90, 'Finalizing generation...');

      if (!result.success) {
        throw new Error(result.error || 'Generation failed');
      }

      this.logger.log(`Generation completed for project ${projectId}: ${result.files?.length || 0} files generated`);

      // Send notification about completion
      await this.queueNotification(userId, 'Generation Complete', `Your ${type} generation is ready`);

      await job.updateProgress(100);
      this.emitProgressUpdate(projectId, generationId, 100, 'Generation complete!');

      return {
        success: true,
        generationId,
        files: result.files,
        previewUrl: `https://preview.nexusgen.dev/${projectId}/${generationId}`,
        tokenUsage: {
          promptTokens: 500,
          completionTokens: 1500,
          totalTokens: 2000,
        },
        modelUsed: config?.model || 'gpt-4-turbo',
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Generation failed for project ${projectId}: ${errorMessage}`, error);

      // Emit failure event
      this.emitProgressUpdate(projectId, generationId, -1, `Generation failed: ${errorMessage}`);

      // Send failure notification
      await this.queueNotification(
        userId,
        'Generation Failed',
        `Your ${type} generation failed: ${errorMessage}`,
      );

      return {
        success: false,
        generationId,
        error: errorMessage,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Emit a progress update via WebSocket (if gateway is available)
   */
  private emitProgressUpdate(
    projectId: string,
    generationId: string,
    progress: number,
    message: string,
  ): void {
    if (this.websocketsGateway) {
      try {
        this.websocketsGateway.emit('generation:progress', {
          projectId,
          generationId,
          progress,
          message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        this.logger.warn(`Failed to emit WebSocket event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Process build jobs - Builds Docker images from project sandbox
   */
  private async processBuildJob(job: Job): Promise<BuildJobResult> {
    const startTime = Date.now();

    if (!isBuildJobData(job.data)) {
      throw new Error('Invalid build job data');
    }

    const { buildId, projectId, userId, config, gitInfo } = job.data;
    const logs: string[] = [];

    this.logger.log(`Processing build ${buildId} for project ${projectId}`);

    // Create or update deployment record
    const deploymentRecord = this.createDeploymentRecord(buildId, projectId, userId);
    deploymentRecord.status = DeploymentStatus.BUILDING;

    try {
      await job.updateProgress(10);
      logs.push(`[${new Date().toISOString()}] Starting Docker build...`);

      // Emit WebSocket event for build start
      this.emitDeploymentEvent('deployment:building', {
        deploymentId: buildId,
        projectId,
        status: DeploymentStatus.BUILDING,
        message: 'Building Docker image...',
      });

      // Get sandbox path from GenerationService
      const sandboxPath = this.generationService.getSandboxPath(projectId);
      logs.push(`[${new Date().toISOString()}] Using sandbox path: ${sandboxPath}`);

      await job.updateProgress(20);

      // Check if Docker is available
      const dockerAvailable = await this.dockerService.isAvailable();
      if (!dockerAvailable) {
        throw new Error('Docker is not available on this system');
      }

      logs.push(`[${new Date().toISOString()}] Docker daemon is available`);

      // Build Docker image (DockerService handles log streaming via notifications)
      await job.updateProgress(30);
      logs.push(`[${new Date().toISOString()}] Building Docker image...`);

      const buildResult: BuildResult = await this.dockerService.buildImage(projectId, sandboxPath);

      // Add build logs from result
      logs.push(...buildResult.logs);

      await job.updateProgress(70);

      if (!buildResult.success) {
        throw new Error(buildResult.error || 'Docker build failed');
      }

      // Update deployment record with image info
      const imageName = `nexusgen-${projectId}:latest`;
      deploymentRecord.imageId = buildResult.imageId;
      deploymentRecord.imageName = imageName;
      deploymentRecord.buildLogs = logs;

      logs.push(`[${new Date().toISOString()}] Docker image built successfully: ${imageName}`);
      logs.push(`[${new Date().toISOString()}] Image ID: ${buildResult.imageId}`);

      await job.updateProgress(100);

      // Send notification
      await this.queueNotification(userId, 'Build Complete', `Build ${buildId} completed successfully`);

      return {
        success: true,
        buildId,
        projectId,
        outputPath: sandboxPath,
        logs,
        imageId: buildResult.imageId,
        imageName,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update deployment record
      deploymentRecord.status = DeploymentStatus.FAILED;
      deploymentRecord.error = errorMessage;
      deploymentRecord.buildLogs = logs;

      logs.push(`[${new Date().toISOString()}] Build failed: ${errorMessage}`);

      // Emit failure event
      this.emitDeploymentEvent('deployment:failed', {
        deploymentId: buildId,
        projectId,
        status: DeploymentStatus.FAILED,
        error: errorMessage,
      });

      await this.queueNotification(
        userId,
        'Build Failed',
        `Build ${buildId} failed: ${errorMessage}`,
      );

      return {
        success: false,
        buildId,
        projectId,
        logs,
        error: errorMessage,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Process deployment jobs - Full deployment orchestration
   *
   * Orchestrates the complete deployment flow:
   * 1. Build Docker image (if not already built)
   * 2. Find and reserve an available port
   * 3. Run the container
   * 4. Update deployment record with URL
   * 5. Handle cleanup on failure
   */
  private async processDeployJob(job: Job): Promise<DeployJobResult> {
    const startTime = Date.now();

    if (!isDeployJobData(job.data)) {
      throw new Error('Invalid deploy job data');
    }

    const { deploymentId, projectId, userId, buildId, environment, domain } = job.data;

    this.logger.log(`Processing deployment ${deploymentId} to ${environment} for project ${projectId}`);

    // Get or create deployment record
    let deploymentRecord = this.deployments.get(deploymentId);
    if (!deploymentRecord) {
      deploymentRecord = this.createDeploymentRecord(deploymentId, projectId, userId);
    }

    // Track resources for cleanup on failure
    let allocatedPort: number | undefined;
    let containerId: string | undefined;
    let imageId: string | undefined;

    try {
      await job.updateProgress(10);

      // Step 1: Emit deployment started event
      this.emitDeploymentEvent('deployment:deploying', {
        deploymentId,
        projectId,
        status: DeploymentStatus.DEPLOYING,
        message: 'Starting deployment...',
      });

      deploymentRecord.status = DeploymentStatus.DEPLOYING;

      // Step 2: Get or build the image
      // Check if we have an imageId from a previous build, or build now
      const imageName = `nexusgen-${projectId}:latest`;

      if (deploymentRecord.imageId) {
        imageId = deploymentRecord.imageId;
        this.logger.log(`Using existing image: ${imageId}`);
      } else {
        // Need to build the image first
        this.logger.log(`Building image for project: ${projectId}`);

        await job.updateProgress(20);
        this.emitDeploymentEvent('deployment:building', {
          deploymentId,
          projectId,
          status: DeploymentStatus.BUILDING,
          message: 'Building Docker image...',
        });

        const sandboxPath = this.generationService.getSandboxPath(projectId);
        const buildResult = await this.dockerService.buildImage(projectId, sandboxPath);

        if (!buildResult.success) {
          throw new Error(buildResult.error || 'Failed to build Docker image');
        }

        imageId = buildResult.imageId;
        deploymentRecord.imageId = imageId;
        deploymentRecord.imageName = imageName;
        deploymentRecord.buildLogs = buildResult.logs;
      }

      await job.updateProgress(40);

      // Step 3: Find and allocate a port
      this.logger.log('Finding available port...');
      allocatedPort = await this.portManager.allocatePort(projectId, deploymentId);
      deploymentRecord.port = allocatedPort;
      this.logger.log(`Allocated port: ${allocatedPort}`);

      await job.updateProgress(50);

      // Step 4: Run the container
      this.logger.log(`Starting container from image: ${imageName || imageId}`);
      this.emitDeploymentEvent('deployment:deploying', {
        deploymentId,
        projectId,
        status: DeploymentStatus.DEPLOYING,
        message: `Starting container on port ${allocatedPort}...`,
      });

      const runResult: ContainerResult = await this.dockerService.runContainer(
        imageName || imageId!,
        allocatedPort,
      );

      if (!runResult.success) {
        throw new Error(runResult.error || 'Failed to start container');
      }

      containerId = runResult.containerId;
      deploymentRecord.containerId = containerId;

      await job.updateProgress(80);

      // Step 5: Determine the deployment URL
      const baseHost = this.configService.get<string>('DEPLOYMENT_HOST', 'localhost');
      const deployUrl =
        environment === 'production' && domain
          ? `https://${domain.name}`
          : `http://${baseHost}:${allocatedPort}`;

      deploymentRecord.url = deployUrl;
      deploymentRecord.status = DeploymentStatus.RUNNING;
      deploymentRecord.completedAt = new Date();

      // Update DNS if custom domain
      if (domain) {
        this.logger.log(`Configuring domain ${domain.name} with SSL: ${domain.ssl}`);
        // TODO: Implement DNS configuration
      }

      await job.updateProgress(100);

      // Emit success event
      this.emitDeploymentEvent('deployment:ready', {
        deploymentId,
        projectId,
        status: DeploymentStatus.RUNNING,
        url: deployUrl,
        port: allocatedPort,
        containerId,
        message: `Deployment is live at ${deployUrl}`,
      });

      // Send notification
      await this.queueNotification(
        userId,
        'Deployment Complete',
        `Your ${environment} deployment is live at ${deployUrl}`,
      );

      this.logger.log(`Deployment ${deploymentId} completed successfully: ${deployUrl}`);

      return {
        success: true,
        deploymentId,
        projectId,
        url: deployUrl,
        containerId,
        port: allocatedPort,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Deployment ${deploymentId} failed: ${errorMessage}`, error);

      // Update deployment record
      deploymentRecord.status = DeploymentStatus.FAILED;
      deploymentRecord.error = errorMessage;
      deploymentRecord.completedAt = new Date();

      // Cleanup on failure
      await this.cleanupFailedDeployment(containerId, imageId, allocatedPort);

      // Emit failure event
      this.emitDeploymentEvent('deployment:failed', {
        deploymentId,
        projectId,
        status: DeploymentStatus.FAILED,
        error: errorMessage,
        message: `Deployment failed: ${errorMessage}`,
      });

      // Send failure notification
      await this.queueNotification(
        userId,
        'Deployment Failed',
        `Deployment to ${environment} failed: ${errorMessage}`,
      );

      return {
        success: false,
        deploymentId,
        projectId,
        error: errorMessage,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Process AI task jobs
   */
  private async processAITaskJob(job: Job): Promise<AITaskJobResult> {
    const startTime = Date.now();

    if (!isAITaskJobData(job.data)) {
      throw new Error('Invalid AI task job data');
    }

    const { taskId, userId, type, input, context, modelConfig } = job.data;

    this.logger.log(`Processing AI task ${taskId} of type ${type}`);

    try {
      await job.updateProgress(10);

      // TODO: Call AI service based on task type
      // For now, simulate AI processing
      let output: string;

      switch (type) {
        case 'code-review':
          output = `Code review completed for the provided code. Found 2 potential improvements and 1 security consideration.`;
          break;
        case 'code-explanation':
          output = `This code implements a user authentication flow using JWT tokens...`;
          break;
        case 'code-generation':
          output = `// Generated code based on your prompt\nexport function example() {\n  return 'Hello, World!';\n}`;
          break;
        case 'documentation':
          output = `# API Documentation\n\n## Overview\nThis document describes the API endpoints...`;
          break;
        default:
          output = `AI task ${type} completed successfully`;
      }

      await job.updateProgress(100);

      return {
        success: true,
        taskId,
        output,
        tokenUsage: {
          promptTokens: input.length / 4,
          completionTokens: output.length / 4,
          totalTokens: (input.length + output.length) / 4,
        },
        modelUsed: modelConfig?.model || 'gpt-4-turbo',
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        taskId,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Process notification jobs
   */
  private async processNotificationJob(job: Job): Promise<NotificationJobResult> {
    const startTime = Date.now();

    if (!isNotificationJobData(job.data)) {
      throw new Error('Invalid notification job data');
    }

    const { notificationId, userId, type, subject, body, data, actionUrl } = job.data;

    this.logger.log(`Processing ${type} notification ${notificationId} for user ${userId}`);

    try {
      let externalId: string | undefined;

      switch (type) {
        case 'email':
          // TODO: Send email via email service (SendGrid, etc.)
          this.logger.log(`Sending email to user ${userId}: ${subject}`);
          externalId = `email_${Date.now()}`;
          break;

        case 'push':
          // TODO: Send push notification
          this.logger.log(`Sending push notification to user ${userId}: ${subject}`);
          break;

        case 'in-app':
          // TODO: Store in-app notification in database
          this.logger.log(`Creating in-app notification for user ${userId}: ${subject}`);
          break;

        case 'webhook':
          // TODO: Send webhook
          this.logger.log(`Sending webhook notification: ${subject}`);
          break;

        case 'slack':
          // TODO: Send Slack notification
          this.logger.log(`Sending Slack notification: ${subject}`);
          break;

        case 'discord':
          // TODO: Send Discord notification
          this.logger.log(`Sending Discord notification: ${subject}`);
          break;

        default:
          this.logger.warn(`Unknown notification type: ${type}`);
      }

      return {
        success: true,
        notificationId,
        delivered: true,
        externalId,
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        notificationId,
        delivered: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      };
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Create a new project
   */
  private async createProject(
    projectId: string,
    userId: string,
    payload?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // TODO: Implement actual project creation with database
    this.logger.log(`Creating project ${projectId} for user ${userId}`);
    return { projectId, status: 'created' };
  }

  /**
   * Update an existing project
   */
  private async updateProject(
    projectId: string,
    userId: string,
    payload?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // TODO: Implement actual project update with database
    this.logger.log(`Updating project ${projectId} for user ${userId}`);
    return { projectId, status: 'updated' };
  }

  /**
   * Delete a project
   */
  private async deleteProject(
    projectId: string,
    userId: string,
  ): Promise<Record<string, unknown>> {
    // TODO: Implement actual project deletion with database
    this.logger.log(`Deleting project ${projectId} for user ${userId}`);
    return { projectId, status: 'deleted' };
  }

  /**
   * Perform code generation (fallback method for simple generation)
   * @deprecated Use GenerationService.processGeneration() instead
   */
  private async performGeneration(
    data: GenerationJobData,
    job: Job,
  ): Promise<Array<{ path: string; content: string; language: string; isNew: boolean }>> {
    const { projectId, prompt, assets, userId, config } = data;

    await job.updateProgress(50);

    // Use GenerationService for actual generation
    const agentJobData: AgentGenerationJobData = {
      projectId,
      prompt,
      assets,
      userId,
      settings: {
        framework: config?.framework,
        styling: config?.styling,
        language: config?.language,
        features: config?.features,
        model: config?.model,
        temperature: config?.temperature,
        maxTokens: config?.maxTokens,
        customInstructions: config?.customInstructions,
      },
    };

    const result = await this.generationService.processGeneration(agentJobData);

    await job.updateProgress(70);

    if (!result.success || !result.files) {
      // Return a fallback mock file if generation fails
      this.logger.warn('Generation service failed, returning fallback mock file');
      return [
        {
          path: 'src/components/Example.tsx',
          content: `import React from 'react';\n\nexport function Example() {\n  return <div>Generated Component</div>;\n}`,
          language: 'typescript',
          isNew: true,
        },
      ];
    }

    return result.files;
  }

  /**
   * Queue a notification job
   */
  private async queueNotification(
    userId: string,
    subject: string,
    body: string,
  ): Promise<void> {
    try {
      await this.notificationQueue.add('notification:in-app', {
        notificationId: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        userId,
        type: 'in-app',
        subject,
        body,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Failed to queue notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // Deployment Tracking Methods
  // ============================================

  /**
   * Create a deployment record for tracking
   */
  private createDeploymentRecord(
    deploymentId: string,
    projectId: string,
    userId: string,
  ): DeploymentRecord {
    const record: DeploymentRecord = {
      deploymentId,
      projectId,
      userId,
      status: DeploymentStatus.PENDING,
      buildLogs: [],
      startedAt: new Date(),
    };
    this.deployments.set(deploymentId, record);
    return record;
  }

  /**
   * Get a deployment record by ID
   */
  getDeploymentRecord(deploymentId: string): DeploymentRecord | undefined {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get all deployment records for a project
   */
  getProjectDeployments(projectId: string): DeploymentRecord[] {
    return Array.from(this.deployments.values()).filter(
      (d) => d.projectId === projectId,
    );
  }

  /**
   * Emit a deployment event via WebSocket
   */
  private emitDeploymentEvent(
    event: string,
    data: {
      deploymentId: string;
      projectId: string;
      status: DeploymentStatus;
      message?: string;
      url?: string;
      port?: number;
      containerId?: string;
      error?: string;
      log?: string;
      type?: string;
    },
  ): void {
    if (this.websocketsGateway) {
      try {
        this.websocketsGateway.emit(event, {
          ...data,
          timestamp: new Date().toISOString(),
        });
        this.logger.debug(`Emitted ${event} for deployment ${data.deploymentId}`);
      } catch (error) {
        this.logger.warn(
          `Failed to emit ${event}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  /**
   * Cleanup resources from a failed deployment
   */
  private async cleanupFailedDeployment(
    containerId?: string,
    imageId?: string,
    port?: number,
  ): Promise<void> {
    this.logger.log('Cleaning up failed deployment resources...');

    // Stop and remove container if it was created
    if (containerId) {
      try {
        this.logger.log(`Stopping container: ${containerId}`);
        await this.dockerService.stopContainer(containerId);
        this.logger.log(`Container stopped and removed: ${containerId}`);
      } catch (error) {
        this.logger.warn(
          `Failed to stop container ${containerId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Release the port if it was allocated
    if (port) {
      try {
        this.portManager.releasePort(port);
        this.logger.log(`Released port: ${port}`);
      } catch (error) {
        this.logger.warn(
          `Failed to release port ${port}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }

    // Note: We don't remove the image by default as it may be reused
    // Uncomment below if you want to remove the image on failure:
    // if (imageId) {
    //   try {
    //     await this.dockerService.removeImage(imageId);
    //     this.logger.log(`Removed image: ${imageId}`);
    //   } catch (error) {
    //     this.logger.warn(`Failed to remove image ${imageId}: ${error}`);
    //   }
    // }

    this.logger.log('Cleanup completed');
  }

  /**
   * Stop a running deployment
   */
  async stopDeployment(deploymentId: string): Promise<boolean> {
    const record = this.deployments.get(deploymentId);
    if (!record) {
      this.logger.warn(`Deployment not found: ${deploymentId}`);
      return false;
    }

    this.logger.log(`Stopping deployment: ${deploymentId}`);

    try {
      // Stop the container
      if (record.containerId) {
        await this.dockerService.stopContainer(record.containerId);
      }

      // Release the port
      if (record.port) {
        this.portManager.releasePort(record.port);
      }

      // Update the record
      record.status = DeploymentStatus.STOPPED;
      record.completedAt = new Date();

      // Emit stopped event
      this.emitDeploymentEvent('deployment:stopped', {
        deploymentId,
        projectId: record.projectId,
        status: DeploymentStatus.STOPPED,
        message: 'Deployment stopped',
      });

      this.logger.log(`Deployment ${deploymentId} stopped successfully`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to stop deployment ${deploymentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Clean up all deployments for a project
   */
  async cleanupProjectDeployments(projectId: string): Promise<number> {
    const deployments = this.getProjectDeployments(projectId);
    let cleanedUp = 0;

    for (const deployment of deployments) {
      if (deployment.status === DeploymentStatus.RUNNING) {
        const stopped = await this.stopDeployment(deployment.deploymentId);
        if (stopped) {
          cleanedUp++;
        }
      }
    }

    // Release all ports for this project
    this.portManager.releaseProjectPorts(projectId);

    this.logger.log(`Cleaned up ${cleanedUp} deployments for project ${projectId}`);
    return cleanedUp;
  }

  // ============================================
  // Event Handlers
  // ============================================

  /**
   * Handle job completion
   */
  private onJobCompleted(queueName: QueueName, job: Job, result: unknown): void {
    // TODO: Emit WebSocket event, update database, etc.
    this.logger.debug(`[${queueName}] Job ${job.id} completed with result`);
  }

  /**
   * Handle job failure
   */
  private onJobFailed(queueName: QueueName, job: Job, error: Error): void {
    // TODO: Emit WebSocket event, send alerts, etc.
    this.logger.error(`[${queueName}] Job ${job.id} failed: ${error.message}`);
  }
}
