#!/bin/bash

# SalesHub CRM Server Manager - Lean Version
set -e

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$SERVER_DIR/server.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

is_running() {
    [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
    if is_running; then
        warn "Server already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi
    
    cd "$SERVER_DIR"
    nohup go run cmd/server/main.go > /dev/null 2>&1 &
    echo $! > "$PID_FILE"
    log "Server started (PID: $!)"
}

stop() {
    if ! is_running; then
        warn "Server not running"
        return 0
    fi
    
    local pid=$(cat "$PID_FILE")
    kill -TERM "$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null
    rm -f "$PID_FILE"
    log "Server stopped"
}

restart() {
    stop
    sleep 1
    start
}

status() {
    if is_running; then
        log "Server running (PID: $(cat "$PID_FILE"))"
    else
        log "Server stopped"
    fi
}

case "${1:-}" in
    start) start ;;
    stop) stop ;;
    restart) restart ;;
    status) status ;;
    *) echo "Usage: $0 {start|stop|restart|status}"; exit 1 ;;
esac
