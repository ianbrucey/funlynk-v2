import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * ParentDashboardScreen Component
 * 
 * Main dashboard for parents showing child progress and program information.
 * 
 * Features:
 * - Child progress overview with recent activities
 * - Upcoming program schedules and events
 * - Quick access to permission slips and forms
 * - Recent messages from teachers and administrators
 * - Program recommendations based on child's interests
 * - Emergency contact information and procedures
 * - Photo galleries from recent sessions
 * - Achievement badges and milestones
 */

export const ParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string>('1');

  // Mock data for development
  const mockChildren = [
    {
      id: '1',
      first_name: 'Emma',
      last_name: 'Johnson',
      grade: '3rd Grade',
      school: 'Lincoln Elementary',
      photo_url: null,
      age: 8
    },
    {
      id: '2',
      first_name: 'Liam',
      last_name: 'Johnson',
      grade: '1st Grade',
      school: 'Lincoln Elementary',
      photo_url: null,
      age: 6
    }
  ];

  const mockDashboardData = {
    upcoming_programs: [
      {
        id: '1',
        program_name: 'Science Museum Adventure',
        date: '2024-01-15',
        time: '10:00 AM - 12:00 PM',
        location: 'Lincoln Elementary',
        teacher: 'Ms. Sarah',
        status: 'confirmed'
      },
      {
        id: '2',
        program_name: 'Character Building Workshop',
        date: '2024-01-18',
        time: '2:00 PM - 3:30 PM',
        location: 'Lincoln Elementary',
        teacher: 'Mr. David',
        status: 'pending_permission'
      }
    ],
    recent_activities: [
      {
        id: '1',
        activity: 'Completed volcano experiment',
        program: 'Science Museum Adventure',
        date: '2024-01-10',
        rating: 5,
        teacher_note: 'Emma showed excellent curiosity and asked great questions!'
      },
      {
        id: '2',
        activity: 'Participated in team building exercise',
        program: 'Character Building Workshop',
        date: '2024-01-08',
        rating: 4,
        teacher_note: 'Great teamwork and leadership skills demonstrated.'
      }
    ],
    pending_actions: [
      {
        id: '1',
        type: 'permission_slip',
        title: 'Science Museum Field Trip Permission',
        due_date: '2024-01-12',
        priority: 'high'
      },
      {
        id: '2',
        type: 'form',
        title: 'Emergency Contact Update',
        due_date: '2024-01-20',
        priority: 'medium'
      }
    ],
    recent_messages: [
      {
        id: '1',
        from: 'Ms. Sarah (Teacher)',
        subject: 'Great progress in science activities!',
        preview: 'Emma has been showing wonderful curiosity...',
        date: '2024-01-11',
        is_read: false
      },
      {
        id: '2',
        from: 'Spark Administration',
        subject: 'Upcoming program schedule changes',
        preview: 'Please note the following schedule updates...',
        date: '2024-01-09',
        is_read: true
      }
    ],
    achievements: [
      {
        id: '1',
        title: 'Science Explorer',
        description: 'Completed 5 science experiments',
        earned_date: '2024-01-10',
        badge_icon: '🔬'
      },
      {
        id: '2',
        title: 'Team Player',
        description: 'Excellent collaboration in group activities',
        earned_date: '2024-01-08',
        badge_icon: '🤝'
      }
    ],
    program_recommendations: [
      {
        id: '1',
        program_name: 'Art & Creativity Workshop',
        description: 'Based on Emma\'s interest in creative activities',
        next_available: '2024-01-25',
        age_appropriate: true
      },
      {
        id: '2',
        program_name: 'Nature Discovery Walk',
        description: 'Perfect for curious minds who love science',
        next_available: '2024-01-30',
        age_appropriate: true
      }
    ]
  };

  // Load dashboard data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Parent dashboard focused');
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
  const handleViewPrograms = () => {
    console.log('Navigate to browse programs');
    // navigation.navigate('BrowsePrograms');
  };

  const handleViewPermissionSlips = () => {
    console.log('Navigate to permission slips');
    // navigation.navigate('PermissionSlips');
  };

  const handleViewMessages = () => {
    console.log('Navigate to messages');
    // navigation.navigate('Messages');
  };

  const handleViewChildProfile = () => {
    console.log('Navigate to child profile');
    // navigation.navigate('ChildProfile', { childId: selectedChild });
  };

  const handleActionPress = (action: any) => {
    console.log('Handle action:', action.type, action.id);
    if (action.type === 'permission_slip') {
      // navigation.navigate('PermissionSlipDetails', { slipId: action.id });
    }
  };

  const handleMessagePress = (message: any) => {
    console.log('Open message:', message.id);
    // navigation.navigate('MessageDetails', { messageId: message.id });
  };

  const handleProgramRecommendation = (program: any) => {
    console.log('View program recommendation:', program.id);
    // navigation.navigate('ProgramDetails', { programId: program.id });
  };

  const selectedChildData = mockChildren.find(child => child.id === selectedChild);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Child Selector */}
      <View style={styles.header}>
        <View style={styles.childSelector}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          {mockChildren.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.childTabs}
            >
              {mockChildren.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childTab,
                    selectedChild === child.id && styles.selectedChildTab
                  ]}
                  onPress={() => setSelectedChild(child.id)}
                >
                  <Text style={[
                    styles.childTabText,
                    selectedChild === child.id && styles.selectedChildTabText
                  ]}>
                    {child.first_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
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
        {/* Child Info Card */}
        {selectedChildData && (
          <TouchableOpacity style={styles.childInfoCard} onPress={handleViewChildProfile}>
            <View style={styles.childAvatar}>
              {selectedChildData.photo_url ? (
                <Image source={{ uri: selectedChildData.photo_url }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {selectedChildData.first_name.charAt(0)}{selectedChildData.last_name.charAt(0)}
                </Text>
              )}
            </View>
            <View style={styles.childDetails}>
              <Text style={styles.childName}>
                {selectedChildData.first_name} {selectedChildData.last_name}
              </Text>
              <Text style={styles.childGrade}>{selectedChildData.grade} • {selectedChildData.school}</Text>
              <Text style={styles.childAge}>Age {selectedChildData.age}</Text>
            </View>
            <Text style={styles.viewProfileText}>View Profile →</Text>
          </TouchableOpacity>
        )}

        {/* Pending Actions */}
        {mockDashboardData.pending_actions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Action Required</Text>
              <TouchableOpacity onPress={handleViewPermissionSlips}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {mockDashboardData.pending_actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleActionPress(action)}
              >
                <View style={styles.actionHeader}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(action.priority) }]}>
                    <Text style={styles.priorityText}>{action.priority.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.actionDueDate}>Due: {action.due_date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Programs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Programs</Text>
            <TouchableOpacity onPress={handleViewPrograms}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {mockDashboardData.upcoming_programs.map((program) => (
            <View key={program.id} style={styles.programCard}>
              <Text style={styles.programName}>{program.program_name}</Text>
              <Text style={styles.programDateTime}>{program.date} • {program.time}</Text>
              <Text style={styles.programLocation}>📍 {program.location}</Text>
              <Text style={styles.programTeacher}>👨‍🏫 {program.teacher}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: program.status === 'confirmed' ? '#10B981' : '#F59E0B' }
              ]}>
                <Text style={styles.statusText}>
                  {program.status === 'confirmed' ? 'Confirmed' : 'Pending Permission'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {mockDashboardData.recent_activities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityName}>{activity.activity}</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text
                      key={star}
                      style={[
                        styles.star,
                        { color: star <= activity.rating ? '#F59E0B' : '#E5E7EB' }
                      ]}
                    >
                      ★
                    </Text>
                  ))}
                </View>
              </View>
              <Text style={styles.activityProgram}>{activity.program}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
              <Text style={styles.teacherNote}>"{activity.teacher_note}"</Text>
            </View>
          ))}
        </View>

        {/* Recent Messages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Messages</Text>
            <TouchableOpacity onPress={handleViewMessages}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {mockDashboardData.recent_messages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[styles.messageCard, !message.is_read && styles.unreadMessage]}
              onPress={() => handleMessagePress(message)}
            >
              <View style={styles.messageHeader}>
                <Text style={styles.messageFrom}>{message.from}</Text>
                <Text style={styles.messageDate}>{message.date}</Text>
              </View>
              <Text style={styles.messageSubject}>{message.subject}</Text>
              <Text style={styles.messagePreview} numberOfLines={2}>{message.preview}</Text>
              {!message.is_read && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsGrid}>
            {mockDashboardData.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.badge_icon}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                <Text style={styles.achievementDate}>{achievement.earned_date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Program Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Programs</Text>
          {mockDashboardData.program_recommendations.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.recommendationCard}
              onPress={() => handleProgramRecommendation(program)}
            >
              <Text style={styles.recommendationName}>{program.program_name}</Text>
              <Text style={styles.recommendationDescription}>{program.description}</Text>
              <Text style={styles.recommendationDate}>Next available: {program.next_available}</Text>
            </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  childSelector: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  childTabs: {
    flexDirection: 'row',
  },
  childTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  selectedChildTab: {
    backgroundColor: '#3B82F6',
  },
  childTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  selectedChildTabText: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  childInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  childGrade: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  childAge: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  viewProfileText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
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
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
    fontFamily: 'Inter-Medium',
    flex: 1,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  actionDueDate: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
  },
  programCard: {
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
  programName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  programDateTime: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 4,
  },
  programLocation: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  programTeacher: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    marginLeft: 2,
  },
  activityProgram: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  teacherNote: {
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 4,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageFrom: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  messageDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  messageSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  recommendationCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  recommendationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#3730A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  recommendationDate: {
    fontSize: 12,
    color: '#6366F1',
    fontFamily: 'Inter-Regular',
  },
});

export default ParentDashboardScreen;
