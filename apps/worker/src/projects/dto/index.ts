import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  IsObject,
} from 'class-validator';
import {
  Framework,
  StylingOption,
  ProjectStatus,
  ProjectSettings,
  ApiMeta,
} from '../../types';

export class CreateProjectDto {
  @ApiProperty({
    example: 'My Awesome Project',
    description: 'Project name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'A web application for managing tasks',
    description: 'Project description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: Framework,
    example: Framework.NEXTJS,
    description: 'Frontend framework',
  })
  @IsEnum(Framework)
  framework: Framework;

  @ApiProperty({
    enum: StylingOption,
    example: StylingOption.TAILWIND,
    description: 'CSS/styling solution',
  })
  @IsEnum(StylingOption)
  styling: StylingOption;

  @ApiPropertyOptional({
    enum: ['typescript', 'javascript'],
    example: 'typescript',
    description: 'Programming language (default: typescript)',
  })
  @IsString()
  @IsOptional()
  language?: 'typescript' | 'javascript';

  @ApiPropertyOptional({
    example: ['auth', 'api', 'database'],
    description: 'Additional features to include',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({
    example: { customKey: 'customValue' },
    description: 'Custom configuration options',
  })
  @IsObject()
  @IsOptional()
  customConfig?: Record<string, unknown>;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Updated Project Name',
    description: 'Project name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'Updated project description',
    description: 'Project description',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: Framework,
    example: Framework.REACT,
    description: 'Frontend framework',
  })
  @IsEnum(Framework)
  @IsOptional()
  framework?: Framework;

  @ApiPropertyOptional({
    enum: StylingOption,
    example: StylingOption.CSS_MODULES,
    description: 'CSS/styling solution',
  })
  @IsEnum(StylingOption)
  @IsOptional()
  styling?: StylingOption;

  @ApiPropertyOptional({
    enum: ['typescript', 'javascript'],
    example: 'typescript',
    description: 'Programming language',
  })
  @IsString()
  @IsOptional()
  language?: 'typescript' | 'javascript';

  @ApiPropertyOptional({
    example: ['auth', 'api', 'database', 'testing'],
    description: 'Additional features',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({
    example: { customKey: 'customValue' },
    description: 'Custom configuration options',
  })
  @IsObject()
  @IsOptional()
  customConfig?: Record<string, unknown>;
}

export class ProjectResponseDto {
  @ApiProperty({
    example: 'proj_123456789',
    description: 'Project ID',
  })
  id: string;

  @ApiProperty({
    example: 'My Awesome Project',
    description: 'Project name',
  })
  name: string;

  @ApiPropertyOptional({
    example: 'A web application for managing tasks',
    description: 'Project description',
  })
  description?: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
    description: 'Project status',
  })
  status: ProjectStatus;

  @ApiProperty({
    description: 'Project settings and configuration',
  })
  settings: ProjectSettings;

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
}

export class ProjectListResponseDto {
  @ApiProperty({
    type: [ProjectResponseDto],
    description: 'List of projects',
  })
  projects: ProjectResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  meta: ApiMeta;
}
