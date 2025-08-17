package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/lib"
	"saleshub-backend/models"
)

// ContactResponse represents the full contact data with relationships
type ContactResponse struct {
	models.Contact
	Company        *models.Company             `json:"company"`
	PhoneNumbers   []models.PhoneNumber        `json:"phoneNumbers"`
	EmailAddresses []models.EmailAddress       `json:"emailAddresses"`
	Addresses      []models.Address            `json:"addresses"`
	SocialMedia    []models.SocialMediaAccount `json:"socialMedia"`
	Deals          []models.Deal               `json:"deals"`
	Leads          []models.Lead               `json:"leads"`
	Communications []models.Communication      `json:"communications"`
}

// GetContacts returns a list of contacts with pagination and search
func GetContacts(c *gin.Context) {
	start := time.Now()
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userId")
	requestID := c.GetString("requestID")

	// Create database logger for this request
	dbLogger := lib.NewDatabaseLogger(requestID, userID, tenantID)
	perfLogger := lib.NewDatabasePerformanceLogger(requestID, userID, tenantID)
	auditLogger := lib.NewDatabaseAuditLogger(requestID, userID, tenantID)

	// Log operation start
	log.Printf("[DB-OP-START] GetContacts | Tenant: %s | User: %s | RequestID: %s", tenantID, userID, requestID)

	var contacts []models.Contact
	query := config.DB.Where("tenant_id = ?", tenantID)

	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ? OR title ILIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	// Add company filter
	if companyID := c.Query("companyId"); companyID != "" {
		query = query.Where("company_id = ?", companyID)
	}

	// Preload relationships
	query = query.Preload("Company").
		Preload("PhoneNumbers").
		Preload("EmailAddresses")

	// Get total count for pagination
	var total int64

	err := perfLogger.MonitorQuery("COUNT", "contacts", func() error {
		return config.DB.Model(&models.Contact{}).Where("tenant_id = ?", tenantID).Count(&total).Error
	})

	if err != nil {
		dbLogger.LogError("COUNT", "contacts", err, map[string]interface{}{
			"search":     c.Query("search"),
			"company_id": c.Query("companyId"),
		})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count contacts"})
		return
	}

	dbLogger.LogOperation("COUNT", "contacts", 0, nil, map[string]interface{}{
		"total_count": total,
		"search":      c.Query("search"),
		"company_id":  c.Query("companyId"),
	})

	// Execute main query
	err = perfLogger.MonitorQuery("SELECT", "contacts", func() error {
		return query.Offset(offset).Limit(limit).Find(&contacts).Error
	})

	if err != nil {
		dbLogger.LogError("SELECT", "contacts", err, map[string]interface{}{
			"page":       page,
			"limit":      limit,
			"offset":     offset,
			"search":     c.Query("search"),
			"company_id": c.Query("companyId"),
		})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contacts"})
		return
	}

	dbLogger.LogOperation("SELECT", "contacts", 0, nil, map[string]interface{}{
		"page":        page,
		"limit":       limit,
		"offset":      offset,
		"found_count": len(contacts),
		"search":      c.Query("search"),
		"company_id":  c.Query("companyId"),
	})

	// Calculate total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	// Log operation completion
	totalDuration := time.Since(start)
	log.Printf("[DB-OP-COMPLETE] GetContacts | Tenant: %s | User: %s | RequestID: %s | Duration: %v | Found: %d contacts | Page: %d/%d",
		tenantID, userID, requestID, totalDuration, len(contacts), page, totalPages)

	// Log data access for audit
	for _, contact := range contacts {
		auditLogger.LogDataAccess("READ", "contacts", contact.ID, map[string]interface{}{
			"contact_name": fmt.Sprintf("%s %s", contact.FirstName, contact.LastName),
			"page":         page,
			"limit":        limit,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"data": contacts,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
	})
}

// GetContact returns a single contact with all relationships
func GetContact(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var contact models.Contact
	query := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID)

	// Preload all relationships
	query = query.Preload("Company").
		Preload("PhoneNumbers.Type").
		Preload("EmailAddresses.Type").
		Preload("Addresses.Type").
		Preload("SocialMediaAccounts.Type").
		Preload("Deals").
		Preload("Leads").
		Preload("Communications")

	if err := query.First(&contact).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contact"})
		return
	}

	c.JSON(http.StatusOK, contact)
}

