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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * BookingDetailsScreen Component
 * 
 * Detailed booking management for teachers.
 * 
 * Features:
 * - Complete booking information display
 * - School and contact details
 * - Student roster with special needs notes
 * - Program materials and preparation checklist
 * - Travel directions and parking information
 * - Session notes and feedback forms
 * - Photo/video upload for session documentation
 * - Communication with school administrators
 */

export const BookingDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'students' | 'materials' | 'notes'>('details');

  // Get booking ID from route params
  const bookingId = route.params?.bookingId || '1';

  // Mock data for development
  const mockBookingDetails = {
    id: bookingId,
    program_name: 'Science Museum Adventure',
    program_description: 'Explore the wonders of science through interactive exhibits and hands-on experiments.',
    school_name: 'Lincoln Elementary School',
    school_address: '123 Education St, Learning City, LC 12345',
    school_phone: '(555) 123-4567',
    school_contact: 'Ms. Sarah Johnson',
    contact_email: 'sarah.johnson@lincoln.edu',
    contact_phone: '(555) 123-4567',
    date: '2024-01-15',
    time: '10:00 AM - 12:00 PM',
    duration: 120,
    student_count: 25,
    grade_level: '3rd Grade',
    status: 'confirmed',
    special_requirements: 'Wheelchair accessible, quiet space for sensory breaks',
    parking_info: 'Visitor parking available in front lot. Use main entrance.',
    directions: 'Enter through main entrance, proceed to Room 101.',
    emergency_procedures: 'Fire assembly point: East parking lot. Emergency contact: Principal at (555) 123-4567',
    materials_needed: [
      'Science experiment kits (provided)',
      'Safety goggles for each student',
      'Worksheets and clipboards',
      'First aid kit',
      'Camera for documentation'
    ],
    preparation_checklist: [
      { item: 'Review student roster and special needs', completed: true },
      { item: 'Prepare experiment materials', completed: true },
      { item: 'Print worksheets and permission slips', completed: false },
      { item: 'Charge camera and backup battery', completed: false },
      { item: 'Review emergency procedures', completed: true }
    ],
    students: [
      {
        id: '1',
        name: 'Emma Johnson',
        special_needs: ['ADHD - requires frequent breaks'],
        allergies: ['Peanuts'],
        notes: 'Very engaged with hands-on activities'
      },
      {
        id: '2',
        name: 'Marcus Williams',
        special_needs: ['Wheelchair accessible'],
        allergies: [],
        notes: 'Excellent at explaining concepts to peers'
      },
      {
        id: '3',
        name: 'Sophia Davis',
        special_needs: [],
        allergies: ['Dairy'],
        notes: 'Natural leader, helps organize group activities'
      }
    ],
    session_notes: 'Previous session went very well. Students were highly engaged with the volcano experiment. Need to bring extra materials for the next session.',
    created_at: '2024-01-01',
    updated_at: '2024-01-10'
  };

  // Load booking details on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Booking details focused for booking:', bookingId);
    }, [bookingId])
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

  // Handle booking actions
  const handleConfirmBooking = () => {
    Alert.alert(
      'Confirm Booking',
      'Are you sure you want to confirm this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => console.log('Booking confirmed') }
      ]
    );
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => console.log('Booking cancelled') }
      ]
    );
  };

  const handleRescheduleBooking = () => {
    console.log('Navigate to reschedule booking');
  };

  const handleContactSchool = () => {
    console.log('Contact school:', mockBookingDetails.contact_phone);
  };

  const handleAddSessionNotes = () => {
    console.log('Navigate to add session notes');
  };

  const handleToggleChecklistItem = (index: number) => {
    console.log('Toggle checklist item:', index);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <View style={styles.tabContent}>
            {/* School Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>School Information</Text>
              <Text style={styles.schoolName}>{mockBookingDetails.school_name}</Text>
              <Text style={styles.schoolAddress}>{mockBookingDetails.school_address}</Text>
              <Text style={styles.contactInfo}>Contact: {mockBookingDetails.school_contact}</Text>
              <Text style={styles.contactInfo}>Phone: {mockBookingDetails.school_phone}</Text>
              <Text style={styles.contactInfo}>Email: {mockBookingDetails.contact_email}</Text>
            </View>

            {/* Session Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Details</Text>
              <Text style={styles.detailText}>Date: {mockBookingDetails.date}</Text>
              <Text style={styles.detailText}>Time: {mockBookingDetails.time}</Text>
              <Text style={styles.detailText}>Duration: {mockBookingDetails.duration} minutes</Text>
              <Text style={styles.detailText}>Students: {mockBookingDetails.student_count}</Text>
              <Text style={styles.detailText}>Grade: {mockBookingDetails.grade_level}</Text>
            </View>

            {/* Special Requirements */}
            {mockBookingDetails.special_requirements && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Special Requirements</Text>
                <Text style={styles.requirementsText}>{mockBookingDetails.special_requirements}</Text>
              </View>
            )}

            {/* Directions & Parking */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Directions & Parking</Text>
              <Text style={styles.detailText}>Parking: {mockBookingDetails.parking_info}</Text>
              <Text style={styles.detailText}>Directions: {mockBookingDetails.directions}</Text>
            </View>

            {/* Emergency Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Emergency Information</Text>
              <Text style={styles.emergencyText}>{mockBookingDetails.emergency_procedures}</Text>
            </View>
          </View>
        );

      case 'students':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Student Roster ({mockBookingDetails.students.length})</Text>
            {mockBookingDetails.students.map((student, index) => (
              <View key={student.id} style={styles.studentCard}>
                <Text style={styles.studentName}>{student.name}</Text>
                {student.special_needs.length > 0 && (
                  <Text style={styles.specialNeeds}>Special Needs: {student.special_needs.join(', ')}</Text>
                )}
                {student.allergies.length > 0 && (
                  <Text style={styles.allergies}>Allergies: {student.allergies.join(', ')}</Text>
                )}
                {student.notes && (
                  <Text style={styles.studentNotes}>Notes: {student.notes}</Text>
                )}
              </View>
            ))}
          </View>
        );

      case 'materials':
        return (
          <View style={styles.tabContent}>
            {/* Materials Needed */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Materials Needed</Text>
              {mockBookingDetails.materials_needed.map((material, index) => (
                <Text key={index} style={styles.materialItem}>• {material}</Text>
              ))}
            </View>

            {/* Preparation Checklist */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preparation Checklist</Text>
              {mockBookingDetails.preparation_checklist.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.checklistItem}
                  onPress={() => handleToggleChecklistItem(index)}
                >
                  <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
                    {item.completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>
                    {item.item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'notes':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Session Notes</Text>
              {mockBookingDetails.session_notes ? (
                <Text style={styles.notesText}>{mockBookingDetails.session_notes}</Text>
              ) : (
                <Text style={styles.noNotesText}>No session notes yet.</Text>
              )}
              <Button
                variant="outline"
                onPress={handleAddSessionNotes}
                style={styles.addNotesButton}
              >
                Add Session Notes
              </Button>
            </View>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mockBookingDetails.status) }]}>
          <Text style={styles.statusText}>{getStatusText(mockBookingDetails.status)}</Text>
        </View>
      </View>

      {/* Program Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.programTitle}>{mockBookingDetails.program_name}</Text>
        <Text style={styles.programDescription}>{mockBookingDetails.program_description}</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'details', label: 'Details' },
          { key: 'students', label: 'Students' },
          { key: 'materials', label: 'Materials' },
          { key: 'notes', label: 'Notes' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
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
        {renderTabContent()}
      </ScrollView>

      {/* Action Buttons */}
      {mockBookingDetails.status === 'pending' && (
        <View style={styles.actionButtons}>
          <Button
            variant="primary"
            onPress={handleConfirmBooking}
            style={styles.actionButton}
          >
            Confirm Booking
          </Button>
          <Button
            variant="danger"
            onPress={handleCancelBooking}
            style={styles.actionButton}
          >
            Cancel Booking
          </Button>
        </View>
      )}

      {mockBookingDetails.status === 'confirmed' && (
        <View style={styles.actionButtons}>
          <Button
            variant="secondary"
            onPress={handleRescheduleBooking}
            style={styles.actionButton}
          >
            Reschedule
          </Button>
          <Button
            variant="outline"
            onPress={handleContactSchool}
            style={styles.actionButton}
          >
            Contact School
          </Button>
        </View>
      )}
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
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  programTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 14,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  emergencyText: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  specialNeeds: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  allergies: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  studentNotes: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  materialItem: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checklistText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  noNotesText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  addNotesButton: {
    alignSelf: 'flex-start',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default BookingDetailsScreen;
