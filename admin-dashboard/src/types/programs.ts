// Program management types

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  qualifications: string[];
  rating: number;
  totalPrograms: number;
  isVerified: boolean;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  district: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  type: 'elementary' | 'middle' | 'high' | 'mixed';
}

export interface SparkProgram {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  gradeLevels: string[];
  maxStudents: number;
  pricePerStudent: number;
  category: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'draft';
  teacher: Teacher;
  school?: School;
  materials: string[];
  learningObjectives: string[];
  totalBookings: number;
  averageRating?: number;
  totalReviews: number;
  revenue: number;
  lastBookingDate?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ProgramFilters {
  search?: string;
  status?: string[];
  gradeLevels?: string[];
  categories?: string[];
  teachers?: string[];
  schools?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: 'title' | 'createdAt' | 'rating' | 'bookings' | 'revenue';
  sortOrder?: 'asc' | 'desc';
}

export interface ProgramStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  totalRevenue: number;
  averageRating: number;
  totalBookings: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'created' | 'approved' | 'rejected' | 'booked';
    programTitle: string;
    teacherName: string;
    timestamp: string;
  }>;
}

export interface ProgramAnalytics {
  programId: string;
  title: string;
  performanceMetrics: {
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
    rebookingRate: number;
  };
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  ratingDistribution: Array<{
    rating: number;
    count: number;
  }>;
  popularGradeLevels: Array<{
    gradeLevel: string;
    bookings: number;
  }>;
  seasonalTrends: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  programId: string;
  assignedAt: string;
  assignedBy: string;
  status: 'active' | 'inactive' | 'pending';
  notes?: string;
}

export interface ProgramApproval {
  id: string;
  programId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'approved' | 'rejected' | 'needs_revision';
  comments: string;
  checklist: Array<{
    item: string;
    checked: boolean;
    notes?: string;
  }>;
  reviewedAt: string;
}

export interface ProgramsState {
  programs: SparkProgram[];
  stats: ProgramStats | null;
  analytics: Record<string, ProgramAnalytics>;
  filters: ProgramFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  isLoading: boolean;
  error: string | null;
  selectedProgram: SparkProgram | null;
}
