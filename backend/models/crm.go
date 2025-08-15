package models

import (
	"time"

	"gorm.io/gorm"
)

// Company represents an organization in the CRM
type Company struct {
	ID      string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name    string  `json:"name" gorm:"not null"`
	Website *string `json:"website"`
	Domain  *string `json:"domain"`

	// Industry relationship
	IndustryID string    `json:"industryId" gorm:"type:uuid"`
	Industry   *Industry `json:"industry" gorm:"foreignKey:IndustryID;references:ID"`

	// Company size relationship
	SizeID string       `json:"sizeId" gorm:"type:uuid"`
	Size   *CompanySize `json:"size" gorm:"foreignKey:SizeID;references:ID"`

	Revenue *float64 `json:"revenue" gorm:"type:decimal(15,2)"`

	// External IDs
	ExternalID *string `json:"externalId"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Contacts          []Contact          `json:"contacts" gorm:"foreignKey:CompanyID"`
	Deals             []Deal             `json:"deals" gorm:"foreignKey:CompanyID"`
	Leads             []Lead             `json:"leads" gorm:"foreignKey:CompanyID"`
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	ActivityLogs      []ActivityLog      `json:"activityLogs" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`

	// Contact information
	PhoneNumbers        []PhoneNumber        `json:"phoneNumbers" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	EmailAddresses      []EmailAddress       `json:"emailAddresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	Addresses           []Address            `json:"addresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for Company
func (Company) TableName() string {
	return "companies"
}

// Contact represents a person in the CRM
type Contact struct {
	ID         string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FirstName  string  `json:"firstName" gorm:"not null"`
	LastName   string  `json:"lastName" gorm:"not null"`
	Title      *string `json:"title"`
	Department *string `json:"department"`

	// Company relationship
	CompanyID string   `json:"companyId" gorm:"type:uuid"`
	Company   *Company `json:"company" gorm:"foreignKey:CompanyID;references:ID"`

	// Lead source tracking
	OriginalSource *string `json:"originalSource"`

	// Communication preferences
	EmailOptIn bool `json:"emailOptIn" gorm:"default:true"`
	SMSOptIn   bool `json:"smsOptIn" gorm:"default:false"`
	CallOptIn  bool `json:"callOptIn" gorm:"default:true"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Leads             []Lead             `json:"leads" gorm:"foreignKey:ContactID"`
	Deals             []Deal             `json:"deals" gorm:"foreignKey:ContactID"`
	Communications    []Communication    `json:"communications" gorm:"foreignKey:ContactID"`
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	ActivityLogs      []ActivityLog      `json:"activityLogs" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`

	// Contact information
	PhoneNumbers        []PhoneNumber        `json:"phoneNumbers" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	EmailAddresses      []EmailAddress       `json:"emailAddresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	Addresses           []Address            `json:"addresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for Contact
func (Contact) TableName() string {
	return "contacts"
}

// Lead represents a potential customer
type Lead struct {
	ID        string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FirstName *string `json:"firstName"`
	LastName  *string `json:"lastName"`
	Title     *string `json:"title"`

	// Lead status relationship
	StatusID string      `json:"statusId" gorm:"type:uuid"`
	Status   *LeadStatus `json:"status" gorm:"foreignKey:StatusID;references:ID"`

	// Lead temperature relationship
	TemperatureID string           `json:"temperatureId" gorm:"type:uuid"`
	Temperature   *LeadTemperature `json:"temperature" gorm:"foreignKey:TemperatureID;references:ID"`

	Source   *string `json:"source"`
	Campaign *string `json:"campaign"`
	Score    int     `json:"score" gorm:"default:0"`

	// Company relationship
	CompanyID string   `json:"companyId" gorm:"type:uuid"`
	Company   *Company `json:"company" gorm:"foreignKey:CompanyID;references:ID"`

	// Contact relationship (after conversion)
	ContactID string   `json:"contactId" gorm:"type:uuid"`
	Contact   *Contact `json:"contact" gorm:"foreignKey:ContactID;references:ID"`

	// Assignment
	AssignedUserID string `json:"assignedUserId" gorm:"type:uuid"`
	AssignedUser   *User  `json:"assignedUser" gorm:"foreignKey:AssignedUserID;references:ID"`

	// Marketing attribution
	MarketingSourceID string           `json:"marketingSourceId" gorm:"type:uuid"`
	MarketingSource   *MarketingSource `json:"marketingSource" gorm:"foreignKey:MarketingSourceID;references:ID"`

	// Conversion tracking
	ConvertedAt       *time.Time `json:"convertedAt"`
	ConvertedToDealID *string    `json:"convertedToDealId"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Communications    []Communication    `json:"communications" gorm:"foreignKey:LeadID"`
	Tasks             []Task             `json:"tasks" gorm:"foreignKey:LeadID"`
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	ActivityLogs      []ActivityLog      `json:"activityLogs" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`

	// Contact information
	PhoneNumbers        []PhoneNumber        `json:"phoneNumbers" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	EmailAddresses      []EmailAddress       `json:"emailAddresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	Addresses           []Address            `json:"addresses" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
}

// TableName specifies the table name for Lead
func (Lead) TableName() string {
	return "leads"
}

// Deal represents a sales opportunity
type Deal struct {
	ID          string   `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string   `json:"name" gorm:"not null"`
	Amount      *float64 `json:"amount" gorm:"type:decimal(15,2)"`
	Currency    string   `json:"currency" gorm:"default:USD"`
	Probability int      `json:"probability" gorm:"default:0"` // 0-100

	// Pipeline and stage
	PipelineID string   `json:"pipelineId" gorm:"not null"`
	Pipeline   Pipeline `json:"pipeline" gorm:"foreignKey:PipelineID"`
	StageID    string   `json:"stageId" gorm:"not null"`
	Stage      Stage    `json:"stage" gorm:"foreignKey:StageID"`

	// Key dates
	ExpectedCloseDate *time.Time `json:"expectedCloseDate"`
	ActualCloseDate   *time.Time `json:"actualCloseDate"`

	// Relationships
	CompanyID string   `json:"companyId" gorm:"type:uuid"`
	Company   *Company `json:"company" gorm:"foreignKey:CompanyID;references:ID"`

	ContactID string   `json:"contactId" gorm:"type:uuid"`
	Contact   *Contact `json:"contact" gorm:"foreignKey:ContactID;references:ID"`

	AssignedUserID string `json:"assignedUserId" gorm:"type:uuid"`
	AssignedUser   *User  `json:"assignedUser" gorm:"foreignKey:AssignedUserID;references:ID"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Tasks             []Task             `json:"tasks" gorm:"foreignKey:DealID"`
	Communications    []Communication    `json:"communications" gorm:"foreignKey:DealID"`
	CustomFieldValues []CustomFieldValue `json:"customFieldValues" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	ActivityLogs      []ActivityLog      `json:"activityLogs" gorm:"foreignKey:EntityID;constraint:OnDelete:CASCADE"`
	StageHistory      []DealStageHistory `json:"stageHistory" gorm:"foreignKey:DealID"`
}

// TableName specifies the table name for Deal
func (Deal) TableName() string {
	return "deals"
}

// Pipeline represents a sales pipeline
type Pipeline struct {
	ID       string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name     string `json:"name" gorm:"not null"`
	IsActive bool   `json:"isActive" gorm:"default:true"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Stages []Stage `json:"stages" gorm:"foreignKey:PipelineID"`
	Deals  []Deal  `json:"deals" gorm:"foreignKey:PipelineID"`
}

// TableName specifies the table name for Pipeline
func (Pipeline) TableName() string {
	return "pipelines"
}

// Stage represents a stage in a sales pipeline
type Stage struct {
	ID           string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name         string  `json:"name" gorm:"not null"`
	Order        int     `json:"order" gorm:"not null"`
	Probability  int     `json:"probability" gorm:"default:0"` // Default probability for this stage
	IsClosedWon  bool    `json:"isClosedWon" gorm:"default:false"`
	IsClosedLost bool    `json:"isClosedLost" gorm:"default:false"`
	Color        *string `json:"color"` // For UI display

	// Pipeline relationship
	PipelineID string   `json:"pipelineId" gorm:"not null"`
	Pipeline   Pipeline `json:"pipeline" gorm:"foreignKey:PipelineID"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Relationships
	Deals        []Deal             `json:"deals" gorm:"foreignKey:StageID"`
	StageHistory []DealStageHistory `json:"stageHistory" gorm:"foreignKey:ToStageID"`
}

// TableName specifies the table name for Stage
func (Stage) TableName() string {
	return "stages"
}

// DealStageHistory tracks changes to deal stages
type DealStageHistory struct {
	ID     string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	DealID string `json:"dealId" gorm:"not null"`
	Deal   Deal   `json:"deal" gorm:"foreignKey:DealID"`

	FromStageID *string `json:"fromStageId"`
	FromStage   *Stage  `json:"fromStage" gorm:"foreignKey:FromStageID"`

	ToStageID string `json:"toStageId" gorm:"not null"`
	ToStage   Stage  `json:"toStage" gorm:"foreignKey:ToStageID"`

	// Track changes to amount and probability for pipeline audits
	FromAmount      *float64 `json:"fromAmount" gorm:"type:decimal(15,2)"`
	ToAmount        *float64 `json:"toAmount" gorm:"type:decimal(15,2)"`
	FromProbability *int     `json:"fromProbability"`
	ToProbability   *int     `json:"toProbability"`
	FromCurrency    *string  `json:"fromCurrency"`
	ToCurrency      *string  `json:"toCurrency"`

	// Track expected close date changes
	FromExpectedCloseDate *time.Time `json:"fromExpectedCloseDate"`
	ToExpectedCloseDate   *time.Time `json:"toExpectedCloseDate"`

	// Change metadata
	ChangeReason *string `json:"changeReason"` // Why the change was made
	Notes        *string `json:"notes"`        // Additional context

	MovedAt time.Time `json:"movedAt" gorm:"autoCreateTime"`
	MovedBy *string   `json:"movedBy"`
}

// TableName specifies the table name for DealStageHistory
func (DealStageHistory) TableName() string {
	return "deal_stage_history"
}
