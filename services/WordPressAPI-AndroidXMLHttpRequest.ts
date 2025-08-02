// services/WordPressAPI.ts
//Implementing the XMLHttpRequest version probably reset React Native's internal networking state and cleared any stuck connections
//If donation system loading shows error try this
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ================================
// CONSOLIDATED TYPES - FIXED to match server exactly
// ================================

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  phone_primary: string; // FIXED: Single phone field to match server
  street_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  device_registered: boolean;
}

export interface DeviceInfo {
  device_id: string;
  device_name: string;
  device_type: string;
  os_name: string;
}

export interface DeviceResponse {
  device_id: string;
  device_name: string;
  device_type: string;
  os_name: string;
  last_seen: string;
  is_active: boolean;
  last_seen_human: string;
}

// FIXED: Donation item matching server response exactly
export interface DonationHistoryItem {
  id: number;
  date: string;
  amount: number;
  currency: string;
  purpose: string;
  financial_type: string;
  financial_type_id: number;
  receipt_id: string;
  status: string;
  source?: string;
  sponsorship_date?: string;
}

// FIXED: Stats matching server response exactly
export interface DonationStats {
  success: boolean;
  total_donations: number;
  total_amount: number;
  average_donation: number;
  last_donation_date?: string;
  recurring_donations: number;
}

export interface UserDonationsResponse {
  success: boolean;
  donations: DonationHistoryItem[];
  total_count: number;
  has_more: boolean;
}

export interface ContactMapping {
  success: boolean;
  has_mapping: boolean;
  mapping?: {
    contact_id: number;
    user_id: number;
    email: string;
  };
}

export interface CiviCRMStatus {
  success: boolean;
  status: string;
  version: string;
}

export interface ReceiptResponse {
  success: boolean;
  receipt_id?: string;
  sent_to?: string;
  sent_at?: string;
  contribution_id?: number;
  message: string;
  error?: string;
}

export interface PaymentConfig {
  stripe_enabled: boolean;
  publishable_key: string;
  test_mode: boolean;
  currency: string;
  min_amount: number;
  max_amount: number;
}

export interface DonationItem {
  category: string;
  financial_type_id: number;
  amount: number;
  quantity: number;
  sponsorship_date?: string;
  message?: string;
}

export interface DonorInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface PaymentIntentRequest {
  cart: DonationItem[];
  donor_info?: DonorInfo;
  gift_aid?: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  error?: string;
  error_code?: string;
}

// FIXED: Added missing civicrm_error property
export interface PaymentConfirmationResponse {
  success: boolean;
  payment_intent_id: string;
  stripe_status: 'succeeded' | 'failed' | 'unknown';
  amount: number;
  currency: string;
  civicrm_status: 'completed' | 'pending' | 'failed';
  contributions?: Array<{
    id: number;
    amount: number;
    receipt_sent: boolean;
  }>;
  receipts?: Array<{
    receipt_id: string;
    sent_to: string;
  }>;
  user_message: string;
  requires_followup: boolean;
  error?: string;
  civicrm_error?: string; // FIXED: Added missing property
}

// ================================
// REQUEST IMPLEMENTATION
// ================================

interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
  timeout: number;
}

