// screens/events/EventDetailsScreen.tsx - Modern EventDetailsScreen with React 19
import React, { Suspense, use, startTransition, useMemo, useCallback, useDeferredValue } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Platform, Alert, Dimensions, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { Text, HeadlineText, TitleText, BodyText, LabelText, CaptionText, ButtonText } from '@/components/Text';
import { useEventCart, useEventData } from '@/stores/eventStore';
import { eventAPI } from '@/services/EventAPI';
import { CiviEvent, EventFee, EventRegistrationItem } from '@/types/event';
import { formatDate } from '@/utils/dateUtils';
import Logger from '@/utils/Logger';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Info,
  Ticket,
  CreditCard,
  Star,
  AlertCircle,
  CheckCircle,
  Share,
  Heart,
  ExternalLink,
  MapPinIcon,
  Globe,
  Loader
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: any };
};

type EventDetailsRouteProp = RouteProp<EventStackParamList, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// ================================
// MODERN LOADING COMPONENTS
// ================================

const DetailsSkeleton: React.FC = React.memo(() => (
  <View style={styles.container}>
    <StatusBar style="light" backgroundColor="transparent" translucent />
    
    {/* Header Skeleton */}
    <View style={styles.skeletonHeader}>
      <View style={styles.skeletonButton} />
      <View style={styles.skeletonHeaderTitle} />
      <View style={styles.skeletonButton} />
    </View>
    
    {/* Hero Skeleton */}
    <View style={styles.skeletonHero} />
    
    {/* Content Skeleton */}
    <View style={styles.skeletonContent}>
      <View style={[styles.skeletonText, { width: '80%', height: 24 }]} />
      <View style={[styles.skeletonText, { width: '60%', height: 16, marginTop: 8 }]} />
      <View style={styles.skeletonQuickInfo}>
        {Array.from({ length: 4 }, (_, i) => (
          <View key={i} style={styles.skeletonQuickCard} />
        ))}
      </View>
    </View>
  </View>
));

const LoadingOverlay: React.FC<{ message?: string }> = React.memo(({ message = 'Loading event...' }) => (
  <View style={styles.loadingOverlay}>
    <Loader size={32} color={Colors.primary} />
    <TitleText style={styles.loadingText}>{message}</TitleText>
  </View>
));

// ================================
// FEE OPTION COMPONENT WITH OPTIMIZATIONS
// ================================

interface FeeOptionProps {
  fee: EventFee;
  isSelected: boolean;
  onSelect: () => void;
}

const FeeOption: React.FC<FeeOptionProps> = React.memo(({ fee, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.feeOption,
      isSelected && styles.feeOptionSelected,
      fee.amount === 0 && styles.feeOptionFree
    ]}
    onPress={onSelect}
    activeOpacity={0.8}
  >
    <View style={styles.feeOptionContent}>
      <View style={styles.feeInfo}>
        <View style={styles.feeHeader}>
          <LabelText style={[
            styles.feeLabel,
            isSelected && styles.feeLabelSelected
          ]}>
            {fee.label}
          </LabelText>
          <TitleText style={[
            styles.feeAmount,
            isSelected && styles.feeAmountSelected,
            fee.amount === 0 && styles.feeAmountFree
          ]}>
            {fee.amount === 0 ? 'Free' : `£${fee.amount.toFixed(2)}`}
          </TitleText>
        </View>
        {fee.description && (
          <CaptionText style={[
            styles.feeDescription,
            isSelected && styles.feeDescriptionSelected
          ]}>
            {fee.description}
          </CaptionText>
        )}
        {fee.max_participants && (
          <View style={styles.feeLimitContainer}>
            <Users size={12} color={Colors.textSecondary} />
            <CaptionText style={[
              styles.feeLimit,
              isSelected && styles.feeLimitSelected
            ]}>
              Max {fee.max_participants} participants
            </CaptionText>
          </View>
        )}
      </View>
    </View>
    
    {isSelected && (
      <View style={styles.selectedIndicator}>
        <CheckCircle size={20} color={Colors.success} />
      </View>
    )}
  </TouchableOpacity>
));

// ================================
// EVENT DETAILS DATA FETCHER
// ================================

