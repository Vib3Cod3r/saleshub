package repositories

import (
	"context"
	"fmt"

	"saleshub-backend/models"
)

// RoleRepository defines the interface for role data operations
type RoleRepository interface {
	// Basic CRUD operations
	Create(role *models.UserRole) error
	FindByID(id string) (*models.UserRole, error)
	FindByCode(code string) (*models.UserRole, error)
	FindByCodeAndTenant(code, tenantID string) (*models.UserRole, error)
	Update(role *models.UserRole) error
	Delete(id string) error

	// Query operations
	FindAll(limit, offset int) ([]*models.UserRole, error)
	FindByTenant(tenantID string, limit, offset int) ([]*models.UserRole, error)
	FindSystemRoles(limit, offset int) ([]*models.UserRole, error)
	FindActiveRoles(limit, offset int) ([]*models.UserRole, error)

	// Context-aware operations
	CreateWithContext(ctx context.Context, role *models.UserRole) error
	FindByIDWithContext(ctx context.Context, id string) (*models.UserRole, error)
	FindByCodeWithContext(ctx context.Context, code string) (*models.UserRole, error)
	FindByCodeAndTenantWithContext(ctx context.Context, code, tenantID string) (*models.UserRole, error)
	UpdateWithContext(ctx context.Context, role *models.UserRole) error
	DeleteWithContext(ctx context.Context, id string) error
}

// RoleNotFoundError represents when a role is not found
type RoleNotFoundError struct {
	ID       string
	Code     string
	TenantID string
}

func (e *RoleNotFoundError) Error() string {
	if e.ID != "" {
		return fmt.Sprintf("role with ID %s not found", e.ID)
	}
	if e.Code != "" && e.TenantID != "" {
		return fmt.Sprintf("role with code %s not found for tenant %s", e.Code, e.TenantID)
	}
	if e.Code != "" {
		return fmt.Sprintf("role with code %s not found", e.Code)
	}
	return "role not found"
}
