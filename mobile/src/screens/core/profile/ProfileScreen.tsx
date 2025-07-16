import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * ProfileScreen Component
 * 
 * Displays user profile information including personal details, interests,
 * hosted events, and social connections. Supports both own profile and
 * other users' profiles with appropriate permissions.
 * 
 * Features:
 * - Profile header with avatar, name, bio
 * - Profile statistics (events hosted, attended, followers)
 * - Interest tags and categories
 * - Hosted and attended events grid
 * - Follow/unfollow functionality for other users
 * - Settings access for own profile
 * - Share profile functionality
 */

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  // Route params
  const userId = route.params?.userId || 'current_user';
  const isOwnProfile = userId === 'current_user';
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'hosted' | 'attended'>('hosted');

  // Mock data for development
  const mockProfile = {
    id: userId,
    firstName: isOwnProfile ? 'John' : 'Sarah',
    lastName: isOwnProfile ? 'Doe' : 'Wilson',
    username: isOwnProfile ? '@johndoe' : '@sarahw',
    email: isOwnProfile ? 'john@example.com' : 'sarah@example.com',
    bio: isOwnProfile 
      ? 'Passionate about bringing fun and educational experiences to children. Love organizing creative activities and outdoor adventures!'
      : 'Elementary school teacher who loves creating engaging learning experiences. Always looking for new ways to make education fun!',
    location: isOwnProfile ? 'San Francisco, CA' : 'Oakland, CA',
    avatar: null,
    coverPhoto: null,
    isVerified: false,
    isFollowing: !isOwnProfile ? false : undefined,
    followersCount: isOwnProfile ? 156 : 89,
    followingCount: isOwnProfile ? 78 : 45,
    eventsHosted: isOwnProfile ? 12 : 8,
    eventsAttended: isOwnProfile ? 34 : 23,
    joinedDate: '2023-06-15',
    interests: [
      { id: '1', name: 'Arts & Crafts', color: '#F59E0B' },
      { id: '2', name: 'Science', color: '#10B981' },
      { id: '3', name: 'Outdoor Activities', color: '#3B82F6' },
      { id: '4', name: 'Music', color: '#8B5CF6' },
      { id: '5', name: 'Sports', color: '#EF4444' },
    ],
    hostedEvents: [
      {
        id: '1',
        title: 'Science Discovery Workshop',
        date: '2024-01-20',
        image: null,
        attendees: 15
      },
      {
        id: '2',
        title: 'Art & Creativity Session',
        date: '2024-01-18',
        image: null,
        attendees: 12
      },
      {
        id: '3',
        title: 'Nature Exploration Walk',
        date: '2024-01-15',
        image: null,
        attendees: 8
      }
    ],
    attendedEvents: [
      {
        id: '4',
        title: 'Community Garden Project',
        date: '2024-01-22',
        image: null,
        host: 'Green Thumb Society'
      },
      {
        id: '5',
        title: 'Kids Coding Bootcamp',
        date: '2024-01-19',
        image: null,
        host: 'Tech for Kids'
      }
    ]
  };

  // Load profile on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Profile screen focused for user:', userId);
    }, [userId])
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

  // Handle follow/unfollow
  const handleFollowToggle = useCallback(async () => {
    if (isOwnProfile) return;
    
    try {
      console.log('Toggle follow for user:', userId);
      Alert.alert(
        'Follow User',
        `${mockProfile.isFollowing ? 'Unfollow' : 'Follow'} ${mockProfile.firstName} ${mockProfile.lastName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: mockProfile.isFollowing ? 'Unfollow' : 'Follow',
            onPress: () => {
              console.log(`${mockProfile.isFollowing ? 'Unfollowed' : 'Followed'} user:`, userId);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Follow toggle failed:', error);
    }
  }, [isOwnProfile, userId, mockProfile]);

  // Handle block user
  const handleBlockUser = useCallback(async () => {
    if (isOwnProfile) return;
    
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${mockProfile.firstName}? They won't be able to see your profile or contact you.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            console.log('Block user:', userId);
            navigation.goBack();
          },
        },
      ]
    );
  }, [isOwnProfile, userId, mockProfile, navigation]);

  // Handle report user
  const handleReportUser = useCallback(async () => {
    if (isOwnProfile) return;
    
    Alert.alert('Report User', 'Report user functionality would be implemented here.');
  }, [isOwnProfile]);

  // Handle share profile
  const handleShareProfile = useCallback(async () => {
    try {
      const shareUrl = `https://funlynk.com/profile/${mockProfile.id}`;
      Alert.alert('Share Profile', `Share URL: ${shareUrl}`);
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [mockProfile.id]);

  // Handle event press
  const handleEventPress = useCallback((event: any) => {
    console.log('Navigate to event:', event.id);
    Alert.alert('Event Details', `Navigate to "${event.title}" details would be implemented here.`);
  }, []);

  // Handle stats press
  const handleStatsPress = useCallback((type: string) => {
    switch (type) {
      case 'followers':
        console.log('Navigate to followers list');
        Alert.alert('Followers', 'Followers list would be implemented here.');
        break;
      case 'following':
        console.log('Navigate to following list');
        Alert.alert('Following', 'Following list would be implemented here.');
        break;
      case 'hosted':
        setActiveTab('hosted');
        break;
      case 'attended':
        setActiveTab('attended');
        break;
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleShareProfile}>
          <Text style={styles.shareButton}>Share</Text>
        </TouchableOpacity>
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {mockProfile.avatar ? (
              <Image source={{ uri: mockProfile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {mockProfile.firstName.charAt(0)}{mockProfile.lastName.charAt(0)}
                </Text>
              </View>
            )}
            {mockProfile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>
            {mockProfile.firstName} {mockProfile.lastName}
          </Text>
          <Text style={styles.profileUsername}>{mockProfile.username}</Text>
          
          {mockProfile.location && (
            <Text style={styles.profileLocation}>📍 {mockProfile.location}</Text>
          )}
          
          <Text style={styles.joinedDate}>
            Joined {new Date(mockProfile.joinedDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isOwnProfile ? (
            <>
              <Button
                variant="outline"
                size="medium"
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.actionButton}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="medium"
                onPress={() => navigation.navigate('Settings')}
                style={styles.actionButton}
              >
                Settings
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={mockProfile.isFollowing ? "outline" : "primary"}
                size="medium"
                onPress={handleFollowToggle}
                style={styles.actionButton}
              >
                {mockProfile.isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                size="medium"
                onPress={() => Alert.alert('Message', 'Direct messaging would be implemented here.')}
                style={styles.actionButton}
              >
                Message
              </Button>
              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => {
                  Alert.alert(
                    'Profile Options',
                    'Choose an action',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Report User', onPress: handleReportUser },
                      { text: 'Block User', style: 'destructive', onPress: handleBlockUser },
                    ]
                  );
                }}
              >
                <Text style={styles.moreButtonText}>⋯</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Profile Statistics */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => handleStatsPress('hosted')}
          >
            <Text style={styles.statValue}>{mockProfile.eventsHosted}</Text>
            <Text style={styles.statLabel}>Hosted</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => handleStatsPress('attended')}
          >
            <Text style={styles.statValue}>{mockProfile.eventsAttended}</Text>
            <Text style={styles.statLabel}>Attended</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => handleStatsPress('followers')}
          >
            <Text style={styles.statValue}>{mockProfile.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => handleStatsPress('following')}
          >
            <Text style={styles.statValue}>{mockProfile.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Bio Section */}
        {mockProfile.bio && (
          <View style={styles.bioSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bioText}>{mockProfile.bio}</Text>
          </View>
        )}

        {/* Interests Section */}
        {mockProfile.interests && mockProfile.interests.length > 0 && (
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsContainer}>
              {mockProfile.interests.map((interest) => (
                <TouchableOpacity
                  key={interest.id}
                  style={[styles.interestChip, { backgroundColor: interest.color + '20' }]}
                  onPress={() => {
                    Alert.alert('Interest', `Explore "${interest.name}" events would be implemented here.`);
                  }}
                >
                  <Text style={[styles.interestText, { color: interest.color }]}>
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'hosted' && styles.activeTab]}
              onPress={() => setActiveTab('hosted')}
            >
              <Text style={[styles.tabText, activeTab === 'hosted' && styles.activeTabText]}>
                Hosted ({mockProfile.eventsHosted})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'attended' && styles.activeTab]}
              onPress={() => setActiveTab('attended')}
            >
              <Text style={[styles.tabText, activeTab === 'attended' && styles.activeTabText]}>
                Attended ({mockProfile.eventsAttended})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventsGrid}>
            {(activeTab === 'hosted' ? mockProfile.hostedEvents : mockProfile.attendedEvents).map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventImagePlaceholder}>
                  <Text style={styles.eventImageText}>📅</Text>
                </View>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {event.title}
                </Text>
                <Text style={styles.eventDate}>
                  {new Date(event.date).toLocaleDateString()}
                </Text>
                <Text style={styles.eventMeta}>
                  {activeTab === 'hosted' 
                    ? `${event.attendees} attendees`
                    : `by ${event.host}`
                  }
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(activeTab === 'hosted' ? mockProfile.hostedEvents : mockProfile.attendedEvents).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>
                {activeTab === 'hosted' 
                  ? isOwnProfile 
                    ? "You haven't hosted any events yet"
                    : `${mockProfile.firstName} hasn't hosted any events yet`
                  : isOwnProfile
                    ? "You haven't attended any events yet"
                    : `${mockProfile.firstName} hasn't attended any public events`
                }
              </Text>
              {activeTab === 'hosted' && isOwnProfile && (
                <Button
                  variant="primary"
                  size="medium"
                  onPress={() => Alert.alert('Create Event', 'Event creation would be implemented here.')}
                  style={styles.emptyStateButton}
                >
                  Create Event
                </Button>
              )}
            </View>
          )}
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
  shareButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  profileLocation: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  joinedDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  bioSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  interestsSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  eventsSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
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
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  eventCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventImageText: {
    fontSize: 24,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    minWidth: 140,
  },
});

export default ProfileScreen;
