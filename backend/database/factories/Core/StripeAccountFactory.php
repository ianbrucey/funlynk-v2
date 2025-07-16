<?php

namespace Database\Factories\Core;

use App\Models\Core\StripeAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StripeAccountFactory extends Factory
{
    protected $model = StripeAccount::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'stripe_account_id' => 'acct_' . $this->faker->bothify('??#?#?#?#?#?#?#?#'),
            'account_type' => $this->faker->randomElement(['express', 'standard', 'custom']),
            'country' => $this->faker->countryCode(),
            'currency' => 'usd',
            'business_type' => $this->faker->randomElement(['individual', 'company']),
            'charges_enabled' => $this->faker->boolean(80),
            'payouts_enabled' => $this->faker->boolean(80),
            'details_submitted' => $this->faker->boolean(90),
            'requirements' => [
                'currently_due' => [],
                'eventually_due' => [],
                'past_due' => [],
                'pending_verification' => [],
            ],
            'capabilities' => [
                'card_payments' => 'active',
                'transfers' => 'active',
            ],
            'metadata' => [
                'created_by' => 'factory',
            ],
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'charges_enabled' => true,
            'payouts_enabled' => true,
            'details_submitted' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'charges_enabled' => false,
            'payouts_enabled' => false,
            'details_submitted' => false,
        ]);
    }
}