const EventDetailsProvider: React.FC<{ 
  eventId: number; 
  children: (data: { event: CiviEvent; fees: EventFee[] }) => React.ReactNode;
}> = ({ eventId, children }) => {
  // Use React 19's `use()` hook for concurrent data fetching
  const eventDetailsPromise = useMemo(() => eventAPI.getEventDetails(eventId), [eventId]);
  const eventFeesPromise = useMemo(() => eventAPI.getEventFees(eventId), [eventId]);
  
  const eventDetailsResponse = use(eventDetailsPromise);
  const eventFeesResponse = use(eventFeesPromise);
  
  if (!eventDetailsResponse.success) {
    throw new Error(eventDetailsResponse.error || 'Failed to load event details');
  }
  
  if (!eventFeesResponse.success) {
    throw new Error(eventFeesResponse.error || 'Failed to load event fees');
  }
  
  return children({ 
    event: eventDetailsResponse.event, 
    fees: eventFeesResponse.fees 
  });
};

// ================================
// MAIN EVENT DETAILS CONTENT
// ================================

const EventDetailsContent: React.FC<{ 
  event: CiviEvent; 
  fees: EventFee[];
  navigation: NavigationProp;
}> = React.memo(({ event, fees, navigation }) => {
  const { addToCart } = useEventCart();
  
  const [selectedFee, setSelectedFee] = React.useState<EventFee | null>(null);
  const [addingToCart, setAddingToCart] = React.useState(false);
  const [scrollY] = React.useState(new Animated.Value(0));

  // Set default fee when fees load
  React.useEffect(() => {
    if (fees.length > 0 && !selectedFee) {
      const defaultFee = fees.find(fee => fee.is_default) || fees[0];
      setSelectedFee(defaultFee);
    }
  }, [fees, selectedFee]);

  // Memoized calculations
  const registrationStatus = useMemo(() => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const regStartDate = event.registration_start_date ? new Date(event.registration_start_date) : null;
    const regEndDate = event.registration_end_date ? new Date(event.registration_end_date) : null;
    
    // Check if event has passed
    if (startDate < now) {
      return { available: false, message: 'Event has already started' };
    }
    
    // Check registration window
    if (regStartDate && now < regStartDate) {
      return { available: false, message: 'Registration not yet open' };
    }
    
    if (regEndDate && now > regEndDate) {
      return { available: false, message: 'Registration has closed' };
    }
    
    // Check if full
    if (event.max_participants && event.current_participants && 
        event.current_participants >= event.max_participants) {
      return { available: false, message: 'Event is full' };
    }
    
    // Check if online registration is enabled
    if (!event.is_online_registration) {
      return { available: false, message: 'Online registration not available' };
    }
    
    return { available: true, message: 'Registration available' };
  }, [event]);

  const imageUrl = useMemo(() => 
    event.image || `https://picsum.photos/400/300?random=${event.id}`,
    [event.image, event.id]
  );

  // Add to cart handler with transition
  const handleAddToCart = useCallback(async () => {
    if (!event || !selectedFee) return;
    
    try {
      setAddingToCart(true);
      
      const registrationItem: EventRegistrationItem = {
        id: `event_${event.id}_${selectedFee.id}_${Date.now()}`,
        event_id: event.id,
        event_title: event.title,
        event_start_date: event.start_date,
        fee_id: selectedFee.id,
        fee_label: selectedFee.label,
        amount: selectedFee.amount,
        quantity: 1,
        total: selectedFee.amount,
        participant_info: {
          first_name: '',
          last_name: '',
          email: '',
        },
      };

      await addToCart(registrationItem);
      
      Alert.alert(
        'Added to Cart',
        `${event.title} has been added to your cart.`,
        [
          { text: 'Continue', style: 'default' },
          { text: 'View Cart', onPress: () => navigation.navigate('EventCart') }
        ]
      );
      
      Logger.info('Event added to cart', { eventId: event.id, feeId: selectedFee.id });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to cart';
      Alert.alert('Error', errorMessage);
      Logger.error('Add to cart failed', err);
    } finally {
      setAddingToCart(false);
    }
  }, [event, selectedFee, addToCart, navigation]);

  // Navigation handlers
  const handleBackPress = useCallback(() => {
    startTransition(() => {
      navigation.goBack();
    });
  }, [navigation]);

  const handleViewCart = useCallback(() => {
    navigation.navigate('EventCart');
  }, [navigation]);

  const handleShare = useCallback(() => {
    if (event) {
      Alert.alert('Share Event', `Share "${event.title}" with others?`);
    }
  }, [event]);

  // Header animation
  const headerBackgroundOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Animated Header */}
      <Animated.View style={[
        styles.animatedHeader,
        { backgroundColor: headerBackgroundOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: ['transparent', Colors.surface + 'CC']
        }) }
      ]}>
        <BlurView intensity={20} style={styles.headerBlur}>
          <View style={styles.headerControls}>
            <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
              <ArrowLeft size={24} color={Colors.textLight} />
            </TouchableOpacity>
            
            <Animated.View style={[styles.headerTitle, { opacity: headerTitleOpacity }]}>
              <TitleText style={styles.headerTitleText} numberOfLines={1}>
                {event.title}
              </TitleText>
            </Animated.View>
            
            <View style={styles.headerRightControls}>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <Share size={24} color={Colors.textLight} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleViewCart} style={styles.headerButton}>
                <Ticket size={24} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: imageUrl }}
            style={styles.heroImage}
            defaultSource={require('@/assets/images/event-placeholder.png')}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={styles.heroOverlay}
          />
          
          {/* Event Type Badge */}
          <View style={styles.eventTypeBadge}>
            <Star size={12} color={Colors.textLight} />
            <CaptionText style={styles.eventTypeBadgeText}>{event.event_type_name}</CaptionText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title and Summary */}
          <View style={styles.titleSection}>
            <HeadlineText style={styles.eventTitle}>{event.title}</HeadlineText>
            
            {event.summary && (
              <BodyText style={styles.eventSummary}>{event.summary}</BodyText>
            )}
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoGrid}>
            <View style={styles.quickInfoCard}>
              <Calendar size={20} color={Colors.primary} />
              <View style={styles.quickInfoContent}>
                <LabelText style={styles.quickInfoLabel}>Date</LabelText>
                <CaptionText style={styles.quickInfoValue}>
                  {formatDate(new Date(event.start_date), { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </CaptionText>
              </View>
            </View>

            <View style={styles.quickInfoCard}>
              <Clock size={20} color={Colors.primary} />
              <View style={styles.quickInfoContent}>
                <LabelText style={styles.quickInfoLabel}>Time</LabelText>
                <CaptionText style={styles.quickInfoValue}>
                  {new Date(event.start_date).toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </CaptionText>
              </View>
            </View>

            {event.address && (
              <View style={styles.quickInfoCard}>
                <MapPin size={20} color={Colors.primary} />
                <View style={styles.quickInfoContent}>
                  <LabelText style={styles.quickInfoLabel}>Location</LabelText>
                  <CaptionText style={styles.quickInfoValue}>
                    {event.address.city || 'London'}
                  </CaptionText>
                </View>
              </View>
            )}

            {event.max_participants && (
              <View style={styles.quickInfoCard}>
                <Users size={20} color={Colors.primary} />
                <View style={styles.quickInfoContent}>
                  <LabelText style={styles.quickInfoLabel}>Capacity</LabelText>
                  <CaptionText style={styles.quickInfoValue}>
                    {event.current_participants || 0} / {event.max_participants}
                  </CaptionText>
                </View>
              </View>
            )}
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Calendar size={20} color={Colors.primary} />
                <View style={styles.detailContent}>
                  <LabelText style={styles.detailLabel}>Full Date & Time</LabelText>
                  <BodyText style={styles.detailValue}>
                    {formatDate(new Date(event.start_date), { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </BodyText>
                  <CaptionText style={styles.detailSubValue}>
                    {new Date(event.start_date).toLocaleTimeString('en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString('en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}`}
                  </CaptionText>
                </View>
              </View>

              {event.address && (
                <View style={styles.detailRow}>
                  <MapPin size={20} color={Colors.primary} />
                  <View style={styles.detailContent}>
                    <LabelText style={styles.detailLabel}>Location</LabelText>
                    <BodyText style={styles.detailValue}>
                      {event.address.name && `${event.address.name}\n`}
                      {event.address.street_address && `${event.address.street_address}\n`}
                      {event.address.city && `${event.address.city}`}
                      {event.address.postal_code && ` ${event.address.postal_code}`}
                    </BodyText>
                  </View>
                </View>
              )}

              {event.max_participants && (
                <View style={styles.detailRow}>
                  <Users size={20} color={Colors.primary} />
                  <View style={styles.detailContent}>
                    <LabelText style={styles.detailLabel}>Capacity</LabelText>
                    <BodyText style={styles.detailValue}>
                      {event.current_participants || 0} / {event.max_participants} registered
                    </BodyText>
                    <View style={styles.capacityBar}>
                      <View style={[
                        styles.capacityFill,
                        { width: `${Math.min(100, ((event.current_participants || 0) / event.max_participants) * 100)}%` }
                      ]} />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descriptionSection}>
              <TitleText style={styles.sectionTitle}>About This Event</TitleText>
              <View style={styles.descriptionCard}>
                <BodyText style={styles.description}>{event.description}</BodyText>
              </View>
            </View>
          )}

          {/* Registration Options */}
          {registrationStatus.available && fees.length > 0 && (
            <View style={styles.registrationSection}>
              <TitleText style={styles.sectionTitle}>Registration Options</TitleText>
              
              {fees.map((fee) => (
                <FeeOption
                  key={fee.id}
                  fee={fee}
                  isSelected={selectedFee?.id === fee.id}
                  onSelect={() => setSelectedFee(fee)}
                />
              ))}
            </View>
          )}

          {/* Additional Info */}
          {event.intro_text && (
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Info size={20} color={Colors.info} />
                <BodyText style={styles.infoText}>{event.intro_text}</BodyText>
              </View>
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {registrationStatus.available ? (
          <TouchableOpacity
            style={[
              styles.registerButton,
              (!selectedFee || addingToCart) && styles.registerButtonDisabled
            ]}
            onPress={handleAddToCart}
            disabled={!selectedFee || addingToCart}
          >
            <View style={styles.registerButtonContent}>
              {addingToCart ? (
                <Loader size={20} color={Colors.textLight} />
              ) : (
                <CreditCard size={20} color={Colors.textLight} />
              )}
              <ButtonText style={styles.registerButtonText}>
                {addingToCart ? 'Adding...' : 
                 selectedFee ? `Add to Cart - £${selectedFee.amount.toFixed(2)}` : 
                 'Select Option'}
              </ButtonText>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.unavailableContainer}>
            <AlertCircle size={20} color={Colors.error} />
            <BodyText style={styles.unavailableText}>
              {registrationStatus.message}
            </BodyText>
          </View>
        )}
      </View>
    </View>
  );
});

// ================================
// MAIN COMPONENT WITH SUSPENSE
// ================================

const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailsRouteProp>();
  const { eventId } = route.params;

  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <EventDetailsProvider eventId={eventId}>
        {({ event, fees }) => (
          <EventDetailsContent 
            event={event} 
            fees={fees} 
            navigation={navigation}
          />
        )}
      </EventDetailsProvider>
    </Suspense>
  );
};

// ================================
// STYLES
// ================================

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  
  // Loading states
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  
  // Skeleton styles
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  skeletonButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
  },
  skeletonHeaderTitle: {
    width: 120,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  skeletonHero: {
    height: 350,
    backgroundColor: Colors.border,
  },
  skeletonContent: {
    padding: Spacing.xl,
  },
  skeletonText: {
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  skeletonQuickInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  skeletonQuickCard: {
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
    height: 80,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  
  // Header styles
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBlur: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.md,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  headerTitleText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  headerRightControls: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  // Content styles
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    position: 'relative',
    height: 350,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  eventTypeBadge: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  eventTypeBadgeText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleSection: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventTitle: {
    marginBottom: Spacing.md,
    fontSize: 28,
    fontWeight: '700',
  },
  eventSummary: {
    color: Colors.textSecondary,
    lineHeight: 22,
    fontSize: 16,
  },
  
  quickInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  quickInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flex: 1,
    minWidth: '45%',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  quickInfoContent: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  
  detailsSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  detailContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  detailValue: {
    color: Colors.text,
    lineHeight: 20,
    fontSize: 15,
  },
  detailSubValue: {
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontSize: 13,
  },
  capacityBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  
  descriptionSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  descriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 24,
    fontSize: 15,
  },
  
  registrationSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  feeOption: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
    ...Shadows.sm,
  },
  feeOptionSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  feeOptionFree: {
    borderColor: Colors.success,
  },
  feeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeInfo: {
    flex: 1,
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  feeLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  feeLabelSelected: {
    color: Colors.success,
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  feeAmountSelected: {
    color: Colors.success,
  },
  feeAmountFree: {
    color: Colors.success,
  },
  feeDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  feeDescriptionSelected: {
    color: Colors.textSecondary,
  },
  feeLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  feeLimit: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  feeLimitSelected: {
    color: Colors.textSecondary,
  },
  selectedIndicator: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  
  infoSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.info + '20',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  bottomSpacing: {
    height: 120,
  },
  
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  registerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  registerButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  
  unavailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  unavailableText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EventDetailsScreen;