package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"saleshub-backend/models"
)

// TokenAuthenticator defines the interface for JWT token operations
type TokenAuthenticator interface {
	GenerateToken(user *models.User) (string, time.Time, error)
	ValidateToken(tokenString string) (*models.User, error)
}

// jwtAuthenticator implements TokenAuthenticator
type jwtAuthenticator struct {
	secretKey []byte
	issuer    string
	duration  time.Duration
}

// NewJWTAuthenticator creates a new JWT authenticator
func NewJWTAuthenticator(secretKey string, issuer string, duration time.Duration) TokenAuthenticator {
	return &jwtAuthenticator{
		secretKey: []byte(secretKey),
		issuer:    issuer,
		duration:  duration,
	}
}

// Claims represents JWT claims
type Claims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	TenantID string `json:"tenant_id"`
	RoleID   string `json:"role_id"`
	jwt.RegisteredClaims
}

// GenerateToken creates a new JWT token for the user
func (j *jwtAuthenticator) GenerateToken(user *models.User) (string, time.Time, error) {
	expiresAt := time.Now().Add(j.duration)

	claims := &Claims{
		UserID:   user.ID,
		Email:    user.Email,
		TenantID: user.TenantID,
		RoleID:   user.RoleID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    j.issuer,
			Subject:   user.Email,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(j.secretKey)
	if err != nil {
		return "", time.Time{}, &TokenGenerationError{OriginalError: err}
	}

	return tokenString, expiresAt, nil
}

// ValidateToken validates a JWT token and returns the associated user
func (j *jwtAuthenticator) ValidateToken(tokenString string) (*models.User, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, &InvalidTokenError{OriginalError: errors.New("unexpected signing method")}
		}
		return j.secretKey, nil
	})

	if err != nil {
		return nil, &InvalidTokenError{OriginalError: err}
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		user := &models.User{
			ID:       claims.UserID,
			Email:    claims.Email,
			TenantID: claims.TenantID,
			RoleID:   claims.RoleID,
		}
		return user, nil
	}

	return nil, &InvalidTokenError{OriginalError: errors.New("invalid token claims")}
}

// HashPassword hashes a password using bcrypt
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", &PasswordHashError{OriginalError: err}
	}
	return string(bytes), nil
}

// VerifyPassword verifies a password against its hash
func VerifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// Custom error types for better error handling
type TokenGenerationError struct {
	OriginalError error
}

func (e *TokenGenerationError) Error() string {
	return "failed to generate token: " + e.OriginalError.Error()
}

func (e *TokenGenerationError) Unwrap() error {
	return e.OriginalError
}

type InvalidTokenError struct {
	OriginalError error
}

func (e *InvalidTokenError) Error() string {
	return "invalid token: " + e.OriginalError.Error()
}

func (e *InvalidTokenError) Unwrap() error {
	return e.OriginalError
}

type PasswordHashError struct {
	OriginalError error
}

func (e *PasswordHashError) Error() string {
	return "failed to hash password: " + e.OriginalError.Error()
}

func (e *PasswordHashError) Unwrap() error {
	return e.OriginalError
}

type UserExistsError struct {
	Email string
}

func (e *UserExistsError) Error() string {
	return "user with email " + e.Email + " already exists"
}

type InvalidCredentialsError struct{}

func (e *InvalidCredentialsError) Error() string {
	return "invalid email or password"
}

type InactiveUserError struct {
	UserID string
}

func (e *InactiveUserError) Error() string {
	return "user is inactive"
}

type TenantNotFoundError struct {
	Subdomain string
}

func (e *TenantNotFoundError) Error() string {
	return "tenant with subdomain " + e.Subdomain + " not found"
}

type RoleNotFoundError struct {
	Code     string
	TenantID string
}

func (e *RoleNotFoundError) Error() string {
	return "role with code " + e.Code + " not found for tenant"
}

type UserCreationError struct {
	OriginalError error
}

func (e *UserCreationError) Error() string {
	return "failed to create user: " + e.OriginalError.Error()
}

func (e *UserCreationError) Unwrap() error {
	return e.OriginalError
}
