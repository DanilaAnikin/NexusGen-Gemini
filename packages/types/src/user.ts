/**
 * User-related types for NexusGen AI platform
 */

/** User role within the platform */
export type UserRole = 'admin' | 'developer' | 'viewer' | 'guest';

/** User subscription tier */
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

/** User account status */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

/** Base user interface */
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  subscription: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/** User profile with additional details */
export interface UserProfile extends User {
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  githubUsername?: string;
  twitterHandle?: string;
  skills: string[];
  preferences: UserPreferences;
}

/** User preferences */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
}

/** User session information */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

/** User authentication credentials */
export interface UserCredentials {
  email: string;
  password: string;
}

/** User registration data */
export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  displayName: string;
  acceptedTerms: boolean;
}

/** User API key */
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string;
  hashedKey: string;
  permissions: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

/** User usage statistics */
export interface UserUsageStats {
  userId: string;
  projectsCreated: number;
  agentInvocations: number;
  tokensUsed: number;
  storageUsedBytes: number;
  periodStart: Date;
  periodEnd: Date;
}

/** Team/Organization */
export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatarUrl?: string;
  ownerId: string;
  subscription: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

/** Team membership */
export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

/** Team invitation */
export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
