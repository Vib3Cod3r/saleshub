package middleware

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"saleshub-backend/config"
)

// DatabaseLoggerMiddleware provides enhanced GORM logging with request context
type DatabaseLoggerMiddleware struct {
	SlowThreshold         time.Duration
	SourceField           string
	SkipErrRecordNotFound bool
	RequestID             string
	UserID                string
	TenantID              string
}

// NewDatabaseLoggerMiddleware creates a new database logger middleware
func NewDatabaseLoggerMiddleware(requestID, userID, tenantID string) *DatabaseLoggerMiddleware {
	return &DatabaseLoggerMiddleware{
		SlowThreshold:         200 * time.Millisecond,
		SourceField:           "source",
		SkipErrRecordNotFound: false,
		RequestID:             requestID,
		UserID:                userID,
		TenantID:              tenantID,
	}
}

// LogMode returns the logger mode
func (l *DatabaseLoggerMiddleware) LogMode(logger.LogLevel) logger.Interface {
	return l
}

// Info logs info level messages with request context
func (l *DatabaseLoggerMiddleware) Info(ctx context.Context, msg string, data ...interface{}) {
	log.Printf("[DB-INFO] [%s] [User:%s] [Tenant:%s] %s %v", 
		l.RequestID, l.UserID, l.TenantID, msg, data)
}

// Warn logs warning level messages with request context
func (l *DatabaseLoggerMiddleware) Warn(ctx context.Context, msg string, data ...interface{}) {
	log.Printf("[DB-WARN] [%s] [User:%s] [Tenant:%s] %s %v", 
		l.RequestID, l.UserID, l.TenantID, msg, data)
}

// Error logs error level messages with request context
func (l *DatabaseLoggerMiddleware) Error(ctx context.Context, msg string, data ...interface{}) {
	log.Printf("[DB-ERROR] [%s] [User:%s] [Tenant:%s] %s %v", 
		l.RequestID, l.UserID, l.TenantID, msg, data)
}

// Trace logs SQL queries with enhanced context and performance metrics
func (l *DatabaseLoggerMiddleware) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	elapsed := time.Since(begin)
	sql, rows := fc()

	// Enhanced log entry with request context
	logEntry := fmt.Sprintf("[DB-QUERY] [%s] [User:%s] [Tenant:%s] %s | Duration: %v | Rows: %d", 
		l.RequestID, l.UserID, l.TenantID, sql, elapsed, rows)

	if err != nil {
		log.Printf("%s | Error: %v", logEntry, err)
		// Log to error tracking
		config.LogDatabaseEvent("QUERY_ERROR", "EXECUTE", "unknown", l.TenantID, elapsed, err, map[string]interface{}{
			"request_id": l.RequestID,
			"user_id":    l.UserID,
			"sql":        sql,
			"rows":       rows,
		})
	} else if elapsed > l.SlowThreshold && l.SlowThreshold != 0 {
		log.Printf("%s | SLOW QUERY", logEntry)
		// Log slow query for performance monitoring
		config.LogDatabaseEvent("SLOW_QUERY", "EXECUTE", "unknown", l.TenantID, elapsed, nil, map[string]interface{}{
			"request_id": l.RequestID,
			"user_id":    l.UserID,
			"sql":        sql,
			"rows":       rows,
			"threshold":  l.SlowThreshold,
		})
	} else {
		log.Printf(logEntry)
	}

	// Update metrics
	config.LogDatabaseOperation("EXECUTE", "unknown", l.TenantID, elapsed, err)
}

// DatabaseOperationTracker tracks database operations with context
type DatabaseOperationTracker struct {
	RequestID string
	UserID    string
	TenantID  string
	StartTime time.Time
	Operation string
	Table     string
}

// NewDatabaseOperationTracker creates a new operation tracker
func NewDatabaseOperationTracker(requestID, userID, tenantID, operation, table string) *DatabaseOperationTracker {
	return &DatabaseOperationTracker{
		RequestID: requestID,
		UserID:    userID,
		TenantID:  tenantID,
		StartTime: time.Now(),
		Operation: operation,
		Table:     table,
	}
}

