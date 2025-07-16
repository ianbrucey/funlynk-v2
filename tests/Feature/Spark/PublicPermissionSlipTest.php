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
use Tests\TestCase;

/**
 * Public Permission Slip Feature Tests
 *
 * Tests the public-facing permission slip signing workflow
 * that parents use to sign permission slips via secure tokens.
 */
class PublicPermissionSlipTest extends TestCase
{
    use RefreshDatabase;

    protected School $school;
    protected SparkProgram $program;
    protected Booking $booking;
    protected BookingStudent $student;
    protected PermissionSlip $permissionSlip;
    protected PermissionSlipTemplate $template;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test data
        $this->school = School::factory()->create(['is_active' => true]);
        $this->program = SparkProgram::factory()->create([
            'is_active' => true,
            'title' => 'Character Building Workshop',
        ]);

        $teacher = User::factory()->create();
        $this->booking = Booking::factory()->create([
            'school_id' => $this->school->id,
            'program_id' => $this->program->id,
            'teacher_id' => $teacher->id,
            'status' => 'confirmed',
            'confirmed_date' => now()->addWeek(),
            'confirmed_time' => now()->addWeek()->setTime(10, 0),
        ]);

        $this->student = BookingStudent::factory()->create([
            'booking_id' => $this->booking->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'parent_name' => 'Jane Doe',
            'parent_email' => 'jane.doe@example.com',
            'parent_phone' => '555-1234',
        ]);

        $this->template = PermissionSlipTemplate::factory()->create([
            'is_active' => true,
            'is_default' => true,
        ]);

