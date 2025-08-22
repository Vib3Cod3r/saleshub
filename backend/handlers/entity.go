package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// EntitySpecification represents the structure of an entity
type EntitySpecification struct {
	ID                   string        `json:"id"`
	Name                 string        `json:"name"`
	DisplayName          string        `json:"displayName"`
	Description          string        `json:"description,omitempty"`
	Fields               []EntityField `json:"fields"`
	DefaultFields        []string      `json:"defaultFields"`
	DefaultSortField     string        `json:"defaultSortField"`
	DefaultSortDirection string        `json:"defaultSortDirection"`
	DefaultPageSize      int           `json:"defaultPageSize"`
	MaxPageSize          int           `json:"maxPageSize"`
	SupportsBulkActions  bool          `json:"supportsBulkActions"`
	SupportsExport       bool          `json:"supportsExport"`
	SupportsImport       bool          `json:"supportsImport"`
}

// EntityField represents a field in an entity
type EntityField struct {
	ID                 string                 `json:"id"`
	Name               string                 `json:"name"`
	DisplayName        string                 `json:"displayName"`
	Type               string                 `json:"type"`
	Required           bool                   `json:"required"`
	Sortable           bool                   `json:"sortable"`
	Filterable         bool                   `json:"filterable"`
	Searchable         bool                   `json:"searchable"`
	RelationshipEntity string                 `json:"relationshipEntity,omitempty"`
	PicklistOptions    []string               `json:"picklistOptions,omitempty"`
	DefaultValue       interface{}            `json:"defaultValue,omitempty"`
	Validation         map[string]interface{} `json:"validation,omitempty"`
}

// QueryConfig represents the query configuration for entity data
type QueryConfig struct {
	Search   string         `json:"search,omitempty"`
	Filters  []FilterConfig `json:"filters"`
	Sort     SortConfig     `json:"sort"`
	Page     int            `json:"page"`
	PageSize int            `json:"pageSize"`
	Fields   []string       `json:"fields"`
}

// FilterConfig represents a filter configuration
type FilterConfig struct {
	ID           string      `json:"id"`
	Field        string      `json:"field"`
	Operator     string      `json:"operator"`
	Value        interface{} `json:"value"`
	DisplayValue string      `json:"displayValue,omitempty"`
}

// SortConfig represents a sort configuration
type SortConfig struct {
	Field     string `json:"field"`
	Direction string `json:"direction"`
}

// PaginatedResponse represents a paginated response
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Pagination struct {
		Page        int  `json:"page"`
		PageSize    int  `json:"pageSize"`
		Total       int  `json:"total"`
		TotalPages  int  `json:"totalPages"`
		HasNext     bool `json:"hasNext"`
		HasPrevious bool `json:"hasPrevious"`
	} `json:"pagination"`
}

