package lib

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// RegistryDependency represents a dependency between components
type RegistryDependency struct {
	ID            string `json:"id"`
	Type          string `json:"type"` // "page", "database", "api", "component"
	Version       string `json:"version"`
	Required      bool   `json:"required"`
	Compatibility string `json:"compatibility"` // "exact", "minimum", "range"
	MinVersion    string `json:"minVersion,omitempty"`
	MaxVersion    string `json:"maxVersion,omitempty"`
}

// RegistryPage represents a page/component version in the registry
type RegistryPage struct {
	ID                  string                 `json:"id"`
	Name                string                 `json:"name"`
	Path                string                 `json:"path"`
	Version             string                 `json:"version"`
	LastModified        time.Time              `json:"lastModified"`
	Checksum            string                 `json:"checksum"`
	Dependencies        []RegistryDependency   `json:"dependencies"`
	Features            []string               `json:"features"`
	Status              string                 `json:"status"` // "active", "deprecated", "development", "error"
	Metadata            map[string]interface{} `json:"metadata"`
	CompatibilityMatrix map[string][]string    `json:"compatibilityMatrix"`
}

// RegistryMigration represents a database migration
type RegistryMigration struct {
	ID             string `json:"id"`
	Version        string `json:"version"`
	AppliedAt      string `json:"appliedAt"`
	Checksum       string `json:"checksum"`
	Status         string `json:"status"` // "applied", "pending", "failed", "rolled_back"
	Description    string `json:"description"`
	RollbackScript string `json:"rollbackScript,omitempty"`
}

// RegistryDatabase represents a database version in the registry
type RegistryDatabase struct {
	ID               string                 `json:"id"`
	Name             string                 `json:"name"`
	Version          string                 `json:"version"`
	LastModified     time.Time              `json:"lastModified"`
	MigrationVersion string                 `json:"migrationVersion"`
	SchemaHash       string                 `json:"schemaHash"`
	Status           string                 `json:"status"` // "active", "migrating", "error", "rollback"
	SchemaDefinition map[string]interface{} `json:"schemaDefinition"`
	MigrationHistory []RegistryMigration    `json:"migrationHistory"`
	Dependencies     []RegistryDependency   `json:"dependencies"`
	Metadata         map[string]interface{} `json:"metadata"`
}

// RegistryAPI represents an API endpoint version
type RegistryAPI struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Path         string                 `json:"path"`
	Method       string                 `json:"method"`
	Version      string                 `json:"version"`
	LastModified time.Time              `json:"lastModified"`
	Checksum     string                 `json:"checksum"`
	Dependencies []RegistryDependency   `json:"dependencies"`
	Status       string                 `json:"status"` // "active", "deprecated", "development"
	Metadata     map[string]interface{} `json:"metadata"`
}

// RegistrySnapshot represents a snapshot of all versions
type RegistrySnapshot struct {
	ID               string             `json:"id"`
	Timestamp        string             `json:"timestamp"`
	Environment      string             `json:"environment"`
	Pages            []RegistryPage     `json:"pages"`
	Databases        []RegistryDatabase `json:"databases"`
	APIs             []RegistryAPI      `json:"apis"`
	Notes            string             `json:"notes,omitempty"`
	Checksum         string             `json:"checksum"`
	Status           string             `json:"status"` // "valid", "invalid", "partial"
	ValidationErrors []string           `json:"validationErrors"`
}

// RegistryCompatibility represents compatibility between components
type RegistryCompatibility struct {
	SourceID        string   `json:"sourceId"`
	SourceType      string   `json:"sourceType"`
	TargetID        string   `json:"targetId"`
	TargetType      string   `json:"targetType"`
	Compatibility   string   `json:"compatibility"` // "compatible", "incompatible", "unknown"
	RequiredVersion string   `json:"requiredVersion,omitempty"`
	TestedVersions  []string `json:"testedVersions"`
	LastTested      string   `json:"lastTested"`
}

// RegistryValidation represents startup validation results
type RegistryValidation struct {
	IsValid                bool               `json:"isValid"`
	Errors                 []string           `json:"errors"`
	Warnings               []string           `json:"warnings"`
	Recommendations        []string           `json:"recommendations"`
	IncompatibleComponents []string           `json:"incompatibleComponents"`
	MissingDependencies    []string           `json:"missingDependencies"`
	VersionMismatches      []RegistryMismatch `json:"versionMismatches"`
}

