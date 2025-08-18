# Database Logging System

## Overview

The Sales CRM project includes a comprehensive database logging system that tracks all database operations, queries, performance metrics, and errors. This system provides real-time monitoring, debugging capabilities, and performance insights for the PostgreSQL database.

## Features

### 1. Query Logging
- **All SQL queries** are logged with timing information
- **Slow query detection** (configurable threshold, default: 200ms)
- **Query performance metrics** (duration, rows affected)
- **Error tracking** with detailed error messages

### 2. Operation Logging
- **CRUD operations** (Create, Read, Update, Delete)
- **Transaction logging** (begin, commit, rollback)
- **Tenant-specific logging** for multi-tenant operations
- **User context** tracking for audit trails

### 3. Performance Monitoring
- **Connection pool statistics**
- **Query performance metrics**
- **Database health checks**
- **Real-time monitoring**

### 4. Health Checks
- **Database connectivity** monitoring
- **Response time** tracking
- **Connection pool** status
- **Automatic health checks** every 5 minutes

## Configuration

### Database Logger Configuration

```go
// Default configuration
dbLogger := &DatabaseLogger{
    SlowThreshold:         200 * time.Millisecond,
    SourceField:           "source",
    SkipErrRecordNotFound: false,
}
```

### Logging Configuration

```go
config := &LoggingConfig{
    LogLevel:           "INFO",
    LogFile:            "database.log",
    SlowQueryThreshold: 200 * time.Millisecond,
    EnableMetrics:      true,
    EnableHealthChecks: true,
}
```

## Log Format

### Query Logs
```
[DB-QUERY] SELECT * FROM contacts WHERE tenant_id = ? | Duration: 15.2ms | Rows: 25
[DB-QUERY] INSERT INTO contacts (...) VALUES (...) | Duration: 8.5ms | Rows: 1
[DB-QUERY] UPDATE contacts SET ... WHERE id = ? | Duration: 12.1ms | Rows: 1
```

### Operation Logs
```
[DB-OP] SELECT | Table: contacts | Tenant: tenant-123 | Duration: 15.2ms | Success
[DB-OP] INSERT | Table: contacts | Tenant: tenant-123 | Duration: 8.5ms | Success
[DB-OP-ERROR] UPDATE | Table: contacts | Tenant: tenant-123 | Duration: 12.1ms | Error: constraint violation
```

### Transaction Logs
```
[DB-TXN-COMMIT-SUCCESS] CreateContact | Table: contacts | Duration: 45.2ms
[DB-TXN-ROLLBACK] CreateContact | Table: contacts | Duration: 23.1ms | Error: validation failed
```

### Health Check Logs
```
[DB-HEALTH-CHECK-SUCCESS] Duration: 2.1ms
[DB-HEALTH-CHECK-ERROR] Duration: 150.5ms | Error: connection timeout
```

### Connection Pool Logs
```
[DB-STATS] Pool Stats | MaxOpen: 100 | Open: 15 | InUse: 8 | Idle: 7
[DB-POOL-STATS] MaxOpen: 100 | Open: 15 | InUse: 8 | Idle: 7 | WaitCount: 0 | WaitDuration: 0s
```

## API Endpoints

### Health Check Endpoints

