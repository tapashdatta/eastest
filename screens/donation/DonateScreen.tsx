import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, FlatList, TouchableOpacity, TextInput, Dimensions, Platform, Animated, StatusBar, ScrollView, Keyboard, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { Text, HeadlineText } from '@/components/Text';
import { useDonationCart } from '@/contexts/DonationContext';
import { useDonationSystemStatus } from '@/services/PaymentService';
import { getDonationCategories, DonationCategory } from '@/config/appConfig';
import { getImageSource } from '@/utils/donationImages';
import { SimpleDatePicker } from '@/components/DatePicker';
import { 
  ArrowLeft,
  Plus, 
  CheckCircle, 
  MessageSquare,
  Calendar,
  Heart,
  Gift,
  Users
} from 'lucide-react-native';
import FloatingCart from '@/screens/donation/FloatingCart';
import { 
  donateStyles,
  statusStyles,
  sharedStyles,
  screenStyles
} from '@/styles/DonationStyles';

// Constants - moved outside component to prevent recreating
const { width } = Dimensions.get('screen');

// Animation constants
const ANIMATION_CONFIG = {
  spring: { tension: 120, friction: 7, useNativeDriver: true },
  timing: { expand: 250, collapse: 200, useNativeDriver: true },
  entry: { tension: 100, friction: 8, useNativeDriver: true },
} as const;

// Icon mapping - moved outside and memoized
const ICON_MAP = {
  'Heart': Heart,
  'Gift': Gift,
  'Users': Users,
  'Calendar': Calendar,
  'MessageSquare': MessageSquare
} as const;

const getIconComponent = (iconName: string) => ICON_MAP[iconName as keyof typeof ICON_MAP] || Heart;

// Default category fallback - moved outside
const FALLBACK_CATEGORY: DonationCategory = {
  id: 'general',
  title: 'General Donation',
  description: 'Support our temple activities',
  image: 'general',
  icon_name: 'Heart',
  financial_type_id: 1,
  suggested_amounts: [10, 25, 50],
  requires_date: false,
  requires_message: false,
  color: '#667eea'
};

type DonationStackParamList = {
  Donate: undefined;
  Cart: undefined;
  Payment: undefined;
  Success: { result: any };
};

type NavigationProp = NativeStackNavigationProp<DonationStackParamList>;

// Donation System Status Indicator Component
const DonationSystemStatusIndicator: React.FC = () => {
  const { isReady, isInitializing, hasError } = useDonationSystemStatus();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isInitializing) {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();
    }
  }, [isInitializing, spinValue]);

  const spinAnimation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (isReady) {
    return (
      <View style={statusStyles.container}>
        <View style={statusStyles.readyIndicator}>
          <CheckCircle size={12} color="#10B981" />
          <Text style={statusStyles.readyText}>Secure Payment Ready</Text>
        </View>
      </View>
    );
  }

  if (isInitializing) {
    return (
      <View style={statusStyles.container}>
        <View style={statusStyles.loadingIndicator}>
          <Animated.View style={[statusStyles.spinner, { transform: [{ rotate: spinAnimation }] }]} />
          <Text style={statusStyles.loadingText}>Setting up secure payment system...</Text>
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={statusStyles.container}>
        <View style={statusStyles.errorIndicator}>
          <Text style={statusStyles.errorIcon}>⚠️</Text>
          <Text style={statusStyles.errorText}>Payment system unavailable</Text>
        </View>
      </View>
    );
  }

  return null;
};

// Optimized animation values hook with keyboard handling
const useAnimationValues = () => {
  return useRef({
    scrollX: new Animated.Value(0),
    cardTranslateY: new Animated.Value(0),
    panelTranslateY: new Animated.Value(380),
    entryAnim: new Animated.Value(0),
    keyboardOffset: new Animated.Value(0),
  }).current;
};

