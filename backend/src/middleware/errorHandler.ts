import { Request, Response, NextFunction } from 'express';
import { sendInternalError, sendValidationError, sendBadRequest, sendUnauthorized, sendForbidden, sendNotFound, sendConflict, sendTooManyRequests } from '@/utils/response';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, RateLimitError } from '@/utils/errors';

export function errorHandler(
  error: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Handle custom AppError instances
  if (error instanceof AppError) {
    const appError = error as AppError;
    
    if (appError.isOperational) {
      // Log operational errors with context
      console.warn('Operational error:', {
        code: appError.code,
        statusCode: appError.statusCode,
        message: appError.message,
        url: req.url,
        method: req.method
      });
    }

    // Send appropriate response based on error type
    switch (appError.constructor) {
      case ValidationError:
        sendValidationError(res, appError.message);
        break;
      case NotFoundError:
        sendNotFound(res, appError.message);
        break;
      case UnauthorizedError:
        sendUnauthorized(res, appError.message);
        break;
      case ForbiddenError:
        sendForbidden(res, appError.message);
        break;
      case ConflictError:
        sendConflict(res, appError.message);
        break;
      case RateLimitError:
        sendTooManyRequests(res, appError.message);
        break;
      default:
        res.status(appError.statusCode).json({
          success: false,
          error: appError.message,
          code: appError.code,
          timestamp: new Date().toISOString()
        });
    }
    return;
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    sendValidationError(res, error.message);
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    sendUnauthorized(res, 'Invalid token');
    return;
  }

  if (error.name === 'TokenExpiredError') {
    sendUnauthorized(res, 'Token expired');
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        sendConflict(res, 'Duplicate entry found');
        return;
      case 'P2025':
        sendNotFound(res, 'Record not found');
        return;
      case 'P2003':
        sendBadRequest(res, 'Foreign key constraint failed');
        return;
      default:
        sendInternalError(res, 'Database operation failed');
        return;
    }
  }

  // Default error response
  sendInternalError(res, 'Internal server error');
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
