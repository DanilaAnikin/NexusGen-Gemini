/**
 * Type Definitions
 *
 * Centralized type definitions for the application.
 */

// Re-export NextAuth type augmentations
// These extend the default NextAuth types with custom properties
import "./next-auth.d";

/**
 * User types
 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: string;
}

/**
 * Project types
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: ProjectStatus;
  framework: Framework;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus =
  | "draft"
  | "generating"
  | "ready"
  | "deployed"
  | "archived";

export type Framework =
  | "nextjs"
  | "react"
  | "vue"
  | "svelte"
  | "astro"
  | "remix";

/**
 * Generation types
 */
export interface Generation {
  id: string;
  projectId: string;
  prompt: string;
  status: GenerationStatus;
  result: GenerationResult | null;
  error: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface GenerationResult {
  files: GeneratedFile[];
  summary: string;
  tokensUsed: number;
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

/**
 * Deployment types
 */
export interface Deployment {
  id: string;
  projectId: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  url: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export type DeploymentEnvironment = "preview" | "production";

export type DeploymentStatus =
  | "pending"
  | "building"
  | "deploying"
  | "ready"
  | "failed";

/**
 * API response types
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Form types
 */
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  framework: Framework;
}

export interface GenerationFormData {
  prompt: string;
  projectId?: string;
  template?: string;
}

/**
 * Component prop types
 */
export interface ChildrenProps {
  children: React.ReactNode;
}

export interface ClassNameProps {
  className?: string;
}

export interface BaseComponentProps extends ClassNameProps, ChildrenProps {}

/**
 * Utility types
 */
export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncFunction<T> = () => Promise<T>;

export type ErrorCallback = (error: Error) => void;

export type VoidCallback = () => void;