// Complete marks the operation as complete and logs the result
func (t *DatabaseOperationTracker) Complete(err error, rowsAffected int64) {
	duration := time.Since(t.StartTime)
	
	// Log the operation
	config.LogDatabaseOperation(t.Operation, t.Table, t.TenantID, duration, err)
	
	// Log performance metrics
	config.LogDatabasePerformance(t.Operation, t.Table, duration, rowsAffected)
	
	// Log structured event
	eventType := "SUCCESS"
	if err != nil {
		eventType = "ERROR"
	}
	
	config.LogDatabaseEvent(eventType, t.Operation, t.Table, t.TenantID, duration, err, map[string]interface{}{
		"request_id":     t.RequestID,
		"user_id":        t.UserID,
		"rows_affected":  rowsAffected,
		"operation_type": t.Operation,
	})
}

// DatabaseQueryLogger provides structured logging for database queries
type DatabaseQueryLogger struct {
	RequestID string
	UserID    string
	TenantID  string
}

// NewDatabaseQueryLogger creates a new query logger
func NewDatabaseQueryLogger(requestID, userID, tenantID string) *DatabaseQueryLogger {
	return &DatabaseQueryLogger{
		RequestID: requestID,
		UserID:    userID,
		TenantID:  tenantID,
	}
}

// LogQuery logs a database query with context
func (l *DatabaseQueryLogger) LogQuery(operation, table, sql string, duration time.Duration, rowsAffected int64, err error) {
	logEntry := fmt.Sprintf("[DB-QUERY] [%s] [User:%s] [Tenant:%s] %s | Table: %s | SQL: %s | Duration: %v | Rows: %d", 
		l.RequestID, l.UserID, l.TenantID, operation, table, sql, duration, rowsAffected)

	if err != nil {
		log.Printf("%s | Error: %v", logEntry, err)
	} else {
		log.Printf(logEntry)
	}

	// Log structured event
	config.LogDatabaseEvent("QUERY", operation, table, l.TenantID, duration, err, map[string]interface{}{
		"request_id":    l.RequestID,
		"user_id":       l.UserID,
		"sql":           sql,
		"rows_affected": rowsAffected,
	})
}

// LogTransaction logs transaction events
func (l *DatabaseQueryLogger) LogTransaction(operation string, duration time.Duration, err error) {
	logEntry := fmt.Sprintf("[DB-TRANSACTION] [%s] [User:%s] [Tenant:%s] %s | Duration: %v", 
		l.RequestID, l.UserID, l.TenantID, operation, duration)

	if err != nil {
		log.Printf("%s | Error: %v", logEntry, err)
	} else {
		log.Printf(logEntry)
	}

	// Log structured event
	config.LogDatabaseEvent("TRANSACTION", operation, "transaction", l.TenantID, duration, err, map[string]interface{}{
		"request_id": l.RequestID,
		"user_id":    l.UserID,
	})
}

// DatabaseHealthChecker provides database health monitoring
type DatabaseHealthChecker struct {
	DB *gorm.DB
}

// NewDatabaseHealthChecker creates a new health checker
func NewDatabaseHealthChecker(db *gorm.DB) *DatabaseHealthChecker {
	return &DatabaseHealthChecker{DB: db}
}

// CheckHealth performs a database health check
func (h *DatabaseHealthChecker) CheckHealth() error {
	start := time.Now()
	
	// Simple ping to check connection
	sqlDB, err := h.DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get underlying SQL DB: %w", err)
	}

	err = sqlDB.Ping()
	duration := time.Since(start)

	if err != nil {
		log.Printf("[DB-HEALTH-ERROR] Health check failed | Duration: %v | Error: %v", duration, err)
		return err
	}

	log.Printf("[DB-HEALTH-SUCCESS] Health check passed | Duration: %v", duration)
	return nil
}

