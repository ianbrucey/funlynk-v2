# Error Handling & Logging Strategy
## Funlynk & Funlynk Spark MVP

### Overview
This document defines uniform patterns for error handling, API responses, frontend error display, and backend logging across the entire application.

## Backend Error Handling (Laravel)

### API Error Response Format

All API endpoints return errors in a consistent JSON format:

```json
{
  "message": "Human-readable error description",
  "errors": {
    "field_name": ["Specific validation error message"],
    "another_field": ["Another validation error"]
  },
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00Z",
  "request_id": "uuid-for-tracking"
}
```

### HTTP Status Codes

#### Success Responses
- **200 OK**: Successful GET, PUT, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests

#### Client Error Responses
- **400 Bad Request**: Invalid request format or parameters
- **401 Unauthorized**: Authentication required or invalid
- **403 Forbidden**: Authenticated but insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded

#### Server Error Responses
- **500 Internal Server Error**: Unexpected server error
- **503 Service Unavailable**: Service temporarily unavailable

### Laravel Exception Handler

```php
// app/Exceptions/Handler.php
public function render($request, Throwable $exception)
{
    if ($request->expectsJson()) {
        return $this->handleApiException($request, $exception);
    }
    
    return parent::render($request, $exception);
}

private function handleApiException($request, $exception)
{
    $response = [
        'message' => 'An error occurred',
        'timestamp' => now()->toISOString(),
        'request_id' => $request->header('X-Request-ID', Str::uuid())
    ];

    if ($exception instanceof ValidationException) {
        $response['message'] = 'Validation failed';
        $response['errors'] = $exception->errors();
        $response['error_code'] = 'VALIDATION_ERROR';
        return response()->json($response, 422);
    }

    if ($exception instanceof ModelNotFoundException) {
        $response['message'] = 'Resource not found';
        $response['error_code'] = 'RESOURCE_NOT_FOUND';
        return response()->json($response, 404);
    }

    if ($exception instanceof AuthenticationException) {
        $response['message'] = 'Authentication required';
        $response['error_code'] = 'AUTHENTICATION_REQUIRED';
        return response()->json($response, 401);
    }

    if ($exception instanceof AuthorizationException) {
        $response['message'] = 'Insufficient permissions';
        $response['error_code'] = 'INSUFFICIENT_PERMISSIONS';
        return response()->json($response, 403);
    }

    // Log unexpected errors
    Log::error('Unexpected API error', [
        'exception' => $exception->getMessage(),
        'trace' => $exception->getTraceAsString(),
        'request_id' => $response['request_id'],
        'url' => $request->fullUrl(),
        'method' => $request->method(),
        'user_id' => auth()->id()
    ]);

    if (app()->environment('production')) {
        $response['message'] = 'Internal server error';
        $response['error_code'] = 'INTERNAL_ERROR';
    } else {
        $response['message'] = $exception->getMessage();
        $response['error_code'] = 'INTERNAL_ERROR';
        $response['debug'] = [
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ];
    }

    return response()->json($response, 500);
}
```

### Custom Exception Classes

```php
// app/Exceptions/Core/EventNotFoundException.php
class EventNotFoundException extends Exception
{
    public function __construct($eventId = null)
    {
        $message = $eventId 
            ? "Event with ID {$eventId} not found"
            : "Event not found";
        parent::__construct($message);
    }
}

// app/Exceptions/Spark/PermissionSlipAlreadySignedException.php
class PermissionSlipAlreadySignedException extends Exception
{
    public function __construct()
    {
        parent::__construct('Permission slip has already been signed');
    }
}
```

### Service Layer Error Handling

```php
// app/Services/Core/EventService.php
class EventService
{
    public function createEvent(array $data): Event
    {
        try {
            DB::beginTransaction();
            
            $event = Event::create($data);
            
            if (isset($data['tags'])) {
                $this->attachTags($event, $data['tags']);
            }
            
            DB::commit();
            
            Log::info('Event created successfully', [
                'event_id' => $event->id,
                'user_id' => auth()->id()
            ]);
            
            return $event;
            
        } catch (Exception $e) {
            DB::rollBack();
            
            Log::error('Failed to create event', [
                'error' => $e->getMessage(),
                'data' => $data,
                'user_id' => auth()->id()
            ]);
            
            throw new EventCreationException('Failed to create event: ' . $e->getMessage());
        }
    }
}
```

## Frontend Error Handling

### React Native Error Boundaries

```typescript
// src/components/shared/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to crash reporting service
    crashlytics().recordError(error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorScreen error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// src/services/api/shared/httpClient.ts
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  error_code?: string;
  status: number;
}

class HttpClient {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      const apiError: ApiError = {
        message: errorData.message || 'An error occurred',
        errors: errorData.errors,
        error_code: errorData.error_code,
        status: response.status
      };
      
      throw apiError;
    }
    
    return response.json();
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: this.getHeaders()
      });
      
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw {
        message: 'Network error occurred',
        error_code: 'NETWORK_ERROR',
        status: 0
      } as ApiError;
    }
  }
}
```

