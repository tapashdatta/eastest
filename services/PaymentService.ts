// services/PaymentService.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { wordPressAPI, PaymentConfig, DonationItem, DonorInfo, PaymentConfirmationResponse } from '@/services/WordPressAPI';
import { useAuth } from '@/contexts/AuthContext';
import Logger from '@/utils/Logger';

// ================================
// ENHANCED TYPES
// ================================

interface PaymentState {
  isReady: boolean;
  isInitializing: boolean; // New: track initialization state
  config: PaymentConfig | null;
  publishableKey: string;
  isProcessing: boolean;
  currentStep: string;
  error: string | null;
  initializationError: string | null; // New: separate initialization errors
}

// Enhanced result type with detailed status
interface ProcessPaymentResult {
  success: boolean;
  paymentIntentId?: string;
  
  // Status breakdown
  stripe_status: 'succeeded' | 'failed' | 'unknown';
  civicrm_status: 'completed' | 'pending' | 'failed' | 'retrying';
  
  // Results
  contributions?: any[];
  receipts?: any[];
  
  // User communication
  user_message: string;
  requires_followup: boolean;
  
  // Technical details
  error?: string;
  error_code?: string;
  civicrm_error?: string;
  amount?: number;
  currency?: string;
}

interface PaymentStep {
  step: string;
  message: string;
  progress: number;
}

// ================================
// ENHANCED PAYMENT SERVICE CLASS
// ================================

class PaymentService {
  private static instance: PaymentService;
  private config: PaymentConfig | null = null;
  private isReady: boolean = false;
  private isInitializing: boolean = false;
  private initializationError: string | null = null;
  private listeners: Set<(state: PaymentState) => void> = new Set();
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    // Start background initialization immediately when service is created
    this.initializeInBackground();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // New: Background initialization that starts immediately
  private async initializeInBackground(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      this.isInitializing = true;
      this.initializationError = null;
      this.notifyListeners();

      Logger.info('Payment service background initialization started...');
      
      const config = await wordPressAPI.getPaymentConfig();
      this.config = config;
      this.isReady = config.stripe_enabled && !!config.publishable_key;
      
      Logger.info('Payment service initialized successfully', {
        stripeEnabled: config.stripe_enabled,
        testMode: config.test_mode,
        currency: config.currency,
      });
    } catch (error) {
      Logger.error('Payment service initialization failed', error);
      this.isReady = false;
      this.initializationError = error instanceof Error ? error.message : 'Payment system initialization failed';
    } finally {
      this.isInitializing = false;
      this.notifyListeners();
    }
  }

  public async initialize(): Promise<void> {
    return this.initializationPromise || this.initializeInBackground();
  }

  private notifyListeners(): void {
    const state: PaymentState = {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      config: this.config,
      publishableKey: this.config?.publishable_key || '',
      isProcessing: false,
      currentStep: 'idle',
      error: null,
      initializationError: this.initializationError,
    };

    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        Logger.error('Payment service listener error', error);
      }
    });
  }

  public subscribe(listener: (state: PaymentState) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current state
    this.notifyListeners();
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getConfig(): PaymentConfig | null {
    return this.config;
  }

  public isServiceReady(): boolean {
    return this.isReady;
  }

  public isServiceInitializing(): boolean {
    return this.isInitializing;
  }

  public getInitializationError(): string | null {
    return this.initializationError;
  }

  public getPublishableKey(): string {
    return this.config?.publishable_key || '';
  }

  public async refreshConfig(): Promise<void> {
    this.initializationPromise = null;
    await this.initializeInBackground();
  }
}

// ================================
// ENHANCED PAYMENT HOOK
// ================================

