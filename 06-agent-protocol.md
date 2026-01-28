# 6. Agent Protocol (Prompt Engineering Strategy)

This section defines the complete prompt engineering architecture for NexusGen's autonomous website generation system. It covers all agent definitions, their system prompts, input/output schemas, and orchestration patterns.

---

## 6.1 Architecture Overview

NexusGen employs a multi-agent architecture with four specialized agents working in concert:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER REQUEST                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARCHITECT AGENT                                      │
│                    (Requirements → PRD)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAG LAYER                                          │
│              (Documentation Retrieval & Context Injection)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CODER AGENT                                         │
│                    (PRD → File Operations)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REVIEWER AGENT                                       │
│                  (Quality, Security, Performance)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR (STATE MACHINE)                            │
│              (Coordination, Rollback, Final Assembly)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6.2 Agent A: Architect Agent

### 6.2.1 Purpose

The Architect Agent transforms raw user requirements into a comprehensive Product Requirements Document (PRD) that serves as the single source of truth for all downstream agents. It performs requirements analysis, identifies implicit needs, resolves ambiguities, and produces a structured specification.

### 6.2.2 System Prompt Template

```markdown
<system>
You are the **NexusGen Architect Agent**, a senior software architect specializing in modern web application design. Your role is to transform user requirements into comprehensive, actionable Product Requirements Documents (PRDs).

## Core Responsibilities

1. **Requirements Analysis**: Extract explicit and implicit requirements from user input
2. **Gap Identification**: Identify missing information and make reasonable assumptions
3. **Technical Translation**: Convert business requirements to technical specifications
4. **Scope Definition**: Clearly define what is in-scope and out-of-scope
5. **Risk Assessment**: Identify potential technical challenges and mitigation strategies

## Architectural Principles

You adhere to the following principles in all designs:

- **Server-First Architecture**: Prefer React Server Components; client components only when necessary
- **Type Safety**: Full TypeScript coverage with strict mode
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance Budget**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Security by Default**: Input validation, CSRF protection, secure headers

## Technology Stack Context

The target stack is:
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Language**: TypeScript 5.x (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel Edge Network

## Chain-of-Thought Process

For each request, follow this reasoning process:

### Step 1: Comprehension
- What is the user trying to build?
- Who is the target audience?
- What is the primary value proposition?

### Step 2: Decomposition
- Break down into distinct features/modules
- Identify dependencies between components
- Map user journeys and flows

### Step 3: Technical Mapping
- Which pages/routes are needed?
- What data models are required?
- Which API endpoints are necessary?
- What third-party integrations are needed?

### Step 4: Constraint Analysis
- What are the non-functional requirements?
- Are there performance constraints?
- Are there compliance requirements?
- What is the timeline/complexity budget?

### Step 5: Assumption Documentation
- Document all assumptions made
- Flag areas needing user clarification
- Note alternative approaches considered

## Output Format

Your output MUST be a valid JSON object conforming to the PRD schema. Do not include any text outside the JSON structure.

## Critical Rules

1. NEVER assume features the user didn't request
2. ALWAYS include error states and edge cases
3. ALWAYS define clear acceptance criteria
4. PREFER simplicity over complexity
5. INCLUDE performance and accessibility requirements for each feature
6. DOCUMENT all assumptions explicitly
</system>

<context>
## User Assets Provided
{{user_assets}}

## User Preferences
{{user_preferences}}

## Domain Context
{{domain_context}}

## Previous Conversation (if any)
{{conversation_history}}
</context>

<task>
Analyze the following user requirements and generate a comprehensive PRD:

{{user_requirements}}
</task>
```

### 6.2.3 Input Schema

```typescript
interface ArchitectAgentInput {
  // Core requirements from user
  userRequirements: {
    description: string;              // Natural language description
    targetAudience?: string;          // Who will use this website
    businessGoals?: string[];         // What success looks like
    inspirationUrls?: string[];       // Reference websites
    mustHaveFeatures?: string[];      // Non-negotiable features
    niceToHaveFeatures?: string[];    // Optional features
  };

  // Assets provided by user
  userAssets: {
    logo?: Asset;
    images?: Asset[];
    brandGuidelines?: Asset;
    existingContent?: ContentItem[];
    wireframes?: Asset[];
  };

  // User preferences
  userPreferences: {
    colorScheme?: 'light' | 'dark' | 'system' | 'custom';
    primaryColor?: string;            // Hex color
    secondaryColor?: string;          // Hex color
    fontPreference?: 'modern' | 'classic' | 'playful' | 'minimal';
    layoutStyle?: 'dense' | 'spacious' | 'balanced';
    animationLevel?: 'none' | 'subtle' | 'moderate' | 'rich';
  };

  // Domain context
  domainContext: {
    industry?: string;
    companySize?: 'startup' | 'smb' | 'enterprise';
    existingTechStack?: string[];
    complianceRequirements?: string[];
    region?: string;                   // For localization
  };

  // Session context
  sessionContext: {
    conversationHistory?: Message[];
    previousPRD?: PRDOutput;          // For iterative refinement
    clarificationResponses?: Record<string, string>;
  };
}

interface Asset {
  id: string;
  type: 'image' | 'document' | 'video' | 'font';
  url: string;
  mimeType: string;
  metadata?: Record<string, unknown>;
}

interface ContentItem {
  type: 'text' | 'structured';
  content: string | Record<string, unknown>;
  purpose?: string;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
```

### 6.2.4 Output Schema (PRD Format)

```typescript
interface PRDOutput {
  // Metadata
  metadata: {
    prdVersion: string;               // Semantic version
    generatedAt: string;              // ISO timestamp
    projectName: string;
    projectSlug: string;              // URL-safe identifier
    confidenceScore: number;          // 0-1 confidence in requirements
    requiresClarification: boolean;
    clarificationQuestions?: string[];
  };

  // Executive Summary
  overview: {
    description: string;              // 2-3 sentence summary
    targetAudience: string;
    valueProposition: string;
    successMetrics: SuccessMetric[];
  };

  // Detailed Features
  features: Feature[];

  // Page Structure
  pages: Page[];

  // Data Architecture
  dataModels: DataModel[];

  // API Specification
  apiEndpoints: APIEndpoint[];

  // Authentication & Authorization
  auth: AuthSpecification;

  // Third-Party Integrations
  integrations: Integration[];

  // Non-Functional Requirements
  nonFunctionalRequirements: {
    performance: PerformanceRequirement[];
    security: SecurityRequirement[];
    accessibility: AccessibilityRequirement[];
    seo: SEORequirement[];
    scalability: ScalabilityRequirement[];
  };

  // Design Specifications
  designSystem: {
    colorPalette: ColorPalette;
    typography: Typography;
    spacing: SpacingSystem;
    components: ComponentSpecification[];
  };

  // Technical Constraints
  constraints: {
    browserSupport: string[];
    deviceSupport: string[];
    performanceBudget: PerformanceBudget;
    dependencies: Dependency[];
  };

  // Implementation Plan
  implementationPlan: {
    phases: Phase[];
    estimatedComplexity: 'low' | 'medium' | 'high';
    riskAssessment: Risk[];
  };

  // Assumptions & Decisions
  assumptions: Assumption[];
  decisions: ArchitecturalDecision[];

  // Out of Scope
  outOfScope: string[];
}

interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  userStories: UserStory[];
  acceptanceCriteria: string[];
  technicalNotes: string;
  dependencies: string[];             // Feature IDs
  estimatedComplexity: 'trivial' | 'simple' | 'moderate' | 'complex';
}

interface UserStory {
  persona: string;
  action: string;
  benefit: string;
  // Format: "As a {persona}, I want to {action} so that {benefit}"
}

interface Page {
  route: string;                      // e.g., "/dashboard"
  name: string;
  description: string;
  type: 'static' | 'dynamic' | 'hybrid';
  renderingStrategy: 'SSG' | 'SSR' | 'ISR' | 'CSR';
  revalidation?: number;              // seconds for ISR
  components: PageComponent[];
  dataRequirements: DataRequirement[];
  seoMetadata: SEOMetadata;
  accessControl: AccessControl;
}

interface PageComponent {
  name: string;
  type: 'server' | 'client';
  props: ComponentProp[];
  children?: PageComponent[];
  interactivity: string[];            // Events/interactions
}

interface DataModel {
  name: string;
  description: string;
  fields: Field[];
  relations: Relation[];
  indexes: Index[];
  constraints: string[];
}

interface Field {
  name: string;
  type: string;
  required: boolean;
  unique: boolean;
  default?: unknown;
  validation?: string[];
  description: string;
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody?: SchemaDefinition;
  responseBody: SchemaDefinition;
  errorResponses: ErrorResponse[];
  authentication: 'none' | 'required' | 'optional';
  rateLimit?: RateLimit;
}

interface AuthSpecification {
  strategy: 'none' | 'session' | 'jwt' | 'oauth';
  providers: AuthProvider[];
  roles: Role[];
  permissions: Permission[];
  sessionConfig?: SessionConfig;
}

interface PerformanceBudget {
  lcp: number;                        // milliseconds
  fid: number;                        // milliseconds
  cls: number;                        // score
  ttfb: number;                       // milliseconds
  totalBundleSize: number;            // KB
  imageOptimization: boolean;
  fontOptimization: boolean;
}
```

### 6.2.5 Chain-of-Thought Reasoning Approach

The Architect Agent employs structured reasoning through explicit thinking stages:

```typescript
interface ArchitectReasoningTrace {
  comprehension: {
    projectType: string;
    corePurpose: string;
    targetUsers: string[];
    keyConstraints: string[];
  };

  decomposition: {
    identifiedModules: Array<{
      name: string;
      responsibility: string;
      complexity: string;
    }>;
    dependencyGraph: Record<string, string[]>;
    criticalPath: string[];
  };

  technicalMapping: {
    routeStructure: string[];
    dataEntities: string[];
    externalServices: string[];
    stateManagement: string;
  };

  constraintAnalysis: {
    hardConstraints: string[];
    softConstraints: string[];
    tradeoffs: Array<{
      option1: string;
      option2: string;
      recommendation: string;
      rationale: string;
    }>;
  };

  assumptions: Array<{
    assumption: string;
    impact: 'low' | 'medium' | 'high';
    alternative: string;
  }>;
}
```

### 6.2.6 Validation Criteria

