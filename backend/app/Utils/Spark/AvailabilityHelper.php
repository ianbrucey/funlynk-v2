<?php

namespace App\Utils\Spark;

use App\Models\Spark\Program;
use App\Models\Spark\ProgramAvailability;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Availability Helper Utility.
 *
 * Provides utility methods for program availability management
 */
class AvailabilityHelper
{
    /**
     * Get available time slots for a specific date.
     *
     * @param Program $program
     * @param string  $date
     *
     * @return Collection
     */
    public static function getAvailableSlots(Program $program, string $date): Collection
    {
        return $program->availability()
            ->where('date', $date)
            ->available()
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Check if a time slot conflicts with existing availability.
     *
     * @param Program  $program
     * @param string   $date
     * @param string   $startTime
     * @param string   $endTime
     * @param int|null $excludeId
     *
     * @return bool
     */
    public static function hasTimeConflict(Program $program, string $date, string $startTime, string $endTime, ?int $excludeId = null): bool
    {
        $query = $program->availability()
            ->where('date', $date)
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                  ->orWhereBetween('end_time', [$startTime, $endTime])
                  ->orWhere(function ($subQ) use ($startTime, $endTime) {
                      $subQ->where('start_time', '<=', $startTime)
                           ->where('end_time', '>=', $endTime);
                  });
            });

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    /**
     * Generate availability slots for a date range.
     *
     * @param Program $program
     * @param string  $startDate
     * @param string  $endDate
     * @param array   $timeSlots
     * @param int     $maxBookings
     *
     * @return array
     */
    public static function generateAvailabilitySlots(Program $program, string $startDate, string $endDate, array $timeSlots, int $maxBookings = 3): array
    {
        $slots = [];
        $currentDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        while ($currentDate->lte($endDate)) {
            // Skip weekends if needed
            if ($currentDate->isWeekend()) {
                $currentDate->addDay();

                continue;
            }

            foreach ($timeSlots as $timeSlot) {
                $startTime = Carbon::parse($currentDate->format('Y-m-d') . ' ' . $timeSlot['start']);
                $endTime = Carbon::parse($currentDate->format('Y-m-d') . ' ' . $timeSlot['end']);

                // Check for conflicts
                if (!self::hasTimeConflict($program, $currentDate->format('Y-m-d'), $timeSlot['start'], $timeSlot['end'])) {
                    $slots[] = [
                        'program_id' => $program->id,
                        'date' => $currentDate->format('Y-m-d'),
                        'start_time' => $startTime,
                        'end_time' => $endTime,
                        'max_bookings' => $maxBookings,
                        'current_bookings' => 0,
                        'is_available' => true,
                    ];
                }
            }

            $currentDate->addDay();
        }

        return $slots;
    }

    /**
     * Get availability statistics for a program.
     *
     * @param Program     $program
     * @param string|null $startDate
     * @param string|null $endDate
     *
     * @return array
     */
    public static function getAvailabilityStatistics(Program $program, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = $program->availability();

        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }

        $availability = $query->get();

        $totalSlots = $availability->count();
        $availableSlots = $availability->where('is_available', true)->count();
        $fullyBookedSlots = $availability->where('current_bookings', '>=', 'max_bookings')->count();
        $totalCapacity = $availability->sum('max_bookings');
        $totalBookings = $availability->sum('current_bookings');

