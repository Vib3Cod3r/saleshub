import { useEffect, useRef, useCallback } from 'react'
import { pageLogger } from '@/lib/page-logger'

interface UsePageLoggerOptions {
  pageId: string
  pageName: string
  pagePath: string
  version: string
  features?: string[]
  dependencies?: string[]
  autoRegister?: boolean
  trackPerformance?: boolean
  trackErrors?: boolean
}

interface PageLoggerReturn {
  logAction: (action: string, details?: Record<string, any>) => void
  logError: (error: Error | string, context?: Record<string, any>) => void
  logPerformance: (metrics: { loadTime: number; renderTime: number; totalTime: number }) => void
  getPageVersion: () => any
  getPageLogs: (limit?: number) => any[]
}

export function usePageLogger(options: UsePageLoggerOptions): PageLoggerReturn {
  const {
    pageId,
    pageName,
    pagePath,
    version,
    features = [],
    dependencies = [],
    autoRegister = true,
    trackPerformance = true,
    trackErrors = true
  } = options

  const startTime = useRef<number>(Date.now())
  const loadTime = useRef<number>(0)
  const renderTime = useRef<number>(0)

  // Register page on mount
  useEffect(() => {
    if (autoRegister) {
      const checksum = generateChecksum(pageName + version + JSON.stringify(features))
      
      pageLogger.registerPage({
        id: pageId,
        name: pageName,
        path: pagePath,
        version,
        checksum,
        dependencies,
        features,
        status: 'active',
        metadata: {
          registeredAt: new Date().toISOString(),
          features,
          dependencies
        }
      })
    }

    // Log page load
    pageLogger.logPageAction('load', {
      pageId,
      pageName,
      pagePath,
      version,
      details: { action: 'mount', features }
    })

    // Track load time
    if (trackPerformance) {
      loadTime.current = Date.now() - startTime.current
    }
  }, [pageId, pageName, pagePath, version, features, dependencies, autoRegister, trackPerformance])

  // Track render time
  useEffect(() => {
    if (trackPerformance) {
      renderTime.current = Date.now() - startTime.current
      
      // Safely call logPerformance if it exists
      if (typeof pageLogger.logPerformance === 'function') {
        pageLogger.logPerformance({
          loadTime: loadTime.current,
          renderTime: renderTime.current,
          totalTime: Date.now() - startTime.current
        })
      }
    }
  }, [trackPerformance])

  // Error boundary integration
  useEffect(() => {
    if (!trackErrors) return

    const handleError = (event: ErrorEvent) => {
      pageLogger.logPageAction('error', {
        pageId,
        pageName,
        pagePath,
        version,
        errors: [event.error?.message || event.message || 'Unknown error'],
        details: {
          errorType: 'unhandled',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      pageLogger.logPageAction('error', {
        pageId,
        pageName,
        pagePath,
        version,
        errors: [event.reason?.message || 'Unhandled promise rejection'],
        details: {
          errorType: 'unhandledRejection',
          reason: event.reason
        }
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [pageId, pageName, pagePath, version, trackErrors])

  const logAction = useCallback((action: string, details?: Record<string, any>) => {
    pageLogger.logPageAction('navigate', {
      pageId,
      pageName,
      pagePath,
      version,
      details: { action, ...details }
    })
  }, [pageId, pageName, pagePath, version])

  const logError = useCallback((error: Error | string, context?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message
    
    pageLogger.logPageAction('error', {
      pageId,
      pageName,
      pagePath,
      version,
      errors: [errorMessage],
      details: {
        errorType: 'handled',
        context,
        stack: error instanceof Error ? error.stack : undefined
      }
    })
  }, [pageId, pageName, pagePath, version])

  const logPerformance = useCallback((metrics: { loadTime: number; renderTime: number; totalTime: number }) => {
    pageLogger.logPageAction('load', {
      pageId,
      pageName,
      pagePath,
      version,
      performance: metrics,
      details: { action: 'performance' }
    })
    
    // Also call the dedicated logPerformance method if it exists
    if (typeof pageLogger.logPerformance === 'function') {
      pageLogger.logPerformance(metrics)
    }
  }, [pageId, pageName, pagePath, version])

  const getPageVersion = useCallback(() => {
    return pageLogger.getPageVersion(pageId)
  }, [pageId])

  const getPageLogs = useCallback((limit: number = 50) => {
    return pageLogger.getPageLogs(pageId, limit)
  }, [pageId])

  return {
    logAction,
    logError,
    logPerformance,
    getPageVersion,
    getPageLogs
  }
}

// Utility function to generate a simple checksum
function generateChecksum(str: string): string {
  let hash = 0
  if (str.length === 0) return hash.toString()
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

export default usePageLogger