```typescript
interface PRDValidation {
  structural: {
    allRequiredFieldsPresent: boolean;
    validJSONSchema: boolean;
    internalReferencesValid: boolean;  // Feature IDs, etc.
  };

  completeness: {
    allPagesHaveRoutes: boolean;
    allFeaturesHaveAcceptanceCriteria: boolean;
    allDataModelsHaveRelations: boolean;
    allEndpointsHaveErrorHandling: boolean;
    authSpecifiedForProtectedRoutes: boolean;
  };

  consistency: {
    namingConventionsConsistent: boolean;
    noCircularDependencies: boolean;
    performanceBudgetRealistic: boolean;
    complexityEstimatesReasonable: boolean;
  };

  quality: {
    userStoriesFollowFormat: boolean;
    acceptanceCriteriaTestable: boolean;
    securityRequirementsAddressed: boolean;
    accessibilityRequirementsAddressed: boolean;
  };
}

// Validation function
function validatePRD(prd: PRDOutput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Structural validation
  if (!prd.features || prd.features.length === 0) {
    errors.push({
      code: 'PRD_NO_FEATURES',
      message: 'PRD must contain at least one feature',
      path: 'features'
    });
  }

  // Cross-reference validation
  const featureIds = new Set(prd.features.map(f => f.id));
  for (const feature of prd.features) {
    for (const depId of feature.dependencies) {
      if (!featureIds.has(depId)) {
        errors.push({
          code: 'PRD_INVALID_DEPENDENCY',
          message: `Feature ${feature.id} references non-existent dependency ${depId}`,
          path: `features.${feature.id}.dependencies`
        });
      }
    }
  }

  // Quality warnings
  for (const page of prd.pages) {
    if (page.accessControl.requiresAuth && !prd.auth.strategy !== 'none') {
      warnings.push({
        code: 'PRD_AUTH_MISMATCH',
        message: `Page ${page.route} requires auth but auth strategy is none`,
        path: `pages.${page.route}`
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: calculatePRDQualityScore(prd, errors, warnings)
  };
}
```

---

## 6.3 Agent B: Coder Agent

### 6.3.1 Purpose

The Coder Agent transforms the PRD into executable file system operations. It generates production-ready code following modern best practices, the specified technology stack, and the exact specifications from the PRD.

### 6.3.2 System Prompt Template

```markdown
<system>
You are the **NexusGen Coder Agent**, an expert full-stack developer specializing in Next.js 15, TypeScript, and modern web development. Your role is to transform Product Requirements Documents (PRDs) into production-ready code through precise file system operations.

## Core Responsibilities

1. **Code Generation**: Produce clean, maintainable, type-safe code
2. **File Management**: Create, modify, and organize project files
3. **Best Practices**: Follow established patterns and conventions
4. **Error Handling**: Implement comprehensive error boundaries and handling
5. **Documentation**: Include inline documentation and JSDoc comments

## Technology Expertise

You are an expert in:
- **Next.js 15**: App Router, Server Components, Server Actions, Metadata API
- **React 19**: Hooks, Suspense, Transitions, use() hook
- **TypeScript 5.x**: Strict mode, generics, utility types, type guards
- **Tailwind CSS v4**: Utility classes, custom configurations, responsive design
- **shadcn/ui**: Component patterns, theming, accessibility
- **Prisma**: Schema design, migrations, queries, relations
- **NextAuth.js v5**: Providers, callbacks, session management

## Code Generation Principles

### Server Components (Default)
```tsx
// Default to Server Components
// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession();
  const data = await prisma.item.findMany({
    where: { userId: session?.user?.id }
  });

  return <Dashboard data={data} />;
}
```

### Client Components (Only When Necessary)
```tsx
// Use "use client" only for:
// - Event handlers (onClick, onChange, etc.)
// - Browser APIs (localStorage, navigator, etc.)
// - Hooks (useState, useEffect, etc.)
// - Third-party client libraries

"use client";

import { useState } from "react";

export function InteractiveCounter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Type Safety
```typescript
// Always define explicit types
interface Props {
  data: DataItem[];
  onSelect: (item: DataItem) => void;
}

// Use Zod for runtime validation
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;
```

### Error Handling
```tsx
// app/dashboard/error.tsx
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## File Organization Standards

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected routes
│   │   ├── layout.tsx       # Auth-checked layout
│   │   └── dashboard/
│   ├── api/                 # API routes
│   │   └── [...route]/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── error.tsx            # Global error
│   ├── loading.tsx          # Global loading
│   └── not-found.tsx        # 404 page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── forms/               # Form components
│   ├── layouts/             # Layout components
│   └── [feature]/           # Feature-specific
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── auth.ts              # Auth configuration
│   ├── utils.ts             # Utility functions
│   └── validations/         # Zod schemas
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
├── styles/                  # Global styles
└── config/                  # Configuration
```

## Output Format

Your output MUST be a valid JSON object containing file operations. Each operation specifies the action to perform on the file system.

## Critical Rules

1. NEVER use deprecated APIs or patterns
2. ALWAYS use the App Router (never Pages Router)
3. ALWAYS include proper TypeScript types
4. ALWAYS handle loading and error states
5. ALWAYS include accessibility attributes
6. ALWAYS use environment variables for secrets
7. NEVER hardcode API keys or sensitive data
8. PREFER Server Components over Client Components
9. USE Server Actions for mutations
10. INCLUDE proper SEO metadata for all pages
</system>

<rag_context>
## Retrieved Documentation Context
{{rag_documentation}}

## Framework Version Information
- Next.js: 15.1.0
- React: 19.0.0
- TypeScript: 5.7.0
- Tailwind CSS: 4.0.0
- Prisma: 6.2.0
- NextAuth.js: 5.0.0

## Deprecation Warnings
{{deprecation_warnings}}
</rag_context>

<existing_code_context>
## Current Project Structure
{{project_structure}}

## Existing Files Content
{{existing_files}}

## Package.json Dependencies
{{dependencies}}
</existing_code_context>

<task>
Generate file operations to implement the following PRD:

{{prd_json}}

Focus on these specific features for this iteration:
{{target_features}}
</task>
```

### 6.3.3 Input Schema

```typescript
interface CoderAgentInput {
  // The PRD to implement
  prd: PRDOutput;

  // Specific features to implement (for incremental generation)
  targetFeatures?: string[];         // Feature IDs to implement

  // Existing code context
  existingContext: {
    projectStructure: FileTreeNode;
    existingFiles: ExistingFile[];
    packageJson: PackageJson;
    tsConfig: TSConfig;
    tailwindConfig?: TailwindConfig;
    prismaSchema?: string;
  };

  // RAG-retrieved documentation
  ragContext: {
    documentation: DocumentChunk[];
    deprecationWarnings: DeprecationWarning[];
    codeExamples: CodeExample[];
  };

  // Generation preferences
  preferences: {
    codeStyle: 'concise' | 'verbose' | 'balanced';
    commentLevel: 'minimal' | 'moderate' | 'extensive';
    testGeneration: boolean;
    storyGeneration: boolean;        // Storybook stories
  };

  // Previous iteration context (for refinement)
  previousIteration?: {
    operations: FileOperation[];
    reviewFeedback: ReviewFeedback[];
  };
}

interface FileTreeNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
}

interface ExistingFile {
  path: string;
  content: string;
  language: string;
  lastModified: string;
}

interface DocumentChunk {
  source: string;                    // e.g., "next.js/app-router"
  content: string;
  relevanceScore: number;
  metadata: {
    version: string;
    section: string;
    url: string;
  };
}

interface DeprecationWarning {
  pattern: string;                   // Code pattern to avoid
  reason: string;
  alternative: string;
  since: string;                     // Version deprecated
}

interface CodeExample {
  description: string;
  code: string;
  language: string;
  source: string;
}
```

### 6.3.4 Output Schema (File Operations)

```typescript
interface CoderAgentOutput {
  // Session metadata
  metadata: {
    generatedAt: string;
    prdVersion: string;
    targetFeatures: string[];
    totalOperations: number;
  };

  // File operations to execute
  operations: FileOperation[];

  // Execution plan
  executionPlan: {
    order: string[];                 // Operation IDs in execution order
    parallelGroups: string[][];      // Operations that can run in parallel
    checkpoints: Checkpoint[];       // Points to verify before continuing
  };

  // Dependencies to install
  dependencies: {
    production: Record<string, string>;
    development: Record<string, string>;
  };

  // Database migrations
  migrations?: Migration[];

  // Environment variables needed
  environmentVariables: EnvironmentVariable[];

  // Post-generation commands
  postCommands: PostCommand[];
}

interface FileOperation {
  id: string;
  type: 'create' | 'modify' | 'delete' | 'rename' | 'move';
  path: string;

  // For create/modify operations
  content?: string;

  // For modify operations - surgical edits
  modifications?: FileModification[];

  // For rename/move operations
  newPath?: string;

  // Metadata
  description: string;
  relatedFeatures: string[];         // Feature IDs
  priority: 'critical' | 'high' | 'medium' | 'low';

  // Validation
  expectedHash?: string;             // SHA256 of expected content

  // Rollback information
  rollback?: {
    type: 'delete' | 'restore';
    originalContent?: string;
  };
}

interface FileModification {
  type: 'insert' | 'replace' | 'delete';

  // Location specification
  anchor: {
    type: 'line' | 'pattern' | 'ast';
    value: string | number;
    position?: 'before' | 'after' | 'replace';
  };

  // Content for insert/replace
  content?: string;

  // For pattern-based operations
  patternMatch?: string;
}

interface Checkpoint {
  id: string;
  afterOperations: string[];         // Operation IDs
  validation: {
    type: 'typecheck' | 'lint' | 'test' | 'build' | 'custom';
    command?: string;
    expectedResult: string;
  };
  onFailure: 'rollback' | 'pause' | 'continue';
}

interface Migration {
  name: string;
  description: string;
  sql?: string;
  prismaSchema?: string;
}

interface EnvironmentVariable {
  name: string;
  description: string;
  required: boolean;
  example: string;
  validation?: string;               // Regex pattern
}

