import { Logger } from '@nestjs/common';
import { generateText } from 'ai';
import { getLanguageModel, type AIModelConfig } from '@nexusgen/ai';
import { CODER_SYSTEM_PROMPT } from './prompts/system.prompt';
import {
  type TechnicalSpecification,
  type GeneratedFile,
  type CoderOutput,
  type CodeGenerationContext,
  type ChunkConfig,
  DEFAULT_CHUNK_CONFIG,
} from './types';
import { SandboxFileWriter } from '../../utils/file-writer';

export interface CoderAgentOptions {
  modelConfig?: Partial<AIModelConfig>;
  chunkConfig?: ChunkConfig;
  maxRetries?: number;
}

export class CoderAgent {
  private readonly logger = new Logger(CoderAgent.name);
  private readonly fileWriter: SandboxFileWriter;
  private readonly modelConfig: AIModelConfig;
  private readonly chunkConfig: ChunkConfig;
  private readonly maxRetries: number;

  constructor(
    fileWriter: SandboxFileWriter,
    options: CoderAgentOptions = {},
  ) {
    this.fileWriter = fileWriter;
    this.chunkConfig = options.chunkConfig ?? DEFAULT_CHUNK_CONFIG;
    this.maxRetries = options.maxRetries ?? 3;

    this.modelConfig = {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-latest',
      temperature: 0.2,
      maxTokens: 8192,
      ...options.modelConfig,
    } as AIModelConfig;
  }

  async generate(
    spec: TechnicalSpecification,
    projectId: string,
  ): Promise<CoderOutput> {
    this.logger.log(`Starting code generation for project: ${projectId}`);

    try {
      await this.fileWriter.initializeProject(projectId);

      const context: CodeGenerationContext = { spec };
      const isLargeProject = this.isLargeProject(spec);

      let files: GeneratedFile[];

      if (isLargeProject) {
        this.logger.log('Large project detected, using chunked generation');
        files = await this.generateInChunks(context, projectId);
      } else {
        this.logger.log('Generating all files in single request');
        files = await this.generateAllFiles(context);
      }

      await this.fileWriter.writeFiles(projectId, files);

      const summary = this.generateSummary(files, spec);

      this.logger.log(`Code generation completed: ${files.length} files generated`);

      return {
        files,
        summary,
      };
    } catch (error) {
      this.logger.error(`Code generation failed: ${error}`);
      throw new Error(`Code generation failed: ${(error as Error).message}`);
    }
  }

  private async generateAllFiles(context: CodeGenerationContext): Promise<GeneratedFile[]> {
    const prompt = this.buildPrompt(context.spec);

    const response = await this.callAI(prompt);
    return this.parseFilesFromResponse(response);
  }

  private async generateInChunks(
    context: CodeGenerationContext,
    projectId: string,
  ): Promise<GeneratedFile[]> {
    const allFiles: GeneratedFile[] = [];
    const { priorityOrder } = this.chunkConfig;

    for (const chunkType of priorityOrder) {
      this.logger.log(`Generating ${chunkType} files...`);

      const chunkPrompt = this.buildChunkPrompt(context.spec, chunkType, allFiles);
      const response = await this.callAI(chunkPrompt);
      const chunkFiles = this.parseFilesFromResponse(response);

      if (chunkFiles.length > 0) {
        await this.fileWriter.writeFiles(projectId, chunkFiles);
        allFiles.push(...chunkFiles);
        context.existingFiles = allFiles;
      }
    }

    return allFiles;
  }

  private async callAI(userPrompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`AI call attempt ${attempt}/${this.maxRetries}`);

        const model = getLanguageModel(this.modelConfig);

        const { text } = await generateText({
          model,
          system: CODER_SYSTEM_PROMPT,
          prompt: userPrompt,
          temperature: this.modelConfig.temperature,
          maxTokens: this.modelConfig.maxTokens,
        });

