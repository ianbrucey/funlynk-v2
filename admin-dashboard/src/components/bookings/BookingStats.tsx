import React from 'react';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  TrendingUpIcon,
} from '@heroicons/react/24/outline';
import { BookingStats as BookingStatsType } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { classNames } from '../../utils/classNames';

interface BookingStatsProps {
  stats: BookingStatsType | null;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={classNames('p-3 rounded-md', colorClasses[color])}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {typeof value === 'number' ? formatNumber(value) : value}
                </div>
                {trend && (
                  <div className={classNames(
                    'ml-2 flex items-baseline text-sm font-semibold',
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  )}>
                    <TrendingUpIcon 
                      className={classNames(
                        'self-center flex-shrink-0 h-4 w-4',
                        trend.isPositive ? 'text-green-500' : 'text-red-500 transform rotate-180'
                      )}
                    />
                    <span className="sr-only">
                      {trend.isPositive ? 'Increased' : 'Decreased'} by
                    </span>
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-200 rounded-md"></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const BookingStats: React.FC<BookingStatsProps> = ({ stats, isLoading = false }) => {
  if (isLoading || !stats) {
    return <LoadingSkeleton />;
  }

  const statCards: StatCardProps[] = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: CalendarDaysIcon,
      color: 'blue',
    },
    {
      title: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      icon: CheckCircleIcon,
      color: 'green',
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      title: 'Cancelled Bookings',
      value: stats.cancelledBookings,
      icon: XCircleIcon,
      color: 'red',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'green',
    },
    {
      title: 'Average Booking Value',
      value: formatCurrency(stats.averageBookingValue),
      icon: ChartBarIcon,
      color: 'indigo',
    },
    {
      title: 'Upcoming Bookings',
      value: stats.upcomingBookings,
      icon: UserGroupIcon,
      color: 'purple',
    },
    {
      title: 'Completed Bookings',
      value: stats.completedBookings,
      icon: CheckCircleIcon,
      color: 'green',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};