// GetConnectionStats returns database connection statistics
func (h *DatabaseHealthChecker) GetConnectionStats() (map[string]interface{}, error) {
	sqlDB, err := h.DB.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying SQL DB: %w", err)
	}

	stats := sqlDB.Stats()
	return map[string]interface{}{
		"max_open_connections": stats.MaxOpenConnections,
		"open_connections":     stats.OpenConnections,
		"in_use":              stats.InUse,
		"idle":                stats.Idle,
		"wait_count":          stats.WaitCount,
		"wait_duration":       stats.WaitDuration,
		"max_idle_closed":     stats.MaxIdleClosed,
		"max_lifetime_closed": stats.MaxLifetimeClosed,
	}, nil
}

// LogConnectionStats logs current connection statistics
func (h *DatabaseHealthChecker) LogConnectionStats() {
	stats, err := h.GetConnectionStats()
	if err != nil {
		log.Printf("[DB-STATS-ERROR] Failed to get connection stats: %v", err)
		return
	}

	log.Printf("[DB-STATS] Connection Pool | MaxOpen: %v, Open: %v, InUse: %v, Idle: %v, WaitCount: %v, WaitDuration: %v",
		stats["max_open_connections"], stats["open_connections"], stats["in_use"], stats["idle"], 
		stats["wait_count"], stats["wait_duration"])
}

// DatabaseHealthCheck performs a database health check using the global DB instance
func DatabaseHealthCheck() error {
	healthChecker := NewDatabaseHealthChecker(config.DB)
	return healthChecker.CheckHealth()
}

// DatabasePerformanceMonitor provides performance monitoring utilities
type DatabasePerformanceMonitor struct {
	RequestID string
	UserID    string
	TenantID  string
}

// NewDatabasePerformanceMonitor creates a new performance monitor
func NewDatabasePerformanceMonitor(requestID, userID, tenantID string) *DatabasePerformanceMonitor {
	return &DatabasePerformanceMonitor{
		RequestID: requestID,
		UserID:    userID,
		TenantID:  tenantID,
	}
}

// MonitorQuery monitors a database query with performance tracking
func (m *DatabasePerformanceMonitor) MonitorQuery(operation, table string, queryFunc func() error) error {
	start := time.Now()
	
	log.Printf("[DB-PERF-START] [%s] [User:%s] [Tenant:%s] %s | Table: %s", 
		m.RequestID, m.UserID, m.TenantID, operation, table)

	err := queryFunc()
	duration := time.Since(start)

	if err != nil {
		log.Printf("[DB-PERF-ERROR] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Duration: %v | Error: %v", 
			m.RequestID, m.UserID, m.TenantID, operation, table, duration, err)
	} else {
		log.Printf("[DB-PERF-SUCCESS] [%s] [User:%s] [Tenant:%s] %s | Table: %s | Duration: %v", 
			m.RequestID, m.UserID, m.TenantID, operation, table, duration)
	}

	// Log performance metrics
	config.LogDatabasePerformance(operation, table, duration, 0)

	return err
}

// MonitorTransaction monitors a database transaction
func (m *DatabasePerformanceMonitor) MonitorTransaction(operation string, txFunc func(*gorm.DB) error) func(*gorm.DB) error {
	return func(tx *gorm.DB) error {
		start := time.Now()
		
		log.Printf("[DB-TX-START] [%s] [User:%s] [Tenant:%s] %s", 
			m.RequestID, m.UserID, m.TenantID, operation)

		err := txFunc(tx)
		duration := time.Since(start)

		if err != nil {
			log.Printf("[DB-TX-ERROR] [%s] [User:%s] [Tenant:%s] %s | Duration: %v | Error: %v", 
				m.RequestID, m.UserID, m.TenantID, operation, duration, err)
		} else {
			log.Printf("[DB-TX-SUCCESS] [%s] [User:%s] [Tenant:%s] %s | Duration: %v", 
				m.RequestID, m.UserID, m.TenantID, operation, duration)
		}

		// Log transaction event
		config.LogDatabaseEvent("TRANSACTION", operation, "transaction", m.TenantID, duration, err, map[string]interface{}{
			"request_id": m.RequestID,
			"user_id":    m.UserID,
		})

		return err
	}
}
