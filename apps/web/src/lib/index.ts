/**
 * Library Utilities
 *
 * Main barrel file for all utility functions and constants.
 */

export * from "./utils";
export * from "./constants";
export * from "./queue";

// Auth utilities - Server-side only
// Note: These exports are for server components and server actions only
// For client components, use the useSession hook from next-auth/react
export {
  getSession,
  getCurrentUser,
  getCurrentUserId,
  requireAuth,
  requireUser,
  requireUserId,
  isAuthenticated,
} from "./auth";
