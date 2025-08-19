/**
 * Global Error Interceptor - Catches and logs all console errors for Cursor analysis
 */

import { logInternalServer, logReact, logNetwork } from './error-logger'

// Store original console methods
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

// Track if we're already in an error logging cycle to prevent infinite loops
let isLoggingError = false

/**
 * Intercept console.error calls
 */
function interceptConsoleError(...args: any[]) {
  if (isLoggingError) {
    // Prevent infinite recursion
    return originalConsoleError.apply(console, args)
  }

  try {
    isLoggingError = true
    
    const message = args.join(' ')
    const error = args.find(arg => arg instanceof Error)
    
    // Determine error context
    const stackTrace = error?.stack || new Error().stack || ''
    const context = analyzeErrorContext(message, stackTrace)
    
    // Log based on context
    if (context.type === 'registry') {
      logInternalServer(`Registry error in ${context.hook}: ${message}`, {
        hook: context.hook,
        action: context.action,
        error: error?.message || message
      }, error?.stack)
    } else if (context.type === 'hook') {
      logReact(`Hook error in ${context.hook}: ${message}`, {
        hook: context.hook,
        component: context.component,
        error: error?.message || message
      }, error?.stack)
    } else if (context.type === 'companies') {
      logInternalServer(`Companies page error in ${context.component}: ${message}`, {
        component: context.component,
        action: context.action,
        error: error?.message || message
      }, error?.stack)
    } else {
      // General error logging
      logInternalServer(`General error in ${context.component}: ${message}`, {
        component: context.component,
        action: context.action,
        error: error?.message || message
      }, error?.stack)
    }
    
  } catch {
    // If our error logging fails, just log the original error
    originalConsoleError.apply(console, args)
  } finally {
    isLoggingError = false
  }
  
  // Always call the original console.error
  originalConsoleError.apply(console, args)
}

/**
 * Analyze error context from message and stack trace
 */
function analyzeErrorContext(message: string, stackTrace: string): {
  type: 'registry' | 'hook' | 'companies' | 'general'
  component: string
  hook: string
  action: string
} {
  let type: 'registry' | 'hook' | 'companies' | 'general' = 'general'
  let component = 'unknown'
  let hook = 'unknown'
  let action = 'unknown'

  // Check for registry-related errors
  if (stackTrace.includes('use-version-registry') || message.includes('getStats') || message.includes('getRegistryStats')) {
    type = 'registry'
    hook = 'use-version-registry'
    action = 'registry-method-call'
  }
  
  // Check for hook-related errors
  else if (stackTrace.includes('use-') || message.includes('hook')) {
    type = 'hook'
    const hookMatch = stackTrace.match(/use-(\w+)/)
    hook = hookMatch ? hookMatch[1] : 'unknown-hook'
  }
  
  // Check for companies page errors
  else if (stackTrace.includes('companies') || stackTrace.includes('CompaniesPage')) {
    type = 'companies'
    component = 'CompaniesPage'
    action = 'page-render'
  }
  
  // Extract component name from stack trace
  const componentMatch = stackTrace.match(/at\s+(\w+)/)
  if (componentMatch) {
    component = componentMatch[1]
  }

  return { type, component, hook, action }
}

/**
 * Set up global error interception
 */
export function setupGlobalErrorInterceptor() {
  if (typeof window === 'undefined') return

  // Override console.error
  console.error = interceptConsoleError

  // Set up global error handlers
  window.addEventListener('error', (event) => {
    if (isLoggingError) return
    
    try {
      isLoggingError = true
      
      const context = analyzeErrorContext(event.message, event.error?.stack || '')
      
      if (context.type === 'registry') {
        logInternalServer(`Registry error in ${context.hook}: ${event.message}`, {
          hook: context.hook,
          action: context.action,
          error: event.error?.message || event.message
        }, event.error?.stack)
      } else if (context.type === 'hook') {
        logReact(`Hook error in ${context.hook}: ${event.message}`, {
          hook: context.hook,
          component: context.component,
          error: event.error?.message || event.message
        }, event.error?.stack)
      } else if (context.type === 'companies') {
        logInternalServer(`Companies page error in ${context.component}: ${event.message}`, {
          component: context.component,
          action: context.action,
          error: event.error?.message || event.message
        }, event.error?.stack)
      } else {
        logInternalServer(`General error in ${context.component}: ${event.message}`, {
          component: context.component,
          action: context.action,
          error: event.error?.message || event.message
        }, event.error?.stack)
      }
    } catch (interceptError) {
      originalConsoleError('Error in global error handler:', interceptError)
    } finally {
      isLoggingError = false
    }
  })

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isLoggingError) return
    
    try {
      isLoggingError = true
      
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      const context = analyzeErrorContext(error.message, error.stack || '')
      
      if (context.type === 'registry') {
        logInternalServer(`Registry error in ${context.hook}: ${error.message}`, {
          hook: context.hook,
          action: context.action,
          error: error.message
        }, error.stack)
      } else if (context.type === 'hook') {
        logReact(`Hook error in ${context.hook}: ${error.message}`, {
          hook: context.hook,
          component: context.component,
          error: error.message
        }, error.stack)
      } else if (context.type === 'companies') {
        logInternalServer(`Companies page error in ${context.component}: ${error.message}`, {
          component: context.component,
          action: context.action,
          error: error.message
        }, error.stack)
      } else {
        logInternalServer(`General error in ${context.component}: ${error.message}`, {
          component: context.component,
          action: context.action,
          error: error.message
        }, error.stack)
      }
    } catch (interceptError) {
      originalConsoleError('Error in unhandled rejection handler:', interceptError)
    } finally {
      isLoggingError = false
    }
  })

  // Log that interceptor is set up
  if (process.env.NODE_ENV === 'development') {
    originalConsoleError('[ERROR-INTERCEPTOR] Global error interceptor initialized')
  }
}

/**
 * Restore original console methods
 */
export function restoreConsoleMethods() {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
}
