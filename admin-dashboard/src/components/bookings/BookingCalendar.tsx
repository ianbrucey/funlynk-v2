import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Booking } from '../../types';
import { formatTime, formatCurrency, getStatusColor } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { classNames } from '../../utils/classNames';

interface BookingCalendarProps {
  bookings: Booking[];
  isLoading: boolean;
  onBookingAction: (bookingId: string, action: string) => void;
  onDateSelect?: (date: string) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  isLoading,
  onBookingAction,
  onDateSelect,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        bookings: [],
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => 
        booking.scheduledDate === dateString
      );
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        bookings: dayBookings,
      });
    }
    
    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        bookings: [],
      });
    }
    
    return days;
  }, [currentDate, bookings]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    if (onDateSelect) {
      onDateSelect(day.date.toISOString().split('T')[0]);
    }
  };

  const selectedDayBookings = selectedDate 
    ? bookings.filter(booking => 
        booking.scheduledDate === selectedDate.toISOString().split('T')[0]
      )
    : [];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Calendar Grid */}
        <div className="flex-1">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map(day => (
              <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={classNames(
                  'min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-50',
                  !day.isCurrentMonth && 'bg-gray-50',
                  selectedDate?.toDateString() === day.date.toDateString() && 'bg-blue-50'
                )}
                onClick={() => handleDateClick(day)}
              >
                <div className={classNames(
                  'text-sm font-medium mb-1',
                  day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                  day.isToday && 'text-blue-600'
                )}>
                  {day.date.getDate()}
                  {day.isToday && (
                    <span className="ml-1 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {day.bookings.slice(0, 3).map(booking => (
                    <div
                      key={booking.id}
                      className={classNames(
                        'text-xs p-1 rounded truncate cursor-pointer',
                        getStatusColor(booking.status) === 'success' && 'bg-green-100 text-green-800',
                        getStatusColor(booking.status) === 'warning' && 'bg-yellow-100 text-yellow-800',
                        getStatusColor(booking.status) === 'error' && 'bg-red-100 text-red-800',
                        getStatusColor(booking.status) === 'gray' && 'bg-gray-100 text-gray-800'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingAction(booking.id, 'view');
                      }}
                      title={`${booking.program.title} - ${booking.school.name}`}
                    >
                      {formatTime(booking.startTime)} {booking.program.title}
                    </div>
                  ))}
                  {day.bookings.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{day.bookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <div className="w-80 border-l border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {selectedDayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No bookings scheduled</p>
                </div>
              ) : (
                selectedDayBookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {booking.program.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(booking.status)} size="sm">
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>School:</strong> {booking.school.name}</p>
                      <p><strong>Teacher:</strong> {booking.teacher.name}</p>
                      <p><strong>Students:</strong> {booking.studentCount}/{booking.maxStudents}</p>
                      <p><strong>Revenue:</strong> {formatCurrency(booking.totalAmount)}</p>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBookingAction(booking.id, 'view')}
                        className="text-xs"
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBookingAction(booking.id, 'edit')}
                        className="text-xs"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
