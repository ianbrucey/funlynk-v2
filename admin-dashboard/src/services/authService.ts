import axios from 'axios';
import { User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: { email: string; password: string }) {
    try {
      const response = await api.post('/auth/admin/login', credentials);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async verifyToken(): Promise<{ user: User }> {
    try {
      const response = await api.get('/auth/admin/verify');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  },

  async logout() {
    try {
      await api.post('/auth/admin/logout');
    } catch (error: any) {
      // Even if logout fails on server, we still clear local storage
      console.warn('Logout request failed:', error.message);
    }
  },

  async refreshToken() {
    try {
      const response = await api.post('/auth/admin/refresh');
      const newToken = response.data.data.token;
      localStorage.setItem('admin_token', newToken);
      return newToken;
    } catch (error: any) {
      localStorage.removeItem('admin_token');
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },
};

export default api;