// Memoized form state hook
const useFormState = (category: DonationCategory | undefined) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [sponsorshipDate, setSponsorshipDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      setSelectedAmount(category.suggested_amounts[0] || 0);
      setCustomAmount('');
      setSponsorshipDate('');
      setMessage('');
    }
  }, [category?.id]);

  const resetForm = useCallback(() => {
    if (category) {
      setSelectedAmount(category.suggested_amounts[0] || 0);
      setCustomAmount('');
      setSponsorshipDate('');
      setMessage('');
    }
  }, [category]);

  return {
    selectedAmount, setSelectedAmount,
    customAmount, setCustomAmount,
    sponsorshipDate, setSponsorshipDate,
    message, setMessage,
    isAdding, setIsAdding,
    resetForm
  };
};

// Extracted and optimized DonationCard component
const DonationCard = React.memo<{
  category: DonationCategory;
  isSelected: boolean;
  onSelect: () => void;
  scrollX: Animated.Value;
  cardTranslateY: Animated.Value;
  index: number;
}>(({ category, isSelected, onSelect, scrollX, cardTranslateY, index }) => {
  const IconComponent = getIconComponent(category.icon_name);

  // Memoized animation values to prevent recalculation
  const animatedStyles = useMemo(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    
    return {
      scale: scrollX.interpolate({
        inputRange, outputRange: [0.85, 1, 0.85], extrapolate: 'clamp',
      }),
      opacity: scrollX.interpolate({
        inputRange, outputRange: [0.5, 1, 0.5], extrapolate: 'clamp',
      }),
      rotateY: scrollX.interpolate({
        inputRange, outputRange: ['8deg', '0deg', '-8deg'], extrapolate: 'clamp',
      }),
      translateX: scrollX.interpolate({
        inputRange, outputRange: [-15, 0, 15], extrapolate: 'clamp',
      }),
      translateYOffset: scrollX.interpolate({
        inputRange, outputRange: [15, 0, 15], extrapolate: 'clamp',
      }),
    };
  }, [scrollX, index]);

  const cardStyle = useMemo(() => [
    donateStyles.cardContainer,
    {
      transform: [
        { perspective: 1200 },
        { scale: animatedStyles.scale },
        { rotateY: animatedStyles.rotateY },
        { translateX: animatedStyles.translateX },
        { translateY: Animated.add(cardTranslateY, animatedStyles.translateYOffset) },
      ],
      opacity: animatedStyles.opacity,
      backfaceVisibility: 'hidden' as const,
    }
  ], [animatedStyles, cardTranslateY]);

  return (
    <View style={donateStyles.cardWrapper}>
      <Animated.View style={cardStyle}>
        <TouchableOpacity style={donateStyles.card} onPress={onSelect} activeOpacity={0.9}>
          <View style={donateStyles.cardInner}>
            <View style={donateStyles.cardImageContainer}>
              <Image source={getImageSource(category.image)} style={donateStyles.cardImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={donateStyles.cardOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </View>
          </View>

          <View style={donateStyles.cardContent}>
            <View style={donateStyles.cardIconContainer}>
              <IconComponent size={32} color={Colors.textLight} strokeWidth={1.5} />
            </View>
            <View style={donateStyles.cardTitleContainer}>
              <Text style={donateStyles.cardTitle}>{category.title}</Text>
              <Text style={donateStyles.cardDescription}>{category.description}</Text>
            </View>
            {isSelected && (
              <View style={donateStyles.selectedIndicator}>
                <CheckCircle size={28} color={Colors.textLight} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

// Extracted and optimized BehindCardPanel component
const BehindCardPanel = React.memo<{
  category: DonationCategory;
  isVisible: boolean;
  panelTranslateY: Animated.Value;
  onAddToCart: (item: any) => void;
}>(({ category, isVisible, panelTranslateY, onAddToCart }) => {
  const formState = useFormState(category);

  // Check if this is Nitya Seva
  const isNityaSeva = category.id === 'nitya_seva';

  const handleCustomAmountChange = useCallback((text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2 || (parts[1] && parts[1].length > 2)) return;
    formState.setCustomAmount(cleanText);
  }, [formState.setCustomAmount]);

  const handleMessageChange = useCallback((text: string) => {
    if (text.length <= 500) formState.setMessage(text);
  }, [formState.setMessage]);

  const handleAddToCart = useCallback(async () => {
    if (formState.isAdding) return;

    try {
      formState.setIsAdding(true);
      const amount = formState.customAmount ? parseFloat(formState.customAmount) : formState.selectedAmount;
      
      if (!amount || amount <= 0) {
        throw new Error('Please select or enter a valid amount');
      }

      const newItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        category: category.title,
        financial_type_id: category.financial_type_id,
        amount,
        quantity: 1,
        sponsorship_date: formState.sponsorshipDate || undefined,
        message: formState.message.trim() || undefined,
        total: amount,
      };

      await onAddToCart(newItem);
      formState.resetForm();
      
    } catch (error) {
      // Handle error silently in production
    } finally {
      formState.setIsAdding(false);
    }
  }, [category, formState, onAddToCart]);

  const canAddToCart = useMemo(() => {
    const hasAmount = formState.customAmount ? parseFloat(formState.customAmount) > 0 : formState.selectedAmount > 0;
    return hasAmount && !formState.isAdding;
  }, [formState.customAmount, formState.selectedAmount, formState.isAdding]);

  if (!isVisible) return null;

  return (
    <Animated.View style={[donateStyles.behindCardPanel, { transform: [{ translateY: panelTranslateY }] }]}>
      <ScrollView 
        style={donateStyles.panelScrollView} 
        contentContainerStyle={donateStyles.panelContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Amount Selection */}
        <View style={donateStyles.amountGrid}>
          {category.suggested_amounts
            .filter(amount => amount !== 100)
            .map((amount: number) => (
            <TouchableOpacity
              key={amount}
              style={[
                donateStyles.amountButton,
                formState.selectedAmount === amount && !formState.customAmount && donateStyles.amountButtonSelected,
              ]}
              onPress={() => {
                formState.setSelectedAmount(amount);
                formState.setCustomAmount('');
              }}
            >
              <Text style={[
                donateStyles.amountButtonText,
                formState.selectedAmount === amount && !formState.customAmount && donateStyles.amountButtonTextSelected,
              ]}>
                £{amount}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Custom Amount Input - Hidden for Nitya Seva */}
          {!isNityaSeva && (
            <View style={[donateStyles.amountButton, donateStyles.customAmountButton]}>
              <View style={donateStyles.customAmountInput}>
                <Text style={donateStyles.currencySymbol}>£</Text>
                <TextInput
                  style={donateStyles.customAmountField}
                  placeholder="Amount"
                  placeholderTextColor={Colors.textMuted}
                  value={formState.customAmount}
                  onChangeText={handleCustomAmountChange}
                  keyboardType="decimal-pad"
                  onFocus={() => formState.setSelectedAmount(0)}
                />
              </View>
            </View>
          )}
        </View>

        {/* Sponsorship Date Field */}
        <View style={donateStyles.fieldContainer}>
          <SimpleDatePicker
            value={formState.sponsorshipDate}
            onChange={formState.setSponsorshipDate}
            placeholder={isNityaSeva ? "Select Seva Date (Optional)" : "Sponsorship Date (Optional)"}
            minimumDate={new Date()}
            maximumDate={new Date(new Date().getFullYear() + 2, 11, 31)}
            label={isNityaSeva ? "Seva Date (Optional)" : "Sponsorship Date (Optional)"}
          />
        </View>

        {/* Message Field */}
        <View style={donateStyles.fieldContainer}>
          <View style={donateStyles.inputWithIcon}>
            <MessageSquare size={18} color={Colors.textSecondary} />
            <TextInput
              style={donateStyles.messageInput}
              placeholder={isNityaSeva ? "Special requests or dedication message (Optional)..." : "Enter your message (Optional)..."}
              placeholderTextColor={Colors.textMuted}
              value={formState.message}
              onChangeText={handleMessageChange}
              multiline
              numberOfLines={2}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>
          {formState.message.length > 0 && (
            <Text style={donateStyles.characterCount}>{formState.message.length}/500 characters</Text>
          )}
        </View>

        {/* Nitya Seva specific information */}
        {isNityaSeva && (
          <View style={donateStyles.nityaSevaInfo}>
            <Text style={donateStyles.nityaSevaInfoText}>
              💡 Nitya Seva helps maintain our daily temple services and sacred environment. Your contribution supports the ongoing worship and care of the deities.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={donateStyles.controlButtons}>
        <TouchableOpacity
          style={[donateStyles.addButton, !canAddToCart && donateStyles.addButtonDisabled]}
          onPress={handleAddToCart}
          disabled={!canAddToCart}
          activeOpacity={0.8}
        >
          <Plus size={18} color={canAddToCart ? Colors.textLight : Colors.textMuted} />
          <Text style={[donateStyles.addButtonText, !canAddToCart && donateStyles.addButtonTextDisabled]}>
            {formState.isAdding ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
});

// Main component
const DonateScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cart, addToCart } = useDonationCart();
  const animValues = useAnimationValues();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Memoized donation categories with fallback
  const donationCategories = useMemo(() => {
    try {
      return getDonationCategories();
    } catch (error) {
      return [FALLBACK_CATEGORY];
    }
  }, []);

  // Memoized selected category data
  const selectedCategoryData = useMemo(() => 
    selectedCategory ? donationCategories.find(cat => cat.id === selectedCategory) : null,
    [selectedCategory, donationCategories]
  );

  // Entry animation
  useEffect(() => {
    Animated.spring(animValues.entryAnim, {
      toValue: 1,
      ...ANIMATION_CONFIG.entry,
    }).start();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShow = (event: any) => {
      const keyboardHeight = event.endCoordinates.height;
      Animated.timing(animValues.keyboardOffset, {
        toValue: -keyboardHeight * 0.5,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const keyboardWillHide = () => {
      Animated.timing(animValues.keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideSubscription = Keyboard.addListener(hideEvent, keyboardWillHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, [animValues.keyboardOffset]);

  // Card selection animation
  useEffect(() => {
    if (selectedCategory) {
      Animated.parallel([
        Animated.spring(animValues.cardTranslateY, { 
          toValue: -80, 
          ...ANIMATION_CONFIG.spring,
        }),
        Animated.timing(animValues.panelTranslateY, { 
          toValue: 0, 
          duration: ANIMATION_CONFIG.timing.expand,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(animValues.cardTranslateY, { 
          toValue: 0, 
          ...ANIMATION_CONFIG.spring,
        }),
        Animated.timing(animValues.panelTranslateY, { 
          toValue: 380, 
          duration: ANIMATION_CONFIG.timing.collapse,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [selectedCategory, animValues]);

  // Optimized callbacks
  const handleCardSelect = useCallback((categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
  }, []);

  const handleAddToCart = useCallback(async (item: any) => {
    try {
      await addToCart(item);
      setSuccessMessage('added to cart successfully!');
      setSelectedCategory(null);
    } catch (error) {
      // Handle error silently in production
    }
  }, [addToCart]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Memoized render functions
  const renderDonationCard = useCallback(({ item, index }: { item: DonationCategory; index: number }) => (
    <DonationCard
      category={item}
      isSelected={selectedCategory === item.id}
      onSelect={() => handleCardSelect(item.id)}
      scrollX={animValues.scrollX}
      cardTranslateY={animValues.cardTranslateY}
      index={index}
    />
  ), [selectedCategory, handleCardSelect, animValues]);

  // Memoized animated styles
  const headerStyle = useMemo(() => [
    donateStyles.header, 
    { 
      opacity: animValues.entryAnim,
      transform: [{ 
        translateY: animValues.entryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        })
      }] 
    }
  ], [animValues.entryAnim]);

  const cardListStyle = useMemo(() => [
    donateStyles.cardListContainer, 
    { 
      opacity: animValues.entryAnim,
      transform: [{ 
        translateY: animValues.entryAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        })
      }] 
    }
  ], [animValues.entryAnim]);

  const keyExtractor = (item: DonationCategory) => item.id;
  const getItemLayout = (_: any, index: number) => ({ length: width, offset: width * index, index });

  return (
    <Animated.View style={[donateStyles.container, { transform: [{ translateY: animValues.keyboardOffset }] }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Background */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: animValues.entryAnim }]}>
        {donationCategories.map((category, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const bgOpacity = animValues.scrollX.interpolate({
            inputRange,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View key={`bg-${index}`} style={[StyleSheet.absoluteFillObject, { opacity: bgOpacity }]}>
              <Image source={getImageSource(category.image)} style={donateStyles.backgroundImage} blurRadius={40} />
            </Animated.View>
          );
        })}
        <View style={donateStyles.darkOverlay} />
      </Animated.View>

      {/* Header with Status Indicator */}
      <Animated.View style={headerStyle}>
        <TouchableOpacity onPress={handleBackPress} style={donateStyles.headerBackButton}>
          <ArrowLeft size={24} color={Colors.textLight} />
        </TouchableOpacity>
        <View style={donateStyles.headerCenter}>
          <HeadlineText style={donateStyles.headerTitle}>Donate</HeadlineText>
          <DonationSystemStatusIndicator />
        </View>
        <View style={{ width: 48 }} />
      </Animated.View>

      {/* Success Message */}
      {successMessage && (
        <Animated.View style={[donateStyles.successMessage, { opacity: animValues.entryAnim }]}>
          <CheckCircle size={16} color={Colors.textLight} />
          <Text style={donateStyles.successMessageText}>{successMessage}</Text>
        </Animated.View>
      )}

      {/* Card List */}
      <Animated.View style={cardListStyle}>
        <Animated.FlatList
          data={donationCategories}
          renderItem={renderDonationCard}
          keyExtractor={keyExtractor}
          horizontal
          snapToInterval={width}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: animValues.scrollX } } }], { useNativeDriver: true })}
          scrollEventThrottle={16}
          contentContainerStyle={donateStyles.flatListContent}
          scrollEnabled={!selectedCategory}
          removeClippedSubviews={false}
          getItemLayout={getItemLayout}
          bounces={false}
          maxToRenderPerBatch={3}
          updateCellsBatchingPeriod={50}
          windowSize={5}
        />
      </Animated.View>

      {/* Behind Card Panel */}
      {selectedCategoryData && (
        <BehindCardPanel
          category={selectedCategoryData}
          isVisible={!!selectedCategory}
          panelTranslateY={animValues.panelTranslateY}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Page Indicators */}
      {!selectedCategory && (
        <Animated.View style={[donateStyles.pageIndicators, { opacity: animValues.entryAnim }]}>
          {donationCategories.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const scale = animValues.scrollX.interpolate({ inputRange, outputRange: [0.8, 1.4, 0.8], extrapolate: 'clamp' });
            const indicatorOpacity = animValues.scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });

            return (
              <Animated.View key={index} style={[donateStyles.pageIndicator, { transform: [{ scale }], opacity: indicatorOpacity }]} />
            );
          })}
        </Animated.View>
      )}

      {/* Floating Cart */}
      {!selectedCategory && <FloatingCart cart={cart} onPress={handleCartPress} />}
    </Animated.View>
  );
};

export default DonateScreen;