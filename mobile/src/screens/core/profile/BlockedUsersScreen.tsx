import React, { useState, useCallback } from 'react';
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
 * BlockedUsersScreen Component
 * 
 * Manages blocked users list with unblock functionality.
 * 
 * Features:
 * - List of blocked users
 * - Unblock functionality
 * - Block reasons display
 * - Search blocked users
 * - Block date and context information
 */

export const BlockedUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  const mockBlockedUsers = [
    {
      id: '1',
      firstName: 'Alex',
      lastName: 'Thompson',
      username: '@alext',
      avatar: null,
      blockedDate: '2024-01-10',
      reason: 'Inappropriate behavior',
      context: 'Sent inappropriate messages',
    },
    {
      id: '2',
      firstName: 'Jordan',
      lastName: 'Smith',
      username: '@jordans',
      avatar: null,
      blockedDate: '2024-01-05',
      reason: 'Spam',
      context: 'Repeatedly sent promotional content',
    },
    {
      id: '3',
      firstName: 'Casey',
      lastName: 'Williams',
      username: '@caseyw',
      avatar: null,
      blockedDate: '2023-12-28',
      reason: 'Harassment',
      context: 'Made threatening comments on events',
    },
  ];

  // Filter data based on search query
  const filteredData = mockBlockedUsers.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load data on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Blocked users screen focused');
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

  // Handle unblock user
  const handleUnblockUser = useCallback(async (user: any) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${user.firstName} ${user.lastName}? They will be able to see your profile and contact you again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            try {
              console.log('Unblock user:', user.id);
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 500));
              Alert.alert(
                'User Unblocked',
                `${user.firstName} ${user.lastName} has been unblocked successfully.`
              );
            } catch (error) {
              console.error('Unblock failed:', error);
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  // Handle view block details
  const handleViewBlockDetails = useCallback((user: any) => {
    Alert.alert(
      'Block Details',
      `User: ${user.firstName} ${user.lastName}\nBlocked: ${new Date(user.blockedDate).toLocaleDateString()}\nReason: ${user.reason}\nContext: ${user.context}`,
      [{ text: 'OK' }]
    );
  }, []);

  // Render blocked user item
  const renderBlockedUserItem = useCallback(({ item: user }: { item: any }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
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
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userUsername}>{user.username}</Text>
          <Text style={styles.blockInfo}>
            Blocked on {new Date(user.blockedDate).toLocaleDateString()}
          </Text>
          <Text style={styles.blockReason}>
            Reason: {user.reason}
          </Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => handleViewBlockDetails(user)}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
        
        <Button
          variant="outline"
          size="sm"
          onPress={() => handleUnblockUser(user)}
          style={styles.unblockButton}
        >
          Unblock
        </Button>
      </View>
    </View>
  ), [handleViewBlockDetails, handleUnblockUser]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🚫</Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No blocked users found' : 'No blocked users'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'Users you block will appear here. You can unblock them at any time.'
        }
      </Text>
    </View>
  ), [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blocked Users</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          Blocked users cannot see your profile, send you messages, or interact with your content.
        </Text>
      </View>

      {/* Search Bar */}
      {mockBlockedUsers.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search blocked users..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      )}

      {/* Blocked Users List */}
      <FlatList
        data={filteredData}
        renderItem={renderBlockedUserItem}
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
  infoBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoBannerText: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
    paddingVertical: 16,
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
    opacity: 0.6,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#9CA3AF',
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
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  blockInfo: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 2,
  },
  blockReason: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'Inter-Regular',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  unblockButton: {
    minWidth: 80,
    borderColor: '#10B981',
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
  },
});

export default BlockedUsersScreen;
