package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"saleshub-backend/models"
)

var DB *gorm.DB

// DatabaseLogger implements GORM's logger interface for comprehensive logging
type DatabaseLogger struct {
	SlowThreshold         time.Duration
	SourceField           string
	SkipErrRecordNotFound bool
}

// LogMode returns the logger mode
func (l *DatabaseLogger) LogMode(logger.LogLevel) logger.Interface {
	return l
}

// Info logs info level messages
func (l *DatabaseLogger) Info(ctx context.Context, msg string, data ...interface{}) {
	log.Printf("[DB-INFO] %s %v", msg, data)
}

// Warn logs warning level messages
func (l *DatabaseLogger) Warn(ctx context.Context, msg string, data ...interface{}) {
	log.Printf("[DB-WARN] %s %v", msg, data)
}

// Error logs error level messages
func (l *DatabaseLogger) Error(ctx context.Context, msg string, data ...interface{}) {
	log.Printf("[DB-ERROR] %s %v", msg, data)
}

// Trace logs SQL queries with timing information
func (l *DatabaseLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	elapsed := time.Since(begin)
	sql, rows := fc()

	// Log all queries with timing
	logEntry := fmt.Sprintf("[DB-QUERY] %s | Duration: %v | Rows: %d", sql, elapsed, rows)

	if err != nil {
		log.Printf("%s | Error: %v", logEntry, err)
	} else if elapsed > l.SlowThreshold && l.SlowThreshold != 0 {
		log.Printf("%s | SLOW QUERY", logEntry)
	} else {
		log.Printf(logEntry)
	}
}

// DatabaseMetrics tracks database performance metrics
type DatabaseMetrics struct {
	TotalQueries  int64
	SlowQueries   int64
	FailedQueries int64
	TotalDuration time.Duration
	LastQueryTime time.Time
}

var metrics = &DatabaseMetrics{}

// GetDatabaseMetrics returns current database metrics
func GetDatabaseMetrics() *DatabaseMetrics {
	return metrics
}

// LogDatabaseOperation logs database operations with context
func LogDatabaseOperation(operation, table, tenantID string, duration time.Duration, err error) {
	metrics.TotalQueries++
	metrics.TotalDuration += duration
	metrics.LastQueryTime = time.Now()

	if err != nil {
		metrics.FailedQueries++
		log.Printf("[DB-OP] %s | Table: %s | Tenant: %s | Duration: %v | Error: %v",
			operation, table, tenantID, duration, err)
	} else {
		log.Printf("[DB-OP] %s | Table: %s | Tenant: %s | Duration: %v | Success",
			operation, table, tenantID, duration)
	}
}

// InitDatabase initializes the database connection with comprehensive logging
func InitDatabase() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://postgres:Miyako2020@localhost:5432/sales_crm?sslmode=disable"
	}

	// Initialize enhanced GORM logging
	gormConfig := DefaultGormLoggingConfig()
	InitializeGormLogging(gormConfig)

	// Create custom logger with slow query threshold
	dbLogger := &DatabaseLogger{
		SlowThreshold:         200 * time.Millisecond, // Log queries slower than 200ms
		SourceField:           "source",
		SkipErrRecordNotFound: false,
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: dbLogger,
	})
	if err != nil {
		log.Fatal("[DB-ERROR] Failed to connect to database:", err)
	}

	// Get underlying SQL DB for connection pool stats
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("[DB-ERROR] Failed to get underlying SQL DB:", err)
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Printf("[DB-INFO] Database connected successfully | DSN: %s", dsn)
	log.Printf("[DB-INFO] Connection pool configured | MaxIdle: 10, MaxOpen: 100, MaxLifetime: 1h")

	// Log connection pool stats
	go logConnectionPoolStats(sqlDB)

	// Log initial metrics
	LogGormMetrics()
}

