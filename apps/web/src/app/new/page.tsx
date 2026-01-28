/**
 * New Project Page
 *
 * Entry point for creating new projects using the CreationWizard component.
 * This page renders the multi-step wizard for project creation.
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { CreationWizard } from '@/components/wizard';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create New Project | NexusGen',
  description: 'Create a new AI-powered application with NexusGen',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-gray-400 font-mono text-sm">Loading wizard...</p>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreationWizard />
    </Suspense>
  );
}