interface PostCommand {
  command: string;
  description: string;
  runCondition?: 'always' | 'onSuccess' | 'onFailure';
  timeout?: number;
}
```

### 6.3.5 Code Generation Guidelines

#### Component Generation Pattern

```typescript
// Template for generating React components
const componentTemplate = `
{{#if isClientComponent}}
"use client";

{{/if}}
import { {{imports}} } from "{{importSource}}";
{{#each additionalImports}}
import { {{this.named}} } from "{{this.source}}";
{{/each}}

{{#if hasProps}}
interface {{componentName}}Props {
{{#each props}}
  {{name}}{{#unless required}}?{{/unless}}: {{type}};
{{/each}}
}

{{/if}}
{{#if isAsync}}async {{/if}}function {{componentName}}({{#if hasProps}}{ {{propDestructure}} }: {{componentName}}Props{{/if}}) {
{{#if hasServerData}}
  const data = await {{dataFetcher}};
{{/if}}
{{#if hasState}}
  const [{{stateName}}, set{{stateNameCapitalized}}] = useState({{stateDefault}});
{{/if}}

  return (
    {{jsx}}
  );
}

export { {{componentName}} };
{{#if isDefault}}
export default {{componentName}};
{{/if}}
`;
```

#### Server Action Pattern

```typescript
// Template for Server Actions
const serverActionTemplate = `
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const {{actionName}}Schema = z.object({
{{#each fields}}
  {{name}}: z.{{zodType}}({{#if zodArgs}}{{zodArgs}}{{/if}}){{#if optional}}.optional(){{/if}},
{{/each}}
});

export async function {{actionName}}(
  prevState: {{stateType}},
  formData: FormData
): Promise<{{stateType}}> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const validatedFields = {{actionName}}Schema.safeParse({
{{#each fields}}
    {{name}}: formData.get("{{name}}"),
{{/each}}
  });

  if (!validatedFields.success) {
    return {
      error: "Validation failed",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    {{implementation}}

    revalidatePath("{{revalidatePath}}");
    return { success: true };
  } catch (error) {
    console.error("{{actionName}} error:", error);
    return { error: "An unexpected error occurred" };
  }
}
`;
```

### 6.3.6 Framework-Specific Instructions

#### Next.js 15 Specifics

```markdown
## Next.js 15 Code Generation Rules

### App Router Structure
- All routes go in `app/` directory
- Use `page.tsx` for route components
- Use `layout.tsx` for shared layouts
- Use `loading.tsx` for Suspense boundaries
- Use `error.tsx` for error boundaries
- Use `not-found.tsx` for 404 pages

### Server Components (Default)
- Do NOT add "use client" unless necessary
- Fetch data directly in components
- Use async/await at component level
- Pass data as props to child components

### Client Components
Add "use client" ONLY for:
- useState, useEffect, useRef, etc.
- Event handlers (onClick, onChange)
- Browser APIs (window, document)
- Third-party client-only libraries

### Server Actions
- Create in `app/actions/` directory
- Add "use server" at file top
- Use Zod for validation
- Return typed response objects
- Call revalidatePath/revalidateTag after mutations

### Metadata API
```tsx
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
  openGraph: {
    title: "OG Title",
    description: "OG Description",
    images: ["/og-image.png"],
  },
};
```

### Route Handlers
```tsx
// app/api/items/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Implementation
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Implementation
  return NextResponse.json({ data }, { status: 201 });
}
```
```

#### Tailwind CSS v4 Specifics

```markdown
## Tailwind CSS v4 Code Generation Rules

### Configuration (CSS-based)
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.7 0.15 200);
  --color-secondary: oklch(0.6 0.12 280);
  --font-family-sans: "Inter", sans-serif;
  --spacing-18: 4.5rem;
}
```

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Use responsive variants: `md:flex lg:grid`

### Dark Mode
```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">Content</p>
</div>
```

### Component Styling
- Use `cn()` utility for conditional classes
- Prefer composition over complex conditionals
- Extract repeated patterns to components
```

#### shadcn/ui Integration

```markdown
## shadcn/ui Code Generation Rules

### Component Usage
- Import from `@/components/ui/`
- Use exact shadcn/ui API patterns
- Extend with custom variants when needed

### Form Pattern
```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});
```

### Dialog Pattern
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```
```

### 6.3.7 Error Handling Patterns to Inject

```typescript
// Standard error boundary for pages
const errorBoundaryTemplate = `
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
`;

// API error handling pattern
const apiErrorTemplate = `
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function handleAPIError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation error", details: error.errors },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A record with this value already exists" },
        { status: 409 }
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
`;

// Form error handling
const formErrorTemplate = `
"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { toast } from "sonner";

export function useFormWithToast<T extends { error?: string; success?: boolean }>(
  action: (prevState: T, formData: FormData) => Promise<T>,
  initialState: T
) {
  const [state, formAction] = useFormState(action, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success("Operation completed successfully");
    }
  }, [state]);

  return [state, formAction] as const;
}
`;
```

---

## 6.4 Agent C: Reviewer Agent

### 6.4.1 Purpose

The Reviewer Agent performs comprehensive code review on generated code, checking for quality, security vulnerabilities, performance issues, and adherence to best practices before code is committed.

### 6.4.2 System Prompt Template

```markdown
<system>
You are the **NexusGen Reviewer Agent**, a senior code reviewer with expertise in security, performance, and code quality. Your role is to review generated code and provide actionable feedback to improve code quality before deployment.

## Core Responsibilities

1. **Code Quality**: Ensure clean, maintainable, readable code
2. **Security**: Identify vulnerabilities and security risks
3. **Performance**: Flag performance issues and optimization opportunities
4. **Best Practices**: Verify adherence to framework conventions
5. **Accessibility**: Ensure WCAG compliance
6. **Type Safety**: Verify TypeScript best practices

## Review Process

For each file, perform these checks in order:

### 1. Security Review (Critical)
- [ ] No hardcoded secrets or API keys
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (proper escaping)
- [ ] CSRF protection where needed
- [ ] Authentication checks on protected routes
- [ ] Authorization checks for data access
- [ ] Secure headers configured
- [ ] No sensitive data in client components

### 2. Performance Review (High)
- [ ] No unnecessary client components
- [ ] Proper use of Server Components
- [ ] Efficient data fetching (no waterfalls)
- [ ] Image optimization (next/image)
- [ ] Font optimization (next/font)
- [ ] Bundle size considerations
- [ ] Proper caching strategies
- [ ] Database query efficiency

### 3. Code Quality Review (Medium)
- [ ] Consistent naming conventions
- [ ] Proper TypeScript types (no any)
- [ ] Error handling coverage
- [ ] Loading state handling
- [ ] Edge case handling
- [ ] Code duplication minimized
- [ ] Component composition appropriate
- [ ] Comments where needed

### 4. Accessibility Review (High)
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Focus management
- [ ] Color contrast ratios
- [ ] Screen reader compatibility
- [ ] Form labels and error messages

### 5. Framework Compliance (Medium)
- [ ] App Router patterns followed
- [ ] Server/Client component split correct
- [ ] Metadata API usage
- [ ] Server Actions patterns
- [ ] File organization standards

## Output Format

Provide structured review results with:
1. **Severity**: critical | high | medium | low | info
2. **Category**: security | performance | quality | accessibility | compliance
3. **Location**: File path and line numbers
4. **Issue**: Clear description of the problem
5. **Suggestion**: Specific fix with code example
6. **Effort**: trivial | simple | moderate | complex

## Critical Rules

1. ALWAYS flag security issues as critical
2. NEVER approve code with hardcoded secrets
3. ALWAYS provide actionable fix suggestions
4. PREFER specific line-level feedback
5. INCLUDE positive feedback for good patterns
</system>

<review_context>
## PRD Requirements
{{prd_summary}}

## Code Style Guide
{{style_guide}}

## Previous Review Findings
{{previous_findings}}
</review_context>

<task>
Review the following generated code:

{{generated_code}}
</task>
```

### 6.4.3 Review Criteria

```typescript
interface ReviewCriteria {
  security: SecurityCheck[];
  performance: PerformanceCheck[];
  quality: QualityCheck[];
  accessibility: AccessibilityCheck[];
  compliance: ComplianceCheck[];
}

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  pattern?: RegExp;                  // Pattern to detect
  validator: (code: string, ast?: AST) => CheckResult;
}

