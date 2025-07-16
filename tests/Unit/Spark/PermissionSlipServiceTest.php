<?php

namespace Tests\Unit\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Models\Spark\PermissionSlip;
use App\Models\Spark\PermissionSlipTemplate;
use App\Models\Spark\School;
use App\Models\Spark\SparkProgram;
use App\Models\User;
use App\Services\Shared\EmailService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use App\Services\Spark\PermissionSlipService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

/**
 * Permission Slip Service Unit Tests
 *
 * Tests the core business logic of the PermissionSlipService
 * with proper mocking of dependencies.
 */
class PermissionSlipServiceTest extends TestCase
{
    use RefreshDatabase;

    protected PermissionSlipService $service;
    protected $emailServiceMock;
    protected $loggingServiceMock;
    protected $notificationServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Create service mocks
        $this->emailServiceMock = Mockery::mock(EmailService::class);
        $this->loggingServiceMock = Mockery::mock(LoggingService::class);
        $this->notificationServiceMock = Mockery::mock(NotificationService::class);

        // Create service instance with mocked dependencies
        $this->service = new PermissionSlipService(
            $this->emailServiceMock,
            $this->loggingServiceMock,
            $this->notificationServiceMock
        );

        // Set up default mock expectations
        $this->loggingServiceMock->shouldReceive('logUserActivity')->byDefault();
        $this->loggingServiceMock->shouldReceive('logError')->byDefault();
    }

    /** @test */
    public function it_can_get_permission_slips_with_filters()
    {
        $school = School::factory()->create();
        $program = SparkProgram::factory()->create();
        $booking = Booking::factory()->create([
            'school_id' => $school->id,
            'program_id' => $program->id,
            'status' => 'confirmed',
        ]);

        PermissionSlip::factory()->count(3)->create([
            'booking_id' => $booking->id,
        ]);

        $result = $this->service->getPermissionSlips(['booking_id' => $booking->id]);

        $this->assertCount(3, $result->items());
        $this->assertEquals($booking->id, $result->items()[0]->booking_id);
    }

    /** @test */
    public function it_can_filter_permission_slips_by_status()
    {
        $booking = Booking::factory()->create(['status' => 'confirmed']);

        PermissionSlip::factory()->create([
            'booking_id' => $booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        PermissionSlip::factory()->create([
            'booking_id' => $booking->id,
            'is_signed' => false,
        ]);

        // Test signed filter
        $signedResult = $this->service->getPermissionSlips(['status' => 'signed']);
        $this->assertCount(1, $signedResult->items());
        $this->assertTrue($signedResult->items()[0]->is_signed);

        // Test unsigned filter
        $unsignedResult = $this->service->getPermissionSlips(['status' => 'unsigned']);
        $this->assertCount(1, $unsignedResult->items());
        $this->assertFalse($unsignedResult->items()[0]->is_signed);
    }

    /** @test */
    public function it_can_get_permission_slip_by_id()
    {
        $slip = PermissionSlip::factory()->create();

        $result = $this->service->getPermissionSlipById($slip->id);

        $this->assertInstanceOf(PermissionSlip::class, $result);
        $this->assertEquals($slip->id, $result->id);
    }

    /** @test */
    public function it_returns_null_for_nonexistent_permission_slip()
    {
        $result = $this->service->getPermissionSlipById(999);

        $this->assertNull($result);
    }

    /** @test */
    public function it_can_get_permission_slip_by_token()
    {
        $slip = PermissionSlip::factory()->create(['token' => 'test-token-123']);

        $result = $this->service->getPermissionSlipByToken('test-token-123');

        $this->assertInstanceOf(PermissionSlip::class, $result);
        $this->assertEquals('test-token-123', $result->token);
    }

    /** @test */
    public function it_can_create_permission_slips_for_confirmed_booking()
    {
        $this->emailServiceMock->shouldReceive('sendPermissionSlipEmail')
            ->times(2)
            ->andReturn(true);

        $booking = Booking::factory()->create(['status' => 'confirmed']);
        $students = BookingStudent::factory()->count(2)->create([
            'booking_id' => $booking->id,
        ]);

        $template = PermissionSlipTemplate::factory()->create([
            'is_active' => true,
            'is_default' => true,
        ]);

        $result = $this->service->createPermissionSlipsForBooking($booking);

        $this->assertCount(2, $result);
        $this->assertEquals(2, PermissionSlip::where('booking_id', $booking->id)->count());

        foreach ($result as $slip) {
            $this->assertInstanceOf(PermissionSlip::class, $slip);
            $this->assertEquals($booking->id, $slip->booking_id);
            $this->assertFalse($slip->is_signed);
            $this->assertNotEmpty($slip->token);
        }
    }

    /** @test */
    public function it_throws_exception_for_non_confirmed_booking()
    {
        $booking = Booking::factory()->create(['status' => 'pending']);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Permission slips can only be created for confirmed bookings');

        $this->service->createPermissionSlipsForBooking($booking);
    }

    /** @test */
    public function it_skips_existing_permission_slips()
    {
        $this->emailServiceMock->shouldReceive('sendPermissionSlipEmail')
            ->once()
            ->andReturn(true);

        $booking = Booking::factory()->create(['status' => 'confirmed']);
        $student1 = BookingStudent::factory()->create(['booking_id' => $booking->id]);
        $student2 = BookingStudent::factory()->create(['booking_id' => $booking->id]);

        $template = PermissionSlipTemplate::factory()->create([
            'is_active' => true,
            'is_default' => true,
        ]);

        // Create existing permission slip for student1
        PermissionSlip::factory()->create([
            'booking_id' => $booking->id,
            'student_id' => $student1->id,
        ]);

        $result = $this->service->createPermissionSlipsForBooking($booking);

        // Should only create one new permission slip for student2
        $this->assertCount(1, $result);
        $this->assertEquals($student2->id, $result->first()->student_id);
    }

    /** @test */
    public function it_can_sign_permission_slip()
    {
        $this->emailServiceMock->shouldReceive('sendNotificationEmail')
            ->once()
            ->andReturn(true);

        $slip = PermissionSlip::factory()->create(['is_signed' => false]);

        $signatureData = [
            'parent_name' => 'John Doe',
            'parent_email' => 'john@example.com',
            'parent_phone' => '555-1234',
            'emergency_contacts' => [
                [
                    'name' => 'Jane Doe',
                    'phone' => '555-5678',
                    'relationship' => 'Spouse',
                ]
            ],
            'medical_info' => ['allergies' => 'None'],
            'photo_permission' => true,
            'signature' => 'test-signature-data',
        ];

        $result = $this->service->signPermissionSlip($slip, $signatureData, '127.0.0.1');

        $this->assertTrue($result);
        $slip->refresh();
        $this->assertTrue($slip->is_signed);
        $this->assertNotNull($slip->signed_at);
        $this->assertEquals('127.0.0.1', $slip->signed_ip);
        $this->assertEquals('John Doe', $slip->parent_name);
        $this->assertTrue($slip->photo_permission);
    }

    /** @test */
    public function it_throws_exception_when_signing_already_signed_slip()
    {
        $slip = PermissionSlip::factory()->create([
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Permission slip is already signed');

        $this->service->signPermissionSlip($slip, [], '127.0.0.1');
    }

    /** @test */
    public function it_can_get_statistics()
    {
        $booking = Booking::factory()->create(['status' => 'confirmed']);

        // Create signed permission slips
        PermissionSlip::factory()->count(3)->create([
            'booking_id' => $booking->id,
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        // Create unsigned permission slips
        PermissionSlip::factory()->count(2)->create([
            'booking_id' => $booking->id,
            'is_signed' => false,
        ]);

        $stats = $this->service->getStatistics();

        $this->assertEquals(5, $stats['total']);
        $this->assertEquals(3, $stats['signed']);
        $this->assertEquals(2, $stats['unsigned']);
        $this->assertEquals(60.0, $stats['completion_rate']);
    }

    /** @test */
    public function it_can_get_slips_requiring_reminders()
    {
        $futureBooking = Booking::factory()->create([
            'status' => 'confirmed',
            'confirmed_date' => now()->addDays(2), // Within 3 days
        ]);

        $distantBooking = Booking::factory()->create([
            'status' => 'confirmed',
            'confirmed_date' => now()->addDays(5), // Beyond 3 days
        ]);

        PermissionSlip::factory()->create([
            'booking_id' => $futureBooking->id,
            'is_signed' => false,
            'last_reminder_sent_at' => null,
        ]);

        PermissionSlip::factory()->create([
            'booking_id' => $distantBooking->id,
            'is_signed' => false,
            'last_reminder_sent_at' => null,
        ]);

        $result = $this->service->getSlipsRequiringReminders(3);

        $this->assertCount(1, $result);
        $this->assertEquals($futureBooking->id, $result->first()->booking_id);
    }

    /** @test */
    public function it_can_send_bulk_reminders()
    {
        $this->emailServiceMock->shouldReceive('sendNotificationEmail')
            ->times(2)
            ->andReturn(true);

        $slips = PermissionSlip::factory()->count(2)->create([
            'is_signed' => false,
            'reminder_sent_count' => 0,
        ]);

        $result = $this->service->sendBulkReminders($slips->pluck('id')->toArray());

        $this->assertEquals(2, $result['sent']);
        $this->assertEquals(0, $result['failed']);

        foreach ($slips as $slip) {
            $slip->refresh();
            $this->assertEquals(1, $slip->reminder_sent_count);
            $this->assertNotNull($slip->last_reminder_sent_at);
        }
    }

    /** @test */
    public function it_can_delete_unsigned_permission_slip()
    {
        $slip = PermissionSlip::factory()->create(['is_signed' => false]);

        $result = $this->service->deletePermissionSlip($slip);

        $this->assertTrue($result);
        $this->assertSoftDeleted('permission_slips', ['id' => $slip->id]);
    }

    /** @test */
    public function it_throws_exception_when_deleting_signed_slip()
    {
        $slip = PermissionSlip::factory()->create([
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot delete a signed permission slip');

        $this->service->deletePermissionSlip($slip);
    }

    /** @test */
    public function it_can_resend_permission_slip_email()
    {
        $this->emailServiceMock->shouldReceive('sendPermissionSlipEmail')
            ->once()
            ->andReturn(true);

        $slip = PermissionSlip::factory()->create([
            'is_signed' => false,
            'reminder_sent_count' => 1,
        ]);

        $result = $this->service->resendPermissionSlipEmail($slip);

        $this->assertTrue($result);
        $slip->refresh();
        $this->assertEquals(2, $slip->reminder_sent_count);
        $this->assertNotNull($slip->last_reminder_sent_at);
    }

    /** @test */
    public function it_throws_exception_when_resending_email_for_signed_slip()
    {
        $slip = PermissionSlip::factory()->create([
            'is_signed' => true,
            'signed_at' => now(),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot resend email for signed permission slip');

        $this->service->resendPermissionSlipEmail($slip);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
