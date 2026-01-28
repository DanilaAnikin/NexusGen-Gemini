import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponseDto,
  ProjectListResponseDto,
} from './dto';
import { Project, ProjectStatus, PaginationParams } from '../types';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  // In-memory store for demo purposes - would use Prisma in production
  private projects: Map<string, Project> = new Map();

  constructor(private readonly configService: ConfigService) {
    // Initialize with a demo project
    const demoProject: Project = {
      id: 'demo-project-1',
      name: 'Demo Project',
      description: 'A demonstration project for NexusGen AI',
      userId: 'demo-user-id',
      status: ProjectStatus.ACTIVE,
      settings: {
        framework: 'NEXTJS' as any,
        styling: 'TAILWIND' as any,
        language: 'typescript',
        features: ['auth', 'api', 'database'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.projects.set(demoProject.id, demoProject);
  }

  /**
   * Create a new project
   */
  async create(
    userId: string,
    createProjectDto: CreateProjectDto,
  ): Promise<ProjectResponseDto> {
    this.logger.log(`Creating project for user: ${userId}`);

    const project: Project = {
      id: this.generateId(),
      name: createProjectDto.name,
      description: createProjectDto.description,
      userId,
      status: ProjectStatus.DRAFT,
      settings: {
        framework: createProjectDto.framework,
        styling: createProjectDto.styling,
        language: createProjectDto.language || 'typescript',
        features: createProjectDto.features || [],
        customConfig: createProjectDto.customConfig,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save project (placeholder - would use Prisma)
    this.projects.set(project.id, project);

    this.logger.log(`Project created: ${project.id}`);

    return this.toProjectResponse(project);
  }

  /**
   * Get all projects for a user with pagination
   */
  async findAll(
    userId: string,
    pagination: PaginationParams,
  ): Promise<ProjectListResponseDto> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;

    this.logger.log(`Fetching projects for user: ${userId}, page: ${page}`);

    // Filter projects by user (placeholder - would use Prisma)
    let userProjects = Array.from(this.projects.values()).filter(
      (p) => p.userId === userId && p.status !== ProjectStatus.DELETED,
    );

    // Sort projects
    userProjects.sort((a, b) => {
      const aValue = a[sortBy as keyof Project];
      const bValue = b[sortBy as keyof Project];

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    // Paginate
    const total = userProjects.length;
    const startIndex = (page - 1) * limit;
    const paginatedProjects = userProjects.slice(startIndex, startIndex + limit);

    return {
      projects: paginatedProjects.map((p) => this.toProjectResponse(p)),
      meta: {
        page,
        limit,
        total,
        hasMore: startIndex + limit < total,
      },
    };
  }

  /**
   * Get a single project by ID
   */
  async findOne(userId: string, projectId: string): Promise<ProjectResponseDto> {
    this.logger.log(`Fetching project: ${projectId} for user: ${userId}`);

    const project = await this.getProjectWithAuth(userId, projectId);
    return this.toProjectResponse(project);
  }

  /**
   * Update a project
   */
  async update(
    userId: string,
    projectId: string,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    this.logger.log(`Updating project: ${projectId} for user: ${userId}`);

    const project = await this.getProjectWithAuth(userId, projectId);

    // Update fields
    if (updateProjectDto.name) {
      project.name = updateProjectDto.name;
    }
    if (updateProjectDto.description !== undefined) {
      project.description = updateProjectDto.description;
    }
    if (updateProjectDto.framework) {
      project.settings.framework = updateProjectDto.framework;
    }
    if (updateProjectDto.styling) {
      project.settings.styling = updateProjectDto.styling;
    }
    if (updateProjectDto.language) {
      project.settings.language = updateProjectDto.language;
    }
    if (updateProjectDto.features) {
      project.settings.features = updateProjectDto.features;
    }
    if (updateProjectDto.customConfig) {
      project.settings.customConfig = {
        ...project.settings.customConfig,
        ...updateProjectDto.customConfig,
      };
    }

    project.updatedAt = new Date();

    // Save (placeholder - would use Prisma)
    this.projects.set(project.id, project);

    this.logger.log(`Project updated: ${project.id}`);

    return this.toProjectResponse(project);
  }

  /**
   * Delete a project (soft delete)
   */
  async remove(userId: string, projectId: string): Promise<void> {
    this.logger.log(`Deleting project: ${projectId} for user: ${userId}`);

    const project = await this.getProjectWithAuth(userId, projectId);

    project.status = ProjectStatus.DELETED;
    project.updatedAt = new Date();

    this.projects.set(project.id, project);

    this.logger.log(`Project deleted: ${project.id}`);
  }

  /**
   * Archive a project
   */
  async archive(userId: string, projectId: string): Promise<ProjectResponseDto> {
    this.logger.log(`Archiving project: ${projectId} for user: ${userId}`);

    const project = await this.getProjectWithAuth(userId, projectId);

    project.status = ProjectStatus.ARCHIVED;
    project.updatedAt = new Date();

    this.projects.set(project.id, project);

    this.logger.log(`Project archived: ${project.id}`);

    return this.toProjectResponse(project);
  }

  /**
   * Restore an archived project
   */
  async restore(userId: string, projectId: string): Promise<ProjectResponseDto> {
    this.logger.log(`Restoring project: ${projectId} for user: ${userId}`);

    const project = await this.getProjectWithAuth(userId, projectId);

    project.status = ProjectStatus.ACTIVE;
    project.updatedAt = new Date();

    this.projects.set(project.id, project);

    this.logger.log(`Project restored: ${project.id}`);

    return this.toProjectResponse(project);
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private async getProjectWithAuth(
    userId: string,
    projectId: string,
  ): Promise<Project> {
    const project = this.projects.get(projectId);

    if (!project || project.status === ProjectStatus.DELETED) {
      throw new NotFoundException(`Project not found: ${projectId}`);
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  private toProjectResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      settings: project.settings,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  private generateId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
