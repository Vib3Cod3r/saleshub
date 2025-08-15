package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the CRM system
type User struct {
	ID        string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email     string  `json:"email" gorm:"uniqueIndex;not null"`
	FirstName string  `json:"firstName" gorm:"not null"`
	LastName  string  `json:"lastName" gorm:"not null"`
	Password  string  `json:"-" gorm:"not null"` // Hidden from JSON
	Avatar    *string `json:"avatar"`
	IsActive  bool    `json:"isActive" gorm:"default:true"`

	// Role relationship
	RoleID string    `json:"roleId" gorm:"type:uuid"`
	Role   *UserRole `json:"role" gorm:"foreignKey:RoleID;references:ID"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	AssignedLeads  []Lead          `json:"assignedLeads" gorm:"foreignKey:AssignedUserID"`
	AssignedDeals  []Deal          `json:"assignedDeals" gorm:"foreignKey:AssignedUserID"`
	AssignedTasks  []Task          `json:"assignedTasks" gorm:"foreignKey:AssignedUserID"`
	CreatedTasks   []Task          `json:"createdTasks" gorm:"foreignKey:CreatedBy"`
	Communications []Communication `json:"communications" gorm:"foreignKey:UserID"`
	ActivityLogs   []ActivityLog   `json:"activityLogs" gorm:"foreignKey:UserID"`
	Territories    []Territory     `json:"territories" gorm:"many2many:user_territories;"`

	// Contact information
	PhoneNumbers        []PhoneNumber        `json:"phoneNumbers" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	EmailAddresses      []EmailAddress       `json:"emailAddresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	Addresses           []Address            `json:"addresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for User
func (User) TableName() string {
	return "users"
}

// UserRole represents user roles in the system
type UserRole struct {
	ID          string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string  `json:"name" gorm:"not null"`
	Code        string  `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string `json:"description"`
	IsActive    bool    `json:"isActive" gorm:"default:true"`
	IsSystem    bool    `json:"isSystem" gorm:"default:false"` // System roles can't be deleted

	// Permissions - stored as JSON for flexibility
	Permissions *string `json:"permissions" gorm:"type:jsonb"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Users []User `json:"users" gorm:"foreignKey:RoleID"`
}

// TableName specifies the table name for UserRole
func (UserRole) TableName() string {
	return "user_roles"
}

// Tenant represents a multi-tenant organization
type Tenant struct {
	ID        string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name      string `json:"name" gorm:"not null"`
	Subdomain string `json:"subdomain" gorm:"uniqueIndex;not null"`
	IsActive  bool   `json:"isActive" gorm:"default:true"`

	// Settings
	Settings *string `json:"settings" gorm:"type:jsonb"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Users            []User            `json:"users" gorm:"foreignKey:TenantID"`
	Companies        []Company         `json:"companies" gorm:"foreignKey:TenantID"`
	Contacts         []Contact         `json:"contacts" gorm:"foreignKey:TenantID"`
	Leads            []Lead            `json:"leads" gorm:"foreignKey:TenantID"`
	Deals            []Deal            `json:"deals" gorm:"foreignKey:TenantID"`
	CustomFields     []CustomField     `json:"customFields" gorm:"foreignKey:TenantID"`
	CustomObjects    []CustomObject    `json:"customObjects" gorm:"foreignKey:TenantID"`
	Pipelines        []Pipeline        `json:"pipelines" gorm:"foreignKey:TenantID"`
	Stages           []Stage           `json:"stages" gorm:"foreignKey:TenantID"`
	Territories      []Territory       `json:"territories" gorm:"foreignKey:TenantID"`
	MarketingSources []MarketingSource `json:"marketingSources" gorm:"foreignKey:TenantID"`
	MarketingAssets  []MarketingAsset  `json:"marketingAssets" gorm:"foreignKey:TenantID"`

	// Extensible lookup tables
	UserRoles            []UserRole            `json:"userRoles" gorm:"foreignKey:TenantID"`
	LeadStatuses         []LeadStatus          `json:"leadStatuses" gorm:"foreignKey:TenantID"`
	MarketingSourceTypes []MarketingSourceType `json:"marketingSourceTypes" gorm:"foreignKey:TenantID"`
	MarketingAssetTypes  []MarketingAssetType  `json:"marketingAssetTypes" gorm:"foreignKey:TenantID"`
	CommunicationTypes   []CommunicationType   `json:"communicationTypes" gorm:"foreignKey:TenantID"`
	TaskTypes            []TaskType            `json:"taskTypes" gorm:"foreignKey:TenantID"`
	TerritoryTypes       []TerritoryType       `json:"territoryTypes" gorm:"foreignKey:TenantID"`
	Industries           []Industry            `json:"industries" gorm:"foreignKey:TenantID"`
	CompanySizes         []CompanySize         `json:"companySizes" gorm:"foreignKey:TenantID"`
	LeadTemperatures     []LeadTemperature     `json:"leadTemperatures" gorm:"foreignKey:TenantID"`

	// Contact information lookup tables
	PhoneNumberTypes  []PhoneNumberType  `json:"phoneNumberTypes" gorm:"foreignKey:TenantID"`
	EmailAddressTypes []EmailAddressType `json:"emailAddressTypes" gorm:"foreignKey:TenantID"`
	AddressTypes      []AddressType      `json:"addressTypes" gorm:"foreignKey:TenantID"`
	SocialMediaTypes  []SocialMediaType  `json:"socialMediaTypes" gorm:"foreignKey:TenantID"`

	// Contact information entities
	PhoneNumbers        []PhoneNumber        `json:"phoneNumbers" gorm:"foreignKey:TenantID"`
	EmailAddresses      []EmailAddress       `json:"emailAddresses" gorm:"foreignKey:TenantID"`
	Addresses           []Address            `json:"addresses" gorm:"foreignKey:TenantID"`
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:TenantID"`
}

// TableName specifies the table name for Tenant
func (Tenant) TableName() string {
	return "tenants"
}
