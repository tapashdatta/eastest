import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { LabelText, TitleText, CaptionText } from '@/components/Text';
import { useDonationCart } from '@/contexts/DonationContext';
import { floatingCartStyles } from '@/styles/DonationStyles';
import type { DonationItem } from '@/contexts/DonationContext';
import { DonateIcon } from '@/assets/icons';

interface FloatingCartProps {
  cart: DonationItem[];
  onPress: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = React.memo(({ 
  cart, 
  onPress 
}) => {
  const { cartTotals } = useDonationCart();
  
  // Don't render if cart is empty
  if (cart.length === 0) {
    return null;
  }

  return (
    <View style={floatingCartStyles.container}>
      <TouchableOpacity 
        style={floatingCartStyles.content} 
        onPress={onPress}
        accessible={true}
        accessibilityLabel={`Shopping cart with ${cart.length} items, total £${cartTotals.subtotal.toFixed(2)}`}
        accessibilityRole="button"
        accessibilityHint="Tap to view cart details"
        activeOpacity={0.8}
      >
        <View style={floatingCartStyles.iconContainer}>
          <DonateIcon size={30} color={Colors.textLight} />
          <View style={floatingCartStyles.badge}>
            <CaptionText style={floatingCartStyles.badgeText}>
              {cart.length}
            </CaptionText>
          </View>
        </View>
        <View style={floatingCartStyles.textContainer}>
          <LabelText style={floatingCartStyles.title}>
            Cart
          </LabelText>
          <TitleText style={floatingCartStyles.amount}>
            £{cartTotals.subtotal.toFixed(2)}
          </TitleText>
        </View>
      </TouchableOpacity>
    </View>
  );
});

FloatingCart.displayName = 'FloatingCart';

export default FloatingCart;