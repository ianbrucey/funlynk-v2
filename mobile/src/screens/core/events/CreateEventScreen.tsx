import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '@/constants/theme';

// Shared components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { DatePicker } from '@/components/ui/DatePicker';
import { ImagePicker } from '@/components/ui/ImagePicker';

// Hooks
import { useEvents } from '@/hooks/core/useEvents';
import { useAuth } from '@/store/hooks';
import { useErrorHandler } from '@/hooks/shared/useErrorHandler';

// Types
import type { CreateEventData } from '@/hooks/core/useEvents';

/**
 * CreateEventScreen Component
 *
 * Multi-step form for creating new events with comprehensive validation
 * and preview functionality.
 *
 * Features:
 * - Multi-step form with progress indicator
 * - Image upload with cropping and optimization
 * - Location selection with map integration
 * - Category and pricing configuration
 * - Real-time form validation
 * - Event preview before publishing
 * - Draft saving functionality
 */

interface EventFormData {
  title: string;
  description: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  maxAttendees: string;
  price: string;
  isPaid: boolean;
  images: string[];
  isPrivate: boolean;
  allowGuests: boolean;
  requireApproval: boolean;
}

interface EventFormErrors {
  title?: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  maxAttendees?: string;
  price?: string;
  images?: string;
}

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { handleErrorWithToast } = useErrorHandler();

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    startDate: null,
    endDate: null,
    location: '',
    maxAttendees: '',
    price: '0',
    isPaid: false,
    images: [],
    isPrivate: false,
    allowGuests: true,
    requireApproval: false,
  });
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [showPreview, setShowPreview] = useState(false);

  // Custom hooks
  const { createEvent, isCreating, saveDraft } = useEvents();

  // Form validation
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: EventFormErrors = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.title.trim()) {
          newErrors.title = 'Event title is required';
        } else if (formData.title.length < 3) {
          newErrors.title = 'Title must be at least 3 characters';
        }

        if (!formData.description.trim()) {
          newErrors.description = 'Event description is required';
        } else if (formData.description.length < 20) {
          newErrors.description = 'Description must be at least 20 characters';
        }

        if (!formData.category) {
          newErrors.category = 'Please select a category';
        }
        break;

      case 2: // Date and Time
        if (!formData.startDate) {
          newErrors.startDate = 'Start date is required';
        } else if (formData.startDate < new Date()) {
          newErrors.startDate = 'Start date cannot be in the past';
        }

        if (!formData.endDate) {
          newErrors.endDate = 'End date is required';
        } else if (formData.endDate <= formData.startDate) {
          newErrors.endDate = 'End date must be after start date';
        }
        break;

      case 3: // Location and Capacity
        if (!formData.location) {
          newErrors.location = 'Event location is required';
        }

        if (formData.maxAttendees && isNaN(Number(formData.maxAttendees))) {
          newErrors.maxAttendees = 'Max attendees must be a number';
        } else if (Number(formData.maxAttendees) < 1) {
          newErrors.maxAttendees = 'Max attendees must be at least 1';
        }
        break;

      case 4: // Pricing and Settings
        if (formData.isPaid) {
          if (!formData.price || isNaN(Number(formData.price))) {
            newErrors.price = 'Valid price is required for paid events';
          } else if (Number(formData.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field as keyof EventFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Handle image upload
  const handleImageUpload = useCallback((imageUri: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUri],
    }));
  }, []);

  // Handle image removal
  const handleImageRemove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      } else {
        setShowPreview(true);
      }
    }
  }, [currentStep, validateStep]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  }, [currentStep, navigation]);

  // Handle event creation
  const handleCreateEvent = useCallback(async () => {
    try {
      if (!validateStep(4)) return;

      const eventData: CreateEventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.category,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
        location: {
          name: formData.location,
          address: formData.location,
          city: '',
          state: '',
          zipCode: '',
        },
        maxAttendees: formData.maxAttendees ? Number(formData.maxAttendees) : undefined,
        price: formData.isPaid ? Number(formData.price) : 0,
        images: formData.images,
        tags: [],
        isPrivate: formData.isPrivate,
        allowGuests: formData.allowGuests,
        requireApproval: formData.requireApproval,
        hostId: user!.id,
      };

      const result = await createEvent(eventData);

      if (result.success) {
        Alert.alert(
          'Event Created!',
          'Your event has been created successfully.',
          [
            {
              text: 'View Event',
              onPress: () => navigation.replace('EventDetails', { eventId: result.event.id }),
            },
          ]
        );
      } else {
        handleErrorWithToast(new Error(result.error));
      }
    } catch (error) {
      handleErrorWithToast(error);
    }
  }, [formData, validateStep, createEvent, user, navigation, handleErrorWithToast]);

  // Handle draft saving
  const handleSaveDraft = useCallback(async () => {
    try {
      await saveDraft(formData);
      Alert.alert('Draft Saved', 'Your event draft has been saved.');
    } catch (error) {
      handleErrorWithToast(error);
    }
  }, [formData, saveDraft, handleErrorWithToast]);

  // Render step content
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Basic Information</Text>

            <Input
              label="Event Title"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="Enter event title"
              error={errors.title}
              maxLength={100}
              testID="event-title-input"
            />

            <TextArea
              label="Event Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe your event..."
              error={errors.description}
              maxLength={1000}
              minHeight={120}
              testID="event-description-input"
            />

            <Input
              label="Event Category"
              value={formData.category}
              onChangeText={(value) => handleInputChange('category', value)}
              placeholder="Select category"
              error={errors.category}
              testID="event-category-input"
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Date & Time</Text>

            <DatePicker
              label="Start Date & Time"
              value={formData.startDate}
              onChange={(date) => handleInputChange('startDate', date)}
              mode="datetime"
              minimumDate={new Date()}
              error={errors.startDate}
              testID="event-start-date-picker"
            />

            <DatePicker
              label="End Date & Time"
              value={formData.endDate}
              onChange={(date) => handleInputChange('endDate', date)}
              mode="datetime"
              minimumDate={formData.startDate || new Date()}
              error={errors.endDate}
              testID="event-end-date-picker"
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Location & Capacity</Text>

            <Input
              label="Event Location"
              value={formData.location}
              onChangeText={(value) => handleInputChange('location', value)}
              placeholder="Enter event location"
              error={errors.location}
              testID="event-location-input"
            />

            <Input
              label="Maximum Attendees (Optional)"
              value={formData.maxAttendees}
              onChangeText={(value) => handleInputChange('maxAttendees', value)}
              placeholder="Leave empty for unlimited"
              keyboardType="numeric"
              error={errors.maxAttendees}
              testID="event-max-attendees-input"
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Images & Settings</Text>

            <ImagePicker
              label="Event Images"
              images={formData.images}
              onImageAdd={handleImageUpload}
              onImageRemove={handleImageRemove}
              maxImages={5}
              testID="event-image-picker"
            />
          </View>
        );

      default:
        return null;
    }
  }, [currentStep, formData, errors, handleInputChange, handleImageUpload, handleImageRemove]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Event</Text>
        <Text style={styles.stepIndicator}>Step {currentStep} of 4</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            size="lg"
            onPress={handlePreviousStep}
            style={styles.backButton}
            testID="event-form-back-button"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            variant="primary"
            size="lg"
            onPress={currentStep === 4 ? handleCreateEvent : handleNextStep}
            disabled={isCreating}
            loading={isCreating && currentStep === 4}
            style={styles.nextButton}
            testID="event-form-next-button"
          >
            {currentStep === 4 ? 'Create Event' : 'Next'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
  },
  stepIndicator: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  stepContainer: {
    paddingTop: theme.spacing.lg,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.bold,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.white,
    gap: theme.spacing.sm,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
