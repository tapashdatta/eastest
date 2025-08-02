// hooks/useEventRegistration.ts - SIMPLIFIED VERSION
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEventCart } from '@/contexts/EventContext';
import { eventAPI } from '@/services/EventAPI';
import { ParticipantInfo, EventRegistrationResult } from '@/types/event';

// ================================
// SIMPLIFIED TYPES
// ================================

interface RegistrationState {
  isProcessing: boolean;
  error: string | null;
  progress: number;
  message: string;
}

// ================================
// MAIN REGISTRATION HOOK
// ================================

export const useEventRegistration = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, cartTotals, clearCart } = useEventCart();
  
  const [state, setState] = useState<RegistrationState>({
    isProcessing: false,
    error: null,
    progress: 0,
    message: 'Ready to register',
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<RegistrationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Generate participant info from user
  const generateParticipantInfoFromUser = useCallback((): Partial<ParticipantInfo> => {
    if (!isAuthenticated || !user) return {};
    
    return {
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone: user.phone_primary || '',
    };
  }, [isAuthenticated, user]);

  // Main registration function
  const processEventRegistration = useCallback(async (
    participantInfo: ParticipantInfo
  ): Promise<EventRegistrationResult> => {
    
    try {
      updateState({ isProcessing: true, error: null, progress: 10, message: 'Validating...' });

      // Basic validation
      if (!cart || cart.length === 0) {
        throw new Error('Your cart is empty');
      }

      if (!participantInfo.first_name?.trim()) {
        throw new Error('First name is required');
      }

      if (!participantInfo.last_name?.trim()) {
        throw new Error('Last name is required');
      }

      if (!participantInfo.email?.trim()) {
        throw new Error('Email address is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(participantInfo.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Create registration intent
      updateState({ progress: 30, message: 'Setting up registration...' });
      
      const registrationData = {
        cart: cart.map(item => ({
          ...item,
          participant_info: participantInfo
        })),
        participant_info: participantInfo
      };

      const intentResponse = await eventAPI.createRegistrationIntent(registrationData);

      if (!intentResponse.success) {
        throw new Error(intentResponse.error || 'Registration setup failed');
      }

      // Process payment (simplified - assumes payment is handled elsewhere)
      updateState({ progress: 70, message: 'Processing payment...' });
      
      // For now, we'll simulate payment success
      // In real implementation, this would integrate with your payment system
      
      // Confirm registration
      updateState({ progress: 90, message: 'Confirming registration...' });
      
      const confirmationResponse = await eventAPI.confirmRegistration(
        intentResponse.payment_intent_id
      );

      // Success
      updateState({ progress: 100, message: 'Registration complete!' });
      
      clearCart();

      const result: EventRegistrationResult = {
        success: true,
        transaction_id: confirmationResponse.payment_intent_id,
        registration_timestamp: new Date().toISOString(),
        total_amount: confirmationResponse.amount,
        registrations: confirmationResponse.registrations || [],
        user_message: confirmationResponse.user_message || 'Registration successful!',
        requires_followup: confirmationResponse.requires_followup || false,
      };

      updateState({ isProcessing: false, progress: 0, message: 'Ready to register' });
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      updateState({ 
        isProcessing: false, 
        error: errorMessage, 
        progress: 0, 
        message: 'Registration failed' 
      });

      return {
        success: false,
        transaction_id: '',
        registration_timestamp: new Date().toISOString(),
        total_amount: 0,
        registrations: [],
        user_message: errorMessage,
        requires_followup: false,
        error: errorMessage,
      };
    }
  }, [cart, cartTotals, updateState, clearCart]);

  // Reset function
  const resetRegistration = useCallback(() => {
    setState({
      isProcessing: false,
      error: null,
      progress: 0,
      message: 'Ready to register',
    });
  }, []);

  return {
    // State
    isProcessing: state.isProcessing,
    error: state.error,
    progress: state.progress,
    message: state.message,
    
    // Cart info
    cart,
    cartTotals,
    
    // Actions
    processEventRegistration,
    resetRegistration,
    generateParticipantInfoFromUser,
    
    // User info
    isAuthenticated,
    user,
    
    // Helpers
    progressPercentage: state.progress,
    stepMessage: state.message,
    hasError: !!state.error,
    clearError: () => updateState({ error: null }),
  };
};

// ================================
// SIMPLIFIED FORM HOOK
// ================================

export const useEventRegistrationForm = () => {
  const { isAuthenticated, user } = useAuth();
  
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>(() => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone_primary || '',
    dietary_requirements: '',
    emergency_contact: '',
    special_needs: '',
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update field
  const updateParticipantInfo = useCallback((field: keyof ParticipantInfo, value: string) => {
    setParticipantInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!participantInfo.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!participantInfo.last_name?.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!participantInfo.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(participantInfo.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }, [participantInfo]);

  // Reset form
  const resetForm = useCallback(() => {
    setParticipantInfo({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone_primary || '',
      dietary_requirements: '',
      emergency_contact: '',
      special_needs: '',
    });
    setErrors({});
  }, [user]);

  return {
    participantInfo,
    updateParticipantInfo,
    validateForm,
    resetForm,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (field: keyof ParticipantInfo) => errors[field],
  };
};