        return text;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`AI call failed (attempt ${attempt}): ${lastError.message}`);

        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`AI call failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  private buildPrompt(spec: TechnicalSpecification): string {
    const sections: string[] = [];

    sections.push(`# Project: ${spec.projectName}`);
    sections.push(`## Description\n${spec.description}`);
    sections.push(`## Technical Summary\n${spec.technicalSummary}`);

    sections.push(`## Project Structure\n${this.formatProjectStructure(spec.projectStructure)}`);

    if (spec.components.length > 0) {
      sections.push(`## Components to Generate\n${this.formatComponents(spec.components)}`);
    }

    if (spec.pages.length > 0) {
      sections.push(`## Pages to Generate\n${this.formatPages(spec.pages)}`);
    }

    if (spec.apiRoutes.length > 0) {
      sections.push(`## API Routes to Generate\n${this.formatApiRoutes(spec.apiRoutes)}`);
    }

    if (spec.dataModels.length > 0) {
      sections.push(`## Data Models\n${this.formatDataModels(spec.dataModels)}`);
    }

    sections.push(`## Dependencies\n${this.formatDependencies(spec.dependencies)}`);

    if (spec.envVariables.length > 0) {
      sections.push(`## Environment Variables\n${this.formatEnvVariables(spec.envVariables)}`);
    }

    if (spec.globalStyles) {
      sections.push(`## Global Styles\n${this.formatGlobalStyles(spec.globalStyles)}`);
    }

    if (spec.implementationNotes && spec.implementationNotes.length > 0) {
      sections.push(`## Implementation Notes\n${spec.implementationNotes.map(n => `- ${n}`).join('\n')}`);
    }

    sections.push(`
Generate all the necessary files for this project. Include:
1. Core configuration files (package.json, tsconfig.json, tailwind.config.ts, next.config.ts, etc.)
2. All specified components with proper TypeScript types
3. All specified pages with proper routing
4. All API routes with proper handlers
5. Any utility functions and hooks needed
6. Type definitions
7. A .env.example file with all required environment variables

Remember to output ONLY the JSON array of files.`);

    return sections.join('\n\n');
  }

  private buildChunkPrompt(
    spec: TechnicalSpecification,
    chunkType: string,
    existingFiles: GeneratedFile[],
  ): string {
    const basePrompt = this.buildPrompt(spec);

    const existingFilesList = existingFiles.length > 0
      ? `\n\n## Already Generated Files\nThe following files have already been generated:\n${existingFiles.map(f => `- ${f.path}`).join('\n')}\n\nDo not regenerate these files.`
      : '';

    const chunkInstructions = this.getChunkInstructions(chunkType, spec);

    return `${basePrompt}${existingFilesList}\n\n## Current Focus: ${chunkType.toUpperCase()}\n${chunkInstructions}`;
  }

  private getChunkInstructions(chunkType: string, spec: TechnicalSpecification): string {
    switch (chunkType) {
      case 'core':
        return `Generate ONLY the core configuration files:
- package.json
- tsconfig.json
- next.config.ts (or equivalent)
- tailwind.config.ts
- postcss.config.js
- src/lib/utils.ts (cn utility)
- .env.example
- Any essential type definitions`;

      case 'components':
        return `Generate ONLY the component files:
${spec.components.map(c => `- ${c.name} (${c.path}): ${c.description}`).join('\n')}
Include proper TypeScript interfaces and exports.`;

      case 'pages':
        return `Generate ONLY the page files:
${spec.pages.map(p => `- ${p.route} (${p.filePath}): ${p.description}`).join('\n')}
Include layout files if specified.`;

      case 'api':
        return spec.apiRoutes.length > 0
          ? `Generate ONLY the API route files:
${spec.apiRoutes.map(r => `- ${r.method} ${r.path}: ${r.description}`).join('\n')}`
          : 'No API routes to generate for this chunk.';

      case 'utils':
        return `Generate any remaining utility files:
- Hooks
- Helper functions
- Constants
- Additional type definitions`;

      default:
        return 'Generate the remaining files not yet created.';
    }
  }

  private formatProjectStructure(structure: TechnicalSpecification['projectStructure']): string {
    const formatNode = (node: typeof structure.root, indent = ''): string => {
      let result = `${indent}${node.name}/`;
      if (node.description) {
        result += ` - ${node.description}`;
      }
      result += '\n';

      for (const child of node.children) {
        if (child.type === 'directory') {
          result += formatNode(child as typeof structure.root, indent + '  ');
        } else {
          result += `${indent}  ${child.name}`;
          if (child.description) {
            result += ` - ${child.description}`;
          }
          result += '\n';
        }
      }

      return result;
    };

    return formatNode(structure.root);
  }

  private formatComponents(components: TechnicalSpecification['components']): string {
    return components.map(c => `
### ${c.name}
- Path: ${c.path}
- Type: ${c.type} component
- Description: ${c.description}
- Props: ${c.props.map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}`).join(', ') || 'None'}
${c.state ? `- State: ${c.state.map(s => `${s.name}: ${s.type}`).join(', ')}` : ''}
${c.eventHandlers ? `- Event Handlers: ${c.eventHandlers.map(e => e.name).join(', ')}` : ''}
${c.dependencies.length > 0 ? `- Uses Components: ${c.dependencies.join(', ')}` : ''}
${c.packageDependencies ? `- Package Dependencies: ${c.packageDependencies.join(', ')}` : ''}`).join('\n');
  }

  private formatPages(pages: TechnicalSpecification['pages']): string {
    return pages.map(p => `
