/**
 * NexusGen AI Platform - Database Package
 *
 * This module exports the Prisma client instance and all related types
 * for use throughout the NexusGen platform.
 */

import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client Configuration
 *
 * In development, we store the client on globalThis to prevent
 * multiple instances due to hot reloading.
 *
 * In production, we create a new instance.
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

/**
 * The main Prisma client instance
 */
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

/**
 * Default export for convenience
 */
export default prisma;

/**
 * Re-export PrismaClient class for type usage
 */
export { PrismaClient };

/**
 * Re-export all Prisma types
 */
export * from "@prisma/client";

/**
 * Type-safe model types
 */
export type {
  User,
  Account,
  Session,
  VerificationToken,
  PasswordResetToken,
  Project,
  ProjectVersion,
  VersionSnapshot,
  ProjectCollaborator,
  Asset,
  Deployment,
  BuildLog,
  Domain,
  EnvVariable,
  AIConversation,
  AIMessage,
  Team,
  TeamMember,
  TeamInvite,
  Comment,
  Notification,
  Subscription,
  Invoice,
  UsageRecord,
  ApiKey,
  Webhook,
  AuditLog,
  Analytics,
} from "@prisma/client";

/**
 * Enum types
 */
export {
  ProjectStatus,
  Visibility,
  VersionStatus,
  DeploymentStatus,
  DeploymentEnvironment,
  AssetType,
  LogLevel,
  AIMessageRole,
  SubscriptionTier,
  SubscriptionStatus,
  InviteStatus,
  TeamRole,
  NotificationType,
} from "@prisma/client";

/**
 * Helper type for creating new records (without auto-generated fields)
 */
export type CreateUserInput = Omit<
  import("@prisma/client").Prisma.UserCreateInput,
  "id" | "createdAt" | "updatedAt"
>;

export type CreateProjectInput = Omit<
  import("@prisma/client").Prisma.ProjectCreateInput,
  "id" | "createdAt" | "updatedAt"
>;

export type CreateDeploymentInput = Omit<
  import("@prisma/client").Prisma.DeploymentCreateInput,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Helper type for updating records
 */
export type UpdateUserInput = import("@prisma/client").Prisma.UserUpdateInput;
export type UpdateProjectInput =
  import("@prisma/client").Prisma.ProjectUpdateInput;
export type UpdateDeploymentInput =
  import("@prisma/client").Prisma.DeploymentUpdateInput;

/**
 * Transaction client type
 */
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Helper function to handle Prisma connection in serverless environments
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

/**
 * Helper function to disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Helper function to check database connectivity
 */
export async function isDatabaseConnected(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper for running operations in a transaction
 */
export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}
