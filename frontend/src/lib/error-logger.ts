/**
 * Enhanced Error logging system for the application with persistence and prevention
 */

export interface ErrorLog {
  timestamp: string
  type: 'console' | 'network' | 'auth' | 'react' | 'nextjs' | 'internal_server' | 'startup' | 'health_check'
  message: string
  stack?: string
  details?: unknown
  url?: string
  userAgent?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  recurring: boolean
  occurrenceCount: number
  lastOccurrence: string
  buildId?: string
  sessionId?: string
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
  consecutiveFailures: number
  lastSuccessTime?: string
  healthStatus: 'healthy' | 'degraded' | 'unhealthy'
}

export interface HandlerAnalytics {
  totalHandlers: number
  totalCalls: number
  successRate: number
  avgResponseTime: number
  mostUsedHandler: string
  slowestHandler: string
  handlerBreakdown: Record<string, HandlerUsage>
  unhealthyHandlers: string[]
  degradedHandlers: string[]
}

export interface StartupHealthCheck {
  timestamp: string
  buildId: string
  sessionId: string
  checks: {
    database: boolean
    api: boolean
    auth: boolean
    frontend: boolean
  }
  errors: string[]
  warnings: string[]
  overallStatus: 'healthy' | 'degraded' | 'unhealthy'
}

export interface ErrorPreventionRule {
  id: string
  pattern: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  action: 'prevent' | 'retry' | 'fallback' | 'alert'
  maxOccurrences: number
  timeWindow: number // in minutes
  enabled: boolean
  description: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 200
  private handlerUsage: Map<string, HandlerUsage> = new Map()
  private startupHealthChecks: StartupHealthCheck[] = []
  private errorPreventionRules: ErrorPreventionRule[] = []
  private buildId: string
  private sessionId: string
  private isInitialized = false

  constructor() {
    this.buildId = this.generateBuildId()
    this.sessionId = this.generateSessionId()
    this.initializeErrorPreventionRules()
    this.loadPersistedData()
    this.performStartupHealthCheck()
  }

  /**
   * Generate a unique build ID
   */
  private generateBuildId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Initialize error prevention rules
   */
  private initializeErrorPreventionRules(): void {
    this.errorPreventionRules = [
      {
        id: 'internal-server-error',
        pattern: 'Internal Server Error|500|Failed to fetch|Network Error',
        severity: 'critical',
        action: 'retry',
        maxOccurrences: 3,
        timeWindow: 5,
        enabled: true,
        description: 'Prevent recurring Internal Server Errors'
      },
      {
        id: 'database-connection-error',
        pattern: 'database|connection|timeout|ECONNREFUSED',
        severity: 'critical',
        action: 'retry',
        maxOccurrences: 5,
        timeWindow: 10,
        enabled: true,
        description: 'Handle database connection issues'
      },
      {
        id: 'auth-error',
        pattern: 'unauthorized|forbidden|401|403|token|jwt',
        severity: 'high',
        action: 'fallback',
        maxOccurrences: 2,
        timeWindow: 2,
        enabled: true,
        description: 'Handle authentication errors gracefully'
      },
      {
        id: 'api-timeout',
        pattern: 'timeout|ETIMEDOUT|slow|response',
        severity: 'medium',
        action: 'retry',
        maxOccurrences: 3,
        timeWindow: 3,
        enabled: true,
        description: 'Handle API timeout issues'
      }
    ]
  }

