<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Shared\FileUploadService;
use App\Services\Shared\EmailService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use App\Services\Shared\ValidationService;
use App\Services\Shared\CacheService;
use App\Services\Core\UserService;

/**
 * Core Service Provider
 *
 * Registers all shared services and their dependencies
 */
class CoreServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register shared services as singletons
        $this->app->singleton(LoggingService::class);
        $this->app->singleton(FileUploadService::class);
        $this->app->singleton(EmailService::class);
        $this->app->singleton(ValidationService::class);
        $this->app->singleton(CacheService::class);

        // Register NotificationService with dependencies
        $this->app->singleton(NotificationService::class, function ($app) {
            return new NotificationService(
                $app->make(LoggingService::class),
                $app->make(EmailService::class)
            );
        });

        // Register UserService with dependencies
        $this->app->singleton(UserService::class, function ($app) {
            return new UserService(
                $app->make(FileUploadService::class),
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register middleware
        $this->app['router']->aliasMiddleware('rate.limit', \App\Http\Middleware\RateLimitMiddleware::class);
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides(): array
    {
        return [
            FileUploadService::class,
            EmailService::class,
            LoggingService::class,
            NotificationService::class,
            ValidationService::class,
            CacheService::class,
            UserService::class,
        ];
    }
}
