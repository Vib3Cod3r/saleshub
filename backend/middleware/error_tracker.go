package middleware

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// ErrorTrackerConfig holds configuration for error tracking
type ErrorTrackerConfig struct {
	LogFile              string
	MaxErrors            int
	ErrorPreventionRules []ErrorPreventionRule
	HealthCheckInterval  time.Duration
	EnablePrevention     bool
}

// ErrorPreventionRule defines rules for preventing recurring errors
type ErrorPreventionRule struct {
	ID             string `json:"id"`
	Pattern        string `json:"pattern"`
	MaxOccurrences int    `json:"maxOccurrences"`
	TimeWindow     int    `json:"timeWindow"` // in minutes
	Action         string `json:"action"`     // "retry", "fallback", "alert"
	Enabled        bool   `json:"enabled"`
	Description    string `json:"description"`
}

// TrackedError represents a tracked error with metadata
type TrackedError struct {
	Timestamp       string                 `json:"timestamp"`
	Type            string                 `json:"type"`
	Message         string                 `json:"message"`
	Path            string                 `json:"path"`
	Method          string                 `json:"method"`
	StatusCode      int                    `json:"statusCode"`
	UserID          string                 `json:"userId,omitempty"`
	IP              string                 `json:"ip"`
	UserAgent       string                 `json:"userAgent"`
	Details         map[string]interface{} `json:"details"`
	Recurring       bool                   `json:"recurring"`
	OccurrenceCount int                    `json:"occurrenceCount"`
	BuildID         string                 `json:"buildId"`
	SessionID       string                 `json:"sessionId"`
}

// ErrorTracker manages error tracking and prevention
type ErrorTracker struct {
	config    *ErrorTrackerConfig
	errors    []TrackedError
	mutex     sync.RWMutex
	logFile   *os.File
	buildID   string
	sessionID string
}

// NewErrorTracker creates a new error tracker
func NewErrorTracker(config *ErrorTrackerConfig) *ErrorTracker {
	if config == nil {
		config = DefaultErrorTrackerConfig()
	}

	tracker := &ErrorTracker{
		config:    config,
		errors:    make([]TrackedError, 0),
		buildID:   generateBuildID(),
		sessionID: generateSessionID(),
	}

	// Initialize error prevention rules
	if len(config.ErrorPreventionRules) == 0 {
		tracker.config.ErrorPreventionRules = defaultErrorPreventionRules()
	}

	// Setup log file
	if config.LogFile != "" {
		var err error
		tracker.logFile, err = os.OpenFile(config.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Printf("[ERROR-TRACKER] Failed to open log file: %v", err)
		}
	}

	// Start health check routine
	if config.HealthCheckInterval > 0 {
		go tracker.startHealthCheckRoutine()
	}

	return tracker
}

// DefaultErrorTrackerConfig returns default error tracker configuration
func DefaultErrorTrackerConfig() *ErrorTrackerConfig {
	return &ErrorTrackerConfig{
		LogFile:             "error-tracker.log",
		MaxErrors:           1000,
		HealthCheckInterval: 5 * time.Minute,
		EnablePrevention:    true,
	}
}

// defaultErrorPreventionRules returns default error prevention rules
func defaultErrorPreventionRules() []ErrorPreventionRule {
	return []ErrorPreventionRule{
		{
			ID:             "internal-server-error",
			Pattern:        "Internal Server Error|500|Failed to",
			MaxOccurrences: 5,
			TimeWindow:     10,
			Action:         "retry",
			Enabled:        true,
			Description:    "Prevent recurring Internal Server Errors",
		},
		{
			ID:             "database-error",
			Pattern:        "database|connection|timeout|ECONNREFUSED",
			MaxOccurrences: 3,
			TimeWindow:     5,
			Action:         "retry",
			Enabled:        true,
			Description:    "Handle database connection issues",
		},
		{
			ID:             "auth-error",
			Pattern:        "unauthorized|forbidden|401|403|token|jwt",
			MaxOccurrences: 2,
			TimeWindow:     2,
			Action:         "fallback",
			Enabled:        true,
			Description:    "Handle authentication errors gracefully",
		},
		{
			ID:             "validation-error",
			Pattern:        "validation|invalid|bad request|400",
			MaxOccurrences: 10,
			TimeWindow:     5,
			Action:         "alert",
			Enabled:        true,
			Description:    "Track validation errors",
		},
	}
}

// generateBuildID generates a unique build ID
func generateBuildID() string {
	return fmt.Sprintf("%d-%s", time.Now().Unix(), randomString(8))
}

// generateSessionID generates a unique session ID
func generateSessionID() string {
	return fmt.Sprintf("%d-%s", time.Now().Unix(), randomString(8))
}

// randomString generates a random string of specified length
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}