  /**
   * Load persisted data from localStorage
   */
  private loadPersistedData(): void {
    if (typeof window === 'undefined') return

    try {
      // Load logs
      const persistedLogs = localStorage.getItem('errorLogger_logs')
      if (persistedLogs) {
        const parsedLogs = JSON.parse(persistedLogs) as ErrorLog[]
        this.logs = parsedLogs.filter(log => {
          // Keep only logs from the last 24 hours
          const logTime = new Date(log.timestamp)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return logTime > oneDayAgo
        })
      }

      // Load handler usage
      const persistedHandlers = localStorage.getItem('errorLogger_handlers')
      if (persistedHandlers) {
        const parsedHandlers = JSON.parse(persistedHandlers) as HandlerUsage[]
        parsedHandlers.forEach(handler => {
          this.handlerUsage.set(handler.handlerName, handler)
        })
      }

      // Load health checks
      const persistedHealthChecks = localStorage.getItem('errorLogger_healthChecks')
      if (persistedHealthChecks) {
        const parsedChecks = JSON.parse(persistedHealthChecks) as StartupHealthCheck[]
        this.startupHealthChecks = parsedChecks.filter(check => {
          // Keep only checks from the last 7 days
          const checkTime = new Date(check.timestamp)
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return checkTime > oneWeekAgo
        })
      }
    } catch (error) {
      console.warn('Failed to load persisted error logger data:', error)
    }
  }