export const usePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { isAuthenticated, user } = useAuth();
  
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isReady: false,
    isInitializing: true, // Start as initializing
    config: null,
    publishableKey: '',
    isProcessing: false,
    currentStep: 'idle',
    error: null,
    initializationError: null,
  });

  // Subscribe to payment service changes
  useEffect(() => {
    const paymentService = PaymentService.getInstance();
    
    const unsubscribe = paymentService.subscribe((state) => {
      setPaymentState(prevState => {
        if (JSON.stringify(prevState) === JSON.stringify(state)) {
          return prevState;
        }
        return state;
      });
    });

    return unsubscribe;
  }, []);

  const updateStep = useCallback((step: string, error?: string) => {
    setPaymentState(prev => ({
      ...prev,
      currentStep: step,
      error: error || null,
    }));
  }, []);

  // Enhanced payment processing with detailed status handling
  const processPayment = useCallback(async (
    cart: DonationItem[],
    donorInfo: DonorInfo,
    giftAidEnabled: boolean = false
  ): Promise<ProcessPaymentResult> => {
    
    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      // Step 1: Validate inputs
      updateStep('validating');
      
      if (!cart || cart.length === 0) {
        throw new Error('Cart is empty');
      }

      if (!donorInfo.first_name || !donorInfo.last_name || !donorInfo.email) {
        throw new Error('Please fill in all required donor information');
      }

      if (giftAidEnabled && (!donorInfo.street_address || !donorInfo.city || !donorInfo.postal_code)) {
        throw new Error('Address is required for Gift Aid');
      }

      Logger.info('Starting payment process', {
        itemCount: cart.length,
        giftAidEnabled,
        isAuthenticated,
      });

      // Step 2: Create Payment Intent
      updateStep('creating_intent');
      
      const paymentIntentResponse = await wordPressAPI.createPaymentIntent({
        cart,
        donor_info: donorInfo,
        gift_aid: giftAidEnabled ? 'yes' : 'no',
      });

      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.error || 'Failed to create payment intent');
      }

      Logger.info('Payment intent created', {
        paymentIntentId: paymentIntentResponse.payment_intent_id,
        amount: paymentIntentResponse.amount,
        giftAidEnabled,
      });

      // Step 3: Initialize Stripe Payment Sheet
      updateStep('initializing_sheet');

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'ISKCON London',
        paymentIntentClientSecret: paymentIntentResponse.client_secret,
        defaultBillingDetails: {
          name: `${donorInfo.first_name} ${donorInfo.last_name}`,
          email: donorInfo.email,
          phone: donorInfo.phone,
          address: giftAidEnabled ? {
            line1: donorInfo.street_address,
            city: donorInfo.city,
            postalCode: donorInfo.postal_code,
            country: donorInfo.country || 'GB',
          } : undefined,
        },
        appearance: {
          colors: {
            primary: '#FF6B35', // ISKCON orange
          },
        },
        returnURL: 'iskconlondon://payment-return',
      });

      if (initError) {
        Logger.error('Payment sheet initialization failed', initError);
        throw new Error('Payment setup failed. Please try again.');
      }

      // Step 4: Present Payment Sheet
      updateStep('presenting_sheet');

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          updateStep('idle');
          return {
            success: false,
            stripe_status: 'failed',
            civicrm_status: 'failed',
            user_message: 'Payment was cancelled.',
            requires_followup: false
          };
        }
        
        Logger.error('Payment presentation failed', paymentError);
        throw new Error(paymentError.message || 'Payment failed');
      }

      // Step 5: Confirm Payment on Server (Enhanced)
      updateStep('confirming_payment');

      const confirmationResponse = await wordPressAPI.confirmPayment(
        paymentIntentResponse.payment_intent_id
      );

      // Enhanced result handling
      Logger.info('Payment confirmation response', {
        success: confirmationResponse.success,
        stripe_status: confirmationResponse.stripe_status,
        civicrm_status: confirmationResponse.civicrm_status,
        user_message: confirmationResponse.user_message,
        requires_followup: confirmationResponse.requires_followup
      });

      updateStep('complete');

      // Return enhanced result
      const result: ProcessPaymentResult = {
        success: confirmationResponse.success,
        paymentIntentId: confirmationResponse.payment_intent_id,
        stripe_status: confirmationResponse.stripe_status,
        civicrm_status: confirmationResponse.civicrm_status,
        contributions: confirmationResponse.contributions || [],
        receipts: confirmationResponse.receipts || [],
        user_message: confirmationResponse.user_message,
        requires_followup: confirmationResponse.requires_followup,
        amount: confirmationResponse.amount,
        currency: confirmationResponse.currency,
        civicrm_error: confirmationResponse.civicrm_error
      };

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      Logger.error('Payment process failed', error);
      
      updateStep('idle', errorMessage);
      
      return {
        success: false,
        stripe_status: 'failed',
        civicrm_status: 'failed',
        user_message: 'Payment failed. Please try again.',
        requires_followup: false,
        error: errorMessage,
      };
    } finally {
      setPaymentState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [initPaymentSheet, presentPaymentSheet, isAuthenticated, updateStep]);

  const getStepInfo = useCallback((step?: string): PaymentStep => {
    const currentStep = step || paymentState.currentStep;
    const stepMap: Record<string, PaymentStep> = {
      idle: { step: 'idle', message: 'Ready to process payment', progress: 0 },
      validating: { step: 'validating', message: 'Validating payment details...', progress: 10 },
      creating_intent: { step: 'creating_intent', message: 'Setting up payment...', progress: 25 },
      initializing_sheet: { step: 'initializing_sheet', message: 'Preparing payment form...', progress: 50 },
      presenting_sheet: { step: 'presenting_sheet', message: 'Processing payment...', progress: 75 },
      confirming_payment: { step: 'confirming_payment', message: 'Confirming donation...', progress: 90 },
      complete: { step: 'complete', message: 'Payment completed!', progress: 100 },
    };

    return stepMap[currentStep] || stepMap.idle;
  }, [paymentState.currentStep]);

  const resetPayment = useCallback(() => {
    setPaymentState(prev => ({
      ...prev,
      isProcessing: false,
      currentStep: 'idle',
      error: null,
    }));
  }, []);

  // Enhanced return object with status helpers
  return useMemo(() => {
    const stepInfo = getStepInfo();
    
    return {
      // State
      isReady: paymentState.isReady,
      isInitializing: paymentState.isInitializing,
      config: paymentState.config,
      publishableKey: paymentState.publishableKey,
      isProcessing: paymentState.isProcessing,
      currentStep: paymentState.currentStep,
      error: paymentState.error,
      initializationError: paymentState.initializationError,
      
      // Actions
      processPayment,
      resetPayment,
      
      // Helpers
      getStepInfo: () => stepInfo,
      canMakePayments: paymentState.isReady && !!paymentState.publishableKey,
      isTestMode: paymentState.config?.test_mode || false,
      currency: paymentState.config?.currency || 'gbp',
      minAmount: paymentState.config?.min_amount || 100,
      maxAmount: paymentState.config?.max_amount || 5000000,
      
      // Progress info
      progressPercentage: stepInfo.progress,
      stepMessage: stepInfo.message,
      
      // Status helpers
      isIdle: paymentState.currentStep === 'idle',
      isValidating: paymentState.currentStep === 'validating',
      isCreatingIntent: paymentState.currentStep === 'creating_intent',
      isInitializingSheet: paymentState.currentStep === 'initializing_sheet',
      isPresentingSheet: paymentState.currentStep === 'presenting_sheet',
      isConfirmingPayment: paymentState.currentStep === 'confirming_payment',
      isComplete: paymentState.currentStep === 'complete',
      
      // New: System status helpers
      isDonationSystemReady: paymentState.isReady,
      isDonationSystemInitializing: paymentState.isInitializing,
      hasDonationSystemError: !!paymentState.initializationError,
      donationSystemStatus: paymentState.isInitializing 
        ? 'initializing' 
        : paymentState.isReady 
          ? 'ready' 
          : 'error',
    };
  }, [
    paymentState,
    processPayment,
    resetPayment,
    getStepInfo,
  ]);
};

