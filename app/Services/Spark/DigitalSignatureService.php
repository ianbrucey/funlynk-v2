<?php

namespace App\Services\Spark;

use App\Models\Spark\PermissionSlip;
use App\Services\Shared\LoggingService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

/**
 * Digital Signature Service
 *
 * Handles secure signature capture, validation, storage, and verification
 * for permission slip digital signatures with compliance tracking.
 */
class DigitalSignatureService
{
    public function __construct(
        private LoggingService $loggingService
    ) {}

    /**
     * Validate signature data before processing.
     *
     * @param array $signatureData
     * @return array
     * @throws Exception
     */
    public function validateSignatureData(array $signatureData): array
    {
        $errors = [];

        // Required fields validation
        if (empty($signatureData['signature'])) {
            $errors[] = 'Signature data is required';
        }

        if (empty($signatureData['parent_name'])) {
            $errors[] = 'Parent name is required';
        }

        if (empty($signatureData['timestamp'])) {
            $errors[] = 'Signature timestamp is required';
        }

        // Signature format validation
        if (!empty($signatureData['signature'])) {
            if (!$this->isValidSignatureFormat($signatureData['signature'])) {
                $errors[] = 'Invalid signature format';
            }
        }

        // Timestamp validation
        if (!empty($signatureData['timestamp'])) {
            if (!$this->isValidTimestamp($signatureData['timestamp'])) {
                $errors[] = 'Invalid timestamp format';
            }
        }

        if (!empty($errors)) {
            throw new Exception('Signature validation failed: ' . implode(', ', $errors));
        }

        return $this->sanitizeSignatureData($signatureData);
    }

    /**
     * Process and store digital signature.
     *
     * @param PermissionSlip $slip
     * @param array $signatureData
     * @param string $ipAddress
     * @return array
     * @throws Exception
     */
    public function processSignature(PermissionSlip $slip, array $signatureData, string $ipAddress): array
    {
        try {
            // Validate signature data
            $validatedData = $this->validateSignatureData($signatureData);

            // Generate signature metadata
            $metadata = $this->generateSignatureMetadata($slip, $validatedData, $ipAddress);

            // Store signature image if provided
            $signatureImagePath = null;
            if (!empty($validatedData['signature_image'])) {
                $signatureImagePath = $this->storeSignatureImage($slip, $validatedData['signature_image']);
            }

            // Create signature record
            $signatureRecord = [
                'signature_data' => $validatedData['signature'],
                'signature_image_path' => $signatureImagePath,
                'parent_name' => $validatedData['parent_name'],
                'timestamp' => $validatedData['timestamp'],
                'ip_address' => $ipAddress,
                'user_agent' => request()->header('User-Agent'),
                'metadata' => $metadata,
                'verification_hash' => $this->generateVerificationHash($validatedData, $ipAddress),
            ];

            // Log signature processing
            $this->loggingService->logUserActivity(
                null, // No authenticated user for public signing
                'digital_signature_processed',
                'PermissionSlip',
                $slip->id,
                [
                    'parent_name' => $validatedData['parent_name'],
                    'ip_address' => $ipAddress,
                    'has_image' => !empty($signatureImagePath),
                    'verification_hash' => $signatureRecord['verification_hash'],
                ]
            );

            return $signatureRecord;

        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'slip_id' => $slip->id,
                'operation' => 'process_signature',
                'ip_address' => $ipAddress
            ]);

