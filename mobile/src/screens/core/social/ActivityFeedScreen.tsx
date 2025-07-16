import React, { useState, useEffect, useCallback } from 'react';
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

export const ActivityFeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Mock data for development
  const mockActivities = [
    {
      id: '1',
      type: 'event_created',
      user: {
        id: 'user_1',
        firstName: 'Sarah',
        lastName: 'Wilson',
        username: '@sarahw',
        avatar: null,
      },
      timestamp: '2024-01-16T10:30:00Z',
      content: {
        text: 'Just created an exciting new science workshop for kids! 🧪✨',
        event: {
          id: 'event_1',
          title: 'Science Discovery Workshop',
          date: '2024-01-20',
          location: 'Community Center',
          image: null,
        }
      },
      interactions: {
        likes: 12,
        comments: 3,
        shares: 2,
        isLiked: false,
      }
    },
    {
      id: '2',
      type: 'event_attended',
      user: {
        id: 'user_2',
        firstName: 'Mike',
        lastName: 'Johnson',
        username: '@mikej',
        avatar: null,
      },
      timestamp: '2024-01-16T09:15:00Z',
      content: {
        text: 'Had an amazing time at the Art & Creativity session with my daughter! Thanks for organizing this wonderful event.',
        event: {
          id: 'event_2',
          title: 'Art & Creativity Session',
          date: '2024-01-15',
          location: 'Art Studio',
          image: null,
        },
        images: [
          { id: '1', uri: null, caption: 'My daughter\'s masterpiece!' },
          { id: '2', uri: null, caption: 'So much creativity!' }
        ]
      },
      interactions: {
        likes: 8,
        comments: 5,
        shares: 1,
        isLiked: true,
      }
    },
    {
      id: '3',
      type: 'user_followed',
      user: {
        id: 'user_3',
        firstName: 'Emily',
        lastName: 'Chen',
        username: '@emilyc',
        avatar: null,
      },
      timestamp: '2024-01-16T08:45:00Z',
      content: {
        text: 'Started following some amazing event organizers in the community!',
        followedUsers: [
          { id: 'user_4', firstName: 'David', lastName: 'Rodriguez', avatar: null },
          { id: 'user_5', firstName: 'Lisa', lastName: 'Anderson', avatar: null },
        ]
      },
      interactions: {
        likes: 4,
        comments: 1,
        shares: 0,
        isLiked: false,
      }
    },
    {
      id: '4',
      type: 'achievement',
      user: {
        id: 'user_4',
        firstName: 'David',
        lastName: 'Rodriguez',
        username: '@davidr',
        avatar: null,
      },
      timestamp: '2024-01-15T16:20:00Z',
      content: {
        text: 'Reached 50 events hosted! Thank you to everyone who has joined my science and STEM workshops. Here\'s to many more learning adventures! 🎉',
        achievement: {
          type: 'events_hosted',
          milestone: 50,
          badge: '🏆',
        }
      },
      interactions: {
        likes: 25,
        comments: 8,
        shares: 3,
        isLiked: false,
      }
    }
  ];

  const mockSuggestedUsers = [
    {
      id: 'suggested_1',
      firstName: 'Alex',
      lastName: 'Thompson',
      username: '@alext',
      avatar: null,
      bio: 'Music teacher and children\'s choir director',
      mutualConnections: 3,
      isFollowing: false,
    },
    {
      id: 'suggested_2',
      firstName: 'Jordan',
      lastName: 'Kim',
      username: '@jordank',
      avatar: null,
      bio: 'Outdoor adventure guide for families',
      mutualConnections: 5,
      isFollowing: false,
    },
  ];

  // Load feed on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Activity feed focused');
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

  // Handle load more activities
  const handleLoadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In real app, would append new activities
      } catch (error) {
        console.error('Load more failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [isLoading, hasMore]);

  // Handle activity like/unlike
  const handleActivityLike = useCallback(async (activityId: string, isLiked: boolean) => {
    try {
      console.log(`${isLiked ? 'Unlike' : 'Like'} activity:`, activityId);
      // In real app, would update activity state
    } catch (error) {
      console.error('Like toggle failed:', error);
    }
  }, []);

  // Handle activity comment
  const handleActivityComment = useCallback((activityId: string) => {
    navigation.navigate('ActivityComments', { activityId });
  }, [navigation]);

  // Handle activity share
  const handleActivityShare = useCallback(async (activityId: string) => {
    try {
      console.log('Share activity:', activityId);
      Alert.alert('Share Activity', 'Activity sharing functionality would be implemented here.');
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, []);

  // Handle user press
  const handleUserPress = useCallback((userId: string) => {
    navigation.navigate('Profile', { userId });
  }, [navigation]);

  // Handle event press
  const handleEventPress = useCallback((eventId: string) => {
    console.log('Navigate to event:', eventId);
    Alert.alert('Event Details', 'Event details navigation would be implemented here.');
  }, []);

  // Handle follow user
  const handleFollowUser = useCallback(async (userId: string, isFollowing: boolean) => {
    try {
      console.log(`${isFollowing ? 'Unfollow' : 'Follow'} user:`, userId);
      // In real app, would update user following state
    } catch (error) {
      console.error('Follow toggle failed:', error);
    }
  }, []);

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

  // Render activity item
  const renderActivityItem = useCallback(({ item: activity }: { item: any }) => (
    <View style={styles.activityCard}>
      {/* User Header */}
      <View style={styles.activityHeader}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => handleUserPress(activity.user.id)}
        >
          <View style={styles.avatarContainer}>
            {activity.user.avatar ? (
              <Image source={{ uri: activity.user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {activity.user.firstName.charAt(0)}{activity.user.lastName.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {activity.user.firstName} {activity.user.lastName}
            </Text>
            <Text style={styles.activityTime}>
              {formatTimestamp(activity.timestamp)}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Activity Content */}
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>{activity.content.text}</Text>
        
        {/* Event Content */}
        {activity.content.event && (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => handleEventPress(activity.content.event.id)}
          >
            <View style={styles.eventImagePlaceholder}>
              <Text style={styles.eventImageText}>📅</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{activity.content.event.title}</Text>
              <Text style={styles.eventDetails}>
                {new Date(activity.content.event.date).toLocaleDateString()} • {activity.content.event.location}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Achievement Content */}
        {activity.content.achievement && (
          <View style={styles.achievementCard}>
            <Text style={styles.achievementBadge}>{activity.content.achievement.badge}</Text>
            <Text style={styles.achievementText}>
              {activity.content.achievement.milestone} {activity.content.achievement.type.replace('_', ' ')} milestone reached!
            </Text>
          </View>
        )}

        {/* Images Content */}
        {activity.content.images && (
          <View style={styles.imagesContainer}>
            {activity.content.images.map((image: any) => (
              <View key={image.id} style={styles.imageCard}>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imageText}>🖼️</Text>
                </View>
                <Text style={styles.imageCaption}>{image.caption}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Activity Actions */}
      <View style={styles.activityActions}>
        <TouchableOpacity
          style={[styles.actionButton, activity.interactions.isLiked && styles.likedButton]}
          onPress={() => handleActivityLike(activity.id, activity.interactions.isLiked)}
        >
          <Text style={[styles.actionIcon, activity.interactions.isLiked && styles.likedIcon]}>
            {activity.interactions.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.actionText, activity.interactions.isLiked && styles.likedText]}>
            {activity.interactions.likes}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleActivityComment(activity.id)}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{activity.interactions.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleActivityShare(activity.id)}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>{activity.interactions.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleUserPress, handleEventPress, handleActivityLike, handleActivityComment, handleActivityShare, formatTimestamp]);

  // Render suggested users header
  const renderSuggestedUsers = useCallback(() => (
    <View style={styles.suggestedSection}>
      <Text style={styles.suggestedTitle}>Suggested for you</Text>
      <View style={styles.suggestedUsers}>
        {mockSuggestedUsers.map((user) => (
          <View key={user.id} style={styles.suggestedUserCard}>
            <TouchableOpacity onPress={() => handleUserPress(user.id)}>
              <View style={styles.suggestedAvatar}>
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.suggestedUserName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.suggestedUserBio} numberOfLines={2}>
                {user.bio}
              </Text>
              <Text style={styles.mutualConnections}>
                {user.mutualConnections} mutual
              </Text>
            </TouchableOpacity>
            <Button
              variant="primary"
              size="sm"
              onPress={() => handleFollowUser(user.id, user.isFollowing)}
              style={styles.followButton}
            >
              Follow
            </Button>
          </View>
        ))}
      </View>
    </View>
  ), [handleUserPress, handleFollowUser]);

  // Render list footer
  const renderListFooter = useCallback(() => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more activities...</Text>
      </View>
    );
  }, [isLoading]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📱</Text>
      <Text style={styles.emptyStateTitle}>Your feed is empty</Text>
      <Text style={styles.emptyStateSubtitle}>
        Follow some users or join events to see activity here
      </Text>
      <Button
        variant="primary"
        size="medium"
        onPress={() => navigation.navigate('DiscoverUsers')}
        style={styles.emptyStateButton}
      >
        Discover People
      </Button>
    </View>
  ), [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('SearchUsers')}
          >
            <Text style={styles.headerButtonText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Messages')}
          >
            <Text style={styles.headerButtonText}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.headerButtonText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={mockActivities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          mockActivities.length === 0 && styles.emptyListContainer,
        ]}
        ListHeaderComponent={renderSuggestedUsers}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
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
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  suggestedSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  suggestedUsers: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestedUserCard: {
    width: 140,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestedAvatar: {
    marginBottom: 8,
  },
  suggestedUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestedUserBio: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 4,
  },
  mutualConnections: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 8,
  },
  followButton: {
    minWidth: 80,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  activityContent: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  activityText: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 12,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventImageText: {
    fontSize: 24,
  },
  eventInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  achievementBadge: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400E',
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  imageCard: {
    flex: 1,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageText: {
    fontSize: 32,
  },
  imageCaption: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  activityActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
  },
  likedButton: {
    backgroundColor: '#FEE2E2',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  likedIcon: {
    color: '#EF4444',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  likedText: {
    color: '#EF4444',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
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
    marginBottom: 24,
  },
  emptyStateButton: {
    minWidth: 160,
  },
});

export default ActivityFeedScreen;
