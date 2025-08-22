package lib

import (
	"context"
	"log"
	"time"

	"gorm.io/gorm"
)

// PerformanceMonitor tracks query performance for optimization
type PerformanceMonitor struct {
	slowQueryThreshold time.Duration
}

// NewPerformanceMonitor creates a new performance monitor
func NewPerformanceMonitor(slowQueryThreshold time.Duration) *PerformanceMonitor {
	return &PerformanceMonitor{
		slowQueryThreshold: slowQueryThreshold,
	}
}

// MonitorQuery wraps a database query with performance monitoring
func (pm *PerformanceMonitor) MonitorQuery(ctx context.Context, db *gorm.DB, operation string) *gorm.DB {
	start := time.Now()
	
	// Add a callback to monitor the query
	db = db.WithContext(ctx)
	
	// Use GORM's callback system to monitor queries
	db.Callback().Query().After("gorm:query").Register("performance_monitor", func(db *gorm.DB) {
		duration := time.Since(start)
		
		if duration > pm.slowQueryThreshold {
			log.Printf("[PERF-WARN] Slow query detected | Operation: %s | Duration: %v | SQL: %s", 
				operation, duration, db.Statement.SQL.String())
		}
		
		log.Printf("[PERF-INFO] Query executed | Operation: %s | Duration: %v | Rows: %d", 
			operation, duration, db.RowsAffected)
	})
	
	return db
}

// GetQueryStats returns current query statistics
func (pm *PerformanceMonitor) GetQueryStats() map[string]interface{} {
	// This would integrate with your existing metrics system
	return map[string]interface{}{
		"slow_query_threshold": pm.slowQueryThreshold,
		"monitoring_active":    true,
	}
}



