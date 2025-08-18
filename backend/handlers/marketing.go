package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetMarketingSources returns a list of marketing sources
func GetMarketingSources(c *gin.Context) {
	var sources []models.MarketingSource
	tenantID := c.GetString("tenantID")
	
	query := config.DB.Where("tenant_id = ?", tenantID)
	
	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit
	
	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Offset(offset).Limit(limit).Find(&sources).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing sources"})
		return
	}
	
	c.JSON(http.StatusOK, sources)
}

// CreateMarketingSource creates a new marketing source
func CreateMarketingSource(c *gin.Context) {
	var source models.MarketingSource
	if err := c.ShouldBindJSON(&source); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	source.TenantID = c.GetString("tenantID")
	
	if err := config.DB.Create(&source).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create marketing source"})
		return
	}
	
	c.JSON(http.StatusCreated, source)
}

// GetMarketingSource returns a single marketing source
func GetMarketingSource(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var source models.MarketingSource
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&source).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Marketing source not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing source"})
		return
	}
	
	c.JSON(http.StatusOK, source)
}

// UpdateMarketingSource updates a marketing source
func UpdateMarketingSource(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var source models.MarketingSource
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&source).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Marketing source not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing source"})
		return
	}
	
	var updateData models.MarketingSource
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := config.DB.Model(&source).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update marketing source"})
		return
	}
	
	c.JSON(http.StatusOK, source)
}

// DeleteMarketingSource deletes a marketing source
func DeleteMarketingSource(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var source models.MarketingSource
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&source).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Marketing source not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing source"})
		return
	}
	
	if err := config.DB.Delete(&source).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete marketing source"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Marketing source deleted successfully"})
}

// GetMarketingAssets returns a list of marketing assets
func GetMarketingAssets(c *gin.Context) {
	var assets []models.MarketingAsset
	tenantID := c.GetString("tenantID")
	
	query := config.DB.Where("tenant_id = ?", tenantID)
	
	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit
	
	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}
	
	if err := query.Offset(offset).Limit(limit).Find(&assets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing assets"})
		return
	}
	
	c.JSON(http.StatusOK, assets)
}

// CreateMarketingAsset creates a new marketing asset
func CreateMarketingAsset(c *gin.Context) {
	var asset models.MarketingAsset
	if err := c.ShouldBindJSON(&asset); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	asset.TenantID = c.GetString("tenantID")
	
	if err := config.DB.Create(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create marketing asset"})
		return
	}
	
	c.JSON(http.StatusCreated, asset)
}

// GetMarketingAsset returns a single marketing asset
func GetMarketingAsset(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var asset models.MarketingAsset
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&asset).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Marketing asset not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing asset"})
		return
	}
	
	c.JSON(http.StatusOK, asset)
}

// UpdateMarketingAsset updates a marketing asset
func UpdateMarketingAsset(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var asset models.MarketingAsset
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&asset).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Marketing asset not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing asset"})
		return
	}
	
	var updateData models.MarketingAsset
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := config.DB.Model(&asset).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update marketing asset"})
		return
	}
	
	c.JSON(http.StatusOK, asset)
}

// DeleteMarketingAsset deletes a marketing asset
func DeleteMarketingAsset(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var asset models.MarketingAsset
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&asset).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Marketing asset not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing asset"})
		return
	}
	
	if err := config.DB.Delete(&asset).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete marketing asset"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Marketing asset deleted successfully"})
}