  /**
   * Persist data to localStorage
   */
  private persistData(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('errorLogger_logs', JSON.stringify(this.logs))
      localStorage.setItem('errorLogger_handlers', JSON.stringify(Array.from(this.handlerUsage.values())))
      localStorage.setItem('errorLogger_healthChecks', JSON.stringify(this.startupHealthChecks))
    } catch (error) {
      console.warn('Failed to persist error logger data:', error)
    }
  }

  /**
   * Perform startup health check
   */
  private async performStartupHealthCheck(): Promise<void> {
    const healthCheck: StartupHealthCheck = {
      timestamp: new Date().toISOString(),
      buildId: this.buildId,
      sessionId: this.sessionId,
      checks: {
        database: false,
        api: false,
        auth: false,
        frontend: true // Frontend is always true if we're running
      },
      errors: [],
      warnings: [],
      overallStatus: 'healthy'
    }

    try {
      // Check API health
      const apiResponse = await fetch('http://localhost:8089/api/health', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      healthCheck.checks.api = apiResponse.ok
      if (!apiResponse.ok) {
        healthCheck.errors.push(`API health check failed: ${apiResponse.status}`)
      }

      // Check database through API
      if (healthCheck.checks.api) {
        try {
          const dbResponse = await fetch('http://localhost:8089/api/crm/companies?limit=1', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
          healthCheck.checks.database = dbResponse.ok
          if (!dbResponse.ok) {
            healthCheck.errors.push(`Database check failed: ${dbResponse.status}`)
          }
        } catch (error) {
          healthCheck.errors.push(`Database check error: ${error}`)
        }
      }

      // Check auth system
      try {
        const authResponse = await fetch('http://localhost:8089/api/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        // Auth check passes if we get a proper response (even if unauthorized)
        healthCheck.checks.auth = authResponse.status !== 500
        if (authResponse.status === 500) {
          healthCheck.errors.push('Auth system health check failed')
        }
      } catch (error) {
        healthCheck.errors.push(`Auth check error: ${error}`)
      }

      // Determine overall status
      const failedChecks = Object.values(healthCheck.checks).filter(check => !check).length
      if (failedChecks === 0) {
        healthCheck.overallStatus = 'healthy'
      } else if (failedChecks <= 1) {
        healthCheck.overallStatus = 'degraded'
      } else {
        healthCheck.overallStatus = 'unhealthy'
      }

      // Log health check results
      if (healthCheck.overallStatus !== 'healthy') {
        this.log('startup', `Startup health check: ${healthCheck.overallStatus}`, healthCheck, undefined, 'high')
      }

      this.startupHealthChecks.push(healthCheck)
      this.persistData()

      // If unhealthy, trigger error prevention
      if (healthCheck.overallStatus === 'unhealthy') {
        this.triggerErrorPrevention('startup-health-check-failed', healthCheck.errors.join(', '))
      }

    } catch (error) {
      healthCheck.errors.push(`Startup health check failed: ${error}`)
      healthCheck.overallStatus = 'unhealthy'
      this.startupHealthChecks.push(healthCheck)
      this.persistData()
      this.log('startup', 'Startup health check failed', { error }, undefined, 'critical')
    }
  }

  /**
   * Check if an error should be prevented based on rules
   */
  private shouldPreventError(message: string, _type: ErrorLog['type']): boolean {
    const now = Date.now()
    
    for (const rule of this.errorPreventionRules) {
      if (!rule.enabled) continue

      const regex = new RegExp(rule.pattern, 'i')
      if (regex.test(message)) {
        // Check recent occurrences
        const recentErrors = this.logs.filter(log => {
          const logTime = new Date(log.timestamp).getTime()
          const timeWindow = rule.timeWindow * 60 * 1000 // Convert to milliseconds
          return logTime > now - timeWindow && regex.test(log.message)
        })

        if (recentErrors.length >= rule.maxOccurrences) {
          this.log('console', `Error prevention triggered: ${rule.description}`, {
            rule: rule.id,
            pattern: rule.pattern,
            occurrences: recentErrors.length,
            maxOccurrences: rule.maxOccurrences
          }, undefined, 'medium')
          return true
        }
      }
    }
    return false
  }

  /**
   * Trigger error prevention action
   */
  private triggerErrorPrevention(triggerId: string, message: string): void {
    this.log('console', `Error prevention triggered: ${triggerId}`, {
      triggerId,
      message,
      buildId: this.buildId,
      sessionId: this.sessionId
    }, undefined, 'high')

    // Implement prevention actions
    switch (triggerId) {
      case 'startup-health-check-failed':
        this.handleStartupFailure(message)
        break
      case 'internal-server-error':
        this.handleInternalServerError(message)
        break
      case 'database-connection-error':
        this.handleDatabaseError(message)
        break
      default:
        this.handleGenericError(message)
    }
  }

  /**
   * Handle startup failure
   */
  private handleStartupFailure(message: string): void {
    // Log critical startup issue
    this.log('startup', 'Critical startup failure detected', {
      message,
      buildId: this.buildId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    }, undefined, 'critical')

    // Show user-friendly message
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('startup-failure', {
        detail: { message, buildId: this.buildId }
      })
      window.dispatchEvent(event)
    }
  }

  /**
   * Handle Internal Server Error
   */
  private handleInternalServerError(message: string): void {
    // Implement retry logic for API calls
    this.log('internal_server', 'Internal Server Error detected - implementing retry logic', {
      message,
      buildId: this.buildId,
      sessionId: this.sessionId
    }, undefined, 'high')

    // Trigger API health check
    this.performStartupHealthCheck()
  }

  /**
   * Handle database error
   */
  private handleDatabaseError(message: string): void {
    this.log('internal_server', 'Database connection error detected', {
      message,
      buildId: this.buildId,
      sessionId: this.sessionId
    }, undefined, 'critical')

    // Implement database reconnection logic
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('database-error', {
        detail: { message, buildId: this.buildId }
      })
      window.dispatchEvent(event)
    }
  }

  /**
   * Handle generic error
   */
  private handleGenericError(message: string): void {
    this.log('console', 'Generic error prevention triggered', {
      message,
      buildId: this.buildId,
      sessionId: this.sessionId
    }, undefined, 'medium')
  }

  /**
   * Track handler usage with enhanced health monitoring
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
      const consecutiveFailures = success ? 0 : existing.consecutiveFailures + 1
      const lastSuccessTime = success ? now : existing.lastSuccessTime
      
      // Determine health status
      let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (consecutiveFailures >= 5) {
        healthStatus = 'unhealthy'
      } else if (consecutiveFailures >= 2 || newAvgResponseTime > 5000) {
        healthStatus = 'degraded'
      }
      
      this.handlerUsage.set(handlerName, {
        ...existing,
        timestamp: now,
        success: success && existing.success, // Only true if both are true
        responseTime,
        errorCount: existing.errorCount + errorCount,
        totalCalls,
        lastCalled: now,
        avgResponseTime: newAvgResponseTime,
        consecutiveFailures,
        lastSuccessTime,
        healthStatus
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
        avgResponseTime: responseTime,
        consecutiveFailures: success ? 0 : 1,
        lastSuccessTime: success ? now : undefined,
        healthStatus: success ? 'healthy' : 'degraded'
      })
    }

    // Log handler usage for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[HANDLER-TRACKER] ${handlerName}: ${success ? 'SUCCESS' : 'FAILED'} (${responseTime}ms)`)
    }

    // Check for unhealthy handlers
    const handler = this.handlerUsage.get(handlerName)
    if (handler && handler.healthStatus === 'unhealthy') {
      this.triggerErrorPrevention('handler-unhealthy', `${handlerName} is unhealthy`)
    }

    this.persistData()
  }

  /**
   * Get handler usage statistics with health information
   */
  getHandlerUsage(handlerName?: string): HandlerUsage | HandlerUsage[] | null {
    if (handlerName) {
      return this.handlerUsage.get(handlerName) || null
    }
    return Array.from(this.handlerUsage.values())
  }

  /**
   * Get comprehensive handler analytics with health status
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
        handlerBreakdown: {},
        unhealthyHandlers: [],
        degradedHandlers: []
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

    const unhealthyHandlers = handlers
      .filter(h => h.healthStatus === 'unhealthy')
      .map(h => h.handlerName)

    const degradedHandlers = handlers
      .filter(h => h.healthStatus === 'degraded')
      .map(h => h.handlerName)

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
      handlerBreakdown,
      unhealthyHandlers,
      degradedHandlers
    }
  }

  /**
   * Get startup health checks
   */
  getStartupHealthChecks(): StartupHealthCheck[] {
    return [...this.startupHealthChecks]
  }

  /**
   * Get current build and session info
   */
  getBuildInfo(): { buildId: string; sessionId: string } {
    return {
      buildId: this.buildId,
      sessionId: this.sessionId
    }
  }

  /**
   * Get error prevention rules
   */
  getErrorPreventionRules(): ErrorPreventionRule[] {
    return [...this.errorPreventionRules]
  }

  /**
   * Update error prevention rule
   */
  updateErrorPreventionRule(ruleId: string, updates: Partial<ErrorPreventionRule>): boolean {
    const ruleIndex = this.errorPreventionRules.findIndex(rule => rule.id === ruleId)
    if (ruleIndex === -1) return false

    this.errorPreventionRules[ruleIndex] = {
      ...this.errorPreventionRules[ruleIndex],
      ...updates
    }
    return true
  }

  /**
   * Add a new error log with enhanced tracking
   */
  log(type: ErrorLog['type'], message: string, details?: unknown, stack?: string, severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'): void {
    const startTime = performance.now()
    
    // Check if error should be prevented
    if (this.shouldPreventError(message, type)) {
      return
    }

    // Check for recurring errors
    const recentErrors = this.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime()
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      return logTime > oneHourAgo && log.message === message
    })

    const isRecurring = recentErrors.length > 0
    const occurrenceCount = recentErrors.length + 1

    const log: ErrorLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      severity,
      recurring: isRecurring,
      occurrenceCount,
      lastOccurrence: new Date().toISOString(),
      buildId: this.buildId,
      sessionId: this.sessionId
    }

    this.logs.push(log)

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMessage = `[ERROR-LOGGER][${type.toUpperCase()}] ${message}`
      console.log(logMessage, details || '')
    }

    const responseTime = performance.now() - startTime
    this.trackHandlerUsage(`log-${type}`, true, responseTime)

    // Persist data
    this.persistData()

    // Trigger prevention for critical errors
    if (severity === 'critical') {
      this.triggerErrorPrevention('critical-error', message)
    }
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
  clearHandlerUsage(): void {
    this.handlerUsage.clear()
  }

  /**
   * Clear handler usage data
   */
  clearHandlers(): void {
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
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify({
      logs: this.logs,
      analytics: this.getHandlerAnalytics(),
      healthChecks: this.startupHealthChecks,
      buildInfo: this.getBuildInfo(),
      preventionRules: this.errorPreventionRules
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
      
      if (imported.handlerUsage) {
        imported.handlerUsage.forEach((handler: HandlerUsage) => {
          this.handlerUsage.set(handler.handlerName, handler)
        })
      }
      
      if (imported.healthChecks) {
        this.startupHealthChecks = [...this.startupHealthChecks, ...imported.healthChecks]
      }
      
      // Keep only the most recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs)
      }
      
      this.persistData()
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
    const reason = event.reason
    const message = reason?.message || reason?.toString() || 'Unknown rejection reason'
    
    // Determine severity based on error type
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
    let type: ErrorLog['type'] = 'network'
    
    if (message.includes('Internal Server Error') || message.includes('500')) {
      severity = 'critical'
      type = 'internal_server'
    } else if (message.includes('Network Error') || message.includes('Failed to fetch')) {
      severity = 'high'
      type = 'network'
    } else if (message.includes('unauthorized') || message.includes('401')) {
      severity = 'high'
      type = 'auth'
    }
    
    errorLogger.log(type, `Unhandled Promise Rejection: ${message}`, {
      reason: event.reason,
      promise: event.promise
    }, undefined, severity)
    
    const responseTime = performance.now() - startTime
    errorLogger.trackHandlerUsage('global-unhandled-rejection', true, responseTime)
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    const startTime = performance.now()
    const message = event.message || 'Unknown error'
    
    // Determine severity based on error type
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'medium'
    let type: ErrorLog['type'] = 'console'
    
    if (message.includes('Internal Server Error') || message.includes('500')) {
      severity = 'critical'
      type = 'internal_server'
    } else if (message.includes('Network Error') || message.includes('Failed to fetch')) {
      severity = 'high'
      type = 'network'
    } else if (message.includes('unauthorized') || message.includes('401')) {
      severity = 'high'
      type = 'auth'
    }
    
    errorLogger.log(type, `Global Error: ${message}`, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, event.error?.stack, severity)
    
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

// Export enhanced error tracking functions
export const getStartupHealthChecks = () => errorLogger.getStartupHealthChecks()
export const getBuildInfo = () => errorLogger.getBuildInfo()
export const getErrorPreventionRules = () => errorLogger.getErrorPreventionRules()
export const updateErrorPreventionRule = (ruleId: string, updates: Partial<ErrorPreventionRule>) => 
  errorLogger.updateErrorPreventionRule(ruleId, updates)

// Export convenience functions for new error types
export const logInternalServer = (message: string, details?: unknown, stack?: string, severity?: 'critical' | 'high' | 'medium' | 'low') => 
  errorLogger.log('internal_server', message, details, stack, severity || 'critical')

export const logStartup = (message: string, details?: unknown, stack?: string, severity?: 'critical' | 'high' | 'medium' | 'low') => 
  errorLogger.log('startup', message, details, stack, severity || 'high')

export const logHealthCheck = (message: string, details?: unknown, stack?: string, severity?: 'critical' | 'high' | 'medium' | 'low') => 
  errorLogger.log('health_check', message, details, stack, severity || 'medium')

// Make error logger available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).errorAnalysis = {
    getAnalysis: () => errorLogger.getStats(),
    getPatterns: () => errorLogger.getLogs().reduce((acc, log) => {
      const key = log.message
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    getFrequentErrors: () => {
      const patterns = (window as any).errorAnalysis.getPatterns()
      return Object.entries(patterns)
        .filter(([, count]) => (count as number) > 1)
        .sort(([, a], [, b]) => (b as number) - (a as number))
    },
    getRecentErrors: (count = 50) => errorLogger.getRecentLogs(count),
    clearLogs: () => errorLogger.clearLogs(),
    getHealthChecks: () => errorLogger.getStartupHealthChecks(),
    getBuildInfo: () => errorLogger.getBuildInfo(),
    getPreventionRules: () => errorLogger.getErrorPreventionRules(),
    getHandlerHealth: () => errorLogger.getHandlerAnalytics()
  }
}

