import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PortManager } from './port-manager';

/**
 * Port Manager Module
 *
 * Provides port allocation services for container deployments.
 * Manages the assignment and release of ports within a configured range.
 *
 * Dependencies:
 * - ConfigModule: For port range configuration (DEPLOYMENT_PORT_MIN, DEPLOYMENT_PORT_MAX)
 *
 * Exports:
 * - PortManager: Service for port allocation operations
 */
@Module({
  imports: [ConfigModule],
  providers: [PortManager],
  exports: [PortManager],
})
export class PortManagerModule {}
