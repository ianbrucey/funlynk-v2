// Common types for the admin dashboard

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'teacher' | 'school_admin';
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeEvents: number;
  monthlyRevenue: number;
  systemHealth: number;
  userGrowth: number;
  eventGrowth: number;
  revenueGrowth: number;
  healthChange: number;
  userGrowthData: ChartDataPoint[];
  eventMetricsData: ChartDataPoint[];
  recentActivities: Activity[];
  topEvents: TopEvent[];
  systemMetrics: SystemMetrics;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface Activity {
  id: string;
  type: 'user_registration' | 'event_created' | 'booking_made' | 'payment_processed';
  description: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
}

export interface TopEvent {
  id: string;
  title: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTime: number;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: PaginationData;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Booking-related types
export interface School {
  id: string;
  name: string;
  district: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  school: School;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  gradeLevels: string[];
  maxStudents: number;
  pricePerStudent: number;
  category: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  program: Program;
  school: School;
  teacher: Teacher;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  studentCount: number;
  maxStudents: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  upcomingBookings: number;
  completedBookings: number;
}

export interface BookingFilters {
  status?: string[];
  paymentStatus?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  school?: string;
  program?: string;
  teacher?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Analytics-related types
export interface AnalyticsData {
  totalRevenue: number;
  activeUsers: number;
  totalBookings: number;
  platformGrowth: number;
  revenueGrowth: number;
  userGrowth: number;
  bookingGrowth: number;
  growthChange: number;
  revenueTrend: number[];
  userTrend: number[];
  bookingTrend: number[];
  growthTrend: number[];
  revenueData: ChartDataPoint[];
  userGrowthData: ChartDataPoint[];
  programPerformance: ProgramPerformanceData[];
  geographicData: GeographicData[];
  topPrograms: TopItem[];
  topTeachers: TopItem[];
  topSchools: TopItem[];
}

export interface ProgramPerformanceData {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
  completionRate: number;
  category: string;
}

export interface GeographicData {
  region: string;
  users: number;
  revenue: number;
  bookings: number;
  coordinates?: [number, number];
}

export interface TopItem {
  id: string;
  name: string;
  value: number;
  change: number;
  subtitle?: string;
}

export interface KPIData {
  title: string;
  value: string;
  change: number;
  changeType: 'percentage' | 'currency' | 'number';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend: number[];
}

export interface FinancialData {
  revenueBreakdown: RevenueBreakdownItem[];
  paymentMethods: PaymentMethodData[];
  refundData: RefundData[];
  summary: FinancialSummaryItem[];
}

export interface RevenueBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  change: number;
}

export interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface RefundData {
  date: string;
  amount: number;
  count: number;
  reason: string;
}

export interface FinancialSummaryItem {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export interface SystemHealthData {
  metrics: SystemMetrics;
  performanceData: PerformanceDataPoint[];
  alerts: SystemAlert[];
  errorLogs: ErrorLog[];
}

export interface PerformanceDataPoint {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  throughput: number;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  stack?: string;
}

export interface ReportConfig {
  name: string;
  type: 'table' | 'chart' | 'dashboard';
  dataSource: string;
  filters: Record<string, any>;
  columns: string[];
  groupBy: string[];
  sortBy: string[];
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
}
