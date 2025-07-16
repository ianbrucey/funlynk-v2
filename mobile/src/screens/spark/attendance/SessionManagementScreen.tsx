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
 * SessionManagementScreen Component
 * 
 * Session control and monitoring interface for attendance management.
 * 
 * Features:
 * - Active session monitoring and control
 * - Session start/end management
 * - Real-time attendance tracking per session
 * - Teacher coordination and communication
 * - Session status updates and notifications
 * - Emergency session controls and protocols
 * - Session history and documentation
 * - Resource and room management integration
 */

export const SessionManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  // Mock data for development
  const mockSessions = [
    {
      id: 'session_001',
      program_name: 'Science Museum Adventure',
      teacher_name: 'Ms. Sarah Johnson',
      teacher_id: 'teacher_1',
      date: '2024-01-16',
      start_time: '10:00 AM',
      end_time: '12:00 PM',
      location: 'Science Lab',
      room_id: 'room_101',
      status: 'active',
      total_students: 25,
      checked_in: 22,
      checked_out: 0,
      expected: 3,
      attendance_rate: 88.0,
      session_notes: 'Great engagement with hands-on experiments',
      materials_ready: true,
      safety_briefing_completed: true,
      emergency_contacts_verified: true,
      last_updated: '2024-01-16 11:30 AM'
    },
    {
      id: 'session_002',
      program_name: 'Art & Creativity Session',
      teacher_name: 'Ms. Emily Chen',
      teacher_id: 'teacher_2',
      date: '2024-01-16',
      start_time: '2:00 PM',
      end_time: '3:45 PM',
      location: 'Art Room',
      room_id: 'room_201',
      status: 'preparing',
      total_students: 18,
      checked_in: 0,
      checked_out: 0,
      expected: 18,
      attendance_rate: 0,
      session_notes: 'Setting up art supplies and workspace',
      materials_ready: false,
      safety_briefing_completed: false,
      emergency_contacts_verified: true,
      last_updated: '2024-01-16 1:45 PM'
    },
    {
      id: 'session_003',
      program_name: 'Character Building Workshop',
      teacher_name: 'Mr. David Wilson',
      teacher_id: 'teacher_3',
      date: '2024-01-16',
      start_time: '1:00 PM',
      end_time: '2:30 PM',
      location: 'Classroom A',
      room_id: 'room_301',
      status: 'completed',
      total_students: 20,
      checked_in: 20,
      checked_out: 20,
      expected: 0,
      attendance_rate: 100.0,
      session_notes: 'Excellent participation and positive feedback from students',
      materials_ready: true,
      safety_briefing_completed: true,
      emergency_contacts_verified: true,
      last_updated: '2024-01-16 2:30 PM'
    },
    {
      id: 'session_004',
      program_name: 'Nature Discovery Walk',
      teacher_name: 'Mr. James Rodriguez',
      teacher_id: 'teacher_4',
      date: '2024-01-16',
      start_time: '3:00 PM',
      end_time: '4:30 PM',
      location: 'School Garden',
      room_id: 'outdoor_area',
      status: 'scheduled',
      total_students: 15,
      checked_in: 0,
      checked_out: 0,
      expected: 15,
      attendance_rate: 0,
      session_notes: 'Weather conditions favorable for outdoor activities',
      materials_ready: true,
      safety_briefing_completed: false,
      emergency_contacts_verified: true,
      last_updated: '2024-01-16 2:45 PM'
    }
  ];

  // Load sessions on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Session management focused');
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

  // Handle session actions
  const handleStartSession = (session: any) => {
    Alert.alert(
      'Start Session',
      `Are you sure you want to start "${session.program_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Session', 
          onPress: () => {
            console.log('Start session:', session.id);
            Alert.alert('Session Started', `${session.program_name} has been started successfully.`);
          }
        }
      ]
    );
  };

  const handleEndSession = (session: any) => {
    Alert.alert(
      'End Session',
      `Are you sure you want to end "${session.program_name}"? This will check out all remaining students.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Session', 
          style: 'destructive',
          onPress: () => {
            console.log('End session:', session.id);
            Alert.alert('Session Ended', `${session.program_name} has been ended successfully.`);
          }
        }
      ]
    );
  };

  const handlePauseSession = (session: any) => {
    Alert.alert(
      'Pause Session',
      `Pause "${session.program_name}" temporarily?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pause', 
          onPress: () => {
            console.log('Pause session:', session.id);
            Alert.alert('Session Paused', `${session.program_name} has been paused.`);
          }
        }
      ]
    );
  };

  const handleContactTeacher = (session: any) => {
    Alert.alert(
      'Contact Teacher',
      `Contact ${session.teacher_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call teacher:', session.teacher_id) },
        { text: 'Message', onPress: () => console.log('Message teacher:', session.teacher_id) }
      ]
    );
  };

  const handleViewAttendance = (session: any) => {
    navigation.navigate('AttendanceList', { sessionId: session.id });
  };

  const handleEmergencyProtocol = (session: any) => {
    Alert.alert(
      'Emergency Protocol',
      `Initiate emergency protocol for "${session.program_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Emergency', 
          style: 'destructive',
          onPress: () => navigation.navigate('EmergencyProtocol', { sessionId: session.id })
        }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#10B981';
      case 'preparing':
        return '#F59E0B';
      case 'completed':
        return '#6B7280';
      case 'scheduled':
        return '#3B82F6';
      case 'paused':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'preparing':
        return 'Preparing';
      case 'completed':
        return 'Completed';
      case 'scheduled':
        return 'Scheduled';
      case 'paused':
        return 'Paused';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Get readiness status
  const getReadinessStatus = (session: any) => {
    const checks = [
      session.materials_ready,
      session.safety_briefing_completed,
      session.emergency_contacts_verified
    ];
    const completed = checks.filter(Boolean).length;
    return { completed, total: checks.length, ready: completed === checks.length };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Session Management</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AttendanceReport')}>
          <Text style={styles.reportsButton}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Session Overview */}
      <View style={styles.overviewContainer}>
        <Text style={styles.overviewTitle}>Today's Sessions</Text>
        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>
              {mockSessions.filter(s => s.status === 'active').length}
            </Text>
            <Text style={styles.overviewStatLabel}>Active</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>
              {mockSessions.filter(s => s.status === 'completed').length}
            </Text>
            <Text style={styles.overviewStatLabel}>Completed</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>
              {mockSessions.filter(s => s.status === 'scheduled' || s.status === 'preparing').length}
            </Text>
            <Text style={styles.overviewStatLabel}>Upcoming</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>
              {mockSessions.reduce((sum, s) => sum + s.checked_in, 0)}
            </Text>
            <Text style={styles.overviewStatLabel}>Present</Text>
          </View>
        </View>
      </View>

      {/* Sessions List */}
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
        {mockSessions.map((session) => {
          const readiness = getReadinessStatus(session);
          
          return (
            <TouchableOpacity
              key={session.id}
              style={[
                styles.sessionCard,
                selectedSession === session.id && styles.selectedSessionCard
              ]}
              onPress={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionTitleContainer}>
                  <Text style={styles.sessionTitle}>{session.program_name}</Text>
                  <Text style={styles.sessionTeacher}>with {session.teacher_name}</Text>
                  <Text style={styles.sessionTime}>
                    {session.start_time} - {session.end_time} • {session.location}
                  </Text>
                </View>
                <View style={styles.sessionBadges}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <Text style={styles.sessionStatValue}>{session.checked_in}/{session.total_students}</Text>
                  <Text style={styles.sessionStatLabel}>Present</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Text style={styles.sessionStatValue}>{session.checked_out}</Text>
                  <Text style={styles.sessionStatLabel}>Checked Out</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Text style={styles.sessionStatValue}>{session.expected}</Text>
                  <Text style={styles.sessionStatLabel}>Expected</Text>
                </View>
                <View style={styles.sessionStat}>
                  <Text style={[styles.sessionStatValue, { color: getStatusColor('active') }]}>
                    {session.attendance_rate.toFixed(1)}%
                  </Text>
                  <Text style={styles.sessionStatLabel}>Attendance</Text>
                </View>
              </View>

              {/* Readiness Checklist */}
              <View style={styles.readinessContainer}>
                <Text style={styles.readinessTitle}>
                  Readiness: {readiness.completed}/{readiness.total}
                </Text>
                <View style={styles.readinessChecks}>
                  <View style={styles.readinessCheck}>
                    <Text style={[styles.checkIcon, { color: session.materials_ready ? '#10B981' : '#EF4444' }]}>
                      {session.materials_ready ? '✓' : '✗'}
                    </Text>
                    <Text style={styles.checkLabel}>Materials Ready</Text>
                  </View>
                  <View style={styles.readinessCheck}>
                    <Text style={[styles.checkIcon, { color: session.safety_briefing_completed ? '#10B981' : '#EF4444' }]}>
                      {session.safety_briefing_completed ? '✓' : '✗'}
                    </Text>
                    <Text style={styles.checkLabel}>Safety Briefing</Text>
                  </View>
                  <View style={styles.readinessCheck}>
                    <Text style={[styles.checkIcon, { color: session.emergency_contacts_verified ? '#10B981' : '#EF4444' }]}>
                      {session.emergency_contacts_verified ? '✓' : '✗'}
                    </Text>
                    <Text style={styles.checkLabel}>Emergency Contacts</Text>
                  </View>
                </View>
              </View>

              {selectedSession === session.id && (
                <View style={styles.expandedContent}>
                  <Text style={styles.sessionNotes}>Notes: {session.session_notes}</Text>
                  <Text style={styles.lastUpdated}>Last updated: {session.last_updated}</Text>
                  
                  <View style={styles.sessionActions}>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleContactTeacher(session)}
                      style={styles.actionButton}
                    >
                      Contact Teacher
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleViewAttendance(session)}
                      style={styles.actionButton}
                    >
                      View Attendance
                    </Button>
                    
                    {session.status === 'scheduled' || session.status === 'preparing' ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => handleStartSession(session)}
                        style={styles.actionButton}
                      >
                        Start Session
                      </Button>
                    ) : session.status === 'active' ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onPress={() => handlePauseSession(session)}
                          style={styles.actionButton}
                        >
                          Pause
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onPress={() => handleEndSession(session)}
                          style={styles.actionButton}
                        >
                          End Session
                        </Button>
                      </>
                    ) : null}
                  </View>

                  <View style={styles.emergencyActions}>
                    <Button
                      variant="danger"
                      size="sm"
                      onPress={() => handleEmergencyProtocol(session)}
                      style={styles.emergencyButton}
                    >
                      🚨 Emergency Protocol
                    </Button>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
          onPress={() => navigation.navigate('AttendanceList')}
          style={styles.quickActionButton}
        >
          Attendance List
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
  reportsButton: {
    fontSize: 24,
    padding: 4,
  },
  overviewContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overviewStat: {
    alignItems: 'center',
    flex: 1,
  },
  overviewStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sessionCard: {
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
  selectedSessionCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#FEFEFE',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  sessionTeacher: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  sessionBadges: {
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
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  sessionStat: {
    alignItems: 'center',
    flex: 1,
  },
  sessionStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  sessionStatLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  readinessContainer: {
    marginBottom: 12,
  },
  readinessTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  readinessChecks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  readinessCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  checkLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  expandedContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sessionNotes: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
  },
  sessionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '30%',
  },
  emergencyActions: {
    alignItems: 'center',
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
    minWidth: 200,
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

export default SessionManagementScreen;
