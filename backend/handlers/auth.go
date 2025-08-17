package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"saleshub-backend/config"
	"saleshub-backend/lib"
	"saleshub-backend/middleware"
	"saleshub-backend/models"
)

// RegisterRequest represents the request body for user registration
type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
}

// LoginRequest represents the request body for user login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse represents the response for authentication endpoints
type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// Register handles user registration
func Register(c *gin.Context) {
	start := time.Now()
	userID := ""
	tenantID := ""
	ipAddress := c.ClientIP()

	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		lib.APILog.LogError("Register", c.Request.URL.Path, userID, tenantID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := config.DB.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Get default tenant
	var tenant models.Tenant
	if err := config.DB.Where("subdomain = ?", "default").First(&tenant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Default tenant not found"})
		return
	}

	// Get default admin role
	var adminRole models.UserRole
	if err := config.DB.Where("code = ? AND tenant_id = ?", "ADMIN", tenant.ID).First(&adminRole).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Default admin role not found"})
		return
	}

	// Hash password
	hashedPassword, err := middleware.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user := models.User{
		Email:     req.Email,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		IsActive:  true,
		RoleID:    adminRole.ID,
		TenantID:  tenant.ID,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate token
	token, err := middleware.GenerateToken(user)
	if err != nil {
		lib.APILog.LogError("Register", c.Request.URL.Path, userID, tenantID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Load user with role
	config.DB.Preload("Role").Where("id = ?", user.ID).First(&user)

	// Log successful registration
	duration := time.Since(start)
	lib.APILog.LogAuthentication("Register", req.Email, user.ID, user.TenantID, ipAddress, true)
	lib.APILog.LogRequest(c.Request.Method, c.Request.URL.Path, user.ID, user.TenantID, ipAddress, duration, http.StatusCreated)

	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  user,
	})
}

// Login handles user login
func Login(c *gin.Context) {
	start := time.Now()
	userID := ""
	tenantID := ""
	ipAddress := c.ClientIP()

	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		lib.APILog.LogError("Login", c.Request.URL.Path, userID, tenantID, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Find user by email
	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		lib.APILog.LogAuthentication("Login", req.Email, userID, tenantID, ipAddress, false)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Check if user is active
	if !user.IsActive {
		lib.APILog.LogAuthentication("Login", req.Email, user.ID, user.TenantID, ipAddress, false)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is deactivated"})
		return
	}

	// Check password
	if !middleware.CheckPassword(req.Password, user.Password) {
		lib.APILog.LogAuthentication("Login", req.Email, user.ID, user.TenantID, ipAddress, false)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate token
	token, err := middleware.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Load user with role
	if err := config.DB.Preload("Role").Where("id = ?", user.ID).First(&user).Error; err != nil {
		// Log the error but don't fail the login
		log.Printf("Warning: Failed to load user role: %v", err)
	}

	// Log successful login
	duration := time.Since(start)
	lib.APILog.LogAuthentication("Login", req.Email, user.ID, user.TenantID, ipAddress, true)
	lib.APILog.LogRequest(c.Request.Method, c.Request.URL.Path, user.ID, user.TenantID, ipAddress, duration, http.StatusOK)

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  user,
	})
}

// GetProfile returns the current user's profile
func GetProfile(c *gin.Context) {
	user, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Load user with role and tenant
	if err := config.DB.Preload("Role").Preload("Tenant").Where("id = ?", user.ID).First(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// UpdateProfile updates the current user's profile
func UpdateProfile(c *gin.Context) {
	user, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		FirstName *string `json:"firstName"`
		LastName  *string `json:"lastName"`
		Avatar    *string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Update fields if provided
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Avatar != nil {
		user.Avatar = req.Avatar
	}

	if err := config.DB.Save(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Load user with role and tenant
	if err := config.DB.Preload("Role").Preload("Tenant").Where("id = ?", user.ID).First(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// ChangePassword changes the current user's password
func ChangePassword(c *gin.Context) {
	user, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req struct {
		CurrentPassword string `json:"currentPassword" binding:"required"`
		NewPassword     string `json:"newPassword" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data", "details": err.Error()})
		return
	}

	// Verify current password
	if !middleware.CheckPassword(req.CurrentPassword, user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Hash new password
	hashedPassword, err := middleware.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password
	user.Password = hashedPassword
	if err := config.DB.Save(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

// RefreshToken refreshes the user's JWT token
func RefreshToken(c *gin.Context) {
	user, exists := middleware.GetCurrentUser(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Generate new token
	token, err := middleware.GenerateToken(*user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Load user with role
	config.DB.Preload("Role").Where("id = ?", user.ID).First(user)

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  *user,
	})
}
