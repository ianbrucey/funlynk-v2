# Task 004: Social Features Screens Implementation
**Agent**: Core Mobile UI Developer  
**Estimated Time**: 7-8 hours  
**Priority**: Medium  
**Dependencies**: Agent 5 Task 003 (User Profile Screens), Agent 2 Task 004 (Social Features API)  

## Overview
Implement comprehensive social features screens for Funlynk Core mobile app including activity feed, direct messaging, notifications, and social interactions using the established design system and component library.

## Prerequisites
- User profile screens complete (Agent 5 Task 003)
- Social Features API endpoints available (Agent 2 Task 004)
- User authentication and profile management working
- Navigation system configured

## Step-by-Step Implementation

### Step 1: Create Activity Feed and Social Discovery (2.5 hours)

**Create ActivityFeedScreen component:**
```bash
# Create social screen directory
mkdir -p src/screens/core/social

# Create ActivityFeedScreen component
touch src/screens/core/social/ActivityFeedScreen.tsx
```

**Implement ActivityFeedScreen.tsx using template pattern:**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { SearchInput } from '../../../components/shared/atoms/SearchInput';
import { LoadingSpinner } from '../../../components/shared/atoms/LoadingSpinner';
import { EmptyState } from '../../../components/shared/molecules/EmptyState';

// Social-specific components
import { ActivityCard } from '../../../components/core/molecules/ActivityCard';
import { FeedHeader } from '../../../components/core/molecules/FeedHeader';
import { StoryCarousel } from '../../../components/core/organisms/StoryCarousel';
import { SuggestedUsers } from '../../../components/core/organisms/SuggestedUsers';

// Hooks
import { useSocial } from '../../../hooks/core/useSocial';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { ActivityItem, FeedFilters } from '../../../types/social';
import type { NavigationProp } from '@react-navigation/native';
import type { CoreStackParamList } from '../../../navigation/CoreNavigator';

// Redux
import { socialActions } from '../../../store/slices/socialSlice';
import type { RootState } from '../../../store/store';

/**
 * ActivityFeedScreen Component
 * 
 * Displays personalized activity feed with posts, events, and social interactions
 * from followed users and relevant community content.
 * 
 * Features:
 * - Personalized activity feed with infinite scrolling
 * - Story carousel for recent updates
 * - Suggested users to follow
 * - Activity filtering and search
 * - Real-time updates and notifications
 * - Pull-to-refresh functionality
 * - Like, comment, and share interactions
 */

type ActivityFeedScreenNavigationProp = NavigationProp<CoreStackParamList, 'ActivityFeed'>;

