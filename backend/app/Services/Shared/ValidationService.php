<?php

namespace App\Services\Shared;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

/**
 * Validation Service
 * 
 * Centralized validation service for common validation patterns
 */
class ValidationService
{
    /**
     * Validate email format
     *
     * @param string $email
     * @return bool
     */
    public function validateEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    /**
     * Validate phone number format
     *
     * @param string $phone
     * @return bool
     */
    public function validatePhone(string $phone): bool
    {
        // Remove all non-digit characters
        $cleanPhone = preg_replace('/\D/', '', $phone);
        
        // Check if it's a valid US phone number (10 or 11 digits)
        return preg_match('/^1?[2-9]\d{2}[2-9]\d{2}\d{4}$/', $cleanPhone);
    }

    /**
     * Validate password strength
     *
     * @param string $password
     * @return array
     */
    public function validatePassword(string $password): array
    {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        if (!preg_match('/\d/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'strength' => $this->calculatePasswordStrength($password)
        ];
    }

    /**
     * Validate date format and range
     *
     * @param string $date
     * @param string $format
     * @param string|null $minDate
     * @param string|null $maxDate
     * @return bool
     */
    public function validateDate(
        string $date,
        string $format = 'Y-m-d',
        ?string $minDate = null,
        ?string $maxDate = null
    ): bool {
        $dateTime = \DateTime::createFromFormat($format, $date);
        
        if (!$dateTime || $dateTime->format($format) !== $date) {
            return false;
        }
        
        if ($minDate && $dateTime < \DateTime::createFromFormat($format, $minDate)) {
            return false;
        }
        
        if ($maxDate && $dateTime > \DateTime::createFromFormat($format, $maxDate)) {
            return false;
        }
        
        return true;
    }

    /**
     * Validate URL format
     *
     * @param string $url
     * @return bool
     */
    public function validateUrl(string $url): bool
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Validate file upload
     *
     * @param mixed $file
     * @param array $allowedTypes
     * @param int $maxSize
     * @return array
     */
    public function validateFileUpload($file, array $allowedTypes, int $maxSize): array
    {
        $errors = [];
        
        if (!$file || !$file->isValid()) {
            $errors[] = 'Invalid file upload';
            return ['valid' => false, 'errors' => $errors];
        }
        
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, $allowedTypes)) {
            $errors[] = 'File type not allowed. Allowed types: ' . implode(', ', $allowedTypes);
        }
        
        if ($file->getSize() > $maxSize * 1024) {
            $errors[] = 'File size exceeds maximum allowed size of ' . $maxSize . 'KB';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'file_info' => [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'type' => $file->getMimeType(),
                'extension' => $extension
            ]
        ];
    }

    /**
     * Validate JSON structure
     *
     * @param string $json
     * @param array|null $requiredKeys
     * @return array
     */
    public function validateJson(string $json, ?array $requiredKeys = null): array
    {
        $decoded = json_decode($json, true);
        $errors = [];
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $errors[] = 'Invalid JSON format: ' . json_last_error_msg();
            return ['valid' => false, 'errors' => $errors];
        }
        
        if ($requiredKeys && is_array($decoded)) {
            foreach ($requiredKeys as $key) {
                if (!array_key_exists($key, $decoded)) {
                    $errors[] = "Required key '{$key}' is missing";
                }
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors,
            'data' => $decoded
        ];
    }

    /**
     * Validate array data against rules
     *
     * @param array $data
     * @param array $rules
     * @param array $messages
     * @return array
     * @throws ValidationException
     */
    public function validateData(array $data, array $rules, array $messages = []): array
    {
        $validator = Validator::make($data, $rules, $messages);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return $validator->validated();
    }

    /**
     * Sanitize string input
     *
     * @param string $input
     * @param bool $allowHtml
     * @return string
     */
    public function sanitizeString(string $input, bool $allowHtml = false): string
    {
        $sanitized = trim($input);
        
        if (!$allowHtml) {
            $sanitized = strip_tags($sanitized);
        }
        
        return htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate coordinate values
     *
     * @param float $latitude
     * @param float $longitude
     * @return bool
     */
    public function validateCoordinates(float $latitude, float $longitude): bool
    {
        return $latitude >= -90 && $latitude <= 90 && $longitude >= -180 && $longitude <= 180;
    }

    /**
     * Calculate password strength score
     *
     * @param string $password
     * @return int
     */
    private function calculatePasswordStrength(string $password): int
    {
        $score = 0;
        
        // Length bonus
        $score += min(strlen($password) * 2, 20);
        
        // Character variety bonus
        if (preg_match('/[a-z]/', $password)) $score += 5;
        if (preg_match('/[A-Z]/', $password)) $score += 5;
        if (preg_match('/\d/', $password)) $score += 5;
        if (preg_match('/[^A-Za-z0-9]/', $password)) $score += 10;
        
        // Complexity bonus
        if (preg_match('/[a-z].*[A-Z]|[A-Z].*[a-z]/', $password)) $score += 5;
        if (preg_match('/\d.*[^A-Za-z0-9]|[^A-Za-z0-9].*\d/', $password)) $score += 5;
        
        return min($score, 100);
    }

    /**
     * Validate business hours format
     *
     * @param array $hours
     * @return bool
     */
    public function validateBusinessHours(array $hours): bool
    {
        $requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        foreach ($requiredDays as $day) {
            if (!isset($hours[$day])) {
                return false;
            }
            
            $dayHours = $hours[$day];
            if (!is_array($dayHours) || !isset($dayHours['open']) || !isset($dayHours['close'])) {
                return false;
            }
            
            if (!preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $dayHours['open']) ||
                !preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $dayHours['close'])) {
                return false;
            }
        }
        
        return true;
    }
}
