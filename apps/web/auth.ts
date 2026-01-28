/**
 * NexusGen AI Platform - NextAuth.js v5 Configuration
 *
 * This module configures authentication for the web application using NextAuth.js v5
 * with Prisma adapter, Credentials provider for development, and GitHub OAuth.
 */

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { prisma } from "@nexusgen/database";

import type { NextAuthConfig, NextAuthResult } from "next-auth";

/**
 * NextAuth.js Configuration
 */
const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  /**
   * Session configuration
   * Using JWT strategy for better compatibility with Credentials provider
   */
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  /**
   * Custom pages for authentication
   */
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/dashboard",
  },

  /**
   * Authentication providers
   */
  providers: [
    /**
     * GitHub OAuth Provider
     */
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email ?? "",
          image: profile.avatar_url,
        };
      },
    }),

    /**
     * Credentials Provider for email/password authentication
     * Primarily used for development and testing
     */
    Credentials({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) {
          // Return null for non-existent user or user without password
          // (OAuth-only users won't have a password hash)
          return null;
        }

        // Verify password
        const isValidPassword = await compare(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        // Return user object (without password hash)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  /**
   * Callbacks for customizing authentication behavior
   */
  callbacks: {
    /**
     * JWT callback - called whenever a JWT is created or updated
     * Used to persist the user ID in the token
     */
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.userId = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }

      // Handle session update (e.g., when user updates their profile)
      if (trigger === "update" && session) {
        token.name = (session.name as string | undefined) ?? token.name;
        token.picture = (session.image as string | undefined) ?? token.picture;
      }

      // Link the provider account info if available
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },

    /**
     * Session callback - called whenever a session is checked
     * Used to add custom properties to the session
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string | undefined;
      }

      return session;
    },

    /**
     * Authorized callback - called to check if the user is authorized
     * Used by middleware to protect routes
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuth =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },

    /**
     * Sign in callback - called after a user signs in
     */
    async signIn({ user, account }) {
      // Allow OAuth sign-ins
      if (account?.provider === "github") {
        return true;
      }

      // For credentials provider, ensure user exists
      if (account?.provider === "credentials") {
        return !!user;
      }

      return true;
    },
  },

  /**
   * Events for logging and side effects
   */
  events: {
    async signIn({ user, account }) {
      // Log sign-in events (you can add audit logging here)
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
    },
    async signOut(message) {
      // Log sign-out events
      // Note: signOut event can have either session or token depending on strategy
      if ("token" in message) {
        console.log(`User signed out: ${message.token?.email}`);
      }
    },
    async createUser({ user }) {
      // New user created (e.g., via OAuth)
      console.log(`New user created: ${user.email}`);
    },
  },

  /**
   * Enable debug mode in development
   */
  debug: process.env.NODE_ENV === "development",

  /**
   * Trust the host header for proper URL generation
   */
  trustHost: true,
};

/**
 * Export NextAuth.js handlers and utilities
 *
 * We explicitly type each export to avoid TypeScript's "type portability" error
 * caused by transitive @auth/core types not being directly resolvable in pnpm's
 * strict node_modules layout.
 */
const nextAuth: NextAuthResult = NextAuth(authConfig);

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;

/**
 * Export the config for use in middleware
 */
export { authConfig };