// RegistryMismatch represents a version mismatch
type RegistryMismatch struct {
	Component string `json:"component"`
	Expected  string `json:"expected"`
	Actual    string `json:"actual"`
	Severity  string `json:"severity"` // "critical", "warning", "info"
}

// VersionRegistry manages version tracking
type VersionRegistry struct {
	pageVersions        map[string]RegistryPage
	databaseVersions    map[string]RegistryDatabase
	apiVersions         map[string]RegistryAPI
	snapshots           []RegistrySnapshot
	compatibilityMatrix map[string]RegistryCompatibility
	maxSnapshots        int
	registryVersion     string
	mutex               sync.RWMutex
	logFile             string
}

// NewVersionRegistry creates a new version registry
func NewVersionRegistry(logFile string) *VersionRegistry {
	vr := &VersionRegistry{
		pageVersions:        make(map[string]RegistryPage),
		databaseVersions:    make(map[string]RegistryDatabase),
		apiVersions:         make(map[string]RegistryAPI),
		snapshots:           make([]RegistrySnapshot, 0),
		compatibilityMatrix: make(map[string]RegistryCompatibility),
		maxSnapshots:        100,
		registryVersion:     "2.0.0",
		logFile:             logFile,
	}

	vr.loadPersistedData()
	vr.validateRegistryIntegrity()
	return vr
}

// RegisterPage registers a page version
func (vr *VersionRegistry) RegisterPage(page RegistryPage) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	page.LastModified = time.Now()
	if page.Metadata == nil {
		page.Metadata = make(map[string]interface{})
	}
	if page.CompatibilityMatrix == nil {
		page.CompatibilityMatrix = make(map[string][]string)
	}

	vr.pageVersions[page.ID] = page
	vr.updateCompatibilityMatrix(page)
	vr.persistData()
}

// RegisterDatabase registers a database version
func (vr *VersionRegistry) RegisterDatabase(db RegistryDatabase) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	db.LastModified = time.Now()
	if db.MigrationHistory == nil {
		db.MigrationHistory = make([]RegistryMigration, 0)
	}
	if db.Dependencies == nil {
		db.Dependencies = make([]RegistryDependency, 0)
	}
	if db.Metadata == nil {
		db.Metadata = make(map[string]interface{})
	}

	vr.databaseVersions[db.ID] = db
	vr.updateCompatibilityMatrix(db)
	vr.persistData()
}

// RegisterAPI registers an API version
func (vr *VersionRegistry) RegisterAPI(api RegistryAPI) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	api.LastModified = time.Now()
	if api.Dependencies == nil {
		api.Dependencies = make([]RegistryDependency, 0)
	}
	if api.Metadata == nil {
		api.Metadata = make(map[string]interface{})
	}

	vr.apiVersions[api.ID] = api
	vr.updateCompatibilityMatrix(api)
	vr.persistData()
}

// UpdatePageVersion updates a page version
func (vr *VersionRegistry) UpdatePageVersion(pageID string, updates map[string]interface{}) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	if page, exists := vr.pageVersions[pageID]; exists {
		// Apply updates
		if version, ok := updates["version"].(string); ok {
			page.Version = version
		}
		if status, ok := updates["status"].(string); ok {
			page.Status = status
		}
		if features, ok := updates["features"].([]string); ok {
			page.Features = features
		}

		page.LastModified = time.Now()
		vr.pageVersions[pageID] = page
		vr.updateCompatibilityMatrix(page)
		vr.persistData()
	}
}

// UpdateDatabaseVersion updates a database version
func (vr *VersionRegistry) UpdateDatabaseVersion(dbID string, updates map[string]interface{}) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	if db, exists := vr.databaseVersions[dbID]; exists {
		// Apply updates
		if version, ok := updates["version"].(string); ok {
			db.Version = version
		}
		if status, ok := updates["status"].(string); ok {
			db.Status = status
		}
		if migrationVersion, ok := updates["migrationVersion"].(string); ok {
			db.MigrationVersion = migrationVersion
		}
		if schemaHash, ok := updates["schemaHash"].(string); ok {
			db.SchemaHash = schemaHash
		}

		db.LastModified = time.Now()
		vr.databaseVersions[dbID] = db
		vr.updateCompatibilityMatrix(db)
		vr.persistData()
	}
}

// AddMigrationRecord adds a migration record to a database
func (vr *VersionRegistry) AddMigrationRecord(dbID string, migration RegistryMigration) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	if db, exists := vr.databaseVersions[dbID]; exists {
		db.MigrationHistory = append(db.MigrationHistory, migration)
		vr.databaseVersions[dbID] = db
		vr.persistData()
	}
}

