<?php

namespace Database\Factories\Spark;

use App\Models\Spark\CharacterTopic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Character Topic Factory.
 *
 * Generates realistic test data for character development topics
 */
class CharacterTopicFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = CharacterTopic::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $topics = [
            'respect' => [
                'Treating Others with Respect',
                'Respecting Differences',
                'Self-Respect and Dignity',
                'Respecting Authority',
                'Cultural Respect and Understanding'
            ],
            'responsibility' => [
                'Personal Responsibility',
                'Academic Responsibility',
                'Environmental Responsibility',
                'Social Responsibility',
                'Taking Ownership of Actions'
            ],
            'integrity' => [
                'Honesty and Truthfulness',
                'Doing the Right Thing',
                'Moral Courage',
                'Keeping Promises',
                'Ethical Decision Making'
            ],
            'kindness' => [
                'Acts of Kindness',
                'Compassion for Others',
                'Helping Those in Need',
                'Random Acts of Kindness',
                'Kindness to Animals and Nature'
            ],
            'perseverance' => [
                'Never Giving Up',
                'Overcoming Challenges',
                'Building Resilience',
                'Learning from Failure',
                'Persistence in Goals'
            ],
            'courage' => [
                'Standing Up for Others',
                'Facing Your Fears',
                'Moral Courage',
                'Speaking Up for What\'s Right',
                'Taking Positive Risks'
            ],
            'empathy' => [
                'Understanding Others\' Feelings',
                'Walking in Someone Else\'s Shoes',
                'Active Listening',
                'Showing Compassion',
                'Building Emotional Intelligence'
            ],
            'teamwork' => [
                'Working Together',
                'Collaboration Skills',
                'Supporting Team Members',
                'Sharing Responsibilities',
                'Building Team Spirit'
            ],
            'leadership' => [
                'Leading by Example',
                'Inspiring Others',
                'Making Good Decisions',
                'Taking Initiative',
                'Servant Leadership'
            ],
            'citizenship' => [
                'Being a Good Citizen',
                'Community Service',
                'Civic Responsibility',
                'Respecting Laws and Rules',
                'Making a Positive Impact'
            ]
        ];

        $category = $this->faker->randomElement(array_keys($topics));
        $topicName = $this->faker->randomElement($topics[$category]);

        return [
            'name' => $topicName,
            'slug' => $this->generateSlug($topicName),
            'description' => $this->generateDescription($topicName, $category),
            'category' => $category,
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }

    /**
     * Generate a slug from the topic name.
     *
     * @param string $name
     *
     * @return string
     */
    private function generateSlug(string $name): string
    {
        return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name)));
    }

    /**
     * Generate a description for the topic.
     *
     * @param string $topicName
     * @param string $category
     *
     * @return string
     */
    private function generateDescription(string $topicName, string $category): string
    {
        $descriptions = [
            'respect' => 'This topic focuses on building mutual respect and understanding among students, teaching them to value diversity and treat others with dignity.',
            'responsibility' => 'Students learn about personal accountability and the importance of taking ownership of their actions and decisions.',
            'integrity' => 'This character trait emphasizes honesty, moral courage, and doing the right thing even when no one is watching.',
            'kindness' => 'Students explore the power of kindness and compassion, learning how small acts can make a big difference in others\' lives.',
            'perseverance' => 'This topic teaches students the value of persistence, resilience, and never giving up in the face of challenges.',
            'courage' => 'Students learn about different types of courage and how to stand up for what is right, even in difficult situations.',
            'empathy' => 'This character trait focuses on understanding and sharing the feelings of others, building emotional intelligence.',
            'teamwork' => 'Students learn the importance of collaboration, cooperation, and working together to achieve common goals.',
            'leadership' => 'This topic explores different leadership styles and teaches students how to inspire and guide others positively.',
            'citizenship' => 'Students learn about their role in the community and how to be responsible, contributing members of society.'
        ];

        return $descriptions[$category] ?? 'This character development topic helps students build important life skills and values.';
    }

    /**
     * Indicate that the topic is inactive.
     *
     * @return static
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a topic for a specific category.
     *
     * @param string $category
     *
     * @return static
     */
    public function category(string $category): static
    {
        $topics = [
            'respect' => 'Treating Others with Respect',
            'responsibility' => 'Personal Responsibility',
            'integrity' => 'Honesty and Truthfulness',
            'kindness' => 'Acts of Kindness',
            'perseverance' => 'Never Giving Up',
            'courage' => 'Standing Up for Others',
            'empathy' => 'Understanding Others\' Feelings',
            'teamwork' => 'Working Together',
            'leadership' => 'Leading by Example',
            'citizenship' => 'Being a Good Citizen'
        ];

        $topicName = $topics[$category] ?? 'Character Development';

        return $this->state(fn (array $attributes) => [
            'name' => $topicName,
            'slug' => $this->generateSlug($topicName),
            'description' => $this->generateDescription($topicName, $category),
            'category' => $category,
        ]);
    }

    /**
     * Create a topic with high sort order (appears first).
     *
     * @return static
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes) => [
            'sort_order' => $this->faker->numberBetween(1, 10),
            'is_active' => true,
        ]);
    }
}
