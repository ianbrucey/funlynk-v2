import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';

// Types
import type { NavigationProp, RouteProp } from '@react-navigation/native';

/**
 * ChatScreen Component
 * 
 * Individual conversation interface with real-time messaging capabilities.
 * 
 * Features:
 * - Real-time message sending and receiving
 * - Message status indicators (sent, delivered, read)
 * - Typing indicators and online status
 * - Message reactions and replies
 * - Image and file sharing
 * - Message search and history
 * - User profile quick access
 * - Message deletion and editing
 */

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  // Route params
  const { conversationId, participant } = route.params || {};
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);
  
  // Local state
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [participantTyping, setParticipantTyping] = useState(false);

  // Mock data for development
  const mockMessages = [
    {
      id: '1',
      text: 'Hi! Thanks for organizing the science workshop. My daughter is really excited about it!',
      senderId: participant?.id || 'user_1',
      timestamp: '2024-01-16T10:00:00Z',
      status: 'read',
      type: 'text',
    },
    {
      id: '2',
      text: 'That\'s wonderful to hear! I\'m excited to meet her. We have some amazing experiments planned.',
      senderId: 'current_user',
      timestamp: '2024-01-16T10:05:00Z',
      status: 'read',
      type: 'text',
    },
    {
      id: '3',
      text: 'Should I bring anything specific for the workshop?',
      senderId: participant?.id || 'user_1',
      timestamp: '2024-01-16T10:10:00Z',
      status: 'read',
      type: 'text',
    },
    {
      id: '4',
      text: 'Just bring curiosity and enthusiasm! All materials will be provided. Here\'s a quick overview of what we\'ll be doing:',
      senderId: 'current_user',
      timestamp: '2024-01-16T10:15:00Z',
      status: 'read',
      type: 'text',
    },
    {
      id: '5',
      text: '• Volcano eruption experiment\n• Crystal growing activity\n• Simple chemistry reactions\n• Fun with magnets',
      senderId: 'current_user',
      timestamp: '2024-01-16T10:16:00Z',
      status: 'read',
      type: 'text',
    },
    {
      id: '6',
      text: 'This sounds amazing! She loves volcanoes. What time should we arrive?',
      senderId: participant?.id || 'user_1',
      timestamp: '2024-01-16T14:30:00Z',
      status: 'delivered',
      type: 'text',
    },
  ];

  // Load messages on mount
  useEffect(() => {
    console.log('Chat screen loaded for conversation:', conversationId);
    // Scroll to bottom on load
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, [conversationId]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      senderId: 'current_user',
      timestamp: new Date().toISOString(),
      status: 'sending',
      type: 'text',
    };

    console.log('Send message:', newMessage);
    
    // Clear input
    setMessageText('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Send message failed:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  }, [messageText]);

  // Handle message long press
  const handleMessageLongPress = useCallback((message: any) => {
    const isOwnMessage = message.senderId === 'current_user';
    
    Alert.alert(
      'Message Options',
      'Choose an action',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy', onPress: () => console.log('Copy message:', message.id) },
        ...(isOwnMessage ? [
          { text: 'Edit', onPress: () => console.log('Edit message:', message.id) },
          { text: 'Delete', style: 'destructive', onPress: () => console.log('Delete message:', message.id) },
        ] : [
          { text: 'Reply', onPress: () => console.log('Reply to message:', message.id) },
          { text: 'Report', style: 'destructive', onPress: () => console.log('Report message:', message.id) },
        ]),
      ]
    );
  }, []);

  // Handle participant profile
  const handleParticipantProfile = useCallback(() => {
    navigation.navigate('Profile', { userId: participant?.id });
  }, [navigation, participant]);

  // Handle call participant
  const handleCallParticipant = useCallback(() => {
    Alert.alert('Voice Call', `Call ${participant?.firstName} ${participant?.lastName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Initiate call with:', participant?.id) },
    ]);
  }, [participant]);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  // Get message status icon
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  }, []);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'sending': return '#9CA3AF';
      case 'sent': return '#9CA3AF';
      case 'delivered': return '#9CA3AF';
      case 'read': return '#3B82F6';
      default: return '#9CA3AF';
    }
  }, []);

  // Render message item
  const renderMessageItem = useCallback(({ item: message }: { item: any }) => {
    const isOwnMessage = message.senderId === 'current_user';
    
    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
        <TouchableOpacity
          style={[styles.messageBubble, isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble]}
          onLongPress={() => handleMessageLongPress(message)}
        >
          <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
            {message.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[styles.messageTime, isOwnMessage && styles.ownMessageTime]}>
              {formatTimestamp(message.timestamp)}
            </Text>
            {isOwnMessage && (
              <Text style={[styles.messageStatus, { color: getStatusColor(message.status) }]}>
                {getStatusIcon(message.status)}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [handleMessageLongPress, formatTimestamp, getStatusIcon, getStatusColor]);

  // Render typing indicator
  const renderTypingIndicator = useCallback(() => {
    if (!participantTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <Text style={styles.typingText}>
            {participant?.firstName} is typing...
          </Text>
        </View>
      </View>
    );
  }, [participantTyping, participant]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.participantInfo}
          onPress={handleParticipantProfile}
        >
          <View style={styles.participantAvatar}>
            {participant?.avatar ? (
              <Image source={{ uri: participant.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {participant?.firstName?.charAt(0)}{participant?.lastName?.charAt(0)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.participantDetails}>
            <Text style={styles.participantName}>
              {participant?.firstName} {participant?.lastName}
            </Text>
            <Text style={styles.participantStatus}>
              {participantTyping ? 'typing...' : 'Active recently'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.callButton}
          onPress={handleCallParticipant}
        >
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={mockMessages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {renderTypingIndicator()}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => Alert.alert('Attach', 'File attachment would be implemented here.')}
            >
              <Text style={styles.attachButtonText}>📎</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    marginRight: 16,
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
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
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  participantStatus: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 18,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  ownMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  ownMessageTime: {
    color: '#E5E7EB',
  },
  messageStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  typingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Inter-Regular',
    maxHeight: 80,
    paddingVertical: 4,
  },
  attachButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  attachButtonText: {
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
});

export default ChatScreen;
