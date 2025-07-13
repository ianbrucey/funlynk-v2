# Task 004: Shared Services Implementation
**Agent**: Backend Foundation & Infrastructure Lead  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: Task 003 (Database Schema Implementation)  

## Overview
Implement shared services that will be used across both Core Funlynk and Spark applications: file upload, email, SMS, notifications, and logging services.

## Prerequisites
- Task 003 completed successfully
- AWS S3 credentials configured
- Email service credentials configured
- SMS service credentials configured

## Step-by-Step Implementation

### Step 1: File Upload Service (90 minutes)

**Install required packages:**
```bash
composer require league/flysystem-aws-s3-v3
composer require intervention/image
```

**Configure AWS S3 in config/filesystems.php:**
```php
's3' => [
    'driver' => 's3',
    'key' => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'region' => env('AWS_DEFAULT_REGION'),
    'bucket' => env('AWS_BUCKET'),
    'url' => env('AWS_URL'),
    'endpoint' => env('AWS_ENDPOINT'),
    'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
    'throw' => false,
],
```

**Create FileUploadService (app/Services/Shared/FileUploadService.php):**
```php
<?php

namespace App\Services\Shared;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Str;

class FileUploadService
{
    private array $allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    private array $allowedDocumentTypes = ['pdf', 'doc', 'docx'];
    private int $maxFileSize = 10240; // 10MB in KB

    public function uploadImage(UploadedFile $file, string $directory = 'images'): array
    {
        $this->validateImage($file);
        
        $filename = $this->generateFilename($file);
        $path = $directory . '/' . $filename;
        
        // Resize and optimize image
        $image = Image::make($file);
        $image->resize(1200, 1200, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Convert to WebP for better compression
        $webpImage = $image->encode('webp', 85);
        
        // Upload to S3
        Storage::disk('s3')->put($path, $webpImage);
        
        // Create thumbnail
        $thumbnailPath = $this->createThumbnail($image, $directory, $filename);
        
        return [
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'path' => $path,
            'thumbnail_path' => $thumbnailPath,
            'url' => Storage::disk('s3')->url($path),
            'thumbnail_url' => Storage::disk('s3')->url($thumbnailPath),
            'size' => $file->getSize(),
            'mime_type' => 'image/webp',
        ];
    }

    public function uploadDocument(UploadedFile $file, string $directory = 'documents'): array
    {
        $this->validateDocument($file);
        
        $filename = $this->generateFilename($file);
        $path = $directory . '/' . $filename;
        
        // Upload to S3
        Storage::disk('s3')->putFileAs($directory, $file, $filename);
        
        return [
            'original_name' => $file->getClientOriginalName(),
            'filename' => $filename,
            'path' => $path,
            'url' => Storage::disk('s3')->url($path),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    public function deleteFile(string $path): bool
    {
        return Storage::disk('s3')->delete($path);
    }

    private function validateImage(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, $this->allowedImageTypes)) {
            throw new \InvalidArgumentException('Invalid image type. Allowed: ' . implode(', ', $this->allowedImageTypes));
        }
        
        if ($file->getSize() > $this->maxFileSize * 1024) {
            throw new \InvalidArgumentException('File size exceeds maximum allowed size of ' . $this->maxFileSize . 'KB');
        }
    }

    private function validateDocument(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, $this->allowedDocumentTypes)) {
            throw new \InvalidArgumentException('Invalid document type. Allowed: ' . implode(', ', $this->allowedDocumentTypes));
        }
        
        if ($file->getSize() > $this->maxFileSize * 1024) {
            throw new \InvalidArgumentException('File size exceeds maximum allowed size of ' . $this->maxFileSize . 'KB');
        }
    }

    private function generateFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }

    private function createThumbnail($image, string $directory, string $filename): string
    {
        $thumbnailImage = clone $image;
        $thumbnailImage->resize(300, 300, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        $webpThumbnail = $thumbnailImage->encode('webp', 75);
        $thumbnailPath = $directory . '/thumbnails/' . $filename;
        
        Storage::disk('s3')->put($thumbnailPath, $webpThumbnail);
        
        return $thumbnailPath;
    }
}
```

### Step 2: Email Service (90 minutes)

**Configure email in config/mail.php and .env:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@funlynk.com"
MAIL_FROM_NAME="Funlynk"
```

**Create EmailService (app/Services/Shared/EmailService.php):**
```php
<?php

