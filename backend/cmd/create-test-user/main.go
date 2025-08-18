package main

import (
	"log"
	"saleshub-backend/config"
	"saleshub-backend/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Initialize database
	config.InitDatabase()
	config.SeedDatabase()

	// Get the default tenant
	var tenant models.Tenant
	if err := config.DB.Where("name = ?", "Default Organization").First(&tenant).Error; err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	// Get admin role
	var adminRole models.UserRole
	if err := config.DB.Where("code = ? AND tenant_id = ?", "ADMIN", tenant.ID).First(&adminRole).Error; err != nil {
		log.Fatal("Failed to find admin role:", err)
	}

	// Check if test user already exists
	var existingUser models.User
	if err := config.DB.Where("email = ? AND tenant_id = ?", "admin@saleshub.com", tenant.ID).First(&existingUser).Error; err == nil {
		log.Printf("Test user already exists: %s", existingUser.Email)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Create test user
	user := models.User{
		ID:        uuid.New().String(),
		FirstName: "Admin",
		LastName:  "User",
		Email:     "admin@saleshub.com",
		Password:  string(hashedPassword),
		RoleID:    adminRole.ID,
		TenantID:  tenant.ID,
		IsActive:  true,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		log.Fatal("Failed to create test user:", err)
	}

	log.Printf("Created test user: %s", user.Email)
	log.Println("Login credentials:")
	log.Println("Email: admin@saleshub.com")
	log.Println("Password: password123")
}
