# Task 005: Payment Integration
**Agent**: Core Funlynk Backend Developer  
**Estimated Time**: 4-5 hours  
**Priority**: Medium  
**Dependencies**: Task 004 (Social Features API)  

## Overview
Implement Stripe Connect integration for event monetization, including payment processing, payout management, and transaction tracking for Core Funlynk hosts.

## Prerequisites
- Task 004 completed successfully
- Event management system working
- Stripe account and API keys configured
- User management system available

## Step-by-Step Implementation

### Step 1: Install and Configure Stripe (30 minutes)

**Install Stripe PHP SDK:**
```bash
composer require stripe/stripe-php
```

**Configure Stripe in config/services.php:**
```php
'stripe' => [
    'model' => App\Models\User::class,
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
    'webhook' => [
        'secret' => env('STRIPE_WEBHOOK_SECRET'),
        'tolerance' => env('STRIPE_WEBHOOK_TOLERANCE', 300),
    ],
    'connect' => [
        'client_id' => env('STRIPE_CONNECT_CLIENT_ID'),
    ],
],
```

**Add Stripe configuration to .env:**
```env
STRIPE_KEY=pk_test_your_publishable_key
STRIPE_SECRET=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_CONNECT_CLIENT_ID=ca_your_connect_client_id
```

### Step 2: Create Payment Models (60 minutes)

**Create StripeAccount model (app/Models/Core/StripeAccount.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class StripeAccount extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_account_id',
        'account_type',
        'country',
        'currency',
        'business_type',
        'charges_enabled',
        'payouts_enabled',
        'details_submitted',
        'requirements',
        'capabilities',
        'metadata',
    ];

    protected $casts = [
        'charges_enabled' => 'boolean',
        'payouts_enabled' => 'boolean',
        'details_submitted' => 'boolean',
        'requirements' => 'array',
        'capabilities' => 'array',
        'metadata' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getIsActiveAttribute(): bool
    {
        return $this->charges_enabled && $this->payouts_enabled;
    }

    public function getRequiresActionAttribute(): bool
    {
        return !empty($this->requirements['currently_due']) || 
               !empty($this->requirements['eventually_due']);
    }
}
```

**Create Payment model (app/Models/Core/Payment.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use App\Models\User;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'payable_type',
        'payable_id',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'description',
        'metadata',
        'fee_amount',
        'net_amount',
        'refunded_amount',
        'refunded_at',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee_amount' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'metadata' => 'array',
        'refunded_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'succeeded');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    // Accessors
    public function getIsSuccessfulAttribute(): bool
    {
        return $this->status === 'succeeded';
    }

    public function getIsRefundableAttribute(): bool
    {
        return $this->is_successful && 
               $this->refunded_amount < $this->amount &&
               $this->created_at->diffInDays(now()) <= 90;
    }
}
```

**Create Payout model (app/Models/Core/Payout.php):**
```php
<?php

namespace App\Models\Core;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Payout extends Model
{
    protected $fillable = [
        'user_id',
        'stripe_payout_id',
        'amount',
        'currency',
        'status',
        'arrival_date',
        'description',
        'failure_code',
        'failure_message',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'arrival_date' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
```

### Step 3: Create Payment Controllers (90 minutes)

