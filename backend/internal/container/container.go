package container

import (
	"os"
	"time"

	"saleshub-backend/internal/handlers"
	"saleshub-backend/internal/repositories"
	"saleshub-backend/internal/services"
	"saleshub-backend/lib"
	"saleshub-backend/pkg/auth"
	"saleshub-backend/pkg/validation"
)

// Container holds all application dependencies
type Container struct {
	// Core services
	AuthService services.AuthService

	// Handlers
	AuthHandler *handlers.AuthHandler

	// Repositories
	UserRepository   repositories.UserRepository
	TenantRepository repositories.TenantRepository
	RoleRepository   repositories.RoleRepository

	// Utilities
	TokenAuth auth.TokenAuthenticator
	Validator validation.Validator
	Logger    *lib.APILogger
}

// NewContainer creates a new dependency injection container
func NewContainer() *Container {
	container := &Container{}
	container.initialize()
	return container
}

// initialize sets up all dependencies
func (container *Container) initialize() {
	// Initialize utilities first
	container.initializeUtilities()

	// Initialize repositories
	container.initializeRepositories()

	// Initialize services
	container.initializeServices()

	// Initialize handlers
	container.initializeHandlers()
}

// initializeUtilities sets up utility dependencies
func (container *Container) initializeUtilities() {
	// Initialize JWT authenticator
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		secretKey = "your-super-secret-jwt-key-here" // Default for development
	}

	issuer := os.Getenv("JWT_ISSUER")
	if issuer == "" {
		issuer = "saleshub-crm"
	}

	tokenDuration := 24 * time.Hour // Default token duration
	if durationStr := os.Getenv("JWT_DURATION"); durationStr != "" {
		if duration, err := time.ParseDuration(durationStr); err == nil {
			tokenDuration = duration
		}
	}

	container.TokenAuth = auth.NewJWTAuthenticator(secretKey, issuer, tokenDuration)

	// Initialize validator
	container.Validator = validation.NewValidator()

	// Initialize logger
	container.Logger = lib.APILog
}

// initializeRepositories sets up repository dependencies
func (container *Container) initializeRepositories() {
	// TODO: Initialize actual repository implementations
	// For now, we'll use placeholder implementations
	// In a real application, these would be concrete implementations
	// that implement the repository interfaces

	// Example:
	// container.UserRepository = repositories.NewUserRepository(config.DB)
	// container.TenantRepository = repositories.NewTenantRepository(config.DB)
	// container.RoleRepository = repositories.NewRoleRepository(config.DB)
}

// initializeServices sets up service dependencies
func (container *Container) initializeServices() {
	// Initialize auth service with dependencies
	container.AuthService = services.NewAuthService(
		container.UserRepository,
		container.TenantRepository,
		container.RoleRepository,
		container.TokenAuth,
		container.Validator,
	)
}

// initializeHandlers sets up handler dependencies
func (container *Container) initializeHandlers() {
	// Initialize auth handler with service dependency
	container.AuthHandler = handlers.NewAuthHandler(
		container.AuthService,
		container.Logger,
	)
}

// GetAuthHandler returns the auth handler
func (container *Container) GetAuthHandler() *handlers.AuthHandler {
	return container.AuthHandler
}

// GetAuthService returns the auth service
func (container *Container) GetAuthService() services.AuthService {
	return container.AuthService
}

// GetTokenAuth returns the token authenticator
func (container *Container) GetTokenAuth() auth.TokenAuthenticator {
	return container.TokenAuth
}

// GetValidator returns the validator
func (container *Container) GetValidator() validation.Validator {
	return container.Validator
}

// GetLogger returns the logger
func (container *Container) GetLogger() *lib.APILogger {
	return container.Logger
}
