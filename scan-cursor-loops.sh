#!/bin/bash

# Cursor Loops Scanner
# This script scans the codebase for all types of loops and updates the CURSOR_LOOPS_LOG.md file

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="CURSOR_LOOPS_LOG.md"
TEMP_FILE="temp_loops_scan.md"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"

echo -e "${BLUE}🔍 Scanning for cursor loops in SalesHub CRM...${NC}"

# Function to count loops in a file
count_loops() {
    local file="$1"
    local language="$2"
    
            case $language in
            "go")
                # Count Go loops
                local for_loops=$(grep -c "for.*range\|for.*i.*:=.*\|for.*=.*range" "$file" 2>/dev/null || echo "0")
                local while_loops=$(grep -c "for.*{" "$file" 2>/dev/null | grep -v "for.*range\|for.*i.*:=.*\|for.*=.*range" || echo "0")
                local total=$((for_loops + while_loops))
                echo "$total"
                ;;
            "typescript"|"javascript")
                # Count TypeScript/JavaScript loops
                local for_loops=$(grep -c "for.*of\|for.*in\|for.*let\|for.*var\|for.*const" "$file" 2>/dev/null || echo "0")
                local while_loops=$(grep -c "while.*(" "$file" 2>/dev/null || echo "0")
                local map_loops=$(grep -c "\.map(" "$file" 2>/dev/null || echo "0")
                local filter_loops=$(grep -c "\.filter(" "$file" 2>/dev/null || echo "0")
                local forEach_loops=$(grep -c "\.forEach(" "$file" 2>/dev/null || echo "0")
                local reduce_loops=$(grep -c "\.reduce(" "$file" 2>/dev/null || echo "0")
                local total=$((for_loops + while_loops + map_loops + filter_loops + forEach_loops + reduce_loops))
                echo "$total"
                ;;
            *)
                echo "0"
                ;;
        esac
}

# Function to get file extension
get_extension() {
    local file="$1"
    echo "${file##*.}"
}

# Function to determine language from extension
get_language() {
    local ext="$1"
    case $ext in
        "go") echo "go" ;;
        "ts"|"tsx") echo "typescript" ;;
        "js"|"jsx") echo "javascript" ;;
        *) echo "unknown" ;;
    esac
}

# Initialize counters
total_backend_loops=0
total_frontend_loops=0
total_files_scanned=0

# Create temporary log file
cat > "$TEMP_FILE" << 'EOF'
# Cursor Loops Log

This document tracks all cursor loops (for loops, while loops, iterations) in the SalesHub CRM codebase for monitoring and optimization purposes.

## Log Format
- **Timestamp**: When the loop was identified
- **File**: File path where the loop exists
- **Line**: Line number of the loop
- **Type**: Type of loop (for, while, range, map, filter, etc.)
- **Purpose**: What the loop is doing
- **Performance Impact**: Estimated performance impact (Low/Medium/High)
- **Status**: Active/Inactive/Optimized

---

## Backend Loops (Go)

EOF

# Scan backend files
echo -e "${YELLOW}📁 Scanning backend files...${NC}"
backend_files=$(find "$BACKEND_DIR" -name "*.go" -type f 2>/dev/null || true)

