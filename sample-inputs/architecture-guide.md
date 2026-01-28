# NexusGen Architecture Reference — Test Document

> This is a sample document used to test the NexusGen file upload and parsing pipeline.

## System Overview

NexusGen follows a modular monorepo architecture built on the Turborepo build system.
The platform orchestrates AI agents to transform natural-language project descriptions
into deployable, production-ready web applications.

## Core Modules

| Module            | Path                | Purpose                              |
|-------------------|---------------------|--------------------------------------|
| Web App           | `apps/web`          | Next.js frontend dashboard           |
| Worker Service    | `apps/worker`       | NestJS background job processor      |
| AI Package        | `packages/ai`       | AI provider integrations (OpenAI)    |
| Database Package  | `packages/database` | Prisma ORM schema and client         |
| UI Package        | `packages/ui`       | Shared React component library       |

## AI Agent Pipeline

```text
User Prompt
    │
    ▼
┌──────────────┐
│  Architect   │ ──► Technical Specification (JSON)
│    Agent     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Coder      │ ──► Generated Source Files
│    Agent     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Validator   │ ──► Docker Build Check + Self-Healing
│    Agent     │
└──────────────┘
```

## Environment Variables

| Variable         | Required | Description                     |
|------------------|----------|---------------------------------|
| `DATABASE_URL`   | Yes      | PostgreSQL connection string    |
| `OPENAI_API_KEY` | Yes      | OpenAI API key for GPT-4o      |
| `REDIS_URL`      | Yes      | Redis connection for BullMQ     |
| `JWT_SECRET`     | Yes      | Secret for auth token signing   |

## Testing Checklist

- [ ] Unit tests pass (`pnpm test`)
- [ ] Type check passes (`pnpm typecheck`)
- [ ] Full build succeeds (`pnpm build`)
- [ ] Docker compose starts all services
- [ ] AI generation produces valid output

---

*This document is for testing purposes only.*
