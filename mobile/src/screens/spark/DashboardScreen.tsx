import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

// Shared components
import { Button } from '@/components/ui/Button';
// import { LoadingSpinner } from '@/components/shared/atoms/LoadingSpinner';
// import { EmptyState } from '@/components/shared/molecules/EmptyState';

// Spark-specific components (to be created)
// import { DashboardHeader } from '@/components/spark/molecules/DashboardHeader';
// import { QuickStats } from '@/components/spark/molecules/QuickStats';
// import { UpcomingBookings } from '@/components/spark/organisms/UpcomingBookings';
// import { ProgramOverview } from '@/components/spark/organisms/ProgramOverview';
// import { TeachingResources } from '@/components/spark/organisms/TeachingResources';
// import { WeeklySchedule } from '@/components/spark/organisms/WeeklySchedule';

// Hooks (to be created)
// import { useSpark } from '@/hooks/spark/useSpark';
// import { useAuth } from '@/hooks/shared/useAuth';
// import { useErrorHandler } from '@/hooks/shared/useErrorHandler';

// Types (to be created)
// import type { TeacherDashboardData, SparkBooking } from '@/types/spark';
import type { NavigationProp } from '@react-navigation/native';
// import type { SparkStackParamList } from '@/navigation/SparkNavigator';

// Redux (to be created)
// import { sparkActions } from '@/store/slices/sparkSlice';
// import type { RootState } from '@/store/store';

import { theme } from '@/constants/theme';

/**
 * TeacherDashboardScreen Component
 *
 * Main dashboard for Spark teachers showing overview of programs, bookings,
 * upcoming sessions, and quick access to teaching resources.
 *
 * Features:
 * - Quick statistics overview (total programs, bookings, students)
 * - Upcoming bookings with session details
 * - Program performance metrics
 * - Weekly schedule view
 * - Quick access to teaching resources
 * - Notification center for important updates
 * - Emergency contact information
 */

// type TeacherDashboardScreenNavigationProp = NavigationProp<SparkStackParamList, 'TeacherDashboard'>;

export const TeacherDashboardScreen: React.FC = () => {
  // const navigation = useNavigation<TeacherDashboardScreenNavigationProp>();
  const navigation = useNavigation();
  // const dispatch = useDispatch();
  // const { user } = useAuth();
  // const { handleError } = useErrorHandler();

  // Redux state (placeholder)
  // const {
  //   dashboardData,
  //   upcomingBookings,
  //   programs,
  //   isLoading,
  //   isRefreshing,
  //   error,
  // } = useSelector((state: RootState) => state.spark);

  // Local state
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for development
  const mockDashboardData = {
    totalPrograms: 12,
    activeBookings: 8,
    totalStudents: 156,
    completedSessions: 45,
    averageRating: 4.8,
    monthlyEarnings: 2400,
    unreadNotifications: 3,
    emergencyContacts: {
      admin: '(555) 123-4567',
      support: '1-800-SPARK-HELP'
    }
  };

  const mockUpcomingBookings = [
    {
      id: '1',
      programName: 'Science Museum Adventure',
      schoolName: 'Lincoln Elementary',
      date: '2024-01-15',
      time: '10:00 AM',
      studentCount: 25
    },
    {
      id: '2',
      programName: 'Character Building Workshop',
      schoolName: 'Washington Middle School',
      date: '2024-01-16',
      time: '2:00 PM',
      studentCount: 30
    }
  ];

  // Custom hooks (placeholder)
  // const {
  //   loadTeacherDashboard,
  //   refreshTeacherDashboard,
  //   loadUpcomingBookings,
  //   markBookingAsComplete,
  //   cancelBooking,
  // } = useSpark();

  // Load dashboard data on screen focus
  useFocusEffect(
    useCallback(() => {
      // if (!dashboardData) {
      //   loadTeacherDashboard();
      // }
      // if (upcomingBookings.length === 0) {
      //   loadUpcomingBookings();
      // }
      console.log('Teacher dashboard focused');
    }, [])
  );

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // await refreshTeacherDashboard();
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      // handleError(error);
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle booking action
  const handleBookingAction = useCallback(async (bookingId: string, action: 'complete' | 'cancel') => {
    try {
      // if (action === 'complete') {
      //   await markBookingAsComplete(bookingId);
      // } else {
      //   await cancelBooking(bookingId);
      // }
      console.log(`${action} booking:`, bookingId);
    } catch (error) {
      // handleError(error);
      console.error('Booking action failed:', error);
    }
  }, []);

  // Handle navigation to booking details
  const handleBookingPress = useCallback((booking: any) => {
    // navigation.navigate('BookingDetails', { bookingId: booking.id });
    console.log('Navigate to booking details:', booking.id);
  }, [navigation]);

  // Render loading state
  // if (isLoading && !dashboardData) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <View style={styles.centerContainer}>
  //         <LoadingSpinner size="large" />
  //         <Text style={styles.loadingText}>Loading dashboard...</Text>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  // Render error state
  // if (error && !dashboardData) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <EmptyState
  //         icon="alert-circle"
  //         title="Unable to load dashboard"
  //         subtitle="Please check your connection and try again"
  //         actionText="Retry"
  //         onAction={loadTeacherDashboard}
  //       />
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* Dashboard Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeTitle}>Welcome, Teacher</Text>
          <Text style={styles.welcomeSubtitle}>Manage your Spark programs</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationCount}>{mockDashboardData.unreadNotifications}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{mockDashboardData.totalPrograms}</Text>
              <Text style={styles.statLabel}>Programs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{mockDashboardData.activeBookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{mockDashboardData.totalStudents}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{mockDashboardData.completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{mockDashboardData.averageRating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>${mockDashboardData.monthlyEarnings}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Bookings */}
        <View style={styles.bookingsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
          {mockUpcomingBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingProgram}>{booking.programName}</Text>
                <Text style={styles.bookingDate}>{booking.date}</Text>
              </View>
              <Text style={styles.bookingSchool}>{booking.schoolName}</Text>
              <View style={styles.bookingFooter}>
                <Text style={styles.bookingTime}>{booking.time}</Text>
                <Text style={styles.bookingStudents}>{booking.studentCount} students</Text>
              </View>
            </View>
          ))}
          <Button
            variant="outline"
            onPress={() => console.log('View all bookings')}
            style={styles.viewAllButton}
          >
            View All Bookings
          </Button>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <Button
              variant="secondary"
              size="md"
              onPress={() => console.log('Create Program')}
              style={styles.actionButton}
            >
              Create Program
            </Button>
            <Button
              variant="secondary"
              size="md"
              onPress={() => console.log('Set Availability')}
              style={styles.actionButton}
            >
              Set Availability
            </Button>
            <Button
              variant="secondary"
              size="md"
              onPress={() => console.log('View Students')}
              style={styles.actionButton}
            >
              View Students
            </Button>
            <Button
              variant="secondary"
              size="md"
              onPress={() => console.log('Resources')}
              style={styles.actionButton}
            >
              Resources
            </Button>
          </View>
        </View>

        {/* Emergency Information */}
        <View style={styles.emergencyInfo}>
          <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
          <Text style={styles.emergencyText}>
            School Admin: {mockDashboardData.emergencyContacts.admin}
          </Text>
          <Text style={styles.emergencyText}>
            Spark Support: {mockDashboardData.emergencyContacts.support}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '31%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  bookingsContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookingProgram: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  bookingSchool: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingTime: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  bookingStudents: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  viewAllButton: {
    marginTop: 8,
  },
  quickActions: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  emergencyInfo: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    color: '#92400E',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
});

export default TeacherDashboardScreen;