**Create PaymentController (app/Http/Controllers/Api/V1/Core/PaymentController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Core\ProcessPaymentRequest;
use App\Http\Resources\Core\PaymentResource;
use App\Services\Core\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends BaseApiController
{
    public function __construct(
        private PaymentService $paymentService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Create payment intent for event
     */
    public function createPaymentIntent(int $eventId, Request $request): JsonResponse
    {
        $request->validate([
            'payment_method_id' => 'required|string',
            'save_payment_method' => 'sometimes|boolean',
        ]);

        try {
            $paymentIntent = $this->paymentService->createEventPaymentIntent(
                $eventId,
                auth()->id(),
                $request->payment_method_id,
                $request->save_payment_method ?? false
            );

            return $this->successResponse([
                'client_secret' => $paymentIntent['client_secret'],
                'payment_intent_id' => $paymentIntent['id'],
                'amount' => $paymentIntent['amount'],
                'currency' => $paymentIntent['currency'],
            ], 'Payment intent created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Confirm payment
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
        ]);

        try {
            $payment = $this->paymentService->confirmPayment(
                $request->payment_intent_id,
                auth()->id()
            );

            return $this->successResponse(
                new PaymentResource($payment),
                'Payment confirmed successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get user's payment history
     */
    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:50',
            'status' => 'sometimes|string|in:succeeded,pending,failed,refunded',
        ]);

        $payments = $this->paymentService->getUserPayments(
            auth()->id(),
            $request->status,
            $request->per_page ?? 20
        );

        return $this->paginatedResponse($payments, 'Payment history retrieved successfully');
    }

    /**
     * Request refund
     */
    public function requestRefund(int $paymentId, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => 'sometimes|string|max:500',
            'amount' => 'sometimes|numeric|min:0.01',
        ]);

        try {
            $refund = $this->paymentService->processRefund(
                $paymentId,
                auth()->id(),
                $request->amount,
                $request->reason
            );

            return $this->successResponse($refund, 'Refund processed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
```

**Create StripeConnectController (app/Http/Controllers/Api/V1/Core/StripeConnectController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Core\StripeAccountResource;
use App\Services\Core\StripeConnectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StripeConnectController extends BaseApiController
{
    public function __construct(
        private StripeConnectService $stripeConnectService
    ) {
        parent::__construct(app(\App\Services\Shared\LoggingService::class));
    }

    /**
     * Create Stripe Connect account
     */
    public function createAccount(Request $request): JsonResponse
    {
        $request->validate([
            'country' => 'required|string|size:2',
            'business_type' => 'sometimes|string|in:individual,company',
            'email' => 'sometimes|email',
        ]);

        try {
            $account = $this->stripeConnectService->createConnectAccount(
                auth()->user(),
                $request->validated()
            );

            return $this->successResponse(
                new StripeAccountResource($account),
                'Stripe Connect account created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get account onboarding link
     */
    public function getOnboardingLink(): JsonResponse
    {
        try {
            $link = $this->stripeConnectService->createOnboardingLink(auth()->user());

            return $this->successResponse([
                'url' => $link['url'],
                'expires_at' => $link['expires_at'],
            ], 'Onboarding link created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get account dashboard link
     */
    public function getDashboardLink(): JsonResponse
    {
        try {
            $link = $this->stripeConnectService->createDashboardLink(auth()->user());

            return $this->successResponse([
                'url' => $link['url'],
            ], 'Dashboard link created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get account status
     */
    public function getAccountStatus(): JsonResponse
    {
        $account = auth()->user()->stripeAccount;

        if (!$account) {
            return $this->errorResponse('No Stripe account found', 404);
        }

        try {
            $updatedAccount = $this->stripeConnectService->refreshAccountStatus($account);

            return $this->successResponse(
                new StripeAccountResource($updatedAccount),
                'Account status retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get earnings summary
     */
    public function getEarnings(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'sometimes|string|in:week,month,year',
        ]);

        try {
            $earnings = $this->stripeConnectService->getEarningsSummary(
                auth()->user(),
                $request->period ?? 'month'
            );

            return $this->successResponse($earnings, 'Earnings retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
```

### Step 4: Create Payment Service (120 minutes)

**Create PaymentService (app/Services/Core/PaymentService.php):**
```php
<?php

namespace App\Services\Core;

use App\Models\Core\Event;
use App\Models\Core\Payment;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

class PaymentService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function createEventPaymentIntent(
        int $eventId,
        int $userId,
        string $paymentMethodId,
        bool $savePaymentMethod = false
    ): array {
        $event = Event::findOrFail($eventId);
        $user = User::findOrFail($userId);

        if ($event->price <= 0) {
            throw new \Exception('This event is free');
        }

        if ($event->is_full) {
            throw new \Exception('Event is full');
        }

        // Check if user already has a payment for this event
        $existingPayment = Payment::where('user_id', $userId)
            ->where('payable_type', Event::class)
            ->where('payable_id', $eventId)
            ->where('status', 'succeeded')
            ->first();

        if ($existingPayment) {
            throw new \Exception('You have already paid for this event');
        }

        return DB::transaction(function () use ($event, $user, $paymentMethodId, $savePaymentMethod) {
            $amount = (int) ($event->price * 100); // Convert to cents
            $applicationFeeAmount = (int) ($amount * 0.05); // 5% platform fee

            $paymentIntentData = [
                'amount' => $amount,
                'currency' => 'usd',
                'payment_method' => $paymentMethodId,
                'customer' => $this->getOrCreateStripeCustomer($user),
                'description' => "Payment for event: {$event->title}",
                'metadata' => [
                    'event_id' => $event->id,
                    'user_id' => $user->id,
                    'event_title' => $event->title,
                ],
                'confirmation_method' => 'manual',
                'confirm' => true,
                'return_url' => config('app.frontend_url') . '/payment/return',
            ];

            // Add Connect account and application fee if host has Stripe account
            if ($event->host->stripeAccount && $event->host->stripeAccount->is_active) {
                $paymentIntentData['transfer_data'] = [
                    'destination' => $event->host->stripeAccount->stripe_account_id,
                ];
                $paymentIntentData['application_fee_amount'] = $applicationFeeAmount;
            }

            if ($savePaymentMethod) {
                $paymentIntentData['setup_future_usage'] = 'off_session';
            }

            $paymentIntent = $this->stripe->paymentIntents->create($paymentIntentData);

            // Create payment record
            Payment::create([
                'user_id' => $user->id,
                'payable_type' => Event::class,
                'payable_id' => $event->id,
                'stripe_payment_intent_id' => $paymentIntent->id,
                'amount' => $event->price,
                'currency' => 'usd',
                'status' => 'pending',
                'payment_method' => 'card',
                'description' => "Payment for event: {$event->title}",
                'fee_amount' => $applicationFeeAmount / 100,
                'net_amount' => ($amount - $applicationFeeAmount) / 100,
                'metadata' => [
                    'event_id' => $event->id,
                    'host_id' => $event->host_id,
                ],
            ]);

            return [
                'id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
                'amount' => $amount,
                'currency' => $paymentIntent->currency,
                'status' => $paymentIntent->status,
            ];
        });
    }

    public function confirmPayment(string $paymentIntentId, int $userId): Payment
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntentId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

        return DB::transaction(function () use ($payment, $paymentIntent) {
            $payment->update([
                'status' => $paymentIntent->status,
                'stripe_charge_id' => $paymentIntent->charges->data[0]->id ?? null,
                'processed_at' => $paymentIntent->status === 'succeeded' ? now() : null,
            ]);

            // If payment succeeded, update event attendance
            if ($paymentIntent->status === 'succeeded') {
                $event = $payment->payable;
                $event->attendees()->updateOrCreate(
                    ['user_id' => $payment->user_id],
                    ['status' => 'going', 'rsvp_at' => now()]
                );
            }

            return $payment->fresh(['payable', 'user']);
        });
    }

    public function processRefund(int $paymentId, int $userId, ?float $amount = null, ?string $reason = null): array
    {
        $payment = Payment::where('id', $paymentId)
            ->where('user_id', $userId)
            ->where('status', 'succeeded')
            ->firstOrFail();

        if (!$payment->is_refundable) {
            throw new \Exception('Payment is not refundable');
        }

        $refundAmount = $amount ? (int) ($amount * 100) : null;

        $refund = $this->stripe->refunds->create([
            'charge' => $payment->stripe_charge_id,
            'amount' => $refundAmount,
            'reason' => $reason ?: 'requested_by_customer',
            'metadata' => [
                'payment_id' => $payment->id,
                'user_id' => $userId,
            ],
        ]);

        $payment->update([
            'refunded_amount' => ($payment->refunded_amount ?? 0) + ($refund->amount / 100),
            'refunded_at' => now(),
        ]);

        return [
            'refund_id' => $refund->id,
            'amount' => $refund->amount / 100,
            'status' => $refund->status,
        ];
    }

    public function getUserPayments(int $userId, ?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = Payment::with(['payable'])
            ->where('user_id', $userId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    private function getOrCreateStripeCustomer(User $user): string
    {
        if ($user->stripe_customer_id) {
            return $user->stripe_customer_id;
        }

        $customer = $this->stripe->customers->create([
            'email' => $user->email,
            'name' => $user->full_name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer->id;
    }
}
```

### Step 5: Create Webhook Handler (45 minutes)

**Create StripeWebhookController (app/Http/Controllers/Api/V1/Core/StripeWebhookController.php):**
```php
<?php

namespace App\Http\Controllers\Api\V1\Core;

use App\Http\Controllers\Controller;
use App\Services\Core\StripeWebhookService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        private StripeWebhookService $webhookService
    ) {}

    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook.secret');

        try {
            $event = Webhook::constructEvent($payload, $signature, $endpointSecret);
        } catch (\Exception $e) {
            return response('Invalid signature', 400);
        }

        try {
            $this->webhookService->handleEvent($event);
            return response('Webhook handled', 200);
        } catch (\Exception $e) {
            return response('Webhook handling failed', 500);
        }
    }
}
```

### Step 6: Update Routes (15 minutes)

**Update routes/api/core.php:**
```php
// Add to existing routes

Route::prefix('payments')->group(function () {
    Route::post('/events/{id}/payment-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm', [PaymentController::class, 'confirmPayment']);
    Route::get('/history', [PaymentController::class, 'history']);
    Route::post('/{id}/refund', [PaymentController::class, 'requestRefund']);
});

Route::prefix('stripe-connect')->group(function () {
    Route::post('/account', [StripeConnectController::class, 'createAccount']);
    Route::get('/onboarding-link', [StripeConnectController::class, 'getOnboardingLink']);
    Route::get('/dashboard-link', [StripeConnectController::class, 'getDashboardLink']);
    Route::get('/account-status', [StripeConnectController::class, 'getAccountStatus']);
    Route::get('/earnings', [StripeConnectController::class, 'getEarnings']);
});

// Webhook route (outside auth middleware)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);
```

## Acceptance Criteria

### Payment Processing
- [ ] Create payment intents for paid events
- [ ] Process payments with Stripe
- [ ] Handle payment confirmation
- [ ] Support saved payment methods
- [ ] Platform fee calculation and collection

### Stripe Connect Integration
- [ ] Create Connect accounts for hosts
- [ ] Onboarding flow for account setup
- [ ] Transfer payments to host accounts
- [ ] Dashboard access for hosts
- [ ] Account status monitoring

### Refund Management
- [ ] Process full and partial refunds
- [ ] Refund eligibility validation
- [ ] Automatic refund processing
- [ ] Refund status tracking

### Transaction Management
- [ ] Payment history for users
- [ ] Earnings summary for hosts
- [ ] Transaction status tracking
- [ ] Webhook event handling

## Testing Instructions

### Manual Testing
```bash
# Create payment intent
curl -X POST http://localhost:8000/api/v1/core/payments/events/1/payment-intent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_method_id":"pm_card_visa"}'

# Get payment history
curl -X GET http://localhost:8000/api/v1/core/payments/history \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create Stripe Connect account
curl -X POST http://localhost:8000/api/v1/core/stripe-connect/account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country":"US","business_type":"individual"}'
```

## Next Steps
After completion:
- Coordinate with Agent 5 on mobile payment UI
- Test payment flows end-to-end
- Set up production Stripe webhooks
- Document payment integration for frontend teams

## Documentation
- Update API documentation with payment endpoints
- Document Stripe Connect onboarding flow
- Create payment testing guide
- Document webhook event handling
