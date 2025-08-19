package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create router
	r := gin.New()
	
	// Use only essential middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(corsMiddleware())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "SalesHub CRM API is running",
			"port":    port,
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", handleLogin)
			auth.POST("/register", handleRegister)
			auth.GET("/me", handleGetProfile)
		}

		// CRM routes
		crm := api.Group("/crm")
		{
			companies := crm.Group("/companies")
			{
				companies.GET("", handleGetCompanies)
				companies.POST("", handleCreateCompany)
				companies.GET("/:id", handleGetCompany)
			}

			contacts := crm.Group("/contacts")
			{
				contacts.GET("", handleGetContacts)
				contacts.POST("", handleCreateContact)
				contacts.GET("/:id", handleGetContact)
			}

			leads := crm.Group("/leads")
			{
				leads.GET("", handleGetLeads)
				leads.POST("", handleCreateLead)
				leads.GET("/:id", handleGetLead)
			}
		}
	}

	// Start server
	log.Printf("Starting SalesHub CRM API server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// Simple CORS middleware
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Allow localhost origins
		if origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		
		// Handle preflight
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
	}
}

// Simple handlers - just return mock data for now
func handleLogin(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Login endpoint",
		"token":   "mock-jwt-token",
	})
}

func handleRegister(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Register endpoint",
		"user":    gin.H{"id": 1, "email": "user@example.com"},
	})
}

func handleGetProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Get profile endpoint",
		"user":    gin.H{"id": 1, "email": "user@example.com", "name": "Test User"},
	})
}

func handleGetCompanies(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Get companies endpoint",
		"companies": []gin.H{
			{"id": 1, "name": "Acme Corp", "industry": "Technology"},
			{"id": 2, "name": "TechStart", "industry": "Software"},
		},
	})
}

func handleCreateCompany(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Create company endpoint",
		"company": gin.H{"id": 3, "name": "New Company"},
	})
}

func handleGetCompany(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Get company endpoint",
		"company": gin.H{"id": id, "name": "Company " + id},
	})
}

func handleGetContacts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Get contacts endpoint",
		"contacts": []gin.H{
			{"id": 1, "name": "John Doe", "email": "john@example.com"},
			{"id": 2, "name": "Jane Smith", "email": "jane@example.com"},
		},
	})
}

func handleCreateContact(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Create contact endpoint",
		"contact": gin.H{"id": 3, "name": "New Contact"},
	})
}

func handleGetContact(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Get contact endpoint",
		"contact": gin.H{"id": id, "name": "Contact " + id},
	})
}

func handleGetLeads(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Get leads endpoint",
		"leads": []gin.H{
			{"id": 1, "name": "Lead 1", "status": "New"},
			{"id": 2, "name": "Lead 2", "status": "Qualified"},
		},
	})
}

func handleCreateLead(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Create lead endpoint",
		"lead": gin.H{"id": 3, "name": "New Lead"},
	})
}

func handleGetLead(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Get lead endpoint",
		"lead": gin.H{"id": id, "name": "Lead " + id},
	})
}