### ${p.route}
- File: ${p.filePath}
- Description: ${p.description}
- Components: ${p.components.join(', ')}
${p.layout ? `- Layout: ${p.layout}` : ''}
${p.dataFetching ? `- Data Fetching: ${p.dataFetching.method} from ${p.dataFetching.source}` : ''}
${p.requiresAuth ? `- Requires Auth: Yes` : ''}
- Metadata: Title: "${p.metadata.title}", Description: "${p.metadata.description}"`).join('\n');
  }

  private formatApiRoutes(routes: TechnicalSpecification['apiRoutes']): string {
    return routes.map(r => `
### ${r.method} ${r.path}
- Description: ${r.description}
- Authentication: ${r.requiresAuth ? 'Required' : 'Not required'}
${r.requestBody ? `- Request Body: ${r.requestBody.contentType} - Fields: ${r.requestBody.schema.fields.map(f => `${f.name}: ${f.type}`).join(', ')}` : ''}
${r.responses.map(res => `- Response ${res.statusCode}: ${res.description}`).join('\n')}`).join('\n');
  }

  private formatDataModels(models: TechnicalSpecification['dataModels']): string {
    return models.map(m => `
### ${m.name}
- Description: ${m.description}
- Fields: ${m.fields.map(f => `${f.name}${f.required ? '' : '?'}: ${f.type}`).join(', ')}
${m.relations ? `- Relations: ${m.relations.map(r => `${r.name} (${r.type}) -> ${r.relatedModel}`).join(', ')}` : ''}`).join('\n');
  }

  private formatDependencies(deps: TechnicalSpecification['dependencies']): string {
    // Handle both array and object formats for backward compatibility
    if (Array.isArray(deps)) {
      // New format: DependencySpec[]
      const production = deps.filter((d) => !d.devDependency);
      const development = deps.filter((d) => d.devDependency);

      return `### Production Dependencies
${production.map((d) => `- ${d.name}@${d.version}: ${d.reason}`).join('\n')}

### Development Dependencies
${development.map((d) => `- ${d.name}@${d.version}: ${d.reason}`).join('\n')}`;
    } else {
      // Legacy format: DependenciesConfig object
      const productionEntries = Object.entries(deps.production || {});
      const developmentEntries = Object.entries(deps.development || {});

      return `### Production Dependencies
${productionEntries.map(([name, version]) => `- ${name}@${version}`).join('\n')}

