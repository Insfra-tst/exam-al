const fs = require('fs');
const path = require('path');

// Read the current .env file
const envPath = path.join(__dirname, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');

// Fix the OpenAI API key by putting it on a single line
const apiKey = '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';

// Replace the broken API key with the fixed one
envContent = envContent.replace(/OPENAI_API_KEY=.*?(?=\n|$)/s, `OPENAI_API_KEY=${apiKey}`);

// Write the fixed content back to .env
fs.writeFileSync(envPath, envContent);

console.log('✅ Fixed .env file - OpenAI API key is now on a single line');
console.log('🔄 Please restart the server to apply the changes'); 