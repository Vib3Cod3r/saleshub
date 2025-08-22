package handlers

import (
	"net/http"
	"time"

	"saleshub-backend/middleware"

	"github.com/gin-gonic/gin"
)

// GetErrorTrackerData returns error tracking data
func GetErrorTrackerData(c *gin.Context) {
	tracker := middleware.GetGlobalErrorTracker()

	// Get query parameters
	durationStr := c.Query("duration")
	if durationStr == "" {
		durationStr = "1h" // Default to 1 hour
	}

	var duration time.Duration
	var err error

	switch durationStr {
	case "1h":
		duration = 1 * time.Hour
	case "6h":
		duration = 6 * time.Hour
	case "24h":
		duration = 24 * time.Hour
	case "7d":
		duration = 7 * 24 * time.Hour
	default:
		duration, err = time.ParseDuration(durationStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid duration format. Use: 1h, 6h, 24h, 7d, or duration string",
			})
			return
		}
	}

	// Get recent errors
	recentErrors := tracker.GetRecentErrors(duration)

	// Get error patterns
	patterns := tracker.GetErrorPatterns()

	// Calculate statistics
	totalErrors := len(recentErrors)
	criticalErrors := 0
	serverErrors := 0
	clientErrors := 0

	for _, err := range recentErrors {
		if err.StatusCode >= 500 {
			criticalErrors++
			serverErrors++
		} else if err.StatusCode >= 400 {
			clientErrors++
		}
	}

	// Build response
	response := gin.H{
		"data": gin.H{
			"totalErrors":    totalErrors,
			"criticalErrors": criticalErrors,
			"serverErrors":   serverErrors,
			"clientErrors":   clientErrors,
			"duration":       duration.String(),
			"recentErrors":   recentErrors,
			"patterns":       patterns,
			"buildId":        tracker.GetBuildID(),
			"sessionId":      tracker.GetSessionID(),
		},
		"message": "Error tracking data retrieved successfully",
	}

	c.JSON(http.StatusOK, response)
}

// GetErrorTrackerHealth returns error tracker health status
func GetErrorTrackerHealth(c *gin.Context) {
	tracker := middleware.GetGlobalErrorTracker()

	// Get recent errors (last 5 minutes)
	recentErrors := tracker.GetRecentErrors(5 * time.Minute)
	criticalErrors := 0

	for _, err := range recentErrors {
		if err.StatusCode >= 500 {
			criticalErrors++
		}
	}

	// Determine health status
	healthStatus := "healthy"
	if criticalErrors > 10 {
		healthStatus = "unhealthy"
	} else if criticalErrors > 5 {
		healthStatus = "degraded"
	}

	response := gin.H{
		"data": gin.H{
			"status":         healthStatus,
			"criticalErrors": criticalErrors,
			"totalErrors":    len(recentErrors),
			"timeWindow":     "5 minutes",
		},
		"message": "Error tracker health status retrieved successfully",
	}

	c.JSON(http.StatusOK, response)
}

// ClearErrorTrackerData clears all tracked errors
func ClearErrorTrackerData(c *gin.Context) {
	tracker := middleware.GetGlobalErrorTracker()
	tracker.ClearErrors()

	c.JSON(http.StatusOK, gin.H{
		"message": "Error tracking data cleared successfully",
	})
}

// GetErrorPreventionRules returns current error prevention rules
func GetErrorPreventionRules(c *gin.Context) {
	tracker := middleware.GetGlobalErrorTracker()
	rules := tracker.GetPreventionRules()

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"rules": rules,
		},
		"message": "Error prevention rules retrieved successfully",
	})
}
