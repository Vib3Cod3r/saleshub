package lib

import (
	"log"
	"time"
)

// APILogger provides simple API logging functionality
type APILogger struct{}

// NewAPILogger creates a new API logger instance
func NewAPILogger() *APILogger {
	return &APILogger{}
}

// LogRequest logs an API request
func (l *APILogger) LogRequest(method, path, userID, tenantID, ipAddress string, duration time.Duration, statusCode int) {
	log.Printf("[API-REQUEST] %s %s | User: %s | Tenant: %s | IP: %s | Duration: %v | Status: %d",
		method, path, userID, tenantID, ipAddress, duration, statusCode)
}

// LogError logs an API error
func (l *APILogger) LogError(operation, path, userID, tenantID string, err error) {
	log.Printf("[API-ERROR] %s | Path: %s | User: %s | Tenant: %s | Error: %v",
		operation, path, userID, tenantID, err)
}

// LogAuthentication logs authentication events
func (l *APILogger) LogAuthentication(event, email, userID, tenantID, ipAddress string, success bool) {
	if success {
		log.Printf("[API-AUTH-SUCCESS] %s | Email: %s | User: %s | Tenant: %s | IP: %s",
			event, email, userID, tenantID, ipAddress)
	} else {
		log.Printf("[API-AUTH-FAILURE] %s | Email: %s | User: %s | Tenant: %s | IP: %s",
			event, email, userID, tenantID, ipAddress)
	}
}

// LogSecurity logs security-related events
func (l *APILogger) LogSecurity(event, path, userID, tenantID, ipAddress string) {
	log.Printf("[API-SECURITY] %s | Path: %s | User: %s | Tenant: %s | IP: %s",
		event, path, userID, tenantID, ipAddress)
}

// LogPerformance logs performance metrics
func (l *APILogger) LogPerformance(operation, path string, duration time.Duration, statusCode int, userID string) {
	if duration > 5*time.Second {
		log.Printf("[API-SLOW] %s | Path: %s | Duration: %v | Status: %d | User: %s",
			operation, path, duration, statusCode, userID)
	} else {
		log.Printf("[API-PERFORMANCE] %s | Path: %s | Duration: %v | Status: %d | User: %s",
			operation, path, duration, statusCode, userID)
	}
}

// LogDatabaseOperation logs database operations
func (l *APILogger) LogDatabaseOperation(operation, table, userID, tenantID string, duration time.Duration, err error) {
	if err != nil {
		log.Printf("[API-DB-ERROR] %s | Table: %s | User: %s | Tenant: %s | Duration: %v | Error: %v",
			operation, table, userID, tenantID, duration, err)
	} else {
		log.Printf("[API-DB-SUCCESS] %s | Table: %s | User: %s | Tenant: %s | Duration: %v",
			operation, table, userID, tenantID, duration)
	}
}

// LogRateLimit logs rate limiting events
func (l *APILogger) LogRateLimit(path, userID, tenantID, ipAddress string, limit, remaining int) {
	log.Printf("[API-RATE-LIMIT] %s | User: %s | Tenant: %s | IP: %s | Limit: %d | Remaining: %d",
		path, userID, tenantID, ipAddress, limit, remaining)
}

// Global API logger instance
var APILog = NewAPILogger()
