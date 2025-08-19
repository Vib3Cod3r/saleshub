package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"saleshub-backend/internal/services"
	"saleshub-backend/lib"
	"saleshub-backend/models"
	"saleshub-backend/pkg/auth"
	"saleshub-backend/pkg/validation"
)

// AuthHandler handles HTTP requests for authentication
type AuthHandler struct {
	authService services.AuthService
	logger      *lib.APILogger
}

// NewAuthHandler creates a new AuthHandler instance
func NewAuthHandler(authService services.AuthService, logger *lib.APILogger) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		logger:      logger,
	}
}

// Register handles user registration requests
func (h *AuthHandler) Register(c *gin.Context) {
	userID := ""
	tenantID := ""

	var req services.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.LogError("Register", c.Request.URL.Path, userID, tenantID, err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Call service layer
	response, err := h.authService.Register(&req)
	if err != nil {
		h.handleAuthError(c, "Register", err, userID, tenantID)
		return
	}

	// Log successful registration
	h.logger.LogAuthentication("Register", req.Email, response.User.ID, tenantID, c.ClientIP(), true)

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"data":    response,
	})
}

// Login handles user login requests
func (h *AuthHandler) Login(c *gin.Context) {
	userID := ""
	tenantID := ""

	var req services.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.LogError("Login", c.Request.URL.Path, userID, tenantID, err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Call service layer
	response, err := h.authService.Login(&req)
	if err != nil {
		h.handleAuthError(c, "Login", err, userID, tenantID)
		return
	}

	// Log successful login
	h.logger.LogAuthentication("Login", req.Email, response.User.ID, tenantID, c.ClientIP(), true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"data":    response,
	})
}

// RefreshToken handles token refresh requests
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	userID := ""
	tenantID := ""

	// Extract token from Authorization header
	token := h.extractTokenFromHeader(c)
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authorization token required",
		})
		return
	}

	// Call service layer
	response, err := h.authService.RefreshToken(token)
	if err != nil {
		h.handleAuthError(c, "RefreshToken", err, userID, tenantID)
		return
	}

	// Log successful token refresh
	h.logger.LogAuthentication("RefreshToken", response.User.Email, response.User.ID, tenantID, c.ClientIP(), true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Token refreshed successfully",
		"data":    response,
	})
}

// GetProfile handles user profile retrieval
func (h *AuthHandler) GetProfile(c *gin.Context) {
	start := time.Now()
	userID := ""

	// Extract user from context (set by auth middleware)
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	userModel := user.(*models.User)
	userID = userModel.ID

	// Log profile retrieval
	h.logger.LogPerformance("GetProfile", c.Request.URL.Path, time.Since(start), http.StatusOK, userID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile retrieved successfully",
		"data":    userModel,
	})
}

// UpdateProfile handles user profile updates
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	start := time.Now()
	userID := ""

	// Extract user from context
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "User not authenticated",
		})
		return
	}

	userModel := user.(*models.User)
	userID = userModel.ID

	var req struct {
		FirstName string `json:"firstName" validate:"required"`
		LastName  string `json:"lastName" validate:"required"`
		Avatar    string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.LogError("UpdateProfile", c.Request.URL.Path, userID, "", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// Update user fields
	userModel.FirstName = req.FirstName
	userModel.LastName = req.LastName
	if req.Avatar != "" {
		userModel.Avatar = &req.Avatar
	}

	// TODO: Call user service to update profile
	// For now, just return success
	h.logger.LogPerformance("UpdateProfile", c.Request.URL.Path, time.Since(start), http.StatusOK, userID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"data":    userModel,
	})
}

// handleAuthError handles authentication errors and maps them to appropriate HTTP responses
func (h *AuthHandler) handleAuthError(c *gin.Context, operation string, err error, userID, tenantID string) {
	h.logger.LogError(operation, c.Request.URL.Path, userID, tenantID, err)

	switch e := err.(type) {
	case *validation.ValidationError:
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   e.Message,
			"details": e.Details,
		})
	case *auth.UserExistsError:
		c.JSON(http.StatusConflict, gin.H{
			"error": e.Error(),
		})
	case *auth.InvalidCredentialsError:
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": e.Error(),
		})
	case *auth.InactiveUserError:
		c.JSON(http.StatusForbidden, gin.H{
			"error": e.Error(),
		})
	case *auth.InvalidTokenError:
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": e.Error(),
		})
	case *auth.TenantNotFoundError:
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": e.Error(),
		})
	case *auth.RoleNotFoundError:
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": e.Error(),
		})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
		})
	}
}

// extractTokenFromHeader extracts the JWT token from the Authorization header
func (h *AuthHandler) extractTokenFromHeader(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return ""
	}

	// Check if it's a Bearer token
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		return authHeader[7:]
	}

	return ""
}
