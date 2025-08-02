// screens/events/EventSuccessScreen.tsx - Modern React 19 Implementation
import React, { useEffect, useTransition, useDeferredValue, Suspense, startTransition } from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Dimensions, Share } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  runOnJS,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { formatDate } from '@/utils/dateUtils';
import type { EventRegistrationResult, EventStackParamList } from '@/types/event';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Mail, 
  Ticket,
  ArrowRight,
  Download,
  Share as ShareIcon,
  AlertTriangle,
  Clock,
  CreditCard,
  ExternalLink,
  Star,
  Confetti
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type EventSuccessRouteProp = RouteProp<EventStackParamList, 'EventSuccess'>;
type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// ================================
// SUSPENSE FALLBACK COMPONENTS
// ================================

const StatusIconFallback = () => (
  <View style={[styles.statusIconContainer, styles.successIcon]}>
    <Animated.View style={{ transform: [{ scale: 0.8 }] }}>
      <CheckCircle size={48} color={Colors.textLight} />
    </Animated.View>
  </View>
);

const RegistrationDetailsFallback = () => (
  <View style={styles.detailsCard}>
    <View style={styles.loadingCard}>
      <CaptionText style={styles.loadingText}>Loading registration details...</CaptionText>
    </View>
  </View>
);

const ReceiptActionsFallback = () => (
  <View style={styles.actionsCard}>
    <View style={styles.loadingCard}>
      <CaptionText style={styles.loadingText}>Preparing receipt options...</CaptionText>
    </View>
  </View>
);

// ================================
// MODERN SUCCESS COMPONENTS
// ================================

interface StatusIconProps {
  successType: 'full' | 'partial' | 'error';
}

