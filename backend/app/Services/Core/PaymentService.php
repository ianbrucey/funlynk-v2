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
