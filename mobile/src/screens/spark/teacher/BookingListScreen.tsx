import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * BookingListScreen Component
 * 
 * List of all teacher bookings with management capabilities.
 * 
 * Features:
 * - List of all bookings with status filters
 * - Calendar view toggle for schedule visualization
 * - Booking details preview cards
 * - Quick actions (confirm, reschedule, cancel)
 * - Search bookings by school or date
 * - Export booking data functionality
 */

export const BookingListScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Mock data for development
  const mockBookings = [
    {
      id: '1',
      program_name: 'Science Museum Adventure',
      school_name: 'Lincoln Elementary',
      school_contact: 'Ms. Johnson',
      date: '2024-01-15',
      time: '10:00 AM - 12:00 PM',
      student_count: 25,
      status: 'confirmed',
      grade_level: '3rd Grade',
      special_requirements: 'Wheelchair accessible',
      created_at: '2024-01-01'
    },
    {
      id: '2',
      program_name: 'Character Building Workshop',
      school_name: 'Washington Middle School',
      school_contact: 'Mr. Smith',
      date: '2024-01-16',
      time: '2:00 PM - 3:30 PM',
      student_count: 30,
      status: 'pending',
      grade_level: '6th Grade',
      special_requirements: null,
      created_at: '2024-01-05'
    },
    {
      id: '3',
      program_name: 'Art & Creativity Session',
      school_name: 'Roosevelt Elementary',
      school_contact: 'Mrs. Davis',
      date: '2024-01-18',
      time: '9:00 AM - 10:45 AM',
      student_count: 20,
      status: 'completed',
      grade_level: '2nd Grade',
      special_requirements: 'Art supplies needed',
      created_at: '2024-01-08'
    },
    {
      id: '4',
      program_name: 'Science Museum Adventure',
      school_name: 'Kennedy High School',
      school_contact: 'Dr. Wilson',
      date: '2024-01-20',
      time: '1:00 PM - 3:00 PM',
      student_count: 35,
      status: 'cancelled',
      grade_level: '9th Grade',
      special_requirements: null,
      created_at: '2024-01-10'
    }
  ];

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  // Load bookings data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Booking list focused');
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

  // Filter bookings based on search and filter
  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.school_contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || booking.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  // Handle booking actions
  const handleBookingPress = (booking: any) => {
    console.log('Navigate to booking details:', booking.id);
    // navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const handleConfirmBooking = (booking: any) => {
    console.log('Confirm booking:', booking.id);
  };

  const handleRescheduleBooking = (booking: any) => {
    console.log('Reschedule booking:', booking.id);
  };

  const handleCancelBooking = (booking: any) => {
    console.log('Cancel booking:', booking.id);
  };

  const handleExportData = () => {
    console.log('Export booking data');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#3B82F6';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const renderBookingActions = (booking: any) => {
    switch (booking.status) {
      case 'pending':
        return (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleConfirmBooking(booking)}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancelBooking(booking)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      case 'confirmed':
        return (
          <View style={styles.bookingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={() => handleRescheduleBooking(booking)}
            >
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'list' && styles.viewToggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'calendar' && styles.viewToggleActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[styles.viewToggleText, viewMode === 'calendar' && styles.viewToggleTextActive]}>Calendar</Text>
          </TouchableOpacity>
          <Button
            variant="outline"
            size="sm"
            onPress={handleExportData}
          >
            Export
          </Button>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterTab,
              selectedFilter === filter.value && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.value && styles.filterTabTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
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
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No bookings found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No bookings match the selected filter'}
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => handleBookingPress(booking)}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingTitleContainer}>
                  <Text style={styles.bookingProgram}>{booking.program_name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
                  </View>
                </View>
                <Text style={styles.bookingDate}>{booking.date}</Text>
              </View>
              
              <Text style={styles.bookingSchool}>{booking.school_name}</Text>
              <Text style={styles.bookingContact}>Contact: {booking.school_contact}</Text>
              
              <View style={styles.bookingDetails}>
                <Text style={styles.detailText}>Time: {booking.time}</Text>
                <Text style={styles.detailText}>Students: {booking.student_count}</Text>
                <Text style={styles.detailText}>Grade: {booking.grade_level}</Text>
              </View>
              
              {booking.special_requirements && (
                <Text style={styles.specialRequirements}>
                  Special Requirements: {booking.special_requirements}
                </Text>
              )}
              
              {renderBookingActions(booking)}
            </TouchableOpacity>
          ))
        )}
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  bookingProgram: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  bookingDate: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  bookingSchool: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  bookingContact: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  specialRequirements: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  rescheduleButton: {
    backgroundColor: '#F59E0B',
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
});

export default BookingListScreen;
