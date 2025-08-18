package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"saleshub-backend/models"
)

func main() {
	// Database connection
	dsn := "host=localhost user=postgres password=Miyako2020 dbname=sales_crm port=5432 sslmode=disable TimeZone=UTC"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Get database connection for raw SQL
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get database connection:", err)
	}

	fmt.Println("🔍 Starting duplicate contact removal process...")

	// Step 1: Find duplicates based on first name and last name
	fmt.Println("\n📊 Step 1: Identifying duplicate contacts...")

	duplicates, err := findDuplicateContacts(sqlDB)
	if err != nil {
		log.Fatal("Failed to find duplicates:", err)
	}

	if len(duplicates) == 0 {
		fmt.Println("✅ No duplicate contacts found!")
		return
	}

	fmt.Printf("Found %d groups of duplicate contacts\n", len(duplicates))

	// Step 2: Show duplicates before removal
	fmt.Println("\n📋 Step 2: Duplicate contacts found:")
	for i, group := range duplicates {
		fmt.Printf("\nGroup %d:\n", i+1)
		for j, contact := range group {
			fmt.Printf("  %d. ID: %s, Name: %s %s, Email: %s, Created: %s\n",
				j+1, contact.ID, contact.FirstName, contact.LastName,
				getPrimaryEmail(contact), contact.CreatedAt.Format("2006-01-02 15:04:05"))
		}
	}

	// Step 3: Ask for confirmation
	fmt.Print("\n❓ Do you want to remove duplicates? (y/N): ")
	var response string
	fmt.Scanln(&response)

	if response != "y" && response != "Y" {
		fmt.Println("❌ Operation cancelled.")
		return
	}

	// Step 4: Remove duplicates
	fmt.Println("\n🗑️  Step 3: Removing duplicate contacts...")

	removedCount, err := removeDuplicateContacts(db, duplicates)
	if err != nil {
		log.Fatal("Failed to remove duplicates:", err)
	}

	fmt.Printf("✅ Successfully removed %d duplicate contacts!\n", removedCount)
	fmt.Println("🎉 Duplicate removal process completed!")
}

type ContactWithEmail struct {
	ID           string    `json:"id"`
	FirstName    string    `json:"firstName"`
	LastName     string    `json:"lastName"`
	Title        *string   `json:"title"`
	Department   *string   `json:"department"`
	CompanyID    *string   `json:"companyId"`
	TenantID     string    `json:"tenantId"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	CreatedBy    *string   `json:"createdBy"`
	PrimaryEmail string    `json:"primaryEmail"`
}

func findDuplicateContacts(db *sql.DB) ([][]ContactWithEmail, error) {
	query := `
		WITH duplicate_groups AS (
			SELECT 
				c.id,
				c.first_name,
				c.last_name,
				c.title,
				c.department,
				c.company_id,
				c.tenant_id,
				c.created_at,
				c.updated_at,
				c.created_by,
				COALESCE(ea.email, '') as primary_email,
				ROW_NUMBER() OVER (
					PARTITION BY 
						LOWER(c.first_name), 
						LOWER(c.last_name)
					ORDER BY c.created_at ASC
				) as rn
			FROM contacts c
			LEFT JOIN email_addresses ea ON c.id = ea.entity_id 
				AND ea.entity_type = 'Contact' 
				AND ea.is_primary = true
			WHERE c.deleted_at IS NULL
		)
		SELECT 
			id, first_name, last_name, title, department, 
			company_id, tenant_id, created_at, updated_at, created_by, primary_email
		FROM duplicate_groups 
		WHERE rn > 1
		ORDER BY LOWER(first_name), LOWER(last_name), created_at
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query duplicates: %w", err)
	}
	defer rows.Close()

	// Group duplicates by name and email
	duplicateMap := make(map[string][]ContactWithEmail)

	for rows.Next() {
		var contact ContactWithEmail
		var companyID sql.NullString
		var title, department, createdBy sql.NullString

		var createdAt, updatedAt sql.NullTime
		err := rows.Scan(
			&contact.ID,
			&contact.FirstName,
			&contact.LastName,
			&title,
			&department,
			&companyID,
			&contact.TenantID,
			&createdAt,
			&updatedAt,
			&createdBy,
			&contact.PrimaryEmail,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan contact: %w", err)
		}

		if title.Valid {
			contact.Title = &title.String
		}
		if department.Valid {
			contact.Department = &department.String
		}
		if companyID.Valid {
			contact.CompanyID = &companyID.String
		}
		if createdAt.Valid {
			contact.CreatedAt = createdAt.Time
		}
		if updatedAt.Valid {
			contact.UpdatedAt = updatedAt.Time
		}
		if createdBy.Valid {
			contact.CreatedBy = &createdBy.String
		}

		// Create key for grouping
		key := fmt.Sprintf("%s|%s",
			contact.FirstName,
			contact.LastName)

		duplicateMap[key] = append(duplicateMap[key], contact)
	}

	// Convert map to slice
	var result [][]ContactWithEmail
	for _, group := range duplicateMap {
		if len(group) > 0 {
			result = append(result, group)
		}
	}

	return result, nil
}

