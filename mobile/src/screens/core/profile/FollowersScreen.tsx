import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * FollowersScreen Component
 * 
 * Displays followers and following lists with social connection management.
 * 
 * Features:
 * - Followers and following lists
 * - Search and filter users
 * - Follow/unfollow actions
 * - User profile previews
 * - Mutual connections display
 * - Remove followers functionality
 */

export const FollowersScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  // Route params
  const { type = 'followers', userId, title = 'Followers' } = route.params || {};
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(type);

  // Mock data for development
  const mockFollowers = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Wilson',
      username: '@sarahw',
      avatar: null,
      bio: 'Elementary school teacher who loves creating engaging learning experiences.',
      isFollowing: true,
      isFollowingYou: true,
      mutualConnections: 5,
      joinedDate: '2023-08-15',
    },
    {
      id: '2',
      firstName: 'Mike',
      lastName: 'Johnson',
      username: '@mikej',
      avatar: null,
      bio: 'Dad of two, passionate about outdoor activities and sports.',
      isFollowing: false,
      isFollowingYou: true,
      mutualConnections: 3,
      joinedDate: '2023-09-20',
    },
    {
      id: '3',
      firstName: 'Emily',
      lastName: 'Chen',
      username: '@emilyc',
      avatar: null,
      bio: 'Art enthusiast and creative workshop organizer.',
      isFollowing: true,
      isFollowingYou: true,
      mutualConnections: 8,
      joinedDate: '2023-07-10',
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Rodriguez',
      username: '@davidr',
      avatar: null,
      bio: 'Science educator and STEM advocate.',
      isFollowing: false,
      isFollowingYou: true,
      mutualConnections: 2,
      joinedDate: '2023-10-05',
    },
  ];

  const mockFollowing = [
    {
      id: '5',
      firstName: 'Lisa',
      lastName: 'Anderson',
      username: '@lisaa',
      avatar: null,
      bio: 'Music teacher and children\'s choir director.',
      isFollowing: true,
      isFollowingYou: false,
      mutualConnections: 4,
      joinedDate: '2023-06-25',
    },
    {
      id: '6',
      firstName: 'Tom',
      lastName: 'Brown',
      username: '@tomb',
      avatar: null,
      bio: 'Youth sports coach and fitness enthusiast.',
      isFollowing: true,
      isFollowingYou: true,
      mutualConnections: 6,
      joinedDate: '2023-08-30',
    },
  ];

  // Get current data based on active tab
  const currentData = activeTab === 'followers' ? mockFollowers : mockFollowing;

  // Filter data based on search query
  const filteredData = currentData.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Followers screen focused:', { type, userId, title });
    }, [type, userId, title])
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
  const handleFollowToggle = useCallback(async (user: any) => {
    try {
      console.log(`${user.isFollowing ? 'Unfollow' : 'Follow'} user:`, user.id);
      Alert.alert(
        `${user.isFollowing ? 'Unfollow' : 'Follow'} User`,
        `${user.isFollowing ? 'Unfollow' : 'Follow'} ${user.firstName} ${user.lastName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: user.isFollowing ? 'Unfollow' : 'Follow',
            onPress: () => {
              console.log(`${user.isFollowing ? 'Unfollowed' : 'Followed'} user:`, user.id);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Follow toggle failed:', error);
    }
  }, []);

  // Handle remove follower
  const handleRemoveFollower = useCallback(async (user: any) => {
    Alert.alert(
      'Remove Follower',
      `Remove ${user.firstName} ${user.lastName} from your followers?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            console.log('Remove follower:', user.id);
            Alert.alert('Follower Removed', `${user.firstName} has been removed from your followers.`);
          },
        },
      ]
    );
  }, []);

  // Handle user profile press
  const handleUserPress = useCallback((user: any) => {
    navigation.navigate('Profile', { userId: user.id });
  }, [navigation]);

  // Render user item
  const renderUserItem = useCallback(({ item: user }: { item: any }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(user)}
    >
      <View style={styles.userInfo}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => handleUserPress(user)}
        >
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.userDetails}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            {user.isFollowingYou && (
              <View style={styles.followsYouBadge}>
                <Text style={styles.followsYouText}>Follows you</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.userUsername}>{user.username}</Text>
          
          {user.bio && (
            <Text style={styles.userBio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}
          
          {user.mutualConnections > 0 && (
            <Text style={styles.mutualConnections}>
              {user.mutualConnections} mutual connection{user.mutualConnections !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.userActions}>
        {activeTab === 'followers' ? (
          <View style={styles.followerActions}>
            {user.isFollowing ? (
              <Button
                variant="outline"
                size="sm"
                onPress={() => handleFollowToggle(user)}
                style={styles.actionButton}
              >
                Following
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onPress={() => handleFollowToggle(user)}
                style={styles.actionButton}
              >
                Follow Back
              </Button>
            )}
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => {
                Alert.alert(
                  'Follower Options',
                  `Options for ${user.firstName} ${user.lastName}`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove Follower', style: 'destructive', onPress: () => handleRemoveFollower(user) },
                  ]
                );
              }}
            >
              <Text style={styles.moreButtonText}>⋯</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            variant={user.isFollowing ? "outline" : "primary"}
            size="sm"
            onPress={() => handleFollowToggle(user)}
            style={styles.actionButton}
          >
            {user.isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </View>
    </TouchableOpacity>
  ), [activeTab, handleUserPress, handleFollowToggle, handleRemoveFollower]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {searchQuery 
          ? 'No users found'
          : activeTab === 'followers' 
            ? 'No followers yet'
            : 'Not following anyone yet'
        }
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : activeTab === 'followers'
            ? 'When people follow you, they\'ll appear here'
            : 'Discover and follow people to see them here'
        }
      </Text>
      {!searchQuery && activeTab === 'following' && (
        <Button
          variant="primary"
          size="medium"
          onPress={() => navigation.navigate('DiscoverUsers')}
          style={styles.emptyStateButton}
        >
          Discover People
        </Button>
      )}
    </View>
  ), [searchQuery, activeTab, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'followers' && styles.activeTab]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.activeTabText]}>
            Followers ({mockFollowers.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Following ({mockFollowing.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Users List */}
      <FlatList
        data={filteredData}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredData.length === 0 && styles.emptyListContainer,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  followsYouBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#EFF6FF',
    borderRadius: 4,
  },
  followsYouText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
  },
  userUsername: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  mutualConnections: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  userActions: {
    marginLeft: 12,
  },
  followerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    minWidth: 160,
  },
});

export default FollowersScreen;
