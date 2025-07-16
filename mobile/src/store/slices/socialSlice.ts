import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SocialPost, Conversation, Message } from '../api/coreApi';

interface SocialState {
  feed: SocialPost[];
  conversations: Conversation[];
  activeConversation: {
    id: string | null;
    messages: Message[];
    isLoading: boolean;
  };
  notifications: {
    unreadCount: number;
    items: any[];
  };
  connections: {
    following: string[];
    followers: string[];
    requests: {
      sent: string[];
      received: string[];
    };
  };
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;
}

const initialState: SocialState = {
  feed: [],
  conversations: [],
  activeConversation: {
    id: null,
    messages: [],
    isLoading: false,
  },
  notifications: {
    unreadCount: 0,
    items: [],
  },
  connections: {
    following: [],
    followers: [],
    requests: {
      sent: [],
      received: [],
    },
  },
  isLoading: false,
  error: null,
  lastRefresh: null,
};

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setFeed: (state, action: PayloadAction<SocialPost[]>) => {
      state.feed = action.payload;
      state.lastRefresh = new Date().toISOString();
    },
    
    appendToFeed: (state, action: PayloadAction<SocialPost[]>) => {
      state.feed = [...state.feed, ...action.payload];
    },
    
    addPost: (state, action: PayloadAction<SocialPost>) => {
      state.feed.unshift(action.payload);
    },
    
    updatePost: (state, action: PayloadAction<SocialPost>) => {
      const updatedPost = action.payload;
      const index = state.feed.findIndex(post => post.id === updatedPost.id);
      if (index !== -1) {
        state.feed[index] = updatedPost;
      }
    },
    
    removePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      state.feed = state.feed.filter(post => post.id !== postId);
    },
    
    likePost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      const post = state.feed.find(p => p.id === postId);
      if (post) {
        if (post.isLiked) {
          post.likes -= 1;
          post.isLiked = false;
        } else {
          post.likes += 1;
          post.isLiked = true;
        }
      }
    },
    
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const existingIndex = state.conversations.findIndex(c => c.id === action.payload.id);
      if (existingIndex !== -1) {
        state.conversations[existingIndex] = action.payload;
      } else {
        state.conversations.unshift(action.payload);
      }
    },
    
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const updatedConversation = action.payload;
      const index = state.conversations.findIndex(c => c.id === updatedConversation.id);
      if (index !== -1) {
        state.conversations[index] = updatedConversation;
      }
    },
    
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation.id = action.payload;
      state.activeConversation.messages = [];
    },
    
    setConversationMessages: (state, action: PayloadAction<Message[]>) => {
      state.activeConversation.messages = action.payload;
    },
    
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      
      // Add to active conversation messages
      if (state.activeConversation.id === message.conversationId) {
        state.activeConversation.messages.push(message);
      }
      
      // Update conversation last message
      const conversation = state.conversations.find(c => c.id === message.conversationId);
      if (conversation) {
        conversation.lastMessage = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
        };
        conversation.updatedAt = message.createdAt;
        
        // Move conversation to top
        const index = state.conversations.findIndex(c => c.id === message.conversationId);
        if (index > 0) {
          const [conv] = state.conversations.splice(index, 1);
          state.conversations.unshift(conv);
        }
      }
    },
    
    markMessageAsRead: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const message = state.activeConversation.messages.find(m => m.id === messageId);
      if (message) {
        message.isRead = true;
      }
    },
    
    setConversationLoading: (state, action: PayloadAction<boolean>) => {
      state.activeConversation.isLoading = action.payload;
    },
    
    setNotifications: (state, action: PayloadAction<{ unreadCount: number; items: any[] }>) => {
      state.notifications = action.payload;
    },
    
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.items.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
      }
    },
    
    setConnections: (state, action: PayloadAction<Partial<SocialState['connections']>>) => {
      state.connections = { ...state.connections, ...action.payload };
    },
    
    addFollowing: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!state.connections.following.includes(userId)) {
        state.connections.following.push(userId);
      }
      // Remove from sent requests if exists
      state.connections.requests.sent = state.connections.requests.sent.filter(id => id !== userId);
    },
    
    removeFollowing: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.connections.following = state.connections.following.filter(id => id !== userId);
    },
    
    addFollower: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!state.connections.followers.includes(userId)) {
        state.connections.followers.push(userId);
      }
    },
    
    removeFollower: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.connections.followers = state.connections.followers.filter(id => id !== userId);
    },
    
    sendFollowRequest: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!state.connections.requests.sent.includes(userId)) {
        state.connections.requests.sent.push(userId);
      }
    },
    
    cancelFollowRequest: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.connections.requests.sent = state.connections.requests.sent.filter(id => id !== userId);
    },
    
    acceptFollowRequest: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.connections.requests.received = state.connections.requests.received.filter(id => id !== userId);
      if (!state.connections.followers.includes(userId)) {
        state.connections.followers.push(userId);
      }
    },
    
    rejectFollowRequest: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.connections.requests.received = state.connections.requests.received.filter(id => id !== userId);
    },
    
    clearSocial: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setError,
  setFeed,
  appendToFeed,
  addPost,
  updatePost,
  removePost,
  likePost,
  setConversations,
  addConversation,
  updateConversation,
  setActiveConversation,
  setConversationMessages,
  addMessage,
  markMessageAsRead,
  setConversationLoading,
  setNotifications,
  markNotificationAsRead,
  setConnections,
  addFollowing,
  removeFollowing,
  addFollower,
  removeFollower,
  sendFollowRequest,
  cancelFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  clearSocial,
} = socialSlice.actions;

export default socialSlice.reducer;

// Selectors
export const selectFeed = (state: { social: SocialState }) => state.social.feed;
export const selectConversations = (state: { social: SocialState }) => state.social.conversations;
export const selectActiveConversation = (state: { social: SocialState }) => state.social.activeConversation;
export const selectNotifications = (state: { social: SocialState }) => state.social.notifications;
export const selectConnections = (state: { social: SocialState }) => state.social.connections;
export const selectSocialLoading = (state: { social: SocialState }) => state.social.isLoading;
export const selectSocialError = (state: { social: SocialState }) => state.social.error;
