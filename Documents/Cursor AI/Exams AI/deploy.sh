#!/bin/bash

# 🚀 Exam Pattern Analyzer - Deployment Script
# This script helps prepare your app for deployment

echo "🚀 Exam Pattern Analyzer - Deployment Preparation"
echo "================================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin YOUR_GITHUB_REPO_URL"
    echo "   git push -u origin main"
    exit 1
fi

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ .env.example not found. Creating one..."
    cat > .env.example << EOF
# Core Configuration
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-secret-key-change-in-production

# OpenAI API (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
EOF
    echo "✅ Created .env.example"
fi

# Check if package.json has start script
if ! grep -q '"start"' package.json; then
    echo "❌ package.json missing start script. Please add:"
    echo '   "start": "node server.js"'
    exit 1
fi

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found. This is required for deployment."
    exit 1
fi

echo "✅ Basic checks passed!"

echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push"

echo ""
echo "2. Choose your hosting platform:"
echo "   🎯 Render.com (Recommended): https://render.com"
echo "   🚂 Railway.app: https://railway.app"
echo "   ⚡ Vercel: https://vercel.com"

echo ""
echo "3. Set environment variables in your hosting platform:"
echo "   - NODE_ENV=production"
echo "   - OPENAI_API_KEY=your_actual_api_key"
echo "   - SESSION_SECRET=your_secure_random_string"
echo "   - Other variables as needed"

echo ""
echo "4. Deploy and test your application!"

echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo "🔧 For troubleshooting, check the deployment guide" 