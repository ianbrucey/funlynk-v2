import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarIcon, MapPinIcon, UsersIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BookingTable } from '../../components/bookings/BookingTable';
import { BookingCalendar } from '../../components/bookings/BookingCalendar';
import { BookingFilters } from '../../components/bookings/BookingFilters';
import { BookingStats } from '../../components/bookings/BookingStats';
import { TripDetailsModal } from '../../components/bookings/TripDetailsModal';
import { PaymentTrackingCard } from '../../components/bookings/PaymentTrackingCard';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { ViewToggle } from '../../components/common/ViewToggle';
import { loadBookings, loadBookingStats, filterBookings, updateBookingStatus } from '../../store/slices/bookingsSlice';
import type { RootState } from '../../store/store';
import type { BookingFilters as BookingFiltersType, Booking } from '../../types';

export const BookingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { bookings, stats, isLoading, filters, pagination } = useSelector(
    (state: RootState) => state.bookings
  );

  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showTripDetails, setShowTripDetails] = useState(false);

  useEffect(() => {
    dispatch(loadBookings({ page: 1, limit: 20 }) as any);
    dispatch(loadBookingStats() as any);
  }, [dispatch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    dispatch(filterBookings({ ...filters, search: query }) as any);
  }, [dispatch, filters]);

  const handleFilterChange = useCallback((newFilters: BookingFiltersType) => {
    dispatch(filterBookings(newFilters) as any);
    setShowFilters(false);
  }, [dispatch]);

  const handleBookingAction = useCallback((bookingId: string, action: string) => {
    const booking = bookings.find(b => b.id === bookingId);

    switch (action) {
      case 'view':
        if (booking) {
          setSelectedBooking(booking);
          setShowTripDetails(true);
        }
        break;
      case 'edit':
        console.log(`Editing booking ${bookingId}`);
        // TODO: Open booking edit modal
        break;
      case 'reschedule':
        console.log(`Rescheduling booking ${bookingId}`);
        // TODO: Open reschedule modal
        break;
      case 'confirm':
        dispatch(updateBookingStatus({ id: bookingId, status: 'confirmed' }) as any);
        break;
      case 'cancel':
        dispatch(updateBookingStatus({ id: bookingId, status: 'cancelled' }) as any);
        break;
      default:
        console.log(`Unknown action ${action} on booking ${bookingId}`);
    }
  }, [dispatch, bookings]);

  const handlePaymentAction = useCallback((bookingId: string, action: 'process' | 'refund' | 'retry') => {
    console.log(`Payment action ${action} for booking ${bookingId}`);
    // TODO: Implement payment actions
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
      <BookingStats stats={stats} isLoading={isLoading} />

      {/* Payment Tracking */}
      <PaymentTrackingCard
        bookings={bookings}
        onPaymentAction={handlePaymentAction}
      />

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
            onPageChange={(page) => dispatch(loadBookings({ page, limit: 20 }) as any)}
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

      {/* Trip Details Modal */}
      <TripDetailsModal
        isOpen={showTripDetails}
        booking={selectedBooking}
        onClose={() => {
          setShowTripDetails(false);
          setSelectedBooking(null);
        }}
        onEdit={(booking) => {
          console.log('Edit booking:', booking);
          // TODO: Open edit modal
        }}
        onStatusUpdate={(bookingId, status) => {
          dispatch(updateBookingStatus({ id: bookingId, status }) as any);
          setShowTripDetails(false);
          setSelectedBooking(null);
        }}
      />
    </div>
  );
};
