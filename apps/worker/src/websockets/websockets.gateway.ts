import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import {
  WebSocketEvent,
  GenerationProgressPayload,
  GenerationStatus,
} from '../types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  projectId?: string;
}

/**
 * WebSockets Gateway
 *
 * Handles real-time communication for:
 * - Generation progress updates
 * - Agent step notifications
 * - Project updates
 * - System notifications
 */
@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
export class WebsocketsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketsGateway.name);
  private readonly connectedClients: Map<string, AuthenticatedSocket> = new Map();
  private readonly userSockets: Map<string, Set<string>> = new Map();
  private readonly projectSubscriptions: Map<string, Set<string>> = new Map();

  constructor(private readonly configService: ConfigService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);

    // Send connection confirmation
    client.emit(WebSocketEvent.CONNECTED, {
      socketId: client.id,
      timestamp: new Date().toISOString(),
    });

    // Start heartbeat
    this.startHeartbeat(client);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clean up user socket mapping
    if (client.userId) {
      const userSocketIds = this.userSockets.get(client.userId);
      if (userSocketIds) {
        userSocketIds.delete(client.id);
        if (userSocketIds.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
    }

    // Clean up project subscriptions
    if (client.projectId) {
      const projectSockets = this.projectSubscriptions.get(client.projectId);
      if (projectSockets) {
        projectSockets.delete(client.id);
        if (projectSockets.size === 0) {
          this.projectSubscriptions.delete(client.projectId);
        }
      }
    }

    this.connectedClients.delete(client.id);
  }

  /**
   * Handle user authentication
   */
  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string; token: string },
  ) {
    // In production, verify the token
    // For now, just store the userId
    client.userId = data.userId;

    // Add to user sockets map
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)!.add(client.id);

    this.logger.log(`Client ${client.id} authenticated as user ${data.userId}`);

    return { success: true, userId: data.userId };
  }

  /**
   * Subscribe to project updates
   */
  @SubscribeMessage('subscribe:project')
  handleSubscribeProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    if (!client.userId) {
      return { success: false, error: 'Not authenticated' };
    }

    client.projectId = data.projectId;
    client.join(`project:${data.projectId}`);

    // Track subscription
    if (!this.projectSubscriptions.has(data.projectId)) {
      this.projectSubscriptions.set(data.projectId, new Set());
    }
    this.projectSubscriptions.get(data.projectId)!.add(client.id);

    this.logger.log(
      `Client ${client.id} subscribed to project ${data.projectId}`,
    );

    return { success: true, projectId: data.projectId };
  }

  /**
   * Unsubscribe from project updates
   */
  @SubscribeMessage('unsubscribe:project')
  handleUnsubscribeProject(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { projectId: string },
  ) {
    client.leave(`project:${data.projectId}`);

    const projectSockets = this.projectSubscriptions.get(data.projectId);
    if (projectSockets) {
      projectSockets.delete(client.id);
    }

    if (client.projectId === data.projectId) {
      client.projectId = undefined;
    }

    this.logger.log(
      `Client ${client.id} unsubscribed from project ${data.projectId}`,
    );

    return { success: true };
  }

  /**
   * Subscribe to generation updates
   */
  @SubscribeMessage('subscribe:generation')
  handleSubscribeGeneration(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { generationId: string },
  ) {
    if (!client.userId) {
      return { success: false, error: 'Not authenticated' };
    }

    client.join(`generation:${data.generationId}`);

    this.logger.log(
      `Client ${client.id} subscribed to generation ${data.generationId}`,
    );

    return { success: true, generationId: data.generationId };
  }

  /**
   * Unsubscribe from generation updates
   */
  @SubscribeMessage('unsubscribe:generation')
  handleUnsubscribeGeneration(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { generationId: string },
  ) {
    client.leave(`generation:${data.generationId}`);

    this.logger.log(
      `Client ${client.id} unsubscribed from generation ${data.generationId}`,
    );

    return { success: true };
  }

  // ==========================================
  // Server-to-Client Event Emitters
  // ==========================================

  /**
   * Emit generation progress to subscribers
   */
  emitGenerationProgress(payload: GenerationProgressPayload) {
    this.server
      .to(`generation:${payload.generationId}`)
      .emit(WebSocketEvent.GENERATION_PROGRESS, {
        event: WebSocketEvent.GENERATION_PROGRESS,
        data: payload,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit generation started event
   */
  emitGenerationStarted(generationId: string, userId: string) {
    this.emitToUser(userId, WebSocketEvent.GENERATION_STARTED, {
      generationId,
      status: GenerationStatus.PROCESSING,
      timestamp: new Date().toISOString(),
    });

    this.server
      .to(`generation:${generationId}`)
      .emit(WebSocketEvent.GENERATION_STARTED, {
        event: WebSocketEvent.GENERATION_STARTED,
        data: { generationId, status: GenerationStatus.PROCESSING },
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit generation completed event
   */
  emitGenerationCompleted(
    generationId: string,
    userId: string,
    result: { filesCount: number; tokensUsed: number },
  ) {
    const payload = {
      generationId,
      status: GenerationStatus.COMPLETED,
      ...result,
      timestamp: new Date().toISOString(),
    };

    this.emitToUser(userId, WebSocketEvent.GENERATION_COMPLETED, payload);

    this.server
      .to(`generation:${generationId}`)
      .emit(WebSocketEvent.GENERATION_COMPLETED, {
        event: WebSocketEvent.GENERATION_COMPLETED,
        data: payload,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit generation failed event
   */
  emitGenerationFailed(
    generationId: string,
    userId: string,
    error: { message: string; code?: string },
  ) {
    const payload = {
      generationId,
      status: GenerationStatus.FAILED,
      error,
      timestamp: new Date().toISOString(),
    };

    this.emitToUser(userId, WebSocketEvent.GENERATION_FAILED, payload);

    this.server
      .to(`generation:${generationId}`)
      .emit(WebSocketEvent.GENERATION_FAILED, {
        event: WebSocketEvent.GENERATION_FAILED,
        data: payload,
        timestamp: new Date().toISOString(),
      });
  }

  /**
   * Emit agent step started
   */
  emitAgentStepStarted(
    generationId: string,
    step: { name: string; description: string },
  ) {
    this.server.to(`generation:${generationId}`).emit(WebSocketEvent.AGENT_STEP_STARTED, {
      event: WebSocketEvent.AGENT_STEP_STARTED,
      data: { generationId, step },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit agent step completed
   */
  emitAgentStepCompleted(
    generationId: string,
    step: { name: string; durationMs: number },
  ) {
    this.server.to(`generation:${generationId}`).emit(WebSocketEvent.AGENT_STEP_COMPLETED, {
      event: WebSocketEvent.AGENT_STEP_COMPLETED,
      data: { generationId, step },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit agent thinking message
   */
  emitAgentThinking(generationId: string, message: string) {
    this.server.to(`generation:${generationId}`).emit(WebSocketEvent.AGENT_THINKING, {
      event: WebSocketEvent.AGENT_THINKING,
      data: { generationId, message },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit project updated event
   */
  emitProjectUpdated(projectId: string, changes: Record<string, unknown>) {
    this.server.to(`project:${projectId}`).emit(WebSocketEvent.PROJECT_UPDATED, {
      event: WebSocketEvent.PROJECT_UPDATED,
      data: { projectId, changes },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit error to a specific user
   */
  emitError(userId: string, error: { message: string; code?: string }) {
    this.emitToUser(userId, WebSocketEvent.ERROR, {
      error,
      timestamp: new Date().toISOString(),
    });
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  /**
   * Emit event to all sockets of a specific user
   */
  private emitToUser(userId: string, event: WebSocketEvent, data: unknown) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        const socket = this.connectedClients.get(socketId);
        if (socket) {
          socket.emit(event, {
            event,
            data,
            timestamp: new Date().toISOString(),
          });
        }
      });
    }
  }

  /**
   * Start heartbeat for a client
   */
  private startHeartbeat(client: AuthenticatedSocket) {
    const interval = setInterval(() => {
      if (!this.connectedClients.has(client.id)) {
        clearInterval(interval);
        return;
      }

      client.emit(WebSocketEvent.HEARTBEAT, {
        timestamp: Date.now(),
      });
    }, 30000); // Every 30 seconds

    client.on('disconnect', () => {
      clearInterval(interval);
    });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.connectedClients.size,
      authenticatedUsers: this.userSockets.size,
      projectSubscriptions: this.projectSubscriptions.size,
    };
  }
}