// CreateContactRequest represents the request body for creating a contact
type CreateContactRequest struct {
	FirstName      string                      `json:"firstName" binding:"required"`
	LastName       string                      `json:"lastName" binding:"required"`
	Title          *string                     `json:"title"`
	Department     *string                     `json:"department"`
	CompanyID      *string                     `json:"companyId,omitempty"`
	CompanyName    *string                     `json:"companyName"`
	OriginalSource *string                     `json:"originalSource"`
	EmailOptIn     bool                        `json:"emailOptIn"`
	SMSOptIn       bool                        `json:"smsOptIn"`
	CallOptIn      bool                        `json:"callOptIn"`
	EmailAddresses []models.EmailAddress       `json:"emailAddresses"`
	PhoneNumbers   []models.PhoneNumber        `json:"phoneNumbers"`
	Addresses      []models.Address            `json:"addresses"`
	SocialMedia    []models.SocialMediaAccount `json:"socialMedia"`
}

// SimpleContactRequest for basic contact creation
type SimpleContactRequest struct {
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
}

// CreateContact creates a new contact
func CreateContact(c *gin.Context) {
	start := time.Now()
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userId")

	// Log operation start
	log.Printf("[DB-OP-START] CreateContact | Tenant: %s | User: %s | Start: %v", tenantID, userID, start)

	var rawData map[string]interface{}
	if err := c.ShouldBindJSON(&rawData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Handle empty string for companyId
	if companyID, exists := rawData["companyId"]; exists {
		if companyIDStr, ok := companyID.(string); ok && companyIDStr == "" {
			delete(rawData, "companyId")
		}
	}

	// Convert back to JSON and bind to struct
	jsonData, _ := json.Marshal(rawData)
	var req CreateContactRequest
	if err := json.Unmarshal(jsonData, &req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Create the contact
	contact := models.Contact{
		FirstName:      req.FirstName,
		LastName:       req.LastName,
		Title:          req.Title,
		Department:     req.Department,
		OriginalSource: req.OriginalSource,
		EmailOptIn:     req.EmailOptIn,
		SMSOptIn:       req.SMSOptIn,
		CallOptIn:      req.CallOptIn,
		TenantID:       tenantID,
		CreatedBy:      &userID,
	}

	// Set CompanyID if provided and not empty
	if req.CompanyID != nil && *req.CompanyID != "" {
		contact.CompanyID = req.CompanyID
	} else {
		// Explicitly set to nil to avoid empty string
		contact.CompanyID = nil
	}

	// Validate company exists if provided
	if contact.CompanyID != nil && *contact.CompanyID != "" {
		var company models.Company
		companyStart := time.Now()
		if err := config.DB.Where("id = ? AND tenant_id = ?", *contact.CompanyID, tenantID).First(&company).Error; err != nil {
			companyDuration := time.Since(companyStart)
			config.LogDatabaseOperation("SELECT", "companies", tenantID, companyDuration, err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
			return
		}
		companyDuration := time.Since(companyStart)
		config.LogDatabaseOperation("SELECT", "companies", tenantID, companyDuration, nil)
	}

	// Create the contact using raw SQL to avoid GORM's empty string handling
	createStart := time.Now()

	// Use raw SQL to insert the contact
	query := `
		INSERT INTO contacts (
			first_name, last_name, title, department, 
			company_id, original_source, email_opt_in, 
			sms_opt_in, call_opt_in, tenant_id, created_by
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id
	`

	var contactID string
	err := config.DB.Raw(query,
		contact.FirstName,
		contact.LastName,
		contact.Title,
		contact.Department,
		contact.CompanyID, // This will be nil if not set
		contact.OriginalSource,
		contact.EmailOptIn,
		contact.SMSOptIn,
		contact.CallOptIn,
		contact.TenantID,
		contact.CreatedBy,
	).Scan(&contactID).Error

	if err != nil {
		createDuration := time.Since(createStart)
		config.LogDatabaseOperation("INSERT", "contacts", tenantID, createDuration, err)
		log.Printf("[DB-ERROR] Failed to create contact: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contact"})
		return
	}

	// Set the ID for the contact
	contact.ID = contactID
	createDuration := time.Since(createStart)
	config.LogDatabaseOperation("INSERT", "contacts", tenantID, createDuration, nil)

	// Create email addresses using raw SQL to avoid foreign key constraint issues
	for _, emailData := range req.EmailAddresses {
		// Get default email type if none provided
		var typeID interface{} = nil
		if emailData.TypeID != nil && *emailData.TypeID != "" {
			typeID = *emailData.TypeID
		} else {
			// Get the default "Personal" email type
			var defaultEmailType models.EmailAddressType
			if err := config.DB.Where("code = ? AND tenant_id = ?", "PERSONAL", tenantID).First(&defaultEmailType).Error; err != nil {
				log.Printf("[DB-ERROR] Failed to find default email type for tenant %s: %v", tenantID, err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find default email type. Please contact support."})
				return
			}
			typeID = defaultEmailType.ID
		}

		// Validate email address
		if emailData.Email == "" {
			log.Printf("[DB-ERROR] Empty email address provided for contact %s", contactID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email address cannot be empty"})
			return
		}

		emailQuery := `
			INSERT INTO email_addresses (
				email, is_primary, is_verified, type_id, 
				entity_id, entity_type, tenant_id
			) VALUES (?, ?, ?, ?, ?, ?, ?)
			RETURNING id
		`

		var emailID string
		err := config.DB.Raw(emailQuery,
			emailData.Email,
			emailData.IsPrimary,
			false,     // is_verified
			typeID,    // type_id - now always has a value
			contactID, // entity_id
			"Contact", // entity_type
			tenantID,  // tenant_id
		).Scan(&emailID).Error

		if err != nil {
			log.Printf("[DB-ERROR] Failed to create email address for contact %s: %v", contactID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create email address. Please try again."})
			return
		}
	}

	// Create phone numbers
	for _, phone := range req.PhoneNumbers {
		phone.EntityID = contactID
		phone.EntityType = "Contact"
		phone.TenantID = tenantID
		if err := config.DB.Create(&phone).Error; err != nil {
			log.Printf("[DB-ERROR] Failed to create phone number: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create phone number"})
			return
		}
	}

	// Create addresses
	for _, address := range req.Addresses {
		address.EntityID = contactID
		address.EntityType = "Contact"
		address.TenantID = tenantID
		if err := config.DB.Create(&address).Error; err != nil {
			log.Printf("[DB-ERROR] Failed to create address: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create address"})
			return
		}
	}

	// Create social media accounts
	for _, social := range req.SocialMedia {
		social.EntityID = contactID
		social.EntityType = "Contact"
		social.TenantID = tenantID
		if err := config.DB.Create(&social).Error; err != nil {
			log.Printf("[DB-ERROR] Failed to create social media account: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create social media account"})
			return
		}
	}

	// Return the created contact with relationships
	var createdContact models.Contact
	config.DB.Preload("Company").
		Preload("PhoneNumbers.Type").
		Preload("EmailAddresses.Type").
		Preload("Addresses.Type").
		Preload("SocialMediaAccounts.Type").
		First(&createdContact, contactID)

	c.JSON(http.StatusCreated, createdContact)
}

// CreateSimpleContact creates a basic contact with minimal fields
func CreateSimpleContact(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userId")

	var req SimpleContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create the contact with only essential fields
	contact := models.Contact{
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		EmailOptIn: true,
		SMSOptIn:   false,
		CallOptIn:  true,
		TenantID:   tenantID,
		CreatedBy:  &userID,
		// Explicitly set CompanyID to nil
		CompanyID: nil,
	}

	// Create the contact
	if err := config.DB.Create(&contact).Error; err != nil {
		fmt.Printf("Error creating simple contact: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contact"})
		return
	}

	// Return the created contact
	var createdContact models.Contact
	config.DB.First(&createdContact, contact.ID)

	c.JSON(http.StatusCreated, createdContact)
}

// UpdateContact updates a contact
func UpdateContact(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var contact models.Contact
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&contact).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contact"})
		return
	}

	var updateData models.Contact
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if updateData.FirstName == "" || updateData.LastName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "First name and last name are required"})
		return
	}

	// Validate company exists if provided
	if updateData.CompanyID != nil && *updateData.CompanyID != "" {
		var company models.Company
		if err := config.DB.Where("id = ? AND tenant_id = ?", *updateData.CompanyID, tenantID).First(&company).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
			return
		}
	}

	if err := config.DB.Model(&contact).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update contact"})
		return
	}

	// Return the updated contact with relationships
	var updatedContact models.Contact
	config.DB.Preload("Company").First(&updatedContact, contact.ID)

	c.JSON(http.StatusOK, updatedContact)
}

