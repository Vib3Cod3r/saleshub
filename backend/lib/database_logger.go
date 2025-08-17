package lib

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/middleware"
)

// DatabaseLogger provides easy-to-use database logging utilities
type DatabaseLogger struct {
	RequestID string
	UserID    string
	TenantID  string
}

// NewDatabaseLogger creates a new database logger instance
func NewDatabaseLogger(requestID, userID, tenantID string) *DatabaseLogger {
	return &DatabaseLogger{
		RequestID: requestID,
		UserID:    userID,
		TenantID:  tenantID,
	}
}

// LogOperation logs a database operation with context
func (l *DatabaseLogger) LogOperation(operation, table string, duration time.Duration, err error, metadata map[string]interface{}) {
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	
	metadata["request_id"] = l.RequestID
	metadata["user_id"] = l.UserID
	
	config.LogDatabaseOperation(operation, table, l.TenantID, duration, err)
	config.LogDatabaseEvent("OPERATION", operation, table, l.TenantID, duration, err, metadata)
}

// LogQuery logs a database query with full context
func (l *DatabaseLogger) LogQuery(operation, table, sql string, duration time.Duration, rowsAffected int64, err error) {
	logEntry := fmt.Sprintf("[DB-QUERY] [%s] [User:%s] [Tenant:%s] %s | Table: %s | SQL: %s | Duration: %v | Rows: %d", 
		l.RequestID, l.UserID, l.TenantID, operation, table, sql, duration, rowsAffected)

	if err != nil {
		log.Printf("%s | Error: %v", logEntry, err)
	} else {
		log.Printf(logEntry)
	}

	metadata := map[string]interface{}{
		"request_id":    l.RequestID,
		"user_id":       l.UserID,
		"sql":           sql,
		"rows_affected": rowsAffected,
	}

	config.LogDatabaseEvent("QUERY", operation, table, l.TenantID, duration, err, metadata)
}

// LogTransaction logs a database transaction
func (l *DatabaseLogger) LogTransaction(operation string, duration time.Duration, err error) {
	logEntry := fmt.Sprintf("[DB-TRANSACTION] [%s] [User:%s] [Tenant:%s] %s | Duration: %v", 
		l.RequestID, l.UserID, l.TenantID, operation, duration)

	if err != nil {
		log.Printf("%s | Error: %v", logEntry, err)
	} else {
		log.Printf(logEntry)
	}

	metadata := map[string]interface{}{
		"request_id": l.RequestID,
		"user_id":    l.UserID,
	}

	config.LogDatabaseEvent("TRANSACTION", operation, "transaction", l.TenantID, duration, err, metadata)
}

// LogError logs a database error with context
func (l *DatabaseLogger) LogError(operation, table string, err error, metadata map[string]interface{}) {
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	
	metadata["request_id"] = l.RequestID
	metadata["user_id"] = l.UserID
	
	log.Printf("[DB-ERROR] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Error: %v | Metadata: %+v", 
		l.RequestID, l.UserID, l.TenantID, operation, table, err, metadata)
	
	config.LogDatabaseEvent("ERROR", operation, table, l.TenantID, 0, err, metadata)
}

// LogSlowQuery logs a slow query for performance monitoring
func (l *DatabaseLogger) LogSlowQuery(operation, table, sql string, duration time.Duration, threshold time.Duration) {
	log.Printf("[DB-SLOW-QUERY] [%s] [User:%s] [Tenant:%s] %s | Table: %s | SQL: %s | Duration: %v | Threshold: %v", 
		l.RequestID, l.UserID, l.TenantID, operation, table, sql, duration, threshold)
	
	metadata := map[string]interface{}{
		"request_id": l.RequestID,
		"user_id":    l.UserID,
		"sql":        sql,
		"threshold":  threshold,
	}
	
	config.LogDatabaseEvent("SLOW_QUERY", operation, table, l.TenantID, duration, nil, metadata)
}

// WithOperation wraps a database operation with logging
func (l *DatabaseLogger) WithOperation(operation, table string, fn func() error) error {
	start := time.Now()
	
	log.Printf("[DB-OP-START] [%s] [User:%s] [Tenant:%s] %s | Table: %s", 
		l.RequestID, l.UserID, l.TenantID, operation, table)
	
	err := fn()
	duration := time.Since(start)
	
	l.LogOperation(operation, table, duration, err, nil)
	
	if err != nil {
		log.Printf("[DB-OP-ERROR] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Duration: %v | Error: %v", 
			l.RequestID, l.UserID, l.TenantID, operation, table, duration, err)
	} else {
		log.Printf("[DB-OP-SUCCESS] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Duration: %v", 
			l.RequestID, l.UserID, l.TenantID, operation, table, duration)
	}
	
	return err
}

// WithTransaction wraps a database transaction with logging
func (l *DatabaseLogger) WithTransaction(operation string, fn func(*gorm.DB) error) func(*gorm.DB) error {
	return func(tx *gorm.DB) error {
		start := time.Now()
		
		log.Printf("[DB-TX-START] [%s] [User:%s] [Tenant:%s] %s", 
			l.RequestID, l.UserID, l.TenantID, operation)
		
		err := fn(tx)
		duration := time.Since(start)
		
		l.LogTransaction(operation, duration, err)
		
		if err != nil {
			log.Printf("[DB-TX-ERROR] [%s] [User:%s] [Tenant:%s] %s | Duration: %v | Error: %v", 
				l.RequestID, l.UserID, l.TenantID, operation, duration, err)
		} else {
			log.Printf("[DB-TX-SUCCESS] [%s] [User:%s] [Tenant:%s] %s | Duration: %v", 
				l.RequestID, l.UserID, l.TenantID, operation, duration)
		}
		
		return err
	}
}

