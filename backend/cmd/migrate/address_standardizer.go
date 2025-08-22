package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using system environment variables")
	}

	// Database connection parameters
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "Miyako2020")
	dbName := getEnv("DB_NAME", "sales_crm")

	// Create connection string
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	// Connect to database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("✅ Connected to database successfully")

	// Read SQL script
	sqlFile := filepath.Join("cmd", "migrate", "fix_contact_addresses_simple.sql")
	sqlContent, err := os.ReadFile(sqlFile)
	if err != nil {
		log.Fatalf("Failed to read SQL file: %v", err)
	}

	// Execute SQL script
	log.Println("🔄 Starting address standardization...")
	
	_, err = db.Exec(string(sqlContent))
	if err != nil {
		log.Fatalf("Failed to execute SQL script: %v", err)
	}

	log.Println("✅ Address standardization completed successfully!")

	// Show summary
	showSummary(db)
}

func showSummary(db *sql.DB) {
	log.Println("\n📊 Address Standardization Summary:")
	
	queries := map[string]string{
		"Total Addresses": "SELECT COUNT(*) FROM addresses",
		"With Country":    "SELECT COUNT(*) FROM addresses WHERE country IS NOT NULL",
		"With City":       "SELECT COUNT(*) FROM addresses WHERE city IS NOT NULL",
		"With State":      "SELECT COUNT(*) FROM addresses WHERE state IS NOT NULL",
		"Incomplete":      "SELECT COUNT(*) FROM addresses WHERE street1 LIKE '%[INCOMPLETE%'",
	}

	for label, query := range queries {
		var count int
		if err := db.QueryRow(query).Scan(&count); err != nil {
			log.Printf("❌ Failed to get %s: %v", label, err)
			continue
		}
		log.Printf("  %s: %d", label, count)
	}

	// Show country distribution
	log.Println("\n🌍 Country Distribution:")
	rows, err := db.Query(`
		SELECT country, COUNT(*) as count 
		FROM addresses 
		WHERE country IS NOT NULL 
		GROUP BY country 
		ORDER BY count DESC 
		LIMIT 10
	`)
	if err != nil {
		log.Printf("❌ Failed to get country distribution: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var country string
		var count int
		if err := rows.Scan(&country, &count); err != nil {
			log.Printf("❌ Failed to scan country row: %v", err)
			continue
		}
		log.Printf("  %s: %d", country, count)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
