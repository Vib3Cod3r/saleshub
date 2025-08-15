package models

import (
	"time"

	"gorm.io/gorm"
)

// CustomFieldType represents the type of custom field
type CustomFieldType string

const (
	CustomFieldTypeText         CustomFieldType = "TEXT"
	CustomFieldTypeTextarea     CustomFieldType = "TEXTAREA"
	CustomFieldTypeNumber       CustomFieldType = "NUMBER"
	CustomFieldTypeDecimal      CustomFieldType = "DECIMAL"
	CustomFieldTypeBoolean      CustomFieldType = "BOOLEAN"
	CustomFieldTypeDate         CustomFieldType = "DATE"
	CustomFieldTypeDateTime     CustomFieldType = "DATETIME"
	CustomFieldTypeEmail        CustomFieldType = "EMAIL"
	CustomFieldTypeURL          CustomFieldType = "URL"
	CustomFieldTypePhone        CustomFieldType = "PHONE"
	CustomFieldTypePicklist     CustomFieldType = "PICKLIST"
	CustomFieldTypeMultiPicklist CustomFieldType = "MULTI_PICKLIST"
	CustomFieldTypeLookup       CustomFieldType = "LOOKUP"
	CustomFieldTypeJSON         CustomFieldType = "JSON"
)

// CustomField represents a custom field definition
type CustomField struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"` // Internal name
	Label       string         `json:"label" gorm:"not null"` // Display name
	Type        CustomFieldType `json:"type" gorm:"not null"`
	EntityType  string         `json:"entityType" gorm:"not null"` // Which entity this field belongs to
	
	// Field configuration
	IsRequired  bool    `json:"isRequired" gorm:"default:false"`
	IsUnique    bool    `json:"isUnique" gorm:"default:false"`
	DefaultValue *string `json:"defaultValue"`
	
	// For picklist/select fields
	Options *string `json:"options" gorm:"type:jsonb"` // Array of options
	
	// For lookup fields
	LookupEntity *string `json:"lookupEntity"` // Entity to lookup
	
	// Validation rules
	Validation *string `json:"validation" gorm:"type:jsonb"` // Validation rules and constraints
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Values []CustomFieldValue `json:"values" gorm:"foreignKey:FieldID"`
}

// TableName specifies the table name for CustomField
func (CustomField) TableName() string {
	return "custom_fields"
}

// CustomFieldValue represents a value for a custom field
type CustomFieldValue struct {
	ID       string      `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FieldID  string      `json:"fieldId" gorm:"not null"`
	Field    CustomField `json:"field" gorm:"foreignKey:FieldID"`
	
	EntityID   string `json:"entityId" gorm:"not null"`   // ID of the record this value belongs to
	EntityType string `json:"entityType" gorm:"not null"` // Type of entity (Company, Contact, etc.)
	
	// Value storage (use appropriate field based on type)
	TextValue    *string    `json:"textValue"`
	NumberValue  *int       `json:"numberValue"`
	DecimalValue *float64   `json:"decimalValue" gorm:"type:decimal(15,2)"`
	BooleanValue *bool      `json:"booleanValue"`
	DateValue    *time.Time `json:"dateValue"`
	JSONValue    *string    `json:"jsonValue" gorm:"type:jsonb"`
	
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updatedAt" gorm:"autoUpdateTime"`
	
	// Polymorphic relationships
	Company         *Company         `json:"company" gorm:"foreignKey:EntityID"`
	Contact         *Contact         `json:"contact" gorm:"foreignKey:EntityID"`
	Lead            *Lead            `json:"lead" gorm:"foreignKey:EntityID"`
	Deal            *Deal            `json:"deal" gorm:"foreignKey:EntityID"`
	Task            *Task            `json:"task" gorm:"foreignKey:EntityID"`
	Communication   *Communication   `json:"communication" gorm:"foreignKey:EntityID"`
	MarketingSource *MarketingSource `json:"marketingSource" gorm:"foreignKey:EntityID"`
	MarketingAsset  *MarketingAsset  `json:"marketingAsset" gorm:"foreignKey:EntityID"`
}

// TableName specifies the table name for CustomFieldValue
func (CustomFieldValue) TableName() string {
	return "custom_field_values"
}

// CustomObject represents a custom object definition
type CustomObject struct {
	ID          string         `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"` // Internal name
	Label       string         `json:"label" gorm:"not null"` // Display name
	PluralLabel string         `json:"pluralLabel" gorm:"not null"` // Plural display name
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
}

// TableName specifies the table name for CustomObject
func (CustomObject) TableName() string {
	return "custom_objects"
}

// ActivityLog represents an audit log entry
type ActivityLog struct {
	ID         string   `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	EntityType string   `json:"entityType" gorm:"not null"` // Type of entity that was modified
	EntityID   string   `json:"entityId" gorm:"not null"`   // ID of the entity that was modified
	Action     string   `json:"action" gorm:"not null"`     // CREATE, UPDATE, DELETE, etc.
	
	// Change details
	FieldName *string `json:"fieldName"` // Which field was changed (for updates)
	OldValue  *string `json:"oldValue"`  // Previous value
	NewValue  *string `json:"newValue"`  // New value
	
	// Context
	UserID    *string `json:"userId"`
	User      *User   `json:"user" gorm:"foreignKey:UserID"`
	IPAddress *string `json:"ipAddress"`
	UserAgent *string `json:"userAgent"`
	
	CreatedAt time.Time `json:"createdAt" gorm:"autoCreateTime"`
	
	// Polymorphic relationships to all entities
	Company *Company `json:"company" gorm:"foreignKey:EntityID"`
	Contact *Contact `json:"contact" gorm:"foreignKey:EntityID"`
	Lead    *Lead    `json:"lead" gorm:"foreignKey:EntityID"`
	Deal    *Deal    `json:"deal" gorm:"foreignKey:EntityID"`
}

// TableName specifies the table name for ActivityLog
func (ActivityLog) TableName() string {
	return "activity_logs"
}
