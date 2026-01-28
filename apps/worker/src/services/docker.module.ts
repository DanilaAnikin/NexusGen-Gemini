import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DockerService } from './docker.service';
import { QueuesModule } from '../queues';

/**
 * Docker Module
 *
 * Provides Docker containerization services for building and running
 * generated applications. This module is used by the Builder Engine
 * to containerize projects for preview and deployment.
 *
 * Dependencies:
 * - ConfigModule: For Docker configuration (socket path, host, etc.)
 * - QueuesModule: For emitting build progress notifications (using forwardRef to handle circular dependency)
 *
 * Exports:
 * - DockerService: Main service for Docker operations
 */
@Module({
  imports: [
    ConfigModule,
    forwardRef(() => QueuesModule),
  ],
  providers: [DockerService],
  exports: [DockerService],
})
export class DockerModule {}
