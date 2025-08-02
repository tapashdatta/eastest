// types/donation.ts - Donation-specific types

export interface DonationCategory {
  id: string;
  title: string;
  description: string;
  image: string;
  icon_name: string;
  financial_type_id: number;
  suggested_amounts: number[];
  requires_date: boolean;
  requires_message: boolean;
  color: string;
}

export interface DonationItem {
  id: string;
  category: string;
  financial_type_id: number;
  amount: number;
  quantity: number;
  sponsorship_date?: string;
  message?: string;
  total: number;
}

export interface CartTotals {
  subtotal: number;
  giftAidAmount: number;
  total: number;
  itemCount: number;
  charityTotal: number;
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

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  transactionId?: string;
  contributions?: any[];
  totalAmount?: number;
  error?: string;
}

export interface ProcessedDonationResult {
  transaction_id: string;
  payment_timestamp: string;
  total_amount: number;
  gift_aid_total: number;
  contributions: any[];
  receipts?: {
    receipt_id: string;
    receipt_date: string;
    total_amount: number;
    email_sent: boolean;
  }[];
}

// Navigation types
export type DonationStackParamList = {
  Donate: undefined;
  Cart: undefined;
  Payment: undefined;
  Success: { result: ProcessedDonationResult };
};

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

// Payment processing states
export type PaymentStep = 
  | 'idle'
  | 'validating'
  | 'creating_intent'
  | 'initializing_sheet'
  | 'presenting_sheet'
  | 'confirming_payment'
  | 'complete'
  | 'error';

export interface PaymentState {
  step: PaymentStep;
  progress: number;
  message: string;
  error?: string;
}

// Gift Aid types
export interface GiftAidDeclaration {
  enabled: boolean;
  declaration_text: string;
  tax_rate: number;
  amount_benefit: number;
}