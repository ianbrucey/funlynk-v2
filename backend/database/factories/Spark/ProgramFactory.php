<?php

namespace Database\Factories\Spark;

use App\Models\Spark\Program;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Program Factory
 *
 * Generates realistic test data for Spark educational programs
 */
class ProgramFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Program::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $characterTopics = [
            'Respect', 'Responsibility', 'Integrity', 'Kindness', 'Perseverance',
            'Courage', 'Empathy', 'Teamwork', 'Leadership', 'Citizenship',
            'Honesty', 'Compassion', 'Self-Control', 'Gratitude', 'Fairness'
        ];

        $gradeLevels = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        $selectedGrades = $this->faker->randomElements($gradeLevels, $this->faker->numberBetween(1, 4));

        $learningObjectives = [
            'Students will understand the importance of character development',
            'Students will practice respectful communication skills',
            'Students will demonstrate leadership qualities',
            'Students will work effectively in teams',
            'Students will show empathy towards others',
            'Students will make responsible decisions',
            'Students will exhibit integrity in their actions',
            'Students will persevere through challenges',
            'Students will show kindness to peers and community',
            'Students will understand civic responsibility'
        ];

        $materialsNeeded = [
            'Whiteboard and markers',
            'Character trait worksheets',
            'Role-playing scenario cards',
            'Discussion prompt cards',
            'Reflection journals',
            'Art supplies for activities',
            'Video presentation equipment',
            'Interactive games and props',
            'Character books and stories',
            'Assessment rubrics'
        ];

        return [
            'title' => $this->generateProgramTitle(),
            'description' => $this->faker->paragraphs(3, true),
            'grade_levels' => $selectedGrades,
            'duration_minutes' => $this->faker->randomElement([30, 45, 60, 90, 120, 180]),
            'max_students' => $this->faker->numberBetween(15, 100),
            'price_per_student' => $this->faker->randomFloat(2, 0, 25.00),
            'character_topics' => $this->faker->randomElements($characterTopics, $this->faker->numberBetween(1, 3)),
            'learning_objectives' => $this->faker->randomElements($learningObjectives, $this->faker->numberBetween(2, 5)),
            'materials_needed' => $this->faker->randomElements($materialsNeeded, $this->faker->numberBetween(3, 8)),
            'resource_files' => [],
            'special_requirements' => $this->faker->optional(0.3)->sentence(),
            'is_active' => $this->faker->boolean(85), // 85% chance of being active
        ];
    }

    /**
     * Generate a realistic program title
     *
     * @return string
     */
    private function generateProgramTitle(): string
    {
        $prefixes = [
            'Building', 'Developing', 'Exploring', 'Understanding', 'Practicing',
            'Discovering', 'Strengthening', 'Cultivating', 'Fostering', 'Embracing'
        ];

        $topics = [
            'Character and Values', 'Leadership Skills', 'Respect and Kindness',
            'Responsibility and Integrity', 'Teamwork and Cooperation',
            'Empathy and Compassion', 'Courage and Perseverance',
            'Citizenship and Community', 'Self-Control and Decision Making',
            'Honesty and Trust', 'Gratitude and Appreciation'
        ];

        $suffixes = [
            'Workshop', 'Program', 'Experience', 'Journey', 'Adventure',
            'Challenge', 'Quest', 'Discovery', 'Exploration', 'Initiative'
        ];

        return $this->faker->randomElement($prefixes) . ' ' .
               $this->faker->randomElement($topics) . ' ' .
               $this->faker->randomElement($suffixes);
    }

    /**
     * Indicate that the program is inactive.
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
     * Indicate that the program is free.
     *
     * @return static
     */
    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'price_per_student' => 0.00,
        ]);
    }

    /**
     * Indicate that the program is for elementary grades.
     *
     * @return static
     */
    public function elementary(): static
    {
        return $this->state(fn (array $attributes) => [
            'grade_levels' => $this->faker->randomElements(['K', '1', '2', '3', '4', '5'], $this->faker->numberBetween(2, 4)),
            'duration_minutes' => $this->faker->randomElement([30, 45, 60]),
            'max_students' => $this->faker->numberBetween(15, 30),
        ]);
    }

    /**
     * Indicate that the program is for middle school grades.
     *
     * @return static
     */
    public function middleSchool(): static
    {
        return $this->state(fn (array $attributes) => [
            'grade_levels' => $this->faker->randomElements(['6', '7', '8'], $this->faker->numberBetween(1, 3)),
            'duration_minutes' => $this->faker->randomElement([45, 60, 90]),
            'max_students' => $this->faker->numberBetween(20, 40),
        ]);
    }

    /**
     * Indicate that the program is for high school grades.
     *
     * @return static
     */
    public function highSchool(): static
    {
        return $this->state(fn (array $attributes) => [
            'grade_levels' => $this->faker->randomElements(['9', '10', '11', '12'], $this->faker->numberBetween(1, 4)),
            'duration_minutes' => $this->faker->randomElement([60, 90, 120, 180]),
            'max_students' => $this->faker->numberBetween(25, 100),
        ]);
    }

    /**
     * Indicate that the program is premium pricing.
     *
     * @return static
     */
    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'price_per_student' => $this->faker->randomFloat(2, 15.00, 50.00),
        ]);
    }
}