const securityChecks: SecurityCheck[] = [
  {
    id: 'SEC001',
    name: 'Hardcoded Secrets',
    description: 'Detect hardcoded API keys, passwords, or tokens',
    severity: 'critical',
    pattern: /(api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']+["']/i,
    validator: (code) => {
      const matches = code.match(/(api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']+["']/gi);
      if (matches) {
        return {
          passed: false,
          findings: matches.map(m => ({
            issue: 'Potential hardcoded secret detected',
            match: m,
            suggestion: 'Use environment variables: process.env.SECRET_NAME'
          }))
        };
      }
      return { passed: true };
    }
  },
  {
    id: 'SEC002',
    name: 'SQL Injection',
    description: 'Detect potential SQL injection vulnerabilities',
    severity: 'critical',
    validator: (code) => {
      // Check for string concatenation in queries
      const rawQueryPattern = /\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE)/i;
      const templateLiteralQuery = /`[^`]*(?:SELECT|INSERT|UPDATE|DELETE)[^`]*\$\{/i;

      if (rawQueryPattern.test(code) || templateLiteralQuery.test(code)) {
        return {
          passed: false,
          findings: [{
            issue: 'Potential SQL injection via string interpolation',
            suggestion: 'Use parameterized queries with Prisma or prepared statements'
          }]
        };
      }
      return { passed: true };
    }
  },
  {
    id: 'SEC003',
    name: 'XSS Prevention',
    description: 'Detect potential XSS vulnerabilities',
    severity: 'critical',
    validator: (code) => {
      if (code.includes('dangerouslySetInnerHTML')) {
        return {
          passed: false,
          findings: [{
            issue: 'Use of dangerouslySetInnerHTML detected',
            suggestion: 'Sanitize HTML with DOMPurify or use safer alternatives'
          }]
        };
      }
      return { passed: true };
    }
  },
  {
    id: 'SEC004',
    name: 'Authentication Check',
    description: 'Verify auth checks on protected routes',
    severity: 'high',
    validator: (code, context) => {
      // Check if route is marked as protected in PRD
      if (context?.isProtectedRoute) {
        const hasAuthCheck = code.includes('getServerSession') ||
                            code.includes('auth()') ||
                            code.includes('useSession');
        if (!hasAuthCheck) {
          return {
            passed: false,
            findings: [{
              issue: 'Protected route missing authentication check',
              suggestion: 'Add getServerSession() check at the start of the component'
            }]
          };
        }
      }
      return { passed: true };
    }
  }
];
```

### 6.4.4 Security Checks

```typescript
const comprehensiveSecurityChecks = {
  // Authentication & Authorization
  auth: {
    missingAuthCheck: {
      severity: 'critical',
      check: (file: string, prd: PRD) => {
        const route = extractRoute(file);
        const isProtected = prd.pages.find(p => p.route === route)?.accessControl.requiresAuth;
        if (isProtected && !hasAuthCheck(file)) {
          return { issue: 'Protected route missing auth check' };
        }
      }
    },

    insecureSessionStorage: {
      severity: 'high',
      pattern: /localStorage\.setItem\([^)]*(?:token|session|auth)/i,
      suggestion: 'Use httpOnly cookies for session storage'
    },

    missingCSRF: {
      severity: 'high',
      check: (file: string) => {
        if (file.includes('method: "POST"') && !file.includes('csrf')) {
          return { issue: 'POST request without CSRF protection' };
        }
      }
    }
  },

  // Data Validation
  validation: {
    missingInputValidation: {
      severity: 'high',
      check: (file: string) => {
        if (file.includes('formData.get') && !file.includes('z.') && !file.includes('schema')) {
          return { issue: 'Form data accessed without validation' };
        }
      }
    },

    unsafeTypeAssertion: {
      severity: 'medium',
      pattern: /as\s+(?!const)[A-Z][a-zA-Z]+/,
      suggestion: 'Use type guards or Zod for runtime validation'
    }
  },

  // Data Exposure
  exposure: {
    sensitiveDataInClient: {
      severity: 'critical',
      check: (file: string) => {
        if (file.includes('"use client"')) {
          const sensitivePatterns = [
            /password/i, /secret/i, /apiKey/i, /token(?!ize)/i,
            /creditCard/i, /ssn/i, /socialSecurity/i
          ];
          for (const pattern of sensitivePatterns) {
            if (pattern.test(file)) {
              return { issue: 'Potentially sensitive data in client component' };
            }
          }
        }
      }
    },

    excessiveDataFetching: {
      severity: 'medium',
      check: (file: string) => {
        if (file.includes('select: {') === false && file.includes('prisma.')) {
          return { issue: 'Consider using select to limit returned fields' };
        }
      }
    }
  },

  // Headers & Configuration
  headers: {
    missingSecurityHeaders: {
      severity: 'medium',
      check: (file: string) => {
        if (file.includes('next.config')) {
          if (!file.includes('X-Frame-Options') || !file.includes('X-Content-Type-Options')) {
            return { issue: 'Missing recommended security headers' };
          }
        }
      }
    }
  }
};
```

### 6.4.5 Performance Considerations

```typescript
const performanceChecks = {
  // Server vs Client Components
  componentType: {
    unnecessaryClientComponent: {
      severity: 'medium',
      check: (file: string) => {
        if (file.includes('"use client"')) {
          const needsClient =
            file.includes('useState') ||
            file.includes('useEffect') ||
            file.includes('onClick') ||
            file.includes('onChange') ||
            file.includes('onSubmit');

          if (!needsClient) {
            return {
              issue: 'Client component without client-side interactivity',
              suggestion: 'Remove "use client" to make this a Server Component'
            };
          }
        }
      }
    },

    serverComponentWithHooks: {
      severity: 'critical',
      check: (file: string) => {
        if (!file.includes('"use client"')) {
          if (file.includes('useState') || file.includes('useEffect')) {
            return { issue: 'Server Component using client hooks' };
          }
        }
      }
    }
  },

  // Data Fetching
  dataFetching: {
    waterfallFetching: {
      severity: 'high',
      check: (file: string) => {
        const awaitCount = (file.match(/await\s+/g) || []).length;
        const parallelPatterns = file.includes('Promise.all') || file.includes('Promise.allSettled');

        if (awaitCount > 2 && !parallelPatterns) {
          return {
            issue: 'Sequential data fetching detected',
            suggestion: 'Use Promise.all() for parallel fetching'
          };
        }
      }
    },

    missingCaching: {
      severity: 'medium',
      check: (file: string) => {
        if (file.includes('fetch(') && !file.includes('cache:') && !file.includes('revalidate')) {
          return { issue: 'Fetch without explicit caching strategy' };
        }
      }
    },

    nPlusOneQuery: {
      severity: 'high',
      pattern: /\.map\([^)]*await.*prisma\./,
      suggestion: 'Use include/select with relations instead of N+1 queries'
    }
  },

  // Assets
  assets: {
    unoptimizedImages: {
      severity: 'medium',
      pattern: /<img\s/,
      suggestion: 'Use next/image for automatic optimization'
    },

    missingImageDimensions: {
      severity: 'low',
      check: (file: string) => {
        if (file.includes('<Image') && (!file.includes('width=') || !file.includes('height='))) {
          if (!file.includes('fill')) {
            return { issue: 'Image missing width/height or fill prop' };
          }
        }
      }
    },

    unoptimizedFonts: {
      severity: 'low',
      pattern: /@import.*fonts\.googleapis/,
      suggestion: 'Use next/font for automatic font optimization'
    }
  },

  // Bundle Size
  bundle: {
    largeImport: {
      severity: 'medium',
      pattern: /import\s+\*\s+as/,
      suggestion: 'Use named imports to enable tree-shaking'
    },

    momentJs: {
      severity: 'medium',
      pattern: /from\s+['"]moment['"]/,
      suggestion: 'Use date-fns or dayjs for smaller bundle size'
    },

    lodashFull: {
      severity: 'medium',
      pattern: /from\s+['"]lodash['"]/,
      suggestion: 'Import specific functions: import debounce from "lodash/debounce"'
    }
  }
};
```

### 6.4.6 Review Output Schema

```typescript
interface ReviewOutput {
  // Summary
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: boolean;               // No critical/high issues
    score: number;                 // 0-100 quality score
  };

  // Detailed findings
  findings: ReviewFinding[];

  // Positive observations
  commendations: Commendation[];

  // Aggregate suggestions
  suggestions: {
    security: string[];
    performance: string[];
    quality: string[];
    accessibility: string[];
  };

  // Approval status
  approval: {
    status: 'approved' | 'changes_requested' | 'blocked';
    blockers: string[];
    requiredChanges: RequiredChange[];
  };
}

interface ReviewFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'performance' | 'quality' | 'accessibility' | 'compliance';

  location: {
    file: string;
    startLine: number;
    endLine: number;
    column?: number;
  };

  issue: string;
  explanation: string;
  suggestion: string;

  codeExample?: {
    before: string;
    after: string;
  };

  effort: 'trivial' | 'simple' | 'moderate' | 'complex';
  autoFixable: boolean;
  autoFix?: FileModification;

  references?: string[];          // Links to docs
}

interface RequiredChange {
  finding: string;                // Finding ID
  reason: string;
  acceptanceCriteria: string;
}

interface Commendation {
  file: string;
  observation: string;
  category: string;
}
```

---

## 6.5 RAG Strategy (Retrieval Augmented Generation)

### 6.5.1 Documentation Retrieval Architecture

```typescript
interface RAGArchitecture {
  // Document sources
  sources: DocumentSource[];

  // Processing pipeline
  pipeline: {
    ingestion: IngestionConfig;
    chunking: ChunkingConfig;
    embedding: EmbeddingConfig;
    storage: StorageConfig;
    retrieval: RetrievalConfig;
  };

  // Cache layer
  cache: CacheConfig;

  // Update mechanism
  updates: UpdateConfig;
}

interface DocumentSource {
  id: string;
  name: string;
  type: 'official_docs' | 'github' | 'npm' | 'changelog';
  url: string;
  priority: number;                // Higher = more authoritative
  updateFrequency: 'daily' | 'weekly' | 'on_release';

  // Version tracking
  versionSelector?: string;        // CSS selector or API path
  currentVersion?: string;
}

const documentSources: DocumentSource[] = [
  {
    id: 'nextjs-docs',
    name: 'Next.js Documentation',
    type: 'official_docs',
    url: 'https://nextjs.org/docs',
    priority: 100,
    updateFrequency: 'daily',
    versionSelector: '/docs/app'
  },
  {
    id: 'react-docs',
    name: 'React Documentation',
    type: 'official_docs',
    url: 'https://react.dev',
    priority: 95,
    updateFrequency: 'weekly'
  },
  {
    id: 'tailwind-docs',
    name: 'Tailwind CSS Documentation',
    type: 'official_docs',
    url: 'https://tailwindcss.com/docs',
    priority: 90,
    updateFrequency: 'on_release'
  },
  {
    id: 'prisma-docs',
    name: 'Prisma Documentation',
    type: 'official_docs',
    url: 'https://www.prisma.io/docs',
    priority: 85,
    updateFrequency: 'weekly'
  },
  {
    id: 'nextauth-docs',
    name: 'NextAuth.js Documentation',
    type: 'official_docs',
    url: 'https://authjs.dev',
    priority: 85,
    updateFrequency: 'weekly'
  },
  {
    id: 'shadcn-docs',
    name: 'shadcn/ui Documentation',
    type: 'github',
    url: 'https://ui.shadcn.com',
    priority: 80,
    updateFrequency: 'weekly'
  },
  {
    id: 'nextjs-changelog',
    name: 'Next.js Changelog',
    type: 'changelog',
    url: 'https://github.com/vercel/next.js/releases',
    priority: 100,
    updateFrequency: 'daily'
  }
];
```

### 6.5.2 Document Chunking Strategy

```typescript
interface ChunkingConfig {
  strategy: 'semantic' | 'fixed' | 'hybrid';

  // Chunk size parameters
  targetChunkSize: number;          // Target tokens per chunk
  maxChunkSize: number;             // Hard limit
  minChunkSize: number;             // Minimum viable chunk

  // Overlap for context preservation
  overlapSize: number;              // Tokens to overlap
  overlapStrategy: 'sliding' | 'sentence_boundary';

  // Semantic chunking
  semanticBoundaries: string[];     // e.g., ['## ', '### ', '```']
  preserveCodeBlocks: boolean;
  preserveTables: boolean;

  // Metadata extraction
  extractMetadata: boolean;
  metadataFields: string[];
}

const chunkingConfig: ChunkingConfig = {
  strategy: 'hybrid',

  targetChunkSize: 512,            // ~512 tokens
  maxChunkSize: 1024,              // Never exceed 1024
  minChunkSize: 100,               // Minimum 100 tokens

  overlapSize: 50,                 // 50 token overlap
  overlapStrategy: 'sentence_boundary',

  semanticBoundaries: [
    '# ',                          // H1
    '## ',                         // H2
    '### ',                        // H3
    '```',                         // Code blocks
    '---',                         // Horizontal rules
    '\n\n',                        // Double newlines
  ],

  preserveCodeBlocks: true,
  preserveTables: true,

  extractMetadata: true,
  metadataFields: [
    'title',
    'section',
    'subsection',
    'version',
    'lastUpdated',
    'url',
    'codeLanguage'
  ]
};

// Chunking implementation
class SemanticChunker {
  constructor(private config: ChunkingConfig) {}

  chunk(document: Document): Chunk[] {
    const chunks: Chunk[] = [];

    // First pass: split by semantic boundaries
    let sections = this.splitByBoundaries(document.content);

    // Second pass: ensure size constraints
    for (const section of sections) {
      if (this.tokenCount(section) > this.config.maxChunkSize) {
        // Split large sections
        chunks.push(...this.splitLargeSection(section));
      } else if (this.tokenCount(section) < this.config.minChunkSize) {
        // Merge small sections
        this.mergeWithPrevious(chunks, section);
      } else {
        chunks.push(this.createChunk(section, document));
      }
    }

    // Third pass: add overlap
    return this.addOverlap(chunks);
  }

  private splitByBoundaries(content: string): string[] {
    let sections: string[] = [content];

    for (const boundary of this.config.semanticBoundaries) {
      sections = sections.flatMap(s => {
        // Special handling for code blocks
        if (boundary === '```' && this.config.preserveCodeBlocks) {
          return this.splitPreservingCodeBlocks(s);
        }
        return s.split(boundary).filter(Boolean);
      });
    }

    return sections;
  }

  private createChunk(content: string, document: Document): Chunk {
    return {
      id: generateChunkId(),
      content,
      metadata: {
        sourceId: document.id,
        sourceName: document.name,
        sourceUrl: document.url,
        section: this.extractSection(content),
        version: document.version,
        tokenCount: this.tokenCount(content),
        hasCode: content.includes('```'),
        createdAt: new Date().toISOString()
      }
    };
  }
}
```

### 6.5.3 Vector Database Choice

```typescript
interface VectorDBConfig {
  provider: 'pinecone' | 'weaviate' | 'pgvector' | 'qdrant';

  // Connection
  connectionString?: string;
  apiKey?: string;

  // Index configuration
  indexName: string;
  dimensions: number;               // Must match embedding model
  metric: 'cosine' | 'euclidean' | 'dotProduct';

  // Performance tuning
  replicas?: number;
  shards?: number;

  // Filtering capabilities
  metadataFields: MetadataFieldConfig[];
}

// Recommended: pgvector for simplicity and cost
const pgvectorConfig: VectorDBConfig = {
  provider: 'pgvector',
  connectionString: process.env.DATABASE_URL,

  indexName: 'nexusgen_docs',
  dimensions: 1536,                 // OpenAI ada-002
  metric: 'cosine',

  metadataFields: [
    { name: 'source', type: 'string', indexed: true },
    { name: 'version', type: 'string', indexed: true },
    { name: 'section', type: 'string', indexed: true },
    { name: 'hasCode', type: 'boolean', indexed: true },
    { name: 'updatedAt', type: 'timestamp', indexed: true }
  ]
};

// Alternative: Pinecone for scale
const pineconeConfig: VectorDBConfig = {
  provider: 'pinecone',
  apiKey: process.env.PINECONE_API_KEY,

  indexName: 'nexusgen-docs',
  dimensions: 1536,
  metric: 'cosine',

  replicas: 2,
  shards: 1,

  metadataFields: [
    { name: 'source', type: 'string', indexed: true },
    { name: 'version', type: 'string', indexed: true },
    { name: 'section', type: 'string', indexed: true }
  ]
};

// Schema for pgvector
const pgvectorSchema = `
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documentation chunks table
CREATE TABLE doc_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536),

  -- Metadata
  source_id VARCHAR(100) NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  source_url TEXT,
  section VARCHAR(500),
  version VARCHAR(50),
  has_code BOOLEAN DEFAULT false,
  token_count INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  CONSTRAINT fk_source FOREIGN KEY (source_id)
    REFERENCES doc_sources(id) ON DELETE CASCADE
);

-- Vector similarity index (IVFFlat for speed)
CREATE INDEX ON doc_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Metadata indexes
CREATE INDEX idx_source ON doc_chunks(source_id);
CREATE INDEX idx_version ON doc_chunks(version);
CREATE INDEX idx_section ON doc_chunks(section);
CREATE INDEX idx_updated ON doc_chunks(updated_at);

-- Full-text search for hybrid retrieval
CREATE INDEX idx_content_fts ON doc_chunks
  USING gin(to_tsvector('english', content));
`;
```

### 6.5.4 Embedding Model Selection

```typescript
interface EmbeddingConfig {
  provider: 'openai' | 'cohere' | 'voyage' | 'local';
  model: string;
  dimensions: number;

  // Batching
  batchSize: number;
  maxRetries: number;

  // Cost optimization
  cacheEmbeddings: boolean;
  cacheExpiry: number;              // seconds

  // Query optimization
  queryPrefix?: string;             // Prefix for query embeddings
  documentPrefix?: string;          // Prefix for document embeddings
}

// Recommended: OpenAI text-embedding-3-small for balance of cost/quality
const embeddingConfig: EmbeddingConfig = {
  provider: 'openai',
  model: 'text-embedding-3-small',
  dimensions: 1536,

  batchSize: 100,
  maxRetries: 3,

  cacheEmbeddings: true,
  cacheExpiry: 86400 * 7,           // 7 days

  // Optimized prefixes for code documentation
  queryPrefix: 'search_query: ',
  documentPrefix: 'search_document: '
};

// Alternative: Voyage AI for code-specific embeddings
const voyageConfig: EmbeddingConfig = {
  provider: 'voyage',
  model: 'voyage-code-2',
  dimensions: 1536,

  batchSize: 50,
  maxRetries: 3,

  cacheEmbeddings: true,
  cacheExpiry: 86400 * 7
};

// Embedding service implementation
class EmbeddingService {
  private cache: Map<string, number[]> = new Map();

  constructor(private config: EmbeddingConfig) {}

  async embedQuery(query: string): Promise<number[]> {
    const prefixedQuery = this.config.queryPrefix
      ? `${this.config.queryPrefix}${query}`
      : query;

    return this.embed(prefixedQuery);
  }

  async embedDocument(content: string): Promise<number[]> {
    const prefixedContent = this.config.documentPrefix
      ? `${this.config.documentPrefix}${content}`
      : content;

    return this.embed(prefixedContent);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const batches = this.chunkArray(texts, this.config.batchSize);
    const results: number[][] = [];

    for (const batch of batches) {
      const embeddings = await this.embedBatchWithRetry(batch);
      results.push(...embeddings);
    }

    return results;
  }

  private async embed(text: string): Promise<number[]> {
    const cacheKey = this.getCacheKey(text);

    if (this.config.cacheEmbeddings && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const embedding = await this.callEmbeddingAPI(text);

    if (this.config.cacheEmbeddings) {
      this.cache.set(cacheKey, embedding);
    }

    return embedding;
  }
}
```

### 6.5.5 Context Window Management

```typescript
interface ContextWindowConfig {
  // Model constraints
  maxContextTokens: number;         // Model's context limit
  reservedForOutput: number;        // Tokens reserved for generation
  reservedForSystem: number;        // Tokens for system prompt

  // Available for RAG
  availableForRAG: number;

  // Retrieval configuration
  retrieval: {
    topK: number;                   // Initial retrieval count
    maxChunks: number;              // After reranking
    diversityFactor: number;        // MMR diversity (0-1)
  };

  // Reranking
  reranking: {
    enabled: boolean;
    model?: string;
    threshold: number;              // Minimum relevance score
  };

  // Context construction
  construction: {
    includeMetadata: boolean;
    includeSource: boolean;
    separatorTemplate: string;
  };
}

const contextConfig: ContextWindowConfig = {
  maxContextTokens: 128000,         // Claude's context
  reservedForOutput: 8000,          // Max output tokens
  reservedForSystem: 4000,          // System prompt

  availableForRAG: 16000,           // ~16K for retrieved docs

  retrieval: {
    topK: 20,                       // Retrieve 20 initially
    maxChunks: 10,                  // Keep top 10 after reranking
    diversityFactor: 0.3            // 30% diversity weight
  },

  reranking: {
    enabled: true,
    model: 'cohere-rerank-v3',
    threshold: 0.5
  },

  construction: {
    includeMetadata: true,
    includeSource: true,
    separatorTemplate: '\n---\n[Source: {{source}} | Section: {{section}} | Version: {{version}}]\n'
  }
};

// Context manager implementation
class ContextWindowManager {
  constructor(private config: ContextWindowConfig) {}

  async buildContext(query: string, chunks: RetrievedChunk[]): Promise<string> {
    // Step 1: Rerank if enabled
    let rankedChunks = chunks;
    if (this.config.reranking.enabled) {
      rankedChunks = await this.rerank(query, chunks);
    }

    // Step 2: Apply MMR for diversity
    rankedChunks = this.applyMMR(rankedChunks, this.config.retrieval.diversityFactor);

    // Step 3: Fit to token budget
    const fittedChunks = this.fitToTokenBudget(
      rankedChunks,
      this.config.availableForRAG
    );

    // Step 4: Construct context string
    return this.constructContext(fittedChunks);
  }

  private applyMMR(chunks: RetrievedChunk[], lambda: number): RetrievedChunk[] {
    // Maximal Marginal Relevance for diversity
    const selected: RetrievedChunk[] = [];
    const candidates = [...chunks];

    while (selected.length < this.config.retrieval.maxChunks && candidates.length > 0) {
      let bestScore = -Infinity;
      let bestIdx = -1;

      for (let i = 0; i < candidates.length; i++) {
        const relevance = candidates[i].score;
        const maxSimilarity = selected.length > 0
          ? Math.max(...selected.map(s => this.cosineSimilarity(s.embedding, candidates[i].embedding)))
          : 0;

        const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarity;

        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIdx = i;
        }
      }

      selected.push(candidates.splice(bestIdx, 1)[0]);
    }

    return selected;
  }

  private fitToTokenBudget(chunks: RetrievedChunk[], budget: number): RetrievedChunk[] {
    const fitted: RetrievedChunk[] = [];
    let usedTokens = 0;

    for (const chunk of chunks) {
      const chunkTokens = chunk.tokenCount + 50; // +50 for metadata

      if (usedTokens + chunkTokens <= budget) {
        fitted.push(chunk);
        usedTokens += chunkTokens;
      } else {
        break;
      }
    }

    return fitted;
  }

  private constructContext(chunks: RetrievedChunk[]): string {
    return chunks.map(chunk => {
      let context = '';

      if (this.config.construction.includeMetadata) {
        context += this.config.construction.separatorTemplate
          .replace('{{source}}', chunk.metadata.sourceName)
          .replace('{{section}}', chunk.metadata.section || 'General')
          .replace('{{version}}', chunk.metadata.version || 'latest');
      }

      context += chunk.content;

      return context;
    }).join('\n\n');
  }
}
```

### 6.5.6 Cache Invalidation for Doc Updates

```typescript
interface CacheInvalidationConfig {
  // TTL-based invalidation
  defaultTTL: number;               // seconds
  sourceTTLOverrides: Record<string, number>;

  // Version-based invalidation
  versionCheckInterval: number;     // seconds
  versionEndpoints: Record<string, string>;

  // Event-based invalidation
  webhookEnabled: boolean;
  webhookSecret: string;

  // Incremental updates
  incrementalEnabled: boolean;
  diffThreshold: number;            // % change to trigger full refresh
}

const cacheConfig: CacheInvalidationConfig = {
  defaultTTL: 86400,                // 24 hours
  sourceTTLOverrides: {
    'nextjs-changelog': 3600,       // 1 hour for changelogs
    'nextjs-docs': 43200,           // 12 hours for main docs
  },

  versionCheckInterval: 3600,       // Check versions hourly
  versionEndpoints: {
    'nextjs': 'https://api.github.com/repos/vercel/next.js/releases/latest',
    'react': 'https://api.github.com/repos/facebook/react/releases/latest',
    'tailwind': 'https://api.github.com/repos/tailwindlabs/tailwindcss/releases/latest'
  },

  webhookEnabled: true,
  webhookSecret: process.env.WEBHOOK_SECRET!,

  incrementalEnabled: true,
  diffThreshold: 0.3                // 30% change = full refresh
};

// Cache invalidation service
class CacheInvalidationService {
  private versionCache: Map<string, string> = new Map();

  constructor(
    private config: CacheInvalidationConfig,
    private vectorDB: VectorDBClient,
    private ingestionPipeline: IngestionPipeline
  ) {}

  async startVersionMonitoring() {
    setInterval(async () => {
      await this.checkVersionUpdates();
    }, this.config.versionCheckInterval * 1000);
  }

  async checkVersionUpdates() {
    for (const [source, endpoint] of Object.entries(this.config.versionEndpoints)) {
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        const latestVersion = data.tag_name || data.version;

        const cachedVersion = this.versionCache.get(source);

        if (cachedVersion && cachedVersion !== latestVersion) {
          console.log(`Version update detected for ${source}: ${cachedVersion} -> ${latestVersion}`);
          await this.invalidateSource(source, latestVersion);
        }

        this.versionCache.set(source, latestVersion);
      } catch (error) {
        console.error(`Failed to check version for ${source}:`, error);
      }
    }
  }

  async invalidateSource(sourceId: string, newVersion: string) {
    // Mark existing chunks as stale
    await this.vectorDB.updateMetadata({
      filter: { sourceId },
      update: { stale: true }
    });

    // Trigger re-ingestion
    await this.ingestionPipeline.ingestSource(sourceId, {
      version: newVersion,
      incremental: this.config.incrementalEnabled
    });

    // Delete stale chunks after successful ingestion
    await this.vectorDB.delete({
      filter: { sourceId, stale: true }
    });
  }

  // Webhook handler for real-time invalidation
  async handleWebhook(payload: WebhookPayload, signature: string) {
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const { source, action, version } = payload;

    if (action === 'release') {
      await this.invalidateSource(source, version);
    } else if (action === 'page_update') {
      await this.invalidatePage(source, payload.pageUrl);
    }
  }

  private async invalidatePage(sourceId: string, pageUrl: string) {
    // Delete specific page chunks
    await this.vectorDB.delete({
      filter: { sourceId, sourceUrl: pageUrl }
    });

    // Re-ingest single page
    await this.ingestionPipeline.ingestPage(sourceId, pageUrl);
  }
}
```

### 6.5.7 Preventing Deprecated Code Generation

```typescript
interface DeprecationPreventionConfig {
  // Deprecation sources
  sources: DeprecationSource[];

