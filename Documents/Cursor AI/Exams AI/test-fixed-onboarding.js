#!/usr/bin/env node

const http = require('http');

console.log('🧪 Testing fixed onboarding approach...');

// Test the fixed onboarding page
const testFixedOnboarding = () => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3004,
            path: '/onboarding-fixed.html',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Fixed onboarding page: Accessible');
                    if (data.includes('Welcome to Exam Pattern Analyzer')) {
                        console.log('✅ Fixed onboarding page: Content loaded correctly');
                        resolve(true);
                    } else {
                        console.log('❌ Fixed onboarding page: Content not found');
                        reject(new Error('Content not found'));
                    }
                } else {
                    console.log(`❌ Fixed onboarding page: ${res.statusCode} - ${res.statusMessage}`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Fixed onboarding page: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('⏰ Fixed onboarding page: Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
};

// Test the fallback API endpoint
const testFallbackAPI = () => {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            examName: 'SAT',
            gradeLevel: '12th Grade',
            stream: 'Science'
        });

        const req = http.request({
            hostname: 'localhost',
            port: 3004,
            path: '/auth/onboarding/get-comprehensive-subjects-fallback',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Fallback API endpoint: Working');
                    try {
                        const response = JSON.parse(data);
                        if (response.mandatorySubjects && response.optionalSubjects) {
                            console.log('✅ Fallback API endpoint: Returns valid data');
                            resolve(true);
                        } else {
                            console.log('❌ Fallback API endpoint: Invalid data structure');
                            reject(new Error('Invalid data structure'));
                        }
                    } catch (error) {
                        console.log('❌ Fallback API endpoint: Invalid JSON response');
                        reject(error);
                    }
                } else {
                    console.log(`❌ Fallback API endpoint: ${res.statusCode} - ${res.statusMessage}`);
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (err) => {
            console.log(`❌ Fallback API endpoint: ${err.message}`);
            reject(err);
        });

        req.on('timeout', () => {
            console.log('⏰ Fallback API endpoint: Request timeout');
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(postData);
        req.end();
    });
};

// Run tests
async function runTests() {
    try {
        console.log('\n🔍 Testing fixed onboarding system...\n');
        
        await testFixedOnboarding();
        await testFallbackAPI();
        
        console.log('\n🎉 All tests passed!');
        console.log('\n📋 Next steps:');
        console.log('1. Open http://localhost:3004/auth.html');
        console.log('2. Sign up or log in');
        console.log('3. You will be redirected to the fixed onboarding page');
        console.log('4. Complete the multi-step setup');
        console.log('5. Access the dashboard');
        console.log('\n🌐 Direct access:');
        console.log('- Fixed Onboarding: http://localhost:3004/onboarding-fixed.html');
        console.log('- Simple Onboarding: http://localhost:3004/onboarding-simple.html');
        
    } catch (error) {
        console.log('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTests(); 