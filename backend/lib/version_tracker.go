package lib

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// PageVersion represents a page/endpoint version
type PageVersion struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Path         string   `json:"path"`
	Method       string   `json:"method"`
	Version      string   `json:"version"`
	LastModified time.Time `json:"lastModified"`
	Checksum     string   `json:"checksum"`
	Dependencies []string `json:"dependencies"`
	Features     []string `json:"features"`
	Status       string   `json:"status"` // "active", "deprecated", "development"
}

// DatabaseVersion represents a database version
type DatabaseVersion struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Version         string    `json:"version"`
	LastModified    time.Time `json:"lastModified"`
	MigrationVersion string   `json:"migrationVersion,omitempty"`
	SchemaHash      string    `json:"schemaHash,omitempty"`
	Status          string    `json:"status"` // "active", "migrating", "error"
}

// VersionSnapshot represents a snapshot of all versions
type VersionSnapshot struct {
	Timestamp string           `json:"timestamp"`
	Pages     []PageVersion    `json:"pages"`
	Database  []DatabaseVersion `json:"database"`
	Environment string         `json:"environment"`
	Notes     string           `json:"notes,omitempty"`
}

// RestartReport represents a restart planning report
type RestartReport struct {
	ActivePages      []PageVersion    `json:"activePages"`
	DeprecatedPages  []PageVersion    `json:"deprecatedPages"`
	ActiveDatabases  []DatabaseVersion `json:"activeDatabases"`
	Recommendations  []string         `json:"recommendations"`
	LastSnapshot     *VersionSnapshot `json:"lastSnapshot,omitempty"`
	GeneratedAt      time.Time        `json:"generatedAt"`
}

// VersionTracker manages version tracking
type VersionTracker struct {
	pageVersions    map[string]PageVersion
	databaseVersions map[string]DatabaseVersion
	snapshots       []VersionSnapshot
	maxSnapshots    int
	mutex           sync.RWMutex
	logFile         string
}

// NewVersionTracker creates a new version tracker
func NewVersionTracker(logFile string) *VersionTracker {
	vt := &VersionTracker{
		pageVersions:     make(map[string]PageVersion),
		databaseVersions: make(map[string]DatabaseVersion),
		snapshots:        make([]VersionSnapshot, 0),
		maxSnapshots:     50,
		logFile:          logFile,
	}
	
	vt.loadPersistedData()
	return vt
}

// RegisterPage registers a page version
func (vt *VersionTracker) RegisterPage(page PageVersion) {
	vt.mutex.Lock()
	defer vt.mutex.Unlock()
	
	page.LastModified = time.Now()
	vt.pageVersions[page.ID] = page
	vt.persistData()
}

// RegisterDatabase registers a database version
func (vt *VersionTracker) RegisterDatabase(db DatabaseVersion) {
	vt.mutex.Lock()
	defer vt.mutex.Unlock()
	
	db.LastModified = time.Now()
	vt.databaseVersions[db.ID] = db
	vt.persistData()
}

// DeprecatePage marks a page as deprecated
func (vt *VersionTracker) DeprecatePage(pageID string) {
	vt.mutex.Lock()
	defer vt.mutex.Unlock()
	
	if page, exists := vt.pageVersions[pageID]; exists {
		page.Status = "deprecated"
		vt.pageVersions[pageID] = page
		vt.persistData()
	}
}

// MarkDatabaseMigrating marks a database as migrating
func (vt *VersionTracker) MarkDatabaseMigrating(dbID string) {
	vt.mutex.Lock()
	defer vt.mutex.Unlock()
	
	if db, exists := vt.databaseVersions[dbID]; exists {
		db.Status = "migrating"
		vt.databaseVersions[dbID] = db
		vt.persistData()
	}
}

