import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@repo/database';
import { requireUserId } from '@/lib/auth';
import ProjectDashboard from './project-dashboard';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProject(id: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [
        { userId },
        { collaborators: { some: { userId } } },
        { visibility: 'PUBLIC' },
      ],
    },
    include: {
      deployments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  return project;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  const userId = await requireUserId();
  const project = await getProject(id, userId);

  if (!project) {
    notFound();
  }

  const latestDeployment = project.deployments[0];
  const initialDeploymentUrl = latestDeployment?.status === 'DEPLOYED'
    ? latestDeployment.url
    : null;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ProjectDashboard
        project={project}
        initialDeploymentUrl={initialDeploymentUrl}
      />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div className="h-screen bg-gray-950 flex items-center justify-center">
      <div className="animate-pulse text-cyan-400">Loading...</div>
    </div>
  );
}
