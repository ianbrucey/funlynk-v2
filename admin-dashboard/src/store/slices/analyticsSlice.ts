import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AnalyticsData, FinancialData, SystemHealthData, ReportConfig } from '../../types';

interface AnalyticsState {
  analytics: AnalyticsData | null;
  financialData: FinancialData | null;
  systemHealth: SystemHealthData | null;
  savedReports: ReportConfig[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: AnalyticsState = {
  analytics: null,
  financialData: null,
  systemHealth: null,
  savedReports: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Mock service for development
const mockAnalyticsService = {
  async getAnalytics(dateRange: { startDate: Date; endDate: Date }): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      totalRevenue: 245680,
      activeUsers: 12543,
      totalBookings: 1876,
      platformGrowth: 23.5,
      revenueGrowth: 15.2,
      userGrowth: 12.8,
      bookingGrowth: 18.4,
      growthChange: 3.2,
      revenueTrend: [100, 120, 110, 140, 135, 160, 155, 180, 175, 200],
      userTrend: [80, 85, 90, 95, 100, 105, 110, 115, 120, 125],
      bookingTrend: [60, 65, 70, 75, 80, 85, 90, 95, 100, 105],
      growthTrend: [10, 12, 15, 18, 20, 22, 25, 23, 24, 26],
      revenueData: [
        { date: '2024-01', value: 18500, label: 'January' },
        { date: '2024-02', value: 22300, label: 'February' },
        { date: '2024-03', value: 19800, label: 'March' },
        { date: '2024-04', value: 25600, label: 'April' },
        { date: '2024-05', value: 28900, label: 'May' },
        { date: '2024-06', value: 32400, label: 'June' },
        { date: '2024-07', value: 35200, label: 'July' },
      ],
      userGrowthData: [
        { date: '2024-01', value: 8500, label: 'January' },
        { date: '2024-02', value: 9200, label: 'February' },
        { date: '2024-03', value: 9800, label: 'March' },
        { date: '2024-04', value: 10500, label: 'April' },
        { date: '2024-05', value: 11200, label: 'May' },
        { date: '2024-06', value: 11900, label: 'June' },
        { date: '2024-07', value: 12543, label: 'July' },
      ],
      programPerformance: [
        {
          id: '1',
          name: 'Science Exploration Workshop',
          bookings: 145,
          revenue: 7250,
          rating: 4.8,
          completionRate: 95,
          category: 'Science',
        },
        {
          id: '2',
          name: 'Creative Writing Adventure',
          bookings: 128,
          revenue: 5120,
          rating: 4.6,
          completionRate: 92,
          category: 'Language Arts',
        },
        {
          id: '3',
          name: 'Math Problem Solving',
          bookings: 112,
          revenue: 5600,
          rating: 4.7,
          completionRate: 88,
          category: 'Mathematics',
        },
      ],
      geographicData: [
        { region: 'California', users: 3245, revenue: 89500, bookings: 456 },
        { region: 'Texas', users: 2876, revenue: 76200, bookings: 398 },
        { region: 'New York', users: 2543, revenue: 82100, bookings: 423 },
        { region: 'Florida', users: 1987, revenue: 54300, bookings: 287 },
        { region: 'Illinois', users: 1654, revenue: 43200, bookings: 234 },
      ],
      topPrograms: [
        { id: '1', name: 'Science Exploration Workshop', value: 145, change: 12.5, subtitle: 'bookings' },
        { id: '2', name: 'Creative Writing Adventure', value: 128, change: 8.3, subtitle: 'bookings' },
        { id: '3', name: 'Math Problem Solving', value: 112, change: -2.1, subtitle: 'bookings' },
      ],
      topTeachers: [
        { id: '1', name: 'Sarah Johnson', value: 4.9, change: 0.2, subtitle: 'rating' },
        { id: '2', name: 'Michael Chen', value: 4.8, change: 0.1, subtitle: 'rating' },
        { id: '3', name: 'Emily Davis', value: 4.7, change: -0.1, subtitle: 'rating' },
      ],
      topSchools: [
        { id: '1', name: 'Lincoln Elementary', value: 23, change: 15.2, subtitle: 'bookings' },
        { id: '2', name: 'Washington Middle', value: 19, change: 8.7, subtitle: 'bookings' },
        { id: '3', name: 'Roosevelt High', value: 16, change: -5.3, subtitle: 'bookings' },
      ],
    };
  },

  async getFinancialData(dateRange: { startDate: Date; endDate: Date }): Promise<FinancialData> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      revenueBreakdown: [
        { category: 'Program Fees', amount: 185400, percentage: 75.5, change: 12.3 },
        { category: 'Subscription Revenue', amount: 36800, percentage: 15.0, change: 8.7 },
        { category: 'Additional Services', amount: 18400, percentage: 7.5, change: -2.1 },
        { category: 'Other', amount: 4900, percentage: 2.0, change: 5.4 },
      ],
      paymentMethods: [
        { method: 'Credit Card', amount: 198500, count: 1245, percentage: 80.8 },
        { method: 'Bank Transfer', amount: 32100, count: 187, percentage: 13.1 },
        { method: 'PayPal', amount: 12300, count: 98, percentage: 5.0 },
        { method: 'Other', amount: 2700, count: 23, percentage: 1.1 },
      ],
      refundData: [
        { date: '2024-07-01', amount: 1250, count: 5, reason: 'Cancellation' },
        { date: '2024-07-02', amount: 890, count: 3, reason: 'Technical Issues' },
        { date: '2024-07-03', amount: 1560, count: 6, reason: 'Scheduling Conflict' },
      ],
      summary: [
        { period: 'Q1 2024', revenue: 58900, expenses: 42300, profit: 16600, margin: 28.2 },
        { period: 'Q2 2024', revenue: 67200, expenses: 48100, profit: 19100, margin: 28.4 },
        { period: 'Q3 2024', revenue: 75400, expenses: 52800, profit: 22600, margin: 30.0 },
      ],
    };
  },

  async getSystemHealth(): Promise<SystemHealthData> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      metrics: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        activeConnections: 1247,
        responseTime: 120,
      },
      performanceData: [
        { timestamp: '2024-07-16T10:00:00Z', cpuUsage: 42, memoryUsage: 58, responseTime: 115, throughput: 1250 },
        { timestamp: '2024-07-16T10:05:00Z', cpuUsage: 45, memoryUsage: 62, responseTime: 120, throughput: 1180 },
        { timestamp: '2024-07-16T10:10:00Z', cpuUsage: 48, memoryUsage: 65, responseTime: 125, throughput: 1320 },
      ],
      alerts: [
        {
          id: '1',
          type: 'warning',
          message: 'High memory usage detected on server-02',
          timestamp: '2024-07-16T09:45:00Z',
          resolved: false,
        },
        {
          id: '2',
          type: 'info',
          message: 'Scheduled maintenance completed successfully',
          timestamp: '2024-07-16T08:30:00Z',
          resolved: true,
        },
      ],
      errorLogs: [
        {
          id: '1',
          timestamp: '2024-07-16T10:15:00Z',
          level: 'error',
          message: 'Database connection timeout',
          source: 'booking-service',
        },
        {
          id: '2',
          timestamp: '2024-07-16T10:12:00Z',
          level: 'warning',
          message: 'Slow query detected',
          source: 'analytics-service',
        },
      ],
    };
  },
};