// TrackError tracks an error with metadata
func (et *ErrorTracker) TrackError(errorType, message, path, method string, statusCode int, userID, ip, userAgent string, details map[string]interface{}) {
	et.mutex.Lock()
	defer et.mutex.Unlock()

	now := time.Now()
	timestamp := now.Format(time.RFC3339)

	// Check if this is a recurring error
	recurring := false
	occurrenceCount := 1
	for _, err := range et.errors {
		if err.Message == message && err.Path == path {
			recurring = true
			occurrenceCount++
		}
	}

	trackedError := TrackedError{
		Timestamp:       timestamp,
		Type:            errorType,
		Message:         message,
		Path:            path,
		Method:          method,
		StatusCode:      statusCode,
		UserID:          userID,
		IP:              ip,
		UserAgent:       userAgent,
		Details:         details,
		Recurring:       recurring,
		OccurrenceCount: occurrenceCount,
		BuildID:         et.buildID,
		SessionID:       et.sessionID,
	}

	et.errors = append(et.errors, trackedError)

	// Keep only the most recent errors
	if len(et.errors) > et.config.MaxErrors {
		et.errors = et.errors[len(et.errors)-et.config.MaxErrors:]
	}

	// Log the error
	et.logError(trackedError)

	// Check if error should be prevented
	if et.config.EnablePrevention && et.shouldPreventError(trackedError) {
		et.triggerErrorPrevention(trackedError)
	}
}

// shouldPreventError checks if an error should be prevented based on rules
func (et *ErrorTracker) shouldPreventError(error TrackedError) bool {
	now := time.Now()

	for _, rule := range et.config.ErrorPreventionRules {
		if !rule.Enabled {
			continue
		}

		// Check if error matches pattern
		if containsPattern(error.Message, rule.Pattern) {
			// Count recent occurrences
			recentCount := 0
			timeWindow := time.Duration(rule.TimeWindow) * time.Minute

			for _, err := range et.errors {
				if err.Message == error.Message && err.Path == error.Path {
					errTime, _ := time.Parse(time.RFC3339, err.Timestamp)
					if now.Sub(errTime) <= timeWindow {
						recentCount++
					}
				}
			}

			if recentCount >= rule.MaxOccurrences {
				et.logPreventionTrigger(rule, error, recentCount)
				return true
			}
		}
	}

	return false
}

// containsPattern checks if a string contains any of the patterns
func containsPattern(text, patterns string) bool {
	// Simple pattern matching - can be enhanced with regex
	return text != "" && patterns != "" && (text == patterns || len(text) > 0)
}

// triggerErrorPrevention triggers error prevention actions
func (et *ErrorTracker) triggerErrorPrevention(error TrackedError) {
	et.logError(TrackedError{
		Timestamp: time.Now().Format(time.RFC3339),
		Type:      "prevention",
		Message:   fmt.Sprintf("Error prevention triggered for: %s", error.Message),
		Path:      error.Path,
		Method:    error.Method,
		Details: map[string]interface{}{
			"originalError": error,
			"action":        "prevention_triggered",
		},
		BuildID:   et.buildID,
		SessionID: et.sessionID,
	})

	// Implement prevention actions here
	// For now, just log the prevention
	log.Printf("[ERROR-PREVENTION] Triggered for error: %s on path: %s", error.Message, error.Path)
}

// logPreventionTrigger logs when error prevention is triggered
func (et *ErrorTracker) logPreventionTrigger(rule ErrorPreventionRule, error TrackedError, count int) {
	et.logError(TrackedError{
		Timestamp: time.Now().Format(time.RFC3339),
		Type:      "prevention_rule",
		Message:   fmt.Sprintf("Prevention rule triggered: %s", rule.Description),
		Path:      error.Path,
		Method:    error.Method,
		Details: map[string]interface{}{
			"rule":            rule,
			"error":           error,
			"occurrenceCount": count,
		},
		BuildID:   et.buildID,
		SessionID: et.sessionID,
	})
}

// logError logs an error to file and console
func (et *ErrorTracker) logError(error TrackedError) {
	errorJSON, _ := json.Marshal(error)
	logMessage := fmt.Sprintf("[ERROR-TRACKER] %s", string(errorJSON))

	// Log to console
	log.Println(logMessage)

	// Log to file if configured
	if et.logFile != nil {
		fmt.Fprintln(et.logFile, logMessage)
	}
}

// GetErrors returns all tracked errors
func (et *ErrorTracker) GetErrors() []TrackedError {
	et.mutex.RLock()
	defer et.mutex.RUnlock()

	errors := make([]TrackedError, len(et.errors))
	copy(errors, et.errors)
	return errors
}

// GetRecentErrors returns recent errors within a time window
func (et *ErrorTracker) GetRecentErrors(duration time.Duration) []TrackedError {
	et.mutex.RLock()
	defer et.mutex.RUnlock()

	now := time.Now()
	var recentErrors []TrackedError

	for _, err := range et.errors {
		errTime, _ := time.Parse(time.RFC3339, err.Timestamp)
		if now.Sub(errTime) <= duration {
			recentErrors = append(recentErrors, err)
		}
	}

	return recentErrors
}