  // Detection rules
  rules: DeprecationRule[];

  // Enforcement
  enforcement: {
    blockDeprecated: boolean;
    suggestAlternatives: boolean;
    addWarningComments: boolean;
  };
}

interface DeprecationSource {
  id: string;
  name: string;
  type: 'changelog' | 'migration_guide' | 'deprecation_list';
  url: string;
  parser: string;                   // Parser function name
}

interface DeprecationRule {
  id: string;
  pattern: string | RegExp;
  framework: string;
  deprecatedIn: string;             // Version deprecated
  removedIn?: string;               // Version removed
  replacement: string;
  severity: 'warning' | 'error';
  migrationGuide?: string;
}

// Comprehensive deprecation rules
const deprecationRules: DeprecationRule[] = [
  // Next.js Pages Router (when using App Router)
  {
    id: 'NEXT_PAGES_ROUTER',
    pattern: /pages\/.*\.(tsx?|jsx?)$/,
    framework: 'next.js',
    deprecatedIn: '13.0.0',
    replacement: 'Use App Router with app/ directory',
    severity: 'warning',
    migrationGuide: 'https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration'
  },

  // Next.js getServerSideProps
  {
    id: 'NEXT_GETSERVERSIDEPROPS',
    pattern: /export\s+(async\s+)?function\s+getServerSideProps/,
    framework: 'next.js',
    deprecatedIn: '13.0.0',
    replacement: 'Use async Server Components or fetch with cache options',
    severity: 'error'
  },

  // Next.js getStaticProps
  {
    id: 'NEXT_GETSTATICPROPS',
    pattern: /export\s+(async\s+)?function\s+getStaticProps/,
    framework: 'next.js',
    deprecatedIn: '13.0.0',
    replacement: 'Use async Server Components with generateStaticParams',
    severity: 'error'
  },

  // React useEffect for data fetching
  {
    id: 'REACT_USEEFFECT_FETCH',
    pattern: /useEffect\([^)]*fetch\(/,
    framework: 'react',
    deprecatedIn: '18.0.0',
    replacement: 'Use Server Components or React Query/SWR for data fetching',
    severity: 'warning'
  },

  // Next.js Image from 'next/legacy/image'
  {
    id: 'NEXT_LEGACY_IMAGE',
    pattern: /from\s+['"]next\/legacy\/image['"]/,
    framework: 'next.js',
    deprecatedIn: '13.0.0',
    replacement: "Use next/image with the new API",
    severity: 'error'
  },

  // Tailwind @apply in complex scenarios
  {
    id: 'TAILWIND_APPLY_ABUSE',
    pattern: /@apply\s+[^;]+\s+[^;]+\s+[^;]+\s+[^;]+\s+[^;]+/,
    framework: 'tailwind',
    deprecatedIn: '3.0.0',
    replacement: 'Create components instead of excessive @apply usage',
    severity: 'warning'
  },

  // Old NextAuth.js patterns
  {
    id: 'NEXTAUTH_OLD_IMPORT',
    pattern: /from\s+['"]next-auth\/react['"]/,
    framework: 'next-auth',
    deprecatedIn: '5.0.0',
    replacement: 'Use @auth/nextjs for NextAuth.js v5',
    severity: 'error'
  },

  // Prisma deprecated methods
  {
    id: 'PRISMA_COUNT_DEPRECATED',
    pattern: /\.count\(\{[^}]*select:/,
    framework: 'prisma',
    deprecatedIn: '4.0.0',
    replacement: 'Use _count instead of select in count queries',
    severity: 'warning'
  }
];

// Deprecation prevention service
class DeprecationPreventionService {
  constructor(
    private rules: DeprecationRule[],
    private config: DeprecationPreventionConfig
  ) {}

  // Check code before generation
  validateGeneratedCode(code: string, context: GenerationContext): ValidationResult {
    const findings: DeprecationFinding[] = [];

    for (const rule of this.rules) {
      const pattern = typeof rule.pattern === 'string'
        ? new RegExp(rule.pattern, 'g')
        : rule.pattern;

      const matches = code.match(pattern);

      if (matches) {
        findings.push({
          rule,
          matches,
          locations: this.findLocations(code, pattern)
        });
      }
    }

    // Check against current framework versions
    const versionIssues = this.checkVersionCompatibility(code, context.frameworkVersions);
    findings.push(...versionIssues);

    return {
      valid: findings.filter(f => f.rule.severity === 'error').length === 0,
      findings,
      suggestions: findings.map(f => ({
        issue: `Deprecated: ${f.rule.pattern}`,
        replacement: f.rule.replacement,
        migrationGuide: f.rule.migrationGuide
      }))
    };
  }

  // Inject context into RAG to prevent deprecated patterns
  getDeprecationContext(query: string, frameworks: string[]): string {
    const relevantRules = this.rules.filter(r => frameworks.includes(r.framework));

    return `
## IMPORTANT: Deprecated Patterns to Avoid

The following patterns are deprecated and MUST NOT be used:

${relevantRules.map(r => `
### ${r.id}
- Pattern: ${r.pattern}
- Deprecated in: ${r.framework} ${r.deprecatedIn}
- Use instead: ${r.replacement}
`).join('\n')}

When generating code, ensure you use the modern alternatives listed above.
    `;
  }

  // Add to system prompt
  getSystemPromptAddition(): string {
    return `
## Deprecation Awareness

You MUST avoid deprecated patterns. Key deprecations to remember:

1. **Next.js**: Use App Router (app/), not Pages Router (pages/)
2. **Next.js**: Use Server Components, not getServerSideProps/getStaticProps
3. **React**: Use Server Components for data fetching, not useEffect + fetch
4. **Next.js Image**: Use next/image, not next/legacy/image
5. **NextAuth.js**: Use v5 patterns with @auth/nextjs

If you're unsure about a pattern's deprecation status, prefer the newer pattern.
    `;
  }
}
```

---

## 6.6 Agent Orchestration

### 6.6.1 Multi-Agent Coordination

```typescript
interface OrchestrationConfig {
  // Execution mode
  mode: 'sequential' | 'parallel' | 'adaptive';

  // Agent configuration
  agents: AgentConfig[];

  // Communication
  messaging: MessagingConfig;

  // State management
  state: StateConfig;

  // Error handling
  errorHandling: ErrorHandlingConfig;

  // Monitoring
  monitoring: MonitoringConfig;
}

interface AgentConfig {
  id: string;
  name: string;
  type: 'architect' | 'coder' | 'reviewer' | 'custom';
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  retries: number;

  // Dependencies
  dependsOn: string[];              // Agent IDs

  // Conditions
  runCondition?: (state: OrchestratorState) => boolean;
}

const orchestrationConfig: OrchestrationConfig = {
  mode: 'adaptive',

  agents: [
    {
      id: 'architect',
      name: 'Architect Agent',
      type: 'architect',
      model: 'claude-opus-4-5-20251101',
      temperature: 0.7,
      maxTokens: 16000,
      timeout: 120000,
      retries: 2,
      dependsOn: []
    },
    {
      id: 'coder',
      name: 'Coder Agent',
      type: 'coder',
      model: 'claude-opus-4-5-20251101',
      temperature: 0.3,
      maxTokens: 32000,
      timeout: 180000,
      retries: 3,
      dependsOn: ['architect']
    },
    {
      id: 'reviewer',
      name: 'Reviewer Agent',
      type: 'reviewer',
      model: 'claude-opus-4-5-20251101',
      temperature: 0.2,
      maxTokens: 8000,
      timeout: 60000,
      retries: 2,
      dependsOn: ['coder']
    }
  ],

  messaging: {
    protocol: 'internal',
    serialization: 'json',
    compression: true,
    encryption: false
  },

  state: {
    persistence: 'redis',
    snapshotInterval: 30000,
    maxSnapshots: 10
  },

  errorHandling: {
    strategy: 'retry_then_rollback',
    maxRetries: 3,
    backoffMultiplier: 2,
    rollbackOnCritical: true
  },

  monitoring: {
    enabled: true,
    metricsInterval: 5000,
    tracing: true
  }
};

// Orchestrator implementation
class AgentOrchestrator {
  private state: OrchestratorState;
  private agents: Map<string, Agent>;
  private messageQueue: MessageQueue;

  constructor(private config: OrchestrationConfig) {
    this.state = new OrchestratorState();
    this.agents = new Map();
    this.messageQueue = new MessageQueue(config.messaging);

    this.initializeAgents();
  }

  async execute(request: GenerationRequest): Promise<GenerationResult> {
    const executionId = generateExecutionId();

    try {
      // Initialize state
      this.state.initialize(executionId, request);

      // Phase 1: Architecture
      const prd = await this.runAgent('architect', {
        userRequirements: request.requirements,
        userAssets: request.assets,
        userPreferences: request.preferences
      });

      this.state.setPRD(prd);
      await this.checkpoint('post_architect');

      // Phase 2: Code Generation (potentially iterative)
      let codeResult: CoderAgentOutput;
      let reviewResult: ReviewOutput;
      let iterations = 0;
      const maxIterations = 3;

      do {
        // Generate code
        codeResult = await this.runAgent('coder', {
          prd: this.state.prd,
          existingContext: this.state.codeContext,
          ragContext: await this.fetchRAGContext(prd),
          previousIteration: iterations > 0 ? {
            operations: this.state.lastOperations,
            reviewFeedback: reviewResult!.findings
          } : undefined
        });

        this.state.setOperations(codeResult.operations);
        await this.checkpoint('post_coder');

        // Review code
        reviewResult = await this.runAgent('reviewer', {
          generatedCode: codeResult,
          prd: this.state.prd
        });

        this.state.setReview(reviewResult);
        await this.checkpoint('post_reviewer');

        iterations++;

      } while (
        reviewResult.approval.status === 'changes_requested' &&
        iterations < maxIterations
      );

      // Check final approval
      if (reviewResult.approval.status === 'blocked') {
        throw new GenerationError('Code review blocked', reviewResult.approval.blockers);
      }

      // Execute file operations
      const executionResult = await this.executeOperations(codeResult.operations);

      // Final state
      this.state.complete(executionResult);

      return {
        success: true,
        executionId,
        prd,
        operations: codeResult.operations,
        review: reviewResult,
        executionResult
      };

    } catch (error) {
      await this.handleError(executionId, error);
      throw error;
    }
  }

  private async runAgent<T>(agentId: string, input: unknown): Promise<T> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    const config = this.config.agents.find(a => a.id === agentId)!;

    // Check run condition
    if (config.runCondition && !config.runCondition(this.state)) {
      throw new Error(`Agent ${agentId} run condition not met`);
    }

    // Execute with retries
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < config.retries; attempt++) {
      try {
        const result = await agent.execute(input, {
          timeout: config.timeout,
          temperature: config.temperature,
          maxTokens: config.maxTokens
        });

        // Emit success event
        this.messageQueue.emit({
          type: 'agent_success',
          agentId,
          attempt,
          duration: result.duration
        });

        return result.output as T;

      } catch (error) {
        lastError = error as Error;

        // Emit failure event
        this.messageQueue.emit({
          type: 'agent_failure',
          agentId,
          attempt,
          error: lastError.message
        });

        // Exponential backoff
        if (attempt < config.retries - 1) {
          await sleep(1000 * Math.pow(this.config.errorHandling.backoffMultiplier, attempt));
        }
      }
    }

    throw new AgentError(`Agent ${agentId} failed after ${config.retries} attempts`, lastError);
  }
}
```

### 6.6.2 Message Passing Between Agents

```typescript
interface Message {
  id: string;
  type: MessageType;
  source: string;                   // Agent ID
  target: string;                   // Agent ID or 'broadcast'
  payload: unknown;
  metadata: MessageMetadata;
  timestamp: string;
}

type MessageType =
  | 'request'
  | 'response'
  | 'event'
  | 'error'
  | 'checkpoint'
  | 'rollback';

interface MessageMetadata {
  executionId: string;
  correlationId: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  ttl?: number;
  retryCount?: number;
}

// Message schemas for inter-agent communication
interface ArchitectToCoderMessage {
  type: 'prd_ready';
  payload: {
    prd: PRDOutput;
    targetFeatures?: string[];
    priority: 'full' | 'incremental';
  };
}

interface CoderToReviewerMessage {
  type: 'code_ready';
  payload: {
    operations: FileOperation[];
    prdContext: {
      features: string[];
      requirements: string[];
    };
    iteration: number;
  };
}

interface ReviewerToCoderMessage {
  type: 'review_complete';
  payload: {
    status: 'approved' | 'changes_requested' | 'blocked';
    findings: ReviewFinding[];
    requiredChanges?: RequiredChange[];
  };
}

// Message queue implementation
class MessageQueue {
  private subscribers: Map<string, Set<MessageHandler>>;
  private history: Message[];

  constructor(private config: MessagingConfig) {
    this.subscribers = new Map();
    this.history = [];
  }

  subscribe(agentId: string, handler: MessageHandler): Unsubscribe {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, new Set());
    }
    this.subscribers.get(agentId)!.add(handler);

    return () => {
      this.subscribers.get(agentId)?.delete(handler);
    };
  }

  async send(message: Omit<Message, 'id' | 'timestamp'>): Promise<void> {
    const fullMessage: Message = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date().toISOString()
    };

    // Serialize and optionally compress
    const serialized = this.serialize(fullMessage);

    // Store in history
    this.history.push(fullMessage);

    // Deliver to target(s)
    if (message.target === 'broadcast') {
      for (const [agentId, handlers] of this.subscribers) {
        if (agentId !== message.source) {
          for (const handler of handlers) {
            await handler(fullMessage);
          }
        }
      }
    } else {
      const handlers = this.subscribers.get(message.target);
      if (handlers) {
        for (const handler of handlers) {
          await handler(fullMessage);
        }
      }
    }
  }

  emit(event: { type: string; [key: string]: unknown }): void {
    this.send({
      type: 'event',
      source: 'orchestrator',
      target: 'broadcast',
      payload: event,
      metadata: {
        executionId: this.currentExecutionId,
        correlationId: generateCorrelationId(),
        priority: 'normal'
      }
    });
  }

  getHistory(filter?: MessageFilter): Message[] {
    let messages = [...this.history];

    if (filter?.source) {
      messages = messages.filter(m => m.source === filter.source);
    }
    if (filter?.target) {
      messages = messages.filter(m => m.target === filter.target);
    }
    if (filter?.type) {
      messages = messages.filter(m => m.type === filter.type);
    }
    if (filter?.since) {
      messages = messages.filter(m => new Date(m.timestamp) >= filter.since!);
    }

    return messages;
  }
}
```

### 6.6.3 State Management

```typescript
interface OrchestratorState {
  // Execution metadata
  executionId: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;

