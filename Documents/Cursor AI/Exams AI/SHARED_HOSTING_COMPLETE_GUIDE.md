# Complete Shared Hosting Deployment Guide

## Overview
This guide will help you deploy your **entire Exam Pattern Analyzer** (frontend + backend + database) to shared hosting.

## Prerequisites
- Shared hosting with **Node.js support**
- **MySQL database** (usually included with shared hosting)
- **SSH access** (recommended but not required)

## Step 1: Check Your Shared Hosting Requirements

### Required Features:
- ✅ Node.js support (version 16 or higher)
- ✅ MySQL database
- ✅ SSH access (for easier deployment)
- ✅ Environment variables support
- ✅ Custom domain support

### Popular Shared Hosting Providers:
- **Hostinger** (recommended)
- **A2 Hosting**
- **InMotion Hosting**
- **Bluehost**
- **HostGator**

## Step 2: Prepare Your Files

### 2.1 Create Deployment Package
Your files are already organized in the `shared-hosting-backend/` directory.

### 2.2 Required Files Structure:
```
your-domain.com/
├── public/                    # Frontend files
│   ├── index.html
│   ├── auth.html
│   ├── dashboard.html
│   ├── onboarding.html
│   ├── subjects.html
│   ├── visual-analyzer.html
│   ├── css/
│   ├── js/
│   └── assets/
├── server.js                  # Main server file
├── package.json              # Dependencies
├── .env                      # Environment variables
├── auth-mysql.js
├── auth-routes.js
├── database.js
├── token-manager.js
├── payment-processor.js
├── payment-routes.js
└── database.sql              # Database schema
```

## Step 3: Upload Files to Shared Hosting

### 3.1 Using File Manager (Web Interface)
1. Log into your hosting control panel
2. Go to File Manager
3. Navigate to your domain's root directory (usually `public_html`)
4. Upload all files from the `shared-hosting-backend/` directory
5. Upload the entire `public/` directory

### 3.2 Using FTP/SFTP (Recommended)
```bash
# Connect to your hosting
ftp your-domain.com
# or
sftp username@your-domain.com

# Upload files
put -r shared-hosting-backend/* ./
put -r public/ ./
```

### 3.3 Using SSH (if available)
```bash
# Connect via SSH
ssh username@your-domain.com

# Upload files using scp
scp -r shared-hosting-backend/* username@your-domain.com:public_html/
scp -r public/ username@your-domain.com:public_html/
```

## Step 4: Set Up Database

### 4.1 Create MySQL Database
1. Go to your hosting control panel
2. Find "MySQL Databases" or "Database Manager"
3. Create a new database (e.g., `exam_ai_db`)
4. Create a database user
5. Assign the user to the database with full privileges

### 4.2 Import Database Schema
1. Go to phpMyAdmin (usually available in hosting control panel)
2. Select your database
3. Go to "Import" tab
4. Upload the `database.sql` file
5. Click "Go" to import

## Step 5: Configure Environment Variables

### 5.1 Create .env File
Create a `.env` file in your root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=exam_ai_db
DB_PORT=3306

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### 5.2 Update Database Configuration
Edit `database.js` to use your hosting's MySQL settings:

```javascript
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'your_database_user',
    password: process.env.DB_PASSWORD || 'your_database_password',
    database: process.env.DB_NAME || 'exam_ai_db',
    port: process.env.DB_PORT || 3306,
    // Remove connection pool settings for shared hosting
    // connectionLimit: 10,
    // acquireTimeout: 60000,
    // timeout: 60000,
    // reconnect: true
};
```

## Step 6: Install Dependencies

### 6.1 Via SSH (Recommended)
```bash
ssh username@your-domain.com
cd public_html
npm install --production
```

### 6.2 Via Hosting Control Panel
1. Go to your hosting control panel
2. Find "Node.js" or "Application Manager"
3. Set the startup file to `server.js`
4. Set the Node.js version to 16 or higher
5. Install dependencies (if option available)

## Step 7: Start the Application

