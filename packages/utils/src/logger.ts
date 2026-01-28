/**
 * @nexusgen/utils - Logging utility
 * Structured logging for NexusGen AI platform
 */

// ============ Types ============

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: ErrorInfo;
  traceId?: string;
  spanId?: string;
}

export interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  cause?: ErrorInfo;
}

export interface LoggerConfig {
  level: LogLevel;
  context?: string;
  format: 'json' | 'pretty';
  includeTimestamp: boolean;
  includeLevel: boolean;
  colorize: boolean;
  traceId?: string;
}

export interface LogTransport {
  log(entry: LogEntry): void;
}

// ============ Constants ============

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
};

const RESET_COLOR = '\x1b[0m';

// ============ Console Transport ============

class ConsoleTransport implements LogTransport {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  log(entry: LogEntry): void {
    if (this.config.format === 'json') {
      this.logJson(entry);
    } else {
      this.logPretty(entry);
    }
  }

  private logJson(entry: LogEntry): void {
    const output = JSON.stringify(entry);
    this.writeToConsole(entry.level, output);
  }

  private logPretty(entry: LogEntry): void {
    const parts: string[] = [];

    // Timestamp
    if (this.config.includeTimestamp) {
      const time = new Date(entry.timestamp).toLocaleTimeString();
      parts.push(this.colorize(`[${time}]`, '\x1b[90m')); // Gray
    }

    // Level
    if (this.config.includeLevel) {
      const levelStr = entry.level.toUpperCase().padEnd(5);
      parts.push(this.colorize(levelStr, LEVEL_COLORS[entry.level]));
    }

    // Context
    if (entry.context) {
      parts.push(this.colorize(`[${entry.context}]`, '\x1b[34m')); // Blue
    }

    // Trace ID
    if (entry.traceId) {
      parts.push(this.colorize(`(${entry.traceId.slice(0, 8)})`, '\x1b[90m'));
    }

    // Message
    parts.push(entry.message);

    // Data
    if (entry.data && Object.keys(entry.data).length > 0) {
      parts.push(this.colorize(JSON.stringify(entry.data), '\x1b[90m'));
    }

    const output = parts.join(' ');
    this.writeToConsole(entry.level, output);

    // Error stack
    if (entry.error?.stack) {
      this.writeToConsole(entry.level, this.colorize(entry.error.stack, '\x1b[90m'));
    }
  }

  private colorize(text: string, color: string): string {
    if (!this.config.colorize) {
      return text;
    }
    return `${color}${text}${RESET_COLOR}`;
  }

  private writeToConsole(level: LogLevel, message: string): void {
    switch (level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'fatal':
        console.error(message);
        break;
    }
  }
}

// ============ Logger Class ============

export class Logger {
  private config: LoggerConfig;
  private transports: LogTransport[];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? 'info',
      context: config.context,
      format: config.format ?? 'pretty',
      includeTimestamp: config.includeTimestamp ?? true,
      includeLevel: config.includeLevel ?? true,
      colorize: config.colorize ?? this.isColorSupported(),
      traceId: config.traceId,
    };

    this.transports = [new ConsoleTransport(this.config)];
  }

  private isColorSupported(): boolean {
    // Check if we're in a TTY environment
    if (typeof process !== 'undefined' && process.stdout) {
      return process.stdout.isTTY ?? false;
    }
    return false;
  }

  /**
   * Add a custom transport
   */
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string, data?: Record<string, unknown>): Logger {
    const childLogger = new Logger({
      ...this.config,
      context: this.config.context
        ? `${this.config.context}:${context}`
        : context,
    });

    if (data) {
      // Store default data for child logger
      const originalLog = childLogger.log.bind(childLogger);
      childLogger.log = (level: LogLevel, message: string, logData?: Record<string, unknown>) => {
        originalLog(level, message, { ...data, ...logData });
      };
    }

    return childLogger;
  }

  /**
   * Set the trace ID for distributed tracing
   */
  setTraceId(traceId: string): void {
    this.config.traceId = traceId;
  }

  /**
   * Check if a log level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!this.isLevelEnabled(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.config.context,
      traceId: this.config.traceId,
    };

    if (data && Object.keys(data).length > 0) {
      entry.data = data;
    }

    if (error) {
      entry.error = this.serializeError(error);
    }

    for (const transport of this.transports) {
      try {
        transport.log(entry);
      } catch {
        // Silently fail for transport errors
      }
    }
  }

  /**
   * Serialize an error object
   */
  private serializeError(error: Error): ErrorInfo {
    const info: ErrorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Handle custom error properties
    if ('code' in error && typeof error.code === 'string') {
      info.code = error.code;
    }

    // Handle error cause
    if ('cause' in error && error.cause instanceof Error) {
      info.cause = this.serializeError(error.cause);
    }

    return info;
  }

  /**
   * Log at debug level
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  /**
   * Log at info level
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  /**
   * Log at warn level
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  /**
   * Log at error level
   */
  error(message: string, error?: Error | Record<string, unknown>, data?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.log('error', message, data, error);
    } else {
      this.log('error', message, { ...error, ...data });
    }
  }

  /**
   * Log at fatal level
   */
  fatal(message: string, error?: Error | Record<string, unknown>, data?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.log('fatal', message, data, error);
    } else {
      this.log('fatal', message, { ...error, ...data });
    }
  }

  /**
   * Time an operation and log its duration
   */
  time<T>(label: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed`, error instanceof Error ? error : undefined, {
        duration: `${duration.toFixed(2)}ms`,
      });
      throw error;
    }
  }

  /**
   * Time an async operation and log its duration
   */
  async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed`, error instanceof Error ? error : undefined, {
        duration: `${duration.toFixed(2)}ms`,
      });
      throw error;
    }
  }
}

// ============ Default Logger Instance ============

/**
 * Create a logger instance
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

/**
 * Default logger instance
 */
export const logger = createLogger({
  level: (process.env['LOG_LEVEL'] as LogLevel) ?? 'info',
  format: process.env['NODE_ENV'] === 'production' ? 'json' : 'pretty',
});

// Export default for convenience
export default logger;
