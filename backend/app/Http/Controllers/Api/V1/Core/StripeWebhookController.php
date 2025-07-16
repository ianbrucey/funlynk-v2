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