for file in $backend_files; do
    if [ -f "$file" ]; then
        ext=$(get_extension "$file")
        language=$(get_language "$ext")
        
        if [ "$language" = "go" ]; then
            loop_count=$(count_loops "$file" "$language")
            if [ "$loop_count" -gt 0 ]; then
                echo -e "${GREEN}  ✓ $file: $loop_count loops${NC}"
                total_backend_loops=$((total_backend_loops + loop_count))
                
                # Add to log
                echo "### $(basename "$file")" >> "$TEMP_FILE"
                echo "" >> "$TEMP_FILE"
                
                # Get loop details
                grep -n "for.*range\|for.*i.*:=.*\|for.*=.*range\|for.*{" "$file" 2>/dev/null | while IFS=: read -r line_num line_content; do
                    if [ ! -z "$line_content" ]; then
                        echo "#### $(date +%Y-%m-%d) - Loop at line $line_num" >> "$TEMP_FILE"
                        echo "- **File**: \`$file:$line_num\`" >> "$TEMP_FILE"
                        echo "- **Line**: $line_num" >> "$TEMP_FILE"
                        echo "- **Type**: \`$(echo "$line_content" | sed 's/^[[:space:]]*//' | head -c 50)...\`" >> "$TEMP_FILE"
                        echo "- **Purpose**: Loop in $(basename "$file")" >> "$TEMP_FILE"
                        echo "- **Performance Impact**: Low" >> "$TEMP_FILE"
                        echo "- **Status**: Active" >> "$TEMP_FILE"
                        echo "" >> "$TEMP_FILE"
                    fi
                done
            fi
        fi
        total_files_scanned=$((total_files_scanned + 1))
    fi
done

# Add frontend section
echo "" >> "$TEMP_FILE"
echo "---" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "## Frontend Loops (TypeScript/React)" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Scan frontend files
echo -e "${YELLOW}📁 Scanning frontend files...${NC}"
frontend_files=$(find "$FRONTEND_DIR" -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -type f 2>/dev/null || true)

for file in $frontend_files; do
    if [ -f "$file" ]; then
        ext=$(get_extension "$file")
        language=$(get_language "$ext")
        
        if [ "$language" = "typescript" ] || [ "$language" = "javascript" ]; then
            loop_count=$(count_loops "$file" "$language")
            if [ "$loop_count" -gt 0 ]; then
                echo -e "${GREEN}  ✓ $file: $loop_count loops${NC}"
                total_frontend_loops=$((total_frontend_loops + loop_count))
                
                # Add to log
                echo "### $(basename "$file")" >> "$TEMP_FILE"
                echo "" >> "$TEMP_FILE"
                
                # Get loop details
                grep -n "for.*of\|for.*in\|for.*let\|for.*var\|for.*const\|while.*(\.map(\|\.filter(\|\.forEach(\|\.reduce(" "$file" 2>/dev/null | while IFS=: read -r line_num line_content; do
                    if [ ! -z "$line_content" ]; then
                        echo "#### $(date +%Y-%m-%d) - Loop at line $line_num" >> "$TEMP_FILE"
                        echo "- **File**: \`$file:$line_num\`" >> "$TEMP_FILE"
                        echo "- **Line**: $line_num" >> "$TEMP_FILE"
                        echo "- **Type**: \`$(echo "$line_content" | sed 's/^[[:space:]]*//' | head -c 50)...\`" >> "$TEMP_FILE"
                        echo "- **Purpose**: Loop in $(basename "$file")" >> "$TEMP_FILE"
                        echo "- **Performance Impact**: Low" >> "$TEMP_FILE"
                        echo "- **Status**: Active" >> "$TEMP_FILE"
                        echo "" >> "$TEMP_FILE"
                    fi
                done
            fi
        fi
        total_files_scanned=$((total_files_scanned + 1))
    fi
done

# Add summary
echo "" >> "$TEMP_FILE"
echo "---" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "## Summary" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "- **Total Files Scanned**: $total_files_scanned" >> "$TEMP_FILE"
echo "- **Backend Loops**: $total_backend_loops" >> "$TEMP_FILE"
echo "- **Frontend Loops**: $total_frontend_loops" >> "$TEMP_FILE"
echo "- **Total Loops**: $((total_backend_loops + total_frontend_loops))" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "*Last Updated: $(date)*" >> "$TEMP_FILE"

# Replace the original log file
mv "$TEMP_FILE" "$LOG_FILE"

echo -e "${GREEN}✅ Cursor loops scan completed!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • Files scanned: $total_files_scanned"
echo -e "  • Backend loops: $total_backend_loops"
echo -e "  • Frontend loops: $total_frontend_loops"
echo -e "  • Total loops: $((total_backend_loops + total_frontend_loops))"
echo -e "  • Log file updated: $LOG_FILE"

# Make script executable
chmod +x "$0"