### Error Display Components

```typescript
// src/components/shared/molecules/ErrorMessage.tsx
interface ErrorMessageProps {
  error: ApiError | string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  showRetry = false
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={24} color="#e74c3c" />
      <Text style={styles.message}>{errorMessage}</Text>
      {showRetry && onRetry && (
        <Button title="Retry" onPress={onRetry} />
      )}
    </View>
  );
};

// src/components/shared/molecules/ValidationErrors.tsx
interface ValidationErrorsProps {
  errors: Record<string, string[]>;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors }) => {
  return (
    <View style={styles.container}>
      {Object.entries(errors).map(([field, messages]) => (
        <View key={field} style={styles.fieldError}>
          <Text style={styles.fieldName}>{field}:</Text>
          {messages.map((message, index) => (
            <Text key={index} style={styles.errorText}>
              • {message}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};
```

### Global Error Handling Hook

```typescript
// src/hooks/shared/useErrorHandler.ts
interface UseErrorHandlerReturn {
  showError: (error: ApiError | string) => void;
  clearError: () => void;
  error: string | null;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((error: ApiError | string) => {
    const message = typeof error === 'string' ? error : error.message;
    setError(message);
    
    // Auto-clear after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { showError, clearError, error };
};
```

## Logging Strategy

### Laravel Logging Configuration

```php
// config/logging.php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'slack'],
        'ignore_exceptions' => false,
    ],

    'api' => [
        'driver' => 'daily',
        'path' => storage_path('logs/api.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],

    'security' => [
        'driver' => 'daily',
        'path' => storage_path('logs/security.log'),
        'level' => 'warning',
        'days' => 30,
    ],

    'performance' => [
        'driver' => 'daily',
        'path' => storage_path('logs/performance.log'),
        'level' => 'info',
        'days' => 7,
    ]
]
```

### Structured Logging

```php
// app/Services/Shared/LoggingService.php
class LoggingService
{
    public static function logApiRequest(Request $request, $response, $duration)
    {
        Log::channel('api')->info('API Request', [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'user_id' => auth()->id(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status_code' => $response->getStatusCode(),
            'duration_ms' => $duration,
            'request_id' => $request->header('X-Request-ID')
        ]);
    }

    public static function logSecurityEvent(string $event, array $context = [])
    {
        Log::channel('security')->warning($event, array_merge($context, [
            'timestamp' => now()->toISOString(),
            'user_id' => auth()->id(),
            'ip' => request()->ip()
        ]));
    }

    public static function logPerformanceMetric(string $operation, float $duration, array $context = [])
    {
        Log::channel('performance')->info($operation, array_merge($context, [
            'duration_ms' => $duration,
            'memory_usage' => memory_get_usage(true),
            'timestamp' => now()->toISOString()
        ]));
    }
}
```

### Frontend Logging

```typescript
// src/services/logging/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = __DEV__ ? LogLevel.DEBUG : LogLevel.WARN;
  }

  debug(message: string, context?: any) {
    if (this.level <= LogLevel.DEBUG) {
      console.log(`[DEBUG] ${message}`, context);
    }
  }

  info(message: string, context?: any) {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  warn(message: string, context?: any) {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, context);
    }
  }

  error(message: string, error?: Error, context?: any) {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error, context);
      
      // Send to crash reporting in production
      if (!__DEV__) {
        crashlytics().log(message);
        if (error) {
          crashlytics().recordError(error);
        }
      }
    }
  }
}

export const logger = new Logger();
```

## Monitoring & Alerting

### Key Metrics to Monitor
- API response times
- Error rates by endpoint
- Authentication failures
- Database query performance
- Mobile app crash rates
- Permission slip completion rates
- Trip booking success rates

### Alert Thresholds
- **Critical**: Error rate > 5%, Response time > 2s
- **Warning**: Error rate > 2%, Response time > 1s
- **Info**: New user registrations, Trip bookings

### Health Check Endpoints

```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => config('app.version'),
        'environment' => app()->environment()
    ]);
});

Route::get('/health/detailed', function () {
    $checks = [
        'database' => $this->checkDatabase(),
        'redis' => $this->checkRedis(),
        'storage' => $this->checkStorage(),
        'external_apis' => $this->checkExternalApis()
    ];
    
    $healthy = collect($checks)->every(fn($check) => $check['status'] === 'ok');
    
    return response()->json([
        'status' => $healthy ? 'healthy' : 'unhealthy',
        'checks' => $checks,
        'timestamp' => now()->toISOString()
    ], $healthy ? 200 : 503);
});
```
