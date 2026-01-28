/**
 * Architect Agent
 *
 * Converts user prompts into comprehensive Technical Specifications
 * that can be used by the Coder Agent to generate complete code.
 */

import { Logger } from '@nestjs/common';
import { generateText } from 'ai';
import {
  getLanguageModel,
  type AIModelConfig,
  DEFAULT_MODEL_CONFIGS,
} from '@nexusgen/ai';

import {
  ARCHITECT_SYSTEM_PROMPT,
  ARCHITECT_USER_PROMPT_TEMPLATE,
  ARCHITECT_RETRY_PROMPT,
} from './prompts/system.prompt';
import {
  type TechnicalSpecification,
  type UploadedAsset,
  type ArchitectAgentResponse,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
} from './types';

/**
 * Configuration options for the Architect Agent
 */
export interface ArchitectAgentConfig {
  /** AI model configuration */
  modelConfig?: Partial<AIModelConfig>;
  /** Maximum number of retries for JSON parsing */
  maxRetries?: number;
  /** Enable detailed logging */
  verbose?: boolean;
}

/**
 * Default configuration for the Architect Agent
 */
const DEFAULT_CONFIG: Required<ArchitectAgentConfig> = {
  modelConfig: {
    ...DEFAULT_MODEL_CONFIGS.openai,
    temperature: 0.3, // Lower temperature for more consistent structured output
    maxTokens: 8192, // Larger context for comprehensive specs
  },
  maxRetries: 3,
  verbose: false,
};

/**
 * Architect Agent Class
 *
 * Responsible for analyzing user requirements and generating
 * detailed technical specifications for code generation.
 */
export class ArchitectAgent {
  private readonly logger = new Logger(ArchitectAgent.name);
  private readonly config: Required<ArchitectAgentConfig>;
  private readonly modelConfig: AIModelConfig;

  constructor(config?: ArchitectAgentConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      modelConfig: {
        ...DEFAULT_CONFIG.modelConfig,
        ...config?.modelConfig,
      },
    };

    this.modelConfig = this.config.modelConfig as AIModelConfig;

