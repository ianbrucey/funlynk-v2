<?php

namespace Database\Factories\Spark;

use App\Models\Spark\Program;
use App\Models\Spark\ProgramAvailability;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Program Availability Factory.
 *
 * Generates realistic test data for program availability slots
 */
class ProgramAvailabilityFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ProgramAvailability::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = $this->faker->dateTimeBetween('now', '+6 months');
        $startHour = $this->faker->numberBetween(8, 15); // 8 AM to 3 PM
        $startTime = Carbon::parse($date)->setTime($startHour, $this->faker->randomElement([0, 30]));
        $endTime = $startTime->copy()->addMinutes($this->faker->randomElement([30, 45, 60, 90, 120]));

        return [
            'program_id' => Program::factory(),
            'date' => $date->format('Y-m-d'),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'max_bookings' => $this->faker->numberBetween(1, 5),
            'current_bookings' => 0,
            'is_available' => $this->faker->boolean(85), // 85% chance of being available
            'notes' => $this->faker->optional(0.3)->sentence(),
        ];
    }

    /**
     * Indicate that the availability slot is fully booked.
     *
     * @return static
     */
    public function fullyBooked(): static
    {
        return $this->state(function (array $attributes) {
            $maxBookings = $attributes['max_bookings'] ?? 3;

            return [
                'current_bookings' => $maxBookings,
                'is_available' => false,
            ];
        });
    }

    /**
     * Indicate that the availability slot is unavailable.
     *
     * @return static
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => false,
        ]);
    }

    /**
     * Create availability for today.
     *
     * @return static
     */
    public function today(): static
    {
        $startHour = $this->faker->numberBetween(8, 15);
        $startTime = Carbon::today()->setTime($startHour, $this->faker->randomElement([0, 30]));
        $endTime = $startTime->copy()->addMinutes($this->faker->randomElement([30, 45, 60, 90]));

        return $this->state(fn (array $attributes) => [
            'date' => Carbon::today()->format('Y-m-d'),
            'start_time' => $startTime,
            'end_time' => $endTime,
        ]);
    }

    /**
     * Create availability for tomorrow.
     *
     * @return static
     */
    public function tomorrow(): static
    {
        $startHour = $this->faker->numberBetween(8, 15);
        $startTime = Carbon::tomorrow()->setTime($startHour, $this->faker->randomElement([0, 30]));
        $endTime = $startTime->copy()->addMinutes($this->faker->randomElement([30, 45, 60, 90]));

        return $this->state(fn (array $attributes) => [
            'date' => Carbon::tomorrow()->format('Y-m-d'),
            'start_time' => $startTime,
            'end_time' => $endTime,
        ]);
    }

    /**
     * Create availability with high capacity.
     *
     * @return static
     */
    public function highCapacity(): static
    {
        return $this->state(fn (array $attributes) => [
            'max_bookings' => $this->faker->numberBetween(8, 15),
        ]);
    }

    /**
     * Create availability with partial bookings.
     *
     * @return static
     */
    public function partiallyBooked(): static
    {
        return $this->state(function (array $attributes) {
            $maxBookings = $attributes['max_bookings'] ?? 3;
            $currentBookings = $this->faker->numberBetween(1, max(1, $maxBookings - 1));

            return [
                'current_bookings' => $currentBookings,
                'is_available' => true,
            ];
        });
    }
}
