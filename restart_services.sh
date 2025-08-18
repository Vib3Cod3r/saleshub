#!/bin/bash

# SalesHub Service Restart Script
# Usage: ./restart_services.sh [backend|frontend|both]

echo "🔄 SalesHub Service Restart Script"
echo "=================================="

# Function to kill process on port
kill_port() {
    local port=$1
    local service_name=$2
    echo "🔫 Killing $service_name on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || echo "No $service_name process found on port $port"
}

# Function to restart backend
restart_backend() {
    echo "🚀 Starting backend..."
    cd backend
    go run cmd/server/main.go &
    cd ..
    echo "✅ Backend started on port 8089"
}

# Function to restart frontend
restart_frontend() {
    echo "🚀 Starting frontend..."
    cd frontend
    # Clear cache
    rm -rf .next node_modules/.cache 2>/dev/null || echo "Cache cleared"
    npm run dev &
    cd ..
    echo "✅ Frontend started on port 3000"
}

# Function to check service status
check_status() {
    echo "📊 Checking service status..."
    sleep 3
    curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend (port 3000) is running" || echo "❌ Frontend (port 3000) is not responding"
    curl -s http://localhost:8089 > /dev/null && echo "✅ Backend (port 8089) is running" || echo "❌ Backend (port 8089) is not responding"
}

# Main logic
case "${1:-both}" in
    "backend")
        kill_port 8089 "backend"
        restart_backend
        ;;
    "frontend")
        kill_port 3000 "frontend"
        restart_frontend
        ;;
    "both"|*)
        kill_port 8089 "backend"
        kill_port 3000 "frontend"
        restart_backend
        restart_frontend
        ;;
esac

check_status

echo "🎉 Restart complete! Services should be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8089"
