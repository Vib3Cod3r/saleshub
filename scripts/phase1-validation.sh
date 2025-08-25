#!/bin/bash

echo "🔍 Phase 1 Validation - December 19, 2024 14:30 HKT"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# 1. Environment Configuration Validation
echo -e "\n${YELLOW}1. Environment Configuration${NC}"
./scripts/validate-env.sh
print_status $? "Environment validation"

# 2. Database Connection Test
echo -e "\n${YELLOW}2. Database Connection${NC}"
docker-compose up postgres -d
sleep 5
cd backend && npm run db:generate > /dev/null 2>&1
print_status $? "Database connection and Prisma generation"

# 3. Backend Health Check
echo -e "\n${YELLOW}3. Backend Health Check${NC}"
cd .. && npm run dev:backend &
sleep 8
curl -s http://localhost:8089/health > /dev/null
print_status $? "Backend health endpoint"

# 4. Frontend Build Test
echo -e "\n${YELLOW}4. Frontend Build Test${NC}"
cd frontend && npm run build > /dev/null 2>&1
print_status $? "Frontend build process"

# 5. TypeScript Compilation Test
echo -e "\n${YELLOW}5. TypeScript Compilation${NC}"
cd ../backend && npx tsc --noEmit
print_status $? "Backend TypeScript compilation"

cd ../frontend && npx tsc --noEmit
print_status $? "Frontend TypeScript compilation"

# 6. Shared Types Validation
echo -e "\n${YELLOW}6. Shared Types Validation${NC}"
if [ -f "../shared/types/api.ts" ] && [ -f "../shared/types/auth.ts" ] && [ -f "../shared/types/crm.ts" ]; then
    print_status 0 "Shared types files exist"
else
    print_status 1 "Shared types files missing"
fi

# 7. Development Scripts Test
echo -e "\n${YELLOW}7. Development Scripts${NC}"
cd .. && npm run validate > /dev/null 2>&1
print_status $? "Root package.json scripts"

# 8. Database Seeding Test
echo -e "\n${YELLOW}8. Database Seeding${NC}"
cd backend && npm run db:seed > /dev/null 2>&1
print_status $? "Database seeding process"

# Cleanup
echo -e "\n${YELLOW}Cleaning up...${NC}"
cd .. && pkill -f "nodemon" > /dev/null 2>&1
pkill -f "next dev" > /dev/null 2>&1
pkill -f "ts-node" > /dev/null 2>&1

echo -e "\n${GREEN}🎉 Phase 1 Validation Complete!${NC}"
echo -e "${GREEN}All core infrastructure is working correctly.${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Run 'npm run dev' to start development servers"
echo "2. Access frontend at http://localhost:3000"
echo "3. Access backend API at http://localhost:8089"
echo "4. Access Prisma Studio at http://localhost:5555 (run 'npm run db:studio')"
