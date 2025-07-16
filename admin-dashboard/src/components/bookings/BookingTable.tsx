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
import { formatDate, formatCurrency, formatTime, getStatusColor } from '../../utils/formatters';
import { Booking, PaginationData } from '../../types';

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
  const getUrgencyIndicator = (booking: Booking) => {
    const scheduledDate = new Date(booking.scheduledDate);
    const now = new Date();
    const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 1) {
      return <div className="w-2 h-2 bg-red-500 rounded-full" title="Urgent - Within 24 hours"></div>;
    } else if (daysUntil <= 7) {
      return <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Soon - Within 7 days"></div>;
    }
    return <div className="w-2 h-2 bg-green-500 rounded-full" title="Scheduled"></div>;
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
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {booking.studentCount} / {booking.maxStudents}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <Badge variant={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Payment: <Badge variant={getStatusColor(booking.paymentStatus)} size="sm">
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(booking.program.pricePerStudent)} per student
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBookingAction(booking.id, 'view')}
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBookingAction(booking.id, 'edit')}
                      title="Edit booking"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onBookingAction(booking.id, 'reschedule')}
                      title="Reschedule"
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
                          title="Confirm booking"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onBookingAction(booking.id, 'cancel')}
                          className="text-red-600 hover:text-red-700"
                          title="Cancel booking"
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
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
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
