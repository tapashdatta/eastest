// utils/dateUtils.ts
export interface FormatDateOptions {
  weekday?: 'long' | 'short' | 'narrow';
  year?: 'numeric' | '2-digit';
  month?: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZoneName?: 'long' | 'short';
}

/**
 * Format a date object to a localized string
 */
export const formatDate = (date: Date, options: FormatDateOptions = {}): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  try {
    return new Intl.DateTimeFormat('en-GB', defaultOptions).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toLocaleDateString();
  }
};

/**
 * Format a date to a relative string (e.g., "2 hours ago", "in 3 days")
 */
export const formatRelativeDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffInHours) < 24) {
    if (diffInHours === 0) {
      return 'Now';
    } else if (diffInHours > 0) {
      return `In ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      return `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? 's' : ''} ago`;
    }
  } else {
    if (diffInDays > 0) {
      return `In ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    } else {
      return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? 's' : ''} ago`;
    }
  }
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  if (!date || isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Check if a date is tomorrow
 */
export const isTomorrow = (date: Date): boolean => {
  if (!date || isNaN(date.getTime())) {
    return false;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

/**
 * Format time to HH:MM format
 */
export const formatTime = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Parse ISO date string to Date object
 */
export const parseISODate = (dateString: string): Date | null => {
  if (!dateString) {
    return null;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Get the start of day for a given date
 */
export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Get the end of day for a given date
 */
export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Subtract days from a date
 */
export const subtractDays = (date: Date, days: number): Date => {
  return addDays(date, -days);
};

/**
 * Check if a date is in the past
 */
export const isPast = (date: Date): boolean => {
  if (!date || isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < new Date().getTime();
};

/**
 * Check if a date is in the future
 */
export const isFuture = (date: Date): boolean => {
  if (!date || isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() > new Date().getTime();
};

/**
 * Format date range
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  if (!startDate || isNaN(startDate.getTime())) {
    return '';
  }

  if (!endDate || isNaN(endDate.getTime())) {
    return formatDate(startDate);
  }

  const isSameDay = startDate.toDateString() === endDate.toDateString();
  
  if (isSameDay) {
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  } else {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
};