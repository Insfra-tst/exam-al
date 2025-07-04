#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing new onboarding approach...');

// Test the simple onboarding page
const testSimpleOnboarding = () => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3004,
            path: '/onboarding-simple.html',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Simple onboarding page: Accessible');
                    if (data.includes('Quick Setup')) {
                        console.log('✅ Simple onboarding page: Content loaded correctly');
                        resolve(true);
                    } else {
                        console.log('❌ Simple onboarding page: Content not found');
                        reject(new Error('Content not found'));
                    }
                } else {
                    console.log(`❌ Simple onboarding page: ${res.statusCode} - ${res.statusMessage}`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Simple onboarding page: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('⏰ Simple onboarding page: Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
};

// Test the auth page
const testAuthPage = () => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3004,
            path: '/auth.html',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            if (res.statusCode === 200) {
                console.log('✅ Auth page: Accessible');
                resolve(true);
            } else {
                console.log(`❌ Auth page: ${res.statusCode} - ${res.statusMessage}`);
                reject(new Error(`HTTP ${res.statusCode}`));
            }
        });

        req.on('error', (err) => {
            console.log(`❌ Auth page: ${err.message}`);
            reject(err);
        });

        req.end();
    });
};

// Run tests
async function runTests() {
    try {
        console.log('\n🔍 Testing server endpoints...\n');
        
        await testAuthPage();
        await testSimpleOnboarding();
        
        console.log('\n🎉 All tests passed!');
        console.log('\n📋 Next steps:');
        console.log('1. Open http://localhost:3004/auth.html');
        console.log('2. Sign up or log in');
        console.log('3. You will be redirected to the new simple onboarding page');
        console.log('4. Complete the quick setup');
        console.log('5. Access the dashboard');
        
    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTests(); 