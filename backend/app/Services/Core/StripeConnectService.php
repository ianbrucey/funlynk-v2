<?php

namespace App\Services\Core;

use App\Models\Core\StripeAccount;
use App\Models\Core\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Stripe\StripeClient;

class StripeConnectService
{
    private StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    public function createConnectAccount(User $user, array $data): StripeAccount
    {
        // Check if user already has a Stripe account
        if ($user->stripeAccount) {
            throw new \Exception('User already has a Stripe Connect account');
        }

        return DB::transaction(function () use ($user, $data) {
            $accountData = [
                'type' => 'express',
                'country' => $data['country'],
                'email' => $data['email'] ?? $user->email,
                'business_type' => $data['business_type'] ?? 'individual',
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
                'business_profile' => [
                    'product_description' => 'Event hosting and management',
                    'mcc' => '7999', // Amusement and Recreation Services
                ],
                'metadata' => [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                ],
            ];

            $account = $this->stripe->accounts->create($accountData);

            return StripeAccount::create([
                'user_id' => $user->id,
                'stripe_account_id' => $account->id,
                'account_type' => $account->type,
                'country' => $account->country,
                'currency' => $account->default_currency,
                'business_type' => $account->business_type,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled,
                'details_submitted' => $account->details_submitted,
                'requirements' => $account->requirements->toArray(),
                'capabilities' => $account->capabilities->toArray(),
                'metadata' => [
                    'created_at' => now(),
                ],
            ]);
        });
    }

    public function createOnboardingLink(User $user): array
    {
        $stripeAccount = $user->stripeAccount;
        if (!$stripeAccount) {
            throw new \Exception('User does not have a Stripe Connect account');
        }

        $accountLink = $this->stripe->accountLinks->create([
            'account' => $stripeAccount->stripe_account_id,
            'refresh_url' => config('app.frontend_url') . '/stripe/onboarding/refresh',
            'return_url' => config('app.frontend_url') . '/stripe/onboarding/return',
            'type' => 'account_onboarding',
        ]);

        return [
            'url' => $accountLink->url,
            'expires_at' => $accountLink->expires_at,
        ];
    }

    public function createDashboardLink(User $user): array
    {
        $stripeAccount = $user->stripeAccount;
        if (!$stripeAccount) {
            throw new \Exception('User does not have a Stripe Connect account');
        }

        if (!$stripeAccount->is_active) {
            throw new \Exception('Stripe account is not active');
        }

        $loginLink = $this->stripe->accounts->createLoginLink($stripeAccount->stripe_account_id);

        return [
            'url' => $loginLink->url,
        ];
    }

    public function refreshAccountStatus(StripeAccount $stripeAccount): StripeAccount
    {
        $account = $this->stripe->accounts->retrieve($stripeAccount->stripe_account_id);

        $stripeAccount->update([
            'charges_enabled' => $account->charges_enabled,
            'payouts_enabled' => $account->payouts_enabled,
            'details_submitted' => $account->details_submitted,
            'requirements' => $account->requirements->toArray(),
            'capabilities' => $account->capabilities->toArray(),
        ]);

        return $stripeAccount->fresh();
    }

    public function getEarningsSummary(User $user, string $period = 'month'): array
    {
        $stripeAccount = $user->stripeAccount;
        if (!$stripeAccount) {
            throw new \Exception('User does not have a Stripe Connect account');
        }

        $startDate = match($period) {
            'week' => now()->subWeek()->startOfDay(),
            'month' => now()->subMonth()->startOfDay(),
            'year' => now()->subYear()->startOfDay(),
            default => now()->subMonth()->startOfDay(),
        };

        // Get payments for events hosted by this user
        $payments = Payment::whereHas('payable', function ($query) use ($user) {
            $query->where('host_id', $user->id);
        })
        ->where('status', 'succeeded')
        ->where('created_at', '>=', $startDate)
        ->get();

        $totalEarnings = $payments->sum('net_amount');
        $totalFees = $payments->sum('fee_amount');
        $totalPayments = $payments->count();

        // Get balance from Stripe
        $balance = $this->stripe->balance->retrieve([], [
            'stripe_account' => $stripeAccount->stripe_account_id,
        ]);

        return [
            'period' => $period,
            'total_earnings' => $totalEarnings,
            'total_fees' => $totalFees,
            'total_payments' => $totalPayments,
            'available_balance' => $balance->available[0]->amount / 100,
            'pending_balance' => $balance->pending[0]->amount / 100,
            'currency' => $balance->available[0]->currency,
        ];
    }
}
