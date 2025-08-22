package main

import (
	"log"
	"net/http"
	"os"

	"saleshub-backend/config"
	"saleshub-backend/handlers"
	"saleshub-backend/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	// Initialize database
	config.InitDatabase()

	// Skip problematic migrations for now and just seed the database
	// The database already exists with the correct schema
	config.SeedDatabase()

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create router
	r := gin.New()

	// Initialize error tracker
	middleware.InitGlobalErrorTracker(nil)

	// Use middleware
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(middleware.CustomCORS())
	r.Use(middleware.ErrorTrackerMiddleware(middleware.GetGlobalErrorTracker()))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "SalesHub CRM API is running",
			"port":    port,
		})
	})

	// Error tracker routes
	r.GET("/api/error-tracker/data", handlers.GetErrorTrackerData)
	r.GET("/api/error-tracker/health", handlers.GetErrorTrackerHealth)
	r.DELETE("/api/error-tracker/data", handlers.ClearErrorTrackerData)
	r.GET("/api/error-tracker/rules", handlers.GetErrorPreventionRules)

	// API routes
	api := r.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", handlers.Login)
			auth.POST("/register", handlers.Register)
			auth.GET("/me", middleware.AuthMiddleware(), handlers.GetProfile)
			auth.PUT("/profile", middleware.AuthMiddleware(), handlers.UpdateProfile)
			auth.POST("/change-password", middleware.AuthMiddleware(), handlers.ChangePassword)
			auth.POST("/refresh", middleware.AuthMiddleware(), handlers.RefreshToken)
		}

		// CRM routes (protected)
		crm := api.Group("/crm")
		crm.Use(middleware.AuthMiddleware())
		{
			// Entity system routes
			entities := crm.Group("/entities")
			{
				entities.GET("/:entityType/specification", handlers.GetEntitySpecification)
				entities.POST("/:entityType/data", handlers.GetEntityData)
			}

			companies := crm.Group("/companies")
			{
				companies.GET("", handlers.GetCompanies)
			}

			contacts := crm.Group("/contacts")
			{
				contacts.GET("", handlers.GetContacts)
				contacts.POST("", handlers.CreateContact)
				contacts.GET("/:id", handlers.GetContact)
			}

			leads := crm.Group("/leads")
			{
				leads.GET("", handlers.GetLeads)
				leads.POST("", handlers.CreateLead)
				leads.GET("/:id", handlers.GetLead)
			}

			deals := crm.Group("/deals")
			{
				deals.GET("", handlers.GetDeals)
				deals.POST("", handlers.CreateDeal)
				deals.GET("/:id", handlers.GetDeal)
			}

			tasks := crm.Group("/tasks")
			{
				tasks.GET("", handlers.GetTasks)
				tasks.POST("", handlers.CreateTask)
				tasks.GET("/:id", handlers.GetTask)
			}

			pipelines := crm.Group("/pipelines")
			{
				pipelines.GET("", handlers.GetPipelines)
				pipelines.POST("", handlers.CreatePipeline)
				pipelines.GET("/:id", handlers.GetPipeline)
			}
		}
	}

	// Start server
	log.Printf("Starting SalesHub CRM API server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
