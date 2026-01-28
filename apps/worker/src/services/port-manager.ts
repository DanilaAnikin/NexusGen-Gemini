import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

/**
 * Port allocation result
 */
export interface PortAllocation {
  port: number;
  allocatedAt: Date;
  projectId?: string;
  deploymentId?: string;
}

/**
 * Port Manager
 *
 * Manages port allocation for container deployments.
 * Ensures ports are available before assignment and tracks allocated ports.
 */
@Injectable()
export class PortManager {
  private readonly logger = new Logger(PortManager.name);
  private readonly allocatedPorts: Map<number, PortAllocation> = new Map();
  private readonly minPort: number;
  private readonly maxPort: number;

  constructor(private readonly configService: ConfigService) {
    this.minPort = this.configService.get<number>('DEPLOYMENT_PORT_MIN', 3001);
    this.maxPort = this.configService.get<number>('DEPLOYMENT_PORT_MAX', 4000);
    this.logger.log(`Port Manager initialized with range ${this.minPort}-${this.maxPort}`);
  }

  /**
   * Find an available port within the configured range
   */
  async findAvailablePort(
    startPort?: number,
    endPort?: number,
  ): Promise<number> {
    const min = startPort ?? this.minPort;
    const max = endPort ?? this.maxPort;

    this.logger.log(`Finding available port in range ${min}-${max}`);

    // Try ports in order
    for (let port = min; port <= max; port++) {
      // Skip if already allocated in memory
      if (this.allocatedPorts.has(port)) {
        continue;
      }

      // Check if port is actually available
      const available = await this.isPortAvailable(port);
      if (available) {
        this.logger.log(`Found available port: ${port}`);
        return port;
      }
    }

    throw new Error(`No available ports in range ${min}-${max}`);
  }

  /**
   * Reserve a port for a deployment
   */
  reservePort(
    port: number,
    projectId?: string,
    deploymentId?: string,
  ): void {
    if (this.allocatedPorts.has(port)) {
      throw new Error(`Port ${port} is already reserved`);
    }

    this.allocatedPorts.set(port, {
      port,
      allocatedAt: new Date(),
      projectId,
      deploymentId,
    });

    this.logger.log(`Reserved port ${port} for project ${projectId || 'unknown'}`);
  }

  /**
   * Release a previously reserved port
   */
  releasePort(port: number): void {
    const allocation = this.allocatedPorts.get(port);
    if (allocation) {
      this.allocatedPorts.delete(port);
      this.logger.log(`Released port ${port} (was allocated to project ${allocation.projectId || 'unknown'})`);
    }
  }

  /**
   * Release all ports for a specific project
   */
  releaseProjectPorts(projectId: string): void {
    const portsToRelease: number[] = [];

    for (const [port, allocation] of this.allocatedPorts.entries()) {
      if (allocation.projectId === projectId) {
        portsToRelease.push(port);
      }
    }

    for (const port of portsToRelease) {
      this.releasePort(port);
    }

    this.logger.log(`Released ${portsToRelease.length} ports for project ${projectId}`);
  }

  /**
   * Get allocation info for a port
   */
  getPortAllocation(port: number): PortAllocation | undefined {
    return this.allocatedPorts.get(port);
  }

  /**
   * Get all allocated ports
   */
  getAllocatedPorts(): PortAllocation[] {
    return Array.from(this.allocatedPorts.values());
  }

  /**
   * Get allocated ports for a specific project
   */
  getProjectPorts(projectId: string): PortAllocation[] {
    return Array.from(this.allocatedPorts.values()).filter(
      (allocation) => allocation.projectId === projectId,
    );
  }

  /**
   * Check if a specific port is available
   */
  async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          // Other errors - assume port is not available
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close(() => {
          resolve(true);
        });
      });

      server.listen(port, '0.0.0.0');
    });
  }

  /**
   * Find and reserve a port in one operation
   */
  async allocatePort(
    projectId?: string,
    deploymentId?: string,
    startPort?: number,
    endPort?: number,
  ): Promise<number> {
    const port = await this.findAvailablePort(startPort, endPort);
    this.reservePort(port, projectId, deploymentId);
    return port;
  }

  /**
   * Get the count of allocated ports
   */
  getAllocatedPortCount(): number {
    return this.allocatedPorts.size;
  }

  /**
   * Check if port is within valid range
   */
  isPortInRange(port: number): boolean {
    return port >= this.minPort && port <= this.maxPort;
  }

  /**
   * Get port range configuration
   */
  getPortRange(): { min: number; max: number } {
    return {
      min: this.minPort,
      max: this.maxPort,
    };
  }

  /**
   * Clean up stale allocations (ports that were allocated but never used)
   * Checks if ports are still in use
   */
  async cleanupStaleAllocations(maxAgeMs: number = 3600000): Promise<number> {
    const now = Date.now();
    const staleAllocations: number[] = [];

    for (const [port, allocation] of this.allocatedPorts.entries()) {
      const age = now - allocation.allocatedAt.getTime();
      if (age > maxAgeMs) {
        // Check if port is actually in use
        const inUse = !(await this.isPortAvailable(port));
        if (!inUse) {
          staleAllocations.push(port);
        }
      }
    }

    for (const port of staleAllocations) {
      this.releasePort(port);
    }

    if (staleAllocations.length > 0) {
      this.logger.log(`Cleaned up ${staleAllocations.length} stale port allocations`);
    }

    return staleAllocations.length;
  }
}

/**
 * Static utility functions for port management
 * Can be used without dependency injection
 */
export class PortManagerUtils {
  /**
   * Find an available port (static version)
   */
  static async findAvailablePort(
    startPort: number = 3001,
    endPort: number = 4000,
  ): Promise<number> {
    for (let port = startPort; port <= endPort; port++) {
      const available = await PortManagerUtils.isPortAvailable(port);
      if (available) {
        return port;
      }
    }
    throw new Error(`No available ports in range ${startPort}-${endPort}`);
  }

  /**
   * Check if a specific port is available (static version)
   */
  static isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', () => {
        resolve(false);
      });

      server.once('listening', () => {
        server.close(() => {
          resolve(true);
        });
      });

      server.listen(port, '0.0.0.0');
    });
  }
}
