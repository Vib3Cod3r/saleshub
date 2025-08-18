package repositories

import (
	"context"
	"fmt"

	"saleshub-backend/models"
)

// UserRepository defines the interface for user data operations
type UserRepository interface {
	// Basic CRUD operations
	Create(user *models.User) error
	FindByID(id string) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	Update(user *models.User) error
	Delete(id string) error

	// Query operations
	FindAll(limit, offset int) ([]*models.User, error)
	FindByTenant(tenantID string, limit, offset int) ([]*models.User, error)
	FindByRole(roleID string, limit, offset int) ([]*models.User, error)
	FindActiveUsers(limit, offset int) ([]*models.User, error)

	// Search operations
	Search(query string, limit, offset int) ([]*models.User, error)
	SearchByTenant(tenantID, query string, limit, offset int) ([]*models.User, error)

	// Count operations
	Count() (int64, error)
	CountByTenant(tenantID string) (int64, error)
	CountByRole(roleID string) (int64, error)

	// Context-aware operations
	CreateWithContext(ctx context.Context, user *models.User) error
	FindByIDWithContext(ctx context.Context, id string) (*models.User, error)
	UpdateWithContext(ctx context.Context, user *models.User) error
	DeleteWithContext(ctx context.Context, id string) error
}

// UserRepositoryError represents repository-specific errors
type UserRepositoryError struct {
	Operation     string
	Message       string
	OriginalError error
}

func (e *UserRepositoryError) Error() string {
	return fmt.Sprintf("user repository %s error: %s", e.Operation, e.Message)
}

func (e *UserRepositoryError) Unwrap() error {
	return e.OriginalError
}

// UserNotFoundError represents when a user is not found
type UserNotFoundError struct {
	ID    string
	Email string
}

func (e *UserNotFoundError) Error() string {
	if e.ID != "" {
		return fmt.Sprintf("user with ID %s not found", e.ID)
	}
	if e.Email != "" {
		return fmt.Sprintf("user with email %s not found", e.Email)
	}
	return "user not found"
}

// UserAlreadyExistsError represents when a user already exists
type UserAlreadyExistsError struct {
	Email string
}

func (e *UserAlreadyExistsError) Error() string {
	return fmt.Sprintf("user with email %s already exists", e.Email)
}

// UserQueryOptions represents options for user queries
type UserQueryOptions struct {
	Limit     int
	Offset    int
	TenantID  string
	RoleID    string
	IsActive  *bool
	Search    string
	SortBy    string
	SortOrder string // "asc" or "desc"
}

// UserQueryResult represents the result of a user query
type UserQueryResult struct {
	Users  []*models.User
	Total  int64
	Limit  int
	Offset int
}

// UserRepositoryWithQuery extends UserRepository with advanced query capabilities
type UserRepositoryWithQuery interface {
	UserRepository

	// Advanced query operations
	Query(options *UserQueryOptions) (*UserQueryResult, error)
	QueryWithContext(ctx context.Context, options *UserQueryOptions) (*UserQueryResult, error)

	// Bulk operations
	CreateMany(users []*models.User) error
	UpdateMany(users []*models.User) error
	DeleteMany(ids []string) error

	// Transaction support
	WithTransaction(tx interface{}) UserRepository
}
