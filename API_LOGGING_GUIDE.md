# API Logging System Guide

## Overview

The SalesHub CRM project now includes a comprehensive API logging system that tracks all API requests and responses, providing detailed insights into application performance, security, and debugging information.

## Features

### 🔍 **Comprehensive Request Logging**
- HTTP method, path, and query parameters
- Request headers and body content
- User authentication information
- IP address and user agent
- Request timestamp and duration

### 📊 **Performance Monitoring**
- Response time tracking
- Slow request detection (configurable threshold)
- Database operation timing
- Performance metrics aggregation

### 🛡️ **Security Logging**
- Authentication events (login/logout, success/failure)
- Authorization failures
- Rate limiting events
- Suspicious activity detection

### 🐛 **Error Tracking**
- Detailed error logging with stack traces
- Request context for debugging
- Error categorization and severity levels
- Failed request analysis

### 📈 **Analytics & Metrics**
- Request volume tracking
- Success/failure rates
- User activity patterns
- API endpoint usage statistics

## Architecture

### Backend Components

#### 1. **API Logger Middleware** (`backend/middleware/api_logger.go`)
```go
// Main middleware that captures all API requests
func APILogger(config *APILoggerConfig) gin.HandlerFunc
```

**Features:**
- Automatic request/response capture
- Configurable logging levels
- Body size limits and truncation
- Path and method exclusions
- Performance threshold monitoring

#### 2. **API Logging Configuration** (`backend/config/api_logging.go`)
```go
type APILoggingConfig struct {
    Enabled              bool
    LogFile              string
    LogLevel             string
    LogRequestBody       bool
    LogResponseBody      bool
    LogHeaders           bool
    LogUserInfo          bool
    LogPerformance       bool
    ExcludePaths         []string
    ExcludeMethods       []string
    MaxBodySize          int64
    SlowRequestThreshold time.Duration
    MetricsEnabled       bool
    MetricsInterval      time.Duration
}
```

#### 3. **API Logger Utility** (`backend/lib/api_logger.go`)
```go
// Simple logging functions for use in handlers
type APILogger struct{}

func (l *APILogger) LogRequest(method, path, userID, tenantID, ipAddress string, duration time.Duration, statusCode int)
func (l *APILogger) LogError(operation, path, userID, tenantID string, err error)
func (l *APILogger) LogAuthentication(event, email, userID, tenantID, ipAddress string, success bool)
func (l *APILogger) LogSecurity(event, path, userID, tenantID, ipAddress string)
func (l *APILogger) LogPerformance(operation, path string, duration time.Duration, statusCode int, userID string)
func (l *APILogger) LogDatabaseOperation(operation, table, userID, tenantID string, duration time.Duration, err error)
func (l *APILogger) LogRateLimit(path, userID, tenantID, ipAddress string, limit, remaining int)
```

### Frontend Components

#### 1. **API Log Viewer** (`frontend/src/components/debug/api-log-viewer.tsx`)
- Real-time log display
- Search and filtering capabilities
- Export functionality (CSV)
- Auto-refresh options
- Log level categorization

#### 2. **API Logs Page** (`frontend/src/app/api-logs/page.tsx`)
- Dedicated page for log viewing
- Integrated with the main application layout

## Configuration

### Default Configuration
```go
func DefaultAPILoggerConfig() *APILoggerConfig {
    return &APILoggerConfig{
        LogFile:             "api.log",
        LogLevel:            "INFO",
        LogRequestBody:      true,
        LogResponseBody:     false, // Security: don't log response bodies by default
        LogHeaders:          false,
        LogUserInfo:         true,
        LogPerformance:      true,
        ExcludePaths:        []string{"/health", "/metrics", "/favicon.ico", "/api/health"},
        ExcludeMethods:      []string{"OPTIONS"},
        MaxBodySize:         1024 * 1024, // 1MB
        SlowRequestThreshold: 5 * time.Second,
        MetricsEnabled:       true,
        MetricsInterval:      5 * time.Minute,
    }
}
```

### Environment Variables
```bash
# API Logging Configuration
API_LOG_ENABLED=true
API_LOG_FILE=api.log
API_LOG_LEVEL=INFO
API_LOG_REQUEST_BODY=true
API_LOG_RESPONSE_BODY=false
API_LOG_HEADERS=false
API_LOG_USER_INFO=true
API_LOG_PERFORMANCE=true
API_LOG_MAX_BODY_SIZE=1048576
API_LOG_SLOW_REQUEST_THRESHOLD=5s
API_LOG_METRICS_ENABLED=true
API_LOG_METRICS_INTERVAL=5m
```

## Usage Examples

### 1. **Automatic Logging (Middleware)**
All API requests are automatically logged when the middleware is enabled:

```go
// In main.go
apiLoggerConfig := middleware.DefaultAPILoggerConfig()
r.Use(middleware.APILogger(apiLoggerConfig))
```

### 2. **Manual Logging in Handlers**
```go
import "saleshub-backend/lib"

func MyHandler(c *gin.Context) {
    start := time.Now()
    userID, _ := middleware.GetCurrentUserID(c)
    tenantID, _ := middleware.GetCurrentTenantID(c)
    ipAddress := c.ClientIP()

    // Your handler logic here...

    // Log the request
    duration := time.Since(start)
    lib.APILog.LogRequest(
        c.Request.Method, 
        c.Request.URL.Path, 
        userID, 
        tenantID, 
        ipAddress, 
        duration, 
        c.Writer.Status(),
    )
}
```

