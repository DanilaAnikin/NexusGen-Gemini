/**
 * Project-related types for NexusGen AI platform
 */

/** Project visibility */
export type ProjectVisibility = 'public' | 'private' | 'team';

/** Project status */
export type ProjectStatus = 'draft' | 'active' | 'archived' | 'deleted';

/** Deployment status */
export type DeploymentStatus =
  | 'pending'
  | 'building'
  | 'deploying'
  | 'ready'
  | 'failed'
  | 'cancelled';

/** Project framework type */
export type FrameworkType =
  | 'nextjs'
  | 'react'
  | 'vue'
  | 'nuxt'
  | 'svelte'
  | 'astro'
  | 'remix'
  | 'express'
  | 'fastapi'
  | 'custom';

/** Base project interface */
export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
  teamId?: string;
  visibility: ProjectVisibility;
  status: ProjectStatus;
  framework: FrameworkType;
  repositoryUrl?: string;
  productionUrl?: string;
  previewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Project with extended details */
export interface ProjectDetails extends Project {
  settings: ProjectSettings;
  environment: ProjectEnvironment;
  deployments: Deployment[];
  collaborators: ProjectCollaborator[];
  analytics?: ProjectAnalytics;
}

/** Project settings */
export interface ProjectSettings {
  buildCommand: string;
  outputDirectory: string;
  installCommand: string;
  devCommand: string;
  rootDirectory?: string;
  nodeVersion: string;
  autoDeployEnabled: boolean;
  previewDeploymentsEnabled: boolean;
  productionBranch: string;
}

/** Project environment variables */
export interface ProjectEnvironment {
  id: string;
  projectId: string;
  variables: EnvironmentVariable[];
}

/** Environment variable */
export interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  target: ('production' | 'preview' | 'development')[];
  encrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Project collaborator */
export interface ProjectCollaborator {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  addedAt: Date;
  addedBy: string;
}

/** Deployment record */
export interface Deployment {
  id: string;
  projectId: string;
  status: DeploymentStatus;
  url?: string;
  source: DeploymentSource;
  buildLogs?: string;
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  readyAt?: Date;
}

/** Deployment source information */
export interface DeploymentSource {
  type: 'git' | 'cli' | 'api' | 'rollback';
  branch?: string;
  commit?: string;
  commitMessage?: string;
  author?: string;
  pullRequestId?: string;
}

/** Build configuration */
export interface BuildConfig {
  projectId: string;
  buildCommand: string;
  outputDirectory: string;
  installCommand: string;
  environmentVariables: Record<string, string>;
  framework: FrameworkType;
  nodeVersion: string;
}

/** Project analytics */
export interface ProjectAnalytics {
  projectId: string;
  period: 'day' | 'week' | 'month';
  pageViews: number;
  uniqueVisitors: number;
  bandwidth: number;
  requests: number;
  errorRate: number;
  avgResponseTime: number;
  topPages: PageAnalytics[];
  topCountries: CountryAnalytics[];
}

/** Page-level analytics */
export interface PageAnalytics {
  path: string;
  views: number;
  uniqueViews: number;
  avgDuration: number;
  bounceRate: number;
}

/** Country-level analytics */
export interface CountryAnalytics {
  country: string;
  countryCode: string;
  visits: number;
  percentage: number;
}

/** Project template */
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  framework: FrameworkType;
  repositoryUrl: string;
  thumbnailUrl?: string;
  features: string[];
  popularity: number;
  createdAt: Date;
}

/** Domain configuration */
export interface Domain {
  id: string;
  projectId: string;
  domain: string;
  verified: boolean;
  primary: boolean;
  sslEnabled: boolean;
  sslCertificate?: SSLCertificate;
  dnsRecords: DNSRecord[];
  createdAt: Date;
  verifiedAt?: Date;
}

/** SSL Certificate */
export interface SSLCertificate {
  id: string;
  issuer: string;
  expiresAt: Date;
  autoRenew: boolean;
}

/** DNS Record */
export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';
  name: string;
  value: string;
  ttl: number;
  verified: boolean;
}

/** Webhook configuration */
export interface Webhook {
  id: string;
  projectId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  enabled: boolean;
  createdAt: Date;
}

/** Webhook events */
export type WebhookEvent =
  | 'deployment.created'
  | 'deployment.ready'
  | 'deployment.failed'
  | 'project.updated'
  | 'domain.verified';