### 7.1 Via SSH
```bash
ssh username@your-domain.com
cd public_html
node server.js
```

### 7.2 Via Hosting Control Panel
1. Go to "Node.js" or "Application Manager"
2. Set startup command: `node server.js`
3. Set port: `3000`
4. Click "Start" or "Deploy"

### 7.3 Using PM2 (if available)
```bash
ssh username@your-domain.com
cd public_html
npm install -g pm2
pm2 start server.js --name "exam-analyzer"
pm2 startup
pm2 save
```

## Step 8: Configure Domain

### 8.1 Set Up Domain Routing
1. Go to your hosting control panel
2. Find "Domain Manager" or "DNS"
3. Point your domain to the Node.js application
4. Set up subdomain if needed (e.g., `api.yourdomain.com`)

### 8.2 SSL Certificate
1. Enable SSL certificate for your domain
2. Force HTTPS redirect in your hosting settings

## Step 9: Test Your Application

### 9.1 Health Check
Visit: `https://yourdomain.com/health`
Should return: `{"status":"OK","timestamp":"...","environment":"production"}`

### 9.2 Frontend Test
Visit: `https://yourdomain.com/`
Should show the main landing page

### 9.3 API Test
Test registration: `https://yourdomain.com/auth/register`
Test login: `https://yourdomain.com/auth/login`

## Step 10: Troubleshooting

### Common Issues:

#### 1. Port Issues
**Problem**: Application can't start on port 3000
**Solution**: 
- Check if port 3000 is available
- Use a different port (update .env file)
- Contact hosting support

#### 2. Database Connection
**Problem**: Can't connect to MySQL
**Solution**:
- Verify database credentials in .env
- Check if database exists
- Ensure user has proper permissions

#### 3. Node.js Version
**Problem**: Application won't start
**Solution**:
- Check Node.js version: `node --version`
- Update to version 16 or higher
- Contact hosting support if needed

#### 4. File Permissions
**Problem**: Can't read/write files
**Solution**:
```bash
chmod 755 public_html
chmod 644 public_html/*.js
chmod 644 public_html/.env
```

#### 5. Memory Issues
**Problem**: Application crashes
**Solution**:
- Reduce connection pool size
- Optimize database queries
- Contact hosting support for more memory

## Step 11: Monitoring and Maintenance

### 11.1 Logs
Check application logs:
```bash
ssh username@your-domain.com
cd public_html
tail -f logs/app.log  # if logging is configured
```

### 11.2 Performance
- Monitor database performance
- Check OpenAI API usage
- Monitor server resources

### 11.3 Backups
- Regular database backups
- File backups
- Environment variable backups

## Step 12: Security Considerations

### 12.1 Environment Variables
- Never commit .env file to version control
- Use strong JWT secrets
- Keep OpenAI API key secure

### 12.2 Database Security
- Use strong database passwords
- Limit database user permissions
- Regular security updates

### 12.3 Application Security
- Enable HTTPS
- Validate all inputs
- Implement rate limiting
- Regular dependency updates

## Cost Estimation

### Monthly Costs:
- **Shared Hosting**: $5-15/month
- **Domain**: $10-15/year
- **OpenAI API**: $10-50/month (depending on usage)
- **SSL Certificate**: Usually free with hosting

**Total**: $15-65/month

## Support

### Hosting Support:
- Contact your hosting provider for Node.js issues
- Check hosting documentation for Node.js setup

### Application Support:
- Check logs for error messages
- Test individual components
- Verify environment variables

## Next Steps

1. **Deploy to your shared hosting**
2. **Test all features**
3. **Set up monitoring**
4. **Configure backups**
5. **Optimize performance**

## Quick Commands Reference

```bash
# Connect to hosting
ssh username@your-domain.com

# Navigate to app directory
cd public_html

# Install dependencies
npm install --production

# Start application
node server.js

# Check logs
tail -f logs/app.log

# Restart application
pkill node
node server.js

# Check Node.js version
node --version

# Check npm version
npm --version
```

Your application should now be fully functional on shared hosting! 