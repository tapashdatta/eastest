// screens/events/FloatingEventCart.tsx - Modern React 19 Implementation
import React, { useDeferredValue, useTransition, useMemo, Suspense } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { LabelText, TitleText, CaptionText } from '@/components/Text';
import { useEventStore } from '@/stores/eventStore';
import type { EventRegistrationItem, EventCartTotals } from '@/types/event';
import { ShoppingCart, Ticket, ArrowRight, Calendar, Users, Star, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ================================
// MODERN TYPES WITH REACT 19 PATTERNS
// ================================

interface FloatingEventCartProps {
  cart: EventRegistrationItem[];
  onPress: () => void;
  variant?: 'default' | 'compact' | 'premium';
  showPreview?: boolean;
  animationType?: 'spring' | 'timing' | 'bounce';
}

interface CartPreviewProps {
  items: EventRegistrationItem[];
  maxItems?: number;
}

interface CartBadgeProps {
  count: number;
  animated?: boolean;
}

// ================================
// SUSPENSE FALLBACK COMPONENTS
// ================================

const CartFallback = () => (
  <View style={[styles.container, styles.fallbackContainer]}>
    <View style={styles.fallbackContent}>
      <ShoppingCart size={20} color={Colors.textMuted} />
      <CaptionText style={styles.fallbackText}>Loading cart...</CaptionText>
    </View>
  </View>
);

// ================================
// MODERN CART BADGE COMPONENT
// ================================

const CartBadge: React.FC<CartBadgeProps> = React.memo(({ count, animated = true }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      scale.value = withSpring(1.2, { damping: 15 }, () => {
        scale.value = withSpring(1, { damping: 15 });
      });
    }
  }, [count, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (count === 0) return null;

  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      <CaptionText style={styles.badgeText} numberOfLines={1}>
        {count > 99 ? '99+' : count.toString()}
      </CaptionText>
    </Animated.View>
  );
});

CartBadge.displayName = 'CartBadge';

// ================================
// CART PREVIEW COMPONENT
// ================================

