# Test Port Setup

This setup allows you to run the Exams AI application on a different port (3004) for testing purposes.

## Quick Start

### Option 1: Using npm scripts
```bash
# Start test server
npm run test

# Start test server with auto-reload
npm run test-dev
```

### Option 2: Using shell scripts
```bash
# On macOS/Linux
./start-test.sh

# On Windows
start-test.bat
```

### Option 3: Manual start
```bash
# Set port and start
PORT=3004 node server.js

# Or use the test configuration
node test-server.js
```

## Port Configuration

- **Main server**: Port 3002 (default)
- **Test server**: Port 3004
- **Fallback**: If port is in use, automatically tries next port

## Environment Variables

The test server uses the same `.env` file but overrides:
- `PORT=3004`
- `NODE_ENV=test`

## Access URLs

- **Main server**: http://localhost:3002
- **Test server**: http://localhost:3004

## Troubleshooting

If you get port conflicts:

1. Kill existing processes:
   ```bash
   pkill -f "node server.js"
   ```

2. Wait a few seconds and try again

3. Check if ports are in use:
   ```bash
   lsof -i :3002
   lsof -i :3004
   ```

## Files Created

- `test-server.js` - Test server entry point
- `test-config.js` - Test configuration
- `start-test.sh` - Shell script for macOS/Linux
- `start-test.bat` - Batch file for Windows
- Updated `package.json` with test scripts 