// CreateSnapshot creates a version snapshot
func (vt *VersionTracker) CreateSnapshot(environment, notes string) {
	vt.mutex.Lock()
	defer vt.mutex.Unlock()
	
	snapshot := VersionSnapshot{
		Timestamp:   time.Now().Format(time.RFC3339),
		Pages:       vt.getAllPages(),
		Database:    vt.getAllDatabases(),
		Environment: environment,
		Notes:       notes,
	}
	
	vt.snapshots = append(vt.snapshots, snapshot)
	
	// Keep only the last maxSnapshots
	if len(vt.snapshots) > vt.maxSnapshots {
		vt.snapshots = vt.snapshots[len(vt.snapshots)-vt.maxSnapshots:]
	}
	
	vt.persistData()
}

// GetActivePages returns all active pages
func (vt *VersionTracker) GetActivePages() []PageVersion {
	vt.mutex.RLock()
	defer vt.mutex.RUnlock()
	
	var activePages []PageVersion
	for _, page := range vt.pageVersions {
		if page.Status == "active" {
			activePages = append(activePages, page)
		}
	}
	return activePages
}

// GetActiveDatabases returns all active databases
func (vt *VersionTracker) GetActiveDatabases() []DatabaseVersion {
	vt.mutex.RLock()
	defer vt.mutex.RUnlock()
	
	var activeDatabases []DatabaseVersion
	for _, db := range vt.databaseVersions {
		if db.Status == "active" {
			activeDatabases = append(activeDatabases, db)
		}
	}
	return activeDatabases
}

// GetDeprecatedPages returns all deprecated pages
func (vt *VersionTracker) GetDeprecatedPages() []PageVersion {
	vt.mutex.RLock()
	defer vt.mutex.RUnlock()
	
	var deprecatedPages []PageVersion
	for _, page := range vt.pageVersions {
		if page.Status == "deprecated" {
			deprecatedPages = append(deprecatedPages, page)
		}
	}
	return deprecatedPages
}

// GetRecentSnapshots returns recent snapshots
func (vt *VersionTracker) GetRecentSnapshots(limit int) []VersionSnapshot {
	vt.mutex.RLock()
	defer vt.mutex.RUnlock()
	
	if limit > len(vt.snapshots) {
		limit = len(vt.snapshots)
	}
	
	start := len(vt.snapshots) - limit
	return vt.snapshots[start:]
}

// GenerateRestartReport generates a restart planning report
func (vt *VersionTracker) GenerateRestartReport() RestartReport {
	vt.mutex.RLock()
	defer vt.mutex.RUnlock()
	
	activePages := vt.GetActivePages()
	deprecatedPages := vt.GetDeprecatedPages()
	activeDatabases := vt.GetActiveDatabases()
	
	var lastSnapshot *VersionSnapshot
	if len(vt.snapshots) > 0 {
		lastSnapshot = &vt.snapshots[len(vt.snapshots)-1]
	}
	
	var recommendations []string
	
	// Check for deprecated pages
	if len(deprecatedPages) > 0 {
		recommendations = append(recommendations, 
			fmt.Sprintf("Found %d deprecated pages. Consider removing or updating them.", len(deprecatedPages)))
	}
	
	// Check for migrating databases
	var migratingDbs []DatabaseVersion
	for _, db := range vt.databaseVersions {
		if db.Status == "migrating" {
			migratingDbs = append(migratingDbs, db)
		}
	}
	if len(migratingDbs) > 0 {
		recommendations = append(recommendations, 
			fmt.Sprintf("Found %d databases in migration state. Complete migrations before restart.", len(migratingDbs)))
	}
	
	// Check for databases with errors
	var errorDbs []DatabaseVersion
	for _, db := range vt.databaseVersions {
		if db.Status == "error" {
			errorDbs = append(errorDbs, db)
		}
	}
	if len(errorDbs) > 0 {
		recommendations = append(recommendations, 
			fmt.Sprintf("Found %d databases with errors. Resolve issues before restart.", len(errorDbs)))
	}
	
	return RestartReport{
		ActivePages:     activePages,
		DeprecatedPages: deprecatedPages,
		ActiveDatabases: activeDatabases,
		Recommendations: recommendations,
		LastSnapshot:    lastSnapshot,
		GeneratedAt:     time.Now(),
	}
}

