import { ApiClient } from '../shared/ApiClient';
import type { 
  {MODEL}, 
  {MODEL}CreateData, 
  {MODEL}UpdateData, 
  {MODEL}Filters,
  {MODEL}Stats,
  DashboardMetrics,
  ExportOptions,
  BulkActionResult
} from '../../types/{module}';
import type { 
  PaginatedResponse, 
  ApiResponse, 
  RequestConfig 
} from '../../types/shared';

/**
 * {MODEL} Admin Service
 * 
 * Handles all admin-specific API operations for {MODEL} resources.
 * Extends basic CRUD with admin features like bulk operations,
 * analytics, reporting, and system management.
 * 
 * Features:
 * - Enhanced CRUD operations with admin privileges
 * - Bulk operations and batch processing
 * - Analytics and reporting
 * - Data export and import
 * - System monitoring and health checks
 * - Audit trail and logging
 * 
 * @example
 * ```typescript
 * // Get admin dashboard metrics
 * const metrics = await {model}AdminService.getDashboardMetrics();
 * 
 * // Perform bulk operations
 * const result = await {model}AdminService.bulkUpdate(updates);
 * 
 * // Export data with filters
 * const exportData = await {model}AdminService.exportData(options);
 * ```
 */

// ========================================
// TYPES
// ========================================

export interface AdminGet{MODEL}sParams {
  // Standard pagination and filtering
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  
  // Admin-specific filters
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  
  // System filters
  hasIssues?: boolean;
  needsReview?: boolean;
  isArchived?: boolean;
  
  // Performance filters
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
  includeMetadata?: boolean;
}

export interface BulkOperation {
  action: 'update' | 'delete' | 'archive' | 'restore' | 'approve' | 'reject';
  ids: string[];
  data?: Record<string, any>;
  reason?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  userId: string;
  userName: string;
  timestamp: string;
  changes: Record<string, any>;
  metadata: Record<string, any>;
}

// ========================================
// ADMIN SERVICE CLASS
// ========================================

class {MODEL}AdminService {
  private readonly baseUrl = '/admin/{module}/{model}s';
  private readonly apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // ========================================
  // ENHANCED CRUD OPERATIONS
  // ========================================