const CartPreview: React.FC<CartPreviewProps> = React.memo(({ items, maxItems = 2 }) => {
  const [isPending, startTransition] = useTransition();
  const deferredItems = useDeferredValue(items);
  
  const previewItems = useMemo(() => 
    deferredItems.slice(0, maxItems), [deferredItems, maxItems]
  );

  const hasMoreItems = deferredItems.length > maxItems;

  if (deferredItems.length === 0) return null;

  return (
    <View style={styles.previewContainer}>
      {previewItems.map((item, index) => (
        <Animated.View 
          key={item.id}
          style={styles.previewItem}
          entering={FadeInUp.delay(index * 100)}
          exiting={FadeOutDown}
        >
          <View style={styles.previewItemContent}>
            <CaptionText style={styles.previewItemTitle} numberOfLines={1}>
              {item.event_title}
            </CaptionText>
            <View style={styles.previewItemMeta}>
              <Calendar size={10} color={Colors.textSecondary} />
              <CaptionText style={styles.previewItemDate}>
                {new Date(item.event_start_date).toLocaleDateString('en-GB', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </CaptionText>
            </View>
          </View>
          <CaptionText style={styles.previewItemPrice}>
            £{item.total.toFixed(2)}
          </CaptionText>
        </Animated.View>
      ))}
      
      {hasMoreItems && (
        <View style={styles.moreItemsIndicator}>
          <Plus size={12} color={Colors.textSecondary} />
          <CaptionText style={styles.moreItemsText}>
            {deferredItems.length - maxItems} more
          </CaptionText>
        </View>
      )}
    </View>
  );
});

CartPreview.displayName = 'CartPreview';

// ================================
// ENHANCED CART STATS COMPONENT
// ================================

interface CartStatsProps {
  cartTotals: EventCartTotals;
  variant: 'default' | 'compact' | 'premium';
}

const CartStats: React.FC<CartStatsProps> = React.memo(({ cartTotals, variant }) => {
  const totalRegistrations = cartTotals.registrationCount;
  const hasMultipleItems = cartTotals.itemCount > 1;

  if (variant === 'compact') {
    return (
      <View style={styles.statsCompact}>
        <CaptionText style={styles.statsText}>
          {cartTotals.itemCount} event{cartTotals.itemCount !== 1 ? 's' : ''}
        </CaptionText>
      </View>
    );
  }

  return (
    <View style={styles.stats}>
      <LabelText style={styles.title}>
        {hasMultipleItems ? 'Events Cart' : 'Event Cart'}
      </LabelText>
      <View style={styles.subtitleContainer}>
        <Ticket size={12} color={Colors.textLight} />
        <CaptionText style={styles.subtitle}>
          {totalRegistrations} registration{totalRegistrations !== 1 ? 's' : ''}
        </CaptionText>
        {variant === 'premium' && (
          <>
            <Star size={10} color={Colors.warning} />
            <CaptionText style={styles.premiumText}>Premium</CaptionText>
          </>
        )}
      </View>
    </View>
  );
});

CartStats.displayName = 'CartStats';

// ================================
// MAIN FLOATING CART COMPONENT
// ================================

const FloatingEventCart: React.FC<FloatingEventCartProps> = React.memo(({ 
  cart, 
  onPress,
  variant = 'default',
  showPreview = false,
  animationType = 'spring'
}) => {
  // React 19 concurrent features
  const [isPending, startTransition] = useTransition();
  const deferredCart = useDeferredValue(cart);
  
  // Get cart totals from store
  const { cartTotals } = useEventStore();
  const deferredTotals = useDeferredValue(cartTotals);
  
  // Animation values
  const translateY = useSharedValue(100);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  // Memoized computed values
  const shouldShow = useMemo(() => deferredCart.length > 0, [deferredCart.length]);
  
  const containerVariant = useMemo(() => {
    switch (variant) {
      case 'compact':
        return styles.touchableCompact;
      case 'premium':
        return styles.touchablePremium;
      default:
        return styles.touchable;
    }
  }, [variant]);

  // Entrance/exit animations
  React.useEffect(() => {
    if (shouldShow) {
      const animationConfig = animationType === 'spring' 
        ? { damping: 20, stiffness: 300 }
        : { duration: 300 };

      if (animationType === 'spring') {
        translateY.value = withSpring(0, animationConfig);
        scale.value = withSpring(1, animationConfig);
        opacity.value = withSpring(1, animationConfig);
      } else {
        translateY.value = withTiming(0, animationConfig);
        scale.value = withTiming(1, animationConfig);
        opacity.value = withTiming(1, animationConfig);
      }
    } else {
      translateY.value = withTiming(100, { duration: 200 });
      scale.value = withTiming(0.9, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [shouldShow, animationType]);

  // Handle press with concurrent features
  const handlePress = () => {
    if (isPending) return;
    
    startTransition(() => {
      onPress();
    });
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  // Don't render if cart is empty
  if (!shouldShow) {
    return null;
  }

  // Get blur intensity based on platform
  const blurIntensity = Platform.OS === 'ios' ? 20 : 0;
  const fallbackBackgroundColor = Platform.OS === 'ios' 
    ? Colors.primary + '95' 
    : Colors.primary + 'DD';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        style={containerVariant}
        onPress={handlePress}
        accessible={true}
        accessibilityLabel={`Event cart with ${deferredCart.length} events, total £${deferredTotals.total.toFixed(2)}`}
        accessibilityRole="button"
        accessibilityHint="Tap to view cart details"
        activeOpacity={0.9}
        disabled={isPending}
      >
        <Suspense fallback={<CartFallback />}>
          {Platform.OS === 'ios' ? (
            <BlurView intensity={blurIntensity} style={styles.blurContainer}>
              <View style={[styles.contentContainer, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                <CartContent 
                  cart={deferredCart}
                  cartTotals={deferredTotals}
                  variant={variant}
                  showPreview={showPreview}
                  isPending={isPending}
                />
              </View>
            </BlurView>
          ) : (
            <View style={[styles.blurContainer, { backgroundColor: fallbackBackgroundColor }]}>
              <View style={styles.contentContainer}>
                <CartContent 
                  cart={deferredCart}
                  cartTotals={deferredTotals}
                  variant={variant}
                  showPreview={showPreview}
                  isPending={isPending}
                />
              </View>
            </View>
          )}
        </Suspense>
      </TouchableOpacity>
    </Animated.View>
  );
});

FloatingEventCart.displayName = 'FloatingEventCart';

// ================================
// CART CONTENT COMPONENT
// ================================

interface CartContentProps {
  cart: EventRegistrationItem[];
  cartTotals: EventCartTotals;
  variant: 'default' | 'compact' | 'premium';
  showPreview: boolean;
  isPending: boolean;
}

const CartContent: React.FC<CartContentProps> = React.memo(({ 
  cart, 
  cartTotals, 
  variant, 
  showPreview,
  isPending 
}) => {
  return (
    <View style={styles.content}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <ShoppingCart size={24} color={Colors.textLight} />
          <CartBadge count={cart.length} animated={!isPending} />
        </View>
        
        <CartStats cartTotals={cartTotals} variant={variant} />
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
        
        <View style={[styles.arrowContainer, isPending && styles.arrowContainerDisabled]}>
          <ArrowRight size={20} color={Colors.textLight} />
        </View>
      </View>

      {showPreview && (
        <View style={styles.previewSection}>
          <CartPreview items={cart} maxItems={2} />
        </View>
      )}
    </View>
  );
});

CartContent.displayName = 'CartContent';

// ================================
// STYLES
// ================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.xl,
    right: Spacing.xl,
    zIndex: 1000,
  },
  fallbackContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.xl,
  },
  fallbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  fallbackText: {
    color: Colors.textMuted,
  },
  touchable: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  touchableCompact: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  touchablePremium: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.xl,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
  },
  blurContainer: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    overflow: 'hidden',
  },
  contentContainer: {
    borderRadius: BorderRadius.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 72,
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
  
  // Stats
  stats: {
    flex: 1,
  },
  statsCompact: {
    flex: 1,
  },
  statsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
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
  premiumText: {
    color: Colors.warning,
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Right section
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
  arrowContainerDisabled: {
    opacity: 0.5,
  },
  
  // Preview section
  previewSection: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    marginBottom: Spacing.md,
  },
  previewContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  previewItemContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  previewItemTitle: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  previewItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewItemDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  previewItemPrice: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  moreItemsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  moreItemsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
});

export default FloatingEventCart;