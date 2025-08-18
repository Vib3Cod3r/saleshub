#!/bin/bash

# SalesHub CRM Server Manager
# Handles server lifecycle operations with comprehensive logging

set -e

# Configuration
SERVER_NAME="saleshub-crm"
SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$SERVER_DIR/server.pid"
LOG_DIR="$SERVER_DIR/logs"
LIFECYCLE_LOG="$LOG_DIR/lifecycle.log"
SERVER_LOG="$LOG_DIR/server.log"
LOCK_FILE="$SERVER_DIR/server.lock"

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
    echo "[$timestamp] [$level] $message" | tee -a "$LIFECYCLE_LOG"
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

# Check if server is running
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            # PID file exists but process is dead
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Get server status
get_server_status() {
    if is_server_running; then
        local pid=$(cat "$PID_FILE")
        local uptime=$(ps -o etime= -p "$pid" 2>/dev/null || echo "unknown")
        echo "running"
        log_info "Server status: running (PID: $pid, Uptime: $uptime)"
    else
        echo "stopped"
        log_info "Server status: stopped"
    fi
}

# Start server
start_server() {
    log_info "Starting $SERVER_NAME server..."
    
    if is_server_running; then
        log_warn "Server is already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi
    
    # Check for lock file
    if [ -f "$LOCK_FILE" ]; then
        log_error "Server lock file exists. Another operation may be in progress."
        return 1
    fi
    
    # Create lock file
    touch "$LOCK_FILE"
    
    # Change to server directory
    cd "$SERVER_DIR"
    
    # Start server in background
    log_debug "Executing: go run cmd/server/main.go"
    nohup go run cmd/server/main.go > "$SERVER_LOG" 2>&1 &
    local pid=$!
    
    # Save PID
    echo "$pid" > "$PID_FILE"
    
    # Wait a moment to check if server started successfully
    sleep 2
    
    if kill -0 "$pid" 2>/dev/null; then
        log_info "Server started successfully (PID: $pid)"
        log_info "Server logs: $SERVER_LOG"
        log_info "Lifecycle logs: $LIFECYCLE_LOG"
        
        # Remove lock file
        rm -f "$LOCK_FILE"
        return 0
    else
        log_error "Failed to start server"
        rm -f "$PID_FILE"
        rm -f "$LOCK_FILE"
        return 1
    fi
}

# Stop server
stop_server() {
    log_info "Stopping $SERVER_NAME server..."
    
    if ! is_server_running; then
        log_warn "Server is not running"
        return 0
    fi
    
    local pid=$(cat "$PID_FILE")
    
    # Try graceful shutdown first
    log_debug "Sending SIGTERM to PID: $pid"
    kill -TERM "$pid"
    
    # Wait for graceful shutdown (30 seconds)
    local count=0
    while [ $count -lt 30 ]; do
        if ! kill -0 "$pid" 2>/dev/null; then
            log_info "Server stopped gracefully"
            rm -f "$PID_FILE"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    
    # Force kill if still running
    log_warn "Server did not stop gracefully, forcing shutdown"
    kill -KILL "$pid" 2>/dev/null || true
    
    # Wait a moment and check
    sleep 2
    if ! kill -0 "$pid" 2>/dev/null; then
        log_info "Server stopped forcefully"
        rm -f "$PID_FILE"
        return 0
    else
        log_error "Failed to stop server"
        return 1
    fi
}

# Restart server
restart_server() {
    log_info "Restarting $SERVER_NAME server..."
    
    # Stop server
    if is_server_running; then
        stop_server
        sleep 2
    fi
    
    # Start server
    start_server
}

# Show server logs
show_logs() {
    local log_type="${1:-server}"
    local lines="${2:-50}"
    
    case "$log_type" in
        "server")
            if [ -f "$SERVER_LOG" ]; then
                log_info "Showing last $lines lines of server log:"
                tail -n "$lines" "$SERVER_LOG"
            else
                log_error "Server log file not found: $SERVER_LOG"
            fi
            ;;
        "lifecycle")
            if [ -f "$LIFECYCLE_LOG" ]; then
                log_info "Showing last $lines lines of lifecycle log:"
                tail -n "$lines" "$LIFECYCLE_LOG"
            else
                log_error "Lifecycle log file not found: $LIFECYCLE_LOG"
            fi
            ;;
        *)
            log_error "Invalid log type: $log_type (use 'server' or 'lifecycle')"
            return 1
            ;;
    esac
}

# Monitor server
monitor_server() {
    log_info "Starting server monitoring..."
    
    while true; do
        if ! is_server_running; then
            log_warn "Server is not running, attempting restart..."
            start_server
            sleep 5
        else
            log_debug "Server is running normally"
            sleep 30
        fi
    done
}

# Clean up old logs
cleanup_logs() {
    local days="${1:-7}"
    log_info "Cleaning up logs older than $days days..."
    
    find "$LOG_DIR" -name "*.log.*" -mtime +$days -delete 2>/dev/null || true
    log_info "Log cleanup completed"
}

# Show usage
show_usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|monitor|cleanup}"
    echo ""
    echo "Commands:"
    echo "  start     - Start the server"
    echo "  stop      - Stop the server gracefully"
    echo "  restart   - Restart the server"
    echo "  status    - Show server status"
    echo "  logs      - Show server logs (default: server, optional: lifecycle)"
    echo "  monitor   - Monitor server and restart if needed"
    echo "  cleanup   - Clean up old log files (default: 7 days)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs lifecycle 100"
    echo "  $0 cleanup 30"
}

# Main script logic
case "${1:-}" in
    "start")
        start_server
        ;;
    "stop")
        stop_server
        ;;
    "restart")
        restart_server
        ;;
    "status")
        get_server_status
        ;;
    "logs")
        show_logs "$2" "$3"
        ;;
    "monitor")
        monitor_server
        ;;
    "cleanup")
        cleanup_logs "$2"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
