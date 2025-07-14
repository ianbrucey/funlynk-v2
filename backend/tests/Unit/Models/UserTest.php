<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create default roles
        Role::create(['name' => 'user']);
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'moderator']);
    }

    public function test_user_has_correct_fillable_attributes(): void
    {
        $user = new User();
        $expected = [
            'first_name',
            'last_name',
            'name',
            'email',
            'password',
            'phone',
            'country_code',
            'date_of_birth',
            'gender',
            'avatar',
            'bio',
            'timezone',
            'language',
        ];

        $this->assertEquals($expected, $user->getFillable());
    }

    public function test_user_has_correct_guarded_attributes(): void
    {
        $user = new User();
        $expected = [
            'id',
            'email_verified_at',
            'remember_token',
            'is_active',
            'last_login_at',
        ];

        $this->assertEquals($expected, $user->getGuarded());
    }

    public function test_user_has_correct_hidden_attributes(): void
    {
        $user = new User();
        $expected = [
            'password',
            'remember_token',
        ];

        $this->assertEquals($expected, $user->getHidden());
    }

    public function test_user_has_correct_casts(): void
    {
        $user = new User();
        $expected = [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];

        $this->assertEquals($expected, $user->getCasts());
    }

    public function test_full_name_attribute_with_first_and_last_name(): void
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'name' => 'John Doe',
        ]);

        $this->assertEquals('John Doe', $user->full_name);
    }

    public function test_full_name_attribute_falls_back_to_name(): void
    {
        $user = User::factory()->create([
            'first_name' => null,
            'last_name' => null,
            'name' => 'John Doe',
        ]);

        $this->assertEquals('John Doe', $user->full_name);
    }

    public function test_full_name_attribute_handles_empty_names(): void
    {
        $user = User::factory()->create([
            'first_name' => null,
            'last_name' => null,
            'name' => null,
        ]);

        $this->assertEquals('', $user->full_name);
    }

    public function test_initials_attribute(): void
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'name' => 'John Doe',
        ]);

        $this->assertEquals('JD', $user->initials);
    }

    public function test_initials_attribute_with_single_name(): void
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => null,
            'name' => 'John',
        ]);

        $this->assertEquals('J', $user->initials);
    }

    public function test_initials_attribute_with_multiple_names(): void
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Smith',
            'name' => 'John Michael Smith',
        ]);

        $this->assertEquals('JM', $user->initials);
    }

    public function test_age_attribute_with_date_of_birth(): void
    {
        $user = User::factory()->create([
            'date_of_birth' => Carbon::now()->subYears(25)->format('Y-m-d'),
        ]);

        $this->assertEquals(25, $user->age);
    }

    public function test_age_attribute_without_date_of_birth(): void
    {
        $user = User::factory()->create([
            'date_of_birth' => null,
        ]);

        $this->assertNull($user->age);
    }

    public function test_formatted_phone_attribute_with_country_code(): void
    {
        $user = User::factory()->create([
            'phone' => '1234567890',
            'country_code' => '1',
        ]);

        $this->assertEquals('+1 1234567890', $user->formatted_phone);
    }

    public function test_formatted_phone_attribute_without_country_code(): void
    {
        $user = User::factory()->create([
            'phone' => '1234567890',
            'country_code' => null,
        ]);

        $this->assertEquals('1234567890', $user->formatted_phone);
    }

    public function test_formatted_phone_attribute_without_phone(): void
    {
        $user = User::factory()->create([
            'phone' => null,
            'country_code' => '1',
        ]);

        $this->assertNull($user->formatted_phone);
    }

    public function test_avatar_url_attribute_with_avatar(): void
    {
        $user = User::factory()->create([
            'avatar' => 'avatars/user.jpg',
        ]);

        $this->assertEquals(url('storage/avatars/user.jpg'), $user->avatar_url);
    }

    public function test_avatar_url_attribute_without_avatar(): void
    {
        $user = User::factory()->create([
            'avatar' => null,
            'first_name' => 'John',
            'last_name' => 'Doe',
        ]);

        $expected = 'https://ui-avatars.com/api/?name=' . urlencode('John Doe') . '&color=7F9CF5&background=EBF4FF';
        $this->assertEquals($expected, $user->avatar_url);
    }

    public function test_is_profile_complete_attribute_with_complete_profile(): void
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
        ]);

        $this->assertTrue($user->is_profile_complete);
    }

    public function test_is_profile_complete_attribute_with_incomplete_profile(): void
    {
        $user = User::factory()->create([
            'first_name' => 'John',
            'last_name' => null,
            'email' => 'john@example.com',
            'phone' => '1234567890',
        ]);

        $this->assertFalse($user->is_profile_complete);
    }

    public function test_timezone_display_attribute(): void
    {
        $user = User::factory()->create([
            'timezone' => 'America/New_York',
        ]);

        $this->assertEquals('America/New York', $user->timezone_display);
    }

    public function test_is_recently_active_attribute_with_recent_login(): void
    {
        $user = User::factory()->create([
            'last_login_at' => Carbon::now()->subDays(3),
        ]);

        $this->assertTrue($user->is_recently_active);
    }

    public function test_is_recently_active_attribute_with_old_login(): void
    {
        $user = User::factory()->create([
            'last_login_at' => Carbon::now()->subDays(10),
        ]);

        $this->assertFalse($user->is_recently_active);
    }

    public function test_is_recently_active_attribute_without_login(): void
    {
        $user = User::factory()->create([
            'last_login_at' => null,
        ]);

        $this->assertFalse($user->is_recently_active);
    }

    public function test_status_attribute_with_inactive_user(): void
    {
        $user = User::factory()->inactive()->create();

        $this->assertEquals('inactive', $user->status);
    }

    public function test_status_attribute_with_recently_active_user(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
            'last_login_at' => Carbon::now()->subDays(3),
        ]);

        $this->assertEquals('online', $user->status);
    }

    public function test_status_attribute_with_offline_user(): void
    {
        $user = User::factory()->create([
            'is_active' => true,
            'last_login_at' => Carbon::now()->subDays(10),
        ]);

        $this->assertEquals('offline', $user->status);
    }

    public function test_active_scope(): void
    {
        User::factory()->active()->create();
        User::factory()->inactive()->create();

        $activeUsers = User::active()->get();

        $this->assertCount(1, $activeUsers);
        $this->assertTrue($activeUsers->first()->is_active);
    }

    public function test_email_verified_scope(): void
    {
        User::factory()->create(['email_verified_at' => now()]);
        User::factory()->unverified()->create();

        $verifiedUsers = User::emailVerified()->get();

        $this->assertCount(1, $verifiedUsers);
        $this->assertNotNull($verifiedUsers->first()->email_verified_at);
    }

    public function test_recently_active_scope(): void
    {
        User::factory()->create(['last_login_at' => Carbon::now()->subDays(5)]);
        User::factory()->create(['last_login_at' => Carbon::now()->subDays(35)]);

        $recentUsers = User::recentlyActive()->get();

        $this->assertCount(1, $recentUsers);
        $this->assertTrue($recentUsers->first()->last_login_at->isAfter(Carbon::now()->subDays(30)));
    }

    public function test_recently_active_scope_with_custom_days(): void
    {
        User::factory()->create(['last_login_at' => Carbon::now()->subDays(5)]);
        User::factory()->create(['last_login_at' => Carbon::now()->subDays(8)]);

        $recentUsers = User::recentlyActive(7)->get();

        $this->assertCount(1, $recentUsers);
        $this->assertTrue($recentUsers->first()->last_login_at->isAfter(Carbon::now()->subDays(7)));
    }

    public function test_in_timezone_scope(): void
    {
        User::factory()->create(['timezone' => 'America/New_York']);
        User::factory()->create(['timezone' => 'Europe/London']);

        $usersInTimezone = User::inTimezone('America/New_York')->get();

        $this->assertCount(1, $usersInTimezone);
        $this->assertEquals('America/New_York', $usersInTimezone->first()->timezone);
    }

    public function test_language_scope(): void
    {
        User::factory()->create(['language' => 'en']);
        User::factory()->create(['language' => 'es']);

        $englishUsers = User::language('en')->get();

        $this->assertCount(1, $englishUsers);
        $this->assertEquals('en', $englishUsers->first()->language);
    }

    public function test_gender_scope(): void
    {
        User::factory()->male()->create();
        User::factory()->female()->create();

        $maleUsers = User::gender('male')->get();

        $this->assertCount(1, $maleUsers);
        $this->assertEquals('male', $maleUsers->first()->gender);
    }

    public function test_age_range_scope(): void
    {
        User::factory()->age(25)->create();
        User::factory()->age(35)->create();
        User::factory()->age(45)->create();

        $usersInRange = User::ageRange(30, 40)->get();

        $this->assertCount(1, $usersInRange);
        $this->assertTrue($usersInRange->first()->age >= 30 && $usersInRange->first()->age <= 40);
    }

    public function test_password_is_hashed_on_creation(): void
    {
        $user = User::factory()->create([
            'password' => 'plaintext-password',
        ]);

        $this->assertNotEquals('plaintext-password', $user->password);
        $this->assertTrue(password_verify('plaintext-password', $user->password));
    }

    public function test_user_can_be_soft_deleted(): void
    {
        $user = User::factory()->create();
        $userId = $user->id;

        $user->delete();

        $this->assertSoftDeleted('users', ['id' => $userId]);
        $this->assertNotNull($user->fresh()->deleted_at);
    }

    public function test_user_relationships_exist(): void
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $user->coreProfile());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $user->sparkProfile());
    }

    public function test_user_has_api_tokens_trait(): void
    {
        $user = User::factory()->create();

        $this->assertTrue(method_exists($user, 'createToken'));
        $this->assertTrue(method_exists($user, 'tokens'));
    }

    public function test_user_has_roles_trait(): void
    {
        $user = User::factory()->create();

        $this->assertTrue(method_exists($user, 'assignRole'));
        $this->assertTrue(method_exists($user, 'hasRole'));
        $this->assertTrue(method_exists($user, 'removeRole'));
    }

    public function test_user_has_notifiable_trait(): void
    {
        $user = User::factory()->create();

        $this->assertTrue(method_exists($user, 'notify'));
        $this->assertTrue(method_exists($user, 'notifications'));
    }

    public function test_user_implements_must_verify_email(): void
    {
        $user = User::factory()->create();

        $this->assertTrue(method_exists($user, 'hasVerifiedEmail'));
        $this->assertTrue(method_exists($user, 'markEmailAsVerified'));
        $this->assertTrue(method_exists($user, 'sendEmailVerificationNotification'));
    }
}
