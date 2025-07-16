<?php

namespace Database\Factories\Core;

use App\Models\Core\Payout;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayoutFactory extends Factory
{
    protected $model = Payout::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'stripe_payout_id' => 'po_' . $this->faker->bothify('??#?#?#?#?#?#?#?#'),
            'amount' => $this->faker->randomFloat(2, 50, 1000),
            'currency' => 'usd',
            'status' => $this->faker->randomElement(['pending', 'paid', 'failed']),
            'arrival_date' => $this->faker->dateTimeBetween('+1 day', '+7 days'),
            'description' => $this->faker->sentence(),
            'failure_code' => null,
            'failure_message' => null,
            'metadata' => [
                'created_by' => 'factory',
            ],
        ];
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'paid',
            'arrival_date' => $this->faker->dateTimeThisMonth(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'arrival_date' => $this->faker->dateTimeBetween('+1 day', '+7 days'),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'failure_code' => 'insufficient_funds',
            'failure_message' => 'Insufficient funds in account',
        ]);
    }
}
