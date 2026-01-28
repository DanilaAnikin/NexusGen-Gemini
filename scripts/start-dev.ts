#!/usr/bin/env tsx
/**
 * NexusGen Development Startup Script
 * =====================================
 *
 * This script prepares the development environment by:
 * 1. Checking and setting up environment variables (.env file)
 * 2. Verifying Docker daemon is running
 * 3. Starting infrastructure containers (PostgreSQL, Redis)
 * 4. Running database migrations
 * 5. Providing instructions for starting development servers
 *
 * Usage: pnpm start
 * Or:    tsx scripts/start-dev.ts
 */

import { execSync, spawn, type SpawnOptions } from 'child_process';
import { existsSync, copyFileSync } from 'fs';
import { join } from 'path';

// =============================================================================
// ANSI Color Codes for Terminal Output
// =============================================================================
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',

  // Text colors
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

// =============================================================================
// Logging Utilities
// =============================================================================
const log = {
  info: (msg: string) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  step: (num: number, total: number, msg: string) => {
    console.log(`\n${colors.bold}${colors.blue}[${num}/${total}]${colors.reset} ${colors.bold}${msg}${colors.reset}`);
  },
  divider: () => console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`),
};

// =============================================================================
// Configuration
// =============================================================================
const ROOT_DIR = join(__dirname, '..');
const ENV_FILE = join(ROOT_DIR, '.env');
const ENV_EXAMPLE_FILE = join(ROOT_DIR, '.env.example');
const TOTAL_STEPS = 4;

// Retry configuration for container health checks
const HEALTH_CHECK_CONFIG = {
  maxRetries: 30,        // Maximum number of retries
  intervalMs: 2000,      // Time between retries (2 seconds)
  timeoutMs: 60000,      // Total timeout (60 seconds)
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Execute a command synchronously and return the output
 */
function runCommand(command: string, options?: { silent?: boolean }): string | null {
  try {
    const output = execSync(command, {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: options?.silent ? 'pipe' : 'inherit',
    });
    return output;
  } catch (error) {
    return null;
  }
}

/**
 * Execute a command and stream output in real-time
 */
function runCommandWithOutput(command: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const options: SpawnOptions = {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true,
    };

    const proc = spawn(command, args, options);

    proc.on('close', (code) => {
      resolve(code === 0);
    });

    proc.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Print a banner with the application name
 */
function printBanner(): void {
  console.log(`
${colors.cyan}${colors.bold}
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     ${colors.white}███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗${colors.cyan}              ║
║     ${colors.white}████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝${colors.cyan}              ║
║     ${colors.white}██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗${colors.cyan}              ║
║     ${colors.white}██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║${colors.cyan}              ║
║     ${colors.white}██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║${colors.cyan}              ║
║     ${colors.white}╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝${colors.cyan}              ║
║     ${colors.white}       ██████╗ ███████╗███╗   ██╗          ${colors.cyan}              ║
║     ${colors.white}      ██╔════╝ ██╔════╝████╗  ██║          ${colors.cyan}              ║
║     ${colors.white}      ██║  ███╗█████╗  ██╔██╗ ██║          ${colors.cyan}              ║
║     ${colors.white}      ██║   ██║██╔══╝  ██║╚██╗██║          ${colors.cyan}              ║
║     ${colors.white}      ╚██████╔╝███████╗██║ ╚████║          ${colors.cyan}              ║
║     ${colors.white}       ╚═════╝ ╚══════╝╚═╝  ╚═══╝          ${colors.cyan}              ║
║                                                               ║
║               ${colors.yellow}Development Environment Setup${colors.cyan}                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);
}