// UpdateMigrationStatus updates a migration status
func (vr *VersionRegistry) UpdateMigrationStatus(dbID, migrationID, status string) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	if db, exists := vr.databaseVersions[dbID]; exists {
		for i, migration := range db.MigrationHistory {
			if migration.ID == migrationID {
				db.MigrationHistory[i].Status = status
				vr.databaseVersions[dbID] = db
				vr.persistData()
				break
			}
		}
	}
}

// CreateSnapshot creates a version snapshot
func (vr *VersionRegistry) CreateSnapshot(environment, notes string) RegistrySnapshot {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	snapshot := RegistrySnapshot{
		ID:               fmt.Sprintf("snapshot_%d", time.Now().Unix()),
		Timestamp:        time.Now().Format(time.RFC3339),
		Environment:      environment,
		Pages:            vr.getAllPages(),
		Databases:        vr.getAllDatabases(),
		APIs:             vr.getAllAPIs(),
		Notes:            notes,
		Checksum:         vr.generateSnapshotChecksum(),
		Status:           "valid",
		ValidationErrors: make([]string, 0),
	}

	// Validate snapshot
	validation := vr.validateSnapshot(snapshot)
	if validation.isValid {
		snapshot.Status = "valid"
	} else {
		snapshot.Status = "invalid"
	}
	snapshot.ValidationErrors = validation.errors

	vr.snapshots = append(vr.snapshots, snapshot)

	// Keep only the last maxSnapshots
	if len(vr.snapshots) > vr.maxSnapshots {
		vr.snapshots = vr.snapshots[len(vr.snapshots)-vr.maxSnapshots:]
	}

	vr.persistData()
	return snapshot
}

// ValidateStartup validates the startup state
func (vr *VersionRegistry) ValidateStartup() RegistryValidation {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	validation := RegistryValidation{
		IsValid:                true,
		Errors:                 make([]string, 0),
		Warnings:               make([]string, 0),
		Recommendations:        make([]string, 0),
		IncompatibleComponents: make([]string, 0),
		MissingDependencies:    make([]string, 0),
		VersionMismatches:      make([]RegistryMismatch, 0),
	}

	// Check for deprecated components
	deprecatedCount := 0
	for _, page := range vr.pageVersions {
		if page.Status == "deprecated" {
			deprecatedCount++
		}
	}
	for _, db := range vr.databaseVersions {
		if db.Status == "deprecated" {
			deprecatedCount++
		}
	}
	for _, api := range vr.apiVersions {
		if api.Status == "deprecated" {
			deprecatedCount++
		}
	}
	if deprecatedCount > 0 {
		validation.Warnings = append(validation.Warnings,
			fmt.Sprintf("Found %d deprecated components", deprecatedCount))
		validation.Recommendations = append(validation.Recommendations,
			"Consider updating or removing deprecated components")
	}

	// Check for components in error state
	errorCount := 0
	for _, page := range vr.pageVersions {
		if page.Status == "error" {
			errorCount++
		}
	}
	for _, db := range vr.databaseVersions {
		if db.Status == "error" {
			errorCount++
		}
	}
	for _, api := range vr.apiVersions {
		if api.Status == "error" {
			errorCount++
		}
	}
	if errorCount > 0 {
		validation.Errors = append(validation.Errors,
			fmt.Sprintf("Found %d components in error state", errorCount))
		validation.IsValid = false
	}

	// Check for migrating databases
	migratingCount := 0
	for _, db := range vr.databaseVersions {
		if db.Status == "migrating" {
			migratingCount++
		}
	}
	if migratingCount > 0 {
		validation.Warnings = append(validation.Warnings,
			fmt.Sprintf("Found %d databases in migration state", migratingCount))
		validation.Recommendations = append(validation.Recommendations,
			"Complete database migrations before startup")
	}

	return validation
}

// GetActivePages returns all active pages
func (vr *VersionRegistry) GetActivePages() []RegistryPage {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	var activePages []RegistryPage
	for _, page := range vr.pageVersions {
		if page.Status == "active" {
			activePages = append(activePages, page)
		}
	}
	return activePages
}

// GetActiveDatabases returns all active databases
func (vr *VersionRegistry) GetActiveDatabases() []RegistryDatabase {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	var activeDatabases []RegistryDatabase
	for _, db := range vr.databaseVersions {
		if db.Status == "active" {
			activeDatabases = append(activeDatabases, db)
		}
	}
	return activeDatabases
}

