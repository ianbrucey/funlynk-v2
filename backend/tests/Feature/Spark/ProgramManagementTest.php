<?php

namespace Tests\Feature\Spark;

use App\Models\Spark\SparkProgram;
use App\Models\Spark\CharacterTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProgramManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected User $sparkAdminUser;
    protected User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'spark_admin']);
        Role::firstOrCreate(['name' => 'user']);

        // Create test users
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        $this->sparkAdminUser = User::factory()->create();
        $this->sparkAdminUser->assignRole('spark_admin');

        $this->regularUser = User::factory()->create();
        $this->regularUser->assignRole('user');

        // Create test character topics
        CharacterTopic::factory()->create([
            'name' => 'Leadership',
            'slug' => 'leadership',
            'category' => 'character',
            'is_active' => true,
        ]);

        CharacterTopic::factory()->create([
            'name' => 'Teamwork',
            'slug' => 'teamwork',
            'category' => 'character',
            'is_active' => true,
        ]);
    }

    /** @test */
    public function authenticated_user_can_get_programs_list()
    {
        Sanctum::actingAs($this->regularUser);

        // Create test programs
        SparkProgram::factory()->count(3)->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/spark/programs');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'description',
                            'duration_minutes',
                            'max_students',
                            'price_per_student',
                            'grade_levels',
                            'learning_objectives',
                            'is_active',
                            'created_at',
                            'updated_at',
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total',
                ]
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_programs()
    {
        $response = $this->getJson('/api/v1/spark/programs');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_filter_programs_by_grade_level()
    {
        Sanctum::actingAs($this->regularUser);

        SparkProgram::factory()->create([
            'title' => 'Elementary Program',
            'grade_levels' => ['K', '1', '2'],
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'High School Program',
            'grade_levels' => ['9', '10', '11', '12'],
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/spark/programs?grade_level=K');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Elementary Program', $data[0]['title']);
    }

    /** @test */
    public function user_can_filter_programs_by_character_topic()
    {
        Sanctum::actingAs($this->regularUser);

        $leadershipTopic = CharacterTopic::where('slug', 'leadership')->first();
        $teamworkTopic = CharacterTopic::where('slug', 'teamwork')->first();

        $program1 = SparkProgram::factory()->create([
            'title' => 'Leadership Program',
            'is_active' => true,
        ]);
        $program1->characterTopics()->attach($leadershipTopic->id);

        $program2 = SparkProgram::factory()->create([
            'title' => 'Teamwork Program',
            'is_active' => true,
        ]);
        $program2->characterTopics()->attach($teamworkTopic->id);

        $response = $this->getJson('/api/v1/spark/programs?character_topic=leadership');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Leadership Program', $data[0]['title']);
    }

    /** @test */
    public function user_can_filter_programs_by_duration_range()
    {
        Sanctum::actingAs($this->regularUser);

        SparkProgram::factory()->create([
            'title' => 'Short Program',
            'duration_minutes' => 30,
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'Long Program',
            'duration_minutes' => 120,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/spark/programs?min_duration=60&max_duration=180');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Long Program', $data[0]['title']);
    }

    /** @test */
    public function user_can_search_programs_by_title()
    {
        Sanctum::actingAs($this->regularUser);

        SparkProgram::factory()->create([
            'title' => 'Amazing Leadership Workshop',
            'is_active' => true,
        ]);

        SparkProgram::factory()->create([
            'title' => 'Teamwork Building Session',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/spark/programs?search=leadership');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Amazing Leadership Workshop', $data[0]['title']);
    }

    /** @test */
    public function admin_can_create_new_program()
    {
        Sanctum::actingAs($this->adminUser);
        Storage::fake('s3');

        $leadershipTopic = CharacterTopic::where('slug', 'leadership')->first();

        $programData = [
            'title' => 'New Leadership Program',
            'description' => 'A comprehensive leadership development program',
            'duration_minutes' => 90,
            'max_students' => 25,
            'price_per_student' => 15.00,
            'grade_levels' => ['6', '7', '8'],
            'learning_objectives' => [
                'Develop leadership skills',
                'Build confidence',
                'Learn teamwork'
            ],
            'character_topics' => [$leadershipTopic->id],
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/programs', $programData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'title',
                    'description',
                    'duration_minutes',
                    'max_students',
                    'price_per_student',
                    'grade_levels',
                    'learning_objectives',
                    'is_active',
                ]
            ]);

        $this->assertDatabaseHas('spark_programs', [
            'title' => 'New Leadership Program',
            'duration_minutes' => 90,
            'max_students' => 25,
            'price_per_student' => 15.00,
        ]);
    }

    /** @test */
    public function spark_admin_can_create_new_program()
    {
        Sanctum::actingAs($this->sparkAdminUser);

        $programData = [
            'title' => 'Spark Admin Program',
            'description' => 'Program created by spark admin',
            'duration_minutes' => 60,
            'max_students' => 20,
            'price_per_student' => 12.00,
            'grade_levels' => ['3', '4', '5'],
            'learning_objectives' => ['Test objective'],
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/programs', $programData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('spark_programs', [
            'title' => 'Spark Admin Program',
        ]);
    }

    /** @test */
    public function regular_user_cannot_create_program()
    {
        Sanctum::actingAs($this->regularUser);

        $programData = [
            'title' => 'Unauthorized Program',
            'description' => 'This should not be created',
            'duration_minutes' => 60,
            'max_students' => 20,
            'price_per_student' => 10.00,
            'grade_levels' => ['1', '2'],
            'learning_objectives' => ['Test'],
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/programs', $programData);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('spark_programs', [
            'title' => 'Unauthorized Program',
        ]);
    }

    /** @test */
    public function program_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/spark/programs', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'title',
                'description',
                'duration_minutes',
                'max_students',
                'price_per_student',
                'grade_levels',
                'learning_objectives',
            ]);
    }

    /** @test */
    public function user_can_get_specific_program()
    {
        Sanctum::actingAs($this->regularUser);

        $program = SparkProgram::factory()->create([
            'title' => 'Specific Program',
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/v1/spark/programs/{$program->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $program->id,
                    'title' => 'Specific Program',
                ]
            ]);
    }

    /** @test */
    public function user_gets_404_for_nonexistent_program()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/v1/spark/programs/999');

        $response->assertStatus(404);
    }
}
