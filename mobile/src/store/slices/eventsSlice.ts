import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event } from '../api/coreApi';

interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  myEvents: Event[];
  filters: {
    category: string | null;
    location: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    priceMin: number | null;
    priceMax: number | null;
    search: string;
  };
  sort: {
    field: 'date' | 'price' | 'popularity' | 'distance';
    order: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;
}

const initialState: EventsState = {
  events: [],
  featuredEvents: [],
  myEvents: [],
  filters: {
    category: null,
    location: null,
    dateFrom: null,
    dateTo: null,
    priceMin: null,
    priceMax: null,
    search: '',
  },
  sort: {
    field: 'date',
    order: 'asc',
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
  selectedEvent: null,
  isLoading: false,
  error: null,
  lastRefresh: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
      state.lastRefresh = new Date().toISOString();
    },
    
    appendEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = [...state.events, ...action.payload];
    },
    
    setFeaturedEvents: (state, action: PayloadAction<Event[]>) => {
      state.featuredEvents = action.payload;
    },
    
    setMyEvents: (state, action: PayloadAction<Event[]>) => {
      state.myEvents = action.payload;
    },
    
    addEvent: (state, action: PayloadAction<Event>) => {
      state.events.unshift(action.payload);
      state.myEvents.unshift(action.payload);
    },
    
    updateEvent: (state, action: PayloadAction<Event>) => {
      const updatedEvent = action.payload;
      
      // Update in events array
      const eventIndex = state.events.findIndex(e => e.id === updatedEvent.id);
      if (eventIndex !== -1) {
        state.events[eventIndex] = updatedEvent;
      }
      
      // Update in myEvents array
      const myEventIndex = state.myEvents.findIndex(e => e.id === updatedEvent.id);
      if (myEventIndex !== -1) {
        state.myEvents[myEventIndex] = updatedEvent;
      }
      
      // Update selected event if it's the same
      if (state.selectedEvent?.id === updatedEvent.id) {
        state.selectedEvent = updatedEvent;
      }
    },
    
    removeEvent: (state, action: PayloadAction<string>) => {
      const eventId = action.payload;
      state.events = state.events.filter(e => e.id !== eventId);
      state.myEvents = state.myEvents.filter(e => e.id !== eventId);
      state.featuredEvents = state.featuredEvents.filter(e => e.id !== eventId);
      
      if (state.selectedEvent?.id === eventId) {
        state.selectedEvent = null;
      }
    },
    
    setSelectedEvent: (state, action: PayloadAction<Event | null>) => {
      state.selectedEvent = action.payload;
    },
    
    updateEventRSVP: (state, action: PayloadAction<{ eventId: string; status: 'going' | 'maybe' | 'not_going' | null }>) => {
      const { eventId, status } = action.payload;
      
      const updateRSVP = (event: Event) => {
        if (event.id === eventId) {
          const oldStatus = event.rsvpStatus;
          event.rsvpStatus = status;
          
          // Update attendee count
          if (oldStatus === 'going' && status !== 'going') {
            event.currentAttendees = Math.max(0, event.currentAttendees - 1);
          } else if (oldStatus !== 'going' && status === 'going') {
            event.currentAttendees += 1;
          }
        }
      };
      
      state.events.forEach(updateRSVP);
      state.myEvents.forEach(updateRSVP);
      state.featuredEvents.forEach(updateRSVP);
      
      if (state.selectedEvent?.id === eventId) {
        updateRSVP(state.selectedEvent);
      }
    },
    
    setFilters: (state, action: PayloadAction<Partial<EventsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    
    setSort: (state, action: PayloadAction<EventsState['sort']>) => {
      state.sort = action.payload;
      // Reset pagination when sort changes
      state.pagination.page = 1;
    },
    
    setPagination: (state, action: PayloadAction<Partial<EventsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    resetPagination: (state) => {
      state.pagination = initialState.pagination;
    },
    
    clearEvents: (state) => {
      state.events = [];
      state.featuredEvents = [];
      state.myEvents = [];
      state.selectedEvent = null;
      state.pagination = initialState.pagination;
    },
  },
});

export const {
  setLoading,
  setError,
  setEvents,
  appendEvents,
  setFeaturedEvents,
  setMyEvents,
  addEvent,
  updateEvent,
  removeEvent,
  setSelectedEvent,
  updateEventRSVP,
  setFilters,
  clearFilters,
  setSort,
  setPagination,
  resetPagination,
  clearEvents,
} = eventsSlice.actions;

export default eventsSlice.reducer;

// Selectors
export const selectEvents = (state: { events: EventsState }) => state.events.events;
export const selectFeaturedEvents = (state: { events: EventsState }) => state.events.featuredEvents;
export const selectMyEvents = (state: { events: EventsState }) => state.events.myEvents;
export const selectSelectedEvent = (state: { events: EventsState }) => state.events.selectedEvent;
export const selectEventsFilters = (state: { events: EventsState }) => state.events.filters;
export const selectEventsSort = (state: { events: EventsState }) => state.events.sort;
export const selectEventsPagination = (state: { events: EventsState }) => state.events.pagination;
export const selectEventsLoading = (state: { events: EventsState }) => state.events.isLoading;
export const selectEventsError = (state: { events: EventsState }) => state.events.error;
