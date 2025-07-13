import { ApiClient } from '../shared/ApiClient';
import type { 
  {MODEL}, 
  {MODEL}CreateData, 
  {MODEL}UpdateData, 
  {MODEL}Filters 
} from '../../types/{module}';
import type { 
  PaginatedResponse, 
  ApiResponse, 
  RequestConfig 
} from '../../types/shared';

/**
 * {MODEL} API Service
 * 
 * Handles all API operations for {MODEL} resources.
 * Provides CRUD operations, search, filtering, and pagination.
 * 
 * Features:
 * - RESTful API operations
 * - Request/response transformation
 * - Error handling
 * - Request cancellation
 * - Caching support
 * 
 * @example
 * ```typescript
 * // Get all {model}s
 * const {model}s = await {model}Api.getAll();
 * 
 * // Create a new {model}
 * const new{MODEL} = await {model}Api.create(data);
 * 
 * // Update existing {model}
 * const updated{MODEL} = await {model}Api.update(id, data);
 * ```
 */

// ========================================
// TYPES
// ========================================

export interface Get{MODEL}sParams {
  // Pagination
  page?: number;
  limit?: number;
  
  // Filtering
  search?: string;
  status?: string;
  category?: string;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Date filtering
  dateFrom?: string;
  dateTo?: string;
  
  // Module-specific filters
  userId?: string;
  location?: string;
  
  // Core-specific filters (Events)
  visibility?: 'public' | 'friends' | 'private';
  priceMin?: number;
  priceMax?: number;
  
  // Spark-specific filters (Programs)
  gradeLevel?: string;
  characterTopic?: string;
  duration?: string;
  schoolId?: string;
  districtId?: string;
}

export interface {MODEL}Stats {
  total: number;
  active: number;
  inactive: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
}

// ========================================
// API SERVICE CLASS
// ========================================

class {MODEL}ApiService {
  private readonly baseUrl = '/{module}/{model}s';
  private readonly apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ========================================
  // CRUD OPERATIONS
  // ========================================

