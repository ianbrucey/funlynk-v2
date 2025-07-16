<?php

namespace App\Http\Requests\Spark;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Schedule Report Request
 *
 * Validates data for scheduling automated report generation and delivery
 * with configurable frequency, recipients, and delivery options.
 */
class ScheduleReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->can('schedule', \App\Models\Spark\AnalyticsReport::class);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'report_template_id' => [
                'sometimes',
                'integer',
                'exists:analytics_reports,id',
            ],
            'report_type' => [
                'required_without:report_template_id',
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
            'frequency' => [
                'required',
                'string',
                Rule::in(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
            ],
            'day_of_week' => [
                'required_if:frequency,weekly',
                'integer',
                'min:0',
                'max:6',
            ],
            'day_of_month' => [
                'required_if:frequency,monthly',
                'integer',
                'min:1',
                'max:31',
            ],
            'month_of_year' => [
                'required_if:frequency,yearly',
                'integer',
                'min:1',
                'max:12',
            ],
            'time' => [
                'required',
                'date_format:H:i',
            ],
            'timezone' => [
                'required',
                'string',
                'timezone',
            ],
            'format' => [
                'required',
                'string',
                Rule::in(['pdf', 'excel', 'csv']),
            ],
            'recipients' => [
                'required',
                'array',
                'min:1',
                'max:20',
            ],
            'recipients.*' => [
                'email',
                'max:255',
            ],
            'filters' => [
                'required',
                'array',
            ],
            'filters.date_range_type' => [
                'required',
                'string',
                Rule::in(['relative', 'fixed']),
            ],
            'filters.relative_period' => [
                'required_if:filters.date_range_type,relative',
                'string',
                Rule::in(['last_week', 'last_month', 'last_quarter', 'last_year', 'month_to_date', 'year_to_date']),
            ],
            'filters.fixed_start_date' => [
                'required_if:filters.date_range_type,fixed',
                'date',
                'before:filters.fixed_end_date',
            ],
            'filters.fixed_end_date' => [
                'required_if:filters.date_range_type,fixed',
                'date',
                'after:filters.fixed_start_date',
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
            'filters.include_cancelled' => [
                'sometimes',
                'boolean',
            ],
            'delivery_options' => [
                'sometimes',
                'array',
            ],
            'delivery_options.email_subject' => [
                'sometimes',
                'string',
                'max:255',
            ],
            'delivery_options.email_message' => [
                'sometimes',
                'string',
                'max:2000',
            ],
            'delivery_options.attach_raw_data' => [
                'sometimes',
                'boolean',
            ],
            'delivery_options.compress_files' => [
                'sometimes',
                'boolean',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
            'start_date' => [
                'sometimes',
                'date',
                'after_or_equal:today',
            ],
            'end_date' => [
                'sometimes',
                'date',
                'after:start_date',
            ],
            'max_executions' => [
                'sometimes',
                'integer',
                'min:1',
                'max:1000',
            ],
            'retry_on_failure' => [
                'sometimes',
                'boolean',
            ],
            'max_retries' => [
                'required_if:retry_on_failure,true',
                'integer',
                'min:1',
                'max:5',
            ],
            'failure_notification_emails' => [
                'sometimes',
                'array',
            ],
            'failure_notification_emails.*' => [
                'email',
                'max:255',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'report_template_id.exists' => 'Selected report template does not exist.',
            'report_type.required_without' => 'Report type is required when not using a template.',
            'report_type.in' => 'Invalid report type selected.',
            'title.required' => 'Schedule title is required.',
            'title.min' => 'Schedule title must be at least 3 characters.',
            'title.max' => 'Schedule title cannot exceed 255 characters.',
            'description.max' => 'Description cannot exceed 1000 characters.',
            'frequency.required' => 'Schedule frequency is required.',
            'frequency.in' => 'Invalid frequency selected.',
            'day_of_week.required_if' => 'Day of week is required for weekly schedules.',
            'day_of_week.min' => 'Day of week must be between 0 (Sunday) and 6 (Saturday).',
            'day_of_week.max' => 'Day of week must be between 0 (Sunday) and 6 (Saturday).',
            'day_of_month.required_if' => 'Day of month is required for monthly schedules.',
            'day_of_month.min' => 'Day of month must be between 1 and 31.',
            'day_of_month.max' => 'Day of month must be between 1 and 31.',
            'month_of_year.required_if' => 'Month of year is required for yearly schedules.',
            'month_of_year.min' => 'Month must be between 1 (January) and 12 (December).',
            'month_of_year.max' => 'Month must be between 1 (January) and 12 (December).',
            'time.required' => 'Schedule time is required.',
            'time.date_format' => 'Time must be in HH:MM format (24-hour).',
            'timezone.required' => 'Timezone is required.',
            'timezone.timezone' => 'Invalid timezone specified.',
            'format.required' => 'Report format is required.',
            'format.in' => 'Invalid format selected. Choose from PDF, Excel, or CSV.',
            'recipients.required' => 'At least one recipient email is required.',
            'recipients.min' => 'At least one recipient email is required.',
            'recipients.max' => 'Maximum of 20 recipients allowed.',
            'recipients.*.email' => 'All recipients must be valid email addresses.',
            'filters.required' => 'Report filters are required.',
            'filters.date_range_type.required' => 'Date range type is required.',
            'filters.date_range_type.in' => 'Invalid date range type selected.',
            'filters.relative_period.required_if' => 'Relative period is required for relative date ranges.',
            'filters.relative_period.in' => 'Invalid relative period selected.',
            'filters.fixed_start_date.required_if' => 'Start date is required for fixed date ranges.',
            'filters.fixed_end_date.required_if' => 'End date is required for fixed date ranges.',
            'filters.fixed_start_date.before' => 'Start date must be before end date.',
            'filters.fixed_end_date.after' => 'End date must be after start date.',
            'filters.school_id.exists' => 'Selected school does not exist.',
            'filters.district_id.exists' => 'Selected district does not exist.',
            'filters.program_id.exists' => 'Selected program does not exist.',
            'delivery_options.email_subject.max' => 'Email subject cannot exceed 255 characters.',
            'delivery_options.email_message.max' => 'Email message cannot exceed 2000 characters.',
            'start_date.after_or_equal' => 'Schedule start date cannot be in the past.',
            'end_date.after' => 'Schedule end date must be after start date.',
            'max_executions.min' => 'Maximum executions must be at least 1.',
            'max_executions.max' => 'Maximum executions cannot exceed 1000.',
            'max_retries.required_if' => 'Maximum retries is required when retry on failure is enabled.',
            'max_retries.min' => 'Maximum retries must be at least 1.',
            'max_retries.max' => 'Maximum retries cannot exceed 5.',
            'failure_notification_emails.*.email' => 'All failure notification emails must be valid.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'report_template_id' => 'report template',
            'report_type' => 'report type',
            'title' => 'schedule title',
            'description' => 'description',
            'frequency' => 'frequency',
            'day_of_week' => 'day of week',
            'day_of_month' => 'day of month',
            'month_of_year' => 'month of year',
            'time' => 'time',
            'timezone' => 'timezone',
            'format' => 'format',
            'recipients' => 'recipients',
            'filters.date_range_type' => 'date range type',
            'filters.relative_period' => 'relative period',
            'filters.fixed_start_date' => 'start date',
            'filters.fixed_end_date' => 'end date',
            'filters.school_id' => 'school',
            'filters.district_id' => 'district',
            'filters.program_id' => 'program',
            'delivery_options.email_subject' => 'email subject',
            'delivery_options.email_message' => 'email message',
            'start_date' => 'schedule start date',
            'end_date' => 'schedule end date',
            'max_executions' => 'maximum executions',
            'max_retries' => 'maximum retries',
            'failure_notification_emails' => 'failure notification emails',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Validate day_of_month for different months
            if ($this->input('frequency') === 'monthly' && 
                $this->has('day_of_month') && 
                $this->input('day_of_month') > 28) {
                $validator->errors()->add(
                    'day_of_month',
                    'Day of month should not exceed 28 to ensure it exists in all months.'
                );
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

            // Validate fixed date range is not too large
            if ($this->input('filters.date_range_type') === 'fixed' &&
                $this->has('filters.fixed_start_date') && 
                $this->has('filters.fixed_end_date')) {
                
                $startDate = \Carbon\Carbon::parse($this->input('filters.fixed_start_date'));
                $endDate = \Carbon\Carbon::parse($this->input('filters.fixed_end_date'));
                
                if ($startDate->diffInDays($endDate) > 730) {
                    $validator->errors()->add(
                        'filters.fixed_end_date',
                        'Fixed date range cannot exceed 2 years.'
                    );
                }
            }

            // Validate schedule end date is reasonable
            if ($this->has('start_date') && $this->has('end_date')) {
                $startDate = \Carbon\Carbon::parse($this->input('start_date'));
                $endDate = \Carbon\Carbon::parse($this->input('end_date'));
                
                if ($startDate->diffInYears($endDate) > 5) {
                    $validator->errors()->add(
                        'end_date',
                        'Schedule duration cannot exceed 5 years.'
                    );
                }
            }

            // Validate recipients don't contain duplicates
            if ($this->has('recipients')) {
                $recipients = $this->input('recipients');
                if (count($recipients) !== count(array_unique($recipients))) {
                    $validator->errors()->add(
                        'recipients',
                        'Recipient emails must be unique.'
                    );
                }
            }

            // Validate failure notification emails don't contain duplicates
            if ($this->has('failure_notification_emails')) {
                $emails = $this->input('failure_notification_emails');
                if (count($emails) !== count(array_unique($emails))) {
                    $validator->errors()->add(
                        'failure_notification_emails',
                        'Failure notification emails must be unique.'
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
            $this->merge(['format' => 'pdf']);
        }

        if (!$this->has('timezone')) {
            $this->merge(['timezone' => config('app.timezone', 'UTC')]);
        }

        if (!$this->has('is_active')) {
            $this->merge(['is_active' => true]);
        }

        if (!$this->has('retry_on_failure')) {
            $this->merge(['retry_on_failure' => true]);
        }

        if ($this->input('retry_on_failure') && !$this->has('max_retries')) {
            $this->merge(['max_retries' => 3]);
        }

        // Set default delivery options
        if (!$this->has('delivery_options')) {
            $this->merge(['delivery_options' => []]);
        }

        $deliveryOptions = $this->input('delivery_options', []);
        
        if (!isset($deliveryOptions['email_subject'])) {
            $deliveryOptions['email_subject'] = 'Scheduled Report: ' . $this->input('title', 'Analytics Report');
        }

        if (!isset($deliveryOptions['attach_raw_data'])) {
            $deliveryOptions['attach_raw_data'] = false;
        }

        if (!isset($deliveryOptions['compress_files'])) {
            $deliveryOptions['compress_files'] = true;
        }

        $this->merge(['delivery_options' => $deliveryOptions]);

        // Remove empty arrays
        if ($this->has('failure_notification_emails') && empty($this->input('failure_notification_emails'))) {
            $this->offsetUnset('failure_notification_emails');
        }
    }
}
