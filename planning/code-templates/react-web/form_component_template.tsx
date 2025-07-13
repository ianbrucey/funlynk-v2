import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// UI Components
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
  Autocomplete,
  DatePicker,
  TimePicker,
  Switch,
  RadioGroup,
  Radio,
  Slider,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';

// Icons
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Shared Components
import { FileUpload } from '../../../components/shared/FileUpload';
import { LocationPicker } from '../../../components/shared/LocationPicker';
import { RichTextEditor } from '../../../components/shared/RichTextEditor';
import { TagSelector } from '../../../components/shared/TagSelector';

// Types
import type { {MODEL}, {MODEL}CreateData, {MODEL}UpdateData } from '../../../types/{module}';

/**
 * {FORM_NAME} Component
 * 
 * {DESCRIPTION}
 * 
 * Features:
 * - Form validation with Yup schema
 * - File upload handling
 * - Rich text editing
 * - Location selection
 * - Tag management
 * - Auto-save functionality
 * - Responsive design
 */

// ========================================
// VALIDATION SCHEMA
// ========================================

const validationSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  
  description: yup
    .string()
    .max(2000, 'Description must not exceed 2000 characters'),
  
  status: yup
    .string()
    .oneOf(['active', 'inactive', 'draft'], 'Invalid status'),
  
  // Module-specific validation
  ...('{MODULE}' === 'Core' && {
    startDate: yup
      .date()
      .required('Start date is required')
      .min(new Date(), 'Start date must be in the future'),
    
    endDate: yup
      .date()
      .required('End date is required')
      .min(yup.ref('startDate'), 'End date must be after start date'),
    
    locationAddress: yup
      .string()
      .required('Location is required'),
    
    maxCapacity: yup
      .number()
      .positive('Capacity must be positive')
      .integer('Capacity must be a whole number')
      .max(10000, 'Capacity cannot exceed 10,000'),
    
    price: yup
      .number()
      .min(0, 'Price cannot be negative')
      .max(99999.99, 'Price cannot exceed $99,999.99'),
    
    category: yup
      .string()
      .required('Category is required')
      .oneOf(['sports', 'arts', 'education', 'social', 'outdoor', 'technology']),
    
    visibility: yup
      .string()
      .required('Visibility is required')
      .oneOf(['public', 'friends', 'private']),
  }),
  
  ...('{MODULE}' === 'Spark' && {
    durationMinutes: yup
      .number()
      .required('Duration is required')
      .min(30, 'Duration must be at least 30 minutes')
      .max(480, 'Duration cannot exceed 8 hours'),
    
    cost: yup
      .number()
      .required('Cost is required')
      .min(0, 'Cost cannot be negative')
      .max(999.99, 'Cost cannot exceed $999.99'),
    
    characterTopics: yup
      .array()
      .of(yup.string())
      .min(1, 'At least one character topic is required')
      .max(5, 'Cannot select more than 5 character topics'),
    
    gradeLevels: yup
      .array()
      .of(yup.string())
      .min(1, 'At least one grade level is required'),
    
    whatToBring: yup
      .string()
      .max(1000, 'Instructions must not exceed 1000 characters'),
    
    specialInstructions: yup
      .string()
      .max(1000, 'Instructions must not exceed 1000 characters'),
  }),
});

// ========================================
// TYPES
// ========================================

