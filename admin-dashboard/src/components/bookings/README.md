# Booking Management Components

This directory contains all components related to booking and trip management for the Funlynk Spark admin dashboard.

## Components Overview

### Core Components

#### `BookingsPage.tsx`
Main page component that orchestrates all booking management functionality:
- Table and calendar view switching
- Search and filtering
- Booking statistics display
- Payment tracking integration
- Trip details modal management

#### `BookingTable.tsx`
Data table component for displaying bookings:
- Sortable columns
- Status indicators with urgency colors
- Action buttons for each booking
- Pagination support
- Responsive design

#### `BookingCalendar.tsx`
Calendar view for visual booking management:
- Monthly calendar grid
- Booking events display
- Date selection
- Side panel with booking details
- Color-coded status indicators

#### `BookingStats.tsx`
Statistics cards showing booking metrics:
- Total bookings count
- Status breakdown (confirmed, pending, cancelled)
- Revenue tracking
- Average booking value
- Loading skeleton states

### Modal Components

#### `TripDetailsModal.tsx`
Comprehensive trip management modal with tabs:
- **Details Tab**: Program, school, and teacher information
- **Logistics Tab**: Schedule, attendance, special requirements
- **Payment Tab**: Payment summary and status
- **Communication Tab**: Communication log (placeholder)

#### `BookingFilters.tsx`
Advanced filtering modal:
- Status filtering (booking and payment)
- Date range selection
- School, program, and teacher filters
- Sort options
- Reset functionality

### Utility Components

#### `PaymentTrackingCard.tsx`
Financial oversight component:
- Payment statistics overview
- Overdue payment alerts
- Recent payment activity
- Payment action buttons
- Collection rate tracking

## State Management

### Redux Slice (`bookingsSlice.ts`)
Manages all booking-related state:
- Booking data and pagination
- Statistics and analytics
- Filters and search
- Loading and error states
- Async actions for API calls

### Mock Data
Currently uses mock data for development:
- Sample bookings with realistic data
- Payment status simulation
- Statistics calculation

## Key Features

### 1. Dual View Modes
- **Table View**: Detailed data table with sorting and actions
- **Calendar View**: Visual calendar with booking events

### 2. Advanced Filtering
- Multiple filter criteria
- Date range selection
- Real-time search
- Persistent filter state

### 3. Payment Management
- Payment status tracking
- Overdue payment alerts
- Payment action buttons
- Revenue analytics

### 4. Trip Coordination
- Comprehensive trip details
- Logistics management
- Communication tracking
- Status management

### 5. Responsive Design
- Mobile-friendly layouts
- Touch-optimized interactions
- Adaptive component sizing

## Usage Examples

### Basic Implementation
```tsx
import { BookingsPage } from './pages/bookings/BookingsPage';

// In your router
<Route path="/bookings" component={BookingsPage} />
```

### Individual Components
```tsx
import { BookingTable, BookingStats } from './components/bookings';

<BookingStats stats={stats} isLoading={loading} />
<BookingTable 
  bookings={bookings}
  onBookingAction={handleAction}
  pagination={pagination}
/>
```

## API Integration

### Required Endpoints
- `GET /api/admin/bookings` - Fetch bookings with pagination
- `GET /api/admin/bookings/stats` - Get booking statistics
- `PUT /api/admin/bookings/{id}/status` - Update booking status
- `POST /api/admin/payments/process` - Process payments

### Data Types
All TypeScript interfaces are defined in `src/types/index.ts`:
- `Booking` - Main booking interface
- `BookingStats` - Statistics interface
- `BookingFilters` - Filter criteria interface

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live updates
2. **Bulk Operations**: Multi-select and bulk actions
3. **Export Functionality**: CSV/PDF export capabilities
4. **Advanced Analytics**: Charts and trend analysis
5. **Communication Tools**: In-app messaging system
6. **Mobile App**: React Native companion app

### Technical Improvements
1. **Virtualization**: Large dataset handling
2. **Caching**: Optimistic updates and caching
3. **Offline Support**: PWA capabilities
4. **Performance**: Code splitting and lazy loading

## Testing

### Unit Tests
- Component rendering tests
- Redux action tests
- Utility function tests

### Integration Tests
- User workflow tests
- API integration tests
- State management tests

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance

## Accessibility

### Features Implemented
- Keyboard navigation
- Screen reader support
- ARIA labels and roles
- Color contrast compliance
- Focus management

### Standards Compliance
- WCAG 2.1 AA compliance
- Section 508 compliance
- Semantic HTML structure

## Performance Considerations

### Optimizations
- React.memo for component memoization
- useCallback for event handlers
- Lazy loading for modals
- Debounced search input
- Pagination for large datasets

### Bundle Size
- Tree shaking enabled
- Code splitting by route
- Dynamic imports for modals
- Optimized icon usage