// GetActiveAPIs returns all active APIs
func (vr *VersionRegistry) GetActiveAPIs() []RegistryAPI {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	var activeAPIs []RegistryAPI
	for _, api := range vr.apiVersions {
		if api.Status == "active" {
			activeAPIs = append(activeAPIs, api)
		}
	}
	return activeAPIs
}

// GetDeprecatedComponents returns all deprecated components
func (vr *VersionRegistry) GetDeprecatedComponents() []interface{} {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	var deprecated []interface{}
	for _, page := range vr.pageVersions {
		if page.Status == "deprecated" {
			deprecated = append(deprecated, page)
		}
	}
	for _, db := range vr.databaseVersions {
		if db.Status == "deprecated" {
			deprecated = append(deprecated, db)
		}
	}
	for _, api := range vr.apiVersions {
		if api.Status == "deprecated" {
			deprecated = append(deprecated, api)
		}
	}
	return deprecated
}

// GetRecentSnapshots returns recent snapshots
func (vr *VersionRegistry) GetRecentSnapshots(limit int) []RegistrySnapshot {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	if limit > len(vr.snapshots) {
		limit = len(vr.snapshots)
	}

	start := len(vr.snapshots) - limit
	return vr.snapshots[start:]
}

// GetComponentByID returns a component by ID
func (vr *VersionRegistry) GetComponentByID(id string) interface{} {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	if page, exists := vr.pageVersions[id]; exists {
		return page
	}
	if db, exists := vr.databaseVersions[id]; exists {
		return db
	}
	if api, exists := vr.apiVersions[id]; exists {
		return api
	}
	return nil
}

// GetCompatibilityMatrix returns the compatibility matrix
func (vr *VersionRegistry) GetCompatibilityMatrix() []RegistryCompatibility {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	var matrix []RegistryCompatibility
	for _, compatibility := range vr.compatibilityMatrix {
		matrix = append(matrix, compatibility)
	}
	return matrix
}

// ExportRegistry exports all registry data
func (vr *VersionRegistry) ExportRegistry() ([]byte, error) {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	data := map[string]interface{}{
		"registryVersion":     vr.registryVersion,
		"pageVersions":        vr.pageVersions,
		"databaseVersions":    vr.databaseVersions,
		"apiVersions":         vr.apiVersions,
		"snapshots":           vr.snapshots,
		"compatibilityMatrix": vr.compatibilityMatrix,
		"exportTimestamp":     time.Now(),
	}

	return json.MarshalIndent(data, "", "  ")
}

// ImportRegistry imports registry data
func (vr *VersionRegistry) ImportRegistry(data []byte) error {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	var imported map[string]interface{}
	if err := json.Unmarshal(data, &imported); err != nil {
		return fmt.Errorf("invalid registry data format: %v", err)
	}

	// Validate registry version compatibility
	if version, ok := imported["registryVersion"].(string); ok {
		if version != vr.registryVersion {
			log.Printf("Warning: Registry version mismatch: expected %s, got %s", vr.registryVersion, version)
		}
	}

	// Import data
	if pageVersions, ok := imported["pageVersions"].(map[string]interface{}); ok {
		for id, pageData := range pageVersions {
			if pageBytes, err := json.Marshal(pageData); err == nil {
				var page RegistryPage
				if err := json.Unmarshal(pageBytes, &page); err == nil {
					vr.pageVersions[id] = page
				}
			}
		}
	}

	if dbVersions, ok := imported["databaseVersions"].(map[string]interface{}); ok {
		for id, dbData := range dbVersions {
			if dbBytes, err := json.Marshal(dbData); err == nil {
				var db RegistryDatabase
				if err := json.Unmarshal(dbBytes, &db); err == nil {
					vr.databaseVersions[id] = db
				}
			}
		}
	}

	if apiVersions, ok := imported["apiVersions"].(map[string]interface{}); ok {
		for id, apiData := range apiVersions {
			if apiBytes, err := json.Marshal(apiData); err == nil {
				var api RegistryAPI
				if err := json.Unmarshal(apiBytes, &api); err == nil {
					vr.apiVersions[id] = api
				}
			}
		}
	}

	if snapshots, ok := imported["snapshots"].([]interface{}); ok {
		for _, snapshotData := range snapshots {
			if snapshotBytes, err := json.Marshal(snapshotData); err == nil {
				var snapshot RegistrySnapshot
				if err := json.Unmarshal(snapshotBytes, &snapshot); err == nil {
					vr.snapshots = append(vr.snapshots, snapshot)
				}
			}
		}
	}

	if matrix, ok := imported["compatibilityMatrix"].(map[string]interface{}); ok {
		for key, compatData := range matrix {
			if compatBytes, err := json.Marshal(compatData); err == nil {
				var compatibility RegistryCompatibility
				if err := json.Unmarshal(compatBytes, &compatibility); err == nil {
					vr.compatibilityMatrix[key] = compatibility
				}
			}
		}
	}

	vr.validateRegistryIntegrity()
	vr.persistData()
	return nil
}

