import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIOrchestratorService } from '../ai/ai-orchestrator.service';
import {
  CreateGenerationDto,
  GenerationResponseDto,
  GenerationListResponseDto,
} from './dto';
import {
  Generation,
  GenerationType,
  GenerationStatus,
  GeneratedFile,
  PaginationParams,
} from '../types';

interface FilterOptions {
  projectId?: string;
  status?: string;
}

@Injectable()
export class GenerationsService {
  private readonly logger = new Logger(GenerationsService.name);

  // In-memory store for demo purposes - would use Prisma in production
  private generations: Map<string, Generation> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly aiOrchestrator: AIOrchestratorService,
  ) {
    // Initialize with a demo generation
    const demoGeneration: Generation = {
      id: 'gen_demo_1',
      projectId: 'demo-project-1',
      userId: 'demo-user-id',
      prompt: 'Create a responsive navigation component with dark mode support',
      type: GenerationType.COMPONENT,
      status: GenerationStatus.COMPLETED,
      result: {
        files: [
          {
            path: 'components/Navigation.tsx',
            content: '// Navigation component code...',
            language: 'typescript',
            isNew: true,
          },
        ],
        logs: ['Generation started', 'Analyzing prompt', 'Generating code', 'Complete'],
        tokensUsed: 1500,
        modelUsed: 'gpt-4-turbo-preview',
      },
      metadata: {
        promptTokens: 500,
        completionTokens: 1000,
        totalTokens: 1500,
        modelVersion: 'gpt-4-turbo-preview',
        processingTimeMs: 5000,
      },
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3595000),
    };
    this.generations.set(demoGeneration.id, demoGeneration);
  }

  /**
   * Create a new generation request
   */
  async create(
    userId: string,
    createGenerationDto: CreateGenerationDto,
  ): Promise<GenerationResponseDto> {
    this.logger.log(`Creating generation for user: ${userId}`);

    const generation: Generation = {
      id: this.generateId(),
      projectId: createGenerationDto.projectId,
      userId,
      prompt: createGenerationDto.prompt,
      type: createGenerationDto.type,
      status: GenerationStatus.QUEUED,
      metadata: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        modelVersion: createGenerationDto.modelConfig?.model || 'gpt-4-turbo-preview',
        processingTimeMs: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save generation
    this.generations.set(generation.id, generation);

    // Queue generation job (in production, this would use BullMQ)
    this.processGeneration(generation.id).catch((error) => {
      this.logger.error(`Generation failed: ${error.message}`, error.stack);
    });

    this.logger.log(`Generation queued: ${generation.id}`);

    return this.toGenerationResponse(generation);
  }

  /**
   * Get all generations for a user with filtering and pagination
   */
  async findAll(
    userId: string,
    pagination: PaginationParams,
    filters: FilterOptions,
  ): Promise<GenerationListResponseDto> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    this.logger.log(`Fetching generations for user: ${userId}`);

    // Filter generations
    let userGenerations = Array.from(this.generations.values()).filter(
      (g) => g.userId === userId,
    );

    if (filters.projectId) {
      userGenerations = userGenerations.filter(
        (g) => g.projectId === filters.projectId,
      );
    }

    if (filters.status) {
      userGenerations = userGenerations.filter((g) => g.status === filters.status);
    }

    // Sort
    userGenerations.sort((a, b) => {
      const aValue = a[sortBy as keyof Generation];
      const bValue = b[sortBy as keyof Generation];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    // Paginate
    const total = userGenerations.length;
    const startIndex = (page - 1) * limit;
    const paginatedGenerations = userGenerations.slice(startIndex, startIndex + limit);

    return {
      generations: paginatedGenerations.map((g) => this.toGenerationResponse(g)),
      meta: {
        page,
        limit,
        total,
        hasMore: startIndex + limit < total,
      },
    };
  }

  /**
   * Get a single generation by ID
   */
  async findOne(userId: string, generationId: string): Promise<GenerationResponseDto> {
    const generation = await this.getGenerationWithAuth(userId, generationId);
    return this.toGenerationResponse(generation);
  }

  /**
   * Get generation status
   */
  async getStatus(
    userId: string,
    generationId: string,
  ): Promise<{ id: string; status: GenerationStatus; progress: number; currentStep?: string }> {
    const generation = await this.getGenerationWithAuth(userId, generationId);

    let progress = 0;
    let currentStep: string | undefined;

    switch (generation.status) {
      case GenerationStatus.QUEUED:
        progress = 0;
        currentStep = 'Waiting in queue';
        break;
      case GenerationStatus.PROCESSING:
        progress = 50;
        currentStep = 'Generating code';
        break;
      case GenerationStatus.COMPLETED:
        progress = 100;
        currentStep = 'Complete';
        break;
      case GenerationStatus.FAILED:
        progress = 0;
        currentStep = 'Failed';
        break;
      case GenerationStatus.CANCELLED:
        progress = 0;
        currentStep = 'Cancelled';
        break;
    }

    return {
      id: generation.id,
      status: generation.status,
      progress,
      currentStep,
    };
  }

  /**
   * Cancel a running generation
   */
  async cancel(userId: string, generationId: string): Promise<GenerationResponseDto> {
    const generation = await this.getGenerationWithAuth(userId, generationId);

    if (
      generation.status !== GenerationStatus.QUEUED &&
      generation.status !== GenerationStatus.PROCESSING
    ) {
      throw new ConflictException('Only queued or processing generations can be cancelled');
    }

    generation.status = GenerationStatus.CANCELLED;
    generation.updatedAt = new Date();

    this.generations.set(generation.id, generation);

    this.logger.log(`Generation cancelled: ${generationId}`);

    return this.toGenerationResponse(generation);
  }

  /**
   * Retry a failed generation
   */
  async retry(userId: string, generationId: string): Promise<GenerationResponseDto> {
    const generation = await this.getGenerationWithAuth(userId, generationId);

    if (generation.status !== GenerationStatus.FAILED) {
      throw new ConflictException('Only failed generations can be retried');
    }

    generation.status = GenerationStatus.QUEUED;
    generation.updatedAt = new Date();
    generation.result = undefined;

    this.generations.set(generation.id, generation);

    // Re-queue generation
    this.processGeneration(generation.id).catch((error) => {
      this.logger.error(`Generation retry failed: ${error.message}`, error.stack);
    });

    this.logger.log(`Generation retry queued: ${generationId}`);

    return this.toGenerationResponse(generation);
  }

  /**
   * Get generated files
   */
  async getFiles(
    userId: string,
    generationId: string,
  ): Promise<{ files: GeneratedFile[] }> {
    const generation = await this.getGenerationWithAuth(userId, generationId);

    if (generation.status !== GenerationStatus.COMPLETED) {
      throw new ConflictException('Generation is not completed');
    }

    return {
      files: generation.result?.files || [],
    };
  }

  /**
   * Delete a generation
   */
  async remove(userId: string, generationId: string): Promise<void> {
    await this.getGenerationWithAuth(userId, generationId);
    this.generations.delete(generationId);
    this.logger.log(`Generation deleted: ${generationId}`);
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private async processGeneration(generationId: string): Promise<void> {
    const generation = this.generations.get(generationId);
    if (!generation) return;

    try {
      // Update status to processing
      generation.status = GenerationStatus.PROCESSING;
      generation.updatedAt = new Date();
      this.generations.set(generationId, generation);

      const startTime = Date.now();

      // Process with AI orchestrator
      const result = await this.aiOrchestrator.processGeneration({
        generationId: generation.id,
        projectId: generation.projectId,
        userId: generation.userId,
        prompt: generation.prompt,
        type: generation.type,
        settings: {
          framework: 'NEXTJS' as any,
          styling: 'TAILWIND' as any,
          language: 'typescript',
          features: [],
        },
      });

      const processingTime = Date.now() - startTime;

      // Update generation with results
      generation.status = GenerationStatus.COMPLETED;
      generation.result = result;
      generation.metadata = {
        ...generation.metadata,
        processingTimeMs: processingTime,
        promptTokens: result.tokensUsed * 0.3,
        completionTokens: result.tokensUsed * 0.7,
        totalTokens: result.tokensUsed,
      };
      generation.completedAt = new Date();
      generation.updatedAt = new Date();

      this.generations.set(generationId, generation);

      this.logger.log(`Generation completed: ${generationId} in ${processingTime}ms`);
    } catch (error) {
      generation.status = GenerationStatus.FAILED;
      generation.updatedAt = new Date();
      this.generations.set(generationId, generation);

      this.logger.error(`Generation failed: ${generationId}`, error);
      throw error;
    }
  }

  private async getGenerationWithAuth(
    userId: string,
    generationId: string,
  ): Promise<Generation> {
    const generation = this.generations.get(generationId);

    if (!generation) {
      throw new NotFoundException(`Generation not found: ${generationId}`);
    }

    if (generation.userId !== userId) {
      throw new ForbiddenException('You do not have access to this generation');
    }

    return generation;
  }

  private toGenerationResponse(generation: Generation): GenerationResponseDto {
    return {
      id: generation.id,
      projectId: generation.projectId,
      prompt: generation.prompt,
      type: generation.type,
      status: generation.status,
      result: generation.result,
      metadata: generation.metadata,
      createdAt: generation.createdAt,
      updatedAt: generation.updatedAt,
      completedAt: generation.completedAt,
    };
  }

  private generateId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
