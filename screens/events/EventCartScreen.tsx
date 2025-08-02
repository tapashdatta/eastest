// screens/events/EventCartScreen.tsx
import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { useEventCart } from '@/contexts/EventContext';
import { formatDate } from '@/utils/dateUtils';
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Calendar, 
  Clock, 
  MapPin, 
  X, 
  CreditCard, 
  Users, 
  Ticket,
  ShoppingCart,
  Trash2,
  Edit3,
  CheckCircle
} from 'lucide-react-native';

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: any };
};

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

const EventCartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cart, removeFromCart, updateQuantity, cartTotals } = useEventCart();

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate('EventPayment');
  };

  const handleContinueShopping = () => {
    navigation.navigate('Events');
  };

  const handleRemoveItem = (itemId: string, eventTitle: string) => {
    Alert.alert(
      'Remove Event',
      `Remove "${eventTitle}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(itemId) }
      ]
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <ShoppingCart size={64} color={Colors.textMuted} />
      <TitleText style={styles.emptyCartTitle}>Your cart is empty</TitleText>
      <BodyText style={styles.emptyCartText}>
        Browse events and add registrations to get started
      </BodyText>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={handleContinueShopping}
      >
        <ButtonText style={styles.browseButtonText}>Browse Events</ButtonText>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = (item: any) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.cartItemHeader}>
        <View style={styles.eventTitleContainer}>
          <TitleText style={styles.eventTitle} numberOfLines={2}>
            {item.event_title}
          </TitleText>
          <TouchableOpacity 
            onPress={() => handleRemoveItem(item.id, item.event_title)}
            style={styles.removeButton}
            accessible={true}
            accessibilityLabel={`Remove ${item.event_title} from cart`}
            accessibilityRole="button"
          >
            <Trash2 size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cartItemDetails}>
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Calendar size={16} color={Colors.textSecondary} />
            <CaptionText style={styles.eventDetailText}>
              {formatDate(new Date(item.event_start_date), { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CaptionText>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Clock size={16} color={Colors.textSecondary} />
            <CaptionText style={styles.eventDetailText}>
              {new Date(item.event_start_date).toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </CaptionText>
          </View>
          
          {item.fee_label && (
            <View style={styles.feeInfo}>
              <Ticket size={16} color={Colors.primary} />
              <CaptionText style={styles.feeLabel}>{item.fee_label}</CaptionText>
            </View>
          )}
        </View>
        
        <View style={styles.priceAndQuantity}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                item.quantity <= 1 && styles.quantityButtonDisabled
              ]}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              accessible={true}
              accessibilityLabel="Decrease quantity"
              accessibilityRole="button"
            >
              <Minus size={16} color={item.quantity <= 1 ? Colors.textMuted : Colors.primary} />
            </TouchableOpacity>
            
            <View style={styles.quantityDisplay}>
              <LabelText style={styles.quantityText}>{item.quantity}</LabelText>
            </View>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              accessible={true}
              accessibilityLabel="Increase quantity"
              accessibilityRole="button"
            >
              <Plus size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceInfo}>
            <CaptionText style={styles.pricePerItem}>
              £{item.amount.toFixed(2)} each
            </CaptionText>
            <TitleText style={styles.totalPrice}>
              £{item.total.toFixed(2)}
            </TitleText>
          </View>
        </View>
      </View>

      {item.participant_info && (
        <View style={styles.participantInfo}>
          <Users size={16} color={Colors.textSecondary} />
          <CaptionText style={styles.participantText}>
            {item.participant_info.first_name && item.participant_info.last_name
              ? `${item.participant_info.first_name} ${item.participant_info.last_name}`
              : 'Participant details needed'
            }
          </CaptionText>
          <TouchableOpacity style={styles.editParticipant}>
            <Edit3 size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCartSummary = () => (
    <View style={styles.cartSummary}>
      <View style={styles.summaryHeader}>
        <TitleText style={styles.summaryTitle}>Registration Summary</TitleText>
      </View>
      
      <View style={styles.summaryContent}>
        <View style={styles.summaryRow}>
          <BodyText style={styles.summaryLabel}>Events</BodyText>
          <BodyText style={styles.summaryValue}>{cartTotals.itemCount}</BodyText>
        </View>
        
        <View style={styles.summaryRow}>
          <BodyText style={styles.summaryLabel}>Total Registrations</BodyText>
          <BodyText style={styles.summaryValue}>{cartTotals.registrationCount}</BodyText>
        </View>
        
        <View style={styles.summaryRow}>
          <BodyText style={styles.summaryLabel}>Subtotal</BodyText>
          <BodyText style={styles.summaryValue}>£{cartTotals.subtotal.toFixed(2)}</BodyText>
        </View>
        
        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryRow}>
          <TitleText style={styles.summaryTotalLabel}>Total</TitleText>
          <TitleText style={styles.summaryTotalValue}>£{cartTotals.total.toFixed(2)}</TitleText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <HeadlineText style={styles.headerTitle}>Event Cart</HeadlineText>
          {cart.length > 0 && (
            <CaptionText style={styles.headerSubtitle}>
              {cart.length} {cart.length === 1 ? 'event' : 'events'}
            </CaptionText>
          )}
        </View>
        
        <View style={styles.headerRight}>
          {cart.length > 0 && (
            <TouchableOpacity
              style={styles.continueShoppingButton}
              onPress={handleContinueShopping}
            >
              <Plus size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cart.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            <View style={styles.cartItems}>
              {cart.map(renderCartItem)}
            </View>
            {renderCartSummary()}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerSummary}>
              <CaptionText style={styles.footerTotalLabel}>Total</CaptionText>
              <TitleText style={styles.footerTotalValue}>
                £{cartTotals.total.toFixed(2)}
              </TitleText>
            </View>
            
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              accessible={true}
              accessibilityLabel={`Proceed to checkout with ${cart.length} events totaling £${cartTotals.total.toFixed(2)}`}
              accessibilityRole="button"
            >
              <View style={styles.checkoutButtonContent}>
                <CreditCard size={20} color={Colors.textLight} />
                <ButtonText style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </ButtonText>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

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
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  continueShoppingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  
  // Empty cart
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.xxxxl,
  },
  emptyCartTitle: {
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    fontSize: 24,
    fontWeight: '600',
  },
  emptyCartText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  browseButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Cart items
  cartItems: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  cartItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  cartItemHeader: {
    marginBottom: Spacing.lg,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.md,
    lineHeight: 24,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartItemDetails: {
    marginBottom: Spacing.lg,
  },
  eventDetails: {
    marginBottom: Spacing.lg,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  eventDetailText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  feeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  feeLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  priceAndQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  quantityButtonDisabled: {
    backgroundColor: Colors.surfaceSecondary,
  },
  quantityDisplay: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  pricePerItem: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  totalPrice: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  participantText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  editParticipant: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Cart summary
  cartSummary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  summaryHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  // Footer
  footer: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.lg,
  },
  footerContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  footerSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  footerTotalLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  footerTotalValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  checkoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  checkoutButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
};

export default EventCartScreen;