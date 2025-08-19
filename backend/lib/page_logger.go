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
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Path         string                 `json:"path"`
	Method       string                 `json:"method"`
	Version      string                 `json:"version"`
	LastModified time.Time              `json:"lastModified"`
	Checksum     string                 `json:"checksum"`
	Dependencies []string               `json:"dependencies"`
	Features     []string               `json:"features"`
	Status       string                 `json:"status"` // "active", "deprecated", "development"
	Metadata     map[string]interface{} `json:"metadata"`
}

// PageLog represents a page/endpoint access log
type PageLog struct {
	Timestamp    time.Time              `json:"timestamp"`
	Action       string                 `json:"action"` // "access", "error", "version_change"
	PageID       string                 `json:"pageId"`
	PageName     string                 `json:"pageName"`
	PagePath     string                 `json:"pagePath"`
	Method       string                 `json:"method"`
	Version      string                 `json:"version"`
	PreviousVersion string              `json:"previousVersion,omitempty"`
	UserAgent    string                 `json:"userAgent,omitempty"`
	SessionID    string                 `json:"sessionId,omitempty"`
	IPAddress    string                 `json:"ipAddress,omitempty"`
	Performance  *PerformanceMetrics    `json:"performance,omitempty"`
	Errors       []string               `json:"errors,omitempty"`
	Details      map[string]interface{} `json:"details,omitempty"`
}

// PerformanceMetrics represents performance data
type PerformanceMetrics struct {
	ResponseTime int64 `json:"responseTime"` // in milliseconds
	RequestSize  int64 `json:"requestSize"`  // in bytes
	ResponseSize int64 `json:"responseSize"` // in bytes
	StatusCode   int   `json:"statusCode"`
}

// RestartReport represents a comprehensive restart report
type RestartReport struct {
	ActivePages      []PageVersion `json:"activePages"`
	DeprecatedPages  []PageVersion `json:"deprecatedPages"`
	RecentActivity   []PageLog     `json:"recentActivity"`
	Recommendations  []string      `json:"recommendations"`
	GeneratedAt      time.Time     `json:"generatedAt"`
}

// PageLogger manages page version tracking and logging
type PageLogger struct {
	pageVersions map[string]PageVersion
	pageLogs     []PageLog
	maxLogs      int
	mutex        sync.RWMutex
	logFile      string
}

// NewPageLogger creates a new page logger instance
func NewPageLogger(logFile string) *PageLogger {
	pl := &PageLogger{
		pageVersions: make(map[string]PageVersion),
		pageLogs:     make([]PageLog, 0),
		maxLogs:      1000,
		logFile:      logFile,
	}
	
	// Load existing data
	pl.loadPersistedData()
	
	return pl
}

// RegisterPage registers a new page version
func (pl *PageLogger) RegisterPage(page PageVersion) {
	pl.mutex.Lock()
	defer pl.mutex.Unlock()
	
	page.LastModified = time.Now()
	pl.pageVersions[page.ID] = page
	
	// Log the registration
	pl.LogPageAction("version_change", PageLog{
		PageID:       page.ID,
		PageName:     page.Name,
		PagePath:     page.Path,
		Method:       page.Method,
		Version:      page.Version,
		Details: map[string]interface{}{
			"action":   "register",
			"features": page.Features,
		},
	})
	
	pl.persistPageVersions()
}

// LogPageAction logs a page action
func (pl *PageLogger) LogPageAction(action string, logEntry PageLog) {
	pl.mutex.Lock()
	defer pl.mutex.Unlock()
	
	logEntry.Timestamp = time.Now()
	logEntry.Action = action
	
	pl.pageLogs = append(pl.pageLogs, logEntry)
	
	// Keep only the last maxLogs entries
	if len(pl.pageLogs) > pl.maxLogs {
		pl.pageLogs = pl.pageLogs[len(pl.pageLogs)-pl.maxLogs:]
	}
	
	pl.persistPageLogs()
	
	// Log to console in development
	if os.Getenv("ENV") == "development" {
		log.Printf("[PAGE_LOGGER] %s: %s (v%s) - %s", 
			action, logEntry.PageName, logEntry.Version, logEntry.PagePath)
	}
}

