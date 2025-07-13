# Task 001: Admin Dashboard Setup
**Agent**: Web Admin Developer  
**Estimated Time**: 6-7 hours  
**Priority**: High  
**Dependencies**: Agent 1 Task 005 (API Foundation), Agent 2 Task 005 (Payment Integration)  

## Overview
Set up comprehensive web-based admin dashboard for Funlynk platform management including user oversight, event moderation, analytics, and system administration using React, TypeScript, and the established design system.

## Prerequisites
- API foundation complete (Agent 1 Task 005)
- Payment integration available (Agent 2 Task 005)
- Design system components available
- Authentication system working

## Step-by-Step Implementation

### Step 1: Initialize React Admin Project (1.5 hours)

**Create React admin project structure:**
```bash
# Navigate to project root
cd /path/to/funlynk-v2

# Create admin web app
npx create-react-app admin-dashboard --template typescript
cd admin-dashboard

# Install additional dependencies
npm install @reduxjs/toolkit react-redux react-router-dom
npm install @headlessui/react @heroicons/react
npm install recharts date-fns axios
npm install @types/node @types/react @types/react-dom

# Install development dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/jest @testing-library/react @testing-library/jest-dom
```

**Configure project structure:**
```
admin-dashboard/
├── src/
│   ├── components/           # Reusable components
│   │   ├── common/          # Common UI components
│   │   ├── charts/          # Chart components
│   │   ├── forms/           # Form components
│   │   └── layout/          # Layout components
│   ├── pages/               # Page components
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── users/           # User management
│   │   ├── events/          # Event management
│   │   ├── analytics/       # Analytics pages
│   │   └── settings/        # Settings pages
│   ├── hooks/               # Custom hooks
│   ├── services/            # API services
│   ├── store/               # Redux store
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── styles/              # Global styles
├── public/                  # Static assets
└── package.json
```

**Configure Tailwind CSS:**
```bash
npx tailwindcss init -p
```