export const ActivityFeedScreen: React.FC = () => {
  const navigation = useNavigation<ActivityFeedScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();
  
  // Redux state
  const {
    activities,
    stories,
    suggestedUsers,
    isLoading,
    isRefreshing,
    hasMore,
    filters,
    error,
  } = useSelector((state: RootState) => state.social);
  
  // Local state
  const [showFilters, setShowFilters] = useState(false);

  // Custom hooks
  const {
    loadFeed,
    loadMoreFeed,
    refreshFeed,
    likeActivity,
    unlikeActivity,
    shareActivity,
    followUser,
    unfollowUser,
  } = useSocial();

  // Load feed on screen focus
  useFocusEffect(
    useCallback(() => {
      if (activities.length === 0) {
        loadFeed();
      }
    }, [loadFeed, activities.length])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshFeed();
    } catch (error) {
      handleError(error);
    }
  }, [refreshFeed, handleError]);

  // Handle load more activities
  const handleLoadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      try {
        await loadMoreFeed();
      } catch (error) {
        handleError(error);
      }
    }
  }, [isLoading, hasMore, loadMoreFeed, handleError]);

  // Handle activity like/unlike
  const handleActivityLike = useCallback(async (activityId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeActivity(activityId);
      } else {
        await likeActivity(activityId);
      }
    } catch (error) {
      handleError(error);
    }
  }, [likeActivity, unlikeActivity, handleError]);

  // Handle activity share
  const handleActivityShare = useCallback(async (activityId: string) => {
    try {
      await shareActivity(activityId);
    } catch (error) {
      handleError(error);
    }
  }, [shareActivity, handleError]);

  // Handle user follow/unfollow
  const handleUserFollow = useCallback(async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
    } catch (error) {
      handleError(error);
    }
  }, [followUser, unfollowUser, handleError]);

  // Render activity item
  const renderActivityItem = useCallback(({ item }: { item: ActivityItem }) => (
    <ActivityCard
      activity={item}
      currentUserId={user?.id}
      onLike={(isLiked) => handleActivityLike(item.id, isLiked)}
      onComment={() => navigation.navigate('ActivityComments', { activityId: item.id })}
      onShare={() => handleActivityShare(item.id)}
      onUserPress={(userId) => navigation.navigate('Profile', { userId })}
      onEventPress={(eventId) => navigation.navigate('EventDetails', { eventId })}
      style={styles.activityCard}
    />
  ), [user?.id, handleActivityLike, handleActivityShare, navigation]);

  // Render list header
  const renderListHeader = useCallback(() => (
    <View>
      {/* Stories Section */}
      {stories.length > 0 && (
        <StoryCarousel
          stories={stories}
          currentUserId={user?.id}
          onStoryPress={(story) => navigation.navigate('StoryViewer', { storyId: story.id })}
          onCreateStory={() => navigation.navigate('CreateStory')}
          style={styles.storyCarousel}
        />
      )}

      {/* Suggested Users Section */}
      {suggestedUsers.length > 0 && (
        <SuggestedUsers
          users={suggestedUsers}
          onUserPress={(userId) => navigation.navigate('Profile', { userId })}
          onFollow={(userId, isFollowing) => handleUserFollow(userId, isFollowing)}
          onDismiss={(userId) => {
            // Handle dismissing suggestion
          }}
          style={styles.suggestedUsers}
        />
      )}
    </View>
  ), [stories, suggestedUsers, user?.id, navigation, handleUserFollow]);

  // Render list footer
  const renderListFooter = useCallback(() => {
    if (!isLoading || activities.length === 0) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner size="small" />
        <Text style={styles.loadingText}>Loading more activities...</Text>
      </View>
    );
  }, [isLoading, activities.length]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (isLoading && activities.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading your feed...</Text>
        </View>
      );
    }

    return (
      <EmptyState
        icon="users"
        title="Your feed is empty"
        subtitle="Follow some users or join events to see activity here"
        actionText="Discover People"
        onAction={() => navigation.navigate('DiscoverUsers')}
      />
    );
  }, [isLoading, activities.length, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <FeedHeader
        title="Activity"
        onSearchPress={() => navigation.navigate('SearchUsers')}
        onMessagesPress={() => navigation.navigate('Messages')}
        onNotificationsPress={() => navigation.navigate('Notifications')}
        unreadCount={0} // TODO: Get from notifications state
      />

      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          activities.length === 0 && styles.emptyListContainer,
        ]}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        testID="activity-feed-list"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  storyCarousel: {
    marginBottom: 16,
  },
  suggestedUsers: {
    marginBottom: 16,
  },
  activityCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
```

**Create DiscoverUsersScreen component:**
```bash
touch src/screens/core/social/DiscoverUsersScreen.tsx
```

**Implement DiscoverUsersScreen.tsx for user discovery:**
- Search users by name, interests, location
- Filter by mutual connections, interests, location
- Suggested users based on activity and connections
- User preview cards with follow actions
- Recently joined users section

### Step 2: Create Direct Messaging Screens (2.5 hours)

**Create MessagesScreen component:**
```bash
touch src/screens/core/social/MessagesScreen.tsx
```

**Implement MessagesScreen.tsx for message management:**
- Conversation list with last message preview
- Unread message indicators
- Search conversations
- Archive and delete conversations
- Online status indicators
- Message request filtering

**Create ChatScreen component:**
```bash
touch src/screens/core/social/ChatScreen.tsx
```

**Implement ChatScreen.tsx for individual conversations:**
- Real-time messaging with WebSocket connection
- Message bubbles with timestamps
- Typing indicators
- Read receipts
- Image and file sharing
- Message reactions
- Reply to specific messages
- Message search within conversation

### Step 3: Create Notifications and Activity Screens (2 hours)

**Create NotificationsScreen component:**
```bash
touch src/screens/core/social/NotificationsScreen.tsx
```

**Implement NotificationsScreen.tsx for notification management:**
```typescript
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '../../../components/shared/atoms/Button';
import { LoadingSpinner } from '../../../components/shared/atoms/LoadingSpinner';
import { EmptyState } from '../../../components/shared/molecules/EmptyState';

