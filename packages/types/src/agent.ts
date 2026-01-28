/**
 * AI Agent protocol types for NexusGen AI platform
 */

/** Agent type/capability */
export type AgentType =
  | 'code-generation'
  | 'code-review'
  | 'debugging'
  | 'testing'
  | 'documentation'
  | 'refactoring'
  | 'architecture'
  | 'security'
  | 'performance'
  | 'custom';

/** Agent status */
export type AgentStatus = 'idle' | 'thinking' | 'executing' | 'waiting' | 'error' | 'completed';

/** Message role in conversation */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/** Content type for messages */
export type ContentType = 'text' | 'code' | 'image' | 'file' | 'tool_call' | 'tool_result';

/** AI model provider */
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'local' | 'custom';

/** Base message interface */
export interface Message {
  id: string;
  role: MessageRole;
  content: MessageContent[];
  timestamp: Date;
  metadata?: MessageMetadata;
}

/** Message content block */
export interface MessageContent {
  type: ContentType;
  text?: string;
  code?: CodeBlock;
  image?: ImageContent;
  file?: FileContent;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
}

/** Code block content */
export interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  startLine?: number;
  endLine?: number;
  highlight?: number[];
}

/** Image content */
export interface ImageContent {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mimeType: string;
}

/** File content reference */
export interface FileContent {
  id: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  url?: string;
}

/** Tool call from AI */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** Tool execution result */
export interface ToolResult {
  toolCallId: string;
  success: boolean;
  output?: unknown;
  error?: string;
}

/** Message metadata */
export interface MessageMetadata {
  model?: string;
  tokens?: TokenUsage;
  latency?: number;
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'error';
}

/** Token usage information */
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

/** Agent configuration */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  model: ModelConfig;
  systemPrompt: string;
  tools: ToolDefinition[];
  constraints: AgentConstraints;
  capabilities: AgentCapabilities;
  createdAt: Date;
  updatedAt: Date;
}

/** Model configuration */
export interface ModelConfig {
  provider: ModelProvider;
  modelId: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

/** Tool definition */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameters;
  required?: string[];
  handler?: string;
}

/** Tool parameters schema */
export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/** Tool parameter property */
export interface ToolParameterProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  default?: unknown;
  items?: ToolParameterProperty;
  properties?: Record<string, ToolParameterProperty>;
}

/** Agent constraints */
export interface AgentConstraints {
  maxIterations: number;
  maxTokensPerRequest: number;
  timeoutSeconds: number;
  allowedTools: string[];
  blockedTools: string[];
  allowFileAccess: boolean;
  allowNetworkAccess: boolean;
  allowCodeExecution: boolean;
  sandboxed: boolean;
}

/** Agent capabilities */
export interface AgentCapabilities {
  canReadFiles: boolean;
  canWriteFiles: boolean;
  canExecuteCode: boolean;
  canAccessNetwork: boolean;
  canUseTools: boolean;
  canSpawnAgents: boolean;
  supportedLanguages: string[];
  supportedFrameworks: string[];
}

/** Conversation/Chat session */
export interface Conversation {
  id: string;
  projectId?: string;
  userId: string;
  agentId: string;
  title?: string;
  messages: Message[];
  status: AgentStatus;
  context: ConversationContext;
  createdAt: Date;
  updatedAt: Date;
}

/** Conversation context */
export interface ConversationContext {
  projectFiles?: FileReference[];
  activeFile?: string;
  selectedCode?: CodeSelection;
  environmentInfo?: EnvironmentInfo;
  customContext?: Record<string, unknown>;
}

/** File reference in context */
export interface FileReference {
  path: string;
  content?: string;
  language?: string;
  relevance?: number;
}

/** Code selection */
export interface CodeSelection {
  filePath: string;
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
  selectedText: string;
}

/** Environment information */
export interface EnvironmentInfo {
  os: string;
  nodeVersion?: string;
  pythonVersion?: string;
  framework?: string;
  frameworkVersion?: string;
  packageManager?: string;
  dependencies?: Record<string, string>;
}

/** Agent task */
export interface AgentTask {
  id: string;
  conversationId: string;
  type: AgentType;
  description: string;
  status: AgentStatus;
  progress: number;
  steps: TaskStep[];
  result?: TaskResult;
  error?: AgentError;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/** Task step */
export interface TaskStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  output?: unknown;
  error?: string;
  duration?: number;
}

/** Task result */
export interface TaskResult {
  success: boolean;
  output: unknown;
  artifacts: Artifact[];
  summary: string;
}

/** Task artifact */
export interface Artifact {
  id: string;
  type: 'file' | 'diff' | 'report' | 'log';
  name: string;
  content: string;
  mimeType: string;
  path?: string;
}

/** Agent error */
export interface AgentError {
  code: string;
  message: string;
  details?: unknown;
  recoverable: boolean;
  suggestedAction?: string;
}

/** Streaming event types */
export type StreamEventType =
  | 'message.start'
  | 'message.delta'
  | 'message.complete'
  | 'tool.start'
  | 'tool.progress'
  | 'tool.complete'
  | 'error'
  | 'done';

/** Streaming event */
export interface StreamEvent {
  type: StreamEventType;
  data: StreamEventData;
  timestamp: Date;
}

/** Stream event data */
export interface StreamEventData {
  messageId?: string;
  delta?: string;
  toolCall?: ToolCall;
  toolResult?: ToolResult;
  progress?: number;
  error?: AgentError;
}
