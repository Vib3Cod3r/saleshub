#!/bin/bash

# SalesHub CRM Health Check Script
# Validates environment and dependencies before server startup

set -e

# Configuration
SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$SERVER_DIR/logs"
HEALTH_LOG="$LOG_DIR/health-check.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Logging functions
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$HEALTH_LOG"
}

log_info() {
    log_message "INFO" "$1"
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    log_message "WARN" "$1"
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    log_message "ERROR" "$1"
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    log_message "DEBUG" "$1"
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Check if Go is installed and accessible
check_go() {
    log_debug "Checking Go installation..."
    if command -v go >/dev/null 2>&1; then
        local version=$(go version | awk '{print $3}')
        log_info "Go is installed: $version"
        return 0
    else
        log_error "Go is not installed or not in PATH"
        return 1
    fi
}

# Check if PostgreSQL is running
check_postgresql() {
    log_debug "Checking PostgreSQL connection..."
    
    local host="${DB_HOST:-localhost}"
    local port="${DB_PORT:-5432}"
    local db="${DB_NAME:-sales_crm}"
    local user="${DB_USER:-postgres}"
    local password="${DB_PASSWORD:-Miyako2020}"
    
    # Try to connect to PostgreSQL
    if PGPASSWORD="$password" psql -h "$host" -p "$port" -U "$user" -d "$db" -c "SELECT 1;" >/dev/null 2>&1; then
        log_info "PostgreSQL connection successful"
        return 0
    else
        log_error "Cannot connect to PostgreSQL at $host:$port"
        log_error "Please ensure PostgreSQL is running and accessible"
        return 1
    fi
}

# Check if required ports are available
check_ports() {
    log_debug "Checking port availability..."
    
    local port="${PORT:-8089}"
    
    if netstat -tuln | grep -q ":$port "; then
        log_error "Port $port is already in use"
        return 1
    else
        log_info "Port $port is available"
        return 0
    fi
}

# Check if required directories exist
check_directories() {
    log_debug "Checking required directories..."
    
    local required_dirs=(
        "$SERVER_DIR/cmd"
        "$SERVER_DIR/config"
        "$SERVER_DIR/handlers"
        "$SERVER_DIR/middleware"
        "$SERVER_DIR/models"
        "$LOG_DIR"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            log_debug "Directory exists: $dir"
        else
            log_error "Required directory missing: $dir"
            return 1
        fi
    done
    
    log_info "All required directories exist"
    return 0
}

# Check if required files exist
check_files() {
    log_debug "Checking required files..."
    
    local required_files=(
        "$SERVER_DIR/cmd/server/main.go"
        "$SERVER_DIR/go.mod"
        "$SERVER_DIR/go.sum"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_debug "File exists: $file"
        else
            log_error "Required file missing: $file"
            return 1
        fi
    done
    
    log_info "All required files exist"
    return 0
}

# Check environment variables
check_environment() {
    log_debug "Checking environment variables..."
    
    local required_vars=(
        "DB_HOST"
        "DB_PORT"
        "DB_NAME"
        "DB_USER"
        "DB_PASSWORD"
        "JWT_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_info "All required environment variables are set"
        return 0
    else
        log_warn "Missing environment variables: ${missing_vars[*]}"
        log_warn "Using default values where available"
        return 0
    fi
}

# Check disk space
check_disk_space() {
    log_debug "Checking disk space..."
    
    local min_space=1000000  # 1GB in KB
    local available_space=$(df "$SERVER_DIR" | awk 'NR==2 {print $4}')
    
    if [ "$available_space" -gt "$min_space" ]; then
        log_info "Sufficient disk space available: $((available_space / 1024))MB"
        return 0
    else
        log_warn "Low disk space: $((available_space / 1024))MB available"
        return 0  # Don't fail, just warn
    fi
}

# Check memory availability
check_memory() {
    log_debug "Checking memory availability..."
    
    local min_memory=500000  # 500MB in KB
    local available_memory=$(free | awk 'NR==2 {print $7}')
    
    if [ "$available_memory" -gt "$min_memory" ]; then
        log_info "Sufficient memory available: $((available_memory / 1024))MB"
        return 0
    else
        log_warn "Low memory: $((available_memory / 1024))MB available"
        return 0  # Don't fail, just warn
    fi
}

# Main health check function
main() {
    log_info "Starting health check for SalesHub CRM server..."
    
    local checks=(
        "check_go"
        "check_directories"
        "check_files"
        "check_environment"
        "check_ports"
        "check_postgresql"
        "check_disk_space"
        "check_memory"
    )
    
    local failed_checks=0
    
    for check in "${checks[@]}"; do
        if $check; then
            log_debug "Health check passed: $check"
        else
            log_error "Health check failed: $check"
            failed_checks=$((failed_checks + 1))
        fi
    done
    
    if [ $failed_checks -eq 0 ]; then
        log_info "All health checks passed. Server is ready to start."
        exit 0
    else
        log_error "Health check failed with $failed_checks error(s). Server cannot start."
        exit 1
    fi
}

# Run health check
main "$@"
