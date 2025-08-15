package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetDeals returns a list of deals
func GetDeals(c *gin.Context) {
	var deals []models.Deal
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
	
	if err := query.Offset(offset).Limit(limit).Find(&deals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}
	
	c.JSON(http.StatusOK, deals)
}

// CreateDeal creates a new deal
func CreateDeal(c *gin.Context) {
	var deal models.Deal
	if err := c.ShouldBindJSON(&deal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	deal.TenantID = c.GetString("tenantID")
	userID := c.GetString("userID")
	deal.CreatedBy = &userID
	
	if err := config.DB.Create(&deal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create deal"})
		return
	}
	
	c.JSON(http.StatusCreated, deal)
}

// GetDeal returns a single deal
func GetDeal(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var deal models.Deal
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&deal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deal"})
		return
	}
	
	c.JSON(http.StatusOK, deal)
}

// UpdateDeal updates a deal
func UpdateDeal(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var deal models.Deal
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&deal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deal"})
		return
	}
	
	var updateData models.Deal
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := config.DB.Model(&deal).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update deal"})
		return
	}
	
	c.JSON(http.StatusOK, deal)
}

// DeleteDeal deletes a deal
func DeleteDeal(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var deal models.Deal
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&deal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deal"})
		return
	}
	
	if err := config.DB.Delete(&deal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete deal"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Deal deleted successfully"})
}
