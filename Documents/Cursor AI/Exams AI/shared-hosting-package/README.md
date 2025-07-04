# Exam Pattern Analyzer - Shared Hosting Package

This package contains all the frontend files needed to deploy your Exam Pattern Analyzer to shared hosting.

## Quick Start

1. **Upload all files** from this package to your shared hosting's `public_html` or `www` directory
2. **Update the backend URL** in `js/config.js` to point to your deployed backend
3. **Test the application** by visiting your domain

## Files Included

```
├── index.html              # Main landing page
├── auth.html               # Authentication page
├── dashboard.html          # User dashboard
├── onboarding.html         # User onboarding
├── subjects.html           # Subject management
├── visual-analyzer.html    # Exam analysis
├── css/                    # Stylesheets
│   ├── style.css
│   └── dashboard.css
├── js/                     # JavaScript files
│   ├── config.js           # Configuration (UPDATE THIS!)
│   ├── auth.js
│   ├── dashboard.js
│   ├── onboarding.js
│   └── visual-analyzer.js
└── assets/                 # Images and other assets
    └── logo.png
```

## Important: Update Backend URL

Before uploading, you MUST update the backend URL in `js/config.js`:

```javascript
// Change this line in js/config.js
API_BASE_URL: 'https://your-backend-url.railway.app'
```

Replace `your-backend-url.railway.app` with your actual backend URL.

## Backend Requirements

Your backend must be deployed to an external service (Railway, Render, Heroku, etc.) and include:

- User authentication
- Token management
- OpenAI integration
- Database storage
- CORS configuration for your domain

## Testing

After uploading:

1. Visit your domain
2. Try to register/login
3. Test the onboarding process
4. Verify OpenAI integration works
5. Check token system functionality

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend allows requests from your domain
2. **404 Errors**: Verify the backend URL in `config.js` is correct
3. **Authentication Issues**: Check that your backend is running and accessible
4. **OpenAI Errors**: Ensure your backend has a valid OpenAI API key

### Support:

- Check browser console for JavaScript errors
- Verify backend logs for server-side issues
- Test API endpoints directly using tools like Postman

## Security Notes

- Never expose API keys in frontend code
- Use HTTPS for all API calls
- Implement proper CORS restrictions on your backend
- Validate all user inputs on both frontend and backend

## Cost Estimation

- **Shared Hosting**: $5-15/month (your existing hosting)
- **Backend Hosting**: $5-20/month (Railway/Render)
- **Database**: $5-15/month (PlanetScale/Railway)
- **OpenAI API**: $10-50/month (depending on usage)

**Total**: $25-100/month 