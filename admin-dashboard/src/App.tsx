import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProgramsPage } from './pages/programs/ProgramsPage';
import { BookingsPage } from './pages/bookings/BookingsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { verifyToken } from './store/slices/authSlice';
import './styles/globals.css';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = localStorage.getItem('admin_token');
    if (token) {
      dispatch(verifyToken() as any);
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