export interface {FORM_NAME}Props {
  initialData?: {MODEL} | null;
  onSubmit: (data: {MODEL}CreateData | {MODEL}UpdateData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  autoSave?: boolean;
  showAdvanced?: boolean;
}

// ========================================
// COMPONENT
// ========================================

export const {FORM_NAME}: React.FC<{FORM_NAME}Props> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  autoSave = false,
  showAdvanced = false,
}) => {
  // ========================================
  // FORM SETUP
  // ========================================

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
      
      // Module-specific defaults
      ...('{MODULE}' === 'Core' && {
        startDate: initialData?.startDate || null,
        endDate: initialData?.endDate || null,
        locationAddress: initialData?.locationAddress || '',
        locationLatitude: initialData?.locationLatitude || null,
        locationLongitude: initialData?.locationLongitude || null,
        maxCapacity: initialData?.maxCapacity || '',
        price: initialData?.price || '',
        category: initialData?.category || '',
        visibility: initialData?.visibility || 'public',
        tags: initialData?.tags || [],
      }),
      
      ...('{MODULE}' === 'Spark' && {
        durationMinutes: initialData?.durationMinutes || 60,
        cost: initialData?.cost || '',
        characterTopics: initialData?.characterTopics || [],
        gradeLevels: initialData?.gradeLevels || [],
        whatToBring: initialData?.whatToBring || '',
        specialInstructions: initialData?.specialInstructions || '',
      }),
    },
    mode: 'onChange',
  });

  // ========================================
  // LOCAL STATE
  // ========================================

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(showAdvanced);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // Watch form values for auto-save
  const watchedValues = watch();

  // ========================================
  // EFFECTS
  // ========================================

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty) return;

    const timeoutId = setTimeout(async () => {
      try {
        setAutoSaveStatus('saving');
        await onSubmit(getValues());
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 2000);
      } catch (error) {
        setAutoSaveStatus('error');
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [watchedValues, autoSave, isDirty, onSubmit, getValues]);

  // ========================================
  // HANDLERS
  // ========================================

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    // Handle file upload logic here
  };

  const handleLocationSelect = (location: { address: string; lat: number; lng: number }) => {
    setValue('locationAddress', location.address);
    setValue('locationLatitude', location.lat);
    setValue('locationLongitude', location.lng);
  };

  const handleReset = () => {
    reset();
    setUploadedFiles([]);
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  const renderBasicFields = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Name"
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name?.message}
              placeholder="Enter {model} name"
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              {...field}
              label="Description"
              placeholder="Enter {model} description"
              error={!!errors.description}
              helperText={errors.description?.message}
              maxLength={2000}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.status}>
              <FormLabel>Status</FormLabel>
              <Select {...field} displayEmpty>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
              {errors.status && (
                <FormHelperText>{errors.status.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <FileUpload
          label="Images"
          accept="image/*"
          multiple
          maxFiles={5}
          maxSize={5 * 1024 * 1024} // 5MB
          onUpload={handleFileUpload}
          existingFiles={initialData?.images || []}
        />
      </Grid>
    </Grid>
  );

  const renderCoreFields = () => {
    if ('{MODULE}' !== 'Core') return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Start Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="End Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <LocationPicker
            label="Location"
            required
            onLocationSelect={handleLocationSelect}
            initialValue={initialData?.locationAddress}
            error={!!errors.locationAddress}
            helperText={errors.locationAddress?.message}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="maxCapacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Maximum Capacity"
                type="number"
                fullWidth
                error={!!errors.maxCapacity}
                helperText={errors.maxCapacity?.message}
                placeholder="Leave empty for unlimited"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Price ($)"
                type="number"
                fullWidth
                error={!!errors.price}
                helperText={errors.price?.message}
                placeholder="0.00"
                inputProps={{ step: 0.01, min: 0 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.category}>
                <FormLabel>Category</FormLabel>
                <Select {...field} displayEmpty>
                  <MenuItem value="">Select category</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="arts">Arts</MenuItem>
                  <MenuItem value="education">Education</MenuItem>
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="outdoor">Outdoor</MenuItem>
                  <MenuItem value="technology">Technology</MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="visibility"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth required error={!!errors.visibility}>
                <FormLabel>Visibility</FormLabel>
                <RadioGroup {...field} row>
                  <FormControlLabel value="public" control={<Radio />} label="Public" />
                  <FormControlLabel value="friends" control={<Radio />} label="Friends Only" />
                  <FormControlLabel value="private" control={<Radio />} label="Private" />
                </RadioGroup>
                {errors.visibility && (
                  <FormHelperText>{errors.visibility.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagSelector
                {...field}
                label="Tags"
                placeholder="Add tags to help people find your event"
                maxTags={10}
              />
            )}
          />
        </Grid>
      </Grid>
    );
  };

  const renderSparkFields = () => {
    if ('{MODULE}' !== 'Spark') return null;

    const characterTopics = [
      'Responsibility', 'Empathy', 'Integrity', 'Perseverance', 'Respect',
      'Kindness', 'Courage', 'Honesty', 'Gratitude', 'Self-Control',
      'Teamwork', 'Leadership', 'Compassion', 'Fairness', 'Patience',
      'Humility', 'Forgiveness', 'Loyalty', 'Generosity', 'Optimism',
      'Resilience', 'Trustworthiness', 'Cooperation', 'Citizenship',
      'Diligence', 'Tolerance', 'Wisdom'
    ];

    const gradeLevels = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="durationMinutes"
            control={control}
            render={({ field }) => (
              <Box>
                <FormLabel>Duration (minutes)</FormLabel>
                <Slider
                  {...field}
                  min={30}
                  max={480}
                  step={15}
                  marks={[
                    { value: 30, label: '30m' },
                    { value: 120, label: '2h' },
                    { value: 240, label: '4h' },
                    { value: 480, label: '8h' },
                  ]}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value} min`}
                />
                {errors.durationMinutes && (
                  <FormHelperText error>{errors.durationMinutes.message}</FormHelperText>
                )}
              </Box>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="cost"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cost per Student ($)"
                type="number"
                fullWidth
                required
                error={!!errors.cost}
                helperText={errors.cost?.message}
                inputProps={{ step: 0.01, min: 0 }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="characterTopics"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.characterTopics}>
                <FormLabel>Character Development Topics (select 1-5)</FormLabel>
                <Autocomplete
                  {...field}
                  multiple
                  options={characterTopics}
                  value={field.value || []}
                  onChange={(_, value) => field.onChange(value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select character topics"
                      error={!!errors.characterTopics}
                    />
                  )}
                />
                {errors.characterTopics && (
                  <FormHelperText>{errors.characterTopics.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="gradeLevels"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.gradeLevels}>
                <FormLabel>Grade Levels</FormLabel>
                <Autocomplete
                  {...field}
                  multiple
                  options={gradeLevels}
                  value={field.value || []}
                  onChange={(_, value) => field.onChange(value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={`Grade ${option}`}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select grade levels"
                      error={!!errors.gradeLevels}
                    />
                  )}
                />
                {errors.gradeLevels && (
                  <FormHelperText>{errors.gradeLevels.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="whatToBring"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="What to Bring"
                multiline
                rows={3}
                fullWidth
                error={!!errors.whatToBring}
                helperText={errors.whatToBring?.message}
                placeholder="List items students should bring"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="specialInstructions"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Special Instructions"
                multiline
                rows={3}
                fullWidth
                error={!!errors.specialInstructions}
                helperText={errors.specialInstructions?.message}
                placeholder="Any special instructions for teachers"
              />
            )}
          />
        </Grid>
      </Grid>
    );
  };

  const renderActions = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {autoSave && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {autoSaveStatus === 'saving' && <CircularProgress size={16} />}
            <Typography variant="caption" color="text.secondary">
              {autoSaveStatus === 'saved' && '✓ Auto-saved'}
              {autoSaveStatus === 'saving' && 'Saving...'}
              {autoSaveStatus === 'error' && '⚠ Save failed'}
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Cancel
        </Button>

        <Button
          variant="outlined"
          onClick={handleReset}
          disabled={loading || !isDirty}
          startIcon={<DeleteIcon />}
        >
          Reset
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit(handleFormSubmit)}
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <Box component="form" noValidate>
      {/* Basic Information */}
      <Typography variant="h6" gutterBottom>
        Basic Information
      </Typography>
      {renderBasicFields()}

      <Divider sx={{ my: 4 }} />

      {/* Module-specific fields */}
      {'{MODULE}' === 'Core' && (
        <>
          <Typography variant="h6" gutterBottom>
            Event Details
          </Typography>
          {renderCoreFields()}
        </>
      )}

      {'{MODULE}' === 'Spark' && (
        <>
          <Typography variant="h6" gutterBottom>
            Program Details
          </Typography>
          {renderSparkFields()}
        </>
      )}

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" gutterBottom>
            Advanced Options
          </Typography>
          {/* Add advanced fields here */}
        </>
      )}

      {/* Actions */}
      {renderActions()}
    </Box>
  );
};

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {FORM_NAME}: Form component name (e.g., EventForm, ProgramForm)
   - {MODEL}: Model name (e.g., Event, Program)
   - {model}: Lowercase model name (e.g., event, program)
   - {MODULE}: Module name (e.g., Core, Spark)
   - {DESCRIPTION}: Form description

2. Update validation schema based on your data model

3. Customize form fields for your specific requirements

4. Add module-specific fields and logic

5. Configure file upload and rich text editing

6. Update auto-save functionality as needed

EXAMPLE USAGE:
- EventForm for Core module events
- ProgramForm for Spark module programs
- UserForm for user management

COMMON CUSTOMIZATIONS:
- Add conditional field visibility
- Add field dependencies and validation
- Add custom input components
- Add form sections and tabs
- Add draft saving functionality
- Add form analytics tracking
*/
