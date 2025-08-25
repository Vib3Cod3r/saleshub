#!/bin/bash

echo "🔄 Resetting development environment..."

# Stop all services
docker-compose down

# Clean build artifacts
npm run clean

# Reset database
npm run db:reset

# Restart services
npm run dev:database
sleep 5

echo "✅ Development environment reset complete!"