// ExportData exports all data
func (vt *VersionTracker) ExportData() ([]byte, error) {
	vt.mutex.RLock()
	defer vt.mutex.RUnlock()
	
	data := map[string]interface{}{
		"pageVersions":     vt.pageVersions,
		"databaseVersions": vt.databaseVersions,
		"snapshots":        vt.snapshots,
		"exportTimestamp":  time.Now(),
	}
	
	return json.MarshalIndent(data, "", "  ")
}

// ClearAll clears all data
func (vt *VersionTracker) ClearAll() {
	vt.mutex.Lock()
	defer vt.mutex.Unlock()
	
	vt.pageVersions = make(map[string]PageVersion)
	vt.databaseVersions = make(map[string]DatabaseVersion)
	vt.snapshots = make([]VersionSnapshot, 0)
	vt.persistData()
}

// Helper methods
func (vt *VersionTracker) getAllPages() []PageVersion {
	pages := make([]PageVersion, 0, len(vt.pageVersions))
	for _, page := range vt.pageVersions {
		pages = append(pages, page)
	}
	return pages
}

func (vt *VersionTracker) getAllDatabases() []DatabaseVersion {
	databases := make([]DatabaseVersion, 0, len(vt.databaseVersions))
	for _, db := range vt.databaseVersions {
		databases = append(databases, db)
	}
	return databases
}

// Persistence methods
func (vt *VersionTracker) persistData() {
	data := map[string]interface{}{
		"pageVersions":     vt.pageVersions,
		"databaseVersions": vt.databaseVersions,
		"snapshots":        vt.snapshots,
	}
	
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal version data: %v", err)
		return
	}
	
	filePath := vt.logFile + ".versions"
	err = os.WriteFile(filePath, jsonData, 0644)
	if err != nil {
		log.Printf("Failed to persist version data: %v", err)
	}
}

func (vt *VersionTracker) loadPersistedData() {
	filePath := vt.logFile + ".versions"
	if data, err := os.ReadFile(filePath); err == nil {
		var fileData map[string]interface{}
		if err := json.Unmarshal(data, &fileData); err == nil {
			// Load page versions
			if pageVersionsData, ok := fileData["pageVersions"].(map[string]interface{}); ok {
				for id, pageData := range pageVersionsData {
					if pageBytes, err := json.Marshal(pageData); err == nil {
						var page PageVersion
						if err := json.Unmarshal(pageBytes, &page); err == nil {
							vt.pageVersions[id] = page
						}
					}
				}
			}
			
			// Load database versions
			if dbVersionsData, ok := fileData["databaseVersions"].(map[string]interface{}); ok {
				for id, dbData := range dbVersionsData {
					if dbBytes, err := json.Marshal(dbData); err == nil {
						var db DatabaseVersion
						if err := json.Unmarshal(dbBytes, &db); err == nil {
							vt.databaseVersions[id] = db
						}
					}
				}
			}
			
			// Load snapshots
			if snapshotsData, ok := fileData["snapshots"].([]interface{}); ok {
				for _, snapshotData := range snapshotsData {
					if snapshotBytes, err := json.Marshal(snapshotData); err == nil {
						var snapshot VersionSnapshot
						if err := json.Unmarshal(snapshotBytes, &snapshot); err == nil {
							vt.snapshots = append(vt.snapshots, snapshot)
						}
					}
				}
			}
		}
	}
}

// GenerateChecksum generates a simple checksum
func GenerateChecksum(str string) string {
	hash := 0
	if len(str) == 0 {
		return fmt.Sprintf("%d", hash)
	}
	
	for _, char := range str {
		hash = ((hash << 5) - hash) + int(char)
		hash = hash & hash // Convert to 32-bit integer
	}
	
	return fmt.Sprintf("%x", hash)
}

// Global version tracker instance
var GlobalVersionTracker *VersionTracker

// InitVersionTracker initializes the global version tracker
func InitVersionTracker() {
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		log.Printf("Failed to create logs directory: %v", err)
	}
	
	logFile := filepath.Join(logDir, "version-tracker")
	GlobalVersionTracker = NewVersionTracker(logFile)
	
	log.Println("Version tracker initialized")
}
