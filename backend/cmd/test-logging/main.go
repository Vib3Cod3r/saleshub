package main

import (
	"log"
	"time"

	"saleshub-backend/config"
	"saleshub-backend/middleware"
	"saleshub-backend/models"
)

func main() {
	log.Println("Starting Database Logging Test...")

	// Initialize database with logging
	config.InitDatabase()

	// Setup logging configuration
	logConfig := config.DefaultLoggingConfig()
	config.SetupDatabaseLogging(logConfig)

	// Run migrations
	config.AutoMigrate()

	// Seed database
	config.SeedDatabase()

	log.Println("Database initialized. Starting logging tests...")

	// Test 1: Basic health check
	log.Println("\n=== Test 1: Database Health Check ===")
	if err := middleware.DatabaseHealthCheck(); err != nil {
		log.Printf("Health check failed: %v", err)
	} else {
		log.Println("Health check passed")
	}

	// Test 2: Basic query operations
	log.Println("\n=== Test 2: Basic Query Operations ===")

	// Get default tenant
	var tenant models.Tenant
	start := time.Now()
	if err := config.DB.Where("subdomain = ?", "default").First(&tenant).Error; err != nil {
		log.Printf("Failed to get tenant: %v", err)
	} else {
		duration := time.Since(start)
		config.LogDatabaseOperation("SELECT", "tenants", tenant.ID, duration, nil)
		log.Printf("Retrieved tenant: %s", tenant.Name)
	}

	// Test 3: Slow query simulation
	log.Println("\n=== Test 3: Slow Query Simulation ===")
	start = time.Now()
	// Simulate a slow query by adding a delay
	time.Sleep(250 * time.Millisecond) // This should trigger slow query logging
	if err := config.DB.Raw("SELECT pg_sleep(0.1)").Error; err != nil {
		log.Printf("Slow query failed: %v", err)
	} else {
		duration := time.Since(start)
		config.LogDatabaseOperation("SELECT", "system", tenant.ID, duration, nil)
		log.Println("Slow query completed")
	}

	// Test 4: Error simulation
	log.Println("\n=== Test 4: Error Simulation ===")
	start = time.Now()
	// Try to query a non-existent table
	if err := config.DB.Raw("SELECT * FROM non_existent_table").Error; err != nil {
		duration := time.Since(start)
		config.LogDatabaseOperation("SELECT", "non_existent_table", tenant.ID, duration, err)
		log.Printf("Expected error occurred: %v", err)
	}

	// Test 5: Transaction logging
	log.Println("\n=== Test 5: Transaction Logging ===")
	tx := config.DB.Begin()
	txnLogger := middleware.NewTransactionLogger(tx, "TestTransaction", "test_table")

	// Simulate some work
	time.Sleep(50 * time.Millisecond)

	// Commit the transaction
	if err := txnLogger.Commit(); err != nil {
		log.Printf("Transaction commit failed: %v", err)
	} else {
		log.Println("Transaction committed successfully")
	}

	// Test 6: Connection pool stats
	log.Println("\n=== Test 6: Connection Pool Statistics ===")
	middleware.LogDatabaseConnectionPool()

	// Test 7: Database metrics
	log.Println("\n=== Test 7: Database Metrics ===")
	middleware.LogDatabaseMetrics()

	// Test 8: Performance logging
	log.Println("\n=== Test 8: Performance Logging ===")

	// Simulate multiple queries
	for i := 0; i < 5; i++ {
		start = time.Now()
		var count int64
		if err := config.DB.Model(&models.Contact{}).Count(&count).Error; err != nil {
			duration := time.Since(start)
			config.LogDatabaseOperation("COUNT", "contacts", tenant.ID, duration, err)
		} else {
			duration := time.Since(start)
			config.LogDatabaseOperation("COUNT", "contacts", tenant.ID, duration, nil)
			config.LogDatabasePerformance("COUNT", "contacts", duration, count)
		}
		time.Sleep(10 * time.Millisecond)
	}

	// Test 9: Structured event logging
	log.Println("\n=== Test 9: Structured Event Logging ===")
	metadata := map[string]interface{}{
		"user_id":   "test-user-123",
		"operation": "bulk_import",
		"records":   100,
		"source":    "csv_file",
	}

	start = time.Now()
	time.Sleep(100 * time.Millisecond) // Simulate bulk operation
	duration := time.Since(start)

	config.LogDatabaseEvent("BULK_IMPORT", "bulk_import", "contacts", tenant.ID, duration, nil, metadata)
	log.Println("Structured event logged")

	// Test 10: Final metrics and cleanup
	log.Println("\n=== Test 10: Final Metrics ===")
	middleware.LogDatabaseMetrics()
	middleware.LogDatabaseConnectionPool()

	log.Println("\n=== Database Logging Test Completed ===")
	log.Println("Check the logs above for various database operations and metrics.")
	log.Println("You can also check the database.log file for detailed logging information.")
}