// Notification-specific components
import { NotificationCard } from '../../../components/core/molecules/NotificationCard';
import { NotificationHeader } from '../../../components/core/molecules/NotificationHeader';
import { NotificationFilters } from '../../../components/core/organisms/NotificationFilters';

// Hooks
import { useNotifications } from '../../../hooks/core/useNotifications';
import { useAuth } from '../../../hooks/shared/useAuth';
import { useErrorHandler } from '../../../hooks/shared/useErrorHandler';

// Types
import type { Notification, NotificationFilters as NotificationFiltersType } from '../../../types/notifications';
import type { NavigationProp } from '@react-navigation/native';
import type { CoreStackParamList } from '../../../navigation/CoreNavigator';

/**
 * NotificationsScreen Component
 *
 * Displays and manages user notifications including event updates,
 * social interactions, and system notifications.
 *
 * Features:
 * - Categorized notifications (events, social, system)
 * - Mark as read/unread functionality
 * - Bulk actions (mark all read, delete)
 * - Filter by notification type and date
 * - Real-time notification updates
 * - Deep linking to relevant content
 */

type NotificationsScreenNavigationProp = NavigationProp<CoreStackParamList, 'Notifications'>;

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { handleError } = useErrorHandler();

  // Redux state
  const {
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    hasMore,
    filters,
    error,
  } = useSelector((state: RootState) => state.notifications);

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Custom hooks
  const {
    loadNotifications,
    loadMoreNotifications,
    refreshNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    applyFilters,
  } = useNotifications();

  // Load notifications on screen focus
  useFocusEffect(
    useCallback(() => {
      if (notifications.length === 0) {
        loadNotifications();
      }
    }, [loadNotifications, notifications.length])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    try {
      await refreshNotifications();
    } catch (error) {
      handleError(error);
    }
  }, [refreshNotifications, handleError]);

  // Handle load more notifications
  const handleLoadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      try {
        await loadMoreNotifications();
      } catch (error) {
        handleError(error);
      }
    }
  }, [isLoading, hasMore, loadMoreNotifications, handleError]);

  // Handle notification press
  const handleNotificationPress = useCallback(async (notification: Notification) => {
    try {
      // Mark as read if unread
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // Navigate to relevant content
      switch (notification.type) {
        case 'event_rsvp':
        case 'event_update':
        case 'event_reminder':
          navigation.navigate('EventDetails', { eventId: notification.relatedId });
          break;
        case 'follow':
        case 'profile_view':
          navigation.navigate('Profile', { userId: notification.fromUserId });
          break;
        case 'message':
          navigation.navigate('Chat', { userId: notification.fromUserId });
          break;
        case 'activity_like':
        case 'activity_comment':
          navigation.navigate('ActivityComments', { activityId: notification.relatedId });
          break;
        default:
          // Handle other notification types
          break;
      }
    } catch (error) {
      handleError(error);
    }
  }, [markAsRead, navigation, handleError]);

  // Handle notification long press (selection mode)
  const handleNotificationLongPress = useCallback((notificationId: string) => {
    setIsSelectionMode(true);
    setSelectedNotifications([notificationId]);
  }, []);

  // Handle notification selection
  const handleNotificationSelect = useCallback((notificationId: string) => {
    if (!isSelectionMode) return;

    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  }, [isSelectionMode]);

  // Handle bulk mark as read
  const handleBulkMarkAsRead = useCallback(async () => {
    try {
      await Promise.all(selectedNotifications.map(id => markAsRead(id)));
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    } catch (error) {
      handleError(error);
    }
  }, [selectedNotifications, markAsRead, handleError]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setSelectedNotifications([]);
      setIsSelectionMode(false);
    } catch (error) {
      handleError(error);
    }
  }, [selectedNotifications, deleteNotification, handleError]);

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      handleError(error);
    }
  }, [markAllAsRead, handleError]);

  // Handle filter application
  const handleApplyFilters = useCallback(async (newFilters: NotificationFiltersType) => {
    try {
      setShowFilters(false);
      await applyFilters(newFilters);
    } catch (error) {
      handleError(error);
    }
  }, [applyFilters, handleError]);

  // Render notification item
  const renderNotificationItem = useCallback(({ item }: { item: Notification }) => (
    <NotificationCard
      notification={item}
      isSelected={selectedNotifications.includes(item.id)}
      isSelectionMode={isSelectionMode}
      onPress={() => handleNotificationPress(item)}
      onLongPress={() => handleNotificationLongPress(item.id)}
      onSelect={() => handleNotificationSelect(item.id)}
      onMarkAsRead={() => markAsRead(item.id)}
      onMarkAsUnread={() => markAsUnread(item.id)}
      onDelete={() => deleteNotification(item.id)}
      style={styles.notificationCard}
    />
  ), [
    selectedNotifications,
    isSelectionMode,
    handleNotificationPress,
    handleNotificationLongPress,
    handleNotificationSelect,
    markAsRead,
    markAsUnread,
    deleteNotification,
  ]);

  // Render list footer
  const renderListFooter = useCallback(() => {
    if (!isLoading || notifications.length === 0) return null;

    return (
      <View style={styles.loadingFooter}>
        <LoadingSpinner size="small" />
        <Text style={styles.loadingText}>Loading more notifications...</Text>
      </View>
    );
  }, [isLoading, notifications.length]);

  // Render empty state
  const renderEmptyState = useCallback(() => {
    if (isLoading && notifications.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }

    return (
      <EmptyState
        icon="bell"
        title="No notifications"
        subtitle="You're all caught up! New notifications will appear here."
        actionText="Explore Events"
        onAction={() => navigation.navigate('EventList')}
      />
    );
  }, [isLoading, notifications.length, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <NotificationHeader
        title="Notifications"
        unreadCount={unreadCount}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedNotifications.length}
        onFilterPress={() => setShowFilters(true)}
        onMarkAllRead={handleMarkAllAsRead}
        onBulkMarkRead={handleBulkMarkAsRead}
        onBulkDelete={handleBulkDelete}
        onCancelSelection={() => {
          setIsSelectionMode(false);
          setSelectedNotifications([]);
        }}
        filterCount={Object.keys(filters).length}
      />

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          notifications.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        testID="notifications-list"
      />

      {/* Notification Filters Modal */}
      <NotificationFilters
        visible={showFilters}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  notificationCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
```

**Create ActivityCommentsScreen component:**
```bash
touch src/screens/core/social/ActivityCommentsScreen.tsx
```

**Implement ActivityCommentsScreen.tsx for activity interactions:**
- Activity detail view with full content
- Comments list with threading support
- Like and reaction functionality
- Comment composition with mentions
- Share and report options
- Real-time comment updates

### Step 4: Create Social-Specific Components and Hooks (1 hour)

**Create ActivityCard molecule component:**
```bash
touch src/components/core/molecules/ActivityCard.tsx
```

**Implement ActivityCard.tsx:**
- User avatar and name with timestamp
- Activity content (text, images, event references)
- Interaction buttons (like, comment, share)
- Like count and recent likers display
- Activity type indicators

**Create NotificationCard molecule component:**
```bash
touch src/components/core/molecules/NotificationCard.tsx
```

**Implement NotificationCard.tsx:**
- Notification icon based on type
- User avatar and notification text
- Timestamp and read status indicator
- Action buttons for quick responses
- Selection mode support

**Create useSocial hook:**
```bash
touch src/hooks/core/useSocial.ts
```

**Implement useSocial.ts:**
- Activity feed management
- Social interactions (like, comment, share)
- User following and discovery
- Real-time updates handling
- Caching and state management

**Create useNotifications hook:**
```bash
touch src/hooks/core/useNotifications.ts
```

**Implement useNotifications.ts:**
- Notification CRUD operations
- Real-time notification updates
- Push notification handling
- Notification preferences management
- Badge count management

## Acceptance Criteria

### Functional Requirements
- [ ] Activity feed displays personalized content with infinite scrolling
- [ ] Direct messaging works with real-time updates
- [ ] Notifications display and navigate to relevant content
- [ ] Social interactions (like, comment, share) work correctly
- [ ] User discovery and following functionality works
- [ ] Search functionality works across users and content
- [ ] Real-time updates work for messages and notifications
- [ ] Push notifications integrate correctly
- [ ] Story features work if implemented

### Technical Requirements
- [ ] All screens follow established component template patterns
- [ ] Redux integration for social state management
- [ ] WebSocket integration for real-time features
- [ ] TypeScript types are properly defined and used
- [ ] Accessibility labels and hints are implemented
- [ ] Error handling follows established patterns
- [ ] API integration uses established service patterns
- [ ] Performance optimized for real-time updates

### Design Requirements
- [ ] Screens match design system specifications exactly
- [ ] Social interaction patterns are consistent
- [ ] Message bubbles follow platform conventions
- [ ] Notification designs are clear and actionable
- [ ] Loading and error states are visually consistent
- [ ] Real-time indicators are subtle but clear

### Testing Requirements
- [ ] Unit tests for all custom hooks
- [ ] Component tests for all screen components
- [ ] Integration tests for social flows
- [ ] Real-time functionality testing
- [ ] Manual testing on iOS and Android devices
- [ ] Performance testing with large datasets
- [ ] Push notification testing

## Manual Testing Instructions

### Test Case 1: Activity Feed
1. Open activity feed and verify personalized content
2. Test pull-to-refresh and infinite scrolling
3. Test like, comment, and share interactions
4. Test story carousel if implemented
5. Test suggested users section
6. Verify real-time updates appear

### Test Case 2: Direct Messaging
1. Navigate to messages and verify conversation list
2. Open a conversation and test real-time messaging
3. Test image and file sharing
4. Test typing indicators and read receipts
5. Test message search and reactions
6. Test conversation management (archive, delete)

### Test Case 3: Notifications
1. Open notifications and verify categorization
2. Test notification interactions and navigation
3. Test mark as read/unread functionality
4. Test bulk actions and filtering
5. Test push notification reception
6. Verify badge counts update correctly

### Test Case 4: Social Discovery
1. Test user search and filtering
2. Test follow/unfollow functionality
3. Test suggested users algorithm
4. Test mutual connections display
5. Test user profile previews

## API Integration Requirements

### Social Endpoints Used
- `GET /api/social/feed` - Get activity feed
- `POST /api/social/activities/{id}/like` - Like activity
- `POST /api/social/activities/{id}/comment` - Comment on activity
- `POST /api/social/activities/{id}/share` - Share activity
- `GET /api/social/users/discover` - Discover users
- `POST /api/social/users/{id}/follow` - Follow user
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read

### Real-time Integration
- WebSocket connection for live messaging
- Push notification service integration
- Real-time activity feed updates
- Typing indicators and presence
- Live notification delivery

## Dependencies and Integration Points

### Required Components (from Agent 4)
- Button, Input, SearchInput components
- LoadingSpinner, EmptyState components
- Navigation system setup
- Redux store configuration
- WebSocket service setup

### API Dependencies (from Agent 2)
- Social features endpoints
- Real-time messaging infrastructure
- Push notification service
- User discovery algorithms
- Activity feed generation

### Design System Dependencies
- Social interaction patterns
- Message bubble specifications
- Notification design patterns
- Activity card layouts
- Real-time indicator designs

## Completion Checklist

- [ ] All screen components implemented and tested
- [ ] Social-specific components created
- [ ] Custom hooks implemented and tested
- [ ] Navigation configuration updated
- [ ] Redux integration working
- [ ] WebSocket integration complete
- [ ] API integration complete
- [ ] Real-time features working
- [ ] Push notifications working
- [ ] Social interactions working
- [ ] Manual testing completed
- [ ] Performance testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Social features complete the core mobile experience
- Real-time patterns established for other features
- Notification patterns can be extended for system alerts
- Messaging patterns can be reused for group communications
- Social interaction patterns established for community features
- Performance optimizations important for real-time features
