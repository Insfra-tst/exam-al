# ⚡ Quick Deploy Guide

## 🎯 **EASIEST OPTION: Render.com**

### Step 1: Prepare Your Code
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy on Render
1. **Go to [render.com](https://render.com)** and sign up
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure:**
   - Name: `exam-pattern-analyzer`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**

### Step 3: Set Environment Variables
In Render dashboard → Environment → Environment Variables:

**Required:**
```
NODE_ENV=production
OPENAI_API_KEY=sk-your_actual_openai_api_key_here
SESSION_SECRET=your_very_secure_random_string_here
```

**Optional:**
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 4: Deploy!
Click "Create Web Service" - your app will be live in 2-3 minutes!

---

## 🔑 **Get Your OpenAI API Key**

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Go to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)
6. Use it in your environment variables

---

## ✅ **Test Your Deployment**

After deployment, test these features:
1. ✅ User registration/login
2. ✅ Exam validation with OpenAI
3. ✅ Subject selection
4. ✅ Dashboard display
5. ✅ Visual analyzer

---

## 🆘 **Need Help?**

- **Render logs**: Check your service dashboard for error logs
- **Environment variables**: Make sure all required variables are set
- **API key**: Verify your OpenAI API key is correct and has credits

---

## 💰 **Costs**

- **Render Free Tier**: $0/month (perfect for testing)
- **OpenAI API**: ~$0.01-0.10 per exam validation (very cheap)
- **Total**: Less than $1/month for light usage

---

## 🚀 **Alternative: Railway.app**

If Render doesn't work:
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Set environment variables
6. Deploy!

---

**Your app will be live at: `https://your-app-name.onrender.com`** 