// Fake entity specifications for development
var entitySpecs = map[string]EntitySpecification{
	"contacts": {
		ID:                   "contacts",
		Name:                 "contacts",
		DisplayName:          "Contacts",
		Description:          "Manage your contacts and their information",
		DefaultFields:        []string{"firstName", "lastName", "email", "company", "status"},
		DefaultSortField:     "lastName",
		DefaultSortDirection: "asc",
		DefaultPageSize:      50,
		MaxPageSize:          200,
		SupportsBulkActions:  true,
		SupportsExport:       true,
		SupportsImport:       true,
		Fields: []EntityField{
			{ID: "id", Name: "id", DisplayName: "ID", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "firstName", Name: "firstName", DisplayName: "First Name", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "lastName", Name: "lastName", DisplayName: "Last Name", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "email", Name: "email", DisplayName: "Email", Type: "email", Required: false, Sortable: true, Filterable: true, Searchable: true},
			{ID: "phone", Name: "phone", DisplayName: "Phone", Type: "phone", Required: false, Sortable: true, Filterable: true, Searchable: true},
			{ID: "company", Name: "company", DisplayName: "Company", Type: "relationship", Required: false, Sortable: true, Filterable: true, Searchable: true, RelationshipEntity: "companies"},
			{ID: "createdAt", Name: "createdAt", DisplayName: "Created Date", Type: "date", Required: false, Sortable: true, Filterable: true, Searchable: false},
			{ID: "status", Name: "status", DisplayName: "Status", Type: "picklist", Required: false, Sortable: true, Filterable: true, Searchable: true, PicklistOptions: []string{"Active", "Inactive", "Lead", "Customer", "Prospect"}},
		},
	},
	"companies": {
		ID:                   "companies",
		Name:                 "companies",
		DisplayName:          "Companies",
		Description:          "Manage your company information",
		DefaultFields:        []string{"name", "industry", "website", "phone", "status"},
		DefaultSortField:     "name",
		DefaultSortDirection: "asc",
		DefaultPageSize:      50,
		MaxPageSize:          200,
		SupportsBulkActions:  true,
		SupportsExport:       true,
		SupportsImport:       true,
		Fields: []EntityField{
			{ID: "id", Name: "id", DisplayName: "ID", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "name", Name: "name", DisplayName: "Company Name", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "industry", Name: "industry", DisplayName: "Industry", Type: "picklist", Required: false, Sortable: true, Filterable: true, Searchable: true, PicklistOptions: []string{"Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Other"}},
			{ID: "website", Name: "website", DisplayName: "Website", Type: "text", Required: false, Sortable: true, Filterable: true, Searchable: true},
			{ID: "phone", Name: "phone", DisplayName: "Phone", Type: "phone", Required: false, Sortable: true, Filterable: true, Searchable: true},
			{ID: "address", Name: "address", DisplayName: "Address", Type: "text", Required: false, Sortable: false, Filterable: true, Searchable: true},
			{ID: "createdAt", Name: "createdAt", DisplayName: "Created Date", Type: "date", Required: false, Sortable: true, Filterable: true, Searchable: false},
			{ID: "status", Name: "status", DisplayName: "Status", Type: "picklist", Required: false, Sortable: true, Filterable: true, Searchable: true, PicklistOptions: []string{"Active", "Inactive", "Prospect", "Customer", "Partner"}},
		},
	},
	"leads": {
		ID:                   "leads",
		Name:                 "leads",
		DisplayName:          "Leads",
		Description:          "Manage your sales leads",
		DefaultFields:        []string{"firstName", "lastName", "email", "company", "source", "status"},
		DefaultSortField:     "createdAt",
		DefaultSortDirection: "desc",
		DefaultPageSize:      50,
		MaxPageSize:          200,
		SupportsBulkActions:  true,
		SupportsExport:       true,
		SupportsImport:       true,
		Fields: []EntityField{
			{ID: "id", Name: "id", DisplayName: "ID", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "firstName", Name: "firstName", DisplayName: "First Name", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "lastName", Name: "lastName", DisplayName: "Last Name", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "email", Name: "email", DisplayName: "Email", Type: "email", Required: false, Sortable: true, Filterable: true, Searchable: true},
			{ID: "company", Name: "company", DisplayName: "Company", Type: "text", Required: false, Sortable: true, Filterable: true, Searchable: true},
			{ID: "source", Name: "source", DisplayName: "Lead Source", Type: "picklist", Required: false, Sortable: true, Filterable: true, Searchable: true, PicklistOptions: []string{"Website", "Referral", "Cold Call", "Trade Show", "Social Media", "Other"}},
			{ID: "status", Name: "status", DisplayName: "Status", Type: "picklist", Required: false, Sortable: true, Filterable: true, Searchable: true, PicklistOptions: []string{"New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"}},
			{ID: "createdAt", Name: "createdAt", DisplayName: "Created Date", Type: "date", Required: false, Sortable: true, Filterable: true, Searchable: false},
		},
	},
	"deals": {
		ID:                   "deals",
		Name:                 "deals",
		DisplayName:          "Deals",
		Description:          "Manage your sales deals and opportunities",
		DefaultFields:        []string{"name", "contact", "company", "amount", "stage", "closeDate"},
		DefaultSortField:     "closeDate",
		DefaultSortDirection: "asc",
		DefaultPageSize:      50,
		MaxPageSize:          200,
		SupportsBulkActions:  true,
		SupportsExport:       true,
		SupportsImport:       true,
		Fields: []EntityField{
			{ID: "id", Name: "id", DisplayName: "ID", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "name", Name: "name", DisplayName: "Deal Name", Type: "text", Required: true, Sortable: true, Filterable: true, Searchable: true},
			{ID: "contact", Name: "contact", DisplayName: "Contact", Type: "relationship", Required: false, Sortable: true, Filterable: true, Searchable: true, RelationshipEntity: "contacts"},
			{ID: "company", Name: "company", DisplayName: "Company", Type: "relationship", Required: false, Sortable: true, Filterable: true, Searchable: true, RelationshipEntity: "companies"},
			{ID: "amount", Name: "amount", DisplayName: "Amount", Type: "number", Required: false, Sortable: true, Filterable: true, Searchable: false},
			{ID: "stage", Name: "stage", DisplayName: "Stage", Type: "picklist", Required: false, Sortable: true, Filterable: true, Searchable: true, PicklistOptions: []string{"Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"}},
			{ID: "closeDate", Name: "closeDate", DisplayName: "Close Date", Type: "date", Required: false, Sortable: true, Filterable: true, Searchable: false},
			{ID: "createdAt", Name: "createdAt", DisplayName: "Created Date", Type: "date", Required: false, Sortable: true, Filterable: true, Searchable: false},
		},
	},
}

