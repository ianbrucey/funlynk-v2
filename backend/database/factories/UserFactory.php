<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $firstName = fake()->firstName();
        $lastName = fake()->lastName();
        
        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'name' => $firstName . ' ' . $lastName,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'phone' => fake()->phoneNumber(),
            'country_code' => fake()->countryCode(),
            'date_of_birth' => fake()->dateTimeBetween('-50 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'bio' => fake()->sentence(),
            'timezone' => fake()->timezone(),
            'language' => fake()->randomElement(['en', 'es', 'fr', 'de']),
            'avatar' => null,
            'is_active' => true,
            'last_login_at' => Carbon::now(),
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user should be inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the user should be active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Create a user with minimal required fields.
     */
    public function minimal(): static
    {
        return $this->state(fn (array $attributes) => [
            'phone' => null,
            'country_code' => null,
            'date_of_birth' => null,
            'gender' => null,
            'bio' => null,
            'avatar' => null,
            'timezone' => 'UTC',
            'language' => 'en',
        ]);
    }

    /**
     * Create a user with specific role.
     */
    public function withRole(string $role): static
    {
        return $this->afterCreating(function ($user) use ($role) {
            $user->assignRole($role);
        });
    }

    /**
     * Create a user with admin role.
     */
    public function admin(): static
    {
        return $this->withRole('admin');
    }

    /**
     * Create a user with moderator role.
     */
    public function moderator(): static
    {
        return $this->withRole('moderator');
    }

    /**
     * Create a user with specific gender.
     */
    public function male(): static
    {
        return $this->state(fn (array $attributes) => [
            'gender' => 'male',
        ]);
    }

    /**
     * Create a user with specific gender.
     */
    public function female(): static
    {
        return $this->state(fn (array $attributes) => [
            'gender' => 'female',
        ]);
    }

    /**
     * Create a user with specific age.
     */
    public function age(int $age): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => now()->subYears($age)->format('Y-m-d'),
        ]);
    }

    /**
     * Create a user with specific timezone.
     */
    public function timezone(string $timezone): static
    {
        return $this->state(fn (array $attributes) => [
            'timezone' => $timezone,
        ]);
    }

    /**
     * Create a user with specific language.
     */
    public function language(string $language): static
    {
        return $this->state(fn (array $attributes) => [
            'language' => $language,
        ]);
    }

    /**
     * Create a user with recent login.
     */
    public function recentlyActive(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_login_at' => Carbon::now()->subMinutes(fake()->numberBetween(1, 60)),
        ]);
    }

    /**
     * Create a user with old login.
     */
    public function oldLogin(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_login_at' => Carbon::now()->subDays(fake()->numberBetween(10, 365)),
        ]);
    }

    /**
     * Create a user with no login history.
     */
    public function neverLoggedIn(): static
    {
        return $this->state(fn (array $attributes) => [
            'last_login_at' => null,
        ]);
    }

    /**
     * Create a user with specific password.
     */
    public function withPassword(string $password): static
    {
        return $this->state(fn (array $attributes) => [
            'password' => Hash::make($password),
        ]);
    }

    /**
     * Create a user with specific email.
     */
    public function withEmail(string $email): static
    {
        return $this->state(fn (array $attributes) => [
            'email' => $email,
        ]);
    }
}
