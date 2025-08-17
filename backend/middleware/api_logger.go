package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// APILoggerConfig holds configuration for API logging
type APILoggerConfig struct {
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
}

// DefaultAPILoggerConfig returns default API logging configuration
func DefaultAPILoggerConfig() *APILoggerConfig {
	return &APILoggerConfig{
		LogFile:              "api.log",
		LogLevel:             "INFO",
		LogRequestBody:       true,
		LogResponseBody:      false, // Don't log response bodies by default for security
		LogHeaders:           false,
		LogUserInfo:          true,
		LogPerformance:       true,
		ExcludePaths:         []string{"/health", "/metrics", "/favicon.ico"},
		ExcludeMethods:       []string{"OPTIONS"},
		MaxBodySize:          1024 * 1024, // 1MB
		SlowRequestThreshold: 5 * time.Second,
	}
}

// APILogger middleware logs API requests and responses
func APILogger(config *APILoggerConfig) gin.HandlerFunc {
	// Setup log file if specified
	var logFile *os.File
	if config.LogFile != "" {
		var err error
		logFile, err = os.OpenFile(config.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			log.Printf("[API-LOG-ERROR] Failed to open log file: %v", err)
		}
	}

	return func(c *gin.Context) {
		start := time.Now()

		// Check if we should skip logging for this request
		if shouldSkipLogging(c, config) {
			c.Next()
			return
		}

		// Capture request details
		requestLog := captureRequestLog(c, config)

		// Capture response
		responseWriter := &responseBodyWriter{
			ResponseWriter: c.Writer,
			body:           &bytes.Buffer{},
		}
		c.Writer = responseWriter

		// Process request
		c.Next()

		// Calculate duration
		duration := time.Since(start)

		// Capture response details
		responseLog := captureResponseLog(c, responseWriter, duration, config)

		// Log the complete API interaction
		logAPIInteraction(requestLog, responseLog, config, logFile)
	}
}

// shouldSkipLogging determines if logging should be skipped for this request
func shouldSkipLogging(c *gin.Context, config *APILoggerConfig) bool {
	path := c.Request.URL.Path
	method := c.Request.Method

	// Check excluded paths
	for _, excludedPath := range config.ExcludePaths {
		if strings.HasPrefix(path, excludedPath) {
			return true
		}
	}

	// Check excluded methods
	for _, excludedMethod := range config.ExcludeMethods {
		if method == excludedMethod {
			return true
		}
	}

	return false
}

// captureRequestLog captures request information
func captureRequestLog(c *gin.Context, config *APILoggerConfig) map[string]interface{} {
	requestLog := map[string]interface{}{
		"timestamp":      time.Now().Format(time.RFC3339),
		"method":         c.Request.Method,
		"path":           c.Request.URL.Path,
		"query":          c.Request.URL.RawQuery,
		"remote_addr":    c.ClientIP(),
		"user_agent":     c.Request.UserAgent(),
		"content_type":   c.GetHeader("Content-Type"),
		"content_length": c.Request.ContentLength,
	}

	// Add headers if configured
	if config.LogHeaders {
		headers := make(map[string]string)
		for key, values := range c.Request.Header {
			headers[key] = strings.Join(values, ", ")
		}
		requestLog["headers"] = headers
	}

	// Add user info if available and configured
	if config.LogUserInfo {
		if userID, exists := c.Get("userId"); exists {
			requestLog["user_id"] = userID
		}
		if tenantID, exists := c.Get("tenantID"); exists {
			requestLog["tenant_id"] = tenantID
		}
		if email, exists := c.Get("email"); exists {
			requestLog["user_email"] = email
		}
	}

	// Add request body if configured
	if config.LogRequestBody && c.Request.Body != nil {
		body, err := io.ReadAll(c.Request.Body)
		if err == nil && len(body) > 0 {
			// Truncate body if it's too large
			if int64(len(body)) > config.MaxBodySize {
				body = body[:config.MaxBodySize]
				requestLog["body_truncated"] = true
			}

			// Try to parse as JSON for better logging
			var jsonBody interface{}
			if json.Unmarshal(body, &jsonBody) == nil {
				requestLog["body"] = jsonBody
			} else {
				requestLog["body"] = string(body)
			}
		}
		// Restore the body for subsequent middleware/handlers
		c.Request.Body = io.NopCloser(bytes.NewBuffer(body))
	}

	return requestLog
}

