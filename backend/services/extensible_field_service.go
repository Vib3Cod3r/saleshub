package services

import (
	"context"
	"errors"
	"fmt"

	"saleshub-backend/models"
	"gorm.io/gorm"
)

// ExtensibleFieldService manages dynamic fields for entities
type ExtensibleFieldService struct {
	db *gorm.DB
}

// NewExtensibleFieldService creates a new extensible field service
func NewExtensibleFieldService(db *gorm.DB) *ExtensibleFieldService {
	return &ExtensibleFieldService{db: db}
}

// CreateField creates a new extensible field
func (s *ExtensibleFieldService) CreateField(ctx context.Context, field *models.ExtensibleField) error {
	// Validate field name uniqueness within tenant and entity type
	var existingField models.ExtensibleField
	err := s.db.WithContext(ctx).
		Where("tenant_id = ? AND entity_type = ? AND name = ? AND deleted_at IS NULL", 
			field.TenantID, field.EntityType, field.Name).
		First(&existingField).Error
	
	if err == nil {
		return errors.New("field name already exists for this entity type")
	}
	
	if err != gorm.ErrRecordNotFound {
		return err
	}
	
	return s.db.WithContext(ctx).Create(field).Error
}

// GetFieldsForEntity returns all active fields for a given entity type
func (s *ExtensibleFieldService) GetFieldsForEntity(ctx context.Context, tenantID, entityType string) ([]models.ExtensibleField, error) {
	var fields []models.ExtensibleField
	err := s.db.WithContext(ctx).
		Where("tenant_id = ? AND entity_type = ? AND is_active = true AND deleted_at IS NULL", 
			tenantID, entityType).
		Order("sort_order ASC").
		Find(&fields).Error
	
	return fields, err
}

// SetFieldValue sets a value for an extensible field
func (s *ExtensibleFieldService) SetFieldValue(ctx context.Context, value *models.ExtensibleFieldValue) error {
	// Check if field exists and is active
	var field models.ExtensibleField
	err := s.db.WithContext(ctx).
		Where("id = ? AND is_active = true AND deleted_at IS NULL", value.FieldID).
		First(&field).Error
	
	if err != nil {
		return errors.New("field not found or inactive")
	}
	
	// Check for unique constraint if field is unique
	if field.IsUnique {
		var existingValue models.ExtensibleFieldValue
		err := s.db.WithContext(ctx).
			Where("field_id = ? AND entity_id != ? AND deleted_at IS NULL", 
				value.FieldID, value.EntityID).
			First(&existingValue).Error
		
		if err == nil {
			return errors.New("unique field value already exists")
		}
	}
	
	// Upsert the value
	return s.db.WithContext(ctx).
		Where("field_id = ? AND entity_id = ? AND entity_type = ?", 
			value.FieldID, value.EntityID, value.EntityType).
		Assign(value).
		FirstOrCreate(value).Error
}

// GetFieldValues returns all field values for an entity
func (s *ExtensibleFieldService) GetFieldValues(ctx context.Context, entityID, entityType, tenantID string) ([]models.ExtensibleFieldValue, error) {
	var values []models.ExtensibleFieldValue
	err := s.db.WithContext(ctx).
		Preload("Field").
		Where("entity_id = ? AND entity_type = ? AND tenant_id = ? AND deleted_at IS NULL", 
			entityID, entityType, tenantID).
		Find(&values).Error
	
	return values, err
}

// DeleteField deletes an extensible field and all its values
func (s *ExtensibleFieldService) DeleteField(ctx context.Context, fieldID, tenantID string) error {
	// Start a transaction
	return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Delete all values for this field
		if err := tx.Where("field_id = ? AND tenant_id = ?", fieldID, tenantID).
			Delete(&models.ExtensibleFieldValue{}).Error; err != nil {
			return err
		}
		
		// Delete the field
		if err := tx.Where("id = ? AND tenant_id = ?", fieldID, tenantID).
			Delete(&models.ExtensibleField{}).Error; err != nil {
			return err
		}
		
		return nil
	})
}



