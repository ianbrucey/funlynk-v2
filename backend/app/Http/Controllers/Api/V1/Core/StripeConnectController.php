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
            return $this->errorResponse($e->getMessage(), null, 400);
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
            return $this->errorResponse($e->getMessage(), null, 400);
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
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }

    /**
     * Get account status
     */
    public function getAccountStatus(): JsonResponse
    {
        $account = auth()->user()->stripeAccount;

        if (!$account) {
            return $this->errorResponse('No Stripe account found', null, 404);
        }

        try {
            $updatedAccount = $this->stripeConnectService->refreshAccountStatus($account);

            return $this->successResponse(
                new StripeAccountResource($updatedAccount),
                'Account status retrieved successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 400);
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
            return $this->errorResponse($e->getMessage(), null, 400);
        }
    }
}
