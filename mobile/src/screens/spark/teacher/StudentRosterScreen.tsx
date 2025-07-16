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
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * StudentRosterScreen Component
 * 
 * Comprehensive student list across all bookings with management capabilities.
 * 
 * Features:
 * - Comprehensive student list across all bookings
 * - Student profiles with photos and notes
 * - Special needs and accommodation tracking
 * - Attendance history and patterns
 * - Parent contact information
 * - Student progress tracking
 * - Behavioral notes and observations
 * - Emergency contact information
 */

export const StudentRosterScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data for development
  const mockStudents = [
    {
      id: '1',
      first_name: 'Emma',
      last_name: 'Johnson',
      grade_level: '3rd Grade',
      school_name: 'Lincoln Elementary',
      photo_url: null,
      special_needs: ['ADHD', 'Requires frequent breaks'],
      allergies: ['Peanuts', 'Shellfish'],
      parent_name: 'Sarah Johnson',
      parent_phone: '(555) 123-4567',
      parent_email: 'sarah.johnson@email.com',
      emergency_contact: 'Mike Johnson - (555) 987-6543',
      attendance_rate: 95,
      last_session: '2024-01-10',
      behavioral_notes: 'Very engaged, works well in groups',
      progress_notes: 'Excellent participation in character building activities'
    },
    {
      id: '2',
      first_name: 'Marcus',
      last_name: 'Williams',
      grade_level: '4th Grade',
      school_name: 'Washington Middle School',
      photo_url: null,
      special_needs: ['Wheelchair accessible'],
      allergies: [],
      parent_name: 'Lisa Williams',
      parent_phone: '(555) 234-5678',
      parent_email: 'lisa.williams@email.com',
      emergency_contact: 'David Williams - (555) 876-5432',
      attendance_rate: 88,
      last_session: '2024-01-12',
      behavioral_notes: 'Quiet but participates when encouraged',
      progress_notes: 'Shows improvement in confidence and social skills'
    },
    {
      id: '3',
      first_name: 'Sophia',
      last_name: 'Davis',
      grade_level: '2nd Grade',
      school_name: 'Roosevelt Elementary',
      photo_url: null,
      special_needs: [],
      allergies: ['Dairy'],
      parent_name: 'Jennifer Davis',
      parent_phone: '(555) 345-6789',
      parent_email: 'jennifer.davis@email.com',
      emergency_contact: 'Robert Davis - (555) 765-4321',
      attendance_rate: 100,
      last_session: '2024-01-14',
      behavioral_notes: 'Natural leader, helps other students',
      progress_notes: 'Consistently demonstrates strong character values'
    },
    {
      id: '4',
      first_name: 'Aiden',
      last_name: 'Brown',
      grade_level: '5th Grade',
      school_name: 'Kennedy High School',
      photo_url: null,
      special_needs: ['Autism spectrum', 'Sensory processing'],
      allergies: ['Gluten'],
      parent_name: 'Michelle Brown',
      parent_phone: '(555) 456-7890',
      parent_email: 'michelle.brown@email.com',
      emergency_contact: 'James Brown - (555) 654-3210',
      attendance_rate: 92,
      last_session: '2024-01-11',
      behavioral_notes: 'Needs structured environment, responds well to routine',
      progress_notes: 'Making steady progress with social interaction skills'
    }
  ];

  const filterOptions = [
    { label: 'All Students', value: 'all' },
    { label: 'Special Needs', value: 'special_needs' },
    { label: 'High Attendance', value: 'high_attendance' },
    { label: 'Recent Sessions', value: 'recent' },
  ];

  // Load students data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Student roster focused');
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

  // Filter students based on search and filter
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.school_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'special_needs':
        matchesFilter = student.special_needs.length > 0;
        break;
      case 'high_attendance':
        matchesFilter = student.attendance_rate >= 95;
        break;
      case 'recent':
        // Students with sessions in the last 7 days
        const lastSession = new Date(student.last_session);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesFilter = lastSession >= weekAgo;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Handle student actions
  const handleStudentPress = (student: any) => {
    console.log('Navigate to student details:', student.id);
    // navigation.navigate('StudentDetails', { studentId: student.id });
  };

  const handleCallParent = (student: any) => {
    console.log('Call parent:', student.parent_phone);
  };

  const handleEmailParent = (student: any) => {
    console.log('Email parent:', student.parent_email);
  };

  const handleAddNote = (student: any) => {
    console.log('Add note for student:', student.id);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return '#10B981';
    if (rate >= 85) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Roster</Text>
        <Text style={styles.studentCount}>{filteredStudents.length} students</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
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

      {/* Students List */}
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
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No students found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No students match the selected filter'}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => handleStudentPress(student)}
            >
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar}>
                    {student.photo_url ? (
                      <Image source={{ uri: student.photo_url }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>
                        {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>
                      {student.first_name} {student.last_name}
                    </Text>
                    <Text style={styles.studentGrade}>{student.grade_level}</Text>
                    <Text style={styles.studentSchool}>{student.school_name}</Text>
                  </View>
                </View>
                <View style={styles.attendanceContainer}>
                  <Text style={[styles.attendanceRate, { color: getAttendanceColor(student.attendance_rate) }]}>
                    {student.attendance_rate}%
                  </Text>
                  <Text style={styles.attendanceLabel}>Attendance</Text>
                </View>
              </View>

              {/* Special Needs & Allergies */}
              {(student.special_needs.length > 0 || student.allergies.length > 0) && (
                <View style={styles.alertsContainer}>
                  {student.special_needs.length > 0 && (
                    <View style={styles.alertBadge}>
                      <Text style={styles.alertText}>Special Needs: {student.special_needs.join(', ')}</Text>
                    </View>
                  )}
                  {student.allergies.length > 0 && (
                    <View style={[styles.alertBadge, styles.allergyBadge]}>
                      <Text style={styles.alertText}>Allergies: {student.allergies.join(', ')}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Parent Contact */}
              <View style={styles.contactContainer}>
                <Text style={styles.contactTitle}>Parent: {student.parent_name}</Text>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleCallParent(student)}
                  >
                    <Text style={styles.contactButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleEmailParent(student)}
                  >
                    <Text style={styles.contactButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notes Preview */}
              {student.behavioral_notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesTitle}>Recent Notes:</Text>
                  <Text style={styles.notesText} numberOfLines={2}>
                    {student.behavioral_notes}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.studentActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddNote(student)}
                >
                  <Text style={styles.actionButtonText}>Add Note</Text>
                </TouchableOpacity>
                <Text style={styles.lastSession}>Last session: {student.last_session}</Text>
              </View>
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
  studentCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
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
  studentCard: {
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
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  studentGrade: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  studentSchool: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  attendanceContainer: {
    alignItems: 'center',
  },
  attendanceRate: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  attendanceLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  alertsContainer: {
    marginBottom: 12,
  },
  alertBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  allergyBadge: {
    backgroundColor: '#FEE2E2',
    borderLeftColor: '#EF4444',
  },
  alertText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  notesContainer: {
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  studentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  lastSession: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
});

export default StudentRosterScreen;
