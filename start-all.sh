#!/bin/bash

# SalesHub CRM - Complete Startup Script
# This script starts all required services for the SalesHub CRM application

echo "🚀 SalesHub CRM - Starting All Services"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    local service_name=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is already running on port $port${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $service_name is not running on port $port${NC}"
        return 1
    fi
}

# Function to start database
start_database() {
    echo -e "${BLUE}📊 Starting PostgreSQL database...${NC}"
    if ! check_port 5432 "PostgreSQL"; then
        docker-compose up -d postgres
        echo "Waiting for database to be ready..."
        sleep 10
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend API...${NC}"
    if ! check_port 8089 "Backend API"; then
        cd backend
        go run cmd/server/main.go &
        cd ..
        echo "Waiting for backend to start..."
        sleep 5
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting Frontend...${NC}"
    if ! check_port 3000 "Frontend"; then
        cd frontend
        npm run dev &
        cd ..
        echo "Waiting for frontend to start..."
        sleep 10
    fi
}

# Function to check service health
check_health() {
    echo -e "${BLUE}🏥 Checking service health...${NC}"
    
    # Check database
    if check_port 5432 "PostgreSQL"; then
        echo -e "${GREEN}   Database: Healthy${NC}"
    else
        echo -e "${RED}   Database: Unhealthy${NC}"
    fi
    
    # Check backend
    if check_port 8089 "Backend API"; then
        # Test API endpoint
        if curl -s http://localhost:8089/api/auth/me >/dev/null 2>&1; then
            echo -e "${GREEN}   Backend API: Healthy${NC}"
        else
            echo -e "${YELLOW}   Backend API: Running but not responding${NC}"
        fi
    else
        echo -e "${RED}   Backend API: Unhealthy${NC}"
    fi
    
    # Check frontend
    if check_port 3000 "Frontend"; then
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo -e "${GREEN}   Frontend: Healthy${NC}"
        else
            echo -e "${YELLOW}   Frontend: Running but not responding${NC}"
        fi
    else
        echo -e "${RED}   Frontend: Unhealthy${NC}"
    fi
}

# Function to display service URLs
show_urls() {
    echo -e "${BLUE}🌐 Service URLs:${NC}"
    echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "   Backend API: ${GREEN}http://localhost:8089${NC}"
    echo -e "   Database: ${GREEN}localhost:5432${NC}"
    echo -e "   PgAdmin: ${GREEN}http://localhost:5050${NC}"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  start     Start all services (default)"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  status    Show service status"
    echo "  health    Check service health"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start    # Start all services"
    echo "  $0 status   # Check what's running"
    echo "  $0 health   # Test service connectivity"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    
    # Kill processes on specific ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No frontend process found"
    lsof -ti:8089 | xargs kill -9 2>/dev/null || echo "No backend process found"
    
    # Stop docker containers
    docker-compose down 2>/dev/null || echo "No docker containers to stop"
    
    echo -e "${GREEN}✅ All services stopped${NC}"
}

# Main logic
case "${1:-start}" in
    "start")
        start_database
        start_backend
        start_frontend
        echo ""
        check_health
        echo ""
        show_urls
        echo ""
        echo -e "${GREEN}🎉 SalesHub CRM is ready!${NC}"
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        $0 start
        ;;
    "status")
        check_health
        echo ""
        show_urls
        ;;
    "health")
        check_health
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
