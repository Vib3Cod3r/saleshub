# Page Version Logging System Guide

## Overview

The Page Version Logging System is a comprehensive solution for tracking page versions, performance metrics, and user activity across your Sales CRM application. This system helps you understand which versions of pages are being used, identify issues before restarting the application, and maintain a clear audit trail of page changes.

## Features

### Frontend (Next.js/React)
- **Automatic Page Registration**: Pages are automatically registered with version information
- **Performance Tracking**: Load times, render times, and total performance metrics
- **Error Logging**: Automatic capture of JavaScript errors and API failures
- **User Activity Tracking**: Navigation patterns and user interactions
- **Real-time Monitoring**: Live dashboard for page version management
- **Data Persistence**: Local storage for offline access and data retention

### Backend (Go)
- **API Endpoint Tracking**: Monitor all API endpoints and their versions
- **Performance Metrics**: Response times, request/response sizes, status codes
- **Error Monitoring**: Server-side error tracking and analysis
- **File-based Persistence**: JSON files for data storage and backup
- **Thread-safe Operations**: Concurrent access support with mutex protection

## Quick Start

### 1. Frontend Integration

#### Basic Page Integration
```typescript
import { usePageLogger } from '@/hooks/use-page-logger'

export default function MyPage() {
  const { logAction, logError, logPerformance } = usePageLogger({
    pageId: 'my_page',
    pageName: 'My Page',
    pagePath: '/my-page',
    version: '1.0.0',
    features: ['feature1', 'feature2'],
    dependencies: ['react', 'nextjs'],
    trackPerformance: true,
    trackErrors: true
  })

  // Your component logic here
}
```

#### Manual Logging
```typescript
import { pageLogger } from '@/lib/page-logger'

// Log a custom action
pageLogger.logPageAction('custom_action', {
  pageId: 'my_page',
  pageName: 'My Page',
  pagePath: '/my-page',
  version: '1.0.0',
  details: { action: 'user_click', button: 'submit' }
})

// Log an error
pageLogger.logPageAction('error', {
  pageId: 'my_page',
  pageName: 'My Page',
  pagePath: '/my-page',
  version: '1.0.0',
  errors: ['API call failed'],
  details: { errorType: 'network', statusCode: 500 }
})
```

### 2. Backend Integration

#### Initialize Page Logger
```go
package main

import (
    "your-project/lib"
)

func main() {
    // Initialize the page logger
    lib.InitPageLogger()
    
    // Your server setup
}
```

#### Register API Endpoints
```go
func registerEndpoints() {
    // Register a new endpoint
    lib.GlobalPageLogger.RegisterPage(lib.PageVersion{
        ID:           "companies_list",
        Name:         "Companies List",
        Path:         "/api/crm/companies",
        Method:       "GET",
        Version:      "1.2.0",
        Checksum:     lib.GenerateChecksum("companies_list_v1.2.0"),
        Dependencies: []string{"gorm", "jwt"},
        Features:     []string{"pagination", "filtering", "sorting"},
        Status:       "active",
        Metadata: map[string]interface{}{
            "rateLimit": 100,
            "auth":      true,
        },
    })
}
```

#### Log API Access
```go
func companiesHandler(w http.ResponseWriter, r *http.Request) {
    start := time.Now()
    
    // Your handler logic here
    
    // Log the access
    lib.GlobalPageLogger.LogPageAction("access", lib.PageLog{
        PageID:   "companies_list",
        PageName: "Companies List",
        PagePath: "/api/crm/companies",
        Method:   "GET",
        Version:  "1.2.0",
        UserAgent: r.UserAgent(),
        IPAddress: r.RemoteAddr,
        Performance: &lib.PerformanceMetrics{
            ResponseTime: time.Since(start).Milliseconds(),
            StatusCode:   http.StatusOK,
        },
    })
}
```

## Page Version Manager

### Accessing the Manager
1. Navigate to any page with the logging system integrated
2. Click the "Versions" button in the header
3. The Page Version Manager will open with comprehensive information

### Overview Tab
- **Active Pages**: Currently active pages with their versions
- **Deprecated Pages**: Pages marked for deprecation
- **Recent Activity**: Latest page accesses and actions
- **Issues**: Recommendations for restart planning

### Pages Tab
- **Active Pages**: Detailed view of all active pages
- **Deprecated Pages**: Pages that should be migrated
- **Features**: List of features implemented in each page
- **Dependencies**: Technical dependencies for each page

### Logs Tab
- **Recent Logs**: Detailed activity logs
- **Error Logs**: Pages with recent errors
- **Performance Logs**: Slow-loading pages
- **Filter Options**: Filter by page, action type, or time range

### Export Tab
- **Export Data**: Download all page versions and logs as JSON
- **Restart Report**: Generate a comprehensive restart planning report
- **Backup**: Create backups of the logging data

## Restart Planning

### Before Restart
1. **Open Page Version Manager**
2. **Review Active Pages**: Ensure all active pages are accounted for
3. **Check Deprecated Pages**: Verify deprecated pages are properly migrated
4. **Review Recent Activity**: Identify pages with recent issues
5. **Export Data**: Create a backup of current state

### Restart Report Analysis
The system automatically generates recommendations:

