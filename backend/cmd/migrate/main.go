package main

import (
	"log"

	"github.com/joho/godotenv"

	"saleshub-backend/config"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	log.Println("Starting database migration...")

	// Initialize database
	config.InitDatabase()

	// Run migrations
	config.AutoMigrate()

	// Seed database
	config.SeedDatabase()

	log.Println("Database migration completed successfully!")
}
