/**
 * Core types and interfaces for NexusGen Worker Service
 */

// Re-export queue types from shared package
export * from './queue.types';

// Export generation types for agent integration
export * from './generation.types';

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  ENTERPRISE = 'ENTERPRISE',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================
// Project Types
// ============================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  userId: string;
  status: ProjectStatus;
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

export interface ProjectSettings {
  framework: Framework;
  styling: StylingOption;
  language: 'typescript' | 'javascript';
  features: string[];
  customConfig?: Record<string, unknown>;
}

export enum Framework {
  NEXTJS = 'NEXTJS',
  REACT = 'REACT',
  VUE = 'VUE',
  SVELTE = 'SVELTE',
  ANGULAR = 'ANGULAR',
}

export enum StylingOption {
  TAILWIND = 'TAILWIND',
  CSS_MODULES = 'CSS_MODULES',
  STYLED_COMPONENTS = 'STYLED_COMPONENTS',
  SASS = 'SASS',
  EMOTION = 'EMOTION',
}

// ============================================
// Generation Types
// ============================================

export interface Generation {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  type: GenerationType;
  status: GenerationStatus;
  result?: GenerationResult;
  metadata: GenerationMetadata;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export enum GenerationType {
  COMPONENT = 'COMPONENT',
  PAGE = 'PAGE',
  API_ROUTE = 'API_ROUTE',
  FULL_APP = 'FULL_APP',
  REFACTOR = 'REFACTOR',
  FIX = 'FIX',
  DOCUMENTATION = 'DOCUMENTATION',
}

export enum GenerationStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface GenerationResult {
  files: GeneratedFile[];
  preview?: string;
  deploymentUrl?: string;
  logs: string[];
  tokensUsed: number;
  modelUsed: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
  isNew: boolean;
  diff?: string;
}

export interface GenerationMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  modelVersion: string;
  processingTimeMs: number;
  agentSteps?: AgentStep[];
}

// ============================================
// AI Agent Types
// ============================================

export interface AgentStep {
  id: string;
  name: string;
  description: string;
  status: AgentStepStatus;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}

export enum AgentStepStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
}

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export enum AIProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GOOGLE = 'GOOGLE',
  LOCAL = 'LOCAL',
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: {
    name: string;
    arguments: string;
  };
}

export interface AICompletionRequest {
  messages: AIMessage[];
  config: AIModelConfig;
  functions?: AIFunction[];
  stream?: boolean;
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AICompletionResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  functionCall?: {
    name: string;
    arguments: string;
  };
}

// ============================================
// Queue Types
// ============================================

export interface QueueJob<T = unknown> {
  id: string;
  name: string;
  data: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedReason?: string;
}

export enum QueueName {
  GENERATION = 'generation',
  AI_PROCESSING = 'ai-processing',
  DEPLOYMENT = 'deployment',
  NOTIFICATION = 'notification',
  CLEANUP = 'cleanup',
}

export interface GenerationJobData {
  generationId: string;
  projectId: string;
  userId: string;
  prompt: string;
  type: GenerationType;
  settings: ProjectSettings;
}

export interface DeploymentJobData {
  generationId: string;
  projectId: string;
  files: GeneratedFile[];
  environment: 'preview' | 'production';
}

// ============================================
// WebSocket Types
// ============================================

export interface WebSocketMessage<T = unknown> {
  event: WebSocketEvent;
  data: T;
  timestamp: Date;
}

export enum WebSocketEvent {
  // Generation events
  GENERATION_STARTED = 'generation:started',
  GENERATION_PROGRESS = 'generation:progress',
  GENERATION_COMPLETED = 'generation:completed',
  GENERATION_FAILED = 'generation:failed',

  // Agent events
  AGENT_STEP_STARTED = 'agent:step:started',
  AGENT_STEP_COMPLETED = 'agent:step:completed',
  AGENT_THINKING = 'agent:thinking',

  // Project events
  PROJECT_UPDATED = 'project:updated',
  PROJECT_DEPLOYED = 'project:deployed',

  // System events
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  HEARTBEAT = 'heartbeat',
}

export interface GenerationProgressPayload {
  generationId: string;
  status: GenerationStatus;
  progress: number;
  currentStep?: string;
  message?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Configuration Types
// ============================================

export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  ai: AIServicesConfig;
  websocket: WebSocketConfig;
  queue: QueueConfig;
}

export interface DatabaseConfig {
  url: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AIServicesConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  defaultModel: string;
}

export interface WebSocketConfig {
  port: number;
  corsOrigin: string;
}

export interface QueueConfig {
  defaultAttempts: number;
  defaultBackoff: number;
}
