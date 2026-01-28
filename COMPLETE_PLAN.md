# NexusGen - Complete Technical Plan

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Generated Date** | 2026-01-28 |
| **Version** | 1.0.0 |
| **Document Purpose** | Comprehensive technical specification and implementation blueprint for NexusGen - an autonomous AI-powered web application generation platform |
| **Target Audience** | Development team, architects, DevOps engineers, stakeholders |
| **Document Status** | Living Document - Source of Truth |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
   - [1.1 Mission Statement](#11-mission-statement)
   - [1.2 Vision](#12-vision)
   - [1.3 Core Philosophy](#13-core-philosophy)
   - [1.4 Value Propositions](#14-value-propositions)
   - [1.5 Target Market](#15-target-market)
   - [1.6 Key Performance Indicators](#16-key-performance-indicators-kpis)

2. [Technology Stack & Infrastructure](#2-technology-stack--infrastructure)
   - [2.1 Frontend Technologies](#21-frontend-technologies)
   - [2.2 Backend Technologies](#22-backend-technologies)
   - [2.3 AI & Machine Learning](#23-ai--machine-learning)
   - [2.4 Database & Storage](#24-database--storage)
   - [2.5 DevOps & Infrastructure](#25-devops--infrastructure)
   - [2.6 Testing & Quality Assurance](#26-testing--quality-assurance)
   - [2.7 Real-Time Communication](#27-real-time-communication)
   - [2.8 Monitoring & Observability](#28-monitoring--observability)

3. [System Architecture](#3-system-architecture)
   - [3.1 Overview](#31-overview)
   - [3.2 High-Level Microservices Architecture](#32-high-level-microservices-architecture)
   - [3.3 The Agentic Loop Flow](#33-the-agentic-loop-flow)
   - [3.4 Self-Healing Mechanism](#34-self-healing-mechanism)
   - [3.5 Service Communication Patterns](#35-service-communication-patterns)
   - [3.6 Data Flow Summary](#36-data-flow-summary)
   - [3.7 Architecture Decision Records](#37-architecture-decision-records-adrs)

4. [Detailed Feature Specifications](#4-detailed-feature-specifications)
   - [4.1 Vision Dashboard](#41-vision-dashboard)
   - [4.2 Asset Pipeline](#42-asset-pipeline)
   - [4.3 Real-Time Console](#43-real-time-console)
   - [4.4 Preview Engine](#44-preview-engine)
   - [4.5 Export Engine](#45-export-engine)

5. [Database Schema](#5-database-schema)
   - [5.1 Overview](#51-overview)
   - [5.2 Core Models](#52-core-models)
   - [5.3 Full Prisma Schema](#53-full-prisma-schema)
   - [5.4 Indexing Strategy](#54-indexing-strategy)
   - [5.5 Data Relationships Diagram](#55-data-relationships-diagram)

6. [The Agent Protocol](#6-the-agent-protocol)
   - [6.1 Architecture Overview](#61-architecture-overview)
   - [6.2 Agent A: Architect Agent](#62-agent-a-architect-agent)
   - [6.3 Agent B: Coder Agent](#63-agent-b-coder-agent)
   - [6.4 Agent C: Reviewer Agent](#64-agent-c-reviewer-agent)
   - [6.5 RAG Strategy](#65-rag-strategy)
   - [6.6 Agent Orchestration](#66-agent-orchestration)

7. [Project Folder Structure](#7-project-folder-structure)
   - [7.1 Monorepo Overview](#71-monorepo-overview)
   - [7.2 Apps Directory](#72-apps-directory)
   - [7.3 Packages Directory](#73-packages-directory)
   - [7.4 Docker Configuration](#74-docker-configuration)
   - [7.5 CI/CD Configuration](#75-cicd-configuration)

8. [Implementation Phases](#8-implementation-phases)
   - [8.1 Phase 1: Foundation](#81-phase-1-foundation-weeks-1-4)
   - [8.2 Phase 2: Core Features](#82-phase-2-core-features-weeks-5-8)
   - [8.3 Phase 3: AI Integration](#83-phase-3-ai-integration-weeks-9-12)
   - [8.4 Phase 4: Polish & Optimization](#84-phase-4-polish--optimization-weeks-13-16)
   - [8.5 Phase 5: Beta Launch](#85-phase-5-beta-launch-weeks-17-20)

---

# 1. Executive Summary

## 1.1 Mission Statement

NexusGen is an autonomous AI-powered platform that transforms natural language descriptions and visual assets into production-ready, deployable web applications. Our mission is to democratize web development by enabling anyone with an idea to bring it to life without writing code, while maintaining the quality standards expected by professional developers.

We bridge the gap between imagination and implementation, allowing entrepreneurs, designers, and businesses to rapidly prototype, iterate, and deploy web applications at unprecedented speed.

## 1.2 Vision

**"From Vision to Deployed Application in Minutes, Not Months"**

We envision a future where:

- **Non-technical founders** can validate business ideas in hours instead of months
- **Designers** can see their Figma mockups transformed into functional applications instantly
- **Enterprises** can rapidly prototype internal tools without burdening development teams
- **Agencies** can deliver client projects faster with AI-assisted development
- **Developers** can skip boilerplate and focus on unique business logic

NexusGen will become the industry standard for AI-assisted web development, processing millions of application generations monthly while maintaining enterprise-grade security and reliability.

## 1.3 Core Philosophy

### 1.3.1 Autonomous but Supervised

The system operates autonomously through its agentic loop but provides clear visibility into every decision. Users can intervene at any stage, approve changes, and guide the AI toward their vision.

### 1.3.2 Self-Healing by Default

Every build failure is an opportunity to learn. The system captures errors, classifies them, generates fixes, and caches successful resolutions. Over time, NexusGen becomes more reliable as its fix cache grows.

### 1.3.3 Production-First Mindset

Generated code isn't throwaway prototype code - it's production-ready from the start:
- TypeScript strict mode enabled
- Comprehensive error handling
- Accessibility compliance (WCAG 2.1 AA)
- SEO optimizations included
- Security best practices enforced

### 1.3.4 Framework Expertise, Not Generic Code

Instead of generating generic code, NexusGen deeply understands Next.js 15, React 19, Tailwind CSS v4, and the entire modern web stack. It generates idiomatic code that follows framework best practices.

### 1.3.5 Transparency and Explainability

Every decision the AI makes is logged and explainable:
- Why was this architecture chosen?
- Why did this component become a client component?
- Why was this dependency added?

Users can understand and learn from the AI's decisions.

## 1.4 Value Propositions

### For Entrepreneurs & Startups

| Value | Description |
|-------|-------------|
| **Speed to Market** | Go from idea to deployed MVP in hours, not months |
| **Cost Reduction** | Reduce initial development costs by 80% |
| **Iteration Velocity** | Test multiple approaches rapidly |
| **Technical Debt Free** | Start with clean, maintainable code |

### For Designers

| Value | Description |
|-------|-------------|
| **Design to Code** | Upload Figma files, get functional components |
| **Pixel Perfection** | AI understands design systems and spacing |
| **Interactive Prototypes** | Create working prototypes, not just mockups |
| **Collaboration** | Share functional previews with stakeholders |

### For Enterprises

| Value | Description |
|-------|-------------|
| **Internal Tools** | Rapidly build dashboards and admin panels |
| **Prototype First** | Validate requirements before full development |
| **Consistency** | Enforce design systems across all generated apps |
| **Security Compliance** | Built-in security scanning and compliance |

### For Development Agencies

| Value | Description |
|-------|-------------|
| **Client Demos** | Create functional demos in client meetings |
| **Rapid Prototyping** | Win more pitches with working prototypes |
| **Code Handoff** | Clean, documented code for developers |
| **White Label** | Offer AI-powered development as your service |

### For Developers

| Value | Description |
|-------|-------------|
| **Skip Boilerplate** | Start with a working foundation |
| **Learn Best Practices** | Generated code teaches modern patterns |
| **Focus on Logic** | Spend time on unique features, not setup |
| **Customization** | Export and customize generated code freely |

## 1.5 Target Market

### Primary Market Segments

#### 1. SMB Software Development (TAM: $50B)
- Small agencies and freelancers
- Startup development teams
- In-house enterprise development

#### 2. No-Code/Low-Code Users (TAM: $25B)
- Business analysts building internal tools
- Marketing teams creating landing pages
- Product managers prototyping features

#### 3. Design-to-Code Market (TAM: $10B)
- UI/UX designers wanting to code
- Design agencies offering development
- Product design teams

### Geographic Focus

**Phase 1 (Year 1):** North America, Western Europe
**Phase 2 (Year 2):** APAC, Latin America
**Phase 3 (Year 3):** Global expansion

### Customer Personas

#### Persona 1: Startup Founder "Sarah"
- **Age:** 28-45
- **Background:** Business/Marketing, limited technical skills
- **Goal:** Launch MVP to validate business idea
- **Pain Point:** Can't afford $50K+ for custom development
- **NexusGen Value:** Launch MVP for <$500 in days

#### Persona 2: Agency Owner "Marcus"
- **Age:** 35-55
- **Background:** Design agency, 5-20 employees
- **Goal:** Offer development services without hiring developers
- **Pain Point:** Losing projects to full-service agencies
- **NexusGen Value:** Win development projects, increase margins

#### Persona 3: Enterprise PM "Jennifer"
- **Age:** 30-50
- **Background:** Product Management at Fortune 500
- **Goal:** Prototype features to validate with stakeholders
- **Pain Point:** 6-month wait for dev team availability
- **NexusGen Value:** Create functional prototypes in days

## 1.6 Key Performance Indicators (KPIs)

### Product KPIs

| Metric | Target (Year 1) | Target (Year 2) |
|--------|-----------------|-----------------|
| Generation Success Rate | >85% | >95% |
| Average Generation Time | <5 minutes | <3 minutes |
| Self-Healing Success Rate | >70% | >85% |
| User Satisfaction (NPS) | >40 | >60 |
| Code Quality Score | >80/100 | >90/100 |

### Business KPIs

| Metric | Target (Year 1) | Target (Year 2) |
|--------|-----------------|-----------------|
| Monthly Active Users | 10,000 | 100,000 |
| Paid Conversions | 5% | 8% |
| Monthly Recurring Revenue | $500K | $5M |
| Customer Acquisition Cost | <$100 | <$50 |
| Lifetime Value | >$500 | >$1,000 |
| Churn Rate | <5% monthly | <3% monthly |

### Technical KPIs

| Metric | Target |
|--------|--------|
| API Uptime | 99.9% |
| P95 Response Time | <200ms |
| Build Success Rate | >95% |
| Deployment Success Rate | >99% |
| Error Recovery Rate | >90% |
| Fix Cache Hit Rate | >60% |

### Quality KPIs

| Metric | Target |
|--------|--------|
| Accessibility Score | >90 (Lighthouse) |
| Performance Score | >85 (Lighthouse) |
| SEO Score | >90 (Lighthouse) |
| Security Vulnerabilities | 0 Critical, 0 High |
| TypeScript Coverage | 100% |
| Test Coverage | >80% |

---

# 2. Technology Stack & Infrastructure

## 2.1 Frontend Technologies

### 2.1.1 Next.js 15

**Why Next.js 15:**
- App Router with React Server Components
- Built-in optimization (images, fonts, scripts)
- Edge and Node.js runtime support
- Incremental Static Regeneration
- Server Actions for mutations
- Streaming and Suspense support

**Configuration:**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true, // Partial Pre-rendering
    reactCompiler: true,
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.nexusgen.ai',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
        },
      ],
    },
  ],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
```

**Key Features Utilized:**
- Server Components for data fetching
- Route Handlers for API endpoints
- Metadata API for SEO
- Image component for optimization
- Font optimization with `next/font`
- Parallel and Intercepting Routes

### 2.1.2 TypeScript 5.x

**Configuration:**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      { "name": "next" }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    },
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Type Safety Features:**
- Strict mode enabled for all checks
- No implicit any
- Strict null checks
- Exhaustive switch statements
- Discriminated unions for state

### 2.1.3 Tailwind CSS v4

**Why Tailwind v4:**
- CSS-first configuration
- Lightning CSS engine (100x faster)
- Native CSS cascade layers
- Built-in container queries
- Improved dark mode

**Configuration:**

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors - Brand */
  --color-primary-50: oklch(0.97 0.02 250);
  --color-primary-100: oklch(0.94 0.04 250);
  --color-primary-200: oklch(0.88 0.08 250);
  --color-primary-300: oklch(0.80 0.12 250);
  --color-primary-400: oklch(0.70 0.16 250);
  --color-primary-500: oklch(0.60 0.20 250);
  --color-primary-600: oklch(0.50 0.18 250);
  --color-primary-700: oklch(0.42 0.16 250);
  --color-primary-800: oklch(0.35 0.14 250);
  --color-primary-900: oklch(0.28 0.10 250);
  --color-primary-950: oklch(0.20 0.08 250);

  /* Colors - Semantic */
  --color-success: oklch(0.72 0.19 142);
  --color-warning: oklch(0.80 0.18 85);
  --color-error: oklch(0.65 0.24 27);
  --color-info: oklch(0.70 0.15 230);

  /* Typography */
  --font-family-sans: "Inter Variable", system-ui, sans-serif;
  --font-family-mono: "JetBrains Mono Variable", ui-monospace, monospace;

  /* Spacing Scale */
  --spacing-18: 4.5rem;
  --spacing-22: 5.5rem;
  --spacing-30: 7.5rem;

  /* Shadows */
  --shadow-soft: 0 2px 15px -3px rgb(0 0 0 / 0.07), 0 10px 20px -2px rgb(0 0 0 / 0.04);
  --shadow-glow: 0 0 15px -3px var(--color-primary-500);

  /* Animations */
  --animate-fade-in: fade-in 0.5s ease-out;
  --animate-slide-up: slide-up 0.5s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Base Styles */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}
```

### 2.1.4 Shadcn/ui

**Component Library Strategy:**

```typescript
// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Core Components Used:**
- Button, Input, Textarea
- Dialog, Sheet, Drawer
- Select, Combobox, Command
- Card, Table, Tabs
- Toast, Alert, Badge
- Form (with react-hook-form + zod)
- Dropdown Menu, Context Menu
- Tooltip, Popover, Hover Card
- Progress, Skeleton, Spinner

### 2.1.5 Framer Motion

**Animation Strategy:**

```typescript
// lib/animations.ts
import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  }
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100 }
  }
};

// Page transition variants
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

// Presence animation for modals
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 }
  }
};
```

## 2.2 Backend Technologies

### 2.2.1 NestJS

**Why NestJS:**
- Enterprise-grade architecture
- TypeScript-first with decorators
- Dependency injection
- Modular structure
- Built-in support for microservices
- WebSocket support via Socket.io

**Architecture:**

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('NexusGen API')
    .setDescription('AI-Powered Web Application Generation Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('projects', 'Project management endpoints')
    .addTag('generations', 'AI generation endpoints')
    .addTag('deployments', 'Deployment management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(process.env.PORT || 3001);
}

bootstrap();
```

**Module Structure:**

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { GenerationsModule } from './generations/generations.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { AssetsModule } from './assets/assets.module';
import { AIModule } from './ai/ai.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { HealthModule } from './health/health.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),

    // Caching
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 5, // 5 minutes
      max: 1000,
    }),

    // Message Queue
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Event Emitter
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // Feature Modules
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    GenerationsModule,
    DeploymentsModule,
    AssetsModule,
    AIModule,
    WebsocketsModule,
    HealthModule,
  ],
})
export class AppModule {}
```

### 2.2.2 BullMQ

**Job Queue Configuration:**

```typescript
// src/queues/queues.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

export const QUEUES = {
  GENERATION: 'generation',
  BUILD: 'build',
  DEPLOY: 'deploy',
  AI_TASK: 'ai-task',
  NOTIFICATION: 'notification',
  WEBHOOK: 'webhook',
} as const;

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QUEUES.GENERATION,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { count: 100 },
          removeOnFail: { count: 500 },
        },
      },
      {
        name: QUEUES.BUILD,
        defaultJobOptions: {
          attempts: 3,
          timeout: 600000, // 10 minutes
          backoff: { type: 'exponential', delay: 10000 },
        },
      },
      {
        name: QUEUES.DEPLOY,
        defaultJobOptions: {
          attempts: 2,
          timeout: 300000, // 5 minutes
        },
      },
      {
        name: QUEUES.AI_TASK,
        limiter: {
          max: 50,
          duration: 60000, // 50 per minute
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      },
      {
        name: QUEUES.NOTIFICATION,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
        },
      },
      {
        name: QUEUES.WEBHOOK,
        defaultJobOptions: {
          attempts: 5,
          backoff: { type: 'exponential', delay: 5000 },
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
```

### 2.2.3 Redis

**Redis Configuration:**

```typescript
// src/redis/redis.config.ts
import { RedisOptions } from 'ioredis';

export const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),

  // Connection pooling
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },

  // Keep-alive
  keepAlive: 30000,
  connectTimeout: 10000,

  // TLS for production
  ...(process.env.NODE_ENV === 'production' && {
    tls: {
      rejectUnauthorized: false,
    },
  }),
};

// Pub/Sub channels
export const REDIS_CHANNELS = {
  BUILD_EVENTS: 'events:build',
  DEPLOY_EVENTS: 'events:deploy',
  PROJECT_EVENTS: 'events:project',
  USER_EVENTS: 'events:user',
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  SESSION: 'session:',
  USER: 'user:',
  PROJECT: 'project:',
  GENERATION: 'generation:',
  FIX_CACHE: 'fix:',
  RATE_LIMIT: 'ratelimit:',
} as const;
```

## 2.3 AI & Machine Learning

### 2.3.1 Claude 3.5 Sonnet (Primary)

**Configuration:**

```typescript
// src/ai/providers/anthropic.provider.ts
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async complete(params: {
    systemPrompt: string;
    userMessage: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: params.maxTokens || 8192,
      temperature: params.temperature || 0.7,
      system: params.systemPrompt,
      messages: [
        { role: 'user', content: params.userMessage }
      ],
    });

    return {
      content: response.content[0].type === 'text'
        ? response.content[0].text
        : '',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      stopReason: response.stop_reason,
    };
  }

  async stream(params: {
    systemPrompt: string;
    userMessage: string;
    maxTokens?: number;
    temperature?: number;
    onToken?: (token: string) => void;
  }) {
    const stream = await this.client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: params.maxTokens || 8192,
      temperature: params.temperature || 0.7,
      system: params.systemPrompt,
      messages: [
        { role: 'user', content: params.userMessage }
      ],
    });

    let fullContent = '';

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const token = event.delta.text;
        fullContent += token;
        params.onToken?.(token);
      }
    }

    const finalMessage = await stream.finalMessage();

    return {
      content: fullContent,
      usage: {
        inputTokens: finalMessage.usage.input_tokens,
        outputTokens: finalMessage.usage.output_tokens,
      },
    };
  }
}
```

**Use Cases:**
- Architect Agent: Complex reasoning for PRD generation
- Coder Agent: High-quality code generation
- Reviewer Agent: Security and quality analysis

### 2.3.2 GPT-4o (Secondary/Fallback)

**Configuration:**

```typescript
// src/ai/providers/openai.provider.ts
import OpenAI from 'openai';

export class OpenAIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async complete(params: {
    systemPrompt: string;
    userMessage: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: params.maxTokens || 8192,
      temperature: params.temperature || 0.7,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userMessage },
      ],
    });

    return {
      content: response.choices[0].message.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
      finishReason: response.choices[0].finish_reason,
    };
  }

  async embeddings(texts: string[]) {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    return response.data.map(d => d.embedding);
  }
}
```

**Use Cases:**
- Fallback when Claude is unavailable
- Embeddings generation for RAG
- Faster responses for simple tasks

## 2.4 Database & Storage

### 2.4.1 PostgreSQL

**Database Configuration:**

```typescript
// src/database/database.config.ts
export const databaseConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'nexusgen',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'nexusgen',

  // Connection pool
  poolMin: 5,
  poolMax: 20,
  poolIdleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,

  // SSL for production
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
};
```

**Extensions:**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram similarity
CREATE EXTENSION IF NOT EXISTS "vector";         -- Vector similarity search
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query statistics
```

### 2.4.2 Prisma ORM

**Prisma Configuration:**

```prisma
// prisma/schema.prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuid_ossp(map: "uuid-ossp"), pgcrypto, pg_trgm, vector]
}
```

### 2.4.3 S3 Storage

**S3 Configuration:**

```typescript
// src/storage/s3.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.S3_BUCKET || 'nexusgen-assets';
  }

  async upload(params: {
    key: string;
    body: Buffer | string;
    contentType: string;
    metadata?: Record<string, string>;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      Metadata: params.metadata,
    });

    await this.client.send(command);

    return {
      key: params.key,
      url: `https://${this.bucket}.s3.amazonaws.com/${params.key}`,
    };
  }

  async getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getSignedDownloadUrl(key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }

  async delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}
```

### 2.4.4 CloudFront CDN

**CloudFront Service:**

```typescript
// src/cdn/cloudfront.service.ts
import { Injectable } from '@nestjs/common';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

@Injectable()
export class CloudFrontService {
  private client: CloudFrontClient;
  private distributionId: string;
  private keyPairId: string;
  private privateKey: string;
  private domainName: string;

  constructor() {
    this.client = new CloudFrontClient({
      region: 'us-east-1',
    });
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID!;
    this.keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID!;
    this.privateKey = process.env.CLOUDFRONT_PRIVATE_KEY!;
    this.domainName = process.env.CLOUDFRONT_DOMAIN!;
  }

  getPublicUrl(key: string) {
    return `https://${this.domainName}/${key}`;
  }

  getSignedUrl(key: string, expiresIn = 3600) {
    const url = this.getPublicUrl(key);
    const dateLessThan = new Date(Date.now() + expiresIn * 1000).toISOString();

    return getSignedUrl({
      url,
      keyPairId: this.keyPairId,
      privateKey: this.privateKey,
      dateLessThan,
    });
  }

  async invalidateCache(paths: string[]) {
    const command = new CreateInvalidationCommand({
      DistributionId: this.distributionId,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths.map(p => (p.startsWith('/') ? p : `/${p}`)),
        },
      },
    });

    return this.client.send(command);
  }
}
```

## 2.5 DevOps & Infrastructure

### 2.5.1 Docker

**Dockerfile for Web Application:**

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/database/package.json ./packages/database/
COPY packages/config/package.json ./packages/config/

RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build --workspace=apps/web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
```

### 2.5.2 Kubernetes

**Deployment Configuration:**

```yaml
# k8s/deployments/web.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexusgen-web
  namespace: nexusgen
  labels:
    app: nexusgen
    component: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexusgen
      component: web
  template:
    metadata:
      labels:
        app: nexusgen
        component: web
    spec:
      serviceAccountName: nexusgen
      containers:
        - name: web
          image: nexusgen/web:latest
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: nexusgen-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: nexusgen-secrets
                  key: redis-url
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "2Gi"
          livenessProbe:
            httpGet:
              path: /api/health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health/ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - nexusgen
                topologyKey: kubernetes.io/hostname
```

## 2.6 Testing & Quality Assurance

### 2.6.1 Jest

**Jest Configuration:**

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
  maxWorkers: '50%',
  testTimeout: 30000,
};

export default config;
```

### 2.6.2 Playwright

**Playwright Configuration:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

## 2.7 Real-Time Communication

### 2.7.1 Socket.io

**WebSocket Gateway:**

```typescript
// src/websockets/websocket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token ||
                    client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store socket mapping
      client.data.userId = userId;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Join user-specific room
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:project')
  async handleSubscribeProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    client.join(`project:${data.projectId}`);
    return { success: true };
  }

  // Methods for sending events
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToProject(projectId: string, event: string, data: any) {
    this.server.to(`project:${projectId}`).emit(event, data);
  }

  broadcastBuildProgress(projectId: string, progress: {
    stage: string;
    percentage: number;
    message: string;
  }) {
    this.sendToProject(projectId, 'build:progress', progress);
  }

  broadcastGenerationUpdate(projectId: string, update: {
    status: string;
    phase: string;
    details?: any;
  }) {
    this.sendToProject(projectId, 'generation:update', update);
  }
}
```

## 2.8 Monitoring & Observability

### 2.8.1 Sentry

**Sentry Configuration:**

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  // Filtering
  beforeSend(event, hint) {
    // Filter out non-error events
    if (event.level !== 'error' && event.level !== 'fatal') {
      return null;
    }
    return event;
  },
});
```

### 2.8.2 Prometheus Metrics

```typescript
// src/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  private registry: Registry;

  // Counters
  public generationsTotal: Counter;
  public generationErrors: Counter;
  public buildsTotal: Counter;
  public deploymentsTotal: Counter;

  // Histograms
  public generationDuration: Histogram;
  public buildDuration: Histogram;
  public aiRequestDuration: Histogram;

  // Gauges
  public activeGenerations: Gauge;
  public queuedJobs: Gauge;
  public connectedUsers: Gauge;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    this.generationsTotal = new Counter({
      name: 'nexusgen_generations_total',
      help: 'Total number of generations',
      labelNames: ['status', 'type'],
      registers: [this.registry],
    });

    this.generationDuration = new Histogram({
      name: 'nexusgen_generation_duration_seconds',
      help: 'Generation duration in seconds',
      labelNames: ['type'],
      buckets: [30, 60, 120, 180, 300, 600],
      registers: [this.registry],
    });

    this.activeGenerations = new Gauge({
      name: 'nexusgen_active_generations',
      help: 'Number of active generations',
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

---

# 3. System Architecture

## 3.1 Overview

NexusGen employs a distributed microservices architecture designed for scalability, fault tolerance, and autonomous operation. The system leverages event-driven communication patterns to coordinate AI agents that autonomously design, code, build, test, and deploy web applications.

### Core Architectural Principles

- **Autonomous Operation**: AI agents operate independently with self-healing capabilities
- **Event-Driven Design**: Loose coupling through asynchronous message passing
- **Fault Tolerance**: Graceful degradation with comprehensive retry mechanisms
- **Horizontal Scalability**: Stateless services that scale independently
- **Observability**: Comprehensive logging, tracing, and metrics at every layer

---

## 3.2 High-Level Microservices Architecture

```mermaid
flowchart TB
    subgraph Client Layer
        WEB[Web App<br/>Next.js 14+<br/>React Server Components]
        CLI[CLI Tool<br/>Node.js]
        SDK[SDK<br/>TypeScript/Python]
    end

    subgraph Edge Layer
        CDN[CDN<br/>CloudFlare/Vercel Edge]
        LB[Load Balancer<br/>nginx/HAProxy]
    end

    subgraph API Layer
        APIGW[API Gateway<br/>Kong/Express Gateway<br/>Rate Limiting • Auth • Routing]
    end

    subgraph Core Services
        AUTH[Auth Service<br/>JWT • OAuth2 • RBAC<br/>Node.js/Fastify]
        PROJECT[Project Service<br/>CRUD • Versioning • Collaboration<br/>Node.js/Fastify]
        AIORCH[AI Orchestrator Service<br/>Agent Coordination • Planning<br/>Python/FastAPI]
        BUILDW[Build Worker Service<br/>Docker Builds • Testing<br/>Node.js + Docker SDK]
        ASSET[Asset Service<br/>File Upload • Processing<br/>Node.js/Fastify]
        DEPLOY[Deployment Service<br/>Multi-Cloud Deploy<br/>Node.js/Fastify]
    end

    subgraph AI Agent Layer
        PLANNER[Planning Agent<br/>Architecture Design<br/>Claude/GPT-4]
        CODER[Coding Agent<br/>Code Generation<br/>Claude/GPT-4]
        REVIEWER[Review Agent<br/>Code Review • Security<br/>Claude/GPT-4]
        FIXER[Fix Agent<br/>Error Resolution<br/>Claude/GPT-4]
    end

    subgraph Message & Cache Layer
        MQ[Message Queue<br/>Redis + BullMQ<br/>Job Scheduling • Pub/Sub]
        CACHE[Cache Layer<br/>Redis Cluster<br/>Session • Results]
    end

    subgraph Data Layer
        DB[(PostgreSQL<br/>Primary Database<br/>Projects • Users • Jobs)]
        REPLICA[(PostgreSQL<br/>Read Replica<br/>Analytics • Reports)]
        VECTOR[(pgvector<br/>Vector Database<br/>Code Embeddings)]
    end

    subgraph Storage Layer
        S3[Object Storage<br/>S3/MinIO<br/>Assets • Artifacts]
        REGISTRY[Container Registry<br/>Harbor/ECR<br/>Build Images]
    end

    subgraph External Services
        LLM[LLM Providers<br/>Anthropic • OpenAI<br/>Google • Azure]
        CLOUD[Cloud Providers<br/>AWS • GCP • Vercel<br/>Netlify • Cloudflare]
        GIT[Git Providers<br/>GitHub • GitLab<br/>Bitbucket]
    end

    subgraph Observability
        LOGS[Logging<br/>Loki/ELK Stack]
        METRICS[Metrics<br/>Prometheus/Grafana]
        TRACES[Tracing<br/>Jaeger/Tempo]
        ALERTS[Alerting<br/>PagerDuty/Opsgenie]
    end

    %% Client connections
    WEB --> CDN
    CLI --> LB
    SDK --> LB
    CDN --> LB
    LB --> APIGW

    %% API Gateway routing
    APIGW --> AUTH
    APIGW --> PROJECT
    APIGW --> AIORCH
    APIGW --> ASSET
    APIGW --> DEPLOY

    %% Service interconnections
    AUTH --> DB
    AUTH --> CACHE
    PROJECT --> DB
    PROJECT --> MQ
    PROJECT --> S3

    AIORCH --> MQ
    AIORCH --> DB
    AIORCH --> CACHE
    AIORCH --> LLM
    AIORCH -.-> PLANNER
    AIORCH -.-> CODER
    AIORCH -.-> REVIEWER
    AIORCH -.-> FIXER

    BUILDW --> MQ
    BUILDW --> S3
    BUILDW --> REGISTRY
    BUILDW --> DB

    ASSET --> S3
    ASSET --> DB
    ASSET --> MQ

    DEPLOY --> MQ
    DEPLOY --> CLOUD
    DEPLOY --> GIT
    DEPLOY --> REGISTRY
    DEPLOY --> DB

    %% Database connections
    DB --> REPLICA
    DB --> VECTOR

    %% Observability connections
    AUTH -.-> LOGS
    PROJECT -.-> LOGS
    AIORCH -.-> LOGS
    BUILDW -.-> LOGS
    ASSET -.-> LOGS
    DEPLOY -.-> LOGS

    LOGS --> METRICS
    METRICS --> TRACES
    TRACES --> ALERTS
```

### Service Descriptions

| Service | Responsibility | Technology Stack | Scaling Strategy |
|---------|---------------|------------------|------------------|
| **API Gateway** | Request routing, rate limiting, authentication | Kong/Express Gateway | Horizontal with sticky sessions |
| **Auth Service** | User authentication, JWT tokens, RBAC | Node.js, Fastify, Passport | Horizontal, stateless |
| **Project Service** | Project CRUD, versioning, collaboration | Node.js, Fastify, Prisma | Horizontal with DB sharding |
| **AI Orchestrator** | Agent coordination, task planning | Python, FastAPI, LangChain | Horizontal with job affinity |
| **Build Worker** | Docker builds, test execution | Node.js, Docker SDK, BuildKit | Auto-scaling worker pool |
| **Asset Service** | File upload, image processing | Node.js, Sharp, FFmpeg | Horizontal with CDN |
| **Deployment Service** | Multi-cloud deployment orchestration | Node.js, Pulumi/Terraform | Horizontal, region-aware |

---

## 3.3 The Agentic Loop Flow

The Agentic Loop is the core autonomous workflow that transforms user prompts into deployed web applications. This self-correcting loop enables NexusGen to iteratively improve generated code until it successfully builds and deploys.

```mermaid
flowchart TB
    subgraph Input Phase
        START((Start)) --> PROMPT[/User Prompt<br/>+ Context/]
        PROMPT --> VALIDATE{Validate<br/>Input?}
        VALIDATE -->|Invalid| ERROR_INPUT[Return<br/>Validation Error]
        ERROR_INPUT --> END_FAIL((End))
        VALIDATE -->|Valid| ENRICH[Enrich Prompt<br/>Add Context • History]
    end

    subgraph Planning Phase
        ENRICH --> PLAN_AGENT[Planning Agent<br/>Analyze Requirements]
        PLAN_AGENT --> ARCH_DESIGN[Generate<br/>Architecture Plan]
        ARCH_DESIGN --> TECH_SELECT[Select<br/>Tech Stack]
        TECH_SELECT --> TASK_DECOMP[Decompose into<br/>Coding Tasks]
        TASK_DECOMP --> PLAN_REVIEW{Plan<br/>Review?}
        PLAN_REVIEW -->|Rejected| PLAN_AGENT
        PLAN_REVIEW -->|Approved| QUEUE_TASKS[Queue Tasks<br/>to BullMQ]
    end

    subgraph Coding Phase
        QUEUE_TASKS --> CODE_AGENT[Coding Agent<br/>Generate Code]
        CODE_AGENT --> LINT_CHECK[Static Analysis<br/>ESLint • TypeScript]
        LINT_CHECK --> LINT_PASS{Lint<br/>Pass?}
        LINT_PASS -->|No| LINT_FIX[Auto-Fix<br/>Lint Issues]
        LINT_FIX --> LINT_CHECK
        LINT_PASS -->|Yes| SECURITY_SCAN[Security Scan<br/>Snyk • CodeQL]
        SECURITY_SCAN --> SEC_PASS{Security<br/>Pass?}
        SEC_PASS -->|Critical| SEC_FIX[Security<br/>Fix Agent]
        SEC_FIX --> CODE_AGENT
        SEC_PASS -->|Pass/Warn| COMMIT_CODE[Commit to<br/>Git Branch]
    end

    subgraph Build Phase
        COMMIT_CODE --> BUILD_START[Start Docker<br/>Build]
        BUILD_START --> BUILD_EXEC[Execute<br/>Build Steps]
        BUILD_EXEC --> CAPTURE_OUTPUT[Capture stdout<br/>stderr • exit code]
        CAPTURE_OUTPUT --> BUILD_SUCCESS{Build<br/>Success?}
    end

    subgraph Self-Healing Phase
        BUILD_SUCCESS -->|No| PARSE_ERROR[Parse Error<br/>Output]
        PARSE_ERROR --> CLASSIFY[Classify<br/>Error Type]
        CLASSIFY --> CHECK_CACHE{Fix in<br/>Cache?}
        CHECK_CACHE -->|Yes| APPLY_CACHED[Apply Cached<br/>Fix]
        CHECK_CACHE -->|No| FIX_AGENT[Fix Agent<br/>Analyze Error]
        FIX_AGENT --> GENERATE_FIX[Generate<br/>Fix Proposal]
        GENERATE_FIX --> APPLY_FIX[Apply Fix<br/>to Code]
        APPLY_CACHED --> APPLY_FIX
        APPLY_FIX --> INCREMENT_RETRY[Increment<br/>Retry Counter]
        INCREMENT_RETRY --> CHECK_RETRY{Retry<br/>< Max?}
        CHECK_RETRY -->|Yes| CODE_AGENT
        CHECK_RETRY -->|No| HUMAN_ESCALATE[Escalate to<br/>Human Review]
    end

    subgraph Test Phase
        BUILD_SUCCESS -->|Yes| RUN_TESTS[Run Test<br/>Suite]
        RUN_TESTS --> TEST_PASS{Tests<br/>Pass?}
        TEST_PASS -->|No| PARSE_ERROR
        TEST_PASS -->|Yes| CACHE_SUCCESS[Cache Successful<br/>Patterns]
    end

    subgraph Deploy Phase
        CACHE_SUCCESS --> DEPLOY_PREVIEW[Deploy to<br/>Preview Environment]
        DEPLOY_PREVIEW --> HEALTH_CHECK{Health<br/>Check OK?}
        HEALTH_CHECK -->|No| PARSE_ERROR
        HEALTH_CHECK -->|Yes| NOTIFY_USER[Notify User<br/>Preview Ready]
        NOTIFY_USER --> USER_APPROVE{User<br/>Approves?}
        USER_APPROVE -->|No| PROMPT
        USER_APPROVE -->|Yes| DEPLOY_PROD[Deploy to<br/>Production]
        DEPLOY_PROD --> END_SUCCESS((Success))
    end

    HUMAN_ESCALATE --> END_ESCALATE((Escalated))
```

### Agentic Loop State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Planning: receive_prompt
    Planning --> Coding: plan_approved
    Planning --> Planning: plan_rejected
    Planning --> Failed: max_plan_revisions

    Coding --> Building: code_complete
    Coding --> Coding: lint_fix_applied
    Coding --> Failed: security_critical

    Building --> Testing: build_success
    Building --> Healing: build_failed

    Testing --> Deploying: tests_pass
    Testing --> Healing: tests_fail

    Healing --> Coding: fix_generated
    Healing --> Building: resource_scaled
    Healing --> Escalated: max_retries_exceeded
    Healing --> Escalated: unknown_error

    Deploying --> Preview: preview_deployed
    Preview --> Production: user_approved
    Preview --> Coding: user_requested_changes

    Production --> Complete: deploy_success
    Production --> Healing: deploy_failed

    Complete --> [*]
    Failed --> [*]
    Escalated --> [*]
```

---

## 3.4 Self-Healing Mechanism

The self-healing mechanism is NexusGen's core capability for autonomous error recovery. It captures, classifies, and resolves build and runtime errors without human intervention.

### 3.4.1 Error Classification Taxonomy

```mermaid
graph TB
    subgraph Error Classification Tree
        ROOT[Build Error] --> DEP[Dependency Errors]
        ROOT --> SYNTAX[Syntax Errors]
        ROOT --> TYPE[Type Errors]
        ROOT --> RUNTIME[Runtime Errors]
        ROOT --> RESOURCE[Resource Errors]
        ROOT --> CONFIG[Configuration Errors]
        ROOT --> NETWORK[Network Errors]
        ROOT --> UNKNOWN[Unknown Errors]

        DEP --> DEP_MISSING[Missing Package]
        DEP --> DEP_VERSION[Version Conflict]
        DEP --> DEP_PEER[Peer Dependency]
        DEP --> DEP_NATIVE[Native Module]

        SYNTAX --> SYN_PARSE[Parse Error]
        SYNTAX --> SYN_TOKEN[Unexpected Token]
        SYNTAX --> SYN_EOF[Unexpected EOF]

        TYPE --> TYPE_MISMATCH[Type Mismatch]
        TYPE --> TYPE_MISSING[Missing Property]
        TYPE --> TYPE_NULL[Null/Undefined]
        TYPE --> TYPE_GENERIC[Generic Constraint]

        RUNTIME --> RT_IMPORT[Import Error]
        RUNTIME --> RT_ENV[Missing Env Var]
        RUNTIME --> RT_FILE[File Not Found]
        RUNTIME --> RT_PERMISSION[Permission Denied]

        RESOURCE --> RES_MEMORY[Out of Memory]
        RESOURCE --> RES_DISK[Disk Space]
        RESOURCE --> RES_TIMEOUT[Build Timeout]
        RESOURCE --> RES_CPU[CPU Limit]
    end
```

### 3.4.2 Retry Configuration

```typescript
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  baseDelayMs: 1000,
  maxDelayMs: 60000,
  exponentialBase: 2,
  jitterFactor: 0.1,
  retryableCategories: [
    ErrorCategory.DEPENDENCY,
    ErrorCategory.SYNTAX,
    ErrorCategory.TYPE,
    ErrorCategory.RUNTIME,
    ErrorCategory.CONFIGURATION,
  ],
  categorySpecificLimits: {
    [ErrorCategory.DEPENDENCY]: 3,
    [ErrorCategory.RESOURCE]: 2,
    [ErrorCategory.NETWORK]: 5,
    [ErrorCategory.UNKNOWN]: 2,
  },
};
```

### 3.4.3 Fallback Strategies

| Strategy | Applicable Categories | Description |
|----------|----------------------|-------------|
| Dependency Lockfile Regeneration | Dependency | Delete lockfile and reinstall |
| Alternative Package Manager | Dependency | Try pnpm/yarn instead of npm |
| Simplified Dockerfile | Configuration, Resource | Use known-working template |
| Resource Scaling | Resource | Increase memory/CPU limits |
| Previous Successful Build | Unknown | Revert to last working state |
| Human Escalation | All | Notify human for intervention |

---

## 3.5 Service Communication Patterns

### Communication Strategy Overview

| Scenario | Pattern | Protocol | Why |
|----------|---------|----------|-----|
| User authentication | Sync | REST | Immediate response required |
| Project CRUD | Sync | REST/GraphQL | User expects immediate feedback |
| Build trigger | Async | BullMQ | Long-running, needs reliability |
| Build status update | Event | Pub/Sub | Multiple consumers need notification |
| AI code generation | Async | BullMQ | Long-running, rate-limited |
| Real-time progress | Event | WebSocket | User needs live updates |
| Deployment | Async | BullMQ | Complex workflow, needs orchestration |
| Inter-service data fetch | Sync | gRPC | Low latency, typed contracts |
| Audit logging | Event | Event Store | Compliance, replay capability |
| Metrics collection | Async | Push | Non-blocking, aggregatable |

---

## 3.6 Data Flow Summary

```mermaid
flowchart TB
    subgraph User Request Flow
        U[User] -->|1. Submit Prompt| WEB[Web App]
        WEB -->|2. Authenticate| AUTH[Auth Service]
        AUTH -->|3. JWT Token| WEB
        WEB -->|4. Create Project| PROJ[Project Service]
        PROJ -->|5. Queue Build| MQ[Message Queue]
    end

    subgraph Autonomous Processing Flow
        MQ -->|6. Dequeue| ORCH[AI Orchestrator]
        ORCH -->|7. Plan| LLM[LLM Provider]
        LLM -->|8. Architecture| ORCH
        ORCH -->|9. Code Tasks| MQ
        MQ -->|10. Process| ORCH
        ORCH -->|11. Generate Code| LLM
        LLM -->|12. Source Files| ORCH
        ORCH -->|13. Build Job| MQ
    end

    subgraph Build & Deploy Flow
        MQ -->|14. Build| BW[Build Worker]
        BW -->|15. Docker Build| DOCKER[Docker Engine]
        DOCKER -->|16. Image| REG[Container Registry]
        BW -->|17. Build Complete| MQ
        MQ -->|18. Deploy| DEPLOY[Deploy Service]
        DEPLOY -->|19. Push| CLOUD[Cloud Provider]
    end

    subgraph Self-Healing Flow
        BW -->|20. Error| EP[Error Parser]
        EP -->|21. Classify| FC[Fix Cache]
        FC -->|22. Miss| ORCH
        ORCH -->|23. Fix Request| LLM
        LLM -->|24. Fix| ORCH
        ORCH -->|25. Apply & Retry| MQ
    end

    subgraph Notification Flow
        MQ -->|26. Status| WS[WebSocket]
        WS -->|27. Push| WEB
        WEB -->|28. Display| U
    end
```

---

## 3.7 Architecture Decision Records (ADRs)

### ADR-001: Microservices over Monolith
**Status:** Accepted
**Context:** Need to scale AI processing independently from web serving
**Decision:** Adopt microservices architecture with BullMQ for async communication
**Consequences:** Increased operational complexity, better scalability and fault isolation

### ADR-002: BullMQ over RabbitMQ/Kafka
**Status:** Accepted
**Context:** Need reliable job queue with Redis already in stack
**Decision:** Use BullMQ for job queues, Redis Pub/Sub for events
**Consequences:** Simpler stack, good enough throughput, may need Kafka for >100K events/sec

### ADR-003: pgvector for Fix Caching
**Status:** Accepted
**Context:** Need semantic search for similar error fixes
**Decision:** Use PostgreSQL with pgvector extension
**Consequences:** Single database for relational + vector, good enough for initial scale

### ADR-004: Docker-based Builds
**Status:** Accepted
**Context:** Need isolated, reproducible builds
**Decision:** Docker with BuildKit for all project builds
**Consequences:** Consistent environments, slightly slower than native builds

---

# 4. Detailed Feature Specifications

## 4.1 Vision Dashboard

### 4.1.1 Overview

The Vision Dashboard is the primary interface where users describe their web application ideas and interact with the AI generation system. It provides a conversational interface combined with rich visual feedback.

### 4.1.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| VD-001 | User can enter natural language description | Critical |
| VD-002 | User can upload images/files as context | High |
| VD-003 | System shows real-time generation progress | Critical |
| VD-004 | User can pause/cancel generation | High |
| VD-005 | User can view generated artifacts | Critical |
| VD-006 | System provides prompt suggestions | Medium |
| VD-007 | User can save prompts as templates | Medium |
| VD-008 | Dashboard is fully responsive | High |
| VD-009 | Keyboard shortcuts for common actions | Low |
| VD-010 | Dark/light mode support | Medium |

### 4.1.3 User Interface Components

- **Prompt Input Area**: Rich text editor with markdown support
- **Attachment Zone**: Drag-and-drop for images, wireframes, logos
- **Smart Suggestions**: AI-powered prompt enhancement suggestions
- **History Sidebar**: Access to previous generations
- **Template Library**: Pre-built prompt templates by category
- **Generation Progress Panel**: Real-time status updates

---

## 4.2 Asset Pipeline

### 4.2.1 Supported Asset Types

| Type | Extensions | Max Size | Processing |
|------|------------|----------|------------|
| Images | .jpg, .png, .gif, .webp, .svg | 10MB | Optimization, thumbnails, color extraction |
| Icons | .svg, .ico | 1MB | Optimization, sprite generation |
| Fonts | .woff, .woff2, .ttf, .otf | 5MB | Subsetting, format conversion |
| Documents | .pdf, .docx | 20MB | Text extraction, parsing |
| Design Files | .fig, .sketch | 50MB | Component extraction, asset export |
| Videos | .mp4, .webm | 100MB | Compression, thumbnail extraction |

### 4.2.2 Processing Pipeline

```mermaid
flowchart LR
    subgraph Upload
        U[User] --> UL[Upload Endpoint]
        UL --> VAL[Validation]
        VAL --> SCAN[Virus Scan]
    end

    subgraph Storage
        SCAN --> S3[S3 Upload]
        S3 --> META[Store Metadata]
    end

    subgraph Processing Queue
        META --> Q[BullMQ]
        Q --> IMG[Image Processor]
        Q --> FONT[Font Processor]
        Q --> DOC[Document Processor]
        Q --> DESIGN[Design Processor]
    end

    subgraph Output
        IMG --> OPT[Optimized Assets]
        FONT --> SUBSET[Subsetted Fonts]
        DOC --> TEXT[Extracted Text]
        DESIGN --> COMP[Components]

        OPT --> CDN[CloudFront CDN]
        SUBSET --> CDN
        TEXT --> DB[(Database)]
        COMP --> DB
    end
```

---

## 4.3 Real-Time Console

### 4.3.1 Overview

The Real-Time Console provides live visibility into the generation process, showing logs, AI agent conversations, build output, and system events as they occur.

### 4.3.2 Console Features

- **Log Stream**: Real-time log entries from all services
- **AI Conversation View**: See agent reasoning and outputs
- **Build Output**: Docker build logs with error highlighting
- **Filtering**: Filter by source, level, and search
- **Export**: Download logs for debugging

---

## 4.4 Preview Engine

### 4.4.1 Preview Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Live** | Hot-reloading development server | Active editing |
| **Static** | Pre-built static assets | Performance testing |
| **Snapshot** | Frozen point-in-time | Sharing, comparison |
| **Interactive** | Full functionality enabled | User testing |
| **Accessibility** | Overlay with a11y info | Accessibility audit |

### 4.4.2 Device Preview

- Mobile (375px, 812px)
- Tablet (768px, 1024px)
- Desktop (1440px, 900px)
- Responsive (full-width)

---

## 4.5 Export Engine

### 4.5.1 Export Formats

| Format | Contents | Use Case |
|--------|----------|----------|
| **Source Code** | Full source with dependencies | Developer handoff |
| **Static Build** | Production build output | Static hosting |
| **Docker Image** | Containerized application | Container deployment |
| **Vercel Project** | Vercel-optimized export | One-click Vercel deploy |
| **GitHub Repository** | Git-initialized project | Version control |

---

# 5. Database Schema

## 5.1 Overview

NexusGen uses PostgreSQL as the primary database with Prisma ORM for type-safe database access. The schema is designed for multi-tenancy, version control, and comprehensive audit trails.

## 5.2 Core Models

### Entity Relationship Overview

```mermaid
erDiagram
    User ||--o{ Organization : belongs_to
    User ||--o{ Project : owns
    Organization ||--o{ Project : contains
    Organization ||--o{ Subscription : has

    Project ||--o{ ProjectVersion : has
    Project ||--o{ Asset : contains
    Project ||--o{ Deployment : has
    Project ||--o{ AIConversation : has

    ProjectVersion ||--o{ BuildLog : generates

    AIConversation ||--o{ AIMessage : contains

    User ||--o{ UsageMetric : tracks
    Subscription ||--o{ UsageMetric : limits
```

## 5.3 Full Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [uuid_ossp(map: "uuid-ossp"), pgcrypto, vector]
}

// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String    @unique
  emailVerified DateTime? @map("email_verified")
  name          String?
  image         String?
  passwordHash  String?   @map("password_hash")

  // Profile
  bio           String?
  company       String?
  location      String?
  website       String?

  // Preferences
  preferences   Json      @default("{}")

  // Timestamps
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  deletedAt     DateTime? @map("deleted_at")
  lastLoginAt   DateTime? @map("last_login_at")

  // Relations
  accounts          Account[]
  sessions          Session[]
  projects          Project[]
  organizationUsers OrganizationUser[]
  apiKeys           ApiKey[]
  usageMetrics      UsageMetric[]

  @@map("users")
}

model Account {
  id                String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String  @map("user_id") @db.Uuid
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id") @db.Uuid
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ============================================
// ORGANIZATION & TEAM
// ============================================

model Organization {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  slug        String   @unique
  logo        String?
  description String?
  website     String?

  settings    Json     @default("{}")

  stripeCustomerId     String? @unique @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  users        OrganizationUser[]
  projects     Project[]
  subscription Subscription?

  @@map("organizations")
}

model OrganizationUser {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId String   @map("organization_id") @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  role           OrgRole  @default(MEMBER)

  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@map("organization_users")
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// ============================================
// PROJECT
// ============================================

model Project {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name           String
  slug           String
  description    String?

  userId         String   @map("user_id") @db.Uuid
  organizationId String?  @map("organization_id") @db.Uuid

  settings       Json     @default("{}")
  techStack      Json     @default("{}")

  status         ProjectStatus @default(DRAFT)
  visibility     Visibility    @default(PRIVATE)

  gitProvider    String?  @map("git_provider")
  gitRepoUrl     String?  @map("git_repo_url")
  gitBranch      String?  @map("git_branch")

  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")
  archivedAt     DateTime? @map("archived_at")

  user           User          @relation(fields: [userId], references: [id])
  organization   Organization? @relation(fields: [organizationId], references: [id])
  versions       ProjectVersion[]
  assets         Asset[]
  deployments    Deployment[]
  aiConversations AIConversation[]

  @@unique([organizationId, slug])
  @@unique([userId, slug])
  @@index([userId])
  @@index([organizationId])
  @@index([status])
  @@map("projects")
}

enum ProjectStatus {
  DRAFT
  GENERATING
  BUILDING
  READY
  DEPLOYED
  FAILED
  ARCHIVED
}

enum Visibility {
  PRIVATE
  TEAM
  PUBLIC
}

// ============================================
// PROJECT VERSION
// ============================================

model ProjectVersion {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  projectId   String   @map("project_id") @db.Uuid
  version     Int      @default(1)

  files       Json     @default("{}")
  packageJson Json     @default("{}") @map("package_json")
  prd         Json?

  prompt      String?  @db.Text
  generationConfig Json? @map("generation_config")

  commitHash  String?  @map("commit_hash")
  commitMessage String? @map("commit_message")

  status      VersionStatus @default(DRAFT)

  createdAt   DateTime @default(now()) @map("created_at")
  publishedAt DateTime? @map("published_at")

  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  buildLogs   BuildLog[]

  @@unique([projectId, version])
  @@index([projectId])
  @@map("project_versions")
}

enum VersionStatus {
  DRAFT
  BUILDING
  BUILT
  PUBLISHED
  FAILED
}

// ============================================
// ASSETS
// ============================================

model Asset {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  projectId   String    @map("project_id") @db.Uuid

  filename    String
  originalName String   @map("original_name")
  mimeType    String    @map("mime_type")
  size        Int

  storageKey  String    @map("storage_key")
  publicUrl   String?   @map("public_url")
  thumbnailUrl String?  @map("thumbnail_url")

  processedAt DateTime? @map("processed_at")
  metadata    Json      @default("{}")

  folder      String?
  tags        String[]  @default([])

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([mimeType])
  @@map("assets")
}

// ============================================
// DEPLOYMENTS
// ============================================

model Deployment {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  projectId   String   @map("project_id") @db.Uuid
  versionId   String?  @map("version_id") @db.Uuid

  provider    DeploymentProvider
  providerId  String?  @map("provider_id")

  url         String?
  previewUrl  String?  @map("preview_url")
  customDomain String? @map("custom_domain")

  status      DeploymentStatus @default(PENDING)

  environment DeploymentEnvironment @default(PREVIEW)
  envVars     Json     @default("{}") @map("env_vars")

  buildId     String?  @map("build_id")
  imageTag    String?  @map("image_tag")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deployedAt  DateTime? @map("deployed_at")

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([status])
  @@map("deployments")
}

enum DeploymentProvider {
  VERCEL
  NETLIFY
  CLOUDFLARE
  AWS
  GCP
  DOCKER
  CUSTOM
}

enum DeploymentStatus {
  PENDING
  BUILDING
  DEPLOYING
  READY
  FAILED
  CANCELLED
}

enum DeploymentEnvironment {
  PREVIEW
  STAGING
  PRODUCTION
}

// ============================================
// BUILD LOGS
// ============================================

model BuildLog {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  versionId   String   @map("version_id") @db.Uuid

  buildNumber Int      @map("build_number")
  status      BuildStatus @default(PENDING)

  logs        String   @db.Text
  errorLogs   String?  @db.Text @map("error_logs")

  duration    Int?
  exitCode    Int?     @map("exit_code")

  memoryUsed  Int?     @map("memory_used")
  cpuTime     Int?     @map("cpu_time")

  artifactUrl String?  @map("artifact_url")
  imageDigest String?  @map("image_digest")

  startedAt   DateTime? @map("started_at")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime @default(now()) @map("created_at")

  version     ProjectVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)

  @@index([versionId])
  @@index([status])
  @@map("build_logs")
}

enum BuildStatus {
  PENDING
  RUNNING
  SUCCESS
  FAILED
  CANCELLED
}

// ============================================
// AI CONVERSATIONS
// ============================================

model AIConversation {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  projectId   String   @map("project_id") @db.Uuid

  title       String?
  type        ConversationType @default(GENERATION)
  status      ConversationStatus @default(ACTIVE)

  agentType   String?  @map("agent_type")
  model       String?

  totalInputTokens  Int @default(0) @map("total_input_tokens")
  totalOutputTokens Int @default(0) @map("total_output_tokens")
  totalCost         Decimal @default(0) @db.Decimal(10, 6) @map("total_cost")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  completedAt DateTime? @map("completed_at")

  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  messages    AIMessage[]

  @@index([projectId])
  @@index([type])
  @@map("ai_conversations")
}

enum ConversationType {
  GENERATION
  MODIFICATION
  FIX
  REVIEW
  CHAT
}

enum ConversationStatus {
  ACTIVE
  COMPLETED
  FAILED
  CANCELLED
}

model AIMessage {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  conversationId String   @map("conversation_id") @db.Uuid

  role           MessageRole
  content        String   @db.Text

  inputTokens    Int      @default(0) @map("input_tokens")
  outputTokens   Int      @default(0) @map("output_tokens")

  model          String?
  finishReason   String?  @map("finish_reason")
  toolCalls      Json?    @map("tool_calls")

  createdAt      DateTime @default(now()) @map("created_at")

  conversation   AIConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@map("ai_messages")
}

enum MessageRole {
  SYSTEM
  USER
  ASSISTANT
  TOOL
}

// ============================================
// SUBSCRIPTIONS
// ============================================

model Subscription {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId String   @unique @map("organization_id") @db.Uuid

  stripeSubscriptionId String  @unique @map("stripe_subscription_id")
  stripePriceId        String  @map("stripe_price_id")
  stripeCustomerId     String  @map("stripe_customer_id")

  plan           SubscriptionPlan @default(FREE)
  status         SubscriptionStatus @default(ACTIVE)

  currentPeriodStart DateTime @map("current_period_start")
  currentPeriodEnd   DateTime @map("current_period_end")

  limits         Json     @default("{}")

  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")
  cancelledAt    DateTime? @map("cancelled_at")

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  usageMetrics   UsageMetric[]

  @@map("subscriptions")
}

enum SubscriptionPlan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  INCOMPLETE
  TRIALING
}

// ============================================
// USAGE METRICS
// ============================================

model UsageMetric {
  id             String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId         String   @map("user_id") @db.Uuid
  subscriptionId String?  @map("subscription_id") @db.Uuid

  periodStart    DateTime @map("period_start")
  periodEnd      DateTime @map("period_end")

  generationsCount    Int @default(0) @map("generations_count")
  buildsCount         Int @default(0) @map("builds_count")
  deploymentsCount    Int @default(0) @map("deployments_count")

  inputTokensUsed     BigInt @default(0) @map("input_tokens_used")
  outputTokensUsed    BigInt @default(0) @map("output_tokens_used")

  storageUsedBytes    BigInt @default(0) @map("storage_used_bytes")
  bandwidthUsedBytes  BigInt @default(0) @map("bandwidth_used_bytes")

  totalCost           Decimal @default(0) @db.Decimal(10, 2) @map("total_cost")

  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id])
  subscription Subscription? @relation(fields: [subscriptionId], references: [id])

  @@unique([userId, periodStart, periodEnd])
  @@index([userId])
  @@index([subscriptionId])
  @@index([periodStart, periodEnd])
  @@map("usage_metrics")
}
```

## 5.4 Indexing Strategy

### Primary Indexes

```sql
-- High-frequency queries
CREATE INDEX idx_projects_user_status ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_org_status ON projects(organization_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_deployments_project_env ON deployments(project_id, environment, status);
CREATE INDEX idx_ai_conversations_project_type ON ai_conversations(project_id, type);

-- Full-text search
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Vector similarity search
CREATE INDEX idx_fix_cache_embedding ON fix_cache USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Time-series queries
CREATE INDEX idx_usage_metrics_period ON usage_metrics(user_id, period_start DESC);
CREATE INDEX idx_build_logs_created ON build_logs(created_at DESC);
```

## 5.5 Data Relationships Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│    User     │────<│ OrganizationUser │>────│Organization │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                                            │
       │                                            │
       ▼                                            ▼
┌─────────────┐                              ┌─────────────┐
│   Project   │<─────────────────────────────│Subscription │
└─────────────┘                              └─────────────┘
       │                                            │
       ├───────────────┬───────────────┐           │
       ▼               ▼               ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ProjectVersion│ │    Asset    │ │ Deployment  │ │UsageMetric  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
       │
       ▼
┌─────────────┐
│  BuildLog   │
└─────────────┘

┌─────────────┐
│AIConversation│
└─────────────┘
       │
       ▼
┌─────────────┐
│  AIMessage  │
└─────────────┘
```

---

# 6. The Agent Protocol

This section defines the complete prompt engineering architecture for NexusGen's autonomous website generation system. It covers all agent definitions, their system prompts, input/output schemas, and orchestration patterns.

---

## 6.1 Architecture Overview

NexusGen employs a multi-agent architecture with four specialized agents working in concert:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER REQUEST                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARCHITECT AGENT                                      │
│                    (Requirements → PRD)                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           RAG LAYER                                          │
│              (Documentation Retrieval & Context Injection)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CODER AGENT                                         │
│                    (PRD → File Operations)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REVIEWER AGENT                                       │
│                  (Quality, Security, Performance)                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR (STATE MACHINE)                            │
│              (Coordination, Rollback, Final Assembly)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6.2 Agent A: Architect Agent

### 6.2.1 Purpose

The Architect Agent transforms raw user requirements into a comprehensive Product Requirements Document (PRD) that serves as the single source of truth for all downstream agents. It performs requirements analysis, identifies implicit needs, resolves ambiguities, and produces a structured specification.

### 6.2.2 Core Responsibilities

1. **Requirements Analysis**: Extract explicit and implicit requirements from user input
2. **Gap Identification**: Identify missing information and make reasonable assumptions
3. **Technical Translation**: Convert business requirements to technical specifications
4. **Scope Definition**: Clearly define what is in-scope and out-of-scope
5. **Risk Assessment**: Identify potential technical challenges and mitigation strategies

### 6.2.3 Architectural Principles

- **Server-First Architecture**: Prefer React Server Components; client components only when necessary
- **Type Safety**: Full TypeScript coverage with strict mode
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Performance Budget**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Security by Default**: Input validation, CSRF protection, secure headers

### 6.2.4 Chain-of-Thought Process

For each request, follow this reasoning process:

**Step 1: Comprehension**
- What is the user trying to build?
- Who is the target audience?
- What is the primary value proposition?

**Step 2: Decomposition**
- Break down into distinct features/modules
- Identify dependencies between components
- Map user journeys and flows

**Step 3: Technical Mapping**
- Which pages/routes are needed?
- What data models are required?
- Which API endpoints are necessary?
- What third-party integrations are needed?

**Step 4: Constraint Analysis**
- What are the non-functional requirements?
- Are there performance constraints?
- Are there compliance requirements?
- What is the timeline/complexity budget?

**Step 5: Assumption Documentation**
- Document all assumptions made
- Flag areas needing user clarification
- Note alternative approaches considered

---

## 6.3 Agent B: Coder Agent

### 6.3.1 Purpose

The Coder Agent transforms the PRD into executable file system operations. It generates production-ready code following modern best practices, the specified technology stack, and the exact specifications from the PRD.

### 6.3.2 Technology Expertise

- **Next.js 15**: App Router, Server Components, Server Actions, Metadata API
- **React 19**: Hooks, Suspense, Transitions, use() hook
- **TypeScript 5.x**: Strict mode, generics, utility types, type guards
- **Tailwind CSS v4**: Utility classes, custom configurations, responsive design
- **shadcn/ui**: Component patterns, theming, accessibility
- **Prisma**: Schema design, migrations, queries, relations
- **NextAuth.js v5**: Providers, callbacks, session management

### 6.3.3 File Organization Standards

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth route group
│   ├── (dashboard)/         # Protected routes
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── error.tsx            # Global error
│   ├── loading.tsx          # Global loading
│   └── not-found.tsx        # 404 page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── forms/               # Form components
│   ├── layouts/             # Layout components
│   └── [feature]/           # Feature-specific
├── lib/
│   ├── prisma.ts            # Prisma client
│   ├── auth.ts              # Auth configuration
│   ├── utils.ts             # Utility functions
│   └── validations/         # Zod schemas
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
├── styles/                  # Global styles
└── config/                  # Configuration
```

---

## 6.4 Agent C: Reviewer Agent

### 6.4.1 Purpose

The Reviewer Agent performs comprehensive code review on generated code, checking for quality, security vulnerabilities, performance issues, and adherence to best practices before code is committed.

### 6.4.2 Review Checklist

**Security Review (Critical)**
- No hardcoded secrets or API keys
- Input validation on all user inputs
- SQL injection prevention
- XSS prevention
- CSRF protection
- Authentication checks on protected routes
- Authorization checks for data access

**Performance Review (High)**
- No unnecessary client components
- Proper use of Server Components
- Efficient data fetching (no waterfalls)
- Image and font optimization
- Bundle size considerations
- Proper caching strategies

**Code Quality Review (Medium)**
- Consistent naming conventions
- Proper TypeScript types (no any)
- Error handling coverage
- Loading state handling
- Edge case handling
- Code duplication minimized

**Accessibility Review (High)**
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast ratios

---

## 6.5 RAG Strategy

### 6.5.1 Documentation Sources

| Source | Priority | Update Frequency |
|--------|----------|------------------|
| Next.js Documentation | 100 | Daily |
| React Documentation | 95 | Weekly |
| Tailwind CSS Documentation | 90 | On Release |
| Prisma Documentation | 85 | Weekly |
| NextAuth.js Documentation | 85 | Weekly |
| shadcn/ui Documentation | 80 | Weekly |

### 6.5.2 Chunking Strategy

- **Target chunk size**: 512 tokens
- **Max chunk size**: 1024 tokens
- **Overlap**: 50 tokens
- **Preserve code blocks**: Yes
- **Semantic boundaries**: Headings, code blocks

### 6.5.3 Context Window Management

- **Max context tokens**: 128,000 (Claude)
- **Reserved for output**: 8,000
- **Reserved for system**: 4,000
- **Available for RAG**: 16,000
- **Top-K retrieval**: 20
- **After reranking**: 10

### 6.5.4 Deprecation Prevention

The system maintains a database of deprecated patterns and actively prevents their generation:

| Pattern | Framework | Deprecated In | Replacement |
|---------|-----------|---------------|-------------|
| Pages Router | Next.js | 13.0.0 | App Router |
| getServerSideProps | Next.js | 13.0.0 | Server Components |
| getStaticProps | Next.js | 13.0.0 | generateStaticParams |
| useEffect for fetching | React | 18.0.0 | Server Components |
| next/legacy/image | Next.js | 13.0.0 | next/image |

---

## 6.6 Agent Orchestration

### 6.6.1 Configuration

```typescript
const orchestrationConfig: OrchestrationConfig = {
  mode: 'adaptive',

  agents: [
    {
      id: 'architect',
      name: 'Architect Agent',
      type: 'architect',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.7,
      maxTokens: 16000,
      timeout: 120000,
      retries: 2,
      dependsOn: []
    },
    {
      id: 'coder',
      name: 'Coder Agent',
      type: 'coder',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.3,
      maxTokens: 32000,
      timeout: 180000,
      retries: 3,
      dependsOn: ['architect']
    },
    {
      id: 'reviewer',
      name: 'Reviewer Agent',
      type: 'reviewer',
      model: 'claude-sonnet-4-20250514',
      temperature: 0.2,
      maxTokens: 8000,
      timeout: 60000,
      retries: 2,
      dependsOn: ['coder']
    }
  ],

  errorHandling: {
    strategy: 'retry_then_rollback',
    maxRetries: 3,
    backoffMultiplier: 2,
    rollbackOnCritical: true
  }
};
```

### 6.6.2 State Machine

```
Idle → Planning → Coding → Building → Testing → Deploying → Preview → Production → Complete

Error States:
- Building → Healing → Coding (fix applied)
- Building → Healing → Escalated (max retries)
- Testing → Healing → Coding
- Deploying → Healing → Building
```

### 6.6.3 Summary Table

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **Architect Agent** | Requirements to PRD | Chain-of-thought reasoning, validation |
| **Coder Agent** | PRD to Code | Framework expertise, error patterns |
| **Reviewer Agent** | Quality Assurance | Security, performance, accessibility |
| **RAG System** | Documentation Context | Semantic chunking, deprecation prevention |
| **Orchestrator** | Coordination | State management, rollback mechanisms |

---

# 7. Project Folder Structure

## 7.1 Monorepo Overview

NexusGen uses a Turborepo-based monorepo structure for optimal code sharing, build caching, and development experience.

```
nexusgen/
├── .github/                    # GitHub configuration
│   ├── workflows/             # CI/CD workflows
│   │   ├── ci.yml
│   │   ├── deploy-production.yml
│   │   ├── deploy-staging.yml
│   │   └── release.yml
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── .husky/                     # Git hooks
│   ├── pre-commit
│   ├── pre-push
│   └── commit-msg
│
├── apps/                       # Application packages
│   ├── web/                   # Next.js web application
│   ├── worker/                # NestJS worker service
│   ├── docs/                  # Documentation site
│   └── admin/                 # Admin dashboard
│
├── packages/                   # Shared packages
│   ├── ui/                    # Shared UI components
│   ├── database/              # Prisma schema & client
│   ├── ai/                    # AI provider integrations
│   ├── config/                # Shared configurations
│   ├── utils/                 # Shared utilities
│   └── types/                 # Shared TypeScript types
│
├── docker/                     # Docker configurations
│   ├── development/
│   ├── production/
│   └── docker-compose.yml
│
├── scripts/                    # Build and utility scripts
│   ├── setup.sh
│   ├── seed-database.ts
│   └── generate-types.ts
│
├── .env.example               # Environment template
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
├── turbo.json                 # Turborepo configuration
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace config
└── README.md                  # Project documentation
```

## 7.2 Apps Directory

### 7.2.1 Web Application (apps/web)

```
apps/web/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── settings/
│   │   │   ├── layout.tsx
│   │   │   └── error.tsx
│   │   │
│   │   ├── (marketing)/              # Public marketing pages
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── pricing/
│   │   │   ├── features/
│   │   │   ├── about/
│   │   │   ├── blog/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                       # API routes
│   │   │   ├── auth/
│   │   │   ├── projects/
│   │   │   ├── generations/
│   │   │   ├── assets/
│   │   │   ├── webhooks/
│   │   │   └── health/
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   └── loading.tsx
│   │
│   ├── components/                    # React components
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── forms/                    # Form components
│   │   ├── layouts/                  # Layout components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── preview/                  # Preview components
│   │   ├── editor/                   # Code editor components
│   │   └── shared/                   # Shared components
│   │
│   ├── hooks/                         # Custom React hooks
│   ├── lib/                           # Utility libraries
│   ├── actions/                       # Server actions
│   ├── types/                         # TypeScript types
│   └── config/                        # Configuration
│
├── public/                            # Static assets
├── tests/                             # Test files
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

### 7.2.2 Worker Service (apps/worker)

```
apps/worker/
├── src/
│   ├── main.ts                        # Application entry
│   ├── app.module.ts                  # Root module
│   │
│   ├── auth/                          # Authentication module
│   ├── projects/                      # Projects module
│   ├── generations/                   # Generations module
│   ├── builds/                        # Build module
│   ├── deployments/                   # Deployments module
│   ├── ai/                            # AI module
│   │   ├── ai.module.ts
│   │   ├── ai-orchestrator.service.ts
│   │   ├── agents/
│   │   ├── providers/
│   │   └── rag/
│   ├── assets/                        # Assets module
│   ├── websockets/                    # WebSocket module
│   ├── queues/                        # Queue configuration
│   ├── database/                      # Database module
│   ├── storage/                       # Storage module
│   ├── health/                        # Health checks
│   ├── metrics/                       # Metrics
│   └── common/                        # Shared utilities
│
├── test/
├── nest-cli.json
├── tsconfig.json
├── package.json
└── Dockerfile
```

## 7.3 Packages Directory

### 7.3.1 UI Package (packages/ui)

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── button/
│   │   ├── input/
│   │   ├── card/
│   │   ├── dialog/
│   │   └── ...
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── index.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### 7.3.2 Database Package (packages/database)

```
packages/database/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── client.ts
│   ├── types.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 7.3.3 AI Package (packages/ai)

```
packages/ai/
├── src/
│   ├── providers/
│   ├── prompts/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 7.3.4 Config Package (packages/config)

```
packages/config/
├── eslint/
├── typescript/
├── tailwind/
├── prettier/
└── package.json
```

## 7.4 Docker Configuration

### 7.4.1 Development Docker Compose

```yaml
# docker/docker-compose.yml
version: '3.9'

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: nexusgen-postgres
    environment:
      POSTGRES_USER: nexusgen
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-nexusgen_dev}
      POSTGRES_DB: nexusgen
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: nexusgen-redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-nexusgen_dev}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio:latest
    container_name: nexusgen-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-nexusgen}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-nexusgen_dev}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  mailhog:
    image: mailhog/mailhog
    container_name: nexusgen-mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

## 7.5 CI/CD Configuration

### 7.5.1 GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm db:generate
      - run: pnpm db:migrate
      - run: pnpm test:unit
      - run: pnpm test:integration

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

---

# 8. Implementation Phases

## 8.1 Phase 1: Foundation (Weeks 1-4)

### 8.1.1 Objectives

- Set up monorepo infrastructure
- Implement authentication system
- Create base UI components
- Establish database schema
- Configure CI/CD pipeline

### 8.1.2 Tasks

| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Initialize Turborepo monorepo | Critical | 2d | DevOps |
| Set up Next.js 15 web application | Critical | 3d | Frontend |
| Set up NestJS worker service | Critical | 3d | Backend |
| Configure PostgreSQL with pgvector | Critical | 2d | Backend |
| Implement Prisma schema | Critical | 3d | Backend |
| Set up Redis for caching/queues | High | 2d | Backend |
| Implement NextAuth.js authentication | Critical | 4d | Full Stack |
| Create shadcn/ui component library | High | 5d | Frontend |
| Set up Tailwind CSS v4 | High | 1d | Frontend |
| Configure Docker development environment | High | 2d | DevOps |
| Set up GitHub Actions CI | High | 2d | DevOps |
| Implement S3 storage integration | Medium | 2d | Backend |

### 8.1.3 Deliverables

- [ ] Working development environment
- [ ] Authentication flow (login, register, password reset)
- [ ] Basic dashboard layout
- [ ] Database migrations working
- [ ] CI pipeline running on PRs

### 8.1.4 Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Turborepo configuration complexity | Medium | Medium | Follow official examples, start simple |
| Auth integration issues | Low | High | Use NextAuth.js templates, test early |
| Database schema changes | Medium | Low | Use migrations from start |

### 8.1.5 Acceptance Criteria

- [ ] User can register with email/password
- [ ] User can log in and see dashboard
- [ ] All components render correctly
- [ ] Database operations work
- [ ] CI runs tests and type checks
- [ ] Docker compose brings up all services

---

## 8.2 Phase 2: Core Features (Weeks 5-8)

### 8.2.1 Objectives

- Implement project management
- Build asset upload pipeline
- Create real-time WebSocket infrastructure
- Implement job queue system

### 8.2.2 Tasks

| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Project CRUD operations | Critical | 3d | Backend |
| Project dashboard UI | Critical | 4d | Frontend |
| Asset upload endpoint | Critical | 3d | Backend |
| Image processing pipeline | High | 3d | Backend |
| Asset management UI | High | 3d | Frontend |
| BullMQ queue setup | Critical | 2d | Backend |
| WebSocket gateway | Critical | 3d | Backend |
| Socket.io client hook | High | 2d | Frontend |
| Real-time notifications | High | 2d | Full Stack |
| Project version control | Medium | 3d | Backend |
| File tree component | High | 3d | Frontend |

### 8.2.3 Deliverables

- [ ] Complete project management
- [ ] Asset upload and processing
- [ ] Real-time updates working
- [ ] Job queue processing builds

### 8.2.4 Acceptance Criteria

- [ ] User can create/edit/delete projects
- [ ] User can upload images (up to 10MB)
- [ ] User sees real-time progress updates
- [ ] Jobs process in background
- [ ] File changes sync across tabs

---

## 8.3 Phase 3: AI Integration (Weeks 9-12)

### 8.3.1 Objectives

- Implement AI agent system
- Build RAG documentation pipeline
- Create generation orchestrator
- Implement self-healing mechanism

### 8.3.2 Tasks

| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Anthropic provider integration | Critical | 2d | AI |
| OpenAI provider integration | High | 2d | AI |
| Architect agent implementation | Critical | 5d | AI |
| Coder agent implementation | Critical | 5d | AI |
| Reviewer agent implementation | Critical | 4d | AI |
| RAG documentation scraper | High | 3d | Backend |
| Vector embedding pipeline | High | 3d | AI |
| pgvector similarity search | High | 2d | Backend |
| Agent orchestrator | Critical | 4d | Backend |
| Error classification system | High | 3d | Backend |
| Fix cache implementation | High | 3d | Backend |
| Generation UI with progress | Critical | 4d | Frontend |

### 8.3.3 Deliverables

- [ ] Working generation pipeline
- [ ] All three agents operational
- [ ] RAG system reducing errors
- [ ] Self-healing fixing common errors

### 8.3.4 Acceptance Criteria

- [ ] User can generate app from prompt
- [ ] Generation completes in <5 minutes
- [ ] Code passes review checks
- [ ] 70% of errors auto-fixed
- [ ] Token costs tracked per user

---

## 8.4 Phase 4: Polish & Optimization (Weeks 13-16)

### 8.4.1 Objectives

- Implement preview engine
- Build export functionality
- Optimize performance
- Enhance user experience

### 8.4.2 Tasks

| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Preview engine (WebContainer) | Critical | 5d | Frontend |
| Device preview modes | High | 2d | Frontend |
| Code export (zip) | Critical | 2d | Backend |
| GitHub export integration | High | 3d | Backend |
| Vercel deployment integration | High | 3d | Backend |
| Performance optimization | High | 4d | Full Stack |
| Error boundary improvements | Medium | 2d | Frontend |
| Loading state polish | Medium | 2d | Frontend |
| Accessibility audit & fixes | High | 3d | Frontend |
| Mobile responsive polish | High | 3d | Frontend |

### 8.4.3 Deliverables

- [ ] Live preview working
- [ ] Export to multiple targets
- [ ] <3s page load times
- [ ] A11y score >90

### 8.4.4 Acceptance Criteria

- [ ] Preview loads generated app
- [ ] User can export to zip/GitHub
- [ ] One-click Vercel deploy works
- [ ] Lighthouse scores >85
- [ ] Works on mobile devices

---

## 8.5 Phase 5: Beta Launch (Weeks 17-20)

### 8.5.1 Objectives

- Implement billing system
- Set up production infrastructure
- Conduct security audit
- Prepare for beta users

### 8.5.2 Tasks

| Task | Priority | Estimate | Owner |
|------|----------|----------|-------|
| Stripe subscription integration | Critical | 4d | Backend |
| Usage metering & limits | Critical | 3d | Backend |
| Billing UI | Critical | 3d | Frontend |
| Production Kubernetes setup | Critical | 5d | DevOps |
| CDN configuration | High | 2d | DevOps |
| Security audit | Critical | 5d | Security |
| Penetration testing | Critical | 3d | Security |
| Load testing | High | 3d | DevOps |
| Documentation site | High | 4d | Full Stack |
| Marketing landing page | High | 3d | Frontend |
| Beta user onboarding | Medium | 2d | Product |

### 8.5.3 Deliverables

- [ ] Billing system live
- [ ] Production environment stable
- [ ] Security audit passed
- [ ] Documentation complete
- [ ] Beta users onboarded

### 8.5.4 Acceptance Criteria

- [ ] User can subscribe to paid plan
- [ ] Usage limits enforced
- [ ] 99.9% uptime achieved
- [ ] No critical security issues
- [ ] 50 beta users onboarded
- [ ] NPS >40 from beta users

---

## Implementation Timeline Summary

```
Week  1-4:  ████████████████ Foundation
Week  5-8:  ████████████████ Core Features
Week  9-12: ████████████████ AI Integration
Week 13-16: ████████████████ Polish & Optimization
Week 17-20: ████████████████ Beta Launch

Key Milestones:
• Week 4:  Development environment complete
• Week 8:  Core platform functional
• Week 12: AI generation working
• Week 16: Production-ready
• Week 20: Beta launch
```

---

## Appendix A: Environment Variables

```bash
# .env.example

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Database
DATABASE_URL=postgresql://nexusgen:password@localhost:5432/nexusgen

# Redis
REDIS_URL=redis://:password@localhost:6379

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI Providers
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET=nexusgen-assets

# CDN
CLOUDFRONT_DISTRIBUTION_ID=
CLOUDFRONT_DOMAIN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@nexusgen.ai
```

---

## Appendix B: API Reference Summary

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/projects | List user projects |
| POST | /api/v1/projects | Create project |
| GET | /api/v1/projects/:id | Get project details |
| PATCH | /api/v1/projects/:id | Update project |
| DELETE | /api/v1/projects/:id | Delete project |

### Generations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/generations | Start generation |
| GET | /api/v1/generations/:id | Get generation status |
| POST | /api/v1/generations/:id/cancel | Cancel generation |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/assets/upload | Upload asset |
| GET | /api/v1/assets/:id | Get asset |
| DELETE | /api/v1/assets/:id | Delete asset |

### Deployments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/deployments | Create deployment |
| GET | /api/v1/deployments/:id | Get deployment status |
| DELETE | /api/v1/deployments/:id | Remove deployment |

---

*This document is the single source of truth for NexusGen development. Keep it updated as the project evolves.*

**Document Version:** 1.0.0
**Last Updated:** 2026-01-28
**Maintained By:** NexusGen Development Team
