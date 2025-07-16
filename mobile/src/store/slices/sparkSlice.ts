import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Program, Booking, Student } from '../api/sparkApi';

interface SparkState {
  programs: Program[];
  bookings: Booking[];
  students: Student[];
  selectedProgram: Program | null;
  selectedBooking: Booking | null;
  filters: {
    category: string | null;
    location: string | null;
    ageMin: number | null;
    ageMax: number | null;
    priceMin: number | null;
    priceMax: number | null;
    search: string;
  };
  dashboard: {
    stats: {
      totalBookings: number;
      upcomingBookings: number;
      totalStudents: number;
      totalSpent: number;
    };
    recentActivity: any[];
    isLoading: boolean;
  };
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;
}

const initialState: SparkState = {
  programs: [],
  bookings: [],
  students: [],
  selectedProgram: null,
  selectedBooking: null,
  filters: {
    category: null,
    location: null,
    ageMin: null,
    ageMax: null,
    priceMin: null,
    priceMax: null,
    search: '',
  },
  dashboard: {
    stats: {
      totalBookings: 0,
      upcomingBookings: 0,
      totalStudents: 0,
      totalSpent: 0,
    },
    recentActivity: [],
    isLoading: false,
  },
  isLoading: false,
  error: null,
  lastRefresh: null,
};

const sparkSlice = createSlice({
  name: 'spark',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setPrograms: (state, action: PayloadAction<Program[]>) => {
      state.programs = action.payload;
      state.lastRefresh = new Date().toISOString();
    },
    
    appendPrograms: (state, action: PayloadAction<Program[]>) => {
      state.programs = [...state.programs, ...action.payload];
    },
    
    setSelectedProgram: (state, action: PayloadAction<Program | null>) => {
      state.selectedProgram = action.payload;
    },
    
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
    },
    
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
      // Update dashboard stats
      state.dashboard.stats.totalBookings += 1;
      if (action.payload.status === 'confirmed') {
        state.dashboard.stats.upcomingBookings += 1;
      }
      state.dashboard.stats.totalSpent += action.payload.totalPrice;
    },
    
    updateBooking: (state, action: PayloadAction<Booking>) => {
      const updatedBooking = action.payload;
      const index = state.bookings.findIndex(b => b.id === updatedBooking.id);
      if (index !== -1) {
        const oldBooking = state.bookings[index];
        state.bookings[index] = updatedBooking;
        
        // Update selected booking if it's the same
        if (state.selectedBooking?.id === updatedBooking.id) {
          state.selectedBooking = updatedBooking;
        }
        
        // Update dashboard stats if status changed
        if (oldBooking.status !== updatedBooking.status) {
          if (oldBooking.status === 'confirmed' && updatedBooking.status !== 'confirmed') {
            state.dashboard.stats.upcomingBookings -= 1;
          } else if (oldBooking.status !== 'confirmed' && updatedBooking.status === 'confirmed') {
            state.dashboard.stats.upcomingBookings += 1;
          }
        }
      }
    },
    
    removeBooking: (state, action: PayloadAction<string>) => {
      const bookingId = action.payload;
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        state.bookings = state.bookings.filter(b => b.id !== bookingId);
        
        // Update dashboard stats
        state.dashboard.stats.totalBookings -= 1;
        if (booking.status === 'confirmed') {
          state.dashboard.stats.upcomingBookings -= 1;
        }
        state.dashboard.stats.totalSpent -= booking.totalPrice;
        
        if (state.selectedBooking?.id === bookingId) {
          state.selectedBooking = null;
        }
      }
    },
    
    setSelectedBooking: (state, action: PayloadAction<Booking | null>) => {
      state.selectedBooking = action.payload;
    },
    
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
      state.dashboard.stats.totalStudents = action.payload.length;
    },
    
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
      state.dashboard.stats.totalStudents += 1;
    },
    
    updateStudent: (state, action: PayloadAction<Student>) => {
      const updatedStudent = action.payload;
      const index = state.students.findIndex(s => s.id === updatedStudent.id);
      if (index !== -1) {
        state.students[index] = updatedStudent;
      }
    },
    
    removeStudent: (state, action: PayloadAction<string>) => {
      const studentId = action.payload;
      state.students = state.students.filter(s => s.id !== studentId);
      state.dashboard.stats.totalStudents -= 1;
    },
    
    setFilters: (state, action: PayloadAction<Partial<SparkState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    setDashboardStats: (state, action: PayloadAction<SparkState['dashboard']['stats']>) => {
      state.dashboard.stats = action.payload;
    },
    
    setDashboardActivity: (state, action: PayloadAction<any[]>) => {
      state.dashboard.recentActivity = action.payload;
    },
    
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.dashboard.isLoading = action.payload;
    },
    
    addDashboardActivity: (state, action: PayloadAction<any>) => {
      state.dashboard.recentActivity.unshift(action.payload);
      // Keep only last 10 activities
      state.dashboard.recentActivity = state.dashboard.recentActivity.slice(0, 10);
    },
    
    updatePermissionSlipStatus: (state, action: PayloadAction<{ 
      bookingId: string; 
      studentId: string; 
      status: 'pending' | 'submitted' | 'approved' 
    }>) => {
      const { bookingId, studentId, status } = action.payload;
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking) {
        const student = booking.students.find(s => s.id === studentId);
        if (student) {
          student.permissionSlipStatus = status;
          
          // Update permission slip counts
          const submitted = booking.students.filter(s => s.permissionSlipStatus === 'submitted' || s.permissionSlipStatus === 'approved').length;
          booking.permissionSlips.submitted = submitted;
        }
      }
    },
    
    clearSpark: (state) => {
      return initialState;
    },
  },
});

export const {
  setLoading,
  setError,
  setPrograms,
  appendPrograms,
  setSelectedProgram,
  setBookings,
  addBooking,
  updateBooking,
  removeBooking,
  setSelectedBooking,
  setStudents,
  addStudent,
  updateStudent,
  removeStudent,
  setFilters,
  clearFilters,
  setDashboardStats,
  setDashboardActivity,
  setDashboardLoading,
  addDashboardActivity,
  updatePermissionSlipStatus,
  clearSpark,
} = sparkSlice.actions;

export default sparkSlice.reducer;

// Selectors
export const selectPrograms = (state: { spark: SparkState }) => state.spark.programs;
export const selectSelectedProgram = (state: { spark: SparkState }) => state.spark.selectedProgram;
export const selectBookings = (state: { spark: SparkState }) => state.spark.bookings;
export const selectSelectedBooking = (state: { spark: SparkState }) => state.spark.selectedBooking;
export const selectStudents = (state: { spark: SparkState }) => state.spark.students;
export const selectSparkFilters = (state: { spark: SparkState }) => state.spark.filters;
export const selectDashboardStats = (state: { spark: SparkState }) => state.spark.dashboard.stats;
export const selectDashboardActivity = (state: { spark: SparkState }) => state.spark.dashboard.recentActivity;
export const selectDashboardLoading = (state: { spark: SparkState }) => state.spark.dashboard.isLoading;
export const selectSparkLoading = (state: { spark: SparkState }) => state.spark.isLoading;
export const selectSparkError = (state: { spark: SparkState }) => state.spark.error;
