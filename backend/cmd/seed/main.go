package main

import (
	"log"
	"saleshub-backend/config"
	"saleshub-backend/models"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Initialize database
	config.InitDatabase()
	config.AutoMigrate()
	config.SeedDatabase()

	// Get the default tenant
	var tenant models.Tenant
	if err := config.DB.Where("name = ?", "Default Organization").First(&tenant).Error; err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	// Get the admin role
	var adminRole models.UserRole
	if err := config.DB.Where("code = ? AND tenant_id = ?", "ADMIN", tenant.ID).First(&adminRole).Error; err != nil {
		log.Fatal("Failed to find admin role:", err)
	}

	// Create sample user if it doesn't exist
	var existingUser models.User
	if err := config.DB.Where("email = ?", "admin@saleshub.com").First(&existingUser).Error; err != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), 12)
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
		config.DB.Create(&user)
		log.Println("Created sample user: admin@saleshub.com / password123")
	} else {
		log.Println("Sample user already exists: admin@saleshub.com / password123")
	}

	// Get lookup data
	var techIndustry models.Industry
	config.DB.Where("code = ? AND tenant_id = ?", "TECH", tenant.ID).First(&techIndustry)

	var mediumSize models.CompanySize
	config.DB.Where("code = ? AND tenant_id = ?", "MEDIUM", tenant.ID).First(&mediumSize)

	// Create a simple sample company
	var existingCompany models.Company
	if err := config.DB.Where("name = ? AND tenant_id = ?", "TechCorp Solutions", tenant.ID).First(&existingCompany).Error; err != nil {
		website := "https://techcorp.com"
		company := models.Company{
			ID:         uuid.New().String(),
			Name:       "TechCorp Solutions",
			Website:    &website,
			IndustryID: techIndustry.ID,
			SizeID:     mediumSize.ID,
			TenantID:   tenant.ID,
		}
		config.DB.Create(&company)
		log.Println("Created sample company: TechCorp Solutions")
	} else {
		log.Println("Sample company already exists: TechCorp Solutions")
	}

	// Create a simple sample task
	description := "Schedule a demo call for next week"
	dueDate := time.Now().AddDate(0, 0, 7) // 1 week from now
	task := models.Task{
		ID:          uuid.New().String(),
		Title:       "Follow up with potential client",
		Description: &description,
		DueDate:     &dueDate,
		Priority:    "High",
		Status:      "Pending",
		TenantID:    tenant.ID,
	}
	config.DB.Create(&task)
	log.Println("Created sample task: Follow up with potential client")

	log.Println("")
	log.Println("=== TEST CREDENTIALS ===")
	log.Println("Email: admin@saleshub.com")
	log.Println("Password: password123")
	log.Println("")
	log.Println("=== SAMPLE DATA CREATED ===")
	log.Println("• 1 Company: TechCorp Solutions")
	log.Println("• 1 Task: Follow up with potential client")
	log.Println("• Lookup data: Industries, Company Sizes, Lead Statuses, etc.")
	log.Println("")
	log.Println("You can now test the application with this sample data!")
	log.Println("")
	log.Println("=== TESTING INSTRUCTIONS ===")
	log.Println("1. Go to http://localhost:3000")
	log.Println("2. Login with admin@saleshub.com / password123")
	log.Println("3. Navigate through the different modules in the sidebar")
	log.Println("4. Try creating new companies, contacts, leads, and deals")
	log.Println("5. Test the search functionality and filters")
}
