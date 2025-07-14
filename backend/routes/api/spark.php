<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Spark\DistrictController;
use App\Http\Controllers\Api\V1\Spark\SchoolController;
use App\Http\Controllers\Api\V1\Spark\ProgramController;
use App\Http\Controllers\Api\V1\Spark\CharacterTopicController;
use App\Http\Controllers\Api\V1\Spark\ProgramAvailabilityController;
use App\Http\Controllers\Api\V1\Spark\BookingController;

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

// Program Management Routes
Route::prefix('programs')->group(function () {
    Route::get('/', [ProgramController::class, 'index']);
    Route::post('/', [ProgramController::class, 'store']);
    Route::get('/{id}', [ProgramController::class, 'show']);
    Route::put('/{id}', [ProgramController::class, 'update']);
    Route::delete('/{id}', [ProgramController::class, 'destroy']);

    // Program availability management
    Route::get('/{id}/availability', [ProgramController::class, 'availability']);
    Route::post('/{id}/availability', [ProgramController::class, 'addAvailability']);
    Route::put('/{id}/availability/{availabilityId}', [ProgramController::class, 'updateAvailability']);
    Route::delete('/{id}/availability/{availabilityId}', [ProgramController::class, 'deleteAvailability']);

    // Program activation/deactivation
    Route::post('/{id}/activate', [ProgramController::class, 'activate']);
    Route::post('/{id}/deactivate', [ProgramController::class, 'deactivate']);

    // Program statistics
    Route::get('/{id}/statistics', [ProgramController::class, 'statistics']);
});

// Character Topics Management Routes
Route::prefix('character-topics')->group(function () {
    Route::get('/', [CharacterTopicController::class, 'index']);
    Route::post('/', [CharacterTopicController::class, 'store']);
    Route::get('/{id}', [CharacterTopicController::class, 'show']);
    Route::put('/{id}', [CharacterTopicController::class, 'update']);
    Route::delete('/{id}', [CharacterTopicController::class, 'destroy']);

    // Character topic relationships
    Route::get('/{id}/programs', [CharacterTopicController::class, 'programs']);

    // Character topic activation/deactivation
    Route::post('/{id}/activate', [CharacterTopicController::class, 'activate']);
    Route::post('/{id}/deactivate', [CharacterTopicController::class, 'deactivate']);

    // Get categories
    Route::get('/categories/list', [CharacterTopicController::class, 'categories']);
});

// Program Availability Management Routes
Route::prefix('program-availability')->group(function () {
    // Availability CRUD operations
    Route::get('/', [ProgramAvailabilityController::class, 'index']);
    Route::post('/', [ProgramAvailabilityController::class, 'store']);
    Route::get('/{id}', [ProgramAvailabilityController::class, 'show']);
    Route::put('/{id}', [ProgramAvailabilityController::class, 'update']);
    Route::delete('/{id}', [ProgramAvailabilityController::class, 'destroy']);

    // Program-specific availability
    Route::get('/program/{programId}', [ProgramAvailabilityController::class, 'programAvailability']);
    Route::post('/program/{programId}/bulk', [ProgramAvailabilityController::class, 'bulkCreate']);
    Route::get('/program/{programId}/statistics', [ProgramAvailabilityController::class, 'statistics']);
});

// Booking Management Routes
Route::prefix('bookings')->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::post('/', [BookingController::class, 'store']);
    Route::get('/{id}', [BookingController::class, 'show']);
    Route::put('/{id}', [BookingController::class, 'update']);

    // Booking status management
    Route::post('/{id}/confirm', [BookingController::class, 'confirm']);
    Route::post('/{id}/cancel', [BookingController::class, 'cancel']);
    Route::post('/{id}/complete', [BookingController::class, 'complete']);

    // Student management
    Route::get('/{id}/students', [BookingController::class, 'students']);
    Route::post('/{id}/students', [BookingController::class, 'addStudents']);

    // Booking statistics
    Route::get('/{id}/statistics', [BookingController::class, 'statistics']);
});
