// config/appConfig.ts

// ================================
// DONATION CATEGORY TYPE
// ================================

export interface DonationCategory {
  id: string;
  title: string;
  description: string;
  image: string; // Now contains the image key, not URL
  icon_name: string;
  financial_type_id: number;
  suggested_amounts: number[];
  requires_date: boolean;
  requires_message: boolean;
  color: string;
}

// ================================
// ENVIRONMENT CONFIGURATION
// ================================

const getEnvironmentConfig = () => {
  return {
    // API Configuration
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || '',
    API_KEY: process.env.EXPO_PUBLIC_API_KEY || '',
    API_TIMEOUT: 30000,
    MAX_RETRY_ATTEMPTS: 3,
    
    // WordPress Content API
    WORDPRESS_BASE_URL: process.env.EXPO_PUBLIC_WORDPRESS_BASE_URL || '',
    
    // App Info
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'ISKCON London',
    APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '2.0.0',
    
    // Debug Settings
    DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    LOG_LEVEL: process.env.EXPO_PUBLIC_LOG_LEVEL || 'error',
  };
};

// ================================
// APP CONSTANTS
// ================================

export const AppConstants = {
  // Environment
  ...getEnvironmentConfig(),
  
  // Donation Limits
  MIN_DONATION_AMOUNT: 0.50,
  MAX_DONATION_AMOUNT: 50000.00,
  DEFAULT_CURRENCY: 'GBP',
  GIFT_AID_RATE: 0.25,
  MAX_CART_ITEMS: 20,
  
  // Contact Information
  CONTACT: {
    EMAIL: 'info@iskconlondon.com',
    PHONE: '+44 20 7437 3662',
    ADDRESS: '10 Soho Street, London W1D 3DL',
    WEBSITE: 'https://iskcon.london',
    CHARITY_NUMBER: '1134591',
  },
  
  // Social Media
  SOCIAL: {
    FACEBOOK: 'https://facebook.com/iskconlondon',
    TWITTER: 'https://twitter.com/iskconlondon',
    INSTAGRAM: 'https://instagram.com/iskconlondon',
    YOUTUBE: 'https://youtube.com/iskconlondon',
  },
  
  // Legal
  LEGAL: {
    PRIVACY_POLICY: 'https://iskcon.london/privacy',
    TERMS_OF_SERVICE: 'https://iskcon.london/terms',
    COOKIE_POLICY: 'https://iskco.london/cookies',
  },
  
  // Storage Keys
  STORAGE: {
    JWT_TOKEN: '@jwt_token',
    USER_PROFILE: '@user_profile',
    APP_SETTINGS: '@app_settings',
    DEVICE_ID: '@device_id',
    LAST_SYNC: '@last_sync',
  },
};

// ================================
// WORDPRESS EVENT TYPES - New Single Post Type System
// ================================

// WordPress event types from _iskcon_event_type meta field
export const getWordPressEventTypes = () => [
  'ekadasi',
  'festival', 
  'courses',
  'guest_speaker',
  'news',
  'bio_lcvs_speaker',
  'bio_recent_vip',
  'bio_team_member',
  'daily_darshan'
];

// Event types that have extended fields (dates, location, etc.)
export const getExtendedEventTypes = () => [
  'ekadasi',
  'festival',
  'courses', 
  'guest_speaker'
];

// Event types that are simple (just title, content, no event fields)
export const getSimpleEventTypes = () => [
  'bio_lcvs_speaker',
  'bio_recent_vip', 
  'bio_team_member',
  'daily_darshan'
];

// Display names for event types
export const getEventTypeDisplayNames = () => ({
  'ekadasi': 'Ekadasi',
  'festival': 'Festival',
  'courses': 'Courses',
  'guest_speaker': 'Guest Speaker',
  'news': 'News',
  'bio_lcvs_speaker': 'LCVS Speaker',
  'bio_recent_vip': 'Recent VIP',
  'bio_team_member': 'Team Member',
  'daily_darshan': 'Daily Darshan'
});