// ClearAll clears all registry data
func (vr *VersionRegistry) ClearAll() {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	vr.pageVersions = make(map[string]RegistryPage)
	vr.databaseVersions = make(map[string]RegistryDatabase)
	vr.apiVersions = make(map[string]RegistryAPI)
	vr.snapshots = make([]RegistrySnapshot, 0)
	vr.compatibilityMatrix = make(map[string]RegistryCompatibility)
	vr.persistData()
}

// GetRegistryStats returns registry statistics
func (vr *VersionRegistry) GetRegistryStats() map[string]interface{} {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	activeCount := 0
	deprecatedCount := 0
	errorCount := 0

	for _, page := range vr.pageVersions {
		switch page.Status {
		case "active":
			activeCount++
		case "deprecated":
			deprecatedCount++
		case "error":
			errorCount++
		}
	}

	for _, db := range vr.databaseVersions {
		switch db.Status {
		case "active":
			activeCount++
		case "deprecated":
			deprecatedCount++
		case "error":
			errorCount++
		}
	}

	for _, api := range vr.apiVersions {
		switch api.Status {
		case "active":
			activeCount++
		case "deprecated":
			deprecatedCount++
		case "error":
			errorCount++
		}
	}

	return map[string]interface{}{
		"totalPages":           len(vr.pageVersions),
		"totalDatabases":       len(vr.databaseVersions),
		"totalAPIs":            len(vr.apiVersions),
		"totalSnapshots":       len(vr.snapshots),
		"activeComponents":     activeCount,
		"deprecatedComponents": deprecatedCount,
		"errorComponents":      errorCount,
	}
}

// Helper methods
func (vr *VersionRegistry) getAllPages() []RegistryPage {
	pages := make([]RegistryPage, 0, len(vr.pageVersions))
	for _, page := range vr.pageVersions {
		pages = append(pages, page)
	}
	return pages
}

func (vr *VersionRegistry) getAllDatabases() []RegistryDatabase {
	databases := make([]RegistryDatabase, 0, len(vr.databaseVersions))
	for _, db := range vr.databaseVersions {
		databases = append(databases, db)
	}
	return databases
}

func (vr *VersionRegistry) getAllAPIs() []RegistryAPI {
	apis := make([]RegistryAPI, 0, len(vr.apiVersions))
	for _, api := range vr.apiVersions {
		apis = append(apis, api)
	}
	return apis
}

func (vr *VersionRegistry) updateCompatibilityMatrix(component interface{}) {
	// Update compatibility matrix for this component
	// This is a simplified implementation
}

func (vr *VersionRegistry) validateSnapshot(snapshot RegistrySnapshot) struct {
	isValid bool
	errors  []string
} {
	errors := make([]string, 0)

	// Check for missing components
	allComponentIDs := make(map[string]bool)
	for _, page := range snapshot.Pages {
		allComponentIDs[page.ID] = true
	}
	for _, db := range snapshot.Databases {
		allComponentIDs[db.ID] = true
	}
	for _, api := range snapshot.APIs {
		allComponentIDs[api.ID] = true
	}

	// Validate dependencies
	for _, page := range snapshot.Pages {
		for _, dep := range page.Dependencies {
			if !allComponentIDs[dep.ID] {
				errors = append(errors, fmt.Sprintf("Missing dependency: %s -> %s", page.ID, dep.ID))
			}
		}
	}

	for _, db := range snapshot.Databases {
		for _, dep := range db.Dependencies {
			if !allComponentIDs[dep.ID] {
				errors = append(errors, fmt.Sprintf("Missing dependency: %s -> %s", db.ID, dep.ID))
			}
		}
	}

	for _, api := range snapshot.APIs {
		for _, dep := range api.Dependencies {
			if !allComponentIDs[dep.ID] {
				errors = append(errors, fmt.Sprintf("Missing dependency: %s -> %s", api.ID, dep.ID))
			}
		}
	}

	return struct {
		isValid bool
		errors  []string
	}{
		isValid: len(errors) == 0,
		errors:  errors,
	}
}