// GetPageVersions returns all page versions
func (pl *PageLogger) GetPageVersions() []PageVersion {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	versions := make([]PageVersion, 0, len(pl.pageVersions))
	for _, version := range pl.pageVersions {
		versions = append(versions, version)
	}
	return versions
}

// GetPageVersion returns a specific page version
func (pl *PageLogger) GetPageVersion(pageID string) (PageVersion, bool) {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	version, exists := pl.pageVersions[pageID]
	return version, exists
}

// GetPageVersionByPath returns a page version by path and method
func (pl *PageLogger) GetPageVersionByPath(path, method string) (PageVersion, bool) {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	for _, version := range pl.pageVersions {
		if version.Path == path && version.Method == method {
			return version, true
		}
	}
	return PageVersion{}, false
}

// GetRecentLogs returns recent page logs
func (pl *PageLogger) GetRecentLogs(limit int) []PageLog {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	if limit > len(pl.pageLogs) {
		limit = len(pl.pageLogs)
	}
	
	start := len(pl.pageLogs) - limit
	return pl.pageLogs[start:]
}

// GetPageLogs returns logs for a specific page
func (pl *PageLogger) GetPageLogs(pageID string, limit int) []PageLog {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	var pageLogs []PageLog
	for _, logEntry := range pl.pageLogs {
		if logEntry.PageID == pageID {
			pageLogs = append(pageLogs, logEntry)
		}
	}
	
	if limit > len(pageLogs) {
		limit = len(pageLogs)
	}
	
	start := len(pageLogs) - limit
	return pageLogs[start:]
}

// GetActivePages returns all active pages
func (pl *PageLogger) GetActivePages() []PageVersion {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	var activePages []PageVersion
	for _, page := range pl.pageVersions {
		if page.Status == "active" {
			activePages = append(activePages, page)
		}
	}
	return activePages
}

// GetDeprecatedPages returns all deprecated pages
func (pl *PageLogger) GetDeprecatedPages() []PageVersion {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	var deprecatedPages []PageVersion
	for _, page := range pl.pageVersions {
		if page.Status == "deprecated" {
			deprecatedPages = append(deprecatedPages, page)
		}
	}
	return deprecatedPages
}

// DeprecatePage marks a page as deprecated
func (pl *PageLogger) DeprecatePage(pageID, reason string) {
	pl.mutex.Lock()
	defer pl.mutex.Unlock()
	
	if page, exists := pl.pageVersions[pageID]; exists {
		page.Status = "deprecated"
		if page.Metadata == nil {
			page.Metadata = make(map[string]interface{})
		}
		page.Metadata["deprecationReason"] = reason
		page.Metadata["deprecatedAt"] = time.Now()
		pl.pageVersions[pageID] = page
		
		pl.LogPageAction("version_change", PageLog{
			PageID:   pageID,
			PageName: page.Name,
			PagePath: page.Path,
			Method:   page.Method,
			Version:  page.Version,
			Details: map[string]interface{}{
				"action": "deprecate",
				"reason": reason,
			},
		})
		
		pl.persistPageVersions()
	}
}

