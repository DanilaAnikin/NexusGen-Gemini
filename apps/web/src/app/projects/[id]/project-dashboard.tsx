'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Terminal as TerminalIcon,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Code2,
  Settings,
  Share2
} from 'lucide-react';
import LiveLogs from '@/components/terminal/live-logs';

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  settings: unknown;
}

interface ProjectDashboardProps {
  project: Project;
  initialDeploymentUrl: string | null;
}

export default function ProjectDashboard({ project, initialDeploymentUrl }: ProjectDashboardProps) {
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(initialDeploymentUrl);
  const [isPreviewLoading, setIsPreviewLoading] = useState(!initialDeploymentUrl);
  const [previewKey, setPreviewKey] = useState(0);

  const handleDeploymentReady = useCallback((url: string) => {
    setDeploymentUrl(url);
    setIsPreviewLoading(false);
  }, []);

  const refreshPreview = () => {
    setPreviewKey(k => k + 1);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
            <p className="text-sm text-gray-400">{project.description || 'No description'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          {deploymentUrl && (
            <a
              href={deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-400 hover:to-blue-400 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Open Live
            </a>
          )}
        </div>
      </header>

      {/* Main content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Terminal */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/2 p-4 border-r border-gray-800"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <TerminalIcon className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">Live Build Output</h2>
            </div>
            <div className="flex-1">
              <LiveLogs
                projectId={project.id}
                onDeploymentReady={handleDeploymentReady}
              />
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/2 p-4"
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Live Preview</h2>
              </div>
              {deploymentUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshPreview}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Refresh preview"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative">
              {isPreviewLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    className="w-20 h-20 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 mb-6 animate-spin"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">Building Your App</h3>
                  <p className="text-gray-400 text-center max-w-sm">
                    NexusGen is generating, building, and deploying your application.
                    Watch the terminal for real-time progress.
                  </p>

                  {/* Animated code lines */}
                  <div className="mt-8 space-y-2 font-mono text-sm">
                    {['Analyzing requirements...', 'Generating components...', 'Optimizing code...'].map((text, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: [0.3, 1, 0.3], x: 0 }}
                        transition={{
                          delay: i * 0.5,
                          duration: 2,
                          repeat: Infinity
                        }}
                        className="text-cyan-400/70"
                      >
                        {text}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : deploymentUrl ? (
                <iframe
                  key={previewKey}
                  src={deploymentUrl}
                  className="w-full h-full border-0"
                  title="App Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">No deployment available</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
