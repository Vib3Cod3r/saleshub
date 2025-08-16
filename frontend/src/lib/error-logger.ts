interface ErrorLog {
  timestamp: string
  type: 'console' | 'network' | 'auth' | 'react' | 'nextjs'
  message: string
  stack?: string
  details?: any
  url?: string
  userAgent?: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100

  log(type: ErrorLog['type'], message: string, details?: any) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    this.logs.push(errorLog)
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`[${type.toUpperCase()}] ${message}`)
      console.log('Timestamp:', errorLog.timestamp)
      console.log('URL:', errorLog.url)
      if (details) {
        console.log('Details:', details)
      }
      console.groupEnd()
    }

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('error-logs', JSON.stringify(this.logs))
      } catch (e) {
        console.warn('Failed to store error logs in localStorage:', e)
      }
    }
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('error-logs')
    }
  }

  // Load logs from localStorage on initialization
  loadPersistedLogs() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('error-logs')
        if (stored) {
          this.logs = JSON.parse(stored)
        }
      } catch (e) {
        console.warn('Failed to load persisted error logs:', e)
      }
    }
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Create a singleton instance
export const errorLogger = new ErrorLogger()

// Log the specific TypeError that occurred
errorLogger.log('console', 'TypeError: data.data is undefined', {
  location: 'src/hooks/use-auth.ts:80',
  issue: 'API response structure mismatch - expected data.data but received direct structure',
  fix: 'Updated to handle both { token, user } and { data: { token, user } } structures',
  timestamp: new Date().toISOString(),
  stack: 'login function at src/hooks/use-auth.ts (80:41)'
})

// Initialize by loading persisted logs
if (typeof window !== 'undefined') {
  errorLogger.loadPersistedLogs()
}

// Patch console.error to capture errors
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error
  console.error = (...args: any[]) => {
    // Call the original console.error
    originalConsoleError.apply(console, args)
    
    // Log to our error logger
    const message = args.map(arg => 
      typeof arg === 'string' ? arg : 
      arg instanceof Error ? arg.message : 
      JSON.stringify(arg)
    ).join(' ')
    
    errorLogger.log('console', message, {
      originalArgs: args,
      stack: args.find(arg => arg instanceof Error)?.stack
    })
  }
}

// Patch fetch to capture network errors
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args)
      
      // Log failed requests
      if (!response.ok) {
        errorLogger.log('network', `HTTP ${response.status}: ${response.statusText}`, {
          url: args[0],
          status: response.status,
          statusText: response.statusText
        })
      }
      
      return response
    } catch (error) {
      errorLogger.log('network', `Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        url: args[0],
        error: error instanceof Error ? error.message : error
      })
      throw error
    }
  }
}

export default errorLogger
