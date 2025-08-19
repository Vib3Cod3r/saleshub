# SalesHub CRM Startup Procedure

## Problem Summary
The backend is a **Go application**, not a Node.js application. This causes confusion because:
- Frontend uses `npm run dev` (Node.js)
- Backend uses `go run cmd/server/main.go` (Go)
- The backend cannot be started with `npm run dev` in the backend directory

## Complete Startup Procedure

### 1. Kill All Existing Processes
```bash
# Kill all Node.js and npm processes
pkill -f "node.*backend" || echo "No backend processes found"
pkill -f "npm.*dev" || echo "No npm dev processes found"
pkill -f "next" || echo "No Next.js processes found"

# Kill any processes on our ports
lsof -ti:3000,8089,5432 | xargs kill -9 2>/dev/null || echo "No processes on ports 3000, 8089, or 5432"
```

### 2. Verify Database is Running
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# If not running, start it:
docker-compose up -d postgres
```

### 3. Start Backend (Go Application)
```bash
cd backend

# Option A: Direct Go command
go run cmd/server/main.go

# Option B: Using the server manager script
chmod +x scripts/server-manager.sh
./scripts/server-manager.sh start

# Option C: Background process
nohup go run cmd/server/main.go > /dev/null 2>&1 &
```

### 4. Start Frontend (Node.js Application)
```bash
cd frontend
npm run dev
```

### 5. Verify Services are Running
```bash
# Check backend health
curl http://localhost:8089/health

# Check frontend
curl http://localhost:3000

# Check ports
lsof -ti:3000,8089,5432
```

## Alternative: Use the Root Startup Script
```bash
# From the root directory
chmod +x start.sh
./start.sh
```

## Backend Architecture
- **Language**: Go (not Node.js)
- **Framework**: Gin (web framework)
- **Database**: PostgreSQL with GORM
- **Main Entry Point**: `backend/cmd/server/main.go`
- **Port**: 8089

## Frontend Architecture
- **Language**: TypeScript/JavaScript
- **Framework**: Next.js 15
- **Package Manager**: npm
- **Port**: 3000

## Common Issues and Solutions

### Issue: "Module not found" errors in frontend
**Solution**: Missing lib files - create:
- `frontend/src/lib/error-handler.ts`
- `frontend/src/lib/error-logger.ts`

### Issue: Backend not responding
**Solution**: Backend is Go, not Node.js - use:
```bash
cd backend
go run cmd/server/main.go
```

### Issue: Port conflicts
**Solution**: Kill processes on ports:
```bash
lsof -ti:3000,8089,5432 | xargs kill -9
```

## Quick Commands Reference

```bash
# Kill everything
pkill -f "node\|npm\|next" && lsof -ti:3000,8089,5432 | xargs kill -9 2>/dev/null

# Start database
docker-compose up -d postgres

# Start backend (Go)
cd backend && go run cmd/server/main.go

# Start frontend (Node.js)
cd frontend && npm run dev

# Check status
curl http://localhost:8089/health && curl http://localhost:3000
```

## Environment Requirements
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (via Docker)