func removeDuplicateContacts(db *gorm.DB, duplicates [][]ContactWithEmail) (int, error) {
	removedCount := 0

	for _, group := range duplicates {
		// Keep the first contact (oldest), remove the rest
		for i := 1; i < len(group); i++ {
			contactID := group[i].ID

			// Delete related records first (due to foreign key constraints)
			if err := deleteContactRelatedRecords(db, contactID); err != nil {
				return removedCount, fmt.Errorf("failed to delete related records for contact %s: %w", contactID, err)
			}

			// Delete the contact
			if err := db.Delete(&models.Contact{}, "id = ?", contactID).Error; err != nil {
				return removedCount, fmt.Errorf("failed to delete contact %s: %w", contactID, err)
			}

			removedCount++
			fmt.Printf("  🗑️  Removed duplicate contact: %s %s (ID: %s)\n",
				group[i].FirstName, group[i].LastName, contactID)
		}
	}

	return removedCount, nil
}

func deleteContactRelatedRecords(db *gorm.DB, contactID string) error {
	// Delete related records in the correct order to avoid foreign key constraint issues

	// Delete custom field values
	if err := db.Where("entity_id = ? AND entity_type = ?", contactID, "Contact").Delete(&models.CustomFieldValue{}).Error; err != nil {
		return fmt.Errorf("failed to delete custom field values: %w", err)
	}

	// Delete activity logs
	if err := db.Where("entity_id = ? AND entity_type = ?", contactID, "Contact").Delete(&models.ActivityLog{}).Error; err != nil {
		return fmt.Errorf("failed to delete activity logs: %w", err)
	}

	// Delete communications
	if err := db.Where("contact_id = ?", contactID).Delete(&models.Communication{}).Error; err != nil {
		return fmt.Errorf("failed to delete communications: %w", err)
	}

	// Delete deals
	if err := db.Where("contact_id = ?", contactID).Delete(&models.Deal{}).Error; err != nil {
		return fmt.Errorf("failed to delete deals: %w", err)
	}

	// Delete leads
	if err := db.Where("contact_id = ?", contactID).Delete(&models.Lead{}).Error; err != nil {
		return fmt.Errorf("failed to delete leads: %w", err)
	}

	// Delete phone numbers
	if err := db.Where("entity_id = ? AND entity_type = ?", contactID, "Contact").Delete(&models.PhoneNumber{}).Error; err != nil {
		return fmt.Errorf("failed to delete phone numbers: %w", err)
	}

	// Delete email addresses
	if err := db.Where("entity_id = ? AND entity_type = ?", contactID, "Contact").Delete(&models.EmailAddress{}).Error; err != nil {
		return fmt.Errorf("failed to delete email addresses: %w", err)
	}

	// Delete addresses
	if err := db.Where("entity_id = ? AND entity_type = ?", contactID, "Contact").Delete(&models.Address{}).Error; err != nil {
		return fmt.Errorf("failed to delete addresses: %w", err)
	}

	// Delete social media accounts
	if err := db.Where("entity_id = ? AND entity_type = ?", contactID, "Contact").Delete(&models.SocialMediaAccount{}).Error; err != nil {
		return fmt.Errorf("failed to delete social media accounts: %w", err)
	}

	return nil
}

func getPrimaryEmail(contact ContactWithEmail) string {
	if contact.PrimaryEmail != "" {
		return contact.PrimaryEmail
	}
	return "No email"
}
