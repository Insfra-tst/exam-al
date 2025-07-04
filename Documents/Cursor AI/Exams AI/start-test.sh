#!/bin/bash

echo "🧹 Cleaning up existing processes..."
pkill -f "node server.js" || true
pkill -f "node test-server.js" || true

echo "⏳ Waiting for processes to terminate..."
sleep 2

echo "🚀 Starting test server on port 3004..."
node test-server.js 