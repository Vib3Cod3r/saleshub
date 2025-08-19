package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Mock data structures
type User struct {
	ID      int    `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Role    string `json:"role"`
	Created string `json:"created"`
}

type Company struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Industry string `json:"industry"`
	Size     string `json:"size"`
	Website  string `json:"website"`
	Created  string `json:"created"`
}

type Contact struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	CompanyID int    `json:"companyId"`
	Title     string `json:"title"`
	Created   string `json:"created"`
}

type Lead struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Email   string `json:"email"`
	Company string `json:"company"`
	Status  string `json:"status"`
	Source  string `json:"source"`
	Created string `json:"created"`
}

type Deal struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	Value       float64 `json:"value"`
	Stage       string  `json:"stage"`
	CompanyID   int     `json:"companyId"`
	ContactID   int     `json:"contactId"`
	Probability int     `json:"probability"`
	Created     string  `json:"created"`
}

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
			"time":    time.Now().Format(time.RFC3339),
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
			auth.POST("/logout", handleLogout)
			auth.POST("/refresh", handleRefreshToken)
		}

		// CRM routes
		crm := api.Group("/crm")
		{
			// Companies
			companies := crm.Group("/companies")
			{
				companies.GET("", handleGetCompanies)
				companies.POST("", handleCreateCompany)
				companies.GET("/:id", handleGetCompany)
				companies.PUT("/:id", handleUpdateCompany)
				companies.DELETE("/:id", handleDeleteCompany)
				companies.GET("/:id/contacts", handleGetCompanyContacts)
			}

			// Contacts
			contacts := crm.Group("/contacts")
			{
				contacts.GET("", handleGetContacts)
				contacts.POST("", handleCreateContact)
				contacts.GET("/:id", handleGetContact)
				contacts.PUT("/:id", handleUpdateContact)
				contacts.DELETE("/:id", handleDeleteContact)
			}

			// Leads
			leads := crm.Group("/leads")
			{
				leads.GET("", handleGetLeads)
				leads.POST("", handleCreateLead)
				leads.GET("/:id", handleGetLead)
				leads.PUT("/:id", handleUpdateLead)
				leads.DELETE("/:id", handleDeleteLead)
			}

			// Deals
			deals := crm.Group("/deals")
			{
				deals.GET("", handleGetDeals)
				deals.POST("", handleCreateDeal)
				deals.GET("/:id", handleGetDeal)
				deals.PUT("/:id", handleUpdateDeal)
				deals.DELETE("/:id", handleDeleteDeal)
			}

			// Dashboard
			dashboard := crm.Group("/dashboard")
			{
				dashboard.GET("/stats", handleGetDashboardStats)
				dashboard.GET("/recent-activity", handleGetRecentActivity)
			}
		}

		// Lookup data
		lookups := api.Group("/lookups")
		{
			lookups.GET("/lead-statuses", handleGetLeadStatuses)
			lookups.GET("/deal-stages", handleGetDealStages)
			lookups.GET("/industries", handleGetIndustries)
			lookups.GET("/company-sizes", handleGetCompanySizes)
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

// Auth handlers
func handleLogin(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"token":   "mock-jwt-token-" + strconv.FormatInt(time.Now().Unix(), 10),
		"user": User{
			ID:      1,
			Email:   "admin@saleshub.com",
			Name:    "Admin User",
			Role:    "admin",
			Created: time.Now().Format(time.RFC3339),
		},
	})
}

func handleRegister(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Registration successful",
		"user": User{
			ID:      2,
			Email:   "newuser@saleshub.com",
			Name:    "New User",
			Role:    "user",
			Created: time.Now().Format(time.RFC3339),
		},
	})
}

func handleGetProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Profile retrieved successfully",
		"user": User{
			ID:      1,
			Email:   "admin@saleshub.com",
			Name:    "Admin User",
			Role:    "admin",
			Created: "2025-01-01T00:00:00Z",
		},
	})
}

func handleLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}

func handleRefreshToken(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Token refreshed",
		"token":   "mock-jwt-token-refreshed-" + strconv.FormatInt(time.Now().Unix(), 10),
	})
}

// Company handlers
func handleGetCompanies(c *gin.Context) {
	companies := []Company{
		{ID: 1, Name: "Acme Corp", Industry: "Technology", Size: "500-1000", Website: "https://acme.com", Created: "2025-01-01T00:00:00Z"},
		{ID: 2, Name: "TechStart", Industry: "Software", Size: "50-100", Website: "https://techstart.com", Created: "2025-01-02T00:00:00Z"},
		{ID: 3, Name: "Global Solutions", Industry: "Consulting", Size: "1000+", Website: "https://globalsolutions.com", Created: "2025-01-03T00:00:00Z"},
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Companies retrieved successfully",
		"companies": companies,
		"total":     len(companies),
	})
}

func handleCreateCompany(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Company created successfully",
		"company": Company{
			ID:       4,
			Name:     "New Company",
			Industry: "Manufacturing",
			Size:     "100-500",
			Website:  "https://newcompany.com",
			Created:  time.Now().Format(time.RFC3339),
		},
	})
}

func handleGetCompany(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Company retrieved successfully",
		"company": Company{
			ID:       1,
			Name:     "Acme Corp",
			Industry: "Technology",
			Size:     "500-1000",
			Website:  "https://acme.com",
			Created:  "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleUpdateCompany(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Company updated successfully",
		"company": Company{
			ID:       1,
			Name:     "Acme Corp Updated",
			Industry: "Technology",
			Size:     "500-1000",
			Website:  "https://acme-updated.com",
			Created:  "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleDeleteCompany(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Company deleted successfully",
		"id":      id,
	})
}

func handleGetCompanyContacts(c *gin.Context) {
	companyID := c.Param("id")
	contacts := []Contact{
		{ID: 1, Name: "John Doe", Email: "john@acme.com", Phone: "+1-555-0123", CompanyID: 1, Title: "CEO", Created: "2025-01-01T00:00:00Z"},
		{ID: 2, Name: "Jane Smith", Email: "jane@acme.com", Phone: "+1-555-0124", CompanyID: 1, Title: "CTO", Created: "2025-01-02T00:00:00Z"},
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Company contacts retrieved successfully",
		"contacts":  contacts,
		"companyId": companyID,
	})
}

// Contact handlers
func handleGetContacts(c *gin.Context) {
	contacts := []Contact{
		{ID: 1, Name: "John Doe", Email: "john@acme.com", Phone: "+1-555-0123", CompanyID: 1, Title: "CEO", Created: "2025-01-01T00:00:00Z"},
		{ID: 2, Name: "Jane Smith", Email: "jane@acme.com", Phone: "+1-555-0124", CompanyID: 1, Title: "CTO", Created: "2025-01-02T00:00:00Z"},
		{ID: 3, Name: "Bob Johnson", Email: "bob@techstart.com", Phone: "+1-555-0125", CompanyID: 2, Title: "Founder", Created: "2025-01-03T00:00:00Z"},
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Contacts retrieved successfully",
		"contacts": contacts,
		"total":    len(contacts),
	})
}

func handleCreateContact(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Contact created successfully",
		"contact": Contact{
			ID:        4,
			Name:      "New Contact",
			Email:     "new@company.com",
			Phone:     "+1-555-0126",
			CompanyID: 1,
			Title:     "Manager",
			Created:   time.Now().Format(time.RFC3339),
		},
	})
}

func handleGetContact(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Contact retrieved successfully",
		"contact": Contact{
			ID:        1,
			Name:      "John Doe",
			Email:     "john@acme.com",
			Phone:     "+1-555-0123",
			CompanyID: 1,
			Title:     "CEO",
			Created:   "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleUpdateContact(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Contact updated successfully",
		"contact": Contact{
			ID:        1,
			Name:      "John Doe Updated",
			Email:     "john.updated@acme.com",
			Phone:     "+1-555-0123",
			CompanyID: 1,
			Title:     "CEO",
			Created:   "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleDeleteContact(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Contact deleted successfully",
		"id":      id,
	})
}

// Lead handlers
func handleGetLeads(c *gin.Context) {
	leads := []Lead{
		{ID: 1, Name: "Lead 1", Email: "lead1@example.com", Company: "Startup Inc", Status: "New", Source: "Website", Created: "2025-01-01T00:00:00Z"},
		{ID: 2, Name: "Lead 2", Email: "lead2@example.com", Company: "Enterprise Corp", Status: "Qualified", Source: "Referral", Created: "2025-01-02T00:00:00Z"},
		{ID: 3, Name: "Lead 3", Email: "lead3@example.com", Company: "Small Business", Status: "Contacted", Source: "Social Media", Created: "2025-01-03T00:00:00Z"},
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Leads retrieved successfully",
		"leads":   leads,
		"total":   len(leads),
	})
}

func handleCreateLead(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Lead created successfully",
		"lead": Lead{
			ID:      4,
			Name:    "New Lead",
			Email:   "newlead@example.com",
			Company: "New Company",
			Status:  "New",
			Source:  "Website",
			Created: time.Now().Format(time.RFC3339),
		},
	})
}

func handleGetLead(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Lead retrieved successfully",
		"lead": Lead{
			ID:      1,
			Name:    "Lead 1",
			Email:   "lead1@example.com",
			Company: "Startup Inc",
			Status:  "New",
			Source:  "Website",
			Created: "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleUpdateLead(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Lead updated successfully",
		"lead": Lead{
			ID:      1,
			Name:    "Lead 1 Updated",
			Email:   "lead1.updated@example.com",
			Company: "Startup Inc",
			Status:  "Qualified",
			Source:  "Website",
			Created: "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleDeleteLead(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Lead deleted successfully",
		"id":      id,
	})
}

// Deal handlers
func handleGetDeals(c *gin.Context) {
	deals := []Deal{
		{ID: 1, Title: "Enterprise Software License", Value: 50000.00, Stage: "Proposal", CompanyID: 1, ContactID: 1, Probability: 75, Created: "2025-01-01T00:00:00Z"},
		{ID: 2, Title: "Consulting Services", Value: 25000.00, Stage: "Negotiation", CompanyID: 2, ContactID: 3, Probability: 90, Created: "2025-01-02T00:00:00Z"},
		{ID: 3, Title: "Training Package", Value: 15000.00, Stage: "Closed Won", CompanyID: 3, ContactID: 2, Probability: 100, Created: "2025-01-03T00:00:00Z"},
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Deals retrieved successfully",
		"deals":      deals,
		"total":      len(deals),
		"totalValue": 90000.00,
	})
}

func handleCreateDeal(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Deal created successfully",
		"deal": Deal{
			ID:          4,
			Title:       "New Deal",
			Value:       30000.00,
			Stage:       "Qualification",
			CompanyID:   1,
			ContactID:   1,
			Probability: 50,
			Created:     time.Now().Format(time.RFC3339),
		},
	})
}

func handleGetDeal(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Deal retrieved successfully",
		"deal": Deal{
			ID:          1,
			Title:       "Enterprise Software License",
			Value:       50000.00,
			Stage:       "Proposal",
			CompanyID:   1,
			ContactID:   1,
			Probability: 75,
			Created:     "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleUpdateDeal(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Deal updated successfully",
		"deal": Deal{
			ID:          1,
			Title:       "Enterprise Software License Updated",
			Value:       55000.00,
			Stage:       "Negotiation",
			CompanyID:   1,
			ContactID:   1,
			Probability: 85,
			Created:     "2025-01-01T00:00:00Z",
		},
		"id": id,
	})
}

func handleDeleteDeal(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "Deal deleted successfully",
		"id":      id,
	})
}

// Dashboard handlers
func handleGetDashboardStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Dashboard stats retrieved successfully",
		"stats": gin.H{
			"totalLeads":     25,
			"totalContacts":  150,
			"totalCompanies": 45,
			"totalDeals":     12,
			"dealsValue":     450000.00,
			"conversionRate": 15.5,
			"monthlyGrowth":  8.2,
		},
	})
}

func handleGetRecentActivity(c *gin.Context) {
	activities := []gin.H{
		{"id": 1, "type": "lead", "action": "created", "description": "New lead added: John Smith", "timestamp": "2025-01-15T10:30:00Z"},
		{"id": 2, "type": "deal", "action": "updated", "description": "Deal stage changed to Proposal", "timestamp": "2025-01-15T09:15:00Z"},
		{"id": 3, "type": "contact", "action": "created", "description": "New contact added: Jane Doe", "timestamp": "2025-01-15T08:45:00Z"},
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Recent activity retrieved successfully",
		"activities": activities,
	})
}

// Lookup handlers
func handleGetLeadStatuses(c *gin.Context) {
	statuses := []string{"New", "Qualified", "Contacted", "Proposal", "Negotiation", "Closed Won", "Closed Lost"}
	c.JSON(http.StatusOK, gin.H{
		"message":  "Lead statuses retrieved successfully",
		"statuses": statuses,
	})
}

func handleGetDealStages(c *gin.Context) {
	stages := []string{"Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"}
	c.JSON(http.StatusOK, gin.H{
		"message": "Deal stages retrieved successfully",
		"stages":  stages,
	})
}

func handleGetIndustries(c *gin.Context) {
	industries := []string{"Technology", "Healthcare", "Finance", "Manufacturing", "Retail", "Consulting", "Education", "Real Estate"}
	c.JSON(http.StatusOK, gin.H{
		"message":    "Industries retrieved successfully",
		"industries": industries,
	})
}

func handleGetCompanySizes(c *gin.Context) {
	sizes := []string{"1-10", "11-50", "51-100", "101-500", "501-1000", "1000+"}
	c.JSON(http.StatusOK, gin.H{
		"message": "Company sizes retrieved successfully",
		"sizes":   sizes,
	})
}
