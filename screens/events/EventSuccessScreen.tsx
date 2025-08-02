// screens/events/EventSuccessScreen.tsx - FIXED VERSION
import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  runOnJS
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { formatDate } from '@/utils/dateUtils';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Mail, 
  Ticket,
  ArrowRight,
  Download,
  Share,
  AlertTriangle,
  Clock,
  CreditCard
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// FIXED: Use proper result type from the hook
interface RegistrationResult {
  success: boolean;
  transaction_id?: string;
  registrations?: Array<{
    id: number;
    participant_id: number;
    event_id: number;
    event_title: string;
    fee_amount: number;
    register_date: string;
    status: string;
    confirmation_number: string;
  }>;
  user_message: string;
  requires_followup: boolean;
  error?: string;
  // Additional properties for display
  registration_timestamp?: string;
  total_amount?: number;
  receipts?: Array<{
    receipt_id: string;
    sent_to: string;
  }>;
}

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: RegistrationResult }; // FIXED: Use correct type
};

type EventSuccessRouteProp = RouteProp<EventStackParamList, 'EventSuccess'>;
type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

const EventSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventSuccessRouteProp>();
  const { result } = route.params;

  // Animation values
  const checkmarkScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    // Animate checkmark
    checkmarkScale.value = withSpring(1, { damping: 12 });
    
    // Animate content
    contentOpacity.value = withDelay(300, withSpring(1));
    contentTranslateY.value = withDelay(300, withSpring(0));
  }, []);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleBrowseEvents = () => {
    navigation.navigate('Events');
  };

  const handleShareReceipt = () => {
    // TODO: Implement share functionality
    console.log('Share receipt');
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement download functionality
    console.log('Download receipt');
  };

  // FIXED: Simplified status determination
  const getSuccessType = () => {
    if (result.success) {
      return result.requires_followup ? 'partial' : 'full';
    }
    return 'error';
  };

  const successType = getSuccessType();

  const renderStatusIcon = () => {
    if (successType === 'full') {
      return (
        <Animated.View style={[styles.statusIconContainer, styles.successIcon, checkmarkStyle]}>
          <CheckCircle size={48} color={Colors.textLight} />
        </Animated.View>
      );
    } else if (successType === 'partial') {
      return (
        <Animated.View style={[styles.statusIconContainer, styles.warningIcon, checkmarkStyle]}>
          <AlertTriangle size={48} color={Colors.textLight} />
        </Animated.View>
      );
    } else {
      return (
        <Animated.View style={[styles.statusIconContainer, styles.errorIcon, checkmarkStyle]}>
          <AlertTriangle size={48} color={Colors.textLight} />
        </Animated.View>
      );
    }
  };

  const renderStatusMessage = () => {
    return (
      <View style={styles.statusMessage}>
        <TitleText style={styles.statusTitle}>
          {successType === 'full' ? 'Registration Successful!' : 
           successType === 'partial' ? 'Registration Received' : 
           'Registration Issue'}
        </TitleText>
        <BodyText style={styles.statusDescription}>
          {result.user_message}
        </BodyText>
      </View>
    );
  };

  const renderWarningBanner = () => {
    if (successType !== 'partial') return null;

    return (
      <View style={styles.warningBanner}>
        <AlertTriangle size={20} color={Colors.warning} />
        <BodyText style={styles.warningText}>
          {result.requires_followup 
            ? 'Your registration is being processed. You will receive a confirmation email shortly.'
            : 'There was an issue with part of your registration. Please contact support if you don\'t receive confirmation within 24 hours.'}
        </BodyText>
      </View>
    );
  };

  const renderRegistrationDetails = () => (
    <View style={styles.detailsCard}>
      <TitleText style={styles.cardTitle}>Registration Details</TitleText>
      
      {result.transaction_id && (
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <CreditCard size={20} color={Colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <LabelText style={styles.detailLabel}>Transaction ID</LabelText>
            <BodyText style={styles.detailValue}>{result.transaction_id}</BodyText>
          </View>
        </View>
      )}

      <View style={styles.detailRow}>
        <View style={styles.detailIcon}>
          <Calendar size={20} color={Colors.primary} />
        </View>
        <View style={styles.detailContent}>
          <LabelText style={styles.detailLabel}>Registration Date</LabelText>
          <BodyText style={styles.detailValue}>
            {formatDate(new Date(result.registration_timestamp || new Date().toISOString()), {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </BodyText>
        </View>
      </View>

      {result.total_amount && (
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ticket size={20} color={Colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <LabelText style={styles.detailLabel}>Total Amount</LabelText>
            <BodyText style={styles.detailValue}>£{result.total_amount.toFixed(2)}</BodyText>
          </View>
        </View>
      )}

      {result.registrations && (
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Users size={20} color={Colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <LabelText style={styles.detailLabel}>Registrations</LabelText>
            <BodyText style={styles.detailValue}>
              {result.registrations.length} {result.registrations.length === 1 ? 'registration' : 'registrations'}
            </BodyText>
          </View>
        </View>
      )}
    </View>
  );

  const renderRegistrationsList = () => {
    if (!result.registrations || result.registrations.length === 0) return null;

    return (
      <View style={styles.registrationsCard}>
        <TitleText style={styles.cardTitle}>Your Registrations</TitleText>
        
        {result.registrations.map((registration, index) => (
          <View key={index} style={styles.registrationItem}>
            <View style={styles.registrationHeader}>
              <TitleText style={styles.registrationTitle}>
                {registration.event_title}
              </TitleText>
              <View style={styles.registrationStatus}>
                <CheckCircle size={16} color={Colors.success} />
                <CaptionText style={styles.registrationStatusText}>
                  {registration.status}
                </CaptionText>
              </View>
            </View>
            
            <View style={styles.registrationDetails}>
              <CaptionText style={styles.registrationDetail}>
                Confirmation: {registration.confirmation_number}
              </CaptionText>
              <CaptionText style={styles.registrationDetail}>
                Amount: £{registration.fee_amount.toFixed(2)}
              </CaptionText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderReceiptActions = () => (
    <View style={styles.actionsCard}>
      <TitleText style={styles.cardTitle}>Receipt & Confirmation</TitleText>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownloadReceipt}>
          <Download size={20} color={Colors.primary} />
          <LabelText style={styles.actionButtonText}>Download Receipt</LabelText>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleShareReceipt}>
          <Share size={20} color={Colors.primary} />
          <LabelText style={styles.actionButtonText}>Share Receipt</LabelText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.receiptInfo}>
        <Mail size={16} color={Colors.textSecondary} />
        <CaptionText style={styles.receiptInfoText}>
          {result.receipts && result.receipts.length > 0 
            ? `Confirmation emails sent to your registered email address`
            : 'Confirmation email will be sent within 24 hours'}
        </CaptionText>
      </View>
    </View>
  );

  const renderNextSteps = () => (
    <View style={styles.nextStepsCard}>
      <TitleText style={styles.cardTitle}>What's Next?</TitleText>
      
      <View style={styles.nextStepsList}>
        <View style={styles.nextStepItem}>
          <View style={styles.nextStepNumber}>
            <CaptionText style={styles.nextStepNumberText}>1</CaptionText>
          </View>
          <BodyText style={styles.nextStepText}>
            Check your email for confirmation and event details
          </BodyText>
        </View>
        
        <View style={styles.nextStepItem}>
          <View style={styles.nextStepNumber}>
            <CaptionText style={styles.nextStepNumberText}>2</CaptionText>
          </View>
          <BodyText style={styles.nextStepText}>
            Add the event to your calendar
          </BodyText>
        </View>
        
        <View style={styles.nextStepItem}>
          <View style={styles.nextStepNumber}>
            <CaptionText style={styles.nextStepNumberText}>3</CaptionText>
          </View>
          <BodyText style={styles.nextStepText}>
            Arrive 15 minutes early for registration
          </BodyText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={successType === 'full' ? [Colors.success, Colors.primary] : 
                successType === 'partial' ? [Colors.warning, Colors.primary] : 
                [Colors.error, Colors.primary]}
        style={styles.header}
      >
        {renderStatusIcon()}
        <Animated.View style={[styles.headerContent, contentStyle]}>
          {renderStatusMessage()}
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderWarningBanner()}
        
        <Animated.View style={contentStyle}>
          {renderRegistrationDetails()}
          {renderRegistrationsList()}
          {renderReceiptActions()}
          {renderNextSteps()}
        </Animated.View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.browseButton} onPress={handleBrowseEvents}>
          <ButtonText style={styles.browseButtonText}>Browse More Events</ButtonText>
          <ArrowRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles remain the same as original...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    backgroundColor: Colors.success,
  },
  warningIcon: {
    backgroundColor: Colors.warning,
  },
  errorIcon: {
    backgroundColor: Colors.error,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  statusMessage: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textLight,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '20',
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    margin: Spacing.xl,
    gap: Spacing.md,
  },
  warningText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  
  // Cards
  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    margin: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  registrationsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  actionsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  nextStepsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  
  // Details
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  
  // Registrations
  registrationItem: {
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  registrationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.md,
  },
  registrationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  registrationStatusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  registrationDetails: {
    gap: Spacing.xs,
  },
  registrationDetail: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  
  // Actions
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  receiptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  receiptInfoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Next Steps
  nextStepsList: {
    gap: Spacing.lg,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  nextStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextStepNumberText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  nextStepText: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  
  bottomSpacing: {
    height: 100,
  },
  
  // Footer
  footer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  browseButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventSuccessScreen;