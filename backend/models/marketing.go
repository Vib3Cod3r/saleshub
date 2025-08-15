package models

import (
	"time"

	"gorm.io/gorm"
)

// MarketingSource represents a marketing source
type MarketingSource struct {
	ID   string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name string `json:"name" gorm:"not null"`

	// Type relationship
	TypeID string               `json:"typeId" gorm:"type:uuid"`
	Type   *MarketingSourceType `json:"type" gorm:"foreignKey:TypeID;references:ID"`

	Medium   *string `json:"medium"` // email, social, paid, organic, etc.
	Campaign *string `json:"campaign"`
	Source   *string `json:"source"` // google, facebook, linkedin, etc.
	Content  *string `json:"content"`
	Term     *string `json:"term"` // for paid search

	// UTM tracking
	UTMSource   *string `json:"utmSource"`
	UTMMedium   *string `json:"utmMedium"`
	UTMCampaign *string `json:"utmCampaign"`
	UTMContent  *string `json:"utmContent"`
	UTMTerm     *string `json:"utmTerm"`

	// Performance tracking
	Cost        *float64 `json:"cost" gorm:"type:decimal(15,2)"`
	Impressions *int     `json:"impressions"`
	Clicks      *int     `json:"clicks"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Leads             []Lead             `json:"leads" gorm:"foreignKey:MarketingSourceID"`
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for MarketingSource
func (MarketingSource) TableName() string {
	return "marketing_sources"
}

// MarketingAsset represents a marketing asset
type MarketingAsset struct {
	ID   string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name string `json:"name" gorm:"not null"`

	// Type relationship
	TypeID string              `json:"typeId" gorm:"type:uuid"`
	Type   *MarketingAssetType `json:"type" gorm:"foreignKey:TypeID;references:ID"`

	URL     *string `json:"url"`
	Content *string `json:"content"` // For email templates, etc.

	// Performance tracking
	Views       int `json:"views" gorm:"default:0"`
	Clicks      int `json:"clicks" gorm:"default:0"`
	Conversions int `json:"conversions" gorm:"default:0"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for MarketingAsset
func (MarketingAsset) TableName() string {
	return "marketing_assets"
}

// Communication represents a communication record
type Communication struct {
	ID string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`

	// Type relationship
	TypeID string             `json:"typeId" gorm:"type:uuid"`
	Type   *CommunicationType `json:"type" gorm:"foreignKey:TypeID;references:ID"`

	Subject   *string                `json:"subject"`
	Content   *string                `json:"content"`
	Direction CommunicationDirection `json:"direction" gorm:"not null"`

	// Timing
	ScheduledAt *time.Time `json:"scheduledAt"`
	SentAt      *time.Time `json:"sentAt"`
	ReceivedAt  *time.Time `json:"receivedAt"`

	// External references
	ExternalID *string `json:"externalId"` // For email providers, phone systems, etc.

	// Relationships
	UserID string `json:"userId" gorm:"type:uuid"`
	User   *User  `json:"user" gorm:"foreignKey:UserID;references:ID"`

	ContactID string   `json:"contactId" gorm:"type:uuid"`
	Contact   *Contact `json:"contact" gorm:"foreignKey:ContactID;references:ID"`

	LeadID string `json:"leadId" gorm:"type:uuid"`
	Lead   *Lead  `json:"lead" gorm:"foreignKey:LeadID;references:ID"`

	DealID string `json:"dealId" gorm:"type:uuid"`
	Deal   *Deal  `json:"deal" gorm:"foreignKey:DealID;references:ID"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Attachments       []CommunicationAttachment `json:"attachments" gorm:"foreignKey:CommunicationID"`
	CustomFieldValues []CustomFieldValue        `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for Communication
func (Communication) TableName() string {
	return "communications"
}

// CommunicationDirection represents the direction of communication
type CommunicationDirection string

const (
	CommunicationDirectionInbound  CommunicationDirection = "INBOUND"
	CommunicationDirectionOutbound CommunicationDirection = "OUTBOUND"
	CommunicationDirectionInternal CommunicationDirection = "INTERNAL"
)

// CommunicationAttachment represents an attachment to a communication
type CommunicationAttachment struct {
	ID           string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Filename     string `json:"filename" gorm:"not null"`
	OriginalName string `json:"originalName" gorm:"not null"`
	MimeType     string `json:"mimeType" gorm:"not null"`
	Size         int    `json:"size" gorm:"not null"`
	URL          string `json:"url" gorm:"not null"`

	CommunicationID string        `json:"communicationId" gorm:"not null"`
	Communication   Communication `json:"communication" gorm:"foreignKey:CommunicationID"`

	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
}

// TableName specifies the table name for CommunicationAttachment
func (CommunicationAttachment) TableName() string {
	return "communication_attachments"
}

// Task represents a task in the CRM
type Task struct {
	ID          string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Title       string  `json:"title" gorm:"not null"`
	Description *string `json:"description"`

	// Type relationship
	TypeID string    `json:"typeId" gorm:"type:uuid"`
	Type   *TaskType `json:"type" gorm:"foreignKey:TypeID;references:ID"`

	Priority TaskPriority `json:"priority" gorm:"default:MEDIUM"`
	Status   TaskStatus   `json:"status" gorm:"default:PENDING"`

	// Timing
	DueDate     *time.Time `json:"dueDate"`
	CompletedAt *time.Time `json:"completedAt"`

	// Assignment
	AssignedUserID string `json:"assignedUserId" gorm:"type:uuid"`
	AssignedUser   *User  `json:"assignedUser" gorm:"foreignKey:AssignedUserID;references:ID"`

	CreatedBy     string `json:"createdBy" gorm:"type:uuid"`
	CreatedByUser *User  `json:"createdByUser" gorm:"foreignKey:CreatedBy;references:ID"`

	// Relationships
	LeadID string `json:"leadId" gorm:"type:uuid"`
	Lead   *Lead  `json:"lead" gorm:"foreignKey:LeadID;references:ID"`

	DealID string `json:"dealId" gorm:"type:uuid"`
	Deal   *Deal  `json:"deal" gorm:"foreignKey:DealID;references:ID"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for Task
func (Task) TableName() string {
	return "tasks"
}

// TaskPriority represents task priority levels
type TaskPriority string

const (
	TaskPriorityLow    TaskPriority = "LOW"
	TaskPriorityMedium TaskPriority = "MEDIUM"
	TaskPriorityHigh   TaskPriority = "HIGH"
	TaskPriorityUrgent TaskPriority = "URGENT"
)

// TaskStatus represents task status
type TaskStatus string

const (
	TaskStatusPending    TaskStatus = "PENDING"
	TaskStatusInProgress TaskStatus = "IN_PROGRESS"
	TaskStatusCompleted  TaskStatus = "COMPLETED"
	TaskStatusCancelled  TaskStatus = "CANCELLED"
	TaskStatusOverdue    TaskStatus = "OVERDUE"
)

// Territory represents a sales territory
type Territory struct {
	ID   string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name string `json:"name" gorm:"not null"`

	// Type relationship
	TypeID string         `json:"typeId" gorm:"type:uuid"`
	Type   *TerritoryType `json:"type" gorm:"foreignKey:TypeID;references:ID"`

	// Geographic boundaries
	Countries   []string `json:"countries" gorm:"type:text[]"`   // Array of country codes
	States      []string `json:"states" gorm:"type:text[]"`      // Array of state codes
	Cities      []string `json:"cities" gorm:"type:text[]"`      // Array of cities
	PostalCodes []string `json:"postalCodes" gorm:"type:text[]"` // Array of postal codes

	// Account-based territories
	Industries  []string `json:"industries" gorm:"type:text[]"`  // Array of industries
	CompanySize []string `json:"companySize" gorm:"type:text[]"` // Array of company sizes

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Users []User `json:"users" gorm:"many2many:user_territories;"`
}

// TableName specifies the table name for Territory
func (Territory) TableName() string {
	return "territories"
}
