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
 * MessagesScreen Component
 * 
 * Communication hub for parents with teachers and administrators.
 * 
 * Features:
 * - Message threads with teachers and administrators
 * - Real-time messaging with read receipts
 * - Photo and document sharing capabilities
 * - Message search and filtering
 * - Notification management
 * - Archived conversations
 * - Emergency messaging priority
 * - Group messaging for class updates
 */

export const MessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  // Mock data for development
  const filterOptions = [
    { label: 'All', value: 'all', count: 12 },
    { label: 'Unread', value: 'unread', count: 3 },
    { label: 'Teachers', value: 'teachers', count: 8 },
    { label: 'Admin', value: 'admin', count: 4 },
  ];

  const mockMessages = [
    {
      id: '1',
      from: 'Ms. Sarah Johnson',
      from_type: 'teacher',
      subject: 'Great progress in science activities!',
      preview: 'Emma has been showing wonderful curiosity and engagement during our science experiments. She asked excellent questions about the volcano demonstration...',
      date: '2024-01-11',
      time: '2:30 PM',
      is_read: false,
      is_urgent: false,
      has_attachments: true,
      child_name: 'Emma Johnson',
      program: 'Science Museum Adventure',
      message_count: 3
    },
    {
      id: '2',
      from: 'Spark Administration',
      from_type: 'admin',
      subject: 'Upcoming program schedule changes',
      preview: 'Please note the following schedule updates for next week\'s programs. The Character Building Workshop has been moved to Thursday...',
      date: '2024-01-09',
      time: '10:15 AM',
      is_read: true,
      is_urgent: false,
      has_attachments: false,
      child_name: null,
      program: null,
      message_count: 1
    },
    {
      id: '3',
      from: 'Mr. David Wilson',
      from_type: 'teacher',
      subject: 'Permission slip reminder - URGENT',
      preview: 'This is a friendly reminder that the permission slip for tomorrow\'s field trip is still pending. Please submit by end of day...',
      date: '2024-01-10',
      time: '4:45 PM',
      is_read: false,
      is_urgent: true,
      has_attachments: true,
      child_name: 'Emma Johnson',
      program: 'Character Building Workshop',
      message_count: 2
    },
    {
      id: '4',
      from: 'Ms. Emily Chen',
      from_type: 'teacher',
      subject: 'Art project photos from today\'s session',
      preview: 'I wanted to share some wonderful photos from today\'s art session. Liam created a beautiful painting and was so proud of his work...',
      date: '2024-01-08',
      time: '3:20 PM',
      is_read: true,
      is_urgent: false,
      has_attachments: true,
      child_name: 'Liam Johnson',
      program: 'Art & Creativity Session',
      message_count: 5
    },
    {
      id: '5',
      from: 'School Nurse',
      from_type: 'admin',
      subject: 'Medical information update required',
      preview: 'We need to update Emma\'s medical information in our system. Please review and confirm the current allergy and medication details...',
      date: '2024-01-07',
      time: '11:30 AM',
      is_read: true,
      is_urgent: false,
      has_attachments: false,
      child_name: 'Emma Johnson',
      program: null,
      message_count: 1
    },
    {
      id: '6',
      from: 'Ms. Sarah Johnson',
      from_type: 'teacher',
      subject: 'Behavioral observation notes',
      preview: 'I wanted to share some positive observations about Emma\'s behavior and social interactions during group activities...',
      date: '2024-01-06',
      time: '1:15 PM',
      is_read: true,
      is_urgent: false,
      has_attachments: false,
      child_name: 'Emma Johnson',
      program: 'Science Museum Adventure',
      message_count: 4
    }
  ];

  // Load messages on screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Messages focused');
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

  // Filter messages
  const filteredMessages = mockMessages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'unread':
        matchesFilter = !message.is_read;
        break;
      case 'teachers':
        matchesFilter = message.from_type === 'teacher';
        break;
      case 'admin':
        matchesFilter = message.from_type === 'admin';
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Handle message actions
  const handleMessagePress = (message: any) => {
    console.log('Navigate to message thread:', message.id);
    // navigation.navigate('MessageThread', { messageId: message.id });
  };

  const handleComposeMessage = () => {
    console.log('Navigate to compose message');
    // navigation.navigate('ComposeMessage');
  };

  const handleMarkAsRead = (messageId: string) => {
    console.log('Mark message as read:', messageId);
  };

  const handleMarkAsUnread = (messageId: string) => {
    console.log('Mark message as unread:', messageId);
  };

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete message:', messageId) }
      ]
    );
  };

  const handleArchiveMessage = (messageId: string) => {
    console.log('Archive message:', messageId);
  };

  const getFromTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher':
        return '👨‍🏫';
      case 'admin':
        return '🏢';
      default:
        return '💬';
    }
  };

  const getFromTypeColor = (type: string) => {
    switch (type) {
      case 'teacher':
        return '#3B82F6';
      case 'admin':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatTime = (date: string, time: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return time;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Button
          variant="primary"
          size="sm"
          onPress={handleComposeMessage}
        >
          Compose
        </Button>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterTab,
              selectedFilter === filter.value && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter.value)}
          >
            <Text style={[
              styles.filterTabText,
              selectedFilter === filter.value && styles.filterTabTextActive
            ]}>
              {filter.label}
            </Text>
            <View style={[
              styles.filterTabBadge,
              selectedFilter === filter.value && styles.filterTabBadgeActive
            ]}>
              <Text style={[
                styles.filterTabBadgeText,
                selectedFilter === filter.value && styles.filterTabBadgeTextActive
              ]}>
                {filter.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages List */}
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
        {filteredMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No messages found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search criteria' : 'No messages match the selected filter'}
            </Text>
          </View>
        ) : (
          filteredMessages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[
                styles.messageCard,
                !message.is_read && styles.unreadMessageCard,
                message.is_urgent && styles.urgentMessageCard
              ]}
              onPress={() => handleMessagePress(message)}
            >
              {message.is_urgent && (
                <View style={styles.urgentBanner}>
                  <Text style={styles.urgentBannerText}>URGENT</Text>
                </View>
              )}

              <View style={styles.messageHeader}>
                <View style={styles.messageFromContainer}>
                  <Text style={styles.fromTypeIcon}>{getFromTypeIcon(message.from_type)}</Text>
                  <View style={styles.fromInfo}>
                    <Text style={[styles.messageFrom, { color: getFromTypeColor(message.from_type) }]}>
                      {message.from}
                    </Text>
                    {message.child_name && (
                      <Text style={styles.childName}>Re: {message.child_name}</Text>
                    )}
                    {message.program && (
                      <Text style={styles.programName}>{message.program}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.messageMetaContainer}>
                  <Text style={styles.messageTime}>{formatTime(message.date, message.time)}</Text>
                  <View style={styles.messageIndicators}>
                    {message.has_attachments && (
                      <Text style={styles.attachmentIcon}>📎</Text>
                    )}
                    {message.message_count > 1 && (
                      <View style={styles.messageCountBadge}>
                        <Text style={styles.messageCountText}>{message.message_count}</Text>
                      </View>
                    )}
                    {!message.is_read && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </View>

              <Text style={styles.messageSubject}>{message.subject}</Text>
              <Text style={styles.messagePreview} numberOfLines={2}>
                {message.preview}
              </Text>

              {/* Message Actions */}
              <View style={styles.messageActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => message.is_read ? handleMarkAsUnread(message.id) : handleMarkAsRead(message.id)}
                >
                  <Text style={styles.actionButtonText}>
                    {message.is_read ? 'Mark Unread' : 'Mark Read'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleArchiveMessage(message.id)}
                >
                  <Text style={styles.actionButtonText}>Archive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteMessage(message.id)}
                >
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    fontFamily: 'Inter-Medium',
    marginRight: 6,
  },
  filterTabTextActive: {
    color: '#3B82F6',
  },
  filterTabBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterTabBadgeActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Inter-SemiBold',
  },
  filterTabBadgeTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
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
    position: 'relative',
  },
  unreadMessageCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    backgroundColor: '#FEFEFE',
  },
  urgentMessageCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    backgroundColor: '#FFFBEB',
  },
  urgentBanner: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  urgentBannerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageFromContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  fromTypeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fromInfo: {
    flex: 1,
  },
  messageFrom: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  childName: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 1,
  },
  programName: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  messageMetaContainer: {
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  messageIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentIcon: {
    fontSize: 12,
  },
  messageCountBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 16,
    alignItems: 'center',
  },
  messageCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    fontFamily: 'Inter-Medium',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
});

export default MessagesScreen;
