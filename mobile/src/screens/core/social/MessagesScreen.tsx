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
 * MessagesScreen Component
 * 
 * Direct messaging interface showing conversation list and message management.
 * 
 * Features:
 * - Conversation list with recent messages
 * - Search conversations and users
 * - Unread message indicators
 * - Message preview and timestamps
 * - New conversation creation
 * - Message status indicators (sent, delivered, read)
 * - Archive and delete conversations
 */

export const MessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for development
  const mockConversations = [
    {
      id: '1',
      participant: {
        id: 'user_1',
        firstName: 'Sarah',
        lastName: 'Wilson',
        username: '@sarahw',
        avatar: null,
        isOnline: true,
      },
      lastMessage: {
        id: 'msg_1',
        text: 'Thanks for organizing such a wonderful science workshop! The kids loved it.',
        timestamp: '2024-01-16T14:30:00Z',
        senderId: 'user_1',
        isRead: false,
      },
      unreadCount: 2,
      isPinned: false,
      isArchived: false,
    },
    {
      id: '2',
      participant: {
        id: 'user_2',
        firstName: 'Mike',
        lastName: 'Johnson',
        username: '@mikej',
        avatar: null,
        isOnline: false,
        lastSeen: '2024-01-16T12:15:00Z',
      },
      lastMessage: {
        id: 'msg_2',
        text: 'Looking forward to the art session next week!',
        timestamp: '2024-01-16T11:45:00Z',
        senderId: 'current_user',
        isRead: true,
      },
      unreadCount: 0,
      isPinned: true,
      isArchived: false,
    },
    {
      id: '3',
      participant: {
        id: 'user_3',
        firstName: 'Emily',
        lastName: 'Chen',
        username: '@emilyc',
        avatar: null,
        isOnline: false,
        lastSeen: '2024-01-15T18:20:00Z',
      },
      lastMessage: {
        id: 'msg_3',
        text: 'Can you share the materials list for tomorrow\'s workshop?',
        timestamp: '2024-01-15T16:30:00Z',
        senderId: 'user_3',
        isRead: true,
      },
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
    },
    {
      id: '4',
      participant: {
        id: 'user_4',
        firstName: 'David',
        lastName: 'Rodriguez',
        username: '@davidr',
        avatar: null,
        isOnline: true,
      },
      lastMessage: {
        id: 'msg_4',
        text: 'Great job on the STEM presentation! 👏',
        timestamp: '2024-01-15T10:15:00Z',
        senderId: 'user_4',
        isRead: true,
      },
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
    },
  ];

  // Filter conversations based on search query
  const filteredConversations = mockConversations.filter(conversation =>
    `${conversation.participant.firstName} ${conversation.participant.lastName}`
      .toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load conversations on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Messages screen focused');
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

  // Handle conversation press
  const handleConversationPress = useCallback((conversation: any) => {
    navigation.navigate('ChatScreen', { 
      conversationId: conversation.id,
      participant: conversation.participant 
    });
  }, [navigation]);

  // Handle new message
  const handleNewMessage = useCallback(() => {
    navigation.navigate('NewMessage');
  }, [navigation]);

  // Handle conversation actions
  const handleConversationActions = useCallback((conversation: any) => {
    Alert.alert(
      'Conversation Options',
      `Options for ${conversation.participant.firstName} ${conversation.participant.lastName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: conversation.isPinned ? 'Unpin' : 'Pin',
          onPress: () => console.log(`${conversation.isPinned ? 'Unpin' : 'Pin'} conversation:`, conversation.id)
        },
        { 
          text: 'Archive',
          onPress: () => console.log('Archive conversation:', conversation.id)
        },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Conversation',
              'Are you sure you want to delete this conversation? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete conversation:', conversation.id) },
              ]
            );
          }
        },
      ]
    );
  }, []);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  // Get online status
  const getOnlineStatus = useCallback((participant: any) => {
    if (participant.isOnline) return 'Online';
    if (participant.lastSeen) {
      const lastSeen = new Date(participant.lastSeen);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Active recently';
      if (diffInHours < 24) return `Active ${diffInHours}h ago`;
      return `Active ${Math.floor(diffInHours / 24)}d ago`;
    }
    return 'Offline';
  }, []);

  // Render conversation item
  const renderConversationItem = useCallback(({ item: conversation }: { item: any }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(conversation)}
      onLongPress={() => handleConversationActions(conversation)}
    >
      <View style={styles.conversationContent}>
        {/* Avatar with online indicator */}
        <View style={styles.avatarContainer}>
          {conversation.participant.avatar ? (
            <Image source={{ uri: conversation.participant.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {conversation.participant.firstName.charAt(0)}{conversation.participant.lastName.charAt(0)}
              </Text>
            </View>
          )}
          {conversation.participant.isOnline && (
            <View style={styles.onlineIndicator} />
          )}
          {conversation.isPinned && (
            <View style={styles.pinnedIndicator}>
              <Text style={styles.pinnedIcon}>📌</Text>
            </View>
          )}
        </View>

        {/* Conversation details */}
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName}>
              {conversation.participant.firstName} {conversation.participant.lastName}
            </Text>
            <Text style={styles.messageTime}>
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text 
              style={[
                styles.lastMessageText,
                !conversation.lastMessage.isRead && conversation.lastMessage.senderId !== 'current_user' && styles.unreadMessageText
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage.senderId === 'current_user' ? 'You: ' : ''}
              {conversation.lastMessage.text}
            </Text>
            
            {conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.onlineStatus}>
            {getOnlineStatus(conversation.participant)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleConversationPress, handleConversationActions, formatTimestamp, getOnlineStatus]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No conversations found' : 'No messages yet'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery 
          ? 'Try adjusting your search terms'
          : 'Start a conversation with someone to see your messages here'
        }
      </Text>
      {!searchQuery && (
        <Button
          variant="primary"
          size="medium"
          onPress={handleNewMessage}
          style={styles.emptyStateButton}
        >
          Start Messaging
        </Button>
      )}
    </View>
  ), [searchQuery, handleNewMessage]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.newMessageButton}
          onPress={handleNewMessage}
        >
          <Text style={styles.newMessageIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredConversations.length === 0 && styles.emptyListContainer,
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
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMessageIcon: {
    fontSize: 18,
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
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  conversationItem: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarContainer: {
    position: 'relative',
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinnedIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pinnedIcon: {
    fontSize: 10,
  },
  conversationDetails: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessageText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    flex: 1,
    marginRight: 8,
  },
  unreadMessageText: {
    fontWeight: '500',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  onlineStatus: {
    fontSize: 12,
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

export default MessagesScreen;
