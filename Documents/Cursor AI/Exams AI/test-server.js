#!/usr/bin/env node

// Test server script - runs on port 3004
require('./test-config.js');

console.log('🚀 Starting test server on port 3004...');

// Import and run the main server
require('./server.js'); 