# 🚀 Vercel Frontend Deployment Guide

This guide will help you deploy your Exam AI frontend to Vercel and connect it to your Render.com backend.

## 📋 **Prerequisites**

- ✅ Backend deployed on Render.com: [https://exam-ai-backend.onrender.com](https://exam-ai-backend.onrender.com)
- ✅ GitHub repository with frontend code
- ✅ Vercel account (free)

## 🔧 **Step 1: Prepare Your Repository**

1. **Update API Configuration** ✅
   - Updated `public/js/config.js` to point to your Render.com backend
   - API_BASE_URL now points to: `https://exam-ai-backend.onrender.com`

2. **Vercel Configuration** ✅
   - Created `vercel.json` with proper routing
   - Configured static file serving
   - Added security headers

## 🚀 **Step 2: Deploy to Vercel**

### **Option A: Deploy via Vercel Dashboard**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Configure the project:**
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (or `/`)
   - **Build Command**: Leave empty
   - **Output Directory**: `public`
   - **Install Command**: Leave empty

6. **Environment Variables** (if needed):
   ```
   API_BASE_URL=https://exam-ai-backend.onrender.com
   ```

7. **Click "Deploy"**

### **Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: exam-ai-frontend
# - Directory: ./
# - Override settings? No
```

## 🔗 **Step 3: Configure Custom Domain (Optional)**

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Click "Domains"
   - Add your custom domain: `elaraix.com`

2. **Update DNS Records:**
   - Add CNAME record: `exam` → `your-vercel-app.vercel.app`
   - Or use Vercel's automatic DNS configuration

## 🧪 **Step 4: Test Your Deployment**

### **Test API Connection:**
```javascript
// Open browser console on your deployed site
fetch('https://exam-ai-backend.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('Backend connected:', data))
  .catch(error => console.error('Backend error:', error));
```

### **Test Authentication:**
1. Go to your deployed site
2. Try to register/login
3. Check if tokens are working
4. Test onboarding flow

## 🔧 **Step 5: Update Your Current Site**

Since you want [https://elaraix.com/exam/](https://elaraix.com/exam/) to work:

### **Option A: Deploy to Vercel and Update DNS**
1. Deploy to Vercel (get a URL like `exam-ai-frontend.vercel.app`)
2. Update your DNS to point `elaraix.com/exam` to the Vercel URL

### **Option B: Deploy to Your Current Hosting**
1. Upload the updated files to your current hosting
2. Make sure the `public/js/config.js` is updated
3. Test the connection

## 📊 **Expected File Structure on Vercel**

```
/
├── public/
│   ├── index.html
│   ├── auth.html
│   ├── dashboard.html
│   ├── onboarding.html
│   ├── subjects.html
│   ├── analysis.html
│   ├── results.html
│   ├── topics.html
│   ├── settings.html
│   ├── heatmap.html
│   ├── visual-analyzer.html
│   ├── question-predictor.html
│   ├── question-types.html
│   ├── topic-analysis.html
│   ├── short-notes.html
│   ├── easy-ways-to-learn.html
│   ├── example-questions.html
│   ├── advanced-question.html
│   ├── js/
│   │   └── config.js (✅ Updated with new API URL)
│   ├── css/
│   └── styles.css
├── vercel.json (✅ Configured)
└── README.md
```

## 🔍 **Troubleshooting**

### **CORS Issues:**
- Backend already has CORS configured for Render.com
- Frontend should work without issues

### **API Connection Issues:**
- Check browser console for errors
- Verify API_BASE_URL in config.js
- Test backend health endpoint

### **Authentication Issues:**
- Check if JWT tokens are being stored
- Verify localStorage is working
- Check network tab for API calls

## 🎯 **Success Indicators**

✅ **Backend Health Check:**
```bash
curl https://exam-ai-backend.onrender.com/health
# Should return: {"status":"ok","message":"Server is running"}
```

✅ **Frontend API Connection:**
- Open browser console
- Run: `fetch('https://exam-ai-backend.onrender.com/health')`
- Should return success response

✅ **User Registration/Login:**
- Should work without errors
- Tokens should be stored in localStorage
- Dashboard should load after login

## 📞 **Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Test API endpoints directly
4. Verify environment variables

---

**Your Backend URL:** [https://exam-ai-backend.onrender.com](https://exam-ai-backend.onrender.com)  
**Your Frontend URL:** [https://elaraix.com/exam/](https://elaraix.com/exam/)

Once deployed, your frontend will automatically connect to your Render.com backend! 🚀 