### Development Dependencies
${developmentEntries.map(([name, version]) => `- ${name}@${version}`).join('\n')}`;
    }
  }

  private formatEnvVariables(vars: TechnicalSpecification['envVariables']): string {
    return vars.map(v => `- ${v.name}${v.required ? ' (required)' : ''}: ${v.description} (e.g., ${v.example})`).join('\n');
  }

  private formatGlobalStyles(styles: NonNullable<TechnicalSpecification['globalStyles']>): string {
    const parts: string[] = [];

    if (styles.darkMode) {
      parts.push(`- Dark Mode: ${styles.darkMode.enabled ? `Enabled (${styles.darkMode.strategy} strategy)` : 'Disabled'}`);
    }

    if (styles.theme?.colors) {
      parts.push(`- Theme Colors: ${styles.theme.colors.map(c => c.name).join(', ')}`);
    }

    if (styles.theme?.typography) {
      parts.push(`- Font Family: ${styles.theme.typography.fontFamily.join(', ')}`);
    }

    if (styles.breakpoints) {
      parts.push(`- Breakpoints: ${Object.entries(styles.breakpoints).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
    }

    return parts.join('\n');
  }

  private parseFilesFromResponse(response: string): GeneratedFile[] {
    try {
      let jsonContent = response.trim();

      const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }

      const arrayMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonContent = arrayMatch[0];
      }

      const parsed = JSON.parse(jsonContent);

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      const files: GeneratedFile[] = [];

      for (const item of parsed) {
        if (typeof item.path !== 'string' || typeof item.content !== 'string') {
          this.logger.warn(`Skipping invalid file entry: ${JSON.stringify(item)}`);
          continue;
        }

        files.push({
          path: item.path,
          content: item.content,
        });
      }

      this.logger.log(`Parsed ${files.length} files from AI response`);
      return files;
    } catch (error) {
      this.logger.error(`Failed to parse AI response: ${error}`);
      this.logger.debug(`Response content: ${response.substring(0, 500)}...`);
      throw new Error(`Failed to parse generated files: ${(error as Error).message}`);
    }
  }

  private isLargeProject(spec: TechnicalSpecification): boolean {
    const totalItems =
      spec.components.length +
      spec.pages.length +
      spec.apiRoutes.length +
      spec.dataModels.length;

    return totalItems > this.chunkConfig.maxFilesPerChunk;
  }

  private generateSummary(files: GeneratedFile[], spec: TechnicalSpecification): string {
    const filesByType = this.categorizeFiles(files);

    return `Generated ${files.length} files for ${spec.projectName}:
- Configuration: ${filesByType.config.length} files
- Components: ${filesByType.components.length} files
- Pages: ${filesByType.pages.length} files
- API Routes: ${filesByType.api.length} files
- Utilities: ${filesByType.utils.length} files
- Types: ${filesByType.types.length} files
- Other: ${filesByType.other.length} files`;
  }

  private categorizeFiles(files: GeneratedFile[]): Record<string, GeneratedFile[]> {
    const categories: Record<string, GeneratedFile[]> = {
      config: [],
      components: [],
      pages: [],
      api: [],
      utils: [],
      types: [],
      other: [],
    };

    for (const file of files) {
      const path = file.path.toLowerCase();

      if (path.match(/\.(json|config\.|rc\.)/) || path.includes('tsconfig') || path.includes('tailwind')) {
        categories.config.push(file);
      } else if (path.includes('/components/') || path.includes('component')) {
        categories.components.push(file);
      } else if (path.includes('/app/') || path.includes('/pages/') || path.includes('page.tsx')) {
        categories.pages.push(file);
      } else if (path.includes('/api/') || path.includes('route.ts')) {
        categories.api.push(file);
      } else if (path.includes('/lib/') || path.includes('/utils/') || path.includes('/hooks/')) {
        categories.utils.push(file);
      } else if (path.includes('/types/') || path.includes('.d.ts') || path.includes('types.ts')) {
        categories.types.push(file);
      } else {
        categories.other.push(file);
      }
    }

    return categories;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createCoderAgent(
  fileWriter: SandboxFileWriter,
  options?: CoderAgentOptions,
): CoderAgent {
  return new CoderAgent(fileWriter, options);
}
