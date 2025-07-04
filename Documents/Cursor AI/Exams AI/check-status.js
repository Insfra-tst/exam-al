#!/usr/bin/env node

const http = require('http');

console.log('🔍 Checking test server status...');

// Check test server on port 3004
const testServerCheck = () => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3004,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            console.log(`✅ Test Server (Port 3004): ${res.statusCode} - ${res.statusMessage}`);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log(`❌ Test Server (Port 3004): ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('⏰ Test Server (Port 3004): Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
};

// Check main server on port 3002
const mainServerCheck = () => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3002,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            console.log(`✅ Main Server (Port 3002): ${res.statusCode} - ${res.statusMessage}`);
            resolve(true);
        });

        req.on('error', (err) => {
            console.log(`❌ Main Server (Port 3002): ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('⏰ Main Server (Port 3002): Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
};

// Run checks
async function checkStatus() {
    console.log('\n🌐 Server Status Check\n');
    
    try {
        await testServerCheck();
    } catch (err) {
        console.log('Test server is not responding');
    }
    
    try {
        await mainServerCheck();
    } catch (err) {
        console.log('Main server is not responding');
    }
    
    console.log('\n📋 Summary:');
    console.log('- Test Server: http://localhost:3004');
    console.log('- Main Server: http://localhost:3002');
    console.log('\n💡 To start test server: npm run test');
    console.log('💡 To start main server: npm start');
}

checkStatus(); 