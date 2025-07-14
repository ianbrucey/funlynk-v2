<?php

namespace App\Providers;

use App\Services\Shared\FileUploadService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use App\Services\Spark\CharacterTopicService;
use App\Services\Spark\DistrictService;
use App\Services\Spark\ProgramService;
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

        // Register ProgramService with dependencies
        $this->app->singleton(ProgramService::class, function ($app) {
            return new ProgramService(
                $app->make(FileUploadService::class),
                $app->make(LoggingService::class),
                $app->make(NotificationService::class)
            );
        });

        // Register CharacterTopicService with dependencies
        $this->app->singleton(CharacterTopicService::class, function ($app) {
            return new CharacterTopicService(
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
            ProgramService::class,
            CharacterTopicService::class,
        ];
    }
}