  /**
   * Get all {model}s with optional filtering and pagination
   */
  async getAll(
    params: Get{MODEL}sParams = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<{MODEL}>> {
    const queryParams = this.buildQueryParams(params);
    
    const response = await this.apiClient.get<PaginatedResponse<{MODEL}>>(
      `${this.baseUrl}?${queryParams}`,
      config
    );

    return {
      ...response,
      data: response.data.map(this.transform{MODEL}FromApi),
    };
  }

  /**
   * Get a single {model} by ID
   */
  async getById(
    id: string,
    config?: RequestConfig
  ): Promise<{MODEL}> {
    const response = await this.apiClient.get<ApiResponse<{MODEL}>>(
      `${this.baseUrl}/${id}`,
      config
    );

    return this.transform{MODEL}FromApi(response.data);
  }

  /**
   * Create a new {model}
   */
  async create(
    data: {MODEL}CreateData,
    config?: RequestConfig
  ): Promise<{MODEL}> {
    const transformedData = this.transform{MODEL}ToApi(data);
    
    const response = await this.apiClient.post<ApiResponse<{MODEL}>>(
      this.baseUrl,
      transformedData,
      config
    );

    return this.transform{MODEL}FromApi(response.data);
  }

  /**
   * Update an existing {model}
   */
  async update(
    id: string,
    data: {MODEL}UpdateData,
    config?: RequestConfig
  ): Promise<{MODEL}> {
    const transformedData = this.transform{MODEL}ToApi(data);
    
    const response = await this.apiClient.put<ApiResponse<{MODEL}>>(
      `${this.baseUrl}/${id}`,
      transformedData,
      config
    );

    return this.transform{MODEL}FromApi(response.data);
  }

  /**
   * Partially update a {model}
   */
  async patch(
    id: string,
    data: Partial<{MODEL}UpdateData>,
    config?: RequestConfig
  ): Promise<{MODEL}> {
    const transformedData = this.transform{MODEL}ToApi(data);
    
    const response = await this.apiClient.patch<ApiResponse<{MODEL}>>(
      `${this.baseUrl}/${id}`,
      transformedData,
      config
    );

    return this.transform{MODEL}FromApi(response.data);
  }

  /**
   * Delete a {model}
   */
  async delete(
    id: string,
    config?: RequestConfig
  ): Promise<void> {
    await this.apiClient.delete(
      `${this.baseUrl}/${id}`,
      config
    );
  }

  // ========================================
  // SPECIALIZED OPERATIONS
  // ========================================

  /**
   * Search {model}s with advanced criteria
   */
  async search(
    query: string,
    filters: {MODEL}Filters = {},
    config?: RequestConfig
  ): Promise<{MODEL}[]> {
    const params = {
      search: query,
      ...filters,
    };
    
    const queryParams = this.buildQueryParams(params);
    
    const response = await this.apiClient.get<ApiResponse<{MODEL}[]>>(
      `${this.baseUrl}/search?${queryParams}`,
      config
    );

    return response.data.map(this.transform{MODEL}FromApi);
  }

  /**
   * Get {model} statistics
   */
  async getStats(
    filters: Partial<Get{MODEL}sParams> = {},
    config?: RequestConfig
  ): Promise<{MODEL}Stats> {
    const queryParams = this.buildQueryParams(filters);
    
    const response = await this.apiClient.get<ApiResponse<{MODEL}Stats>>(
      `${this.baseUrl}/stats?${queryParams}`,
      config
    );

    return response.data;
  }

  /**
   * Get nearby {model}s (for location-based features)
   */
  async getNearby(
    latitude: number,
    longitude: number,
    radius: number = 10,
    config?: RequestConfig
  ): Promise<{MODEL}[]> {
    const params = {
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString(),
    };
    
    const queryParams = this.buildQueryParams(params);
    
    const response = await this.apiClient.get<ApiResponse<{MODEL}[]>>(
      `${this.baseUrl}/nearby?${queryParams}`,
      config
    );

    return response.data.map(this.transform{MODEL}FromApi);
  }

  /**
   * Get trending {model}s
   */
  async getTrending(
    limit: number = 10,
    config?: RequestConfig
  ): Promise<{MODEL}[]> {
    const response = await this.apiClient.get<ApiResponse<{MODEL}[]>>(
      `${this.baseUrl}/trending?limit=${limit}`,
      config
    );

    return response.data.map(this.transform{MODEL}FromApi);
  }

  /**
   * Get featured {model}s
   */
  async getFeatured(
    limit: number = 5,
    config?: RequestConfig
  ): Promise<{MODEL}[]> {
    const response = await this.apiClient.get<ApiResponse<{MODEL}[]>>(
      `${this.baseUrl}/featured?limit=${limit}`,
      config
    );

    return response.data.map(this.transform{MODEL}FromApi);
  }

  // ========================================
  // MODULE-SPECIFIC OPERATIONS
  // ========================================

  /**
   * Core-specific: RSVP to an event
   */
  async rsvp(
    id: string,
    status: 'yes' | 'no' | 'maybe',
    config?: RequestConfig
  ): Promise<void> {
    await this.apiClient.post(
      `${this.baseUrl}/${id}/rsvp`,
      { status },
      config
    );
  }

  /**
   * Core-specific: Get event attendees
   */
  async getAttendees(
    id: string,
    config?: RequestConfig
  ): Promise<any[]> {
    const response = await this.apiClient.get<ApiResponse<any[]>>(
      `${this.baseUrl}/${id}/attendees`,
      config
    );

    return response.data;
  }

  /**
   * Spark-specific: Book a program
   */
  async bookProgram(
    id: string,
    bookingData: any,
    config?: RequestConfig
  ): Promise<any> {
    const response = await this.apiClient.post<ApiResponse<any>>(
      `${this.baseUrl}/${id}/book`,
      bookingData,
      config
    );

    return response.data;
  }

  /**
   * Spark-specific: Get program availability
   */
  async getAvailability(
    id: string,
    month: string,
    config?: RequestConfig
  ): Promise<any[]> {
    const response = await this.apiClient.get<ApiResponse<any[]>>(
      `${this.baseUrl}/${id}/availability?month=${month}`,
      config
    );

    return response.data;
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * Bulk create {model}s
   */
  async bulkCreate(
    data: {MODEL}CreateData[],
    config?: RequestConfig
  ): Promise<{MODEL}[]> {
    const transformedData = data.map(this.transform{MODEL}ToApi);
    
    const response = await this.apiClient.post<ApiResponse<{MODEL}[]>>(
      `${this.baseUrl}/bulk`,
      { items: transformedData },
      config
    );

    return response.data.map(this.transform{MODEL}FromApi);
  }

  /**
   * Bulk update {model}s
   */
  async bulkUpdate(
    updates: Array<{ id: string; data: {MODEL}UpdateData }>,
    config?: RequestConfig
  ): Promise<{MODEL}[]> {
    const transformedUpdates = updates.map(({ id, data }) => ({
      id,
      data: this.transform{MODEL}ToApi(data),
    }));
    
    const response = await this.apiClient.put<ApiResponse<{MODEL}[]>>(
      `${this.baseUrl}/bulk`,
      { updates: transformedUpdates },
      config
    );

    return response.data.map(this.transform{MODEL}FromApi);
  }

  /**
   * Bulk delete {model}s
   */
  async bulkDelete(
    ids: string[],
    config?: RequestConfig
  ): Promise<void> {
    await this.apiClient.delete(
      `${this.baseUrl}/bulk`,
      {
        ...config,
        data: { ids },
      }
    );
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  /**
   * Build query parameters string from object
   */
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    
    return searchParams.toString();
  }

  /**
   * Transform {model} data from API format to app format
   */
  private transform{MODEL}FromApi = (apiData: any): {MODEL} => {
    return {
      ...apiData,
      // Transform dates
      createdAt: apiData.created_at ? new Date(apiData.created_at) : undefined,
      updatedAt: apiData.updated_at ? new Date(apiData.updated_at) : undefined,
      
      // Transform snake_case to camelCase
      userId: apiData.user_id,
      imageUrl: apiData.image_url,
      
      // Module-specific transformations
      ...('{MODULE}' === 'Core' && {
        startDate: apiData.start_date ? new Date(apiData.start_date) : undefined,
        endDate: apiData.end_date ? new Date(apiData.end_date) : undefined,
        maxCapacity: apiData.max_capacity,
        currentAttendees: apiData.current_attendees,
        locationAddress: apiData.location_address,
        locationLatitude: apiData.location_latitude,
        locationLongitude: apiData.location_longitude,
      }),
      
      ...('{MODULE}' === 'Spark' && {
        durationMinutes: apiData.duration_minutes,
        characterTopics: apiData.character_topics,
        gradeLevels: apiData.grade_levels,
        whatToBring: apiData.what_to_bring,
        specialInstructions: apiData.special_instructions,
      }),
    };
  };

  /**
   * Transform {model} data from app format to API format
   */
  private transform{MODEL}ToApi = (appData: any): any => {
    return {
      ...appData,
      // Transform camelCase to snake_case
      user_id: appData.userId,
      image_url: appData.imageUrl,
      
      // Transform dates
      created_at: appData.createdAt?.toISOString(),
      updated_at: appData.updatedAt?.toISOString(),
      
      // Module-specific transformations
      ...('{MODULE}' === 'Core' && {
        start_date: appData.startDate?.toISOString(),
        end_date: appData.endDate?.toISOString(),
        max_capacity: appData.maxCapacity,
        location_address: appData.locationAddress,
        location_latitude: appData.locationLatitude,
        location_longitude: appData.locationLongitude,
      }),
      
      ...('{MODULE}' === 'Spark' && {
        duration_minutes: appData.durationMinutes,
        character_topics: appData.characterTopics,
        grade_levels: appData.gradeLevels,
        what_to_bring: appData.whatToBring,
        special_instructions: appData.specialInstructions,
      }),
    };
  };
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const {model}Api = new {MODEL}ApiService();

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODEL}: Model name (e.g., Event, Program, User)
   - {model}: Lowercase model name (e.g., event, program, user)
   - {MODULE}: Module name (e.g., Core, Spark)
   - {module}: Module name lowercase (e.g., core, spark)

2. Update types to match your data model

3. Customize API endpoints to match your backend routes

4. Update transformation methods for your data structure

5. Add module-specific operations as needed

6. Configure error handling and retry logic

EXAMPLE USAGE:
- eventApi for Core module events
- programApi for Spark module programs
- userApi for shared user operations

COMMON CUSTOMIZATIONS:
- Add file upload methods
- Add real-time subscription methods
- Add caching strategies
- Add offline support
- Add request/response interceptors
- Add analytics tracking
*/
