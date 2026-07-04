#!/bin/bash

# Secure Backend Quick Start Script
# This script helps you set up and run the secure backend

set -e

echo "🔐 Secure Backend API - Quick Start"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    echo ""
    echo "⚠️  IMPORTANT: Generate encryption keys"
    echo "Run this Python command to generate keys:"
    echo ""
    echo "python3 -c \"from cryptography.fernet import Fernet; print('ENCRYPTION_KEY=' + Fernet.generate_key().decode()); print('FIELD_ENCRYPTION_KEY=' + Fernet.generate_key().decode())\""
    echo ""
    echo "Then update the keys in the .env file"
    echo ""
    read -p "Press Enter after updating .env file..."
else
    echo "✅ .env file exists"
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Start services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running"
else
    echo "❌ Some services failed to start"
    docker-compose logs
    exit 1
fi

echo ""
echo "🎉 Success! Services are running:"
echo ""
echo "📌 API:        http://localhost:8000"
echo "📌 Docs:       http://localhost:8000/docs"
echo "📌 Health:     http://localhost:8000/health"
echo "📌 Metrics:    http://localhost:8000/metrics"
echo "📌 Prometheus: http://localhost:9090"
echo ""
echo "🔍 View logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "📚 Next steps:"
echo "   1. Create a user: POST /api/v1/auth/register"
echo "   2. Login: POST /api/v1/auth/login"
echo "   3. Access protected endpoints with Bearer token"
echo ""
echo "📖 Read the documentation:"
echo "   - README.md - General documentation"
echo "   - SECURITY.md - Security guide"
echo "   - API.md - API reference"
echo ""