// GetEntitySpecification returns the specification for a given entity type
func GetEntitySpecification(c *gin.Context) {
	entityType := c.Param("entityType")

	spec, exists := entitySpecs[entityType]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "Entity specification not found"})
		return
	}

	c.JSON(http.StatusOK, spec)
}

// GetEntityData returns paginated data for a given entity type
func GetEntityData(c *gin.Context) {
	entityType := c.Param("entityType")

	// Parse query parameters
	var queryConfig QueryConfig
	if err := c.ShouldBindJSON(&queryConfig); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query configuration"})
		return
	}

	// Validate page size
	if queryConfig.PageSize <= 0 {
		queryConfig.PageSize = 50
	}
	if queryConfig.PageSize > 200 {
		queryConfig.PageSize = 200
	}

	// Validate page
	if queryConfig.Page <= 0 {
		queryConfig.Page = 1
	}

	// Generate fake data based on entity type
	data := generateFakeData(entityType, 1000)

	// Apply filters, search, and sort
	filteredData := applyFilters(data, queryConfig.Filters)
	searchedData := applySearch(filteredData, queryConfig.Search)
	sortedData := applySort(searchedData, queryConfig.Sort)

	// Apply pagination
	total := len(sortedData)
	startIndex := (queryConfig.Page - 1) * queryConfig.PageSize
	endIndex := startIndex + queryConfig.PageSize

	if startIndex >= total {
		startIndex = total
	}
	if endIndex > total {
		endIndex = total
	}

	paginatedData := sortedData[startIndex:endIndex]

	// Select only requested fields
	if len(queryConfig.Fields) > 0 {
		paginatedData = selectFields(paginatedData, queryConfig.Fields)
	}

	// Build response
	response := PaginatedResponse{
		Data: paginatedData,
	}
	response.Pagination.Page = queryConfig.Page
	response.Pagination.PageSize = queryConfig.PageSize
	response.Pagination.Total = total
	response.Pagination.TotalPages = (total + queryConfig.PageSize - 1) / queryConfig.PageSize
	response.Pagination.HasNext = queryConfig.Page < response.Pagination.TotalPages
	response.Pagination.HasPrevious = queryConfig.Page > 1

	c.JSON(http.StatusOK, response)
}