// GenerateRestartReport generates a comprehensive restart report
func (pl *PageLogger) GenerateRestartReport() RestartReport {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	activePages := pl.GetActivePages()
	deprecatedPages := pl.GetDeprecatedPages()
	recentActivity := pl.GetRecentLogs(20)
	
	var recommendations []string
	
	// Check for pages with recent errors
	pagesWithErrors := 0
	for _, logEntry := range recentActivity {
		if len(logEntry.Errors) > 0 {
			pagesWithErrors++
		}
	}
	if pagesWithErrors > 0 {
		recommendations = append(recommendations, 
			fmt.Sprintf("Found %d pages with recent errors. Review before restart.", pagesWithErrors))
	}
	
	// Check for deprecated pages that are still being accessed
	deprecatedPageIDs := make(map[string]bool)
	for _, page := range deprecatedPages {
		deprecatedPageIDs[page.ID] = true
	}
	
	deprecatedPageAccess := 0
	for _, logEntry := range recentActivity {
		if deprecatedPageIDs[logEntry.PageID] {
			deprecatedPageAccess++
		}
	}
	if deprecatedPageAccess > 0 {
		recommendations = append(recommendations, 
			fmt.Sprintf("Found %d accesses to deprecated pages. Consider migration.", deprecatedPageAccess))
	}
	
	// Check for performance issues
	slowPages := 0
	for _, logEntry := range recentActivity {
		if logEntry.Performance != nil && logEntry.Performance.ResponseTime > 3000 {
			slowPages++
		}
	}
	if slowPages > 0 {
		recommendations = append(recommendations, 
			fmt.Sprintf("Found %d pages with response times > 3s. Consider optimization.", slowPages))
	}
	
	return RestartReport{
		ActivePages:     activePages,
		DeprecatedPages: deprecatedPages,
		RecentActivity:  recentActivity,
		Recommendations: recommendations,
		GeneratedAt:     time.Now(),
	}
}

// ExportData exports all data for backup
func (pl *PageLogger) ExportData() ([]byte, error) {
	pl.mutex.RLock()
	defer pl.mutex.RUnlock()
	
	data := map[string]interface{}{
		"pageVersions":    pl.pageVersions,
		"pageLogs":        pl.pageLogs,
		"exportTimestamp": time.Now(),
	}
	
	return json.MarshalIndent(data, "", "  ")
}

// ClearLogs clears all page logs
func (pl *PageLogger) ClearLogs() {
	pl.mutex.Lock()
	defer pl.mutex.Unlock()
	
	pl.pageLogs = make([]PageLog, 0)
	pl.persistPageLogs()
}

// ClearAll clears all page versions and logs
func (pl *PageLogger) ClearAll() {
	pl.mutex.Lock()
	defer pl.mutex.Unlock()
	
	pl.pageVersions = make(map[string]PageVersion)
	pl.pageLogs = make([]PageLog, 0)
	pl.persistPageVersions()
	pl.persistPageLogs()
}

// persistPageVersions saves page versions to file
func (pl *PageLogger) persistPageVersions() {
	data, err := json.MarshalIndent(pl.pageVersions, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal page versions: %v", err)
		return
	}
	
	versionsFile := pl.logFile + ".versions"
	err = os.WriteFile(versionsFile, data, 0644)
	if err != nil {
		log.Printf("Failed to persist page versions: %v", err)
	}
}

// persistPageLogs saves page logs to file
func (pl *PageLogger) persistPageLogs() {
	data, err := json.MarshalIndent(pl.pageLogs, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal page logs: %v", err)
		return
	}
	
	logsFile := pl.logFile + ".logs"
	err = os.WriteFile(logsFile, data, 0644)
	if err != nil {
		log.Printf("Failed to persist page logs: %v", err)
	}
}

// loadPersistedData loads page versions and logs from files
func (pl *PageLogger) loadPersistedData() {
	// Load page versions
	versionsFile := pl.logFile + ".versions"
	if data, err := os.ReadFile(versionsFile); err == nil {
		var versions map[string]PageVersion
		if err := json.Unmarshal(data, &versions); err == nil {
			pl.pageVersions = versions
		} else {
			log.Printf("Failed to unmarshal page versions: %v", err)
		}
	}
	
	// Load page logs
	logsFile := pl.logFile + ".logs"
	if data, err := os.ReadFile(logsFile); err == nil {
		var logs []PageLog
		if err := json.Unmarshal(data, &logs); err == nil {
			pl.pageLogs = logs
		} else {
			log.Printf("Failed to unmarshal page logs: %v", err)
		}
	}
}

// GenerateChecksum generates a simple checksum for a string
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

// Global page logger instance
var GlobalPageLogger *PageLogger

// InitPageLogger initializes the global page logger
func InitPageLogger() {
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err != nil {
		log.Printf("Failed to create logs directory: %v", err)
	}
	
	logFile := filepath.Join(logDir, "page-logger")
	GlobalPageLogger = NewPageLogger(logFile)
	
	log.Println("Page logger initialized")
}