// ================================
// ENHANCED PAYMENT CONFIG HOOK
// ================================

export const usePaymentConfig = () => {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paymentService = PaymentService.getInstance();
    
    const unsubscribe = paymentService.subscribe((state) => {
      setConfig(state.config);
      setIsLoading(state.isInitializing);
      setError(state.initializationError);
    });

    return unsubscribe;
  }, []);

  const refreshConfig = useCallback(async () => {
    const paymentService = PaymentService.getInstance();
    await paymentService.refreshConfig();
  }, []);

  return useMemo(() => ({
    config,
    isLoading,
    error,
    refreshConfig,
    isReady: !!config && config.stripe_enabled,
    publishableKey: config?.publishable_key || '',
  }), [config, isLoading, error, refreshConfig]);
};

// ================================
// NEW: DONATION SYSTEM STATUS HOOK
// ================================

export const useDonationSystemStatus = () => {
  const { 
    isDonationSystemReady, 
    isDonationSystemInitializing, 
    hasDonationSystemError,
    donationSystemStatus,
    initializationError 
  } = usePayment();

  return {
    isReady: isDonationSystemReady,
    isInitializing: isDonationSystemInitializing,
    hasError: hasDonationSystemError,
    status: donationSystemStatus,
    errorMessage: initializationError,
    
    // Helper methods
    canShowDonationUI: () => isDonationSystemReady || isDonationSystemInitializing,
    shouldShowError: () => hasDonationSystemError && !isDonationSystemInitializing,
    shouldShowLoading: () => isDonationSystemInitializing,
  };
};

// Export the singleton instance
export const paymentService = PaymentService.getInstance();