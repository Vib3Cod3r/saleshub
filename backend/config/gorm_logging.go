package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// GormLoggingConfig holds configuration for GORM logging
type GormLoggingConfig struct {
	// Logging levels
	LogLevel logger.LogLevel
	
	// Performance thresholds
	SlowQueryThreshold time.Duration
	
	// Logging options
	IgnoreRecordNotFoundError bool
	Colorful                   bool
	
	// File logging
	LogToFile     bool
	LogFilePath   string
	LogFileMode   os.FileMode
	
	// Metrics and monitoring
	EnableMetrics      bool
	EnableHealthChecks bool
	EnableAuditLog     bool
	
	// Request context
	IncludeRequestID bool
	IncludeUserID    bool
	IncludeTenantID  bool
}

// DefaultGormLoggingConfig returns default GORM logging configuration
func DefaultGormLoggingConfig() *GormLoggingConfig {
	return &GormLoggingConfig{
		LogLevel:                  logger.Info,
		SlowQueryThreshold:        200 * time.Millisecond,
		IgnoreRecordNotFoundError: false,
		Colorful:                  false,
		LogToFile:                 false,
		LogFilePath:               "gorm.log",
		LogFileMode:               0666,
		EnableMetrics:             true,
		EnableHealthChecks:        true,
		EnableAuditLog:            true,
		IncludeRequestID:          true,
		IncludeUserID:             true,
		IncludeTenantID:           true,
	}
}

// EnhancedGormLogger provides comprehensive GORM logging with context
type EnhancedGormLogger struct {
	config     *GormLoggingConfig
	requestID  string
	userID     string
	tenantID   string
	startTime  time.Time
}

// NewEnhancedGormLogger creates a new enhanced GORM logger
func NewEnhancedGormLogger(config *GormLoggingConfig, requestID, userID, tenantID string) *EnhancedGormLogger {
	return &EnhancedGormLogger{
		config:    config,
		requestID: requestID,
		userID:    userID,
		tenantID:  tenantID,
		startTime: time.Now(),
	}
}

// LogMode returns the logger mode
func (l *EnhancedGormLogger) LogMode(level logger.LogLevel) logger.Interface {
	l.config.LogLevel = level
	return l
}

// Info logs info level messages
func (l *EnhancedGormLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	if l.config.LogLevel >= logger.Info {
		l.logWithContext("INFO", msg, data...)
	}
}

// Warn logs warning level messages
func (l *EnhancedGormLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.config.LogLevel >= logger.Warn {
		l.logWithContext("WARN", msg, data...)
	}
}

// Error logs error level messages
func (l *EnhancedGormLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.config.LogLevel >= logger.Error {
		l.logWithContext("ERROR", msg, data...)
	}
}

// Trace logs SQL queries with comprehensive context
func (l *EnhancedGormLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if l.config.LogLevel <= logger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()

	// Skip record not found errors if configured
	if l.config.IgnoreRecordNotFoundError && err == gorm.ErrRecordNotFound {
		return
	}

	// Build log entry with context
	logEntry := l.buildLogEntry("QUERY", sql, elapsed, rows, err)

	// Log based on conditions
	if err != nil {
		log.Printf("%s | Error: %v", logEntry, err)
		l.logErrorEvent("QUERY_ERROR", sql, elapsed, rows, err)
	} else if elapsed > l.config.SlowQueryThreshold && l.config.SlowQueryThreshold != 0 {
		log.Printf("%s | SLOW QUERY", logEntry)
		l.logSlowQueryEvent(sql, elapsed, rows)
	} else {
		log.Printf(logEntry)
	}

	// Update metrics
	LogDatabaseOperation("EXECUTE", "unknown", l.tenantID, elapsed, err)
}

// logWithContext logs messages with request context
func (l *EnhancedGormLogger) logWithContext(level, msg string, data ...interface{}) {
	contextInfo := l.buildContextInfo()
	log.Printf("[GORM-%s] %s %s %v", level, contextInfo, msg, data)
}

