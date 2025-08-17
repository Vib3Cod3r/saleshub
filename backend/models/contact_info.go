package models

import (
	"time"

	"gorm.io/gorm"
)

// PhoneNumberType represents types of phone numbers
type PhoneNumberType struct {
	ID          string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string  `json:"name" gorm:"not null"`
	Code        string  `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string `json:"description"`
	IsActive    bool    `json:"isActive" gorm:"default:true"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	PhoneNumbers []PhoneNumber `json:"phoneNumbers" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for PhoneNumberType
func (PhoneNumberType) TableName() string {
	return "phone_number_types"
}

// PhoneNumber represents a phone number for any entity
type PhoneNumber struct {
	ID        string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Number    string  `json:"number" gorm:"not null"`
	Extension *string `json:"extension"`
	IsPrimary bool    `json:"isPrimary" gorm:"default:false"`

	// Type relationship
	TypeID *string          `json:"typeId"`
	Type   *PhoneNumberType `json:"type" gorm:"foreignKey:TypeID"`

	// Polymorphic relationships - no GORM tags to prevent auto-constraints
	EntityID   string `json:"entityId" gorm:"not null"`
	EntityType string `json:"entityType" gorm:"not null"` // 'Company', 'Contact', 'Lead', 'User'

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt" gorm:"index"`
}

// TableName specifies the table name for PhoneNumber
func (PhoneNumber) TableName() string {
	return "phone_numbers"
}

// EmailAddressType represents types of email addresses
type EmailAddressType struct {
	ID          string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string  `json:"name" gorm:"not null"`
	Code        string  `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string `json:"description"`
	IsActive    bool    `json:"isActive" gorm:"default:true"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	EmailAddresses []EmailAddress `json:"emailAddresses" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for EmailAddressType
func (EmailAddressType) TableName() string {
	return "email_address_types"
}

// EmailAddress represents an email address for any entity
type EmailAddress struct {
	ID         string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Email      string `json:"email" gorm:"not null"`
	IsPrimary  bool   `json:"isPrimary" gorm:"default:false"`
	IsVerified bool   `json:"isVerified" gorm:"default:false"`

	// Type relationship
	TypeID *string           `json:"typeId"`
	Type   *EmailAddressType `json:"type" gorm:"foreignKey:TypeID"`

	// Polymorphic relationships - no GORM tags to prevent auto-constraints
	EntityID   string `json:"entityId" gorm:"not null"`
	EntityType string `json:"entityType" gorm:"not null"` // 'Company', 'Contact', 'Lead', 'User'

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt" gorm:"index"`
}

// TableName specifies the table name for EmailAddress
func (EmailAddress) TableName() string {
	return "email_addresses"
}

// AddressType represents types of addresses
type AddressType struct {
	ID          string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string  `json:"name" gorm:"not null"`
	Code        string  `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Description *string `json:"description"`
	IsActive    bool    `json:"isActive" gorm:"default:true"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	Addresses []Address `json:"addresses" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for AddressType
func (AddressType) TableName() string {
	return "address_types"
}

// Address represents an address for any entity
type Address struct {
	ID         string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Street1    *string `json:"street1"`
	Street2    *string `json:"street2"`
	City       *string `json:"city"`
	State      *string `json:"state"`
	PostalCode *string `json:"postalCode"`
	Country    *string `json:"country"`
	IsPrimary  bool    `json:"isPrimary" gorm:"default:false"`

	// Type relationship
	TypeID *string      `json:"typeId"`
	Type   *AddressType `json:"type" gorm:"foreignKey:TypeID"`

	// Polymorphic relationships - no GORM tags to prevent auto-constraints
	EntityID   string `json:"entityId" gorm:"not null"`
	EntityType string `json:"entityType" gorm:"not null"` // 'Company', 'Contact', 'Lead', 'User'

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt" gorm:"index"`
}

// TableName specifies the table name for Address
func (Address) TableName() string {
	return "addresses"
}

// SocialMediaType represents types of social media platforms
type SocialMediaType struct {
	ID       string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name     string  `json:"name" gorm:"not null"`
	Code     string  `json:"code" gorm:"uniqueIndex;not null"` // For system reference
	Icon     *string `json:"icon"`                             // Icon class or URL
	BaseURL  *string `json:"baseUrl"`                          // Base URL for the platform
	IsActive bool    `json:"isActive" gorm:"default:true"`

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`

	// Relationships
	SocialMediaAccounts []SocialMediaAccount `json:"socialMediaAccounts" gorm:"foreignKey:TypeID"`
}

// TableName specifies the table name for SocialMediaType
func (SocialMediaType) TableName() string {
	return "social_media_types"
}

// SocialMediaAccount represents a social media account for any entity
type SocialMediaAccount struct {
	ID        string  `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Username  *string `json:"username"`
	URL       *string `json:"url"`
	IsPrimary bool    `json:"isPrimary" gorm:"default:false"`

	// Type relationship
	TypeID *string          `json:"typeId"`
	Type   *SocialMediaType `json:"type" gorm:"foreignKey:TypeID"`

	// Polymorphic relationships - no GORM tags to prevent auto-constraints
	EntityID   string `json:"entityId" gorm:"not null"`
	EntityType string `json:"entityType" gorm:"not null"` // 'Company', 'Contact', 'Lead', 'User'

	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`

	// Timestamps
	CreatedAt time.Time  `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time  `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt *time.Time `json:"deletedAt" gorm:"index"`
}

// TableName specifies the table name for SocialMediaAccount
func (SocialMediaAccount) TableName() string {
	return "social_media_accounts"
}
