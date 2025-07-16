<?php

namespace Tests\Unit\Spark;

use App\Models\Spark\Booking;
use App\Models\Spark\BookingStudent;
use App\Models\Spark\PermissionSlip;
use App\Models\Spark\School;
use App\Models\Spark\SparkProgram;
use App\Services\Shared\LoggingService;
use App\Services\Spark\DigitalSignatureService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

/**
 * Digital Signature Service Unit Tests
 *
 * Tests the digital signature validation, processing, and verification
 * functionality with proper mocking of dependencies.
 */
class DigitalSignatureServiceTest extends TestCase
{
    use RefreshDatabase;

    protected DigitalSignatureService $service;
    protected $loggingServiceMock;

    protected function setUp(): void
    {
        parent::setUp();

        // Create service mocks
        $this->loggingServiceMock = Mockery::mock(LoggingService::class);

        // Create service instance with mocked dependencies
        $this->service = new DigitalSignatureService($this->loggingServiceMock);

        // Set up default mock expectations
        $this->loggingServiceMock->shouldReceive('logUserActivity')->byDefault();
        $this->loggingServiceMock->shouldReceive('logError')->byDefault();

        // Mock storage for testing
        Storage::fake('local');
    }

    /** @test */
    public function it_validates_signature_data_successfully()
    {
        $validSignatureData = [
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        $result = $this->service->validateSignatureData($validSignatureData);

        $this->assertIsArray($result);
        $this->assertEquals('John Doe', $result['parent_name']);
        $this->assertArrayHasKey('signature', $result);
    }

    /** @test */
    public function it_throws_exception_for_missing_required_fields()
    {
        $invalidSignatureData = [
            'signature' => '', // Empty signature
            'parent_name' => '', // Empty parent name
            // Missing timestamp
        ];

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Signature validation failed');

        $this->service->validateSignatureData($invalidSignatureData);
    }

    /** @test */
    public function it_validates_base64_image_signature_format()
    {
        $validBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        $invalidBase64 = 'data:image/png;base64,invalid-base64-data';

        $validData = [
            'signature' => $validBase64,
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        $invalidData = [
            'signature' => $invalidBase64,
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        // Valid base64 should pass
        $result = $this->service->validateSignatureData($validData);
        $this->assertIsArray($result);

        // Invalid base64 should fail
        $this->expectException(\Exception::class);
        $this->service->validateSignatureData($invalidData);
    }

    /** @test */
    public function it_validates_svg_signature_format()
    {
        $validSvg = '<svg><path d="M 10 10 L 20 20"/></svg>';
        $validSvgPath = 'M 10 10 L 20 20 Z';

        $svgData = [
            'signature' => $validSvg,
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        $svgPathData = [
            'signature' => $validSvgPath,
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        // Both should pass validation
        $result1 = $this->service->validateSignatureData($svgData);
        $result2 = $this->service->validateSignatureData($svgPathData);

        $this->assertIsArray($result1);
        $this->assertIsArray($result2);
    }

    /** @test */
    public function it_validates_json_signature_format()
    {
        $validJson = '[{"x": 10, "y": 10}, {"x": 20, "y": 20}]';
        $invalidJson = '{"invalid": json';

        $validData = [
            'signature' => $validJson,
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        $invalidData = [
            'signature' => $invalidJson,
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        // Valid JSON should pass
        $result = $this->service->validateSignatureData($validData);
        $this->assertIsArray($result);

        // Invalid JSON should fail
        $this->expectException(\Exception::class);
        $this->service->validateSignatureData($invalidData);
    }

    /** @test */
    public function it_processes_signature_successfully()
    {
        $slip = $this->createPermissionSlip();

        $signatureData = [
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        $result = $this->service->processSignature($slip, $signatureData, '127.0.0.1');

        $this->assertIsArray($result);
        $this->assertArrayHasKey('signature_data', $result);
        $this->assertArrayHasKey('parent_name', $result);
        $this->assertArrayHasKey('ip_address', $result);
        $this->assertArrayHasKey('verification_hash', $result);
        $this->assertEquals('John Doe', $result['parent_name']);
        $this->assertEquals('127.0.0.1', $result['ip_address']);
    }

    /** @test */
    public function it_stores_signature_image_when_provided()
    {
        $slip = $this->createPermissionSlip();

        $signatureData = [
            'signature' => 'test-signature-data',
            'signature_image' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
        ];

        $result = $this->service->processSignature($slip, $signatureData, '127.0.0.1');

        $this->assertArrayHasKey('signature_image_path', $result);
        $this->assertNotNull($result['signature_image_path']);
        
        // Verify file was stored
        Storage::assertExists($result['signature_image_path']);
    }

    /** @test */
    public function it_verifies_signature_integrity_correctly()
    {
        $slip = $this->createPermissionSlip();

        // Create valid signature data
        $signatureData = [
            'signature_data' => 'test-signature',
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
            'ip_address' => '127.0.0.1',
            'verification_hash' => hash('sha256', json_encode([
                'signature' => 'test-signature',
                'parent_name' => 'John Doe',
                'timestamp' => now()->toISOString(),
                'ip_address' => '127.0.0.1',
                'app_key' => config('app.key'),
            ])),
        ];

        $slip->update([
            'is_signed' => true,
            'signature_data' => json_encode($signatureData),
        ]);

        $result = $this->service->verifySignatureIntegrity($slip);

        $this->assertTrue($result);
    }

    /** @test */
    public function it_fails_verification_for_tampered_signature()
    {
        $slip = $this->createPermissionSlip();

        // Create signature data with invalid hash
        $signatureData = [
            'signature_data' => 'test-signature',
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
            'ip_address' => '127.0.0.1',
            'verification_hash' => 'invalid-hash',
        ];

        $slip->update([
            'is_signed' => true,
            'signature_data' => json_encode($signatureData),
        ]);

        $result = $this->service->verifySignatureIntegrity($slip);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_returns_false_for_unsigned_slip_verification()
    {
        $slip = $this->createPermissionSlip();

        $result = $this->service->verifySignatureIntegrity($slip);

        $this->assertFalse($result);
    }

    /** @test */
    public function it_generates_signature_audit_trail()
    {
        $slip = $this->createPermissionSlip();

        $signatureData = [
            'signature_data' => 'test-signature',
            'parent_name' => 'John Doe',
            'timestamp' => now()->toISOString(),
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 Test Browser',
            'verification_hash' => 'test-hash',
            'metadata' => ['test' => 'data'],
        ];

        $slip->update([
            'is_signed' => true,
            'signed_at' => now(),
            'signed_ip' => '127.0.0.1',
            'signature_data' => json_encode($signatureData),
        ]);

        $auditTrail = $this->service->generateSignatureAuditTrail($slip);

        $this->assertIsArray($auditTrail);
        $this->assertEquals($slip->id, $auditTrail['slip_id']);
        $this->assertEquals('John Doe', $auditTrail['parent_name']);
        $this->assertEquals('127.0.0.1', $auditTrail['ip_address']);
        $this->assertEquals('Mozilla/5.0 Test Browser', $auditTrail['user_agent']);
        $this->assertArrayHasKey('integrity_verified', $auditTrail);
        $this->assertArrayHasKey('metadata', $auditTrail);
    }

    /** @test */
    public function it_returns_empty_audit_trail_for_unsigned_slip()
    {
        $slip = $this->createPermissionSlip();

        $auditTrail = $this->service->generateSignatureAuditTrail($slip);

        $this->assertEmpty($auditTrail);
    }

    /** @test */
    public function it_detects_signature_methods_correctly()
    {
        $testCases = [
            'data:image/png;base64,test' => 'base64_image',
            '<svg><path d="test"/></svg>' => 'svg_element',
            'M 10 10 L 20 20' => 'svg_path',
            '[{"x": 10, "y": 10}]' => 'json_coordinates',
            'unknown-format' => 'unknown',
        ];

        foreach ($testCases as $signature => $expectedMethod) {
            $signatureData = [
                'signature' => $signature,
                'parent_name' => 'John Doe',
                'timestamp' => now()->toISOString(),
            ];

            // We need to test the private method indirectly through processSignature
            if ($expectedMethod !== 'unknown') {
                $slip = $this->createPermissionSlip();
                $result = $this->service->processSignature($slip, $signatureData, '127.0.0.1');
                
                $metadata = $result['metadata'];
                $this->assertEquals($expectedMethod, $metadata['signature_method']);
            }
        }
    }

    /**
     * Create a test permission slip with required relationships.
     */
    private function createPermissionSlip(): PermissionSlip
    {
        $school = School::factory()->create();
        $program = SparkProgram::factory()->create();
        $booking = Booking::factory()->create([
            'school_id' => $school->id,
            'program_id' => $program->id,
            'status' => 'confirmed',
        ]);
        $student = BookingStudent::factory()->create([
            'booking_id' => $booking->id,
        ]);

        return PermissionSlip::factory()->create([
            'booking_id' => $booking->id,
            'student_id' => $student->id,
            'is_signed' => false,
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
