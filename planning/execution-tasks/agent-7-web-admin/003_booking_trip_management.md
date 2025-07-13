# Task 003: Booking and Trip Management
**Agent**: Web Admin Developer  
**Estimated Time**: 6-7 hours  
**Priority**: Medium  
**Dependencies**: Agent 7 Task 002 (Program Management), Agent 3 Task 003 (Booking Management API)  

## Overview
Implement comprehensive booking and trip management interface for Funlynk admin dashboard including booking oversight, scheduling coordination, payment tracking, and trip logistics management using React components and established admin patterns.

## Prerequisites
- Program management interface complete (Agent 7 Task 002)
- Booking Management API endpoints available (Agent 3 Task 003)
- Admin dashboard foundation working
- Payment system integration available

## Step-by-Step Implementation

### Step 1: Create Booking Overview and Management (2.5 hours)

**Create BookingsPage component (src/pages/bookings/BookingsPage.tsx):**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BookingTable } from '../../components/bookings/BookingTable';
import { BookingCalendar } from '../../components/bookings/BookingCalendar';
import { BookingFilters } from '../../components/bookings/BookingFilters';
import { BookingStats } from '../../components/bookings/BookingStats';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { ViewToggle } from '../../components/common/ViewToggle';
import { loadBookings, filterBookings } from '../../store/slices/bookingsSlice';
import type { RootState } from '../../store/store';
import type { BookingFilters as BookingFiltersType } from '../../types/bookings';

