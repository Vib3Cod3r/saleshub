package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// GetLeadStatuses returns all lead statuses
func GetLeadStatuses(c *gin.Context) {
	var statuses []models.LeadStatus
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Order("\"order\"").Find(&statuses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lead statuses"})
		return
	}

	c.JSON(http.StatusOK, statuses)
}

// GetLeadTemperatures returns all lead temperatures
func GetLeadTemperatures(c *gin.Context) {
	var temperatures []models.LeadTemperature
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Order("\"order\"").Find(&temperatures).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lead temperatures"})
		return
	}

	c.JSON(http.StatusOK, temperatures)
}

// GetIndustries returns all industries
func GetIndustries(c *gin.Context) {
	var industries []models.Industry
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&industries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch industries"})
		return
	}

	c.JSON(http.StatusOK, industries)
}

// GetCompanySizes returns all company sizes
func GetCompanySizes(c *gin.Context) {
	var sizes []models.CompanySize
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&sizes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch company sizes"})
		return
	}

	c.JSON(http.StatusOK, sizes)
}

// GetMarketingSourceTypes returns all marketing source types
func GetMarketingSourceTypes(c *gin.Context) {
	var types []models.MarketingSourceType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing source types"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GetMarketingAssetTypes returns all marketing asset types
func GetMarketingAssetTypes(c *gin.Context) {
	var types []models.MarketingAssetType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch marketing asset types"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GetCommunicationTypes returns all communication types
func GetCommunicationTypes(c *gin.Context) {
	var types []models.CommunicationType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch communication types"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GetTaskTypes returns all task types
func GetTaskTypes(c *gin.Context) {
	var types []models.TaskType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch task types"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GetTerritoryTypes returns all territory types
func GetTerritoryTypes(c *gin.Context) {
	var types []models.TerritoryType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch territory types"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GetEmailAddressTypes returns all email address types
func GetEmailAddressTypes(c *gin.Context) {
	var types []models.EmailAddressType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch email address types"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GetPhoneNumberTypes returns all phone number types
func GetPhoneNumberTypes(c *gin.Context) {
	var types []models.PhoneNumberType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch phone number types"})
		return
	}

	c.JSON(http.StatusOK, types)
}

// GetAddressTypes returns all address types
func GetAddressTypes(c *gin.Context) {
	var types []models.AddressType
	tenantID := c.GetString("tenantID")

	if err := config.DB.Where("tenant_id = ?", tenantID).Find(&types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch address types"})
		return
	}

	c.JSON(http.StatusOK, types)
}
