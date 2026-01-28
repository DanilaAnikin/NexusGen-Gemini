import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
    memory: MemoryCheck;
  };
}

interface CheckResult {
  status: 'up' | 'down' | 'unknown';
  latency?: number;
  message?: string;
}

interface MemoryCheck {
  status: 'up' | 'down';
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startTime: number;

  constructor(private readonly configService: ConfigService) {
    this.startTime = Date.now();
  }

  @Get()
  @ApiOperation({ summary: 'Comprehensive health check' })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
  })
  async check(): Promise<HealthCheckResult> {
    const memoryUsage = process.memoryUsage();

    // Database health check (placeholder - would connect to actual DB)
    const dbCheck = await this.checkDatabase();

    // Redis health check (placeholder - would connect to actual Redis)
    const redisCheck = await this.checkRedis();

    // Memory check
    const memoryCheck: MemoryCheck = {
      status: 'up',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
    };

    // Determine overall status
    const allUp = dbCheck.status === 'up' && redisCheck.status === 'up';
    const anyDown = dbCheck.status === 'down' || redisCheck.status === 'down';

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (allUp) {
      overallStatus = 'healthy';
    } else if (anyDown) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      checks: {
        database: dbCheck,
        redis: redisCheck,
        memory: memoryCheck,
      },
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Kubernetes liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Kubernetes readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  async readiness() {
    // In production, check if all dependencies are ready
    const dbCheck = await this.checkDatabase();
    const redisCheck = await this.checkRedis();

    const isReady = dbCheck.status !== 'down' && redisCheck.status !== 'down';

    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbCheck.status,
        redis: redisCheck.status,
      },
    };
  }

  private async checkDatabase(): Promise<CheckResult> {
    // Placeholder for actual database health check
    // In production, this would execute a simple query like SELECT 1
    try {
      const start = Date.now();
      // Simulate DB check - replace with actual Prisma health check
      await new Promise((resolve) => setTimeout(resolve, 1));
      const latency = Date.now() - start;

      return {
        status: 'up',
        latency,
        message: 'Database connection healthy',
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }

  private async checkRedis(): Promise<CheckResult> {
    // Placeholder for actual Redis health check
    // In production, this would execute PING command
    try {
      const start = Date.now();
      // Simulate Redis check - replace with actual Redis PING
      await new Promise((resolve) => setTimeout(resolve, 1));
      const latency = Date.now() - start;

      return {
        status: 'up',
        latency,
        message: 'Redis connection healthy',
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Redis connection failed',
      };
    }
  }
}
