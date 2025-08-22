#!/bin/bash

# Database Performance Optimization Script for 20K Scale
# This script runs the performance optimization migration

set -e

echo "🚀 Starting database performance optimization for 20K scale..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to log messages
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    error "Please run this script from the project root directory"
    exit 1
fi

# Check if database is running
log "Checking database connection..."
if ! docker-compose ps postgres | grep -q "Up"; then
    error "PostgreSQL database is not running. Please start it first:"
    echo "  docker-compose up -d postgres"
    exit 1
fi

# Wait for database to be ready
log "Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U postgres -d sales_crm; do
    sleep 2
done

# Run the performance optimization migration
log "Running performance optimization migration..."
cd backend
go run cmd/migrate/performance_optimization.go

if [ $? -eq 0 ]; then
    log "✅ Performance optimization completed successfully!"
    log ""
    log "📊 Database is now optimized for 20K contacts and 20K companies"
    log "�� Added indexes for:"
    log "   • Contact name searches and company relationships"
    log "   • Company name searches and industry filtering"
    log "   • Polymorphic contact info queries"
    log "   • Custom field queries"
    log "   • Activity and audit logs"
    log ""
    log "⚡ Performance improvements:"
    log "   • Faster contact and company searches"
    log "   • Optimized pagination queries"
    log "   • Better multi-tenant data isolation"
    log "   • Improved connection pooling (20 idle, 200 max)"
    log ""
    log "🔧 Scalability features:"
    log "   • Extensible field system for adding new fields"
    log "   • Optimized query patterns"
    log "   • Performance monitoring"
    log "   • Full-text search capabilities"
else
    error "❌ Performance optimization failed!"
    exit 1
fi

echo ""
log "🎯 Your database is now ready to handle 20,000 contacts and 20,000 companies efficiently!"
