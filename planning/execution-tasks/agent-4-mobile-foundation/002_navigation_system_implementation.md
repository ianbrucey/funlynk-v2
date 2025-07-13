# Task 002: Navigation System Implementation
**Agent**: Mobile Foundation Developer  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: Task 001 (React Native Project Setup)  

## Overview
Implement comprehensive navigation system using React Navigation v6 with stack, tab, and drawer navigators. Include deep linking, authentication flow, and separate navigation for Core and Spark applications.

## Prerequisites
- Task 001 completed successfully
- React Navigation dependencies installed
- TypeScript configuration ready

## Step-by-Step Implementation

### Step 1: Create Navigation Types (45 minutes)

**Create navigation type definitions (src/types/navigation.ts):**
```typescript
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
```

### Step 2: Create Navigation Components (90 minutes)

**Create Root Navigator (src/navigation/RootNavigator.tsx):**
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootStackParamList } from '@/types/navigation';
import { RootState } from '@/store';
import { linking } from './LinkingConfiguration';

import SplashScreen from '@/screens/SplashScreen';
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ModalScreen from '@/screens/ModalScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, hasCompletedOnboarding, userRole } = useSelector(
    (state: RootState) => ({
      isAuthenticated: state.auth.isAuthenticated,
      isLoading: state.auth.isLoading,
      hasCompletedOnboarding: state.auth.hasCompletedOnboarding,
      userRole: state.auth.user?.role,
    })
  );

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="Modal" component={ModalScreen} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

**Create Auth Navigator (src/navigation/AuthNavigator.tsx):**
```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStackParamList } from '@/types/navigation';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import RoleSelectionScreen from '@/screens/auth/RoleSelectionScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
```

**Create Main Navigator (src/navigation/MainNavigator.tsx):**
```typescript
import React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import CoreNavigator from './CoreNavigator';
import SparkNavigator from './SparkNavigator';

export const MainNavigator: React.FC = () => {
  const userRole = useSelector((state: RootState) => state.auth.user?.role);

  // Route to appropriate app based on user role
  switch (userRole) {
    case 'teacher':
    case 'school_admin':
    case 'district_admin':
      return <SparkNavigator />;
    case 'user':
    case 'parent':
    default:
      return <CoreNavigator />;
  }
};

export default MainNavigator;
```

**Create Core Navigator (src/navigation/CoreNavigator.tsx):**
```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { CoreTabParamList, HomeStackParamList, EventsStackParamList, SocialStackParamList, ProfileStackParamList } from '@/types/navigation';
import { theme } from '@/constants/theme';

// Import screen components (to be created in later tasks)
import HomeScreen from '@/screens/core/HomeScreen';
import EventsScreen from '@/screens/core/EventsScreen';
import SocialScreen from '@/screens/core/SocialScreen';
import ProfileScreen from '@/screens/core/ProfileScreen';

const Tab = createBottomTabNavigator<CoreTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();
const SocialStack = createNativeStackNavigator<SocialStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Stack Navigators
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="HomeScreen" 
      component={HomeScreen}
      options={{ title: 'Home' }}
    />
  </HomeStack.Navigator>
);

const EventsStackNavigator = () => (
  <EventsStack.Navigator>
    <EventsStack.Screen 
      name="EventsList" 
      component={EventsScreen}
      options={{ title: 'Events' }}
    />
  </EventsStack.Navigator>
);

const SocialStackNavigator = () => (
  <SocialStack.Navigator>
    <SocialStack.Screen 
      name="Feed" 
      component={SocialScreen}
      options={{ title: 'Social' }}
    />
  </SocialStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </ProfileStack.Navigator>
);

export const CoreNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Events':
              iconName = 'event';
              break;
            case 'Social':
              iconName = 'people';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Events" component={EventsStackNavigator} />
      <Tab.Screen name="Social" component={SocialStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

export default CoreNavigator;
```

### Step 3: Create Spark Navigator (60 minutes)

