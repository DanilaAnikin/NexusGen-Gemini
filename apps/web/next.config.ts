import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Transpile monorepo packages
  transpilePackages: [
    "@nexusgen/ui",
    "@nexusgen/utils",
    "@nexusgen/database",
    "@nexusgen/ai",
    "@nexusgen/config",
  ],

  // Enable experimental features for Next.js 15
  experimental: {
    // Enable Server Actions
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Optimize package imports
    optimizePackageImports: ["@nexusgen/ui"],
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.nexusgen.ai",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
