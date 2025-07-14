<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Core\UserController;
use App\Http\Controllers\Api\V1\Core\EventController;

/*
|--------------------------------------------------------------------------
| Core Funlynk API Routes
|--------------------------------------------------------------------------
|
| Here are the API routes for Core Funlynk functionality including
| user management, events, and social features.
|
*/

// User Management Routes
Route::prefix('users')->group(function () {

    // Current user profile routes
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/interests', [UserController::class, 'interests']);
    Route::put('/interests', [UserController::class, 'updateInterests']);

    // User search and discovery
    Route::get('/search', [UserController::class, 'search']);

    // Social features
    Route::post('/{id}/follow', [UserController::class, 'follow']);
    Route::delete('/{id}/follow', [UserController::class, 'unfollow']);
    Route::get('/{id}/follow-status', [UserController::class, 'followStatus']);

    // User profile and social connections
    Route::get('/{id}', [UserController::class, 'show']);
    Route::get('/{id}/followers', [UserController::class, 'followers']);
    Route::get('/{id}/following', [UserController::class, 'following']);
});

// Event Management Routes
Route::prefix('events')->group(function () {

    // Event CRUD operations
    Route::get('/', [EventController::class, 'index']);
    Route::post('/', [EventController::class, 'store']);
    Route::get('/search', [EventController::class, 'search']);
    Route::get('/categories', [EventController::class, 'categories']);

    // User's events
    Route::get('/my-hosted', [EventController::class, 'myHostedEvents']);
    Route::get('/my-attended', [EventController::class, 'myAttendedEvents']);

    // Individual event operations
    Route::get('/{id}', [EventController::class, 'show']);
    Route::put('/{id}', [EventController::class, 'update']);
    Route::delete('/{id}', [EventController::class, 'destroy']);

    // Event attendance
    Route::post('/{id}/rsvp', [EventController::class, 'rsvp']);
    Route::delete('/{id}/rsvp', [EventController::class, 'cancelRsvp']);
    Route::get('/{id}/attendees', [EventController::class, 'attendees']);
});

// Event Interaction Routes (placeholder for future implementation)
Route::prefix('interactions')->group(function () {
    // Interaction routes will be implemented in Agent 2, Task 003
});