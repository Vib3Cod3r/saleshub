/**
 * Error handling utilities for the application
 */

export interface ErrorInfo {
  componentStack: string
}

export interface ErrorContext {
  url?: string
  userAgent?: string
  timestamp: Date
  componentStack?: string
}

/**
 * Handles errors caught by React Error Boundaries
 */
export function handleErrorBoundaryError(error: Error, errorInfo: ErrorInfo): void {
  const errorContext: ErrorContext = {
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date(),
    componentStack: errorInfo.componentStack
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary caught an error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Error Context:', errorContext)
  }

  // In production, you might want to send this to an error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: send to error reporting service
    // reportErrorToService(error, errorContext)
  }

  // Store in localStorage for debugging (optional)
  try {
    const errorLog = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo,
      context: errorContext
    }

    const existingLogs = localStorage.getItem('error-logs')
    const logs = existingLogs ? JSON.parse(existingLogs) : []
    logs.push(errorLog)
    
    // Keep only last 10 errors
    if (logs.length > 10) {
      logs.splice(0, logs.length - 10)
    }
    
    localStorage.setItem('error-logs', JSON.stringify(logs))
  } catch (storageError) {
    // Silently fail if localStorage is not available
    console.warn('Failed to store error log:', storageError)
  }
}

/**
 * Handles async errors
 */
export function handleAsyncError(error: Error, context?: Partial<ErrorContext>): void {
  const errorContext: ErrorContext = {
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date(),
    ...context
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Async error caught:', error)
    console.error('Error Context:', errorContext)
  }

  // Handle production error reporting here
  if (process.env.NODE_ENV === 'production') {
    // reportErrorToService(error, errorContext)
  }
}

/**
 * Creates a safe error handler for async operations
 */
export function createErrorHandler(context?: Partial<ErrorContext>) {
  return (error: Error) => {
    handleAsyncError(error, context)
  }
}

/**
 * Wraps a function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args)
    } catch (error) {
      handleAsyncError(error as Error, context)
      throw error
    }
  }) as T
}

/**
 * Wraps an async function with error handling
 */
export function withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return ((...args: Parameters<T>) => {
    return fn(...args).catch((error: Error) => {
      handleAsyncError(error, context)
      throw error
    })
  }) as T
}

/**
 * Gets stored error logs from localStorage
 */
export function getStoredErrorLogs(): any[] {
  try {
    const logs = localStorage.getItem('error-logs')
    return logs ? JSON.parse(logs) : []
  } catch {
    return []
  }
}

/**
 * Clears stored error logs
 */
export function clearStoredErrorLogs(): void {
  try {
    localStorage.removeItem('error-logs')
  } catch {
    // Silently fail if localStorage is not available
  }
}
