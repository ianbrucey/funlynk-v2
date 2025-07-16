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
 * AttendanceListScreen Component
 * 
 * Real-time attendance overview and management interface.
 * 
 * Features:
 * - Real-time attendance status for all active sessions
 * - Student search and filtering capabilities
 * - Quick check-in/check-out actions
 * - Session-based attendance grouping
 * - Parent contact information and emergency alerts
 * - Attendance statistics and summaries
 * - Export and reporting functionality
 * - Missing student alerts and notifications
 */

export const AttendanceListScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Mock data for development
  const filterOptions = [
    { label: 'All Students', value: 'all', count: 45 },
    { label: 'Checked In', value: 'checked_in', count: 32 },
    { label: 'Expected', value: 'expected', count: 8 },
    { label: 'Checked Out', value: 'checked_out', count: 5 },
    { label: 'Missing', value: 'missing', count: 0 },
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
      status: 'active',
      total_students: 25,
      checked_in: 22,
      checked_out: 0,
      expected: 3
    },
    {
      id: 'session_002',
      program_name: 'Art & Creativity Session',
      teacher_name: 'Ms. Emily Chen',
      date: '2024-01-16',
      start_time: '2:00 PM',
      end_time: '3:45 PM',
      location: 'Art Room',
      status: 'active',
      total_students: 18,
      checked_in: 15,
      checked_out: 0,
      expected: 3
    },
    {
      id: 'session_003',
      program_name: 'Character Building Workshop',
      teacher_name: 'Mr. David Wilson',
      date: '2024-01-16',
      start_time: '1:00 PM',
      end_time: '2:30 PM',
      location: 'Classroom A',
      status: 'completed',
      total_students: 20,
      checked_in: 0,
      checked_out: 20,
      expected: 0
    }
  ];

  const mockAttendanceData = [
    {
      id: 'student_1',
      first_name: 'Emma',
      last_name: 'Johnson',
      grade: '3rd Grade',
      photo_url: null,
      parent_name: 'Sarah Johnson',
      parent_phone: '(555) 123-4567',
      session_id: 'session_001',
      program_name: 'Science Museum Adventure',
      attendance_status: 'checked_in',
      check_in_time: '2024-01-16 10:05 AM',
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
      session_id: 'session_002',
      program_name: 'Art & Creativity Session',
      attendance_status: 'checked_in',
      check_in_time: '2024-01-16 2:10 PM',
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
      session_id: 'session_001',
      program_name: 'Science Museum Adventure',
      attendance_status: 'expected',
      check_in_time: null,
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
      session_id: 'session_003',
      program_name: 'Character Building Workshop',
      attendance_status: 'checked_out',
      check_in_time: '2024-01-16 1:05 PM',
      check_out_time: '2024-01-16 2:25 PM',
      medical_alerts: ['ADHD - needs frequent breaks'],
      notes: 'Responds well to positive reinforcement'
    },
    {
      id: 'student_5',
      first_name: 'Ava',
      last_name: 'Thompson',
      grade: '3rd Grade',
      photo_url: null,
      parent_name: 'Michael Thompson',
      parent_phone: '(555) 567-8901',
      session_id: 'session_001',
      program_name: 'Science Museum Adventure',
      attendance_status: 'checked_in',
      check_in_time: '2024-01-16 9:58 AM',
      check_out_time: null,
      medical_alerts: [],
      notes: 'Excellent problem solver'
    }
  ];

  // Load attendance data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Attendance list focused');
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

  // Filter attendance data
  const filteredAttendance = mockAttendanceData.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.parent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.program_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSession = selectedSession === 'all' || student.session_id === selectedSession;
    const matchesFilter = selectedFilter === 'all' || student.attendance_status === selectedFilter;
    
    return matchesSearch && matchesSession && matchesFilter;
  });

  // Handle quick actions
  const handleQuickCheckIn = (student: any) => {
    if (student.attendance_status === 'checked_in') {
      Alert.alert('Already Checked In', `${student.first_name} ${student.last_name} is already checked in.`);
      return;
    }

    const timestamp = new Date().toLocaleString();
    
    Alert.alert(
      'Quick Check-In',
      `Check in ${student.first_name} ${student.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check In', 
          onPress: () => {
            console.log('Quick check-in:', {
              student_id: student.id,
              timestamp,
              session_id: student.session_id
            });
            
            Alert.alert('Success', `${student.first_name} ${student.last_name} has been checked in.`);
          }
        }
      ]
    );
  };

  const handleQuickCheckOut = (student: any) => {
    if (student.attendance_status !== 'checked_in') {
      Alert.alert('Not Checked In', `${student.first_name} ${student.last_name} is not currently checked in.`);
      return;
    }

    const timestamp = new Date().toLocaleString();
    
    Alert.alert(
      'Quick Check-Out',
      `Check out ${student.first_name} ${student.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Check Out', 
          onPress: () => {
            console.log('Quick check-out:', {
              student_id: student.id,
              timestamp,
              session_id: student.session_id
            });
            
            Alert.alert('Success', `${student.first_name} ${student.last_name} has been checked out.`);
          }
        }
      ]
    );
  };

  const handleContactParent = (student: any) => {
    Alert.alert(
      'Contact Parent',
      `Call ${student.parent_name} at ${student.parent_phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call:', student.parent_phone) }
      ]
    );
  };

  const handleViewDetails = (student: any) => {
    navigation.navigate('StudentDetails', { student });
  };

  const handleExportAttendance = () => {
    Alert.alert(
      'Export Attendance',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => console.log('Export PDF') },
        { text: 'Excel', onPress: () => console.log('Export Excel') },
        { text: 'CSV', onPress: () => console.log('Export CSV') }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked_in':
        return '#10B981';
      case 'checked_out':
        return '#6B7280';
      case 'expected':
        return '#F59E0B';
      case 'missing':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'checked_in':
        return 'Checked In';
      case 'checked_out':
        return 'Checked Out';
      case 'expected':
        return 'Expected';
      case 'missing':
        return 'Missing';
      default:
        return status;
    }
  };

  // Calculate session statistics
  const getSessionStats = (sessionId: string) => {
    const sessionStudents = mockAttendanceData.filter(s => s.session_id === sessionId);
    const checkedIn = sessionStudents.filter(s => s.attendance_status === 'checked_in').length;
    const checkedOut = sessionStudents.filter(s => s.attendance_status === 'checked_out').length;
    const expected = sessionStudents.filter(s => s.attendance_status === 'expected').length;
    
    return { total: sessionStudents.length, checkedIn, checkedOut, expected };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance List</Text>
        <TouchableOpacity onPress={handleExportAttendance}>
          <Text style={styles.exportButton}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search students, parents, or programs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Session Summary */}
      <View style={styles.sessionSummary}>
        <Text style={styles.summaryTitle}>Active Sessions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sessionCard, selectedSession === 'all' && styles.sessionCardActive]}
            onPress={() => setSelectedSession('all')}
          >
            <Text style={[styles.sessionName, selectedSession === 'all' && styles.sessionNameActive]}>
              All Sessions
            </Text>
            <Text style={[styles.sessionStats, selectedSession === 'all' && styles.sessionStatsActive]}>
              {mockAttendanceData.length} total
            </Text>
          </TouchableOpacity>
          
          {mockSessions.filter(s => s.status === 'active').map((session) => {
            const stats = getSessionStats(session.id);
            return (
              <TouchableOpacity
                key={session.id}
                style={[styles.sessionCard, selectedSession === session.id && styles.sessionCardActive]}
                onPress={() => setSelectedSession(session.id)}
              >
                <Text style={[styles.sessionName, selectedSession === session.id && styles.sessionNameActive]}>
                  {session.program_name}
                </Text>
                <Text style={[styles.sessionStats, selectedSession === session.id && styles.sessionStatsActive]}>
                  {stats.checkedIn}/{stats.total} present
                </Text>
                <Text style={[styles.sessionTime, selectedSession === session.id && styles.sessionTimeActive]}>
                  {session.start_time} - {session.end_time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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

      {/* Attendance List */}
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
        {filteredAttendance.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No students found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No students match the selected filters'}
            </Text>
          </View>
        ) : (
          filteredAttendance.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => handleViewDetails(student)}
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
                    <Text style={styles.studentGrade}>{student.grade}</Text>
                    <Text style={styles.studentProgram}>{student.program_name}</Text>
                    <Text style={styles.parentInfo}>Parent: {student.parent_name}</Text>
                  </View>
                </View>
                
                <View style={styles.studentMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(student.attendance_status) }]}>
                    <Text style={styles.statusText}>{getStatusText(student.attendance_status)}</Text>
                  </View>
                </View>
              </View>

              {student.check_in_time && (
                <Text style={styles.timeInfo}>
                  ✓ Checked in: {student.check_in_time}
                </Text>
              )}
              
              {student.check_out_time && (
                <Text style={styles.timeInfo}>
                  ← Checked out: {student.check_out_time}
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
                  onPress={() => handleContactParent(student)}
                  style={styles.actionButton}
                >
                  Contact
                </Button>
                
                {student.attendance_status === 'expected' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => handleQuickCheckIn(student)}
                    style={styles.actionButton}
                  >
                    Check In
                  </Button>
                )}
                
                {student.attendance_status === 'checked_in' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() => handleQuickCheckOut(student)}
                    style={styles.actionButton}
                  >
                    Check Out
                  </Button>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          variant="outline"
          size="medium"
          onPress={() => navigation.navigate('QRCodeScanner')}
          style={styles.quickActionButton}
        >
          QR Scanner
        </Button>
        <Button
          variant="outline"
          size="medium"
          onPress={() => navigation.navigate('ManualAttendance')}
          style={styles.quickActionButton}
        >
          Manual Entry
        </Button>
        <Button
          variant="primary"
          size="medium"
          onPress={() => navigation.navigate('AttendanceReport')}
          style={styles.quickActionButton}
        >
          Reports
        </Button>
      </View>
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
  exportButton: {
    fontSize: 24,
    padding: 4,
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
  sessionSummary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sessionCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginLeft: 16,
    marginRight: 4,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sessionCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  sessionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  sessionNameActive: {
    color: '#1E40AF',
  },
  sessionStats: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  sessionStatsActive: {
    color: '#3B82F6',
  },
  sessionTime: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  sessionTimeActive: {
    color: '#6B7280',
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
    paddingBottom: 100,
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
    marginBottom: 2,
  },
  parentInfo: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  studentMeta: {
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
  },
  actionButton: {
    flex: 1,
  },
  quickActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickActionButton: {
    flex: 1,
  },
});

export default AttendanceListScreen;
