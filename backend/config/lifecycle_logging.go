package config

import (
	"log"
	"os"
	"time"
	"fmt"
	"sync"
)

// LifecycleLogConfig holds configuration for lifecycle event logging
type LifecycleLogConfig struct {
	LogFile            string
	LogLevel           string
	EnableFileLogging  bool
	EnableConsoleLogging bool
	MaxFileSize        int64 // in bytes
	MaxBackups         int
	MaxAge             int // in days
}

// DefaultLifecycleLogConfig returns default lifecycle logging configuration
func DefaultLifecycleLogConfig() *LifecycleLogConfig {
	return &LifecycleLogConfig{
		LogFile:            "lifecycle.log",
		LogLevel:           "INFO",
		EnableFileLogging:  true,
		EnableConsoleLogging: true,
		MaxFileSize:        10 * 1024 * 1024, // 10MB
		MaxBackups:         5,
		MaxAge:             30, // 30 days
	}
}

var (
	lifecycleLogger *log.Logger
	logFile         *os.File
	logMutex        sync.Mutex
)

// SetupLifecycleLogging configures lifecycle event logging
func SetupLifecycleLogging(config *LifecycleLogConfig) error {
	logMutex.Lock()
	defer logMutex.Unlock()

	// Create log file if enabled
	if config.EnableFileLogging && config.LogFile != "" {
		file, err := os.OpenFile(config.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err != nil {
			return fmt.Errorf("failed to open lifecycle log file: %v", err)
		}
		logFile = file
		
		// Create multi-writer for both file and console if both enabled
		if config.EnableConsoleLogging {
			lifecycleLogger = log.New(os.Stdout, "", log.LstdFlags)
		} else {
			lifecycleLogger = log.New(file, "", log.LstdFlags)
		}
	} else if config.EnableConsoleLogging {
		lifecycleLogger = log.New(os.Stdout, "", log.LstdFlags)
	} else {
		return fmt.Errorf("at least one logging destination must be enabled")
	}

	LogLifecycleEvent("LIFECYCLE_CONFIG", "Lifecycle logging configured", map[string]interface{}{
		"log_file":             config.LogFile,
		"log_level":            config.LogLevel,
		"enable_file_logging":  config.EnableFileLogging,
		"enable_console_logging": config.EnableConsoleLogging,
		"max_file_size":        config.MaxFileSize,
		"max_backups":          config.MaxBackups,
		"max_age":              config.MaxAge,
	})

	return nil
}

// LogLifecycleEvent logs a lifecycle event with structured format
func LogLifecycleEvent(eventType, message string, metadata map[string]interface{}) {
	logMutex.Lock()
	defer logMutex.Unlock()

	if lifecycleLogger == nil {
		// Fallback to standard logger if lifecycle logger not initialized
		log.Printf("[LIFECYCLE-%s] %s | Metadata: %+v", eventType, message, metadata)
		return
	}

	timestamp := time.Now().Format(time.RFC3339)

	lifecycleLogger.Printf("[LIFECYCLE-%s] %s | %s | Metadata: %+v", 
		eventType, timestamp, message, metadata)
}

// LogServerStart logs server startup event
func LogServerStart(port string, env string, additionalInfo map[string]interface{}) {
	metadata := map[string]interface{}{
		"port": port,
		"environment": env,
		"pid": os.Getpid(),
		"hostname": getHostname(),
	}

	// Merge additional info
	for k, v := range additionalInfo {
		metadata[k] = v
	}

	LogLifecycleEvent("SERVER_START", "SalesHub CRM API server starting", metadata)
}

// LogServerStarted logs successful server startup
func LogServerStarted(port string, startupTime time.Duration) {
	LogLifecycleEvent("SERVER_STARTED", "SalesHub CRM API server started successfully", map[string]interface{}{
		"port": port,
		"startup_time_ms": startupTime.Milliseconds(),
		"status": "running",
	})
}

// LogServerShutdown logs server shutdown event
func LogServerShutdown(reason string, uptime time.Duration) {
	LogLifecycleEvent("SERVER_SHUTDOWN", "SalesHub CRM API server shutting down", map[string]interface{}{
		"reason": reason,
		"uptime_seconds": int(uptime.Seconds()),
		"status": "shutting_down",
	})
}

// LogServerRestart logs server restart event
func LogServerRestart(reason string, uptime time.Duration) {
	LogLifecycleEvent("SERVER_RESTART", "SalesHub CRM API server restarting", map[string]interface{}{
		"reason": reason,
		"uptime_seconds": int(uptime.Seconds()),
		"status": "restarting",
	})
}

// LogDatabaseStart logs database startup event
func LogDatabaseStart(databaseType, host, port, database string) {
	LogLifecycleEvent("DATABASE_START", "Database connection established", map[string]interface{}{
		"database_type": databaseType,
		"host": host,
		"port": port,
		"database": database,
		"status": "connected",
	})
}

// LogDatabaseShutdown logs database shutdown event
func LogDatabaseShutdown(reason string) {
	LogLifecycleEvent("DATABASE_SHUTDOWN", "Database connection closed", map[string]interface{}{
		"reason": reason,
		"status": "disconnected",
	})
}

// LogApplicationError logs application errors during lifecycle
func LogApplicationError(component, operation string, err error, metadata map[string]interface{}) {
	if metadata == nil {
		metadata = make(map[string]interface{})
	}
	metadata["component"] = component
	metadata["operation"] = operation
	metadata["error"] = err.Error()

	LogLifecycleEvent("APPLICATION_ERROR", "Application error occurred", metadata)
}

// LogHealthCheck logs health check events
func LogHealthCheck(status string, responseTime time.Duration, details map[string]interface{}) {
	if details == nil {
		details = make(map[string]interface{})
	}
	details["status"] = status
	details["response_time_ms"] = responseTime.Milliseconds()

	LogLifecycleEvent("HEALTH_CHECK", "Health check performed", details)
}

// CloseLifecycleLogging closes the lifecycle logging file
func CloseLifecycleLogging() {
	logMutex.Lock()
	defer logMutex.Unlock()

	if logFile != nil {
		LogLifecycleEvent("LIFECYCLE_SHUTDOWN", "Lifecycle logging shutting down", map[string]interface{}{
			"status": "closing",
		})
		
		logFile.Close()
		logFile = nil
	}
}

// getHostname returns the hostname of the current machine
func getHostname() string {
	hostname, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return hostname
}

// RotateLogFile rotates the log file if it exceeds the maximum size
func RotateLogFile(config *LifecycleLogConfig) error {
	if logFile == nil || config.LogFile == "" {
		return nil
	}

	// Check file size
	fileInfo, err := logFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to get log file info: %v", err)
	}

	if fileInfo.Size() < config.MaxFileSize {
		return nil
	}

	// Close current file
	logFile.Close()

	// Rotate file
	backupName := fmt.Sprintf("%s.%s", config.LogFile, time.Now().Format("2006-01-02-15-04-05"))
	err = os.Rename(config.LogFile, backupName)
	if err != nil {
		return fmt.Errorf("failed to rotate log file: %v", err)
	}

	// Open new file
	file, err := os.OpenFile(config.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return fmt.Errorf("failed to open new log file: %v", err)
	}

	logFile = file
	if config.EnableConsoleLogging {
		lifecycleLogger = log.New(os.Stdout, "", log.LstdFlags)
	} else {
		lifecycleLogger = log.New(file, "", log.LstdFlags)
	}

	LogLifecycleEvent("LOG_ROTATION", "Log file rotated", map[string]interface{}{
		"backup_file": backupName,
		"new_file": config.LogFile,
	})

	return nil
}
