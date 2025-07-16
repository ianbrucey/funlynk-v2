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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp } from '@react-navigation/native';

/**
 * SearchUsersScreen Component
 * 
 * User discovery and search interface with filtering and recommendations.
 * 
 * Features:
 * - Real-time user search with filters
 * - Interest-based user recommendations
 * - Location-based discovery
 * - Recent searches and popular users
 * - Advanced filtering (interests, location, activity)
 * - Quick follow/unfollow actions
 * - User profile previews
 */

export const SearchUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'interests' | 'location' | 'recent'>('all');
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for development
  const mockUsers = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Wilson',
      username: '@sarahw',
      avatar: null,
      bio: 'Elementary school teacher who loves creating engaging learning experiences.',
      location: 'San Francisco, CA',
      interests: ['Science', 'Arts & Crafts', 'Outdoor Activities'],
      isFollowing: false,
      mutualConnections: 5,
      eventsHosted: 12,
      isOnline: true,
      matchReason: 'Similar interests in Science and Arts & Crafts',
    },
    {
      id: '2',
      firstName: 'Mike',
      lastName: 'Johnson',
      username: '@mikej',
      avatar: null,
      bio: 'Dad of two, passionate about outdoor activities and sports.',
      location: 'Oakland, CA',
      interests: ['Sports', 'Outdoor Activities', 'Music'],
      isFollowing: true,
      mutualConnections: 3,
      eventsHosted: 8,
      isOnline: false,
      matchReason: 'Lives nearby and shares interest in Outdoor Activities',
    },
    {
      id: '3',
      firstName: 'Emily',
      lastName: 'Chen',
      username: '@emilyc',
      avatar: null,
      bio: 'Art enthusiast and creative workshop organizer.',
      location: 'Berkeley, CA',
      interests: ['Arts & Crafts', 'Photography', 'Music'],
      isFollowing: false,
      mutualConnections: 8,
      eventsHosted: 15,
      isOnline: true,
      matchReason: 'Highly active in Arts & Crafts community',
    },
    {
      id: '4',
      firstName: 'David',
      lastName: 'Rodriguez',
      username: '@davidr',
      avatar: null,
      bio: 'Science educator and STEM advocate.',
      location: 'San Jose, CA',
      interests: ['Science', 'Technology', 'Reading'],
      isFollowing: false,
      mutualConnections: 2,
      eventsHosted: 20,
      isOnline: false,
      matchReason: 'Top Science event organizer in your area',
    },
    {
      id: '5',
      firstName: 'Lisa',
      lastName: 'Anderson',
      username: '@lisaa',
      avatar: null,
      bio: 'Music teacher and children\'s choir director.',
      location: 'Palo Alto, CA',
      interests: ['Music', 'Dance', 'Arts & Crafts'],
      isFollowing: false,
      mutualConnections: 4,
      eventsHosted: 10,
      isOnline: true,
      matchReason: 'Popular Music educator with great reviews',
    },
  ];

  const mockRecentSearches = [
    { id: '1', query: 'science teachers', timestamp: '2024-01-16T10:00:00Z' },
    { id: '2', query: 'art workshops', timestamp: '2024-01-15T14:30:00Z' },
    { id: '3', query: 'outdoor activities', timestamp: '2024-01-15T09:15:00Z' },
  ];

  const filterOptions = [
    { key: 'all', label: 'All Users', icon: '👥' },
    { key: 'interests', label: 'Similar Interests', icon: '🎯' },
    { key: 'location', label: 'Nearby', icon: '📍' },
    { key: 'recent', label: 'Recently Active', icon: '🕐' },
  ];

  // Filter users based on search query and selected filter
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = !searchQuery || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    switch (selectedFilter) {
      case 'interests':
        return user.matchReason.toLowerCase().includes('interest');
      case 'location':
        return user.matchReason.toLowerCase().includes('nearby') || user.matchReason.toLowerCase().includes('area');
      case 'recent':
        return user.isOnline;
      default:
        return true;
    }
  });

  // Load users on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Search users screen focused');
    }, [])
  );

  // Handle search with debounce
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timeoutId = setTimeout(() => {
        console.log('Search users:', searchQuery);
        setIsSearching(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery]);

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

  // Handle user press
  const handleUserPress = useCallback((user: any) => {
    navigation.navigate('Profile', { userId: user.id });
  }, [navigation]);

  // Handle follow/unfollow
  const handleFollowToggle = useCallback(async (user: any) => {
    try {
      console.log(`${user.isFollowing ? 'Unfollow' : 'Follow'} user:`, user.id);
      // In real app, would update user following state
    } catch (error) {
      console.error('Follow toggle failed:', error);
    }
  }, []);

  // Handle message user
  const handleMessageUser = useCallback((user: any) => {
    navigation.navigate('ChatScreen', { 
      conversationId: `new_${user.id}`,
      participant: user 
    });
  }, [navigation]);

  // Handle recent search press
  const handleRecentSearchPress = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Handle clear recent searches
  const handleClearRecentSearches = useCallback(() => {
    Alert.alert(
      'Clear Recent Searches',
      'Are you sure you want to clear all recent searches?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => console.log('Clear recent searches') },
      ]
    );
  }, []);

  // Render user item
  const renderUserItem = useCallback(({ item: user }: { item: any }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserPress(user)}
    >
      <View style={styles.userContent}>
        {/* Avatar with online indicator */}
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </Text>
            </View>
          )}
          {user.isOnline && (
            <View style={styles.onlineIndicator} />
          )}
        </View>

        {/* User details */}
        <View style={styles.userDetails}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.userUsername}>{user.username}</Text>
          </View>
          
          <Text style={styles.userBio} numberOfLines={2}>
            {user.bio}
          </Text>
          
          <View style={styles.userMeta}>
            <Text style={styles.userLocation}>📍 {user.location}</Text>
            <Text style={styles.userStats}>
              {user.eventsHosted} events • {user.mutualConnections} mutual
            </Text>
          </View>
          
          <Text style={styles.matchReason}>{user.matchReason}</Text>
          
          {/* Interests */}
          <View style={styles.interestsContainer}>
            {user.interests.slice(0, 3).map((interest: string, index: number) => (
              <View key={index} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
            {user.interests.length > 3 && (
              <Text style={styles.moreInterests}>+{user.interests.length - 3} more</Text>
            )}
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.userActions}>
        <Button
          variant={user.isFollowing ? "outline" : "primary"}
          size="sm"
          onPress={() => handleFollowToggle(user)}
          style={styles.followButton}
        >
          {user.isFollowing ? 'Following' : 'Follow'}
        </Button>
        
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleMessageUser(user)}
        >
          <Text style={styles.messageButtonText}>💬</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleUserPress, handleFollowToggle, handleMessageUser]);

  // Render recent searches
  const renderRecentSearches = useCallback(() => {
    if (searchQuery || mockRecentSearches.length === 0) return null;
    
    return (
      <View style={styles.recentSearchesSection}>
        <View style={styles.recentSearchesHeader}>
          <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={handleClearRecentSearches}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        </View>
        
        {mockRecentSearches.map((search) => (
          <TouchableOpacity
            key={search.id}
            style={styles.recentSearchItem}
            onPress={() => handleRecentSearchPress(search.query)}
          >
            <Text style={styles.recentSearchIcon}>🔍</Text>
            <Text style={styles.recentSearchText}>{search.query}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [searchQuery, handleRecentSearchPress, handleClearRecentSearches]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>
        {isSearching ? '🔍' : searchQuery ? '😔' : '👥'}
      </Text>
      <Text style={styles.emptyStateTitle}>
        {isSearching 
          ? 'Searching...'
          : searchQuery 
            ? 'No users found'
            : 'Discover People'
        }
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {isSearching 
          ? 'Finding users that match your search'
          : searchQuery 
            ? 'Try adjusting your search terms or filters'
            : 'Search for users by name, interests, or location'
        }
      </Text>
    </View>
  ), [isSearching, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover People</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users, interests, or locations..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCapitalize="none"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterTab, selectedFilter === filter.key && styles.activeFilterTab]}
            onPress={() => setSelectedFilter(filter.key as any)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[styles.filterText, selectedFilter === filter.key && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredUsers.length === 0 && styles.emptyListContainer,
        ]}
        ListHeaderComponent={renderRecentSearches}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
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
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  activeFilterTab: {
    backgroundColor: '#EFF6FF',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
  },
  activeFilterText: {
    color: '#3B82F6',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  recentSearchesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recentSearchesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  clearButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recentSearchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  recentSearchText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  userItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  userBio: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  userMeta: {
    marginBottom: 6,
  },
  userLocation: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  matchReason: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  interestChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 11,
    color: '#374151',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  moreInterests: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 16,
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

export default SearchUsersScreen;
