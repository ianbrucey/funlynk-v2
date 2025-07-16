import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Booking, BookingStats, BookingFilters, PaginationData } from '../../types';

interface BookingsState {
  bookings: Booking[];
  stats: BookingStats | null;
  filters: BookingFilters;
  pagination: PaginationData;
  isLoading: boolean;
  error: string | null;
  selectedBooking: Booking | null;
}

const initialState: BookingsState = {
  bookings: [],
  stats: null,
  filters: {
    sortBy: 'scheduledDate',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 20,
  },
  isLoading: false,
  error: null,
  selectedBooking: null,
};

// Mock service for development
const mockBookingsService = {
  async getBookings(params: any): Promise<{ data: Booking[]; pagination: PaginationData }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockBookings: Booking[] = [
      {
        id: '1',
        bookingNumber: 'BK-2024-001',
        program: {
          id: 'prog-1',
          title: 'Science Exploration Workshop',
          description: 'Interactive science experiments',
          duration: 90,
          gradeLevels: ['3', '4', '5'],
          maxStudents: 30,
          pricePerStudent: 25,
          category: 'Science',
        },
        school: {
          id: 'school-1',
          name: 'Lincoln Elementary School',
          district: 'Springfield School District',
          address: '123 Main St, Springfield, IL',
          contactEmail: 'contact@lincoln.edu',
          contactPhone: '(555) 123-4567',
        },
        teacher: {
          id: 'teacher-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@lincoln.edu',
          phone: '(555) 987-6543',
          school: {
            id: 'school-1',
            name: 'Lincoln Elementary School',
            district: 'Springfield School District',
            address: '123 Main St, Springfield, IL',
            contactEmail: 'contact@lincoln.edu',
            contactPhone: '(555) 123-4567',
          },
        },
        scheduledDate: '2024-07-20',
        startTime: '10:00',
        endTime: '11:30',
        studentCount: 25,
        maxStudents: 30,
        status: 'confirmed',
        paymentStatus: 'paid',
        totalAmount: 625,
        notes: 'Need projector and screen setup',
        createdAt: '2024-07-15T10:00:00Z',
        updatedAt: '2024-07-16T14:30:00Z',
      },
      {
        id: '2',
        bookingNumber: 'BK-2024-002',
        program: {
          id: 'prog-2',
          title: 'Creative Writing Adventure',
          description: 'Storytelling and creative writing workshop',
          duration: 60,
          gradeLevels: ['4', '5', '6'],
          maxStudents: 25,
          pricePerStudent: 20,
          category: 'Language Arts',
        },
        school: {
          id: 'school-2',
          name: 'Washington Middle School',
          district: 'Springfield School District',
          address: '456 Oak Ave, Springfield, IL',
          contactEmail: 'info@washington.edu',
          contactPhone: '(555) 234-5678',
        },
        teacher: {
          id: 'teacher-2',
          name: 'Michael Chen',
          email: 'michael.chen@washington.edu',
          school: {
            id: 'school-2',
            name: 'Washington Middle School',
            district: 'Springfield School District',
            address: '456 Oak Ave, Springfield, IL',
            contactEmail: 'info@washington.edu',
            contactPhone: '(555) 234-5678',
          },
        },
        scheduledDate: '2024-07-22',
        startTime: '14:00',
        endTime: '15:00',
        studentCount: 22,
        maxStudents: 25,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: 440,
        createdAt: '2024-07-16T09:15:00Z',
        updatedAt: '2024-07-16T09:15:00Z',
      },
    ];

    return {
      data: mockBookings,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        total: mockBookings.length,
        perPage: 20,
      },
    };
  },

  async getBookingStats(): Promise<BookingStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      totalBookings: 156,
      confirmedBookings: 89,
      pendingBookings: 23,
      cancelledBookings: 12,
      totalRevenue: 45680,
      averageBookingValue: 293,
      upcomingBookings: 67,
      completedBookings: 89,
    };
  },

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock response - in real app, this would update the booking
    throw new Error('Mock implementation - booking status update');
  },
};

// Async thunks
export const loadBookings = createAsyncThunk(
  'bookings/loadBookings',
  async (params: { page?: number; limit?: number; filters?: BookingFilters }, { rejectWithValue }) => {
    try {
      const response = await mockBookingsService.getBookings(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load bookings');
    }
  }
);

export const loadBookingStats = createAsyncThunk(
  'bookings/loadBookingStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await mockBookingsService.getBookingStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load booking stats');
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'bookings/updateBookingStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const updatedBooking = await mockBookingsService.updateBookingStatus(id, status);
      return { id, status, booking: updatedBooking };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update booking status');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<BookingFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'scheduledDate',
        sortOrder: 'desc',
      };
    },
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load bookings
      .addCase(loadBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load booking stats
      .addCase(loadBookingStats.pending, (state) => {
        // Don't set loading for stats to avoid UI flicker
      })
      .addCase(loadBookingStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(loadBookingStats.rejected, (state, action) => {
        // Handle stats loading error silently or show notification
      })
      // Update booking status
      .addCase(updateBookingStatus.pending, (state) => {
        // Could add loading state for specific booking
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const bookingIndex = state.bookings.findIndex(b => b.id === id);
        if (bookingIndex !== -1) {
          state.bookings[bookingIndex].status = status as any;
        }
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, clearFilters, setSelectedBooking, clearError } = bookingsSlice.actions;

// Convenience action creators
export const filterBookings = (filters: BookingFilters) => setFilters(filters);

// Selectors
export const selectBookings = (state: { bookings: BookingsState }) => state.bookings.bookings;
export const selectBookingStats = (state: { bookings: BookingsState }) => state.bookings.stats;
export const selectBookingsLoading = (state: { bookings: BookingsState }) => state.bookings.isLoading;
export const selectBookingsError = (state: { bookings: BookingsState }) => state.bookings.error;
export const selectBookingsPagination = (state: { bookings: BookingsState }) => state.bookings.pagination;
export const selectBookingsFilters = (state: { bookings: BookingsState }) => state.bookings.filters;

export default bookingsSlice.reducer;
