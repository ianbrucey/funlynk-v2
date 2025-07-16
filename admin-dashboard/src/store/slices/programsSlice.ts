import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProgramsState, SparkProgram, ProgramFilters } from '../../types/programs';
import { programsService } from '../../services/programsService';

const initialState: ProgramsState = {
  programs: [],
  stats: null,
  analytics: {},
  filters: {
    sortBy: 'createdAt',
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
  selectedProgram: null,
};

// Async thunks
export const loadPrograms = createAsyncThunk(
  'programs/loadPrograms',
  async (params: { page?: number; limit?: number }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { programs: ProgramsState };
      const response = await programsService.getPrograms({
        ...state.programs.filters,
        page: params.page || 1,
        limit: params.limit || 20,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load programs');
    }
  }
);

export const filterPrograms = createAsyncThunk(
  'programs/filterPrograms',
  async (filters: ProgramFilters, { rejectWithValue }) => {
    try {
      const response = await programsService.getPrograms({
        ...filters,
        page: 1,
        limit: 20,
      });
      return { filters, data: response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to filter programs');
    }
  }
);

export const loadProgramStats = createAsyncThunk(
  'programs/loadProgramStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await programsService.getProgramStats();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load program stats');
    }
  }
);

export const approveProgram = createAsyncThunk(
  'programs/approveProgram',
  async (params: { programId: string; comments?: string }, { rejectWithValue }) => {
    try {
      const response = await programsService.approveProgram(params.programId, params.comments);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve program');
    }
  }
);

export const rejectProgram = createAsyncThunk(
  'programs/rejectProgram',
  async (params: { programId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await programsService.rejectProgram(params.programId, params.reason);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reject program');
    }
  }
);

export const suspendProgram = createAsyncThunk(
  'programs/suspendProgram',
  async (params: { programId: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await programsService.suspendProgram(params.programId, params.reason);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to suspend program');
    }
  }
);

export const loadProgramAnalytics = createAsyncThunk(
  'programs/loadProgramAnalytics',
  async (programId: string, { rejectWithValue }) => {
    try {
      const response = await programsService.getProgramAnalytics(programId);
      return { programId, analytics: response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load program analytics');
    }
  }
);

const programsSlice = createSlice({
  name: 'programs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProgram: (state, action: PayloadAction<SparkProgram | null>) => {
      state.selectedProgram = action.payload;
    },
    updateProgramStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const program = state.programs.find(p => p.id === action.payload.id);
      if (program) {
        program.status = action.payload.status as any;
      }
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Load programs
      .addCase(loadPrograms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadPrograms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.programs = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(loadPrograms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Filter programs
      .addCase(filterPrograms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(filterPrograms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filters = action.payload.filters;
        state.programs = action.payload.data.data;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(filterPrograms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Load program stats
      .addCase(loadProgramStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Approve program
      .addCase(approveProgram.fulfilled, (state, action) => {
        const program = state.programs.find(p => p.id === action.payload.id);
        if (program) {
          program.status = 'approved';
          program.approvedAt = new Date().toISOString();
        }
      })
      // Reject program
      .addCase(rejectProgram.fulfilled, (state, action) => {
        const program = state.programs.find(p => p.id === action.payload.id);
        if (program) {
          program.status = 'rejected';
          program.rejectionReason = action.payload.reason;
        }
      })
      // Suspend program
      .addCase(suspendProgram.fulfilled, (state, action) => {
        const program = state.programs.find(p => p.id === action.payload.id);
        if (program) {
          program.status = 'suspended';
        }
      })
      // Load program analytics
      .addCase(loadProgramAnalytics.fulfilled, (state, action) => {
        state.analytics[action.payload.programId] = action.payload.analytics;
      });
  },
});

export const { clearError, setSelectedProgram, updateProgramStatus, clearFilters } = programsSlice.actions;
export default programsSlice.reducer;
