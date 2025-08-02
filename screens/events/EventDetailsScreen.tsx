// screens/events/EventDetailsScreen.tsx - SIMPLIFIED VERSION WITH DESIGN SYSTEM
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Layout, Cards, Containers, Buttons } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { useEventCart } from '@/contexts/EventContext';
import { eventAPI } from '@/services/EventAPI';
import { CiviEvent, EventFee, EventRegistrationItem, EventStackParamList } from '@/types/event';
import { formatDate } from '@/utils/dateUtils';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  CheckCircle
} from 'lucide-react-native';

type EventDetailsRouteProp = RouteProp<EventStackParamList, 'EventDetails'>;
type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// Simplified Fee Option Component
const FeeOption: React.FC<{
  fee: EventFee;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ fee, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[
      Cards.base,
      styles.feeOption,
      isSelected && styles.feeOptionSelected
    ]}
    onPress={onSelect}
  >
    <View style={[Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
      <View style={Layout.flex1}>
        <LabelText style={styles.feeLabel}>{fee.label}</LabelText>
        <TitleText style={styles.feeAmount}>
          {fee.amount === 0 ? 'Free' : `£${fee.amount.toFixed(2)}`}
        </TitleText>
      </View>
      {isSelected && <CheckCircle size={20} color={Colors.success} />}
    </View>
  </TouchableOpacity>
);

const EventDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EventDetailsRouteProp>();
  const { eventId } = route.params;
  const { addToCart } = useEventCart();
  
  const [event, setEvent] = useState<CiviEvent | null>(null);
  const [fees, setFees] = useState<EventFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<EventFee | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Fetch event data
  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      
      const [eventResponse, feesResponse] = await Promise.all([
        eventAPI.getEventDetails(eventId),
        eventAPI.getEventFees(eventId)
      ]);

      if (eventResponse.success) {
        setEvent(eventResponse.event);
      }

      if (feesResponse.success) {
        setFees(feesResponse.fees);
        const defaultFee = feesResponse.fees.find(fee => fee.is_default) || feesResponse.fees[0];
        setSelectedFee(defaultFee || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Add to cart
  const handleAddToCart = useCallback(async () => {
    if (!event || !selectedFee) return;
    
    try {
      setAdding(true);
      
      const item: EventRegistrationItem = {
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

      addToCart(item);
      
      Alert.alert(
        'Added to Cart',
        `${event.title} has been added to your cart.`,
        [
          { text: 'Continue', style: 'default' },
          { text: 'View Cart', onPress: () => navigation.navigate('EventCart') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  }, [event, selectedFee, addToCart, navigation]);

  // Check if registration is available
  const canRegister = useCallback(() => {
    if (!event) return false;
    
    const now = new Date();
    const startDate = new Date(event.start_date);
    
    // Basic checks
    if (startDate < now) return false;
    if (!event.is_online_registration) return false;
    if (event.max_participants && event.current_participants && 
        event.current_participants >= event.max_participants) return false;
    
    return true;
  }, [event]);

  if (loading) {
    return (
      <View style={Containers.screen}>
        <View style={[Containers.header, Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <TitleText>Loading...</TitleText>
          <View style={styles.headerSpacer} />
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={Containers.screen}>
        <View style={[Containers.header, Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <TitleText>Event not found</TitleText>
          <View style={styles.headerSpacer} />
        </View>
      </View>
    );
  }

  return (
    <View style={Containers.screen}>
      {/* Header */}
      <View style={[Containers.header, Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <TitleText>Event Details</TitleText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={Layout.flex1}>
        {/* Event Image */}
        <Image 
          source={{ uri: event.image || `https://picsum.photos/400/300?random=${event.id}` }}
          style={styles.eventImage}
        />

        {/* Event Info */}
        <View style={styles.section}>
          <HeadlineText style={styles.eventTitle}>{event.title}</HeadlineText>
          
          {event.summary && (
            <BodyText style={styles.eventSummary}>{event.summary}</BodyText>
          )}

          {/* Event Details */}
          <View style={styles.detailsContainer}>
            <View style={[Layout.flexRow, Layout.centerVertical, styles.detailRow]}>
              <Calendar size={20} color={Colors.primary} />
              <BodyText style={styles.detailText}>
                {formatDate(new Date(event.start_date), { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </BodyText>
            </View>

            <View style={[Layout.flexRow, Layout.centerVertical, styles.detailRow]}>
              <Clock size={20} color={Colors.primary} />
              <BodyText style={styles.detailText}>
                {new Date(event.start_date).toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </BodyText>
            </View>

            {event.address && (
              <View style={[Layout.flexRow, Layout.centerVertical, styles.detailRow]}>
                <MapPin size={20} color={Colors.primary} />
                <BodyText style={styles.detailText}>
                  {[event.address.street_address, event.address.city].filter(Boolean).join(', ')}
                </BodyText>
              </View>
            )}

            {event.max_participants && (
              <View style={[Layout.flexRow, Layout.centerVertical, styles.detailRow]}>
                <Users size={20} color={Colors.primary} />
                <BodyText style={styles.detailText}>
                  {event.current_participants || 0} / {event.max_participants} registered
                </BodyText>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <TitleText style={styles.sectionTitle}>About This Event</TitleText>
            <BodyText style={styles.description}>{event.description}</BodyText>
          </View>
        )}

        {/* Registration Options */}
        {canRegister() && fees.length > 0 && (
          <View style={styles.section}>
            <TitleText style={styles.sectionTitle}>Registration Options</TitleText>
            
            <View style={styles.feesContainer}>
              {fees.map((fee) => (
                <FeeOption
                  key={fee.id}
                  fee={fee}
                  isSelected={selectedFee?.id === fee.id}
                  onSelect={() => setSelectedFee(fee)}
                />
              ))}
            </View>
          </View>
        )}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Action */}
      {canRegister() && selectedFee && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              Buttons.primary,
              styles.addButton,
              adding && styles.addButtonDisabled
            ]}
            onPress={handleAddToCart}
            disabled={adding}
          >
            <View style={[Layout.flexRow, Layout.centerVertical, styles.addButtonContent]}>
              <CreditCard size={20} color={Colors.textLight} />
              <ButtonText style={styles.addButtonText}>
                {adding ? 'Adding...' : `Add to Cart - £${selectedFee.amount.toFixed(2)}`}
              </ButtonText>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  eventImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  section: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  eventTitle: {
    ...Typography.headlineMedium,
    color: Colors.text,
  },
  eventSummary: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailsContainer: {
    gap: Spacing.md,
  },
  detailRow: {
    gap: Spacing.md,
  },
  detailText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  feesContainer: {
    gap: Spacing.md,
  },
  feeOption: {
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  feeOptionSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  feeLabel: {
    ...Typography.titleSmall,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  feeAmount: {
    ...Typography.titleMedium,
    color: Colors.primary,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomBar: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addButton: {
    // Inherits from Buttons.primary
  },
  addButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  addButtonContent: {
    gap: Spacing.md,
  },
  addButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
});

export default EventDetailsScreen;