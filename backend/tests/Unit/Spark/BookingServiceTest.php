<?php

namespace Tests\Unit\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Models\Spark\SparkProgram;
use App\Models\Spark\School;
use App\Models\User;
use App\Services\Spark\BookingService;
use App\Services\Shared\EmailService;
use App\Services\Shared\LoggingService;
use App\Services\Shared\NotificationService;
use Exception;
use Illuminate\Database\DatabaseManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Pagination\LengthAwarePaginator;
use Mockery;
use Tests\TestCase;

class BookingServiceTest extends TestCase
{
    use RefreshDatabase;

    private $bookingService;
    private $emailServiceMock;
    private $loggingServiceMock;
    private $notificationServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->emailServiceMock = Mockery::mock(EmailService::class);
        $this->loggingServiceMock = Mockery::mock(LoggingService::class);
        $this->notificationServiceMock = Mockery::mock(NotificationService::class);

        $this->bookingService = new BookingService(
            $this->emailServiceMock,
            $this->loggingServiceMock,
            $this->notificationServiceMock
        );
    }

    /** @test */
    public function it_should_get_bookings_with_filters()
    {
        // Arrange
        Booking::factory()->count(5)->create();

        // Act
        $result = $this->bookingService->getBookings(['per_page' => 5]);

        // Assert
        $this->assertInstanceOf(LengthAwarePaginator::class, $result);
        $this->assertCount(5, $result->items());
    }

    /** @test */
    public function it_should_create_a_booking()
    {
        // Arrange
        $teacher = User::factory()->create();
        $program = Program::factory()->create(['max_students' => 10, 'price_per_student' => 100]);
        $school = School::factory()->create();

        $data = [
            'school_id' => $school->id,
            'program_id' => $program->id,
            'preferred_date' => '2023-01-01',
            'preferred_time' => '10:00:00',
            'student_count' => 8,
            'contact_info' => ['primary_contact_email' => 'test@example.com'],
        ];

        $this->emailServiceMock->shouldReceive('sendEmail')->once();
        $this->loggingServiceMock->shouldReceive('logUserActivity')->once();

        // Act
        $booking = $this->bookingService->createBooking($teacher, $data);

        // Assert
        $this->assertInstanceOf(Booking::class, $booking);
        $this->assertEquals('pending', $booking->status);
    }

    /** @test */
    public function it_should_throw_exception_if_student_limit_exceeded()
    {
        // Arrange
        $this->expectException(Exception::class);

        $teacher = User::factory()->create();
        $program = Program::factory()->create(['max_students' => 5]);
        $school = School::factory()->create();

        $data = [
            'school_id' => $school->id,
            'program_id' => $program->id,
            'student_count' => 10,
            'contact_info' => ['primary_contact_email' => 'test@example.com'],
        ];

        // Act
        $this->bookingService->createBooking($teacher, $data);
    }

    /** @test */
    public function it_should_get_booking_by_id()
    {
        // Arrange
        $booking = Booking::factory()->create();

        // Act
        $result = $this->bookingService->getBookingById($booking->id);

        // Assert
        $this->assertInstanceOf(Booking::class, $result);
        $this->assertEquals($booking->id, $result->id);
    }

    /** @test */
    public function it_should_return_null_for_nonexistent_booking()
    {
        // Act
        $result = $this->bookingService->getBookingById(999);

        // Assert
        $this->assertNull($result);
    }

    /** @test */
    public function it_should_confirm_booking()
    {
        // Arrange
        $booking = Booking::factory()->create(['status' => 'pending']);
        $this->emailServiceMock->shouldReceive('sendEmail')->once();

        // Act
        $result = $this->bookingService->confirmBooking($booking, '2024-12-01', '09:00');

        // Assert
        $this->assertTrue($result);
        $this->assertEquals('confirmed', $booking->fresh()->status);
    }

    /** @test */
    public function it_should_cancel_booking()
    {
        // Arrange
        $booking = Booking::factory()->create([
            'status' => 'confirmed',
            'confirmed_date' => now()->addDays(2)->toDateString()
        ]);
        $this->emailServiceMock->shouldReceive('sendEmail')->once();

        // Act
        $result = $this->bookingService->cancelBooking($booking, 'Test reason');

        // Assert
        $this->assertTrue($result);
        $this->assertEquals('cancelled', $booking->fresh()->status);
    }

    /** @test */
    public function it_should_complete_booking()
    {
        // Arrange
        $booking = Booking::factory()->create([
            'status' => 'confirmed',
            'confirmed_date' => now()->subDay()->toDateString()
        ]);
        $this->emailServiceMock->shouldReceive('sendEmail')->once();

        // Act
        $result = $this->bookingService->completeBooking($booking, 5, 'Great program!');

        // Assert
        $this->assertTrue($result);
        $this->assertEquals('completed', $booking->fresh()->status);
        $this->assertEquals(5, $booking->fresh()->rating);
    }

    /** @test */
    public function it_should_add_students_to_booking()
    {
        // Arrange
        $booking = Booking::factory()->create();
        $studentsData = [
            [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'grade_level' => '3',
                'parent_name' => 'Jane Doe',
                'parent_email' => 'jane@example.com',
                'parent_phone' => '555-1234'
            ]
        ];

        // Act
        $result = $this->bookingService->addStudentsToBooking($booking->id, $studentsData);

        // Assert
        $this->assertEquals(1, $result['added_count']);
        $this->assertEquals(1, $booking->fresh()->student_count);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}

