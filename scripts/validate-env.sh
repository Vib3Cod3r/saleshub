#!/bin/bash

echo "🔍 Validating environment configuration..."

# Check backend environment
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file missing"
    exit 1
fi

# Check frontend environment
if [ ! -f "frontend/.env.local" ]; then
    echo "❌ Frontend .env.local file missing"
    exit 1
fi

# Validate backend environment variables
cd backend
source .env
required_vars=("DATABASE_URL" "JWT_SECRET" "PORT" "CORS_ORIGIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Backend missing required variable: $var"
        exit 1
    fi
done

# Validate frontend environment variables
cd ../frontend
source .env.local
if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "❌ Frontend missing NEXT_PUBLIC_API_URL"
    exit 1
fi

echo "✅ Environment validation passed"