  // Request context
  request: GenerationRequest;

  // Agent outputs
  prd?: PRDOutput;
  operations?: FileOperation[];
  reviews?: ReviewOutput[];

  // Iteration tracking
  currentIteration: number;
  iterationHistory: IterationSnapshot[];

  // Checkpoint data
  checkpoints: Checkpoint[];
  lastCheckpoint?: string;

  // Error tracking
  errors: ErrorRecord[];
}

type ExecutionStatus =
  | 'initialized'
  | 'architecting'
  | 'coding'
  | 'reviewing'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'rolled_back';

interface IterationSnapshot {
  iteration: number;
  timestamp: string;
  operations: FileOperation[];
  reviewFindings: ReviewFinding[];
  changesApplied: string[];
}

interface Checkpoint {
  id: string;
  name: string;
  timestamp: string;
  state: Partial<OrchestratorState>;
  hash: string;                     // For integrity verification
}

// State manager implementation
class StateManager {
  private state: OrchestratorState;
  private persistence: StatePersistence;
  private snapshotScheduler?: NodeJS.Timeout;

  constructor(private config: StateConfig) {
    this.persistence = this.initPersistence(config);
  }

  initialize(executionId: string, request: GenerationRequest): void {
    this.state = {
      executionId,
      status: 'initialized',
      startedAt: new Date().toISOString(),
      request,
      currentIteration: 0,
      iterationHistory: [],
      checkpoints: [],
      errors: []
    };

    // Start snapshot scheduler
    if (this.config.snapshotInterval > 0) {
      this.snapshotScheduler = setInterval(
        () => this.autoSnapshot(),
        this.config.snapshotInterval
      );
    }
  }

