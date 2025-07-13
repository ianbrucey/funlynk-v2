# Task 002: Program Management Interface
**Agent**: Web Admin Developer  
**Estimated Time**: 7-8 hours  
**Priority**: High  
**Dependencies**: Agent 7 Task 001 (Admin Dashboard Setup), Agent 3 Task 002 (Program Management API)  

## Overview
Implement comprehensive program management interface for Funlynk Spark admin dashboard including program approval workflows, content moderation, teacher assignment, and performance analytics using React components and established admin patterns.

## Prerequisites
- Admin dashboard setup complete (Agent 7 Task 001)
- Program Management API endpoints available (Agent 3 Task 002)
- Authentication and routing working
- Redux store configured

## Step-by-Step Implementation

### Step 1: Create Program List and Overview (2.5 hours)

**Create ProgramsPage component (src/pages/programs/ProgramsPage.tsx):**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ProgramTable } from '../../components/programs/ProgramTable';
import { ProgramFilters } from '../../components/programs/ProgramFilters';
import { ProgramStats } from '../../components/programs/ProgramStats';
import { CreateProgramModal } from '../../components/programs/CreateProgramModal';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { loadPrograms, filterPrograms } from '../../store/slices/programsSlice';
import type { RootState } from '../../store/store';
import type { ProgramFilters as ProgramFiltersType } from '../../types/programs';