// Use XMLHttpRequest for better Android compatibility
const robustRequest = (url: string, options: RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    const timeoutId = setTimeout(() => {
      xhr.abort();
      reject(new Error(`Request timeout after ${options.timeout}ms`));
    }, options.timeout);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        clearTimeout(timeoutId);
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else if (xhr.status === 0) {
          reject(new Error('Network connection failed'));
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText || 'Request failed'}`));
        }
      }
    };

    xhr.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Network error'));
    };

    xhr.onabort = () => {
      clearTimeout(timeoutId);
      reject(new Error('Request aborted'));
    };

    xhr.open(options.method, url, true);
    Object.keys(options.headers).forEach(key => {
      xhr.setRequestHeader(key, options.headers[key]);
    });
    xhr.send(options.body);
  });
};

// ================================
// WORDPRESS API SERVICE
// ================================

class WordPressAPIService {
  private baseURL: string;
  private apiKey: string;
  private jwtToken: string | null = null;
  private readonly API_TIMEOUT: number;
  
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_BASE_URL || '';
    this.apiKey = process.env.EXPO_PUBLIC_API_KEY || '';
    this.API_TIMEOUT = Platform.OS === 'android' ? 180000 : 30000;
    this.initializeFromStorage();
  }

  private async initializeFromStorage(): Promise<void> {
    try {
      const storedToken = await AsyncStorage.getItem('@jwt_token');
      if (storedToken) {
        this.jwtToken = storedToken;
      }
    } catch (error) {
      // Handle error silently in production
    }
  }

  private async storeToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@jwt_token', token);
      this.jwtToken = token;
    } catch (error) {
      // Handle error silently in production
    }
  }

  private async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@jwt_token');
      this.jwtToken = null;
    } catch (error) {
      // Handle error silently in production
    }
  }

  private getHeaders(useAuth: boolean = false): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (useAuth && this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    } else {
      headers['Authorization'] = `ApiKey ${this.apiKey}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuth: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}/wp-json/mobile-app/v2${endpoint}`;
    
    // Convert headers to Record<string, string> format
    const additionalHeaders: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          additionalHeaders[key] = value;
        });
      } else if (typeof options.headers === 'object') {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            additionalHeaders[key] = value;
          }
        });
      }
    }
    
    const requestOptions: RequestOptions = {
      method: options.method as string || 'GET',
      headers: {
        ...this.getHeaders(useAuth),
        ...additionalHeaders,
      },
      body: options.body as string,
      timeout: this.API_TIMEOUT,
    };

    try {
      const data = await robustRequest(url, requestOptions);

      if (data.status === 401 && useAuth) {
        await this.clearToken();
        throw new Error('Authentication expired. Please log in again.');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // ================================
  // AUTHENTICATION
  // ================================

  async login(credentials: {
    email: string;
    password: string;
    device_info?: DeviceInfo;
  }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.token) {
      await this.storeToken(response.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    device_info?: DeviceInfo;
  }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.token) {
      await this.storeToken(response.token);
    }

    return response;
  }

  async refreshToken(): Promise<{ success: boolean; token: string; user: User }> {
    const response = await this.request<{ success: boolean; token: string; user: User }>('/auth/refresh', {
      method: 'POST',
    }, true);

    if (response.success && response.token) {
      await this.storeToken(response.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  // ================================
  // USER PROFILE
  // ================================

  async getProfile(): Promise<User> {
    const response = await this.request<User>('/user/profile', { method: 'GET' }, true);
    return response;
  }

  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user: User }> {
    const response = await this.request<{ success: boolean; user: User }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, true);

    return response;
  }

  // ================================
  // DONATIONS - SIMPLIFIED AND FIXED
  // ================================

  async getUserDonations(params: {
    limit?: number;
    offset?: number;
  } = {}): Promise<UserDonationsResponse> {
    const query = new URLSearchParams({
      limit: String(params.limit || 25),
      offset: String(params.offset || 0)
    }).toString();
    
    const endpoint = `/user/donations?${query}`;
    
    const response = await this.request<UserDonationsResponse>(endpoint, { method: 'GET' }, true);

    return response;
  }

  async getDonationStats(): Promise<DonationStats> {
    const response = await this.request<DonationStats>('/donations/stats', { method: 'GET' }, true);
    return response;
  }

  async sendReceipt(contributionId: number, donorName: string): Promise<ReceiptResponse> {
    const response = await this.request<ReceiptResponse>(`/donations/receipt/${contributionId}`, {
      method: 'POST',
      body: JSON.stringify({ donor_name: donorName }),
    }, true);

    return response;
  }

  async getContactMapping(): Promise<ContactMapping> {
    return this.request<ContactMapping>('/user/contact-mapping', { method: 'GET' }, true);
  }

  async getCiviCRMStatus(): Promise<CiviCRMStatus> {
    return this.request<CiviCRMStatus>('/civicrm/status', { method: 'GET' });
  }

  // ================================
  // CONNECTION TEST
  // ================================

  async testConnection(): Promise<{ success: boolean; details?: any }> {
    try {
      const response = await this.request<{ status: string; version: string; timestamp: string }>('/system/health');
      return {
        success: true,
        details: response
      };
    } catch (error) {
      return {
        success: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  // ================================
  // DEVICES
  // ================================

  async getUserDevices(): Promise<DeviceResponse[]> {
    const response = await this.request<{ success: boolean; devices: DeviceResponse[] }>('/user/devices', { 
      method: 'GET' 
    }, true);
    
    return response.success ? response.devices : [];
  }

  async registerDevice(deviceInfo: DeviceInfo): Promise<{ success: boolean; action: string; device_id: string }> {
    return this.request<{ success: boolean; action: string; device_id: string }>('/user/devices', {
      method: 'POST',
      body: JSON.stringify(deviceInfo),
    }, true);
  }

  async deactivateDevice(deviceId: string): Promise<{ success: boolean; affected_rows: number }> {
    return this.request<{ success: boolean; affected_rows: number }>(`/user/devices/${deviceId}`, {
      method: 'DELETE',
    }, true);
  }

  // ================================
  // PAYMENTS
  // ================================

  async getPaymentConfig(): Promise<PaymentConfig> {
    return this.request<PaymentConfig>('/payment/config');
  }

  async createPaymentIntent(cartData: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const useAuth = this.isAuthenticated();
    
    try {
      return await this.request<PaymentIntentResponse>('/payment/intent', {
        method: 'POST',
        body: JSON.stringify(cartData),
      }, useAuth);
    } catch (error) {
      return {
        success: false,
        payment_intent_id: '',
        client_secret: '',
        amount: 0,
        currency: 'gbp',
        error: error instanceof Error ? error.message : 'Payment setup failed',
        error_code: 'PAYMENT_INTENT_FAILED'
      };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentConfirmationResponse> {
    const useAuth = this.isAuthenticated();
    
    try {
      return await this.request<PaymentConfirmationResponse>(`/payment/confirm/${paymentIntentId}`, {
        method: 'POST',
      }, useAuth);
    } catch (error) {
      return {
        success: false,
        payment_intent_id: paymentIntentId,
        stripe_status: 'failed',
        civicrm_status: 'failed',
        amount: 0,
        currency: 'gbp',
        user_message: 'Payment confirmation failed. Please contact support if your payment was charged.',
        requires_followup: true,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      };
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  isAuthenticated(): boolean {
    return !!this.jwtToken;
  }

  getCurrentToken(): string | null {
    return this.jwtToken;
  }
}

// Export singleton instance
export const wordPressAPI = new WordPressAPIService();