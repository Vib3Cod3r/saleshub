/**
 * Cursor Error Tracker - Specialized logging for Cursor AI analysis
 * This system tracks errors with detailed context to help Cursor understand patterns
 * and make informed decisions about code changes.
 */

export interface CursorErrorLog {
  id: string
  timestamp: string
  errorType: 'runtime' | 'api' | 'component' | 'hook' | 'registry' | 'network' | 'auth'
  severity: 'critical' | 'high' | 'medium' | 'low'
  message: string
  stackTrace: string
  componentStack?: string
  context: {
    page: string
    component: string
    hook?: string
    action?: string
    userAgent: string
    url: string
    timestamp: string
  }
  metadata: {
    errorCount: number
    firstOccurrence: string
    lastOccurrence: string
    frequency: 'first-time' | 'recurring' | 'frequent'
    relatedErrors: string[]
    suggestedFixes: string[]
    cursorAnalysis: {
      patternDetected: boolean
      patternType?: string
      confidence: number
      recommendedAction?: string
    }
  }
  technicalDetails: {
    errorCode?: string
    errorName: string
    lineNumber?: number
    columnNumber?: number
    fileName?: string
    functionName?: string
  }
}

export interface ErrorPattern {
  id: string
  pattern: string
  occurrences: number
  firstSeen: string
  lastSeen: string
  affectedComponents: string[]
  suggestedSolutions: string[]
  cursorRecommendations: string[]
}

class CursorErrorTracker {
  private errorLogs: CursorErrorLog[] = []
  private errorPatterns: Map<string, ErrorPattern> = new Map()
  private maxLogs = 1000
  private patterns: Map<string, number> = new Map()

  /**
   * Log an error with comprehensive context for Cursor analysis
   */
  logError(
    error: Error | string,
    context: {
      page: string
      component: string
      hook?: string
      action?: string
    },
    errorType: CursorErrorLog['errorType'] = 'runtime'
  ): string {
    const errorId = this.generateErrorId()
    const timestamp = new Date().toISOString()
    const errorMessage = typeof error === 'string' ? error : error.message
    const stackTrace = error instanceof Error ? error.stack || '' : ''
    
    // Analyze error pattern
    const pattern = this.analyzeErrorPattern(errorMessage, stackTrace)
    const patternId = this.getPatternId(pattern)
    
    // Check if this is a recurring error
    const existingPattern = this.errorPatterns.get(patternId)
    const frequency = existingPattern ? 
      (existingPattern.occurrences > 5 ? 'frequent' : 'recurring') : 
      'first-time'

    // Get technical details
    const technicalDetails = this.extractTechnicalDetails(error, stackTrace)

    // Create error log
    const errorLog: CursorErrorLog = {
      id: errorId,
      timestamp,
      errorType,
      severity: this.calculateSeverity(errorMessage, errorType),
      message: errorMessage,
      stackTrace,
      componentStack: this.getComponentStack(),
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp
      },
      metadata: {
        errorCount: existingPattern ? existingPattern.occurrences + 1 : 1,
        firstOccurrence: existingPattern ? existingPattern.firstSeen : timestamp,
        lastOccurrence: timestamp,
        frequency,
        relatedErrors: this.findRelatedErrors(patternId),
        suggestedFixes: this.generateSuggestedFixes(errorMessage, errorType, pattern),
        cursorAnalysis: this.analyzeForCursor(errorMessage, pattern, frequency)
      },
      technicalDetails
    }

    this.errorLogs.push(errorLog)
    this.updateErrorPattern(patternId, pattern, errorLog)
    this.cleanupOldLogs()

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[CURSOR-ERROR-TRACKER] ${errorType.toUpperCase()}: ${errorMessage}`, {
        id: errorId,
        pattern: patternId,
        frequency,
        severity: errorLog.severity
      })
    }

    return errorId
  }

  /**
   * Track specific companies page errors
   */
  logCompaniesPageError(error: Error | string, component: string, action?: string): string {
    return this.logError(error, {
      page: 'companies',
      component,
      action
    }, 'component')
  }

  /**
   * Track registry-related errors
   */
  logRegistryError(error: Error | string, hook: string, action?: string): string {
    return this.logError(error, {
      page: 'registry',
      component: 'VersionRegistry',
      hook,
      action
    }, 'registry')
  }

  /**
   * Track hook-related errors
   */
  logHookError(error: Error | string, hook: string, component: string): string {
    return this.logError(error, {
      page: 'hooks',
      component,
      hook
    }, 'hook')
  }

  /**
   * Get error patterns for Cursor analysis
   */
  getErrorPatterns(): ErrorPattern[] {
    return Array.from(this.errorPatterns.values())
  }

  /**
   * Get recent errors for analysis
   */
  getRecentErrors(count: number = 50): CursorErrorLog[] {
    return this.errorLogs.slice(-count)
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: CursorErrorLog['errorType']): CursorErrorLog[] {
    return this.errorLogs.filter(log => log.errorType === type)
  }

  /**
   * Get errors by component
   */
  getErrorsByComponent(component: string): CursorErrorLog[] {
    return this.errorLogs.filter(log => log.context.component === component)
  }

  /**
   * Get errors by page
   */
  getErrorsByPage(page: string): CursorErrorLog[] {
    return this.errorLogs.filter(log => log.context.page === page)
  }

  /**
   * Get frequent errors (occurring more than 3 times)
   */
  getFrequentErrors(): CursorErrorLog[] {
    return this.errorLogs.filter(log => log.metadata.frequency === 'frequent')
  }

  /**
   * Export error data for Cursor analysis
   */
  exportForCursor(): string {
    const analysis = {
      summary: {
        totalErrors: this.errorLogs.length,
        errorPatterns: this.errorPatterns.size,
        frequentErrors: this.getFrequentErrors().length,
        recentErrors: this.getRecentErrors(10).length
      },
      patterns: this.getErrorPatterns(),
      recentErrors: this.getRecentErrors(20),
      frequentErrors: this.getFrequentErrors(),
      recommendations: this.generateCursorRecommendations()
    }

    return JSON.stringify(analysis, null, 2)
  }

  /**
   * Generate recommendations for Cursor
   */
  private generateCursorRecommendations(): string[] {
    const recommendations: string[] = []
    const frequentErrors = this.getFrequentErrors()
    const patterns = this.getErrorPatterns()

    // Analyze patterns
    patterns.forEach(pattern => {
      if (pattern.occurrences > 3) {
        recommendations.push(
          `Pattern "${pattern.pattern}" has occurred ${pattern.occurrences} times. ` +
          `Consider implementing: ${pattern.suggestedSolutions.join(', ')}`
        )
      }
    })

    // Analyze component-specific issues
    const componentErrors = this.errorLogs.reduce((acc, log) => {
      acc[log.context.component] = (acc[log.context.component] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(componentErrors)
      .filter(([_, count]) => count > 2)
      .forEach(([component, count]) => {
        recommendations.push(
          `Component "${component}" has ${count} errors. Consider refactoring or adding error boundaries.`
        )
      })

    return recommendations
  }

  /**
   * Analyze error pattern for Cursor
   */
  private analyzeErrorPattern(message: string, stackTrace: string): string {
    // Extract key identifiers from error
    const keyParts = [
      message.split(':')[0], // Error type
      message.includes('is not a function') ? 'function-not-found' : '',
      message.includes('Cannot read property') ? 'property-access' : '',
      message.includes('Unexpected token') ? 'syntax-error' : '',
      stackTrace.includes('use-version-registry') ? 'version-registry' : '',
      stackTrace.includes('companies') ? 'companies-page' : ''
    ].filter(Boolean)

    return keyParts.join('|')
  }

  /**
   * Generate pattern ID
   */
  private getPatternId(pattern: string): string {
    return btoa(pattern).replace(/[^a-zA-Z0-9]/g, '')
  }

  /**
   * Update error pattern tracking
   */
  private updateErrorPattern(patternId: string, pattern: string, errorLog: CursorErrorLog): void {
    const existing = this.errorPatterns.get(patternId)
    
    if (existing) {
      existing.occurrences += 1
      existing.lastSeen = errorLog.timestamp
      if (!existing.affectedComponents.includes(errorLog.context.component)) {
        existing.affectedComponents.push(errorLog.context.component)
      }
    } else {
      this.errorPatterns.set(patternId, {
        id: patternId,
        pattern,
        occurrences: 1,
        firstSeen: errorLog.timestamp,
        lastSeen: errorLog.timestamp,
        affectedComponents: [errorLog.context.component],
        suggestedSolutions: this.generateSuggestedFixes(errorLog.message, errorLog.errorType, pattern),
        cursorRecommendations: this.generateCursorRecommendations()
      })
    }
  }

  /**
   * Calculate error severity
   */
  private calculateSeverity(message: string, type: CursorErrorLog['errorType']): CursorErrorLog['severity'] {
    if (message.includes('Cannot read property') || message.includes('is not a function')) {
      return 'critical'
    }
    if (type === 'registry' || type === 'hook') {
      return 'high'
    }
    if (type === 'component') {
      return 'medium'
    }
    return 'low'
  }

  /**
   * Extract technical details from error
   */
  private extractTechnicalDetails(error: Error | string, stackTrace: string): CursorErrorLog['technicalDetails'] {
    if (error instanceof Error) {
      return {
        errorName: error.name,
        errorCode: (error as any).code,
        lineNumber: (error as any).lineNumber,
        columnNumber: (error as any).columnNumber,
        fileName: (error as any).fileName,
        functionName: this.extractFunctionName(stackTrace)
      }
    }
    
    return {
      errorName: 'StringError',
      functionName: this.extractFunctionName(stackTrace)
    }
  }

  /**
   * Extract function name from stack trace
   */
  private extractFunctionName(stackTrace: string): string | undefined {
    const match = stackTrace.match(/at\s+(\w+)/)
    return match ? match[1] : undefined
  }

  /**
   * Get component stack for React errors
   */
  private getComponentStack(): string | undefined {
    // This would be populated by React error boundaries
    return undefined
  }

  /**
   * Find related errors
   */
  private findRelatedErrors(patternId: string): string[] {
    const pattern = this.errorPatterns.get(patternId)
    if (!pattern) return []
    
    return this.errorLogs
      .filter(log => log.metadata.frequency !== 'first-time')
      .slice(-5)
      .map(log => log.id)
  }

  /**
   * Generate suggested fixes
   */
  private generateSuggestedFixes(message: string, type: CursorErrorLog['errorType'], pattern: string): string[] {
    const fixes: string[] = []

    if (message.includes('is not a function')) {
      fixes.push('Check method name spelling and ensure method exists in the object')
      fixes.push('Verify the object is properly initialized before calling methods')
      fixes.push('Add null/undefined checks before method calls')
    }

    if (message.includes('Cannot read property')) {
      fixes.push('Add null/undefined checks before property access')
      fixes.push('Use optional chaining (?.) for safe property access')
      fixes.push('Ensure object is properly initialized')
    }

    if (type === 'registry') {
      fixes.push('Verify version registry is properly initialized')
      fixes.push('Check method names in version registry implementation')
      fixes.push('Add error boundaries around registry usage')
    }

    if (type === 'hook') {
      fixes.push('Check hook dependencies and ensure they are stable')
      fixes.push('Verify hook is called at the top level of component')
      fixes.push('Add error boundaries around hook usage')
    }

    return fixes
  }

  /**
   * Analyze error for Cursor recommendations
   */
  private analyzeForCursor(message: string, pattern: string, frequency: string): CursorErrorLog['metadata']['cursorAnalysis'] {
    const analysis = {
      patternDetected: frequency !== 'first-time',
      patternType: this.detectPatternType(message, pattern),
      confidence: this.calculateConfidence(frequency, pattern),
      recommendedAction: this.getRecommendedAction(message, frequency)
    }

    return analysis
  }

  /**
   * Detect pattern type
   */
  private detectPatternType(message: string, pattern: string): string | undefined {
    if (message.includes('is not a function')) return 'method-not-found'
    if (message.includes('Cannot read property')) return 'property-access'
    if (pattern.includes('version-registry')) return 'registry-issue'
    if (pattern.includes('companies-page')) return 'page-specific'
    return undefined
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(frequency: string, pattern: string): number {
    let confidence = 0.5
    
    if (frequency === 'frequent') confidence += 0.3
    if (frequency === 'recurring') confidence += 0.2
    if (pattern.includes('version-registry')) confidence += 0.1
    if (pattern.includes('companies-page')) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  /**
   * Get recommended action for Cursor
   */
  private getRecommendedAction(message: string, frequency: string): string | undefined {
    if (frequency === 'frequent') {
      return 'High priority: This error occurs frequently and needs immediate attention'
    }
    if (frequency === 'recurring') {
      return 'Medium priority: This error has occurred multiple times and should be investigated'
    }
    if (message.includes('is not a function')) {
      return 'Check method implementation and ensure proper object initialization'
    }
    return undefined
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Clean up old logs
   */
  private cleanupOldLogs(): void {
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs)
    }
  }

  /**
   * Clear all logs (for testing)
   */
  clearLogs(): void {
    this.errorLogs = []
    this.errorPatterns.clear()
    this.patterns.clear()
  }
}

// Create singleton instance
export const cursorErrorTracker = new CursorErrorTracker()

// Export convenience functions
export const logCompaniesError = (error: Error | string, component: string, action?: string) =>
  cursorErrorTracker.logCompaniesPageError(error, component, action)

export const logRegistryError = (error: Error | string, hook: string, action?: string) =>
  cursorErrorTracker.logRegistryError(error, hook, action)

export const logHookError = (error: Error | string, hook: string, component: string) =>
  cursorErrorTracker.logHookError(error, hook, component)

export const getCursorErrorAnalysis = () => cursorErrorTracker.exportForCursor()

export const getErrorPatterns = () => cursorErrorTracker.getErrorPatterns()

export const getFrequentErrors = () => cursorErrorTracker.getFrequentErrors()
