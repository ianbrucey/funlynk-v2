<?php

namespace App\Http\Resources\Spark;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyticsReportResource extends JsonResource
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
            'name' => $this->name,
            'report_type' => $this->report_type,
            'report_type_label' => $this->getReportTypes()[$this->report_type] ?? $this->report_type,
            'status' => $this->status,
            'format' => $this->format,
            'filters' => $this->filters,
            'data' => $this->when(
                $this->status === 'completed' && $this->data,
                $this->data
            ),
            'file_path' => $this->when(
                $this->file_path && auth()->check(),
                $this->file_path
            ),
            'file_size' => $this->file_size,
            'file_size_human' => $this->file_size_human,
            'generated_at' => $this->generated_at?->toISOString(),
            'expires_at' => $this->expires_at?->toISOString(),
            'is_expired' => $this->is_expired,
            'is_scheduled' => $this->is_scheduled,
            'schedule_frequency' => $this->schedule_frequency,
            'schedule_frequency_label' => $this->schedule_frequency ? 
                ($this->getScheduleFrequencies()[$this->schedule_frequency] ?? $this->schedule_frequency) : null,
            'schedule_config' => $this->schedule_config,
            'last_sent_at' => $this->last_sent_at?->toISOString(),
            'next_run_at' => $this->next_run_at?->toISOString(),
            'is_due' => $this->is_due,
            'email_recipients' => $this->email_recipients,
            'error_message' => $this->when(
                $this->status === 'failed',
                $this->error_message
            ),
            'generation_time_ms' => $this->generation_time_ms,
            'generation_time_human' => $this->generation_time_human,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            
            'metrics_count' => $this->whenCounted('metrics'),
            
            // Actions
            'can_regenerate' => $this->shouldRegenerate(),
            'can_export' => $this->status === 'completed',
            'can_schedule' => !$this->is_scheduled,
            'can_delete' => auth()->check() && auth()->id() === $this->user_id,
        ];
    }
}