- **Pages with Errors**: Pages that had recent errors
- **Deprecated Page Access**: Still-accessed deprecated pages
- **Performance Issues**: Pages with slow response times
- **Version Conflicts**: Inconsistent version information

### Post-Restart Verification
1. **Check Page Versions**: Verify all pages are running correct versions
2. **Monitor Performance**: Watch for performance regressions
3. **Review Error Logs**: Ensure no new errors are introduced
4. **Validate Features**: Confirm all features are working

## Configuration

### Frontend Configuration
```typescript
// In your page component
const pageLoggerConfig = {
  pageId: 'unique_page_id',
  pageName: 'Human Readable Name',
  pagePath: '/actual/path',
  version: '1.0.0',
  features: ['feature1', 'feature2'],
  dependencies: ['react', 'nextjs'],
  autoRegister: true,        // Auto-register on mount
  trackPerformance: true,    // Track load/render times
  trackErrors: true          // Track JavaScript errors
}
```

### Backend Configuration
```go
// Environment variables
ENV=development              // Enable development logging
LOG_LEVEL=info              // Logging verbosity
PAGE_LOGGER_MAX_LOGS=1000   // Maximum log entries to keep
```

## Best Practices

### Version Management
1. **Semantic Versioning**: Use semantic versioning (MAJOR.MINOR.PATCH)
2. **Feature Documentation**: Document all features in the features array
3. **Dependency Tracking**: Keep dependencies list updated
4. **Status Updates**: Mark pages as deprecated when appropriate

### Performance Monitoring
1. **Set Thresholds**: Define acceptable performance thresholds
2. **Monitor Trends**: Watch for performance degradation over time
3. **Optimize Slow Pages**: Address pages with poor performance
4. **Track User Impact**: Monitor how performance affects user experience

### Error Handling
1. **Categorize Errors**: Use meaningful error categories
2. **Include Context**: Provide relevant context for debugging
3. **Track Frequency**: Monitor error frequency and patterns
4. **Set Alerts**: Configure alerts for critical errors

### Data Management
1. **Regular Exports**: Export data regularly for backup
2. **Clean Old Logs**: Clear old logs to prevent storage issues
3. **Archive Important Data**: Archive important version information
4. **Monitor Storage**: Keep track of log file sizes

## Troubleshooting

### Common Issues

#### Page Not Registering
- Check that `autoRegister` is set to `true`
- Verify the page component is using the `usePageLogger` hook
- Check browser console for errors

#### Performance Data Missing
- Ensure `trackPerformance` is enabled
- Check that the page is properly mounted
- Verify timing functions are working

#### Backend Logs Not Persisting
- Check file permissions for the logs directory
- Verify the logs directory exists
- Check for disk space issues

#### Version Manager Not Opening
- Ensure the PageVersionManager component is imported
- Check that the modal state is properly managed
- Verify no JavaScript errors in console

### Debug Mode
Enable debug mode for detailed logging:

```typescript
// Frontend
if (process.env.NODE_ENV === 'development') {
  // Debug logging is automatic
}

// Backend
ENV=development
```

## API Reference

### Frontend API

#### usePageLogger Hook
```typescript
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
```

#### pageLogger Object
```typescript
// Methods
pageLogger.registerPage(page: PageVersion): void
pageLogger.logPageAction(action: string, data: PageLogData): void
pageLogger.getPageVersions(): PageVersion[]
pageLogger.getPageVersion(pageId: string): PageVersion | undefined
pageLogger.getRecentLogs(limit?: number): PageLog[]
pageLogger.generateRestartReport(): RestartReport
pageLogger.exportData(): string
pageLogger.clearLogs(): void
pageLogger.clearAll(): void
```

### Backend API

#### PageLogger Methods
```go
// Core methods
func (pl *PageLogger) RegisterPage(page PageVersion)
func (pl *PageLogger) LogPageAction(action string, logEntry PageLog)
func (pl *PageLogger) GetPageVersions() []PageVersion
func (pl *PageLogger) GetPageVersion(pageID string) (PageVersion, bool)
func (pl *PageLogger) GetRecentLogs(limit int) []PageLog
func (pl *PageLogger) GenerateRestartReport() RestartReport
func (pl *PageLogger) ExportData() ([]byte, error)
func (pl *PageLogger) ClearLogs()
func (pl *PageLogger) ClearAll()
```

## Migration Guide

### From No Logging System
1. **Install Dependencies**: Ensure all required packages are installed
2. **Initialize Backend**: Add page logger initialization to your main function
3. **Update Pages**: Add `usePageLogger` hook to your page components
4. **Register Endpoints**: Register all API endpoints with version information
5. **Test Integration**: Verify logging is working correctly

### From Basic Logging
1. **Update Configuration**: Migrate to the new configuration format
2. **Add Features**: Include features and dependencies arrays
3. **Enable Performance Tracking**: Add performance monitoring
4. **Update Error Handling**: Use the new error logging system
5. **Test Migration**: Ensure all data is properly migrated

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API reference
3. Check the error logs in the Page Version Manager
4. Export and analyze the logging data

## Future Enhancements

- **Real-time Dashboard**: Live monitoring dashboard
- **Alert System**: Automated alerts for critical issues
- **Integration APIs**: REST APIs for external monitoring
- **Advanced Analytics**: Machine learning for pattern detection
- **Multi-environment Support**: Separate tracking for dev/staging/prod