// buildContextInfo builds context information string
func (l *EnhancedGormLogger) buildContextInfo() string {
	var contextParts []string
	
	if l.config.IncludeRequestID && l.requestID != "" {
		contextParts = append(contextParts, fmt.Sprintf("ReqID:%s", l.requestID))
	}
	
	if l.config.IncludeUserID && l.userID != "" {
		contextParts = append(contextParts, fmt.Sprintf("User:%s", l.userID))
	}
	
	if l.config.IncludeTenantID && l.tenantID != "" {
		contextParts = append(contextParts, fmt.Sprintf("Tenant:%s", l.tenantID))
	}
	
	if len(contextParts) > 0 {
		return fmt.Sprintf("[%s]", fmt.Sprintf("%s", contextParts))
	}
	
	return ""
}

// buildLogEntry builds a comprehensive log entry
func (l *EnhancedGormLogger) buildLogEntry(operation, sql string, elapsed time.Duration, rows int64, err error) string {
	contextInfo := l.buildContextInfo()
	
	entry := fmt.Sprintf("[GORM-QUERY] %s %s | Duration: %v | Rows: %d", 
		contextInfo, sql, elapsed, rows)
	
	if err != nil {
		entry += fmt.Sprintf(" | Error: %v", err)
	}
	
	return entry
}

// logErrorEvent logs error events for monitoring
func (l *EnhancedGormLogger) logErrorEvent(eventType, sql string, elapsed time.Duration, rows int64, err error) {
	metadata := map[string]interface{}{
		"request_id":    l.requestID,
		"user_id":       l.userID,
		"sql":           sql,
		"rows":          rows,
		"elapsed_ms":    elapsed.Milliseconds(),
	}
	
	LogDatabaseEvent(eventType, "EXECUTE", "unknown", l.tenantID, elapsed, err, metadata)
}

// logSlowQueryEvent logs slow query events for performance monitoring
func (l *EnhancedGormLogger) logSlowQueryEvent(sql string, elapsed time.Duration, rows int64) {
	metadata := map[string]interface{}{
		"request_id":    l.requestID,
		"user_id":       l.userID,
		"sql":           sql,
		"rows":          rows,
		"elapsed_ms":    elapsed.Milliseconds(),
		"threshold_ms":  l.config.SlowQueryThreshold.Milliseconds(),
	}
	
	LogDatabaseEvent("SLOW_QUERY", "EXECUTE", "unknown", l.tenantID, elapsed, nil, metadata)
}

// GormLoggingManager manages GORM logging configuration and instances
type GormLoggingManager struct {
	config *GormLoggingConfig
	file   *os.File
}

// NewGormLoggingManager creates a new GORM logging manager
func NewGormLoggingManager(config *GormLoggingConfig) *GormLoggingManager {
	manager := &GormLoggingManager{
		config: config,
	}
	
	// Setup file logging if enabled
	if config.LogToFile {
		manager.setupFileLogging()
	}
	
	return manager
}

// setupFileLogging sets up file logging
func (manager *GormLoggingManager) setupFileLogging() {
	file, err := os.OpenFile(manager.config.LogFilePath, 
		os.O_CREATE|os.O_WRONLY|os.O_APPEND, manager.config.LogFileMode)
	
	if err != nil {
		log.Printf("[GORM-LOG-ERROR] Failed to open log file: %v", err)
		return
	}
	
	manager.file = file
	log.SetOutput(file)
	log.Printf("[GORM-LOG-INFO] File logging enabled | File: %s", manager.config.LogFilePath)
}

// CreateLogger creates a new GORM logger instance for a request
func (manager *GormLoggingManager) CreateLogger(requestID, userID, tenantID string) *EnhancedGormLogger {
	return NewEnhancedGormLogger(manager.config, requestID, userID, tenantID)
}

