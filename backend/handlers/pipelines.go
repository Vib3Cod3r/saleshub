package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetPipelines returns a list of pipelines
func GetPipelines(c *gin.Context) {
	var pipelines []models.Pipeline
	tenantID := c.GetString("tenantID")
	
	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&pipelines).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pipelines"})
		return
	}
	
	c.JSON(http.StatusOK, pipelines)
}

// CreatePipeline creates a new pipeline
func CreatePipeline(c *gin.Context) {
	var pipeline models.Pipeline
	if err := c.ShouldBindJSON(&pipeline); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	pipeline.TenantID = c.GetString("tenantID")
	
	if err := config.DB.Create(&pipeline).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create pipeline"})
		return
	}
	
	c.JSON(http.StatusCreated, pipeline)
}

// GetPipeline returns a single pipeline
func GetPipeline(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var pipeline models.Pipeline
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&pipeline).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pipeline not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pipeline"})
		return
	}
	
	c.JSON(http.StatusOK, pipeline)
}

// UpdatePipeline updates a pipeline
func UpdatePipeline(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var pipeline models.Pipeline
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&pipeline).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pipeline not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pipeline"})
		return
	}
	
	var updateData models.Pipeline
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := config.DB.Model(&pipeline).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update pipeline"})
		return
	}
	
	c.JSON(http.StatusOK, pipeline)
}

// DeletePipeline deletes a pipeline
func DeletePipeline(c *gin.Context) {
	id := c.Param("id")
	tenantID := c.GetString("tenantID")
	
	var pipeline models.Pipeline
	if err := config.DB.Where("id = ? AND tenant_id = ?", id, tenantID).First(&pipeline).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Pipeline not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pipeline"})
		return
	}
	
	if err := config.DB.Delete(&pipeline).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete pipeline"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Pipeline deleted successfully"})
}
