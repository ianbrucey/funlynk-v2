import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['funlynk://', 'https://app.funlynk.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
          RoleSelection: 'role-selection',
        },
      },
      Main: {
        screens: {
          // Core App Deep Links
          Home: {
            screens: {
              HomeScreen: 'home',
              EventDetails: 'events/:eventId',
              UserProfile: 'users/:userId',
              CreateEvent: 'events/create',
              EditEvent: 'events/:eventId/edit',
            },
          },
          Events: {
            screens: {
              EventsList: 'events',
              EventDetails: 'events/:eventId',
              EventSearch: 'events/search',
              EventFilters: 'events/filters',
              MyEvents: 'my-events',
            },
          },
          Social: {
            screens: {
              Feed: 'feed',
              Messages: 'messages',
              Conversation: 'messages/:conversationId',
              Notifications: 'notifications',
              Following: 'following',
              Followers: 'followers',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'profile',
              EditProfile: 'profile/edit',
              Settings: 'settings',
              Privacy: 'privacy',
              Help: 'help',
            },
          },
          
          // Spark App Deep Links
          Dashboard: {
            screens: {
              DashboardScreen: 'spark/dashboard',
              Analytics: 'spark/analytics',
              QuickActions: 'spark/quick-actions',
            },
          },
          Programs: {
            screens: {
              ProgramsList: 'spark/programs',
              ProgramDetails: 'spark/programs/:programId',
              CreateBooking: 'spark/programs/:programId/book',
              ProgramSearch: 'spark/programs/search',
            },
          },
          Bookings: {
            screens: {
              BookingsList: 'spark/bookings',
              BookingDetails: 'spark/bookings/:bookingId',
              CreateBooking: 'spark/bookings/create',
              EditBooking: 'spark/bookings/:bookingId/edit',
              PermissionSlips: 'spark/bookings/:bookingId/permission-slips',
            },
          },
          Students: {
            screens: {
              StudentsList: 'spark/students',
              StudentDetails: 'spark/students/:studentId',
              AddStudent: 'spark/students/add',
              EditStudent: 'spark/students/:studentId/edit',
              AttendanceTracking: 'spark/attendance',
            },
          },
        },
      },
      Modal: 'modal',
    },
  },
};
