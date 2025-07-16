<?php

use App\Http\Controllers\Api\V1\Core\ActivityFeedController;
use App\Http\Controllers\Api\V1\Core\DirectMessageController;
use App\Http\Controllers\Api\V1\Core\EventCommentController;
use App\Http\Controllers\Api\V1\Core\EventController;
use App\Http\Controllers\Api\V1\Core\EventInteractionController;
use App\Http\Controllers\Api\V1\Core\SocialController;
use App\Http\Controllers\Api\V1\Core\UserController;
use Illuminate\Support\Facades\Route;

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

    // Event comments
    Route::get('/{eventId}/comments', [EventCommentController::class, 'index']);
    Route::post('/{eventId}/comments', [EventCommentController::class, 'store']);
    Route::get('/{eventId}/comments/{commentId}', [EventCommentController::class, 'show']);
    Route::put('/{eventId}/comments/{commentId}', [EventCommentController::class, 'update']);
    Route::delete('/{eventId}/comments/{commentId}', [EventCommentController::class, 'destroy']);
    Route::post('/{eventId}/comments/{commentId}/reply', [EventCommentController::class, 'reply']);
    Route::get('/{eventId}/comments/{commentId}/replies', [EventCommentController::class, 'replies']);
    Route::post('/{eventId}/comments/{commentId}/approve', [EventCommentController::class, 'approve']);
    Route::post('/{eventId}/comments/{commentId}/disapprove', [EventCommentController::class, 'disapprove']);

    // Event interactions
    Route::post('/{id}/share', [EventInteractionController::class, 'share']);
    Route::get('/{id}/share-stats', [EventInteractionController::class, 'shareStats']);
    Route::get('/{id}/qr-code', [EventInteractionController::class, 'generateQrCode']);
    Route::post('/{id}/check-in', [EventInteractionController::class, 'checkIn']);
    Route::post('/{id}/check-out', [EventInteractionController::class, 'checkOut']);
    Route::get('/{id}/check-in-stats', [EventInteractionController::class, 'checkInStats']);
    Route::get('/{id}/analytics', [EventInteractionController::class, 'analytics']);
});

// Event Discovery and Recommendations
Route::prefix('discover')->group(function () {
    Route::get('/nearby', [EventInteractionController::class, 'nearbyEvents']);
    Route::get('/recommendations', [EventInteractionController::class, 'recommendations']);
});

// Activity Feed Routes
Route::prefix('activity')->group(function () {
    Route::get('/', [ActivityFeedController::class, 'index']);
    Route::get('/discover', [ActivityFeedController::class, 'discover']);
    Route::get('/trending', [ActivityFeedController::class, 'trending']);
    Route::get('/statistics', [ActivityFeedController::class, 'statistics']);
    Route::get('/unread-count', [ActivityFeedController::class, 'unreadCount']);
    Route::post('/mark-all-read', [ActivityFeedController::class, 'markAllAsRead']);
    Route::post('/preferences', [ActivityFeedController::class, 'updatePreferences']);
    Route::get('/{id}', [ActivityFeedController::class, 'show']);
    Route::post('/{id}/read', [ActivityFeedController::class, 'markAsRead']);
    Route::post('/{id}/hide', [ActivityFeedController::class, 'hide']);
    Route::post('/{id}/report', [ActivityFeedController::class, 'report']);
    Route::get('/{id}/engagement', [ActivityFeedController::class, 'engagement']);
});

// Direct Messages Routes
Route::prefix('messages')->group(function () {
    Route::get('/conversations', [DirectMessageController::class, 'conversations']);
    Route::get('/conversation/{conversationId}', [DirectMessageController::class, 'conversation']);
    Route::post('/send', [DirectMessageController::class, 'send']);
    Route::get('/search', [DirectMessageController::class, 'search']);
    Route::get('/unread-count', [DirectMessageController::class, 'unreadCount']);
    Route::get('/statistics', [DirectMessageController::class, 'statistics']);
    Route::post('/conversation/{conversationId}/read', [DirectMessageController::class, 'markConversationAsRead']);
    Route::get('/{id}', [DirectMessageController::class, 'show']);
    Route::put('/{id}', [DirectMessageController::class, 'update']);
    Route::delete('/{id}', [DirectMessageController::class, 'destroy']);
    Route::post('/{id}/read', [DirectMessageController::class, 'markAsRead']);
    Route::post('/{id}/report', [DirectMessageController::class, 'report']);
    Route::post('/block/{userId}', [DirectMessageController::class, 'blockUser']);
    Route::delete('/block/{userId}', [DirectMessageController::class, 'unblockUser']);
});

// Social Features Routes
Route::prefix('social')->group(function () {
    Route::get('/suggestions', [SocialController::class, 'suggestions']);
    Route::post('/suggestions/{id}/dismiss', [SocialController::class, 'dismissSuggestion']);
    Route::post('/suggestions/{id}/contacted', [SocialController::class, 'markSuggestionContacted']);
    Route::post('/suggestions/bulk-dismiss', [SocialController::class, 'bulkDismissSuggestions']);
    Route::post('/suggestions/refresh', [SocialController::class, 'refreshSuggestions']);
    Route::get('/suggestions/statistics', [SocialController::class, 'suggestionStatistics']);
    Route::get('/mutual-connections/{userId}', [SocialController::class, 'mutualConnections']);
    Route::get('/network-analysis', [SocialController::class, 'networkAnalysis']);
    Route::get('/discover', [SocialController::class, 'discover']);
    Route::get('/statistics', [SocialController::class, 'statistics']);
    Route::get('/trending', [SocialController::class, 'trending']);
    Route::get('/recommendations', [SocialController::class, 'recommendations']);
    Route::post('/preferences', [SocialController::class, 'updatePreferences']);
    Route::get('/insights', [SocialController::class, 'insights']);
});
