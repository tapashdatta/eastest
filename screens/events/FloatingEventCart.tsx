// screens/events/FloatingEventCart.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { LabelText, TitleText, CaptionText } from '@/components/Text';
import { useEventCart } from '@/contexts/EventContext';
import { EventRegistrationItem } from '@/types/event';
import { ShoppingCart, Ticket, ArrowRight, Calendar } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FloatingEventCartProps {
  cart: EventRegistrationItem[];
  onPress: () => void;
}

const FloatingEventCart: React.FC<FloatingEventCartProps> = React.memo(({ 
  cart, 
  onPress 
}) => {
  const { cartTotals } = useEventCart();
  
  // Don't render if cart is empty
  if (cart.length === 0) {
    return null;
  }

  const hasMultipleItems = cart.length > 1;
  const totalRegistrations = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.touchable}
        onPress={onPress}
        accessible={true}
        accessibilityLabel={`Event cart with ${cart.length} events, total £${cartTotals.total.toFixed(2)}`}
        accessibilityRole="button"
        accessibilityHint="Tap to view cart details"
        activeOpacity={0.9}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <ShoppingCart size={24} color={Colors.textLight} />
                <View style={styles.badge}>
                  <CaptionText style={styles.badgeText}>
                    {cart.length}
                  </CaptionText>
                </View>
              </View>
              
              <View style={styles.textContainer}>
                <LabelText style={styles.title}>
                  {hasMultipleItems ? 'Events Cart' : 'Event Cart'}
                </LabelText>
                <View style={styles.subtitleContainer}>
                  <Ticket size={12} color={Colors.textLight} />
                  <CaptionText style={styles.subtitle}>
                    {totalRegistrations} registration{totalRegistrations !== 1 ? 's' : ''}
                  </CaptionText>
                </View>
              </View>
            </View>
            
            <View style={styles.rightSection}>
              <View style={styles.priceContainer}>
                <TitleText style={styles.amount}>
                  £{cartTotals.total.toFixed(2)}
                </TitleText>
                <CaptionText style={styles.totalText}>
                  Total
                </CaptionText>
              </View>
              
              <View style={styles.arrowContainer}>
                <ArrowRight size={20} color={Colors.textLight} />
              </View>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
});

FloatingEventCart.displayName = 'FloatingEventCart';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 1000,
  },
  touchable: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  blurContainer: {
    backgroundColor: Colors.primary + '95',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    color: Colors.textLight,
    fontSize: 20,
    fontWeight: '700',
  },
  totalText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingEventCart;