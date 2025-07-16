import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';
import { User } from '../slices/authSlice';

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  price: number;
  currency: string;
  maxAttendees: number;
  currentAttendees: number;
  hostId: string;
  host: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    role: string;
  };
  images: string[];
  tags: string[];
  category: string;
  isPublic: boolean;
  requiresApproval: boolean;
  ageRestriction?: {
    minAge: number;
    maxAge: number;
  };
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  rsvpStatus?: 'going' | 'maybe' | 'not_going' | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  content: string;
  images?: string[];
  eventId?: string;
  event?: {
    id: string;
    title: string;
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const coreApi = createApi({
  reducerPath: 'coreApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Event', 'User', 'Social', 'Message', 'Notification'],
  endpoints: (builder) => ({
    // Events
    getEvents: builder.query<PaginatedResponse<Event>, { 
      page?: number; 
      limit?: number; 
      search?: string; 
      category?: string;
      location?: string;
      dateFrom?: string;
      dateTo?: string;
      priceMin?: number;
      priceMax?: number;
    }>({
      query: (params) => ({
        url: '/core/events',
        params,
      }),
      providesTags: ['Event'],
    }),
    
    getEvent: builder.query<Event, string>({
      query: (id) => `/core/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Event', id }],
    }),
    
    createEvent: builder.mutation<Event, Partial<Event>>({
      query: (event) => ({
        url: '/core/events',
        method: 'POST',
        body: event,
      }),
      invalidatesTags: ['Event'],
    }),
    
    updateEvent: builder.mutation<Event, { id: string; event: Partial<Event> }>({
      query: ({ id, event }) => ({
        url: `/core/events/${id}`,
        method: 'PUT',
        body: event,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Event', id }],
    }),
    
    deleteEvent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/core/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Event'],
    }),
    
    // RSVP
    rsvpToEvent: builder.mutation<{ message: string }, { eventId: string; status: 'going' | 'maybe' | 'not_going' }>({
      query: ({ eventId, status }) => ({
        url: `/core/events/${eventId}/rsvp`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
    
    getEventAttendees: builder.query<PaginatedResponse<User>, { eventId: string; page?: number; limit?: number }>({
      query: ({ eventId, ...params }) => ({
        url: `/core/events/${eventId}/attendees`,
        params,
      }),
      providesTags: (result, error, { eventId }) => [{ type: 'Event', id: eventId }],
    }),
    
    // Users
    getUserProfile: builder.query<User, string>({
      query: (userId) => `/core/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    
    searchUsers: builder.query<PaginatedResponse<User>, { query: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/core/users/search',
        params,
      }),
      providesTags: ['User'],
    }),
    
    // Social
    getFeed: builder.query<PaginatedResponse<SocialPost>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/core/social/feed',
        params,
      }),
      providesTags: ['Social'],
    }),
    
    createPost: builder.mutation<SocialPost, { content: string; images?: string[]; eventId?: string }>({
      query: (post) => ({
        url: '/core/social/posts',
        method: 'POST',
        body: post,
      }),
      invalidatesTags: ['Social'],
    }),
    
    likePost: builder.mutation<{ message: string }, string>({
      query: (postId) => ({
        url: `/core/social/posts/${postId}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Social'],
    }),
    
    // Messages
    getConversations: builder.query<PaginatedResponse<Conversation>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/core/messages/conversations',
        params,
      }),
      providesTags: ['Message'],
    }),
    
    getMessages: builder.query<PaginatedResponse<Message>, { conversationId: string; page?: number; limit?: number }>({
      query: ({ conversationId, ...params }) => ({
        url: `/core/messages/conversations/${conversationId}/messages`,
        params,
      }),
      providesTags: (result, error, { conversationId }) => [{ type: 'Message', id: conversationId }],
    }),
    
    sendMessage: builder.mutation<Message, { conversationId: string; content: string; type?: 'text' | 'image' | 'file' }>({
      query: ({ conversationId, ...message }) => ({
        url: `/core/messages/conversations/${conversationId}/messages`,
        method: 'POST',
        body: message,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: conversationId },
        'Message'
      ],
    }),
    
    // Notifications
    getNotifications: builder.query<PaginatedResponse<any>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/core/notifications',
        params,
      }),
      providesTags: ['Notification'],
    }),
    
    markNotificationRead: builder.mutation<{ message: string }, string>({
      query: (notificationId) => ({
        url: `/core/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useRsvpToEventMutation,
  useGetEventAttendeesQuery,
  useGetUserProfileQuery,
  useSearchUsersQuery,
  useGetFeedQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} = coreApi;
