<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API Health Check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is healthy',
        'data' => [
            'version' => '1.0',
            'timestamp' => now()->toISOString(),
            'environment' => app()->environment(),
        ],
    ]);
});

// API Version 1 Routes
Route::prefix('v1')->middleware(['api.middleware'])->group(function () {

    // Authentication routes (public)
    Route::prefix('auth')->group(base_path('routes/api/auth.php'));

    // Public routes (no authentication required)
    Route::prefix('public')->group(base_path('routes/api/public.php'));

    // Protected routes
    Route::middleware(['auth:sanctum', 'rate.limit:120,1'])->group(function () {

        // User profile endpoint
        Route::get('/user', function (Request $request) {
            return new \App\Http\Resources\Auth\UserResource($request->user());
        });

        // Core Funlynk routes
        Route::prefix('core')->group(base_path('routes/api/core.php'));

        // Spark routes
        Route::prefix('spark')->group(base_path('routes/api/spark.php'));
    });
});

// Fallback route for undefined API endpoints
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found',
        'timestamp' => now()->toISOString(),
    ], 404);
});