// Helper functions for fake data generation and processing
func generateFakeData(entityType string, count int) []map[string]interface{} {
	data := make([]map[string]interface{}, count)

	for i := 1; i <= count; i++ {
		record := make(map[string]interface{})
		record["id"] = fmt.Sprintf("%s_%d", entityType, i)

		switch entityType {
		case "contacts":
			record["firstName"] = fmt.Sprintf("John%d", i)
			record["lastName"] = fmt.Sprintf("Doe%d", i)
			record["email"] = fmt.Sprintf("john.doe%d@example.com", i)
			record["phone"] = fmt.Sprintf("+1-555-%03d-%04d", i, i)
			record["company"] = fmt.Sprintf("Company %d", i)
			record["status"] = []string{"Active", "Inactive", "Lead", "Customer", "Prospect"}[i%5]
			record["createdAt"] = time.Now().AddDate(0, 0, -i).Format("2006-01-02T15:04:05Z")

		case "companies":
			industries := []string{"Technology", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Other"}
			record["name"] = fmt.Sprintf("Company %d", i)
			record["industry"] = industries[i%len(industries)]
			record["website"] = fmt.Sprintf("https://company%d.com", i)
			record["phone"] = fmt.Sprintf("+1-555-%03d-%04d", i, i)
			record["address"] = fmt.Sprintf("%d Main St, City %d, State", i, i)
			record["status"] = []string{"Active", "Inactive", "Prospect", "Customer", "Partner"}[i%5]
			record["createdAt"] = time.Now().AddDate(0, 0, -i).Format("2006-01-02T15:04:05Z")

		case "leads":
			sources := []string{"Website", "Referral", "Cold Call", "Trade Show", "Social Media", "Other"}
			statuses := []string{"New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"}
			record["firstName"] = fmt.Sprintf("Lead%d", i)
			record["lastName"] = fmt.Sprintf("Smith%d", i)
			record["email"] = fmt.Sprintf("lead.smith%d@example.com", i)
			record["company"] = fmt.Sprintf("Lead Company %d", i)
			record["source"] = sources[i%len(sources)]
			record["status"] = statuses[i%len(statuses)]
			record["createdAt"] = time.Now().AddDate(0, 0, -i).Format("2006-01-02T15:04:05Z")

		case "deals":
			stages := []string{"Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"}
			record["name"] = fmt.Sprintf("Deal %d", i)
			record["contact"] = fmt.Sprintf("Contact %d", i)
			record["company"] = fmt.Sprintf("Company %d", i)
			record["amount"] = 1000 + (i * 1000)
			record["stage"] = stages[i%len(stages)]
			record["closeDate"] = time.Now().AddDate(0, 0, i).Format("2006-01-02T15:04:05Z")
			record["createdAt"] = time.Now().AddDate(0, 0, -i).Format("2006-01-02T15:04:05Z")
		}

		data[i-1] = record
	}

	return data
}

func applyFilters(data []map[string]interface{}, filters []FilterConfig) []map[string]interface{} {
	if len(filters) == 0 {
		return data
	}

	filtered := make([]map[string]interface{}, 0)

	for _, record := range data {
		match := true
		for _, filter := range filters {
			value := record[filter.Field]

			switch filter.Operator {
			case "equals":
				if value != filter.Value {
					match = false
				}
			case "not_equals":
				if value == filter.Value {
					match = false
				}
			case "contains":
				if !strings.Contains(strings.ToLower(fmt.Sprintf("%v", value)), strings.ToLower(fmt.Sprintf("%v", filter.Value))) {
					match = false
				}
			case "not_contains":
				if strings.Contains(strings.ToLower(fmt.Sprintf("%v", value)), strings.ToLower(fmt.Sprintf("%v", filter.Value))) {
					match = false
				}
			case "starts_with":
				if !strings.HasPrefix(strings.ToLower(fmt.Sprintf("%v", value)), strings.ToLower(fmt.Sprintf("%v", filter.Value))) {
					match = false
				}
			case "ends_with":
				if !strings.HasSuffix(strings.ToLower(fmt.Sprintf("%v", value)), strings.ToLower(fmt.Sprintf("%v", filter.Value))) {
					match = false
				}
			case "greater_than":
				if fmt.Sprintf("%v", value) <= fmt.Sprintf("%v", filter.Value) {
					match = false
				}
			case "less_than":
				if fmt.Sprintf("%v", value) >= fmt.Sprintf("%v", filter.Value) {
					match = false
				}
			case "is_null":
				if value != nil && value != "" {
					match = false
				}
			case "is_not_null":
				if value == nil || value == "" {
					match = false
				}
			}

			if !match {
				break
			}
		}

		if match {
			filtered = append(filtered, record)
		}
	}

	return filtered
}

func applySearch(data []map[string]interface{}, search string) []map[string]interface{} {
	if search == "" {
		return data
	}

	searchLower := strings.ToLower(search)
	filtered := make([]map[string]interface{}, 0)

	for _, record := range data {
		match := false
		for _, value := range record {
			if strings.Contains(strings.ToLower(fmt.Sprintf("%v", value)), searchLower) {
				match = true
				break
			}
		}

		if match {
			filtered = append(filtered, record)
		}
	}

	return filtered
}

func applySort(data []map[string]interface{}, sort SortConfig) []map[string]interface{} {
	if sort.Field == "" {
		return data
	}

	// Simple bubble sort for demonstration
	sorted := make([]map[string]interface{}, len(data))
	copy(sorted, data)

	for i := 0; i < len(sorted)-1; i++ {
		for j := 0; j < len(sorted)-i-1; j++ {
			val1 := fmt.Sprintf("%v", sorted[j][sort.Field])
			val2 := fmt.Sprintf("%v", sorted[j+1][sort.Field])

			shouldSwap := false
			if sort.Direction == "asc" {
				shouldSwap = val1 > val2
			} else {
				shouldSwap = val1 < val2
			}

			if shouldSwap {
				sorted[j], sorted[j+1] = sorted[j+1], sorted[j]
			}
		}
	}

	return sorted
}

func selectFields(data []map[string]interface{}, fields []string) []map[string]interface{} {
	selected := make([]map[string]interface{}, len(data))

	for i, record := range data {
		selectedRecord := make(map[string]interface{})
		selectedRecord["id"] = record["id"] // Always include ID

		for _, field := range fields {
			if value, exists := record[field]; exists {
				selectedRecord[field] = value
			}
		}

		selected[i] = selectedRecord
	}

	return selected
}
