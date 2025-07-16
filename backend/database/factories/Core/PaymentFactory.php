<?php

namespace Database\Factories\Core;

use App\Models\Core\Payment;
use App\Models\Core\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'payable_type' => Event::class,
            'payable_id' => Event::factory(),
            'stripe_payment_intent_id' => 'pi_' . $this->faker->bothify('??#?#?#?#?#?#?#?#'),
            'stripe_charge_id' => 'ch_' . $this->faker->bothify('??#?#?#?#?#?#?#?#'),
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'currency' => 'usd',
            'status' => $this->faker->randomElement(['pending', 'succeeded', 'failed']),
            'payment_method' => 'card',
            'description' => $this->faker->sentence(),
            'metadata' => [
                'event_id' => $this->faker->randomNumber(),
                'host_id' => $this->faker->randomNumber(),
            ],
            'fee_amount' => $this->faker->randomFloat(2, 0.5, 25),
            'net_amount' => $this->faker->randomFloat(2, 9.5, 475),
            'refunded_amount' => 0,
            'refunded_at' => null,
            'processed_at' => $this->faker->dateTimeThisMonth(),
        ];
    }

    public function succeeded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'succeeded',
            'processed_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'processed_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'processed_at' => null,
        ]);
    }

    public function refunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'succeeded',
            'refunded_amount' => $attributes['amount'],
            'refunded_at' => now(),
        ]);
    }
}