  /**
   * Get all {model}s with admin-level access and filters
   */
  async getAll(
    params: AdminGet{MODEL}sParams = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<{MODEL}>> {
    const queryParams = this.buildQueryParams(params);
    
    const response = await this.apiClient.get<PaginatedResponse<{MODEL}>>(
      `${this.baseUrl}?${queryParams}`,
      {
        ...config,
        headers: {
          ...config?.headers,
          'X-Admin-Access': 'true',
        },
      }
    );

    return {
      ...response,
      data: response.data.map(this.transform{MODEL}FromApi),
    };
  }

  /**
   * Get {model} with full admin details including audit trail
   */
  async getByIdWithAudit(
    id: string,
    config?: RequestConfig
  ): Promise<{MODEL} & { auditTrail: AuditLogEntry[] }> {
    const response = await this.apiClient.get<ApiResponse<{MODEL} & { auditTrail: AuditLogEntry[] }>>(
      `${this.baseUrl}/${id}/admin`,
      config
    );

    return {
      ...this.transform{MODEL}FromApi(response.data),
      auditTrail: response.data.auditTrail,
    };
  }

  /**
   * Create {model} with admin privileges
   */
  async createWithPrivileges(
    data: {MODEL}CreateData & { adminNotes?: string; skipValidation?: boolean },
    config?: RequestConfig
  ): Promise<{MODEL}> {
    const transformedData = this.transform{MODEL}ToApi(data);
    
    const response = await this.apiClient.post<ApiResponse<{MODEL}>>(
      `${this.baseUrl}/admin-create`,
      transformedData,
      config
    );

    return this.transform{MODEL}FromApi(response.data);
  }

  /**
   * Force update {model} (bypasses normal business rules)
   */
  async forceUpdate(
    id: string,
    data: {MODEL}UpdateData & { adminReason: string },
    config?: RequestConfig
  ): Promise<{MODEL}> {
    const transformedData = this.transform{MODEL}ToApi(data);
    
    const response = await this.apiClient.put<ApiResponse<{MODEL}>>(
      `${this.baseUrl}/${id}/force-update`,
      transformedData,
      config
    );

    return this.transform{MODEL}FromApi(response.data);
  }

  /**
   * Soft delete with admin reason
   */
  async adminDelete(
    id: string,
    reason: string,
    config?: RequestConfig
  ): Promise<void> {
    await this.apiClient.delete(
      `${this.baseUrl}/${id}/admin-delete`,
      {
        ...config,
        data: { reason },
      }
    );
  }

  /**
   * Permanently delete (hard delete)
   */
  async permanentDelete(
    id: string,
    confirmation: string,
    config?: RequestConfig
  ): Promise<void> {
    await this.apiClient.delete(
      `${this.baseUrl}/${id}/permanent-delete`,
      {
        ...config,
        data: { confirmation },
      }
    );
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  /**
   * Perform bulk operations on multiple {model}s
   */
  async bulkOperation(
    operation: BulkOperation,
    config?: RequestConfig
  ): Promise<BulkActionResult> {
    const response = await this.apiClient.post<ApiResponse<BulkActionResult>>(
      `${this.baseUrl}/bulk`,
      operation,
      config
    );

    return response.data;
  }

  /**
   * Bulk approve {model}s
   */
  async bulkApprove(
    ids: string[],
    reason?: string,
    config?: RequestConfig
  ): Promise<BulkActionResult> {
    return this.bulkOperation({
      action: 'approve',
      ids,
      reason,
    }, config);
  }

  /**
   * Bulk reject {model}s
   */
  async bulkReject(
    ids: string[],
    reason: string,
    config?: RequestConfig
  ): Promise<BulkActionResult> {
    return this.bulkOperation({
      action: 'reject',
      ids,
      reason,
    }, config);
  }

  /**
   * Bulk archive {model}s
   */
  async bulkArchive(
    ids: string[],
    config?: RequestConfig
  ): Promise<BulkActionResult> {
    return this.bulkOperation({
      action: 'archive',
      ids,
    }, config);
  }

  // ========================================
  // ANALYTICS AND REPORTING
  // ========================================

  /**
   * Get dashboard metrics and KPIs
   */
  async getDashboardMetrics(
    timeRange: '7d' | '30d' | '90d' | '1y' = '30d',
    config?: RequestConfig
  ): Promise<DashboardMetrics> {
    const response = await this.apiClient.get<ApiResponse<DashboardMetrics>>(
      `${this.baseUrl}/dashboard-metrics?timeRange=${timeRange}`,
      config
    );

    return response.data;
  }

  /**
   * Get detailed statistics
   */
  async getDetailedStats(
    filters: Partial<AdminGet{MODEL}sParams> = {},
    config?: RequestConfig
  ): Promise<{MODEL}Stats> {
    const queryParams = this.buildQueryParams(filters);
    
    const response = await this.apiClient.get<ApiResponse<{MODEL}Stats>>(
      `${this.baseUrl}/detailed-stats?${queryParams}`,
      config
    );

    return response.data;
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(
    metric: string,
    timeRange: string,
    config?: RequestConfig
  ): Promise<Array<{ date: string; value: number }>> {
    const response = await this.apiClient.get<ApiResponse<Array<{ date: string; value: number }>>>(
      `${this.baseUrl}/trends?metric=${metric}&timeRange=${timeRange}`,
      config
    );

    return response.data;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    config?: RequestConfig
  ): Promise<{
    averageResponseTime: number;
    errorRate: number;
    throughput: number;
    activeConnections: number;
  }> {
    const response = await this.apiClient.get<ApiResponse<any>>(
      `${this.baseUrl}/performance-metrics`,
      config
    );

    return response.data;
  }

  // ========================================
  // DATA EXPORT AND IMPORT
  // ========================================

  /**
   * Export {model}s data
   */
  async exportData(
    options: ExportOptions,
    config?: RequestConfig
  ): Promise<Blob> {
    const response = await this.apiClient.post(
      `${this.baseUrl}/export`,
      options,
      {
        ...config,
        responseType: 'blob',
      }
    );

    return response as Blob;
  }

  /**
   * Import {model}s data
   */
  async importData(
    file: File,
    options: {
      skipValidation?: boolean;
      updateExisting?: boolean;
      dryRun?: boolean;
    } = {},
    config?: RequestConfig
  ): Promise<{
    imported: number;
    updated: number;
    errors: Array<{ row: number; message: string }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await this.apiClient.post<ApiResponse<any>>(
      `${this.baseUrl}/import`,
      formData,
      {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Get import template
   */
  async getImportTemplate(
    format: 'csv' | 'xlsx' = 'csv',
    config?: RequestConfig
  ): Promise<Blob> {
    const response = await this.apiClient.get(
      `${this.baseUrl}/import-template?format=${format}`,
      {
        ...config,
        responseType: 'blob',
      }
    );

    return response as Blob;
  }

  // ========================================
  // SYSTEM MANAGEMENT
  // ========================================

  /**
   * Get system health status
   */
  async getSystemHealth(
    config?: RequestConfig
  ): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
      timestamp: string;
    }>;
  }> {
    const response = await this.apiClient.get<ApiResponse<any>>(
      `${this.baseUrl}/system-health`,
      config
    );

    return response.data;
  }

  /**
   * Clear cache
   */
  async clearCache(
    cacheKeys?: string[],
    config?: RequestConfig
  ): Promise<{ cleared: string[] }> {
    const response = await this.apiClient.post<ApiResponse<{ cleared: string[] }>>(
      `${this.baseUrl}/clear-cache`,
      { keys: cacheKeys },
      config
    );

    return response.data;
  }

  /**
   * Rebuild search index
   */
  async rebuildSearchIndex(
    config?: RequestConfig
  ): Promise<{ status: string; itemsIndexed: number }> {
    const response = await this.apiClient.post<ApiResponse<any>>(
      `${this.baseUrl}/rebuild-index`,
      {},
      config
    );

    return response.data;
  }

  /**
   * Get audit trail
   */
  async getAuditTrail(
    filters: {
      resourceId?: string;
      userId?: string;
      action?: string;
      dateRange?: { start: string; end: string };
      page?: number;
      limit?: number;
    } = {},
    config?: RequestConfig
  ): Promise<PaginatedResponse<AuditLogEntry>> {
    const queryParams = this.buildQueryParams(filters);
    
    const response = await this.apiClient.get<PaginatedResponse<AuditLogEntry>>(
      `${this.baseUrl}/audit-trail?${queryParams}`,
      config
    );

    return response;
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
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects like dateRange
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            if (nestedValue !== undefined && nestedValue !== null) {
              searchParams.append(`${key}.${nestedKey}`, nestedValue.toString());
            }
          });
        } else if (Array.isArray(value)) {
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
      deletedAt: apiData.deleted_at ? new Date(apiData.deleted_at) : undefined,
      
      // Transform snake_case to camelCase
      userId: apiData.user_id,
      imageUrl: apiData.image_url,
      
      // Admin-specific fields
      adminNotes: apiData.admin_notes,
      reviewStatus: apiData.review_status,
      lastReviewedAt: apiData.last_reviewed_at ? new Date(apiData.last_reviewed_at) : undefined,
      lastReviewedBy: apiData.last_reviewed_by,
      
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
      
      // Admin-specific fields
      admin_notes: appData.adminNotes,
      review_status: appData.reviewStatus,
      
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

export const {model}AdminService = new {MODEL}AdminService();

/*
USAGE INSTRUCTIONS:

1. Replace placeholders:
   - {MODEL}: Model name (e.g., Event, Program, User)
   - {model}: Lowercase model name (e.g., event, program, user)
   - {MODULE}: Module name (e.g., Core, Spark)
   - {module}: Module name lowercase (e.g., core, spark)

2. Update types to match your admin data model

3. Customize admin-specific operations for your needs

4. Add module-specific admin features

5. Configure audit trail and logging requirements

6. Update export/import functionality based on requirements

EXAMPLE USAGE:
- eventAdminService for Core module events
- programAdminService for Spark module programs
- userAdminService for user management

COMMON CUSTOMIZATIONS:
- Add role-based operation restrictions
- Add approval workflow methods
- Add system monitoring endpoints
- Add data migration utilities
- Add backup and restore functionality
- Add compliance and reporting features
*/
