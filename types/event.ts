// types/event.ts - SIMPLIFIED VERSION
// Reduced from 15+ interfaces to 5 essential ones

// ================================
// CORE EVENT TYPES
// ================================

export interface CiviEvent {
  id: number;
  title: string;
  summary?: string;
  description?: string;
  event_type_name: string;
  start_date: string;
  end_date?: string;
  max_participants?: number;
  current_participants?: number;
  is_active: boolean;
  is_monetary: boolean;
  is_online_registration: boolean;
  registration_start_date?: string;
  registration_end_date?: string;
  address?: {
    street_address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  image?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface EventFee {
  id: number;
  label: string;
  amount: number;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  max_participants?: number;
  description?: string;
}

export interface EventRegistrationItem {
  id: string;
  event_id: number;
  event_title: string;
  event_start_date: string;
  fee_id?: number;
  fee_label?: string;
  amount: number;
  quantity: number;
  total: number;
  participant_info?: ParticipantInfo;
}

export interface ParticipantInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  dietary_requirements?: string;
  emergency_contact?: string;
  special_needs?: string;
}

export interface EventCartTotals {
  subtotal: number;
  total: number;
  itemCount: number;
  registrationCount: number;
}

// ================================
// NAVIGATION TYPES
// ================================

export type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: EventRegistrationResult };
};

// ================================
// API RESPONSE TYPES (Simplified)
// ================================

export interface EventRegistrationResult {
  success: boolean;
  transaction_id: string;
  registration_timestamp: string;
  total_amount: number;
  registrations: Array<{
    id: number;
    event_id: number;
    event_title: string;
    fee_amount: number;
    status: string;
    confirmation_number: string;
  }>;
  user_message: string;
  requires_followup: boolean;
  error?: string;
}

// ================================
// SIMPLE FILTERS & STATUS
// ================================

export interface EventFilters {
  search?: string;
  limit?: number;
  offset?: number;
  show_past?: boolean;
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'full';
export type RegistrationStatus = 'confirmed' | 'pending' | 'cancelled';