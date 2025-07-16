import api from './authService';
import { SparkProgram, ProgramFilters, ProgramStats, ProgramAnalytics } from '../types/programs';

export const programsService = {
  async getPrograms(params: ProgramFilters & { page?: number; limit?: number }) {
    try {
      const response = await api.get('/admin/programs', { params });
      return response.data.data;
    } catch (error: any) {
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockPrograms(params);
      }
      throw new Error(error.response?.data?.message || 'Failed to load programs');
    }
  },

  async getProgramStats(): Promise<ProgramStats> {
    try {
      const response = await api.get('/admin/programs/stats');
      return response.data.data;
    } catch (error: any) {
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockProgramStats();
      }
      throw new Error(error.response?.data?.message || 'Failed to load program stats');
    }
  },

  async approveProgram(programId: string, comments?: string) {
    try {
      const response = await api.put(`/admin/programs/${programId}/approve`, { comments });
      return response.data.data;
    } catch (error: any) {
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        return { id: programId, status: 'approved' };
      }
      throw new Error(error.response?.data?.message || 'Failed to approve program');
    }
  },

  async rejectProgram(programId: string, reason: string) {
    try {
      const response = await api.put(`/admin/programs/${programId}/reject`, { reason });
      return response.data.data;
    } catch (error: any) {
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        return { id: programId, status: 'rejected', reason };
      }
      throw new Error(error.response?.data?.message || 'Failed to reject program');
    }
  },

  async suspendProgram(programId: string, reason: string) {
    try {
      const response = await api.put(`/admin/programs/${programId}/suspend`, { reason });
      return response.data.data;
    } catch (error: any) {
      // Mock success for development
      if (process.env.NODE_ENV === 'development') {
        return { id: programId, status: 'suspended', reason };
      }
      throw new Error(error.response?.data?.message || 'Failed to suspend program');
    }
  },

  async getProgramAnalytics(programId: string): Promise<ProgramAnalytics> {
    try {
      const response = await api.get(`/admin/programs/${programId}/analytics`);
      return response.data.data;
    } catch (error: any) {
      // Return mock data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockProgramAnalytics(programId);
      }
      throw new Error(error.response?.data?.message || 'Failed to load program analytics');
    }
  },

  async bulkAction(programIds: string[], action: string, data?: any) {
    try {
      const response = await api.post('/admin/programs/bulk-action', {
        programIds,
        action,
        data,
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to perform bulk action');
    }
  },

  // Mock data for development
  getMockPrograms(params: any) {
    const mockPrograms: SparkProgram[] = [
      {
        id: '1',
        title: 'Interactive Science Workshop',
        description: 'Hands-on science experiments for elementary students',
        duration: 60,
        gradeLevels: ['K', '1', '2', '3'],
        maxStudents: 25,
        pricePerStudent: 15,
        category: 'Science',
        tags: ['experiments', 'hands-on', 'STEM'],
        status: 'pending',
        teacher: {
          id: 't1',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@email.com',
          qualifications: ['PhD Chemistry', 'Elementary Education'],
          rating: 4.8,
          totalPrograms: 12,
          isVerified: true,
          createdAt: '2024-01-15T10:00:00Z',
        },
        materials: ['Lab equipment', 'Safety goggles', 'Worksheets'],
        learningObjectives: ['Understand basic chemistry', 'Practice scientific method'],
        totalBookings: 45,
        averageRating: 4.7,
        totalReviews: 38,
        revenue: 675,
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-15T14:30:00Z',
      },
      {
        id: '2',
        title: 'Creative Writing Adventure',
        description: 'Inspire young writers with creative storytelling techniques',
        duration: 45,
        gradeLevels: ['3', '4', '5'],
        maxStudents: 20,
        pricePerStudent: 12,
        category: 'Language Arts',
        tags: ['writing', 'creativity', 'storytelling'],
        status: 'approved',
        teacher: {
          id: 't2',
          name: 'Ms. Emily Chen',
          email: 'emily.chen@email.com',
          qualifications: ['MA English Literature', 'Creative Writing Certificate'],
          rating: 4.9,
          totalPrograms: 8,
          isVerified: true,
          createdAt: '2024-02-10T09:00:00Z',
        },
        materials: ['Writing journals', 'Story prompts', 'Art supplies'],
        learningObjectives: ['Develop writing skills', 'Express creativity'],
        totalBookings: 32,
        averageRating: 4.8,
        totalReviews: 28,
        revenue: 384,
        createdAt: '2024-05-20T11:00:00Z',
        updatedAt: '2024-06-10T16:45:00Z',
        approvedAt: '2024-05-25T09:30:00Z',
      },
      {
        id: '3',
        title: 'Math Magic Show',
        description: 'Make math fun with magic tricks and interactive games',
        duration: 50,
        gradeLevels: ['2', '3', '4'],
        maxStudents: 30,
        pricePerStudent: 18,
        category: 'Mathematics',
        tags: ['math', 'magic', 'interactive', 'fun'],
        status: 'rejected',
        teacher: {
          id: 't3',
          name: 'Mr. David Rodriguez',
          email: 'david.rodriguez@email.com',
          qualifications: ['BS Mathematics', 'Performance Arts Certificate'],
          rating: 4.5,
          totalPrograms: 15,
          isVerified: true,
          createdAt: '2024-01-20T08:00:00Z',
        },
        materials: ['Magic props', 'Math manipulatives', 'Activity sheets'],
        learningObjectives: ['Build math confidence', 'Problem-solving skills'],
        totalBookings: 0,
        totalReviews: 0,
        revenue: 0,
        createdAt: '2024-06-05T13:00:00Z',
        updatedAt: '2024-06-12T10:15:00Z',
        rejectionReason: 'Insufficient safety documentation for magic props',
      },
    ];

    return {
      data: mockPrograms,
      pagination: {
        currentPage: params.page || 1,
        totalPages: 1,
        total: mockPrograms.length,
        perPage: params.limit || 20,
      },
    };
  },

  getMockProgramStats(): ProgramStats {
    return {
      total: 156,
      pending: 23,
      approved: 98,
      rejected: 15,
      suspended: 20,
      totalRevenue: 45678,
      averageRating: 4.6,
      totalBookings: 1247,
      topCategories: [
        { category: 'Science', count: 45, revenue: 15230 },
        { category: 'Mathematics', count: 38, revenue: 12450 },
        { category: 'Language Arts', count: 32, revenue: 9876 },
        { category: 'Arts & Crafts', count: 28, revenue: 8122 },
      ],
      recentActivity: [
        {
          id: '1',
          type: 'created',
          programTitle: 'Interactive Science Workshop',
          teacherName: 'Dr. Sarah Johnson',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'approved',
          programTitle: 'Creative Writing Adventure',
          teacherName: 'Ms. Emily Chen',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  },

  getMockProgramAnalytics(programId: string): ProgramAnalytics {
    return {
      programId,
      title: 'Interactive Science Workshop',
      performanceMetrics: {
        totalBookings: 45,
        totalRevenue: 675,
        averageRating: 4.7,
        completionRate: 95,
        rebookingRate: 68,
      },
      bookingTrends: [
        { date: '2024-01-01', bookings: 5, revenue: 75 },
        { date: '2024-02-01', bookings: 8, revenue: 120 },
        { date: '2024-03-01', bookings: 12, revenue: 180 },
        { date: '2024-04-01', bookings: 10, revenue: 150 },
        { date: '2024-05-01', bookings: 10, revenue: 150 },
      ],
      ratingDistribution: [
        { rating: 5, count: 20 },
        { rating: 4, count: 15 },
        { rating: 3, count: 3 },
        { rating: 2, count: 0 },
        { rating: 1, count: 0 },
      ],
      popularGradeLevels: [
        { gradeLevel: '2', bookings: 15 },
        { gradeLevel: '3', bookings: 18 },
        { gradeLevel: '1', bookings: 8 },
        { gradeLevel: 'K', bookings: 4 },
      ],
      seasonalTrends: [
        { month: 'Jan', bookings: 5, revenue: 75 },
        { month: 'Feb', bookings: 8, revenue: 120 },
        { month: 'Mar', bookings: 12, revenue: 180 },
        { month: 'Apr', bookings: 10, revenue: 150 },
        { month: 'May', bookings: 10, revenue: 150 },
      ],
    };
  },
};