// DeleteContact deletes a contact
func DeleteContact(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var contact models.Contact
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&contact).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contact"})
		return
	}

	// Use transaction to ensure all related data is deleted
	tx := config.DB.Begin()

	// Delete related records first
	if err := tx.Where("entity_id = ? AND entity_type = ?", contact.ID, "Contact").Delete(&models.PhoneNumber{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contact phone numbers"})
		return
	}

	if err := tx.Where("entity_id = ? AND entity_type = ?", contact.ID, "Contact").Delete(&models.EmailAddress{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contact email addresses"})
		return
	}

	if err := tx.Where("entity_id = ? AND entity_type = ?", contact.ID, "Contact").Delete(&models.Address{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contact addresses"})
		return
	}

	if err := tx.Where("entity_id = ? AND entity_type = ?", contact.ID, "Contact").Delete(&models.SocialMediaAccount{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contact social media accounts"})
		return
	}

	// Delete the contact
	if err := tx.Delete(&contact).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contact"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Contact deleted successfully"})
}

// GetContactPhoneNumbers returns phone numbers for a contact
func GetContactPhoneNumbers(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var phoneNumbers []models.PhoneNumber
	if err := config.DB.Where("entity_id = ? AND entity_type = ? AND tenant_id = ?", id, "Contact", tenantID).
		Preload("Type").Find(&phoneNumbers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch phone numbers"})
		return
	}

	c.JSON(http.StatusOK, phoneNumbers)
}

// GetContactEmailAddresses returns email addresses for a contact
func GetContactEmailAddresses(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var emailAddresses []models.EmailAddress
	if err := config.DB.Where("entity_id = ? AND entity_type = ? AND tenant_id = ?", id, "Contact", tenantID).
		Preload("Type").Find(&emailAddresses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch email addresses"})
		return
	}

	c.JSON(http.StatusOK, emailAddresses)
}

// GetContactAddresses returns addresses for a contact
func GetContactAddresses(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var addresses []models.Address
	if err := config.DB.Where("entity_id = ? AND entity_type = ? AND tenant_id = ?", id, "Contact", tenantID).
		Preload("Type").Find(&addresses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch addresses"})
		return
	}

	c.JSON(http.StatusOK, addresses)
}

// GetContactSocialMedia returns social media accounts for a contact
func GetContactSocialMedia(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var socialMedia []models.SocialMediaAccount
	if err := config.DB.Where("entity_id = ? AND entity_type = ? AND tenant_id = ?", id, "Contact", tenantID).
		Preload("Type").Find(&socialMedia).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch social media accounts"})
		return
	}

	c.JSON(http.StatusOK, socialMedia)
}
