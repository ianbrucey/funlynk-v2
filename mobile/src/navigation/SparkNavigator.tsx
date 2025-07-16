import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';

import { SparkTabParamList } from '@/types/navigation';
import { theme } from '@/constants/theme';

// Import placeholder screens
import SparkDashboardScreen from '@/screens/spark/DashboardScreen';
import SparkProgramsScreen from '@/screens/spark/ProgramsScreen';
import SparkBookingsScreen from '@/screens/spark/BookingsScreen';
import SparkStudentsScreen from '@/screens/spark/StudentsScreen';

const Tab = createBottomTabNavigator<SparkTabParamList>();

// Tab Navigator Icon Component (placeholder)
const TabIcon: React.FC<{ name: string; focused: boolean; size: number }> = ({ 
  name, 
  focused, 
  size 
}) => {
  const getIcon = () => {
    switch (name) {
      case 'Dashboard':
        return focused ? '📊' : '📈';
      case 'Programs':
        return focused ? '📚' : '📖';
      case 'Bookings':
        return focused ? '📅' : '📆';
      case 'Students':
        return focused ? '👥' : '👤';
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

export const SparkNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => (
          <TabIcon name={route.name} focused={focused} size={size} />
        ),
        tabBarActiveTintColor: theme.colors.secondary, // Use secondary color for Spark
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
        tabBarHideOnKeyboard: Platform.OS === 'android',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={SparkDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          title: 'Spark Dashboard',
        }}
      />
      <Tab.Screen 
        name="Programs" 
        component={SparkProgramsScreen}
        options={{
          tabBarLabel: 'Programs',
          title: 'Programs',
        }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={SparkBookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          title: 'Bookings',
        }}
      />
      <Tab.Screen 
        name="Students" 
        component={SparkStudentsScreen}
        options={{
          tabBarLabel: 'Students',
          title: 'Students',
        }}
      />
    </Tab.Navigator>
  );
};

export default SparkNavigator;
