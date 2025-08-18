#!/bin/bash

# Restart Planning Script for Sales CRM
# This script analyzes page logging data and generates a restart checklist

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
LOGS_DIR="logs"
OUTPUT_DIR="restart-analysis"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}=== Sales CRM Restart Planning Analysis ===${NC}"
echo ""

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $1"
        return 1
    fi
}

# Function to analyze frontend logs
analyze_frontend_logs() {
    echo -e "${BLUE}Analyzing Frontend Logs...${NC}"
    
    # Check for localStorage data (this would be in browser)
    echo "Frontend logs are stored in browser localStorage."
    echo "Please check the Page Version Manager in the browser for detailed analysis."
    echo ""
}

# Function to analyze backend logs
analyze_backend_logs() {
    echo -e "${BLUE}Analyzing Backend Logs...${NC}"
    
    local page_logger_file="$BACKEND_DIR/logs/page-logger.versions"
    local page_logs_file="$BACKEND_DIR/logs/page-logger.logs"
    
    if check_file "$page_logger_file"; then
        echo -e "${GREEN}Found page versions file${NC}"
        local version_count=$(jq 'length' "$page_logger_file" 2>/dev/null || echo "0")
        echo "  - Active page versions: $version_count"
    fi
    
    if check_file "$page_logs_file"; then
        echo -e "${GREEN}Found page logs file${NC}"
        local log_count=$(jq 'length' "$page_logs_file" 2>/dev/null || echo "0")
        echo "  - Total log entries: $log_count"
        
        # Analyze recent errors
        local error_count=$(jq '[.[] | select(.action == "error")] | length' "$page_logs_file" 2>/dev/null || echo "0")
        if [ "$error_count" -gt 0 ]; then
            echo -e "${YELLOW}  - Recent errors: $error_count${NC}"
        fi
        
        # Analyze performance issues
        local slow_count=$(jq '[.[] | select(.performance.responseTime > 3000)] | length' "$page_logs_file" 2>/dev/null || echo "0")
        if [ "$slow_count" -gt 0 ]; then
            echo -e "${YELLOW}  - Slow responses (>3s): $slow_count${NC}"
        fi
    fi
    
    echo ""
}

# Function to check system status
check_system_status() {
    echo -e "${BLUE}Checking System Status...${NC}"
    
    # Check if frontend is running
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Frontend is running on port 3000"
    else
        echo -e "${RED}✗${NC} Frontend is not running on port 3000"
    fi
    
    # Check if backend is running
    if curl -s http://localhost:8089 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is running on port 8089"
    else
        echo -e "${RED}✗${NC} Backend is not running on port 8089"
    fi
    
    # Check if database is accessible
    if docker ps | grep -q postgres; then
        echo -e "${GREEN}✓${NC} PostgreSQL container is running"
    else
        echo -e "${RED}✗${NC} PostgreSQL container is not running"
    fi
    
    echo ""
}

# Function to generate restart checklist
generate_restart_checklist() {
    echo -e "${BLUE}Generating Restart Checklist...${NC}"
    
    local checklist_file="$OUTPUT_DIR/restart-checklist.md"
    
    cat > "$checklist_file" << EOF
# Restart Checklist - $(date)

## Pre-Restart Tasks

### 1. Data Backup
- [ ] Export page version data from Page Version Manager
- [ ] Backup database (if needed)
- [ ] Save current configuration files

### 2. System Analysis
- [ ] Review active pages and their versions
- [ ] Check for deprecated pages that need migration
- [ ] Identify pages with recent errors
- [ ] Note performance issues

### 3. Dependencies
- [ ] Verify all required services are documented
- [ ] Check external API dependencies
- [ ] Confirm environment variables are set

## Restart Process

### 1. Stop Services
- [ ] Stop frontend development server
- [ ] Stop backend server
- [ ] Stop PostgreSQL container (if using Docker)

### 2. Update Code (if needed)
- [ ] Pull latest code changes
- [ ] Update dependencies
- [ ] Run database migrations

### 3. Start Services
- [ ] Start PostgreSQL container
- [ ] Start backend server
- [ ] Start frontend development server

### 4. Verification
- [ ] Check all active pages are accessible
- [ ] Verify API endpoints are responding
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check performance metrics

## Post-Restart Monitoring

### 1. Immediate Checks (First 5 minutes)
- [ ] All pages load without errors
- [ ] API responses are normal
- [ ] Database connections are stable

### 2. Extended Monitoring (First hour)
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user sessions work
- [ ] Test data operations

### 3. Long-term Monitoring (24 hours)
- [ ] Review page version logs
- [ ] Analyze performance trends
- [ ] Check for new errors
- [ ] Validate all features work

## Rollback Plan

If issues occur:
1. Stop all services
2. Restore from backup (if needed)
3. Revert to previous code version
4. Restart with previous configuration

## Notes

- Generated on: $(date)
- Analysis based on page logging data
- Check Page Version Manager for detailed insights

EOF

    echo -e "${GREEN}✓${NC} Restart checklist generated: $checklist_file"
    echo ""
}

# Function to generate system report
generate_system_report() {
    echo -e "${BLUE}Generating System Report...${NC}"
    
    local report_file="$OUTPUT_DIR/system-report.md"
    
    cat > "$report_file" << EOF
# System Report - $(date)

## Environment Information
- Frontend: Next.js 15.4.6
- Backend: Go with Express-like framework
- Database: PostgreSQL 15-alpine
- Frontend Port: 3000
- Backend Port: 8089
- Database Port: 5432

## Current Status
$(check_system_status 2>&1)

## Page Version Analysis
$(analyze_backend_logs 2>&1)

## Recommendations

### Before Restart
1. Export all page version data
2. Review any pages with recent errors
3. Check for deprecated pages that need attention
4. Verify all dependencies are documented

### During Restart
1. Follow the restart checklist
2. Monitor logs for errors
3. Test critical functionality
4. Verify performance is maintained

### After Restart
1. Check all pages are accessible
2. Monitor error rates
3. Validate all features work
4. Update page version information if needed

## Files to Monitor
- Frontend logs: Browser localStorage (Page Version Manager)
- Backend logs: $BACKEND_DIR/logs/
- Database logs: Docker container logs
- Application logs: $BACKEND_DIR/*.log

EOF

    echo -e "${GREEN}✓${NC} System report generated: $report_file"
    echo ""
}

# Main execution
main() {
    echo "Starting restart planning analysis..."
    echo ""
    
    # Check if required tools are available
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}Warning: jq is not installed. Some analysis features will be limited.${NC}"
        echo "Install with: sudo apt-get install jq (Ubuntu/Debian) or brew install jq (macOS)"
        echo ""
    fi
    
    # Run analysis
    check_system_status
    analyze_frontend_logs
    analyze_backend_logs
    generate_restart_checklist
    generate_system_report
    
    echo -e "${GREEN}=== Analysis Complete ===${NC}"
    echo ""
    echo "Generated files:"
    echo "  - $OUTPUT_DIR/restart-checklist.md"
    echo "  - $OUTPUT_DIR/system-report.md"
    echo ""
    echo "Next steps:"
    echo "1. Review the generated checklist and report"
    echo "2. Open Page Version Manager in your browser for detailed analysis"
    echo "3. Export page version data before restart"
    echo "4. Follow the restart checklist during the process"
    echo ""
}

# Run main function
main "$@"