        $this->permissionSlip = PermissionSlip::factory()->create([
            'booking_id' => $this->booking->id,
            'student_id' => $this->student->id,
            'template_id' => $this->template->id,
            'token' => 'test-secure-token-123',
            'parent_name' => 'Jane Doe',
            'parent_email' => 'jane.doe@example.com',
            'parent_phone' => '555-1234',
            'is_signed' => false,
        ]);
    }

    /** @test */
    public function parent_can_view_permission_slip_with_valid_token()
    {
        $response = $this->getJson("/api/public/permission-slips/{$this->permissionSlip->token}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'student_name',
                    'parent_name',
                    'parent_email',
                    'parent_phone',
                    'program_title',
                    'school_name',
                    'event_date',
                    'event_time',
                    'emergency_contacts',
                    'medical_info',
                    'is_signed',
                    'template',
                    'booking_details',
                ]
            ]);

        $data = $response->json('data');
        $this->assertEquals('John Doe', $data['student_name']);
        $this->assertEquals('Character Building Workshop', $data['program_title']);
        $this->assertFalse($data['is_signed']);
    }

    /** @test */
    public function invalid_token_returns_404()
    {
        $response = $this->getJson('/api/public/permission-slips/invalid-token');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Permission slip not found',
            ]);
    }

    /** @test */
    public function parent_can_sign_permission_slip_with_valid_data()
    {
        $signatureData = [
            'parent_name' => 'Jane Doe',
            'parent_email' => 'jane.doe@example.com',
            'parent_phone' => '555-1234',
            'emergency_contacts' => [
                [
                    'name' => 'John Smith',
                    'phone' => '555-5678',
                    'relationship' => 'Uncle',
                    'is_primary' => true,
                ],
            ],
            'medical_info' => [
                'allergies' => 'None',
                'medications' => 'None',
                'medical_conditions' => 'None',
                'dietary_restrictions' => 'Vegetarian',
            ],
            'special_instructions' => 'Please call if any issues',
            'photo_permission' => true,
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'consent_medical_treatment' => true,
            'consent_transportation' => true,
            'consent_activity_participation' => true,
            'consent_liability_waiver' => true,
            'terms_accepted' => true,
        ];

        $response = $this->postJson("/api/public/permission-slips/{$this->permissionSlip->token}/sign", $signatureData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permission slip signed successfully',
            ]);

        // Verify permission slip was signed
        $this->permissionSlip->refresh();
        $this->assertTrue($this->permissionSlip->is_signed);
        $this->assertNotNull($this->permissionSlip->signed_at);
        $this->assertNotNull($this->permissionSlip->signature_data);
        $this->assertEquals('Jane Doe', $this->permissionSlip->parent_name);
        $this->assertTrue($this->permissionSlip->photo_permission);
    }

    /** @test */
    public function signing_validates_required_fields()
    {
        $response = $this->postJson("/api/public/permission-slips/{$this->permissionSlip->token}/sign", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'parent_name',
                'parent_email',
                'parent_phone',
                'emergency_contacts',
                'photo_permission',
                'signature',
                'consent_medical_treatment',
                'consent_transportation',
                'consent_activity_participation',
                'consent_liability_waiver',
                'terms_accepted',
            ]);
    }

    /** @test */
    public function signing_validates_emergency_contact_format()
    {
        $signatureData = [
            'parent_name' => 'Jane Doe',
            'parent_email' => 'jane.doe@example.com',
            'parent_phone' => '555-1234',
            'emergency_contacts' => [
                [
                    'name' => '', // Invalid: empty name
                    'phone' => 'invalid-phone', // Invalid: bad phone format
                    'relationship' => 'InvalidRelation', // Invalid: not in allowed list
                ],
            ],
            'signature' => 'invalid-signature', // Invalid: bad signature format
            'photo_permission' => true,
            'consent_medical_treatment' => true,
            'consent_transportation' => true,
            'consent_activity_participation' => true,
            'consent_liability_waiver' => true,
            'terms_accepted' => true,
        ];

        $response = $this->postJson("/api/public/permission-slips/{$this->permissionSlip->token}/sign", $signatureData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'emergency_contacts.0.name',
                'emergency_contacts.0.phone',
                'emergency_contacts.0.relationship',
                'signature',
            ]);
    }

    /** @test */
    public function signing_validates_consent_requirements()
    {
        $signatureData = [
            'parent_name' => 'Jane Doe',
            'parent_email' => 'jane.doe@example.com',
            'parent_phone' => '555-1234',
            'emergency_contacts' => [
                [
                    'name' => 'John Smith',
                    'phone' => '555-5678',
                    'relationship' => 'Uncle',
                ],
            ],
            'photo_permission' => true,
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            // Missing required consent fields
            'consent_medical_treatment' => false,
            'consent_transportation' => false,
            'consent_activity_participation' => false,
            'consent_liability_waiver' => false,
            'terms_accepted' => false,
        ];

        $response = $this->postJson("/api/public/permission-slips/{$this->permissionSlip->token}/sign", $signatureData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'consent_medical_treatment',
                'consent_transportation',
                'consent_activity_participation',
                'consent_liability_waiver',
                'terms_accepted',
            ]);
    }

    /** @test */
    public function cannot_sign_already_signed_permission_slip()
    {
        // Mark permission slip as already signed
        $this->permissionSlip->update([
            'is_signed' => true,
            'signed_at' => now(),
            'signature_data' => json_encode(['signature' => 'existing-signature']),
        ]);

        $signatureData = [
            'parent_name' => 'Jane Doe',
            'parent_email' => 'jane.doe@example.com',
            'parent_phone' => '555-1234',
            'emergency_contacts' => [
                [
                    'name' => 'John Smith',
                    'phone' => '555-5678',
                    'relationship' => 'Uncle',
                ],
            ],
            'photo_permission' => true,
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'consent_medical_treatment' => true,
            'consent_transportation' => true,
            'consent_activity_participation' => true,
            'consent_liability_waiver' => true,
            'terms_accepted' => true,
        ];

        $response = $this->postJson("/api/public/permission-slips/{$this->permissionSlip->token}/sign", $signatureData);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Permission slip is already signed',
            ]);
    }

    /** @test */
    public function parent_can_preview_permission_slip_form()
    {
        $response = $this->getJson("/api/public/permission-slips/{$this->permissionSlip->token}/preview");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'student_name',
                    'program_title',
                    'school_name',
                    'event_date',
                    'event_time',
                    'template_content',
                    'required_fields',
                    'emergency_contact_fields',
                    'medical_fields',
                ]
            ]);
    }

    /** @test */
    public function signed_permission_slip_shows_completion_status()
    {
        // Sign the permission slip first
        $this->permissionSlip->update([
            'is_signed' => true,
            'signed_at' => now(),
            'signature_data' => json_encode([
                'signature' => 'test-signature',
                'parent_name' => 'Jane Doe',
                'timestamp' => now()->toISOString(),
            ]),
        ]);

        $response = $this->getJson("/api/public/permission-slips/{$this->permissionSlip->token}");

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertTrue($data['is_signed']);
        $this->assertNotNull($data['signed_at']);
        $this->assertArrayHasKey('signature_data', $data);
    }

    /** @test */
    public function permission_slip_tracks_ip_address_on_signing()
    {
        $signatureData = [
            'parent_name' => 'Jane Doe',
            'parent_email' => 'jane.doe@example.com',
            'parent_phone' => '555-1234',
            'emergency_contacts' => [
                [
                    'name' => 'John Smith',
                    'phone' => '555-5678',
                    'relationship' => 'Uncle',
                ],
            ],
            'photo_permission' => true,
            'signature' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'consent_medical_treatment' => true,
            'consent_transportation' => true,
            'consent_activity_participation' => true,
            'consent_liability_waiver' => true,
            'terms_accepted' => true,
        ];

        $response = $this->postJson("/api/public/permission-slips/{$this->permissionSlip->token}/sign", $signatureData);

        $response->assertStatus(200);

        // Verify IP address was recorded
        $this->permissionSlip->refresh();
        $this->assertNotNull($this->permissionSlip->signed_ip);
    }

    /** @test */
    public function permission_slip_validates_signature_formats()
    {
        $testCases = [
            // Valid base64 image
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            // Valid SVG
            '<svg><path d="M 10 10 L 20 20"/></svg>',
            // Valid SVG path
            'M 10 10 L 20 20 Z',
            // Valid JSON coordinates
            '[{"x": 10, "y": 10}, {"x": 20, "y": 20}]',
        ];

        foreach ($testCases as $signature) {
            $signatureData = [
                'parent_name' => 'Jane Doe',
                'parent_email' => 'jane.doe@example.com',
                'parent_phone' => '555-1234',
                'emergency_contacts' => [
                    [
                        'name' => 'John Smith',
                        'phone' => '555-5678',
                        'relationship' => 'Uncle',
                    ],
                ],
                'photo_permission' => true,
                'signature' => $signature,
                'consent_medical_treatment' => true,
                'consent_transportation' => true,
                'consent_activity_participation' => true,
                'consent_liability_waiver' => true,
                'terms_accepted' => true,
            ];

            // Reset permission slip to unsigned state
            $this->permissionSlip->update([
                'is_signed' => false,
                'signed_at' => null,
                'signature_data' => null,
            ]);

            $response = $this->postJson("/api/public/permission-slips/{$this->permissionSlip->token}/sign", $signatureData);

            $response->assertStatus(200, "Failed for signature format: " . substr($signature, 0, 50));
        }
    }
}
