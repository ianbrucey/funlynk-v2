<?php

namespace Database\Factories\Core;

use App\Models\Core\FriendSuggestion;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Core\FriendSuggestion>
 */
class FriendSuggestionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = FriendSuggestion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $suggestionTypes = [
            'mutual_friends',
            'shared_interests',
            'location_proximity',
            'activity_patterns',
            'imported_contacts',
        ];

        return [
            'user_id' => User::factory(),
            'suggested_user_id' => User::factory(),
            'suggestion_type' => $this->faker->randomElement($suggestionTypes),
            'confidence_score' => $this->faker->randomFloat(2, 0.1, 1.0),
            'suggestion_reasons' => [
                'primary_reason' => $this->faker->randomElement([
                    'mutual_friends',
                    'shared_interests',
                    'location',
                    'activity'
                ]),
                'details' => $this->faker->sentence(),
            ],
            'mutual_connections' => $this->generateMutualConnections(),
            'mutual_friends_count' => $this->faker->numberBetween(0, 20),
            'shared_interests_count' => $this->faker->numberBetween(0, 10),
            'shared_events_count' => $this->faker->numberBetween(0, 5),
            'is_dismissed' => $this->faker->boolean(20), // 20% chance of being dismissed
            'is_contacted' => $this->faker->boolean(10), // 10% chance of being contacted
            'is_followed' => $this->faker->boolean(5), // 5% chance of being followed
            'dismissed_at' => null,
            'contacted_at' => null,
            'followed_at' => null,
            'expires_at' => $this->faker->dateTimeBetween('now', '+30 days'),
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (FriendSuggestion $suggestion) {
            // Set timestamps based on boolean flags
            if ($suggestion->is_dismissed && !$suggestion->dismissed_at) {
                $suggestion->dismissed_at = $this->faker->dateTimeBetween('-1 week', 'now');
            }
            
            if ($suggestion->is_contacted && !$suggestion->contacted_at) {
                $suggestion->contacted_at = $this->faker->dateTimeBetween('-1 week', 'now');
            }
            
            if ($suggestion->is_followed && !$suggestion->followed_at) {
                $suggestion->followed_at = $this->faker->dateTimeBetween('-1 week', 'now');
            }
        });
    }

    /**
     * Generate mutual connections data.
     */
    private function generateMutualConnections(): array
    {
        $count = $this->faker->numberBetween(0, 5);
        $connections = [];
        
        for ($i = 0; $i < $count; $i++) {
            $connections[] = [
                'user_id' => $this->faker->numberBetween(1, 1000),
                'name' => $this->faker->name(),
                'connection_strength' => $this->faker->randomFloat(2, 0.1, 1.0),
            ];
        }
        
        return $connections;
    }

    /**
     * Indicate that the suggestion is active (not dismissed).
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_dismissed' => false,
            'dismissed_at' => null,
        ]);
    }

    /**
     * Indicate that the suggestion is dismissed.
     */
    public function dismissed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_dismissed' => true,
            'dismissed_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the suggestion has been contacted.
     */
    public function contacted(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_contacted' => true,
            'contacted_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Indicate that the suggestion has been followed.
     */
    public function followed(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_followed' => true,
            'followed_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ]);
    }

    /**
     * Create suggestion of specific type.
     */
    public function ofType(string $type): static
    {
        return $this->state(fn (array $attributes) => [
            'suggestion_type' => $type,
        ]);
    }

    /**
     * Create high confidence suggestion.
     */
    public function highConfidence(): static
    {
        return $this->state(fn (array $attributes) => [
            'confidence_score' => $this->faker->randomFloat(2, 0.8, 1.0),
        ]);
    }

    /**
     * Create low confidence suggestion.
     */
    public function lowConfidence(): static
    {
        return $this->state(fn (array $attributes) => [
            'confidence_score' => $this->faker->randomFloat(2, 0.1, 0.4),
        ]);
    }

    /**
     * Create suggestion for specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create suggestion of specific user.
     */
    public function suggesting(User $suggestedUser): static
    {
        return $this->state(fn (array $attributes) => [
            'suggested_user_id' => $suggestedUser->id,
        ]);
    }

    /**
     * Create suggestion with many mutual friends.
     */
    public function withManyMutualFriends(): static
    {
        return $this->state(fn (array $attributes) => [
            'suggestion_type' => 'mutual_friends',
            'mutual_friends_count' => $this->faker->numberBetween(10, 50),
            'confidence_score' => $this->faker->randomFloat(2, 0.7, 1.0),
        ]);
    }

    /**
     * Create suggestion with shared interests.
     */
    public function withSharedInterests(): static
    {
        return $this->state(fn (array $attributes) => [
            'suggestion_type' => 'shared_interests',
            'shared_interests_count' => $this->faker->numberBetween(5, 15),
            'confidence_score' => $this->faker->randomFloat(2, 0.6, 0.9),
        ]);
    }

    /**
     * Create expired suggestion.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => $this->faker->dateTimeBetween('-1 month', '-1 day'),
        ]);
    }

    /**
     * Create suggestion that expires soon.
     */
    public function expiringSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => $this->faker->dateTimeBetween('now', '+3 days'),
        ]);
    }

    /**
     * Create recent suggestion.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-1 day', 'now'),
        ]);
    }

    /**
     * Create old suggestion.
     */
    public function old(): static
    {
        return $this->state(fn (array $attributes) => [
            'created_at' => $this->faker->dateTimeBetween('-1 month', '-1 week'),
        ]);
    }
}
