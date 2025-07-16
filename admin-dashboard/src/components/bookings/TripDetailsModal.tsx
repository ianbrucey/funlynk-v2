import React, { useState } from 'react';
import { 
  XMarkIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Booking } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDate, formatTime, formatCurrency, formatPhoneNumber, getStatusColor } from '../../utils/formatters';
import { classNames } from '../../utils/classNames';

interface TripDetailsModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onEdit?: (booking: Booking) => void;
  onStatusUpdate?: (bookingId: string, status: string) => void;
}

export const TripDetailsModal: React.FC<TripDetailsModalProps> = ({
  isOpen,
  booking,
  onClose,
  onEdit,
  onStatusUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'logistics' | 'payment' | 'communication'>('details');

  if (!isOpen || !booking) return null;

  const tabs = [
    { id: 'details', label: 'Trip Details', icon: DocumentTextIcon },
    { id: 'logistics', label: 'Logistics', icon: MapPinIcon },
    { id: 'payment', label: 'Payment', icon: CurrencyDollarIcon },
    { id: 'communication', label: 'Communication', icon: EnvelopeIcon },
  ];

  const renderDetails = () => (
    <div className="space-y-6">
      {/* Program Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Program Information</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Program:</span>
            <p className="text-sm text-gray-900">{booking.program.title}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Description:</span>
            <p className="text-sm text-gray-900">{booking.program.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Duration:</span>
              <p className="text-sm text-gray-900">{booking.program.duration} minutes</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Grade Levels:</span>
              <p className="text-sm text-gray-900">{booking.program.gradeLevels.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* School Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">School Information</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">School:</span>
            <p className="text-sm text-gray-900">{booking.school.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">District:</span>
            <p className="text-sm text-gray-900">{booking.school.district}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Address:</span>
            <p className="text-sm text-gray-900">{booking.school.address}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-sm text-gray-900">{booking.school.contactEmail}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Phone:</span>
              <p className="text-sm text-gray-900">{formatPhoneNumber(booking.school.contactPhone)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Teacher Information</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Teacher:</span>
            <p className="text-sm text-gray-900">{booking.teacher.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-sm text-gray-900">{booking.teacher.email}</p>
            </div>
            {booking.teacher.phone && (
              <div>
                <span className="text-sm font-medium text-gray-500">Phone:</span>
                <p className="text-sm text-gray-900">{formatPhoneNumber(booking.teacher.phone)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogistics = () => (
    <div className="space-y-6">
      {/* Schedule Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Schedule</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Date:</span>
              <p className="text-sm text-gray-900">{formatDate(booking.scheduledDate)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Time:</span>
              <p className="text-sm text-gray-900">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Attendance</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Expected Students:</span>
              <p className="text-sm text-gray-900">{booking.studentCount}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Maximum Capacity:</span>
              <p className="text-sm text-gray-900">{booking.maxStudents}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${(booking.studentCount / booking.maxStudents) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">
            {Math.round((booking.studentCount / booking.maxStudents) * 100)}% capacity
          </p>
        </div>
      </div>

      {/* Special Requirements */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Special Requirements</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          {booking.notes ? (
            <p className="text-sm text-gray-900">{booking.notes}</p>
          ) : (
            <p className="text-sm text-gray-500 italic">No special requirements noted</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Payment Summary</h4>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Price per Student:</span>
              <p className="text-sm text-gray-900">{formatCurrency(booking.program.pricePerStudent)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Number of Students:</span>
              <p className="text-sm text-gray-900">{booking.studentCount}</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-900">Total Amount:</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Payment Status</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <Badge variant={getStatusColor(booking.paymentStatus)}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunication = () => (
    <div className="space-y-6">
      {/* Communication Log Placeholder */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">Communication Log</h4>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No communications yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Communication history will appear here
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Trip Details - #{booking.bookingNumber}
                </h3>
                <div className="mt-1 flex items-center space-x-2">
                  <Badge variant={getStatusColor(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {formatDate(booking.scheduledDate)} at {formatTime(booking.startTime)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(booking)}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={classNames(
                      'py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2',
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {activeTab === 'details' && renderDetails()}
            {activeTab === 'logistics' && renderLogistics()}
            {activeTab === 'payment' && renderPayment()}
            {activeTab === 'communication' && renderCommunication()}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              variant="primary"
              onClick={onClose}
              className="w-full sm:w-auto sm:ml-3"
            >
              Close
            </Button>
            {booking.status === 'pending' && onStatusUpdate && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => onStatusUpdate(booking.id, 'confirmed')}
                  className="mt-3 w-full sm:mt-0 sm:w-auto sm:ml-3"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Confirm Booking
                </Button>
                <Button
                  variant="danger"
                  onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Cancel Booking
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