**Create Spark Navigator (src/navigation/SparkNavigator.tsx):**
```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { SparkTabParamList, SparkDashboardStackParamList, SparkProgramsStackParamList, SparkBookingsStackParamList, SparkStudentsStackParamList } from '@/types/navigation';
import { theme } from '@/constants/theme';

// Import screen components (to be created in later tasks)
import DashboardScreen from '@/screens/spark/DashboardScreen';
import ProgramsScreen from '@/screens/spark/ProgramsScreen';
import BookingsScreen from '@/screens/spark/BookingsScreen';
import StudentsScreen from '@/screens/spark/StudentsScreen';

const Tab = createBottomTabNavigator<SparkTabParamList>();
const DashboardStack = createNativeStackNavigator<SparkDashboardStackParamList>();
const ProgramsStack = createNativeStackNavigator<SparkProgramsStackParamList>();
const BookingsStack = createNativeStackNavigator<SparkBookingsStackParamList>();
const StudentsStack = createNativeStackNavigator<SparkStudentsStackParamList>();

// Stack Navigators
const DashboardStackNavigator = () => (
  <DashboardStack.Navigator>
    <DashboardStack.Screen 
      name="DashboardScreen" 
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
  </DashboardStack.Navigator>
);

const ProgramsStackNavigator = () => (
  <ProgramsStack.Navigator>
    <ProgramsStack.Screen 
      name="ProgramsList" 
      component={ProgramsScreen}
      options={{ title: 'Programs' }}
    />
  </ProgramsStack.Navigator>
);

const BookingsStackNavigator = () => (
  <BookingsStack.Navigator>
    <BookingsStack.Screen 
      name="BookingsList" 
      component={BookingsScreen}
      options={{ title: 'Bookings' }}
    />
  </BookingsStack.Navigator>
);

const StudentsStackNavigator = () => (
  <StudentsStack.Navigator>
    <StudentsStack.Screen 
      name="StudentsList" 
      component={StudentsScreen}
      options={{ title: 'Students' }}
    />
  </StudentsStack.Navigator>
);

export const SparkNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Programs':
              iconName = 'school';
              break;
            case 'Bookings':
              iconName = 'event-note';
              break;
            case 'Students':
              iconName = 'group';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Programs" component={ProgramsStackNavigator} />
      <Tab.Screen name="Bookings" component={BookingsStackNavigator} />
      <Tab.Screen name="Students" component={StudentsStackNavigator} />
    </Tab.Navigator>
  );
};

export default SparkNavigator;
```

### Step 4: Configure Deep Linking (45 minutes)

**Create linking configuration (src/navigation/LinkingConfiguration.ts):**
```typescript
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
              MyEvents: 'my-events',
            },
          },
          Social: {
            screens: {
              Feed: 'feed',
              Messages: 'messages',
              Conversation: 'messages/:conversationId',
              Notifications: 'notifications',
            },
          },
          Profile: {
            screens: {
              ProfileScreen: 'profile',
              EditProfile: 'profile/edit',
              Settings: 'settings',
            },
          },
          
          // Spark App Deep Links
          Dashboard: {
            screens: {
              DashboardScreen: 'spark/dashboard',
              Analytics: 'spark/analytics',
            },
          },
          Programs: {
            screens: {
              ProgramsList: 'spark/programs',
              ProgramDetails: 'spark/programs/:programId',
              CreateBooking: 'spark/programs/:programId/book',
            },
          },
          Bookings: {
            screens: {
              BookingsList: 'spark/bookings',
              BookingDetails: 'spark/bookings/:bookingId',
              CreateBooking: 'spark/bookings/create',
              PermissionSlips: 'spark/bookings/:bookingId/permission-slips',
            },
          },
          Students: {
            screens: {
              StudentsList: 'spark/students',
              StudentDetails: 'spark/students/:studentId',
              AddStudent: 'spark/students/add',
            },
          },
        },
      },
      Modal: 'modal',
    },
  },
};
```

### Step 5: Create Navigation Utilities (30 minutes)

**Create navigation utilities (src/navigation/NavigationService.ts):**
```typescript
import { createNavigationContainerRef, StackActions } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationService = {
  navigate: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },

  goBack: () => {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  reset: (routeName: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      });
    }
  },

  push: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.push(name, params));
    }
  },

  replace: (name: keyof RootStackParamList, params?: any) => {
    if (navigationRef.isReady()) {
      navigationRef.dispatch(StackActions.replace(name, params));
    }
  },

  getCurrentRoute: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute();
    }
    return null;
  },

  getRootState: () => {
    if (navigationRef.isReady()) {
      return navigationRef.getRootState();
    }
    return null;
  },
};
```

## Acceptance Criteria

### Navigation Structure
- [ ] Complete type-safe navigation system with TypeScript
- [ ] Separate navigation flows for Core and Spark applications
- [ ] Role-based navigation routing
- [ ] Modal and stack navigation patterns implemented

### Authentication Flow
- [ ] Proper authentication flow with login/register screens
- [ ] Onboarding flow for new users
- [ ] Role selection and appropriate app routing
- [ ] Splash screen and loading states

### Deep Linking
- [ ] Deep linking configuration for all major screens
- [ ] URL scheme handling for both apps
- [ ] Parameter passing through deep links
- [ ] Fallback handling for invalid links

### Navigation Features
- [ ] Tab navigation with proper icons and styling
- [ ] Stack navigation with proper transitions
- [ ] Navigation service for programmatic navigation
- [ ] Back button handling and navigation state management

## Testing Instructions

### Navigation Testing
```bash
# Test navigation compilation
npx tsc --noEmit

# Test deep linking (iOS Simulator)
xcrun simctl openurl booted "funlynk://events/123"

# Test deep linking (Android)
adb shell am start -W -a android.intent.action.VIEW -d "funlynk://events/123" com.funlynk.mobile
```

### Manual Testing
- [ ] Test tab navigation between all screens
- [ ] Test stack navigation and back button behavior
- [ ] Test deep linking from external sources
- [ ] Test authentication flow navigation
- [ ] Test role-based navigation routing

## Next Steps
After completion, proceed to:
- Task 003: State Management Setup
- Create placeholder screens for all navigation routes
- Implement navigation guards and permissions

## Documentation
- Document navigation structure and routing logic
- Create deep linking guide for marketing team
- Document role-based navigation system
- Create navigation testing procedures