// Event type colors for UI
export const getEventTypeColors = () => ({
  'ekadasi': '#6f42c1',
  'festival': '#fd7e14',
  'courses': '#20c997',
  'guest_speaker': '#0d6efd',
  'news': '#dc3545',
  'bio_lcvs_speaker': '#198754',
  'bio_recent_vip': '#ffc107',
  'bio_team_member': '#6610f2',
  'daily_darshan': '#d63384'
});

// ================================
// DONATION CATEGORIES - Updated with Optional Fields
// ================================

export const getDonationCategories = (): DonationCategory[] => [
  {
    id: 'general',
    title: 'General Donation',
    description: 'Support our temple activities and community programs',
    image: 'general',
    icon_name: 'Heart',
    financial_type_id: 1,
    suggested_amounts: [10, 25, 50],
    requires_date: false, // Made optional
    requires_message: false, // Made optional
    color: '#FF6B35',
  },
  {
    id: 'food_for_life',
    title: 'Food for Life',
    description: 'Sponsor free spiritual food distribution to the community',
    image: 'food_for_life',
    icon_name: 'Utensils',
    financial_type_id: 1,
    suggested_amounts: [5, 15, 50],
    requires_date: false, // Made optional
    requires_message: false, // Made optional
    color: '#4CAF50',
  },
  {
    id: 'deity_worship',
    title: 'Deity Worship',
    description: 'Support daily worship services and offerings to the deities',
    image: 'deity_worship',
    icon_name: 'Star',
    financial_type_id: 6,
    suggested_amounts: [20, 50, 108],
    requires_date: false, // Changed from false to false (was already false)
    requires_message: false, // Changed from true to false - NOW OPTIONAL
    color: '#9C27B0',
  },
  {
    id: 'book_distribution',
    title: 'Book Distribution',
    description: 'Help distribute spiritual books and wisdom literature',
    image: 'book_distribution',
    icon_name: 'Book',
    financial_type_id: 7,
    suggested_amounts: [7, 15, 25],
    requires_date: false, // Made optional
    requires_message: false, // Made optional
    color: '#FF9800',
  },
  {
    id: 'nitya_seva',
    title: 'Nitya Seva',
    description: 'Help maintain and improve our sacred temple facilities',
    image: 'temple_maintenance',
    icon_name: 'Home',
    financial_type_id: 9,
    suggested_amounts: [5000],
    requires_date: false, // Made optional
    requires_message: false, // Made optional
    color: '#795548',
  },
  {
    id: 'festival_sponsorship',
    title: 'Festival Sponsorship',
    description: 'Sponsor spiritual festivals and community celebrations',
    image: 'festival_sponsorship',
    icon_name: 'Calendar',
    financial_type_id: 5,
    suggested_amounts: [25, 50, 108],
    requires_date: false, // Made optional
    requires_message: false, // Made optional
    color: '#E91E63',
  },
];

// ================================
// VALIDATION RULES
// ================================

export const ValidationRules = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  phone: (phone: string): boolean => {
    // UK phone number validation
    const ukPhoneRegex = /^(\+44|0)[0-9]{10,11}$/;
    return ukPhoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  postalCode: (code: string): boolean => {
    // UK postal code validation
    const ukPostalRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return ukPostalRegex.test(code);
  },
  
  donationAmount: (amount: number): { isValid: boolean; message?: string } => {
    if (amount < AppConstants.MIN_DONATION_AMOUNT) {
      return {
        isValid: false,
        message: `Minimum donation amount is £${AppConstants.MIN_DONATION_AMOUNT}`,
      };
    }
    
    if (amount > AppConstants.MAX_DONATION_AMOUNT) {
      return {
        isValid: false,
        message: `Maximum donation amount is £${AppConstants.MAX_DONATION_AMOUNT.toLocaleString()}`,
      };
    }
    
    return { isValid: true };
  },
  
  required: (value: string | undefined | null): boolean => {
    return !!value?.trim();
  },
  
  name: (name: string): boolean => {
    if (!name || !name.trim()) return false;
    if (name.trim().length < 2) return false;
    if (name.trim().length > 50) return false;
    return true;
  },
  
  address: (address: string): boolean => {
    if (!address || !address.trim()) return false;
    if (address.trim().length < 5) return false;
    if (address.trim().length > 100) return false;
    return true;
  },
};

// ================================
// ERROR MESSAGES
// ================================

