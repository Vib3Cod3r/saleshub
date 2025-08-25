import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { testDatabaseConnection, disconnectDatabase } from '@/utils/database';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { sendHealthCheck } from '@/utils/response';
import { WebSocketServer } from '@/config/websocket';
import { requestLogger, errorLogger } from '@/utils/logger';
import authRoutes from '@/routes/auth';
import contactRoutes from '@/routes/contacts';
import companyRoutes from '@/routes/companies';
import leadRoutes from '@/routes/leads';
import dealRoutes from '@/routes/deals';
import taskRoutes from '@/routes/tasks';
// import analyticsRoutes from '@/routes/analytics';
import searchRoutes from '@/routes/search';
import realtimeRoutes from '@/routes/realtime';
import enhancedSearchRoutes from '@/routes/enhancedSearch';
import collaborativeDocumentRoutes from '@/routes/collaborativeDocuments';
import performanceRoutes from '@/routes/performance';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8089;

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await testDatabaseConnection();
  const status = dbHealth ? 'healthy' : 'unhealthy';
  const details = {
    database: dbHealth ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0'
  };
  
  sendHealthCheck(res, status, details);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
// app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/enhanced-search', enhancedSearchRoutes);
app.use('/api/collaborative-documents', collaborativeDocumentRoutes);
app.use('/api/performance', performanceRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log(`🚀 SalesHub CRM API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🌐 WebSocket: ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 WebSocket server initialized with Redis adapter`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
