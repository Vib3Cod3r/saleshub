package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetLeads returns a list of leads
func GetLeads(c *gin.Context) {
	var leads []models.Lead
	tenantID := c.GetString("tenantID")
	
	query := config.DB.Where("tenant_id = ?", tenantID)
	
	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit
	
	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("first_name ILIKE ? OR last_name ILIKE ? OR company_name ILIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Offset(offset).Limit(limit).Find(&leads).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leads"})
		return
	}
	
	c.JSON(http.StatusOK, leads)
}

// CreateLead creates a new lead
func CreateLead(c *gin.Context) {
	var lead models.Lead
	if err := c.ShouldBindJSON(&lead); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	lead.TenantID = c.GetString("tenantID")
	userID := c.GetString("userID")
	lead.CreatedBy = &userID
	
	if err := config.DB.Create(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create lead"})
		return
	}
	
	c.JSON(http.StatusCreated, lead)
}

// GetLead returns a single lead
func GetLead(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var lead models.Lead
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&lead).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Lead not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lead"})
		return
	}
	
	c.JSON(http.StatusOK, lead)
}

// UpdateLead updates a lead
func UpdateLead(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var lead models.Lead
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&lead).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Lead not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lead"})
		return
	}
	
	var updateData models.Lead
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := config.DB.Model(&lead).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update lead"})
		return
	}
	
	c.JSON(http.StatusOK, lead)
}

// DeleteLead deletes a lead
func DeleteLead(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var lead models.Lead
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&lead).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Lead not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lead"})
		return
	}
	
	if err := config.DB.Delete(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete lead"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Lead deleted successfully"})
}