export const ErrorMessages = {
  // Network & API
  NETWORK: 'Please check your internet connection and try again.',
  SERVER: 'Server error occurred. Please try again later.',
  TIMEOUT: 'Request timed out. Please try again.',
  AUTHENTICATION: 'Authentication failed. Please log in again.',
  
  // Payment
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  PAYMENT_CANCELLED: 'Payment was cancelled.',
  PAYMENT_SETUP_FAILED: 'Payment setup failed. Please contact support.',
  CARD_DECLINED: 'Your card was declined. Please try a different payment method.',
  
  // Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid UK phone number.',
  INVALID_POSTAL_CODE: 'Please enter a valid UK postal code.',
  
  // Cart & Donations
  CART_EMPTY: 'Your cart is empty. Please add items before checkout.',
  INVALID_AMOUNT: 'Please enter a valid donation amount.',
  GIFT_AID_ADDRESS_REQUIRED: 'Home address is required for Gift Aid.',
  MAX_CART_ITEMS: `Maximum ${AppConstants.MAX_CART_ITEMS} items allowed in cart.`,
  
  // Content
  CONTENT_LOAD_FAILED: 'Failed to load content. Please try again.',
  CONTENT_NOT_FOUND: 'Content not found.',
  
  // Generic
  UNKNOWN: 'Something went wrong. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please contact support.',
};

// ================================
// SUCCESS MESSAGES
// ================================

export const SuccessMessages = {
  LOGIN: 'Welcome back! You are now logged in.',
  LOGOUT: 'You have been logged out successfully.',
  REGISTRATION: 'Account created successfully! Welcome to ISKCON London.',
  PROFILE_UPDATED: 'Your profile has been updated successfully.',
  DONATION_SUCCESS: 'Thank you for your generous donation!',
  CART_UPDATED: 'Cart updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  CONTENT_REFRESHED: 'Content has been refreshed successfully.',
};

// ================================
// UTILITY FUNCTIONS
// ================================

