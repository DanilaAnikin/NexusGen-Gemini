import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  GenerationJobData,
  GenerationResult,
} from '../types/generation.types';
import { GeneratedFile } from '@nexusgen/types';
import {
  type AIModelConfig,
  DEFAULT_MODEL_CONFIGS,
} from '@nexusgen/ai';

// Import agents from the agents directory
import {
  ArchitectAgent,
  CoderAgent,
  type TechnicalSpecification,
  type UploadedAsset,
} from '../agents';

// Import file writer from utils
import { SandboxFileWriter } from '../utils';

// Import Docker service for build validation
import { DockerService } from '../services/docker.service';

/**
 * Healing context for tracking self-healing attempts
 */
export interface HealingContext {
  /** Current attempt number (1-indexed) */
  attempt: number;
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Array of error logs from previous build attempts */
  previousErrors: string[];
  /** Array of file paths that have been fixed */
  fixedFiles: string[];
}

/**
 * Extended generation result with healing information
 */
export interface HealingGenerationResult extends GenerationResult {
  /** Number of healing attempts made */
  healingAttempts?: number;
  /** Whether healing was successful after failures */
  healingSucceeded?: boolean;
  /** Array of errors encountered during healing */
  healingErrors?: string[];
}

/**
 * Generation Service
 *
 * Orchestrates the code generation process by coordinating
 * the ArchitectAgent and CoderAgent.
 */
