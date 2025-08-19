#!/bin/bash

# SalesHub CRM Anti-Bloat Checker
# Scans codebase for potential bloat issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
CONFIG_FILE="ANTI_BLOAT_CONFIG.json"
FRONTEND_DIR="frontend/src"
BACKEND_DIR="backend"

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    error "Configuration file $CONFIG_FILE not found"
    exit 1
fi

# Load configuration
FRONTEND_LIMIT=$(jq -r '.rules.fileSizeLimits.frontendComponents' "$CONFIG_FILE")
BACKEND_LIMIT=$(jq -r '.rules.fileSizeLimits.backendHandlers' "$CONFIG_FILE")
SCRIPT_LIMIT=$(jq -r '.rules.fileSizeLimits.scripts' "$CONFIG_FILE")
MAX_FUNCTION_LINES=$(jq -r '.rules.functionDesign.maxLinesPerFunction' "$CONFIG_FILE")

echo "🔍 SalesHub CRM Anti-Bloat Checker"
echo "=================================="

# Check file sizes
check_file_sizes() {
    log "Checking file sizes..."
    
    # Frontend components
    local large_frontend_files=$(find "$FRONTEND_DIR" -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk "\$1 > $FRONTEND_LIMIT {print \$2, \$1}" | head -10)
    if [ -n "$large_frontend_files" ]; then
        warn "Large frontend files (>$FRONTEND_LIMIT lines):"
        echo "$large_frontend_files" | while read file lines; do
            echo "  $file ($lines lines)"
        done
    else
        info "✓ All frontend files are within size limits"
    fi
    
    # Backend handlers
    local large_backend_files=$(find "$BACKEND_DIR" -name "*_handler.go" | xargs wc -l | awk "\$1 > $BACKEND_LIMIT {print \$2, \$1}" | head -10)
    if [ -n "$large_backend_files" ]; then
        warn "Large backend handlers (>$BACKEND_LIMIT lines):"
        echo "$large_backend_files" | while read file lines; do
            echo "  $file ($lines lines)"
        done
    else
        info "✓ All backend handlers are within size limits"
    fi
    
    # Scripts
    local large_scripts=$(find . -name "*.sh" | xargs wc -l | awk "\$1 > $SCRIPT_LIMIT {print \$2, \$1}" | head -10)
    if [ -n "$large_scripts" ]; then
        warn "Large scripts (>$SCRIPT_LIMIT lines):"
        echo "$large_scripts" | while read file lines; do
            echo "  $file ($lines lines)"
        done
    else
        info "✓ All scripts are within size limits"
    fi
}

# Check for unused imports
check_unused_imports() {
    log "Checking for unused imports..."
    
    # TypeScript/JavaScript
    local ts_files=$(find "$FRONTEND_DIR" -name "*.ts" -o -name "*.tsx")
    local unused_imports=0
    
    for file in $ts_files; do
        if grep -q "import.*from" "$file"; then
            # Simple check for potentially unused imports
            local imports=$(grep -o "import.*from" "$file" | wc -l)
            local used_imports=$(grep -v "import.*from" "$file" | grep -o "from.*import" | wc -l)
            if [ "$imports" -gt "$used_imports" ]; then
                warn "Potential unused imports in $file"
                unused_imports=$((unused_imports + 1))
            fi
        fi
    done
    
    if [ "$unused_imports" -eq 0 ]; then
        info "✓ No obvious unused imports found"
    fi
}

# Check for commented code
check_commented_code() {
    log "Checking for commented code..."
    
    local commented_blocks=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.go" -o -name "*.sh" | xargs grep -l "/\*.*\*/" 2>/dev/null || true)
    local commented_lines=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.go" -o -name "*.sh" | xargs grep -c "//.*[a-zA-Z]" 2>/dev/null | awk -F: '$2 > 5 {print $1, $2}' | head -10)
    
    if [ -n "$commented_blocks" ]; then
        warn "Files with commented code blocks:"
        echo "$commented_blocks" | head -5
    fi
    
    if [ -n "$commented_lines" ]; then
        warn "Files with many commented lines:"
        echo "$commented_lines"
    fi
    
    if [ -z "$commented_blocks" ] && [ -z "$commented_lines" ]; then
        info "✓ No obvious commented code found"
    fi
}