            throw $e;
        }
    }

    /**
     * Verify signature integrity.
     *
     * @param PermissionSlip $slip
     * @return bool
     */
    public function verifySignatureIntegrity(PermissionSlip $slip): bool
    {
        if (!$slip->is_signed || empty($slip->signature_data)) {
            return false;
        }

        try {
            $signatureData = json_decode($slip->signature_data, true);
            
            if (!$signatureData || !isset($signatureData['verification_hash'])) {
                return false;
            }

            // Recreate verification hash
            $expectedHash = $this->generateVerificationHash([
                'signature' => $signatureData['signature_data'] ?? '',
                'parent_name' => $signatureData['parent_name'] ?? '',
                'timestamp' => $signatureData['timestamp'] ?? '',
            ], $signatureData['ip_address'] ?? '');

            $isValid = hash_equals($expectedHash, $signatureData['verification_hash']);

            // Log verification attempt
            $this->loggingService->logUserActivity(
                auth()->id(),
                'signature_verification_attempted',
                'PermissionSlip',
                $slip->id,
                [
                    'is_valid' => $isValid,
                    'verification_hash' => $signatureData['verification_hash'],
                ]
            );

            return $isValid;

        } catch (Exception $e) {
            $this->loggingService->logError($e, [
                'slip_id' => $slip->id,
                'operation' => 'verify_signature_integrity'
            ]);

            return false;
        }
    }

    /**
     * Generate signature audit trail.
     *
     * @param PermissionSlip $slip
     * @return array
     */
    public function generateSignatureAuditTrail(PermissionSlip $slip): array
    {
        if (!$slip->is_signed) {
            return [];
        }

        $signatureData = json_decode($slip->signature_data, true) ?? [];

        return [
            'slip_id' => $slip->id,
            'booking_reference' => $slip->booking->booking_reference,
            'student_name' => $slip->student->full_name,
            'parent_name' => $signatureData['parent_name'] ?? 'Unknown',
            'signed_at' => $slip->signed_at?->toISOString(),
            'ip_address' => $slip->signed_ip,
            'user_agent' => $signatureData['user_agent'] ?? 'Unknown',
            'verification_hash' => $signatureData['verification_hash'] ?? null,
            'integrity_verified' => $this->verifySignatureIntegrity($slip),
            'signature_image_exists' => !empty($signatureData['signature_image_path']) && 
                                       Storage::exists($signatureData['signature_image_path']),
            'metadata' => $signatureData['metadata'] ?? [],
        ];
    }

    /**
     * Check if signature format is valid.
     *
     * @param string $signature
     * @return bool
     */
    private function isValidSignatureFormat(string $signature): bool
    {
        // Check for common signature formats (SVG path, base64 image, etc.)
        if (str_starts_with($signature, 'data:image/')) {
            return $this->isValidBase64Image($signature);
        }

        if (str_starts_with($signature, '<svg') || str_starts_with($signature, 'M ')) {
            return $this->isValidSVGPath($signature);
        }

        // JSON format for coordinate data
        if (str_starts_with($signature, '{') || str_starts_with($signature, '[')) {
            return $this->isValidJSONSignature($signature);
        }

        return false;
    }

    /**
     * Validate base64 image format.
     *
     * @param string $data
     * @return bool
     */
    private function isValidBase64Image(string $data): bool
    {
        if (!preg_match('/^data:image\/(png|jpeg|jpg|svg\+xml);base64,/', $data)) {
            return false;
        }

        $base64Data = substr($data, strpos($data, ',') + 1);
        $decoded = base64_decode($base64Data, true);
        
        return $decoded !== false && strlen($decoded) > 0;
    }

    /**
     * Validate SVG path format.
     *
     * @param string $svg
     * @return bool
     */
    private function isValidSVGPath(string $svg): bool
    {
        // Basic SVG validation
        if (str_starts_with($svg, '<svg')) {
            return strpos($svg, '</svg>') !== false;
        }

        // SVG path data validation
        if (str_starts_with($svg, 'M ')) {
            return preg_match('/^[MLHVCSQTAZmlhvcsqtaz0-9\s,.-]+$/', $svg);
        }

        return false;
    }

    /**
     * Validate JSON signature format.
     *
     * @param string $json
     * @return bool
     */
    private function isValidJSONSignature(string $json): bool
    {
        $data = json_decode($json, true);
        return json_last_error() === JSON_ERROR_NONE && is_array($data);
    }

    /**
     * Validate timestamp format.
     *
     * @param string $timestamp
     * @return bool
     */
    private function isValidTimestamp(string $timestamp): bool
    {
        return strtotime($timestamp) !== false;
    }

    /**
     * Sanitize signature data.
     *
     * @param array $data
     * @return array
     */
    private function sanitizeSignatureData(array $data): array
    {
        return [
            'signature' => trim($data['signature']),
            'signature_image' => $data['signature_image'] ?? null,
            'parent_name' => trim($data['parent_name']),
            'timestamp' => trim($data['timestamp']),
        ];
    }

    /**
     * Generate signature metadata.
     *
     * @param PermissionSlip $slip
     * @param array $signatureData
     * @param string $ipAddress
     * @return array
     */
    private function generateSignatureMetadata(PermissionSlip $slip, array $signatureData, string $ipAddress): array
    {
        return [
            'booking_id' => $slip->booking_id,
            'student_id' => $slip->student_id,
            'program_title' => $slip->booking->program->title,
            'school_name' => $slip->booking->school->name,
            'event_date' => $slip->booking->confirmed_date?->toDateString(),
            'signature_method' => $this->detectSignatureMethod($signatureData['signature']),
            'browser_info' => [
                'user_agent' => request()->header('User-Agent'),
                'accept_language' => request()->header('Accept-Language'),
                'referer' => request()->header('Referer'),
            ],
            'timestamp_utc' => now()->toISOString(),
        ];
    }

    /**
     * Store signature image.
     *
     * @param PermissionSlip $slip
     * @param string $imageData
     * @return string
     */
    private function storeSignatureImage(PermissionSlip $slip, string $imageData): string
    {
        $filename = "signatures/slip_{$slip->id}_" . Str::random(8) . '.png';
        
        // Convert base64 to binary if needed
        if (str_starts_with($imageData, 'data:image/')) {
            $imageData = substr($imageData, strpos($imageData, ',') + 1);
            $imageData = base64_decode($imageData);
        }

        Storage::put($filename, $imageData);
        
        return $filename;
    }

    /**
     * Generate verification hash.
     *
     * @param array $signatureData
     * @param string $ipAddress
     * @return string
     */
    private function generateVerificationHash(array $signatureData, string $ipAddress): string
    {
        $hashData = [
            'signature' => $signatureData['signature'] ?? '',
            'parent_name' => $signatureData['parent_name'] ?? '',
            'timestamp' => $signatureData['timestamp'] ?? '',
            'ip_address' => $ipAddress,
            'app_key' => config('app.key'),
        ];

        return hash('sha256', json_encode($hashData));
    }

    /**
     * Detect signature method from signature data.
     *
     * @param string $signature
     * @return string
     */
    private function detectSignatureMethod(string $signature): string
    {
        if (str_starts_with($signature, 'data:image/')) {
            return 'base64_image';
        }

        if (str_starts_with($signature, '<svg')) {
            return 'svg_element';
        }

        if (str_starts_with($signature, 'M ')) {
            return 'svg_path';
        }

        if (str_starts_with($signature, '{') || str_starts_with($signature, '[')) {
            return 'json_coordinates';
        }

        return 'unknown';
    }
}
