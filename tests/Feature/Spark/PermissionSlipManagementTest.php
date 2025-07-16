<?php

namespace Tests\Feature\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Models\Spark\PermissionSlip;
use App\Models\Spark\PermissionSlipTemplate;
use App\Models\Spark\School;
use App\Models\Spark\SparkProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

/**
 * Permission Slip Management Feature Tests
 *
 * Tests the complete permission slip management API endpoints
 * including creation, listing, statistics, and bulk operations.
 */
class PermissionSlipManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $teacherUser;
    protected User $regularUser;
    protected School $school;
    protected SparkProgram $program;
    protected Booking $booking;
    protected PermissionSlipTemplate $template;

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

        // Create test data
        $this->school = School::factory()->create(['is_active' => true]);
        $this->program = SparkProgram::factory()->create([
            'is_active' => true,
            'max_students' => 30,
            'price_per_student' => 15.00,
        ]);

        $this->booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'confirmed',
            'confirmed_date' => now()->addWeek(),
            'confirmed_time' => now()->addWeek()->setTime(10, 0),
        ]);

        // Create students for the booking
        BookingStudent::factory()->count(3)->create([
            'booking_id' => $this->booking->id,
        ]);

        // Create permission slip template
        $this->template = PermissionSlipTemplate::factory()->create([
            'is_active' => true,
            'is_default' => true,
        ]);
    }

    /** @test */
    public function admin_can_get_permission_slips_list()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test permission slips
        PermissionSlip::factory()->count(3)->create([
            'booking_id' => $this->booking->id,
        ]);

        $response = $this->getJson('/api/v1/spark/permission-slips');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'booking_id',
                            'student_id',
                            'token',
                            'parent_name',
                            'parent_email',
                            'is_signed',
                            'signed_at',
                            'reminder_sent_count',
                            'created_at',
                            'updated_at',
                            'booking',
                            'student',
                        ]
                    ],
                    'current_page',
                    'per_page',
                    'total',
                ]
            ]);
    }

    /** @test */
    public function admin_can_filter_permission_slips_by_status()
    {
        Sanctum::actingAs($this->adminUser);

        // Create signed and unsigned permission slips
        PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => false,
        ]);

        // Test signed filter
        $response = $this->getJson('/api/v1/spark/permission-slips?status=signed');
        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertTrue($data[0]['is_signed']);

        // Test unsigned filter
        $response = $this->getJson('/api/v1/spark/permission-slips?status=unsigned');
        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertFalse($data[0]['is_signed']);
    }

    /** @test */
    public function admin_can_create_permission_slips_for_booking()
    {
        Sanctum::actingAs($this->adminUser);

        $response = $this->postJson('/api/v1/spark/permission-slips', [
            'booking_id' => $this->booking->id,
            'template_id' => $this->template->id,
            'send_emails' => false, // Don't send emails in tests
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'booking_id',
                        'student_id',
                        'token',
                        'parent_name',
                        'parent_email',
                        'is_signed',
                    ]
                ]
            ]);

        // Verify permission slips were created for all students
        $this->assertEquals(3, PermissionSlip::where('booking_id', $this->booking->id)->count());
    }

    /** @test */
    public function permission_slip_creation_validates_confirmed_booking()
    {
        Sanctum::actingAs($this->adminUser);

        $pendingBooking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $this->teacherUser->id,
            'status' => 'pending',
        ]);

        $response = $this->postJson('/api/v1/spark/permission-slips', [
            'booking_id' => $pendingBooking->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['booking_id']);
    }

    /** @test */
    public function admin_can_get_permission_slip_statistics()
    {
        Sanctum::actingAs($this->adminUser);

        // Create test permission slips with different statuses
        PermissionSlip::factory()->count(2)->create([
            'booking_id' => $this->booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        PermissionSlip::factory()->count(3)->create([
            'booking_id' => $this->booking->id,
            'is_signed' => false,
        ]);

        $response = $this->getJson('/api/v1/spark/permission-slips/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total',
                    'signed',
                    'unsigned',
                    'overdue',
                    'completion_rate',
                    'overdue_rate',
                ]
            ]);

        $stats = $response->json('data');
        $this->assertEquals(5, $stats['total']);
        $this->assertEquals(2, $stats['signed']);
        $this->assertEquals(3, $stats['unsigned']);
        $this->assertEquals(40.0, $stats['completion_rate']);
    }

    /** @test */
    public function admin_can_send_bulk_reminders()
    {
        Sanctum::actingAs($this->adminUser);

        // Create unsigned permission slips
        $slips = PermissionSlip::factory()->count(2)->create([
            'booking_id' => $this->booking->id,
            'is_signed' => false,
        ]);

        $response = $this->postJson('/api/v1/spark/permission-slips/bulk-reminders', [
            'permission_slip_ids' => $slips->pluck('id')->toArray(),
            'reminder_type' => 'urgent',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'sent',
                    'failed',
                    'errors',
                ]
            ]);

        $results = $response->json('data');
        $this->assertEquals(2, $results['sent']);
        $this->assertEquals(0, $results['failed']);

        // Verify reminder counts were updated
        foreach ($slips as $slip) {
            $this->assertEquals(1, $slip->fresh()->reminder_sent_count);
            $this->assertNotNull($slip->fresh()->last_reminder_sent_at);
        }
    }

    /** @test */
    public function bulk_reminder_validates_unsigned_slips_only()
    {
        Sanctum::actingAs($this->adminUser);

        $signedSlip = PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/spark/permission-slips/bulk-reminders', [
            'permission_slip_ids' => [$signedSlip->id],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['permission_slip_ids']);
    }

    /** @test */
    public function admin_can_get_specific_permission_slip()
    {
        Sanctum::actingAs($this->adminUser);

        $slip = PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
        ]);

        $response = $this->getJson("/api/v1/spark/permission-slips/{$slip->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'booking_id',
                    'student_id',
                    'token',
                    'parent_name',
                    'parent_email',
                    'emergency_contacts',
                    'medical_info',
                    'is_signed',
                    'signed_at',
                    'booking',
                    'student',
                ]
            ]);
    }

    /** @test */
    public function admin_can_resend_permission_slip_email()
    {
        Sanctum::actingAs($this->adminUser);

        $slip = PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => false,
        ]);

        $response = $this->postJson("/api/v1/spark/permission-slips/{$slip->id}/resend");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permission slip email resent successfully',
            ]);

        // Verify reminder count was incremented
        $this->assertEquals(1, $slip->fresh()->reminder_sent_count);
    }

    /** @test */
    public function cannot_resend_email_for_signed_permission_slip()
    {
        Sanctum::actingAs($this->adminUser);

        $slip = PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        $response = $this->postJson("/api/v1/spark/permission-slips/{$slip->id}/resend");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot resend email for signed permission slip',
            ]);
    }

    /** @test */
    public function admin_can_delete_unsigned_permission_slip()
    {
        Sanctum::actingAs($this->adminUser);

        $slip = PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => false,
        ]);

        $response = $this->deleteJson("/api/v1/spark/permission-slips/{$slip->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permission slip deleted successfully',
            ]);

        $this->assertSoftDeleted('permission_slips', ['id' => $slip->id]);
    }

    /** @test */
    public function cannot_delete_signed_permission_slip()
    {
        Sanctum::actingAs($this->adminUser);

        $slip = PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        $response = $this->deleteJson("/api/v1/spark/permission-slips/{$slip->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot delete a signed permission slip',
            ]);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_permission_slips()
    {
        $response = $this->getJson('/api/v1/spark/permission-slips');
        $response->assertStatus(401);
    }

    /** @test */
    public function regular_user_cannot_manage_permission_slips()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/v1/spark/permission-slips');
        $response->assertStatus(403);
    }
}
