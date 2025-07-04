#!/bin/bash

# Exam Pattern Analyzer - Shared Hosting Startup Script
# For elaraix.com/exam

echo "🚀 Starting Exam Pattern Analyzer on Shared Hosting..."
echo "📊 Database: iextqmxf_exams"
echo "🌐 Domain: elaraix.com/exam"

# Load environment configuration
echo "⚙️  Loading production environment..."
node env-production.js

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --production
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application
echo "🚀 Starting server..."
echo "📍 Port: 3000"
echo "🌍 Environment: production"
echo "📁 Logs: logs/app.log"

# Start the server
node server.js 