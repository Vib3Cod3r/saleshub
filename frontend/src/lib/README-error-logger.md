# Enhanced Error Logger with Handler Tracking

This enhanced error logger provides comprehensive error logging and handler performance tracking for the Sales CRM application.

## Features

### Error Logging
- **Multiple Error Types**: Console, Network, Auth, React, and Next.js errors
- **Rich Context**: Includes timestamp, URL, user agent, and stack traces
- **Memory Management**: Configurable log retention with automatic cleanup
- **Development Support**: Enhanced console logging in development mode

### Handler Tracking
- **Performance Monitoring**: Track response times and success rates
- **Usage Analytics**: Comprehensive statistics on handler usage
- **Error Counting**: Track error rates per handler
- **Export/Import**: Save and restore handler usage data

## Usage

### Basic Error Logging

```typescript
import { logConsole, logNetwork, logAuth, logReact, logNextJS } from '@/lib/error-logger'

// Log different types of errors
logConsole('User action failed', { userId: 123, action: 'save' })
logNetwork('API request failed', { endpoint: '/api/users', status: 500 })
logAuth('Authentication failed', { reason: 'expired_token' })
logReact('Component error', { component: 'UserProfile' }, error.stack)
logNextJS('Page error', { page: '/dashboard' })
```

### Handler Performance Tracking

```typescript
import { trackHandlerUsage } from '@/lib/error-logger'

// Track handler performance
const startTime = performance.now()

try {
  // Your handler logic here
  const result = await someAsyncOperation()
  
  const responseTime = performance.now() - startTime
  trackHandlerUsage('api-user-fetch', true, responseTime)
  
  return result
} catch (error) {
  const responseTime = performance.now() - startTime
  trackHandlerUsage('api-user-fetch', false, responseTime, 1)
  
  throw error
}
```

### Analytics and Monitoring

```typescript
import { 
  getHandlerAnalytics, 
  getHandlerUsage,
  getStats 
} from '@/lib/error-logger'

// Get comprehensive analytics
const analytics = getHandlerAnalytics()
console.log('Total handlers:', analytics.totalHandlers)
console.log('Success rate:', analytics.successRate)
console.log('Most used handler:', analytics.mostUsedHandler)
console.log('Slowest handler:', analytics.slowestHandler)

// Get specific handler stats
const handlerStats = getHandlerUsage('api-user-fetch')
if (handlerStats) {
  console.log('Total calls:', handlerStats.totalCalls)
  console.log('Average response time:', handlerStats.avgResponseTime)
  console.log('Error count:', handlerStats.errorCount)
}

// Get overall statistics
const stats = getStats()
console.log('Total logs:', stats.total)
console.log('Handler stats:', stats.handlerStats)
```

### Data Management

```typescript
import { 
  exportHandlerUsage, 
  importHandlerUsage,
  clearHandlerUsage 
} from '@/lib/error-logger'

// Export handler usage data
const data = exportHandlerUsage()
// Save to file or send to server

// Import handler usage data
importHandlerUsage(data)

// Clear all handler data
clearHandlerUsage()
```

## API Reference

### Error Logging Functions

- `logConsole(message, details?, stack?)` - Log console errors
- `logNetwork(message, details?)` - Log network errors  
- `logAuth(message, details?)` - Log authentication errors
- `logReact(message, details?, stack?)` - Log React errors
- `logNextJS(message, details?)` - Log Next.js errors

### Handler Tracking Functions

- `trackHandlerUsage(handlerName, success, responseTime, errorCount?)` - Track handler performance
- `getHandlerUsage(handlerName?)` - Get handler usage statistics
- `getHandlerAnalytics()` - Get comprehensive analytics
- `clearHandlerUsage()` - Clear all handler data
- `exportHandlerUsage()` - Export handler data as JSON
- `importHandlerUsage(data)` - Import handler data from JSON

### Utility Functions

- `getLogs()` - Get all error logs
- `getLogsByType(type)` - Get logs by error type
- `getRecentLogs(count)` - Get recent logs
- `clearLogs()` - Clear all logs
- `exportLogs()` - Export all logs
- `importLogs(data)` - Import logs
- `getStats()` - Get comprehensive statistics

## Data Structures

### ErrorLog Interface
```typescript
interface ErrorLog {
  timestamp: string
  type: 'console' | 'network' | 'auth' | 'react' | 'nextjs'
  message: string
  stack?: string
  details?: unknown
  url?: string
  userAgent?: string
}
```

### HandlerUsage Interface
```typescript
interface HandlerUsage {
  handlerName: string
  timestamp: string
  success: boolean
  responseTime: number
  errorCount: number
  totalCalls: number
  lastCalled: string
  avgResponseTime: number
}
```

### HandlerAnalytics Interface
```typescript
interface HandlerAnalytics {
  totalHandlers: number
  totalCalls: number
  successRate: number
  avgResponseTime: number
  mostUsedHandler: string
  slowestHandler: string
  handlerBreakdown: Record<string, HandlerUsage>
}
```

## Global Error Handlers

The error logger automatically sets up global error handlers:

1. **Unhandled Promise Rejections** - Tracks unhandled promise rejections
2. **Global Errors** - Tracks JavaScript runtime errors
3. **Console Error Override** - Intercepts console.error calls (production only)

## Development vs Production

- **Development**: Enhanced console logging with handler tracking visibility
- **Production**: Console error interception with recursion protection

## Best Practices

1. **Use Descriptive Handler Names**: Use clear, consistent naming for handlers
2. **Track All Async Operations**: Wrap async operations with performance tracking
3. **Monitor Error Rates**: Set up alerts for high error rates
4. **Export Data Regularly**: Export handler usage data for analysis
5. **Clean Up Old Data**: Clear old data periodically to prevent memory issues

## Example Integration

```typescript
// In your API service
export class UserService {
  async fetchUser(id: number) {
    const startTime = performance.now()
    
    try {
      const response = await fetch(`/api/users/${id}`)
      const user = await response.json()
      
      const responseTime = performance.now() - startTime
      trackHandlerUsage('user-service-fetch', true, responseTime)
      
      return user
    } catch (error) {
      const responseTime = performance.now() - startTime
      trackHandlerUsage('user-service-fetch', false, responseTime, 1)
      
      logNetwork('Failed to fetch user', { userId: id, error: error.message })
      throw error
    }
  }
}
```

This enhanced error logger provides comprehensive monitoring and analytics for your application's error handling and performance tracking needs.
