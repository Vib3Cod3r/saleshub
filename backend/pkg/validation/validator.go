package validation

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Validator defines the interface for validation operations
type Validator interface {
	Validate(interface{}) error
	ValidateStruct(interface{}) error
	ValidateField(interface{}, string) error
}

// validator implements Validator using go-playground/validator
type validatorImpl struct {
	validate *validator.Validate
}

// NewValidator creates a new validator instance
func NewValidator() Validator {
	v := validator.New()

	// Register custom validations
	v.RegisterValidation("phone", validatePhone)
	v.RegisterValidation("uuid", validateUUID)
	v.RegisterValidation("strong_password", validateStrongPassword)

	return &validatorImpl{validate: v}
}

// Validate validates a struct using struct tags
func (v *validatorImpl) Validate(obj interface{}) error {
	if err := v.validate.Struct(obj); err != nil {
		return &ValidationError{
			Message: "validation failed",
			Details: formatValidationErrors(err),
		}
	}
	return nil
}

// ValidateStruct validates a struct (alias for Validate)
func (v *validatorImpl) ValidateStruct(obj interface{}) error {
	return v.Validate(obj)
}

// ValidateField validates a single field
func (v *validatorImpl) ValidateField(obj interface{}, field string) error {
	if err := v.validate.Var(obj, field); err != nil {
		return &ValidationError{
			Message: "field validation failed",
			Details: err.Error(),
		}
	}
	return nil
}

// Custom validation functions
func validatePhone(fl validator.FieldLevel) bool {
	phone := fl.Field().String()
	// Basic phone validation - can be enhanced based on requirements
	phoneRegex := regexp.MustCompile(`^\+?[\d\s\-\(\)]{10,}$`)
	return phoneRegex.MatchString(phone)
}

func validateUUID(fl validator.FieldLevel) bool {
	uuid := fl.Field().String()
	uuidRegex := regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	return uuidRegex.MatchString(strings.ToLower(uuid))
}

func validateStrongPassword(fl validator.FieldLevel) bool {
	password := fl.Field().String()

	// At least 8 characters
	if len(password) < 8 {
		return false
	}

	// At least one uppercase letter
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	if !hasUpper {
		return false
	}

	// At least one lowercase letter
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	if !hasLower {
		return false
	}

	// At least one digit
	hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
	if !hasDigit {
		return false
	}

	// At least one special character
	hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)
	if !hasSpecial {
		return false
	}

	return true
}

// formatValidationErrors formats validation errors into a readable string
func formatValidationErrors(err error) string {
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		var errors []string
		for _, e := range validationErrors {
			errors = append(errors, formatFieldError(e))
		}
		return strings.Join(errors, "; ")
	}
	return err.Error()
}

// formatFieldError formats a single field validation error
func formatFieldError(e validator.FieldError) string {
	field := e.Field()
	tag := e.Tag()
	param := e.Param()

	switch tag {
	case "required":
		return fmt.Sprintf("%s is required", field)
	case "email":
		return fmt.Sprintf("%s must be a valid email address", field)
	case "min":
		return fmt.Sprintf("%s must be at least %s characters long", field, param)
	case "max":
		return fmt.Sprintf("%s must be at most %s characters long", field, param)
	case "phone":
		return fmt.Sprintf("%s must be a valid phone number", field)
	case "uuid":
		return fmt.Sprintf("%s must be a valid UUID", field)
	case "strong_password":
		return fmt.Sprintf("%s must contain at least 8 characters with uppercase, lowercase, digit, and special character", field)
	default:
		return fmt.Sprintf("%s failed validation: %s", field, tag)
	}
}

// ValidationError represents a validation error
type ValidationError struct {
	Message string `json:"message"`
	Details string `json:"details"`
}

func (e *ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Message, e.Details)
}

// FieldError represents a field-specific validation error
type FieldError struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Value   string `json:"value"`
	Message string `json:"message"`
}

// ValidationResult represents the result of validation
type ValidationResult struct {
	IsValid bool         `json:"isValid"`
	Errors  []FieldError `json:"errors,omitempty"`
}

// ValidateWithResult validates and returns a structured result
func ValidateWithResult(v Validator, obj interface{}) *ValidationResult {
	err := v.Validate(obj)
	if err == nil {
		return &ValidationResult{IsValid: true}
	}

	// Parse validation errors into structured format
	var fieldErrors []FieldError
	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			fieldErrors = append(fieldErrors, FieldError{
				Field:   e.Field(),
				Tag:     e.Tag(),
				Value:   fmt.Sprintf("%v", e.Value()),
				Message: formatFieldError(e),
			})
		}
	}

	return &ValidationResult{
		IsValid: false,
		Errors:  fieldErrors,
	}
}
