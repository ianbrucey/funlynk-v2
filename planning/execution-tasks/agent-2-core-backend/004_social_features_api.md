# Task 004: Social Features API
**Agent**: Core Funlynk Backend Developer  
**Estimated Time**: 6-7 hours  
**Priority**: Medium  
**Dependencies**: Task 003 (Event Interaction API)  

## Overview
Implement social features including activity feed, direct messaging, notifications, and friend suggestions for Core Funlynk users.

## Prerequisites
- Task 003 completed successfully
- User management and following system working
- Event interaction features available
- Notification services configured

## Step-by-Step Implementation

### Step 1: Create Social Models (75 minutes)

**Create ActivityFeed model (app/Models/Core/ActivityFeed.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Models\User;

class ActivityFeed extends Model
{
    protected $fillable = [
        'user_id',
        'actor_id',
        'action_type',
        'actionable_type',
        'actionable_id',
        'data',
        'is_public',
    ];

    protected $casts = [
        'data' => 'array',
        'is_public' => 'boolean',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function actionable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByActionType($query, string $actionType)
    {
        return $query->where('action_type', $actionType);
    }
}
```

**Create DirectMessage model (app/Models/Core/DirectMessage.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class DirectMessage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'recipient_id',
        'content',
        'message_type',
        'attachment_url',
        'read_at',
        'delivered_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    // Relationships
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeBetweenUsers($query, int $user1, int $user2)
    {
        return $query->where(function ($q) use ($user1, $user2) {
            $q->where('sender_id', $user1)->where('recipient_id', $user2);
        })->orWhere(function ($q) use ($user1, $user2) {
            $q->where('sender_id', $user2)->where('recipient_id', $user1);
        });
    }

    // Accessors
    public function getIsReadAttribute(): bool
    {
        return !is_null($this->read_at);
    }
}
```

**Create Conversation model (app/Models/Core/Conversation.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;

class Conversation extends Model
{
    protected $fillable = [
        'title',
        'type',
        'last_message_at',
        'is_active',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['joined_at', 'left_at', 'is_admin'])
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DirectMessage::class);
    }

    public function lastMessage(): HasOne
    {
        return $this->hasOne(DirectMessage::class)->latest();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->whereHas('participants', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        });
    }
}
```

**Create UserNotification model (app/Models/Core/UserNotification.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Models\User;

class UserNotification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'notifiable_type',
        'notifiable_id',
        'read_at',
        'action_url',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    // Methods
    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }

    public function getIsReadAttribute(): bool
    {
        return !is_null($this->read_at);
    }
}
```

### Step 2: Create Social Controllers (120 minutes)

