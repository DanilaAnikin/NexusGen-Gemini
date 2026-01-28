/**
 * NextAuth.js API Route Handler
 *
 * This is the catch-all API route that handles all NextAuth.js authentication requests.
 * It exports the GET and POST handlers from the auth configuration.
 *
 * Routes handled:
 * - GET /api/auth/signin - Sign in page
 * - GET /api/auth/signout - Sign out page
 * - GET /api/auth/callback/:provider - OAuth callback
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - List available providers
 * - POST /api/auth/signin/:provider - Sign in with provider
 * - POST /api/auth/signout - Sign out
 * - POST /api/auth/callback/:provider - OAuth callback (POST)
 */

import { handlers } from "@/../../auth";

export const { GET, POST } = handlers;
