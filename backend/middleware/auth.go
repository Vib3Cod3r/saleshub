package middleware

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"saleshub-backend/config"
	"saleshub-backend/models"
)

// Claims represents the JWT claims
type Claims struct {
	UserID   string `json:"userId"`
	Email    string `json:"email"`
	TenantID string `json:"tenantId"`
	RoleID   string `json:"roleId"`
	jwt.RegisteredClaims
}

// AuthMiddleware handles JWT authentication
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Check if the header starts with "Bearer "
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// Extract the token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		// Parse and validate the token
		claims, err := ParseToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Check if user exists and is active
		var user models.User
		if err := config.DB.Where("id = ? AND is_active = ?", claims.UserID, true).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found or inactive"})
			c.Abort()
			return
		}

		// Add user info to context
		c.Set("user", &user)
		c.Set("userId", claims.UserID)
		c.Set("tenantID", claims.TenantID)
		c.Set("email", claims.Email)

		// Debug logging
		log.Printf("DEBUG: Auth middleware - UserID: %s, TenantID: %s, Email: %s", claims.UserID, claims.TenantID, claims.Email)

		c.Next()
	}
}

// GenerateToken generates a new JWT token
func GenerateToken(user models.User) (string, error) {
	expiryHours := 24 // Default to 24 hours
	if envExpiry := os.Getenv("JWT_EXPIRY_HOURS"); envExpiry != "" {
		if parsed, err := time.ParseDuration(envExpiry + "h"); err == nil {
			expiryHours = int(parsed.Hours())
		}
	}

	claims := Claims{
		UserID:   user.ID,
		Email:    user.Email,
		TenantID: user.TenantID,
		RoleID:   "",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiryHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	// Debug logging for token generation
	log.Printf("DEBUG: GenerateToken - UserID: %s, TenantID: %s, Email: %s", user.ID, user.TenantID, user.Email)

	if user.RoleID != "" {
		claims.RoleID = user.RoleID
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-super-secret-jwt-key-here"
	}

	return token.SignedString([]byte(jwtSecret))
}

// ParseToken parses and validates a JWT token
func ParseToken(tokenString string) (*Claims, error) {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-super-secret-jwt-key-here"
	}

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, jwt.ErrSignatureInvalid
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// CheckPassword checks if a password matches a hash
func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GetCurrentUser retrieves the current user from the context
func GetCurrentUser(c *gin.Context) (*models.User, bool) {
	user, exists := c.Get("user")
	if !exists {
		return nil, false
	}

	if userObj, ok := user.(*models.User); ok {
		return userObj, true
	}

	return nil, false
}

// GetCurrentUserID retrieves the current user ID from the context
func GetCurrentUserID(c *gin.Context) (string, bool) {
	userID, exists := c.Get("userId")
	if !exists {
		return "", false
	}

	if userIDStr, ok := userID.(string); ok {
		return userIDStr, true
	}

	return "", false
}

// GetCurrentTenantID retrieves the current tenant ID from the context
func GetCurrentTenantID(c *gin.Context) (string, bool) {
	tenantID, exists := c.Get("tenantID")
	if !exists {
		return "", false
	}

	if tenantIDStr, ok := tenantID.(string); ok {
		return tenantIDStr, true
	}

	return "", false
}

// RequireRole middleware checks if the user has a specific role
func RequireRole(roleCode string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := GetCurrentUser(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		if user.RoleID == "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "User has no role assigned"})
			c.Abort()
			return
		}

		var role models.UserRole
		if err := config.DB.Where("id = ? AND code = ?", user.RoleID, roleCode).First(&role).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireAnyRole middleware checks if the user has any of the specified roles
func RequireAnyRole(roleCodes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, exists := GetCurrentUser(c)
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			c.Abort()
			return
		}

		if user.RoleID == "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "User has no role assigned"})
			c.Abort()
			return
		}

		var role models.UserRole
		if err := config.DB.Where("id = ? AND code IN ?", user.RoleID, roleCodes).First(&role).Error; err != nil {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}