    this.logger.log(
      `ArchitectAgent initialized with model: ${this.modelConfig.provider}/${this.modelConfig.model}`,
    );
  }

  /**
   * Analyze a user prompt and generate a Technical Specification
   *
   * @param prompt - The user's project description/requirements
   * @param assets - Optional uploaded assets (images, screenshots, etc.)
   * @returns ArchitectAgentResponse with the technical specification
   */
  async analyze(
    prompt: string,
    assets?: UploadedAsset[],
  ): Promise<ArchitectAgentResponse> {
    const startTime = Date.now();
    let retries = 0;
    let lastError: Error | null = null;
    let totalTokens = { prompt: 0, completion: 0, total: 0 };

    this.logger.log(`Starting analysis for prompt: "${prompt.substring(0, 100)}..."`);

    // Build asset descriptions if provided
    const assetDescriptions = this.buildAssetDescriptions(assets);

    // Build the user prompt
    let userPrompt = ARCHITECT_USER_PROMPT_TEMPLATE(prompt, assetDescriptions);

    while (retries <= this.config.maxRetries) {
      try {
        this.logger.debug(`Attempt ${retries + 1} of ${this.config.maxRetries + 1}`);

        // Get the language model
        const model = getLanguageModel(this.modelConfig);

        // Call the AI
        const response = await generateText({
          model,
          system: ARCHITECT_SYSTEM_PROMPT,
          prompt: userPrompt,
          temperature: this.modelConfig.temperature,
          maxTokens: this.modelConfig.maxTokens,
        });

        // Track token usage
        if (response.usage) {
          totalTokens.prompt += response.usage.promptTokens;
          totalTokens.completion += response.usage.completionTokens;
          totalTokens.total += response.usage.totalTokens;
        }

        this.logger.debug(`Received response with ${response.text.length} characters`);

        // Parse and validate the response
        const specification = this.parseResponse(response.text);
        const validation = this.validateSpecification(specification);

        if (!validation.valid) {
          this.logger.warn(
            `Specification validation failed: ${validation.errors.map((e) => e.message).join(', ')}`,
          );

          // If there are only warnings, we can proceed
          if (validation.errors.length === 0) {
            this.logger.log('Proceeding with warnings');
          } else {
            throw new Error(
              `Invalid specification: ${validation.errors[0].message}`,
            );
          }
        }

        // Log warnings if any
        if (validation.warnings.length > 0 && this.config.verbose) {
          validation.warnings.forEach((warning) => {
            this.logger.warn(`Validation warning: ${warning.message}`);
          });
        }

        const durationMs = Date.now() - startTime;
        this.logger.log(`Analysis completed in ${durationMs}ms`);

        return {
          success: true,
          specification,
          metadata: {
            durationMs,
            model: `${this.modelConfig.provider}/${this.modelConfig.model}`,
            tokens: totalTokens,
            retries,
          },
        };
      } catch (error) {
        lastError = error as Error;
        retries++;

        this.logger.error(
          `Attempt ${retries} failed: ${lastError.message}`,
          lastError.stack,
        );

        if (retries <= this.config.maxRetries) {
          // Update the prompt with retry instructions
          userPrompt = ARCHITECT_RETRY_PROMPT(
            ARCHITECT_USER_PROMPT_TEMPLATE(prompt, assetDescriptions),
            lastError.message,
          );

          this.logger.log(`Retrying with error context...`);
        }
      }
    }

    // All retries exhausted
    const durationMs = Date.now() - startTime;
    this.logger.error(
      `Analysis failed after ${retries} attempts: ${lastError?.message}`,
    );

    return {
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: lastError?.message || 'Unknown error during analysis',
        details: {
          attempts: retries,
          lastError: lastError?.stack,
        },
      },
      metadata: {
        durationMs,
        model: `${this.modelConfig.provider}/${this.modelConfig.model}`,
        tokens: totalTokens,
        retries,
      },
    };
  }

  /**
   * Build descriptions from uploaded assets
   */
  private buildAssetDescriptions(assets?: UploadedAsset[]): string | undefined {
    if (!assets || assets.length === 0) {
      return undefined;
    }

    return assets
      .map((asset, index) => {
        let description = `### Asset ${index + 1}: ${asset.filename}\n`;
        description += `- Type: ${asset.mimeType}\n`;
        description += `- URL: ${asset.url}\n`;

        if (asset.description) {
          description += `- Description: ${asset.description}\n`;
        }

        if (asset.analysis) {
          if (asset.analysis.detectedComponents?.length) {
            description += `- Detected Components: ${asset.analysis.detectedComponents.join(', ')}\n`;
          }
          if (asset.analysis.layoutPatterns?.length) {
            description += `- Layout Patterns: ${asset.analysis.layoutPatterns.join(', ')}\n`;
          }
          if (asset.analysis.colorPalette?.length) {
            description += `- Color Palette: ${asset.analysis.colorPalette.join(', ')}\n`;
          }
          if (asset.analysis.insights) {
            description += `- Insights: ${asset.analysis.insights}\n`;
          }
        }

        return description;
      })
      .join('\n');
  }

  /**
   * Parse the AI response as JSON
   */
  private parseResponse(response: string): TechnicalSpecification {
    // Try to extract JSON if wrapped in markdown code blocks
    let jsonString = response.trim();

    // Remove potential markdown code block markers
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7);
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3);
    }

    if (jsonString.endsWith('```')) {
      jsonString = jsonString.slice(0, -3);
    }

    jsonString = jsonString.trim();

    // Attempt to find JSON object boundaries if response has extra text
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
      jsonString = jsonString.slice(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(jsonString);
      return parsed as TechnicalSpecification;
    } catch (error) {
      const parseError = error as SyntaxError;

      // Try to provide more helpful error message
      const match = parseError.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1], 10);
        const context = jsonString.slice(
          Math.max(0, position - 50),
          Math.min(jsonString.length, position + 50),
        );
        throw new Error(
          `JSON parse error at position ${position}: "${context}"... - ${parseError.message}`,
        );
      }

      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
  }

  /**
   * Validate the technical specification
   */
  private validateSpecification(spec: TechnicalSpecification): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required top-level fields
    if (!spec.projectName || typeof spec.projectName !== 'string') {
      errors.push({
        path: 'projectName',
        message: 'projectName is required and must be a string',
        expected: 'string',
        actual: typeof spec.projectName,
      });
    }

    if (!spec.description || typeof spec.description !== 'string') {
      errors.push({
        path: 'description',
        message: 'description is required and must be a string',
        expected: 'string',
        actual: typeof spec.description,
      });
    }

    if (!spec.projectStructure || !spec.projectStructure.root) {
      errors.push({
        path: 'projectStructure',
        message: 'projectStructure with root directory is required',
      });
    }

    // Validate components array
    if (!Array.isArray(spec.components)) {
      errors.push({
        path: 'components',
        message: 'components must be an array',
        expected: 'array',
        actual: typeof spec.components,
      });
    } else {
      spec.components.forEach((component, index) => {
        if (!component.name) {
          errors.push({
            path: `components[${index}].name`,
            message: `Component at index ${index} is missing name`,
          });
        }
        if (!component.path) {
          errors.push({
            path: `components[${index}].path`,
            message: `Component ${component.name || index} is missing path`,
          });
        }
        if (!component.type || !['client', 'server', 'shared'].includes(component.type)) {
          warnings.push({
            path: `components[${index}].type`,
            message: `Component ${component.name || index} has invalid type: ${component.type}`,
            suggestion: 'Use "client", "server", or "shared"',
          });
        }
        if (!Array.isArray(component.props)) {
          warnings.push({
            path: `components[${index}].props`,
            message: `Component ${component.name || index} should have a props array`,
            suggestion: 'Add an empty array [] if no props are needed',
          });
        }
      });
    }

    // Validate pages array
    if (!Array.isArray(spec.pages)) {
      errors.push({
        path: 'pages',
        message: 'pages must be an array',
        expected: 'array',
        actual: typeof spec.pages,
      });
    } else {
      spec.pages.forEach((page, index) => {
        if (!page.route) {
          errors.push({
            path: `pages[${index}].route`,
            message: `Page at index ${index} is missing route`,
          });
        }
        if (!page.filePath) {
          errors.push({
            path: `pages[${index}].filePath`,
            message: `Page ${page.route || index} is missing filePath`,
          });
        }
        if (!page.metadata || !page.metadata.title) {
          warnings.push({
            path: `pages[${index}].metadata`,
            message: `Page ${page.route || index} is missing metadata.title`,
            suggestion: 'Add metadata for SEO',
          });
        }
      });
    }

    // Validate API routes array
    if (!Array.isArray(spec.apiRoutes)) {
      errors.push({
        path: 'apiRoutes',
        message: 'apiRoutes must be an array',
        expected: 'array',
        actual: typeof spec.apiRoutes,
      });
    } else {
      spec.apiRoutes.forEach((route, index) => {
        if (!route.path) {
          errors.push({
            path: `apiRoutes[${index}].path`,
            message: `API route at index ${index} is missing path`,
          });
        }
        if (!route.method || !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(route.method)) {
          errors.push({
            path: `apiRoutes[${index}].method`,
            message: `API route ${route.path || index} has invalid method: ${route.method}`,
          });
        }
        if (!Array.isArray(route.responses) || route.responses.length === 0) {
          warnings.push({
            path: `apiRoutes[${index}].responses`,
            message: `API route ${route.path || index} should define response schemas`,
          });
        }
      });
    }

    // Validate dependencies array
    if (!Array.isArray(spec.dependencies)) {
      errors.push({
        path: 'dependencies',
        message: 'dependencies must be an array',
        expected: 'array',
        actual: typeof spec.dependencies,
      });
    }

    // Validate data models array
    if (!Array.isArray(spec.dataModels)) {
      errors.push({
        path: 'dataModels',
        message: 'dataModels must be an array',
        expected: 'array',
        actual: typeof spec.dataModels,
      });
    }

    // Validate env variables array
    if (!Array.isArray(spec.envVariables)) {
      errors.push({
        path: 'envVariables',
        message: 'envVariables must be an array',
        expected: 'array',
        actual: typeof spec.envVariables,
      });
    }

    // Additional warnings for completeness
    if (spec.components.length === 0) {
      warnings.push({
        path: 'components',
        message: 'No components defined',
        suggestion: 'Most applications need at least some components',
      });
    }

    if (spec.pages.length === 0) {
      warnings.push({
        path: 'pages',
        message: 'No pages defined',
        suggestion: 'At least a home page should be defined',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Update the model configuration
   */
  setModelConfig(config: Partial<AIModelConfig>): void {
    Object.assign(this.modelConfig, config);
    this.logger.log(
      `Model config updated: ${this.modelConfig.provider}/${this.modelConfig.model}`,
    );
  }

  /**
   * Get the current model configuration
   */
  getModelConfig(): AIModelConfig {
    return { ...this.modelConfig };
  }
}

/**
 * Factory function to create an Architect Agent
 */
export function createArchitectAgent(
  config?: ArchitectAgentConfig,
): ArchitectAgent {
  return new ArchitectAgent(config);
}
