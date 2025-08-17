package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"saleshub-backend/config"
	"saleshub-backend/middleware"
)

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string                 `json:"status"`
	Timestamp time.Time              `json:"timestamp"`
	Database  DatabaseHealthInfo     `json:"database"`
	Metrics   DatabaseMetricsInfo    `json:"metrics"`
	Uptime    time.Duration          `json:"uptime"`
	Version   string                 `json:"version"`
	Details   map[string]interface{} `json:"details,omitempty"`
}

// DatabaseHealthInfo represents database health information
type DatabaseHealthInfo struct {
	Status       string        `json:"status"`
	Connected    bool          `json:"connected"`
	ResponseTime time.Duration `json:"responseTime"`
	Error        string        `json:"error,omitempty"`
}

// DatabaseMetricsInfo represents database metrics information
type DatabaseMetricsInfo struct {
	TotalQueries    int64         `json:"totalQueries"`
	SlowQueries     int64         `json:"slowQueries"`
	FailedQueries   int64         `json:"failedQueries"`
	TotalDuration   time.Duration `json:"totalDuration"`
	AverageDuration time.Duration `json:"averageDuration"`
	LastQueryTime   time.Time     `json:"lastQueryTime"`
}

var startTime = time.Now()

// HealthCheck performs a comprehensive health check
func HealthCheck(c *gin.Context) {
	start := time.Now()
	
	// Check database health
	dbHealth := checkDatabaseHealth()
	
	// Get database metrics
	metrics := config.GetDatabaseMetrics()
	avgDuration := time.Duration(0)
	if metrics.TotalQueries > 0 {
		avgDuration = time.Duration(metrics.TotalDuration.Nanoseconds() / metrics.TotalQueries)
	}
	
	// Determine overall status
	status := "healthy"
	if !dbHealth.Connected {
		status = "unhealthy"
	}
	
	response := HealthResponse{
		Status:    status,
		Timestamp: time.Now(),
		Database:  dbHealth,
		Metrics: DatabaseMetricsInfo{
			TotalQueries:    metrics.TotalQueries,
			SlowQueries:     metrics.SlowQueries,
			FailedQueries:   metrics.FailedQueries,
			TotalDuration:   metrics.TotalDuration,
			AverageDuration: avgDuration,
			LastQueryTime:   metrics.LastQueryTime,
		},
		Uptime:  time.Since(startTime),
		Version: "1.0.0",
		Details: map[string]interface{}{
			"checkDuration": time.Since(start),
		},
	}
	
	// Log health check
	log.Printf("[HEALTH-CHECK] Status: %s | Database: %s | Duration: %v", 
		status, dbHealth.Status, time.Since(start))
	
	// Return appropriate status code
	if status == "healthy" {
		c.JSON(http.StatusOK, response)
	} else {
		c.JSON(http.StatusServiceUnavailable, response)
	}
}

// DatabaseHealth performs a database-specific health check
func DatabaseHealth(c *gin.Context) {
	start := time.Now()
	
	dbHealth := checkDatabaseHealth()
	
	response := gin.H{
		"status":       dbHealth.Status,
		"connected":    dbHealth.Connected,
		"responseTime": dbHealth.ResponseTime,
		"timestamp":    time.Now(),
		"checkDuration": time.Since(start),
	}
	
	if dbHealth.Error != "" {
		response["error"] = dbHealth.Error
	}
	
	// Log database health check
	log.Printf("[DB-HEALTH] Status: %s | Connected: %t | ResponseTime: %v", 
		dbHealth.Status, dbHealth.Connected, dbHealth.ResponseTime)
	
	if dbHealth.Connected {
		c.JSON(http.StatusOK, response)
	} else {
		c.JSON(http.StatusServiceUnavailable, response)
	}
}

// DatabaseMetrics returns current database metrics
func DatabaseMetrics(c *gin.Context) {
	metrics := config.GetDatabaseMetrics()
	
	avgDuration := time.Duration(0)
	if metrics.TotalQueries > 0 {
		avgDuration = time.Duration(metrics.TotalDuration.Nanoseconds() / metrics.TotalQueries)
	}
	
	response := gin.H{
		"totalQueries":    metrics.TotalQueries,
		"slowQueries":     metrics.SlowQueries,
		"failedQueries":   metrics.FailedQueries,
		"totalDuration":   metrics.TotalDuration.String(),
		"averageDuration": avgDuration.String(),
		"lastQueryTime":   metrics.LastQueryTime,
		"timestamp":       time.Now(),
	}
	
	c.JSON(http.StatusOK, response)
}

// DatabaseStats returns detailed database statistics
func DatabaseStats(c *gin.Context) {
	// Get connection pool stats
	sqlDB, err := config.DB.DB()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get database stats"})
		return
	}
	
	poolStats := sqlDB.Stats()
	metrics := config.GetDatabaseMetrics()
	
	response := gin.H{
		"connectionPool": gin.H{
			"maxOpenConnections": poolStats.MaxOpenConnections,
			"openConnections":    poolStats.OpenConnections,
			"inUse":             poolStats.InUse,
			"idle":              poolStats.Idle,
			"waitCount":         poolStats.WaitCount,
			"waitDuration":      poolStats.WaitDuration.String(),
		},
		"metrics": gin.H{
			"totalQueries":    metrics.TotalQueries,
			"slowQueries":     metrics.SlowQueries,
			"failedQueries":   metrics.FailedQueries,
			"totalDuration":   metrics.TotalDuration.String(),
			"lastQueryTime":   metrics.LastQueryTime,
		},
		"uptime":    time.Since(startTime).String(),
		"timestamp": time.Now(),
	}
	
	c.JSON(http.StatusOK, response)
}

// checkDatabaseHealth performs a database health check
func checkDatabaseHealth() DatabaseHealthInfo {
	start := time.Now()
	
	err := middleware.DatabaseHealthCheck()
	duration := time.Since(start)
	
	health := DatabaseHealthInfo{
		ResponseTime: duration,
	}
	
	if err != nil {
		health.Status = "unhealthy"
		health.Connected = false
		health.Error = err.Error()
	} else {
		health.Status = "healthy"
		health.Connected = true
	}
	
	return health
}
