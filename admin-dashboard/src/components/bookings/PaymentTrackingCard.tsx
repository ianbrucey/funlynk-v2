import React from 'react';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatters';
import { Booking } from '../../types';
import { classNames } from '../../utils/classNames';

interface PaymentTrackingCardProps {
  bookings: Booking[];
  onPaymentAction?: (bookingId: string, action: 'process' | 'refund' | 'retry') => void;
}

interface PaymentSummary {
  totalRevenue: number;
  pendingPayments: number;
  paidPayments: number;
  failedPayments: number;
  refundedPayments: number;
  overduePayments: Booking[];
}

export const PaymentTrackingCard: React.FC<PaymentTrackingCardProps> = ({
  bookings,
  onPaymentAction,
}) => {
  const paymentSummary: PaymentSummary = React.useMemo(() => {
    const now = new Date();
    const summary = bookings.reduce(
      (acc, booking) => {
        acc.totalRevenue += booking.totalAmount;
        
        switch (booking.paymentStatus) {
          case 'pending':
            acc.pendingPayments += booking.totalAmount;
            // Check if payment is overdue (booking date passed and still pending)
            if (new Date(booking.scheduledDate) < now) {
              acc.overduePayments.push(booking);
            }
            break;
          case 'paid':
            acc.paidPayments += booking.totalAmount;
            break;
          case 'failed':
            acc.failedPayments += booking.totalAmount;
            break;
          case 'refunded':
            acc.refundedPayments += booking.totalAmount;
            break;
        }
        
        return acc;
      },
      {
        totalRevenue: 0,
        pendingPayments: 0,
        paidPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        overduePayments: [] as Booking[],
      }
    );
    
    return summary;
  }, [bookings]);

  const paymentStats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(paymentSummary.totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pending Payments',
      value: formatCurrency(paymentSummary.pendingPayments),
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Paid',
      value: formatCurrency(paymentSummary.paidPayments),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Failed',
      value: formatCurrency(paymentSummary.failedPayments),
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Payment Tracking</h3>
          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
        </div>

        {/* Payment Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {paymentStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className={classNames('mx-auto w-12 h-12 rounded-full flex items-center justify-center', stat.bgColor)}>
                  <Icon className={classNames('h-6 w-6', stat.color)} />
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overdue Payments Alert */}
        {paymentSummary.overduePayments.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">
                  Overdue Payments ({paymentSummary.overduePayments.length})
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  These bookings have passed their scheduled date but payments are still pending.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Payment Activity */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Payment Activity</h4>
          <div className="space-y-3">
            {bookings
              .filter(booking => booking.paymentStatus !== 'paid')
              .slice(0, 5)
              .map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        #{booking.bookingNumber}
                      </p>
                      <Badge variant={getStatusColor(booking.paymentStatus)} size="sm">
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {booking.school.name} • {formatDate(booking.scheduledDate)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                    
                    {onPaymentAction && (
                      <div className="flex space-x-1">
                        {booking.paymentStatus === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPaymentAction(booking.id, 'process')}
                            title="Process payment"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {booking.paymentStatus === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPaymentAction(booking.id, 'retry')}
                            title="Retry payment"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {booking.paymentStatus === 'paid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPaymentAction(booking.id, 'refund')}
                            title="Process refund"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
          
          {bookings.filter(booking => booking.paymentStatus !== 'paid').length === 0 && (
            <div className="text-center py-6">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">All payments up to date</h3>
              <p className="mt-1 text-sm text-gray-500">
                No pending or failed payments at this time.
              </p>
            </div>
          )}
        </div>

        {/* Payment Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Payment collection rate: {
                paymentSummary.totalRevenue > 0 
                  ? Math.round((paymentSummary.paidPayments / paymentSummary.totalRevenue) * 100)
                  : 0
              }%
            </p>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                Export Report
              </Button>
              <Button variant="primary" size="sm">
                Process Pending
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
