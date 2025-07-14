<?php

namespace App\Utils\Spark;

use App\Models\Spark\Program;
use App\Models\Spark\CharacterTopic;
use Carbon\Carbon;

/**
 * Program Helper Utility
 * 
 * Provides utility methods for Spark program management
 */
class ProgramHelper
{
    /**
     * Get available grade levels for programs
     *
     * @return array
     */
    public static function getGradeLevels(): array
    {
        return [
            'K' => 'Kindergarten',
            '1' => '1st Grade',
            '2' => '2nd Grade',
            '3' => '3rd Grade',
            '4' => '4th Grade',
            '5' => '5th Grade',
            '6' => '6th Grade',
            '7' => '7th Grade',
            '8' => '8th Grade',
            '9' => '9th Grade',
            '10' => '10th Grade',
            '11' => '11th Grade',
            '12' => '12th Grade',
        ];
    }

    /**
     * Get grade level groups
     *
     * @return array
     */
    public static function getGradeLevelGroups(): array
    {
        return [
            'elementary' => ['K', '1', '2', '3', '4', '5'],
            'middle' => ['6', '7', '8'],
            'high' => ['9', '10', '11', '12'],
        ];
    }

    /**
     * Format grade levels for display
     *
     * @param array $gradeLevels
     * @return string
     */
    public static function formatGradeLevels(array $gradeLevels): string
    {
        if (empty($gradeLevels)) {
            return 'All grades';
        }

        $formatted = array_map(function ($grade) {
            return $grade === 'K' ? 'K' : "Grade {$grade}";
        }, $gradeLevels);

        return implode(', ', $formatted);
    }

    /**
     * Get duration options for programs
     *
     * @return array
     */
    public static function getDurationOptions(): array
    {
        return [
            15 => '15 minutes',
            30 => '30 minutes',
            45 => '45 minutes',
            60 => '1 hour',
            90 => '1.5 hours',
            120 => '2 hours',
            150 => '2.5 hours',
            180 => '3 hours',
            240 => '4 hours',
            300 => '5 hours',
            360 => '6 hours',
            420 => '7 hours',
            480 => '8 hours',
        ];
    }

    /**
     * Format duration in minutes to human readable format
     *
     * @param int $minutes
     * @return string
     */
    public static function formatDuration(int $minutes): string
    {
        if ($minutes < 60) {
            return "{$minutes} minutes";
        }

        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($remainingMinutes === 0) {
            return $hours === 1 ? "1 hour" : "{$hours} hours";
        }

        return $hours === 1 
            ? "1 hour {$remainingMinutes} minutes" 
            : "{$hours} hours {$remainingMinutes} minutes";
    }

    /**
     * Get price ranges for filtering
     *
     * @return array
     */
    public static function getPriceRanges(): array
    {
        return [
            'free' => ['min' => 0, 'max' => 0, 'label' => 'Free'],
            'low' => ['min' => 0.01, 'max' => 5.00, 'label' => '$0.01 - $5.00'],
            'medium' => ['min' => 5.01, 'max' => 15.00, 'label' => '$5.01 - $15.00'],
            'high' => ['min' => 15.01, 'max' => 30.00, 'label' => '$15.01 - $30.00'],
            'premium' => ['min' => 30.01, 'max' => 999.99, 'label' => '$30.01+'],
        ];
    }

    /**
     * Format price for display
     *
     * @param float $price
     * @return string
     */
    public static function formatPrice(float $price): string
    {
        if ($price == 0) {
            return 'Free';
        }

        return '$' . number_format($price, 2) . ' per student';
    }

    /**
     * Get character topic categories
     *
     * @return array
     */
    public static function getCharacterTopicCategories(): array
    {
        return CharacterTopic::getCategories();
    }

