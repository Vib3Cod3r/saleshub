package lib

import (
	"gorm.io/gorm"
)

// QueryBuilder provides a fluent interface for building database queries
type QueryBuilder struct {
	query *gorm.DB
}

// NewQueryBuilder creates a new query builder instance
func NewQueryBuilder(query *gorm.DB) *QueryBuilder {
	return &QueryBuilder{query: query}
}

// WhereTenant adds tenant filtering to the query
func (qb *QueryBuilder) WhereTenant(tenantID string) *QueryBuilder {
	qb.query = qb.query.Where("tenant_id = ?", tenantID)
	return qb
}

// WhereID adds ID filtering to the query
func (qb *QueryBuilder) WhereID(id string) *QueryBuilder {
	qb.query = qb.query.Where("id = ?", id)
	return qb
}

// WhereCompany adds company filtering to the query
func (qb *QueryBuilder) WhereCompany(companyID string) *QueryBuilder {
	qb.query = qb.query.Where("company_id = ?", companyID)
	return qb
}

// Search adds search functionality to the query
func (qb *QueryBuilder) Search(searchTerm string, fields ...string) *QueryBuilder {
	if searchTerm == "" {
		return qb
	}

	var conditions []string
	var args []interface{}

	for _, field := range fields {
		conditions = append(conditions, field+" ILIKE ?")
		args = append(args, "%"+searchTerm+"%")
	}

	if len(conditions) > 0 {
		query := conditions[0]
		for i := 1; i < len(conditions); i++ {
			query += " OR " + conditions[i]
		}
		qb.query = qb.query.Where(query, args...)
	}

	return qb
}

// Preload adds preload relationships to the query
func (qb *QueryBuilder) Preload(relationships ...string) *QueryBuilder {
	for _, rel := range relationships {
		qb.query = qb.query.Preload(rel)
	}
	return qb
}

// PreloadWithCondition adds preload with conditions
func (qb *QueryBuilder) PreloadWithCondition(relationship, condition string, args ...interface{}) *QueryBuilder {
	allArgs := append([]interface{}{condition}, args...)
	qb.query = qb.query.Preload(relationship, allArgs...)
	return qb
}

// GetQuery returns the underlying GORM query
func (qb *QueryBuilder) GetQuery() *gorm.DB {
	return qb.query
}

// BuildSearchQuery creates a search query for common entity fields
func BuildSearchQuery(query *gorm.DB, searchTerm string, entityType string) *gorm.DB {
	if searchTerm == "" {
		return query
	}

	switch entityType {
	case "contact":
		return query.Where("first_name ILIKE ? OR last_name ILIKE ? OR title ILIKE ?",
			"%"+searchTerm+"%", "%"+searchTerm+"%", "%"+searchTerm+"%")
	case "company":
		return query.Where("name ILIKE ?", "%"+searchTerm+"%")
	case "deal":
		return query.Where("title ILIKE ? OR description ILIKE ?",
			"%"+searchTerm+"%", "%"+searchTerm+"%")
	case "lead":
		return query.Where("first_name ILIKE ? OR last_name ILIKE ? OR company_name ILIKE ?",
			"%"+searchTerm+"%", "%"+searchTerm+"%", "%"+searchTerm+"%")
	default:
		return query
	}
}
