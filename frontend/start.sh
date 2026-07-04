#!/bin/bash

# Frontend Quick Start Script

set -e

echo "🎨 Frontend Application - Quick Start"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed"
node --version
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed"
npm --version
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo ""
    npm install
    echo ""
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please update the .env file with your configuration"
    echo ""
    read -p "Press Enter after updating .env file..."
else
    echo "✅ .env file exists"
fi

echo ""
echo "🚀 Starting development server..."
echo ""

# Start development server
npm run dev &

echo ""
echo "🎉 Development server is starting..."
echo ""
echo "📌 Frontend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
