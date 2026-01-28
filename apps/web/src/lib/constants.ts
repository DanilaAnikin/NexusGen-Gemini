/**
 * Application Constants
 *
 * Centralized location for all application-wide constants.
 */

export const APP_NAME = "NexusGen";
export const APP_DESCRIPTION =
  "Transform your ideas into production-ready web applications with AI-powered generation.";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://nexusgen.ai";

/**
 * Navigation links for the marketing site
 */
export const MARKETING_NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Documentation", href: "/docs" },
  { label: "Blog", href: "/blog" },
] as const;

/**
 * Navigation links for the dashboard
 */
export const DASHBOARD_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: "home" },
  { label: "Projects", href: "/dashboard/projects", icon: "folder" },
  { label: "Generate", href: "/dashboard/generate", icon: "sparkles" },
  { label: "Templates", href: "/dashboard/templates", icon: "template" },
  { label: "Deployments", href: "/dashboard/deployments", icon: "cloud" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
] as const;

/**
 * Footer links organized by category
 */
export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Templates", href: "/templates" },
    { label: "Changelog", href: "/changelog" },
  ],
  resources: [
    { label: "Documentation", href: "/docs" },
    { label: "Blog", href: "/blog" },
    { label: "Guides", href: "/guides" },
    { label: "Support", href: "/support" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

/**
 * Social media links
 */
export const SOCIAL_LINKS = {
  twitter: "https://twitter.com/nexusgen",
  github: "https://github.com/nexusgen",
  discord: "https://discord.gg/nexusgen",
  linkedin: "https://linkedin.com/company/nexusgen",
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  health: "/api/health",
  auth: {
    login: "/api/auth/login",
    register: "/api/auth/register",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
  },
  projects: "/api/projects",
  generations: "/api/generations",
  deployments: "/api/deployments",
} as const;

/**
 * Feature flags (will be replaced with proper feature flag system)
 */
export const FEATURE_FLAGS = {
  enableAIGeneration: true,
  enableCollaboration: false,
  enableAnalytics: true,
  enableBetaFeatures: process.env.NODE_ENV === "development",
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  generation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
  },
} as const;
