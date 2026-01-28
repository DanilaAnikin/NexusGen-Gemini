import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import {
  GenerationType,
  GenerationStatus,
  GenerationResult,
  GenerationMetadata,
  AIModelConfig,
  ApiMeta,
} from '../../types';

export class ModelConfigDto {
  @ApiPropertyOptional({
    example: 'gpt-4-turbo-preview',
    description: 'AI model to use',
  })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({
    example: 0.7,
    description: 'Temperature for generation (0-2)',
  })
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({
    example: 4096,
    description: 'Maximum tokens for response',
  })
  @IsOptional()
  maxTokens?: number;
}

export class CreateGenerationDto {
  @ApiProperty({
    example: 'proj_123456789',
    description: 'Project ID to generate code for',
  })
  @IsString()
  projectId: string;

  @ApiProperty({
    example: 'Create a responsive navigation component with dark mode toggle',
    description: 'Prompt describing what to generate',
    minLength: 10,
    maxLength: 10000,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  prompt: string;

  @ApiProperty({
    enum: GenerationType,
    example: GenerationType.COMPONENT,
    description: 'Type of code to generate',
  })
  @IsEnum(GenerationType)
  type: GenerationType;

  @ApiPropertyOptional({
    type: ModelConfigDto,
    description: 'AI model configuration overrides',
  })
  @IsObject()
  @IsOptional()
  modelConfig?: Partial<AIModelConfig>;

  @ApiPropertyOptional({
    example: { targetPath: 'src/components' },
    description: 'Additional context for generation',
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, unknown>;
}

export class GenerationResponseDto {
  @ApiProperty({
    example: 'gen_123456789',
    description: 'Generation ID',
  })
  id: string;

  @ApiProperty({
    example: 'proj_123456789',
    description: 'Project ID',
  })
  projectId: string;

  @ApiProperty({
    example: 'Create a responsive navigation component',
    description: 'Original prompt',
  })
  prompt: string;

  @ApiProperty({
    enum: GenerationType,
    example: GenerationType.COMPONENT,
    description: 'Generation type',
  })
  type: GenerationType;

  @ApiProperty({
    enum: GenerationStatus,
    example: GenerationStatus.COMPLETED,
    description: 'Current status',
  })
  status: GenerationStatus;

  @ApiPropertyOptional({
    description: 'Generation result (when completed)',
  })
  result?: GenerationResult;

  @ApiProperty({
    description: 'Generation metadata',
  })
  metadata: GenerationMetadata;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:05.000Z',
    description: 'Completion date',
  })
  completedAt?: Date;
}

export class GenerationListResponseDto {
  @ApiProperty({
    type: [GenerationResponseDto],
    description: 'List of generations',
  })
  generations: GenerationResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: ApiMeta;
}