// DatabaseMetricsLogger provides utilities for logging database metrics
type DatabaseMetricsLogger struct{}

// NewDatabaseMetricsLogger creates a new metrics logger
func NewDatabaseMetricsLogger() *DatabaseMetricsLogger {
	return &DatabaseMetricsLogger{}
}

// LogMetrics logs current database metrics
func (m *DatabaseMetricsLogger) LogMetrics() {
	metrics := config.GetDatabaseMetrics()
	
	log.Printf("[DB-METRICS] Total Queries: %d | Slow Queries: %d | Failed Queries: %d | Total Duration: %v | Last Query: %v", 
		metrics.TotalQueries, metrics.SlowQueries, metrics.FailedQueries, metrics.TotalDuration, metrics.LastQueryTime)
}

// LogConnectionPool logs connection pool statistics
func (m *DatabaseMetricsLogger) LogConnectionPool() {
	healthChecker := middleware.NewDatabaseHealthChecker(config.DB)
	healthChecker.LogConnectionStats()
}

// LogHealthCheck logs database health check results
func (m *DatabaseMetricsLogger) LogHealthCheck() error {
	healthChecker := middleware.NewDatabaseHealthChecker(config.DB)
	return healthChecker.CheckHealth()
}

// DatabasePerformanceLogger provides performance monitoring utilities
type DatabasePerformanceLogger struct {
	RequestID string
	UserID    string
	TenantID  string
}

// NewDatabasePerformanceLogger creates a new performance logger
func NewDatabasePerformanceLogger(requestID, userID, tenantID string) *DatabasePerformanceLogger {
	return &DatabasePerformanceLogger{
		RequestID: requestID,
		UserID:    userID,
		TenantID:  tenantID,
	}
}

// MonitorQuery monitors a database query with performance tracking
func (p *DatabasePerformanceLogger) MonitorQuery(operation, table string, queryFunc func() error) error {
	monitor := middleware.NewDatabasePerformanceMonitor(p.RequestID, p.UserID, p.TenantID)
	return monitor.MonitorQuery(operation, table, queryFunc)
}

// MonitorTransaction monitors a database transaction
func (p *DatabasePerformanceLogger) MonitorTransaction(operation string, txFunc func(*gorm.DB) error) func(*gorm.DB) error {
	monitor := middleware.NewDatabasePerformanceMonitor(p.RequestID, p.UserID, p.TenantID)
	return monitor.MonitorTransaction(operation, txFunc)
}

// LogPerformanceMetrics logs performance metrics for an operation
func (p *DatabasePerformanceLogger) LogPerformanceMetrics(operation, table string, duration time.Duration, rowsAffected int64) {
	// config.LogDatabasePerformance(operation, table, duration, rowsAffected) // temporarily disabled due to division by zero issue
	
	log.Printf("[DB-PERFORMANCE] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Duration: %v | Rows: %d", 
		p.RequestID, p.UserID, p.TenantID, operation, table, duration, rowsAffected)
}

// DatabaseContextLogger provides context-aware database logging
type DatabaseContextLogger struct {
	ctx context.Context
	*DatabaseLogger
}

// NewDatabaseContextLogger creates a new context-aware database logger
func NewDatabaseContextLogger(ctx context.Context, requestID, userID, tenantID string) *DatabaseContextLogger {
	return &DatabaseContextLogger{
		ctx:            ctx,
		DatabaseLogger: NewDatabaseLogger(requestID, userID, tenantID),
	}
}

// LogWithContext logs a database operation with context information
func (c *DatabaseContextLogger) LogWithContext(operation, table string, duration time.Duration, err error, metadata map[string]interface{}) {
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	
	// Add context information
	if deadline, ok := c.ctx.Deadline(); ok {
		metadata["context_deadline"] = deadline
	}
	
	metadata["context_done"] = c.ctx.Err()
	
	c.LogOperation(operation, table, duration, err, metadata)
}

// DatabaseAuditLogger provides audit logging for database operations
type DatabaseAuditLogger struct {
	RequestID string
	UserID    string
	TenantID  string
}

// NewDatabaseAuditLogger creates a new audit logger
func NewDatabaseAuditLogger(requestID, userID, tenantID string) *DatabaseAuditLogger {
	return &DatabaseAuditLogger{
		RequestID: requestID,
		UserID:    userID,
		TenantID:  tenantID,
	}
}

// LogAuditEvent logs an audit event for database operations
func (a *DatabaseAuditLogger) LogAuditEvent(operation, table, recordID string, changes map[string]interface{}, metadata map[string]interface{}) {
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	
	metadata["request_id"] = a.RequestID
	metadata["user_id"] = a.UserID
	metadata["record_id"] = recordID
	metadata["changes"] = changes
	
	log.Printf("[DB-AUDIT] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Record: %s | Changes: %+v", 
		a.RequestID, a.UserID, a.TenantID, operation, table, recordID, changes)
	
	config.LogDatabaseEvent("AUDIT", operation, table, a.TenantID, 0, nil, metadata)
}

// LogDataAccess logs data access events for compliance
func (a *DatabaseAuditLogger) LogDataAccess(operation, table, recordID string, metadata map[string]interface{}) {
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	
	metadata["request_id"] = a.RequestID
	metadata["user_id"] = a.UserID
	metadata["record_id"] = recordID
	metadata["access_type"] = operation
	
	log.Printf("[DB-ACCESS] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Record: %s", 
		a.RequestID, a.UserID, a.TenantID, operation, table, recordID)
	
	config.LogDatabaseEvent("DATA_ACCESS", operation, table, a.TenantID, 0, nil, metadata)
}