### 3. **Error Logging**
```go
if err != nil {
    lib.APILog.LogError("CreateContact", c.Request.URL.Path, userID, tenantID, err)
    c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contact"})
    return
}
```

### 4. **Authentication Logging**
```go
// Successful login
lib.APILog.LogAuthentication("Login", req.Email, user.ID, user.TenantID, ipAddress, true)

// Failed login
lib.APILog.LogAuthentication("Login", req.Email, "", "", ipAddress, false)
```

### 5. **Performance Logging**
```go
lib.APILog.LogPerformance("GetContacts", c.Request.URL.Path, duration, c.Writer.Status(), userID)
```

## Log Format

### Request Log Entry
```
[API-INFO] GET /api/crm/contacts | Status: 200 | Duration: 45ms | IP: 192.168.1.1 | User: user123 | Tenant: tenant1
```

### Error Log Entry
```
[API-ERROR] CreateContact | Path: /api/crm/contacts | User: user123 | Tenant: tenant1 | Error: database connection failed
```

### Authentication Log Entry
```
[API-AUTH-SUCCESS] Login | Email: user@example.com | User: user123 | Tenant: tenant1 | IP: 192.168.1.1
```

### Performance Log Entry
```
[API-PERFORMANCE] GetContacts | Path: /api/crm/contacts | Duration: 45ms | Status: 200 | User: user123
```

### Slow Request Warning
```
[API-SLOW] GetCompanies | Path: /api/crm/companies | Duration: 5.2s | Status: 200 | User: user456
```

## Log Files

### Primary Log Files
- `api.log` - Main API request/response logs
- `database.log` - Database operation logs
- `backend.log` - General application logs

### Log Rotation
Consider implementing log rotation to manage file sizes:
```bash
# Example logrotate configuration
/var/log/saleshub/api.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data www-data
}
```

## Security Considerations

### 1. **Sensitive Data Protection**
- Response bodies are not logged by default
- Passwords and tokens are never logged
- Personal information is masked when possible

### 2. **Log File Security**
- Log files should have restricted permissions
- Consider encryption for sensitive environments
- Implement log retention policies

### 3. **Access Control**
- Log viewing should be restricted to authorized users
- Consider audit trails for log access

## Monitoring & Alerting

### 1. **Performance Alerts**
- Monitor slow request thresholds
- Alert on high error rates
- Track API response times

### 2. **Security Alerts**
- Failed authentication attempts
- Unusual access patterns
- Rate limit violations

### 3. **Health Checks**
- Log file size monitoring
- Disk space alerts
- Log processing failures

## Integration with External Tools

### 1. **ELK Stack (Elasticsearch, Logstash, Kibana)**
```yaml
# Example Logstash configuration
input {
  file {
    path => "/var/log/saleshub/api.log"
    type => "api-logs"
  }
}

filter {
  if [type] == "api-logs" {
    grok {
      match => { "message" => "\[API-%{LOGLEVEL:level}\] %{GREEDYDATA:details}" }
    }
  }
}
```

### 2. **Prometheus Metrics**
```go
// Example metrics collection
var (
    apiRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "api_requests_total",
            Help: "Total number of API requests",
        },
        []string{"method", "path", "status"},
    )
    apiRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "api_request_duration_seconds",
            Help: "API request duration in seconds",
        },
        []string{"method", "path"},
    )
)
```

### 3. **Grafana Dashboards**
- Request volume over time
- Response time percentiles
- Error rate trends
- User activity heatmaps

## Troubleshooting

### Common Issues

#### 1. **High Log Volume**
- Adjust log levels
- Exclude unnecessary paths
- Implement log filtering

#### 2. **Performance Impact**
- Reduce logged data
- Use async logging
- Implement log buffering

#### 3. **Disk Space Issues**
- Implement log rotation
- Set retention policies
- Monitor log file sizes

### Debug Commands
```bash
# View recent API logs
tail -f api.log | grep "\[API-"

# Search for errors
grep "\[API-ERROR\]" api.log

# Find slow requests
grep "\[API-SLOW\]" api.log

# Monitor authentication events
grep "\[API-AUTH" api.log
```

## Best Practices

### 1. **Logging Strategy**
- Log at appropriate levels
- Include relevant context
- Avoid logging sensitive data
- Use structured logging

### 2. **Performance**
- Minimize logging overhead
- Use async logging when possible
- Implement log buffering
- Monitor logging performance

### 3. **Maintenance**
- Regular log rotation
- Monitor disk usage
- Archive old logs
- Validate log integrity

### 4. **Security**
- Restrict log file access
- Encrypt sensitive logs
- Implement access controls
- Regular security audits

## Future Enhancements

### 1. **Advanced Analytics**
- Machine learning for anomaly detection
- Predictive performance analysis
- User behavior analytics

### 2. **Real-time Monitoring**
- WebSocket-based live log streaming
- Real-time alerting
- Interactive dashboards

### 3. **Integration Features**
- Slack/Discord notifications
- Email alerts
- PagerDuty integration
- Custom webhook support

### 4. **Advanced Filtering**
- Complex query support
- Saved filters
- Custom log views
- Export capabilities

## Conclusion

The API logging system provides comprehensive visibility into your SalesHub CRM application's behavior, performance, and security. By following this guide, you can effectively implement, configure, and maintain a robust logging infrastructure that supports both development and production needs.

For additional support or questions, refer to the project documentation or contact the development team.
