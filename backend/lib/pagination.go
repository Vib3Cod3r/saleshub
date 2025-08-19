package lib

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// PaginationConfig holds pagination parameters
type PaginationConfig struct {
	Page  int
	Limit int
	Total int64
}

// PaginationResponse represents the pagination metadata
type PaginationResponse struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"totalPages"`
}

// GetPaginationParams extracts pagination parameters from gin context
func GetPaginationParams(c *gin.Context) PaginationConfig {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	// Ensure minimum values
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	return PaginationConfig{
		Page:  page,
		Limit: limit,
	}
}

// ApplyPagination applies pagination to a GORM query
func ApplyPagination(query *gorm.DB, config PaginationConfig) *gorm.DB {
	offset := (config.Page - 1) * config.Limit
	return query.Offset(offset).Limit(config.Limit)
}

// CalculateTotalPages calculates total pages from total count and limit
func CalculateTotalPages(total int64, limit int) int {
	return int((total + int64(limit) - 1) / int64(limit))
}

// CreatePaginationResponse creates a pagination response object
func CreatePaginationResponse(config PaginationConfig, total int64) PaginationResponse {
	return PaginationResponse{
		Page:       config.Page,
		Limit:      config.Limit,
		Total:      total,
		TotalPages: CalculateTotalPages(total, config.Limit),
	}
}
