package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CustomCORS middleware for better CORS handling
func CustomCORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Allow specific origins
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"https://localhost:3000",
			"https://127.0.0.1:3000",
		}
		
		// Check if origin is allowed
		originAllowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				originAllowed = true
				break
			}
		}
		
		if originAllowed {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		
		// Set CORS headers
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, X-CSRF-Token, X-API-Key, X-Client-Version, X-Client-Platform")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type, X-Total-Count, X-Page-Count, X-Current-Page")
		c.Header("Access-Control-Max-Age", "43200") // 12 hours
		
		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	}
}

// DebugCORS middleware for logging CORS requests
func DebugCORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		method := c.Request.Method
		path := c.Request.URL.Path
		
		// Log CORS requests in development
		if gin.Mode() == gin.DebugMode {
			c.Header("X-CORS-Debug", "enabled")
			c.Header("X-Request-Origin", origin)
			c.Header("X-Request-Method", method)
			c.Header("X-Request-Path", path)
		}
		
		c.Next()
	}
}