        return [
            'total_slots' => $totalSlots,
            'available_slots' => $availableSlots,
            'fully_booked_slots' => $fullyBookedSlots,
            'partially_booked_slots' => $totalSlots - $availableSlots - $fullyBookedSlots,
            'total_capacity' => $totalCapacity,
            'total_bookings' => $totalBookings,
            'utilization_rate' => $totalCapacity > 0 ? round(($totalBookings / $totalCapacity) * 100, 2) : 0,
            'availability_rate' => $totalSlots > 0 ? round(($availableSlots / $totalSlots) * 100, 2) : 0,
        ];
    }

    /**
     * Find optimal time slots based on program duration.
     *
     * @param int    $durationMinutes
     * @param string $preferredTime
     *
     * @return array
     */
    public static function findOptimalTimeSlots(int $durationMinutes, string $preferredTime = 'morning'): array
    {
        $slots = [];
        $duration = $durationMinutes;

        if ($preferredTime === 'morning') {
            $startHour = 8;
            $endHour = 12;
        } elseif ($preferredTime === 'afternoon') {
            $startHour = 12;
            $endHour = 17;
        } else {
            $startHour = 8;
            $endHour = 17;
        }

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            for ($minute = 0; $minute < 60; $minute += 30) {
                $startTime = sprintf('%02d:%02d', $hour, $minute);
                $endTime = Carbon::createFromFormat('H:i', $startTime)->addMinutes($duration);

                // Don't go past the preferred time range
                if ($endTime->hour >= $endHour) {
                    break;
                }

                $slots[] = [
                    'start' => $startTime,
                    'end' => $endTime->format('H:i'),
                    'duration' => $duration,
                ];
            }
        }

        return $slots;
    }

    /**
     * Get next available slot for a program.
     *
     * @param Program     $program
     * @param string|null $fromDate
     *
     * @return ProgramAvailability|null
     */
    public static function getNextAvailableSlot(Program $program, ?string $fromDate = null): ?ProgramAvailability
    {
        $query = $program->availability()
            ->available()
            ->where('date', '>=', $fromDate ?? Carbon::today()->format('Y-m-d'))
            ->orderBy('date')
            ->orderBy('start_time');

        return $query->first();
    }

    /**
     * Check if a program has availability on a specific date.
     *
     * @param Program $program
     * @param string  $date
     *
     * @return bool
     */
    public static function hasAvailabilityOnDate(Program $program, string $date): bool
    {
        return $program->availability()
            ->where('date', $date)
            ->available()
            ->exists();
    }

    /**
     * Get availability calendar for a program.
     *
     * @param Program $program
     * @param string  $month
     * @param string  $year
     *
     * @return array
     */
    public static function getAvailabilityCalendar(Program $program, string $month, string $year): array
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        $availability = $program->availability()
            ->whereBetween('date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->groupBy('date');

        $calendar = [];
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $dateStr = $currentDate->format('Y-m-d');
            $dayAvailability = $availability->get($dateStr, collect());

            $calendar[$dateStr] = [
                'date' => $dateStr,
                'day' => $currentDate->day,
                'day_name' => $currentDate->format('l'),
                'is_weekend' => $currentDate->isWeekend(),
                'total_slots' => $dayAvailability->count(),
                'available_slots' => $dayAvailability->where('is_available', true)->count(),
                'fully_booked_slots' => $dayAvailability->where('current_bookings', '>=', 'max_bookings')->count(),
                'has_availability' => $dayAvailability->where('is_available', true)->count() > 0,
            ];

            $currentDate->addDay();
        }

        return $calendar;
    }

    /**
     * Bulk update availability status.
     *
     * @param array $availabilityIds
     * @param bool  $isAvailable
     *
     * @return int
     */
    public static function bulkUpdateAvailability(array $availabilityIds, bool $isAvailable): int
    {
        return ProgramAvailability::whereIn('id', $availabilityIds)
            ->update(['is_available' => $isAvailable]);
    }

    /**
     * Get conflicting availability slots.
     *
     * @param Program $program
     * @param string  $date
     * @param string  $startTime
     * @param string  $endTime
     *
     * @return Collection
     */
    public static function getConflictingSlots(Program $program, string $date, string $startTime, string $endTime): Collection
    {
        return $program->availability()
            ->where('date', $date)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                      ->orWhereBetween('end_time', [$startTime, $endTime])
                      ->orWhere(function ($q) use ($startTime, $endTime) {
                          $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                      });
            })
            ->get();
    }
}
