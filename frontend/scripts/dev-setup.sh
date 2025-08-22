#!/bin/bash

# Development Setup Script for SalesHub Frontend
# This script helps manage the development environment and avoid Turbopack issues

echo "🚀 SalesHub Frontend Development Setup"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        echo "🔄 Stopping process on port $port..."
        lsof -ti:$port | xargs kill -9
        sleep 2
    fi
}

# Check if we're in the frontend directory
if [ ! -f "package.json" ] || [ ! -f "next.config.ts" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Parse command line arguments
case "${1:-start}" in
    "start"|"dev")
        echo "📦 Installing dependencies..."
        npm install
        
        echo "🧹 Cleaning build cache..."
        rm -rf .next
        rm -rf node_modules/.cache
        
        echo "🔧 Starting development server (without Turbopack)..."
        npm run dev
        ;;
    
    "turbo")
        echo "📦 Installing dependencies..."
        npm install
        
        echo "🧹 Cleaning build cache..."
        rm -rf .next
        rm -rf node_modules/.cache
        
        echo "⚡ Starting development server with Turbopack..."
        npm run dev:turbo
        ;;
    
    "clean")
        echo "🧹 Cleaning all caches..."
        rm -rf .next
        rm -rf node_modules/.cache
        rm -rf node_modules
        echo "✅ Cache cleaned successfully"
        ;;
    
    "install")
        echo "📦 Installing dependencies..."
        npm install
        echo "✅ Dependencies installed successfully"
        ;;
    
    "stop")
        echo "🛑 Stopping development server..."
        kill_port 3000
        echo "✅ Development server stopped"
        ;;
    
    "restart")
        echo "🔄 Restarting development server..."
        kill_port 3000
        sleep 2
        echo "🔧 Starting development server..."
        npm run dev
        ;;
    
    "status")
        echo "📊 Development Environment Status:"
        echo "Frontend (port 3000): $(check_port 3000 && echo "✅ Running" || echo "❌ Not running")"
        echo "Backend (port 8089): $(check_port 8089 && echo "✅ Running" || echo "❌ Not running")"
        ;;
    
    "help"|"-h"|"--help")
        echo "Usage: ./scripts/dev-setup.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start, dev    - Start development server (default, without Turbopack)"
        echo "  turbo         - Start development server with Turbopack"
        echo "  clean         - Clean all caches and node_modules"
        echo "  install       - Install dependencies"
        echo "  stop          - Stop development server"
        echo "  restart       - Restart development server"
        echo "  status        - Check status of development servers"
        echo "  help          - Show this help message"
        ;;
    
    *)
        echo "❌ Unknown command: $1"
        echo "Run './scripts/dev-setup.sh help' for usage information"
        exit 1
        ;;
esac
