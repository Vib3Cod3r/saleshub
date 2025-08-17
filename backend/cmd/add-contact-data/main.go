package main

import (
	"fmt"
	"log"
	"math/rand"
	"saleshub-backend/config"
	"saleshub-backend/models"
	"strings"
	"time"
)

func stringPtr(s string) *string {
	return &s
}

func generatePhoneNumber() string {
	areaCodes := []string{"212", "415", "312", "404", "305", "713", "602", "303", "206", "617", "312", "214", "713", "404", "305"}
	areaCode := areaCodes[rand.Intn(len(areaCodes))]
	prefix := fmt.Sprintf("%03d", rand.Intn(900)+100)
	line := fmt.Sprintf("%04d", rand.Intn(9000)+1000)
	return fmt.Sprintf("(%s) %s-%s", areaCode, prefix, line)
}

func generateEmail(firstName, lastName string) string {
	domains := []string{"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"}
	domain := domains[rand.Intn(len(domains))]
	variations := []string{
		fmt.Sprintf("%s.%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s_%s", strings.ToLower(firstName), strings.ToLower(lastName)),
		fmt.Sprintf("%s%s%d", strings.ToLower(firstName), strings.ToLower(lastName), rand.Intn(999)),
	}
	return fmt.Sprintf("%s@%s", variations[rand.Intn(len(variations))], domain)
}

func main() {
	// Initialize database
	config.InitDatabase()

	// Set random seed
	rand.Seed(time.Now().UnixNano())

	// Get the default tenant
	var tenant models.Tenant
	if err := config.DB.Where("subdomain = ?", "default").First(&tenant).Error; err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	// Fetch lookup data
	var phoneTypes []models.PhoneNumberType
	if err := config.DB.Where("tenant_id = ?", tenant.ID).Find(&phoneTypes).Error; err != nil {
		log.Printf("Error fetching phone types: %v", err)
		return
	}

	var emailTypes []models.EmailAddressType
	if err := config.DB.Where("tenant_id = ?", tenant.ID).Find(&emailTypes).Error; err != nil {
		log.Printf("Error fetching email types: %v", err)
		return
	}

	// Get all contacts that don't have email addresses
	var contacts []models.Contact
	if err := config.DB.Where("tenant_id = ?", tenant.ID).Find(&contacts).Error; err != nil {
		log.Fatal("Failed to fetch contacts:", err)
	}

	log.Printf("Found %d contacts", len(contacts))

	// Add email addresses and phone numbers to contacts that don't have them
	for _, contact := range contacts {
		// Check if contact already has email addresses
		var emailCount int64
		config.DB.Model(&models.EmailAddress{}).Where("entity_id = ? AND entity_type = ?", contact.ID, "Contact").Count(&emailCount)

		if emailCount == 0 {
			// Add personal email
			personalEmail := models.EmailAddress{
				Email:      generateEmail(contact.FirstName, contact.LastName),
				IsPrimary:  true,
				IsVerified: rand.Float32() > 0.2, // 80% verified
				TypeID:     &emailTypes[0].ID,    // Personal
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			}

			if err := config.DB.Create(&personalEmail).Error; err != nil {
				log.Printf("Warning: Failed to create personal email for %s %s: %v", contact.FirstName, contact.LastName, err)
			} else {
				log.Printf("Added personal email for %s %s: %s", contact.FirstName, contact.LastName, personalEmail.Email)
			}

			// Add work email for 70% of contacts
			if rand.Float32() < 0.7 {
				workEmail := models.EmailAddress{
					Email:      fmt.Sprintf("%s.%s@company.com", strings.ToLower(contact.FirstName), strings.ToLower(contact.LastName)),
					IsPrimary:  false,
					IsVerified: rand.Float32() > 0.1, // 90% verified
					TypeID:     &emailTypes[1].ID,    // Work
					EntityID:   contact.ID,
					EntityType: "Contact",
					TenantID:   tenant.ID,
				}

				if err := config.DB.Create(&workEmail).Error; err != nil {
					log.Printf("Warning: Failed to create work email for %s %s: %v", contact.FirstName, contact.LastName, err)
				} else {
					log.Printf("Added work email for %s %s: %s", contact.FirstName, contact.LastName, workEmail.Email)
				}
			}
		}

		// Check if contact already has phone numbers
		var phoneCount int64
		config.DB.Model(&models.PhoneNumber{}).Where("entity_id = ? AND entity_type = ?", contact.ID, "Contact").Count(&phoneCount)

		if phoneCount == 0 {
			// Add mobile phone
			mobilePhone := models.PhoneNumber{
				Number:     generatePhoneNumber(),
				Extension:  nil,
				IsPrimary:  true,
				TypeID:     &phoneTypes[0].ID, // Mobile
				EntityID:   contact.ID,
				EntityType: "Contact",
				TenantID:   tenant.ID,
			}

			if err := config.DB.Create(&mobilePhone).Error; err != nil {
				log.Printf("Warning: Failed to create mobile phone for %s %s: %v", contact.FirstName, contact.LastName, err)
			} else {
				log.Printf("Added mobile phone for %s %s: %s", contact.FirstName, contact.LastName, mobilePhone.Number)
			}

			// Add work phone for 60% of contacts
			if rand.Float32() < 0.6 {
				extension := fmt.Sprintf("%d", rand.Intn(9999)+1000)
				workPhone := models.PhoneNumber{
					Number:     generatePhoneNumber(),
					Extension:  &extension,
					IsPrimary:  false,
					TypeID:     &phoneTypes[1].ID, // Work
					EntityID:   contact.ID,
					EntityType: "Contact",
					TenantID:   tenant.ID,
				}

				if err := config.DB.Create(&workPhone).Error; err != nil {
					log.Printf("Warning: Failed to create work phone for %s %s: %v", contact.FirstName, contact.LastName, err)
				} else {
					log.Printf("Added work phone for %s %s: %s", contact.FirstName, contact.LastName, workPhone.Number)
				}
			}
		}
	}

	log.Println("")
	log.Println("=== CONTACT DATA ENHANCEMENT COMPLETED ===")
	log.Printf("• Enhanced %d contacts with email addresses and phone numbers", len(contacts))
	log.Println("• Each contact now has:")
	log.Println("  - 1-2 email addresses (Personal, Work)")
	log.Println("  - 1-2 phone numbers (Mobile, Work)")
	log.Println("")
	log.Println("The contacts list should now display complete contact information!")
}