// captureResponseLog captures response information
func captureResponseLog(c *gin.Context, responseWriter *responseBodyWriter, duration time.Duration, config *APILoggerConfig) map[string]interface{} {
	responseLog := map[string]interface{}{
		"status_code":    c.Writer.Status(),
		"duration_ms":    duration.Milliseconds(),
		"duration":       duration.String(),
		"content_type":   c.Writer.Header().Get("Content-Type"),
		"content_length": c.Writer.Size(),
	}

	// Add performance indicators
	if config.LogPerformance {
		responseLog["is_slow"] = duration > config.SlowRequestThreshold
	}

	// Add response body if configured
	if config.LogResponseBody && responseWriter.body.Len() > 0 {
		body := responseWriter.body.Bytes()

		// Truncate body if it's too large
		if int64(len(body)) > config.MaxBodySize {
			body = body[:config.MaxBodySize]
			responseLog["body_truncated"] = true
		}

		// Try to parse as JSON for better logging
		var jsonBody interface{}
		if json.Unmarshal(body, &jsonBody) == nil {
			responseLog["body"] = jsonBody
		} else {
			responseLog["body"] = string(body)
		}
	}

	return responseLog
}

// logAPIInteraction logs the complete API interaction
func logAPIInteraction(requestLog, responseLog map[string]interface{}, config *APILoggerConfig, logFile *os.File) {
	// Combine request and response logs
	apiLog := map[string]interface{}{
		"request":  requestLog,
		"response": responseLog,
	}

	// Determine log level and format
	logLevel := "INFO"
	if responseLog["status_code"].(int) >= 400 {
		logLevel = "ERROR"
	} else if responseLog["is_slow"] == true {
		logLevel = "WARN"
	}

	// Format the log message
	logMessage := formatAPILogMessage(apiLog, logLevel)

	// Write to appropriate output
	if logFile != nil {
		log.SetOutput(logFile)
		log.Printf("[API-%s] %s", logLevel, logMessage)
		// Reset to stdout for other logs
		log.SetOutput(os.Stdout)
	} else {
		log.Printf("[API-%s] %s", logLevel, logMessage)
	}
}

// formatAPILogMessage formats the API log message
func formatAPILogMessage(apiLog map[string]interface{}, logLevel string) string {
	request := apiLog["request"].(map[string]interface{})
	response := apiLog["response"].(map[string]interface{})

	// Basic info
	message := fmt.Sprintf("%s %s | Status: %d | Duration: %s | IP: %s",
		request["method"], request["path"], response["status_code"],
		response["duration"], request["remote_addr"])

	// Add user info if available
	if userID, exists := request["user_id"]; exists {
		message += fmt.Sprintf(" | User: %s", userID)
	}
	if tenantID, exists := request["tenant_id"]; exists {
		message += fmt.Sprintf(" | Tenant: %s", tenantID)
	}

	// Add performance warning for slow requests
	if response["is_slow"] == true {
		message += " | SLOW_REQUEST"
	}

	// Add error details for failed requests
	if response["status_code"].(int) >= 400 {
		if body, exists := response["body"]; exists {
			message += fmt.Sprintf(" | Error: %v", body)
		}
	}

	return message
}

// responseBodyWriter captures the response body
type responseBodyWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w *responseBodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func (w *responseBodyWriter) WriteString(s string) (int, error) {
	w.body.WriteString(s)
	return w.ResponseWriter.WriteString(s)
}

// APIMetrics holds API performance metrics
type APIMetrics struct {
	TotalRequests       int64
	SuccessfulRequests  int64
	FailedRequests      int64
	SlowRequests        int64
	AverageResponseTime time.Duration
	TotalResponseTime   time.Duration
}

var apiMetrics = &APIMetrics{}

// GetAPIMetrics returns current API metrics
func GetAPIMetrics() *APIMetrics {
	return apiMetrics
}

// ResetAPIMetrics resets API metrics
func ResetAPIMetrics() {
	apiMetrics = &APIMetrics{}
}

// LogAPIMetrics logs current API metrics
func LogAPIMetrics() {
	metrics := GetAPIMetrics()
	if metrics.TotalRequests > 0 {
		avgTime := time.Duration(metrics.TotalResponseTime.Nanoseconds() / metrics.TotalRequests)
		log.Printf("[API-METRICS] Total: %d | Success: %d | Failed: %d | Slow: %d | Avg Time: %v",
			metrics.TotalRequests, metrics.SuccessfulRequests, metrics.FailedRequests,
			metrics.SlowRequests, avgTime)
	}
}
