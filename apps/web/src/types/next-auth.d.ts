/**
 * NextAuth.js Type Declarations
 *
 * Extends the default NextAuth.js types to include custom properties
 * such as userId in the Session and JWT.
 */

import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

/**
 * Module augmentation for next-auth
 */
declare module "next-auth" {
  /**
   * Extended Session interface
   * Adds userId and other custom properties to the session user
   */
  interface Session {
    user: {
      /** The user's unique identifier from the database */
      id: string;
      /** The user's email address */
      email: string;
      /** The user's display name */
      name: string | null;
      /** The user's avatar URL */
      image?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extended User interface
   * Represents the user object returned from the database
   */
  interface User extends DefaultUser {
    /** The user's unique identifier */
    id: string;
    /** The user's email address */
    email: string;
    /** The user's display name */
    name?: string | null;
    /** The user's avatar URL */
    image?: string | null;
    /** When the user's email was verified */
    emailVerified?: Date | null;
  }
}

/**
 * Module augmentation for next-auth/jwt
 */
declare module "next-auth/jwt" {
  /**
   * Extended JWT interface
   * Adds custom properties to the JWT token
   */
  interface JWT extends DefaultJWT {
    /** The user's unique identifier from the database */
    userId?: string;
    /** The user's email address */
    email?: string;
    /** The user's display name */
    name?: string;
    /** The user's avatar URL */
    picture?: string;
    /** The authentication provider used */
    provider?: string;
  }
}
