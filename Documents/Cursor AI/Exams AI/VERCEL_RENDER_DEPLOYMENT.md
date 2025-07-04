# 🚀 Vercel + Render.com Deployment Guide

## 📋 **Overview**
This guide will help you deploy your Exam Pattern Analyzer using:
- **Frontend:** Vercel (Static files)
- **Backend:** Render.com (Node.js API)
- **Database:** Your existing MySQL database

## 🏗️ **Architecture**
```
Frontend (Vercel) → Backend (Render.com) → MySQL Database
     ↓                    ↓                    ↓
https://exam-analyzer.vercel.app → https://exam-analyzer-api.onrender.com → iextqmxf_exams
```

## 📁 **File Structure**
```
project/
├── public/                    # Frontend files (Vercel)
│   ├── index.html
│   ├── auth.html
│   ├── dashboard.html
│   ├── onboarding.html
│   ├── subjects.html
│   ├── visual-analyzer.html
│   ├── css/
│   ├── js/
│   └── assets/
├── vercel.json               # Vercel configuration
├── render-backend/           # Backend files (Render.com)
│   ├── server.js
│   ├── package.json
│   ├── database.js
│   ├── auth.js
│   ├── auth-routes.js
│   ├── token-manager.js
│   ├── payment-processor.js
│   └── payment-routes.js
└── README.md
```

## 🚀 **Step 1: Deploy Backend to Render.com**

### 1.1 Create Render.com Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub or email
3. Verify your account

### 1.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (or use manual deploy)
3. Choose "Build and deploy from a Git repository"

### 1.3 Configure Web Service
```
Name: exam-analyzer-api
Environment: Node
Region: Choose closest to your users
Branch: main
Root Directory: render-backend
Build Command: npm install
Start Command: node server.js
```

### 1.4 Set Environment Variables
In Render.com dashboard, go to "Environment" tab and add:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=iextqmxf_exams
DB_PASSWORD=D#3ItY3za(BZ
DB_NAME=iextqmxf_exams
DB_PORT=3306

# OpenAI Configuration
OPENAI_API_KEY=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

# JWT Configuration
JWT_SECRET=elaraix_exam_analyzer_jwt_secret_2024_secure_key_change_in_production

# Server Configuration
NODE_ENV=production
PORT=3000

# Token Configuration
TOKEN_PRICE_USD=10.00
TOKENS_PER_PURCHASE=300
TOKEN_VALIDITY_DAYS=365
TOKEN_COST_SUBJECT_ANALYSIS=15
TOKEN_COST_TOPIC_ANALYSIS=20
TOKEN_COST_VISUAL_DATA=25
TOKEN_COST_EXAM_VALIDATION=10
TOKEN_COST_SUBJECT_GENERATION=12
```

### 1.5 Deploy Backend
1. Click "Create Web Service"
2. Wait for build to complete
3. Note your service URL (e.g., `https://exam-analyzer-api.onrender.com`)

## 🚀 **Step 2: Deploy Frontend to Vercel**

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Install Vercel CLI (optional): `npm i -g vercel`

### 2.2 Update Vercel Configuration
Update `vercel.json` with your Render.com backend URL:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://exam-analyzer-api.onrender.com/api/$1"
    },
    {
      "src": "/auth/(.*)",
      "dest": "https://exam-analyzer-api.onrender.com/auth/$1"
    },
    {
      "src": "/payment/(.*)",
      "dest": "https://exam-analyzer-api.onrender.com/payment/$1"
    },
    {
      "src": "/tokens/(.*)",
      "dest": "https://exam-analyzer-api.onrender.com/tokens/$1"
    },
    {
      "src": "/health",
      "dest": "https://exam-analyzer-api.onrender.com/health"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

### 2.3 Deploy to Vercel
1. **Via GitHub (Recommended):**
   - Push your code to GitHub
   - Connect repository to Vercel
   - Vercel will auto-deploy

2. **Via Vercel CLI:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

3. **Via Vercel Dashboard:**
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Deploy

## 🧪 **Step 3: Test Your Deployment**

### 3.1 Test Backend (Render.com)
```bash
# Health check
curl https://exam-analyzer-api.onrender.com/health

# Expected response:
{
  "status": "OK",
  "timestamp": "...",
  "environment": "production",
  "version": "1.0.0",
  "database": "iextqmxf_exams",
  "platform": "Render.com"
}
```

### 3.2 Test Frontend (Vercel)
- Visit your Vercel URL (e.g., `https://exam-analyzer.vercel.app`)
- Should show your landing page
- Test registration/login functionality

### 3.3 Test API Integration
```bash
# Test registration
curl -X POST https://exam-analyzer-api.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login
curl -X POST https://exam-analyzer-api.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔧 **Step 4: Configure Custom Domain (Optional)**

### 4.1 Backend Domain (Render.com)
1. Go to your Render.com service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `api.elaraix.com`)
4. Update DNS records as instructed

### 4.2 Frontend Domain (Vercel)
1. Go to your Vercel project
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `elaraix.com`)
4. Update DNS records as instructed

## 📊 **Step 5: Monitor and Maintain**

### 5.1 Render.com Monitoring
- **Logs:** View real-time logs in Render.com dashboard
- **Metrics:** Monitor CPU, memory, and response times
- **Alerts:** Set up alerts for downtime

### 5.2 Vercel Monitoring
- **Analytics:** View page views and performance
- **Functions:** Monitor API route performance
- **Deployments:** Track deployment history

### 5.3 Database Monitoring
- Monitor your MySQL database performance
- Set up backups
- Track OpenAI API usage

## 🔒 **Security Considerations**

### 6.1 Environment Variables
- ✅ Never commit sensitive data to Git
- ✅ Use strong JWT secrets
- ✅ Keep OpenAI API key secure

### 6.2 CORS Configuration
- ✅ Configure CORS for your specific domains
- ✅ Limit allowed origins in production

### 6.3 Rate Limiting
- ✅ Rate limiting is enabled on Render.com
- ✅ Monitor for abuse

## 💰 **Cost Estimation**

### Render.com (Backend)
- **Free Tier:** $0/month (limited)
- **Paid Tier:** $7/month (recommended for production)

### Vercel (Frontend)
- **Free Tier:** $0/month (generous limits)
- **Pro Plan:** $20/month (if needed)

### Total Monthly Cost
- **Development:** $0-7/month
- **Production:** $7-27/month

## 🚨 **Troubleshooting**

### Common Issues

#### 1. Database Connection
```bash
# Test database connection
mysql -h localhost -u iextqmxf_exams -p iextqmxf_exams
```

#### 2. CORS Errors
- Check CORS configuration in `server.js`
- Verify allowed origins include your Vercel domain

#### 3. Environment Variables
- Ensure all environment variables are set in Render.com
- Check variable names match exactly

#### 4. Build Failures
- Check `package.json` dependencies
- Verify Node.js version compatibility

## 📞 **Support**

### Render.com Support
- [Render.com Documentation](https://render.com/docs)
- [Render.com Community](https://community.render.com)

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

## 🎯 **Next Steps**

1. **Deploy backend to Render.com**
2. **Deploy frontend to Vercel**
3. **Test all functionality**
4. **Configure custom domains**
5. **Set up monitoring**
6. **Optimize performance**

Your application will be live at:
- **Frontend:** `https://exam-analyzer.vercel.app`
- **Backend:** `https://exam-analyzer-api.onrender.com`

**Let me know if you need help with any specific step!** 🚀 