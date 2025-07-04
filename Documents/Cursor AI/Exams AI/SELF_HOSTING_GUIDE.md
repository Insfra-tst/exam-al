# 🏠 Self-Hosting Guide - Exam Pattern Analyzer

## Overview

This guide will help you host the Exam Pattern Analyzer on your own server using MySQL database. This approach gives you complete control over your data and infrastructure.

## 🎯 **Prerequisites**

### Server Requirements
- **OS**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows
- **RAM**: Minimum 2GB (4GB+ recommended)
- **Storage**: 10GB+ free space
- **Node.js**: Version 16.0.0 or higher
- **MySQL**: Version 8.0 or higher

### Domain & SSL (Optional but Recommended)
- Domain name
- SSL certificate (Let's Encrypt is free)

## 🚀 **Step-by-Step Setup**

### 1. **Server Preparation**

#### Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# Download from https://nodejs.org/
```

#### Install MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# macOS
brew install mysql

# Windows
# Download MySQL Installer from https://dev.mysql.com/downloads/installer/
```

#### Start MySQL Service
```bash
# Ubuntu/Debian
sudo systemctl start mysql
sudo systemctl enable mysql

# macOS
brew services start mysql

# Windows
# MySQL service should start automatically
```

### 2. **Database Setup**

#### Secure MySQL Installation
```bash
sudo mysql_secure_installation
```

#### Create Database and User
```bash
sudo mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE exam_analyzer;
USE exam_analyzer;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'exam_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON exam_analyzer.* TO 'exam_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Import Database Schema
```bash
# Navigate to your project directory
cd /path/to/exam-analyzer

# Import the schema
mysql -u exam_user -p exam_analyzer < database.sql
```

### 3. **Application Setup**

#### Clone/Download Application
```bash
# If using git
git clone https://github.com/your-username/exam-analyzer.git
cd exam-analyzer

# Or download and extract the ZIP file
```

#### Install Dependencies
```bash
npm install
```

#### Configure Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit the configuration
nano .env
```

**Required Configuration:**
```env
# Core Configuration
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-very-secure-session-secret-here

# OpenAI API (Required)
OPENAI_API_KEY=sk-your_actual_openai_api_key_here

# Database Configuration (Required)
DB_HOST=localhost
DB_USER=exam_user
DB_PASSWORD=your_password
DB_NAME=exam_analyzer
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-very-secure-jwt-secret-here

# Base URL for your domain
BASE_URL=https://yourdomain.com
```

### 4. **Testing the Setup**

#### Test Database Connection
```bash
# Test the database connection
node -e "
const { testConnection } = require('./database');
testConnection().then(result => {
    console.log('Database test result:', result);
    process.exit(result ? 0 : 1);
});
"
```

#### Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

#### Test the Application
```bash
# Check if server is running
curl http://localhost:3000/api/status

# Should return: {"status":"running","timestamp":"...","environment":"production"}
```

### 5. **Production Deployment**

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start server-mysql.js --name "exam-analyzer"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Using Systemd (Alternative)
```bash
# Create service file
sudo nano /etc/systemd/system/exam-analyzer.service
```

```ini
[Unit]
Description=Exam Pattern Analyzer
After=network.target mysql.service

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/exam-analyzer
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server-mysql.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl enable exam-analyzer
sudo systemctl start exam-analyzer
sudo systemctl status exam-analyzer
```

### 6. **Web Server Setup (Nginx)**

#### Install Nginx
```bash
sudo apt install nginx
```

#### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/exam-analyzer
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/exam-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. **SSL Certificate (Let's Encrypt)**

#### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

#### Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### Auto-renewal
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot creates a cron job automatically
```

## 🔧 **Maintenance & Monitoring**

### Database Backups
```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/exam-analyzer"
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u exam_user -p exam_analyzer > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /path/to/exam-analyzer

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Monitoring
```bash
# Check application status
pm2 status
pm2 logs exam-analyzer

# Check database
mysql -u exam_user -p -e "SHOW PROCESSLIST;"

# Check disk space
df -h

# Check memory usage
free -h
```

### Updates
```bash
# Stop the application
pm2 stop exam-analyzer

# Backup current version
cp -r /path/to/exam-analyzer /path/to/exam-analyzer-backup

# Update code
git pull origin main
# or download new version

# Install dependencies
npm install

# Start the application
pm2 start exam-analyzer

# Check status
pm2 status
```

## 🛠️ **Troubleshooting**

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log

# Test connection manually
mysql -u exam_user -p -h localhost
```

#### Application Won't Start
```bash
# Check logs
pm2 logs exam-analyzer

# Check environment variables
node -e "console.log(require('dotenv').config())"

# Test database connection
node -e "require('./database').testConnection().then(console.log)"
```

#### Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

### Performance Optimization

#### Database Optimization
```sql
-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

#### Application Optimization
```bash
# Monitor memory usage
pm2 monit

# Restart application periodically
pm2 restart exam-analyzer

# Check for memory leaks
node --inspect server-mysql.js
```

## 📊 **Security Considerations**

### Firewall Setup
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Database Security
```sql
-- Remove root access from remote
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Create application-specific user with minimal privileges
CREATE USER 'exam_app'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON exam_analyzer.* TO 'exam_app'@'localhost';
FLUSH PRIVILEGES;
```

### Application Security
```bash
# Use strong secrets
openssl rand -hex 32  # Generate JWT secret
openssl rand -hex 32  # Generate session secret

# Keep dependencies updated
npm audit
npm audit fix
```

## 🎉 **Success!**

Your Exam Pattern Analyzer is now running on your own server with MySQL! 

### Access URLs:
- **Main Application**: `https://yourdomain.com`
- **API Status**: `https://yourdomain.com/api/status`

### Next Steps:
1. Set up monitoring and alerts
2. Configure automated backups
3. Set up CI/CD for updates
4. Monitor performance and optimize
5. Set up user analytics

## 📞 **Support**

If you encounter issues:
1. Check the logs: `pm2 logs exam-analyzer`
2. Verify database connection
3. Check environment variables
4. Review this troubleshooting guide
5. Check the application logs in `/var/log/`

Happy hosting! 🚀 