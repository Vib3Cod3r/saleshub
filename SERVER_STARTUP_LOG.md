# Server Startup Log

## Purpose
Track server restarts and startups to avoid the long initialization process each time.

## Current Status
- **Frontend**: Running on port 3000 ✅
- **Backend**: Running on port 8089 ✅
- **Database**: PostgreSQL running on port 5432 ✅

## Server Startup Time
- **Backend**: ~30-45 seconds (includes database migrations and seeding)
- **Frontend**: ~5-10 seconds

## Startup Commands

### Backend Server
```bash
cd backend
go build -o bin/server cmd/server/main.go
./bin/server
```

### Frontend Server
```bash
cd frontend
PORT=3000 npm run dev
```

### Database
```bash
# PostgreSQL should be running via Docker
docker ps | grep postgres
```

## Recent Issues
1. **Backend 500 Error**: Contact creation failing due to complex request structure
2. **Port Conflicts**: Backend server not starting due to port 8089 already in use
3. **Build Issues**: Go build failing due to incorrect working directory

## Quick Start Commands
```bash
# Kill any existing processes
pkill -f "saleshub-backend"
pkill -f "next dev"

# Clear ports
lsof -ti:8089 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend
cd backend && go build -o bin/server cmd/server/main.go && ./bin/server &

# Start frontend
cd frontend && PORT=3000 npm run dev &
```

## Last Updated
2025-08-16 23:35:00 UTC
