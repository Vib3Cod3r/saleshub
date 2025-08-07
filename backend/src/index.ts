import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDatabase, disconnectDatabase } from '@/utils/database';
import authRoutes from '@/routes/auth';
import contactRoutes from '@/routes/contacts';
import dealRoutes from '@/routes/deals';
import taskRoutes from '@/routes/tasks';
import callRoutes from '@/routes/calls';
import noteRoutes from '@/routes/notes';
import messageRoutes from '@/routes/messages';
import companyRoutes from '@/routes/companies';
import dashboardRoutes from '@/routes/dashboard';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8089;

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET environment variable is not set!');
  console.error('Please create a .env file with JWT_SECRET=your-secret-key');
  process.exit(1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { healthCheck } = await import('@/utils/database');
    const dbHealthy = await healthCheck();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbHealthy ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'SalesHub CRM API',
      version: '1.0.0',
      description: 'Professional CRM backend API',
      endpoints: {
        auth: '/api/auth',
        contacts: '/api/contacts',
        deals: '/api/deals',
        tasks: '/api/tasks',
        calls: '/api/calls',
        notes: '/api/notes',
        messages: '/api/messages',
        companies: '/api/companies',
        dashboard: '/api/dashboard'
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  
  // Log detailed error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
    console.error('Request URL:', req.url);
    console.error('Request Method:', req.method);
    console.error('Request Headers:', req.headers);
    console.error('Request Body:', req.body);
  }

  // Determine error type and send appropriate response
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorDetails = {};

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = { fields: err.errors };
  } else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database Error';
    errorDetails = { code: err.code };
  } else if (err.name === 'PrismaClientUnknownRequestError') {
    statusCode = 500;
    message = 'Database Error';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.status) {
    statusCode = err.status;
    message = err.message || 'Request failed';
  }

  // Send error response
  res.status(statusCode).json({ 
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      details: errorDetails,
      stack: err.stack 
    })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await disconnectDatabase();
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 SalesHub CRM API Server running on port ${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not Set'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📝 Log Level: ${process.env.LOG_LEVEL || 'info'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 