**Create ActivityFeedController (app/Http/Controllers/Api/V1/Core/ActivityFeedController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Core\ActivityFeedResource;
use App\Services\Core\ActivityFeedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityFeedController extends BaseApiController
{
    public function __construct(
        private ActivityFeedService $feedService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get user's activity feed
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:50',
            'type' => 'sometimes|string|in:all,following,own',
        ]);

        $feed = $this->feedService->getUserFeed(
            auth()->id(),
            $request->type ?? 'all',
            $request->per_page ?? 20
        );

        return $this->paginatedResponse($feed, 'Activity feed retrieved successfully');
    }

    /**
     * Get user's own activities
     */
    public function userActivities(int $userId, Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $activities = $this->feedService->getUserActivities(
            $userId,
            $request->per_page ?? 20
        );

        return $this->paginatedResponse($activities, 'User activities retrieved successfully');
    }

    /**
     * Create activity (for testing)
     */
    public function createActivity(Request $request): JsonResponse
    {
        $request->validate([
            'action_type' => 'required|string',
            'actionable_type' => 'required|string',
            'actionable_id' => 'required|integer',
            'data' => 'sometimes|array',
            'is_public' => 'sometimes|boolean',
        ]);

        try {
            $activity = $this->feedService->createActivity(
                auth()->id(),
                $request->action_type,
                $request->actionable_type,
                $request->actionable_id,
                $request->data ?? [],
                $request->is_public ?? true
            );

            return $this->successResponse(
                new ActivityFeedResource($activity),
                'Activity created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create activity', 500);
        }
    }
}
```

**Create DirectMessageController (app/Http/Controllers/Api/V1/Core/DirectMessageController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\SendMessageRequest;
use App\Http\Resources\Core\DirectMessageResource;
use App\Http\Resources\Core\ConversationResource;
use App\Services\Core\DirectMessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DirectMessageController extends BaseApiController
{
    public function __construct(
        private DirectMessageService $messageService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Get user's conversations
     */
    public function conversations(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:50',
        ]);

        $conversations = $this->messageService->getUserConversations(
            auth()->id(),
            $request->per_page ?? 20
        );

        return $this->paginatedResponse($conversations, 'Conversations retrieved successfully');
    }

    /**
     * Get conversation messages
     */
    public function messages(int $conversationId, Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        if (!$this->messageService->userCanAccessConversation(auth()->id(), $conversationId)) {
            return $this->forbiddenResponse('Access denied to this conversation');
        }

        $messages = $this->messageService->getConversationMessages(
            $conversationId,
            $request->per_page ?? 50
        );

        return $this->paginatedResponse($messages, 'Messages retrieved successfully');
    }

    /**
     * Send message
     */
    public function sendMessage(SendMessageRequest $request): JsonResponse
    {
        try {
            $message = $this->messageService->sendMessage(
                auth()->id(),
                $request->validated()
            );

            return $this->successResponse(
                new DirectMessageResource($message),
                'Message sent successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to send message', 500);
        }
    }

    /**
     * Mark message as read
     */
    public function markAsRead(int $messageId): JsonResponse
    {
        try {
            $result = $this->messageService->markAsRead(auth()->id(), $messageId);
            
            if (!$result) {
                return $this->notFoundResponse('Message not found or access denied');
            }

            return $this->successResponse(null, 'Message marked as read');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to mark message as read', 500);
        }
    }

    /**
     * Get unread message count
     */
    public function unreadCount(): JsonResponse
    {
        $count = $this->messageService->getUnreadCount(auth()->id());
        
        return $this->successResponse([
            'unread_count' => $count
        ], 'Unread count retrieved successfully');
    }

    /**
     * Start conversation with user
     */
    public function startConversation(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id|different:' . auth()->id(),
        ]);

        try {
            $conversation = $this->messageService->startConversation(
                auth()->id(),
                $request->recipient_id
            );

            return $this->successResponse(
                new ConversationResource($conversation),
                'Conversation started successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to start conversation', 500);
        }
    }
}
```

### Step 3: Create Service Classes (120 minutes)

**Create ActivityFeedService (app/Services/Core/ActivityFeedService.php):**
```php
<?php

namespace App\Services\Core;

use App\Models\Core\ActivityFeed;
use App\Models\Core\UserFollow;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ActivityFeedService
{
    public function getUserFeed(int $userId, string $type = 'all', int $perPage = 20): LengthAwarePaginator
    {
        $query = ActivityFeed::with(['actor.coreProfile', 'actionable'])
            ->where('is_public', true);

        switch ($type) {
            case 'following':
                $followingIds = UserFollow::where('follower_id', $userId)
                    ->pluck('following_id')
                    ->toArray();
                $query->whereIn('actor_id', $followingIds);
                break;
                
            case 'own':
                $query->where('actor_id', $userId);
                break;
                
            case 'all':
            default:
                // Get activities from followed users + own activities
                $followingIds = UserFollow::where('follower_id', $userId)
                    ->pluck('following_id')
                    ->toArray();
                $followingIds[] = $userId;
                $query->whereIn('actor_id', $followingIds);
                break;
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getUserActivities(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return ActivityFeed::with(['actionable'])
            ->where('actor_id', $userId)
            ->where('is_public', true)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createActivity(
        int $actorId,
        string $actionType,
        string $actionableType,
        int $actionableId,
        array $data = [],
        bool $isPublic = true
    ): ActivityFeed {
        return ActivityFeed::create([
            'user_id' => $actorId, // For now, user_id = actor_id
            'actor_id' => $actorId,
            'action_type' => $actionType,
            'actionable_type' => $actionableType,
            'actionable_id' => $actionableId,
            'data' => $data,
            'is_public' => $isPublic,
        ]);
    }

    public function recordEventActivity(int $userId, string $action, $event): void
    {
        $actionTypes = [
            'created' => 'event_created',
            'updated' => 'event_updated',
            'joined' => 'event_joined',
            'left' => 'event_left',
            'checked_in' => 'event_checked_in',
        ];

        if (isset($actionTypes[$action])) {
            $this->createActivity(
                $userId,
                $actionTypes[$action],
                get_class($event),
                $event->id,
                [
                    'event_title' => $event->title,
                    'event_start_time' => $event->start_time->toISOString(),
                ]
            );
        }
    }

    public function recordSocialActivity(int $userId, string $action, $target): void
    {
        $actionTypes = [
            'followed' => 'user_followed',
            'unfollowed' => 'user_unfollowed',
        ];

        if (isset($actionTypes[$action])) {
            $this->createActivity(
                $userId,
                $actionTypes[$action],
                get_class($target),
                $target->id,
                [
                    'target_name' => $target->full_name,
                ]
            );
        }
    }
}
```

