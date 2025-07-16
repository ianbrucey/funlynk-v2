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
 * AttendanceReportScreen Component
 * 
 * Detailed attendance analytics and reporting interface.
 * 
 * Features:
 * - Comprehensive attendance statistics and trends
 * - Session-based attendance summaries
 * - Student attendance patterns and insights
 * - Parent notification tracking and delivery rates
 * - Attendance compliance and safety metrics
 * - Export functionality for various report formats
 * - Historical attendance data and comparisons
 * - Missing student alerts and follow-up tracking
 */

export const AttendanceReportScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month' | 'quarter'>('today');
  const [selectedReportType, setSelectedReportType] = useState<'summary' | 'detailed' | 'trends'>('summary');

  // Mock data for development
  const timeframeOptions = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
  ];

  const reportTypeOptions = [
    { label: 'Summary', value: 'summary', icon: '📊' },
    { label: 'Detailed', value: 'detailed', icon: '📋' },
    { label: 'Trends', value: 'trends', icon: '📈' },
  ];

  const mockReportData = {
    today: {
      total_sessions: 3,
      total_students_expected: 63,
      total_checked_in: 55,
      total_checked_out: 20,
      attendance_rate: 87.3,
      on_time_rate: 92.7,
      parent_notification_rate: 100,
      missing_students: 8,
      late_arrivals: 4,
      early_departures: 2
    },
    session_breakdown: [
      {
        id: 'session_001',
        program_name: 'Science Museum Adventure',
        teacher_name: 'Ms. Sarah Johnson',
        start_time: '10:00 AM',
        end_time: '12:00 PM',
        expected: 25,
        checked_in: 22,
        checked_out: 18,
        attendance_rate: 88.0,
        on_time_arrivals: 20,
        late_arrivals: 2,
        early_departures: 1,
        missing_students: 3,
        status: 'active'
      },
      {
        id: 'session_002',
        program_name: 'Art & Creativity Session',
        teacher_name: 'Ms. Emily Chen',
        start_time: '2:00 PM',
        end_time: '3:45 PM',
        expected: 18,
        checked_in: 15,
        checked_out: 0,
        attendance_rate: 83.3,
        on_time_arrivals: 13,
        late_arrivals: 2,
        early_departures: 0,
        missing_students: 3,
        status: 'active'
      },
      {
        id: 'session_003',
        program_name: 'Character Building Workshop',
        teacher_name: 'Mr. David Wilson',
        start_time: '1:00 PM',
        end_time: '2:30 PM',
        expected: 20,
        checked_in: 18,
        checked_out: 18,
        attendance_rate: 90.0,
        on_time_arrivals: 16,
        late_arrivals: 2,
        early_departures: 1,
        missing_students: 2,
        status: 'completed'
      }
    ],
    attendance_trends: {
      weekly_rates: [
        { day: 'Mon', rate: 89.2 },
        { day: 'Tue', rate: 91.5 },
        { day: 'Wed', rate: 87.3 },
        { day: 'Thu', rate: 93.1 },
        { day: 'Fri', rate: 85.7 }
      ],
      monthly_comparison: {
        current_month: 89.4,
        previous_month: 87.1,
        change: 2.3
      },
      peak_attendance_time: '10:00 AM - 11:00 AM',
      lowest_attendance_day: 'Friday'
    },
    notification_metrics: {
      total_notifications_sent: 147,
      successful_deliveries: 145,
      failed_deliveries: 2,
      delivery_rate: 98.6,
      average_response_time: '2.3 minutes',
      parent_acknowledgment_rate: 76.2
    },
    safety_metrics: {
      unaccounted_students: 0,
      emergency_contacts_made: 3,
      late_pickup_incidents: 1,
      safety_protocol_compliance: 98.4,
      incident_reports_filed: 0
    }
  };

  // Load report data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Attendance report focused');
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

  // Handle export
  const handleExportReport = () => {
    Alert.alert(
      'Export Report',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'PDF', onPress: () => console.log('Export PDF') },
        { text: 'Excel', onPress: () => console.log('Export Excel') },
        { text: 'CSV', onPress: () => console.log('Export CSV') }
      ]
    );
  };

  // Handle drill down
  const handleSessionDrillDown = (session: any) => {
    console.log('Navigate to session details:', session.id);
    Alert.alert('Session Details', `Detailed view for "${session.program_name}" would be implemented here.`);
  };

  // Handle missing students
  const handleMissingStudents = () => {
    console.log('Navigate to missing students');
    Alert.alert('Missing Students', 'Missing students management would be implemented here.');
  };

  // Get status color
  const getStatusColor = (rate: number) => {
    if (rate >= 90) return '#10B981';
    if (rate >= 80) return '#F59E0B';
    return '#EF4444';
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Render summary report
  const renderSummaryReport = () => (
    <View>
      {/* Overall Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockReportData.today.total_sessions}</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockReportData.today.total_students_expected}</Text>
            <Text style={styles.statLabel}>Students Expected</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.attendanceValue]}>
              {formatPercentage(mockReportData.today.attendance_rate)}
            </Text>
            <Text style={styles.statLabel}>Attendance Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.onTimeValue]}>
              {formatPercentage(mockReportData.today.on_time_rate)}
            </Text>
            <Text style={styles.statLabel}>On-Time Rate</Text>
          </View>
        </View>
      </View>

      {/* Session Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Breakdown</Text>
        {mockReportData.session_breakdown.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.sessionCard}
            onPress={() => handleSessionDrillDown(session)}
          >
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionName}>{session.program_name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: session.status === 'active' ? '#10B981' : '#6B7280' }]}>
                <Text style={styles.statusText}>{session.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.sessionTeacher}>Teacher: {session.teacher_name}</Text>
            <Text style={styles.sessionTime}>{session.start_time} - {session.end_time}</Text>
            
            <View style={styles.sessionStats}>
              <View style={styles.sessionStat}>
                <Text style={styles.sessionStatValue}>{session.checked_in}/{session.expected}</Text>
                <Text style={styles.sessionStatLabel}>Present</Text>
              </View>
              <View style={styles.sessionStat}>
                <Text style={[styles.sessionStatValue, { color: getStatusColor(session.attendance_rate) }]}>
                  {formatPercentage(session.attendance_rate)}
                </Text>
                <Text style={styles.sessionStatLabel}>Attendance</Text>
              </View>
              <View style={styles.sessionStat}>
                <Text style={styles.sessionStatValue}>{session.missing_students}</Text>
                <Text style={styles.sessionStatLabel}>Missing</Text>
              </View>
              <View style={styles.sessionStat}>
                <Text style={styles.sessionStatValue}>{session.late_arrivals}</Text>
                <Text style={styles.sessionStatLabel}>Late</Text>
              </View>
            </View>

            <View style={styles.attendanceBar}>
              <View 
                style={[
                  styles.attendanceProgress, 
                  { 
                    width: `${session.attendance_rate}%`,
                    backgroundColor: getStatusColor(session.attendance_rate)
                  }
                ]} 
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Alerts and Issues */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alerts & Issues</Text>
        <View style={styles.alertsContainer}>
          {mockReportData.today.missing_students > 0 && (
            <TouchableOpacity style={styles.alertCard} onPress={handleMissingStudents}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Missing Students</Text>
                <Text style={styles.alertDescription}>
                  {mockReportData.today.missing_students} students have not checked in
                </Text>
              </View>
              <Text style={styles.alertAction}>View →</Text>
            </TouchableOpacity>
          )}
          
          {mockReportData.today.late_arrivals > 0 && (
            <View style={styles.alertCard}>
              <Text style={styles.alertIcon}>🕐</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Late Arrivals</Text>
                <Text style={styles.alertDescription}>
                  {mockReportData.today.late_arrivals} students arrived late today
                </Text>
              </View>
            </View>
          )}
          
          {mockReportData.notification_metrics.failed_deliveries > 0 && (
            <View style={styles.alertCard}>
              <Text style={styles.alertIcon}>📱</Text>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Notification Failures</Text>
                <Text style={styles.alertDescription}>
                  {mockReportData.notification_metrics.failed_deliveries} parent notifications failed
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Safety Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety & Compliance</Text>
        <View style={styles.safetyCard}>
          <View style={styles.safetyRow}>
            <Text style={styles.safetyLabel}>Unaccounted Students:</Text>
            <Text style={[styles.safetyValue, { color: mockReportData.safety_metrics.unaccounted_students === 0 ? '#10B981' : '#EF4444' }]}>
              {mockReportData.safety_metrics.unaccounted_students}
            </Text>
          </View>
          <View style={styles.safetyRow}>
            <Text style={styles.safetyLabel}>Emergency Contacts Made:</Text>
            <Text style={styles.safetyValue}>{mockReportData.safety_metrics.emergency_contacts_made}</Text>
          </View>
          <View style={styles.safetyRow}>
            <Text style={styles.safetyLabel}>Safety Compliance:</Text>
            <Text style={[styles.safetyValue, { color: getStatusColor(mockReportData.safety_metrics.safety_protocol_compliance) }]}>
              {formatPercentage(mockReportData.safety_metrics.safety_protocol_compliance)}
            </Text>
          </View>
          <View style={styles.safetyRow}>
            <Text style={styles.safetyLabel}>Incident Reports:</Text>
            <Text style={[styles.safetyValue, { color: mockReportData.safety_metrics.incident_reports_filed === 0 ? '#10B981' : '#F59E0B' }]}>
              {mockReportData.safety_metrics.incident_reports_filed}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Render detailed report
  const renderDetailedReport = () => (
    <View style={styles.comingSoon}>
      <Text style={styles.comingSoonTitle}>Detailed Report</Text>
      <Text style={styles.comingSoonText}>
        Comprehensive detailed attendance report with individual student records, 
        time-based analytics, and parent communication logs.
      </Text>
    </View>
  );

  // Render trends report
  const renderTrendsReport = () => (
    <View style={styles.comingSoon}>
      <Text style={styles.comingSoonTitle}>Trends Analysis</Text>
      <Text style={styles.comingSoonText}>
        Historical attendance trends, pattern analysis, and predictive insights 
        for better program planning and student engagement.
      </Text>
    </View>
  );

  // Render content based on selected report type
  const renderContent = () => {
    switch (selectedReportType) {
      case 'summary':
        return renderSummaryReport();
      case 'detailed':
        return renderDetailedReport();
      case 'trends':
        return renderTrendsReport();
      default:
        return renderSummaryReport();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Reports</Text>
        <TouchableOpacity onPress={handleExportReport}>
          <Text style={styles.exportButton}>📤</Text>
        </TouchableOpacity>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {timeframeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.timeframeTab,
              selectedTimeframe === option.value && styles.timeframeTabActive
            ]}
            onPress={() => setSelectedTimeframe(option.value as any)}
          >
            <Text style={[
              styles.timeframeTabText,
              selectedTimeframe === option.value && styles.timeframeTabTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Report Type Selector */}
      <View style={styles.reportTypeContainer}>
        {reportTypeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.reportTypeTab,
              selectedReportType === option.value && styles.reportTypeTabActive
            ]}
            onPress={() => setSelectedReportType(option.value as any)}
          >
            <Text style={styles.reportTypeIcon}>{option.icon}</Text>
            <Text style={[
              styles.reportTypeText,
              selectedReportType === option.value && styles.reportTypeTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
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
        {renderContent()}
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
  exportButton: {
    fontSize: 24,
    padding: 4,
  },
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  timeframeTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  timeframeTabActive: {
    borderBottomColor: '#3B82F6',
  },
  timeframeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  timeframeTabTextActive: {
    color: '#3B82F6',
  },
  reportTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reportTypeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  reportTypeTabActive: {
    backgroundColor: '#EFF6FF',
  },
  reportTypeIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  reportTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  reportTypeTextActive: {
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  attendanceValue: {
    color: '#10B981',
  },
  onTimeValue: {
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  sessionTeacher: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionStat: {
    alignItems: 'center',
    flex: 1,
  },
  sessionStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  sessionStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  attendanceBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  attendanceProgress: {
    height: '100%',
    borderRadius: 2,
  },
  alertsContainer: {
    gap: 8,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  alertAction: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyLabel: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  safetyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});

export default AttendanceReportScreen;

const styles = StyleSheet.Create({
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
  timeframeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  timeframeTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  timeframeTabActive: {
    borderBottomColor: '#3B82F6',
  },
  timeframeTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  timeframeTabTextActive: {
    color: '#3B82F6',
  },
  reportTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reportTypeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  reportTypeTabActive: {
    backgroundColor: '#EFF6FF',
  },
  reportTypeIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  reportTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  reportTypeTextActive: {
    color: '#3B82F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  attendanceValue: {
    color: '#10B981',
  },
  onTimeValue: {
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  sessionTeacher: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionStat: {
    alignItems: 'center',
    flex: 1,
  },
  sessionStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  sessionStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  attendanceBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  attendanceProgress: {
    height: '100%',
    borderRadius: 2,
  },
  alertsContainer: {
    gap: 8,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  alertDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  alertAction: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  safetyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyLabel: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  safetyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  comingSoon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});

export default AttendanceReportScreen;
