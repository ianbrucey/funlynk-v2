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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * ManualAttendanceScreen Component
 * 
 * Manual attendance entry interface for backup when QR scanning is unavailable.
 * 
 * Features:
 * - Student search and selection interface
 * - Manual check-in and check-out processing
 * - Student photo verification
 * - Batch attendance operations
 * - Emergency contact quick access
 * - Session validation and verification
 * - Parent notification triggers
 * - Attendance history and notes
 */

export const ManualAttendanceScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [attendanceMode, setAttendanceMode] = useState<'checkin' | 'checkout'>('checkin');
  const [selectedSession, setSelectedSession] = useState<string>('session_001');

  // Get mode from route params
  const initialMode = route.params?.mode || 'checkin';

  // Mock data for development
  const mockStudents = [
    {
      id: 'student_1',
      first_name: 'Emma',
      last_name: 'Johnson',
      grade: '3rd Grade',
      photo_url: null,
      parent_name: 'Sarah Johnson',
      parent_phone: '(555) 123-4567',
      current_program: 'Science Museum Adventure',
      session_id: 'session_001',
      attendance_status: 'expected',
      check_in_time: null,
      check_out_time: null,
      medical_alerts: ['Peanut allergy - carries EpiPen'],
      notes: 'Very enthusiastic about science experiments'
    },
    {
      id: 'student_2',
      first_name: 'Liam',
      last_name: 'Davis',
      grade: '2nd Grade',
      photo_url: null,
      parent_name: 'Jennifer Davis',
      parent_phone: '(555) 234-5678',
      current_program: 'Art & Creativity Session',
      session_id: 'session_002',
      attendance_status: 'checked_in',
      check_in_time: '2024-01-16 10:15 AM',
      check_out_time: null,
      medical_alerts: [],
      notes: 'Loves painting and drawing activities'
    },
    {
      id: 'student_3',
      first_name: 'Sophia',
      last_name: 'Rodriguez',
      grade: '4th Grade',
      photo_url: null,
      parent_name: 'Maria Rodriguez',
      parent_phone: '(555) 345-6789',
      current_program: 'Science Museum Adventure',
      session_id: 'session_001',
      attendance_status: 'checked_in',
      check_in_time: '2024-01-16 9:55 AM',
      check_out_time: null,
      medical_alerts: [],
      notes: 'Great team player and helper'
    },
    {
      id: 'student_4',
      first_name: 'Noah',
      last_name: 'Kim',
      grade: '1st Grade',
      photo_url: null,
      parent_name: 'Susan Kim',
      parent_phone: '(555) 456-7890',
      current_program: 'Character Building Workshop',
      session_id: 'session_003',
      attendance_status: 'expected',
      check_in_time: null,
      check_out_time: null,
      medical_alerts: ['ADHD - needs frequent breaks'],
      notes: 'Responds well to positive reinforcement'
    }
  ];

  const mockSessions = [
    {
      id: 'session_001',
      program_name: 'Science Museum Adventure',
      teacher_name: 'Ms. Sarah Johnson',
      date: '2024-01-16',
      start_time: '10:00 AM',
      end_time: '12:00 PM',
      location: 'Science Lab',
      status: 'active'
    },
    {
      id: 'session_002',
      program_name: 'Art & Creativity Session',
      teacher_name: 'Ms. Emily Chen',
      date: '2024-01-16',
      start_time: '2:00 PM',
      end_time: '3:45 PM',
      location: 'Art Room',
      status: 'active'
    },
    {
      id: 'session_003',
      program_name: 'Character Building Workshop',
      teacher_name: 'Mr. David Wilson',
      date: '2024-01-16',
      start_time: '1:00 PM',
      end_time: '2:30 PM',
      location: 'Classroom A',
      status: 'active'
    }
  ];

  // Initialize mode
  useEffect(() => {
    setAttendanceMode(initialMode);
  }, [initialMode]);

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Manual attendance focused');
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

  // Filter students based on search and session
  const filteredStudents = mockStudents.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.parent_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSession = selectedSession === 'all' || student.session_id === selectedSession;
    
    return matchesSearch && matchesSession;
  });

  // Handle student selection
  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle batch attendance
  const handleBatchAttendance = () => {
    if (selectedStudents.length === 0) {
      Alert.alert('No Students Selected', 'Please select at least one student to process attendance.');
      return;
    }

    const selectedStudentData = mockStudents.filter(s => selectedStudents.includes(s.id));
    const action = attendanceMode === 'checkin' ? 'check in' : 'check out';
    
    Alert.alert(
      `Batch ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Are you sure you want to ${action} ${selectedStudents.length} student(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => processBatchAttendance(selectedStudentData)
        }
      ]
    );
  };

  // Process batch attendance
  const processBatchAttendance = (students: any[]) => {
    const timestamp = new Date().toLocaleString();
    const action = attendanceMode === 'checkin' ? 'checked in' : 'checked out';
    
    students.forEach(student => {
      console.log(`${action}:`, {
        student_id: student.id,
        student_name: `${student.first_name} ${student.last_name}`,
        session_id: student.session_id,
        timestamp,
        mode: attendanceMode
      });
      
      // Send parent notification
      sendParentNotification(student, attendanceMode, timestamp);
    });

    Alert.alert(
      'Batch Processing Complete',
      `${students.length} student(s) have been ${action} successfully. Parents have been notified.`,
      [{ text: 'OK', onPress: () => setSelectedStudents([]) }]
    );
  };

  // Handle individual student attendance
  const handleIndividualAttendance = (student: any) => {
    const timestamp = new Date().toLocaleString();
    const action = attendanceMode === 'checkin' ? 'check in' : 'check out';
    
    // Validate attendance action
    if (attendanceMode === 'checkin' && student.attendance_status === 'checked_in') {
      Alert.alert(
        'Already Checked In',
        `${student.first_name} ${student.last_name} is already checked in.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (attendanceMode === 'checkout' && student.attendance_status !== 'checked_in') {
      Alert.alert(
        'Not Checked In',
        `${student.first_name} ${student.last_name} is not currently checked in.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Confirmation`,
      `${action.charAt(0).toUpperCase() + action.slice(1)} ${student.first_name} ${student.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            console.log(`Individual ${action}:`, {
              student_id: student.id,
              student_name: `${student.first_name} ${student.last_name}`,
              session_id: student.session_id,
              timestamp,
              mode: attendanceMode
            });
            
            // Send parent notification
            sendParentNotification(student, attendanceMode, timestamp);
            
            Alert.alert(
              'Success',
              `${student.first_name} ${student.last_name} has been ${attendanceMode === 'checkin' ? 'checked in' : 'checked out'} successfully.`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  // Send parent notification
  const sendParentNotification = (student: any, type: 'checkin' | 'checkout', time: string) => {
    console.log('Sending parent notification:', {
      parent_phone: student.parent_phone,
      student_name: `${student.first_name} ${student.last_name}`,
      type,
      time,
      program: student.current_program
    });
  };

  // Handle emergency contact
  const handleEmergencyContact = (student: any) => {
    Alert.alert(
      'Emergency Contact',
      `Call ${student.parent_name} at ${student.parent_phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call:', student.parent_phone) }
      ]
    );
  };

  // Get attendance status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        return '#10B981';
      case 'checked_out':
        return '#6B7280';
      case 'expected':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  // Get attendance status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'Checked In';
      case 'checked_out':
        return 'Checked Out';
      case 'expected':
        return 'Expected';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Attendance</Text>
        <TouchableOpacity onPress={() => navigation.navigate('QRCodeScanner')}>
          <Text style={styles.scannerButton}>📱</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Toggle */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeButton, attendanceMode === 'checkin' && styles.modeButtonActive]}
          onPress={() => setAttendanceMode('checkin')}
        >
          <Text style={[styles.modeButtonText, attendanceMode === 'checkin' && styles.modeButtonTextActive]}>
            Check-In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, attendanceMode === 'checkout' && styles.modeButtonActive]}
          onPress={() => setAttendanceMode('checkout')}
        >
          <Text style={[styles.modeButtonText, attendanceMode === 'checkout' && styles.modeButtonTextActive]}>
            Check-Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Session Filter */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        
        <View style={styles.sessionFilter}>
          <Text style={styles.filterLabel}>Session:</Text>
          <TouchableOpacity
            style={styles.sessionButton}
            onPress={() => {
              // In real app, this would show a picker
              Alert.alert('Session Filter', 'Session selection would be implemented here.');
            }}
          >
            <Text style={styles.sessionButtonText}>
              {mockSessions.find(s => s.id === selectedSession)?.program_name || 'All Sessions'}
            </Text>
            <Text style={styles.sessionButtonIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Batch Actions */}
      {selectedStudents.length > 0 && (
        <View style={styles.batchActions}>
          <Text style={styles.batchText}>
            {selectedStudents.length} student(s) selected
          </Text>
          <Button
            variant="primary"
            size="sm"
            onPress={handleBatchAttendance}
          >
            Batch {attendanceMode === 'checkin' ? 'Check-In' : 'Check-Out'}
          </Button>
        </View>
      )}

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
              {searchQuery ? 'Try adjusting your search criteria' : 'No students match the selected session'}
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <TouchableOpacity
                style={styles.studentHeader}
                onPress={() => handleStudentSelect(student.id)}
              >
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
                    <Text style={styles.studentGrade}>{student.grade}</Text>
                    <Text style={styles.studentProgram}>{student.current_program}</Text>
                  </View>
                </View>
                
                <View style={styles.studentMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(student.attendance_status) }]}>
                    <Text style={styles.statusText}>{getStatusText(student.attendance_status)}</Text>
                  </View>
                  <View style={styles.selectionIndicator}>
                    {selectedStudents.includes(student.id) ? (
                      <Text style={styles.selectedIcon}>✓</Text>
                    ) : (
                      <View style={styles.unselectedIcon} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {student.check_in_time && (
                <Text style={styles.timeInfo}>
                  Checked in: {student.check_in_time}
                </Text>
              )}
              
              {student.check_out_time && (
                <Text style={styles.timeInfo}>
                  Checked out: {student.check_out_time}
                </Text>
              )}

              {student.medical_alerts.length > 0 && (
                <View style={styles.medicalAlerts}>
                  <Text style={styles.alertsTitle}>⚠️ Medical Alerts:</Text>
                  {student.medical_alerts.map((alert, index) => (
                    <Text key={index} style={styles.alertText}>{alert}</Text>
                  ))}
                </View>
              )}

              <View style={styles.studentActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleEmergencyContact(student)}
                  style={styles.actionButton}
                >
                  Contact Parent
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => handleIndividualAttendance(student)}
                  style={styles.actionButton}
                >
                  {attendanceMode === 'checkin' ? 'Check In' : 'Check Out'}
                </Button>
              </View>

              {student.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{student.notes}</Text>
                </View>
              )}
            </View>
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
  scannerButton: {
    fontSize: 24,
    padding: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    marginBottom: 12,
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
  sessionFilter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginRight: 12,
  },
  sessionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sessionButtonText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Inter-Regular',
  },
  sessionButtonIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  batchText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E40AF',
    fontFamily: 'Inter-Medium',
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
    alignItems: 'center',
    marginBottom: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  studentProgram: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  studentMeta: {
    alignItems: 'flex-end',
    gap: 8,
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
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  unselectedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  timeInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  medicalAlerts: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  alertsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
  },
  notesSection: {
    paddingTop: 8,
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

export default ManualAttendanceScreen;