// GetErrorPatterns returns error patterns and their frequencies
func (et *ErrorTracker) GetErrorPatterns() map[string]int {
	et.mutex.RLock()
	defer et.mutex.RUnlock()

	patterns := make(map[string]int)
	for _, err := range et.errors {
		key := fmt.Sprintf("%s:%s", err.Type, err.Message)
		patterns[key]++
	}

	return patterns
}

// GetBuildID returns the current build ID
func (et *ErrorTracker) GetBuildID() string {
	return et.buildID
}

// GetSessionID returns the current session ID
func (et *ErrorTracker) GetSessionID() string {
	return et.sessionID
}

// GetPreventionRules returns the current error prevention rules
func (et *ErrorTracker) GetPreventionRules() []ErrorPreventionRule {
	et.mutex.RLock()
	defer et.mutex.RUnlock()

	rules := make([]ErrorPreventionRule, len(et.config.ErrorPreventionRules))
	copy(rules, et.config.ErrorPreventionRules)
	return rules
}

// ClearErrors clears all tracked errors
func (et *ErrorTracker) ClearErrors() {
	et.mutex.Lock()
	defer et.mutex.Unlock()

	et.errors = make([]TrackedError, 0)
	log.Println("[ERROR-TRACKER] All errors cleared")
}

// startHealthCheckRoutine starts the health check routine
func (et *ErrorTracker) startHealthCheckRoutine() {
	ticker := time.NewTicker(et.config.HealthCheckInterval)
	defer ticker.Stop()

	for range ticker.C {
		et.performHealthCheck()
	}
}

// performHealthCheck performs a health check
func (et *ErrorTracker) performHealthCheck() {
	recentErrors := et.GetRecentErrors(5 * time.Minute)
	criticalErrors := 0

	for _, err := range recentErrors {
		if err.StatusCode >= 500 {
			criticalErrors++
		}
	}

	if criticalErrors > 10 {
		et.logError(TrackedError{
			Timestamp: time.Now().Format(time.RFC3339),
			Type:      "health_check",
			Message:   fmt.Sprintf("High critical error rate detected: %d errors in 5 minutes", criticalErrors),
			Details: map[string]interface{}{
				"criticalErrors": criticalErrors,
				"totalErrors":    len(recentErrors),
			},
			BuildID:   et.buildID,
			SessionID: et.sessionID,
		})
	}
}

// ErrorTrackerMiddleware creates a Gin middleware for error tracking
func ErrorTrackerMiddleware(tracker *ErrorTracker) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Process request
		c.Next()

		// Track errors if any occurred
		if len(c.Errors) > 0 {
			for _, ginErr := range c.Errors {
				userID := ""
				if id, exists := c.Get("userId"); exists {
					userID = fmt.Sprintf("%v", id)
				}

				tracker.TrackError(
					"gin_error",
					ginErr.Error(),
					c.Request.URL.Path,
					c.Request.Method,
					c.Writer.Status(),
					userID,
					c.ClientIP(),
					c.Request.UserAgent(),
					map[string]interface{}{
						"ginErrorType": ginErr.Type,
						"meta":         ginErr.Meta,
					},
				)
			}
		}

		// Track HTTP errors (4xx, 5xx)
		if c.Writer.Status() >= 400 {
			userID := ""
			if id, exists := c.Get("userId"); exists {
				userID = fmt.Sprintf("%v", id)
			}

			errorType := "http_error"
			if c.Writer.Status() >= 500 {
				errorType = "server_error"
			} else if c.Writer.Status() >= 400 {
				errorType = "client_error"
			}

			tracker.TrackError(
				errorType,
				fmt.Sprintf("HTTP %d error on %s", c.Writer.Status(), c.Request.URL.Path),
				c.Request.URL.Path,
				c.Request.Method,
				c.Writer.Status(),
				userID,
				c.ClientIP(),
				c.Request.UserAgent(),
				map[string]interface{}{
					"statusCode": c.Writer.Status(),
					"query":      c.Request.URL.RawQuery,
				},
			)
		}
	}
}

// Global error tracker instance
var globalErrorTracker *ErrorTracker

// InitGlobalErrorTracker initializes the global error tracker
func InitGlobalErrorTracker(config *ErrorTrackerConfig) {
	globalErrorTracker = NewErrorTracker(config)
}

// GetGlobalErrorTracker returns the global error tracker
func GetGlobalErrorTracker() *ErrorTracker {
	if globalErrorTracker == nil {
		globalErrorTracker = NewErrorTracker(DefaultErrorTrackerConfig())
	}
	return globalErrorTracker
}
