# Environment Variables & Database Seeding

## Environment Variables

### Required Environment Variables

Copy the `.env.example` file to `.env` and configure the following variables:

```bash
cp .env.example .env
```

#### Application Settings
```env
APP_NAME=FunLynk
APP_ENV=local|staging|production
APP_KEY=base64:your-app-key-here
APP_DEBUG=true|false
APP_URL=http://localhost:8000
```

#### Database Configuration
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=funlynk
DB_USERNAME=root
DB_PASSWORD=your-password
```

#### Authentication & Security
```env
# Laravel Sanctum (for API authentication)
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,localhost:3000
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
```

#### Email Configuration
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@funlynk.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### File Storage (Optional - for AWS S3)
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket-name
AWS_USE_PATH_STYLE_ENDPOINT=false
```

#### Broadcasting (Optional - for real-time features)
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-pusher-app-id
PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_SECRET=your-pusher-secret
PUSHER_HOST=api-cluster.pusher.com
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1
```

#### Cache & Queue Configuration
```env
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## Database Setup & Seeding

### Initial Setup

1. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

2. **Run Database Migrations**
   ```bash
   php artisan migrate
   ```

3. **Seed Database with Roles & Permissions**
   ```bash
   php artisan db:seed --class=RolePermissionSeeder
   ```

### RolePermissionSeeder

The `RolePermissionSeeder` creates a comprehensive role-based permission system with the following structure:

#### Roles Created:
- **super-admin**: Complete system access (all permissions)
- **admin**: Most permissions except system-critical operations
- **editor**: Content management and basic dashboard access
- **moderator**: Content moderation focused permissions
- **user**: Basic user permissions for content viewing and file operations
- **api-user**: API access with content and file management permissions

#### Permission Categories:

**Core Permissions:**
- User Management: `view users`, `create users`, `edit users`, `delete users`
- Role & Permission Management: `view roles`, `create roles`, `edit roles`, etc.
- System Administration: `view system settings`, `edit system settings`, `view logs`, etc.
- Content Management: `view content`, `create content`, `edit content`, etc.

**Spark Permissions (Feature-specific):**
- Dashboard & Analytics: `view dashboard`, `view analytics`, `export analytics`
- API Management: `view api keys`, `create api keys`, `edit api keys`, etc.
- Notifications: `view notifications`, `create notifications`, `send notifications`
- File Management: `view files`, `upload files`, `download files`, `delete files`
- Reporting: `view reports`, `create reports`, `edit reports`, etc.
- Integration Management: `view integrations`, `create integrations`, etc.

### Creating a Super Admin User

After seeding, you can create a super admin user:

```bash
php artisan tinker
```

```php
$user = App\Models\User::factory()->create([
    'first_name' => 'Super',
    'last_name' => 'Admin',
    'name' => 'Super Admin',
    'email' => 'admin@funlynk.com',
    'password' => 'password',
    'is_active' => true,
    'email_verified_at' => now(),
]);

$user->assignRole('super-admin');
```

### Complete Database Reset & Reseed

If you need to completely reset the database:

```bash
php artisan migrate:fresh --seed
```

This will drop all tables, recreate them, and run all seeders including the RolePermissionSeeder.

### Environment-Specific Configurations

#### Development Environment
```env
APP_ENV=local
APP_DEBUG=true
LOG_LEVEL=debug
MAIL_MAILER=log  # Emails logged to storage/logs/laravel.log
```

#### Staging Environment
```env
APP_ENV=staging
APP_DEBUG=false
LOG_LEVEL=info
MAIL_MAILER=smtp  # Use real SMTP for testing
```

#### Production Environment
```env
APP_ENV=production
APP_DEBUG=false
LOG_LEVEL=error
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
```

## Testing the Authentication System

After setup, you can test the authentication endpoints:

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "John",
       "last_name": "Doe",
       "email": "john@example.com",
       "password": "password123",
       "password_confirmation": "password123"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "password123"
     }'
   ```

3. **Get current user info:**
   ```bash
   curl -X GET http://localhost:8000/api/v1/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

## Troubleshooting

### Common Issues:

1. **Permission denied errors:**
   - Ensure web server has write permissions to `storage/` and `bootstrap/cache/` directories
   - Run: `chmod -R 775 storage bootstrap/cache`

2. **Sanctum authentication issues:**
   - Verify `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain
   - Check that `APP_URL` matches your application URL
   - Ensure sessions are properly configured

3. **Role/Permission cache issues:**
   - Clear permission cache: `php artisan permission:cache-reset`
   - Clear application cache: `php artisan cache:clear`

4. **Database connection errors:**
   - Verify database credentials in `.env`
   - Ensure MySQL/PostgreSQL service is running
   - Check database exists and user has proper permissions
