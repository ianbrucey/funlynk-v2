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
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * TeacherManagementScreen Component
 * 
 * Comprehensive teacher verification and coordination system.
 * 
 * Features:
 * - Teacher verification and background check tracking
 * - Performance monitoring and evaluation
 * - Certification and training management
 * - Schedule coordination and availability
 * - Communication and feedback systems
 * - Compliance and safety oversight
 * - Professional development tracking
 * - Emergency contact management
 */

export const TeacherManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data for development
  const filterOptions = [
    { label: 'All Teachers', value: 'all', count: 12 },
    { label: 'Active', value: 'active', count: 8 },
    { label: 'Pending Verification', value: 'pending', count: 2 },
    { label: 'Suspended', value: 'suspended', count: 1 },
    { label: 'Training Required', value: 'training', count: 3 },
  ];

  const mockTeachers = [
    {
      id: '1',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      photo_url: null,
      status: 'active',
      specialization: 'Science Education',
      experience_years: 5,
      certifications: ['Elementary Education', 'Science Specialist', 'First Aid/CPR'],
      background_check_status: 'approved',
      background_check_date: '2023-08-15',
      training_status: 'current',
      last_training_date: '2023-12-01',
      performance_rating: 4.8,
      programs_taught: 12,
      total_sessions: 48,
      student_feedback_score: 4.9,
      completion_rate: 96.2,
      safety_incidents: 0,
      joined_date: '2023-08-01',
      last_active: '2024-01-15',
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: false
      },
      emergency_contact: {
        name: 'Michael Johnson',
        relationship: 'Spouse',
        phone: '(555) 987-6543'
      },
      notes: 'Excellent teacher with strong science background. Very popular with students and parents.'
    },
    {
      id: '2',
      first_name: 'David',
      last_name: 'Wilson',
      email: 'david.wilson@email.com',
      phone: '(555) 234-5678',
      photo_url: null,
      status: 'active',
      specialization: 'Character Development',
      experience_years: 8,
      certifications: ['Social Work', 'Child Psychology', 'Conflict Resolution'],
      background_check_status: 'approved',
      background_check_date: '2023-09-10',
      training_status: 'current',
      last_training_date: '2023-11-15',
      performance_rating: 4.7,
      programs_taught: 8,
      total_sessions: 32,
      student_feedback_score: 4.8,
      completion_rate: 94.5,
      safety_incidents: 0,
      joined_date: '2023-09-01',
      last_active: '2024-01-14',
      availability: {
        monday: true,
        tuesday: true,
        wednesday: false,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: false
      },
      emergency_contact: {
        name: 'Lisa Wilson',
        relationship: 'Spouse',
        phone: '(555) 876-5432'
      },
      notes: 'Specializes in character building programs. Great with younger students.'
    },
    {
      id: '3',
      first_name: 'Emily',
      last_name: 'Chen',
      email: 'emily.chen@email.com',
      phone: '(555) 345-6789',
      photo_url: null,
      status: 'pending',
      specialization: 'Visual Arts',
      experience_years: 6,
      certifications: ['Art Education', 'Studio Arts'],
      background_check_status: 'pending',
      background_check_date: null,
      training_status: 'required',
      last_training_date: null,
      performance_rating: null,
      programs_taught: 0,
      total_sessions: 0,
      student_feedback_score: null,
      completion_rate: null,
      safety_incidents: 0,
      joined_date: '2024-01-10',
      last_active: '2024-01-15',
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: false,
        saturday: false,
        sunday: false
      },
      emergency_contact: {
        name: 'Robert Chen',
        relationship: 'Father',
        phone: '(555) 765-4321'
      },
      notes: 'New teacher application. Background check in progress.'
    },
    {
      id: '4',
      first_name: 'James',
      last_name: 'Rodriguez',
      email: 'james.rodriguez@email.com',
      phone: '(555) 456-7890',
      photo_url: null,
      status: 'training',
      specialization: 'Environmental Education',
      experience_years: 4,
      certifications: ['Environmental Science', 'Outdoor Education'],
      background_check_status: 'approved',
      background_check_date: '2023-10-20',
      training_status: 'required',
      last_training_date: '2023-06-15',
      performance_rating: 4.6,
      programs_taught: 6,
      total_sessions: 24,
      student_feedback_score: 4.7,
      completion_rate: 98.1,
      safety_incidents: 0,
      joined_date: '2023-10-01',
      last_active: '2024-01-12',
      availability: {
        monday: false,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      },
      emergency_contact: {
        name: 'Maria Rodriguez',
        relationship: 'Spouse',
        phone: '(555) 654-3210'
      },
      notes: 'Annual safety training due. Excellent outdoor program leader.'
    }
  ];

  // Load teachers on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Teacher management focused');
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

  // Filter teachers
  const filteredTeachers = mockTeachers.filter(teacher => {
    const matchesSearch = teacher.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'active':
        matchesFilter = teacher.status === 'active';
        break;
      case 'pending':
        matchesFilter = teacher.status === 'pending';
        break;
      case 'suspended':
        matchesFilter = teacher.status === 'suspended';
        break;
      case 'training':
        matchesFilter = teacher.training_status === 'required';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Handle teacher actions
  const handleTeacherPress = (teacher: any) => {
    console.log('Navigate to teacher details:', teacher.id);
    // navigation.navigate('TeacherDetails', { teacherId: teacher.id });
  };

  const handleApproveTeacher = (teacher: any) => {
    Alert.alert(
      'Approve Teacher',
      `Are you sure you want to approve ${teacher.first_name} ${teacher.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: () => {
            console.log('Approve teacher:', teacher.id);
            Alert.alert('Success', 'Teacher approved successfully!');
          }
        }
      ]
    );
  };

  const handleSuspendTeacher = (teacher: any) => {
    Alert.alert(
      'Suspend Teacher',
      `Are you sure you want to suspend ${teacher.first_name} ${teacher.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Suspend', 
          style: 'destructive',
          onPress: () => {
            console.log('Suspend teacher:', teacher.id);
            Alert.alert('Teacher Suspended', 'Teacher has been suspended and will be notified.');
          }
        }
      ]
    );
  };

  const handleAssignTraining = (teacher: any) => {
    Alert.alert('Assign Training', `Training assignment for ${teacher.first_name} ${teacher.last_name} would be implemented here.`);
  };

  const handleContactTeacher = (teacher: any) => {
    Alert.alert(
      'Contact Teacher',
      `How would you like to contact ${teacher.first_name} ${teacher.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call teacher:', teacher.phone) },
        { text: 'Email', onPress: () => console.log('Email teacher:', teacher.email) }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'suspended':
        return '#EF4444';
      case 'training':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending Verification';
      case 'suspended':
        return 'Suspended';
      case 'training':
        return 'Training Required';
      default:
        return status;
    }
  };

  const getBackgroundCheckColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case 'current':
        return '#10B981';
      case 'required':
        return '#F59E0B';
      case 'expired':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatAvailability = (availability: any) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return days.filter((_, index) => availability[dayKeys[index]]).join(', ');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teacher Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search teachers by name, email, or specialization..."
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

      {/* Teachers List */}
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
        {filteredTeachers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No teachers found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No teachers match the selected filter'}
            </Text>
          </View>
        ) : (
          filteredTeachers.map((teacher) => (
            <TouchableOpacity
              key={teacher.id}
              style={styles.teacherCard}
              onPress={() => handleTeacherPress(teacher)}
            >
              <View style={styles.teacherHeader}>
                <View style={styles.teacherAvatar}>
                  {teacher.photo_url ? (
                    <Image source={{ uri: teacher.photo_url }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>
                      {teacher.first_name.charAt(0)}{teacher.last_name.charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>
                    {teacher.first_name} {teacher.last_name}
                  </Text>
                  <Text style={styles.teacherSpecialization}>{teacher.specialization}</Text>
                  <Text style={styles.teacherExperience}>{teacher.experience_years} years experience</Text>
                </View>
                <View style={styles.teacherBadges}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(teacher.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(teacher.status)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.teacherStats}>
                {teacher.performance_rating && (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>★ {teacher.performance_rating}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                )}
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{teacher.programs_taught}</Text>
                  <Text style={styles.statLabel}>Programs</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{teacher.total_sessions}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
                {teacher.completion_rate && (
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, styles.completionRate]}>{teacher.completion_rate}%</Text>
                    <Text style={styles.statLabel}>Completion</Text>
                  </View>
                )}
              </View>

              <View style={styles.teacherDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Background Check:</Text>
                  <View style={[styles.checkBadge, { backgroundColor: getBackgroundCheckColor(teacher.background_check_status) }]}>
                    <Text style={styles.checkText}>{teacher.background_check_status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Training Status:</Text>
                  <View style={[styles.trainingBadge, { backgroundColor: getTrainingStatusColor(teacher.training_status) }]}>
                    <Text style={styles.trainingText}>{teacher.training_status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Available:</Text>
                  <Text style={styles.availabilityText}>{formatAvailability(teacher.availability)}</Text>
                </View>
              </View>

              <View style={styles.teacherActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleContactTeacher(teacher)}
                  style={styles.actionButton}
                >
                  Contact
                </Button>
                
                {teacher.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => handleApproveTeacher(teacher)}
                    style={styles.actionButton}
                  >
                    Approve
                  </Button>
                )}
                
                {teacher.training_status === 'required' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => handleAssignTraining(teacher)}
                    style={styles.actionButton}
                  >
                    Assign Training
                  </Button>
                )}
                
                {teacher.status === 'active' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onPress={() => handleSuspendTeacher(teacher)}
                    style={styles.actionButton}
                  >
                    Suspend
                  </Button>
                )}
              </View>

              {teacher.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{teacher.notes}</Text>
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
  teacherCard: {
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
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teacherAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  teacherSpecialization: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 2,
  },
  teacherExperience: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  teacherBadges: {
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
  teacherStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  completionRate: {
    color: '#10B981',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  teacherDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  checkBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  checkText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  trainingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trainingText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  availabilityText: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  teacherActions: {
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

export default TeacherManagementScreen;
