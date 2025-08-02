import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import { useDonationCart } from '@/contexts/DonationContext';
import { useDonation, useDonationForm, type ProcessedDonationResult } from '@/hooks/useDonation';
import { User, Mail, Phone, MapPin, CreditCard, TriangleAlert as AlertTriangle, Home, ArrowLeft, CheckCircle, Clock, X } from 'lucide-react-native';
import { CreditCardIcon } from '@/assets/icons';
import { 
  sharedStyles,
  screenStyles,
  paymentStyles,
  overlayStyles
} from '@/styles/DonationStyles';

type DonationStackParamList = {
  Donate: undefined;
  Cart: undefined;
  Payment: undefined;
  Success: { result: ProcessedDonationResult };
};

type NavigationProp = NativeStackNavigationProp<DonationStackParamList>;

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { cart, cartTotals, giftAidEnabled } = useDonationCart();
  
  const { 
    processDonation, 
    isProcessing, 
    error: paymentError, 
    resetDonation,
    stepMessage,
    progressPercentage,
    calculateGiftAidBenefit
  } = useDonation();
  
  const {
    donorInfo,
    updateDonorInfo,
    validateForm,
    formErrors,
    hasErrors
  } = useDonationForm();
  
  const [error, setError] = useState('');
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  
  const userDataPopulated = useRef(false);

  useEffect(() => {
    if (user && !userDataPopulated.current && !donorInfo.email) {
      if (user.first_name && !donorInfo.first_name) {
        updateDonorInfo('first_name', user.first_name);
      }
      if (user.last_name && !donorInfo.last_name) {
        updateDonorInfo('last_name', user.last_name);
      }
      if (user.email && !donorInfo.email) {
        updateDonorInfo('email', user.email);
      }
      if (user.phone_primary && !donorInfo.phone) {
        updateDonorInfo('phone', user.phone_primary);
      }
      if (user.street_address && !donorInfo.street_address) {
        updateDonorInfo('street_address', user.street_address);
      }
      if (user.city && !donorInfo.city) {
        updateDonorInfo('city', user.city);
      }
      if (user.postal_code && !donorInfo.postal_code) {
        updateDonorInfo('postal_code', user.postal_code);
      }
      if (user.country && !donorInfo.country) {
        updateDonorInfo('country', user.country);
      }
      
      userDataPopulated.current = true;
    }
  }, [user]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showError = (errorMessage: string) => {
    setError(errorMessage);
    setShowErrorOverlay(true);
  };

  const handlePayment = async () => {
    try {
      resetDonation();
      setError('');
      setShowErrorOverlay(false);
      setIsShowingResult(false);

      const validation = validateForm(giftAidEnabled);
      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        showError(firstError);
        return;
      }

      if (!validateEmail(donorInfo.email)) {
        showError('Please enter a valid email address');
        return;
      }

      const result = await processDonation(donorInfo, giftAidEnabled);

      if ('success' in result && !result.success) {
        showError(result.user_message || result.error || 'Payment failed. Please try again.');
        
        if (result.requires_followup) {
          setTimeout(() => {
            Alert.alert(
              'Support Required',
              'If this issue persists, please contact our support team for assistance.',
              [{ text: 'OK', style: 'default' }]
            );
          }, 1000);
        }
        return;
      }

      const successResult = result as ProcessedDonationResult;
      setIsShowingResult(true);
      navigation.navigate('Success', { result: successResult });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      showError(errorMessage);
    }
  };

  const renderErrorText = (fieldName: string) => {
    if (formErrors[fieldName]) {
      return (
        <LabelText style={errorTextStyle}>
          {formErrors[fieldName]}
        </LabelText>
      );
    }
    return null;
  };

  const renderDonorForm = () => (
    <View style={sharedStyles.section}>
      <TitleText style={sharedStyles.sectionTitle}>Donor Information</TitleText>
      
      <View style={sharedStyles.inputContainer}>
        <User size={18} color={Colors.textSecondary} />
        <TextInput
          style={[paymentStyles.inputField, formErrors.first_name && { borderColor: Colors.error }]}
          placeholder="First Name *"
          placeholderTextColor={Colors.textMuted}
          value={donorInfo.first_name}
          onChangeText={(text) => updateDonorInfo('first_name', text)}
          accessible={true}
          accessibilityLabel="First name"
          accessibilityHint="Enter your first name"
          autoCorrect={false}
          returnKeyType="next"
          editable={!isProcessing && !showErrorOverlay}
        />
      </View>
      {renderErrorText('first_name')}
      
      <View style={sharedStyles.inputContainer}>
        <User size={18} color={Colors.textSecondary} />
        <TextInput
          style={[paymentStyles.inputField, formErrors.last_name && { borderColor: Colors.error }]}
          placeholder="Last Name *"
          placeholderTextColor={Colors.textMuted}
          value={donorInfo.last_name}
          onChangeText={(text) => updateDonorInfo('last_name', text)}
          accessible={true}
          accessibilityLabel="Last name"
          accessibilityHint="Enter your last name"
          autoCorrect={false}
          returnKeyType="next"
          editable={!isProcessing && !showErrorOverlay}
        />
      </View>
      {renderErrorText('last_name')}
      
      <View style={sharedStyles.inputContainer}>
        <Mail size={18} color={Colors.textSecondary} />
        <TextInput
          style={[paymentStyles.inputField, formErrors.email && { borderColor: Colors.error }]}
          placeholder="Email Address *"
          placeholderTextColor={Colors.textMuted}
          value={donorInfo.email}
          onChangeText={(text) => updateDonorInfo('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessible={true}
          accessibilityLabel="Email address"
          accessibilityHint="Enter your email address for receipt"
          returnKeyType="next"
          editable={!isProcessing && !showErrorOverlay}
        />
      </View>
      {renderErrorText('email')}
      
      <View style={sharedStyles.inputContainer}>
        <Phone size={18} color={Colors.textSecondary} />
        <TextInput
          style={paymentStyles.inputField}
          placeholder="Phone Number"
          placeholderTextColor={Colors.textMuted}
          value={donorInfo.phone || ''}
          onChangeText={(text) => updateDonorInfo('phone', text)}
          keyboardType="phone-pad"
          accessible={true}
          accessibilityLabel="Phone number"
          accessibilityHint="Enter your phone number (optional)"
          returnKeyType="next"
          editable={!isProcessing && !showErrorOverlay}
        />
      </View>

      {giftAidEnabled && (
        <>
          <View style={paymentStyles.giftAidAddressHeader}>
            <Home size={18} color={Colors.primary} />
            <LabelText style={paymentStyles.giftAidAddressTitle}>Home Address (Required for Gift Aid)</LabelText>
          </View>
          
          <View style={sharedStyles.inputContainer}>
            <MapPin size={18} color={Colors.textSecondary} />
            <TextInput
              style={[paymentStyles.inputField, formErrors.street_address && { borderColor: Colors.error }]}
              placeholder="Street Address *"
              placeholderTextColor={Colors.textMuted}
              value={donorInfo.street_address || ''}
              onChangeText={(text) => updateDonorInfo('street_address', text)}
              accessible={true}
              accessibilityLabel="Street address"
              accessibilityHint="Enter your home street address for Gift Aid"
              autoCorrect={false}
              returnKeyType="next"
              editable={!isProcessing && !showErrorOverlay}
            />
          </View>
          {renderErrorText('street_address')}
          
          <View style={sharedStyles.inputContainer}>
            <MapPin size={18} color={Colors.textSecondary} />
            <TextInput
              style={[paymentStyles.inputField, formErrors.city && { borderColor: Colors.error }]}
              placeholder="City *"
              placeholderTextColor={Colors.textMuted}
              value={donorInfo.city || ''}
              onChangeText={(text) => updateDonorInfo('city', text)}
              accessible={true}
              accessibilityLabel="City"
              accessibilityHint="Enter your city for Gift Aid"
              autoCorrect={false}
              returnKeyType="next"
              editable={!isProcessing && !showErrorOverlay}
            />
          </View>
          {renderErrorText('city')}
          
          <View style={sharedStyles.inputContainer}>
            <MapPin size={18} color={Colors.textSecondary} />
            <TextInput
              style={[paymentStyles.inputField, formErrors.postal_code && { borderColor: Colors.error }]}
              placeholder="Postal Code *"
              placeholderTextColor={Colors.textMuted}
              value={donorInfo.postal_code || ''}
              onChangeText={(text) => updateDonorInfo('postal_code', text)}
              autoCapitalize="characters"
              accessible={true}
              accessibilityLabel="Postal code"
              accessibilityHint="Enter your postal code for Gift Aid"
              returnKeyType="next"
              editable={!isProcessing && !showErrorOverlay}
            />
          </View>
          {renderErrorText('postal_code')}
          
          <View style={sharedStyles.inputContainer}>
            <MapPin size={18} color={Colors.textSecondary} />
            <TextInput
              style={paymentStyles.inputField}
              placeholder="Country"
              placeholderTextColor={Colors.textMuted}
              value={donorInfo.country || 'United Kingdom'}
              onChangeText={(text) => updateDonorInfo('country', text)}
              accessible={true}
              accessibilityLabel="Country"
              accessibilityHint="Enter your country"
              autoCorrect={false}
              returnKeyType="done"
              editable={!isProcessing && !showErrorOverlay}
            />
          </View>
        </>
      )}
    </View>
  );

  const renderOrderSummary = () => (
    <View style={sharedStyles.section}>
      <TitleText style={sharedStyles.sectionTitle}>Order Summary</TitleText>
      <View style={paymentStyles.orderSummary}>
        {cart.map((item) => (
          <View key={item.id} style={paymentStyles.orderItem}>
            <BodyText style={paymentStyles.orderItemName}>
              {item.category} x{item.quantity}
            </BodyText>
            <BodyText style={paymentStyles.orderItemPrice}>£{item.total.toFixed(2)}</BodyText>
          </View>
        ))}
        
        <View style={paymentStyles.orderDivider} />
        
        <View style={paymentStyles.orderItem}>
          <BodyText style={paymentStyles.orderSubtotal}>Donation Total</BodyText>
          <BodyText style={paymentStyles.orderSubtotal}>£{cartTotals.subtotal.toFixed(2)}</BodyText>
        </View>
        
        {giftAidEnabled && (
          <>
            <View style={paymentStyles.orderItem}>
              <BodyText style={paymentStyles.orderGiftAid}>Gift Aid (claimed separately)</BodyText>
              <BodyText style={paymentStyles.orderGiftAid}>+£{calculateGiftAidBenefit(cartTotals.total).toFixed(2)}</BodyText>
            </View>
            <View style={paymentStyles.orderItem}>
              <BodyText style={paymentStyles.orderCharityTotal}>Total Value to Charity</BodyText>
              <BodyText style={paymentStyles.orderCharityTotal}>£{(cartTotals.total + calculateGiftAidBenefit(cartTotals.total)).toFixed(2)}</BodyText>
            </View>
          </>
        )}
        
        <View style={paymentStyles.orderItem}>
          <TitleText style={paymentStyles.orderTotal}>You Pay</TitleText>
          <TitleText style={paymentStyles.orderTotal}>£{cartTotals.total.toFixed(2)}</TitleText>
        </View>
      </View>
    </View>
  );

  const renderProcessingIndicator = () => {
    if (!isProcessing) return null;

    const getStepIcon = () => {
      if (stepMessage.includes('Validating')) return <CheckCircle size={20} color={Colors.success} />;
      if (stepMessage.includes('Setting up')) return <CheckCircle size={20} color={Colors.success} />;
      if (stepMessage.includes('Preparing')) return <CheckCircle size={20} color={Colors.success} />;
      if (stepMessage.includes('Processing')) return <ActivityIndicator size="small" color={Colors.primary} />;
      if (stepMessage.includes('Confirming')) return <Clock size={20} color={Colors.warning} />;
      return <ActivityIndicator size="small" color={Colors.primary} />;
    };

    return (
      <View style={overlayStyles.processingOverlay}>
        <View style={overlayStyles.processingContent}>
          <View style={overlayStyles.processingHeader}>
            {getStepIcon()}
            <TitleText style={overlayStyles.processingTitle}>Processing Payment</TitleText>
          </View>
          
          <BodyText style={overlayStyles.processingMessage}>{stepMessage}</BodyText>
          
          {progressPercentage > 0 && (
            <View style={overlayStyles.progressContainer}>
              <View style={paymentStyles.progressBar}>
                <View 
                  style={[
                    paymentStyles.progressFill, 
                    { width: `${progressPercentage}%` }
                  ]} 
                />
              </View>
              <LabelText style={overlayStyles.progressText}>
                {Math.round(progressPercentage)}%
              </LabelText>
            </View>
          )}
          
          <LabelText style={overlayStyles.warningText}>
            Please do not close the app or navigate away
          </LabelText>
        </View>
      </View>
    );
  };

  const renderErrorOverlay = () => {
    if (!showErrorOverlay || !error) return null;

    return (
      <View style={overlayStyles.errorOverlay}>
        <View style={overlayStyles.errorContent}>
          <View style={overlayStyles.errorHeader}>
            <AlertTriangle size={48} color={Colors.error} />
            <TitleText style={overlayStyles.errorTitle}>Payment Error</TitleText>
          </View>
          
          <BodyText style={overlayStyles.errorMessage}>
            {error}
          </BodyText>
          
          <TouchableOpacity
            style={overlayStyles.errorButton}
            onPress={() => {
              setShowErrorOverlay(false);
              setError('');
            }}
            accessible={true}
            accessibilityLabel="Close error message"
            accessibilityRole="button"
          >
            <ButtonText style={overlayStyles.errorButtonText}>Try Again</ButtonText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Error text style
  const errorTextStyle = {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  };

  return (
    <View style={sharedStyles.container}>
      <View style={screenStyles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={screenStyles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityLabel="Go back to cart"
          accessibilityRole="button"
          disabled={isProcessing || isShowingResult || showErrorOverlay}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={(isProcessing || isShowingResult || showErrorOverlay) ? Colors.textMuted : Colors.text} />
        </TouchableOpacity>
        <HeadlineText style={screenStyles.title}>Checkout</HeadlineText>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAwareScrollView 
        style={sharedStyles.content} 
        contentContainerStyle={[screenStyles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
        extraHeight={150}
        extraScrollHeight={Platform.OS === 'ios' ? 0 : 120}
        keyboardOpeningTime={250}
        keyboardShouldPersistTaps="handled"
        resetScrollToCoords={{ x: 0, y: 0 }}
        scrollEventThrottle={16}
        scrollEnabled={!isProcessing && !showErrorOverlay}
      >
        {renderDonorForm()}
        {renderOrderSummary()}
      </KeyboardAwareScrollView>

      <View style={screenStyles.footer}>
        <TouchableOpacity
          style={[
            paymentStyles.payButton, 
            (isProcessing || hasErrors || isShowingResult || showErrorOverlay) && paymentStyles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={isProcessing || hasErrors || isShowingResult || showErrorOverlay}
          accessible={true}
          accessibilityLabel={`Pay £${cartTotals.total.toFixed(2)}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: isProcessing || hasErrors || isShowingResult || showErrorOverlay }}
        >
          <View style={paymentStyles.payButtonContent}>
            <CreditCardIcon size={20} color={Colors.textLight} />
            {isProcessing ? (
              <View style={paymentStyles.processingContainer}>
                <ButtonText style={sharedStyles.primaryButtonText}>Processing...</ButtonText>
                <ActivityIndicator size="small" color={Colors.textLight} />
              </View>
            ) : isShowingResult ? (
              <View style={paymentStyles.processingContainer}>
                <CheckCircle size={20} color={Colors.textLight} />
                <ButtonText style={sharedStyles.primaryButtonText}>Completed!</ButtonText>
              </View>
            ) : (
              <ButtonText style={sharedStyles.primaryButtonText}>
                Pay £{cartTotals.total.toFixed(2)}
              </ButtonText>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {renderProcessingIndicator()}
      {renderErrorOverlay()}
    </View>
  );
};

export default PaymentScreen;