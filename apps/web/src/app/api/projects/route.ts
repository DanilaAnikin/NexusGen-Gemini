/**
 * Projects API Route Handler
 *
 * POST - Create a new project and queue generation job
 * GET - List all projects for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';
import { getCurrentUserId } from '@/lib/auth';
import { addFullAppGenerationJob } from '@/lib/queue';
import { z } from 'zod';

/**
 * Request body schema for creating a new project
 */
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  prompt: z.string().min(10).max(10000),
  assetKeys: z.array(z.string()).optional().default([]),
});

/**
 * POST /api/projects
 *
 * Creates a new project and queues a generation job.
 *
 * Request body:
 * - name: Project name (required, 1-100 chars)
 * - description: Project description (optional)
 * - prompt: User prompt for generation (required, 10-10000 chars)
 * - assetKeys: Array of asset keys (optional)
 *
 * Returns:
 * - 201: Project created successfully with projectId
 * - 400: Validation error
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    // Create project in database
    const project = await prisma.project.create({
      data: {
        name: validated.name,
        description: validated.description,
        userId,
        status: 'DRAFT',
        visibility: 'PRIVATE',
        settings: {
          prompt: validated.prompt,
          assetKeys: validated.assetKeys,
        },
      },
    });

    // Push GENERATION job to queue
    await addFullAppGenerationJob(
      project.id,
      userId,
      validated.prompt,
      validated.assetKeys
    );

    return NextResponse.json(
      {
        success: true,
        projectId: project.id,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Log and return generic error for unexpected issues
    console.error('Project creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects
 *
 * Lists all projects for the authenticated user.
 *
 * Returns:
 * - 200: Array of projects with latest deployment
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's projects with latest deployment
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