#### GET /api/health
Comprehensive health check including database status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": {
    "status": "healthy",
    "connected": true,
    "responseTime": "2.1ms"
  },
  "metrics": {
    "totalQueries": 1250,
    "slowQueries": 5,
    "failedQueries": 2,
    "totalDuration": "45.2s",
    "averageDuration": "36.2ms",
    "lastQueryTime": "2024-01-15T10:29:55Z"
  },
  "uptime": "2h 15m 30s",
  "version": "1.0.0"
}
```

#### GET /api/database/health
Database-specific health check.

**Response:**
```json
{
  "status": "healthy",
  "connected": true,
  "responseTime": "2.1ms",
  "timestamp": "2024-01-15T10:30:00Z",
  "checkDuration": "5.2ms"
}
```

#### GET /api/database/metrics
Database performance metrics.

**Response:**
```json
{
  "totalQueries": 1250,
  "slowQueries": 5,
  "failedQueries": 2,
  "totalDuration": "45.2s",
  "averageDuration": "36.2ms",
  "lastQueryTime": "2024-01-15T10:29:55Z",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET /api/database/stats
Detailed database statistics including connection pool.

**Response:**
```json
{
  "connectionPool": {
    "maxOpenConnections": 100,
    "openConnections": 15,
    "inUse": 8,
    "idle": 7,
    "waitCount": 0,
    "waitDuration": "0s"
  },
  "metrics": {
    "totalQueries": 1250,
    "slowQueries": 5,
    "failedQueries": 2,
    "totalDuration": "45.2s",
    "lastQueryTime": "2024-01-15T10:29:55Z"
  },
  "uptime": "2h 15m 30s",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Frontend Integration

### Database Log Viewer Component

The frontend includes a comprehensive database log viewer (`/database-logs`) that provides:

- **Real-time log monitoring** with live updates
- **Health status dashboard** with visual indicators
- **Performance metrics** display
- **Connection pool statistics**
- **Filterable log viewer** by log level
- **Log download** functionality
- **Auto-scrolling** log display

### Features:
- **Live Updates**: Automatic refresh every 5 seconds
- **Filtering**: Filter logs by level (All, Error, Warning, Info)
- **Download**: Export logs as text file
- **Clear Logs**: Clear current log display
- **Pause/Live**: Toggle live updates

## Usage Examples

### Basic Database Operation Logging

```go
// In your handler
func GetContacts(c *gin.Context) {
    start := time.Now()
    tenantID := c.GetString("tenantID")
    
    // Log operation start
    log.Printf("[DB-OP-START] GetContacts | Tenant: %s", tenantID)
    
    // Perform database operations
    var contacts []models.Contact
    query := config.DB.Where("tenant_id = ?", tenantID)
    
    // Execute query with timing
    queryStart := time.Now()
    if err := query.Find(&contacts).Error; err != nil {
        queryDuration := time.Since(queryStart)
        config.LogDatabaseOperation("SELECT", "contacts", tenantID, queryDuration, err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contacts"})
        return
    }
    queryDuration := time.Since(queryStart)
    config.LogDatabaseOperation("SELECT", "contacts", tenantID, queryDuration, nil)
    
    // Log operation completion
    totalDuration := time.Since(start)
    log.Printf("[DB-OP-COMPLETE] GetContacts | Tenant: %s | Duration: %v | Found: %d contacts", 
        tenantID, totalDuration, len(contacts))
    
    c.JSON(http.StatusOK, contacts)
}
```

### Transaction Logging

```go
// Using transaction logger
func CreateContactWithTransaction(c *gin.Context) {
    tenantID := c.GetString("tenantID")
    
    // Start transaction with logging
    tx := config.DB.Begin()
    txnLogger := middleware.NewTransactionLogger(tx, "CreateContact", "contacts")
    
    // Perform operations...
    
    // Commit with logging
    if err := txnLogger.Commit(); err != nil {
        // Transaction will be logged as failed
        return
    }
    
    // Transaction will be logged as successful
}
```

### Health Check Integration

```go
// Periodic health checks
func startHealthChecks() {
    ticker := time.NewTicker(5 * time.Minute)
    defer ticker.Stop()
    
    for range ticker.C {
        if err := middleware.DatabaseHealthCheck(); err != nil {
            log.Printf("[DB-HEALTH-ERROR] Health check failed: %v", err)
            // Handle health check failure
        }
    }
}
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Query Performance**
   - Average query duration
   - Slow query count
   - Failed query count

2. **Connection Pool**
   - Connection utilization
   - Wait count and duration
   - Connection pool exhaustion

3. **Database Health**
   - Response time
   - Connection status
   - Error rate

### Alerting Thresholds

- **Slow Queries**: > 200ms (configurable)
- **Failed Queries**: > 5% of total queries
- **Connection Pool**: > 80% utilization
- **Response Time**: > 100ms for health checks

## Best Practices

### 1. Log Level Management
- Use appropriate log levels (INFO, WARN, ERROR)
- Avoid logging sensitive data
- Implement log rotation

### 2. Performance Considerations
- Minimize logging overhead in production
- Use structured logging for better parsing
- Implement log buffering for high-volume operations

### 3. Security
- Never log passwords or sensitive data
- Sanitize user input in log messages
- Implement log access controls

### 4. Monitoring
- Set up alerts for critical failures
- Monitor log file sizes
- Implement log retention policies

## Troubleshooting

### Common Issues

1. **High Log Volume**
   - Increase log level threshold
   - Implement log filtering
   - Use log rotation

2. **Performance Impact**
   - Reduce logging frequency
   - Use async logging
   - Optimize log message format

3. **Connection Pool Issues**
   - Monitor connection pool stats
   - Adjust pool configuration
   - Check for connection leaks

### Debug Commands

```bash
# Check database logs
tail -f database.log

# Monitor slow queries
grep "SLOW QUERY" database.log

# Check for errors
grep "ERROR" database.log

# Monitor health checks
grep "HEALTH-CHECK" database.log
```

## Configuration Files

### Environment Variables

```bash
# Database logging configuration
DB_LOG_LEVEL=INFO
DB_LOG_FILE=database.log
DB_SLOW_QUERY_THRESHOLD=200ms
DB_ENABLE_METRICS=true
DB_ENABLE_HEALTH_CHECKS=true
```

### Log File Configuration

The system supports log file output with automatic rotation:

```go
// Configure log file
config := &LoggingConfig{
    LogFile: "logs/database.log",
    // ... other config
}
```

## Future Enhancements

1. **Advanced Analytics**
   - Query pattern analysis
   - Performance trend analysis
   - Predictive monitoring

2. **Integration**
   - Prometheus metrics export
   - Grafana dashboard integration
   - ELK stack integration

3. **Advanced Features**
   - Query plan analysis
   - Index usage monitoring
   - Deadlock detection

4. **Machine Learning**
   - Anomaly detection
   - Performance prediction
   - Automated optimization suggestions
