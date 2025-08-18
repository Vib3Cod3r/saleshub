package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"saleshub-backend/config"
	"saleshub-backend/handlers"
	"saleshub-backend/middleware"
)

func main() {
	startTime := time.Now()
	
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	// Setup lifecycle logging
	lifecycleConfig := config.DefaultLifecycleLogConfig()
	if err := config.SetupLifecycleLogging(lifecycleConfig); err != nil {
		log.Fatal("Failed to setup lifecycle logging:", err)
	}

	// Get environment and port
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}
	
	port := os.Getenv("PORT")
	if port == "" {
		port = "8089"
	}

	// Log server start
	config.LogServerStart(port, env, map[string]interface{}{
		"version": "1.0.0",
		"gin_mode": env,
	})

	// Initialize database
	config.InitDatabase()
	config.AutoMigrate()
	config.SeedDatabase()

	// Setup API logging
	apiLogConfig := config.DefaultAPILoggingConfig()
	config.SetupAPILogging(apiLogConfig)

	// Set Gin mode
	if env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:3000"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	// API logging middleware
	apiLoggerConfig := middleware.DefaultAPILoggerConfig()
	r.Use(middleware.APILogger(apiLoggerConfig))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		start := time.Now()
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "SalesHub CRM API is running",
		})
		config.LogHealthCheck("healthy", time.Since(start), map[string]interface{}{
			"endpoint": "/health",
		})
	})

	// API routes
	api := r.Group("/api")
	{
		// Authentication routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// User profile routes
			auth := protected.Group("/auth")
			{
				auth.GET("/me", handlers.GetProfile)
				auth.PUT("/profile", handlers.UpdateProfile)
				auth.PUT("/password", handlers.ChangePassword)
				auth.POST("/refresh", handlers.RefreshToken)
			}

			// CRM routes
			crm := protected.Group("/crm")
			{
				// Users
				users := crm.Group("/users")
				{
					users.GET("", handlers.GetUsers)
				}

				// Companies
				companies := crm.Group("/companies")
				{
					companies.GET("", handlers.GetCompanies)
					companies.POST("", handlers.CreateCompany)
					companies.GET("/:id", handlers.GetCompany)
					companies.PUT("/:id", handlers.UpdateCompany)
					companies.DELETE("/:id", handlers.DeleteCompany)
				}

				// Contacts
				contacts := crm.Group("/contacts")
				{
					contacts.GET("", handlers.GetContacts)
					contacts.POST("", handlers.CreateContact)
					contacts.GET("/:id", handlers.GetContact)
					contacts.PUT("/:id", handlers.UpdateContact)
					contacts.DELETE("/:id", handlers.DeleteContact)
				}

				// Leads
				leads := crm.Group("/leads")
				{
					leads.GET("", handlers.GetLeads)
					leads.POST("", handlers.CreateLead)
					leads.GET("/:id", handlers.GetLead)
					leads.PUT("/:id", handlers.UpdateLead)
					leads.DELETE("/:id", handlers.DeleteLead)
				}

				// Deals
				deals := crm.Group("/deals")
				{
					deals.GET("", handlers.GetDeals)
					deals.POST("", handlers.CreateDeal)
					deals.GET("/:id", handlers.GetDeal)
					deals.PUT("/:id", handlers.UpdateDeal)
					deals.DELETE("/:id", handlers.DeleteDeal)
				}

				// Pipelines
				pipelines := crm.Group("/pipelines")
				{
					pipelines.GET("", handlers.GetPipelines)
					pipelines.POST("", handlers.CreatePipeline)
					pipelines.GET("/:id", handlers.GetPipeline)
					pipelines.PUT("/:id", handlers.UpdatePipeline)
					pipelines.DELETE("/:id", handlers.DeletePipeline)
				}

				// Tasks
				tasks := crm.Group("/tasks")
				{
					tasks.GET("", handlers.GetTasks)
					tasks.POST("", handlers.CreateTask)
					tasks.GET("/:id", handlers.GetTask)
					tasks.PUT("/:id", handlers.UpdateTask)
					tasks.DELETE("/:id", handlers.DeleteTask)
				}

				// Communications
				communications := crm.Group("/communications")
				{
					communications.GET("", handlers.GetCommunications)
					communications.POST("", handlers.CreateCommunication)
					communications.GET("/:id", handlers.GetCommunication)
					communications.PUT("/:id", handlers.UpdateCommunication)
					communications.DELETE("/:id", handlers.DeleteCommunication)
				}
			}

			// Marketing routes
			marketing := protected.Group("/marketing")
			{
				// Marketing sources
				sources := marketing.Group("/sources")
				{
					sources.GET("", handlers.GetMarketingSources)
					sources.POST("", handlers.CreateMarketingSource)
					sources.GET("/:id", handlers.GetMarketingSource)
					sources.PUT("/:id", handlers.UpdateMarketingSource)
					sources.DELETE("/:id", handlers.DeleteMarketingSource)
				}

				// Marketing assets
				assets := marketing.Group("/assets")
				{
					assets.GET("", handlers.GetMarketingAssets)
					assets.POST("", handlers.CreateMarketingAsset)
					assets.GET("/:id", handlers.GetMarketingAsset)
					assets.PUT("/:id", handlers.UpdateMarketingAsset)
					assets.DELETE("/:id", handlers.DeleteMarketingAsset)
				}
			}

			// Lookup data routes
			lookups := protected.Group("/lookups")
			{
				lookups.GET("/lead-statuses", handlers.GetLeadStatuses)
				lookups.GET("/lead-temperatures", handlers.GetLeadTemperatures)
				lookups.GET("/industries", handlers.GetIndustries)
				lookups.GET("/company-sizes", handlers.GetCompanySizes)
				lookups.GET("/task-types", handlers.GetTaskTypes)
				lookups.GET("/communication-types", handlers.GetCommunicationTypes)
				lookups.GET("/email-address-types", handlers.GetEmailAddressTypes)
				lookups.GET("/phone-number-types", handlers.GetPhoneNumberTypes)
				lookups.GET("/address-types", handlers.GetAddressTypes)
			}
		}
	}

	// Log server started successfully
	config.LogServerStarted(port, time.Since(startTime))

	// Setup graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Create server
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting SalesHub CRM API server on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			config.LogApplicationError("server", "listen_and_serve", err, map[string]interface{}{
				"port": port,
			})
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Log shutdown
	uptime := time.Since(startTime)
	config.LogServerShutdown("graceful_shutdown", uptime)

	// Graceful shutdown
	ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		config.LogApplicationError("server", "shutdown", err, map[string]interface{}{
			"timeout": "30s",
		})
		log.Fatal("Server forced to shutdown:", err)
	}

	// Close lifecycle logging
	config.CloseLifecycleLogging()

	log.Println("Server exited")
}
