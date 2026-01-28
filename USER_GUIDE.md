# NexusGen User Guide

> AI-Powered Web Application Generator - Alpha Release

Welcome to NexusGen! This guide will walk you through everything you need to get started building web applications with the power of AI. Whether you're creating a simple landing page or a complex full-stack application, NexusGen handles the heavy lifting while you focus on your vision.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Getting Your API Keys](#2-getting-your-api-keys)
3. [Installation & Setup](#3-installation--setup)
4. [Running NexusGen](#4-running-nexusgen)
5. [Creating Your First Project](#5-creating-your-first-project)
6. [Understanding the Generation Process](#6-understanding-the-generation-process)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

Before installing NexusGen, ensure you have the following software installed on your system:

| Requirement | Minimum Version | Check Command |
|-------------|-----------------|---------------|
| Node.js | 20.0.0+ | `node --version` |
| pnpm | 9.0.0+ | `pnpm --version` |
| Docker Desktop | Latest | `docker --version` |
| Git | 2.0+ | `git --version` |

### Installing Prerequisites

**Node.js 20+**

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download directly from https://nodejs.org
```

**pnpm 9+**

```bash
# Using npm
npm install -g pnpm@latest

# Using corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

**Docker Desktop**

Download and install from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

> **Note**: Make sure Docker Desktop is running before starting NexusGen. You can verify by running `docker info` in your terminal.

---

## 2. Getting Your API Keys

NexusGen uses AI providers to generate your applications. You'll need at least one API key to get started.

### Anthropic (Claude) API Key - Required

Claude powers the core generation engine of NexusGen. Here's how to get your API key:

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up for a new account or log in to your existing account
3. Navigate to **Settings** > **API Keys** in the left sidebar
4. Click the **Create Key** button
5. Give your key a descriptive name (e.g., "NexusGen Development")
6. Copy the key immediately - it starts with `sk-ant-`

> **Important**: You won't be able to see this key again after closing the dialog. Store it securely!

Add the key to your environment:

```bash
# In your .env file
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Optional: OpenAI API Key

OpenAI can be used as an alternative or supplementary AI provider:

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up or log in to your account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

```bash
# In your .env file
OPENAI_API_KEY=sk-xxxxx
```

### Optional: Google AI (Gemini) API Key

For Google's Gemini models:

1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API Key** in the top navigation
4. Click **Create API Key**
5. Select or create a Google Cloud project
6. Copy the generated key

```bash
# In your .env file
GOOGLE_AI_API_KEY=xxxxx
```

### API Key Best Practices

> **Security Warning**: Never commit API keys to version control. The `.env` file is already in `.gitignore`, but always double-check before pushing code.

- Use separate API keys for development and production
- Set usage limits in your provider's dashboard to avoid unexpected charges
- Rotate keys periodically for enhanced security
- Monitor usage through your provider's dashboard

---

## 3. Installation & Setup

### Step 1: Clone the Repository

```bash
git clone <repo-url>
cd nexusgen
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This installs all required packages for both the frontend and backend.

### Step 3: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Open .env in your editor and add your API keys
```

Your `.env` file should contain at minimum:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Database (auto-configured by Docker)
DATABASE_URL=postgresql://nexusgen:nexusgen@localhost:5432/nexusgen

# Redis (auto-configured by Docker)
REDIS_URL=redis://localhost:6379

# Optional AI Providers
OPENAI_API_KEY=sk-xxxxx
GOOGLE_AI_API_KEY=xxxxx
```

### Step 4: Start the Infrastructure

```bash
pnpm start
```

The startup script automatically:

1. **Checks for `.env`** - Creates from `.env.example` if missing
2. **Verifies Docker** - Ensures Docker Desktop is running
3. **Starts PostgreSQL** - Database container on port 5432
4. **Starts Redis** - Cache/queue container on port 6379
5. **Runs Migrations** - Sets up database schema with Prisma
6. **Seeds Data** - Populates initial data if needed

> **Tip**: First-time setup may take a few minutes while Docker pulls the required images.

### Verifying Installation

After `pnpm start` completes successfully, you should see:

```
[OK] Docker is running
[OK] PostgreSQL is ready
[OK] Redis is ready
[OK] Database migrations complete
[OK] NexusGen is ready to launch!
```

---

## 4. Running NexusGen

### Starting the Development Server

```bash
pnpm dev
```

This starts both the frontend and backend in development mode with hot reloading.

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Web Application | [http://localhost:3000](http://localhost:3000) | Main NexusGen interface |
| API Documentation | [http://localhost:3001/docs](http://localhost:3001/docs) | Interactive API reference |
| Database Studio | `pnpm db:studio` | Visual database browser |

### Available Commands

```bash
# Development
pnpm dev          # Start development servers
pnpm build        # Build for production
pnpm preview      # Preview production build

# Database
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run pending migrations
pnpm db:reset     # Reset database (caution: deletes data)
pnpm db:seed      # Seed database with sample data

# Testing
pnpm test         # Run test suite
pnpm test:watch   # Run tests in watch mode

# Utilities
pnpm lint         # Check code style
pnpm format       # Format code with Prettier
pnpm typecheck    # Run TypeScript checks
```

### Stopping NexusGen

```bash
# Stop development servers
Ctrl + C

# Stop Docker containers
pnpm docker:stop

# Stop and remove containers (preserves data)
pnpm docker:down
```

---

## 5. Creating Your First Project

Let's build your first AI-generated web application!

### Step 1: Open NexusGen

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Step 2: Start a New Project

Click the **"Start Building"** button on the homepage, or navigate to **Projects** > **New Project**.

### Step 3: Configure Your Project

**Project Name**
Enter a descriptive name for your project (e.g., "My Portfolio Site").

**Description**
This is the most important part! Describe what you want to build in detail. Be specific about:

- The type of application (landing page, dashboard, e-commerce, etc.)
- Key features you need
- Design preferences (modern, minimal, colorful, etc.)
- Any specific technologies or frameworks

**Example descriptions:**

> A modern portfolio website for a photographer. Include a hero section with a full-screen image, a gallery grid with lightbox functionality, an about page with a timeline of achievements, and a contact form. Use a dark theme with accent colors.

> A task management dashboard with user authentication. Features should include creating/editing/deleting tasks, organizing into projects, due dates with reminders, and a kanban board view. Use a clean, minimal design similar to Linear.

### Step 4: Add Reference Materials (Optional)

Enhance your generation by uploading:

- **Screenshots**: UI designs, mockups, or inspiration images
- **Videos**: Demonstrations of desired functionality
- **Documents**: PRDs, specifications, or requirement documents

> **Tip**: The more context you provide, the better NexusGen can understand your vision.

### Step 5: Generate

Click the **"Generate"** button and watch NexusGen work its magic!

### Step 6: Review and Iterate

Once generation completes:

1. **Preview** your application in the built-in viewer
2. **Download** the source code
3. **Iterate** by providing feedback and regenerating specific components

---

## 6. Understanding the Generation Process

NexusGen follows a sophisticated multi-stage process to transform your description into a working application.

### Stage 1: Analysis

**What happens**: NexusGen analyzes your project description, reference materials, and requirements.

**Duration**: 5-15 seconds

**Output**:
- Identified features and components
- Technology stack recommendations
- Project structure outline

### Stage 2: Planning

**What happens**: The AI creates a detailed implementation plan, breaking down the project into manageable components.

**Duration**: 10-30 seconds

**Output**:
- Component hierarchy
- Data models and schemas
- API endpoint specifications
- File structure blueprint

### Stage 3: Generation

**What happens**: Code is generated for each component following the plan.

**Duration**: 1-5 minutes (varies by project complexity)

**Output**:
- React/Vue/Svelte components
- Backend API routes
- Database schemas
- Styling and assets
- Configuration files

### Stage 4: Preview

**What happens**: The generated application is built and deployed to a preview environment.

**Duration**: 30-60 seconds

**Output**:
- Live preview URL
- Build logs
- Downloadable source code

### Generation Progress Indicators

During generation, you'll see real-time updates:

```
[1/4] Analyzing requirements...        [Complete]
[2/4] Planning architecture...         [Complete]
[3/4] Generating components...         [In Progress]
      - Header component               [Complete]
      - Navigation                     [Complete]
      - Hero section                   [Generating...]
      - Feature cards                  [Pending]
[4/4] Building preview...              [Pending]
```

### Understanding Generation Quality

> **Pro Tip**: Generation quality depends heavily on your description. Here's what makes a good prompt:

**Do include:**
- Specific features and functionality
- Design preferences and style references
- Target audience or use case
- Technical requirements or constraints

**Avoid:**
- Vague descriptions ("make it look good")
- Contradictory requirements
- Overly complex single-prompt requests (break into phases)

---

## 7. Troubleshooting

### Docker Issues

#### Docker not running

**Error**: `Cannot connect to Docker daemon`

**Solution**:
```bash
# macOS/Windows
# Open Docker Desktop application

# Linux
sudo systemctl start docker
```

#### Port already in use

**Error**: `Port 5432 is already in use`

**Solution**:
```bash
# Find what's using the port
lsof -i :5432

# Stop the conflicting service or change NexusGen's port in docker-compose.yml
```

#### Container fails to start

**Error**: `Container exited with code 1`

**Solution**:
```bash
# View container logs
docker logs nexusgen-postgres

# Reset containers
pnpm docker:down
pnpm docker:up
```

#### Out of disk space

**Error**: `No space left on device`

**Solution**:
```bash
# Clean up Docker resources
docker system prune -a

# Remove unused volumes (caution: deletes data)
docker volume prune
```

---

### Database Issues

#### Connection refused

**Error**: `Connection refused to localhost:5432`

**Solution**:
1. Ensure Docker is running
2. Check if PostgreSQL container is up: `docker ps`
3. Restart containers: `pnpm docker:restart`

#### Migration failed

**Error**: `Migration failed to apply`

**Solution**:
```bash
# Reset database and reapply migrations
pnpm db:reset

# Or manually fix and retry
pnpm db:migrate
```

#### Prisma Client outdated

**Error**: `Prisma Client is outdated`

**Solution**:
```bash
# Regenerate Prisma Client
pnpm prisma generate
```

#### Database schema out of sync

**Error**: `The database schema is not in sync`

**Solution**:
```bash
# Push schema changes (development only)
pnpm prisma db push

# Or create a proper migration
pnpm prisma migrate dev --name describe_your_changes
```

---

### API Key Issues

#### Invalid API key

**Error**: `Invalid API key provided`

**Checklist**:
1. Verify key is correct (no extra spaces or characters)
2. Ensure key hasn't been revoked in provider dashboard
3. Check key has proper permissions
4. Verify `.env` file is being loaded

```bash
# Verify environment variable is set
echo $ANTHROPIC_API_KEY
```

#### Rate limit exceeded

**Error**: `Rate limit exceeded`

**Solution**:
- Wait a few minutes before retrying
- Upgrade your API plan for higher limits
- Check your usage in the provider dashboard

#### Insufficient credits

**Error**: `Insufficient credits` or `Billing limit reached`

**Solution**:
1. Check your balance at your provider's billing page
2. Add credits or upgrade your plan
3. Set up auto-recharge to avoid interruptions

---

### Generation Issues

#### Generation stuck or timeout

**Symptoms**: Progress bar not moving, eventual timeout

**Solutions**:
1. Refresh the page and check project status
2. Try with a simpler description first
3. Check API provider status pages for outages
4. Review server logs: `pnpm logs`

#### Poor generation quality

**Symptoms**: Generated code doesn't match expectations

**Solutions**:
1. Provide more detailed descriptions
2. Add reference images or examples
3. Break complex projects into smaller pieces
4. Use the iteration feature to refine specific components

#### Build failures

**Error**: `Build failed`

**Solutions**:
```bash
# Check build logs in the UI or:
pnpm logs

# Common fixes:
# - Ensure all dependencies are installed
# - Check for syntax errors in generated code
# - Try regenerating the problematic component
```

---

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Service not running | Start Docker/services |
| `EACCES` | Permission denied | Check file/folder permissions |
| `ENOMEM` | Out of memory | Close other applications, increase Docker memory |
| `MODULE_NOT_FOUND` | Missing dependency | Run `pnpm install` |
| `ETIMEOUT` | Network/API timeout | Check internet, retry later |

---

### Getting Help

If you're still experiencing issues:

1. **Check the logs**:
   ```bash
   pnpm logs
   ```

2. **Search existing issues**: Check the GitHub Issues for similar problems

3. **Join the community**: Discord/Slack for real-time help

4. **Report a bug**: Open a GitHub Issue with:
   - Steps to reproduce
   - Error messages and logs
   - Your environment (OS, Node version, etc.)

---

## Quick Reference Card

```
STARTING UP
-----------
pnpm install      # First time setup
pnpm start        # Start infrastructure
pnpm dev          # Start development

DAILY USE
---------
pnpm dev          # Start coding
pnpm db:studio    # Browse database
Ctrl+C            # Stop servers

TROUBLESHOOTING
---------------
pnpm docker:restart   # Fix container issues
pnpm db:reset         # Reset database
pnpm logs             # View error logs

URLS
----
App:     http://localhost:3000
API:     http://localhost:3001/docs
```

---

## What's Next?

Now that you're set up, explore these resources:

- **API Documentation**: Learn to integrate NexusGen programmatically
- **Component Library**: Browse pre-built components and templates
- **Examples Gallery**: See what others have built with NexusGen
- **Contributing Guide**: Help improve NexusGen

---

*Happy building!*

*The NexusGen Team*
