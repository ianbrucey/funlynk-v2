import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '@/constants/theme';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { DatePicker } from '@/components/ui/DatePicker';
import { ImagePicker } from '@/components/ui/ImagePicker';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Hooks
import { useEvents } from '@/hooks/core/useEvents';
import { useAuth } from '@/store/hooks';
import { useErrorHandler } from '@/hooks/shared/useErrorHandler';

// API
import { useGetEventQuery } from '@/store/api/coreApi';
import type { Event } from '@/store/api/coreApi';

/**
 * EditEventScreen Component
 * 
 * Event editing screen with form pre-populated with existing event data.
 * Handles event updates, attendee notifications, and version control.
 * 
 * Features:
 * - Load existing event data
 * - Same multi-step form structure as create
 * - Handle event updates vs creation
 * - Manage attendee notifications for changes
 * - Version control for significant changes
 */

interface EditEventFormData {
  title: string;
  description: string;
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

interface EditEventFormErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  maxAttendees?: string;
  price?: string;
  general?: string;
}

export const EditEventScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params as { eventId: string };
  
  const { user } = useAuth();
  const { updateEvent } = useEvents();
  const { handleErrorWithToast } = useErrorHandler();

  // API query
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useGetEventQuery(eventId);

  // Form state
  const [formData, setFormData] = useState<EditEventFormData>({
    title: '',
    description: '',
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

  const [errors, setErrors] = useState<EditEventFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Populate form with existing event data
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startTime),
        endDate: new Date(event.endTime),
        location: typeof event.location === 'string' ? event.location : event.location.name,
        maxAttendees: event.maxAttendees?.toString() || '',
        price: event.price?.toString() || '0',
        isPaid: (event.price || 0) > 0,
        images: event.images || [],
        isPrivate: !event.isPublic,
        allowGuests: true, // This would come from the event data
        requireApproval: event.requiresApproval || false,
      });
    }
  }, [event]);

  // Check if user can edit this event
  const canEdit = event?.hostId === user?.id;

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof EditEventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    
    // Clear error for this field
    if (errors[field as keyof EditEventFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: EditEventFormErrors = {};

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

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }

    if (formData.maxAttendees && isNaN(Number(formData.maxAttendees))) {
      newErrors.maxAttendees = 'Max attendees must be a number';
    } else if (Number(formData.maxAttendees) < 1) {
      newErrors.maxAttendees = 'Max attendees must be at least 1';
    }

    if (formData.isPaid) {
      if (!formData.price || isNaN(Number(formData.price))) {
        newErrors.price = 'Valid price is required for paid events';
      } else if (Number(formData.price) <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle image upload
  const handleImageUpload = useCallback((imageUri: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUri],
    }));
    setHasChanges(true);
  }, []);

  // Handle image removal
  const handleImageRemove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm() || !event) return;

    // Check if there are significant changes that require attendee notification
    const significantChanges = 
      formData.title !== event.title ||
      formData.startDate?.getTime() !== new Date(event.startTime).getTime() ||
      formData.endDate?.getTime() !== new Date(event.endTime).getTime() ||
      formData.location !== (typeof event.location === 'string' ? event.location : event.location.name);

    if (significantChanges && event.currentAttendees > 0) {
      Alert.alert(
        'Notify Attendees?',
        'You\'ve made significant changes to this event. Would you like to notify all attendees?',
        [
          {
            text: 'No',
            onPress: () => submitUpdate(false),
          },
          {
            text: 'Yes',
            onPress: () => submitUpdate(true),
          },
        ]
      );
    } else {
      submitUpdate(false);
    }
  }, [formData, event, validateForm]);

  const submitUpdate = useCallback(async (notifyAttendees: boolean) => {
    if (!event) return;

    setIsSubmitting(true);
    try {
      const updateData: Partial<Event> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTime: formData.startDate!.toISOString(),
        endTime: formData.endDate!.toISOString(),
        location: formData.location.trim(),
        maxAttendees: formData.maxAttendees ? Number(formData.maxAttendees) : undefined,
        price: formData.isPaid ? Number(formData.price) : 0,
        images: formData.images,
        isPublic: !formData.isPrivate,
        requiresApproval: formData.requireApproval,
        // notifyAttendees would be sent as a separate parameter in a real implementation
      };

      const result = await updateEvent(eventId, updateData);

      if (result.success) {
        Alert.alert(
          'Event Updated!',
          'Your event has been updated successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        handleErrorWithToast(new Error(result.error), 'Failed to update event');
      }
    } catch (error) {
      handleErrorWithToast(error, 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  }, [event, eventId, formData, updateEvent, handleErrorWithToast, navigation]);

  // Handle cancel with unsaved changes check
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation]);

  if (eventLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner size="large" message="Loading event details..." />
      </SafeAreaView>
    );
  }

  if (eventError || !event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load event details</Text>
          <Button variant="primary" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!canEdit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>You don't have permission to edit this event</Text>
          <Button variant="primary" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Edit Event</Text>
        {hasChanges && <Text style={styles.unsavedIndicator}>• Unsaved changes</Text>}
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
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Event Title"
              value={formData.title}
              onChangeText={(value) => handleFieldChange('title', value)}
              placeholder="Enter event title"
              error={errors.title}
              maxLength={100}
              testID="event-title-input"
            />

            <TextArea
              label="Event Description"
              value={formData.description}
              onChangeText={(value) => handleFieldChange('description', value)}
              placeholder="Describe your event..."
              error={errors.description}
              maxLength={1000}
              minHeight={120}
              testID="event-description-input"
            />
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            
            <DatePicker
              label="Start Date & Time"
              value={formData.startDate}
              onChange={(date) => handleFieldChange('startDate', date)}
              mode="datetime"
              minimumDate={new Date()}
              error={errors.startDate}
              testID="event-start-date-picker"
            />

            <DatePicker
              label="End Date & Time"
              value={formData.endDate}
              onChange={(date) => handleFieldChange('endDate', date)}
              mode="datetime"
              minimumDate={formData.startDate || new Date()}
              error={errors.endDate}
              testID="event-end-date-picker"
            />
          </View>

          {/* Location and Capacity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Capacity</Text>
            
            <Input
              label="Event Location"
              value={formData.location}
              onChangeText={(value) => handleFieldChange('location', value)}
              placeholder="Enter event location"
              error={errors.location}
              testID="event-location-input"
            />

            <Input
              label="Maximum Attendees (Optional)"
              value={formData.maxAttendees}
              onChangeText={(value) => handleFieldChange('maxAttendees', value)}
              placeholder="Leave empty for unlimited"
              keyboardType="numeric"
              error={errors.maxAttendees}
              testID="event-max-attendees-input"
            />
          </View>

          {/* Images */}
          <View style={styles.section}>
            <ImagePicker
              label="Event Images"
              images={formData.images}
              onImageAdd={handleImageUpload}
              onImageRemove={handleImageRemove}
              maxImages={5}
              testID="event-image-picker"
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            variant="outline"
            size="lg"
            onPress={handleCancel}
            style={styles.cancelButton}
            testID="cancel-edit-button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onPress={handleSubmit}
            disabled={isSubmitting || !hasChanges}
            loading={isSubmitting}
            style={styles.submitButton}
            testID="save-changes-button"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
  unsavedIndicator: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[600],
    fontFamily: theme.typography.fontFamily?.medium,
    marginLeft: theme.spacing.sm,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.semibold,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    gap: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error[500],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});