// =============================================================================
// Step 1: Environment Check
// =============================================================================
function checkEnvironment(): boolean {
  log.step(1, TOTAL_STEPS, 'Checking environment configuration...');

  // Check if .env exists
  if (existsSync(ENV_FILE)) {
    log.success('.env file found');
    return true;
  }

  // .env doesn't exist, try to copy from .env.example
  if (existsSync(ENV_EXAMPLE_FILE)) {
    try {
      copyFileSync(ENV_EXAMPLE_FILE, ENV_FILE);
      log.warn('Created .env from .env.example');
      console.log(`\n${colors.yellow}   ⚠️  Please configure your environment variables in .env${colors.reset}`);
      console.log(`${colors.dim}   Review the file and update API keys, secrets, and other settings.${colors.reset}\n`);
      return true;
    } catch (error) {
      log.error(`Failed to copy .env.example to .env: ${error}`);
      return false;
    }
  }

  // Neither .env nor .env.example exists
  log.error('Environment configuration is missing!');
  console.log(`
${colors.red}   Neither .env nor .env.example was found.${colors.reset}

   Please create a .env file with the required environment variables.
   You can find documentation at: ${colors.cyan}docs/setup.md${colors.reset}

   Required variables include:
   - DATABASE_URL
   - REDIS_URL
   - NEXTAUTH_SECRET
   - AI provider API keys
`);
  return false;
}

// =============================================================================
// Step 2: Docker Check
// =============================================================================
function checkDocker(): boolean {
  log.step(2, TOTAL_STEPS, 'Checking Docker daemon...');

  // Try to run docker info to check if Docker is running
  const result = runCommand('docker info', { silent: true });

  if (result === null) {
    log.error('Docker is not running!');
    console.log(`
${colors.red}   ❌ Docker is not running. Please start Docker Desktop.${colors.reset}

   ${colors.dim}On macOS/Windows:${colors.reset}
     Open Docker Desktop application

   ${colors.dim}On Linux:${colors.reset}
     sudo systemctl start docker
     ${colors.dim}or${colors.reset}
     sudo service docker start

   After starting Docker, run this script again.
`);
    return false;
  }

  log.success('Docker daemon is running');
  return true;
}

// =============================================================================
// Step 3: Start Infrastructure
// =============================================================================
async function startInfrastructure(): Promise<boolean> {
  log.step(3, TOTAL_STEPS, 'Starting infrastructure (PostgreSQL, Redis)...');

  console.log(`${colors.dim}   🐳 Running docker compose up -d...${colors.reset}\n`);

  // Start containers
  const composeSuccess = await runCommandWithOutput('docker', ['compose', 'up', '-d']);

  if (!composeSuccess) {
    log.error('Failed to start Docker containers');
    console.log(`
${colors.red}   Please check the docker-compose.yml file and Docker logs:${colors.reset}
     docker compose logs
`);
    return false;
  }

  // Wait for containers to be healthy
  console.log(`\n${colors.dim}   Waiting for containers to be healthy...${colors.reset}`);

  const startTime = Date.now();
  let postgresHealthy = false;
  let redisHealthy = false;
  let retries = 0;

  while (retries < HEALTH_CHECK_CONFIG.maxRetries) {
    // Check elapsed time
    if (Date.now() - startTime > HEALTH_CHECK_CONFIG.timeoutMs) {
      log.error('Timeout waiting for containers to become healthy');
      return false;
    }

    // Check PostgreSQL health
    if (!postgresHealthy) {
      const pgStatus = runCommand(
        'docker inspect --format="{{.State.Health.Status}}" nexusgen-postgres 2>/dev/null',
        { silent: true }
      );
      if (pgStatus?.trim() === 'healthy') {
        postgresHealthy = true;
        console.log(`   ${colors.green}✓${colors.reset} PostgreSQL is healthy`);
      }
    }

    // Check Redis health
    if (!redisHealthy) {
      const redisStatus = runCommand(
        'docker inspect --format="{{.State.Health.Status}}" nexusgen-redis 2>/dev/null',
        { silent: true }
      );
      if (redisStatus?.trim() === 'healthy') {
        redisHealthy = true;
        console.log(`   ${colors.green}✓${colors.reset} Redis is healthy`);
      }
    }

    // Both healthy - we're done
    if (postgresHealthy && redisHealthy) {
      log.success('All infrastructure containers are healthy');
      return true;
    }

    // Show progress
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    process.stdout.write(`\r   ${colors.dim}Checking container health... (${elapsed}s elapsed)${colors.reset}  `);

    retries++;
    await sleep(HEALTH_CHECK_CONFIG.intervalMs);
  }

  // If we get here, we timed out
  console.log(''); // New line after progress indicator
  log.error('Containers did not become healthy in time');
  console.log(`
${colors.yellow}   Status:${colors.reset}
     PostgreSQL: ${postgresHealthy ? `${colors.green}healthy${colors.reset}` : `${colors.red}not healthy${colors.reset}`}
     Redis:      ${redisHealthy ? `${colors.green}healthy${colors.reset}` : `${colors.red}not healthy${colors.reset}`}

   ${colors.dim}Check container logs for more details:${colors.reset}
     docker compose logs postgres
     docker compose logs redis
`);
  return false;
}

