import { Request, Response } from 'express';
import { APIResponse, PaginatedResponse } from '@/types';

// Standard response helper
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  data: T | null = null,
  message?: string,
  error?: string
): void {
  const response: APIResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    data: data || undefined,
    message,
    error,
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(response);
}

// Enhanced response with metadata
export function sendResponseWithMetadata<T>(
  res: Response,
  statusCode: number,
  data: T | null = null,
  message?: string,
  error?: string,
  metadata?: Record<string, any>
): void {
  const response: APIResponse<T> & { metadata?: Record<string, any> } = {
    success: statusCode >= 200 && statusCode < 300,
    data: data || undefined,
    message,
    error,
    timestamp: new Date().toISOString(),
    ...(metadata && { metadata })
  };

  res.status(statusCode).json(response);
}

// Success responses
export function sendSuccess<T>(res: Response, data: T, message?: string): void {
  sendResponse(res, 200, data, message);
}

// Error response
export function sendError(res: Response, statusCode: number, error: string, details?: string): void {
  sendResponse(res, statusCode, null, undefined, details || error);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendResponse(res, 201, data, message);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

// Error responses
export function sendBadRequest(res: Response, error: string): void {
  sendResponse(res, 400, null, undefined, error);
}

export function sendUnauthorized(res: Response, error: string = 'Unauthorized'): void {
  sendResponse(res, 401, null, undefined, error);
}

export function sendForbidden(res: Response, error: string = 'Forbidden'): void {
  sendResponse(res, 403, null, undefined, error);
}

export function sendNotFound(res: Response, error: string = 'Resource not found'): void {
  sendResponse(res, 404, null, undefined, error);
}

export function sendConflict(res: Response, error: string): void {
  sendResponse(res, 409, null, undefined, error);
}

export function sendValidationError(res: Response, error: string): void {
  sendResponse(res, 422, null, undefined, error);
}

export function sendTooManyRequests(res: Response, error: string = 'Too many requests'): void {
  sendResponse(res, 429, null, undefined, error);
}

export function sendInternalError(res: Response, error: string = 'Internal server error'): void {
  sendResponse(res, 500, null, undefined, error);
}

export function sendServiceUnavailable(res: Response, error: string = 'Service unavailable'): void {
  sendResponse(res, 503, null, undefined, error);
}

// Paginated response
export function sendPaginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    pagination
  };

  res.status(200).json(response);
}

// Validation error response
export function sendValidationErrors(res: Response, errors: string[]): void {
  const errorMessage = errors.join('; ');
  sendValidationError(res, errorMessage);
}

// Database error response
export function sendDatabaseError(res: Response, error: any, operation: string): void {
  console.error(`Database error during ${operation}:`, error);
  
  let errorMessage = `Failed to ${operation}`;
  
  if (error.code === 'P2002') {
    errorMessage = 'Duplicate entry found';
  } else if (error.code === 'P2025') {
    errorMessage = 'Record not found';
  } else if (error.code === 'P2003') {
    errorMessage = 'Foreign key constraint failed';
  }
  
  sendInternalError(res, errorMessage);
}

// Health check response
export function sendHealthCheck(res: Response, status: string, details?: any): void {
  const response = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    ...details
  };

  res.status(status === 'healthy' ? 200 : 503).json(response);
}