// logConnectionPoolStats periodically logs connection pool statistics
func logConnectionPoolStats(sqlDB interface{}) {
	ticker := time.NewTicker(5 * time.Minute) // Log every 5 minutes
	defer ticker.Stop()

	for range ticker.C {
		if db, ok := sqlDB.(interface {
			Stats() struct {
				MaxOpenConnections int
				OpenConnections    int
				InUse              int
				Idle               int
			}
		}); ok {
			stats := db.Stats()
			log.Printf("[DB-STATS] Pool Stats | MaxOpen: %d, Open: %d, InUse: %d, Idle: %d",
				stats.MaxOpenConnections, stats.OpenConnections, stats.InUse, stats.Idle)
		}
	}
}

// AutoMigrate runs database migrations
func AutoMigrate() {
	log.Println("Running database migrations...")

	// Core models
	err := DB.AutoMigrate(
		&models.Tenant{},
		&models.UserRole{},
	)

	if err != nil {
		log.Fatal("Failed to migrate core models:", err)
	}

	// Create User table separately to avoid relationship issues
	err = DB.AutoMigrate(&models.User{})
	if err != nil {
		log.Printf("Warning: User migration failed: %v", err)
	}

	// Lookup tables
	err = DB.AutoMigrate(
		&models.LeadStatus{},
		&models.LeadTemperature{},
		&models.Industry{},
		&models.CompanySize{},
		&models.MarketingSourceType{},
		&models.MarketingAssetType{},
		&models.CommunicationType{},
		&models.TaskType{},
		&models.TerritoryType{},
	)

	if err != nil {
		log.Fatal("Failed to migrate lookup tables:", err)
	}

	// Contact information types
	err = DB.AutoMigrate(
		&models.PhoneNumberType{},
		&models.EmailAddressType{},
		&models.AddressType{},
		&models.SocialMediaType{},
	)

	if err != nil {
		log.Fatal("Failed to migrate contact info types:", err)
	}

	// Core CRM models (excluding Contact for now due to foreign key issues)
	err = DB.AutoMigrate(
		&models.Company{},
		&models.Lead{},
		&models.Pipeline{},
		&models.Stage{},
		&models.Deal{},
		&models.DealStageHistory{},
	)

	if err != nil {
		log.Fatal("Failed to migrate CRM models:", err)
	}

	// Migrate Contact separately to handle foreign key issues
	err = DB.AutoMigrate(&models.Contact{})
	if err != nil {
		log.Printf("Warning: Contact migration failed: %v", err)
	}

	// Marketing models
	err = DB.AutoMigrate(
		&models.MarketingSource{},
		&models.MarketingAsset{},
	)

	if err != nil {
		log.Fatal("Failed to migrate marketing models:", err)
	}

	// Communication and task models
	err = DB.AutoMigrate(
		&models.Communication{},
		&models.CommunicationAttachment{},
		&models.Task{},
		&models.Territory{},
	)

	if err != nil {
		log.Fatal("Failed to migrate communication and task models:", err)
	}

	// Contact information models
	err = DB.AutoMigrate(
		&models.PhoneNumber{},
		&models.EmailAddress{},
		&models.Address{},
		&models.SocialMediaAccount{},
	)

	if err != nil {
		log.Fatal("Failed to migrate contact info models:", err)
	}

	// Extensibility models
	err = DB.AutoMigrate(
		&models.CustomField{},
		&models.CustomFieldValue{},
		&models.CustomObject{},
		&models.ActivityLog{},
	)

	if err != nil {
		log.Fatal("Failed to migrate extensibility models:", err)
	}

	log.Println("Database migrations completed successfully")
}

