<?php

namespace Tests\Feature\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\SparkProgram;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BookingManagementTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected User $teacherUser;
    protected User $regularUser;
    protected School $school;
    protected SparkProgram $program;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'teacher']);
        Role::firstOrCreate(['name' => 'user']);

        // Create test users
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');

        $this->teacherUser = User::factory()->create();
        $this->teacherUser->assignRole('teacher');

        $this->regularUser = User::factory()->create();
        $this->regularUser->assignRole('user');

        // Create test school and program
        $this->school = School::factory()->create(['is_active' => true]);
        $this->program = SparkProgram::factory()->create([
            'is_active' => true,
            'max_students' => 30,
            'price_per_student' => 15.00,
        ]);
    }

    /** @test */
    public function authenticated_user_can_get_bookings_list()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test bookings
        Booking::factory()->count(3)->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
        ]);

        $response = $this->getJson('/api/v1/spark/bookings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'booking_reference',
                            'school_id',
                            'program_id',
                            'teacher_id',
                            'preferred_date',
                            'preferred_time',
                            'student_count',
                            'total_cost',
                            'status',
                            'payment_status',
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
    public function unauthenticated_user_cannot_access_bookings()
    {
        $response = $this->getJson('/api/v1/spark/bookings');

        $response->assertStatus(401);
    }

    /** @test */
    public function user_can_filter_bookings_by_school()
    {
        Sanctum::actingAs($this->adminUser);

        $otherSchool = School::factory()->create(['is_active' => true]);

        Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
        ]);

        Booking::factory()->create([
            'school_id' => $otherSchool->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
        ]);

        $response = $this->getJson("/api/v1/spark/bookings?school_id={$this->school->id}");

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->school->id, $data[0]['school_id']);
    }

    /** @test */
    public function user_can_filter_bookings_by_status()
    {
        Sanctum::actingAs($this->adminUser);

        Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'pending',
        ]);

        Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'confirmed',
        ]);

        $response = $this->getJson('/api/v1/spark/bookings?status=confirmed');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('confirmed', $data[0]['status']);
    }

    /** @test */
    public function user_can_filter_bookings_by_date_range()
    {
        Sanctum::actingAs($this->adminUser);

        Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'preferred_date' => '2024-01-15',
        ]);

        Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'preferred_date' => '2024-02-15',
        ]);

        $response = $this->getJson('/api/v1/spark/bookings?start_date=2024-02-01&end_date=2024-02-28');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('2024-02-15', $data[0]['preferred_date']);
    }

    /** @test */
    public function teacher_can_create_booking()
    {
        Sanctum::actingAs($this->teacherUser);

        $bookingData = [
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'preferred_date' => '2024-03-15',
            'preferred_time' => '10:00',
            'student_count' => 25,
            'contact_info' => [
                'phone' => '555-1234',
                'email' => 'teacher@school.edu',
            ],
            'special_requests' => 'Need projector setup',
        ];

        $response = $this->postJson('/api/v1/spark/bookings', $bookingData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'booking_reference',
                    'school_id',
                    'program_id',
                    'teacher_id',
                    'preferred_date',
                    'preferred_time',
                    'student_count',
                    'total_cost',
                    'status',
                    'payment_status',
                ]
            ]);

        $this->assertDatabaseHas('bookings', [
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'student_count' => 25,
            'total_cost' => 25 * 15.00, // student_count * price_per_student
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);
    }

    /** @test */
    public function booking_creation_validates_required_fields()
    {
        Sanctum::actingAs($this->teacherUser);

        $response = $this->postJson('/api/v1/spark/bookings', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'school_id',
                'program_id',
                'preferred_date',
                'preferred_time',
                'student_count',
                'contact_info',
            ]);
    }

    /** @test */
    public function booking_creation_validates_student_count_within_program_limits()
    {
        Sanctum::actingAs($this->teacherUser);

        $bookingData = [
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'preferred_date' => '2024-03-15',
            'preferred_time' => '10:00',
            'student_count' => 50, // Exceeds max_students (30)
            'contact_info' => [
                'phone' => '555-1234',
                'email' => 'teacher@school.edu',
            ],
        ];

        $response = $this->postJson('/api/v1/spark/bookings', $bookingData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['student_count']);
    }

    /** @test */
    public function user_can_get_specific_booking()
    {
        Sanctum::actingAs($this->adminUser);

        $booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
        ]);

        $response = $this->getJson("/api/v1/spark/bookings/{$booking->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                ]
            ]);
    }

    /** @test */
    public function admin_can_confirm_booking()
    {
        Sanctum::actingAs($this->adminUser);

        $booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/v1/spark/bookings/{$booking->id}/confirm", [
            'confirmed_date' => '2024-03-15',
            'confirmed_time' => '10:00',
            'notes' => 'Booking confirmed for requested time',
        ]);

        $response->assertStatus(200);

        $booking->refresh();
        $this->assertEquals('confirmed', $booking->status);
    }

    /** @test */
    public function admin_can_cancel_booking()
    {
        Sanctum::actingAs($this->adminUser);

        $booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'confirmed',
        ]);

        $response = $this->postJson("/api/v1/spark/bookings/{$booking->id}/cancel", [
            'cancellation_reason' => 'Program unavailable',
        ]);

        $response->assertStatus(200);

        $booking->refresh();
        $this->assertEquals('cancelled', $booking->status);
    }

    /** @test */
    public function admin_can_complete_booking()
    {
        Sanctum::actingAs($this->adminUser);

        $booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'confirmed',
        ]);

        $response = $this->postJson("/api/v1/spark/bookings/{$booking->id}/complete", [
            'completion_notes' => 'Program delivered successfully',
            'actual_student_count' => 23,
        ]);

        $response->assertStatus(200);

        $booking->refresh();
        $this->assertEquals('completed', $booking->status);
    }

    /** @test */
    public function regular_user_cannot_modify_booking_status()
    {
        Sanctum::actingAs($this->regularUser);

        $booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson("/api/v1/spark/bookings/{$booking->id}/confirm");

        $response->assertStatus(403);
    }

    /** @test */
    public function user_can_get_booking_statistics()
    {
        Sanctum::actingAs($this->adminUser);

        $booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'completed',
            'student_count' => 25,
        ]);

        $response = $this->getJson("/api/v1/spark/bookings/{$booking->id}/statistics");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'booking_id',
                    'total_students',
                    'completion_status',
                    'revenue_generated',
                ]
            ]);
    }

    /** @test */
    public function user_gets_404_for_nonexistent_booking()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->getJson('/api/v1/spark/bookings/999');

        $response->assertStatus(404);
    }
}
