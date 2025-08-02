// hooks/useDonation.ts
import React, { useState, useCallback, useMemo } from 'react';
import { usePayment } from '@/services/PaymentService';
import { useAuth } from '@/contexts/AuthContext';
import { useDonationCart } from '@/contexts/DonationContext';
import { DonorInfo } from '@/services/WordPressAPI';

// ================================
// ENHANCED TYPES
// ================================

export interface ProcessedDonationResult {
  transaction_id: string;
  payment_timestamp: string;
  total_amount: number;
  gift_aid_total: number;
  
  // Enhanced status information
  stripe_status: 'succeeded' | 'failed' | 'unknown';
  civicrm_status: 'completed' | 'pending' | 'failed' | 'retrying';
  
  // Results
  contributions: any[];
  receipts?: {
    receipt_id: string;
    receipt_date: string;
    total_amount: number;
    email_sent: boolean;
  }[];
  
  // User communication
  user_message: string;
  requires_followup: boolean;
  show_warning: boolean;
  success_type: 'full' | 'partial' | 'failed';
  
  // Technical details
  civicrm_error?: string;
  civicrm_attempts?: number;
}

interface DonationError {
  success: false;
  error: string;
  error_code?: string;
  user_message: string;
  requires_followup: boolean;
}

type DonationResult = ProcessedDonationResult | DonationError;

interface DonationState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  stepMessage: string;
  error: string | null;
}

// ================================
// MAIN DONATION PAYMENT HOOK
// ================================

