'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Terminal,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  Loader2,
  Wrench,
  Rocket,
  Brain,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
  id: string;
  type: 'thought' | 'build' | 'healing' | 'deployment' | 'progress' | 'error' | 'success' | 'system';
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface LiveLogsProps {
  projectId: string;
  onDeploymentReady?: (url: string) => void;
}

const LOG_COLORS: Record<LogEntry['type'], string> = {
  thought: 'text-purple-400',
  build: 'text-cyan-400',
  healing: 'text-yellow-400',
  deployment: 'text-blue-400',
  progress: 'text-green-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
  system: 'text-gray-400',
};

const LOG_ICONS: Record<LogEntry['type'], React.ReactNode> = {
  thought: <Brain className="w-4 h-4" />,
  build: <Cpu className="w-4 h-4" />,
  healing: <Wrench className="w-4 h-4" />,
  deployment: <Rocket className="w-4 h-4" />,
  progress: <Activity className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4" />,
  success: <CheckCircle2 className="w-4 h-4" />,
  system: <Terminal className="w-4 h-4" />,
};

type ConnectionStatus = 'idle' | 'generating' | 'building' | 'deploying' | 'ready' | 'failed';

interface WebSocketEventData {
  projectId: string;
  timestamp?: string | number;
  thought?: string;
  message?: string;
  log?: string;
  error?: string;
  progress?: number;
  url?: string;
}

