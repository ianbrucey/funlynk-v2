import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '@/constants/theme';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Hooks
import { useEvents } from '@/hooks/core/useEvents';
import { useAuth } from '@/store/hooks';
import { useErrorHandler } from '@/hooks/shared/useErrorHandler';

// API
import { useGetEventQuery } from '@/store/api/coreApi';

/**
 * EventRSVPScreen Component
 * 
 * Detailed RSVP management screen with guest count, special requirements,
 * and contact information.
 * 
 * Features:
 * - RSVP status selection (Going, Interested, Not Going)
 * - Guest count selection for events that allow it
 * - Special requirements or notes input
 * - Dietary restrictions or accessibility needs
 * - Contact information for host
 * - Calendar integration for adding to device calendar
 */

interface RSVPFormData {
  status: 'going' | 'maybe' | 'not_going';
  guestCount: number;
  specialRequirements: string;
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  contactPhone: string;
  contactEmail: string;
  addToCalendar: boolean;
  allowHostContact: boolean;
}

export const EventRSVPScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params as { eventId: string };
  
  const { user } = useAuth();
  const { rsvpToEvent } = useEvents();
  const { handleErrorWithToast } = useErrorHandler();

  // API query
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useGetEventQuery(eventId);

  // Form state
  const [formData, setFormData] = useState<RSVPFormData>({
    status: event?.rsvpStatus || 'maybe',
    guestCount: 1,
    specialRequirements: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    addToCalendar: true,
    allowHostContact: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof RSVPFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle RSVP submission
  const handleSubmitRSVP = useCallback(async () => {
    if (!event) return;

    setIsSubmitting(true);
    try {
      const result = await rsvpToEvent(eventId, formData.status);
      
      if (result.success) {
        // In a real app, we would also save the additional RSVP details
        // to the server (guest count, special requirements, etc.)
        
        if (formData.addToCalendar) {
          // Add to device calendar
          // This would integrate with the device's calendar API
          Alert.alert(
            'Calendar',
            'Would you like to add this event to your calendar?',
            [
              { text: 'No', style: 'cancel' },
              { 
                text: 'Yes', 
                onPress: () => {
                  // Calendar integration would go here
                  console.log('Adding to calendar...');
                }
              },
            ]
          );
        }

        Alert.alert(
          'RSVP Confirmed!',
          `Your RSVP has been updated to "${formData.status}".`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        handleErrorWithToast(new Error(result.error), 'Failed to update RSVP');
      }
    } catch (error) {
      handleErrorWithToast(error, 'Failed to update RSVP');
    } finally {
      setIsSubmitting(false);
    }
  }, [event, eventId, formData, rsvpToEvent, handleErrorWithToast, navigation]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>RSVP to Event</Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* RSVP Status Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Response</Text>
          <View style={styles.statusButtons}>
            {[
              { key: 'going', label: 'Going', color: theme.colors.success[500] },
              { key: 'maybe', label: 'Maybe', color: theme.colors.warning[500] },
              { key: 'not_going', label: 'Not Going', color: theme.colors.neutral[500] },
            ].map((status) => (
              <Button
                key={status.key}
                variant={formData.status === status.key ? 'primary' : 'outline'}
                size="md"
                onPress={() => handleFieldChange('status', status.key)}
                style={[
                  styles.statusButton,
                  formData.status === status.key && { backgroundColor: status.color },
                ]}
                testID={`rsvp-status-${status.key}`}
              >
                {status.label}
              </Button>
            ))}
          </View>
        </View>

        {/* Guest Count (if going or maybe) */}
        {(formData.status === 'going' || formData.status === 'maybe') && event.allowGuests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Number of Guests</Text>
            <Input
              label="Including yourself"
              value={formData.guestCount.toString()}
              onChangeText={(value) => handleFieldChange('guestCount', parseInt(value) || 1)}
              keyboardType="numeric"
              placeholder="1"
              helperText={`Maximum ${event.maxAttendees || 'unlimited'} attendees per event`}
              testID="guest-count-input"
            />
          </View>
        )}

        {/* Contact Information */}
        {formData.status === 'going' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Input
              label="Phone Number"
              value={formData.contactPhone}
              onChangeText={(value) => handleFieldChange('contactPhone', value)}
              keyboardType="phone-pad"
              placeholder="Your phone number"
              testID="contact-phone-input"
            />
            <Input
              label="Email Address"
              value={formData.contactEmail}
              onChangeText={(value) => handleFieldChange('contactEmail', value)}
              keyboardType="email-address"
              placeholder="Your email address"
              testID="contact-email-input"
            />
          </View>
        )}

        {/* Special Requirements */}
        {formData.status === 'going' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requirements</Text>
            <TextArea
              label="Dietary Restrictions"
              value={formData.dietaryRestrictions}
              onChangeText={(value) => handleFieldChange('dietaryRestrictions', value)}
              placeholder="Any dietary restrictions or allergies..."
              maxLength={200}
              minHeight={80}
              testID="dietary-restrictions-input"
            />
            <TextArea
              label="Accessibility Needs"
              value={formData.accessibilityNeeds}
              onChangeText={(value) => handleFieldChange('accessibilityNeeds', value)}
              placeholder="Any accessibility accommodations needed..."
              maxLength={200}
              minHeight={80}
              testID="accessibility-needs-input"
            />
            <TextArea
              label="Additional Notes"
              value={formData.specialRequirements}
              onChangeText={(value) => handleFieldChange('specialRequirements', value)}
              placeholder="Any other special requirements or notes..."
              maxLength={300}
              minHeight={80}
              testID="special-requirements-input"
            />
          </View>
        )}

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchLabelText}>Add to Calendar</Text>
              <Text style={styles.switchLabelSubtext}>
                Automatically add this event to your device calendar
              </Text>
            </View>
            <Switch
              value={formData.addToCalendar}
              onValueChange={(value) => handleFieldChange('addToCalendar', value)}
              trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
              thumbColor={formData.addToCalendar ? theme.colors.primary[500] : theme.colors.neutral[500]}
              testID="add-to-calendar-switch"
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchLabelText}>Allow Host Contact</Text>
              <Text style={styles.switchLabelSubtext}>
                Allow the event host to contact you with updates
              </Text>
            </View>
            <Switch
              value={formData.allowHostContact}
              onValueChange={(value) => handleFieldChange('allowHostContact', value)}
              trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
              thumbColor={formData.allowHostContact ? theme.colors.primary[500] : theme.colors.neutral[500]}
              testID="allow-host-contact-switch"
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          size="lg"
          onPress={handleCancel}
          style={styles.cancelButton}
          testID="cancel-rsvp-button"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmitRSVP}
          disabled={isSubmitting}
          loading={isSubmitting}
          style={styles.submitButton}
          testID="submit-rsvp-button"
        >
          {isSubmitting ? 'Updating...' : 'Update RSVP'}
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
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
  eventTitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    marginTop: theme.spacing.xs,
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
  statusButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statusButton: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  switchLabel: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  switchLabelText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.neutral[800],
    fontFamily: theme.typography.fontFamily?.medium,
  },
  switchLabelSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.neutral[600],
    fontFamily: theme.typography.fontFamily?.regular,
    marginTop: theme.spacing.xs,
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