export const useDonation = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, cartTotals, clearCart, giftAidEnabled } = useDonationCart();
  const { 
    processPayment, 
    isProcessing, 
    currentStep, 
    error: paymentError,
    resetPayment,
    canMakePayments,
    isReady: paymentSystemReady 
  } = usePayment();

  const [donationState, setDonationState] = useState<DonationState>({
    isProcessing: false,
    currentStep: 'idle',
    progress: 0,
    stepMessage: 'Ready to process donation',
    error: null,
  });

  const getStepInfo = useCallback((step: string = currentStep) => {
    const stepMap: Record<string, { progress: number; message: string }> = {
      idle: { progress: 0, message: 'Ready to process donation' },
      validating: { progress: 10, message: 'Validating payment details...' },
      creating_intent: { progress: 25, message: 'Setting up payment...' },
      initializing_sheet: { progress: 50, message: 'Preparing payment form...' },
      presenting_sheet: { progress: 75, message: 'Processing payment...' },
      confirming_payment: { progress: 90, message: 'Confirming donation...' },
      complete: { progress: 100, message: 'Payment completed!' },
    };
    return stepMap[step] || stepMap.idle;
  }, [currentStep]);

  React.useEffect(() => {
    const stepInfo = getStepInfo();
    setDonationState(prev => {
      if (prev.isProcessing === isProcessing && 
          prev.currentStep === currentStep && 
          prev.error === paymentError &&
          prev.progress === stepInfo.progress &&
          prev.stepMessage === stepInfo.message) {
        return prev;
      }
      
      return {
        isProcessing,
        currentStep,
        progress: stepInfo.progress,
        stepMessage: stepInfo.message,
        error: paymentError,
      };
    });
  }, [isProcessing, currentStep, paymentError, getStepInfo]);

  const calculateGiftAidBenefit = useCallback((amount: number): number => {
    return Math.round(amount * 0.25 * 100) / 100;
  }, []);

  const generateDonorInfoFromUser = useCallback((): Partial<DonorInfo> => {
    if (!isAuthenticated || !user) {
      return {};
    }

    return {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone_primary || '',
      street_address: user.street_address || '',
      city: user.city || '',
      postal_code: user.postal_code || '',
      country: user.country || 'United Kingdom',
    };
  }, [isAuthenticated, user]);

  const processDonation = useCallback(async (
    donorInfo: DonorInfo,
    giftAidEnabledFromContext: boolean = false
  ): Promise<DonationResult> => {
    
    try {
      // Validate payment system is ready
      if (!paymentSystemReady || !canMakePayments) {
        return {
          success: false,
          error: 'Payment system is not available. Please contact support.',
          user_message: 'Payment system is currently unavailable. Please try again later or contact support.',
          requires_followup: true
        };
      }

      // Validate cart
      if (!cart || cart.length === 0) {
        return {
          success: false,
          error: 'Your cart is empty. Please add items before donating.',
          user_message: 'Your cart is empty. Please add items before proceeding.',
          requires_followup: false
        };
      }

      if (cartTotals.total <= 0) {
        return {
          success: false,
          error: 'Invalid donation amount. Please check your cart.',
          user_message: 'Invalid donation amount. Please check your cart.',
          requires_followup: false
        };
      }

      // Validate donor information
      if (!donorInfo.first_name?.trim()) {
        return { 
          success: false, 
          error: 'First name is required',
          user_message: 'Please enter your first name.',
          requires_followup: false
        };
      }

      if (!donorInfo.last_name?.trim()) {
        return { 
          success: false, 
          error: 'Last name is required',
          user_message: 'Please enter your last name.',
          requires_followup: false
        };
      }

      if (!donorInfo.email?.trim()) {
        return { 
          success: false, 
          error: 'Email address is required',
          user_message: 'Please enter your email address.',
          requires_followup: false
        };
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(donorInfo.email)) {
        return { 
          success: false, 
          error: 'Please enter a valid email address',
          user_message: 'Please enter a valid email address.',
          requires_followup: false
        };
      }

      // Gift Aid validation
      if (giftAidEnabledFromContext) {
        if (!donorInfo.street_address?.trim()) {
          return { 
            success: false, 
            error: 'Home address is required for Gift Aid',
            user_message: 'Home address is required for Gift Aid. Please enter your address or disable Gift Aid.',
            requires_followup: false
          };
        }
        if (!donorInfo.city?.trim()) {
          return { 
            success: false, 
            error: 'City is required for Gift Aid',
            user_message: 'City is required for Gift Aid. Please enter your city or disable Gift Aid.',
            requires_followup: false
          };
        }
        if (!donorInfo.postal_code?.trim()) {
          return { 
            success: false, 
            error: 'Postal code is required for Gift Aid',
            user_message: 'Postal code is required for Gift Aid. Please enter your postal code or disable Gift Aid.',
            requires_followup: false
          };
        }
      }

      // Process payment using enhanced Payment service
      const paymentResult = await processPayment(cart, donorInfo, giftAidEnabledFromContext);

      if (!paymentResult.success) {
        return {
          success: false,
          error: paymentResult.error || 'Payment failed',
          error_code: paymentResult.error_code,
          user_message: paymentResult.user_message,
          requires_followup: paymentResult.requires_followup
        };
      }

      // Clear cart after successful payment (Stripe succeeded)
      clearCart();

      // Determine success type for UI
      let success_type: 'full' | 'partial' | 'failed' = 'failed';
      let show_warning = false;

      if (paymentResult.stripe_status === 'succeeded') {
        if (paymentResult.civicrm_status === 'completed') {
          success_type = 'full';
          show_warning = false;
        } else if (paymentResult.civicrm_status === 'pending') {
          success_type = 'partial';
          show_warning = true;
        } else {
          success_type = 'partial';
          show_warning = true;
        }
      }

      // Return enhanced result
      const result: ProcessedDonationResult = {
        transaction_id: paymentResult.paymentIntentId || 'unknown',
        payment_timestamp: new Date().toISOString(),
        total_amount: cartTotals.total,
        gift_aid_total: giftAidEnabledFromContext ? calculateGiftAidBenefit(cartTotals.total) : 0,
        
        // Enhanced status
        stripe_status: paymentResult.stripe_status,
        civicrm_status: paymentResult.civicrm_status,
        
        // Results
        contributions: paymentResult.contributions || [],
        receipts: paymentResult.receipts || [],
        
        // User communication
        user_message: paymentResult.user_message,
        requires_followup: paymentResult.requires_followup,
        show_warning,
        success_type,
        
        // Technical details
        civicrm_error: paymentResult.civicrm_error,
        civicrm_attempts: paymentResult.civicrm_status === 'pending' ? 1 : 0
      };

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Donation failed';

      return {
        success: false,
        error: errorMessage,
        user_message: 'Something went wrong during payment processing. Please try again.',
        requires_followup: false
      };
    }
  }, [
    cart,
    cartTotals,
    isAuthenticated,
    paymentSystemReady,
    canMakePayments,
    processPayment,
    clearCart,
    calculateGiftAidBenefit,
  ]);

  const resetDonation = useCallback(() => {
    resetPayment();
    setDonationState({
      isProcessing: false,
      currentStep: 'idle',
      progress: 0,
      stepMessage: 'Ready to process donation',
      error: null,
    });
  }, [resetPayment]);

  return useMemo(() => ({
    // State
    ...donationState,
    paymentSystemReady,
    canMakePayments,
    
    // Cart info
    cart,
    cartTotals,
    
    // Actions
    processDonation,
    resetDonation,
    
    // Helpers
    generateDonorInfoFromUser,
    calculateGiftAidBenefit,
    
    // User info
    isAuthenticated,
    user,
    
    // Step information
    getStepMessage: () => donationState.stepMessage,
    getProgressPercentage: () => donationState.progress,
    
    // Status checks
    isIdle: donationState.currentStep === 'idle',
    isValidating: donationState.currentStep === 'validating',
    isCreatingIntent: donationState.currentStep === 'creating_intent',
    isInitializingSheet: donationState.currentStep === 'initializing_sheet',
    isPresentingSheet: donationState.currentStep === 'presenting_sheet',
    isConfirmingPayment: donationState.currentStep === 'confirming_payment',
    isComplete: donationState.currentStep === 'complete',
    
    // Error handling
    hasError: !!donationState.error,
    clearError: () => setDonationState(prev => ({ ...prev, error: null })),

    // Progress info
    progressPercentage: donationState.progress,
    stepMessage: donationState.stepMessage,
  }), [
    donationState,
    paymentSystemReady,
    canMakePayments,
    cart,
    cartTotals,
    processDonation,
    resetDonation,
    generateDonorInfoFromUser,
    calculateGiftAidBenefit,
    isAuthenticated,
    user,
  ]);
};