// SeedDatabase seeds the database with initial data
func SeedDatabase() {
	log.Println("Seeding database with initial data...")

	// Create default tenant
	var tenant models.Tenant
	if err := DB.Where("subdomain = ?", "default").First(&tenant).Error; err != nil {
		tenant = models.Tenant{
			Name:      "Default Organization",
			Subdomain: "default",
			IsActive:  true,
		}
		DB.Create(&tenant)
		log.Println("Created default tenant")
	}

	// Create default user roles
	adminDesc := "Full system access"
	salesManagerDesc := "Sales management access"
	salesRepDesc := "Sales representative access"

	roles := []models.UserRole{
		{
			Name:        "Administrator",
			Code:        "ADMIN",
			Description: &adminDesc,
			IsActive:    true,
			IsSystem:    true,
			TenantID:    tenant.ID,
		},
		{
			Name:        "Sales Manager",
			Code:        "SALES_MANAGER",
			Description: &salesManagerDesc,
			IsActive:    true,
			IsSystem:    true,
			TenantID:    tenant.ID,
		},
		{
			Name:        "Sales Representative",
			Code:        "SALES_REP",
			Description: &salesRepDesc,
			IsActive:    true,
			IsSystem:    true,
			TenantID:    tenant.ID,
		},
	}

	for _, role := range roles {
		var existingRole models.UserRole
		if err := DB.Where("code = ? AND tenant_id = ?", role.Code, tenant.ID).First(&existingRole).Error; err != nil {
			DB.Create(&role)
			log.Printf("Created role: %s", role.Name)
		}
	}

	// Create default lead statuses
	colorNew := "#3B82F6"
	colorContacted := "#F59E0B"
	colorQualified := "#10B981"
	colorUnqualified := "#EF4444"

	leadStatuses := []models.LeadStatus{
		{Name: "New", Code: "NEW", Color: &colorNew, Order: 1, IsActive: true, IsSystem: true, TenantID: tenant.ID},
		{Name: "Contacted", Code: "CONTACTED", Color: &colorContacted, Order: 2, IsActive: true, IsSystem: true, TenantID: tenant.ID},
		{Name: "Qualified", Code: "QUALIFIED", Color: &colorQualified, Order: 3, IsActive: true, IsSystem: true, TenantID: tenant.ID},
		{Name: "Unqualified", Code: "UNQUALIFIED", Color: &colorUnqualified, Order: 4, IsActive: true, IsSystem: true, TenantID: tenant.ID},
	}

	for _, status := range leadStatuses {
		var existingStatus models.LeadStatus
		if err := DB.Where("code = ? AND tenant_id = ?", status.Code, tenant.ID).First(&existingStatus).Error; err != nil {
			DB.Create(&status)
			log.Printf("Created lead status: %s", status.Name)
		}
	}

	// Create default lead temperatures
	colorHot := "#EF4444"
	colorWarm := "#F59E0B"
	colorCold := "#3B82F6"

	leadTemperatures := []models.LeadTemperature{
		{Name: "Hot", Code: "HOT", Color: &colorHot, Order: 1, IsActive: true, TenantID: tenant.ID},
		{Name: "Warm", Code: "WARM", Color: &colorWarm, Order: 2, IsActive: true, TenantID: tenant.ID},
		{Name: "Cold", Code: "COLD", Color: &colorCold, Order: 3, IsActive: true, TenantID: tenant.ID},
	}

	for _, temp := range leadTemperatures {
		var existingTemp models.LeadTemperature
		if err := DB.Where("code = ? AND tenant_id = ?", temp.Code, tenant.ID).First(&existingTemp).Error; err != nil {
			DB.Create(&temp)
			log.Printf("Created lead temperature: %s", temp.Name)
		}
	}

	// Create default industries
	industries := []models.Industry{
		{Name: "Technology", Code: "TECH", IsActive: true, TenantID: tenant.ID},
		{Name: "Healthcare", Code: "HEALTHCARE", IsActive: true, TenantID: tenant.ID},
		{Name: "Finance", Code: "FINANCE", IsActive: true, TenantID: tenant.ID},
		{Name: "Manufacturing", Code: "MANUFACTURING", IsActive: true, TenantID: tenant.ID},
		{Name: "Retail", Code: "RETAIL", IsActive: true, TenantID: tenant.ID},
	}

	for _, industry := range industries {
		var existingIndustry models.Industry
		if err := DB.Where("code = ? AND tenant_id = ?", industry.Code, tenant.ID).First(&existingIndustry).Error; err != nil {
			DB.Create(&industry)
			log.Printf("Created industry: %s", industry.Name)
		}
	}

	// Create default company sizes
	min1, max10 := 1, 10
	min11, max50 := 11, 50
	min51, max200 := 51, 200
	min201 := 201

	companySizes := []models.CompanySize{
		{Name: "1-10 employees", Code: "SMALL", MinEmployees: &min1, MaxEmployees: &max10, IsActive: true, TenantID: tenant.ID},
		{Name: "11-50 employees", Code: "MEDIUM", MinEmployees: &min11, MaxEmployees: &max50, IsActive: true, TenantID: tenant.ID},
		{Name: "51-200 employees", Code: "LARGE", MinEmployees: &min51, MaxEmployees: &max200, IsActive: true, TenantID: tenant.ID},
		{Name: "201+ employees", Code: "ENTERPRISE", MinEmployees: &min201, IsActive: true, TenantID: tenant.ID},
	}

	for _, size := range companySizes {
		var existingSize models.CompanySize
		if err := DB.Where("code = ? AND tenant_id = ?", size.Code, tenant.ID).First(&existingSize).Error; err != nil {
			DB.Create(&size)
			log.Printf("Created company size: %s", size.Name)
		}
	}

	// Create default contact information types
	phoneTypes := []models.PhoneNumberType{
		{Name: "Mobile", Code: "MOBILE", Description: stringPtr("Mobile phone number"), IsActive: true, TenantID: tenant.ID},
		{Name: "Work", Code: "WORK", Description: stringPtr("Work phone number"), IsActive: true, TenantID: tenant.ID},
		{Name: "Home", Code: "HOME", Description: stringPtr("Home phone number"), IsActive: true, TenantID: tenant.ID},
		{Name: "Fax", Code: "FAX", Description: stringPtr("Fax number"), IsActive: true, TenantID: tenant.ID},
	}

	for _, phoneType := range phoneTypes {
		var existingType models.PhoneNumberType
		if err := DB.Where("code = ? AND tenant_id = ?", phoneType.Code, tenant.ID).First(&existingType).Error; err != nil {
			DB.Create(&phoneType)
			log.Printf("Created phone type: %s", phoneType.Name)
		}
	}

	emailTypes := []models.EmailAddressType{
		{Name: "Personal", Code: "PERSONAL", Description: stringPtr("Personal email address"), IsActive: true, TenantID: tenant.ID},
		{Name: "Work", Code: "WORK", Description: stringPtr("Work email address"), IsActive: true, TenantID: tenant.ID},
		{Name: "Other", Code: "OTHER", Description: stringPtr("Other email address"), IsActive: true, TenantID: tenant.ID},
	}

	for _, emailType := range emailTypes {
		var existingType models.EmailAddressType
		if err := DB.Where("code = ? AND tenant_id = ?", emailType.Code, tenant.ID).First(&existingType).Error; err != nil {
			DB.Create(&emailType)
			log.Printf("Created email type: %s", emailType.Name)
		}
	}

	addressTypes := []models.AddressType{
		{Name: "Home", Code: "HOME", Description: stringPtr("Home address"), IsActive: true, TenantID: tenant.ID},
		{Name: "Work", Code: "WORK", Description: stringPtr("Work address"), IsActive: true, TenantID: tenant.ID},
		{Name: "Billing", Code: "BILLING", Description: stringPtr("Billing address"), IsActive: true, TenantID: tenant.ID},
		{Name: "Shipping", Code: "SHIPPING", Description: stringPtr("Shipping address"), IsActive: true, TenantID: tenant.ID},
	}

	for _, addressType := range addressTypes {
		var existingType models.AddressType
		if err := DB.Where("code = ? AND tenant_id = ?", addressType.Code, tenant.ID).First(&existingType).Error; err != nil {
			DB.Create(&addressType)
			log.Printf("Created address type: %s", addressType.Name)
		}
	}

	socialMediaTypes := []models.SocialMediaType{
		{Name: "LinkedIn", Code: "LINKEDIN", Icon: stringPtr("linkedin"), BaseURL: stringPtr("https://linkedin.com/in/"), IsActive: true, TenantID: tenant.ID},
		{Name: "Twitter", Code: "TWITTER", Icon: stringPtr("twitter"), BaseURL: stringPtr("https://twitter.com/"), IsActive: true, TenantID: tenant.ID},
		{Name: "Facebook", Code: "FACEBOOK", Icon: stringPtr("facebook"), BaseURL: stringPtr("https://facebook.com/"), IsActive: true, TenantID: tenant.ID},
		{Name: "Instagram", Code: "INSTAGRAM", Icon: stringPtr("instagram"), BaseURL: stringPtr("https://instagram.com/"), IsActive: true, TenantID: tenant.ID},
	}

	for _, socialType := range socialMediaTypes {
		var existingType models.SocialMediaType
		if err := DB.Where("code = ? AND tenant_id = ?", socialType.Code, tenant.ID).First(&existingType).Error; err != nil {
			DB.Create(&socialType)
			log.Printf("Created social media type: %s", socialType.Name)
		}
	}

	// Create default pipeline
	var pipeline models.Pipeline
	if err := DB.Where("name = ? AND tenant_id = ?", "Default Sales Pipeline", tenant.ID).First(&pipeline).Error; err != nil {
		pipeline = models.Pipeline{
			Name:     "Default Sales Pipeline",
			IsActive: true,
			TenantID: tenant.ID,
		}
		DB.Create(&pipeline)
		log.Println("Created default sales pipeline")

		// Create default stages
		colorProspecting := "#3B82F6"
		colorQualification := "#F59E0B"
		colorProposal := "#8B5CF6"
		colorNegotiation := "#EC4899"
		colorClosedWon := "#10B981"
		colorClosedLost := "#EF4444"

		stages := []models.Stage{
			{Name: "Prospecting", Order: 1, Probability: 10, IsClosedWon: false, IsClosedLost: false, Color: &colorProspecting, PipelineID: pipeline.ID, TenantID: tenant.ID},
			{Name: "Qualification", Order: 2, Probability: 25, IsClosedWon: false, IsClosedLost: false, Color: &colorQualification, PipelineID: pipeline.ID, TenantID: tenant.ID},
			{Name: "Proposal", Order: 3, Probability: 50, IsClosedWon: false, IsClosedLost: false, Color: &colorProposal, PipelineID: pipeline.ID, TenantID: tenant.ID},
			{Name: "Negotiation", Order: 4, Probability: 75, IsClosedWon: false, IsClosedLost: false, Color: &colorNegotiation, PipelineID: pipeline.ID, TenantID: tenant.ID},
			{Name: "Closed Won", Order: 5, Probability: 100, IsClosedWon: true, IsClosedLost: false, Color: &colorClosedWon, PipelineID: pipeline.ID, TenantID: tenant.ID},
			{Name: "Closed Lost", Order: 6, Probability: 0, IsClosedWon: false, IsClosedLost: true, Color: &colorClosedLost, PipelineID: pipeline.ID, TenantID: tenant.ID},
		}

		for _, stage := range stages {
			DB.Create(&stage)
			log.Printf("Created stage: %s", stage.Name)
		}
	}

	log.Println("Database seeding completed successfully")
}

// Helper function for string pointers
func stringPtr(s string) *string {
	return &s
}
