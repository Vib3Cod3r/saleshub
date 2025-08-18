package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"saleshub-backend/config"
	"saleshub-backend/lib"
	"saleshub-backend/models"
)

// GetUsers returns a list of users for the current tenant
func GetUsers(c *gin.Context) {
	start := time.Now()
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userId")
	requestID := c.GetString("requestID")

	// Create database logger for this request
	dbLogger := lib.NewDatabaseLogger(requestID, userID, tenantID)
	perfLogger := lib.NewDatabasePerformanceLogger(requestID, userID, tenantID)

	// Log operation start
	dbLogger.LogOperation("SELECT", "users", 0, nil, map[string]interface{}{
		"tenant_id": tenantID,
	})

	var users []models.User
	query := config.DB.Where("tenant_id = ? AND is_active = ?", tenantID, true)

	// Preload role information
	query = query.Preload("Role")

	// Execute query
	err := perfLogger.MonitorQuery("SELECT", "users", func() error {
		return query.Find(&users).Error
	})

	if err != nil {
		dbLogger.LogError("SELECT", "users", err, map[string]interface{}{
			"tenant_id": tenantID,
		})
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Log successful operation
	dbLogger.LogOperation("SELECT", "users", time.Since(start), nil, map[string]interface{}{
		"tenant_id": tenantID,
		"count":     len(users),
	})

	// Return users with only necessary fields for contact owner selection
	type UserResponse struct {
		ID        string `json:"id"`
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
		Role      *struct {
			Name string `json:"name"`
		} `json:"role,omitempty"`
	}

	var userResponses []UserResponse
	for _, user := range users {
		userResponse := UserResponse{
			ID:        user.ID,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Email:     user.Email,
		}
		if user.Role != nil {
			userResponse.Role = &struct {
				Name string `json:"name"`
			}{
				Name: user.Role.Name,
			}
		}
		userResponses = append(userResponses, userResponse)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": userResponses,
	})
}