// ================================
// DONATION FORM HOOK
// ================================

export const useDonationForm = () => {
  const { isAuthenticated, user } = useAuth();
  
  const generateDonorInfoFromUser = useCallback((): Partial<DonorInfo> => {
    if (!isAuthenticated || !user) {
      return {};
    }

    return {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone_primary || '',
      street_address: user.street_address || '',
      city: user.city || '',
      postal_code: user.postal_code || '',
      country: user.country || 'United Kingdom',
    };
  }, [isAuthenticated, user]);

  const [donorInfo, setDonorInfo] = useState<DonorInfo>(() => {
    const defaultInfo: DonorInfo = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      street_address: '',
      city: '',
      postal_code: '',
      country: 'United Kingdom',
    };

    if (isAuthenticated && user) {
      return { ...defaultInfo, ...generateDonorInfoFromUser() };
    }

    return defaultInfo;
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const calculateGiftAidBenefit = useCallback((amount: number): number => {
    return Math.round(amount * 0.25 * 100) / 100;
  }, []);

  const updateDonorInfo = useCallback((field: keyof DonorInfo, value: string) => {
    setDonorInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formErrors]);

  const validateForm = useCallback((giftAidEnabled: boolean = false): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!donorInfo.first_name?.trim()) {
      errors.first_name = 'First name is required';
    }

    if (!donorInfo.last_name?.trim()) {
      errors.last_name = 'Last name is required';
    }

    if (!donorInfo.email?.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(donorInfo.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Gift Aid validation
    if (giftAidEnabled) {
      if (!donorInfo.street_address?.trim()) {
        errors.street_address = 'Home address is required for Gift Aid';
      }
      if (!donorInfo.city?.trim()) {
        errors.city = 'City is required for Gift Aid';
      }
      if (!donorInfo.postal_code?.trim()) {
        errors.postal_code = 'Postal code is required for Gift Aid';
      }
    }

    setFormErrors(errors);
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [donorInfo]);

  const resetForm = useCallback(() => {
    const defaultInfo: DonorInfo = {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      street_address: '',
      city: '',
      postal_code: '',
      country: 'United Kingdom',
    };

    if (isAuthenticated && user) {
      setDonorInfo({
        ...defaultInfo,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone_primary || '',
        street_address: user.street_address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        country: user.country || 'United Kingdom',
      });
    } else {
      setDonorInfo(defaultInfo);
    }

    setFormErrors({});
  }, [isAuthenticated, user]);

  return useMemo(() => ({
    // Form data
    donorInfo,
    formErrors,
    
    // Actions
    updateDonorInfo,
    validateForm,
    resetForm,
    
    // Validation
    hasErrors: Object.keys(formErrors).length > 0,
    getFieldError: (field: keyof DonorInfo) => formErrors[field],
    
    // Helpers
    isFormValid: (giftAidEnabled: boolean = false) => validateForm(giftAidEnabled).isValid,
    calculateGiftAidBenefit,
  }), [
    donorInfo,
    formErrors,
    updateDonorInfo,
    validateForm,
    resetForm,
    calculateGiftAidBenefit,
  ]);
};