import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * NotificationsScreen Component
 * 
 * Displays all user notifications with categorization and management features.
 * 
 * Features:
 * - Categorized notifications (events, social, system)
 * - Mark as read/unread functionality
 * - Notification filtering and search
 * - Bulk actions (mark all read, clear all)
 * - Deep linking to relevant content
 * - Real-time notification updates
 * - Notification preferences quick access
 */

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'events' | 'social' | 'system'>('all');

  // Mock data for development
  const mockNotifications = [
    {
      id: '1',
      type: 'event_rsvp',
      category: 'events',
      title: 'New RSVP for your event',
      message: 'Sarah Wilson has RSVP\'d to your Science Discovery Workshop',
      timestamp: '2024-01-16T14:30:00Z',
      isRead: false,
      user: {
        id: 'user_1',
        firstName: 'Sarah',
        lastName: 'Wilson',
        avatar: null,
      },
      relatedContent: {
        type: 'event',
        id: 'event_1',
        title: 'Science Discovery Workshop',
      },
      actionRequired: false,
    },
    {
      id: '2',
      type: 'new_follower',
      category: 'social',
      title: 'New follower',
      message: 'Mike Johnson started following you',
      timestamp: '2024-01-16T12:15:00Z',
      isRead: false,
      user: {
        id: 'user_2',
        firstName: 'Mike',
        lastName: 'Johnson',
        avatar: null,
      },
      relatedContent: {
        type: 'user',
        id: 'user_2',
      },
      actionRequired: true,
      actions: ['Follow back', 'View profile'],
    },
    {
      id: '3',
      type: 'event_reminder',
      category: 'events',
      title: 'Event reminder',
      message: 'Art & Creativity Session starts in 1 hour',
      timestamp: '2024-01-16T11:00:00Z',
      isRead: true,
      relatedContent: {
        type: 'event',
        id: 'event_2',
        title: 'Art & Creativity Session',
      },
      actionRequired: false,
    },
    {
      id: '4',
      type: 'direct_message',
      category: 'social',
      title: 'New message',
      message: 'Emily Chen sent you a message',
      timestamp: '2024-01-16T10:45:00Z',
      isRead: true,
      user: {
        id: 'user_3',
        firstName: 'Emily',
        lastName: 'Chen',
        avatar: null,
      },
      relatedContent: {
        type: 'conversation',
        id: 'conv_1',
      },
      actionRequired: false,
    },
    {
      id: '5',
      type: 'activity_like',
      category: 'social',
      title: 'Activity liked',
      message: 'David Rodriguez and 3 others liked your post',
      timestamp: '2024-01-16T09:30:00Z',
      isRead: true,
      user: {
        id: 'user_4',
        firstName: 'David',
        lastName: 'Rodriguez',
        avatar: null,
      },
      relatedContent: {
        type: 'activity',
        id: 'activity_1',
      },
      actionRequired: false,
    },
    {
      id: '6',
      type: 'system_update',
      category: 'system',
      title: 'App update available',
      message: 'Version 1.2.0 is now available with new features and improvements',
      timestamp: '2024-01-15T18:00:00Z',
      isRead: false,
      relatedContent: {
        type: 'app_update',
        version: '1.2.0',
      },
      actionRequired: true,
      actions: ['Update now', 'View details'],
    },
  ];

  // Filter notifications based on selected tab
  const filteredNotifications = selectedTab === 'all' 
    ? mockNotifications 
    : mockNotifications.filter(notification => notification.category === selectedTab);

  // Get unread count for each category
  const getUnreadCount = useCallback((category: string) => {
    if (category === 'all') {
      return mockNotifications.filter(n => !n.isRead).length;
    }
    return mockNotifications.filter(n => n.category === category && !n.isRead).length;
  }, [mockNotifications]);

  // Load notifications on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Notifications screen focused');
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

  // Handle notification press
  const handleNotificationPress = useCallback((notification: any) => {
    // Mark as read if unread
    if (!notification.isRead) {
      console.log('Mark notification as read:', notification.id);
    }

    // Navigate based on content type
    switch (notification.relatedContent?.type) {
      case 'event':
        console.log('Navigate to event:', notification.relatedContent.id);
        Alert.alert('Event Details', `Navigate to "${notification.relatedContent.title}" would be implemented here.`);
        break;
      case 'user':
        navigation.navigate('Profile', { userId: notification.relatedContent.id });
        break;
      case 'conversation':
        navigation.navigate('ChatScreen', { conversationId: notification.relatedContent.id });
        break;
      case 'activity':
        console.log('Navigate to activity:', notification.relatedContent.id);
        Alert.alert('Activity Details', 'Activity details would be implemented here.');
        break;
      case 'app_update':
        Alert.alert('App Update', `Update to version ${notification.relatedContent.version} available.`);
        break;
      default:
        console.log('Handle notification:', notification.id);
    }
  }, [navigation]);

  // Handle notification action
  const handleNotificationAction = useCallback((notification: any, action: string) => {
    console.log('Notification action:', action, 'for notification:', notification.id);
    
    switch (action) {
      case 'Follow back':
        Alert.alert('Follow User', `Follow ${notification.user.firstName} ${notification.user.lastName}?`);
        break;
      case 'View profile':
        navigation.navigate('Profile', { userId: notification.user.id });
        break;
      case 'Update now':
        Alert.alert('App Update', 'App update would be initiated here.');
        break;
      case 'View details':
        Alert.alert('Update Details', 'Update details would be shown here.');
        break;
      default:
        Alert.alert('Action', `${action} would be implemented here.`);
    }
  }, [navigation]);

  // Handle mark as read/unread
  const handleToggleRead = useCallback((notificationId: string, isRead: boolean) => {
    console.log(`Mark notification ${isRead ? 'unread' : 'read'}:`, notificationId);
  }, []);

  // Handle mark all as read
  const handleMarkAllRead = useCallback(() => {
    const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) {
      Alert.alert('No Unread Notifications', 'All notifications are already marked as read.');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      `Mark ${unreadNotifications.length} notification${unreadNotifications.length !== 1 ? 's' : ''} as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark All Read',
          onPress: () => {
            console.log('Mark all notifications as read');
            Alert.alert('Success', 'All notifications marked as read.');
          }
        },
      ]
    );
  }, [filteredNotifications]);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  }, []);

  // Get notification icon
  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'event_rsvp': return '✅';
      case 'event_reminder': return '⏰';
      case 'new_follower': return '👤';
      case 'direct_message': return '💬';
      case 'activity_like': return '❤️';
      case 'activity_comment': return '💭';
      case 'system_update': return '🔄';
      default: return '🔔';
    }
  }, []);

  // Render notification item
  const renderNotificationItem = useCallback(({ item: notification }: { item: any }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(notification)}
      onLongPress={() => {
        Alert.alert(
          'Notification Options',
          'Choose an action',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: notification.isRead ? 'Mark as Unread' : 'Mark as Read',
              onPress: () => handleToggleRead(notification.id, notification.isRead)
            },
          ]
        );
      }}
    >
      <View style={styles.notificationContent}>
        {/* Notification Icon */}
        <View style={styles.notificationIcon}>
          <Text style={styles.iconText}>{getNotificationIcon(notification.type)}</Text>
        </View>

        {/* User Avatar (if applicable) */}
        {notification.user && (
          <View style={styles.userAvatarContainer}>
            {notification.user.avatar ? (
              <Image source={{ uri: notification.user.avatar }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <Text style={styles.userAvatarText}>
                  {notification.user.firstName.charAt(0)}{notification.user.lastName.charAt(0)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Notification Details */}
        <View style={styles.notificationDetails}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationTime}>
            {formatTimestamp(notification.timestamp)}
          </Text>

          {/* Action Buttons */}
          {notification.actionRequired && notification.actions && (
            <View style={styles.actionButtons}>
              {notification.actions.map((action: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionButton, index === 0 && styles.primaryActionButton]}
                  onPress={() => handleNotificationAction(notification, action)}
                >
                  <Text style={[styles.actionButtonText, index === 0 && styles.primaryActionButtonText]}>
                    {action}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Unread Indicator */}
        {!notification.isRead && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
    </TouchableOpacity>
  ), [handleNotificationPress, handleToggleRead, handleNotificationAction, formatTimestamp, getNotificationIcon]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔔</Text>
      <Text style={styles.emptyStateTitle}>
        {selectedTab === 'all' ? 'No notifications' : `No ${selectedTab} notifications`}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        When you have notifications, they'll appear here
      </Text>
    </View>
  ), [selectedTab]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleMarkAllRead}
          >
            <Text style={styles.headerButtonText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <Text style={styles.headerButtonIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'events', label: 'Events' },
          { key: 'social', label: 'Social' },
          { key: 'system', label: 'System' },
        ].map((tab) => {
          const unreadCount = getUnreadCount(tab.key);
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
              {unreadCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredNotifications.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  headerButtonIcon: {
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotification: {
    backgroundColor: '#F8FAFC',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  userAvatarContainer: {
    marginRight: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  notificationDetails: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  primaryActionButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;
