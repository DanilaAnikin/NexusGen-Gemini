import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { GenerationsModule } from './generations/generations.module';
import { AIModule } from './ai/ai.module';
import { QueuesModule } from './queues/queues.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration module - loads environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
      expandVariables: true,
    }),

    // Feature modules
    HealthModule,
    AuthModule,
    ProjectsModule,
    GenerationsModule,
    AIModule,
    QueuesModule,
    WebsocketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
