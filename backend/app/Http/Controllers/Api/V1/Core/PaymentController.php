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
    public function createPaymentIntent(int $eventId, ProcessPaymentRequest $request): JsonResponse
    {
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
            return $this->errorResponse($e->getMessage(), null, 400);
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
            return $this->errorResponse($e->getMessage(), null, 400);
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
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }
}
