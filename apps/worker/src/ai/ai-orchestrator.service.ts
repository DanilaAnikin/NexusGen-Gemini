import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GenerationJobData,
  GenerationResult,
  GeneratedFile,
  AgentStep,
  AgentStepStatus,
  GenerationType,
  AIProvider,
  AIMessage,
  AICompletionRequest,
  AICompletionResponse,
  AIModelConfig,
} from '../types';

/**
 * AI Orchestrator Service
 *
 * Handles AI agent orchestration for code generation.
 * Manages the multi-step process of understanding prompts,
 * planning code structure, generating code, and validating output.
 */
@Injectable()
export class AIOrchestratorService {
  private readonly logger = new Logger(AIOrchestratorService.name);
  private readonly defaultModel: string;
  private readonly openaiApiKey: string | undefined;
  private readonly anthropicApiKey: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.defaultModel = this.configService.get<string>(
      'AI_MODEL_DEFAULT',
      'gpt-4-turbo-preview',
    );
    this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.anthropicApiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
  }

  /**
   * Process a generation request through the AI agent pipeline
   */
  async processGeneration(jobData: GenerationJobData): Promise<GenerationResult> {
    this.logger.log(`Processing generation: ${jobData.generationId}`);

    const steps: AgentStep[] = [];
    const logs: string[] = [];
    let totalTokens = 0;

    try {
      // Step 1: Analyze prompt and understand requirements
      const analyzeStep = await this.executeStep(
        'analyze',
        'Analyzing prompt and requirements',
        async () => {
          logs.push('Analyzing prompt...');
          const analysis = await this.analyzePrompt(jobData.prompt, jobData.type);
          logs.push(`Identified: ${analysis.components.length} components to generate`);
          return analysis;
        },
      );
      steps.push(analyzeStep.step);
      totalTokens += analyzeStep.tokens;

      // Step 2: Plan code structure
      const planStep = await this.executeStep(
        'plan',
        'Planning code structure',
        async () => {
          logs.push('Planning code structure...');
          const plan = await this.planCodeStructure(
            jobData,
            analyzeStep.result as any,
          );
          logs.push(`Planned ${plan.files.length} files`);
          return plan;
        },
      );
      steps.push(planStep.step);
      totalTokens += planStep.tokens;

      // Step 3: Generate code
      const generateStep = await this.executeStep(
        'generate',
        'Generating code',
        async () => {
          logs.push('Generating code...');
          const files = await this.generateCode(jobData, planStep.result as any);
          logs.push(`Generated ${files.length} files`);
          return files;
        },
      );
      steps.push(generateStep.step);
      totalTokens += generateStep.tokens;

      // Step 4: Validate and improve
      const validateStep = await this.executeStep(
        'validate',
        'Validating generated code',
        async () => {
          logs.push('Validating code...');
          const validatedFiles = await this.validateCode(
            generateStep.result as GeneratedFile[],
          );
          logs.push('Validation complete');
          return validatedFiles;
        },
      );
      steps.push(validateStep.step);
      totalTokens += validateStep.tokens;

      logs.push('Generation complete!');

      return {
        files: validateStep.result as GeneratedFile[],
        logs,
        tokensUsed: totalTokens,
        modelUsed: this.defaultModel,
      };
    } catch (error) {
      this.logger.error(`Generation failed: ${error}`, (error as Error).stack);
      logs.push(`Error: ${(error as Error).message}`);

      return {
        files: [],
        logs,
        tokensUsed: totalTokens,
        modelUsed: this.defaultModel,
      };
    }
  }

  /**
   * Execute a single agent step with timing and error handling
   */
  private async executeStep<T>(
    name: string,
    description: string,
    executor: () => Promise<T>,
  ): Promise<{ step: AgentStep; result: T; tokens: number }> {
    const step: AgentStep = {
      id: `step_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      description,
      status: AgentStepStatus.RUNNING,
      startedAt: new Date(),
    };

    try {
      const result = await executor();
      step.status = AgentStepStatus.COMPLETED;
      step.completedAt = new Date();
      step.durationMs = step.completedAt.getTime() - step.startedAt.getTime();
      step.output = { success: true };

      return { step, result, tokens: Math.floor(Math.random() * 500) + 100 };
    } catch (error) {
      step.status = AgentStepStatus.FAILED;
      step.completedAt = new Date();
      step.durationMs = step.completedAt.getTime() - step.startedAt.getTime();
      step.error = (error as Error).message;

      throw error;
    }
  }

  /**
   * Analyze the user's prompt to understand requirements
   */
  private async analyzePrompt(
    prompt: string,
    type: GenerationType,
  ): Promise<{
    components: string[];
    features: string[];
    requirements: string[];
  }> {
    // In production, this would call the AI model to analyze the prompt
    // For now, return a mock analysis

    const typeAnalysis = this.getTypeAnalysis(type);

    return {
      components: typeAnalysis.components,
      features: this.extractFeatures(prompt),
      requirements: [
        'TypeScript support',
        'Responsive design',
        'Accessibility compliance',
      ],
    };
  }

  /**
   * Plan the code structure based on analysis
   */
  private async planCodeStructure(
    jobData: GenerationJobData,
    analysis: { components: string[]; features: string[]; requirements: string[] },
  ): Promise<{
    files: { path: string; type: string; description: string }[];
    dependencies: string[];
  }> {
    const files: { path: string; type: string; description: string }[] = [];
    const framework = jobData.settings.framework;

    // Plan files based on generation type and analysis
    for (const component of analysis.components) {
      files.push({
        path: `components/${component}.tsx`,
        type: 'component',
        description: `${component} component implementation`,
      });

      // Add test file
      files.push({
        path: `components/${component}.test.tsx`,
        type: 'test',
        description: `Tests for ${component} component`,
      });
    }

    // Add types file if needed
    if (analysis.components.length > 0) {
      files.push({
        path: 'types/index.ts',
        type: 'types',
        description: 'Type definitions',
      });
    }

    return {
      files,
      dependencies: this.getDependencies(analysis.features, framework),
    };
  }

  /**
   * Generate actual code files
   */
  private async generateCode(
    jobData: GenerationJobData,
    plan: { files: { path: string; type: string; description: string }[] },
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    for (const filePlan of plan.files) {
      const content = await this.generateFileContent(
        filePlan,
        jobData,
      );

      files.push({
        path: filePlan.path,
        content,
        language: this.getLanguage(filePlan.path),
        isNew: true,
      });
    }

    return files;
  }

  /**
   * Generate content for a single file
   */
  private async generateFileContent(
    filePlan: { path: string; type: string; description: string },
    jobData: GenerationJobData,
  ): Promise<string> {
    // In production, this would call the AI model
    // For now, return template code based on file type

    const componentName = this.extractComponentName(filePlan.path);
    const framework = jobData.settings.framework;
    const styling = jobData.settings.styling;

    switch (filePlan.type) {
      case 'component':
        return this.generateComponentTemplate(componentName, framework, styling);
      case 'test':
        return this.generateTestTemplate(componentName);
      case 'types':
        return this.generateTypesTemplate(componentName);
      default:
        return `// ${filePlan.description}\n`;
    }
  }

  /**
   * Validate generated code
   */
  private async validateCode(files: GeneratedFile[]): Promise<GeneratedFile[]> {
    // In production, this would:
    // 1. Run linting
    // 2. Check for TypeScript errors
    // 3. Run basic tests
    // 4. Improve code if needed

    return files.map((file) => ({
      ...file,
      // Add validation metadata
    }));
  }

  /**
   * Call AI model for completion (placeholder for actual implementation)
   */
  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    this.logger.log(`AI completion request with ${request.messages.length} messages`);

    // In production, this would call OpenAI or Anthropic API
    // For now, return a mock response

    const systemMessage = request.messages.find((m) => m.role === 'system');
    const userMessage = request.messages.find((m) => m.role === 'user');

    return {
      content: `Generated response for: ${userMessage?.content?.substring(0, 50)}...`,
      finishReason: 'stop',
      usage: {
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
      },
    };
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private getTypeAnalysis(type: GenerationType): { components: string[] } {
    switch (type) {
      case GenerationType.COMPONENT:
        return { components: ['MainComponent'] };
      case GenerationType.PAGE:
        return { components: ['PageLayout', 'PageHeader', 'PageContent'] };
      case GenerationType.FULL_APP:
        return {
          components: ['App', 'Header', 'Footer', 'Navigation', 'HomePage'],
        };
      default:
        return { components: ['Component'] };
    }
  }

  private extractFeatures(prompt: string): string[] {
    const features: string[] = [];
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('dark mode') || promptLower.includes('theme')) {
      features.push('dark-mode');
    }
    if (promptLower.includes('responsive')) {
      features.push('responsive');
    }
    if (promptLower.includes('animation') || promptLower.includes('animated')) {
      features.push('animations');
    }
    if (promptLower.includes('form')) {
      features.push('forms');
    }
    if (promptLower.includes('api') || promptLower.includes('fetch')) {
      features.push('api-integration');
    }

    return features;
  }

  private getDependencies(features: string[], framework: string): string[] {
    const deps: string[] = [];

    if (features.includes('animations')) {
      deps.push('framer-motion');
    }
    if (features.includes('forms')) {
      deps.push('react-hook-form', 'zod');
    }
    if (features.includes('api-integration')) {
      deps.push('@tanstack/react-query');
    }

    return deps;
  }

  private getLanguage(path: string): string {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return 'typescript';
    if (path.endsWith('.jsx') || path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.json')) return 'json';
    return 'plaintext';
  }

  private extractComponentName(path: string): string {
    const fileName = path.split('/').pop() || '';
    return fileName.replace(/\.(tsx?|jsx?)$/, '').replace('.test', '');
  }

  private generateComponentTemplate(
    name: string,
    framework: string,
    styling: string,
  ): string {
    const stylingImport =
      styling === 'TAILWIND'
        ? ''
        : `import styles from './${name}.module.css';\n`;

    return `import React from 'react';
${stylingImport}
export interface ${name}Props {
  /** Optional className for styling */
  className?: string;
  /** Children elements */
  children?: React.ReactNode;
}

/**
 * ${name} component
 *
 * @description Auto-generated component by NexusGen AI
 */
export const ${name}: React.FC<${name}Props> = ({
  className = '',
  children,
}) => {
  return (
    <div className={\`${styling === 'TAILWIND' ? 'flex flex-col' : 'styles.container'} \${className}\`}>
      {children}
    </div>
  );
};

export default ${name};
`;
  }

  private generateTestTemplate(name: string): string {
    return `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
  });

  it('renders children correctly', () => {
    render(<${name}>Test Content</${name}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<${name} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`;
  }

  private generateTypesTemplate(name: string): string {
    return `/**
 * Type definitions for ${name}
 * Auto-generated by NexusGen AI
 */

export interface ${name}Data {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ${name}Status = 'active' | 'inactive' | 'pending';

export interface ${name}Config {
  enabled: boolean;
  options?: Record<string, unknown>;
}
`;
  }
}
