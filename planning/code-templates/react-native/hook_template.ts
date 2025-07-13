import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';

// Services
import { {model}Api } from '../../services/api/{module}/{model}Api';

// Redux
import { {model}Actions } from '../../store/slices/{module}Slice';
import type { RootState } from '../../store/store';

// Types
import type { {MODEL}, {MODEL}CreateData, {MODEL}UpdateData, {MODEL}Filters } from '../../types/{module}';
import type { PaginatedResponse, ApiError } from '../../types/shared';

// Utils
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandling';

/**
 * use{MODEL}s Hook
 * 
 * Custom hook for managing {MODEL} data and operations.
 * Provides CRUD operations, pagination, filtering, and caching.
 * 
 * Features:
 * - Data fetching with pagination
 * - Real-time updates
 * - Optimistic updates
 * - Error handling
 * - Loading states
 * - Caching and refresh
 * 
 * @example
 * ```tsx
 * const {
 *   {model}s,
 *   loading,
 *   error,
 *   refresh,
 *   loadMore,
 *   create{MODEL},
 *   update{MODEL},
 *   delete{MODEL}
 * } = use{MODEL}s();
 * ```
 */

// ========================================
// TYPES
// ========================================

export interface Use{MODEL}sOptions {
  // Pagination
  initialPage?: number;
  pageSize?: number;
  
  // Filtering
  filters?: {MODEL}Filters;
  searchQuery?: string;
  
  // Behavior
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableOptimisticUpdates?: boolean;
  enableRealTimeUpdates?: boolean;
  
  // Caching
  cacheKey?: string;
  cacheTimeout?: number;
}

export interface Use{MODEL}sReturn {
  // Data
  {model}s: {MODEL}[];
  total: number;
  currentPage: number;
  hasMore: boolean;
  
  // States
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  search: (query: string) => Promise<void>;
  setFilters: (filters: {MODEL}Filters) => void;
  
  // CRUD operations
  create{MODEL}: (data: {MODEL}CreateData) => Promise<{MODEL}>;
  update{MODEL}: (id: string, data: {MODEL}UpdateData) => Promise<{MODEL}>;
  delete{MODEL}: (id: string) => Promise<void>;
  
  // Utilities
  get{MODEL}ById: (id: string) => {MODEL} | undefined;
  clear: () => void;
  retry: () => Promise<void>;
}

// ========================================
// HOOK IMPLEMENTATION
// ========================================

