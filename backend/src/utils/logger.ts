import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

// Custom format for log messages
const logFormat = printf(({ level, message, timestamp, ...metadata }: any) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create logger instance
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport with colors
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // File transport for errors
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // File transport for all logs
    new transports.File({
      filename: 'logs/combined.log',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

// WebSocket specific logger
export const wsLogger = {
  info: (message: string, metadata?: any) => {
    logger.info(`[WebSocket] ${message}`, metadata);
  },
  error: (message: string, metadata?: any) => {
    logger.error(`[WebSocket] ${message}`, metadata);
  },
  warn: (message: string, metadata?: any) => {
    logger.warn(`[WebSocket] ${message}`, metadata);
  },
  debug: (message: string, metadata?: any) => {
    logger.debug(`[WebSocket] ${message}`, metadata);
  },
};

// Search specific logger
export const searchLogger = {
  info: (message: string, metadata?: any) => {
    logger.info(`[Search] ${message}`, metadata);
  },
  error: (message: string, metadata?: any) => {
    logger.error(`[Search] ${message}`, metadata);
  },
  warn: (message: string, metadata?: any) => {
    logger.warn(`[Search] ${message}`, metadata);
  },
  debug: (message: string, metadata?: any) => {
    logger.debug(`[Search] ${message}`, metadata);
  },
};

// Database specific logger
export const dbLogger = {
  info: (message: string, metadata?: any) => {
    logger.info(`[Database] ${message}`, metadata);
  },
  error: (message: string, metadata?: any) => {
    logger.error(`[Database] ${message}`, metadata);
  },
  warn: (message: string, metadata?: any) => {
    logger.warn(`[Database] ${message}`, metadata);
  },
  debug: (message: string, metadata?: any) => {
    logger.debug(`[Database] ${message}`, metadata);
  },
};

// Performance logger
export const perfLogger = {
  info: (operation: string, duration: number, metadata?: any) => {
    logger.info(`[Performance] ${operation} took ${duration}ms`, metadata);
  },
  warn: (operation: string, duration: number, metadata?: any) => {
    logger.warn(`[Performance] ${operation} took ${duration}ms (slow)`, metadata);
  },
  error: (operation: string, duration: number, metadata?: any) => {
    logger.error(`[Performance] ${operation} took ${duration}ms (timeout)`, metadata);
  },
};

// Security logger
export const securityLogger = {
  info: (message: string, metadata?: any) => {
    logger.info(`[Security] ${message}`, metadata);
  },
  warn: (message: string, metadata?: any) => {
    logger.warn(`[Security] ${message}`, metadata);
  },
  error: (message: string, metadata?: any) => {
    logger.error(`[Security] ${message}`, metadata);
  },
};

// Request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, statusCode } = req;
    
    if (statusCode >= 400) {
      logger.warn(`[Request] ${method} ${url} - ${statusCode} (${duration}ms)`, {
        method,
        url,
        statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
    } else {
      logger.info(`[Request] ${method} ${url} - ${statusCode} (${duration}ms)`, {
        method,
        url,
        statusCode,
        duration,
      });
    }
  });
  
  next();
};

// Error logger
export const errorLogger = (error: Error, req?: any) => {
  logger.error(`[Error] ${error.message}`, {
    stack: error.stack,
    url: req?.url,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
  });
};

export default logger;
