/**
 * NexusGen AI Platform - Database Seed Script
 *
 * This script populates the database with initial data for development
 * and testing purposes.
 *
 * Run with: npm run seed
 */

import {
  PrismaClient,
  ProjectStatus,
  Visibility,
  VersionStatus,
  DeploymentStatus,
  DeploymentEnvironment,
  SubscriptionTier,
  SubscriptionStatus,
  TeamRole,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ============================================================================
  // Clean existing data (in reverse order of dependencies)
  // ============================================================================
  console.log("🧹 Cleaning existing data...");

  await prisma.analytics.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.usageRecord.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.teamInvite.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.aIMessage.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.envVariable.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.buildLog.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.projectCollaborator.deleteMany();
  await prisma.versionSnapshot.deleteMany();
  await prisma.projectVersion.deleteMany();
  await prisma.project.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Existing data cleaned\n");

  // ============================================================================
  // Create Users
  // ============================================================================
  console.log("👤 Creating users...");

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@nexusgen.dev",
      emailVerified: new Date(),
      name: "Admin User",
      bio: "NexusGen Platform Administrator",
      company: "NexusGen",
      location: "San Francisco, CA",
      website: "https://nexusgen.dev",
      preferences: {
        theme: "dark",
        notifications: {
          email: true,
          push: true,
          deployments: true,
        },
        editor: {
          fontSize: 14,
          tabSize: 2,
          wordWrap: true,
        },
      },
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "demo@nexusgen.dev",
      emailVerified: new Date(),
      name: "Demo User",
      bio: "Exploring the power of AI-driven development",
      company: "Demo Corp",
      preferences: {
        theme: "system",
        notifications: {
          email: true,
          push: false,
        },
      },
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: "test@nexusgen.dev",
      name: "Test User",
      preferences: {},
    },
  });

  console.log(`✅ Created ${3} users\n`);

  // ============================================================================
  // Create Teams
  // ============================================================================
  console.log("👥 Creating teams...");

  const nexusgenTeam = await prisma.team.create({
    data: {
      name: "NexusGen Core",
      slug: "nexusgen-core",
      description: "Core development team for NexusGen platform",
      ownerId: adminUser.id,
      settings: {
        allowPublicProjects: true,
        defaultVisibility: "private",
      },
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: nexusgenTeam.id,
      userId: adminUser.id,
      role: TeamRole.OWNER,
    },
  });

  await prisma.teamMember.create({
    data: {
      teamId: nexusgenTeam.id,
      userId: demoUser.id,
      role: TeamRole.MEMBER,
    },
  });

  console.log(`✅ Created team: ${nexusgenTeam.name}\n`);

  // ============================================================================
  // Create Subscriptions
  // ============================================================================
  console.log("💳 Creating subscriptions...");

  await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      tier: SubscriptionTier.ENTERPRISE,
      status: SubscriptionStatus.ACTIVE,
      projectLimit: 100,
      storageLimit: BigInt(107374182400), // 100GB
      deploymentLimit: 10000,
      aiTokenLimit: 1000000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      tier: SubscriptionTier.PRO,
      status: SubscriptionStatus.ACTIVE,
      projectLimit: 25,
      storageLimit: BigInt(10737418240), // 10GB
      deploymentLimit: 1000,
      aiTokenLimit: 100000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.subscription.create({
    data: {
      userId: testUser.id,
      tier: SubscriptionTier.FREE,
      status: SubscriptionStatus.ACTIVE,
      projectLimit: 3,
      storageLimit: BigInt(1073741824), // 1GB
      deploymentLimit: 100,
      aiTokenLimit: 10000,
    },
  });

  console.log(`✅ Created subscriptions\n`);

  // ============================================================================
  // Create Projects
  // ============================================================================
  console.log("📁 Creating projects...");

  const portfolioProject = await prisma.project.create({
    data: {
      name: "Portfolio Website",
      slug: "portfolio-website",
      description:
        "A modern portfolio website built with AI assistance. Features responsive design, dark mode, and smooth animations.",
      status: ProjectStatus.ACTIVE,
      visibility: Visibility.PUBLIC,
      framework: "nextjs",
      template: "portfolio-starter",
      userId: demoUser.id,
      teamId: nexusgenTeam.id,
      settings: {
        buildCommand: "npm run build",
        outputDirectory: ".next",
        installCommand: "npm install",
        devCommand: "npm run dev",
      },
      metadata: {
        tags: ["portfolio", "personal", "showcase"],
        stars: 42,
        forks: 12,
      },
    },
  });

  const ecommerceProject = await prisma.project.create({
    data: {
      name: "AI E-Commerce Store",
      slug: "ai-ecommerce-store",
      description:
        "Full-featured e-commerce platform with AI-powered product recommendations and search.",
      status: ProjectStatus.ACTIVE,
      visibility: Visibility.PRIVATE,
      framework: "nextjs",
      template: "ecommerce-pro",
      userId: adminUser.id,
      settings: {
        buildCommand: "npm run build",
        outputDirectory: ".next",
        nodeVersion: "20",
      },
      metadata: {
        tags: ["ecommerce", "ai", "enterprise"],
      },
    },
  });

  const dashboardProject = await prisma.project.create({
    data: {
      name: "Analytics Dashboard",
      slug: "analytics-dashboard",
      description:
        "Real-time analytics dashboard with interactive charts and data visualization.",
      status: ProjectStatus.DRAFT,
      visibility: Visibility.PRIVATE,
      framework: "react",
      userId: demoUser.id,
      settings: {},
      metadata: {},
    },
  });

  console.log(`✅ Created ${3} projects\n`);

  // ============================================================================
  // Create Project Versions
  // ============================================================================
  console.log("📋 Creating project versions...");

  const portfolioV1 = await prisma.projectVersion.create({
    data: {
      projectId: portfolioProject.id,
      version: "1.0.0",
      name: "Initial Release",
      description: "First public release of the portfolio website",
      status: VersionStatus.PUBLISHED,
      isLatest: false,
      isCurrent: false,
      createdById: demoUser.id,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      files: {
        "src/app/page.tsx": { type: "file", size: 2048 },
        "src/app/layout.tsx": { type: "file", size: 1024 },
        "src/components/Hero.tsx": { type: "file", size: 1536 },
      },
      components: [
        { name: "Hero", path: "src/components/Hero.tsx" },
        { name: "About", path: "src/components/About.tsx" },
        { name: "Projects", path: "src/components/Projects.tsx" },
      ],
      pages: [
        { path: "/", component: "Home" },
        { path: "/about", component: "About" },
        { path: "/projects", component: "Projects" },
      ],
      changelog: "- Initial release\n- Hero section\n- About page\n- Projects showcase",
    },
  });

  const portfolioV2 = await prisma.projectVersion.create({
    data: {
      projectId: portfolioProject.id,
      version: "1.1.0",
      name: "Dark Mode Update",
      description: "Added dark mode support and improved accessibility",
      status: VersionStatus.PUBLISHED,
      isLatest: true,
      isCurrent: true,
      createdById: demoUser.id,
      publishedAt: new Date(),
      files: {
        "src/app/page.tsx": { type: "file", size: 2048 },
        "src/app/layout.tsx": { type: "file", size: 1280 },
        "src/components/Hero.tsx": { type: "file", size: 1792 },
        "src/components/ThemeToggle.tsx": { type: "file", size: 512 },
      },
      components: [
        { name: "Hero", path: "src/components/Hero.tsx" },
        { name: "About", path: "src/components/About.tsx" },
        { name: "Projects", path: "src/components/Projects.tsx" },
        { name: "ThemeToggle", path: "src/components/ThemeToggle.tsx" },
      ],
      pages: [
        { path: "/", component: "Home" },
        { path: "/about", component: "About" },
        { path: "/projects", component: "Projects" },
        { path: "/contact", component: "Contact" },
      ],
      changelog:
        "- Added dark mode toggle\n- Improved accessibility (WCAG 2.1 AA)\n- New contact page\n- Performance optimizations",
    },
  });

  console.log(`✅ Created project versions\n`);

  // ============================================================================
  // Create Deployments
  // ============================================================================
  console.log("🚀 Creating deployments...");

  const productionDeployment = await prisma.deployment.create({
    data: {
      projectId: portfolioProject.id,
      versionId: portfolioV2.id,
      userId: demoUser.id,
      status: DeploymentStatus.DEPLOYED,
      environment: DeploymentEnvironment.PRODUCTION,
      url: "https://portfolio.nexusgen.dev",
      previewUrl: "https://portfolio-abc123.nexusgen.dev",
      buildCommand: "npm run build",
      outputDir: ".next",
      nodeVersion: "20",
      gitCommit: "abc123def456",
      gitBranch: "main",
      gitMessage: "feat: add dark mode support",
      startedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      completedAt: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
      duration: 120000, // 2 minutes
      metadata: {
        region: "us-east-1",
        runtime: "nodejs20.x",
      },
    },
  });

  const previewDeployment = await prisma.deployment.create({
    data: {
      projectId: portfolioProject.id,
      versionId: portfolioV2.id,
      userId: demoUser.id,
      status: DeploymentStatus.DEPLOYED,
      environment: DeploymentEnvironment.PREVIEW,
      url: "https://portfolio-preview-xyz789.nexusgen.dev",
      buildCommand: "npm run build",
      outputDir: ".next",
      gitCommit: "xyz789abc123",
      gitBranch: "feature/contact-form",
      gitMessage: "wip: contact form implementation",
      startedAt: new Date(Date.now() - 10 * 60 * 1000),
      completedAt: new Date(Date.now() - 8 * 60 * 1000),
      duration: 90000,
    },
  });

  console.log(`✅ Created deployments\n`);

  // ============================================================================
  // Create Build Logs
  // ============================================================================
  console.log("📝 Creating build logs...");

  const buildLogs = [
    { level: "INFO" as const, message: "Build started", source: "build" },
    { level: "INFO" as const, message: "Installing dependencies...", source: "build" },
    { level: "INFO" as const, message: "npm install completed in 45s", source: "build" },
    { level: "INFO" as const, message: "Running build command...", source: "build" },
    { level: "INFO" as const, message: "Compiling TypeScript...", source: "build" },
    { level: "INFO" as const, message: "Building pages...", source: "build" },
    { level: "INFO" as const, message: "Generating static pages...", source: "build" },
    { level: "INFO" as const, message: "Build completed successfully", source: "build" },
    { level: "INFO" as const, message: "Deploying to edge network...", source: "deploy" },
    { level: "INFO" as const, message: "Deployment complete!", source: "deploy" },
  ];

  for (let i = 0; i < buildLogs.length; i++) {
    await prisma.buildLog.create({
      data: {
        deploymentId: productionDeployment.id,
        level: buildLogs[i].level,
        message: buildLogs[i].message,
        source: buildLogs[i].source,
        timestamp: new Date(Date.now() - (buildLogs.length - i) * 10000),
      },
    });
  }

  console.log(`✅ Created ${buildLogs.length} build logs\n`);

  // ============================================================================
  // Create Domains
  // ============================================================================
  console.log("🌐 Creating domains...");

  await prisma.domain.create({
    data: {
      projectId: portfolioProject.id,
      domain: "portfolio.nexusgen.dev",
      isVerified: true,
      isPrimary: true,
      sslEnabled: true,
      verifiedAt: new Date(),
      txtRecord: "nexusgen-verify=abc123",
    },
  });

  await prisma.domain.create({
    data: {
      projectId: portfolioProject.id,
      domain: "myportfolio.com",
      isVerified: false,
      isPrimary: false,
      sslEnabled: true,
      txtRecord: "nexusgen-verify=def456",
      cnameRecord: "cname.nexusgen.dev",
    },
  });

  console.log(`✅ Created domains\n`);

  // ============================================================================
  // Create AI Conversations
  // ============================================================================
  console.log("🤖 Creating AI conversations...");

  const aiConversation = await prisma.aIConversation.create({
    data: {
      userId: demoUser.id,
      projectId: portfolioProject.id,
      title: "Building the Hero Section",
      model: "gpt-4-turbo",
      totalTokens: 4520,
      isActive: true,
      isPinned: true,
      lastMessageAt: new Date(),
      context: {
        currentFile: "src/components/Hero.tsx",
        selectedComponent: "Hero",
      },
    },
  });

  await prisma.aIMessage.create({
    data: {
      conversationId: aiConversation.id,
      role: "USER",
      content: "Help me create a modern hero section with a gradient background and animated text",
      promptTokens: 20,
    },
  });

  await prisma.aIMessage.create({
    data: {
      conversationId: aiConversation.id,
      role: "ASSISTANT",
      content:
        "I'll help you create a stunning hero section! Here's a modern design with a gradient background and smooth text animations using Framer Motion...",
      completionTokens: 450,
      generatedCode: {
        language: "tsx",
        code: `export function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to My Portfolio
      </motion.h1>
    </section>
  );
}`,
      },
      codeLanguage: "tsx",
    },
  });

  console.log(`✅ Created AI conversation with messages\n`);

  // ============================================================================
  // Create Notifications
  // ============================================================================
  console.log("🔔 Creating notifications...");

  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      type: "DEPLOYMENT_STATUS",
      title: "Deployment Successful",
      message: "Your portfolio website has been deployed to production.",
      link: `/projects/${portfolioProject.id}/deployments/${productionDeployment.id}`,
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      type: "TEAM_INVITE",
      title: "Team Invitation",
      message: "You've been invited to join NexusGen Core team.",
      isRead: true,
      readAt: new Date(),
    },
  });

  console.log(`✅ Created notifications\n`);

  // ============================================================================
  // Create API Keys
  // ============================================================================
  console.log("🔑 Creating API keys...");

  await prisma.apiKey.create({
    data: {
      userId: adminUser.id,
      name: "Production API Key",
      keyHash: "hash_prod_key_abc123xyz789", // In real app, this would be properly hashed
      keyPrefix: "nxg_prod",
      scopes: ["projects:read", "projects:write", "deployments:read", "deployments:write"],
      lastUsedAt: new Date(),
    },
  });

  await prisma.apiKey.create({
    data: {
      userId: demoUser.id,
      name: "Development Key",
      keyHash: "hash_dev_key_def456uvw123",
      keyPrefix: "nxg_dev_",
      scopes: ["projects:read", "deployments:read"],
    },
  });

  console.log(`✅ Created API keys\n`);

  // ============================================================================
  // Create Audit Logs
  // ============================================================================
  console.log("📜 Creating audit logs...");

  await prisma.auditLog.create({
    data: {
      userId: demoUser.id,
      entityType: "project",
      entityId: portfolioProject.id,
      action: "create",
      metadata: {
        projectName: "Portfolio Website",
      },
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: demoUser.id,
      entityType: "deployment",
      entityId: productionDeployment.id,
      action: "create",
      metadata: {
        environment: "PRODUCTION",
        version: "1.1.0",
      },
      ipAddress: "192.168.1.1",
    },
  });

  console.log(`✅ Created audit logs\n`);

  // ============================================================================
  // Summary
  // ============================================================================
  console.log("=" .repeat(60));
  console.log("🎉 Database seeding completed successfully!");
  console.log("=" .repeat(60));
  console.log("\n📊 Summary:");
  console.log(`   • Users: 3`);
  console.log(`   • Teams: 1`);
  console.log(`   • Projects: 3`);
  console.log(`   • Project Versions: 2`);
  console.log(`   • Deployments: 2`);
  console.log(`   • Build Logs: ${buildLogs.length}`);
  console.log(`   • AI Conversations: 1`);
  console.log(`   • Subscriptions: 3`);
  console.log("\n🔐 Test Accounts:");
  console.log(`   • Admin: admin@nexusgen.dev`);
  console.log(`   • Demo:  demo@nexusgen.dev`);
  console.log(`   • Test:  test@nexusgen.dev`);
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