export const use{MODEL}s = (options: Use{MODEL}sOptions = {}): Use{MODEL}sReturn => {
  const {
    initialPage = 1,
    pageSize = 20,
    filters = {},
    searchQuery = '',
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableOptimisticUpdates = true,
    enableRealTimeUpdates = false,
    cacheKey = 'default',
    cacheTimeout = 300000, // 5 minutes
  } = options;

  // ========================================
  // REDUX STATE
  // ========================================

  const dispatch = useDispatch();
  const {
    {model}s: store{MODEL}s,
    loading: storeLoading,
    error: storeError,
    pagination,
    filters: storeFilters,
  } = useSelector((state: RootState) => state.{module});

  // ========================================
  // LOCAL STATE
  // ========================================

  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // ========================================
  // REFS
  // ========================================

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  // ========================================
  // COMPUTED VALUES
  // ========================================

  const loading = storeLoading || localLoading;
  const error = storeError || localError;
  const {model}s = store{MODEL}s[cacheKey] || [];
  const total = pagination[cacheKey]?.total || 0;
  const hasMore = pagination[cacheKey]?.hasMore || false;

  // ========================================
  // EFFECTS
  // ========================================

  // Initial load
  useEffect(() => {
    loadInitialData();
    
    return () => {
      cleanup();
    };
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Filters change
  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(storeFilters[cacheKey])) {
      dispatch({model}Actions.setFilters({ cacheKey, filters }));
      loadInitialData();
    }
  }, [filters]);

  // Search change
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        search(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // ========================================
  // API FUNCTIONS
  // ========================================

  const loadInitialData = useCallback(async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const response = await {model}Api.getAll({
        page: 1,
        limit: pageSize,
        ...filters,
        search: searchTerm,
      }, { signal: abortControllerRef.current.signal });

      dispatch({model}Actions.set{MODEL}s({
        cacheKey,
        {model}s: response.data,
        pagination: {
          currentPage: 1,
          total: response.total,
          hasMore: response.data.length === pageSize,
        },
      }));

      setCurrentPage(1);
      lastFetchRef.current = Date.now();

    } catch (error) {
      if (error.name !== 'AbortError') {
        const errorMessage = handleApiError(error as ApiError);
        setLocalError(errorMessage);
        logger.error('Failed to load {model}s', error);
      }
    } finally {
      setLocalLoading(false);
    }
  }, [filters, searchTerm, pageSize, cacheKey]);

  const loadMoreData = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      
      const nextPage = currentPage + 1;
      const response = await {model}Api.getAll({
        page: nextPage,
        limit: pageSize,
        ...filters,
        search: searchTerm,
      });

      dispatch({model}Actions.append{MODEL}s({
        cacheKey,
        {model}s: response.data,
        pagination: {
          currentPage: nextPage,
          total: response.total,
          hasMore: response.data.length === pageSize,
        },
      }));

      setCurrentPage(nextPage);

    } catch (error) {
      const errorMessage = handleApiError(error as ApiError);
      setLocalError(errorMessage);
      logger.error('Failed to load more {model}s', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, filters, searchTerm, pageSize, cacheKey]);

  // ========================================
  // PUBLIC FUNCTIONS
  // ========================================

  const refresh = useCallback(async () => {
    // Prevent too frequent refreshes
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;

    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, [loadInitialData]);

  const loadMore = useCallback(async () => {
    await loadMoreData();
  }, [loadMoreData]);

  const search = useCallback(async (query: string) => {
    setSearchTerm(query);
    dispatch({model}Actions.setSearchQuery({ cacheKey, query }));
  }, [cacheKey]);

  const setFilters = useCallback((newFilters: {MODEL}Filters) => {
    dispatch({model}Actions.setFilters({ cacheKey, filters: newFilters }));
  }, [cacheKey]);

  const create{MODEL} = useCallback(async (data: {MODEL}CreateData): Promise<{MODEL}> => {
    try {
      // Optimistic update
      if (enableOptimisticUpdates) {
        const optimistic{MODEL}: {MODEL} = {
          id: `temp-${Date.now()}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as {MODEL};

        dispatch({model}Actions.add{MODEL}({ cacheKey, {model}: optimistic{MODEL} }));
      }

      const new{MODEL} = await {model}Api.create(data);

      // Replace optimistic update with real data
      if (enableOptimisticUpdates) {
        dispatch({model}Actions.replace{MODEL}({ 
          cacheKey, 
          tempId: `temp-${Date.now()}`, 
          {model}: new{MODEL} 
        }));
      } else {
        dispatch({model}Actions.add{MODEL}({ cacheKey, {model}: new{MODEL} }));
      }

      logger.info('{MODEL} created successfully', { id: new{MODEL}.id });
      return new{MODEL};

    } catch (error) {
      // Revert optimistic update on error
      if (enableOptimisticUpdates) {
        dispatch({model}Actions.remove{MODEL}({ cacheKey, id: `temp-${Date.now()}` }));
      }

      const errorMessage = handleApiError(error as ApiError);
      setLocalError(errorMessage);
      logger.error('Failed to create {model}', error);
      throw error;
    }
  }, [enableOptimisticUpdates, cacheKey]);

  const update{MODEL} = useCallback(async (id: string, data: {MODEL}UpdateData): Promise<{MODEL}> => {
    try {
      // Optimistic update
      if (enableOptimisticUpdates) {
        dispatch({model}Actions.update{MODEL}({ 
          cacheKey, 
          id, 
          updates: { ...data, updatedAt: new Date().toISOString() } 
        }));
      }

      const updated{MODEL} = await {model}Api.update(id, data);

      // Update with real data
      dispatch({model}Actions.update{MODEL}({ cacheKey, id, updates: updated{MODEL} }));

      logger.info('{MODEL} updated successfully', { id });
      return updated{MODEL};

    } catch (error) {
      // Revert optimistic update on error
      if (enableOptimisticUpdates) {
        await refresh(); // Refresh to get correct state
      }

      const errorMessage = handleApiError(error as ApiError);
      setLocalError(errorMessage);
      logger.error('Failed to update {model}', error);
      throw error;
    }
  }, [enableOptimisticUpdates, cacheKey, refresh]);

  const delete{MODEL} = useCallback(async (id: string): Promise<void> => {
    try {
      // Optimistic update
      let backup{MODEL}: {MODEL} | undefined;
      if (enableOptimisticUpdates) {
        backup{MODEL} = {model}s.find(item => item.id === id);
        dispatch({model}Actions.remove{MODEL}({ cacheKey, id }));
      }

      await {model}Api.delete(id);

      // Confirm deletion
      if (!enableOptimisticUpdates) {
        dispatch({model}Actions.remove{MODEL}({ cacheKey, id }));
      }

      logger.info('{MODEL} deleted successfully', { id });

    } catch (error) {
      // Revert optimistic update on error
      if (enableOptimisticUpdates && backup{MODEL}) {
        dispatch({model}Actions.add{MODEL}({ cacheKey, {model}: backup{MODEL} }));
      }

      const errorMessage = handleApiError(error as ApiError);
      setLocalError(errorMessage);
      logger.error('Failed to delete {model}', error);
      throw error;
    }
  }, [enableOptimisticUpdates, cacheKey, {model}s]);

  const get{MODEL}ById = useCallback((id: string): {MODEL} | undefined => {
    return {model}s.find(item => item.id === id);
  }, [{model}s]);

  const clear = useCallback(() => {
    dispatch({model}Actions.clear{MODEL}s({ cacheKey }));
    setLocalError(null);
    setCurrentPage(initialPage);
  }, [cacheKey, initialPage]);

  const retry = useCallback(async () => {
    setLocalError(null);
    await loadInitialData();
  }, [loadInitialData]);

  // ========================================
  // CLEANUP
  // ========================================

  const cleanup = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // ========================================
  // RETURN
  // ========================================

  return {
    // Data
    {model}s,
    total,
    currentPage,
    hasMore,
    
    // States
    loading,
    refreshing,
    loadingMore,
    error,
    
    // Actions
    refresh,
    loadMore,
    search,
    setFilters,
    
    // CRUD operations
    create{MODEL},
    update{MODEL},
    delete{MODEL},
    
    // Utilities
    get{MODEL}ById,
    clear,
    retry,
  };
};

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODEL}: Model name (e.g., Event, Program, User)
   - {model}: Lowercase model name (e.g., event, program, user)
   - {module}: Module name (e.g., core, spark, shared)

2. Update types to match your data model

3. Customize API calls to match your service layer

4. Update Redux actions to match your slice structure

5. Add any additional business logic or transformations

6. Configure caching and optimization options

EXAMPLE USAGE:
- useEvents hook in Core module
- usePrograms hook in Spark module
- useUsers hook in Shared module

COMMON CUSTOMIZATIONS:
- Add real-time updates with WebSocket
- Add offline support with local storage
- Add background sync
- Add data validation
- Add analytics tracking
- Add performance monitoring
*/