export const formatCurrency = (amount: number, currency: string = AppConstants.DEFAULT_CURRENCY): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatEventDate = (startDate?: string, endDate?: string): string => {
  if (!startDate) return '';
  
  const start = new Date(startDate);
  const startFormatted = formatDateTime(startDate);
  
  if (!endDate) return startFormatted;
  
  const end = new Date(endDate);
  
  // Same day event
  if (start.toDateString() === end.toDateString()) {
    return `${formatDate(startDate)} ${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Multi-day event
  return `${startFormatted} - ${formatDateTime(endDate)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getEventTypeColor = (eventType?: string): string => {
  const colors = getEventTypeColors();
  return eventType ? colors[eventType as keyof typeof colors] || '#6c757d' : '#6c757d';
};

export const isExtendedEventType = (eventType?: string): boolean => {
  return eventType ? getExtendedEventTypes().includes(eventType) : false;
};

export const isSimpleEventType = (eventType?: string): boolean => {
  return eventType ? getSimpleEventTypes().includes(eventType) : false;
};

// ================================
// API ENDPOINTS BUILDER - Updated for Single Post Type
// ================================

export const getApiEndpoints = () => {
  const baseURL = AppConstants.API_BASE_URL;
  const namespace = '/wp-json/mobile-app/v2';
  const wpNamespace = '/wp-json/wp/v2';
  
  return {
    // System
    HEALTH: `${baseURL}${namespace}/system/health`,
    
    // Authentication
    LOGIN: `${baseURL}${namespace}/auth/login`,
    REGISTER: `${baseURL}${namespace}/auth/register`,
    REFRESH_TOKEN: `${baseURL}${namespace}/auth/refresh`,
    
    // User
    USER_PROFILE: `${baseURL}${namespace}/user/profile`,
    USER_DONATIONS: `${baseURL}${namespace}/user/donations`,
    USER_DEVICES: `${baseURL}${namespace}/user/devices`,
    
    // Donations
    DONATION_STATS: `${baseURL}${namespace}/donations/stats`,
    DONATION_RECEIPT: (id: number) => `${baseURL}${namespace}/donations/receipt/${id}`,
    CONTACT_MAPPING: `${baseURL}${namespace}/user/contact-mapping`,
    CIVICRM_STATUS: `${baseURL}${namespace}/civicrm/status`,
    
    // Payment
    PAYMENT_CONFIG: `${baseURL}${namespace}/payment/config`,
    PAYMENT_INTENT: `${baseURL}${namespace}/payment/intent`,
    PAYMENT_CONFIRM: (intentId: string) => `${baseURL}${namespace}/payment/confirm/${intentId}`,
    
    // Content - Updated for single post type system
    WORDPRESS_BASE: `${AppConstants.WORDPRESS_BASE_URL}${wpNamespace}`,
    ISKCON_POSTS: `${AppConstants.WORDPRESS_BASE_URL}${wpNamespace}/iskcon_post`,
    WORDPRESS_CATEGORIES: `${AppConstants.WORDPRESS_BASE_URL}${wpNamespace}/categories`,
    WORDPRESS_MEDIA: `${AppConstants.WORDPRESS_BASE_URL}${wpNamespace}/media`,
  };
  
};

export default AppConstants;

// Add these constants to your existing appConfig.ts

// ================================
// WORDPRESS EVENT TYPES - Constants for consistency
// ================================

// These are the exact values stored in _iskcon_event_type meta field
export const WORDPRESS_EVENT_TYPES = {
  EKADASI: 'ekadasi',
  FESTIVAL: 'festival', 
  COURSES: 'courses',
  GUEST_SPEAKER: 'guest_speaker',
  NEWS: 'news',
  BIO_LCVS_SPEAKER: 'bio_lcvs_speaker',
  BIO_RECENT_VIP: 'bio_recent_vip',
  BIO_TEAM_MEMBER: 'bio_team_member',
  DAILY_DARSHAN: 'daily_darshan'
} as const;

// Array of all event types for iteration
export const ALL_WORDPRESS_EVENT_TYPES = Object.values(WORDPRESS_EVENT_TYPES);

// Event types that have date/time fields (extended event data)
export const EXTENDED_EVENT_TYPES = [
  WORDPRESS_EVENT_TYPES.EKADASI,
  WORDPRESS_EVENT_TYPES.FESTIVAL,
  WORDPRESS_EVENT_TYPES.COURSES,
  WORDPRESS_EVENT_TYPES.GUEST_SPEAKER
];

// Event types that are simple (just title/content, no event fields)
export const SIMPLE_EVENT_TYPES = [
  WORDPRESS_EVENT_TYPES.BIO_LCVS_SPEAKER,
  WORDPRESS_EVENT_TYPES.BIO_RECENT_VIP,
  WORDPRESS_EVENT_TYPES.BIO_TEAM_MEMBER,
  WORDPRESS_EVENT_TYPES.DAILY_DARSHAN
];

// Mapping for display names
export const EVENT_TYPE_DISPLAY_NAMES = {
  [WORDPRESS_EVENT_TYPES.EKADASI]: 'Ekadasi',
  [WORDPRESS_EVENT_TYPES.FESTIVAL]: 'Festival',
  [WORDPRESS_EVENT_TYPES.COURSES]: 'Course',
  [WORDPRESS_EVENT_TYPES.GUEST_SPEAKER]: 'Guest Speaker',
  [WORDPRESS_EVENT_TYPES.NEWS]: 'News',
  [WORDPRESS_EVENT_TYPES.BIO_LCVS_SPEAKER]: 'LCVS Speaker',
  [WORDPRESS_EVENT_TYPES.BIO_RECENT_VIP]: 'Recent VIP',
  [WORDPRESS_EVENT_TYPES.BIO_TEAM_MEMBER]: 'Team Member',
  [WORDPRESS_EVENT_TYPES.DAILY_DARSHAN]: 'Daily Darshan'
} as const;

// Helper function to check if event type has extended fields
export const hasExtendedFields = (eventType?: string): boolean => {
  return eventType ? EXTENDED_EVENT_TYPES.includes(eventType as any) : false;
};

// Helper function to get display name
export const getEventTypeDisplayName = (eventType?: string): string => {
  if (!eventType) return 'Post';
  return EVENT_TYPE_DISPLAY_NAMES[eventType as keyof typeof EVENT_TYPE_DISPLAY_NAMES] || eventType;
};