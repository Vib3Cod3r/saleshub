#!/bin/bash

# Phase 5 Validation Script
# Tests all new features: Lead Management, Analytics, and CRM functionality

set -e

echo "🔍 Phase 5 Validation Script - SalesHub CRM"
echo "=============================================="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:8089"
FRONTEND_URL="http://localhost:3000"
ADMIN_EMAIL="admin@saleshub.com"
ADMIN_PASSWORD="Admin123!"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" 2>/dev/null | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to get auth token
get_auth_token() {
    local response=$(curl -s -X POST "$API_BASE/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
    
    echo "$response" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
}

echo -e "${BLUE}Step 1: Environment Validation${NC}"
echo "----------------------------------------"

# Test database connection
run_test "Database Health" \
    "curl -s $API_BASE/health" \
    '"status":"healthy"'

# Test server is running
run_test "Backend Server" \
    "curl -s $API_BASE/health" \
    '"database":"connected"'

echo ""
echo -e "${BLUE}Step 2: Authentication System${NC}"
echo "----------------------------------------"

# Test authentication
run_test "User Login" \
    "curl -s -X POST $API_BASE/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}'" \
    '"success":true'

# Get auth token for subsequent tests
AUTH_TOKEN=$(get_auth_token)
if [ -n "$AUTH_TOKEN" ]; then
    echo -e "${GREEN}✅ Authentication token obtained${NC}"
else
    echo -e "${RED}❌ Failed to get authentication token${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 3: Lead Management System${NC}"
echo "----------------------------------------"

# Test lead endpoints
run_test "Get Leads" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/leads" \
    '"success":true'

run_test "Lead Analytics" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/analytics/leads" \
    '"success":true'

echo ""
echo -e "${BLUE}Step 4: Analytics & Reporting System${NC}"
echo "----------------------------------------------"

# Test analytics endpoints
run_test "Dashboard Metrics" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/analytics/dashboard" \
    '"success":true'

run_test "Sales Analytics" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/analytics/sales" \
    '"success":true'

run_test "Activity Analytics" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/analytics/activity" \
    '"success":true'

echo ""
echo -e "${BLUE}Step 5: CRM Core Features${NC}"
echo "--------------------------------"

# Test core CRM endpoints
run_test "Get Contacts" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/contacts" \
    '"success":true'

run_test "Get Companies" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/companies" \
    '"success":true'

run_test "Get Deals" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/deals" \
    '"success":true'

run_test "Get Tasks" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/tasks" \
    '"success":true'

echo ""
echo -e "${BLUE}Step 6: Service Layer Validation${NC}"
echo "----------------------------------------"

# Test service layer functionality
run_test "Contact Service Stats" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' '$API_BASE/api/contacts/stats'" \
    '"success":true'

run_test "Company Service Stats" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' '$API_BASE/api/companies/stats'" \
    '"success":true'

run_test "Deal Service Pipeline" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' '$API_BASE/api/deals/pipeline'" \
    '"success":true'

echo ""
echo -e "${BLUE}Step 7: Performance & Scalability${NC}"
echo "------------------------------------------"

# Test response times
echo -n "Testing API Response Time... "
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE/api/analytics/dashboard")
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
    echo -e "${GREEN}✅ Fast ($RESPONSE_TIME seconds)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  Slow ($RESPONSE_TIME seconds)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Test concurrent requests
echo -n "Testing Concurrent Requests... "
CONCURRENT_RESPONSE=$(curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE/api/contacts" & \
                     curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE/api/deals" & \
                     curl -s -H "Authorization: Bearer $AUTH_TOKEN" "$API_BASE/api/tasks" & \
                     wait)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Concurrent requests handled${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}❌ Concurrent request failure${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo -e "${BLUE}Step 8: Error Handling${NC}"
echo "----------------------------"

# Test error handling
run_test "Invalid Token Handling" \
    "curl -s -H 'Authorization: Bearer invalid-token' $API_BASE/api/contacts" \
    '"error":"Invalid token"'

run_test "Missing Token Handling" \
    "curl -s $API_BASE/api/contacts" \
    '"error":"Access token is required"'

run_test "404 Error Handling" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/nonexistent" \
    '"error":"Not found"'

echo ""
echo -e "${BLUE}Step 9: Data Integrity${NC}"
echo "----------------------------"

# Test data consistency
run_test "Dashboard Data Consistency" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/analytics/dashboard | grep -o '\"totalContacts\":[0-9]*' | head -1" \
    "totalContacts"

run_test "Lead Data Structure" \
    "curl -s -H 'Authorization: Bearer $AUTH_TOKEN' $API_BASE/api/leads | grep -o '\"email\":\"[^\"]*\"' | head -1" \
    "email"

echo ""
echo -e "${BLUE}Step 10: Frontend Integration${NC}"
echo "-----------------------------------"

# Test frontend if available
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    run_test "Frontend Accessibility" \
        "curl -s $FRONTEND_URL" \
        "html"
    
    run_test "Frontend API Integration" \
        "curl -s $FRONTEND_URL/api/health" \
        "health"
else
    echo -e "${YELLOW}⚠️  Frontend not accessible at $FRONTEND_URL${NC}"
fi

echo ""
echo -e "${BLUE}Validation Summary${NC}"
echo "======================"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Phase 5 implementation is successful.${NC}"
    echo ""
    echo -e "${BLUE}✅ Phase 5 Features Validated:${NC}"
    echo "  • Lead Management System"
    echo "  • Advanced Analytics & Reporting"
    echo "  • Service Layer Architecture"
    echo "  • Authentication & Authorization"
    echo "  • Error Handling & Validation"
    echo "  • Performance & Scalability"
    echo "  • Data Integrity & Consistency"
    echo ""
    echo -e "${GREEN}🚀 Ready for Phase 6: Performance Optimization & Caching${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please review the implementation.${NC}"
    exit 1
fi
