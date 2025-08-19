package lib

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// APIResponse represents a standardized API response
type APIResponse struct {
	Data       interface{}         `json:"data,omitempty"`
	Pagination *PaginationResponse `json:"pagination,omitempty"`
	Error      string              `json:"error,omitempty"`
	Message    string              `json:"message,omitempty"`
}

// ResponseHandler provides utilities for handling API responses
type ResponseHandler struct{}

// NewResponseHandler creates a new response handler
func NewResponseHandler() *ResponseHandler {
	return &ResponseHandler{}
}

// Success sends a successful response
func (rh *ResponseHandler) Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{
		Data: data,
	})
}

// SuccessWithPagination sends a successful response with pagination
func (rh *ResponseHandler) SuccessWithPagination(c *gin.Context, data interface{}, pagination PaginationResponse) {
	c.JSON(http.StatusOK, APIResponse{
		Data:       data,
		Pagination: &pagination,
	})
}

// Created sends a created response
func (rh *ResponseHandler) Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, APIResponse{
		Data: data,
	})
}

// BadRequest sends a bad request response
func (rh *ResponseHandler) BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, APIResponse{
		Error: message,
	})
}

// NotFound sends a not found response
func (rh *ResponseHandler) NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, APIResponse{
		Error: message,
	})
}

// InternalServerError sends an internal server error response
func (rh *ResponseHandler) InternalServerError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, APIResponse{
		Error: message,
	})
}

// Unauthorized sends an unauthorized response
func (rh *ResponseHandler) Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, APIResponse{
		Error: message,
	})
}

// Forbidden sends a forbidden response
func (rh *ResponseHandler) Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, APIResponse{
		Error: message,
	})
}

// HandleDatabaseError handles common database errors
func (rh *ResponseHandler) HandleDatabaseError(c *gin.Context, err error, operation string) {
	if err == gorm.ErrRecordNotFound {
		rh.NotFound(c, operation+" not found")
		return
	}

	rh.InternalServerError(c, "Failed to "+operation)
}

// HandleValidationError handles validation errors
func (rh *ResponseHandler) HandleValidationError(c *gin.Context, err error) {
	rh.BadRequest(c, err.Error())
}
