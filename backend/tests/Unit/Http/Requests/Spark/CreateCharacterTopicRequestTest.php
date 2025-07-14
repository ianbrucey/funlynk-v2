<?php

namespace Tests\Unit\Http\Requests\Spark;

use App\Http\Requests\Spark\CreateCharacterTopicRequest;
use App\Models\Spark\CharacterTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CreateCharacterTopicRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create default roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'spark_admin']);
        Role::firstOrCreate(['name' => 'user']);
    }

    public function test_authorizes_admin_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $this->actingAs($user);

        $request = new CreateCharacterTopicRequest();

        $this->assertTrue($request->authorize());
    }

    public function test_authorizes_spark_admin_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('spark_admin');

        $this->actingAs($user);

        $request = new CreateCharacterTopicRequest();

        $this->assertTrue($request->authorize());
    }

    public function test_denies_regular_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');

        $this->actingAs($user);

        $request = new CreateCharacterTopicRequest();

        $this->assertFalse($request->authorize());
    }

    public function test_denies_unauthenticated_users(): void
    {
        $request = new CreateCharacterTopicRequest();

        $this->assertFalse($request->authorize());
    }

    public function test_passes_validation_with_valid_data(): void
    {
        $request = new CreateCharacterTopicRequest();
        $data = [
            'name' => 'Respect',
            'slug' => 'respect',
            'description' => 'Teaching students about respect',
            'category' => 'respect',
            'is_active' => true,
            'sort_order' => 1,
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    public function test_passes_validation_with_minimal_data(): void
    {
        $request = new CreateCharacterTopicRequest();
        $data = [
            'name' => 'Respect',
            'slug' => 'respect',
            'category' => 'respect',
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    public function test_fails_validation_when_name_is_missing(): void
    {
        $request = new CreateCharacterTopicRequest();
        $data = [
            'slug' => 'respect',
            'category' => 'respect',
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('name'));
    }

    public function test_fails_validation_when_slug_is_not_unique(): void
    {
        CharacterTopic::factory()->create(['slug' => 'existing-slug']);

        $request = new CreateCharacterTopicRequest();
        $data = [
            'name' => 'Respect',
            'slug' => 'existing-slug',
            'category' => 'respect',
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('slug'));
    }

    public function test_slug_is_generated_from_name_when_missing(): void
    {
        $request = new CreateCharacterTopicRequest();
        $request->replace([
            'name' => 'Test Name',
        ]);

        // Use reflection to call the protected method
        $reflection = new \ReflectionMethod($request, 'prepareForValidation');
        $reflection->setAccessible(true);
        $reflection->invoke($request);

        $this->assertEquals('test-name', $request->get('slug'));
    }
}
