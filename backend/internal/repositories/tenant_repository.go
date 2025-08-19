package repositories

import (
	"context"
	"fmt"

	"saleshub-backend/models"
)

// TenantRepository defines the interface for tenant data operations
type TenantRepository interface {
	// Basic CRUD operations
	Create(tenant *models.Tenant) error
	FindByID(id string) (*models.Tenant, error)
	FindBySubdomain(subdomain string) (*models.Tenant, error)
	Update(tenant *models.Tenant) error
	Delete(id string) error

	// Query operations
	FindAll(limit, offset int) ([]*models.Tenant, error)
	FindActiveTenants(limit, offset int) ([]*models.Tenant, error)

	// Context-aware operations
	CreateWithContext(ctx context.Context, tenant *models.Tenant) error
	FindByIDWithContext(ctx context.Context, id string) (*models.Tenant, error)
	FindBySubdomainWithContext(ctx context.Context, subdomain string) (*models.Tenant, error)
	UpdateWithContext(ctx context.Context, tenant *models.Tenant) error
	DeleteWithContext(ctx context.Context, id string) error
}

// TenantNotFoundError represents when a tenant is not found
type TenantNotFoundError struct {
	ID        string
	Subdomain string
}

func (e *TenantNotFoundError) Error() string {
	if e.ID != "" {
		return fmt.Sprintf("tenant with ID %s not found", e.ID)
	}
	if e.Subdomain != "" {
		return fmt.Sprintf("tenant with subdomain %s not found", e.Subdomain)
	}
	return "tenant not found"
}
