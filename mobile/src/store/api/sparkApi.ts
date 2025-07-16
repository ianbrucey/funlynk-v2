import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseApi';

export interface Program {
  id: string;
  title: string;
  description: string;
  provider: {
    id: string;
    name: string;
    logo?: string;
    rating: number;
    location: string;
  };
  category: string;
  ageGroup: {
    minAge: number;
    maxAge: number;
  };
  duration: number; // in minutes
  capacity: number;
  price: number;
  currency: string;
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
  features: string[];
  requirements: string[];
  availability: {
    days: string[];
    timeSlots: {
      start: string;
      end: string;
    }[];
  };
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  programId: string;
  program: Program;
  teacherId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    school: string;
  };
  scheduledDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
  studentCount: number;
  students: Student[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialRequests?: string;
  permissionSlips: {
    required: boolean;
    submitted: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  dateOfBirth: string;
  parentContact: {
    name: string;
    email: string;
    phone: string;
  };
  medicalInfo?: {
    allergies: string[];
    medications: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  permissionSlipStatus: 'pending' | 'submitted' | 'approved';
  createdAt: string;
  updatedAt: string;
}

export interface PermissionSlip {
  id: string;
  bookingId: string;
  studentId: string;
  student: Student;
  parentSignature: string;
  signedAt: string;
  status: 'pending' | 'signed' | 'approved';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const sparkApi = createApi({
  reducerPath: 'sparkApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Program', 'Booking', 'Student', 'PermissionSlip', 'Analytics'],
  endpoints: (builder) => ({
    // Programs
    getPrograms: builder.query<PaginatedResponse<Program>, {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      location?: string;
      ageMin?: number;
      ageMax?: number;
      priceMin?: number;
      priceMax?: number;
    }>({
      query: (params) => ({
        url: '/spark/programs',
        params,
      }),
      providesTags: ['Program'],
    }),
    
    getProgram: builder.query<Program, string>({
      query: (id) => `/spark/programs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Program', id }],
    }),
    
    getProgramAvailability: builder.query<{
      date: string;
      timeSlots: { start: string; end: string; available: boolean }[];
    }[], { programId: string; month: string; year: string }>({
      query: ({ programId, month, year }) => ({
        url: `/spark/programs/${programId}/availability`,
        params: { month, year },
      }),
      providesTags: (result, error, { programId }) => [{ type: 'Program', id: programId }],
    }),
    
    // Bookings
    getBookings: builder.query<PaginatedResponse<Booking>, {
      page?: number;
      limit?: number;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }>({
      query: (params) => ({
        url: '/spark/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    
    getBooking: builder.query<Booking, string>({
      query: (id) => `/spark/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),
    
    createBooking: builder.mutation<Booking, {
      programId: string;
      scheduledDate: string;
      timeSlot: { start: string; end: string };
      studentCount: number;
      studentIds: string[];
      specialRequests?: string;
    }>({
      query: (booking) => ({
        url: '/spark/bookings',
        method: 'POST',
        body: booking,
      }),
      invalidatesTags: ['Booking', 'Program'],
    }),
    
    updateBooking: builder.mutation<Booking, { id: string; booking: Partial<Booking> }>({
      query: ({ id, booking }) => ({
        url: `/spark/bookings/${id}`,
        method: 'PUT',
        body: booking,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),
    
    cancelBooking: builder.mutation<{ message: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/spark/bookings/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),
    
    // Students
    getStudents: builder.query<PaginatedResponse<Student>, {
      page?: number;
      limit?: number;
      search?: string;
      grade?: string;
    }>({
      query: (params) => ({
        url: '/spark/students',
        params,
      }),
      providesTags: ['Student'],
    }),
    
    getStudent: builder.query<Student, string>({
      query: (id) => `/spark/students/${id}`,
      providesTags: (result, error, id) => [{ type: 'Student', id }],
    }),
    
    createStudent: builder.mutation<Student, Partial<Student>>({
      query: (student) => ({
        url: '/spark/students',
        method: 'POST',
        body: student,
      }),
      invalidatesTags: ['Student'],
    }),
    
    updateStudent: builder.mutation<Student, { id: string; student: Partial<Student> }>({
      query: ({ id, student }) => ({
        url: `/spark/students/${id}`,
        method: 'PUT',
        body: student,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Student', id }],
    }),
    
    deleteStudent: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/spark/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Student'],
    }),
    
    // Permission Slips
    getPermissionSlips: builder.query<PaginatedResponse<PermissionSlip>, {
      bookingId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/spark/permission-slips',
        params,
      }),
      providesTags: ['PermissionSlip'],
    }),
    
    sendPermissionSlip: builder.mutation<{ message: string }, { bookingId: string; studentIds: string[] }>({
      query: (body) => ({
        url: '/spark/permission-slips/send',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PermissionSlip'],
    }),
    
    // Analytics
    getDashboardStats: builder.query<{
      totalBookings: number;
      upcomingBookings: number;
      totalStudents: number;
      totalSpent: number;
      recentActivity: any[];
    }, void>({
      query: () => '/spark/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
    
    getBookingAnalytics: builder.query<{
      bookingsByMonth: { month: string; count: number }[];
      bookingsByCategory: { category: string; count: number }[];
      averageBookingValue: number;
    }, { year: string }>({
      query: ({ year }) => ({
        url: '/spark/analytics/bookings',
        params: { year },
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetProgramQuery,
  useGetProgramAvailabilityQuery,
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useCancelBookingMutation,
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetPermissionSlipsQuery,
  useSendPermissionSlipMutation,
  useGetDashboardStatsQuery,
  useGetBookingAnalyticsQuery,
} = sparkApi;
