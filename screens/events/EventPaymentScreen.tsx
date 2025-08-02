// screens/events/EventPaymentScreen.tsx - SIMPLIFIED VERSION WITH DESIGN SYSTEM
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Layout, Cards, Containers, Buttons, Inputs } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { useEventCart } from '@/contexts/EventContext';
import { useEventRegistration, useEventRegistrationForm } from '@/hooks/useEventRegistration';
import { formatDate } from '@/utils/dateUtils';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  Clock, 
  Ticket,
  CheckCircle,
  User,
  Mail,
  Phone
} from 'lucide-react-native';

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: any };
};

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// Simple Form Field Component
const FormField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  error?: string;
  required?: boolean;
}> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  icon, 
  keyboardType = 'default',
  error,
  required = false
}) => (
  <View style={styles.formField}>
    <LabelText style={styles.fieldLabel}>
      {label} {required && <CaptionText style={styles.required}>*</CaptionText>}
    </LabelText>
    <View style={[
      Layout.flexRow, 
      Layout.centerVertical, 
      Inputs.base, 
      error && Inputs.error
    ]}>
      {icon && <View style={styles.fieldIcon}>{icon}</View>}
      <TextInput
        style={[styles.textInput, Typography.bodyMedium]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
      />
    </View>
    {error && <CaptionText style={styles.fieldErrorText}>{error}</CaptionText>}
  </View>
);

const EventPaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cart, cartTotals } = useEventCart();
  const { 
    isProcessing, 
    processEventRegistration,
    progressPercentage,
    message
  } = useEventRegistration();
  
  const {
    participantInfo,
    updateParticipantInfo,
    validateForm,
    hasErrors,
    getFieldError
  } = useEventRegistrationForm();

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  React.useEffect(() => {
    if (cart.length === 0) {
      navigation.navigate('Events');
    }
  }, [cart.length, navigation]);

  const handlePayment = async () => {
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions to proceed.');
      return;
    }

    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Form Incomplete', 'Please fill in all required fields.');
      return;
    }

    try {
      const result = await processEventRegistration(participantInfo);
      
      if (result.success) {
        navigation.navigate('EventSuccess', { result });
      } else {
        Alert.alert(
          'Registration Failed',
          result.user_message || 'Something went wrong. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert(
        'Registration Error',
        'An unexpected error occurred. Please try again.'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      style={Containers.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[Containers.header, Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <HeadlineText>Registration</HeadlineText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      {isProcessing && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <CaptionText style={styles.progressText}>{message}</CaptionText>
        </View>
      )}

      <ScrollView 
        style={Layout.flex1}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <View style={[Cards.base, styles.summaryCard]}>
          <TitleText style={styles.sectionTitle}>Order Summary</TitleText>
          
          {cart.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <View style={Layout.flex1}>
                <BodyText style={styles.summaryItemTitle} numberOfLines={2}>
                  {item.event_title}
                </BodyText>
                <View style={[Layout.flexRow, styles.summaryItemDetails]}>
                  <View style={[Layout.flexRow, Layout.centerVertical, styles.summaryDetail]}>
                    <Calendar size={12} color={Colors.textSecondary} />
                    <CaptionText style={styles.summaryDetailText}>
                      {formatDate(new Date(item.event_start_date), { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </CaptionText>
                  </View>
                  
                  <View style={[Layout.flexRow, Layout.centerVertical, styles.summaryDetail]}>
                    <Clock size={12} color={Colors.textSecondary} />
                    <CaptionText style={styles.summaryDetailText}>
                      {new Date(item.event_start_date).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </CaptionText>
                  </View>
                  
                  {item.fee_label && (
                    <View style={[Layout.flexRow, Layout.centerVertical, styles.summaryDetail]}>
                      <Ticket size={12} color={Colors.primary} />
                      <CaptionText style={styles.feeLabel}>{item.fee_label}</CaptionText>
                    </View>
                  )}
                </View>
              </View>
              <TitleText style={styles.itemPrice}>£{item.total.toFixed(2)}</TitleText>
            </View>
          ))}
          
          <View style={styles.summaryDivider} />
          
          <View style={[Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
            <TitleText style={styles.totalLabel}>Total</TitleText>
            <TitleText style={styles.totalValue}>£{cartTotals.total.toFixed(2)}</TitleText>
          </View>
        </View>

        {/* Participant Information */}
        <View style={[Cards.base, styles.formCard]}>
          <TitleText style={styles.sectionTitle}>Your Information</TitleText>
          
          <FormField
            label="First Name"
            value={participantInfo.first_name}
            onChangeText={(text) => updateParticipantInfo('first_name', text)}
            placeholder="Enter your first name"
            icon={<User size={16} color={Colors.textSecondary} />}
            error={getFieldError('first_name')}
            required
          />
          
          <FormField
            label="Last Name"
            value={participantInfo.last_name}
            onChangeText={(text) => updateParticipantInfo('last_name', text)}
            placeholder="Enter your last name"
            icon={<User size={16} color={Colors.textSecondary} />}
            error={getFieldError('last_name')}
            required
          />
          
          <FormField
            label="Email"
            value={participantInfo.email}
            onChangeText={(text) => updateParticipantInfo('email', text)}
            placeholder="Enter your email address"
            icon={<Mail size={16} color={Colors.textSecondary} />}
            keyboardType="email-address"
            error={getFieldError('email')}
            required
          />
          
          <FormField
            label="Phone Number"
            value={participantInfo.phone || ''}
            onChangeText={(text) => updateParticipantInfo('phone', text)}
            placeholder="Enter your phone number"
            icon={<Phone size={16} color={Colors.textSecondary} />}
            keyboardType="phone-pad"
          />
        </View>

        {/* Terms and Conditions */}
        <TouchableOpacity 
          style={[Layout.flexRow, styles.termsContainer]}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <CheckCircle size={16} color={Colors.textLight} />}
          </View>
          <BodyText style={styles.termsText}>
            I agree to the terms and conditions and confirm that the information provided is accurate.
          </BodyText>
        </TouchableOpacity>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.paymentFooter}>
        <TouchableOpacity
          style={[
            Buttons.primary,
            (isProcessing || !agreedToTerms || hasErrors) && styles.paymentButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={isProcessing || !agreedToTerms || hasErrors}
        >
          <View style={[Layout.flexRow, Layout.centerVertical, styles.paymentButtonContent]}>
            <CreditCard size={20} color={Colors.textLight} />
            <ButtonText style={styles.paymentButtonText}>
              {isProcessing ? 'Processing...' : `Pay £${cartTotals.total.toFixed(2)}`}
            </ButtonText>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Styles using Design System
const styles = StyleSheet.create({
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceSecondary,
    ...Layout.center,
  },
  headerSpacer: {
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
    borderRadius: BorderRadius.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xs,
  },
  progressText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  
  // Order Summary
  summaryCard: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
  },
  summaryItem: {
    ...Layout.flexRow,
    ...Layout.spaceBetween,
    ...Layout.alignStart,
    gap: Spacing.md,
  },
  summaryItemTitle: {
    ...Typography.titleSmall,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  summaryItemDetails: {
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryDetail: {
    gap: Spacing.xs,
  },
  summaryDetailText: {
    color: Colors.textSecondary,
  },
  feeLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  itemPrice: {
    ...Typography.titleMedium,
    color: Colors.text,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  totalLabel: {
    ...Typography.titleLarge,
    color: Colors.text,
  },
  totalValue: {
    ...Typography.titleLarge,
    color: Colors.primary,
  },
  
  // Form
  formCard: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  formField: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    ...Typography.labelMedium,
    color: Colors.text,
  },
  required: {
    color: Colors.error,
  },
  fieldIcon: {
    marginRight: Spacing.md,
  },
  textInput: {
    flex: 1,
    color: Colors.text,
  },
  fieldErrorText: {
    color: Colors.error,
  },
  
  // Terms
  termsContainer: {
    ...Layout.alignStart,
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Layout.center,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Payment Footer
  paymentFooter: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  paymentButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  paymentButtonContent: {
    gap: Spacing.md,
  },
  paymentButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
});

export default EventPaymentScreen;