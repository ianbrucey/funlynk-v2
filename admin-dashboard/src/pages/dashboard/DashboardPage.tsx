import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatsCard } from '../../components/common/StatsCard';
import { loadDashboardData } from '../../store/slices/dashboardSlice';
import type { RootState, AppDispatch } from '../../store/store';

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, isLoading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(loadDashboardData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading dashboard: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.userGrowth || 0}
          changeType="increase"
          icon="users"
        />
        <StatsCard
          title="Active Events"
          value={stats?.activeEvents || 0}
          change={stats?.eventGrowth || 0}
          changeType="increase"
          icon="calendar"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          change={stats?.revenueGrowth || 0}
          changeType="increase"
          icon="currency"
        />
        <StatsCard
          title="Platform Health"
          value={`${stats?.systemHealth || 0}%`}
          change={stats?.healthChange || 0}
          changeType={(stats?.healthChange || 0) >= 0 ? 'increase' : 'decrease'}
          icon="shield"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {stats?.recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {activity.user.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    {activity.description}
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
  );
};
