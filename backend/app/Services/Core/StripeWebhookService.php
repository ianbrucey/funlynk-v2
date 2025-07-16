<?php

namespace App\Services\Core;

use App\Models\Core\Payment;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class StripeWebhookService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function handleEvent($event): void
    {
        switch ($event['type']) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event['data']['object']);
                break;
            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event['data']['object']);
                break;
            // Add more event types as needed
            default:
                Log::info("Unhandled event type: {$event['type']}");
        }
    }

    private function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent['id'])
            ->where('status', 'pending')
            ->firstOrFail();

        $payment->update([
            'status' => 'succeeded',
            'stripe_charge_id' => $paymentIntent['charges']['data'][0]['id'],
            'processed_at' => now(),
        ]);

        Log::info("Payment intent succeeded: {$paymentIntent['id']}");
    }

    private function handlePaymentIntentFailed($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent['id'])
            ->where('status', 'pending')
            ->firstOrFail();

        $payment->update([
            'status' => 'failed',
            'processed_at' => now(),
        ]);

        Log::error("Payment intent failed: {$paymentIntent['id']}");
    }
}
