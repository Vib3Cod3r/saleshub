package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetCommunications returns a list of communications
func GetCommunications(c *gin.Context) {
	var communications []models.Communication
	tenantID := c.GetString("tenantID")
	
	query := config.DB.Where("tenant_id = ?", tenantID)
	
	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit
	
	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("subject ILIKE ? OR content ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Offset(offset).Limit(limit).Find(&communications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch communications"})
		return
	}
	
	c.JSON(http.StatusOK, communications)
}

// CreateCommunication creates a new communication
func CreateCommunication(c *gin.Context) {
	var communication models.Communication
	if err := c.ShouldBindJSON(&communication); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	communication.TenantID = c.GetString("tenantID")
	userID := c.GetString("userID")
	communication.UserID = userID
	
	if err := config.DB.Create(&communication).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create communication"})
		return
	}
	
	c.JSON(http.StatusCreated, communication)
}

// GetCommunication returns a single communication
func GetCommunication(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var communication models.Communication
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&communication).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Communication not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch communication"})
		return
	}
	
	c.JSON(http.StatusOK, communication)
}

// UpdateCommunication updates a communication
func UpdateCommunication(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var communication models.Communication
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&communication).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Communication not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch communication"})
		return
	}
	
	var updateData models.Communication
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := config.DB.Model(&communication).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update communication"})
		return
	}
	
	c.JSON(http.StatusOK, communication)
}

// DeleteCommunication deletes a communication
func DeleteCommunication(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var communication models.Communication
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&communication).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Communication not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch communication"})
		return
	}
	
	if err := config.DB.Delete(&communication).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete communication"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Communication deleted successfully"})
}
