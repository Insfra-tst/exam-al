// Test configuration for running on port 3004
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Override port for testing
process.env.PORT = '3004';

// Set test environment
process.env.NODE_ENV = 'test';

console.log('🧪 Test configuration loaded');
console.log('📡 Port:', process.env.PORT);
console.log('🌍 Environment:', process.env.NODE_ENV);

module.exports = {
    port: process.env.PORT || 3004,
    nodeEnv: process.env.NODE_ENV || 'test'
}; 