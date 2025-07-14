<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Spark\DistrictController;
use App\Http\Controllers\Api\V1\Spark\SchoolController;

/*
|--------------------------------------------------------------------------
| Spark Educational Programs API Routes
|--------------------------------------------------------------------------
|
| Here are the API routes for Spark educational programs including
| district management, school management, and program coordination.
|
*/

// District Management Routes
Route::prefix('districts')->group(function () {

    // District CRUD operations
    Route::get('/', [DistrictController::class, 'index']);
    Route::post('/', [DistrictController::class, 'store']);
    Route::get('/{id}', [DistrictController::class, 'show']);
    Route::put('/{id}', [DistrictController::class, 'update']);
    Route::delete('/{id}', [DistrictController::class, 'destroy']);

    // District management
    Route::post('/{id}/activate', [DistrictController::class, 'activate']);
    Route::post('/{id}/deactivate', [DistrictController::class, 'deactivate']);
    Route::get('/{id}/statistics', [DistrictController::class, 'statistics']);

    // District relationships
    Route::get('/{id}/schools', [DistrictController::class, 'schools']);
    Route::get('/{id}/users', [DistrictController::class, 'users']);
});

// School Management Routes
Route::prefix('schools')->group(function () {

    // School CRUD operations
    Route::get('/', [SchoolController::class, 'index']);
    Route::post('/', [SchoolController::class, 'store']);
    Route::get('/{id}', [SchoolController::class, 'show']);
    Route::put('/{id}', [SchoolController::class, 'update']);
    Route::delete('/{id}', [SchoolController::class, 'destroy']);

    // School management
    Route::post('/{id}/activate', [SchoolController::class, 'activate']);
    Route::post('/{id}/deactivate', [SchoolController::class, 'deactivate']);
    Route::get('/{id}/statistics', [SchoolController::class, 'statistics']);

    // School relationships
    Route::get('/{id}/programs', [SchoolController::class, 'programs']);
    Route::get('/{id}/administrators', [SchoolController::class, 'administrators']);

    // Administrator management
    Route::post('/{id}/administrators', [SchoolController::class, 'addAdministrator']);
    Route::delete('/{id}/administrators/{userId}', [SchoolController::class, 'removeAdministrator']);
});

// Program Management Routes (placeholder for Task 002)
Route::prefix('programs')->group(function () {
    // Program routes will be implemented in Agent 3, Task 002
});

// Booking Management Routes (placeholder for Task 003)
Route::prefix('bookings')->group(function () {
    // Booking routes will be implemented in Agent 3, Task 003
});