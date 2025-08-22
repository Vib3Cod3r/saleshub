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

	// Preload relationships
	query = query.Preload("Pipeline").
		Preload("Stage").
		Preload("Company").
		Preload("Contact").
		Preload("AssignedUser")

	// Add pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	// Add search
	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	// Get total count for pagination
	var total int64
	if err := config.DB.Model(&models.Deal{}).Where("tenant_id = ?", tenantID).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count deals"})
		return
	}

	if err := query.Offset(offset).Limit(limit).Find(&deals).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}

	// Calculate total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	// Transform deals to response format
	var dealResponses []gin.H
	for _, deal := range deals {
		dealData := gin.H{
			"id":                deal.ID,
			"name":              deal.Name,
			"amount":            deal.Amount,
			"currency":          deal.Currency,
			"probability":       deal.Probability,
			"pipelineId":        deal.PipelineID,
			"pipeline":          deal.Pipeline,
			"stageId":           deal.StageID,
			"stage":             deal.Stage,
			"expectedCloseDate": deal.ExpectedCloseDate,
			"actualCloseDate":   deal.ActualCloseDate,
			"companyId":         deal.CompanyID,
			"company":           deal.Company,
			"contactId":         deal.ContactID,
			"contact":           deal.Contact,
			"assignedUserId":    deal.AssignedUserID,
			"assignedUser":      deal.AssignedUser,
			"tenantId":          deal.TenantID,
			"createdAt":         deal.CreatedAt,
			"updatedAt":         deal.UpdatedAt,
			"createdBy":         deal.CreatedBy,
		}
		dealResponses = append(dealResponses, dealData)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": dealResponses,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
	})
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
