<?php

namespace Database\Factories\Core;

use App\Models\Core\ActivityFeed;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Core\ActivityFeed>
 */
class ActivityFeedFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ActivityFeed::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $activityTypes = [
            'follow',
            'event_created',
            'event_joined',
            'event_commented',
            'event_shared',
            'profile_updated',
            'interest_added',
            'achievement_earned',
        ];

        $privacyLevels = ['public', 'friends', 'private'];

        return [
            'user_id' => User::factory(),
            'activity_type' => $this->faker->randomElement($activityTypes),
            'activityable_type' => null,
            'activityable_id' => null,
            'actor_id' => User::factory(),
            'activity_data' => [
                'action' => $this->faker->sentence(3),
                'context' => $this->faker->words(5),
            ],
            'activity_text' => $this->faker->sentence(),
            'privacy_level' => $this->faker->randomElement($privacyLevels),
            'is_read' => $this->faker->boolean(30), // 30% chance of being read
            'is_visible' => $this->faker->boolean(90), // 90% chance of being visible
            'engagement_score' => $this->faker->numberBetween(0, 100),
            'activity_timestamp' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ];
    }

    /**
     * Indicate that the activity is unread.
     */
    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
        ]);
    }

    /**
     * Indicate that the activity is read.
     */
    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
        ]);
    }

    /**
     * Indicate that the activity is visible.
     */
    public function visible(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_visible' => true,
        ]);
    }

    /**
     * Indicate that the activity is hidden.
     */
    public function hidden(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_visible' => false,
        ]);
    }

    /**
     * Indicate that the activity is public.
     */
    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'privacy_level' => 'public',
        ]);
    }

    /**
     * Indicate that the activity is private.
     */
    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'privacy_level' => 'private',
        ]);
    }

    /**
     * Indicate that the activity is for friends only.
     */
    public function friends(): static
    {
        return $this->state(fn (array $attributes) => [
            'privacy_level' => 'friends',
        ]);
    }

    /**
     * Indicate that the activity has high engagement.
     */
    public function highEngagement(): static
    {
        return $this->state(fn (array $attributes) => [
            'engagement_score' => $this->faker->numberBetween(80, 100),
        ]);
    }

    /**
     * Indicate that the activity has low engagement.
     */
    public function lowEngagement(): static
    {
        return $this->state(fn (array $attributes) => [
            'engagement_score' => $this->faker->numberBetween(0, 20),
        ]);
    }

    /**
     * Indicate that the activity is recent.
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_timestamp' => $this->faker->dateTimeBetween('-1 day', 'now'),
        ]);
    }

    /**
     * Indicate that the activity is old.
     */
    public function old(): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_timestamp' => $this->faker->dateTimeBetween('-1 month', '-1 week'),
        ]);
    }

    /**
     * Create activity of specific type.
     */
    public function ofType(string $type): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_type' => $type,
        ]);
    }

    /**
     * Create activity for specific user.
     */
    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create activity by specific actor.
     */
    public function byActor(User $actor): static
    {
        return $this->state(fn (array $attributes) => [
            'actor_id' => $actor->id,
        ]);
    }
}