// =============================================================================
// Step 4: Database Migrations
// =============================================================================
async function runDatabaseMigrations(): Promise<boolean> {
  log.step(4, TOTAL_STEPS, 'Pushing database schema...');

  console.log(`${colors.dim}   📦 Running pnpm db:push...${colors.reset}\n`);

  const success = await runCommandWithOutput('pnpm', ['db:push']);

  if (!success) {
    log.error('Failed to push database schema');
    console.log(`
${colors.red}   Database migration failed.${colors.reset}

   ${colors.dim}Possible causes:${colors.reset}
     - Database is not accessible
     - Invalid DATABASE_URL in .env
     - Schema errors in prisma/schema.prisma

   ${colors.dim}Try running manually:${colors.reset}
     pnpm db:push
`);
    return false;
  }

  log.success('Database schema pushed successfully');
  return true;
}

// =============================================================================
// Final Instructions
// =============================================================================
function printFinalInstructions(): void {
  log.divider();
  console.log(`
${colors.green}${colors.bold}   ✅ Infrastructure is ready!${colors.reset}

${colors.bold}   To start the development servers, run:${colors.reset}
     ${colors.cyan}pnpm dev${colors.reset}

${colors.bold}   Or start individually:${colors.reset}
     ${colors.cyan}pnpm --filter @nexusgen/web dev${colors.reset}     ${colors.dim}# Frontend (port 3000)${colors.reset}
     ${colors.cyan}pnpm --filter @nexusgen/worker dev${colors.reset}  ${colors.dim}# Worker (port 3001)${colors.reset}

${colors.bold}   Useful commands:${colors.reset}
     ${colors.cyan}pnpm db:studio${colors.reset}                     ${colors.dim}# Open Prisma Studio${colors.reset}
     ${colors.cyan}docker compose logs -f${colors.reset}             ${colors.dim}# View container logs${colors.reset}
     ${colors.cyan}docker compose down${colors.reset}                ${colors.dim}# Stop infrastructure${colors.reset}

${colors.dim}   Happy coding! 🚀${colors.reset}
`);
  log.divider();
}

// =============================================================================
// Main Execution
// =============================================================================
async function main(): Promise<void> {
  printBanner();

  // Step 1: Environment Check
  if (!checkEnvironment()) {
    process.exit(1);
  }

  // Step 2: Docker Check
  if (!checkDocker()) {
    process.exit(1);
  }

  // Step 3: Start Infrastructure
  const infraStarted = await startInfrastructure();
  if (!infraStarted) {
    process.exit(1);
  }

  // Step 4: Database Migrations
  const dbMigrated = await runDatabaseMigrations();
  if (!dbMigrated) {
    process.exit(1);
  }

  // Success - print final instructions
  printFinalInstructions();

  process.exit(0);
}

// Run the main function
main().catch((error) => {
  log.error(`Unexpected error: ${error}`);
  process.exit(1);
});
