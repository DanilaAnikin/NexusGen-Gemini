/**
 * API request/response types for NexusGen AI platform
 */

import type { User, UserProfile, UserSession, UserRegistration, ApiKey, Team, TeamMember, TeamInvitation } from './user';
import type { Project, ProjectDetails, Deployment, Domain, Webhook, ProjectTemplate } from './project';
import type { Conversation, Message, AgentConfig, AgentTask, StreamEvent } from './agent';

/** Standard API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

/** API error */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
  statusCode: number;
}

/** Response metadata */
export interface ResponseMeta {
  requestId: string;
  timestamp: Date;
  duration: number;
  rateLimit?: RateLimitInfo;
}

/** Rate limit information */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}

/** Sort parameters */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/** Filter parameters */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

// ============ Authentication API ============

/** Login request */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/** Login response */
export interface LoginResponse {
  user: User;
  session: UserSession;
}

/** Register request */
export interface RegisterRequest extends UserRegistration {
  captchaToken?: string;
}

/** Register response */
export interface RegisterResponse {
  user: User;
  verificationEmailSent: boolean;
}

/** Refresh token request */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/** Refresh token response */
export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

/** Password reset request */
export interface PasswordResetRequest {
  email: string;
}

/** Password reset confirm */
export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/** OAuth callback request */
export interface OAuthCallbackRequest {
  provider: 'github' | 'google' | 'gitlab';
  code: string;
  state: string;
}

// ============ User API ============

/** Update user request */
export interface UpdateUserRequest {
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  preferences?: Partial<User['subscription']>;
}

/** Get user response */
export type GetUserResponse = ApiResponse<UserProfile>;

/** Update user response */
export type UpdateUserResponse = ApiResponse<UserProfile>;

/** List users response */
export type ListUsersResponse = PaginatedResponse<User>;

/** Create API key request */
export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  expiresAt?: Date;
}

/** Create API key response */
export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  plainTextKey: string;
}

// ============ Project API ============

/** Create project request */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  framework: Project['framework'];
  visibility: Project['visibility'];
  teamId?: string;
  templateId?: string;
  repositoryUrl?: string;
}

/** Create project response */
export type CreateProjectResponse = ApiResponse<Project>;

/** Update project request */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  visibility?: Project['visibility'];
  settings?: Partial<ProjectDetails['settings']>;
}

/** Update project response */
export type UpdateProjectResponse = ApiResponse<ProjectDetails>;

/** Get project response */
export type GetProjectResponse = ApiResponse<ProjectDetails>;

/** List projects response */
export type ListProjectsResponse = PaginatedResponse<Project>;

/** List templates response */
export type ListTemplatesResponse = PaginatedResponse<ProjectTemplate>;

// ============ Deployment API ============

/** Create deployment request */
export interface CreateDeploymentRequest {
  projectId: string;
  branch?: string;
  commit?: string;
  environment?: 'production' | 'preview';
}

/** Create deployment response */
export type CreateDeploymentResponse = ApiResponse<Deployment>;

/** Get deployment response */
export type GetDeploymentResponse = ApiResponse<Deployment>;

/** List deployments response */
export type ListDeploymentsResponse = PaginatedResponse<Deployment>;

/** Deployment logs request */
export interface DeploymentLogsRequest {
  deploymentId: string;
  type?: 'build' | 'runtime';
  since?: Date;
  limit?: number;
}

/** Deployment logs response */
export interface DeploymentLogsResponse {
  logs: LogEntry[];
  hasMore: boolean;
}

/** Log entry */
export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
}

// ============ Domain API ============

/** Add domain request */
export interface AddDomainRequest {
  projectId: string;
  domain: string;
}

/** Add domain response */
export type AddDomainResponse = ApiResponse<Domain>;

/** Verify domain response */
export type VerifyDomainResponse = ApiResponse<Domain>;

// ============ Webhook API ============

/** Create webhook request */
export interface CreateWebhookRequest {
  projectId: string;
  url: string;
  events: Webhook['events'];
}

/** Create webhook response */
export interface CreateWebhookResponse {
  webhook: Webhook;
  secret: string;
}

// ============ Team API ============

/** Create team request */
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

/** Create team response */
export type CreateTeamResponse = ApiResponse<Team>;

/** Update team request */
export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

/** Invite member request */
export interface InviteMemberRequest {
  teamId: string;
  email: string;
  role: 'admin' | 'member';
}

/** Invite member response */
export type InviteMemberResponse = ApiResponse<TeamInvitation>;

/** List team members response */
export type ListTeamMembersResponse = PaginatedResponse<TeamMember>;

// ============ Agent/AI API ============

/** Create conversation request */
export interface CreateConversationRequest {
  projectId?: string;
  agentId?: string;
  title?: string;
  initialMessage?: string;
  context?: Conversation['context'];
}

/** Create conversation response */
export type CreateConversationResponse = ApiResponse<Conversation>;

/** Send message request */
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  attachments?: MessageAttachment[];
  context?: Partial<Conversation['context']>;
}

/** Message attachment */
export interface MessageAttachment {
  type: 'file' | 'image' | 'code';
  name: string;
  content: string;
  mimeType?: string;
}

/** Send message response */
export type SendMessageResponse = ApiResponse<Message>;

/** Stream message response */
export interface StreamMessageResponse {
  conversationId: string;
  messageId: string;
  stream: AsyncIterable<StreamEvent>;
}

/** Get conversation response */
export type GetConversationResponse = ApiResponse<Conversation>;

/** List conversations response */
export type ListConversationsResponse = PaginatedResponse<Conversation>;

/** Get agent config response */
export type GetAgentConfigResponse = ApiResponse<AgentConfig>;

/** List agent configs response */
export type ListAgentConfigsResponse = PaginatedResponse<AgentConfig>;

/** Create task request */
export interface CreateTaskRequest {
  conversationId: string;
  type: AgentTask['type'];
  description: string;
  context?: Record<string, unknown>;
}

/** Create task response */
export type CreateTaskResponse = ApiResponse<AgentTask>;

/** Get task response */
export type GetTaskResponse = ApiResponse<AgentTask>;

// ============ Health/Status API ============

/** Health check response */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: Date;
  services: ServiceHealth[];
}

/** Service health */
export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

/** API usage stats */
export interface ApiUsageStats {
  requests: number;
  errors: number;
  avgLatency: number;
  tokensUsed: number;
  periodStart: Date;
  periodEnd: Date;
}