# Check for duplicate code patterns
check_duplicate_patterns() {
    log "Checking for duplicate code patterns..."
    
    # Check for repeated fetch patterns
    local fetch_patterns=$(find "$FRONTEND_DIR" -name "*.ts" -o -name "*.tsx" | xargs grep -l "fetch.*localhost:8089" 2>/dev/null || true)
    local fetch_count=$(echo "$fetch_patterns" | wc -l)
    
    if [ "$fetch_count" -gt 3 ]; then
        warn "Multiple files with direct fetch calls ($fetch_count files)"
        echo "$fetch_patterns" | head -5
        info "Consider using centralized API client"
    else
        info "✓ No obvious duplicate fetch patterns"
    fi
}

# Check for large functions
check_large_functions() {
    log "Checking for large functions..."
    
    # Simple check for functions with many lines
    local large_functions=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.go" | xargs grep -n "function\|func" | awk -F: '{print $1, $2}' | head -20)
    
    if [ -n "$large_functions" ]; then
        warn "Functions that might be too large:"
        echo "$large_functions" | head -10
    else
        info "✓ No obvious large functions found"
    fi
}

# Check for log files
check_log_files() {
    log "Checking for log files..."
    
    local log_files=$(find . -name "*.log" -type f 2>/dev/null || true)
    local log_count=$(echo "$log_files" | wc -l)
    
    if [ "$log_count" -gt 0 ]; then
        warn "Found $log_count log files:"
        echo "$log_files" | head -5
        info "Consider cleaning up old log files"
    else
        info "✓ No log files found"
    fi
}

# Check for documentation bloat
check_documentation_bloat() {
    log "Checking for documentation bloat..."
    
    local md_files=$(find . -name "*.md" -type f | wc -l)
    local large_md_files=$(find . -name "*.md" -type f -exec wc -l {} + | awk "\$1 > 100 {print \$2, \$1}" | head -5)
    
    if [ "$md_files" -gt 10 ]; then
        warn "Many documentation files found ($md_files files)"
    fi
    
    if [ -n "$large_md_files" ]; then
        warn "Large documentation files:"
        echo "$large_md_files"
    fi
    
    if [ "$md_files" -le 10 ] && [ -z "$large_md_files" ]; then
        info "✓ Documentation looks reasonable"
    fi
}

# Generate summary report
generate_report() {
    echo ""
    echo "📊 Anti-Bloat Summary Report"
    echo "============================"
    
    local total_files=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.go" -o -name "*.sh" | wc -l)
    local total_lines=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.go" -o -name "*.sh" | xargs wc -l | tail -1 | awk '{print $1}')
    
    echo "Total files analyzed: $total_files"
    echo "Total lines of code: $total_lines"
    echo "Average lines per file: $((total_lines / total_files))"
    
    echo ""
    echo "🎯 Recommendations:"
    echo "1. Keep functions under $MAX_FUNCTION_LINES lines"
    echo "2. Keep frontend components under $FRONTEND_LIMIT lines"
    echo "3. Keep backend handlers under $BACKEND_LIMIT lines"
    echo "4. Use centralized API client instead of direct fetch calls"
    echo "5. Remove commented code and unused imports"
    echo "6. Clean up log files regularly"
}

# Main execution
main() {
    check_file_sizes
    echo ""
    check_unused_imports
    echo ""
    check_commented_code
    echo ""
    check_duplicate_patterns
    echo ""
    check_large_functions
    echo ""
    check_log_files
    echo ""
    check_documentation_bloat
    echo ""
    generate_report
}

# Run main function
main "$@"
