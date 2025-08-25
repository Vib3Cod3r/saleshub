#!/bin/bash

echo "🚀 Setting up SalesHub development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start database
echo "📊 Starting PostgreSQL database..."
docker-compose up postgres -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Setup database
echo "🗄️ Setting up database..."
npm run db:setup

# Validate environment
echo "🔍 Validating environment..."
npm run validate

echo "✅ Development environment setup complete!"
echo "🎯 Run 'npm run dev' to start development servers"
