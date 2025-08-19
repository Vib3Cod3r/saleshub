/**
 * Error logging system for the application
 */

export interface ErrorLog {
  timestamp: string
  type: 'console' | 'network' | 'auth' | 'react' | 'nextjs'
  message: string
  stack?: string
  details?: unknown
  url?: string
  userAgent?: string
}

export interface HandlerUsage {
  handlerName: string
  timestamp: string
  success: boolean
  responseTime: number
  errorCount: number
  totalCalls: number
  lastCalled: string
  avgResponseTime: number
}

export interface HandlerAnalytics {
  totalHandlers: number
  totalCalls: number
  successRate: number
  avgResponseTime: number
  mostUsedHandler: string
  slowestHandler: string
  handlerBreakdown: Record<string, HandlerUsage>
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100
  private handlerUsage: Map<string, HandlerUsage> = new Map()

  /**
   * Track handler usage
   */
  trackHandlerUsage(
    handlerName: string, 
    success: boolean, 
    responseTime: number,
    errorCount: number = 0
  ): void {
    const now = new Date().toISOString()
    const existing = this.handlerUsage.get(handlerName)
    
    if (existing) {
      // Update existing handler stats
      const totalCalls = existing.totalCalls + 1
      const totalResponseTime = existing.avgResponseTime * existing.totalCalls + responseTime
      const newAvgResponseTime = totalResponseTime / totalCalls
      
      this.handlerUsage.set(handlerName, {
        ...existing,
        timestamp: now,
        success: success && existing.success, // Only true if both are true
        responseTime,
        errorCount: existing.errorCount + errorCount,
        totalCalls,
        lastCalled: now,
        avgResponseTime: newAvgResponseTime
      })
    } else {
      // Create new handler entry
      this.handlerUsage.set(handlerName, {
        handlerName,
        timestamp: now,
        success,
        responseTime,
        errorCount,
        totalCalls: 1,
        lastCalled: now,
        avgResponseTime: responseTime
      })
    }

    // Log handler usage for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HANDLER-TRACKER] ${handlerName}: ${success ? 'SUCCESS' : 'FAILED'} (${responseTime}ms)`)
    }
  }

  /**
   * Get handler usage statistics
   */
  getHandlerUsage(handlerName?: string): HandlerUsage | HandlerUsage[] | null {
    if (handlerName) {
      return this.handlerUsage.get(handlerName) || null
    }
    return Array.from(this.handlerUsage.values())
  }

  /**
   * Get comprehensive handler analytics
   */
  getHandlerAnalytics(): HandlerAnalytics {
    const handlers = Array.from(this.handlerUsage.values())
    
    if (handlers.length === 0) {
      return {
        totalHandlers: 0,
        totalCalls: 0,
        successRate: 0,
        avgResponseTime: 0,
        mostUsedHandler: '',
        slowestHandler: '',
        handlerBreakdown: {}
      }
    }

    const totalCalls = handlers.reduce((sum, h) => sum + h.totalCalls, 0)
    const totalErrors = handlers.reduce((sum, h) => sum + h.errorCount, 0)
    const successRate = ((totalCalls - totalErrors) / totalCalls) * 100
    
    const avgResponseTime = handlers.reduce((sum, h) => sum + h.avgResponseTime, 0) / handlers.length
    
    const mostUsedHandler = handlers.reduce((max, h) => 
      h.totalCalls > max.totalCalls ? h : max
    ).handlerName
    
    const slowestHandler = handlers.reduce((max, h) => 
      h.avgResponseTime > max.avgResponseTime ? h : max
    ).handlerName

    const handlerBreakdown = handlers.reduce((acc, handler) => {
      acc[handler.handlerName] = handler
      return acc
    }, {} as Record<string, HandlerUsage>)

    return {
      totalHandlers: handlers.length,
      totalCalls,
      successRate,
      avgResponseTime,
      mostUsedHandler,
      slowestHandler,
      handlerBreakdown
    }
  }

  /**
   * Clear handler usage data
   */
  clearHandlerUsage(): void {
    this.handlerUsage.clear()
  }

  /**
   * Export handler usage data
   */
  exportHandlerUsage(): string {
    return JSON.stringify(Array.from(this.handlerUsage.values()), null, 2)
  }

  /**
   * Import handler usage data
   */
  importHandlerUsage(data: string): void {
    try {
      const importedHandlers = JSON.parse(data) as HandlerUsage[]
      importedHandlers.forEach(handler => {
        this.handlerUsage.set(handler.handlerName, handler)
      })
    } catch (error) {
      console.error('Failed to import handler usage data:', error)
    }
  }

  /**
   * Add a new error log
   */
  log(type: ErrorLog['type'], message: string, details?: unknown, stack?: string): void {
    const startTime = performance.now()
    
    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    }

    this.logs.push(log)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development (without recursion issues since we don't override console.error in dev)
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[ERROR-LOGGER][${type.toUpperCase()}] ${message}`
      console.log(logMessage, details || '')
    }

    const responseTime = performance.now() - startTime
    this.trackHandlerUsage(`log-${type}`, true, responseTime)
  }

  /**
   * Log a console error
   */
  logConsole(message: string, details?: unknown, stack?: string): void {
    const startTime = performance.now()
    this.log('console', message, details, stack)
    const responseTime = performance.now() - startTime
    this.trackHandlerUsage('logConsole', true, responseTime)
  }

  /**
   * Log a network error
   */
  logNetwork(message: string, details?: unknown): void {
    const startTime = performance.now()
    this.log('network', message, details)
    const responseTime = performance.now() - startTime
    this.trackHandlerUsage('logNetwork', true, responseTime)
  }

  /**
   * Log an authentication error
   */
  logAuth(message: string, details?: unknown): void {
    const startTime = performance.now()
    this.log('auth', message, details)
    const responseTime = performance.now() - startTime
    this.trackHandlerUsage('logAuth', true, responseTime)
  }

  /**
   * Log a React error
   */
  logReact(message: string, details?: unknown, stack?: string): void {
    const startTime = performance.now()
    this.log('react', message, details, stack)
    const responseTime = performance.now() - startTime
    this.trackHandlerUsage('logReact', true, responseTime)
  }

  /**
   * Log a Next.js error
   */
  logNextJS(message: string, details?: unknown): void {
    const startTime = performance.now()
    this.log('nextjs', message, details)
    const responseTime = performance.now() - startTime
    this.trackHandlerUsage('logNextJS', true, responseTime)
  }

  /**
   * Get all logs
   */
  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  /**
   * Get logs by type
   */
  getLogsByType(type: ErrorLog['type']): ErrorLog[] {
    return this.logs.filter(log => log.type === type)
  }

  /**
   * Get logs by handler name
   */
  getLogsByHandler(handlerName: string): ErrorLog[] {
    return this.logs.filter(log => log.message.includes(handlerName))
  }

  /**
   * Get recent logs (last N logs)
   */
  getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count)
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = []
  }

  /**
   * Clear handler usage data
   */
  clearHandlers(): void {
    this.clearHandlerUsage()
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify({
      logs: this.logs,
      analytics: this.getHandlerAnalytics()
    }, null, 2)
  }

  /**
   * Import logs from JSON string
   */
  importLogs(data: string): void {
    try {
      const imported = JSON.parse(data)
      
      if (imported.logs) {
        this.logs = [...this.logs, ...imported.logs]
      }
      
      // Keep only the most recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs)
      }
    } catch (error) {
      console.error('Failed to import logs:', error)
    }
  }

  /**
   * Get log statistics
   */
  getStats(): {
    total: number
    byType: Record<ErrorLog['type'], number>
    recentCount: number
    handlerStats: HandlerAnalytics
  } {
    const byType = this.logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1
      return acc
    }, {} as Record<ErrorLog['type'], number>)

    return {
      total: this.logs.length,
      byType,
      recentCount: this.logs.filter(log => {
        const logTime = new Date(log.timestamp)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        return logTime > oneHourAgo
      }).length,
      handlerStats: this.getHandlerAnalytics()
    }
  }

  /**
   * Set maximum number of logs to keep
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }
  }
}

// Extend Window interface to include our recursion guard (only used in production)
declare global {
  interface Window {
    __errorLoggerRecursionGuard?: boolean
  }
}

// Create a singleton instance
export const errorLogger = new ErrorLogger()

// Set up global error handlers with tracking
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const startTime = performance.now()
    errorLogger.logNetwork('Unhandled Promise Rejection', {
      reason: event.reason,
      promise: event.promise
    })
    
    const responseTime = performance.now() - startTime
    errorLogger.trackHandlerUsage('global-unhandled-rejection', true, responseTime)
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    const startTime = performance.now()
    errorLogger.logConsole('Global Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, event.error?.stack)
    
    const responseTime = performance.now() - startTime
    errorLogger.trackHandlerUsage('global-error', true, responseTime)
  })

  // Only override console.error in production to avoid recursion issues in development
  if (process.env.NODE_ENV === 'production') {
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Prevent infinite recursion by checking if we're already in a console.error call
      if (!window.__errorLoggerRecursionGuard) {
        window.__errorLoggerRecursionGuard = true
        try {
          // Only log if it's not an error from the error logger itself
          const message = args.join(' ')
          if (!message.includes('[ERROR-LOGGER]')) {
            const startTime = performance.now()
            errorLogger.logConsole(message, args.length > 1 ? args.slice(1) : undefined)
            const responseTime = performance.now() - startTime
            errorLogger.trackHandlerUsage('console-error-override', true, responseTime)
          }
        } finally {
          window.__errorLoggerRecursionGuard = false
        }
      }
      originalConsoleError.apply(console, args)
    }
  }
}

// Export convenience functions
export const logConsole = (message: string, details?: unknown, stack?: string) => 
  errorLogger.logConsole(message, details, stack)

export const logNetwork = (message: string, details?: unknown) => 
  errorLogger.logNetwork(message, details)

export const logAuth = (message: string, details?: unknown) => 
  errorLogger.logAuth(message, details)

export const logReact = (message: string, details?: unknown, stack?: string) => 
  errorLogger.logReact(message, details, stack)

export const logNextJS = (message: string, details?: unknown) => 
  errorLogger.logNextJS(message, details)

// Export handler tracking functions
export const trackHandlerUsage = (handlerName: string, success: boolean, responseTime: number, errorCount?: number) => 
  errorLogger.trackHandlerUsage(handlerName, success, responseTime, errorCount || 0)

export const getHandlerUsage = (handlerName?: string) => errorLogger.getHandlerUsage(handlerName)

export const getHandlerAnalytics = () => errorLogger.getHandlerAnalytics()

export const clearHandlerUsage = () => errorLogger.clearHandlerUsage()

export const clearHandlers = () => errorLogger.clearHandlers()

export const exportHandlerUsage = () => errorLogger.exportHandlerUsage()

export const importHandlerUsage = (data: string) => errorLogger.importHandlerUsage(data)


