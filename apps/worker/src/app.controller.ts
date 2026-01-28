import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint - basic health check' })
  @ApiResponse({
    status: 200,
    description: 'Service is running',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'NexusGen Worker Service is running' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
      },
    },
  })
  getRoot() {
    return this.appService.getServiceInfo();
  }

  @Get('ping')
  @ApiOperation({ summary: 'Ping endpoint for quick health check' })
  @ApiResponse({
    status: 200,
    description: 'Pong response',
    schema: {
      type: 'object',
      properties: {
        pong: { type: 'boolean', example: true },
        timestamp: { type: 'number', example: 1704067200000 },
      },
    },
  })
  ping() {
    return this.appService.ping();
  }
}
