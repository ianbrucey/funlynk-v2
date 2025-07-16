/**
 * Utility functions for formatting data in the admin dashboard
 */

/**
 * Format a date string to a readable format
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', options || defaultOptions);
};

/**
 * Format a date and time string to a readable format
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format a time string (HH:MM) to 12-hour format
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Format a currency amount
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (typeof amount !== 'number') return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format a number with commas
 */
export const formatNumber = (num: number): string => {
  if (typeof num !== 'number') return '0';
  
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a percentage
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  if (typeof value !== 'number') return '0%';
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  if (typeof minutes !== 'number' || minutes < 0) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
};

/**
 * Format a phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phoneNumber;
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  return text.slice(0, maxLength).trim() + '...';
};

/**
 * Format a relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

/**
 * Format booking status for display
 */
export const formatBookingStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  
  return statusMap[status] || status;
};

/**
 * Format payment status for display
 */
export const formatPaymentStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    refunded: 'Refunded',
    failed: 'Failed',
  };
  
  return statusMap[status] || status;
};

/**
 * Get status color class for badges
 */
export const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
  const colorMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'gray'> = {
    confirmed: 'success',
    paid: 'success',
    completed: 'success',
    pending: 'warning',
    cancelled: 'error',
    refunded: 'error',
    failed: 'error',
  };
  
  return colorMap[status] || 'gray';
};
