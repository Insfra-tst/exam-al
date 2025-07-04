# 🚀 Elaraix.com/Exam Deployment Guide

## Your Database Configuration
- **Database Name**: `iextqmxf_exams`
- **Username**: `iextqmxf_exams`
- **Password**: `D#3ItY3za(BZ`
- **Host**: `localhost`
- **Port**: `3306`

## 📁 File Structure on Your Hosting

```
elaraix.com/exam/           # Backend files
├── server.js               # Main server file
├── package.json            # Dependencies
├── env-production.js       # Environment configuration
├── database-shared.js      # Database connection
├── auth-mysql.js           # Authentication
├── auth-routes.js          # Auth routes
├── token-manager.js        # Token management
├── payment-processor.js    # Payment processing
├── payment-routes.js       # Payment routes
├── start-app.sh            # Startup script
└── database.sql            # Database schema

elaraix.com/exam/public/    # Frontend files
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

## 🔧 Step-by-Step Deployment

### Step 1: Upload Files
1. Upload all files from `shared-hosting-backend/` to `elaraix.com/exam/`
2. Upload all files from `public/` to `elaraix.com/exam/public/`

### Step 2: Set File Permissions
```bash
chmod +x start-app.sh
chmod 755 elaraix.com/exam/
chmod 644 elaraix.com/exam/*.js
```

### Step 3: Install Dependencies
```bash
cd elaraix.com/exam
npm install --production
```

### Step 4: Import Database Schema
1. Go to phpMyAdmin in your hosting control panel
2. Select database `iextqmxf_exams`
3. Import `database.sql` file

### Step 5: Start Application

#### Option A: Using Startup Script
```bash
cd elaraix.com/exam
./start-app.sh
```

#### Option B: Manual Start
```bash
cd elaraix.com/exam
node server.js
```

#### Option C: Via Hosting Control Panel
1. Go to "Node.js" or "Application Manager"
2. Set startup file: `server.js`
3. Set port: `3000`
4. Click "Start"

## 🧪 Testing Your Application

### Health Check
Visit: `https://elaraix.com/exam/health`
Expected: `{"status":"OK","timestamp":"...","environment":"production"}`

### Frontend
Visit: `https://elaraix.com/exam/`
Should show the main landing page

### API Endpoints
- Registration: `https://elaraix.com/exam/auth/register`
- Login: `https://elaraix.com/exam/auth/login`
- Token Balance: `https://elaraix.com/exam/tokens/balance`

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
mysql -h localhost -u iextqmxf_exams -p iextqmxf_exams
# Enter password: D#3ItY3za(BZ
```

### Port Issues
If port 3000 is busy, edit `env-production.js`:
```javascript
process.env.PORT = '3001'; // or any available port
```

### File Permission Issues
```bash
chmod 755 elaraix.com/exam
chmod 644 elaraix.com/exam/*.js
chmod +x elaraix.com/exam/start-app.sh
```

### Node.js Version Check
```bash
node --version
# Should be 16 or higher
```

## 📊 Monitoring

### Check Application Status
```bash
ps aux | grep node
```

### View Logs
```bash
tail -f elaraix.com/exam/logs/app.log
```

### Restart Application
```bash
pkill node
cd elaraix.com/exam
node server.js
```

## 🔒 Security Notes

- ✅ Database credentials are configured
- ✅ JWT secret is set
- ✅ OpenAI API key is configured
- ✅ HTTPS is recommended
- ✅ Environment variables are secure

## 🎯 Quick Commands

```bash
# Connect to hosting
ssh username@elaraix.com

# Navigate to app
cd elaraix.com/exam

# Install dependencies
npm install --production

# Start with script
./start-app.sh

# Manual start
node server.js

# Check status
curl https://elaraix.com/exam/health
```

## 📞 Support

If you encounter issues:
1. Check the logs: `tail -f logs/app.log`
2. Verify database connection
3. Check Node.js version
4. Ensure all files are uploaded correctly

Your application should now be running at `https://elaraix.com/exam`! 🎉 

# Connect to your server
ssh username@elaraix.com

# Navigate to your application directory
cd /path/to/elaraix.com/exam

# Check if your files are there
ls -la

# You should see these files:
# - server.js
# - package.json
# - env-production.js
# - database-shared.js
# - auth-mysql.js
# - auth-routes.js
# - token-manager.js
# - payment-processor.js
# - payment-routes.js
# - database.sql 