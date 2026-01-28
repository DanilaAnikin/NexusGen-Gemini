import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenerationsController } from './generations.controller';
import { GenerationsService } from './generations.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [ConfigModule, AIModule],
  controllers: [GenerationsController],
  providers: [GenerationsService],
  exports: [GenerationsService],
})
export class GenerationsModule {}