export function LiveLogs({ projectId, onDeploymentReady }: LiveLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const addLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
    setLogs(prev => [...prev, { ...entry, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Connect to worker WebSocket
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:3001';
    const socket = io(workerUrl, {
      query: { projectId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      addLog({
        type: 'system',
        message: 'Connected to NexusGen Worker',
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      addLog({
        type: 'system',
        message: `Disconnected from worker: ${reason}`,
        timestamp: new Date(),
      });
    });

    socket.on('connect_error', (error) => {
      addLog({
        type: 'error',
        message: `Connection error: ${error.message}`,
        timestamp: new Date(),
      });
    });

    socket.on('reconnect_attempt', (attempt) => {
      addLog({
        type: 'system',
        message: `Reconnection attempt ${attempt}...`,
        timestamp: new Date(),
      });
    });

    socket.on('reconnect', () => {
      addLog({
        type: 'success',
        message: 'Reconnected to worker',
        timestamp: new Date(),
      });
    });

    // Agent thought events
    socket.on('agent:thought', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        addLog({
          type: 'thought',
          message: data.thought || data.message || 'Processing...',
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
      }
    });

    // Build log events
    socket.on('build:log', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        addLog({
          type: 'build',
          message: data.log || data.message || 'Building...',
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
      }
    });

    // Healing attempt events
    socket.on('healing:attempt', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        addLog({
          type: 'healing',
          message: `Self-healing: ${data.message || data.error || 'Attempting fix'}`,
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
      }
    });

    // Generation progress
    socket.on('generation:progress', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        setStatus('generating');
        setProgress(data.progress || 0);
        addLog({
          type: 'progress',
          message: data.message || `Generation progress: ${data.progress}%`,
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
      }
    });

    // Deployment building
    socket.on('deployment:building', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        setStatus('building');
        addLog({
          type: 'build',
          message: 'Building application...',
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
      }
    });

    // Deployment deploying
    socket.on('deployment:deploying', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        setStatus('deploying');
        addLog({
          type: 'deployment',
          message: 'Deploying to infrastructure...',
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
      }
    });

    // Deployment ready
    socket.on('deployment:ready', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        setStatus('ready');
        setProgress(100);
        addLog({
          type: 'success',
          message: `Deployment ready! URL: ${data.url}`,
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
        if (data.url) {
          onDeploymentReady?.(data.url);
        }
      }
    });

    // Deployment failed
    socket.on('deployment:failed', (data: WebSocketEventData) => {
      if (data.projectId === projectId) {
        setStatus('failed');
        addLog({
          type: 'error',
          message: `Deployment failed: ${data.error || data.message || 'Unknown error'}`,
          timestamp: new Date(data.timestamp || Date.now()),
          metadata: data as unknown as Record<string, unknown>,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, addLog, onDeploymentReady]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatTimestamp = (date: Date) => {
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${formatTime(date)}.${ms}`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
          </div>
          <div className="flex items-center gap-2 text-gray-400 font-mono text-sm">
            <Terminal className="w-4 h-4" />
            <span className="text-cyan-400">nexusgen</span>
            <span className="text-gray-600">::</span>
            <span className="text-green-400">live-logs</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {status === 'idle' && (
              <span className="flex items-center gap-1.5 text-gray-500 text-sm font-mono">
                <Zap className="w-4 h-4" /> Idle
              </span>
            )}
            {status === 'generating' && (
              <span className="flex items-center gap-1.5 text-purple-400 text-sm font-mono">
                <Brain className="w-4 h-4 animate-pulse" /> Generating
              </span>
            )}
            {status === 'building' && (
              <span className="flex items-center gap-1.5 text-cyan-400 text-sm font-mono">
                <Loader2 className="w-4 h-4 animate-spin" /> Building
              </span>
            )}
            {status === 'deploying' && (
              <span className="flex items-center gap-1.5 text-blue-400 text-sm font-mono">
                <Rocket className="w-4 h-4 animate-bounce" /> Deploying
              </span>
            )}
            {status === 'ready' && (
              <span className="flex items-center gap-1.5 text-green-400 text-sm font-mono">
                <CheckCircle2 className="w-4 h-4" /> Ready
              </span>
            )}
            {status === 'failed' && (
              <span className="flex items-center gap-1.5 text-red-400 text-sm font-mono">
                <XCircle className="w-4 h-4" /> Failed
              </span>
            )}
          </div>

          {/* Connection status */}
          <div className={cn(
            'flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded border',
            isConnected
              ? 'text-green-400 border-green-400/30 bg-green-400/5'
              : 'text-red-400 border-red-400/30 bg-red-400/5'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            )} />
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {progress > 0 && progress < 100 && (
        <div className="h-1 bg-gray-900">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Terminal body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm terminal-scrollbar bg-gradient-to-b from-gray-950 to-gray-900/50">
        {/* Initial system message */}
        {logs.length === 0 && (
          <div className="text-gray-600 mb-4">
            <div className="mb-2">NexusGen Terminal v1.0.0</div>
            <div className="mb-2">Waiting for connection...</div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">$</span>
              <span className="w-2 h-4 bg-green-400/70 animate-pulse" />
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-start gap-3 py-1.5 hover:bg-gray-800/30 px-2 rounded transition-colors group"
            >
              {/* Timestamp */}
              <span className="text-gray-600 whitespace-nowrap text-xs tabular-nums">
                [{formatTimestamp(log.timestamp)}]
              </span>

              {/* Icon */}
              <span className={cn(LOG_COLORS[log.type], 'flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity')}>
                {LOG_ICONS[log.type]}
              </span>

              {/* Message */}
              <span className={cn(
                LOG_COLORS[log.type],
                'flex-1 break-words',
                log.type === 'error' && 'font-semibold'
              )}>
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        {logs.length > 0 && (
          <div className="flex items-center gap-2 py-1.5 px-2 mt-2">
            <span className="text-gray-600 text-xs">[{formatTimestamp(new Date())}]</span>
            <span className="text-green-400">$</span>
            <motion.span
              className="w-2 h-4 bg-green-400"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
            />
          </div>
        )}

        <div ref={logsEndRef} />
      </div>

      {/* Terminal footer with stats */}
      <div className="px-4 py-2 bg-gray-900/80 border-t border-gray-800 flex items-center justify-between text-xs font-mono text-gray-500 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            {logs.length} entries
          </span>
          {progress > 0 && (
            <span className="text-cyan-400">{progress}%</span>
          )}
        </div>
        <span className="text-gray-600">
          project:{' '}
          <span className="text-gray-400">{projectId.slice(0, 8)}...</span>
        </span>
      </div>
    </div>
  );
}

export default LiveLogs;