@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);
  private readonly architectAgent: ArchitectAgent;
  private readonly coderAgent: CoderAgent;
  private readonly fileWriter: SandboxFileWriter;
  private readonly dockerService: DockerService;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Get AI provider configuration from environment
    const provider = this.configService.get<string>('AI_PROVIDER', 'anthropic') as 'openai' | 'anthropic' | 'google';
    const model = this.configService.get<string>('AI_MODEL', DEFAULT_MODEL_CONFIGS[provider].model);
    const temperature = this.configService.get<number>('AI_TEMPERATURE', 0.7);
    const maxTokens = this.configService.get<number>('AI_MAX_TOKENS', 8192);

    // Build the model configuration
    const modelConfig: AIModelConfig = {
      provider,
      model,
      temperature,
      maxTokens,
    };

    // Initialize the sandbox file writer
    const sandboxBasePath = this.configService.get<string>(
      'SANDBOX_BASE_PATH',
      '/tmp/nexusgen-builds'
    );
    this.fileWriter = new SandboxFileWriter({ basePath: sandboxBasePath });

    // Initialize the Architect Agent with model configuration
    this.architectAgent = new ArchitectAgent({
      modelConfig,
      maxRetries: 3,
      verbose: this.configService.get<boolean>('DEBUG', false),
    });

    // Initialize the Coder Agent with file writer and model configuration
    this.coderAgent = new CoderAgent(this.fileWriter, {
      modelConfig,
      maxRetries: 3,
    });

    // Initialize the Docker service for build validation
    this.dockerService = new DockerService(this.configService);

    this.logger.log(
      `GenerationService initialized with ${provider}/${model}`,
    );
  }

  /**
   * Process a generation job
   */
  async processGeneration(jobData: GenerationJobData): Promise<GenerationResult> {
    const { projectId, prompt, assets, userId, settings } = jobData;

    this.logger.log(`Starting generation for project: ${projectId}`);

    try {
      // Convert asset strings to UploadedAsset format if provided
      const uploadedAssets: UploadedAsset[] | undefined = assets?.map((url, index) => ({
        id: `asset-${index}`,
        filename: url.split('/').pop() || `asset-${index}`,
        mimeType: 'application/octet-stream', // Will be determined by actual file
        url,
      }));

      // Step 1: Architect Agent analyzes the prompt and creates a technical specification
      this.logger.log('Running Architect Agent to create technical specification...');
      const architectResponse = await this.architectAgent.analyze(prompt, uploadedAssets);

      if (!architectResponse.success || !architectResponse.specification) {
        throw new Error(
          architectResponse.error?.message || 'Architect Agent failed to create specification'
        );
      }

      const spec = architectResponse.specification;
      this.logger.log(
        `Technical specification created: "${spec.projectName}" with ${spec.components.length} components, ${spec.pages.length} pages`,
      );

      // Step 2: Coder Agent generates the code files
      this.logger.log('Running Coder Agent to generate code files...');
      const coderOutput = await this.coderAgent.generate(spec, projectId);

      // Convert GeneratedFile format from coder agent to the expected format
      const files: GeneratedFile[] = coderOutput.files.map((file) => ({
        path: file.path,
        content: file.content,
        language: this.getLanguageFromPath(file.path),
        isNew: true,
      }));

      const sandboxPath = this.fileWriter.getProjectPath(projectId);
      this.logger.log(`Generated ${files.length} files to sandbox: ${sandboxPath}`);

      return {
        success: true,
        spec,
        files,
        sandboxPath,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = error instanceof Error ? { stack: error.stack } : {};

      this.logger.error(`Generation failed for project ${projectId}: ${errorMessage}`, error);

      return {
        success: false,
        error: errorMessage,
        errorDetails,
      };
    }
  }

  /**
   * Get programming language from file path
   */
  private getLanguageFromPath(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      json: 'json',
      css: 'css',
      scss: 'scss',
      html: 'html',
      md: 'markdown',
      yaml: 'yaml',
      yml: 'yaml',
    };
    return languageMap[ext || ''] || 'text';
  }

  /**
   * Clean up a project's sandbox
   */
  async cleanupSandbox(projectId: string): Promise<void> {
    await this.fileWriter.cleanup(projectId);
  }

  /**
   * Get the sandbox path for a project
   */
  getSandboxPath(projectId: string): string {
    return this.fileWriter.getProjectPath(projectId);
  }

  /**
   * Generate code with self-healing capabilities
   *
   * This method wraps the standard generation process with automatic
   * error detection and correction. If the Docker build fails, it will
   * attempt to fix the code by passing the error log back to the CoderAgent.
   *
   * @param jobData - The generation job data
   * @param maxRetries - Maximum number of healing attempts (default: 3)
   * @returns Generation result with healing metadata
   */
  async generateWithHealing(
    jobData: GenerationJobData,
    maxRetries: number = 3,
  ): Promise<HealingGenerationResult> {
    const { projectId } = jobData;

    this.logger.log(`Starting generation with self-healing for project: ${projectId}`);
    this.emitProgress(projectId, 'generating', 0, 'Starting code generation with self-healing enabled');

    // Initialize healing context
    const healingContext: HealingContext = {
      attempt: 0,
      maxRetries,
      previousErrors: [],
      fixedFiles: [],
    };

    // Step 1: Run initial generation
    const initialResult = await this.processGeneration(jobData);

    if (!initialResult.success) {
      // Generation itself failed, no healing possible
      return {
        ...initialResult,
        healingAttempts: 0,
        healingSucceeded: false,
        healingErrors: [initialResult.error || 'Generation failed'],
      };
    }

    // Store the specification for potential fixes
    const spec = initialResult.spec!;
    const sandboxPath = initialResult.sandboxPath!;
    let currentFiles = initialResult.files!;

    // Step 2: Attempt to build and validate
    this.emitProgress(projectId, 'validating', 50, 'Building Docker image to validate generated code');

    let buildResult = await this.buildAndValidate(projectId, sandboxPath);

    // If build succeeds on first try, return immediately
    if (buildResult.success) {
      this.logger.log(`Build succeeded on first attempt for project: ${projectId}`);
      this.emitProgress(projectId, 'validating', 100, 'Build successful - no healing needed');

      return {
        ...initialResult,
        healingAttempts: 0,
        healingSucceeded: true,
      };
    }

    // Step 3: Enter healing loop
    this.logger.log(`Build failed for project ${projectId}, entering healing loop`);
    healingContext.previousErrors.push(buildResult.errorLog || 'Unknown build error');

    while (healingContext.attempt < maxRetries) {
      healingContext.attempt++;

      this.logger.log(
        `Healing attempt ${healingContext.attempt}/${maxRetries} for project: ${projectId}`,
      );

      this.emitProgress(
        projectId,
        'validating',
        50 + (healingContext.attempt * 15),
        `Healing attempt ${healingContext.attempt}/${maxRetries}: Analyzing error and fixing code`,
      );

      try {
        // Attempt to fix the code based on the error
        const fixedFiles = await this.attemptFix(
          projectId,
          buildResult.errorLog || 'Build failed with unknown error',
          spec,
          healingContext,
        );

        if (fixedFiles.length === 0) {
          this.logger.warn(`No files were fixed in attempt ${healingContext.attempt}`);
          healingContext.previousErrors.push('AI could not determine which files to fix');
          continue;
        }

        // Track which files were fixed
        healingContext.fixedFiles.push(...fixedFiles.map(f => f.path));

        // Write the fixed files to the sandbox
        await this.fileWriter.writeFiles(projectId, fixedFiles);

        // Update current files with fixes
        currentFiles = this.mergeFiles(currentFiles, fixedFiles);

        this.logger.log(
          `Fixed ${fixedFiles.length} files in attempt ${healingContext.attempt}`,
        );

        // Attempt build again
        this.emitProgress(
          projectId,
          'validating',
          50 + (healingContext.attempt * 15) + 10,
          `Healing attempt ${healingContext.attempt}/${maxRetries}: Rebuilding to validate fixes`,
        );

        buildResult = await this.buildAndValidate(projectId, sandboxPath);

        if (buildResult.success) {
          this.logger.log(
            `Build succeeded after ${healingContext.attempt} healing attempt(s) for project: ${projectId}`,
          );

          this.emitProgress(
            projectId,
            'validating',
            100,
            `Build successful after ${healingContext.attempt} healing attempt(s)`,
          );

          return {
            success: true,
            spec,
            files: currentFiles,
            sandboxPath,
            healingAttempts: healingContext.attempt,
            healingSucceeded: true,
            healingErrors: healingContext.previousErrors,
          };
        }

        // Build still failed, record the error and continue loop
        healingContext.previousErrors.push(buildResult.errorLog || 'Unknown build error');

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during healing';
        this.logger.error(`Healing attempt ${healingContext.attempt} failed: ${errorMessage}`);
        healingContext.previousErrors.push(errorMessage);
      }
    }

    // All healing attempts exhausted
    this.logger.error(
      `All ${maxRetries} healing attempts failed for project: ${projectId}`,
    );

    this.emitProgress(
      projectId,
      'validating',
      100,
      `Build failed after ${maxRetries} healing attempts`,
    );

    return {
      success: false,
      spec,
      files: currentFiles,
      sandboxPath,
      error: `Build failed after ${maxRetries} healing attempts`,
      errorDetails: {
        healingAttempts: healingContext.attempt,
        errors: healingContext.previousErrors,
        fixedFiles: healingContext.fixedFiles,
      },
      healingAttempts: healingContext.attempt,
      healingSucceeded: false,
      healingErrors: healingContext.previousErrors,
    };
  }

  /**
   * Attempt to fix code based on a build error
   *
   * This method calls the CoderAgent with a special "fix" prompt that includes
   * the error log and asks it to correct the problematic code.
   *
   * @param projectId - The project ID
   * @param errorLog - The build error log
   * @param previousSpec - The original technical specification
   * @param healingContext - The current healing context
   * @returns Array of fixed files
   */
  async attemptFix(
    projectId: string,
    errorLog: string,
    previousSpec: TechnicalSpecification,
    healingContext: HealingContext,
  ): Promise<GeneratedFile[]> {
    this.logger.log(`Attempting to fix code for project: ${projectId}`);

    // Build a fix prompt that includes context about the error
    const fixPrompt = this.buildFixPrompt(errorLog, previousSpec, healingContext);

    try {
      // Use the CoderAgent to generate fixes
      // We create a modified spec that focuses on the fix
      const fixSpec: TechnicalSpecification = {
        ...previousSpec,
        implementationNotes: [
          ...(previousSpec.implementationNotes || []),
          `FIX REQUIRED: The build failed with the following error:`,
          errorLog,
          `Previous fix attempts: ${healingContext.attempt}`,
          ...(healingContext.previousErrors.length > 1
            ? [`Previous errors: ${healingContext.previousErrors.slice(0, -1).join('; ')}`]
            : []),
          `Fix the code to resolve this error. Only output the files that need to be changed.`,
        ],
      };

      const coderOutput = await this.coderAgent.generate(fixSpec, `${projectId}-fix-${healingContext.attempt}`);

      const fixedFiles: GeneratedFile[] = coderOutput.files.map((file) => ({
        path: file.path,
        content: file.content,
        language: this.getLanguageFromPath(file.path),
        isNew: false, // These are fixes, not new files
      }));

      this.logger.log(`Generated ${fixedFiles.length} fixed files`);

      return fixedFiles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate fixes: ${errorMessage}`);
      throw new Error(`Failed to generate code fixes: ${errorMessage}`);
    }
  }

  /**
   * Build the Docker image and validate the generated code
   *
   * @param projectId - The project ID
   * @param sandboxPath - Path to the sandbox containing the generated code
   * @returns Build result with success status and optional error log
   */
  async buildAndValidate(
    projectId: string,
    sandboxPath: string,
  ): Promise<{ success: boolean; errorLog?: string }> {
    this.logger.log(`Building Docker image for project: ${projectId} at ${sandboxPath}`);

    try {
      const buildResult = await this.dockerService.buildImage(projectId, sandboxPath);

      if (buildResult.success) {
        this.logger.log(`Docker build succeeded for project: ${projectId}`);
        return { success: true };
      }

      this.logger.warn(`Docker build failed for project: ${projectId}`);

      // Combine logs array into a single error string, including error message if present
      const errorParts: string[] = [];
      if (buildResult.error) {
        errorParts.push(buildResult.error);
      }
      if (buildResult.logs && buildResult.logs.length > 0) {
        // Get the last 50 log lines to capture the most relevant error info
        const relevantLogs = buildResult.logs.slice(-50);
        errorParts.push(relevantLogs.join('\n'));
      }

      return {
        success: false,
        errorLog: errorParts.length > 0 ? errorParts.join('\n\n') : 'Build failed with no error output',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Docker build error for project ${projectId}: ${errorMessage}`);

      return {
        success: false,
        errorLog: `Docker build exception: ${errorMessage}`,
      };
    }
  }

  /**
   * Build a prompt for fixing code based on error context
   */
  private buildFixPrompt(
    errorLog: string,
    spec: TechnicalSpecification,
    healingContext: HealingContext,
  ): string {
    const sections: string[] = [];

    sections.push(`# Code Fix Required for: ${spec.projectName}`);
    sections.push(`## Build Error\nThe Docker build failed with the following error:\n\`\`\`\n${errorLog}\n\`\`\``);

    sections.push(`## Healing Context`);
    sections.push(`- Attempt: ${healingContext.attempt} of ${healingContext.maxRetries}`);

    if (healingContext.previousErrors.length > 1) {
      sections.push(`- Previous errors:\n${healingContext.previousErrors.slice(0, -1).map((e, i) => `  ${i + 1}. ${e}`).join('\n')}`);
    }

    if (healingContext.fixedFiles.length > 0) {
      sections.push(`- Previously fixed files:\n${healingContext.fixedFiles.map(f => `  - ${f}`).join('\n')}`);
    }

    sections.push(`## Instructions`);
    sections.push(`1. Analyze the build error carefully`);
    sections.push(`2. Identify the root cause of the failure`);
    sections.push(`3. Generate ONLY the files that need to be modified to fix the error`);
    sections.push(`4. Ensure the fix addresses the specific error shown above`);
    sections.push(`5. Do not regenerate files that are working correctly`);

    return sections.join('\n\n');
  }

  /**
   * Merge fixed files into the existing file array
   */
  private mergeFiles(
    existingFiles: GeneratedFile[],
    fixedFiles: GeneratedFile[],
  ): GeneratedFile[] {
    const fileMap = new Map<string, GeneratedFile>();

    // Add existing files to map
    for (const file of existingFiles) {
      fileMap.set(file.path, file);
    }

    // Override with fixed files
    for (const file of fixedFiles) {
      fileMap.set(file.path, file);
    }

    return Array.from(fileMap.values());
  }

  /**
   * Emit progress update via WebSocket
   */
  private emitProgress(
    projectId: string,
    step: 'analyzing' | 'planning' | 'generating' | 'validating' | 'writing',
    percentage: number,
    message: string,
  ): void {
    this.eventEmitter.emit('generation.progress', {
      projectId,
      step,
      percentage,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
