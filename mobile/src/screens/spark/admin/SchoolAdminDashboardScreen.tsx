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
 * SchoolAdminDashboardScreen Component
 * 
 * Main administrative dashboard for school administrators.
 * 
 * Features:
 * - School overview with key metrics and statistics
 * - Program performance analytics and insights
 * - Teacher management and coordination tools
 * - Booking oversight and resource allocation
 * - Compliance monitoring and safety tracking
 * - Financial reporting and budget management
 * - Communication center for school-wide messaging
 * - Quick access to administrative functions
 */

export const SchoolAdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock data for development
  const mockDashboardData = {
    school_info: {
      name: 'Lincoln Elementary School',
      district: 'Metro School District',
      principal: 'Dr. Sarah Williams',
      total_students: 485,
      grade_levels: ['K', '1st', '2nd', '3rd', '4th', '5th'],
      contact_email: 'admin@lincoln.edu',
      phone: '(555) 123-4567'
    },
    key_metrics: {
      active_programs: 12,
      total_bookings: 156,
      participating_students: 342,
      active_teachers: 8,
      completion_rate: 94.2,
      satisfaction_score: 4.7,
      safety_incidents: 0,
      compliance_score: 98.5
    },
    recent_activity: [
      {
        id: '1',
        type: 'program_completion',
        title: 'Science Museum Adventure completed',
        description: '25 students completed program with Ms. Johnson',
        timestamp: '2024-01-15 3:30 PM',
        status: 'success'
      },
      {
        id: '2',
        type: 'teacher_verification',
        title: 'New teacher verified',
        description: 'Mr. David Wilson background check completed',
        timestamp: '2024-01-15 2:15 PM',
        status: 'info'
      },
      {
        id: '3',
        type: 'booking_request',
        title: 'Program booking pending approval',
        description: 'Character Building Workshop for 3rd grade',
        timestamp: '2024-01-15 1:45 PM',
        status: 'warning'
      },
      {
        id: '4',
        type: 'compliance_update',
        title: 'Safety protocol updated',
        description: 'Emergency procedures documentation revised',
        timestamp: '2024-01-15 11:30 AM',
        status: 'info'
      }
    ],
    pending_approvals: [
      {
        id: '1',
        type: 'program_booking',
        title: 'Art & Creativity Session',
        requester: 'Ms. Davis - 2nd Grade',
        date: '2024-01-20',
        students: 22,
        priority: 'medium'
      },
      {
        id: '2',
        type: 'teacher_application',
        title: 'New Teacher Application',
        requester: 'Emily Chen - Art Specialist',
        submitted: '2024-01-12',
        status: 'background_check',
        priority: 'high'
      },
      {
        id: '3',
        type: 'budget_request',
        title: 'Additional Program Funding',
        requester: 'Principal Office',
        amount: '$2,500',
        purpose: 'STEM equipment',
        priority: 'low'
      }
    ],
    alerts: [
      {
        id: '1',
        type: 'safety',
        title: 'Safety Training Due',
        message: '3 teachers need to complete annual safety training by Jan 31',
        severity: 'warning',
        action_required: true
      },
      {
        id: '2',
        type: 'compliance',
        title: 'Insurance Renewal',
        message: 'Liability insurance renewal required by Feb 15',
        severity: 'high',
        action_required: true
      },
      {
        id: '3',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight 11 PM - 2 AM',
        severity: 'info',
        action_required: false
      }
    ],
    quick_stats: {
      todays_sessions: 4,
      students_checked_in: 89,
      teachers_active: 3,
      pending_permissions: 7,
      overdue_reports: 2,
      budget_utilization: 67.3
    }
  };

  const timeframeOptions = [
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
  ];

  // Load dashboard data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('School admin dashboard focused');
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

  // Handle navigation actions
  const handleNavigateToPrograms = () => {
    console.log('Navigate to program management');
    // navigation.navigate('ProgramManagement');
  };

  const handleNavigateToTeachers = () => {
    console.log('Navigate to teacher management');
    // navigation.navigate('TeacherManagement');
  };

  const handleNavigateToBookings = () => {
    console.log('Navigate to booking management');
    // navigation.navigate('BookingManagement');
  };

  const handleNavigateToReports = () => {
    console.log('Navigate to reports');
    // navigation.navigate('Reports');
  };

  const handleNavigateToCompliance = () => {
    console.log('Navigate to compliance');
    // navigation.navigate('ComplianceManagement');
  };

  const handleNavigateToCommunication = () => {
    console.log('Navigate to communication center');
    // navigation.navigate('CommunicationCenter');
  };

  // Handle approval actions
  const handleApprovalAction = (approval: any, action: 'approve' | 'reject') => {
    Alert.alert(
      `${action === 'approve' ? 'Approve' : 'Reject'} Request`,
      `Are you sure you want to ${action} "${approval.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: action === 'approve' ? 'Approve' : 'Reject', 
          onPress: () => console.log(`${action} approval:`, approval.id) 
        }
      ]
    );
  };

  const handleAlertAction = (alert: any) => {
    console.log('Handle alert action:', alert.id);
    Alert.alert('Alert Action', `Action for "${alert.title}" would be implemented here.`);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'program_completion':
        return '✅';
      case 'teacher_verification':
        return '👨‍🏫';
      case 'booking_request':
        return '📅';
      case 'compliance_update':
        return '📋';
      default:
        return '📌';
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.schoolName}>{mockDashboardData.school_info.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.communicationButton}
          onPress={handleNavigateToCommunication}
        >
          <Text style={styles.communicationIcon}>💬</Text>
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
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockDashboardData.key_metrics.active_programs}</Text>
              <Text style={styles.metricLabel}>Active Programs</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockDashboardData.key_metrics.total_bookings}</Text>
              <Text style={styles.metricLabel}>Total Bookings</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockDashboardData.key_metrics.participating_students}</Text>
              <Text style={styles.metricLabel}>Students</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{mockDashboardData.key_metrics.active_teachers}</Text>
              <Text style={styles.metricLabel}>Teachers</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, styles.percentageValue]}>
                {mockDashboardData.key_metrics.completion_rate}%
              </Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, styles.ratingValue]}>
                {mockDashboardData.key_metrics.satisfaction_score}
              </Text>
              <Text style={styles.metricLabel}>Satisfaction</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.quickStatsContainer}>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{mockDashboardData.quick_stats.todays_sessions}</Text>
              <Text style={styles.quickStatLabel}>Sessions Today</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{mockDashboardData.quick_stats.students_checked_in}</Text>
              <Text style={styles.quickStatLabel}>Students Checked In</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{mockDashboardData.quick_stats.teachers_active}</Text>
              <Text style={styles.quickStatLabel}>Active Teachers</Text>
            </View>
            <View style={styles.quickStatItem}>
              <Text style={styles.quickStatValue}>{mockDashboardData.quick_stats.pending_permissions}</Text>
              <Text style={styles.quickStatLabel}>Pending Permissions</Text>
            </View>
          </View>
        </View>

        {/* Alerts */}
        {mockDashboardData.alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts & Notifications</Text>
            {mockDashboardData.alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  { borderLeftColor: getSeverityColor(alert.severity) }
                ]}
                onPress={() => handleAlertAction(alert)}
              >
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                    <Text style={styles.severityText}>{alert.severity.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                {alert.action_required && (
                  <Text style={styles.actionRequired}>Action Required</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pending Approvals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Approvals</Text>
            <Text style={styles.approvalCount}>{mockDashboardData.pending_approvals.length}</Text>
          </View>
          {mockDashboardData.pending_approvals.map((approval) => (
            <View key={approval.id} style={styles.approvalCard}>
              <View style={styles.approvalHeader}>
                <View style={styles.approvalInfo}>
                  <Text style={styles.approvalTitle}>{approval.title}</Text>
                  <Text style={styles.approvalRequester}>{approval.requester}</Text>
                  {approval.date && (
                    <Text style={styles.approvalDate}>Date: {approval.date}</Text>
                  )}
                  {approval.amount && (
                    <Text style={styles.approvalAmount}>Amount: {approval.amount}</Text>
                  )}
                </View>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(approval.priority) }]}>
                  <Text style={styles.priorityText}>{approval.priority.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.approvalActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => handleApprovalAction(approval, 'reject')}
                  style={styles.rejectButton}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={() => handleApprovalAction(approval, 'approve')}
                  style={styles.approveButton}
                >
                  Approve
                </Button>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleNavigateToPrograms}>
              <Text style={styles.quickActionIcon}>📚</Text>
              <Text style={styles.quickActionTitle}>Programs</Text>
              <Text style={styles.quickActionSubtitle}>Manage & Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleNavigateToTeachers}>
              <Text style={styles.quickActionIcon}>👨‍🏫</Text>
              <Text style={styles.quickActionTitle}>Teachers</Text>
              <Text style={styles.quickActionSubtitle}>Verify & Coordinate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleNavigateToBookings}>
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionTitle}>Bookings</Text>
              <Text style={styles.quickActionSubtitle}>Schedule & Manage</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleNavigateToReports}>
              <Text style={styles.quickActionIcon}>📊</Text>
              <Text style={styles.quickActionTitle}>Reports</Text>
              <Text style={styles.quickActionSubtitle}>Analytics & Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleNavigateToCompliance}>
              <Text style={styles.quickActionIcon}>🛡️</Text>
              <Text style={styles.quickActionTitle}>Compliance</Text>
              <Text style={styles.quickActionSubtitle}>Safety & Standards</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleNavigateToCommunication}>
              <Text style={styles.quickActionIcon}>💬</Text>
              <Text style={styles.quickActionTitle}>Communication</Text>
              <Text style={styles.quickActionSubtitle}>Messages & Alerts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {mockDashboardData.recent_activity.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityIcon}>
                <Text style={styles.activityEmoji}>{getActivityIcon(activity.type)}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
                <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
              </View>
              <View style={[styles.activityStatus, { backgroundColor: getActivityColor(activity.status) }]} />
            </View>
          ))}
        </View>
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  schoolName: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  communicationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  communicationIcon: {
    fontSize: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  approvalCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    fontFamily: 'Inter-SemiBold',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
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
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  percentageValue: {
    color: '#10B981',
  },
  ratingValue: {
    color: '#F59E0B',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionRequired: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
    fontFamily: 'Inter-Medium',
  },
  approvalCard: {
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
  approvalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  approvalInfo: {
    flex: 1,
    marginRight: 12,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  approvalRequester: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  approvalDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  approvalAmount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  approvalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  rejectButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
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
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  activityTimestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  activityStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SchoolAdminDashboardScreen;
