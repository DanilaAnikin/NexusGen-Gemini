import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Docker from 'dockerode';
import { Readable } from 'stream';
import { QueuesService } from '../queues';
import { NotificationJobData } from '../types';

/**
 * Result of a Docker image build operation
 */
export interface BuildResult {
  /** Whether the build was successful */
  success: boolean;
  /** The ID of the built image (if successful) */
  imageId?: string;
  /** Build logs collected during the build process */
  logs: string[];
  /** Error message if the build failed */
  error?: string;
}

/**
 * Result of a Docker container run operation
 */
export interface ContainerResult {
  /** Whether the container was started successfully */
  success: boolean;
  /** The ID of the running container (if successful) */
  containerId?: string;
  /** Error message if the container failed to start */
  error?: string;
}

/**
 * Docker Service
 *
 * Manages Docker operations for building and running generated applications.
 * Provides methods for building images, running containers, and cleanup operations.
 *
 * Features:
 * - Build Docker images from project paths with real-time log streaming
 * - Run containers with port mapping
 * - Stop and remove containers
 * - Remove images for cleanup
 * - Emits build progress via notification queue for frontend visibility
 */
@Injectable()
export class DockerService {
  private readonly logger = new Logger(DockerService.name);
  private readonly docker: Docker;
  private readonly socketPath: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject('QUEUE_SERVICE') private readonly queuesService: QueuesService,
  ) {
    // Configure Docker connection
    this.socketPath = this.configService.get<string>(
      'DOCKER_SOCKET_PATH',
      '/var/run/docker.sock',
    );

    const dockerHost = this.configService.get<string>('DOCKER_HOST');
    const dockerPort = this.configService.get<number>('DOCKER_PORT');

    // Use TCP connection if host is specified, otherwise use socket
    if (dockerHost) {
      this.docker = new Docker({
        host: dockerHost,
        port: dockerPort || 2375,
      });
      this.logger.log(`Docker client initialized with host: ${dockerHost}:${dockerPort || 2375}`);
    } else {
      this.docker = new Docker({
        socketPath: this.socketPath,
      });
      this.logger.log(`Docker client initialized with socket: ${this.socketPath}`);
    }
  }

  /**
   * Build a Docker image from a project directory
   *
   * @param projectId - The project ID for tracking and notifications
   * @param path - The path to the directory containing the Dockerfile
   * @returns BuildResult with success status, image ID, and logs
   */
  async buildImage(projectId: string, path: string): Promise<BuildResult> {
    this.logger.log(`Starting Docker build for project: ${projectId} at path: ${path}`);

    const logs: string[] = [];
    let imageId: string | undefined;

    try {
      // Emit initial notification
      await this.emitBuildNotification(projectId, 'Build started', 'info');

      // Build the image using dockerode
      const stream = await this.docker.buildImage(
        {
          context: path,
          src: ['.'],
        },
        {
          t: `nexusgen-${projectId}:latest`,
          dockerfile: 'Dockerfile',
          rm: true, // Remove intermediate containers
          forcerm: true, // Always remove intermediate containers
        },
      );

      // Process build output stream
      imageId = await this.processBuildStream(stream, projectId, logs);

      if (imageId) {
        this.logger.log(`Docker build successful for project: ${projectId}, imageId: ${imageId}`);
        await this.emitBuildNotification(projectId, 'Build completed successfully', 'success');

        return {
          success: true,
          imageId,
          logs,
        };
      } else {
        const errorMsg = 'Build completed but no image ID was returned';
        this.logger.warn(`${errorMsg} for project: ${projectId}`);
        await this.emitBuildNotification(projectId, errorMsg, 'warning');

        return {
          success: false,
          logs,
          error: errorMsg,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Docker build failed for project: ${projectId}`, errorMessage);

      logs.push(`ERROR: ${errorMessage}`);
      await this.emitBuildNotification(projectId, `Build failed: ${errorMessage}`, 'error');

      return {
        success: false,
        logs,
        error: errorMessage,
      };
    }
  }

  /**
   * Process the Docker build stream and extract logs and image ID
   *
   * @param stream - The Docker build output stream
   * @param projectId - The project ID for notifications
   * @param logs - Array to collect log messages
   * @returns The built image ID or undefined
   */
  private async processBuildStream(
    stream: NodeJS.ReadableStream,
    projectId: string,
    logs: string[],
  ): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      let imageId: string | undefined;

      this.docker.modem.followProgress(
        stream as Readable,
        // onFinished callback
        (err: Error | null, output: Array<{ stream?: string; aux?: { ID?: string }; error?: string }>) => {
          if (err) {
            reject(err);
            return;
          }

          // Look for the final image ID in the output
          for (const item of output) {
            if (item.aux?.ID) {
              imageId = item.aux.ID;
            }
          }

          resolve(imageId);
        },
        // onProgress callback - called for each line of output
        (event: { stream?: string; status?: string; progress?: string; error?: string; aux?: { ID?: string } }) => {
          // Handle error events
          if (event.error) {
            const errorLine = `ERROR: ${event.error}`;
            logs.push(errorLine);
            this.emitBuildNotification(projectId, errorLine, 'error').catch(() => {
              // Ignore notification errors during stream processing
            });
            return;
          }

          // Handle stream output (build steps)
          if (event.stream) {
            const line = event.stream.trim();
            if (line) {
              logs.push(line);
              this.emitBuildNotification(projectId, line, 'info').catch(() => {
                // Ignore notification errors during stream processing
              });
            }
          }

          // Handle status events (pulling layers, etc.)
          if (event.status) {
            const statusLine = event.progress
              ? `${event.status}: ${event.progress}`
              : event.status;
            logs.push(statusLine);
            this.emitBuildNotification(projectId, statusLine, 'info').catch(() => {
              // Ignore notification errors during stream processing
            });
          }

          // Capture image ID from aux field
          if (event.aux?.ID) {
            imageId = event.aux.ID;
          }
        },
      );
    });
  }

  /**
   * Run a container from a Docker image
   *
   * @param imageId - The Docker image ID or tag to run
   * @param port - The host port to map to container port 3000
   * @returns ContainerResult with success status and container ID
   */
  async runContainer(imageId: string, port: number): Promise<ContainerResult> {
    this.logger.log(`Starting container from image: ${imageId} on port: ${port}`);

    try {
      // Create the container with port mapping
      const container = await this.docker.createContainer({
        Image: imageId,
        ExposedPorts: {
          '3000/tcp': {},
        },
        HostConfig: {
          PortBindings: {
            '3000/tcp': [
              {
                HostPort: String(port),
              },
            ],
          },
          // Auto-remove container when it stops (optional, for cleanup)
          AutoRemove: false,
          // Resource limits (optional, for safety)
          Memory: this.configService.get<number>('DOCKER_CONTAINER_MEMORY_LIMIT', 512 * 1024 * 1024), // 512MB default
          CpuPeriod: 100000,
          CpuQuota: this.configService.get<number>('DOCKER_CONTAINER_CPU_QUOTA', 50000), // 50% CPU default
        },
        Env: [
          'NODE_ENV=production',
          `PORT=3000`,
        ],
        Labels: {
          'nexusgen.managed': 'true',
          'nexusgen.port': String(port),
        },
      });

      // Start the container
      await container.start();

      const containerId = container.id;
      this.logger.log(`Container started successfully: ${containerId}`);

      return {
        success: true,
        containerId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to run container from image: ${imageId}`, errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Stop and remove a running container
   *
   * @param containerId - The ID of the container to stop
   */
  async stopContainer(containerId: string): Promise<void> {
    this.logger.log(`Stopping container: ${containerId}`);

    try {
      const container = this.docker.getContainer(containerId);

      // Check if container exists and is running
      const containerInfo = await container.inspect();

      if (containerInfo.State.Running) {
        // Stop the container with a timeout
        await container.stop({
          t: 10, // 10 second timeout before force kill
        });
        this.logger.log(`Container stopped: ${containerId}`);
      }

      // Remove the container
      await container.remove({
        force: true, // Force remove even if running
        v: true, // Remove associated volumes
      });
      this.logger.log(`Container removed: ${containerId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Ignore errors if container doesn't exist (already removed)
      if (errorMessage.includes('no such container') || errorMessage.includes('No such container')) {
        this.logger.warn(`Container not found (may already be removed): ${containerId}`);
        return;
      }

      this.logger.error(`Failed to stop/remove container: ${containerId}`, errorMessage);
      throw new Error(`Failed to stop container: ${errorMessage}`);
    }
  }

  /**
   * Remove a Docker image
   *
   * @param imageId - The ID or tag of the image to remove
   */
  async removeImage(imageId: string): Promise<void> {
    this.logger.log(`Removing image: ${imageId}`);

    try {
      const image = this.docker.getImage(imageId);

      await image.remove({
        force: true, // Force removal even if used by stopped containers
        noprune: false, // Remove untagged parent images
      });

      this.logger.log(`Image removed: ${imageId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Ignore errors if image doesn't exist (already removed)
      if (errorMessage.includes('no such image') || errorMessage.includes('No such image')) {
        this.logger.warn(`Image not found (may already be removed): ${imageId}`);
        return;
      }

      this.logger.error(`Failed to remove image: ${imageId}`, errorMessage);
      throw new Error(`Failed to remove image: ${errorMessage}`);
    }
  }

  /**
   * Emit a build notification via the notification queue
   *
   * @param projectId - The project ID
   * @param message - The notification message
   * @param level - The notification level (info, success, warning, error)
   */
  private async emitBuildNotification(
    projectId: string,
    message: string,
    level: 'info' | 'success' | 'warning' | 'error',
  ): Promise<void> {
    try {
      const notificationData: NotificationJobData = {
        notificationId: `build-${projectId}-${Date.now()}`,
        userId: 'system', // System-level notification
        type: 'in-app',
        channel: `project:${projectId}:build`,
        subject: 'Docker Build',
        body: message,
        data: {
          projectId,
          level,
          timestamp: new Date().toISOString(),
          type: 'docker-build-log',
        },
      };

      await this.queuesService.addNotificationJob(notificationData);
    } catch (error) {
      // Don't let notification failures affect the build process
      this.logger.warn(
        `Failed to emit build notification for project ${projectId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Check if Docker is available and responsive
   *
   * @returns True if Docker is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.docker.ping();
      return true;
    } catch (error) {
      this.logger.warn(`Docker is not available: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Get information about the Docker system
   *
   * @returns Docker system information
   */
  async getInfo(): Promise<any> {
    return this.docker.info();
  }

  /**
   * List all containers managed by NexusGen
   *
   * @returns Array of container information
   */
  async listManagedContainers(): Promise<Docker.ContainerInfo[]> {
    return this.docker.listContainers({
      all: true,
      filters: {
        label: ['nexusgen.managed=true'],
      },
    });
  }

  /**
   * List all images built by NexusGen
   *
   * @returns Array of image information
   */
  async listManagedImages(): Promise<Docker.ImageInfo[]> {
    return this.docker.listImages({
      filters: {
        reference: ['nexusgen-*'],
      },
    });
  }

  /**
   * Clean up all stopped containers and unused images managed by NexusGen
   *
   * @returns Cleanup summary
   */
  async cleanup(): Promise<{ containersRemoved: number; imagesRemoved: number }> {
    this.logger.log('Starting Docker cleanup for NexusGen resources');

    let containersRemoved = 0;
    let imagesRemoved = 0;

    try {
      // Get all managed containers
      const containers = await this.listManagedContainers();

      // Remove stopped containers
      for (const containerInfo of containers) {
        if (containerInfo.State !== 'running') {
          try {
            await this.stopContainer(containerInfo.Id);
            containersRemoved++;
          } catch (error) {
            this.logger.warn(`Failed to remove container ${containerInfo.Id}: ${error}`);
          }
        }
      }

      // Get all managed images
      const images = await this.listManagedImages();

      // Remove unused images (not used by any container)
      for (const imageInfo of images) {
        try {
          await this.removeImage(imageInfo.Id);
          imagesRemoved++;
        } catch (error) {
          // Image might be in use, skip it
          this.logger.debug(`Skipping image ${imageInfo.Id}: ${error}`);
        }
      }

      this.logger.log(
        `Docker cleanup complete: ${containersRemoved} containers removed, ${imagesRemoved} images removed`,
      );

      return { containersRemoved, imagesRemoved };
    } catch (error) {
      this.logger.error(`Docker cleanup failed: ${error}`);
      return { containersRemoved, imagesRemoved };
    }
  }
}
