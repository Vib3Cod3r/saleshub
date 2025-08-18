package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetCompanies returns a list of companies with pagination and search
func GetCompanies(c *gin.Context) {
	var companies []models.Company
	tenantID := c.GetString("tenantID")

	query := config.DB.Where("tenant_id = ?", tenantID)

	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	// Preload relationships
	query = query.Preload("Industry").
		Preload("Size").
		Preload("Contacts").
		Preload("Contacts.PhoneNumbers").
		Preload("Contacts.EmailAddresses")

	// Get total count for pagination
	var total int64
	if err := config.DB.Model(&models.Company{}).Where("tenant_id = ?", tenantID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count companies"})
		return
	}

	if err := query.Offset(offset).Limit(limit).Find(&companies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch companies"})
		return
	}

	// Calculate total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	c.JSON(http.StatusOK, gin.H{
		"data": companies,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
	})
}

// CreateCompany creates a new company
func CreateCompany(c *gin.Context) {
	var company models.Company
	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	company.TenantID = c.GetString("tenantID")
	userID := c.GetString("userID")
	company.CreatedBy = &userID

	if err := config.DB.Create(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create company"})
		return
	}

	c.JSON(http.StatusCreated, company)
}

// GetCompany returns a single company
func GetCompany(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var company models.Company
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&company).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch company"})
		return
	}

	c.JSON(http.StatusOK, company)
}

// UpdateCompany updates a company
func UpdateCompany(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var company models.Company
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&company).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch company"})
		return
	}

	var updateData models.Company
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Model(&company).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update company"})
		return
	}

	c.JSON(http.StatusOK, company)
}

// DeleteCompany deletes a company
func DeleteCompany(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")

	var company models.Company
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&company).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch company"})
		return
	}

	if err := config.DB.Delete(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete company"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Company deleted successfully"})
}