  setStatus(status: ExecutionStatus): void {
    this.state.status = status;
    this.emitStateChange('status', status);
  }

  setPRD(prd: PRDOutput): void {
    this.state.prd = prd;
    this.emitStateChange('prd', prd);
  }

  setOperations(operations: FileOperation[]): void {
    this.state.operations = operations;
    this.state.currentIteration++;
    this.emitStateChange('operations', operations);
  }

  addReview(review: ReviewOutput): void {
    if (!this.state.reviews) {
      this.state.reviews = [];
    }
    this.state.reviews.push(review);

    // Snapshot iteration
    this.state.iterationHistory.push({
      iteration: this.state.currentIteration,
      timestamp: new Date().toISOString(),
      operations: this.state.operations || [],
      reviewFindings: review.findings,
      changesApplied: []
    });

    this.emitStateChange('review', review);
  }

  async checkpoint(name: string): Promise<string> {
    const checkpoint: Checkpoint = {
      id: generateCheckpointId(),
      name,
      timestamp: new Date().toISOString(),
      state: this.getCheckpointableState(),
      hash: this.computeStateHash()
    };

    this.state.checkpoints.push(checkpoint);
    this.state.lastCheckpoint = checkpoint.id;

    // Persist to storage
    await this.persistence.saveCheckpoint(checkpoint);

    // Prune old checkpoints if needed
    if (this.state.checkpoints.length > this.config.maxSnapshots) {
      const removed = this.state.checkpoints.shift();
      await this.persistence.deleteCheckpoint(removed!.id);
    }

    return checkpoint.id;
  }

