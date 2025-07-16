<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Export Report Request
 *
 * Validates data for exporting analytics data in various formats
 * with customizable filters and export options.
 */
class ExportReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->can('export', \App\Models\Spark\AnalyticsReport::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'data_type' => [
                'required',
                'string',
                Rule::in([
                    'bookings',
                    'programs',
                    'schools',
                    'financial',
                    'permission_slips',
                    'users',
                    'analytics_summary'
                ]),
            ],
            'format' => [
                'required',
                'string',
                Rule::in(['csv', 'excel', 'pdf', 'json']),
            ],
            'filename' => [
                'sometimes',
                'string',
                'max:255',
                'regex:/^[a-zA-Z0-9_\-\s]+$/',
            ],
            'filters' => [
                'sometimes',
                'array',
            ],
            'filters.start_date' => [
                'sometimes',
                'date',
                'before_or_equal:filters.end_date',
            ],
            'filters.end_date' => [
                'sometimes',
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
            'filters.payment_status' => [
                'sometimes',
                'array',
            ],
            'filters.payment_status.*' => [
                'string',
                Rule::in(['pending', 'paid', 'overdue', 'cancelled']),
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
            'filters.include_cancelled' => [
                'sometimes',
                'boolean',
            ],
            'filters.include_deleted' => [
                'sometimes',
                'boolean',
            ],
            'columns' => [
                'sometimes',
                'array',
                'min:1',
            ],
            'columns.*' => [
                'string',
                'max:100',
            ],
            'sort_by' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'sort_direction' => [
                'sometimes',
                'string',
                Rule::in(['asc', 'desc']),
            ],
            'limit' => [
                'sometimes',
                'integer',
                'min:1',
                'max:50000',
            ],
            'include_headers' => [
                'sometimes',
                'boolean',
            ],
            'include_totals' => [
                'sometimes',
                'boolean',
            ],
            'group_by' => [
                'sometimes',
                'string',
                Rule::in(['day', 'week', 'month', 'quarter', 'year', 'school', 'program', 'teacher']),
            ],
            'aggregate_functions' => [
                'sometimes',
                'array',
            ],
            'aggregate_functions.*' => [
                'string',
                Rule::in(['sum', 'avg', 'count', 'min', 'max']),
            ],
            'export_options' => [
                'sometimes',
                'array',
            ],
            'export_options.compress' => [
                'sometimes',
                'boolean',
            ],
            'export_options.password_protect' => [
                'sometimes',
                'boolean',
            ],
            'export_options.password' => [
                'required_if:export_options.password_protect,true',
                'string',
                'min:8',
                'max:50',
            ],
            'export_options.include_metadata' => [
                'sometimes',
                'boolean',
            ],
            'export_options.watermark' => [
                'sometimes',
                'string',
                'max:100',
            ],
            'delivery_method' => [
                'sometimes',
                'string',
                Rule::in(['download', 'email', 'storage']),
            ],
            'delivery_email' => [
                'required_if:delivery_method,email',
                'email',
                'max:255',
            ],
            'storage_path' => [
                'required_if:delivery_method,storage',
                'string',
                'max:500',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'data_type.required' => 'Data type is required for export.',
            'data_type.in' => 'Invalid data type selected for export.',
            'format.required' => 'Export format is required.',
            'format.in' => 'Invalid export format selected.',
            'filename.regex' => 'Filename can only contain letters, numbers, spaces, hyphens, and underscores.',
            'filename.max' => 'Filename cannot exceed 255 characters.',
            'filters.start_date.before_or_equal' => 'Start date must be before or equal to end date.',
            'filters.end_date.after_or_equal' => 'End date must be after or equal to start date.',
            'filters.end_date.before_or_equal' => 'End date cannot be in the future.',
            'filters.school_id.exists' => 'Selected school does not exist.',
            'filters.district_id.exists' => 'Selected district does not exist.',
            'filters.program_id.exists' => 'Selected program does not exist.',
            'filters.teacher_id.exists' => 'Selected teacher does not exist.',
            'filters.status.*.in' => 'Invalid status selected.',
            'filters.grade_levels.*.in' => 'Invalid grade level selected.',
            'filters.payment_status.*.in' => 'Invalid payment status selected.',
            'filters.min_students.min' => 'Minimum students must be at least 1.',
            'filters.max_students.gte' => 'Maximum students must be greater than or equal to minimum students.',
            'filters.min_revenue.min' => 'Minimum revenue must be at least 0.',
            'filters.max_revenue.gte' => 'Maximum revenue must be greater than or equal to minimum revenue.',
            'columns.min' => 'At least one column must be selected for export.',
            'columns.*.max' => 'Column name cannot exceed 100 characters.',
            'sort_by.max' => 'Sort field name cannot exceed 100 characters.',
            'sort_direction.in' => 'Sort direction must be either ascending or descending.',
            'limit.min' => 'Export limit must be at least 1.',
            'limit.max' => 'Export limit cannot exceed 50,000 records.',
            'group_by.in' => 'Invalid grouping option selected.',
            'aggregate_functions.*.in' => 'Invalid aggregate function selected.',
            'export_options.password.required_if' => 'Password is required when password protection is enabled.',
            'export_options.password.min' => 'Password must be at least 8 characters.',
            'export_options.password.max' => 'Password cannot exceed 50 characters.',
            'export_options.watermark.max' => 'Watermark text cannot exceed 100 characters.',
            'delivery_method.in' => 'Invalid delivery method selected.',
            'delivery_email.required_if' => 'Email address is required for email delivery.',
            'delivery_email.email' => 'Please provide a valid email address.',
            'storage_path.required_if' => 'Storage path is required for storage delivery.',
            'storage_path.max' => 'Storage path cannot exceed 500 characters.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'data_type' => 'data type',
            'format' => 'export format',
            'filename' => 'filename',
            'filters.start_date' => 'start date',
            'filters.end_date' => 'end date',
            'filters.school_id' => 'school',
            'filters.district_id' => 'district',
            'filters.program_id' => 'program',
            'filters.teacher_id' => 'teacher',
            'filters.status' => 'booking status',
            'filters.grade_levels' => 'grade levels',
            'filters.payment_status' => 'payment status',
            'filters.min_students' => 'minimum students',
            'filters.max_students' => 'maximum students',
            'filters.min_revenue' => 'minimum revenue',
            'filters.max_revenue' => 'maximum revenue',
            'columns' => 'columns',
            'sort_by' => 'sort field',
            'sort_direction' => 'sort direction',
            'limit' => 'record limit',
            'group_by' => 'group by',
            'aggregate_functions' => 'aggregate functions',
            'export_options.password' => 'password',
            'export_options.watermark' => 'watermark',
            'delivery_method' => 'delivery method',
            'delivery_email' => 'delivery email',
            'storage_path' => 'storage path',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate date range is not too large
            if ($this->has('filters.start_date') && $this->has('filters.end_date')) {
                $startDate = \Carbon\Carbon::parse($this->input('filters.start_date'));
                $endDate = \Carbon\Carbon::parse($this->input('filters.end_date'));
                
                if ($startDate->diffInDays($endDate) > 1095) { // 3 years
                    $validator->errors()->add(
                        'filters.end_date',
                        'Date range cannot exceed 3 years for exports.'
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

            // Validate columns are appropriate for data type
            if ($this->has('columns') && $this->has('data_type')) {
                $dataType = $this->input('data_type');
                $columns = $this->input('columns');
                $validColumns = $this->getValidColumnsForDataType($dataType);
                
                $invalidColumns = array_diff($columns, $validColumns);
                if (!empty($invalidColumns)) {
                    $validator->errors()->add(
                        'columns',
                        'Invalid columns for ' . $dataType . ' data type: ' . implode(', ', $invalidColumns)
                    );
                }
            }

            // Validate sort_by is in selected columns
            if ($this->has('sort_by') && $this->has('columns')) {
                $sortBy = $this->input('sort_by');
                $columns = $this->input('columns');
                
                if (!in_array($sortBy, $columns)) {
                    $validator->errors()->add(
                        'sort_by',
                        'Sort field must be one of the selected columns.'
                    );
                }
            }

            // Validate export limits based on format
            if ($this->has('limit') && $this->has('format')) {
                $limit = $this->input('limit');
                $format = $this->input('format');
                
                $maxLimits = [
                    'csv' => 50000,
                    'excel' => 10000,
                    'pdf' => 1000,
                    'json' => 25000,
                ];
                
                if ($limit > $maxLimits[$format]) {
                    $validator->errors()->add(
                        'limit',
                        "Maximum {$limit} records allowed for {$format} format is {$maxLimits[$format]}."
                    );
                }
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
            $this->merge(['format' => 'csv']);
        }

        if (!$this->has('include_headers')) {
            $this->merge(['include_headers' => true]);
        }

        if (!$this->has('include_totals')) {
            $this->merge(['include_totals' => false]);
        }

        if (!$this->has('sort_direction')) {
            $this->merge(['sort_direction' => 'desc']);
        }

        if (!$this->has('delivery_method')) {
            $this->merge(['delivery_method' => 'download']);
        }

        // Generate filename if not provided
        if (!$this->has('filename')) {
            $dataType = $this->input('data_type', 'export');
            $timestamp = now()->format('Y-m-d_H-i-s');
            $this->merge(['filename' => "{$dataType}_export_{$timestamp}"]);
        }

        // Set default export options
        if (!$this->has('export_options')) {
            $this->merge(['export_options' => []]);
        }

        $exportOptions = $this->input('export_options', []);
        
        if (!isset($exportOptions['compress'])) {
            $exportOptions['compress'] = false;
        }

        if (!isset($exportOptions['password_protect'])) {
            $exportOptions['password_protect'] = false;
        }

        if (!isset($exportOptions['include_metadata'])) {
            $exportOptions['include_metadata'] = true;
        }

        $this->merge(['export_options' => $exportOptions]);
    }

    /**
     * Get valid columns for a data type.
     *
     * @param string $dataType
     * @return array
     */
    private function getValidColumnsForDataType(string $dataType): array
    {
        return match ($dataType) {
            'bookings' => [
                'id', 'booking_reference', 'school_name', 'program_title', 'teacher_name',
                'status', 'student_count', 'total_cost', 'confirmed_date', 'created_at'
            ],
            'programs' => [
                'id', 'title', 'description', 'grade_levels', 'duration_minutes',
                'max_students', 'price_per_student', 'is_active', 'created_at'
            ],
            'schools' => [
                'id', 'name', 'district_name', 'type', 'city', 'state',
                'student_count', 'is_active', 'created_at'
            ],
            'financial' => [
                'booking_id', 'school_name', 'program_title', 'total_cost',
                'payment_status', 'payment_due_date', 'confirmed_date'
            ],
            'permission_slips' => [
                'id', 'booking_reference', 'student_name', 'parent_name', 'parent_email',
                'is_signed', 'signed_at', 'reminder_sent_count', 'created_at'
            ],
            default => []
        };
    }
}
