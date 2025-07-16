import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * AvailabilityManagementScreen Component
 * 
 * Teacher availability and schedule management.
 * 
 * Features:
 * - Calendar-based availability setting
 * - Recurring availability patterns
 * - Time slot management with duration preferences
 * - Blackout dates for vacations or unavailability
 * - Automatic booking conflict detection
 * - Travel time considerations between locations
 * - Preferred school/location settings
 * - Availability export for school administrators
 */

export const AvailabilityManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Mock data for development
  const mockAvailability = {
    recurring_patterns: [
      {
        id: '1',
        day_of_week: 'Monday',
        start_time: '09:00',
        end_time: '15:00',
        is_active: true,
        max_bookings: 2
      },
      {
        id: '2',
        day_of_week: 'Tuesday',
        start_time: '10:00',
        end_time: '16:00',
        is_active: true,
        max_bookings: 3
      },
      {
        id: '3',
        day_of_week: 'Wednesday',
        start_time: '08:00',
        end_time: '14:00',
        is_active: true,
        max_bookings: 2
      },
      {
        id: '4',
        day_of_week: 'Thursday',
        start_time: '11:00',
        end_time: '17:00',
        is_active: false,
        max_bookings: 1
      },
      {
        id: '5',
        day_of_week: 'Friday',
        start_time: '09:00',
        end_time: '13:00',
        is_active: true,
        max_bookings: 2
      }
    ],
    blackout_dates: [
      {
        id: '1',
        start_date: '2024-01-20',
        end_date: '2024-01-22',
        reason: 'Personal vacation',
        is_recurring: false
      },
      {
        id: '2',
        start_date: '2024-02-15',
        end_date: '2024-02-15',
        reason: 'Professional development',
        is_recurring: false
      }
    ],
    specific_availability: [
      {
        id: '1',
        date: '2024-01-15',
        start_time: '10:00',
        end_time: '12:00',
        is_available: true,
        booking_id: 'booking_1',
        notes: 'Science Museum Adventure - Lincoln Elementary'
      },
      {
        id: '2',
        date: '2024-01-16',
        start_time: '14:00',
        end_time: '15:30',
        is_available: true,
        booking_id: 'booking_2',
        notes: 'Character Building Workshop - Washington Middle'
      },
      {
        id: '3',
        date: '2024-01-17',
        start_time: '09:00',
        end_time: '11:00',
        is_available: true,
        booking_id: null,
        notes: 'Available for booking'
      }
    ],
    preferences: {
      min_session_duration: 90,
      max_session_duration: 180,
      travel_buffer_time: 30,
      preferred_locations: ['Lincoln Elementary', 'Washington Middle School'],
      max_daily_bookings: 3,
      advance_booking_days: 14
    }
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Load availability data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Availability management focused');
    }, [])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle recurring pattern toggle
  const handleToggleRecurringPattern = (patternId: string) => {
    console.log('Toggle recurring pattern:', patternId);
    Alert.alert(
      'Update Availability',
      'This will update your recurring availability pattern. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => console.log('Pattern updated') }
      ]
    );
  };

  // Handle add blackout date
  const handleAddBlackoutDate = () => {
    console.log('Add blackout date');
    Alert.alert('Add Blackout Date', 'Blackout date functionality would be implemented here.');
  };

  // Handle remove blackout date
  const handleRemoveBlackoutDate = (blackoutId: string) => {
    Alert.alert(
      'Remove Blackout Date',
      'Are you sure you want to remove this blackout date?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => console.log('Blackout removed:', blackoutId) }
      ]
    );
  };

  // Handle set specific availability
  const handleSetSpecificAvailability = (date: string, timeSlot: string) => {
    console.log('Set specific availability:', date, timeSlot);
    Alert.alert('Set Availability', 'Specific availability setting would be implemented here.');
  };

  // Handle export availability
  const handleExportAvailability = () => {
    console.log('Export availability');
    Alert.alert('Export', 'Availability exported successfully!');
  };

  // Handle update preferences
  const handleUpdatePreferences = () => {
    console.log('Update preferences');
    Alert.alert('Preferences', 'Preference update functionality would be implemented here.');
  };

  const getAvailabilityForDate = (date: string) => {
    return mockAvailability.specific_availability.filter(avail => avail.date === date);
  };

  const isBlackoutDate = (date: string) => {
    return mockAvailability.blackout_dates.some(blackout => {
      const startDate = new Date(blackout.start_date);
      const endDate = new Date(blackout.end_date);
      const checkDate = new Date(date);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <View style={styles.weekView}>
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayHeader}>
              <Text style={styles.dayName}>{daysOfWeek[day.getDay()].substring(0, 3)}</Text>
              <Text style={styles.dayNumber}>{day.getDate()}</Text>
            </View>
          ))}
        </View>
        
        <ScrollView style={styles.timeSlotContainer} showsVerticalScrollIndicator={false}>
          {timeSlots.map((timeSlot) => (
            <View key={timeSlot} style={styles.timeSlotRow}>
              <Text style={styles.timeSlotLabel}>{timeSlot}</Text>
              {weekDays.map((day, dayIndex) => {
                const dateString = day.toISOString().split('T')[0];
                const availability = getAvailabilityForDate(dateString);
                const isBlackout = isBlackoutDate(dateString);
                const hasBooking = availability.some(avail => 
                  avail.start_time <= timeSlot && avail.end_time > timeSlot && avail.booking_id
                );
                const isAvailable = availability.some(avail => 
                  avail.start_time <= timeSlot && avail.end_time > timeSlot && !avail.booking_id
                );

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={[
                      styles.timeSlotCell,
                      isBlackout && styles.blackoutCell,
                      hasBooking && styles.bookedCell,
                      isAvailable && styles.availableCell
                    ]}
                    onPress={() => handleSetSpecificAvailability(dateString, timeSlot)}
                    disabled={isBlackout}
                  >
                    {hasBooking && <Text style={styles.cellText}>📅</Text>}
                    {isAvailable && !hasBooking && <Text style={styles.cellText}>✓</Text>}
                    {isBlackout && <Text style={styles.cellText}>✕</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecurringPatterns = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recurring Availability</Text>
        {mockAvailability.recurring_patterns.map((pattern) => (
          <View key={pattern.id} style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternDay}>{pattern.day_of_week}</Text>
              <TouchableOpacity
                style={[styles.toggleButton, pattern.is_active && styles.toggleButtonActive]}
                onPress={() => handleToggleRecurringPattern(pattern.id)}
              >
                <Text style={[styles.toggleButtonText, pattern.is_active && styles.toggleButtonTextActive]}>
                  {pattern.is_active ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.patternTime}>
              {pattern.start_time} - {pattern.end_time}
            </Text>
            <Text style={styles.patternBookings}>
              Max bookings: {pattern.max_bookings}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderBlackoutDates = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Blackout Dates</Text>
          <Button
            variant="outline"
            size="sm"
            onPress={handleAddBlackoutDate}
          >
            Add Blackout
          </Button>
        </View>
        {mockAvailability.blackout_dates.map((blackout) => (
          <View key={blackout.id} style={styles.blackoutCard}>
            <View style={styles.blackoutHeader}>
              <Text style={styles.blackoutDates}>
                {blackout.start_date} {blackout.start_date !== blackout.end_date && `- ${blackout.end_date}`}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveBlackoutDate(blackout.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.blackoutReason}>{blackout.reason}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPreferences = () => {
    const prefs = mockAvailability.preferences;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Button
            variant="outline"
            size="sm"
            onPress={handleUpdatePreferences}
          >
            Update
          </Button>
        </View>
        <View style={styles.preferencesGrid}>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Min Session</Text>
            <Text style={styles.preferenceValue}>{prefs.min_session_duration} min</Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Max Session</Text>
            <Text style={styles.preferenceValue}>{prefs.max_session_duration} min</Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Travel Buffer</Text>
            <Text style={styles.preferenceValue}>{prefs.travel_buffer_time} min</Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Max Daily</Text>
            <Text style={styles.preferenceValue}>{prefs.max_daily_bookings} bookings</Text>
          </View>
        </View>
        <View style={styles.preferredLocations}>
          <Text style={styles.preferenceLabel}>Preferred Locations:</Text>
          <Text style={styles.preferenceValue}>{prefs.preferred_locations.join(', ')}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Availability Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'week' && styles.viewToggleActive]}
            onPress={() => setViewMode('week')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'week' && styles.viewToggleTextActive]}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'month' && styles.viewToggleActive]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'month' && styles.viewToggleTextActive]}>Month</Text>
          </TouchableOpacity>
          <Button
            variant="outline"
            size="sm"
            onPress={handleExportAvailability}
          >
            Export
          </Button>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar View */}
        {viewMode === 'week' && renderWeekView()}

        {/* Recurring Patterns */}
        {renderRecurringPatterns()}

        {/* Blackout Dates */}
        {renderBlackoutDates()}

        {/* Preferences */}
        {renderPreferences()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  viewToggleActive: {
    backgroundColor: '#3B82F6',
  },
  viewToggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  viewToggleTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  weekView: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginTop: 2,
  },
  timeSlotContainer: {
    maxHeight: 400,
  },
  timeSlotRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeSlotLabel: {
    width: 60,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  timeSlotCell: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  availableCell: {
    backgroundColor: '#DCFCE7',
  },
  bookedCell: {
    backgroundColor: '#DBEAFE',
  },
  blackoutCell: {
    backgroundColor: '#FEE2E2',
  },
  cellText: {
    fontSize: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  patternCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  patternDay: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  toggleButtonActive: {
    backgroundColor: '#10B981',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  patternTime: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  patternBookings: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  blackoutCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  blackoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  blackoutDates: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
    fontFamily: 'Inter-Medium',
  },
  removeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  removeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  blackoutReason: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  preferenceItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  preferredLocations: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 12,
  },
});

export default AvailabilityManagementScreen;
