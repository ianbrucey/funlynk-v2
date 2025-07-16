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
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * BookingManagementScreen Component
 * 
 * Comprehensive booking oversight and resource management.
 * 
 * Features:
 * - Calendar view of all school bookings
 * - Booking approval and coordination workflow
 * - Resource allocation and room scheduling
 * - Parent communication and updates
 * - Cancellation and rescheduling management
 * - Payment tracking and invoicing
 * - Attendance verification and reporting
 * - Special accommodations and requirements
 */

export const BookingManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Mock data for development
  const filterOptions = [
    { label: 'All Bookings', value: 'all', count: 24 },
    { label: 'Today', value: 'today', count: 4 },
    { label: 'This Week', value: 'week', count: 12 },
    { label: 'Pending Approval', value: 'pending', count: 3 },
    { label: 'Confirmed', value: 'confirmed', count: 18 },
    { label: 'Cancelled', value: 'cancelled', count: 3 },
  ];

  const mockBookings = [
    {
      id: '1',
      program_title: 'Science Museum Adventure',
      teacher_name: 'Ms. Sarah Johnson',
      teacher_id: 'teacher_1',
      date: '2024-01-16',
      start_time: '10:00 AM',
      end_time: '12:00 PM',
      duration: 120,
      status: 'confirmed',
      students_enrolled: 25,
      max_capacity: 30,
      grade_levels: ['3rd', '4th', '5th'],
      location: 'Science Lab',
      room_id: 'room_101',
      booking_date: '2024-01-10',
      parent_contact: 'Mrs. Davis - 3rd Grade',
      special_requirements: 'Wheelchair accessible venue required',
      materials_needed: ['Safety goggles', 'Lab notebooks', 'Experiment kits'],
      cost_per_student: 25.00,
      total_cost: 625.00,
      payment_status: 'paid',
      attendance_confirmed: false,
      notes: 'Popular program with high parent satisfaction. Ensure all safety equipment is ready.',
      emergency_contacts: [
        { name: 'School Nurse', phone: '(555) 123-4567' },
        { name: 'Principal Office', phone: '(555) 987-6543' }
      ]
    },
    {
      id: '2',
      program_title: 'Character Building Workshop',
      teacher_name: 'Mr. David Wilson',
      teacher_id: 'teacher_2',
      date: '2024-01-16',
      start_time: '2:00 PM',
      end_time: '3:30 PM',
      duration: 90,
      status: 'pending',
      students_enrolled: 20,
      max_capacity: 25,
      grade_levels: ['K', '1st', '2nd'],
      location: 'Classroom A',
      room_id: 'room_201',
      booking_date: '2024-01-12',
      parent_contact: 'Mr. Thompson - Kindergarten',
      special_requirements: 'Quiet space for reflection activities',
      materials_needed: ['Activity worksheets', 'Role-play props', 'Storybooks'],
      cost_per_student: 20.00,
      total_cost: 400.00,
      payment_status: 'pending',
      attendance_confirmed: false,
      notes: 'New program requiring approval. Teacher has excellent background in child psychology.',
      emergency_contacts: [
        { name: 'School Counselor', phone: '(555) 234-5678' },
        { name: 'Main Office', phone: '(555) 876-5432' }
      ]
    },
    {
      id: '3',
      program_title: 'Art & Creativity Session',
      teacher_name: 'Ms. Emily Chen',
      teacher_id: 'teacher_3',
      date: '2024-01-17',
      start_time: '9:00 AM',
      end_time: '10:45 AM',
      duration: 105,
      status: 'confirmed',
      students_enrolled: 18,
      max_capacity: 20,
      grade_levels: ['2nd', '3rd', '4th'],
      location: 'Art Room',
      room_id: 'room_301',
      booking_date: '2024-01-08',
      parent_contact: 'Ms. Rodriguez - 2nd Grade',
      special_requirements: 'Well-ventilated room for paint activities',
      materials_needed: ['Art supplies', 'Canvases', 'Protective clothing'],
      cost_per_student: 30.00,
      total_cost: 540.00,
      payment_status: 'paid',
      attendance_confirmed: true,
      notes: 'Recurring program with high enrollment. Ensure adequate ventilation and cleanup supplies.',
      emergency_contacts: [
        { name: 'Art Department Head', phone: '(555) 345-6789' },
        { name: 'Facilities Manager', phone: '(555) 765-4321' }
      ]
    },
    {
      id: '4',
      program_title: 'Nature Discovery Walk',
      teacher_name: 'Mr. James Rodriguez',
      teacher_id: 'teacher_4',
      date: '2024-01-18',
      start_time: '1:00 PM',
      end_time: '3:30 PM',
      duration: 150,
      status: 'confirmed',
      students_enrolled: 15,
      max_capacity: 15,
      grade_levels: ['1st', '2nd', '3rd'],
      location: 'School Garden & Nature Trail',
      room_id: 'outdoor_area',
      booking_date: '2024-01-05',
      parent_contact: 'Mrs. Kim - 1st Grade',
      special_requirements: 'Weather-dependent scheduling, backup indoor location needed',
      materials_needed: ['Field guides', 'Magnifying glasses', 'Collection bags'],
      cost_per_student: 15.00,
      total_cost: 225.00,
      payment_status: 'paid',
      attendance_confirmed: true,
      notes: 'Outdoor program - monitor weather conditions. Have indoor backup activity ready.',
      emergency_contacts: [
        { name: 'Groundskeeper', phone: '(555) 456-7890' },
        { name: 'Security Office', phone: '(555) 654-3210' }
      ]
    },
    {
      id: '5',
      program_title: 'Music & Movement Workshop',
      teacher_name: 'Ms. Lisa Park',
      teacher_id: 'teacher_5',
      date: '2024-01-19',
      start_time: '11:00 AM',
      end_time: '12:00 PM',
      duration: 60,
      status: 'cancelled',
      students_enrolled: 0,
      max_capacity: 25,
      grade_levels: ['K', '1st'],
      location: 'Music Room',
      room_id: 'room_401',
      booking_date: '2024-01-14',
      parent_contact: 'Mr. Johnson - Kindergarten',
      special_requirements: 'Sound-proofed room with piano access',
      materials_needed: ['Musical instruments', 'Movement props', 'Audio equipment'],
      cost_per_student: 18.00,
      total_cost: 0.00,
      payment_status: 'refunded',
      attendance_confirmed: false,
      notes: 'Cancelled due to teacher illness. Parents notified and refunds processed.',
      emergency_contacts: []
    }
  ];

  // Load bookings on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Booking management focused');
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

  // Filter bookings
  const filteredBookings = mockBookings.filter(booking => {
    const matchesSearch = booking.program_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    const today = new Date().toISOString().split('T')[0];
    const bookingDate = new Date(booking.date);
    const todayDate = new Date(today);
    const weekFromToday = new Date(todayDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    switch (selectedFilter) {
      case 'today':
        matchesFilter = booking.date === today;
        break;
      case 'week':
        matchesFilter = bookingDate >= todayDate && bookingDate <= weekFromToday;
        break;
      case 'pending':
        matchesFilter = booking.status === 'pending';
        break;
      case 'confirmed':
        matchesFilter = booking.status === 'confirmed';
        break;
      case 'cancelled':
        matchesFilter = booking.status === 'cancelled';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Handle booking actions
  const handleBookingPress = (booking: any) => {
    console.log('Navigate to booking details:', booking.id);
    // navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const handleApproveBooking = (booking: any) => {
    Alert.alert(
      'Approve Booking',
      `Are you sure you want to approve "${booking.program_title}" on ${booking.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            console.log('Approve booking:', booking.id);
            Alert.alert('Success', 'Booking approved successfully! Parents will be notified.');
          }
        }
      ]
    );
  };

  const handleCancelBooking = (booking: any) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel "${booking.program_title}" on ${booking.date}?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Cancel Booking', 
          style: 'destructive',
          onPress: () => {
            console.log('Cancel booking:', booking.id);
            Alert.alert('Booking Cancelled', 'Booking has been cancelled. Parents will be notified and refunds processed.');
          }
        }
      ]
    );
  };

  const handleRescheduleBooking = (booking: any) => {
    Alert.alert('Reschedule Booking', `Rescheduling for "${booking.program_title}" would be implemented here.`);
  };

  const handleContactParent = (booking: any) => {
    Alert.alert(
      'Contact Parent',
      `Contact ${booking.parent_contact} about "${booking.program_title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call parent contact') },
        { text: 'Email', onPress: () => console.log('Email parent contact') }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
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
        return 'Pending Approval';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'refunded':
        return '#6B7280';
      default:
        return '#EF4444';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateString === tomorrow.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings by program, teacher, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
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
            <View style={[
              styles.filterTabBadge,
              selectedFilter === filter.value && styles.filterTabBadgeActive
            ]}>
              <Text style={[
                styles.filterTabBadgeText,
                selectedFilter === filter.value && styles.filterTabBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
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
              style={[
                styles.bookingCard,
                isToday(booking.date) && styles.todayBookingCard
              ]}
              onPress={() => handleBookingPress(booking)}
            >
              {isToday(booking.date) && (
                <View style={styles.todayBanner}>
                  <Text style={styles.todayBannerText}>TODAY</Text>
                </View>
              )}
              
              {isTomorrow(booking.date) && (
                <View style={styles.tomorrowBanner}>
                  <Text style={styles.tomorrowBannerText}>TOMORROW</Text>
                </View>
              )}

              <View style={styles.bookingHeader}>
                <View style={styles.bookingTitleContainer}>
                  <Text style={styles.bookingTitle}>{booking.program_title}</Text>
                  <Text style={styles.bookingTeacher}>with {booking.teacher_name}</Text>
                </View>
                <View style={styles.bookingBadges}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>⏰</Text>
                  <Text style={styles.detailText}>{booking.start_time} - {booking.end_time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{booking.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>👥</Text>
                  <Text style={styles.detailText}>{booking.students_enrolled}/{booking.max_capacity} students</Text>
                </View>
              </View>

              <View style={styles.bookingMeta}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Contact:</Text>
                  <TouchableOpacity onPress={() => handleContactParent(booking)}>
                    <Text style={styles.contactText}>{booking.parent_contact}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Payment:</Text>
                  <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(booking.payment_status) }]}>
                    <Text style={styles.paymentText}>{booking.payment_status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Total Cost:</Text>
                  <Text style={styles.costText}>${booking.total_cost.toFixed(2)}</Text>
                </View>
              </View>

              {booking.special_requirements && (
                <View style={styles.requirementsSection}>
                  <Text style={styles.requirementsLabel}>Special Requirements:</Text>
                  <Text style={styles.requirementsText}>{booking.special_requirements}</Text>
                </View>
              )}

              <View style={styles.bookingActions}>
                {booking.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => handleApproveBooking(booking)}
                      style={styles.actionButton}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onPress={() => handleCancelBooking(booking)}
                      style={styles.actionButton}
                    >
                      Reject
                    </Button>
                  </>
                )}
                
                {booking.status === 'confirmed' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleRescheduleBooking(booking)}
                      style={styles.actionButton}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onPress={() => handleCancelBooking(booking)}
                      style={styles.actionButton}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleContactParent(booking)}
                  style={styles.actionButton}
                >
                  Contact Parent
                </Button>
              </View>

              {booking.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{booking.notes}</Text>
                </View>
              )}
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
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  headerSpacer: {
    width: 50,
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
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    marginRight: 6,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  filterTabBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterTabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterTabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Inter-SemiBold',
  },
  filterTabBadgeTextActive: {
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
    position: 'relative',
  },
  todayBookingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  todayBanner: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  todayBannerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  tomorrowBanner: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  tomorrowBannerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  bookingTeacher: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  bookingBadges: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  bookingMeta: {
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  contactText: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  paymentText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  costText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  requirementsSection: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  requirementsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
  },
  notesSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default BookingManagementScreen;
