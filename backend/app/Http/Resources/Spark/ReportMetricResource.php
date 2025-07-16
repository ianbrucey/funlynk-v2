<?php

namespace App\Http\Resources\Spark;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportMetricResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'metric_key' => $this->metric_key,
            'metric_key_label' => $this->getCommonMetrics()[$this->metric_key] ?? $this->metric_key,
            'metric_type' => $this->metric_type,
            'metric_type_label' => $this->getMetricTypes()[$this->metric_type] ?? $this->metric_type,
            'metric_value' => $this->metric_value,
            'formatted_value' => $this->formatted_value,
            'metric_unit' => $this->metric_unit,
            'dimensions' => $this->dimensions,
            'metric_date' => $this->metric_date->toDateString(),
            'period_type' => $this->period_type,
            'period_type_label' => $this->getPeriodTypes()[$this->period_type] ?? $this->period_type,
            'period_start' => $this->period_start->toDateString(),
            'period_end' => $this->period_end->toDateString(),
            'period_label' => $this->period_label,
            'metadata' => $this->metadata,
            'calculated_at' => $this->calculated_at->toISOString(),
            'is_stale' => $this->isStale(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'school' => $this->whenLoaded('school', function () {
                return [
                    'id' => $this->school->id,
                    'name' => $this->school->name,
                    'code' => $this->school->code,
                    'district_name' => $this->school->district->name ?? null,
                ];
            }),
            
            'program' => $this->whenLoaded('program', function () {
                return [
                    'id' => $this->program->id,
                    'title' => $this->program->title,
                    'duration_minutes' => $this->program->duration_minutes,
                    'price_per_student' => $this->program->price_per_student,
                ];
            }),
            
            'booking' => $this->whenLoaded('booking', function () {
                return [
                    'id' => $this->booking->id,
                    'booking_reference' => $this->booking->booking_reference,
                    'status' => $this->booking->status,
                    'total_cost' => $this->booking->total_cost,
                    'student_count' => $this->booking->student_count,
                ];
            }),
        ];
    }
}