**Create DirectMessageService (app/Services/Core/DirectMessageService.php):**
```php
<?php

namespace App\Services\Core;

use App\Models\Core\DirectMessage;
use App\Models\Core\Conversation;
use App\Services\Shared\NotificationService;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class DirectMessageService
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function getUserConversations(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        return Conversation::with(['participants', 'lastMessage.sender'])
            ->forUser($userId)
            ->active()
            ->orderBy('last_message_at', 'desc')
            ->paginate($perPage);
    }

    public function getConversationMessages(int $conversationId, int $perPage = 50): LengthAwarePaginator
    {
        return DirectMessage::with(['sender.coreProfile'])
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function sendMessage(int $senderId, array $data): DirectMessage
    {
        return DB::transaction(function () use ($senderId, $data) {
            // Get or create conversation
            $conversation = $this->getOrCreateConversation($senderId, $data['recipient_id']);

            // Create message
            $message = DirectMessage::create([
                'conversation_id' => $conversation->id,
                'sender_id' => $senderId,
                'recipient_id' => $data['recipient_id'],
                'content' => $data['content'],
                'message_type' => $data['message_type'] ?? 'text',
                'attachment_url' => $data['attachment_url'] ?? null,
                'delivered_at' => now(),
            ]);

            // Update conversation
            $conversation->update(['last_message_at' => now()]);

            // Send notification
            $this->sendMessageNotification($message);

            return $message->load(['sender', 'recipient']);
        });
    }

    public function markAsRead(int $userId, int $messageId): bool
    {
        $message = DirectMessage::where('id', $messageId)
            ->where('recipient_id', $userId)
            ->whereNull('read_at')
            ->first();

        if (!$message) {
            return false;
        }

        $message->update(['read_at' => now()]);
        return true;
    }

    public function getUnreadCount(int $userId): int
    {
        return DirectMessage::where('recipient_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public function startConversation(int $userId, int $recipientId): Conversation
    {
        return $this->getOrCreateConversation($userId, $recipientId);
    }

    public function userCanAccessConversation(int $userId, int $conversationId): bool
    {
        return Conversation::whereHas('participants', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('id', $conversationId)->exists();
    }

    private function getOrCreateConversation(int $user1Id, int $user2Id): Conversation
    {
        // Check if conversation already exists
        $conversation = Conversation::whereHas('participants', function ($query) use ($user1Id) {
            $query->where('user_id', $user1Id);
        })->whereHas('participants', function ($query) use ($user2Id) {
            $query->where('user_id', $user2Id);
        })->where('type', 'direct')->first();

        if ($conversation) {
            return $conversation;
        }

        // Create new conversation
        return DB::transaction(function () use ($user1Id, $user2Id) {
            $conversation = Conversation::create([
                'type' => 'direct',
                'is_active' => true,
            ]);

            $conversation->participants()->attach([
                $user1Id => ['joined_at' => now()],
                $user2Id => ['joined_at' => now()],
            ]);

            return $conversation;
        });
    }

    private function sendMessageNotification(DirectMessage $message): void
    {
        // Implementation depends on notification preferences
        $recipient = $message->recipient;
        
        if ($recipient->notification_preferences['messages'] ?? true) {
            $this->notificationService->sendPushNotification(
                $recipient->device_token ?? '',
                'New Message',
                $message->sender->full_name . ': ' . substr($message->content, 0, 50),
                [
                    'type' => 'message',
                    'conversation_id' => $message->conversation_id,
                    'sender_id' => $message->sender_id,
                ]
            );
        }
    }
}
```

