package main

import (
	"fmt"
	"log"
	"time"

	"saleshub-backend/config"
)

func main() {
	fmt.Println("Testing SalesHub CRM Lifecycle Logging System")
	fmt.Println("=============================================")

	// Setup lifecycle logging
	lifecycleConfig := config.DefaultLifecycleLogConfig()
	lifecycleConfig.LogFile = "test-lifecycle.log"
	
	if err := config.SetupLifecycleLogging(lifecycleConfig); err != nil {
		log.Fatal("Failed to setup lifecycle logging:", err)
	}

	// Test various lifecycle events
	fmt.Println("\n1. Testing server start event...")
	config.LogServerStart("8089", "test", map[string]interface{}{
		"version": "1.0.0",
		"test_mode": true,
	})

	time.Sleep(1 * time.Second)

	fmt.Println("2. Testing server started event...")
	config.LogServerStarted("8089", 1500*time.Millisecond)

	time.Sleep(1 * time.Second)

	fmt.Println("3. Testing health check event...")
	config.LogHealthCheck("healthy", 25*time.Millisecond, map[string]interface{}{
		"endpoint": "/health",
		"response_size": 128,
	})

	time.Sleep(1 * time.Second)

	fmt.Println("4. Testing database events...")
	config.LogDatabaseStart("postgresql", "localhost", "5432", "sales_crm")
	
	time.Sleep(500 * time.Millisecond)
	
	config.LogDatabaseShutdown("test_completion")

	time.Sleep(1 * time.Second)

	fmt.Println("5. Testing application error...")
	config.LogApplicationError("database", "connection", fmt.Errorf("test error"), map[string]interface{}{
		"retry_count": 3,
		"timeout": "5s",
	})

	time.Sleep(1 * time.Second)

	fmt.Println("6. Testing server shutdown...")
	uptime := 30 * time.Second
	config.LogServerShutdown("test_completion", uptime)

	// Close lifecycle logging
	config.CloseLifecycleLogging()

	fmt.Println("\n✅ Lifecycle logging test completed!")
	fmt.Println("📄 Check 'test-lifecycle.log' for the generated logs")
	fmt.Println("📊 Log file location: backend/test-lifecycle.log")
}