// GetGormConfig returns GORM configuration with logging
func (manager *GormLoggingManager) GetGormConfig(requestID, userID, tenantID string) *gorm.Config {
	logger := manager.CreateLogger(requestID, userID, tenantID)
	
	return &gorm.Config{
		Logger: logger,
		DryRun: false,
	}
}

// Close closes the logging manager and any open files
func (manager *GormLoggingManager) Close() error {
	if manager.file != nil {
		return manager.file.Close()
	}
	return nil
}

// GormMetricsCollector collects GORM-specific metrics
type GormMetricsCollector struct {
	TotalQueries     int64
	SlowQueries      int64
	FailedQueries    int64
	TotalDuration    time.Duration
	LastQueryTime    time.Time
	QueryTypes       map[string]int64
	TableAccess      map[string]int64
}

// NewGormMetricsCollector creates a new metrics collector
func NewGormMetricsCollector() *GormMetricsCollector {
	return &GormMetricsCollector{
		QueryTypes:  make(map[string]int64),
		TableAccess: make(map[string]int64),
	}
}

// RecordQuery records a query for metrics
func (c *GormMetricsCollector) RecordQuery(operation, table string, duration time.Duration, err error) {
	c.TotalQueries++
	c.TotalDuration += duration
	c.LastQueryTime = time.Now()
	
	// Track query types
	c.QueryTypes[operation]++
	
	// Track table access
	if table != "" && table != "unknown" {
		c.TableAccess[table]++
	}
	
	// Track slow queries
	if duration > 200*time.Millisecond {
		c.SlowQueries++
	}
	
	// Track failed queries
	if err != nil {
		c.FailedQueries++
	}
}

// GetMetrics returns current metrics
func (c *GormMetricsCollector) GetMetrics() map[string]interface{} {
	avgDuration := time.Duration(0)
	if c.TotalQueries > 0 {
		avgDuration = time.Duration(c.TotalDuration.Nanoseconds() / c.TotalQueries)
	}
	
	return map[string]interface{}{
		"total_queries":   c.TotalQueries,
		"slow_queries":    c.SlowQueries,
		"failed_queries":  c.FailedQueries,
		"total_duration":  c.TotalDuration,
		"avg_duration":    avgDuration,
		"last_query_time": c.LastQueryTime,
		"query_types":     c.QueryTypes,
		"table_access":    c.TableAccess,
	}
}

// LogMetrics logs current metrics
func (c *GormMetricsCollector) LogMetrics() {
	metrics := c.GetMetrics()
	
	log.Printf("[GORM-METRICS] Total: %d | Slow: %d | Failed: %d | Avg Duration: %v | Last Query: %v",
		metrics["total_queries"], metrics["slow_queries"], metrics["failed_queries"], 
		metrics["avg_duration"], metrics["last_query_time"])
	
	log.Printf("[GORM-METRICS] Query Types: %+v", metrics["query_types"])
	log.Printf("[GORM-METRICS] Table Access: %+v", metrics["table_access"])
}

// Global GORM logging manager instance
var globalGormLoggingManager *GormLoggingManager
var globalGormMetricsCollector *GormMetricsCollector

// InitializeGormLogging initializes global GORM logging
func InitializeGormLogging(config *GormLoggingConfig) {
	globalGormLoggingManager = NewGormLoggingManager(config)
	globalGormMetricsCollector = NewGormMetricsCollector()
	
	log.Printf("[GORM-LOG-INFO] GORM logging initialized | Level: %v | SlowQueryThreshold: %v", 
		config.LogLevel, config.SlowQueryThreshold)
}

// GetGormLoggingManager returns the global GORM logging manager
func GetGormLoggingManager() *GormLoggingManager {
	return globalGormLoggingManager
}

// GetGormMetricsCollector returns the global GORM metrics collector
func GetGormMetricsCollector() *GormMetricsCollector {
	return globalGormMetricsCollector
}

// LogGormMetrics logs current GORM metrics
func LogGormMetrics() {
	if globalGormMetricsCollector != nil {
		globalGormMetricsCollector.LogMetrics()
	}
}
