import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';

// Root Stack Navigator
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Modal: { screen: string; params?: any };
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  RoleSelection: undefined;
};

// Main Tab Navigator (Core App)
export type CoreTabParamList = {
  Home: undefined;
  Events: undefined;
  Social: undefined;
  Profile: undefined;
};

// Core Stack Navigators
export type HomeStackParamList = {
  HomeScreen: undefined;
  EventDetails: { eventId: string };
  UserProfile: { userId: string };
  CreateEvent: undefined;
  EditEvent: { eventId: string };
};

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetails: { eventId: string };
  EventSearch: undefined;
  EventFilters: undefined;
  MyEvents: undefined;
};

export type SocialStackParamList = {
  Feed: undefined;
  Messages: undefined;
  Conversation: { conversationId: string };
  Notifications: undefined;
  Following: undefined;
  Followers: undefined;
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Privacy: undefined;
  Help: undefined;
};

// Spark Tab Navigator
export type SparkTabParamList = {
  Dashboard: undefined;
  Programs: undefined;
  Bookings: undefined;
  Students: undefined;
};

// Spark Stack Navigators
export type SparkDashboardStackParamList = {
  DashboardScreen: undefined;
  Analytics: undefined;
  QuickActions: undefined;
};

export type SparkProgramsStackParamList = {
  ProgramsList: undefined;
  ProgramDetails: { programId: string };
  CreateBooking: { programId: string };
  ProgramSearch: undefined;
};

export type SparkBookingsStackParamList = {
  BookingsList: undefined;
  BookingDetails: { bookingId: string };
  CreateBooking: undefined;
  EditBooking: { bookingId: string };
  PermissionSlips: { bookingId: string };
};

export type SparkStudentsStackParamList = {
  StudentsList: undefined;
  StudentDetails: { studentId: string };
  AddStudent: undefined;
  EditStudent: { studentId: string };
  AttendanceTracking: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type CoreTabScreenProps<T extends keyof CoreTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<CoreTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type SparkTabScreenProps<T extends keyof SparkTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<SparkTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
