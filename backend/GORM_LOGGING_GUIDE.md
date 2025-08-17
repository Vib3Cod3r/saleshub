# GORM Logging Guide

This guide explains how to use the comprehensive GORM logging system implemented in the SalesHub backend.

## Overview

The GORM logging system provides:
- **Request Context Tracking**: All database operations are logged with request ID, user ID, and tenant ID
- **Performance Monitoring**: Slow query detection and performance metrics
- **Audit Logging**: Data access tracking for compliance
- **Error Tracking**: Comprehensive error logging with context
- **Metrics Collection**: Database performance metrics and statistics
- **Health Monitoring**: Database connection health checks

## Components

### 1. Database Logger (`lib/database_logger.go`)

The main logging utility that provides easy-to-use functions for logging database operations.

```go
// Create a new database logger
dbLogger := lib.NewDatabaseLogger(requestID, userID, tenantID)

// Log a database operation
dbLogger.LogOperation("SELECT", "contacts", duration, err, metadata)

// Log a database query
dbLogger.LogQuery("SELECT", "contacts", sql, duration, rowsAffected, err)

// Log a transaction
dbLogger.LogTransaction("CREATE_CONTACT", duration, err)

// Log an error
dbLogger.LogError("SELECT", "contacts", err, metadata)

// Log a slow query
dbLogger.LogSlowQuery("SELECT", "contacts", sql, duration, threshold)
```

### 2. Performance Logger (`lib/database_logger.go`)

Monitors database operations for performance tracking.

```go
// Create a performance logger
perfLogger := lib.NewDatabasePerformanceLogger(requestID, userID, tenantID)

// Monitor a query
err := perfLogger.MonitorQuery("SELECT", "contacts", func() error {
    return db.Find(&contacts).Error
})

// Monitor a transaction
err := db.Transaction(perfLogger.MonitorTransaction("CREATE_CONTACT", func(tx *gorm.DB) error {
    return tx.Create(&contact).Error
}))
```

### 3. Audit Logger (`lib/database_logger.go`)

Tracks data access for compliance and audit purposes.

```go
// Create an audit logger
auditLogger := lib.NewDatabaseAuditLogger(requestID, userID, tenantID)

// Log data access
auditLogger.LogDataAccess("READ", "contacts", contactID, metadata)

// Log audit events
auditLogger.LogAuditEvent("UPDATE", "contacts", contactID, changes, metadata)
```

### 4. Enhanced GORM Logger (`config/gorm_logging.go`)

Provides enhanced GORM logging with request context and performance monitoring.

```go
// Initialize GORM logging
gormConfig := config.DefaultGormLoggingConfig()
config.InitializeGormLogging(gormConfig)

// Get GORM logging manager
manager := config.GetGormLoggingManager()

// Create a logger for a request
logger := manager.CreateLogger(requestID, userID, tenantID)
```

## Usage Examples

### Basic Handler with Logging

```go
func GetContacts(c *gin.Context) {
    tenantID := c.GetString("tenantID")
    userID := c.GetString("userId")
    requestID := c.GetString("requestID")

    // Create loggers
    dbLogger := lib.NewDatabaseLogger(requestID, userID, tenantID)
    perfLogger := lib.NewDatabasePerformanceLogger(requestID, userID, tenantID)
    auditLogger := lib.NewDatabaseAuditLogger(requestID, userID, tenantID)

    var contacts []models.Contact
    
    // Monitor the query
    err := perfLogger.MonitorQuery("SELECT", "contacts", func() error {
        return config.DB.Where("tenant_id = ?", tenantID).Find(&contacts).Error
    })
    
    if err != nil {
        dbLogger.LogError("SELECT", "contacts", err, nil)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contacts"})
        return
    }
    
    // Log data access for audit
    for _, contact := range contacts {
        auditLogger.LogDataAccess("READ", "contacts", contact.ID, map[string]interface{}{
            "contact_name": fmt.Sprintf("%s %s", contact.FirstName, contact.LastName),
        })
    }
    
    c.JSON(http.StatusOK, contacts)
}
```

### Transaction with Logging

```go
func CreateContact(c *gin.Context) {
    tenantID := c.GetString("tenantID")
    userID := c.GetString("userId")
    requestID := c.GetString("requestID")

    dbLogger := lib.NewDatabaseLogger(requestID, userID, tenantID)
    perfLogger := lib.NewDatabasePerformanceLogger(requestID, userID, tenantID)
    auditLogger := lib.NewDatabaseAuditLogger(requestID, userID, tenantID)

    var contact models.Contact
    if err := c.ShouldBindJSON(&contact); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Use transaction with logging
    err := config.DB.Transaction(perfLogger.MonitorTransaction("CREATE_CONTACT", func(tx *gorm.DB) error {
        // Create contact
        if err := tx.Create(&contact).Error; err != nil {
            return err
        }

        // Create related records
        if err := tx.Create(&contact.PhoneNumbers).Error; err != nil {
            return err
        }

        return nil
    }))

    if err != nil {
        dbLogger.LogError("CREATE", "contacts", err, map[string]interface{}{
            "contact_name": fmt.Sprintf("%s %s", contact.FirstName, contact.LastName),
        })
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contact"})
        return
    }

    // Log audit event
    auditLogger.LogAuditEvent("CREATE", "contacts", contact.ID, map[string]interface{}{
        "first_name": contact.FirstName,
        "last_name":  contact.LastName,
    }, nil)

    c.JSON(http.StatusCreated, contact)
}
```

