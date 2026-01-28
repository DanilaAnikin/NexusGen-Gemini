/**
 * Authentication Utilities
 *
 * Helper functions for authentication operations in the NexusGen platform.
 * These utilities wrap NextAuth.js functions for easier use in components and actions.
 */

import { auth, signIn, signOut } from "@/../../auth";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated session
 * Use this in Server Components to get the current user's session
 *
 * @example
 * ```tsx
 * const session = await getSession();
 * if (!session) {
 *   redirect('/login');
 * }
 * ```
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 *
 * @example
 * ```tsx
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log(`Hello, ${user.name}`);
 * }
 * ```
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get the current user's ID
 * Returns null if not authenticated
 *
 * @example
 * ```tsx
 * const userId = await getCurrentUserId();
 * if (!userId) {
 *   throw new Error('Not authenticated');
 * }
 * ```
 */
export async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

/**
 * Require authentication
 * Redirects to login if not authenticated
 * Use this in Server Components/Actions to protect routes
 *
 * @example
 * ```tsx
 * const session = await requireAuth();
 * // User is guaranteed to be authenticated here
 * ```
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Require authentication and return user
 * Redirects to login if not authenticated
 *
 * @example
 * ```tsx
 * const user = await requireUser();
 * // user is guaranteed to exist here
 * ```
 */
export async function requireUser() {
  const session = await requireAuth();
  return session.user;
}

/**
 * Require authentication and return user ID
 * Redirects to login if not authenticated
 *
 * @example
 * ```tsx
 * const userId = await requireUserId();
 * // userId is guaranteed to exist here
 * ```
 */
export async function requireUserId() {
  const session = await requireAuth();
  return session.user.id;
}

/**
 * Sign in with credentials (email/password)
 *
 * @param email - User's email address
 * @param password - User's password
 * @param redirectTo - URL to redirect to after sign in (optional)
 *
 * @example
 * ```tsx
 * await signInWithCredentials('user@example.com', 'password123');
 * ```
 */
export async function signInWithCredentials(
  email: string,
  password: string,
  redirectTo?: string
) {
  return await signIn("credentials", {
    email,
    password,
    redirectTo: redirectTo ?? "/dashboard",
  });
}

/**
 * Sign in with GitHub OAuth
 *
 * @param redirectTo - URL to redirect to after sign in (optional)
 *
 * @example
 * ```tsx
 * await signInWithGitHub();
 * ```
 */
export async function signInWithGitHub(redirectTo?: string) {
  return await signIn("github", {
    redirectTo: redirectTo ?? "/dashboard",
  });
}

/**
 * Sign out the current user
 *
 * @param redirectTo - URL to redirect to after sign out (optional)
 *
 * @example
 * ```tsx
 * await signOutUser();
 * ```
 */
export async function signOutUser(redirectTo?: string) {
  return await signOut({
    redirectTo: redirectTo ?? "/",
  });
}

/**
 * Check if user is authenticated
 * Use this for conditional rendering based on auth state
 *
 * @example
 * ```tsx
 * if (await isAuthenticated()) {
 *   // Show authenticated content
 * }
 * ```
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}

/**
 * Re-export auth functions for convenience
 */
export { auth, signIn, signOut };