const StatusIcon: React.FC<StatusIconProps> = React.memo(({ successType }) => {
  const checkmarkScale = useSharedValue(0);
  
  useEffect(() => {
    checkmarkScale.value = withSpring(1, { damping: 12 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  const getIcon = () => {
    switch (successType) {
      case 'full':
        return <CheckCircle size={48} color={Colors.textLight} />;
      case 'partial':
        return <AlertTriangle size={48} color={Colors.textLight} />;
      case 'error':
        return <AlertTriangle size={48} color={Colors.textLight} />;
      default:
        return <CheckCircle size={48} color={Colors.textLight} />;
    }
  };

  const getContainerStyle = () => {
    switch (successType) {
      case 'full':
        return [styles.statusIconContainer, styles.successIcon];
      case 'partial':
        return [styles.statusIconContainer, styles.warningIcon];
      case 'error':
        return [styles.statusIconContainer, styles.errorIcon];
      default:
        return [styles.statusIconContainer, styles.successIcon];
    }
  };

  return (
    <Animated.View style={[getContainerStyle(), animatedStyle]}>
      {getIcon()}
    </Animated.View>
  );
});

StatusIcon.displayName = 'StatusIcon';

interface RegistrationDetailsProps {
  result: EventRegistrationResult;
}

const RegistrationDetails: React.FC<RegistrationDetailsProps> = React.memo(({ result }) => {
  const [isPending, startTransition] = useTransition();
  const deferredResult = useDeferredValue(result);

  return (
    <View style={styles.detailsCard}>
      <TitleText style={styles.cardTitle}>Registration Details</TitleText>
      
      {deferredResult.transaction_id && (
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <CreditCard size={20} color={Colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <LabelText style={styles.detailLabel}>Transaction ID</LabelText>
            <BodyText style={styles.detailValue}>{deferredResult.transaction_id}</BodyText>
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
            {formatDate(new Date(deferredResult.registration_timestamp || new Date().toISOString()), {
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

      {deferredResult.total_amount && (
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Ticket size={20} color={Colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <LabelText style={styles.detailLabel}>Total Amount</LabelText>
            <BodyText style={styles.detailValue}>£{deferredResult.total_amount.toFixed(2)}</BodyText>
          </View>
        </View>
      )}

      {deferredResult.registrations && (
        <View style={styles.detailRow}>
          <View style={styles.detailIcon}>
            <Users size={20} color={Colors.primary} />
          </View>
          <View style={styles.detailContent}>
            <LabelText style={styles.detailLabel}>Registrations</LabelText>
            <BodyText style={styles.detailValue}>
              {deferredResult.registrations.length} {deferredResult.registrations.length === 1 ? 'registration' : 'registrations'}
            </BodyText>
          </View>
        </View>
      )}
    </View>
  );
});

RegistrationDetails.displayName = 'RegistrationDetails';

interface RegistrationsListProps {
  registrations: EventRegistrationResult['registrations'];
}

const RegistrationsList: React.FC<RegistrationsListProps> = React.memo(({ registrations }) => {
  if (!registrations || registrations.length === 0) return null;

  const [isPending, startTransition] = useTransition();
  const deferredRegistrations = useDeferredValue(registrations);

  return (
    <View style={styles.registrationsCard}>
      <TitleText style={styles.cardTitle}>Your Registrations</TitleText>
      
      {deferredRegistrations.map((registration, index) => (
        <Animated.View 
          key={index} 
          style={styles.registrationItem}
          entering={FadeInDown.delay(index * 100)}
        >
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
        </Animated.View>
      ))}
    </View>
  );
});

RegistrationsList.displayName = 'RegistrationsList';

interface ReceiptActionsProps {
  result: EventRegistrationResult;
}

const ReceiptActions: React.FC<ReceiptActionsProps> = React.memo(({ result }) => {
  const [isPending, startTransition] = useTransition();

  const handleDownloadReceipt = () => {
    startTransition(() => {
      console.log('Download receipt');
    });
  };

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `Registration confirmed! Transaction ID: ${result.transaction_id}`,
        title: 'Event Registration Receipt',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.actionsCard}>
      <TitleText style={styles.cardTitle}>Receipt & Confirmation</TitleText>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, isPending && styles.actionButtonDisabled]} 
          onPress={handleDownloadReceipt}
          disabled={isPending}
        >
          <Download size={20} color={Colors.primary} />
          <LabelText style={styles.actionButtonText}>Download Receipt</LabelText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, isPending && styles.actionButtonDisabled]} 
          onPress={handleShareReceipt}
          disabled={isPending}
        >
          <ShareIcon size={20} color={Colors.primary} />
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
});

ReceiptActions.displayName = 'ReceiptActions';

// ================================
// MAIN COMPONENT
// ================================

const EventSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventSuccessRouteProp>();
  const { result } = route.params;

  // React 19 concurrent features
  const [isPending, startTransition] = useTransition();
  const deferredResult = useDeferredValue(result);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    // Animate content
    contentOpacity.value = withDelay(300, withSpring(1));
    contentTranslateY.value = withDelay(300, withSpring(0));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleBrowseEvents = () => {
    startTransition(() => {
      navigation.navigate('Events');
    });
  };

  // Determine success type
  const getSuccessType = () => {
    if (deferredResult.success) {
      return deferredResult.requires_followup ? 'partial' : 'full';
    }
    return 'error';
  };

  const successType = getSuccessType();

  const renderStatusMessage = () => {
    return (
      <View style={styles.statusMessage}>
        <TitleText style={styles.statusTitle}>
          {successType === 'full' ? 'Registration Successful!' : 
           successType === 'partial' ? 'Registration Received' : 
           'Registration Issue'}
        </TitleText>
        <BodyText style={styles.statusDescription}>
          {deferredResult.user_message}
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
          {deferredResult.requires_followup 
            ? 'Your registration is being processed. You will receive a confirmation email shortly.'
            : 'There was an issue with part of your registration. Please contact support if you don\'t receive confirmation within 24 hours.'}
        </BodyText>
      </View>
    );
  };

  const renderNextSteps = () => (
    <View style={styles.nextStepsCard}>
      <TitleText style={styles.cardTitle}>What's Next?</TitleText>
      
      <View style={styles.nextStepsList}>
        <Animated.View 
          style={styles.nextStepItem}
          entering={FadeInDown.delay(600)}
        >
          <View style={styles.nextStepNumber}>
            <CaptionText style={styles.nextStepNumberText}>1</CaptionText>
          </View>
          <BodyText style={styles.nextStepText}>
            Check your email for confirmation and event details
          </BodyText>
        </Animated.View>
        
        <Animated.View 
          style={styles.nextStepItem}
          entering={FadeInDown.delay(700)}
        >
          <View style={styles.nextStepNumber}>
            <CaptionText style={styles.nextStepNumberText}>2</CaptionText>
          </View>
          <BodyText style={styles.nextStepText}>
            Add the event to your calendar
          </BodyText>
        </Animated.View>
        
        <Animated.View 
          style={styles.nextStepItem}
          entering={FadeInDown.delay(800)}
        >
          <View style={styles.nextStepNumber}>
            <CaptionText style={styles.nextStepNumberText}>3</CaptionText>
          </View>
          <BodyText style={styles.nextStepText}>
            Arrive 15 minutes early for registration
          </BodyText>
        </Animated.View>
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
        <Suspense fallback={<StatusIconFallback />}>
          <StatusIcon successType={successType} />
        </Suspense>
        
        <Animated.View style={[styles.headerContent, contentStyle]}>
          {renderStatusMessage()}
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderWarningBanner()}
        
        <Animated.View style={contentStyle}>
          <Suspense fallback={<RegistrationDetailsFallback />}>
            <RegistrationDetails result={deferredResult} />
          </Suspense>
          
          <Suspense fallback={null}>
            <RegistrationsList registrations={deferredResult.registrations} />
          </Suspense>
          
          <Suspense fallback={<ReceiptActionsFallback />}>
            <ReceiptActions result={deferredResult} />
          </Suspense>
          
          {renderNextSteps()}
        </Animated.View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.browseButton, isPending && styles.browseButtonDisabled]} 
          onPress={handleBrowseEvents}
          disabled={isPending}
        >
          <ButtonText style={styles.browseButtonText}>Browse More Events</ButtonText>
          <ArrowRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
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
  
  // Loading states
  loadingCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
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
  actionButtonDisabled: {
    opacity: 0.5,
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
  browseButtonDisabled: {
    opacity: 0.5,
  },
  browseButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
};

export default EventSuccessScreen;