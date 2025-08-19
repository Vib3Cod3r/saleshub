package services

import (
	"time"

	"saleshub-backend/internal/repositories"
	"saleshub-backend/models"
	"saleshub-backend/pkg/auth"
	"saleshub-backend/pkg/validation"
)

// AuthService defines the interface for authentication operations
type AuthService interface {
	Register(req *RegisterRequest) (*AuthResponse, error)
	Login(req *LoginRequest) (*AuthResponse, error)
	RefreshToken(token string) (*AuthResponse, error)
	ValidateToken(token string) (*models.User, error)
}

// authService implements AuthService
type authService struct {
	userRepo   repositories.UserRepository
	tenantRepo repositories.TenantRepository
	roleRepo   repositories.RoleRepository
	tokenAuth  auth.TokenAuthenticator
	validator  validation.Validator
}

// NewAuthService creates a new instance of AuthService
func NewAuthService(
	userRepo repositories.UserRepository,
	tenantRepo repositories.TenantRepository,
	roleRepo repositories.RoleRepository,
	tokenAuth auth.TokenAuthenticator,
	validator validation.Validator,
) AuthService {
	return &authService{
		userRepo:   userRepo,
		tenantRepo: tenantRepo,
		roleRepo:   roleRepo,
		tokenAuth:  tokenAuth,
		validator:  validator,
	}
}

// RegisterRequest represents the request for user registration
type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
}

// LoginRequest represents the request for user login
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	Token     string       `json:"token"`
	User      *models.User `json:"user"`
	ExpiresAt time.Time    `json:"expiresAt"`
}

// Register handles user registration with proper validation and business logic
func (s *authService) Register(req *RegisterRequest) (*AuthResponse, error) {
	// Validate request
	if err := s.validator.Validate(req); err != nil {
		return nil, &validation.ValidationError{Message: "Invalid registration data", Details: err.Error()}
	}

	// Check if user already exists
	existingUser, err := s.userRepo.FindByEmail(req.Email)
	if err == nil && existingUser != nil {
		return nil, &auth.UserExistsError{Email: req.Email}
	}

	// Get default tenant
	tenant, err := s.tenantRepo.FindBySubdomain("default")
	if err != nil {
		return nil, &auth.TenantNotFoundError{Subdomain: "default"}
	}

	// Get default admin role
	adminRole, err := s.roleRepo.FindByCodeAndTenant("ADMIN", tenant.ID)
	if err != nil {
		return nil, &auth.RoleNotFoundError{Code: "ADMIN", TenantID: tenant.ID}
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, &auth.PasswordHashError{OriginalError: err}
	}

	// Create user
	user := &models.User{
		Email:     req.Email,
		Password:  hashedPassword,
		FirstName: req.FirstName,
		LastName:  req.LastName,
		IsActive:  true,
		RoleID:    adminRole.ID,
		TenantID:  tenant.ID,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, &auth.UserCreationError{OriginalError: err}
	}

	// Generate token
	token, expiresAt, err := s.tokenAuth.GenerateToken(user)
	if err != nil {
		return nil, &auth.TokenGenerationError{OriginalError: err}
	}

	return &AuthResponse{
		Token:     token,
		User:      user,
		ExpiresAt: expiresAt,
	}, nil
}

// Login handles user authentication
func (s *authService) Login(req *LoginRequest) (*AuthResponse, error) {
	// Validate request
	if err := s.validator.Validate(req); err != nil {
		return nil, &validation.ValidationError{Message: "Invalid login data", Details: err.Error()}
	}

	// Find user by email
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil {
		return nil, &auth.InvalidCredentialsError{}
	}

	// Verify password
	if !auth.VerifyPassword(req.Password, user.Password) {
		return nil, &auth.InvalidCredentialsError{}
	}

	// Check if user is active
	if !user.IsActive {
		return nil, &auth.InactiveUserError{UserID: user.ID}
	}

	// Generate token
	token, expiresAt, err := s.tokenAuth.GenerateToken(user)
	if err != nil {
		return nil, &auth.TokenGenerationError{OriginalError: err}
	}

	return &AuthResponse{
		Token:     token,
		User:      user,
		ExpiresAt: expiresAt,
	}, nil
}

// RefreshToken handles token refresh
func (s *authService) RefreshToken(token string) (*AuthResponse, error) {
	// Validate current token
	user, err := s.tokenAuth.ValidateToken(token)
	if err != nil {
		return nil, &auth.InvalidTokenError{OriginalError: err}
	}

	// Generate new token
	newToken, expiresAt, err := s.tokenAuth.GenerateToken(user)
	if err != nil {
		return nil, &auth.TokenGenerationError{OriginalError: err}
	}

	return &AuthResponse{
		Token:     newToken,
		User:      user,
		ExpiresAt: expiresAt,
	}, nil
}

// ValidateToken validates a JWT token and returns the associated user
func (s *authService) ValidateToken(token string) (*models.User, error) {
	return s.tokenAuth.ValidateToken(token)
}
