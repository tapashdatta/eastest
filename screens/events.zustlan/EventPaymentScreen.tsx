// screens/events/EventPaymentScreen.tsx - Modern React 19 Implementation
import React, { useState, useEffect, useTransition, useDeferredValue, Suspense, use } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { useEventStore } from '@/stores/eventStore';
import { useEventRegistration, useRegistrationForm } from '@/hooks/useEventRegistration';
import { formatDate } from '@/utils/dateUtils';
import { 
  ArrowLeft, 
  CreditCard, 
  Users, 
  Calendar, 
  Clock, 
  Ticket,
  CheckCircle,
  AlertCircle,
  Loader,
  User,
  Mail,
  Phone,
  MapPin,
  Home
} from 'lucide-react-native';
import { TextInput } from 'react-native';

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: any };
};

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// ================================
// MODERN FORM COMPONENTS WITH REACT 19
// ================================

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  error?: string;
  required?: boolean;
  multiline?: boolean;
}

const FormField: React.FC<FormFieldProps> = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  icon, 
  keyboardType = 'default',
  error,
  required = false,
  multiline = false
}) => {
  const [isPending, startTransition] = useTransition();
  
  const handleChangeText = (text: string) => {
    startTransition(() => {
      onChangeText(text);
    });
  };

  return (
    <View style={styles.formField}>
      <LabelText style={styles.fieldLabel}>
        {label} {required && <CaptionText style={styles.required}>*</CaptionText>}
      </LabelText>
      <View style={[styles.fieldContainer, error && styles.fieldError]}>
        {icon && <View style={styles.fieldIcon}>{icon}</View>}
        <TextInput
          style={[
            styles.textInput, 
            multiline && styles.textInputMultiline,
            isPending && styles.textInputPending
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          editable={!isPending}
        />
        {isPending && (
          <View style={styles.loadingIndicator}>
            <Loader size={16} color={Colors.primary} />
          </View>
        )}
      </View>
      {error && <CaptionText style={styles.fieldErrorText}>{error}</CaptionText>}
    </View>
  );
});

FormField.displayName = 'FormField';

// ================================
// LOADING COMPONENTS FOR SUSPENSE
// ================================

const OrderSummaryFallback = () => (
  <View style={styles.orderSummary}>
    <View style={styles.loadingOrderSummary}>
      <Loader size={24} color={Colors.primary} />
      <CaptionText style={styles.loadingText}>Loading order summary...</CaptionText>
    </View>
  </View>
);

const ProgressBarFallback = () => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: '0%' }]} />
    </View>
    <CaptionText style={styles.progressText}>Initializing...</CaptionText>
  </View>
);

// ================================
// MAIN COMPONENT WITH REACT 19 FEATURES
// ================================

const EventPaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cart, cartTotals } = useEventStore();
  
  // React 19 concurrent features
  const [isPending, startTransition] = useTransition();
  const deferredCart = useDeferredValue(cart);
  
  // Modern hooks
  const { 
    isProcessing, 
    processRegistration,
    resetRegistration,
    generateDefaultParticipantInfo,
    progress,
    stepMessage,
    isAuthenticated,
    user
  } = useEventRegistration();
  
  const {
    participantInfo,
    updateField,
    validate,
    hasErrors,
    getError,
    reset,
    isSubmitting
  } = useRegistrationForm();

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Check cart with React 19 effect
  useEffect(() => {
    if (deferredCart.length === 0) {
      startTransition(() => {
        navigation.navigate('Events');
      });
    }
  }, [deferredCart.length, navigation]);

  // Handle back press with concurrent features
  const handleBackPress = () => {
    if (isProcessing || isSubmitting) {
      Alert.alert(
        'Payment in Progress',
        'Please wait for the current payment to complete.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.goBack();
  };

  // Modern payment processing
  const handlePayment = async () => {
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions to proceed.');
      return;
    }

    const isValid = validate();
    if (!isValid) {
      Alert.alert('Form Incomplete', 'Please fill in all required fields.');
      return;
    }

    try {
      const result = await processRegistration(participantInfo);
      
      if (result.success) {
        startTransition(() => {
          navigation.navigate('EventSuccess', { result });
        });
      } else {
        Alert.alert(
          'Registration Failed',
          result.user_message || 'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Registration Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Modern order summary with Suspense
  const OrderSummaryComponent = () => {
    // Use deferred cart for better performance
    const cartItems = deferredCart;
    
    return (
      <View style={styles.orderSummary}>
        <TitleText style={styles.sectionTitle}>Order Summary</TitleText>
        
        {cartItems.map((item) => (
          <View key={item.id} style={styles.summaryItem}>
            <View style={styles.summaryItemContent}>
              <BodyText style={styles.summaryItemTitle} numberOfLines={2}>
                {item.event_title}
              </BodyText>
              <View style={styles.summaryItemDetails}>
                <View style={styles.summaryItemDetail}>
                  <Calendar size={12} color={Colors.textSecondary} />
                  <CaptionText style={styles.summaryItemDetailText}>
                    {formatDate(new Date(item.event_start_date), { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </CaptionText>
                </View>
                <View style={styles.summaryItemDetail}>
                  <Clock size={12} color={Colors.textSecondary} />
                  <CaptionText style={styles.summaryItemDetailText}>
                    {new Date(item.event_start_date).toLocaleTimeString('en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </CaptionText>
                </View>
              </View>
              {item.fee_label && (
                <View style={styles.feeTag}>
                  <Ticket size={12} color={Colors.primary} />
                  <CaptionText style={styles.feeTagText}>{item.fee_label}</CaptionText>
                </View>
              )}
            </View>
            <View style={styles.summaryItemPrice}>
              <TitleText style={styles.itemPrice}>£{item.total.toFixed(2)}</TitleText>
              <CaptionText style={styles.itemQuantity}>x{item.quantity}</CaptionText>
            </View>
          </View>
        ))}
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryTotal}>
          <TitleText style={styles.totalLabel}>Total</TitleText>
          <TitleText style={styles.totalValue}>£{cartTotals.total.toFixed(2)}</TitleText>
        </View>
      </View>
    );
  };

  // Progress bar component
  const ProgressBarComponent = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <CaptionText style={styles.progressText}>{stepMessage}</CaptionText>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <HeadlineText style={styles.headerTitle}>Event Registration</HeadlineText>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar with Suspense */}
      {isProcessing && (
        <Suspense fallback={<ProgressBarFallback />}>
          <ProgressBarComponent />
        </Suspense>
      )}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary with Suspense */}
        <Suspense fallback={<OrderSummaryFallback />}>
          <OrderSummaryComponent />
        </Suspense>

        {/* Participant Information */}
        <View style={styles.participantSection}>
          <TitleText style={styles.sectionTitle}>Participant Information</TitleText>
          
          <View style={styles.formContainer}>
            <FormField
              label="First Name"
              value={participantInfo.first_name}
              onChangeText={(text) => updateField('first_name', text)}
              placeholder="Enter your first name"
              icon={<User size={16} color={Colors.textSecondary} />}
              error={getError('first_name')}
              required
            />
            
            <FormField
              label="Last Name"
              value={participantInfo.last_name}
              onChangeText={(text) => updateField('last_name', text)}
              placeholder="Enter your last name"
              icon={<User size={16} color={Colors.textSecondary} />}
              error={getError('last_name')}
              required
            />
            
            <FormField
              label="Email"
              value={participantInfo.email}
              onChangeText={(text) => updateField('email', text)}
              placeholder="Enter your email address"
              icon={<Mail size={16} color={Colors.textSecondary} />}
              keyboardType="email-address"
              error={getError('email')}
              required
            />
            
            <FormField
              label="Phone Number"
              value={participantInfo.phone || ''}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="Enter your phone number"
              icon={<Phone size={16} color={Colors.textSecondary} />}
              keyboardType="phone-pad"
              error={getError('phone')}
            />
            
            <FormField
              label="Dietary Requirements"
              value={participantInfo.dietary_requirements || ''}
              onChangeText={(text) => updateField('dietary_requirements', text)}
              placeholder="Any dietary requirements or allergies"
              multiline
              error={getError('dietary_requirements')}
            />
            
            <FormField
              label="Special Needs"
              value={participantInfo.special_needs || ''}
              onChangeText={(text) => updateField('special_needs', text)}
              placeholder="Any special requirements or accommodations"
              multiline
              error={getError('special_needs')}
            />
            
            <FormField
              label="Emergency Contact"
              value={participantInfo.emergency_contact || ''}
              onChangeText={(text) => updateField('emergency_contact', text)}
              placeholder="Emergency contact name and phone"
              error={getError('emergency_contact')}
            />
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <TouchableOpacity 
            style={styles.termsCheckbox}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <CheckCircle size={16} color={Colors.textLight} />}
            </View>
            <BodyText style={styles.termsText}>
              I agree to the terms and conditions and confirm that the information provided is accurate.
            </BodyText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.paymentFooter}>
        <TouchableOpacity
          style={[
            styles.paymentButton,
            (isProcessing || isSubmitting || !agreedToTerms || hasErrors || isPending) && styles.paymentButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={isProcessing || isSubmitting || !agreedToTerms || hasErrors || isPending}
        >
          <View style={styles.paymentButtonContent}>
            {(isProcessing || isSubmitting || isPending) ? (
              <Loader size={20} color={Colors.textLight} />
            ) : (
              <CreditCard size={20} color={Colors.textLight} />
            )}
            <ButtonText style={styles.paymentButtonText}>
              {(isProcessing || isSubmitting || isPending) ? 'Processing...' : `Pay £${cartTotals.total.toFixed(2)}`}
            </ButtonText>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ================================
// STYLES
// ================================

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerRight: {
    width: 44,
  },
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  
  // Loading states
  loadingOrderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  
  // Order Summary
  orderSummary: {
    backgroundColor: Colors.surface,
    margin: Spacing.xl,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  summaryItemContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  summaryItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  summaryItemDetails: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  summaryItemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryItemDetailText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  feeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  feeTagText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryItemPrice: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  itemQuantity: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  // Participant Information
  participantSection: {
    backgroundColor: Colors.surface,
    margin: Spacing.xl,
    marginTop: 0,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  formContainer: {
    gap: Spacing.lg,
  },
  formField: {
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.error,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  fieldError: {
    borderColor: Colors.error,
  },
  fieldIcon: {
    marginRight: Spacing.md,
  },
  textInput: {
    flex: 1,
    paddingVertical: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
  },
  textInputMultiline: {
    paddingVertical: Spacing.lg,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textInputPending: {
    opacity: 0.7,
  },
  loadingIndicator: {
    position: 'absolute',
    right: Spacing.md,
  },
  fieldErrorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  
  // Terms
  termsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  bottomSpacing: {
    height: 100,
  },
  
  // Payment Footer
  paymentFooter: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  paymentButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  paymentButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  paymentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  paymentButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
};

export default EventPaymentScreen;