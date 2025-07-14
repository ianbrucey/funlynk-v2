<?php

namespace Database\Seeders\Spark;

use App\Models\Spark\CharacterTopic;
use App\Models\Spark\Program;
use App\Models\Spark\ProgramAvailability;
use Illuminate\Database\Seeder;

/**
 * Spark Module Seeder.
 *
 * Seeds the database with realistic Spark educational program data
 */
class SparkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding Spark module data...');

        // Seed character topics first
        $this->seedCharacterTopics();

        // Seed programs
        $this->seedPrograms();

        // Seed program availability
        $this->seedProgramAvailability();

        $this->command->info('Spark module seeding completed!');
    }

    /**
     * Seed character topics with predefined categories.
     */
    private function seedCharacterTopics(): void
    {
        $this->command->info('Seeding character topics...');

        $topics = [
            ['category' => 'respect', 'name' => 'Treating Others with Respect', 'sort_order' => 1],
            ['category' => 'respect', 'name' => 'Respecting Differences', 'sort_order' => 2],
            ['category' => 'respect', 'name' => 'Self-Respect and Dignity', 'sort_order' => 3],

            ['category' => 'responsibility', 'name' => 'Personal Responsibility', 'sort_order' => 4],
            ['category' => 'responsibility', 'name' => 'Academic Responsibility', 'sort_order' => 5],
            ['category' => 'responsibility', 'name' => 'Environmental Responsibility', 'sort_order' => 6],

            ['category' => 'integrity', 'name' => 'Honesty and Truthfulness', 'sort_order' => 7],
            ['category' => 'integrity', 'name' => 'Doing the Right Thing', 'sort_order' => 8],
            ['category' => 'integrity', 'name' => 'Moral Courage', 'sort_order' => 9],

            ['category' => 'kindness', 'name' => 'Acts of Kindness', 'sort_order' => 10],
            ['category' => 'kindness', 'name' => 'Compassion for Others', 'sort_order' => 11],
            ['category' => 'kindness', 'name' => 'Helping Those in Need', 'sort_order' => 12],

            ['category' => 'perseverance', 'name' => 'Never Giving Up', 'sort_order' => 13],
            ['category' => 'perseverance', 'name' => 'Overcoming Challenges', 'sort_order' => 14],
            ['category' => 'perseverance', 'name' => 'Building Resilience', 'sort_order' => 15],

            ['category' => 'courage', 'name' => 'Standing Up for Others', 'sort_order' => 16],
            ['category' => 'courage', 'name' => 'Facing Your Fears', 'sort_order' => 17],
            ['category' => 'courage', 'name' => 'Speaking Up for What\'s Right', 'sort_order' => 18],

            ['category' => 'empathy', 'name' => 'Understanding Others\' Feelings', 'sort_order' => 19],
            ['category' => 'empathy', 'name' => 'Active Listening', 'sort_order' => 20],
            ['category' => 'empathy', 'name' => 'Showing Compassion', 'sort_order' => 21],

            ['category' => 'teamwork', 'name' => 'Working Together', 'sort_order' => 22],
            ['category' => 'teamwork', 'name' => 'Collaboration Skills', 'sort_order' => 23],
            ['category' => 'teamwork', 'name' => 'Supporting Team Members', 'sort_order' => 24],

            ['category' => 'leadership', 'name' => 'Leading by Example', 'sort_order' => 25],
            ['category' => 'leadership', 'name' => 'Inspiring Others', 'sort_order' => 26],
            ['category' => 'leadership', 'name' => 'Taking Initiative', 'sort_order' => 27],

            ['category' => 'citizenship', 'name' => 'Being a Good Citizen', 'sort_order' => 28],
            ['category' => 'citizenship', 'name' => 'Community Service', 'sort_order' => 29],
            ['category' => 'citizenship', 'name' => 'Civic Responsibility', 'sort_order' => 30],
        ];

        foreach ($topics as $topicData) {
            CharacterTopic::firstOrCreate(
                ['slug' => $this->generateSlug($topicData['name'])],
                [
                    'name' => $topicData['name'],
                    'category' => $topicData['category'],
                    'description' => $this->getTopicDescription($topicData['category']),
                    'sort_order' => $topicData['sort_order'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Created ' . count($topics) . ' character topics');
    }

    /**
     * Seed programs with various configurations.
     */
    private function seedPrograms(): void
    {
        $this->command->info('Seeding programs...');

        // Create elementary programs
        Program::factory()
            ->count(8)
            ->elementary()
            ->create();

        // Create middle school programs
        Program::factory()
            ->count(6)
            ->middleSchool()
            ->create();

        // Create high school programs
        Program::factory()
            ->count(6)
            ->highSchool()
            ->create();

        // Create some free programs
        Program::factory()
            ->count(4)
            ->free()
            ->create();

        // Create some premium programs
        Program::factory()
            ->count(3)
            ->premium()
            ->create();

        // Create some inactive programs
        Program::factory()
            ->count(2)
            ->inactive()
            ->create();

        $this->command->info('Created 29 programs with various configurations');
    }

    /**
     * Seed program availability slots.
     */
    private function seedProgramAvailability(): void
    {
        $this->command->info('Seeding program availability...');

        $programs = Program::all();

        foreach ($programs as $program) {
            // Create availability for today and tomorrow
            ProgramAvailability::factory()
                ->count(2)
                ->today()
                ->for($program)
                ->create();

            ProgramAvailability::factory()
                ->count(2)
                ->tomorrow()
                ->for($program)
                ->create();

            // Create future availability
            ProgramAvailability::factory()
                ->count(8)
                ->for($program)
                ->create();

            // Create some fully booked slots
            ProgramAvailability::factory()
                ->count(2)
                ->fullyBooked()
                ->for($program)
                ->create();

            // Create some partially booked slots
            ProgramAvailability::factory()
                ->count(3)
                ->partiallyBooked()
                ->for($program)
                ->create();
        }

        $totalSlots = $programs->count() * 17; // 17 slots per program
        $this->command->info("Created {$totalSlots} availability slots");
    }

    /**
     * Generate a slug from a name.
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
     * Get description for a topic category.
     *
     * @param string $category
     *
     * @return string
     */
    private function getTopicDescription(string $category): string
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
}
