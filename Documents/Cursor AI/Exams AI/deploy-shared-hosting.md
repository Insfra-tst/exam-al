# Shared Hosting Deployment Guide

## Overview
This guide will help you deploy your Exam Pattern Analyzer to shared hosting by separating the frontend and backend components.

## Architecture for Shared Hosting

### Frontend (Your Shared Hosting)
- Static HTML, CSS, JavaScript files
- Communicates with external backend APIs
- No Node.js server required

### Backend (External Services)
- **Backend API**: Deploy to services like:
  - Railway (recommended)
  - Render
  - Heroku
  - DigitalOcean App Platform
- **Database**: Use external MySQL hosting:
  - PlanetScale (recommended)
  - Railway MySQL
  - AWS RDS
  - DigitalOcean Managed Databases

## Step 1: Prepare Frontend for Shared Hosting

### 1.1 Create Frontend-Only Version
The frontend files are already in the `public/` directory and ready for deployment.

### 1.2 Update API Endpoints
You'll need to update all API calls to point to your external backend URL.

### 1.3 Files to Upload to Shared Hosting
```
public/
├── index.html
├── auth.html
├── dashboard.html
├── onboarding.html
├── subjects.html
├── visual-analyzer.html
├── css/
├── js/
└── assets/
```

## Step 2: Deploy Backend to External Service

### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the backend files
4. Add environment variables:
   - `OPENAI_API_KEY`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Option B: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Set build command: `npm install`
5. Set start command: `node server-mysql.js`

## Step 3: Database Setup

### Option A: PlanetScale (Recommended)
1. Go to [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get the connection string
4. Update your backend environment variables

### Option B: Railway MySQL
1. Create MySQL database in Railway
2. Use the provided connection string

## Step 4: Update Frontend Configuration

### 4.1 Create Configuration File
Create `public/js/config.js`:

```javascript
// Configuration for shared hosting deployment
window.APP_CONFIG = {
    // Replace with your backend URL
    API_BASE_URL: 'https://your-backend-url.railway.app',
    
    // Environment
    ENVIRONMENT: 'production',
    
    // Features
    FEATURES: {
        OPENAI_INTEGRATION: true,
        TOKEN_SYSTEM: true,
        PAYMENT_SYSTEM: true
    }
};
```

### 4.2 Update API Calls
All API calls should use the config:

```javascript
// Instead of relative URLs like '/auth/login'
// Use: APP_CONFIG.API_BASE_URL + '/auth/login'

const response = await fetch(APP_CONFIG.API_BASE_URL + '/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
});
```

## Step 5: CORS Configuration

### 5.1 Backend CORS Setup
Update your backend to allow requests from your shared hosting domain:

```javascript
// In server-mysql.js
const cors = require('cors');

app.use(cors({
    origin: [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
        'http://localhost:3000' // for development
    ],
    credentials: true
}));
```

## Step 6: Environment Variables

### 6.1 Backend Environment Variables
Set these in your external backend service:

```env
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_openai_key
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### 6.2 Frontend Environment Variables
Create `public/js/env.js` (for public variables only):

```javascript
window.ENV = {
    OPENAI_API_KEY: 'your_openai_key', // Only if needed on frontend
    APP_NAME: 'Exam Pattern Analyzer'
};
```

## Step 7: Deployment Checklist

### Frontend (Shared Hosting)
- [ ] Upload all files from `public/` directory
- [ ] Update `config.js` with correct backend URL
- [ ] Test all API calls work with external backend
- [ ] Verify CORS is working
- [ ] Test authentication flow
- [ ] Test OpenAI integration

### Backend (External Service)
- [ ] Deploy to Railway/Render/Heroku
- [ ] Set all environment variables
- [ ] Connect to external database
- [ ] Test all API endpoints
- [ ] Verify OpenAI integration works
- [ ] Test payment system

### Database
- [ ] Set up external MySQL database
- [ ] Run database migrations
- [ ] Test database connections
- [ ] Verify data persistence

## Step 8: Testing

### 8.1 Local Testing
1. Start backend locally: `node server-mysql.js`
2. Update `config.js` to point to localhost
3. Test all features

### 8.2 Production Testing
1. Deploy backend to external service
2. Update `config.js` with production URL
3. Upload frontend to shared hosting
4. Test all features in production

## Step 9: Monitoring and Maintenance

### 9.1 Backend Monitoring
- Monitor API response times
- Check error logs
- Monitor database performance
- Track OpenAI API usage

### 9.2 Frontend Monitoring
- Monitor page load times
- Check for JavaScript errors
- Verify API calls are working
- Test user flows regularly

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check backend CORS configuration
2. **API 404 Errors**: Verify backend URL in config
3. **Database Connection**: Check database connection string
4. **OpenAI Errors**: Verify API key is set correctly

### Support
- Backend logs: Check your external service dashboard
- Frontend errors: Check browser console
- Database issues: Check database service dashboard

## Cost Estimation

### Monthly Costs (Approximate)
- **Backend Hosting**: $5-20/month (Railway/Render)
- **Database**: $5-15/month (PlanetScale/Railway)
- **OpenAI API**: $10-50/month (depending on usage)
- **Shared Hosting**: $5-15/month (your existing hosting)

**Total**: $25-100/month depending on usage and services chosen.

## Security Considerations

1. **API Keys**: Never expose sensitive keys in frontend code
2. **CORS**: Restrict to your domain only
3. **HTTPS**: Use HTTPS for all API calls
4. **Rate Limiting**: Implement on backend
5. **Input Validation**: Validate all user inputs

## Next Steps

1. Choose your backend hosting service
2. Set up external database
3. Deploy backend
4. Update frontend configuration
5. Upload to shared hosting
6. Test thoroughly
7. Monitor and maintain 