  async rollbackTo(checkpointId: string): Promise<void> {
    const checkpoint = this.state.checkpoints.find(c => c.id === checkpointId);

    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    // Verify integrity
    if (this.computeStateHash(checkpoint.state) !== checkpoint.hash) {
      throw new Error('Checkpoint integrity check failed');
    }

    // Restore state
    this.state = {
      ...this.state,
      ...checkpoint.state,
      status: 'rolled_back'
    };

    this.emitStateChange('rollback', checkpointId);
  }

  getState(): Readonly<OrchestratorState> {
    return Object.freeze({ ...this.state });
  }

  async persist(): Promise<void> {
    await this.persistence.saveState(this.state);
  }

  async restore(executionId: string): Promise<void> {
    const restored = await this.persistence.loadState(executionId);
    if (restored) {
      this.state = restored;
    }
  }

  private getCheckpointableState(): Partial<OrchestratorState> {
    // Only include essential state for checkpoints
    return {
      prd: this.state.prd,
      operations: this.state.operations,
      currentIteration: this.state.currentIteration,
      iterationHistory: this.state.iterationHistory
    };
  }

  private computeStateHash(state?: Partial<OrchestratorState>): string {
    const toHash = state || this.getCheckpointableState();
    return crypto.createHash('sha256')
      .update(JSON.stringify(toHash))
      .digest('hex');
  }
}
```

### 6.6.4 Rollback Mechanisms

```typescript
interface RollbackConfig {
  // Trigger conditions
  triggers: RollbackTrigger[];

  // Rollback strategy
  strategy: 'full' | 'incremental' | 'selective';

  // File system rollback
  fileSystem: {
    backupBeforeChanges: boolean;
    backupLocation: string;
    maxBackups: number;
  };

  // Database rollback
  database: {
    transactionMode: 'per_operation' | 'per_batch' | 'all_or_nothing';
    savepoints: boolean;
  };
}

interface RollbackTrigger {
  condition: 'critical_error' | 'review_blocked' | 'timeout' | 'user_cancel' | 'custom';
  customCondition?: (state: OrchestratorState) => boolean;
  action: 'rollback' | 'pause' | 'retry';
}

// Rollback manager implementation
class RollbackManager {
  private backups: Map<string, FileBackup[]> = new Map();

  constructor(
    private config: RollbackConfig,
    private stateManager: StateManager,
    private fileSystem: FileSystemClient
  ) {}

  async prepareRollback(operations: FileOperation[]): Promise<RollbackPlan> {
    const plan: RollbackPlan = {
      id: generateRollbackId(),
      timestamp: new Date().toISOString(),
      operations: [],
      backups: []
    };

    for (const op of operations) {
      if (op.type === 'create') {
        // Rollback = delete the created file
        plan.operations.push({
          type: 'delete',
          path: op.path,
          originalOperation: op.id
        });
      } else if (op.type === 'modify') {
        // Backup original content
        const originalContent = await this.fileSystem.read(op.path);

        if (originalContent) {
          const backup = await this.createBackup(op.path, originalContent);
          plan.backups.push(backup);

          plan.operations.push({
            type: 'restore',
            path: op.path,
            backupId: backup.id,
            originalOperation: op.id
          });
        }
      } else if (op.type === 'delete') {
        // Backup file before deletion
        const content = await this.fileSystem.read(op.path);

        if (content) {
          const backup = await this.createBackup(op.path, content);
          plan.backups.push(backup);

          plan.operations.push({
            type: 'recreate',
            path: op.path,
            backupId: backup.id,
            originalOperation: op.id
          });
        }
      }
    }

    return plan;
  }

  async executeRollback(plan: RollbackPlan): Promise<RollbackResult> {
    const result: RollbackResult = {
      planId: plan.id,
      startedAt: new Date().toISOString(),
      operations: [],
      success: true
    };

    // Execute rollback operations in reverse order
    for (const op of plan.operations.reverse()) {
      try {
        await this.executeRollbackOperation(op, plan);
        result.operations.push({
          operation: op,
          success: true
        });
      } catch (error) {
        result.operations.push({
          operation: op,
          success: false,
          error: (error as Error).message
        });
        result.success = false;

        // Continue with other operations even if one fails
        // (best-effort rollback)
      }
    }

    result.completedAt = new Date().toISOString();

    // Update state
    if (result.success) {
      this.stateManager.setStatus('rolled_back');
    }

    return result;
  }

  private async executeRollbackOperation(
    op: RollbackOperation,
    plan: RollbackPlan
  ): Promise<void> {
    switch (op.type) {
      case 'delete':
        await this.fileSystem.delete(op.path);
        break;

      case 'restore':
      case 'recreate':
        const backup = plan.backups.find(b => b.id === op.backupId);
        if (!backup) throw new Error(`Backup ${op.backupId} not found`);

        await this.fileSystem.write(op.path, backup.content);
        break;
    }
  }

  private async createBackup(path: string, content: string): Promise<FileBackup> {
    const backup: FileBackup = {
      id: generateBackupId(),
      path,
      content,
      timestamp: new Date().toISOString(),
      hash: crypto.createHash('sha256').update(content).digest('hex')
    };

    // Store backup
    if (!this.backups.has(path)) {
      this.backups.set(path, []);
    }
    this.backups.get(path)!.push(backup);

    // Persist if configured
    if (this.config.fileSystem.backupBeforeChanges) {
      await this.persistBackup(backup);
    }

    return backup;
  }

  // Automatic rollback on critical errors
  async handleCriticalError(error: Error): Promise<void> {
    const lastCheckpoint = this.stateManager.getState().lastCheckpoint;

    if (lastCheckpoint) {
      console.error('Critical error, initiating rollback:', error.message);

      // Find the rollback plan for the current iteration
      const currentOperations = this.stateManager.getState().operations || [];
      const plan = await this.prepareRollback(currentOperations);

      await this.executeRollback(plan);
      await this.stateManager.rollbackTo(lastCheckpoint);
    }
  }
}
```

### 6.6.5 Complete Orchestration Flow

```typescript
// Complete orchestration flow diagram
const orchestrationFlow = `
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. INITIALIZATION
   ┌─────────────┐
   │   Request   │
   │   Received  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐     ┌─────────────┐
   │  Initialize │────▶│   Create    │
   │    State    │     │ Checkpoint  │
   └──────┬──────┘     └─────────────┘
          │
          ▼
2. ARCHITECTURE PHASE
   ┌─────────────┐
   │  Architect  │
   │    Agent    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐     ┌─────────────┐
   │  Validate   │─No─▶│  Clarify    │──┐
   │    PRD      │     │  with User  │  │
   └──────┬──────┘     └─────────────┘  │
          │Yes                           │
          ◀──────────────────────────────┘
          │
          ▼
   ┌─────────────┐
   │ Checkpoint: │
   │ post_arch   │
   └──────┬──────┘
          │
          ▼
3. CODE GENERATION PHASE (Iterative)
   ┌─────────────┐
   │  Fetch RAG  │
   │   Context   │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │   Coder     │
   │   Agent     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Checkpoint: │
   │ post_code   │
   └──────┬──────┘
          │
          ▼
4. REVIEW PHASE
   ┌─────────────┐
   │  Reviewer   │
   │   Agent     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────────────────────────────────┐
   │                  Review Status?                  │
   └──────────────────────┬──────────────────────────┘
          │               │               │
     Approved      Changes Req'd      Blocked
          │               │               │
          │               ▼               ▼
          │        ┌─────────────┐ ┌─────────────┐
          │        │  Iteration  │ │  Rollback   │
          │        │  < Max?     │ │  & Report   │
          │        └──────┬──────┘ └─────────────┘
          │               │Yes
          │               └──────▶ (Back to Coder)
          │
          ▼
5. EXECUTION PHASE
   ┌─────────────┐
   │  Prepare    │
   │  Rollback   │
   │    Plan     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Execute    │
   │ Operations  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────────────────────────────────┐
   │                Execution Status?                 │
   └──────────────────────┬──────────────────────────┘
          │               │
       Success          Failed
          │               │
          ▼               ▼
   ┌─────────────┐ ┌─────────────┐
   │  Complete   │ │  Execute    │
   │   State     │ │  Rollback   │
   └─────────────┘ └─────────────┘
`;

// Main orchestrator entry point
async function generateWebsite(request: GenerationRequest): Promise<GenerationResult> {
  const orchestrator = new AgentOrchestrator(orchestrationConfig);

  try {
    // Execute the full pipeline
    const result = await orchestrator.execute(request);

    // Log metrics
    logMetrics({
      executionId: result.executionId,
      duration: Date.now() - new Date(result.prd.metadata.generatedAt).getTime(),
      operationsCount: result.operations.length,
      reviewScore: result.review.summary.score,
      iterations: result.iterations
    });

    return result;

  } catch (error) {
    // Error is already handled by orchestrator
    // Just rethrow for API layer
    throw error;
  }
}
```

---

## 6.7 Summary

This Agent Protocol defines a comprehensive system for autonomous website generation:

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **Architect Agent** | Requirements to PRD | Chain-of-thought reasoning, validation |
| **Coder Agent** | PRD to Code | Framework expertise, error patterns |
| **Reviewer Agent** | Quality Assurance | Security, performance, accessibility |
| **RAG System** | Documentation Context | Semantic chunking, deprecation prevention |
| **Orchestrator** | Coordination | State management, rollback mechanisms |

### Key Design Decisions

1. **Sequential with Iteration**: Agents run sequentially, but coder-reviewer can iterate
2. **Checkpoint-based Recovery**: Every major phase creates a recoverable checkpoint
3. **RAG for Freshness**: Retrieve latest docs to prevent deprecated code
4. **Structured Outputs**: JSON schemas for all inter-agent communication
5. **Automatic Rollback**: Critical errors trigger automatic state recovery

### Production Considerations

- Monitor token usage across all agents
- Implement rate limiting for RAG queries
- Cache commonly retrieved documentation
- Set up alerting for review failures
- Maintain deprecation rule database
- Regular doc source version checks
