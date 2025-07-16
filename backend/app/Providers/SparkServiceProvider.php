<?php

namespace App\Providers;

use App\Services\Shared\FileUploadService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use App\Services\Spark\AnalyticsService;
use App\Services\Spark\BookingService;
use App\Services\Spark\CharacterTopicService;
use App\Services\Spark\DistrictService;
use App\Services\Spark\PermissionSlipService;
use App\Services\Spark\SparkProgramService;
use App\Services\Spark\SchoolService;
use Illuminate\Support\ServiceProvider;

/**
 * Spark Service Provider.
 *
 * Registers services for Spark educational programs
 */
class SparkServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register DistrictService with dependencies
        $this->app->singleton(DistrictService::class, function ($app) {
            return new DistrictService(
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });

        // Register SchoolService with dependencies
        $this->app->singleton(SchoolService::class, function ($app) {
            return new SchoolService(
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });

        // Register SparkProgramService with dependencies
        $this->app->singleton(SparkProgramService::class, function ($app) {
            return new SparkProgramService(
                $app->make(FileUploadService::class)
            );
        });

        // Register CharacterTopicService with dependencies
        $this->app->singleton(CharacterTopicService::class, function ($app) {
            return new CharacterTopicService();
        });

        // Register BookingService with dependencies
        $this->app->singleton(BookingService::class, function ($app) {
            return new BookingService(
                $app->make(\App\Services\Shared\EmailService::class),
                $app->make(\App\Services\Shared\LoggingService::class),
                $app->make(\App\Services\Shared\NotificationService::class)
            );
        });

        // Register PermissionSlipService with dependencies
        $this->app->singleton(PermissionSlipService::class, function ($app) {
            return new PermissionSlipService(
                $app->make(\App\Services\Shared\EmailService::class),
                $app->make(\App\Services\Shared\LoggingService::class),
                $app->make(\App\Services\Shared\NotificationService::class)
            );
        });

        // Register AnalyticsService with dependencies
        $this->app->singleton(AnalyticsService::class, function ($app) {
            return new AnalyticsService(
                $app->make(\App\Services\Shared\LoggingService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array<int, string>
     */
    public function provides(): array
    {
        return [
            DistrictService::class,
            SchoolService::class,
            SparkProgramService::class,
            CharacterTopicService::class,
            BookingService::class,
            PermissionSlipService::class,
            AnalyticsService::class,
        ];
    }
}
