/**
 * NexusGen AI Platform - Next.js Middleware
 *
 * This middleware handles authentication and route protection using NextAuth.js v5.
 * It runs on every request matching the configured paths.
 */

import NextAuth from "next-auth";
import { authConfig } from "./auth";

/**
 * Create the auth middleware from the config
 * This uses the `authorized` callback defined in auth.ts
 */
const { auth } = NextAuth(authConfig);

export default auth;

/**
 * Configure which routes the middleware should run on
 *
 * Matcher patterns:
 * - /dashboard/:path* - All dashboard routes (protected)
 * - /login - Login page (redirect if authenticated)
 * - /register - Register page (redirect if authenticated)
 * - /api/auth/:path* - NextAuth.js API routes
 *
 * Excludes:
 * - Static files (_next/static, _next/image, favicon.ico)
 * - Public assets
 * - API routes (except auth routes)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
