/**
 * @nexusgen/utils - Port Manager
 * Utility for managing TCP port allocation in NexusGen AI platform
 *
 * Provides functionality for finding available ports, checking port availability,
 * and managing port reservations to prevent race conditions.
 */

import { createServer, Server } from 'net';

// ============ Port Manager Class ============

/**
 * PortManager class for managing TCP port allocation
 * Maintains an in-memory set of reserved ports to prevent race conditions
 */
export class PortManager {
  /** Set of currently reserved ports */
  private reservedPorts: Set<number> = new Set();

  /** Default start of port range */
  private defaultStartPort: number;

  /** Default end of port range */
  private defaultEndPort: number;

  /**
   * Create a new PortManager instance
   * @param startPort - Default start of port range (default: 3001)
   * @param endPort - Default end of port range (default: 4000)
   */
  constructor(startPort = 3001, endPort = 4000) {
    this.defaultStartPort = startPort;
    this.defaultEndPort = endPort;
  }

  /**
   * Find an available TCP port in the given range
   * @param startPort - Start of port range (default: instance default)
   * @param endPort - End of port range (default: instance default)
   * @returns Promise resolving to the first available port found
   * @throws Error if no port is available in the range
   */
  async findAvailablePort(
    startPort: number = this.defaultStartPort,
    endPort: number = this.defaultEndPort
  ): Promise<number> {
    for (let port = startPort; port <= endPort; port++) {
      // Skip reserved ports
      if (this.reservedPorts.has(port)) {
        continue;
      }

      const available = await this.isPortAvailable(port);
      if (available) {
        return port;
      }
    }

    throw new Error(
      `No available port found in range ${startPort}-${endPort}`
    );
  }

  /**
   * Test if a specific port is available for binding
   * @param port - The port number to test
   * @returns Promise resolving to true if port is available, false otherwise
   */
  async isPortAvailable(port: number): Promise<boolean> {
    // Check if port is reserved in memory first
    if (this.reservedPorts.has(port)) {
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const server: Server = createServer();

      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
          resolve(false);
        } else {
          // Other errors also mean the port is not usable
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close(() => {
          resolve(true);
        });
      });

      server.listen(port, '127.0.0.1');
    });
  }

  /**
   * Reserve a port to prevent race conditions
   * @param port - The port number to reserve
   * @returns true if the port was reserved, false if already reserved
   */
  reservePort(port: number): boolean {
    if (this.reservedPorts.has(port)) {
      return false;
    }
    this.reservedPorts.add(port);
    return true;
  }

  /**
   * Release a previously reserved port
   * @param port - The port number to release
   */
  releasePort(port: number): void {
    this.reservedPorts.delete(port);
  }

  /**
   * Check if a port is currently reserved
   * @param port - The port number to check
   * @returns true if the port is reserved, false otherwise
   */
  isReserved(port: number): boolean {
    return this.reservedPorts.has(port);
  }

  /**
   * Get all currently reserved ports
   * @returns Array of reserved port numbers
   */
  getReservedPorts(): number[] {
    return Array.from(this.reservedPorts);
  }

  /**
   * Clear all port reservations
   */
  clearReservations(): void {
    this.reservedPorts.clear();
  }

  /**
   * Find and reserve an available port atomically
   * This combines finding and reserving to prevent race conditions
   * @param startPort - Start of port range (default: instance default)
   * @param endPort - End of port range (default: instance default)
   * @returns Promise resolving to the reserved port number
   * @throws Error if no port is available in the range
   */
  async findAndReservePort(
    startPort: number = this.defaultStartPort,
    endPort: number = this.defaultEndPort
  ): Promise<number> {
    const port = await this.findAvailablePort(startPort, endPort);
    this.reservePort(port);
    return port;
  }
}

// ============ Standalone Functions ============

/** Default PortManager instance for standalone function use */
const defaultManager = new PortManager();

/**
 * Find an available TCP port in the given range
 * Uses the default PortManager instance
 * @param startPort - Start of port range (default: 3001)
 * @param endPort - End of port range (default: 4000)
 * @returns Promise resolving to the first available port found
 * @throws Error if no port is available in the range
 */
export async function findAvailablePort(
  startPort = 3001,
  endPort = 4000
): Promise<number> {
  return defaultManager.findAvailablePort(startPort, endPort);
}

/**
 * Test if a specific port is available for binding
 * Uses the default PortManager instance
 * @param port - The port number to test
 * @returns Promise resolving to true if port is available, false otherwise
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return defaultManager.isPortAvailable(port);
}

/**
 * Reserve a port to prevent race conditions
 * Uses the default PortManager instance
 * @param port - The port number to reserve
 * @returns true if the port was reserved, false if already reserved
 */
export function reservePort(port: number): boolean {
  return defaultManager.reservePort(port);
}

/**
 * Release a previously reserved port
 * Uses the default PortManager instance
 * @param port - The port number to release
 */
export function releasePort(port: number): void {
  defaultManager.releasePort(port);
}

/**
 * Get the default PortManager instance
 * Useful for advanced operations or accessing the full API
 * @returns The default PortManager instance
 */
export function getDefaultPortManager(): PortManager {
  return defaultManager;
}
