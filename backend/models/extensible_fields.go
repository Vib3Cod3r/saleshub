package models

import (
	"time"
	"gorm.io/gorm"
)

// ExtensibleField represents a dynamic field that can be added to any entity
type ExtensibleField struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"not null"`
	Label       string    `json:"label" gorm:"not null"`
	Type        FieldType `json:"type" gorm:"not null"`
	EntityType  string    `json:"entityType" gorm:"not null"` // "Contact", "Company", etc.
	IsRequired  bool      `json:"isRequired" gorm:"default:false"`
	IsUnique    bool      `json:"isUnique" gorm:"default:false"`
	DefaultValue string   `json:"defaultValue"`
	Options     []string  `json:"options" gorm:"type:text[]"` // For dropdown/radio fields
	Validation  string    `json:"validation"` // JSON validation rules
	SortOrder   int       `json:"sortOrder" gorm:"default:0"`
	IsActive    bool      `json:"isActive" gorm:"default:true"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
}

// FieldType represents the type of extensible field
type FieldType string

const (
	FieldTypeText     FieldType = "text"
	FieldTypeTextarea FieldType = "textarea"
	FieldTypeNumber   FieldType = "number"
	FieldTypeDecimal  FieldType = "decimal"
	FieldTypeDate     FieldType = "date"
	FieldTypeDateTime FieldType = "datetime"
	FieldTypeBoolean  FieldType = "boolean"
	FieldTypeDropdown FieldType = "dropdown"
	FieldTypeRadio    FieldType = "radio"
	FieldTypeCheckbox FieldType = "checkbox"
	FieldTypeURL      FieldType = "url"
	FieldTypeEmail    FieldType = "email"
	FieldTypePhone    FieldType = "phone"
	FieldTypeCurrency FieldType = "currency"
)

// ExtensibleFieldValue represents the value of an extensible field for an entity
type ExtensibleFieldValue struct {
	ID              string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FieldID         string    `json:"fieldId" gorm:"not null"`
	EntityID        string    `json:"entityId" gorm:"not null"`
	EntityType      string    `json:"entityType" gorm:"not null"`
	TextValue       *string   `json:"textValue"`
	NumberValue     *int64    `json:"numberValue"`
	DecimalValue    *float64  `json:"decimalValue"`
	BooleanValue    *bool     `json:"booleanValue"`
	DateValue       *time.Time `json:"dateValue"`
	JSONValue       *string   `json:"jsonValue" gorm:"type:jsonb"`
	
	// Multi-tenancy
	TenantID string `json:"tenantId" gorm:"not null"`
	Tenant   Tenant `json:"tenant" gorm:"foreignKey:TenantID"`
	
	// Audit fields
	CreatedAt time.Time      `json:"createdAt" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updatedAt" gorm:"autoUpdateTime"`
	CreatedBy *string        `json:"createdBy"`
	DeletedAt gorm.DeletedAt `json:"deletedAt" gorm:"index"`
	
	// Relationships
	Field ExtensibleField `json:"field" gorm:"foreignKey:FieldID"`
}

// TableName specifies the table name for ExtensibleField
func (ExtensibleField) TableName() string {
	return "extensible_fields"
}

// TableName specifies the table name for ExtensibleFieldValue
func (ExtensibleFieldValue) TableName() string {
	return "extensible_field_values"
}