export const ProgramsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { programs, stats, isLoading, filters, pagination } = useSelector(
    (state: RootState) => state.programs
  );

  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(loadPrograms({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    dispatch(filterPrograms({ ...filters, search: query }));
  }, [dispatch, filters]);

  const handleFilterChange = useCallback((newFilters: ProgramFiltersType) => {
    dispatch(filterPrograms(newFilters));
    setShowFilters(false);
  }, [dispatch]);

  const handleProgramAction = useCallback((programId: string, action: string) => {
    // Handle program actions (approve, reject, suspend, etc.)
    console.log(`Action ${action} on program ${programId}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Spark Programs
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and moderate Spark educational programs
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(true)}
            className="mr-3"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </div>
      </div>

      {/* Program Statistics */}
      <ProgramStats stats={stats} />

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search programs by title, teacher, or school..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {pagination.total} programs
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-white shadow rounded-lg">
        <ProgramTable
          programs={programs}
          isLoading={isLoading}
          onProgramAction={handleProgramAction}
          pagination={pagination}
          onPageChange={(page) => dispatch(loadPrograms({ page, limit: 20 }))}
        />
      </div>

      {/* Modals */}
      <ProgramFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
      />

      <CreateProgramModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProgramCreated={() => {
          setShowCreateModal(false);
          dispatch(loadPrograms({ page: 1, limit: 20 }));
        }}
      />
    </div>
  );
};
```

**Create ProgramTable component (src/components/programs/ProgramTable.tsx):**
```typescript
import React from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Pagination } from '../common/Pagination';
import type { SparkProgram, PaginationData } from '../../types/programs';

interface ProgramTableProps {
  programs: SparkProgram[];
  isLoading: boolean;
  onProgramAction: (programId: string, action: string) => void;
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  isLoading,
  onProgramAction,
  pagination,
  onPageChange,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="gray">Suspended</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade Levels
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bookings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.map((program) => (
              <tr key={program.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(program.status)}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {program.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {program.duration} minutes • ${program.pricePerStudent}/student
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <img
                        className="h-8 w-8 rounded-full"
                        src={program.teacher.avatar || '/default-avatar.png'}
                        alt={program.teacher.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {program.teacher.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {program.teacher.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {program.gradeLevels.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(program.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {program.totalBookings}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm text-gray-900">
                      {program.averageRating?.toFixed(1) || 'N/A'}
                    </div>
                    {program.averageRating && (
                      <div className="ml-1 text-xs text-gray-500">
                        ({program.totalReviews})
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onProgramAction(program.id, 'view')}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onProgramAction(program.id, 'edit')}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    {program.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onProgramAction(program.id, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onProgramAction(program.id, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onProgramAction(program.id, 'delete')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {programs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-sm text-gray-500">No programs found</div>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
```

### Step 2: Create Program Approval and Moderation Workflow (2.5 hours)

**Create ProgramDetailsModal component for detailed review and approval workflow**
**Create ProgramFilters component for advanced filtering and search**
**Create bulk action capabilities for program management**
**Implement approval workflow with review notes and rejection reasons**
**Add program content moderation and safety checks**

### Step 3: Create Program Analytics and Performance Tracking (2 hours)

**Create ProgramAnalyticsPage component for comprehensive analytics**
**Implement performance metrics and KPI tracking**
**Add revenue and booking trend analysis**
**Create teacher performance comparison tools**
**Build custom report generation capabilities**

### Step 4: Create Teacher Assignment and Coordination Tools (1 hour)

**Create teacher assignment interface for program coordination**
**Implement teacher availability and scheduling management**
**Add teacher performance tracking and feedback systems**
**Create communication tools for teacher-admin coordination**

## Acceptance Criteria

### Functional Requirements
- [ ] Program list displays with comprehensive filtering and search
- [ ] Program approval workflow handles review and moderation
- [ ] Analytics provide meaningful insights and performance metrics
- [ ] Teacher assignment and coordination tools work effectively
- [ ] Bulk actions enable efficient program management
- [ ] Export functionality works for reports and data
- [ ] Real-time updates reflect program status changes
- [ ] Permission-based access controls protect sensitive operations

### Technical Requirements
- [ ] React components follow established patterns from dashboard setup
- [ ] Redux state management handles complex program data
- [ ] TypeScript types ensure type safety across components
- [ ] API integration with backend program management endpoints
- [ ] Performance optimized for large datasets
- [ ] Error handling covers all edge cases
- [ ] Accessibility standards met throughout interface
- [ ] Responsive design works on desktop and tablet

### Design Requirements
- [ ] Interface matches admin dashboard design system
- [ ] Program status indicators are clear and intuitive
- [ ] Charts and analytics are visually appealing and informative
- [ ] Form layouts are consistent and user-friendly
- [ ] Loading and error states provide clear feedback
- [ ] Color coding helps distinguish program statuses and priorities

### Testing Requirements
- [ ] Unit tests for all components and utilities
- [ ] Integration tests for approval workflows
- [ ] API integration testing with mock data
- [ ] User acceptance testing for admin workflows
- [ ] Performance testing with large program datasets
- [ ] Accessibility testing with screen readers

## Manual Testing Instructions

### Test Case 1: Program Management
1. Access program management interface
2. Test filtering and search functionality
3. Test program approval and rejection workflows
4. Test bulk actions on multiple programs
5. Verify real-time status updates
6. Test export functionality

### Test Case 2: Program Analytics
1. Navigate to program analytics page
2. Test date range selection and filtering
3. Verify chart data accuracy and interactivity
4. Test performance metrics calculations
5. Test report generation and export
6. Verify responsive design on different screens

### Test Case 3: Teacher Management
1. Test teacher assignment to programs
2. Test teacher performance tracking
3. Test communication features
4. Verify teacher availability coordination
5. Test bulk teacher operations

## API Integration Requirements

### Program Management Endpoints Used
- `GET /api/admin/programs` - Get programs with filtering and pagination
- `PUT /api/admin/programs/{id}/approve` - Approve program
- `PUT /api/admin/programs/{id}/reject` - Reject program with reason
- `GET /api/admin/programs/{id}/analytics` - Get program performance data
- `GET /api/admin/programs/analytics` - Get aggregate analytics
- `PUT /api/admin/programs/{id}/assign-teacher` - Assign teacher to program
- `POST /api/admin/programs/bulk-action` - Perform bulk operations
- `GET /api/admin/teachers/performance` - Get teacher performance metrics

### Data Validation
- Program content moderation and safety checks
- Teacher qualification verification
- Pricing and availability validation
- Review note and rejection reason requirements
- Analytics data accuracy verification

## Dependencies and Integration Points

### Required Components (from Task 001)
- Admin layout and navigation
- Common UI components (Button, Badge, etc.)
- Chart components for analytics
- Redux store and state management
- Authentication and permission systems

### API Dependencies (from Agent 3)
- Program management API endpoints
- Teacher management system
- Analytics and reporting APIs
- Notification system for approvals
- Audit logging for admin actions

### Design System Dependencies
- Admin interface patterns
- Chart and visualization specifications
- Form and modal designs
- Status indicator patterns
- Data table layouts

## Completion Checklist

- [ ] Program list and overview page implemented
- [ ] Program approval workflow created
- [ ] Analytics and performance tracking built
- [ ] Teacher assignment tools developed
- [ ] Redux state management configured
- [ ] API integration completed
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design implemented
- [ ] Accessibility features added
- [ ] Unit tests written and passing
- [ ] Integration tests completed
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Program management interface establishes foundation for educational content oversight
- Approval workflows can be extended to other content types
- Analytics patterns can be reused for other admin reporting needs
- Teacher management integration supports quality assurance
- Bulk operation patterns applicable to other admin functions
- Performance tracking provides insights for platform optimization