### Step 4: Create Resources and Routes (60 minutes)

**Create ActivityFeedResource (app/Http/Resources/Core/ActivityFeedResource.php):**
```php
<?php

namespace App\Http\Resources\Core;

use App\Http\Resources\BaseResource;

class ActivityFeedResource extends BaseResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'action_type' => $this->action_type,
            'data' => $this->data,
            'is_public' => $this->is_public,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'actor' => [
                'id' => $this->actor->id,
                'full_name' => $this->actor->full_name,
                'profile_image' => $this->actor->profile_image,
                'username' => $this->actor->coreProfile?->username,
            ],
            'actionable' => $this->when($this->relationLoaded('actionable'), function () {
                return [
                    'type' => class_basename($this->actionable_type),
                    'id' => $this->actionable_id,
                    'data' => $this->getActionableData(),
                ];
            }),
        ];
    }

    private function getActionableData(): array
    {
        if (!$this->actionable) {
            return [];
        }

        switch (class_basename($this->actionable_type)) {
            case 'Event':
                return [
                    'title' => $this->actionable->title,
                    'start_time' => $this->actionable->start_time->format('Y-m-d H:i:s'),
                    'location' => $this->actionable->location,
                ];
            case 'User':
                return [
                    'full_name' => $this->actionable->full_name,
                    'username' => $this->actionable->coreProfile?->username,
                ];
            default:
                return [];
        }
    }
}
```

**Update routes/api/core.php:**
```php
// Add to existing routes

Route::prefix('social')->group(function () {
    // Activity feed
    Route::get('/feed', [ActivityFeedController::class, 'index']);
    Route::get('/users/{id}/activities', [ActivityFeedController::class, 'userActivities']);
    Route::post('/activities', [ActivityFeedController::class, 'createActivity']);
    
    // Direct messaging
    Route::get('/conversations', [DirectMessageController::class, 'conversations']);
    Route::get('/conversations/{id}/messages', [DirectMessageController::class, 'messages']);
    Route::post('/messages', [DirectMessageController::class, 'sendMessage']);
    Route::put('/messages/{id}/read', [DirectMessageController::class, 'markAsRead']);
    Route::get('/messages/unread-count', [DirectMessageController::class, 'unreadCount']);
    Route::post('/conversations/start', [DirectMessageController::class, 'startConversation']);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});
```

## Acceptance Criteria

### Activity Feed
- [ ] Personalized activity feed based on following
- [ ] User activity timeline
- [ ] Activity creation for events and social actions
- [ ] Public/private activity visibility

### Direct Messaging
- [ ] Start conversations between users
- [ ] Send and receive messages
- [ ] Message read status tracking
- [ ] Unread message count
- [ ] Real-time message notifications

### Social Notifications
- [ ] In-app notification system
- [ ] Push notification integration
- [ ] Notification preferences
- [ ] Mark notifications as read

### Friend Suggestions
- [ ] Suggest users based on mutual connections
- [ ] Interest-based suggestions
- [ ] Location-based suggestions
- [ ] Activity-based suggestions

## Testing Instructions

### Manual Testing
```bash
# Get activity feed
curl -X GET http://localhost:8000/api/v1/core/social/feed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send message
curl -X POST http://localhost:8000/api/v1/core/social/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":2,"content":"Hello there!"}'

# Get conversations
curl -X GET http://localhost:8000/api/v1/core/social/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps
After completion, proceed to:
- Task 005: Payment Integration
- Coordinate with Agent 5 on mobile social UI
- Test real-time messaging features

## Documentation
- Update API documentation with social endpoints
- Document messaging and notification systems
- Create social features integration guide
