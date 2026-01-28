import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getServiceInfo() {
    return {
      message: 'NexusGen Worker Service is running',
      version: '1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
    };
  }

  ping() {
    return {
      pong: true,
      timestamp: Date.now(),
    };
  }
}
