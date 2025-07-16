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
 * CommunicationCenterScreen Component
 * 
 * Centralized communication hub for school administrators.
 * 
 * Features:
 * - School-wide announcements and messaging
 * - Parent and teacher communication management
 * - Emergency notification system
 * - Automated message templates and scheduling
 * - Communication analytics and delivery tracking
 * - Multi-channel messaging (email, SMS, push notifications)
 * - Message approval workflows for sensitive communications
 * - Communication history and audit trails
 */

export const CommunicationCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'announcements' | 'messages' | 'templates' | 'analytics'>('announcements');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  const mockCommunicationData = {
    recent_announcements: [
      {
        id: '1',
        title: 'Program Schedule Update',
        message: 'Please note the following changes to next week\'s program schedule...',
        type: 'schedule_update',
        priority: 'medium',
        sent_date: '2024-01-15',
        sent_time: '2:30 PM',
        recipients: 'All Parents',
        recipient_count: 156,
        delivery_status: 'delivered',
        read_rate: 78.2,
        author: 'Principal Office'
      },
      {
        id: '2',
        title: 'Safety Protocol Reminder',
        message: 'As we continue to prioritize student safety, please review the updated drop-off and pick-up procedures...',
        type: 'safety_notice',
        priority: 'high',
        sent_date: '2024-01-12',
        sent_time: '9:15 AM',
        recipients: 'All Parents & Teachers',
        recipient_count: 164,
        delivery_status: 'delivered',
        read_rate: 92.1,
        author: 'Safety Coordinator'
      },
      {
        id: '3',
        title: 'New Program Launch: STEM Explorers',
        message: 'We\'re excited to announce the launch of our new STEM Explorers program...',
        type: 'program_announcement',
        priority: 'low',
        sent_date: '2024-01-10',
        sent_time: '11:45 AM',
        recipients: 'Grade 3-5 Parents',
        recipient_count: 89,
        delivery_status: 'delivered',
        read_rate: 85.4,
        author: 'Program Coordinator'
      }
    ],
    message_threads: [
      {
        id: '1',
        subject: 'Question about Art Program Materials',
        participants: ['Mrs. Davis (Parent)', 'Ms. Emily Chen (Teacher)', 'Admin'],
        last_message: 'Thank you for clarifying the material requirements.',
        last_updated: '2024-01-15 4:20 PM',
        status: 'resolved',
        priority: 'low',
        message_count: 5
      },
      {
        id: '2',
        subject: 'Scheduling Conflict Resolution',
        participants: ['Mr. Thompson (Parent)', 'Principal Office'],
        last_message: 'We\'ve found an alternative time slot that works.',
        last_updated: '2024-01-15 1:15 PM',
        status: 'active',
        priority: 'medium',
        message_count: 8
      },
      {
        id: '3',
        subject: 'Emergency Contact Update Request',
        participants: ['Mrs. Rodriguez (Parent)', 'School Secretary'],
        last_message: 'Emergency contact information has been updated.',
        last_updated: '2024-01-14 3:45 PM',
        status: 'resolved',
        priority: 'high',
        message_count: 3
      }
    ],
    message_templates: [
      {
        id: '1',
        name: 'Program Reminder',
        category: 'program_updates',
        usage_count: 45,
        last_used: '2024-01-14',
        template: 'Reminder: Your child is scheduled for {program_name} on {date} at {time}. Please ensure they arrive 10 minutes early.'
      },
      {
        id: '2',
        name: 'Weather Cancellation',
        category: 'emergency',
        usage_count: 8,
        last_used: '2024-01-08',
        template: 'Due to severe weather conditions, all programs scheduled for {date} have been cancelled. We will contact you to reschedule.'
      },
      {
        id: '3',
        name: 'Permission Slip Reminder',
        category: 'administrative',
        usage_count: 23,
        last_used: '2024-01-12',
        template: 'Reminder: The permission slip for {program_name} is due by {due_date}. Please submit it through the app or contact us for assistance.'
      }
    ],
    communication_stats: {
      total_messages_sent: 1247,
      average_read_rate: 84.3,
      response_rate: 67.8,
      delivery_success_rate: 98.9,
      most_active_day: 'Tuesday',
      peak_engagement_time: '7:00 PM',
      emergency_alerts_sent: 3,
      template_usage_rate: 76.2
    }
  };

  const tabOptions = [
    { id: 'announcements', label: 'Announcements', icon: '📢' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'templates', label: 'Templates', icon: '📝' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  // Load communication data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Communication center focused');
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

  // Handle communication actions
  const handleCreateAnnouncement = () => {
    console.log('Navigate to create announcement');
    Alert.alert('Create Announcement', 'Announcement creation form would be implemented here.');
  };

  const handleSendEmergencyAlert = () => {
    Alert.alert(
      'Send Emergency Alert',
      'Are you sure you want to send an emergency alert to all recipients?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Alert', 
          style: 'destructive',
          onPress: () => {
            console.log('Send emergency alert');
            Alert.alert('Emergency Alert Sent', 'Emergency alert has been sent to all recipients.');
          }
        }
      ]
    );
  };

  const handleViewMessage = (message: any) => {
    console.log('Navigate to message thread:', message.id);
    // navigation.navigate('MessageThread', { threadId: message.id });
  };

  const handleUseTemplate = (template: any) => {
    console.log('Use template:', template.id);
    Alert.alert('Use Template', `Using template "${template.name}" for new message.`);
  };

  const handleEditTemplate = (template: any) => {
    console.log('Edit template:', template.id);
    Alert.alert('Edit Template', `Template editing for "${template.name}" would be implemented here.`);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'resolved':
        return '#10B981';
      case 'active':
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule_update':
        return '📅';
      case 'safety_notice':
        return '🛡️';
      case 'program_announcement':
        return '🎓';
      case 'emergency':
        return '🚨';
      default:
        return '📢';
    }
  };

  const renderAnnouncements = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Announcements</Text>
        <View style={styles.headerActions}>
          <Button
            variant="danger"
            size="sm"
            onPress={handleSendEmergencyAlert}
            style={styles.emergencyButton}
          >
            Emergency Alert
          </Button>
          <Button
            variant="primary"
            size="sm"
            onPress={handleCreateAnnouncement}
          >
            New Announcement
          </Button>
        </View>
      </View>

      {mockCommunicationData.recent_announcements.map((announcement) => (
        <View key={announcement.id} style={styles.announcementCard}>
          <View style={styles.announcementHeader}>
            <View style={styles.announcementTitleContainer}>
              <Text style={styles.typeIcon}>{getTypeIcon(announcement.type)}</Text>
              <View style={styles.announcementInfo}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementAuthor}>by {announcement.author}</Text>
              </View>
            </View>
            <View style={styles.announcementBadges}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(announcement.priority) }]}>
                <Text style={styles.priorityText}>{announcement.priority.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(announcement.delivery_status) }]}>
                <Text style={styles.statusText}>{announcement.delivery_status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.announcementMessage} numberOfLines={2}>
            {announcement.message}
          </Text>

          <View style={styles.announcementMeta}>
            <Text style={styles.metaText}>
              Sent: {announcement.sent_date} at {announcement.sent_time}
            </Text>
            <Text style={styles.metaText}>
              Recipients: {announcement.recipients} ({announcement.recipient_count})
            </Text>
            <Text style={styles.metaText}>
              Read Rate: {announcement.read_rate}%
            </Text>
          </View>

          <View style={styles.readRateBar}>
            <View 
              style={[
                styles.readRateProgress, 
                { width: `${announcement.read_rate}%` }
              ]} 
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderMessages = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Message Threads</Text>
        <Text style={styles.threadCount}>{mockCommunicationData.message_threads.length} active</Text>
      </View>

      {mockCommunicationData.message_threads.map((thread) => (
        <TouchableOpacity
          key={thread.id}
          style={styles.messageCard}
          onPress={() => handleViewMessage(thread)}
        >
          <View style={styles.messageHeader}>
            <Text style={styles.messageSubject}>{thread.subject}</Text>
            <View style={styles.messageBadges}>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(thread.priority) }]}>
                <Text style={styles.priorityText}>{thread.priority.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(thread.status) }]}>
                <Text style={styles.statusText}>{thread.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.messageParticipants}>
            Participants: {thread.participants.join(', ')}
          </Text>

          <Text style={styles.lastMessage} numberOfLines={1}>
            Last: {thread.last_message}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>{thread.last_updated}</Text>
            <View style={styles.messageCount}>
              <Text style={styles.messageCountText}>{thread.message_count} messages</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTemplates = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Message Templates</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={() => Alert.alert('Create Template', 'Template creation would be implemented here.')}
        >
          New Template
        </Button>
      </View>

      {mockCommunicationData.message_templates.map((template) => (
        <View key={template.id} style={styles.templateCard}>
          <View style={styles.templateHeader}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateCategory}>{template.category.replace('_', ' ')}</Text>
          </View>

          <Text style={styles.templateContent} numberOfLines={2}>
            {template.template}
          </Text>

          <View style={styles.templateMeta}>
            <Text style={styles.templateUsage}>Used {template.usage_count} times</Text>
            <Text style={styles.templateLastUsed}>Last used: {template.last_used}</Text>
          </View>

          <View style={styles.templateActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleEditTemplate(template)}
              style={styles.templateButton}
            >
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              onPress={() => handleUseTemplate(template)}
              style={styles.templateButton}
            >
              Use Template
            </Button>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAnalytics = () => (
    <View>
      <Text style={styles.sectionTitle}>Communication Analytics</Text>
      
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsValue}>{mockCommunicationData.communication_stats.total_messages_sent}</Text>
          <Text style={styles.analyticsLabel}>Total Messages</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={[styles.analyticsValue, styles.percentageValue]}>
            {mockCommunicationData.communication_stats.average_read_rate}%
          </Text>
          <Text style={styles.analyticsLabel}>Avg Read Rate</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={[styles.analyticsValue, styles.percentageValue]}>
            {mockCommunicationData.communication_stats.response_rate}%
          </Text>
          <Text style={styles.analyticsLabel}>Response Rate</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={[styles.analyticsValue, styles.percentageValue]}>
            {mockCommunicationData.communication_stats.delivery_success_rate}%
          </Text>
          <Text style={styles.analyticsLabel}>Delivery Success</Text>
        </View>
      </View>

      <View style={styles.insightsCard}>
        <Text style={styles.insightsTitle}>Communication Insights</Text>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Most Active Day:</Text>
          <Text style={styles.insightValue}>{mockCommunicationData.communication_stats.most_active_day}</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Peak Engagement:</Text>
          <Text style={styles.insightValue}>{mockCommunicationData.communication_stats.peak_engagement_time}</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Emergency Alerts:</Text>
          <Text style={styles.insightValue}>{mockCommunicationData.communication_stats.emergency_alerts_sent} this month</Text>
        </View>
        <View style={styles.insightRow}>
          <Text style={styles.insightLabel}>Template Usage:</Text>
          <Text style={styles.insightValue}>{mockCommunicationData.communication_stats.template_usage_rate}%</Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'announcements':
        return renderAnnouncements();
      case 'messages':
        return renderMessages();
      case 'templates':
        return renderTemplates();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderAnnouncements();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communication Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search communications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {tabOptions.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabText, selectedTab === tab.id && styles.activeTabText]}>
              {tab.label}
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
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
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
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  emergencyButton: {
    backgroundColor: '#EF4444',
  },
  threadCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  announcementCard: {
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
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  announcementAuthor: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  announcementBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
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
  announcementMessage: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  announcementMeta: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  readRateBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  readRateProgress: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  messageCard: {
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
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 12,
  },
  messageBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  messageParticipants: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  messageCount: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageCountText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  templateCard: {
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
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  templateCategory: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  templateContent: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 4,
    fontStyle: 'italic',
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateUsage: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  templateLastUsed: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  templateButton: {
    flex: 1,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  analyticsCard: {
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
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  percentageValue: {
    color: '#10B981',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  insightsCard: {
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
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
});

export default CommunicationCenterScreen;
