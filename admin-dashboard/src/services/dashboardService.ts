import api from './authService';
import { DashboardStats } from '../types';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data.data;
    } catch (error: any) {
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockDashboardStats();
      }
      throw new Error(error.response?.data?.message || 'Failed to load dashboard stats');
    }
  },

  async getChartData(type: string, dateRange?: { start: string; end: string }) {
    try {
      const response = await api.get('/admin/dashboard/charts', {
        params: { type, ...dateRange },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load chart data');
    }
  },

  async getRecentActivity(limit: number = 10) {
    try {
      const response = await api.get('/admin/dashboard/activity', {
        params: { limit },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load recent activity');
    }
  },

  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system/health');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to load system health');
    }
  },

  // Mock data for development
  getMockDashboardStats(): DashboardStats {
    return {
      totalUsers: 12543,
      activeEvents: 89,
      monthlyRevenue: 45678,
      systemHealth: 98,
      userGrowth: 12.5,
      eventGrowth: 8.3,
      revenueGrowth: 15.2,
      healthChange: 2.1,
      userGrowthData: [
        { date: '2024-01-01', value: 1000 },
        { date: '2024-02-01', value: 1200 },
        { date: '2024-03-01', value: 1500 },
        { date: '2024-04-01', value: 1800 },
        { date: '2024-05-01', value: 2100 },
        { date: '2024-06-01', value: 2400 },
      ],
      eventMetricsData: [
        { date: '2024-01-01', value: 45 },
        { date: '2024-02-01', value: 52 },
        { date: '2024-03-01', value: 61 },
        { date: '2024-04-01', value: 68 },
        { date: '2024-05-01', value: 75 },
        { date: '2024-06-01', value: 89 },
      ],
      recentActivities: [
        {
          id: '1',
          type: 'user_registration',
          description: 'New user registered',
          user: { name: 'John Doe', avatar: undefined },
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'event_created',
          description: 'New event created: "Science Workshop"',
          user: { name: 'Jane Smith', avatar: undefined },
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      topEvents: [
        { id: '1', title: 'Science Workshop', bookings: 45, revenue: 2250, rating: 4.8 },
        { id: '2', title: 'Art Class', bookings: 38, revenue: 1900, rating: 4.6 },
        { id: '3', title: 'Math Tutoring', bookings: 32, revenue: 1600, rating: 4.9 },
      ],
      systemMetrics: {
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 38,
        activeConnections: 1247,
        responseTime: 120,
      },
    };
  },
};
