<?php

namespace App\Providers;

use App\Services\Core\ActivityFeedService;
use App\Services\Core\DirectMessageService;
use App\Services\Core\EventCommentService;
use App\Services\Core\EventInteractionService;
use App\Services\Core\EventService;
use App\Services\Core\FriendSuggestionService;
use App\Services\Core\SocialGraphService;
use App\Services\Core\UserService;
use App\Services\Shared\CacheService;
use App\Services\Shared\EmailService;
use App\Services\Shared\FileUploadService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use App\Services\Shared\ValidationService;
use Illuminate\Support\ServiceProvider;

/**
 * Core Service Provider.
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

        // Register EventService with dependencies
        $this->app->singleton(EventService::class, function ($app) {
            return new EventService(
                $app->make(FileUploadService::class),
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });

        // Register EventCommentService with dependencies
        $this->app->singleton(EventCommentService::class, function ($app) {
            return new EventCommentService(
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });

        // Register EventInteractionService with dependencies
        $this->app->singleton(EventInteractionService::class, function ($app) {
            return new EventInteractionService(
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });

        // Register ActivityFeedService with dependencies
        $this->app->singleton(ActivityFeedService::class, function ($app) {
            return new ActivityFeedService(
                $app->make(LoggingService::class)
            );
        });

        // Register DirectMessageService with dependencies
        $this->app->singleton(DirectMessageService::class, function ($app) {
            return new DirectMessageService(
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });

        // Register FriendSuggestionService with dependencies
        $this->app->singleton(FriendSuggestionService::class, function ($app) {
            return new FriendSuggestionService(
                $app->make(LoggingService::class)
            );
        });

        // Register SocialGraphService with dependencies
        $this->app->singleton(SocialGraphService::class, function ($app) {
            return new SocialGraphService(
                $app->make(LoggingService::class)
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
            EventService::class,
            EventCommentService::class,
            EventInteractionService::class,
            ActivityFeedService::class,
            DirectMessageService::class,
            FriendSuggestionService::class,
            SocialGraphService::class,
        ];
    }
}
