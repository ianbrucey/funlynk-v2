import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardStats } from '../../types';
import { dashboardService } from '../../services/dashboardService';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const loadDashboardData = createAsyncThunk(
  'dashboard/loadDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load dashboard data');
    }
  }
);

export const refreshDashboardData = createAsyncThunk(
  'dashboard/refreshDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to refresh dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.stats = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load dashboard data
      .addCase(loadDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(loadDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh dashboard data
      .addCase(refreshDashboardData.pending, (state) => {
        // Don't set loading to true for refresh to avoid UI flicker
        state.error = null;
      })
      .addCase(refreshDashboardData.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(refreshDashboardData.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer;
