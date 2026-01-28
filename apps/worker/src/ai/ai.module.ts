import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIOrchestratorService } from './ai-orchestrator.service';
import { GenerationService } from './generation.service';

@Module({
  imports: [ConfigModule],
  providers: [AIOrchestratorService, GenerationService],
  exports: [AIOrchestratorService, GenerationService],
})
export class AIModule {}
