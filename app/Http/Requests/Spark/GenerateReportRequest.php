<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Generate Report Request
 *
 * Validates data for generating custom analytics reports with various
 * filters, formats, and scheduling options.
 */
class GenerateReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->can('generate', \App\Models\Spark\AnalyticsReport::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'report_type' => [
                'required',
                'string',
                Rule::in([
                    'booking_summary',
                    'program_performance',
                    'school_engagement',
                    'financial_summary',
                    'permission_slip_compliance'
                ]),
            ],
            'title' => [
                'required',
                'string',
                'max:255',
                'min:3',
            ],
            'description' => [
                'sometimes',
                'string',
                'max:1000',
            ],
            'format' => [
                'sometimes',
                'string',
                Rule::in(['pdf', 'excel', 'csv']),
            ],
            'filters' => [
                'required',
                'array',
            ],
            'filters.date_range' => [
                'sometimes',
                'string',
                Rule::in(['week', 'month', 'quarter', 'year', 'custom']),
            ],
            'filters.start_date' => [
                'required_if:filters.date_range,custom',
                'date',
                'before_or_equal:filters.end_date',
            ],
            'filters.end_date' => [
                'required_if:filters.date_range,custom',
                'date',
                'after_or_equal:filters.start_date',
                'before_or_equal:today',
            ],
            'filters.school_id' => [
                'sometimes',
                'integer',
                'exists:schools,id',
            ],
            'filters.district_id' => [
                'sometimes',
                'integer',
                'exists:districts,id',
            ],
            'filters.program_id' => [
                'sometimes',
                'integer',
                'exists:spark_programs,id',
            ],
            'filters.teacher_id' => [
                'sometimes',
                'integer',
                'exists:users,id',
            ],
            'filters.status' => [
                'sometimes',
                'array',
            ],
            'filters.status.*' => [
                'string',
                Rule::in(['pending', 'confirmed', 'cancelled', 'completed']),
            ],
            'filters.grade_levels' => [
                'sometimes',
                'array',
            ],
            'filters.grade_levels.*' => [
                'string',
                Rule::in(['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']),
            ],
            'filters.include_cancelled' => [
                'sometimes',
                'boolean',
            ],
            'filters.min_students' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
            ],
            'filters.max_students' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100',
                'gte:filters.min_students',
            ],
            'filters.min_revenue' => [
                'sometimes',
                'numeric',
                'min:0',
            ],
            'filters.max_revenue' => [
                'sometimes',
                'numeric',
                'min:0',
                'gte:filters.min_revenue',
            ],
            'schedule' => [
                'sometimes',
                'array',
            ],
            'schedule.frequency' => [
                'required_with:schedule',
                'string',
                Rule::in(['daily', 'weekly', 'monthly', 'quarterly']),
            ],
            'schedule.day_of_week' => [
                'required_if:schedule.frequency,weekly',
                'integer',
                'min:0',
                'max:6',
            ],
            'schedule.day_of_month' => [
                'required_if:schedule.frequency,monthly',
                'integer',
                'min:1',
                'max:31',
            ],
            'schedule.time' => [
                'sometimes',
                'date_format:H:i',
            ],
            'schedule.timezone' => [
                'sometimes',
                'string',
                'timezone',
            ],
            'schedule.recipients' => [
                'sometimes',
                'array',
                'min:1',
            ],
            'schedule.recipients.*' => [
                'email',
                'max:255',
            ],
            'include_charts' => [
                'sometimes',
                'boolean',
            ],
            'include_raw_data' => [
                'sometimes',
                'boolean',
            ],
            'group_by' => [
                'sometimes',
                'string',
                Rule::in(['day', 'week', 'month', 'quarter', 'year']),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'report_type.required' => 'Report type is required.',
            'report_type.in' => 'Invalid report type selected.',
            'title.required' => 'Report title is required.',
            'title.min' => 'Report title must be at least 3 characters.',
            'title.max' => 'Report title cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'format.in' => 'Invalid format selected. Choose from PDF, Excel, or CSV.',
            'filters.required' => 'At least one filter must be specified.',
            'filters.date_range.in' => 'Invalid date range selected.',
            'filters.start_date.required_if' => 'Start date is required for custom date range.',
            'filters.end_date.required_if' => 'End date is required for custom date range.',
            'filters.start_date.before_or_equal' => 'Start date must be before or equal to end date.',
            'filters.end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'filters.end_date.before_or_equal' => 'End date cannot be in the future.',
            'filters.school_id.exists' => 'Selected school does not exist.',
            'filters.district_id.exists' => 'Selected district does not exist.',
            'filters.program_id.exists' => 'Selected program does not exist.',
            'filters.teacher_id.exists' => 'Selected teacher does not exist.',
            'filters.status.*.in' => 'Invalid status selected.',
            'filters.grade_levels.*.in' => 'Invalid grade level selected.',
            'filters.min_students.min' => 'Minimum students must be at least 1.',
            'filters.max_students.gte' => 'Maximum students must be greater than or equal to minimum students.',
            'filters.min_revenue.min' => 'Minimum revenue must be at least 0.',
            'filters.max_revenue.gte' => 'Maximum revenue must be greater than or equal to minimum revenue.',
            'schedule.frequency.required_with' => 'Schedule frequency is required when scheduling is enabled.',
            'schedule.frequency.in' => 'Invalid schedule frequency selected.',
            'schedule.day_of_week.required_if' => 'Day of week is required for weekly schedules.',
            'schedule.day_of_month.required_if' => 'Day of month is required for monthly schedules.',
            'schedule.time.date_format' => 'Schedule time must be in HH:MM format.',
            'schedule.timezone.timezone' => 'Invalid timezone specified.',
            'schedule.recipients.min' => 'At least one recipient email is required for scheduled reports.',
            'schedule.recipients.*.email' => 'All recipients must be valid email addresses.',
            'group_by.in' => 'Invalid grouping option selected.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'report_type' => 'report type',
            'title' => 'report title',
            'description' => 'report description',
            'format' => 'export format',
            'filters' => 'filters',
            'filters.date_range' => 'date range',
            'filters.start_date' => 'start date',
            'filters.end_date' => 'end date',
            'filters.school_id' => 'school',
            'filters.district_id' => 'district',
            'filters.program_id' => 'program',
            'filters.teacher_id' => 'teacher',
            'filters.status' => 'booking status',
            'filters.grade_levels' => 'grade levels',
            'filters.min_students' => 'minimum students',
            'filters.max_students' => 'maximum students',
            'filters.min_revenue' => 'minimum revenue',
            'filters.max_revenue' => 'maximum revenue',
            'schedule.frequency' => 'schedule frequency',
            'schedule.day_of_week' => 'day of week',
            'schedule.day_of_month' => 'day of month',
            'schedule.time' => 'schedule time',
            'schedule.timezone' => 'timezone',
            'schedule.recipients' => 'recipients',
            'include_charts' => 'include charts',
            'include_raw_data' => 'include raw data',
            'group_by' => 'group by',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate date range logic
            if ($this->has('filters.start_date') && $this->has('filters.end_date')) {
                $startDate = \Carbon\Carbon::parse($this->input('filters.start_date'));
                $endDate = \Carbon\Carbon::parse($this->input('filters.end_date'));
                
                // Check if date range is not too large (max 2 years)
                if ($startDate->diffInDays($endDate) > 730) {
                    $validator->errors()->add(
                        'filters.end_date',
                        'Date range cannot exceed 2 years.'
                    );
                }
            }

            // Validate school and district relationship
            if ($this->has('filters.school_id') && $this->has('filters.district_id')) {
                $school = \App\Models\Spark\School::find($this->input('filters.school_id'));
                if ($school && $school->district_id != $this->input('filters.district_id')) {
                    $validator->errors()->add(
                        'filters.school_id',
                        'Selected school does not belong to the selected district.'
                    );
                }
            }

            // Validate schedule day_of_month for different months
            if ($this->input('schedule.frequency') === 'monthly' && 
                $this->has('schedule.day_of_month') && 
                $this->input('schedule.day_of_month') > 28) {
                $validator->errors()->add(
                    'schedule.day_of_month',
                    'Day of month should not exceed 28 to ensure it exists in all months.'
                );
            }

            // Validate report type specific filters
            $reportType = $this->input('report_type');
            if ($reportType === 'financial_summary' && !$this->has('filters.start_date') && !$this->has('filters.date_range')) {
                $validator->errors()->add(
                    'filters',
                    'Financial reports require a specific date range.'
                );
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        if (!$this->has('format')) {
            $this->merge(['format' => 'pdf']);
        }

        if (!$this->has('filters.date_range')) {
            $this->merge(['filters.date_range' => 'month']);
        }

        if (!$this->has('include_charts')) {
            $this->merge(['include_charts' => true]);
        }

        if (!$this->has('include_raw_data')) {
            $this->merge(['include_raw_data' => false]);
        }

        // Clean up empty arrays
        if ($this->has('filters.status') && empty($this->input('filters.status'))) {
            $filters = $this->input('filters');
            unset($filters['status']);
            $this->merge(['filters' => $filters]);
        }

        if ($this->has('filters.grade_levels') && empty($this->input('filters.grade_levels'))) {
            $filters = $this->input('filters');
            unset($filters['grade_levels']);
            $this->merge(['filters' => $filters]);
        }
    }
}