### Using WithOperation Helper

```go
func UpdateContact(c *gin.Context) {
    tenantID := c.GetString("tenantID")
    userID := c.GetString("userId")
    requestID := c.GetString("requestID")

    dbLogger := lib.NewDatabaseLogger(requestID, userID, tenantID)

    var contact models.Contact
    if err := c.ShouldBindJSON(&contact); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Use WithOperation helper
    err := dbLogger.WithOperation("UPDATE", "contacts", func() error {
        return config.DB.Save(&contact).Error
    })

    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update contact"})
        return
    }

    c.JSON(http.StatusOK, contact)
}
```

## Configuration

### GORM Logging Configuration

```go
// Default configuration
gormConfig := config.DefaultGormLoggingConfig()

// Custom configuration
gormConfig := &config.GormLoggingConfig{
    LogLevel:                  logger.Info,
    SlowQueryThreshold:        200 * time.Millisecond,
    IgnoreRecordNotFoundError: false,
    LogToFile:                 true,
    LogFilePath:               "gorm.log",
    EnableMetrics:             true,
    EnableHealthChecks:        true,
    EnableAuditLog:            true,
    IncludeRequestID:          true,
    IncludeUserID:             true,
    IncludeTenantID:           true,
}

config.InitializeGormLogging(gormConfig)
```

### Database Logging Configuration

```go
// Setup database logging
loggingConfig := &config.LoggingConfig{
    LogLevel:           "INFO",
    LogFile:            "database.log",
    SlowQueryThreshold: 200 * time.Millisecond,
    EnableMetrics:      true,
    EnableHealthChecks: true,
}

config.SetupDatabaseLogging(loggingConfig)
```

## Log Output Examples

### Query Log
```
[DB-QUERY] [req-123] [User:user-456] [Tenant:tenant-789] SELECT * FROM contacts WHERE tenant_id = 'tenant-789' | Duration: 15.2ms | Rows: 25
```

### Slow Query Log
```
[DB-QUERY] [req-123] [User:user-456] [Tenant:tenant-789] SELECT * FROM contacts WHERE tenant_id = 'tenant-789' | Duration: 250.5ms | Rows: 1000 | SLOW QUERY
```

### Error Log
```
[DB-ERROR] [req-123] [User:user-456] [Tenant:tenant-789] SELECT | Table: contacts | Error: connection timeout | Metadata: map[page:1 limit:10]
```

### Transaction Log
```
[DB-TRANSACTION] [req-123] [User:user-456] [Tenant:tenant-789] CREATE_CONTACT | Duration: 45.3ms
```

### Audit Log
```
[DB-AUDIT] [req-123] [User:user-456] [Tenant:tenant-789] CREATE | Table: contacts | Record: contact-abc | Changes: map[first_name:John last_name:Doe]
```

### Performance Log
```
[DB-PERFORMANCE] [req-123] [User:user-456] [Tenant:tenant-789] SELECT | Table: contacts | Duration: 15.2ms | Rows: 25
```

## Metrics and Monitoring

### Database Metrics
```go
// Get current metrics
metrics := config.GetDatabaseMetrics()
log.Printf("Total Queries: %d, Slow Queries: %d, Failed Queries: %d", 
    metrics.TotalQueries, metrics.SlowQueries, metrics.FailedQueries)

// Log metrics
config.LogGormMetrics()
```

### Connection Pool Statistics
```go
// Log connection pool stats
metricsLogger := lib.NewDatabaseMetricsLogger()
metricsLogger.LogConnectionPool()
```

### Health Checks
```go
// Perform health check
healthChecker := middleware.NewDatabaseHealthChecker(config.DB)
err := healthChecker.CheckHealth()
if err != nil {
    log.Printf("Database health check failed: %v", err)
}
```

## Best Practices

1. **Always include context**: Use request ID, user ID, and tenant ID in all logs
2. **Monitor performance**: Use the performance logger for all database operations
3. **Log errors with context**: Include relevant metadata when logging errors
4. **Audit data access**: Log all data access for compliance
5. **Use transactions**: Wrap related operations in transactions with logging
6. **Monitor slow queries**: Set appropriate thresholds and monitor slow queries
7. **Regular health checks**: Perform regular database health checks
8. **Metrics collection**: Collect and monitor database metrics

## Integration with Middleware

To automatically add request context to all database operations, you can create a middleware that sets up the logging context:

```go
func DatabaseLoggingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Generate request ID if not present
        requestID := c.GetString("requestID")
        if requestID == "" {
            requestID = uuid.New().String()
            c.Set("requestID", requestID)
        }

        // Set up database logging context
        userID := c.GetString("userId")
        tenantID := c.GetString("tenantID")

        // Create loggers and store in context
        dbLogger := lib.NewDatabaseLogger(requestID, userID, tenantID)
        c.Set("dbLogger", dbLogger)

        c.Next()
    }
}
```

This comprehensive logging system provides full visibility into database operations, performance monitoring, and audit trails for the SalesHub application.
