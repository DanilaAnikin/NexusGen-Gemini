import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { GenerationsService } from './generations.service';
import {
  CreateGenerationDto,
  GenerationResponseDto,
  GenerationListResponseDto,
} from './dto';
import { PaginationParams } from '../types';

@ApiTags('generations')
@ApiBearerAuth('JWT-auth')
@Controller('generations')
export class GenerationsController {
  constructor(private readonly generationsService: GenerationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a new code generation' })
  @ApiResponse({
    status: 201,
    description: 'Generation started successfully',
    type: GenerationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async create(
    @Body() createGenerationDto: CreateGenerationDto,
  ): Promise<GenerationResponseDto> {
    const userId = 'demo-user-id';
    return this.generationsService.create(userId, createGenerationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all generations for current user' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    type: String,
    description: 'Filter by project ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of generations',
    type: GenerationListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query() pagination: PaginationParams,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ): Promise<GenerationListResponseDto> {
    const userId = 'demo-user-id';
    return this.generationsService.findAll(userId, pagination, { projectId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a generation by ID' })
  @ApiParam({ name: 'id', description: 'Generation ID' })
  @ApiResponse({
    status: 200,
    description: 'Generation details',
    type: GenerationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Generation not found' })
  async findOne(@Param('id') id: string): Promise<GenerationResponseDto> {
    const userId = 'demo-user-id';
    return this.generationsService.findOne(userId, id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get generation status' })
  @ApiParam({ name: 'id', description: 'Generation ID' })
  @ApiResponse({
    status: 200,
    description: 'Generation status',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        progress: { type: 'number' },
        currentStep: { type: 'string' },
      },
    },
  })
  async getStatus(@Param('id') id: string) {
    const userId = 'demo-user-id';
    return this.generationsService.getStatus(userId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a running generation' })
  @ApiParam({ name: 'id', description: 'Generation ID' })
  @ApiResponse({
    status: 200,
    description: 'Generation cancelled',
    type: GenerationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Generation not found' })
  @ApiResponse({ status: 409, description: 'Generation cannot be cancelled' })
  async cancel(@Param('id') id: string): Promise<GenerationResponseDto> {
    const userId = 'demo-user-id';
    return this.generationsService.cancel(userId, id);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry a failed generation' })
  @ApiParam({ name: 'id', description: 'Generation ID' })
  @ApiResponse({
    status: 200,
    description: 'Generation retry started',
    type: GenerationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Generation not found' })
  @ApiResponse({ status: 409, description: 'Generation cannot be retried' })
  async retry(@Param('id') id: string): Promise<GenerationResponseDto> {
    const userId = 'demo-user-id';
    return this.generationsService.retry(userId, id);
  }

  @Get(':id/files')
  @ApiOperation({ summary: 'Get generated files' })
  @ApiParam({ name: 'id', description: 'Generation ID' })
  @ApiResponse({
    status: 200,
    description: 'List of generated files',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Generation not found' })
  async getFiles(@Param('id') id: string) {
    const userId = 'demo-user-id';
    return this.generationsService.getFiles(userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a generation' })
  @ApiParam({ name: 'id', description: 'Generation ID' })
  @ApiResponse({ status: 204, description: 'Generation deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Generation not found' })
  async remove(@Param('id') id: string): Promise<void> {
    const userId = 'demo-user-id';
    await this.generationsService.remove(userId, id);
  }
}
