import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { 
  CoreTabParamList, 
  HomeStackParamList, 
  EventsStackParamList, 
  SocialStackParamList, 
  ProfileStackParamList 
} from '@/types/navigation';
import { theme } from '@/constants/theme';

// Import screen components
import HomeScreen from '@/screens/core/HomeScreen';
import EventsScreen from '@/screens/core/EventsScreen';
import SocialScreen from '@/screens/core/SocialScreen';
import ProfileScreen from '@/screens/core/ProfileScreen';

// Tab and Stack navigators
const Tab = createBottomTabNavigator<CoreTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();
const SocialStack = createNativeStackNavigator<SocialStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Stack Navigators
const HomeStackNavigator = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: Platform.select({
        ios: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.ios.separator,
        },
        android: {
          backgroundColor: theme.colors.surface,
          elevation: 4,
        },
      }),
      headerTitleStyle: Platform.select({
        ios: {
          fontSize: 17,
          fontWeight: '600',
          color: theme.colors.textPrimary,
        },
        android: {
          fontSize: 20,
          fontWeight: '500',
          color: theme.colors.textPrimary,
        },
      }),
    }}
  >
    <HomeStack.Screen 
      name="HomeScreen" 
      component={HomeScreen}
      options={{ title: 'Home' }}
    />
  </HomeStack.Navigator>
);

const EventsStackNavigator = () => (
  <EventsStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: Platform.select({
        ios: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.ios.separator,
        },
        android: {
          backgroundColor: theme.colors.surface,
          elevation: 4,
        },
      }),
    }}
  >
    <EventsStack.Screen 
      name="EventsList" 
      component={EventsScreen}
      options={{ title: 'Events' }}
    />
  </EventsStack.Navigator>
);

const SocialStackNavigator = () => (
  <SocialStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: Platform.select({
        ios: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.ios.separator,
        },
        android: {
          backgroundColor: theme.colors.surface,
          elevation: 4,
        },
      }),
    }}
  >
    <SocialStack.Screen 
      name="Feed" 
      component={SocialScreen}
      options={{ title: 'Social' }}
    />
  </SocialStack.Navigator>
);

const ProfileStackNavigator = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: Platform.select({
        ios: {
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 0.5,
          borderBottomColor: theme.colors.ios.separator,
        },
        android: {
          backgroundColor: theme.colors.surface,
          elevation: 4,
        },
      }),
    }}
  >
    <ProfileStack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </ProfileStack.Navigator>
);

// Tab Navigator Icon Component (placeholder)
const TabIcon: React.FC<{ name: string; focused: boolean; size: number }> = ({ 
  name, 
  focused, 
  size 
}) => {
  const getIcon = () => {
    switch (name) {
      case 'Home':
        return focused ? '🏠' : '🏡';
      case 'Events':
        return focused ? '📅' : '📆';
      case 'Social':
        return focused ? '👥' : '👤';
      case 'Profile':
        return focused ? '👤' : '👤';
      default:
        return '⚪';
    }
  };

  return (
    <span style={{ fontSize: size }}>
      {getIcon()}
    </span>
  );
};

export const CoreNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => (
          <TabIcon name={route.name} focused={focused} size={size} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.ios.separator,
            borderTopWidth: 0.5,
            paddingBottom: 20, // Safe area for iOS
            height: 84,
          },
          android: {
            backgroundColor: theme.colors.surface,
            elevation: 8,
            height: 60,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: Platform.OS === 'ios' ? '600' : '500',
        },
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === 'android',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Events" 
        component={EventsStackNavigator}
        options={{
          tabBarLabel: 'Events',
        }}
      />
      <Tab.Screen 
        name="Social" 
        component={SocialStackNavigator}
        options={{
          tabBarLabel: 'Social',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default CoreNavigator;