    /**
     * Get popular character topics
     *
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getPopularCharacterTopics(int $limit = 10)
    {
        return CharacterTopic::withCount('programs')
            ->orderBy('programs_count', 'desc')
            ->active()
            ->limit($limit)
            ->get();
    }

    /**
     * Calculate program statistics
     *
     * @param Program $program
     * @return array
     */
    public static function calculateProgramStatistics(Program $program): array
    {
        $availability = $program->availability();
        $bookings = $program->bookings();

        return [
            'total_availability_slots' => $availability->count(),
            'available_slots' => $availability->available()->count(),
            'future_slots' => $availability->future()->count(),
            'total_bookings' => $bookings->count(),
            'confirmed_bookings' => $bookings->where('status', 'confirmed')->count(),
            'pending_bookings' => $bookings->where('status', 'pending')->count(),
            'cancelled_bookings' => $bookings->where('status', 'cancelled')->count(),
            'total_participants' => $bookings->sum('participant_count'),
            'total_capacity' => $availability->sum('max_bookings'),
            'current_bookings' => $availability->sum('current_bookings'),
        ];
    }

    /**
     * Get program recommendations based on grade level and topics
     *
     * @param array $gradeLevels
     * @param array $characterTopics
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getRecommendedPrograms(array $gradeLevels = [], array $characterTopics = [], int $limit = 5)
    {
        $query = Program::active();

        if (!empty($gradeLevels)) {
            $query->where(function ($q) use ($gradeLevels) {
                foreach ($gradeLevels as $grade) {
                    $q->orWhereJsonContains('grade_levels', $grade);
                }
            });
        }

        if (!empty($characterTopics)) {
            $query->where(function ($q) use ($characterTopics) {
                foreach ($characterTopics as $topic) {
                    $q->orWhereJsonContains('character_topics', $topic);
                }
            });
        }

        return $query->withCount(['availability', 'bookings'])
            ->orderBy('bookings_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Check if a program is suitable for a grade level
     *
     * @param Program $program
     * @param string $gradeLevel
     * @return bool
     */
    public static function isSuitableForGrade(Program $program, string $gradeLevel): bool
    {
        return in_array($gradeLevel, $program->grade_levels ?? []);
    }

    /**
     * Get time slot suggestions for program availability
     *
     * @return array
     */
    public static function getTimeSlotSuggestions(): array
    {
        return [
            'morning' => [
                ['start' => '08:00', 'end' => '09:00'],
                ['start' => '09:00', 'end' => '10:00'],
                ['start' => '10:00', 'end' => '11:00'],
                ['start' => '11:00', 'end' => '12:00'],
            ],
            'afternoon' => [
                ['start' => '12:00', 'end' => '13:00'],
                ['start' => '13:00', 'end' => '14:00'],
                ['start' => '14:00', 'end' => '15:00'],
                ['start' => '15:00', 'end' => '16:00'],
                ['start' => '16:00', 'end' => '17:00'],
            ],
            'extended' => [
                ['start' => '08:00', 'end' => '10:00'],
                ['start' => '10:00', 'end' => '12:00'],
                ['start' => '13:00', 'end' => '15:00'],
                ['start' => '15:00', 'end' => '17:00'],
            ],
        ];
    }

    /**
     * Validate program data
     *
     * @param array $data
     * @return array
     */
    public static function validateProgramData(array $data): array
    {
        $errors = [];

        // Validate grade levels
        if (isset($data['grade_levels'])) {
            $validGrades = array_keys(self::getGradeLevels());
            $invalidGrades = array_diff($data['grade_levels'], $validGrades);
            if (!empty($invalidGrades)) {
                $errors['grade_levels'] = 'Invalid grade levels: ' . implode(', ', $invalidGrades);
            }
        }

        // Validate duration
        if (isset($data['duration_minutes'])) {
            if ($data['duration_minutes'] < 15 || $data['duration_minutes'] > 480) {
                $errors['duration_minutes'] = 'Duration must be between 15 minutes and 8 hours';
            }
        }

        // Validate price
        if (isset($data['price_per_student'])) {
            if ($data['price_per_student'] < 0 || $data['price_per_student'] > 999.99) {
                $errors['price_per_student'] = 'Price must be between $0.00 and $999.99';
            }
        }

        return $errors;
    }
}
