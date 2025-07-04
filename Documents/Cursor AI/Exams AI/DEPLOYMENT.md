# 🚀 Deployment Guide - Exam Pattern Analyzer

## Quick Deploy Options

### 1. **Render.com** (Recommended - Easiest)

#### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure you have these files:
   - `package.json` (with start script)
   - `server.js` (main entry point)
   - `.env.example` (for environment variables)

#### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `exam-pattern-analyzer`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid)

#### Step 3: Set Environment Variables
In Render dashboard, go to Environment → Environment Variables:
```
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=your_secure_session_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

#### Step 4: Deploy
Click "Create Web Service" - Render will automatically deploy your app!

---

### 2. **Railway.app** (Very Easy)

#### Step 1: Deploy
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys

#### Step 2: Set Environment Variables
In Railway dashboard → Variables tab, add the same environment variables as above.

---

### 3. **Vercel** (Frontend Optimized)

#### Step 1: Deploy
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects and deploys

#### Step 2: Configure
- Framework Preset: `Node.js`
- Build Command: `npm install`
- Output Directory: `public`
- Install Command: `npm install`

---

## Environment Variables Setup

### Required Variables
```bash
# Core Configuration
NODE_ENV=production
PORT=10000
SESSION_SECRET=your_very_secure_random_string_here

# OpenAI API (Required)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Email Configuration (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# OAuth Configuration (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### How to Get API Keys

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Go to API Keys section
4. Create new API key
5. Copy and use in your environment variables

#### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins

#### Email Setup (Optional)
1. Use Gmail with App Password
2. Enable 2-factor authentication
3. Generate App Password
4. Use in EMAIL_PASS variable

---

## Post-Deployment Checklist

### ✅ Verify Deployment
1. Check if your app is accessible via the provided URL
2. Test user registration and login
3. Test onboarding flow
4. Test exam validation with OpenAI
5. Test subject selection and dashboard

### ✅ Security Checklist
1. ✅ Environment variables are set (not in code)
2. ✅ SESSION_SECRET is a strong random string
3. ✅ HTTPS is enabled (automatic on most platforms)
4. ✅ API keys are secure and not exposed

### ✅ Performance Checklist
1. ✅ App loads within 3 seconds
2. ✅ OpenAI API calls work properly
3. ✅ User sessions persist correctly
4. ✅ No console errors in browser

---

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors
- Ensure all dependencies are in `package.json`
- Check if `npm install` completed successfully

#### 2. "Port already in use"
- Most platforms set PORT automatically
- Ensure your app uses `process.env.PORT`

#### 3. "OpenAI API key invalid"
- Check if API key is correctly set in environment variables
- Verify the key has proper permissions

#### 4. "Session not persisting"
- Check SESSION_SECRET is set
- Ensure cookies are working (HTTPS in production)

#### 5. "Email not sending"
- Verify EMAIL_USER and EMAIL_PASS are correct
- Check if using App Password for Gmail

### Getting Help
- Check platform-specific logs in your hosting dashboard
- Verify all environment variables are set correctly
- Test locally with the same environment variables

---

## Cost Comparison

| Platform | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Render** | ✅ Yes | $7+/month | Full-stack apps |
| **Railway** | ✅ Limited | $5+/month | Quick deployments |
| **Vercel** | ✅ Yes | $20+/month | Frontend-heavy apps |
| **Heroku** | ❌ No | $7+/month | Traditional hosting |
| **DigitalOcean** | ❌ No | $5+/month | Full control |

---

## Recommendation

**For your Exam Pattern Analyzer, I recommend Render.com because:**
- ✅ Free tier available
- ✅ Excellent Node.js support
- ✅ Easy environment variable management
- ✅ Automatic HTTPS
- ✅ Good performance
- ✅ Simple deployment process

Start with Render's free tier and upgrade if you need more resources! 