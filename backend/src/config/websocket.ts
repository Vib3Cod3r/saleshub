import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { logger } from '../utils/logger';
import { verifyToken } from '../utils/auth';

export class WebSocketServer {
  private io: Server;
  private redisClient: any;
  private redisAdapter: any;

  constructor(server: any) {
    // Create Redis clients for adapter
    const pubClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD,
    });

    const subClient = pubClient.duplicate();

    // Create Redis adapter for horizontal scaling
    this.redisAdapter = createAdapter(pubClient, subClient);

    // Initialize Socket.IO server
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      adapter: this.redisAdapter,
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    this.setupMiddleware();
    
    logger.info('WebSocket server initialized with Redis adapter');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);
      
      // Join user-specific room
      if (socket.data.user) {
        const userId = socket.data.user.userId;
        socket.join(`user:${userId}`);
        logger.info(`Client ${socket.id} joined user room: ${userId}`);
      }
      
      socket.on('join-room', (room) => {
        socket.join(room);
        logger.info(`Client ${socket.id} joined room: ${room}`);
      });

      socket.on('leave-room', (room) => {
        socket.leave(room);
        logger.info(`Client ${socket.id} left room: ${room}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (token) {
          const decoded = await verifyToken(token);
          socket.data.user = decoded;
          logger.debug(`Authenticated user: ${decoded.userId}`);
        } else {
          logger.warn(`Unauthenticated connection attempt: ${socket.id}`);
        }
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });
  }

  public emitToRoom(room: string, event: string, data: any) {
    this.io.to(room).emit(event, data);
    logger.debug(`Emitted to room ${room}: ${event}`);
  }

  public emitToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Emitted to user ${userId}: ${event}`);
  }

  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
    logger.debug(`Broadcasted: ${event}`);
  }

  public getConnectedClients(): number {
    return this.io.engine.clientsCount;
  }

  public getRooms(): string[] {
    return Array.from(this.io.sockets.adapter.rooms.keys());
  }

  public disconnect() {
    this.io.close();
    logger.info('WebSocket server disconnected');
  }
}
