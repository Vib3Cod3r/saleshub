package lib

// This file is temporarily disabled due to missing model imports
// TODO: Re-enable when models are properly imported

/*
import (
	"gorm.io/gorm"
)
*/

/*
// QueryOptimizer provides optimized query patterns for 20K scale
type QueryOptimizer struct {
	db *gorm.DB
}

// NewQueryOptimizer creates a new query optimizer
func NewQueryOptimizer(db *gorm.DB) *QueryOptimizer {
	return &QueryOptimizer{db: db}
}

// OptimizedContactQuery creates an optimized query for contacts with proper indexing
func (qo *QueryOptimizer) OptimizedContactQuery(tenantID string) *gorm.DB {
	return qo.db.Model(&models.Contact{}).
		Where("tenant_id = ? AND deleted_at IS NULL", tenantID).
		Preload("Company").
		Preload("Owner").
		Preload("PhoneNumbers", "entity_type = ?", "Contact").
		Preload("EmailAddresses", "entity_type = ?", "Contact").
		Preload("Addresses", "entity_type = ?", "Contact")
}

// OptimizedCompanyQuery creates an optimized query for companies with proper indexing
func (qo *QueryOptimizer) OptimizedCompanyQuery(tenantID string) *gorm.DB {
	return qo.db.Model(&models.Company{}).
		Where("tenant_id = ? AND deleted_at IS NULL", tenantID).
		Preload("Industry").
		Preload("Size").
		Preload("AssignedUser").
		Preload("PhoneNumbers", "entity_type = ?", "Company").
		Preload("PhoneNumbers", "entity_type = ?", "Company").
		Preload("Addresses", "entity_type = ?", "Company")
}

// OptimizedSearchQuery creates an optimized search query with proper indexing
func (qo *QueryOptimizer) OptimizedSearchQuery(tenantID, searchTerm, entityType string) *gorm.DB {
	switch entityType {
	case "contacts":
		return qo.db.Model(&models.Contact{}).
			Where("tenant_id = ? AND deleted_at IS NULL AND (first_name ILIKE ? OR last_name ILIKE ?)",
				tenantID, "%"+searchTerm+"%", "%"+searchTerm+"%").
			Preload("Company")
	case "companies":
		return qo.db.Model(&models.Company{}).
			Where("tenant_id = ? AND deleted_at IS NULL AND name ILIKE ?",
				tenantID, "%"+searchTerm+"%").
			Preload("Industry").
			Preload("Size")
	default:
		return qo.db
	}
}

// OptimizedPagination applies optimized pagination with proper indexing
func (qo *QueryOptimizer) OptimizedPagination(query *gorm.DB, page, limit int) *gorm.DB {
	offset := (page - 1) * limit
	return query.Offset(offset).Limit(limit)
}

// OptimizedCountQuery creates an optimized count query
func (qo *QueryOptimizer) OptimizedCountQuery(tenantID, entityType string) *gorm.DB {
	switch entityType {
	case "contacts":
		return qo.db.Model(&models.Contact{}).
			Where("tenant_id = ? AND deleted_at IS NULL", tenantID)
	case "companies":
		return qo.db.Model(&models.Company{}).
			Where("tenant_id = ? AND deleted_at IS NULL", tenantID)
	default:
		return qo.db
	}
}
*/