export const BookingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { bookings, stats, isLoading, filters, pagination } = useSelector(
    (state: RootState) => state.bookings
  );

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(loadBookings({ page: 1, limit: 20 }));
  }, [dispatch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    dispatch(filterBookings({ ...filters, search: query }));
  }, [dispatch, filters]);

  const handleFilterChange = useCallback((newFilters: BookingFiltersType) => {
    dispatch(filterBookings(newFilters));
    setShowFilters(false);
  }, [dispatch]);

  const handleBookingAction = useCallback((bookingId: string, action: string) => {
    // Handle booking actions (confirm, cancel, reschedule, etc.)
    console.log(`Action ${action} on booking ${bookingId}`);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Booking Management
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and coordinate Spark program bookings and trips
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <ViewToggle
            options={[
              { value: 'table', label: 'Table', icon: 'table' },
              { value: 'calendar', label: 'Calendar', icon: 'calendar' },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
          <Button
            variant="secondary"
            onClick={() => setShowFilters(true)}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Booking Statistics */}
      <BookingStats stats={stats} />

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search bookings by school, teacher, or program..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {pagination.total} bookings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Content */}
      <div className="bg-white shadow rounded-lg">
        {viewMode === 'table' ? (
          <BookingTable
            bookings={bookings}
            isLoading={isLoading}
            onBookingAction={handleBookingAction}
            pagination={pagination}
            onPageChange={(page) => dispatch(loadBookings({ page, limit: 20 }))}
          />
        ) : (
          <BookingCalendar
            bookings={bookings}
            isLoading={isLoading}
            onBookingAction={handleBookingAction}
            onDateSelect={(date) => {
              // Handle date selection for new booking
              console.log('Selected date:', date);
            }}
          />
        )}
      </div>

      {/* Filters Modal */}
      <BookingFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApplyFilters={handleFilterChange}
      />
    </div>
  );
};
```

**Create BookingTable component (src/components/bookings/BookingTable.tsx):**
```typescript
import React from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Pagination } from '../common/Pagination';
import { formatDate, formatCurrency } from '../../utils/formatters';
import type { Booking, PaginationData } from '../../types/bookings';

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onBookingAction: (bookingId: string, action: string) => void;
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  isLoading,
  onBookingAction,
  pagination,
  onPageChange,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      case 'completed':
        return <Badge variant="gray">Completed</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  const getUrgencyIndicator = (booking: Booking) => {
    const daysUntil = Math.ceil((new Date(booking.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 1) {
      return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
    } else if (daysUntil <= 7) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
    }
    return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
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
                Booking Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getUrgencyIndicator(booking)}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{booking.bookingNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        Teacher: {booking.teacher.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.school.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.school.district}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.program.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.program.duration} min • Grade {booking.program.gradeLevels.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(booking.scheduledDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.startTime} - {booking.endTime}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.studentCount} / {booking.maxStudents}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.paymentStatus}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBookingAction(booking.id, 'view')}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBookingAction(booking.id, 'edit')}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBookingAction(booking.id, 'reschedule')}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onBookingAction(booking.id, 'confirm')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onBookingAction(booking.id, 'cancel')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {bookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-sm text-gray-500">No bookings found</div>
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

### Step 2: Create Trip Logistics and Coordination Tools (2 hours)

**Create TripDetailsModal component for comprehensive trip management**
**Implement logistics coordination with travel directions and parking**
**Add attendance tracking and student roster management**
**Create communication log for school-teacher coordination**
**Build emergency contact and safety protocol management**

### Step 3: Create Payment Tracking and Financial Management (1.5 hours)

**Create PaymentTrackingPage component for financial oversight**
**Implement payment status monitoring and reconciliation**
**Add invoice generation and payment processing tools**
**Create financial reporting and revenue analytics**
**Build payment dispute and refund management**

### Step 4: Create Scheduling and Calendar Integration (1 hour)

**Create BookingCalendar component for visual scheduling**
**Implement drag-and-drop rescheduling functionality**
**Add conflict detection and resolution tools**
**Create availability management for teachers and schools**
**Build automated scheduling optimization**

## Acceptance Criteria

### Functional Requirements
- [ ] Booking list displays with comprehensive filtering and search
- [ ] Calendar view provides visual scheduling and coordination
- [ ] Trip details modal shows complete booking information
- [ ] Payment tracking monitors financial status accurately
- [ ] Scheduling tools prevent conflicts and optimize assignments
- [ ] Communication tools enable effective coordination
- [ ] Export functionality works for reports and invoices
- [ ] Real-time updates reflect booking status changes

### Technical Requirements
- [ ] React components follow established admin patterns
- [ ] Redux state management handles complex booking data
- [ ] TypeScript types ensure type safety across components
- [ ] API integration with backend booking management endpoints
- [ ] Calendar integration with drag-and-drop functionality
- [ ] Performance optimized for large booking datasets
- [ ] Error handling covers all edge cases
- [ ] Accessibility standards met throughout interface

### Design Requirements
- [ ] Interface matches admin dashboard design system
- [ ] Booking status indicators are clear and intuitive
- [ ] Calendar view is visually appealing and functional
- [ ] Trip logistics information is well-organized
- [ ] Payment status displays are clear and actionable
- [ ] Loading and error states provide clear feedback

### Testing Requirements
- [ ] Unit tests for all components and utilities
- [ ] Integration tests for booking workflows
- [ ] API integration testing with mock data
- [ ] Calendar functionality testing
- [ ] Payment processing testing
- [ ] User acceptance testing for admin workflows

## Manual Testing Instructions

### Test Case 1: Booking Management
1. Access booking management interface
2. Test table and calendar view switching
3. Test filtering and search functionality
4. Test booking status updates and actions
5. Verify real-time updates and notifications
6. Test export functionality

### Test Case 2: Trip Coordination
1. Open trip details modal
2. Test logistics coordination features
3. Test attendance tracking functionality
4. Test communication logging
5. Verify emergency contact accessibility
6. Test trip completion workflow

### Test Case 3: Payment Management
1. Navigate to payment tracking
2. Test payment status monitoring
3. Test invoice generation
4. Test financial reporting
5. Verify payment reconciliation
6. Test refund and dispute handling

### Test Case 4: Scheduling Coordination
1. Test calendar view functionality
2. Test drag-and-drop rescheduling
3. Test conflict detection
4. Verify availability management
5. Test automated scheduling features

## API Integration Requirements

### Booking Management Endpoints Used
- `GET /api/admin/bookings` - Get bookings with filtering and pagination
- `PUT /api/admin/bookings/{id}/status` - Update booking status
- `GET /api/admin/bookings/{id}/details` - Get detailed booking information
- `PUT /api/admin/bookings/{id}/reschedule` - Reschedule booking
- `GET /api/admin/payments/tracking` - Get payment status information
- `POST /api/admin/invoices/generate` - Generate invoices
- `GET /api/admin/calendar/availability` - Get teacher and school availability
- `POST /api/admin/bookings/bulk-action` - Perform bulk operations

### Data Validation
- Booking status transition validation
- Payment amount and status verification
- Schedule conflict detection
- Teacher availability verification
- School capacity and resource validation

## Dependencies and Integration Points

### Required Components (from previous tasks)
- Admin layout and navigation
- Common UI components (Button, Badge, etc.)
- Calendar and date picker components
- Redux store and state management
- Authentication and permission systems

### API Dependencies (from Agent 3)
- Booking management API endpoints
- Payment processing integration
- Calendar and scheduling APIs
- Communication and notification systems
- Financial reporting and analytics

### Design System Dependencies
- Admin interface patterns
- Calendar and scheduling designs
- Payment status indicators
- Trip logistics layouts
- Financial dashboard patterns

## Completion Checklist

- [ ] Booking overview and management page implemented
- [ ] Trip logistics and coordination tools created
- [ ] Payment tracking and financial management built
- [ ] Scheduling and calendar integration developed
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
- Booking management interface provides foundation for operational oversight
- Trip coordination tools support field operations and safety
- Payment tracking ensures financial accountability and transparency
- Scheduling optimization improves resource utilization
- Communication tools enhance coordination between stakeholders
- Financial reporting provides insights for business optimization
