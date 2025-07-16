# FunLynk Deployment Guide

This guide provides comprehensive instructions for deploying the FunLynk backend API to production environments, with special focus on the new Spark educational programs features.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [AWS S3 Setup](#aws-s3-setup)
- [Application Deployment](#application-deployment)
- [Spark Features Configuration](#spark-features-configuration)
- [Security Configuration](#security-configuration)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Logging](#monitoring-and-logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements

- **Operating System**: Ubuntu 20.04 LTS or CentOS 8+
- **PHP**: 8.2 or higher with required extensions
- **Web Server**: Nginx 1.18+ or Apache 2.4+
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 20GB SSD
- **SSL Certificate**: Valid SSL certificate for HTTPS

### PHP Extensions Required

```bash
# Install required PHP extensions
sudo apt-get install php8.2-cli php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl \
    php8.2-gd php8.2-mbstring php8.2-zip php8.2-bcmath php8.2-intl php8.2-redis
```

### Additional Services

- **Redis**: For caching and queue management
- **Supervisor**: For queue worker process management
- **Certbot**: For SSL certificate management

## Environment Setup

### 1. Create Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/funlynk
sudo chown -R www-data:www-data /var/www/funlynk
cd /var/www/funlynk
```

### 2. Clone Repository

```bash
# Clone the repository
git clone https://github.com/funlynk/funlynk-backend.git .
cd backend
```

### 3. Install Dependencies

```bash
# Install Composer dependencies
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies (if needed)
npm ci --production
```

### 4. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Production Environment Variables

Create and configure your `.env` file with production values:

```env
# Application Configuration
APP_NAME=FunLynk
APP_ENV=production
APP_KEY=base64:your_generated_key
APP_DEBUG=false
APP_URL=https://api.funlynk.com

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=your_production_db_host
DB_PORT=3306
DB_DATABASE=funlynk_production
DB_USERNAME=funlynk_user
DB_PASSWORD=your_secure_password

# Cache and Session Configuration
CACHE_DRIVER=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=true

# Queue Configuration
QUEUE_CONNECTION=redis
QUEUE_FAILED_DRIVER=database

# Redis Configuration
REDIS_HOST=your_redis_host
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379
REDIS_DB=0

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@funlynk.com
MAIL_FROM_NAME="FunLynk"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=funlynk-production
AWS_USE_PATH_STYLE_ENDPOINT=false

# Logging Configuration
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Security Configuration
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com
SESSION_DOMAIN=.yourdomain.com
```

## Database Configuration

### 1. Create Production Database

```sql
-- Connect to MySQL as root
CREATE DATABASE funlynk_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'funlynk_user'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON funlynk_production.* TO 'funlynk_user'@'%';
FLUSH PRIVILEGES;
```

### 2. Run Database Migrations

```bash
# Run migrations
php artisan migrate --force

# Seed essential data (roles, permissions, etc.)
php artisan db:seed --class=ProductionSeeder
```

### 3. Spark Features Database Setup

The Spark educational programs module requires specific database tables and data:

```bash
# Run Spark-specific migrations
php artisan migrate --path=database/migrations/spark --force

# Seed Spark data (character topics, sample programs)
php artisan db:seed --class=SparkSeeder
```

## AWS S3 Setup

### 1. Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://funlynk-production --region us-east-1
```

### 2. Configure Bucket Policy

Create a bucket policy for secure access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::funlynk-production/public/*"
    },
    {
      "Sid": "AllowFunLynkAppAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/funlynk-app"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::funlynk-production/*"
    }
  ]
}
```

### 3. Configure CORS

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com", "https://www.yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Create IAM User

```bash
# Create IAM user for application
aws iam create-user --user-name funlynk-app

# Attach S3 policy
aws iam attach-user-policy --user-name funlynk-app --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Create access keys
aws iam create-access-key --user-name funlynk-app
```

## Application Deployment

### 1. Set File Permissions

```bash
# Set proper ownership
sudo chown -R www-data:www-data /var/www/funlynk

# Set directory permissions
sudo find /var/www/funlynk -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/funlynk -type f -exec chmod 644 {} \;

# Set executable permissions for artisan
sudo chmod +x /var/www/funlynk/backend/artisan

# Set writable permissions for storage and cache
sudo chmod -R 775 /var/www/funlynk/backend/storage
sudo chmod -R 775 /var/www/funlynk/backend/bootstrap/cache
```

### 2. Optimize Application

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### 3. Configure Web Server

#### Nginx Configuration

Create `/etc/nginx/sites-available/funlynk`:

```nginx
server {
    listen 80;
    server_name api.funlynk.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.funlynk.com;
    root /var/www/funlynk/backend/public;

    index index.php;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.funlynk.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.funlynk.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # File upload size
    client_max_body_size 100M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/funlynk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Spark Features Configuration

### 1. Spark Module Environment Variables

Add these specific environment variables for Spark features:

```env
# Spark Educational Programs Configuration
SPARK_ENABLED=true
SPARK_DEFAULT_PROGRAM_DURATION=60
SPARK_MAX_STUDENTS_PER_BOOKING=100
SPARK_BOOKING_ADVANCE_DAYS=30
SPARK_CHARACTER_TOPICS_ENABLED=true

# File Upload Configuration for Spark
SPARK_MAX_FILE_SIZE=10240  # 10MB in KB
SPARK_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,jpeg,png
SPARK_RESOURCE_FILES_PATH=spark/resources
```

### 2. Spark Permissions Setup

```bash
# Create Spark-specific permissions
php artisan db:seed --class=SparkPermissionsSeeder

# Assign permissions to roles
php artisan spark:setup-permissions
```

### 3. Character Topics Configuration

```bash
# Seed character topics
php artisan db:seed --class=CharacterTopicsSeeder

# Verify character topics
php artisan spark:list-topics
```

## Security Configuration

### 1. SSL Certificate Setup

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.funlynk.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Allow specific ports for Redis (if external)
sudo ufw allow from your_redis_server_ip to any port 6379
```

### 3. Security Headers and Rate Limiting

The Nginx configuration above includes security headers and rate limiting. Additional security measures:

```bash
# Install fail2ban for intrusion prevention
sudo apt-get install fail2ban

# Configure fail2ban for Nginx
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

## Performance Optimization

### 1. PHP-FPM Configuration

Edit `/etc/php/8.2/fpm/pool.d/www.conf`:

```ini
; Process management
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500

; Memory limits
php_admin_value[memory_limit] = 256M
php_admin_value[upload_max_filesize] = 100M
php_admin_value[post_max_size] = 100M
```

### 2. Redis Configuration

Edit `/etc/redis/redis.conf`:

```conf
# Memory optimization
maxmemory 1gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Security
requirepass your_redis_password
```

### 3. Database Optimization

```sql
-- MySQL optimization settings
SET GLOBAL innodb_buffer_pool_size = 1073741824;  -- 1GB
SET GLOBAL query_cache_size = 268435456;          -- 256MB
SET GLOBAL max_connections = 200;
```

## Queue Workers Setup

### 1. Supervisor Configuration

Create `/etc/supervisor/conf.d/funlynk-worker.conf`:

```ini
[program:funlynk-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/funlynk/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/funlynk/backend/storage/logs/worker.log
stopwaitsecs=3600
```

### 2. Start Queue Workers

```bash
# Update supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update

# Start workers
sudo supervisorctl start funlynk-worker:*

# Check status
sudo supervisorctl status
```

## Monitoring and Logging

### 1. Application Logging

Configure logging in `.env`:

```env
LOG_CHANNEL=stack
LOG_STACK=single,daily
LOG_LEVEL=error
```

### 2. Log Rotation

Create `/etc/logrotate.d/funlynk`:

```
/var/www/funlynk/backend/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    notifempty
    create 644 www-data www-data
    postrotate
        /usr/bin/supervisorctl restart funlynk-worker:*
    endscript
}
```

### 3. Health Check Endpoint

The application includes a health check endpoint at `/api/health`. Monitor this endpoint:

```bash
# Add to crontab for monitoring
*/5 * * * * curl -f https://api.funlynk.com/api/health || echo "FunLynk API is down" | mail -s "Alert" admin@funlynk.com
```

## Backup Strategy

### 1. Database Backup

```bash
#!/bin/bash
# Create backup script: /usr/local/bin/backup-funlynk.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/funlynk"
DB_NAME="funlynk_production"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u funlynk_user -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/funlynk/backend --exclude=vendor --exclude=node_modules

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://funlynk-backups/
aws s3 cp $BACKUP_DIR/app_backup_$DATE.tar.gz s3://funlynk-backups/

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

### 2. Schedule Backups

```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-funlynk.sh
```

## Troubleshooting

### Common Issues

#### 1. Permission Errors

```bash
# Fix storage permissions
sudo chown -R www-data:www-data /var/www/funlynk/backend/storage
sudo chmod -R 775 /var/www/funlynk/backend/storage
```

#### 2. Queue Worker Issues

```bash
# Restart queue workers
sudo supervisorctl restart funlynk-worker:*

# Check worker logs
tail -f /var/www/funlynk/backend/storage/logs/worker.log
```

#### 3. Database Connection Issues

```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

#### 4. S3 Upload Issues

```bash
# Test S3 connection
php artisan tinker
>>> Storage::disk('s3')->put('test.txt', 'test content');
```

### Log Locations

- **Application Logs**: `/var/www/funlynk/backend/storage/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PHP-FPM Logs**: `/var/log/php8.2-fpm.log`
- **MySQL Logs**: `/var/log/mysql/`
- **Redis Logs**: `/var/log/redis/`

### Performance Monitoring

```bash
# Monitor system resources
htop

# Monitor database performance
mysql -u root -p -e "SHOW PROCESSLIST;"

# Monitor Redis
redis-cli info memory

# Monitor queue status
php artisan queue:monitor
```

## Deployment Checklist

- [ ] Server requirements met
- [ ] SSL certificate installed
- [ ] Database created and migrated
- [ ] Environment variables configured
- [ ] S3 bucket configured
- [ ] File permissions set
- [ ] Web server configured
- [ ] Queue workers running
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Health checks configured
- [ ] Security measures in place

## Support

For deployment issues or questions:

- **Documentation**: Check the comprehensive documentation in the `docs/` directory
- **Logs**: Review application and system logs for error details
- **Health Check**: Monitor the `/api/health` endpoint
- **Development Team**: Contact the FunLynk development team for assistance

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2024-07-14
**Compatible with**: FunLynk Backend v1.0+