// Async thunks
export const loadAnalytics = createAsyncThunk(
  'analytics/loadAnalytics',
  async (dateRange: { startDate: Date; endDate: Date }, { rejectWithValue }) => {
    try {
      const data = await mockAnalyticsService.getAnalytics(dateRange);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load analytics');
    }
  }
);

export const loadFinancialData = createAsyncThunk(
  'analytics/loadFinancialData',
  async (dateRange: { startDate: Date; endDate: Date }, { rejectWithValue }) => {
    try {
      const data = await mockAnalyticsService.getFinancialData(dateRange);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load financial data');
    }
  }
);

export const loadSystemHealth = createAsyncThunk(
  'analytics/loadSystemHealth',
  async (_, { rejectWithValue }) => {
    try {
      const data = await mockAnalyticsService.getSystemHealth();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load system health');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addSavedReport: (state, action: PayloadAction<ReportConfig>) => {
      state.savedReports.push(action.payload);
    },
    removeSavedReport: (state, action: PayloadAction<string>) => {
      state.savedReports = state.savedReports.filter(report => report.name !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load analytics
      .addCase(loadAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(loadAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load financial data
      .addCase(loadFinancialData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFinancialData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.financialData = action.payload;
        state.error = null;
      })
      .addCase(loadFinancialData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load system health
      .addCase(loadSystemHealth.pending, (state) => {
        // Don't set loading for system health to avoid UI flicker
      })
      .addCase(loadSystemHealth.fulfilled, (state, action) => {
        state.systemHealth = action.payload;
      })
      .addCase(loadSystemHealth.rejected, (state, action) => {
        // Handle system health error silently or show notification
      });
  },
});

export const { clearError, addSavedReport, removeSavedReport } = analyticsSlice.actions;

export default analyticsSlice.reducer;
