import React, { useState, useEffect } from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { Button } from '../common/Button';
import { BookingFilters as BookingFiltersType } from '../../types';
import { classNames } from '../../utils/classNames';

interface BookingFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: BookingFiltersType;
  onApplyFilters: (filters: BookingFiltersType) => void;
}

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<BookingFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: BookingFiltersType = {
      sortBy: 'scheduledDate',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = localFilters.status || [];
    if (checked) {
      setLocalFilters({
        ...localFilters,
        status: [...currentStatuses, status],
      });
    } else {
      setLocalFilters({
        ...localFilters,
        status: currentStatuses.filter(s => s !== status),
      });
    }
  };

  const handlePaymentStatusChange = (status: string, checked: boolean) => {
    const currentStatuses = localFilters.paymentStatus || [];
    if (checked) {
      setLocalFilters({
        ...localFilters,
        paymentStatus: [...currentStatuses, status],
      });
    } else {
      setLocalFilters({
        ...localFilters,
        paymentStatus: currentStatuses.filter(s => s !== status),
      });
    }
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setLocalFilters({
      ...localFilters,
      dateRange: {
        ...localFilters.dateRange,
        [field]: value,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Filter Bookings</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Booking Status */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Booking Status
              </label>
              <div className="space-y-2">
                {['pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(localFilters.status || []).includes(status)}
                      onChange={(e) => handleStatusChange(status, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Payment Status
              </label>
              <div className="space-y-2">
                {['pending', 'paid', 'refunded', 'failed'].map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={(localFilters.paymentStatus || []).includes(status)}
                      onChange={(e) => handlePaymentStatusChange(status, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {status}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={localFilters.dateRange?.start || ''}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={localFilters.dateRange?.end || ''}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* School Filter */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                School
              </label>
              <input
                type="text"
                value={localFilters.school || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, school: e.target.value })}
                placeholder="Filter by school name..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Program Filter */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Program
              </label>
              <input
                type="text"
                value={localFilters.program || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, program: e.target.value })}
                placeholder="Filter by program name..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Teacher Filter */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Teacher
              </label>
              <input
                type="text"
                value={localFilters.teacher || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, teacher: e.target.value })}
                placeholder="Filter by teacher name..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-2">
                Sort By
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={localFilters.sortBy || 'scheduledDate'}
                  onChange={(e) => setLocalFilters({ ...localFilters, sortBy: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="scheduledDate">Scheduled Date</option>
                  <option value="createdAt">Created Date</option>
                  <option value="totalAmount">Amount</option>
                  <option value="studentCount">Student Count</option>
                  <option value="school">School Name</option>
                  <option value="program">Program Name</option>
                </select>
                <select
                  value={localFilters.sortOrder || 'desc'}
                  onChange={(e) => setLocalFilters({ ...localFilters, sortOrder: e.target.value as 'asc' | 'desc' })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
