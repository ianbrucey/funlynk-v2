import React from 'react';
import { 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { ProgramStats as ProgramStatsType } from '../../types/programs';

interface ProgramStatsProps {
  stats: ProgramStatsType | null;
}

export const ProgramStats: React.FC<ProgramStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Programs',
      value: stats.total.toLocaleString(),
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Pending Review',
      value: stats.pending.toLocaleString(),
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Approved',
      value: stats.approved.toLocaleString(),
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Rejected',
      value: stats.rejected.toLocaleString(),
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Avg Rating',
      value: stats.averageRating.toFixed(1),
      icon: StarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-2 rounded-md ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Categories and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Categories</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {category.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {category.count} programs
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(category.count / stats.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        ${category.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'created' ? 'bg-blue-500' :
                      activity.type === 'approved' ? 'bg-green-500' :
                      activity.type === 'rejected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.teacherName}</span>{' '}
                      {activity.type === 'created' && 'created'}
                      {activity.type === 'approved' && 'got approved for'}
                      {activity.type === 'rejected' && 'got rejected for'}
                      {activity.type === 'booked' && 'received a booking for'}{' '}
                      <span className="font-medium">"{activity.programTitle}"</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
