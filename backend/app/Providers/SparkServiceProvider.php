<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use App\Services\Spark\DistrictService;
use App\Services\Spark\SchoolService;

/**
 * Spark Service Provider
 *
 * Registers services for Spark educational programs
 */
class SparkServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
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
    }

    /**
     * Bootstrap services.
     *
     * @return void
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
        ];
    }
}
