package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
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
	var contacts []models.Contact
	tenantID := c.GetString("tenantID")

	// Add debugging
	fmt.Printf("GetContacts: tenantID = %s\n", tenantID)

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
	query = query.Preload("Company")

	// Get total count for pagination
	var total int64
	config.DB.Model(&models.Contact{}).Where("tenant_id = ?", tenantID).Count(&total)

	if err := query.Offset(offset).Limit(limit).Find(&contacts).Error; err != nil {
		fmt.Printf("GetContacts: database error = %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch contacts"})
		return
	}

	fmt.Printf("GetContacts: found %d contacts\n", len(contacts))

	// Calculate total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))

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

// CreateContact creates a new contact
func CreateContact(c *gin.Context) {
	var contact models.Contact
	if err := c.ShouldBindJSON(&contact); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	contact.TenantID = c.GetString("tenantID")
	userID := c.GetString("userID")
	contact.CreatedBy = &userID

	// Validate required fields
	if contact.FirstName == "" || contact.LastName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "First name and last name are required"})
		return
	}

	// Validate company exists if provided
	if contact.CompanyID != "" {
		var company models.Company
		if err := config.DB.Where("id = ? AND tenant_id = ?", contact.CompanyID, contact.TenantID).First(&company).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid company ID"})
			return
		}
	}

	if err := config.DB.Create(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contact"})
		return
	}

	// Return the created contact with relationships
	var createdContact models.Contact
	config.DB.Preload("Company").First(&createdContact, contact.ID)

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
	if updateData.CompanyID != "" {
		var company models.Company
		if err := config.DB.Where("id = ? AND tenant_id = ?", updateData.CompanyID, tenantID).First(&company).Error; err != nil {
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
