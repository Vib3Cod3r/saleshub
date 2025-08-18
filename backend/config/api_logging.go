package config

import (
	"log"
	"os"
	"time"
)

// APILoggingConfig holds comprehensive API logging configuration
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

// DefaultAPILoggingConfig returns default API logging configuration
func DefaultAPILoggingConfig() *APILoggingConfig {
	return &APILoggingConfig{
		Enabled:              true,
		LogFile:              "api.log",
		LogLevel:             "INFO",
		LogRequestBody:       true,
		LogResponseBody:      false, // Don't log response bodies by default for security
		LogHeaders:           false,
		LogUserInfo:          true,
		LogPerformance:       true,
		ExcludePaths:         []string{"/health", "/metrics", "/favicon.ico", "/api/health"},
		ExcludeMethods:       []string{"OPTIONS"},
		MaxBodySize:          1024 * 1024, // 1MB
		SlowRequestThreshold: 5 * time.Second,
		MetricsEnabled:       true,
		MetricsInterval:      5 * time.Minute,
	}
}

// SetupAPILogging configures API logging
func SetupAPILogging(config *APILoggingConfig) {
	if !config.Enabled {
		log.Printf("[API-LOG-INFO] API logging is disabled")
		return
	}

	// Create log file if specified
	if config.LogFile != "" {
		_, err := os.OpenFile(config.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Printf("[API-LOG-ERROR] Failed to open API log file: %v", err)
		} else {
			log.Printf("[API-LOG-INFO] API logging configured | File: %s | Level: %s", config.LogFile, config.LogLevel)
		}
	}

	// Start metrics logging if enabled
	if config.MetricsEnabled {
		go startMetricsLogging(config.MetricsInterval)
	}

	log.Printf("[API-LOG-INFO] API logging setup complete | SlowRequestThreshold: %v | MaxBodySize: %d bytes",
		config.SlowRequestThreshold, config.MaxBodySize)
}

// startMetricsLogging starts periodic metrics logging
func startMetricsLogging(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		log.Printf("[API-METRICS] Periodic metrics logging enabled")
	}
}

// LogAPIEvent logs a specific API event
func LogAPIEvent(eventType, operation, path, userID, tenantID string, duration time.Duration, statusCode int, err error, metadata map[string]interface{}) {
	event := map[string]interface{}{
		"timestamp":   time.Now().Format(time.RFC3339),
		"event_type":  eventType,
		"operation":   operation,
		"path":        path,
		"user_id":     userID,
		"tenant_id":   tenantID,
		"duration_ms": duration.Milliseconds(),
		"status_code": statusCode,
		"error":       err,
		"metadata":    metadata,
	}

	if err != nil || statusCode >= 400 {
		log.Printf("[API-EVENT-ERROR] %+v", event)
	} else {
		log.Printf("[API-EVENT-SUCCESS] %+v", event)
	}
}

// LogAPIPerformance logs API performance metrics
func LogAPIPerformance(operation, path string, duration time.Duration, statusCode int, userID string) {
	log.Printf("[API-PERFORMANCE] %s | Path: %s | Duration: %v | Status: %d | User: %s",
		operation, path, duration, statusCode, userID)
}

// LogAPISecurity logs security-related API events
func LogAPISecurity(event, path, userID, tenantID, ipAddress string, details map[string]interface{}) {
	securityLog := map[string]interface{}{
		"timestamp":  time.Now().Format(time.RFC3339),
		"event":      event,
		"path":       path,
		"user_id":    userID,
		"tenant_id":  tenantID,
		"ip_address": ipAddress,
		"details":    details,
	}

	log.Printf("[API-SECURITY] %+v", securityLog)
}

// LogAPIError logs API errors with detailed information
func LogAPIError(operation, path, userID, tenantID string, err error, requestData map[string]interface{}) {
	errorLog := map[string]interface{}{
		"timestamp":    time.Now().Format(time.RFC3339),
		"operation":    operation,
		"path":         path,
		"user_id":      userID,
		"tenant_id":    tenantID,
		"error":        err.Error(),
		"error_type":   "API_ERROR",
		"request_data": requestData,
	}

	log.Printf("[API-ERROR] %+v", errorLog)
}

// LogAPIAuthentication logs authentication events
func LogAPIAuthentication(event, email, userID, tenantID, ipAddress string, success bool, details map[string]interface{}) {
	authLog := map[string]interface{}{
		"timestamp":  time.Now().Format(time.RFC3339),
		"event":      event,
		"email":      email,
		"user_id":    userID,
		"tenant_id":  tenantID,
		"ip_address": ipAddress,
		"success":    success,
		"details":    details,
	}

	if success {
		log.Printf("[API-AUTH-SUCCESS] %+v", authLog)
	} else {
		log.Printf("[API-AUTH-FAILURE] %+v", authLog)
	}
}

// LogAPIRateLimit logs rate limiting events
func LogAPIRateLimit(path, userID, tenantID, ipAddress string, limit, remaining int, resetTime time.Time) {
	rateLimitLog := map[string]interface{}{
		"timestamp":  time.Now().Format(time.RFC3339),
		"path":       path,
		"user_id":    userID,
		"tenant_id":  tenantID,
		"ip_address": ipAddress,
		"limit":      limit,
		"remaining":  remaining,
		"reset_time": resetTime.Format(time.RFC3339),
	}

	log.Printf("[API-RATE-LIMIT] %+v", rateLimitLog)
}
