import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/Colors';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { useDonationCart } from '@/contexts/DonationContext';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, Info, X, Gift, Sparkles, TrendingUp } from 'lucide-react-native';
import { DonateIcon } from '@/assets/icons';
import { 
  sharedStyles, 
  screenStyles, 
  cartStyles, 
  enhancedGiftAidStyles 
} from '@/styles/DonationStyles';

type DonationStackParamList = {
  Donate: undefined;
  Cart: undefined;
  Payment: undefined;
  Success: { result: any };
};

type NavigationProp = NativeStackNavigationProp<DonationStackParamList>;

const CartScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cart, removeFromCart, updateQuantity, cartTotals, giftAidEnabled, setGiftAidEnabled } = useDonationCart();
  
  const toggleAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: giftAidEnabled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [giftAidEnabled]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate('Payment');
  };

  const renderEmptyCart = () => (
    <View style={cartStyles.emptyCart}>
      <ShoppingCart size={48} color={Colors.textMuted} />
      <BodyText style={cartStyles.emptyCartText}>Your cart is empty</BodyText>
      <CaptionText style={cartStyles.emptyCartSubtext}>
        Add donations to get started
      </CaptionText>
    </View>
  );

  const renderCartItem = (item: any) => (
    <View key={item.id} style={cartStyles.cartItem}>
      <View style={cartStyles.cartItemHeader}>
        <TitleText style={cartStyles.cartItemTitle}>{item.category}</TitleText>
        <TouchableOpacity 
          onPress={() => removeFromCart(item.id)}
          accessible={true}
          accessibilityLabel={`Remove ${item.category} from cart`}
          accessibilityRole="button"
        >
          <X size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={cartStyles.cartItemDetails}>
        <BodyText style={cartStyles.cartItemAmount}>£{item.amount.toFixed(2)} each</BodyText>
        
        <View style={cartStyles.quantityControls}>
          <TouchableOpacity
            style={cartStyles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            accessible={true}
            accessibilityLabel="Decrease quantity"
            accessibilityRole="button"
          >
            <Minus size={14} color={Colors.primary} />
          </TouchableOpacity>
          <LabelText style={cartStyles.quantityText}>{item.quantity}</LabelText>
          <TouchableOpacity
            style={cartStyles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            accessible={true}
            accessibilityLabel="Increase quantity"
            accessibilityRole="button"
          >
            <Plus size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <TitleText style={cartStyles.cartItemTotal}>£{item.total.toFixed(2)}</TitleText>
      </View>

      {item.sponsorship_date && (
        <CaptionText style={cartStyles.cartItemMeta}>
          Date: {item.sponsorship_date}
        </CaptionText>
      )}
      
      {item.message && (
        <CaptionText style={cartStyles.cartItemMeta}>
          Message: {item.message}
        </CaptionText>
      )}
    </View>
  );

  const renderEnhancedGiftAidSection = () => (
    <View style={enhancedGiftAidStyles.container}>
      <View style={[
        enhancedGiftAidStyles.headerGradient,
        { backgroundColor: giftAidEnabled ? Colors.success + '15' : Colors.highlight }
      ]}>
        <View style={enhancedGiftAidStyles.headerContent}>
          <View style={enhancedGiftAidStyles.iconContainer}>
            <Gift size={24} color={Colors.primary} />
            <View style={enhancedGiftAidStyles.sparkleContainer}>
              <Sparkles size={16} color={Colors.warning} />
            </View>
          </View>
          <View style={enhancedGiftAidStyles.headerText}>
            <TitleText style={enhancedGiftAidStyles.title}>Gift Aid</TitleText>
            <BodyText style={enhancedGiftAidStyles.subtitle}>
              Add 25% more value at no extra cost
            </BodyText>
          </View>
          <TouchableOpacity
            onPress={() => setGiftAidEnabled(!giftAidEnabled)}
            accessible={true}
            accessibilityLabel={`Gift Aid ${giftAidEnabled ? 'enabled' : 'disabled'}`}
            accessibilityRole="switch"
            accessibilityState={{ checked: giftAidEnabled }}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                enhancedGiftAidStyles.toggle,
                {
                  backgroundColor: toggleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Colors.border, Colors.success],
                  }),
                },
              ]}
            >
              <Animated.View
                style={[
                  enhancedGiftAidStyles.toggleButton,
                  {
                    transform: [
                      {
                        translateX: toggleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [2, 24],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {giftAidEnabled && (
                  <Animated.View style={{ opacity: toggleAnim }}>
                    <Check size={16} color={Colors.success} />
                  </Animated.View>
                )}
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={enhancedGiftAidStyles.benefitContainer}>
        <View style={enhancedGiftAidStyles.sideBySideContainer}>
          <View style={enhancedGiftAidStyles.benefitColumn}>
            <View style={enhancedGiftAidStyles.benefitIcon}>
              <TrendingUp size={18} color={Colors.success} />
            </View>
            <BodyText style={enhancedGiftAidStyles.benefitLabel}>
              Your donation
            </BodyText>
            <TitleText style={enhancedGiftAidStyles.benefitAmount}>
              £{cartTotals.subtotal.toFixed(2)}
            </TitleText>
          </View>

          <View style={enhancedGiftAidStyles.plusIconHorizontal}>
            <Plus size={20} color={Colors.textSecondary} />
          </View>

          <View style={[
            enhancedGiftAidStyles.benefitColumn,
            !giftAidEnabled && enhancedGiftAidStyles.benefitColumnDisabled
          ]}>
            <View style={enhancedGiftAidStyles.benefitIcon}>
              <Gift size={18} color={giftAidEnabled ? Colors.success : Colors.textMuted} />
            </View>
            <BodyText style={[
              enhancedGiftAidStyles.benefitLabel,
              !giftAidEnabled && enhancedGiftAidStyles.benefitLabelDisabled
            ]}>
              Gift Aid bonus
            </BodyText>
            <TitleText style={[
              enhancedGiftAidStyles.benefitAmount,
              giftAidEnabled ? enhancedGiftAidStyles.benefitAmountEnabled : enhancedGiftAidStyles.benefitAmountDisabled
            ]}>
              £{cartTotals.giftAidAmount.toFixed(2)}
            </TitleText>
          </View>
        </View>

        <View style={enhancedGiftAidStyles.divider} />

        <View style={enhancedGiftAidStyles.totalRow}>
          <BodyText style={enhancedGiftAidStyles.totalLabel}>
            Total value to charity
          </BodyText>
          <TitleText style={[
            enhancedGiftAidStyles.totalAmount,
            giftAidEnabled && enhancedGiftAidStyles.totalAmountEnabled
          ]}>
            £{giftAidEnabled ? cartTotals.charityTotal.toFixed(2) : cartTotals.subtotal.toFixed(2)}
          </TitleText>
        </View>
      </View>

      <View style={enhancedGiftAidStyles.infoContainer}>
        <Info size={16} color={Colors.white} />
        <BodyText style={enhancedGiftAidStyles.infoText}>
          {giftAidEnabled ? 
            'We\'ll collect your home address during checkout' : 
            'By enabling this you are confirming that you are a UK taxpayer.'
          }
        </BodyText>
      </View>
    </View>
  );

  const renderCartSummary = () => (
    <View style={cartStyles.cartSummary}>
      <View style={sharedStyles.summaryRow}>
        <BodyText style={sharedStyles.summaryLabel}>Donation Total</BodyText>
        <BodyText style={sharedStyles.summaryValue}>£{cartTotals.subtotal.toFixed(2)}</BodyText>
      </View>
      
      <View style={[sharedStyles.summaryRow, sharedStyles.summaryTotal]}>
        <TitleText style={sharedStyles.summaryTotalLabel}>You Pay Now</TitleText>
        <TitleText style={sharedStyles.summaryTotalValue}>£{cartTotals.total.toFixed(2)}</TitleText>
      </View>
    </View>
  );

  return (
    <View style={sharedStyles.container}>
      <View style={screenStyles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={screenStyles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <HeadlineText style={screenStyles.title}>Donation Cart</HeadlineText>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView 
        style={sharedStyles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={screenStyles.scrollContent}
      >
        {cart.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            {cart.map(renderCartItem)}
            {renderEnhancedGiftAidSection()}
            {renderCartSummary()}
          </>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={screenStyles.footer}>
          <TouchableOpacity
            style={cartStyles.checkoutButton}
            onPress={handleCheckout}
            accessible={true}
            accessibilityLabel={`Proceed to checkout with ${cart.length} items totaling £${cartTotals.total.toFixed(2)}`}
            accessibilityRole="button"
          >
            <View style={cartStyles.checkoutButtonContent}>
              <DonateIcon size={20} color={Colors.textLight} />
              <ButtonText style={sharedStyles.primaryButtonText}>
                Checkout - £{cartTotals.total.toFixed(2)}
              </ButtonText>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CartScreen;