package main

import (
	"fmt"
	"log"
	"saleshub-backend/config"

	"github.com/google/uuid"
)

func main() {
	// Initialize database connection only
	config.InitDatabase()

	// Get the default tenant ID directly
	var tenantID string
	err := config.DB.Raw("SELECT id FROM tenants WHERE name = 'Default Organization' LIMIT 1").Scan(&tenantID).Error
	if err != nil {
		log.Fatal("Failed to find default tenant:", err)
	}

	// Get phone and email type IDs directly
	var workPhoneTypeID string
	config.DB.Raw("SELECT id FROM phone_number_types WHERE code = 'WORK' AND tenant_id = ? LIMIT 1", tenantID).Scan(&workPhoneTypeID)

	var workEmailTypeID string
	config.DB.Raw("SELECT id FROM email_address_types WHERE code = 'WORK' AND tenant_id = ? LIMIT 1", tenantID).Scan(&workEmailTypeID)

	// Sample unassigned contacts data
	unassignedContacts := []struct {
		firstName string
		lastName  string
		title     string
		phone     string
		email     string
	}{
		{
			firstName: "Sarah",
			lastName:  "Johnson",
			title:     "Marketing Director",
			phone:     "+1 (555) 111-2222",
			email:     "sarah.johnson@example.com",
		},
		{
			firstName: "Michael",
			lastName:  "Chen",
			title:     "Software Engineer",
			phone:     "+1 (555) 222-3333",
			email:     "michael.chen@example.com",
		},
		{
			firstName: "Emily",
			lastName:  "Rodriguez",
			title:     "Sales Manager",
			phone:     "+1 (555) 333-4444",
			email:     "emily.rodriguez@example.com",
		},
		{
			firstName: "David",
			lastName:  "Thompson",
			title:     "Product Manager",
			phone:     "+1 (555) 444-5555",
			email:     "david.thompson@example.com",
		},
		{
			firstName: "Lisa",
			lastName:  "Wang",
			title:     "HR Director",
			phone:     "+1 (555) 555-6666",
			email:     "lisa.wang@example.com",
		},
		{
			firstName: "James",
			lastName:  "Brown",
			title:     "Financial Analyst",
			phone:     "+1 (555) 666-7777",
			email:     "james.brown@example.com",
		},
		{
			firstName: "Jennifer",
			lastName:  "Davis",
			title:     "Operations Manager",
			phone:     "+1 (555) 777-8888",
			email:     "jennifer.davis@example.com",
		},
		{
			firstName: "Robert",
			lastName:  "Wilson",
			title:     "Business Development",
			phone:     "+1 (555) 888-9999",
			email:     "robert.wilson@example.com",
		},
		{
			firstName: "Amanda",
			lastName:  "Taylor",
			title:     "Customer Success Manager",
			phone:     "+1 (555) 999-0000",
			email:     "amanda.taylor@example.com",
		},
		{
			firstName: "Christopher",
			lastName:  "Anderson",
			title:     "Data Scientist",
			phone:     "+1 (555) 000-1111",
			email:     "christopher.anderson@example.com",
		},
		{
			firstName: "Jessica",
			lastName:  "Martinez",
			title:     "UX Designer",
			phone:     "+1 (555) 111-0000",
			email:     "jessica.martinez@example.com",
		},
		{
			firstName: "Daniel",
			lastName:  "Garcia",
			title:     "DevOps Engineer",
			phone:     "+1 (555) 222-1111",
			email:     "daniel.garcia@example.com",
		},
		{
			firstName: "Nicole",
			lastName:  "Miller",
			title:     "Content Strategist",
			phone:     "+1 (555) 333-2222",
			email:     "nicole.miller@example.com",
		},
		{
			firstName: "Kevin",
			lastName:  "Lee",
			title:     "Quality Assurance Engineer",
			phone:     "+1 (555) 444-3333",
			email:     "kevin.lee@example.com",
		},
		{
			firstName: "Rachel",
			lastName:  "White",
			title:     "Event Coordinator",
			phone:     "+1 (555) 555-4444",
			email:     "rachel.white@example.com",
		},
		{
			firstName: "Andrew",
			lastName:  "Clark",
			title:     "Legal Counsel",
			phone:     "+1 (555) 666-5555",
			email:     "andrew.clark@example.com",
		},
		{
			firstName: "Stephanie",
			lastName:  "Lewis",
			title:     "Public Relations Manager",
			phone:     "+1 (555) 777-6666",
			email:     "stephanie.lewis@example.com",
		},
		{
			firstName: "Matthew",
			lastName:  "Hall",
			title:     "Supply Chain Manager",
			phone:     "+1 (555) 888-7777",
			email:     "matthew.hall@example.com",
		},
		{
			firstName: "Lauren",
			lastName:  "Young",
			title:     "Research Analyst",
			phone:     "+1 (555) 999-8888",
			email:     "lauren.young@example.com",
		},
		{
			firstName: "Ryan",
			lastName:  "King",
			title:     "Technical Writer",
			phone:     "+1 (555) 000-9999",
			email:     "ryan.king@example.com",
		},
		{
			firstName: "Michelle",
			lastName:  "Wright",
			title:     "Training Coordinator",
			phone:     "+1 (555) 111-0000",
			email:     "michelle.wright@example.com",
		},
	}

	createdCount := 0
	for _, contactData := range unassignedContacts {
		// Check if contact already exists
		var existingContactID string
		err := config.DB.Raw("SELECT id FROM contacts WHERE first_name = ? AND last_name = ? AND tenant_id = ? LIMIT 1",
			contactData.firstName, contactData.lastName, tenantID).Scan(&existingContactID).Error

		if err == nil && existingContactID == "" {
			// Create new unassigned contact
			contactID := uuid.New().String()

			// Insert contact
			err = config.DB.Exec(`
				INSERT INTO contacts (id, first_name, last_name, title, owner_id, tenant_id, created_at, updated_at)
				VALUES (?, ?, ?, ?, NULL, ?, NOW(), NOW())
			`, contactID, contactData.firstName, contactData.lastName, contactData.title, tenantID).Error

			if err != nil {
				log.Printf("Failed to create contact %s %s: %v", contactData.firstName, contactData.lastName, err)
				continue
			}

			// Create phone number
			phoneID := uuid.New().String()
			err = config.DB.Exec(`
				INSERT INTO phone_numbers (id, number, type_id, is_primary, entity_id, entity_type, tenant_id, created_at, updated_at)
				VALUES (?, ?, ?, true, ?, 'Contact', ?, NOW(), NOW())
			`, phoneID, contactData.phone, workPhoneTypeID, contactID, tenantID).Error

			if err != nil {
				log.Printf("Failed to create phone number for %s %s: %v", contactData.firstName, contactData.lastName, err)
			}

			// Create email address
			emailID := uuid.New().String()
			err = config.DB.Exec(`
				INSERT INTO email_addresses (id, email, type_id, is_primary, entity_id, entity_type, tenant_id, created_at, updated_at)
				VALUES (?, ?, ?, true, ?, 'Contact', ?, NOW(), NOW())
			`, emailID, contactData.email, workEmailTypeID, contactID, tenantID).Error

			if err != nil {
				log.Printf("Failed to create email address for %s %s: %v", contactData.firstName, contactData.lastName, err)
			}

			createdCount++
			log.Printf("Created unassigned contact: %s %s (%s) - Phone: %s, Email: %s",
				contactData.firstName, contactData.lastName, contactData.title, contactData.phone, contactData.email)
		} else {
			log.Printf("Contact already exists: %s %s", contactData.firstName, contactData.lastName)
		}
	}

	log.Println("")
	log.Println("=== UNASSIGNED CONTACTS CREATED ===")
	log.Printf("• %d unassigned contacts created with phone numbers and email addresses", createdCount)
	log.Println("")
	log.Println("These contacts will appear in the 'Unassigned contacts' filter on the contacts page!")
	log.Println("")
	log.Println("Contact details:")
	for i, contactData := range unassignedContacts {
		fmt.Printf("%2d. %s %s - %s\n", i+1, contactData.firstName, contactData.lastName, contactData.title)
	}
}
