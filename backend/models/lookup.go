package models

import (
	"time"

	"gorm.io/gorm"
)

// LeadStatus represents lead statuses in the system
type LeadStatus struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string        `json:"description"`
	Color       *string        `json:"color"` // For UI display
	Order       int            `json:"order" gorm:"not null"`
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	IsSystem    bool           `json:"isSystem" gorm:"default:false"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Leads []Lead `json:"leads" gorm:"foreignKey:StatusID"`
}

// TableName specifies the table name for LeadStatus
func (LeadStatus) TableName() string {
	return "lead_statuses"
}

// LeadTemperature represents lead temperature levels
type LeadTemperature struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string        `json:"description"`
	Color       *string        `json:"color"` // For UI display
	Order       int            `json:"order" gorm:"not null"`
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Leads []Lead `json:"leads" gorm:"foreignKey:TemperatureID"`
}

// TableName specifies the table name for LeadTemperature
func (LeadTemperature) TableName() string {
	return "lead_temperatures"
}

// Industry represents industry classifications
type Industry struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"`
	Description *string        `json:"description"`
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Companies []Company `json:"companies" gorm:"foreignKey:IndustryID"`
}

// TableName specifies the table name for Industry
func (Industry) TableName() string {
	return "industries"
}

// CompanySize represents company size classifications
type CompanySize struct {
	ID           string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string         `json:"name" gorm:"not null"`
	Code         string         `json:"code" gorm:"uniqueIndex;not null"`
	Description  *string        `json:"description"`
	MinEmployees *int           `json:"minEmployees"`
	MaxEmployees *int           `json:"maxEmployees"`
	IsActive     bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Companies []Company `json:"companies" gorm:"foreignKey:SizeID"`
}

// TableName specifies the table name for CompanySize
func (CompanySize) TableName() string {
	return "company_sizes"
}

// MarketingSourceType represents types of marketing sources
type MarketingSourceType struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string        `json:"description"`
	Color       *string        `json:"color"` // For UI display
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	MarketingSources []MarketingSource `json:"marketingSources" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for MarketingSourceType
func (MarketingSourceType) TableName() string {
	return "marketing_source_types"
}

// MarketingAssetType represents types of marketing assets
type MarketingAssetType struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string        `json:"description"`
	Color       *string        `json:"color"` // For UI display
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	MarketingAssets []MarketingAsset `json:"marketingAssets" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for MarketingAssetType
func (MarketingAssetType) TableName() string {
	return "marketing_asset_types"
}

// CommunicationType represents types of communications
type CommunicationType struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string        `json:"description"`
	Icon        *string        `json:"icon"` // For UI display
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Communications []Communication `json:"communications" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for CommunicationType
func (CommunicationType) TableName() string {
	return "communication_types"
}

// TaskType represents types of tasks
type TaskType struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string        `json:"description"`
	Color       *string        `json:"color"` // For UI display
	Icon        *string        `json:"icon"` // For UI display
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Tasks []Task `json:"tasks" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for TaskType
func (TaskType) TableName() string {
	return "task_types"
}

// TerritoryType represents types of territories
type TerritoryType struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Code        string         `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string        `json:"description"`
	IsActive    bool           `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Territories []Territory `json:"territories" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for TerritoryType
func (TerritoryType) TableName() string {
	return "territory_types"
}
