package config

import (
	"log"
	"os"
	"time"
)

// LoggingConfig holds configuration for database logging
type LoggingConfig struct {
	LogLevel           string
	LogFile            string
	SlowQueryThreshold time.Duration
	EnableMetrics      bool
	EnableHealthChecks bool
}

// DefaultLoggingConfig returns default logging configuration
func DefaultLoggingConfig() *LoggingConfig {
	return &LoggingConfig{
		LogLevel:           "INFO",
		LogFile:            "database.log",
		SlowQueryThreshold: 200 * time.Millisecond,
		EnableMetrics:      true,
		EnableHealthChecks: true,
	}
}

// SetupDatabaseLogging configures database logging
func SetupDatabaseLogging(config *LoggingConfig) {
	// Create log file if specified
	if config.LogFile != "" {
		file, err := os.OpenFile(config.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Printf("[DB-LOG-ERROR] Failed to open log file: %v", err)
		} else {
			log.SetOutput(file)
		}
	}

	log.Printf("[DB-LOG-INFO] Database logging configured | Level: %s | File: %s | SlowQueryThreshold: %v", 
		config.LogLevel, config.LogFile, config.SlowQueryThreshold)
}

// LogDatabaseEvent logs a database event with structured format
func LogDatabaseEvent(eventType, operation, table, tenantID string, duration time.Duration, err error, metadata map[string]interface{}) {
	event := map[string]interface{}{
		"timestamp":   time.Now().Format(time.RFC3339),
		"event_type":  eventType,
		"operation":   operation,
		"table":       table,
		"tenant_id":   tenantID,
		"duration_ms": duration.Milliseconds(),
		"error":       err,
		"metadata":    metadata,
	}

	if err != nil {
		log.Printf("[DB-EVENT-ERROR] %+v", event)
	} else {
		log.Printf("[DB-EVENT-SUCCESS] %+v", event)
	}
}

// LogDatabasePerformance logs performance metrics
func LogDatabasePerformance(operation, table string, duration time.Duration, rowsAffected int64) {
	metrics := GetDatabaseMetrics()
	
	log.Printf("[DB-PERFORMANCE] %s | Table: %s | Duration: %v | Rows: %d | Total Queries: %d | Avg Duration: %v", 
		operation, table, duration, rowsAffected, metrics.TotalQueries, 
		time.Duration(metrics.TotalDuration.Nanoseconds()/metrics.TotalQueries))
}

// LogDatabaseConnection logs connection events
func LogDatabaseConnection(event string, details map[string]interface{}) {
	log.Printf("[DB-CONNECTION] %s | Details: %+v", event, details)
}

// LogDatabaseMigration logs migration events
func LogDatabaseMigration(operation, table string, duration time.Duration, err error) {
	if err != nil {
		log.Printf("[DB-MIGRATION-ERROR] %s | Table: %s | Duration: %v | Error: %v", 
			operation, table, duration, err)
	} else {
		log.Printf("[DB-MIGRATION-SUCCESS] %s | Table: %s | Duration: %v", 
			operation, table, duration)
	}
}

// LogDatabaseSeed logs seeding events
func LogDatabaseSeed(operation, table string, recordsCreated int, duration time.Duration, err error) {
	if err != nil {
		log.Printf("[DB-SEED-ERROR] %s | Table: %s | Records: %d | Duration: %v | Error: %v", 
			operation, table, recordsCreated, duration, err)
	} else {
		log.Printf("[DB-SEED-SUCCESS] %s | Table: %s | Records: %d | Duration: %v", 
			operation, table, recordsCreated, duration)
	}
}
