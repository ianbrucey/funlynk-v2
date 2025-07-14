<?php

namespace Tests\Unit\Http\Requests\Spark;

use App\Http\Requests\Spark\UpdateCharacterTopicRequest;
use App\Models\Spark\CharacterTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UpdateCharacterTopicRequestTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create default roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'spark_admin']);
        Role::firstOrCreate(['name' => 'user']);

        // Seed an existing character topic to test uniqueness
        CharacterTopic::factory()->create(['slug' => 'existing-slug']);
    }

    public function test_authorizes_admin_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        $characterTopic = CharacterTopic::factory()->create();

        $this->actingAs($user);

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $this->assertTrue($request->authorize());
    }

    public function test_authorizes_spark_admin_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('spark_admin');
        $characterTopic = CharacterTopic::factory()->create();

        $this->actingAs($user);

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $this->assertTrue($request->authorize());
    }

    public function test_denies_regular_users(): void
    {
        $user = User::factory()->create();
        $user->assignRole('user');
        $characterTopic = CharacterTopic::factory()->create();

        $this->actingAs($user);

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $this->assertFalse($request->authorize());
    }

    public function test_denies_unauthenticated_users(): void
    {
        $characterTopic = CharacterTopic::factory()->create();

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $this->assertFalse($request->authorize());
    }

    public function test_passes_validation_with_valid_data(): void
    {
        $characterTopic = CharacterTopic::factory()->create();

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $data = [
            'name' => 'Respect',
            'slug' => 'respect-updated',
            'description' => 'Teaching students about respect',
            'category' => 'respect',
            'is_active' => true,
            'sort_order' => 1,
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    public function test_fails_validation_when_slug_is_not_unique(): void
    {
        $characterTopic = CharacterTopic::factory()->create(['slug' => 'some-slug']);

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $data = [
            'slug' => 'existing-slug', // Already taken
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->fails());
        $this->assertTrue($validator->errors()->has('slug'));
    }

    public function test_passes_validation_when_slug_is_same_as_current(): void
    {
        $characterTopic = CharacterTopic::factory()->create(['slug' => 'current-slug']);

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $data = [
            'slug' => 'current-slug', // Same as current
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    public function test_passes_validation_with_partial_data(): void
    {
        $characterTopic = CharacterTopic::factory()->create();

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $data = [
            'name' => 'Updated Name',
        ];

        $validator = Validator::make($data, $request->rules());

        $this->assertTrue($validator->passes());
    }

    public function test_generates_slug_from_name_when_name_is_provided_but_slug_is_not(): void
    {
        $characterTopic = CharacterTopic::factory()->create();

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $request->replace([
            'name' => 'Test Name',
        ]);

        // Use reflection to call the protected method
        $reflection = new \ReflectionMethod($request, 'prepareForValidation');
        $reflection->setAccessible(true);
        $reflection->invoke($request);

        $this->assertEquals('test-name', $request->get('slug'));
    }

    public function test_normalizes_category_to_lowercase(): void
    {
        $characterTopic = CharacterTopic::factory()->create();

        $request = new UpdateCharacterTopicRequest();
        $request->setRouteResolver(function () use ($characterTopic) {
            return new class ($characterTopic) {
                public function __construct(private CharacterTopic $characterTopic)
                {
                }

                public function parameter($name)
                {
                    return $this->characterTopic;
                }

                public function route($name)
                {
                    return $this->characterTopic;
                }
            };
        });

        $request->replace([
            'category' => '  RESPECT  ',
        ]);

        // Use reflection to call the protected method
        $reflection = new \ReflectionMethod($request, 'prepareForValidation');
        $reflection->setAccessible(true);
        $reflection->invoke($request);

        $this->assertEquals('respect', $request->get('category'));
    }
}
