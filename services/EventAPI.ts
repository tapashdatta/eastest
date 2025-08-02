// services/EventAPI.ts - CLEAN VERSION
import { wordPressAPI } from '@/services/WordPressAPI';
import { CiviEvent, EventFee, EventRegistrationItem, ParticipantInfo } from '@/types/event';
import Logger from '@/utils/Logger';

// ================================
// CLEAN TYPES
// ================================

interface EventListResponse {
  success: boolean;
  events: CiviEvent[];
  total_count: number;
  error?: string;
}

interface EventDetailsResponse {
  success: boolean;
  event: CiviEvent;
  error?: string;
}

interface EventFeesResponse {
  success: boolean;
  fees: EventFee[];
  error?: string;
}

interface RegistrationIntentResponse {
  success: boolean;
  payment_intent_id: string;
  client_secret: string;
  amount: number;
  currency: string;
  error?: string;
}

interface RegistrationConfirmResponse {
  success: boolean;
  payment_intent_id: string;
  stripe_status: 'succeeded' | 'failed' | 'unknown';
  registration_status: 'completed' | 'pending' | 'failed';
  amount: number;
  currency: string;
  registrations?: any[];
  receipts?: any[];
  user_message: string;
  requires_followup: boolean;
  error?: string;
}

interface EventFilters {
  limit?: number;
  offset?: number;
  event_type_id?: number;
  search?: string;
  show_past?: boolean;
}

// ================================
// CLEAN EVENT API SERVICE
// ================================

class EventAPIService {
  private baseEndpoint = '/wp-json/mobile-app/v2';

  /**
   * Get events with simple filtering
   */
  async getEvents(filters: EventFilters = {}): Promise<EventListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Only add defined filters
      if (filters.limit) queryParams.append('limit', String(filters.limit));
      if (filters.offset) queryParams.append('offset', String(filters.offset));
      if (filters.event_type_id) queryParams.append('event_type_id', String(filters.event_type_id));
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.show_past) queryParams.append('show_past', 'true');
      
      const endpoint = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest<EventListResponse>(endpoint, 'GET');
      
      Logger.info('Events fetched', { count: response.events?.length || 0 });
      return response;
    } catch (error) {
      Logger.error('Failed to fetch events', error);
      return {
        success: false,
        events: [],
        total_count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch events'
      };
    }
  }

  /**
   * Get single event details
   */
  async getEventDetails(eventId: number): Promise<EventDetailsResponse> {
    try {
      const response = await this.makeRequest<EventDetailsResponse>(`/events/${eventId}`, 'GET');
      Logger.info('Event details fetched', { eventId, title: response.event?.title });
      return response;
    } catch (error) {
      Logger.error('Failed to fetch event details', error);
      return {
        success: false,
        event: {} as CiviEvent,
        error: error instanceof Error ? error.message : 'Failed to fetch event details'
      };
    }
  }

  /**
   * Get event fees
   */
  async getEventFees(eventId: number): Promise<EventFeesResponse> {
    try {
      const response = await this.makeRequest<EventFeesResponse>(`/events/${eventId}/fees`, 'GET');
      Logger.info('Event fees fetched', { eventId, count: response.fees?.length || 0 });
      return response;
    } catch (error) {
      Logger.error('Failed to fetch event fees', error);
      return {
        success: false,
        fees: [],
        error: error instanceof Error ? error.message : 'Failed to fetch event fees'
      };
    }
  }

  /**
   * Create registration intent (delegates to payment system)
   */
  async createRegistrationIntent(registrationData: {
    cart: EventRegistrationItem[];
    participant_info?: ParticipantInfo;
  }): Promise<RegistrationIntentResponse> {
    try {
      Logger.info('Creating registration intent', { items: registrationData.cart.length });

      const response = await this.makeRequest<RegistrationIntentResponse>(
        '/event-registration/intent',
        'POST',
        registrationData
      );

      if (response.success) {
        Logger.info('Registration intent created', { 
          paymentIntentId: response.payment_intent_id,
          amount: response.amount 
        });
      }

      return response;
    } catch (error) {
      Logger.error('Failed to create registration intent', error);
      return {
        success: false,
        payment_intent_id: '',
        client_secret: '',
        amount: 0,
        currency: 'gbp',
        error: error instanceof Error ? error.message : 'Registration setup failed'
      };
    }
  }

  /**
   * Confirm registration (delegates to payment system)
   */
  async confirmRegistration(paymentIntentId: string): Promise<RegistrationConfirmResponse> {
    try {
      Logger.info('Confirming registration', { paymentIntentId });

      const response = await this.makeRequest<RegistrationConfirmResponse>(
        `/event-registration/confirm/${paymentIntentId}`,
        'POST'
      );

      Logger.info('Registration confirmed', {
        success: response.success,
        stripeStatus: response.stripe_status,
        registrationStatus: response.registration_status
      });

      return response;
    } catch (error) {
      Logger.error('Failed to confirm registration', error);
      return {
        success: false,
        payment_intent_id: paymentIntentId,
        stripe_status: 'failed',
        registration_status: 'failed',
        amount: 0,
        currency: 'gbp',
        user_message: 'Registration failed. Please try again or contact support.',
        requires_followup: true,
        error: error instanceof Error ? error.message : 'Registration confirmation failed'
      };
    }
  }

  /**
   * Get user's registrations
   */
  async getUserRegistrations(params: { limit?: number; offset?: number } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        limit: String(params.limit || 25),
        offset: String(params.offset || 0)
      });

      const response = await this.makeRequest<any>(
        `/user/event-registrations?${queryParams.toString()}`,
        'GET'
      );

      Logger.info('User registrations fetched', { count: response.registrations?.length || 0 });
      return response;
    } catch (error) {
      Logger.error('Failed to fetch user registrations', error);
      return {
        success: false,
        registrations: [],
        total_count: 0,
        has_more: false,
        error: error instanceof Error ? error.message : 'Failed to fetch registrations'
      };
    }
  }

  /**
   * Get event types
   */
  async getEventTypes(): Promise<any> {
    try {
      const response = await this.makeRequest<any>('/event-types', 'GET');
      Logger.info('Event types fetched', { count: response.event_types?.length || 0 });
      return response;
    } catch (error) {
      Logger.error('Failed to fetch event types', error);
      return {
        success: false,
        event_types: [
          { id: 1, name: 'General Event', color: '#667eea' },
          { id: 2, name: 'Workshop', color: '#f093fb' },
          { id: 3, name: 'Festival', color: '#4facfe' },
          { id: 4, name: 'Course', color: '#43e97b' }
        ]
      };
    }
  }

  /**
   * Generic request method (simplified)
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<T> {
    const url = `${this.baseEndpoint}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication
    const token = wordPressAPI.getCurrentToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const apiKey = process.env.EXPO_PUBLIC_API_KEY;
      if (apiKey) {
        headers['Authorization'] = `ApiKey ${apiKey}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }
}

// Export singleton
export const eventAPI = new EventAPIService();
export default eventAPI;