**Update tailwind.config.js:**
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
    },
  },
  plugins: [],
}
```

### Step 2: Create Dashboard Layout and Navigation (2 hours)

**Create main layout component (src/components/layout/AdminLayout.tsx):**
```typescript
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Events', href: '/admin/events', icon: CalendarIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: CogIcon },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentNavigation = navigation.map(item => ({
    ...item,
    current: location.pathname === item.href,
  }));

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={currentNavigation} onNavigate={navigate} />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={currentNavigation} onNavigate={navigate} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search users, events..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: NavigationItem[];
  onNavigate: (path: string) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Funlynk Admin</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => onNavigate(item.href)}
                className={`${
                  item.current
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`}
              >
                <Icon
                  className={`${
                    item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
```

### Step 3: Create Dashboard Overview Components (2 hours)

**Create dashboard page (src/pages/dashboard/DashboardPage.tsx):**
```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StatsCard } from '../../components/common/StatsCard';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { UserGrowthChart } from '../../components/charts/UserGrowthChart';
import { EventMetricsChart } from '../../components/charts/EventMetricsChart';
import { TopEvents } from '../../components/dashboard/TopEvents';
import { SystemHealth } from '../../components/dashboard/SystemHealth';
import { loadDashboardData } from '../../store/slices/dashboardSlice';
import type { RootState } from '../../store/store';

export const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const { stats, isLoading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(loadDashboardData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error loading dashboard: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your platform.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          change={stats?.userGrowth || 0}
          changeType="increase"
          icon="users"
        />
        <StatsCard
          title="Active Events"
          value={stats?.activeEvents || 0}
          change={stats?.eventGrowth || 0}
          changeType="increase"
          icon="calendar"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          change={stats?.revenueGrowth || 0}
          changeType="increase"
          icon="currency"
        />
        <StatsCard
          title="Platform Health"
          value={`${stats?.systemHealth || 0}%`}
          change={stats?.healthChange || 0}
          changeType={stats?.healthChange >= 0 ? 'increase' : 'decrease'}
          icon="shield"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              User Growth
            </h3>
            <UserGrowthChart data={stats?.userGrowthData || []} />
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Event Metrics
            </h3>
            <EventMetricsChart data={stats?.eventMetricsData || []} />
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentActivity activities={stats?.recentActivities || []} />
        </div>
        <div>
          <TopEvents events={stats?.topEvents || []} />
          <div className="mt-8">
            <SystemHealth metrics={stats?.systemMetrics || {}} />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Step 4: Set Up Routing and Authentication (1.5 hours)

**Create router configuration (src/App.tsx):**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { UsersPage } from './pages/users/UsersPage';
import { EventsPage } from './pages/events/EventsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './styles/globals.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
```

**Create authentication guard (src/components/auth/ProtectedRoute.tsx):**
```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You don't have permission to access this area.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

## Acceptance Criteria

### Functional Requirements
- [ ] Admin dashboard loads with comprehensive overview
- [ ] Navigation works between all admin sections
- [ ] Authentication guards protect admin routes
- [ ] Stats cards display real-time platform metrics
- [ ] Charts render user growth and event analytics
- [ ] Recent activity feed shows platform activity
- [ ] System health monitoring displays correctly
- [ ] Search functionality works across platform data
- [ ] Responsive design works on desktop and tablet

### Technical Requirements
- [ ] React 18 with TypeScript setup complete
- [ ] Redux Toolkit for state management configured
- [ ] React Router for navigation implemented
- [ ] Tailwind CSS for styling configured
- [ ] Component architecture follows best practices
- [ ] API integration with backend services
- [ ] Error handling and loading states implemented
- [ ] Accessibility standards met (WCAG 2.1)

### Design Requirements
- [ ] Admin interface follows professional design patterns
- [ ] Color scheme matches brand guidelines
- [ ] Typography and spacing consistent throughout
- [ ] Charts and visualizations are clear and informative
- [ ] Loading and error states are visually consistent
- [ ] Mobile-responsive design for tablet access

### Testing Requirements
- [ ] Unit tests for all components
- [ ] Integration tests for routing and authentication
- [ ] API integration testing
- [ ] Accessibility testing with screen readers
- [ ] Cross-browser compatibility testing
- [ ] Performance testing for dashboard load times

## Manual Testing Instructions

### Test Case 1: Dashboard Setup
1. Access admin dashboard URL
2. Verify authentication redirect works
3. Test admin role verification
4. Verify dashboard loads with all sections
5. Test navigation between different admin areas
6. Verify responsive design on different screen sizes

### Test Case 2: Dashboard Functionality
1. Verify stats cards display correct data
2. Test chart interactions and data visualization
3. Test search functionality across platform
4. Verify recent activity updates in real-time
5. Test system health monitoring
6. Verify error handling for API failures

### Test Case 3: Authentication and Security
1. Test login with admin credentials
2. Test access denial for non-admin users
3. Test session management and timeout
4. Verify protected routes work correctly
5. Test logout functionality
6. Verify security headers and HTTPS

## API Integration Requirements

### Admin Dashboard Endpoints Used
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/charts` - Get chart data
- `GET /api/admin/dashboard/activity` - Get recent activity
- `GET /api/admin/system/health` - Get system health metrics
- `GET /api/admin/search` - Search platform data
- `POST /api/auth/admin/login` - Admin authentication
- `GET /api/auth/admin/verify` - Verify admin session

### Data Validation
- Admin role verification
- Session token validation
- API rate limiting compliance
- Data sanitization for search queries
- Error response handling

## Dependencies and Integration Points

### Required APIs (from previous agents)
- Authentication system (Agent 1)
- User management APIs (Agent 2)
- Event management APIs (Agent 2)
- Payment system integration (Agent 2)
- Analytics and reporting APIs

### Design System Dependencies
- Color palette and typography
- Component specifications
- Layout and spacing system
- Chart and visualization guidelines
- Admin interface patterns

## Completion Checklist

- [ ] React admin project initialized and configured
- [ ] Tailwind CSS setup and customized
- [ ] Main layout and navigation implemented
- [ ] Dashboard page with stats and charts created
- [ ] Authentication and route protection working
- [ ] Redux store configured for admin state
- [ ] API services for admin endpoints created
- [ ] Error handling and loading states implemented
- [ ] Responsive design implemented
- [ ] Accessibility features added
- [ ] Unit tests written and passing
- [ ] Integration tests completed
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Documentation updated

## Notes for Next Tasks
- Admin dashboard provides foundation for all administrative functions
- Component patterns established can be reused across admin features
- Authentication and routing patterns set up for secure admin access
- Chart and visualization components ready for analytics features
- API integration patterns established for backend communication
- State management structure ready for complex admin workflows
