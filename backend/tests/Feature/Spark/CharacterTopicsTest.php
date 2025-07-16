<?php

namespace Tests\Feature\Spark;

use App\Models\Spark\CharacterTopic;
use App\Models\Spark\SparkProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CharacterTopicsTest extends TestCase
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
    }

    /** @test */
    public function authenticated_user_can_get_character_topics_list()
    {
        Sanctum::actingAs($this->regularUser);

        // Create test character topics
        CharacterTopic::factory()->count(3)->create(['is_active' => true]);

        $response = $this->getJson('/api/v1/spark/character-topics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'name',
                            'slug',
                            'description',
                            'category',
                            'icon',
                            'color',
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
    public function unauthenticated_user_cannot_access_character_topics()
    {
        $response = $this->getJson('/api/v1/spark/character-topics');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_filter_character_topics_by_category()
    {
        Sanctum::actingAs($this->regularUser);

        CharacterTopic::factory()->create([
            'name' => 'Leadership',
            'category' => 'character',
            'is_active' => true,
        ]);

        CharacterTopic::factory()->create([
            'name' => 'Math Skills',
            'category' => 'academic',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/spark/character-topics?category=character');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Leadership', $data[0]['name']);
        $this->assertEquals('character', $data[0]['category']);
    }

    /** @test */
    public function user_can_search_character_topics()
    {
        Sanctum::actingAs($this->regularUser);

        CharacterTopic::factory()->create([
            'name' => 'Leadership Development',
            'is_active' => true,
        ]);

        CharacterTopic::factory()->create([
            'name' => 'Teamwork Building',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/spark/character-topics?search=leadership');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Leadership Development', $data[0]['name']);
    }

    /** @test */
    public function admin_can_create_character_topic()
    {
        Sanctum::actingAs($this->adminUser);

        $topicData = [
            'name' => 'New Character Topic',
            'description' => 'A comprehensive character development topic',
            'category' => 'character',
            'icon' => 'fas fa-star',
            'color' => '#3498db',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/character-topics', $topicData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'category',
                    'icon',
                    'color',
                    'is_active',
                ]
            ]);

        $this->assertDatabaseHas('character_topics', [
            'name' => 'New Character Topic',
            'slug' => 'new-character-topic',
            'category' => 'character',
            'icon' => 'fas fa-star',
            'color' => '#3498db',
        ]);
    }

    /** @test */
    public function spark_admin_can_create_character_topic()
    {
        Sanctum::actingAs($this->sparkAdminUser);

        $topicData = [
            'name' => 'Spark Admin Topic',
            'description' => 'Topic created by spark admin',
            'category' => 'social',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/character-topics', $topicData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('character_topics', [
            'name' => 'Spark Admin Topic',
            'slug' => 'spark-admin-topic',
        ]);
    }

    /** @test */
    public function regular_user_cannot_create_character_topic()
    {
        Sanctum::actingAs($this->regularUser);

        $topicData = [
            'name' => 'Unauthorized Topic',
            'description' => 'This should not be created',
            'category' => 'character',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/character-topics', $topicData);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('character_topics', [
            'name' => 'Unauthorized Topic',
        ]);
    }

    /** @test */
    public function character_topic_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/spark/character-topics', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'description',
                'category',
            ]);
    }

    /** @test */
    public function character_topic_slug_is_auto_generated()
    {
        Sanctum::actingAs($this->adminUser);

        $topicData = [
            'name' => 'Leadership & Team Building',
            'description' => 'Test description',
            'category' => 'character',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/character-topics', $topicData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('character_topics', [
            'name' => 'Leadership & Team Building',
            'slug' => 'leadership-team-building',
        ]);
    }

    /** @test */
    public function character_topic_slug_must_be_unique()
    {
        Sanctum::actingAs($this->adminUser);

        // Create first topic
        CharacterTopic::factory()->create([
            'name' => 'Leadership',
            'slug' => 'leadership',
        ]);

        // Try to create another with same slug
        $topicData = [
            'name' => 'Leadership Skills',
            'slug' => 'leadership',
            'description' => 'Test description',
            'category' => 'character',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/spark/character-topics', $topicData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['slug']);
    }

    /** @test */
    public function user_can_get_specific_character_topic()
    {
        Sanctum::actingAs($this->regularUser);

        $topic = CharacterTopic::factory()->create([
            'name' => 'Specific Topic',
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/v1/spark/character-topics/{$topic->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $topic->id,
                    'name' => 'Specific Topic',
                ]
            ]);
    }

    /** @test */
    public function admin_can_update_character_topic()
    {
        Sanctum::actingAs($this->adminUser);

        $topic = CharacterTopic::factory()->create([
            'name' => 'Original Name',
            'description' => 'Original description',
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'color' => '#e74c3c',
        ];

        $response = $this->putJson("/api/v1/spark/character-topics/{$topic->id}", $updateData);

        $response->assertStatus(200);

        $this->assertDatabaseHas('character_topics', [
            'id' => $topic->id,
            'name' => 'Updated Name',
            'description' => 'Updated description',
            'color' => '#e74c3c',
        ]);
    }

    /** @test */
    public function regular_user_cannot_update_character_topic()
    {
        Sanctum::actingAs($this->regularUser);

        $topic = CharacterTopic::factory()->create([
            'name' => 'Original Name',
        ]);

        $updateData = [
            'name' => 'Unauthorized Update',
        ];

        $response = $this->putJson("/api/v1/spark/character-topics/{$topic->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_activate_character_topic()
    {
        Sanctum::actingAs($this->adminUser);

        $topic = CharacterTopic::factory()->create([
            'is_active' => false,
        ]);

        $response = $this->postJson("/api/v1/spark/character-topics/{$topic->id}/activate");

        $response->assertStatus(200);

        $topic->refresh();
        $this->assertTrue($topic->is_active);
    }

    /** @test */
    public function admin_can_deactivate_character_topic()
    {
        Sanctum::actingAs($this->adminUser);

        $topic = CharacterTopic::factory()->create([
            'is_active' => true,
        ]);

        $response = $this->postJson("/api/v1/spark/character-topics/{$topic->id}/deactivate");

        $response->assertStatus(200);

        $topic->refresh();
        $this->assertFalse($topic->is_active);
    }

    /** @test */
    public function user_can_get_programs_for_character_topic()
    {
        Sanctum::actingAs($this->regularUser);

        $topic = CharacterTopic::factory()->create(['is_active' => true]);

        $program = SparkProgram::factory()->create(['is_active' => true]);
        $program->characterTopics()->attach($topic->id);

        $response = $this->getJson("/api/v1/spark/character-topics/{$topic->id}/programs");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'title',
                            'description',
                            'duration_minutes',
                            'max_students',
                            'price_per_student',
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function user_can_get_character_topic_categories()
    {
        Sanctum::actingAs($this->regularUser);

        CharacterTopic::factory()->create(['category' => 'character']);
        CharacterTopic::factory()->create(['category' => 'academic']);
        CharacterTopic::factory()->create(['category' => 'social']);

        $response = $this->getJson('/api/v1/spark/character-topics/categories/list');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'categories' => []
                ]
            ]);

        $categories = $response->json('data.categories');
        $this->assertContains('character', $categories);
        $this->assertContains('academic', $categories);
        $this->assertContains('social', $categories);
    }

    /** @test */
    public function admin_can_delete_character_topic()
    {
        Sanctum::actingAs($this->adminUser);

        $topic = CharacterTopic::factory()->create();

        $response = $this->deleteJson("/api/v1/spark/character-topics/{$topic->id}");

        $response->assertStatus(200);

        $this->assertSoftDeleted('character_topics', [
            'id' => $topic->id,
        ]);
    }

    /** @test */
    public function user_gets_404_for_nonexistent_character_topic()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/v1/spark/character-topics/999');

        $response->assertStatus(404);
    }
}