namespace App\Services\Shared;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService
{
    public function sendWelcomeEmail(string $email, string $name): bool
    {
        try {
            Mail::send('emails.welcome', ['name' => $name], function ($message) use ($email, $name) {
                $message->to($email, $name)
                        ->subject('Welcome to Funlynk!');
            });
            
            Log::info('Welcome email sent', ['email' => $email]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function sendPasswordResetEmail(string $email, string $token): bool
    {
        try {
            Mail::send('emails.password-reset', ['token' => $token], function ($message) use ($email) {
                $message->to($email)
                        ->subject('Reset Your Password');
            });
            
            Log::info('Password reset email sent', ['email' => $email]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function sendEventNotification(string $email, array $eventData): bool
    {
        try {
            Mail::send('emails.event-notification', $eventData, function ($message) use ($email, $eventData) {
                $message->to($email)
                        ->subject('Event Update: ' . $eventData['title']);
            });
            
            Log::info('Event notification sent', ['email' => $email, 'event' => $eventData['title']]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send event notification', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function sendPermissionSlipEmail(string $email, array $slipData): bool
    {
        try {
            Mail::send('emails.permission-slip', $slipData, function ($message) use ($email, $slipData) {
                $message->to($email)
                        ->subject('Permission Slip Required: ' . $slipData['program_title']);
            });
            
            Log::info('Permission slip email sent', ['email' => $email]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send permission slip email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function sendBulkEmail(array $recipients, string $subject, string $template, array $data): array
    {
        $results = ['sent' => 0, 'failed' => 0, 'errors' => []];
        
        foreach ($recipients as $recipient) {
            try {
                Mail::send($template, $data, function ($message) use ($recipient, $subject) {
                    $message->to($recipient['email'], $recipient['name'] ?? '')
                            ->subject($subject);
                });
                
                $results['sent']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = [
                    'email' => $recipient['email'],
                    'error' => $e->getMessage()
                ];
            }
        }
        
        Log::info('Bulk email completed', $results);
        return $results;
    }
}
```

### Step 3: SMS Service (60 minutes)

**Install Twilio SDK:**
```bash
composer require twilio/sdk
```

**Create SMSService (app/Services/Shared/SMSService.php):**
```php
<?php

namespace App\Services\Shared;

use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class SMSService
{
    private Client $client;
    private string $fromNumber;

    public function __construct()
    {
        $this->client = new Client(
            config('services.twilio.sid'),
            config('services.twilio.token')
        );
        $this->fromNumber = config('services.twilio.from');
    }

    public function sendSMS(string $to, string $message): bool
    {
        try {
            $this->client->messages->create($to, [
                'from' => $this->fromNumber,
                'body' => $message
            ]);
            
            Log::info('SMS sent successfully', ['to' => $to]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send SMS', [
                'to' => $to,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function sendVerificationCode(string $phone, string $code): bool
    {
        $message = "Your Funlynk verification code is: {$code}. This code expires in 10 minutes.";
        return $this->sendSMS($phone, $message);
    }

    public function sendEventReminder(string $phone, array $eventData): bool
    {
        $message = "Reminder: {$eventData['title']} starts at {$eventData['start_time']}. Location: {$eventData['location']}";
        return $this->sendSMS($phone, $message);
    }

    public function sendPermissionSlipReminder(string $phone, array $slipData): bool
    {
        $message = "Please sign the permission slip for {$slipData['program_title']}. Link: {$slipData['link']}";
        return $this->sendSMS($phone, $message);
    }
}
```

### Step 4: Notification Service (90 minutes)

**Install Firebase SDK for push notifications:**
```bash
composer require kreait/firebase-php
```

**Create NotificationService (app/Services/Shared/NotificationService.php):**
```php
<?php

namespace App\Services\Shared;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    private $messaging;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(config('services.firebase.credentials'));
        $this->messaging = $factory->createMessaging();
    }

    public function sendPushNotification(string $deviceToken, string $title, string $body, array $data = []): bool
    {
        try {
            $notification = Notification::create($title, $body);
            $message = CloudMessage::withTarget('token', $deviceToken)
                ->withNotification($notification)
                ->withData($data);

            $this->messaging->send($message);
            
            Log::info('Push notification sent', ['token' => substr($deviceToken, 0, 10) . '...']);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send push notification', [
                'token' => substr($deviceToken, 0, 10) . '...',
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function sendBulkPushNotification(array $deviceTokens, string $title, string $body, array $data = []): array
    {
        $results = ['sent' => 0, 'failed' => 0];
        
        try {
            $notification = Notification::create($title, $body);
            $message = CloudMessage::new()
                ->withNotification($notification)
                ->withData($data);

            $response = $this->messaging->sendMulticast($message, $deviceTokens);
            
            $results['sent'] = $response->successes()->count();
            $results['failed'] = $response->failures()->count();
            
            Log::info('Bulk push notification completed', $results);
        } catch (\Exception $e) {
            Log::error('Failed to send bulk push notification', ['error' => $e->getMessage()]);
            $results['failed'] = count($deviceTokens);
        }
        
        return $results;
    }

    public function sendEventNotification(array $deviceTokens, array $eventData): bool
    {
        return $this->sendBulkPushNotification(
            $deviceTokens,
            'Event Update',
            $eventData['title'] . ' - ' . $eventData['message'],
            ['type' => 'event', 'event_id' => $eventData['id']]
        );
    }

    public function sendPermissionSlipNotification(string $deviceToken, array $slipData): bool
    {
        return $this->sendPushNotification(
            $deviceToken,
            'Permission Slip Required',
            'Please sign permission slip for ' . $slipData['program_title'],
            ['type' => 'permission_slip', 'slip_id' => $slipData['id']]
        );
    }
}
```

### Step 5: Logging Service (45 minutes)

**Configure logging in config/logging.php:**
```php
'channels' => [
    // ... existing channels
    
    'funlynk' => [
        'driver' => 'daily',
        'path' => storage_path('logs/funlynk.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],
    
    'spark' => [
        'driver' => 'daily',
        'path' => storage_path('logs/spark.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],
    
    'api' => [
        'driver' => 'daily',
        'path' => storage_path('logs/api.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 30,
    ],
],
```

**Create LoggingService (app/Services/Shared/LoggingService.php):**
```php
<?php

namespace App\Services\Shared;

use Illuminate\Support\Facades\Log;

class LoggingService
{
    public function logApiRequest(string $method, string $url, array $data = [], ?string $userId = null): void
    {
        Log::channel('api')->info('API Request', [
            'method' => $method,
            'url' => $url,
            'user_id' => $userId,
            'data' => $data,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function logApiResponse(string $method, string $url, int $statusCode, ?string $userId = null): void
    {
        Log::channel('api')->info('API Response', [
            'method' => $method,
            'url' => $url,
            'status_code' => $statusCode,
            'user_id' => $userId,
            'response_time' => microtime(true) - LARAVEL_START,
        ]);
    }

    public function logUserAction(string $action, ?string $userId = null, array $data = []): void
    {
        Log::channel('funlynk')->info('User Action', [
            'action' => $action,
            'user_id' => $userId,
            'data' => $data,
            'ip' => request()->ip(),
        ]);
    }

    public function logError(string $message, \Exception $exception, array $context = []): void
    {
        Log::error($message, [
            'exception' => $exception->getMessage(),
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString(),
            'context' => $context,
        ]);
    }

    public function logSparkAction(string $action, array $data = []): void
    {
        Log::channel('spark')->info('Spark Action', [
            'action' => $action,
            'data' => $data,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
        ]);
    }
}
```

### Step 6: Rate Limiting Middleware (30 minutes)

**Create RateLimitMiddleware (app/Http/Middleware/RateLimitMiddleware.php):**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    public function handle(Request $request, Closure $next, string $key = 'api'): Response
    {
        $identifier = $this->getIdentifier($request);
        $maxAttempts = config("rate-limiting.{$key}.max_attempts", 60);
        $decayMinutes = config("rate-limiting.{$key}.decay_minutes", 1);

        if (RateLimiter::tooManyAttempts($identifier, $maxAttempts)) {
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => RateLimiter::availableIn($identifier),
            ], 429);
        }

        RateLimiter::hit($identifier, $decayMinutes * 60);

        $response = $next($request);

        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', RateLimiter::remaining($identifier, $maxAttempts));

        return $response;
    }

    private function getIdentifier(Request $request): string
    {
        if ($user = $request->user()) {
            return 'user:' . $user->id;
        }

        return 'ip:' . $request->ip();
    }
}
```

## Acceptance Criteria

### File Upload Service
- [ ] Image upload with automatic resizing and WebP conversion
- [ ] Document upload with validation
- [ ] Thumbnail generation for images
- [ ] S3 integration working
- [ ] File deletion functionality

### Email Service
- [ ] Welcome email sending
- [ ] Password reset email
- [ ] Event notifications
- [ ] Permission slip emails
- [ ] Bulk email functionality

### SMS Service
- [ ] Basic SMS sending
- [ ] Verification code sending
- [ ] Event reminders
- [ ] Permission slip reminders

### Notification Service
- [ ] Push notification sending
- [ ] Bulk push notifications
- [ ] Event notifications
- [ ] Permission slip notifications

### Logging Service
- [ ] API request/response logging
- [ ] User action logging
- [ ] Error logging
- [ ] Spark-specific logging

### Rate Limiting
- [ ] API rate limiting implemented
- [ ] User-based and IP-based limiting
- [ ] Proper HTTP headers
- [ ] Configurable limits

## Testing Instructions

### Manual Testing
```bash
# Test file upload
curl -X POST http://localhost:8000/api/v1/test/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg"

# Test email service
php artisan tinker
>>> app(App\Services\Shared\EmailService::class)->sendWelcomeEmail('test@example.com', 'Test User');

# Test SMS service
>>> app(App\Services\Shared\SMSService::class)->sendSMS('+1234567890', 'Test message');

# Test rate limiting
for i in {1..70}; do curl http://localhost:8000/api/v1/test; done
```

## Next Steps
After completion, proceed to:
- Task 005: API Foundation Setup
- Share services with Agent 2 and Agent 3
- Document service usage patterns

## Documentation
- Create service usage documentation
- Document configuration requirements
- Create troubleshooting guide
