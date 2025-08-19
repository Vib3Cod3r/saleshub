package main

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"saleshub-backend/config"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	log.Println("Starting performance optimization migration...")

	// Initialize database
	config.InitDatabase()

	// Read and execute the performance optimization SQL
	if err := executePerformanceOptimization(); err != nil {
		log.Fatal("Failed to execute performance optimization:", err)
	}

	log.Println("Performance optimization migration completed successfully!")
}

func executePerformanceOptimization() error {
	// Read the SQL file
	sqlPath := filepath.Join("cmd", "migrate", "performance_optimization_20k_scale.sql")
	sqlContent, err := os.ReadFile(sqlPath)
	if err != nil {
		return err
	}

	// Split SQL into individual statements
	statements := strings.Split(string(sqlContent), ";")

	// Execute each statement
	for i, statement := range statements {
		statement = strings.TrimSpace(statement)
		if statement == "" || strings.HasPrefix(statement, "--") {
			continue
		}

		log.Printf("Executing statement %d/%d", i+1, len(statements))
		
		if err := config.DB.Exec(statement).Error; err != nil {
			log.Printf("Warning: Failed to execute statement %d: %v", err)
			log.Printf("Statement: %s", statement)
			// Continue with other statements
		}
	}

	return nil
}
