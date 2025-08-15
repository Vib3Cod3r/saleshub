// Global error handler for consistent error management
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error types
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

// Error handler function
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new AppError('Network error. Please check your connection.', 0, ErrorTypes.NETWORK_ERROR);
    }

    // Handle authentication errors
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return new AppError('Authentication failed. Please log in again.', 401, ErrorTypes.AUTHENTICATION_ERROR);
    }

    // Handle authorization errors
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return new AppError('You do not have permission to perform this action.', 403, ErrorTypes.AUTHORIZATION_ERROR);
    }

    // Handle validation errors
    if (error.message.includes('400') || error.message.includes('validation')) {
      return new AppError('Invalid data provided.', 400, ErrorTypes.VALIDATION_ERROR);
    }

    // Handle not found errors
    if (error.message.includes('404') || error.message.includes('not found')) {
      return new AppError('The requested resource was not found.', 404, ErrorTypes.NOT_FOUND_ERROR);
    }

    // Default error
    return new AppError(error.message, 500, ErrorTypes.SERVER_ERROR);
  }

  // Handle unknown errors
  return new AppError('An unexpected error occurred.', 500, ErrorTypes.SERVER_ERROR);
}

// Error logging function
export function logError(error: AppError, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'App'}] Error:`, {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      stack: error.stack,
    });
  } else {
    // In production, you might want to send errors to a logging service
    console.error(`[${context || 'App'}] Error:`, {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    });
  }
}

// Error boundary error handler
export function handleErrorBoundaryError(error: Error, _errorInfo: React.ErrorInfo): void {
  logError(new AppError(error.message, 500, 'BOUNDARY_ERROR'), 'ErrorBoundary');
  
  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }
}