func (vr *VersionRegistry) generateSnapshotChecksum() string {
	data := fmt.Sprintf("%d", time.Now().Unix())
	hash := sha256.Sum256([]byte(data))
	return hex.EncodeToString(hash[:8])
}

func (vr *VersionRegistry) validateRegistryIntegrity() {
	// Check for orphaned compatibility entries
	allComponentIDs := make(map[string]bool)
	for id := range vr.pageVersions {
		allComponentIDs[id] = true
	}
	for id := range vr.databaseVersions {
		allComponentIDs[id] = true
	}
	for id := range vr.apiVersions {
		allComponentIDs[id] = true
	}

	orphanedEntries := make([]string, 0)
	for key, compatibility := range vr.compatibilityMatrix {
		if !allComponentIDs[compatibility.SourceID] || !allComponentIDs[compatibility.TargetID] {
			orphanedEntries = append(orphanedEntries, key)
		}
	}

	// Clean up orphaned entries
	for _, key := range orphanedEntries {
		delete(vr.compatibilityMatrix, key)
	}
}

// Persistence methods
func (vr *VersionRegistry) persistData() {
	data := map[string]interface{}{
		"registryVersion":     vr.registryVersion,
		"pageVersions":        vr.pageVersions,
		"databaseVersions":    vr.databaseVersions,
		"apiVersions":         vr.apiVersions,
		"snapshots":           vr.snapshots,
		"compatibilityMatrix": vr.compatibilityMatrix,
	}

	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal version registry data: %v", err)
		return
	}

	filePath := vr.logFile + ".registry"
	err = os.WriteFile(filePath, jsonData, 0644)
	if err != nil {
		log.Printf("Failed to persist version registry data: %v", err)
	}
}

func (vr *VersionRegistry) loadPersistedData() {
	filePath := vr.logFile + ".registry"
	if data, err := os.ReadFile(filePath); err == nil {
		var fileData map[string]interface{}
		if err := json.Unmarshal(data, &fileData); err == nil {
			// Load page versions
			if pageVersionsData, ok := fileData["pageVersions"].(map[string]interface{}); ok {
				for id, pageData := range pageVersionsData {
					if pageBytes, err := json.Marshal(pageData); err == nil {
						var page RegistryPage
						if err := json.Unmarshal(pageBytes, &page); err == nil {
							vr.pageVersions[id] = page
						}
					}
				}
			}

			// Load database versions
			if dbVersionsData, ok := fileData["databaseVersions"].(map[string]interface{}); ok {
				for id, dbData := range dbVersionsData {
					if dbBytes, err := json.Marshal(dbData); err == nil {
						var db RegistryDatabase
						if err := json.Unmarshal(dbBytes, &db); err == nil {
							vr.databaseVersions[id] = db
						}
					}
				}
			}

			// Load API versions
			if apiVersionsData, ok := fileData["apiVersions"].(map[string]interface{}); ok {
				for id, apiData := range apiVersionsData {
					if apiBytes, err := json.Marshal(apiData); err == nil {
						var api RegistryAPI
						if err := json.Unmarshal(apiBytes, &api); err == nil {
							vr.apiVersions[id] = api
						}
					}
				}
			}

			// Load snapshots
			if snapshotsData, ok := fileData["snapshots"].([]interface{}); ok {
				for _, snapshotData := range snapshotsData {
					if snapshotBytes, err := json.Marshal(snapshotData); err == nil {
						var snapshot RegistrySnapshot
						if err := json.Unmarshal(snapshotBytes, &snapshot); err == nil {
							vr.snapshots = append(vr.snapshots, snapshot)
						}
					}
				}
			}

			// Load compatibility matrix
			if matrixData, ok := fileData["compatibilityMatrix"].(map[string]interface{}); ok {
				for key, compatData := range matrixData {
					if compatBytes, err := json.Marshal(compatData); err == nil {
						var compatibility RegistryCompatibility
						if err := json.Unmarshal(compatBytes, &compatibility); err == nil {
							vr.compatibilityMatrix[key] = compatibility
						}
					}
				}
			}
		}
	}
}

// Global version registry instance
var GlobalVersionRegistry *VersionRegistry

// InitVersionRegistry initializes the global version registry
func InitVersionRegistry() {
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		log.Printf("Failed to create logs directory: %v", err)
	}

	logFile := filepath.Join(logDir, "version-registry")
	GlobalVersionRegistry = NewVersionRegistry(logFile)

	log.Println("Version registry initialized")
}
