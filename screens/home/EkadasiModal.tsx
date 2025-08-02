// components/EkadasiModal.tsx

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { Calendar, MapPin, Clock, Leaf, Bell, X, Heart } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { Post } from '@/types/content';
import OptimizedImage, { CarouselImage } from '@/components/OptimizedImage';

const { width, height } = Dimensions.get('screen');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.78;
const CARD_SPACING = 20;
const CARD_OFFSET = (width - CARD_WIDTH) / 2;

interface EkadasiModalProps {
  events: Post[];
  isVisible: boolean;
  onClose: () => void;
  initialIndex?: number;
  imagesPreloaded?: boolean;
  sourceCardPosition?: { x: number; y: number; width: number; height: number };
  onNavigateToDonate?: () => void;
}

export const EkadasiModal: React.FC<EkadasiModalProps> = ({
  events,
  isVisible,
  onClose,
  initialIndex = 0,
  imagesPreloaded = false,
  sourceCardPosition,
  onNavigateToDonate,
}) => {
  // Simplified state
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  
  // Simplified animations
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bottomSheetY = useRef(new Animated.Value(height)).current;
  const flatListRef = useRef<any>(null);

  // Memoized current event
  const currentEvent = events[currentIndex] || events[0];

  // Format dates
  const formattedDates = useMemo(() => {
    return events.map(event => {
      if (!event.eventData?.startDate) return 'Sacred Day';
      try {
        const date = new Date(event.eventData.startDate);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return date.toLocaleDateString('en-GB', {
          weekday: 'short', month: 'short', day: 'numeric'
        });
      } catch {
        return 'Sacred Day';
      }
    });
  }, [events]);

  // Calculate days until
  const daysUntil = useMemo(() => {
    if (!currentEvent?.eventData?.startDate) return null;
    try {
      const now = new Date();
      const eventDate = new Date(currentEvent.eventData.startDate);
      const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff < 0) return null;
      if (daysDiff === 0) return 'Today';
      if (daysDiff === 1) return 'Tomorrow';
      return `${daysDiff} days`;
    } catch {
      return null;
    }
  }, [currentEvent]);

  // PERFORMANCE: Preload adjacent images for smooth scrolling
  useEffect(() => {
    const nextIdx = Math.min(currentIndex + 1, events.length - 1);
    const prevIdx = Math.max(currentIndex - 1, 0);
    if (events[nextIdx]?.image) Image.prefetch(events[nextIdx].image);
    if (events[prevIdx]?.image) Image.prefetch(events[prevIdx].image);
  }, [currentIndex, events]);

  // Simple entrance animation
  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isVisible]);

  // Track scroll position
  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / (CARD_WIDTH + CARD_SPACING));
      const clampedIndex = Math.max(0, Math.min(index, events.length - 1));
      if (clampedIndex !== currentIndex) {
        setCurrentIndex(clampedIndex);
      }
    });
    return () => scrollX.removeListener(listener);
  }, [currentIndex, events.length]);

  // Initialize position - FIXED: Better timing and layout handling
  useEffect(() => {
    if (isVisible && flatListRef.current && events.length > 0) {
      // Use requestAnimationFrame to ensure layout is complete
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToOffset({
            offset: Math.max(0, Math.min(initialIndex, events.length - 1)) * (CARD_WIDTH + CARD_SPACING),
            animated: false,
          });
          setCurrentIndex(Math.max(0, Math.min(initialIndex, events.length - 1)));
        });
      }, 200); // Increased timeout for better reliability
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, initialIndex, events.length]);

  // Bottom sheet functions
  const openBottomSheet = useCallback(() => {
    setShowBottomSheet(true);
    Animated.spring(bottomSheetY, {
      toValue: height * 0.15,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const closeBottomSheet = useCallback(() => {
    Animated.spring(bottomSheetY, {
      toValue: height,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start(() => {
      setShowBottomSheet(false);
    });
  }, []);

  // Donate handler
  const handleDonate = useCallback(() => {
    closeBottomSheet();
    setTimeout(() => {
      onNavigateToDonate?.();
    }, 300);
  }, [closeBottomSheet, onNavigateToDonate]);

  // PERFORMANCE: Memoized functions
  const keyExtractor = useCallback((item: Post) => `ekadasi-${item.id}`, []);
  
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: CARD_WIDTH + CARD_SPACING,
    offset: (CARD_WIDTH + CARD_SPACING) * index,
    index,
  }), []);

  // Handle FlatList layout completion
  const handleFlatListLayout = useCallback(() => {
    if (isVisible && initialIndex > 0 && flatListRef.current) {
      // Double-check positioning after layout
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: Math.max(0, Math.min(initialIndex, events.length - 1)) * (CARD_WIDTH + CARD_SPACING),
          animated: false,
        });
      }, 50);
    }
  }, [isVisible, initialIndex, events.length]);

  // Render card
  const renderCard = useCallback(({ item, index }: { item: Post; index: number }) => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_SPACING),
      index * (CARD_WIDTH + CARD_SPACING),
      (index + 1) * (CARD_WIDTH + CARD_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange, outputRange: [0.9, 1, 0.9], extrapolate: 'clamp'
    });
    const opacity = scrollX.interpolate({
      inputRange, outputRange: [0.7, 1, 0.7], extrapolate: 'clamp'
    });

    // Calculate days until for this specific card (without useMemo - hooks not allowed in callbacks)
    let cardDaysUntil = null;
    if (item.eventData?.startDate) {
      try {
        const now = new Date();
        const eventDate = new Date(item.eventData.startDate);
        const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        
        if (daysDiff >= 0) {
          if (daysDiff === 0) cardDaysUntil = 'Today';
          else if (daysDiff === 1) cardDaysUntil = 'Tomorrow';
          else cardDaysUntil = `${daysDiff} days`;
        }
      } catch {
        cardDaysUntil = null;
      }
    }

    return (
      <View style={styles.cardContainer}>
        {/* Top Card */}
        <Animated.View
          style={[styles.topCard, { opacity, transform: [{ scale }] }]}
        >
          {/* Hero Image */}
          <View style={styles.imageContainer}>
            <CarouselImage source={{ uri: item.image }} style={styles.image} />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.4)']}
              style={styles.imageOverlay}
            />
          </View>

          {/* Top Content */}
          <View style={styles.topContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.badge}>
                <Leaf size={12} color="#fff" />
                <Text style={styles.badgeText}>EKADASI</Text>
              </View>
              {cardDaysUntil && (
                <View style={styles.countdown}>
                  <Clock size={20} color="#000" fill="#FFD700" />
                  <Text style={styles.countdownText}>{cardDaysUntil}</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          </View>
        </Animated.View>

        {/* Bottom Card with Glassmorphism */}
        <Animated.View
          style={[styles.bottomCardContainer, { opacity, transform: [{ scale }] }]}
        >
          <BlurView intensity={40} tint="light" style={styles.bottomCard}>
            {/* Date & Location */}
            <View style={styles.meta}>
              <Calendar size={16} color="#8B5CF6" />
              <Text style={styles.date}>{formattedDates[index]}</Text>
            </View>

            <View style={styles.meta}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.location}>
                {item.eventData?.location || 'ISKCON Temple'}
              </Text>
            </View>

            {/* Description */}
            <TouchableOpacity 
              style={styles.descriptionContainer}
              onPress={openBottomSheet}
              activeOpacity={0.7}
            >
              <Text style={styles.description} numberOfLines={3}>
                {item.content || item.excerpt || 
                 'Sacred day of fasting and devotion dedicated to Lord Vishnu.'}
              </Text>
              <Text style={styles.readMore}>Tap to read more...</Text>
            </TouchableOpacity>

            {/* Guidelines */}
            <View style={styles.guidelines}>
              <Text style={styles.guidelinesTitle}>Quick Guidelines:</Text>
              <Text style={styles.guidelineItem}>🚫 No grains or beans</Text>
              <Text style={styles.guidelineItem}>✅ Fruits & vegetables allowed</Text>
              <Text style={styles.guidelineItem}>🌅 Break fast after sunrise</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.reminderButton} activeOpacity={0.8}>
                <Bell size={16} color="#8B5CF6" />
                <Text style={styles.reminderText}>Reminder</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.donateButton} 
                activeOpacity={0.8}
                onPress={handleDonate}
              >
                <Heart size={16} color="#fff" />
                <Text style={styles.donateText}>Donate</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    );
  }, [scrollX, formattedDates, openBottomSheet, handleDonate]);

  if (!isVisible || events.length === 0) return null;

  return (
    <Modal 
      visible={isVisible} 
      transparent 
      animationType="none" 
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      
      <View style={styles.container}>
        {/* Dynamic Background - PERFORMANCE: Only render visible backgrounds */}
        <View style={styles.backgroundContainer}>
          {events.map((event, index) => {
            // Only render backgrounds for current +/- 1 cards for performance
            const isVisible = Math.abs(index - currentIndex) <= 1;
            if (!isVisible) return null;

            const inputRange = [
              (index - 1) * (CARD_WIDTH + CARD_SPACING),
              index * (CARD_WIDTH + CARD_SPACING),
              (index + 1) * (CARD_WIDTH + CARD_SPACING),
            ];
            
            const bgOpacity = scrollX.interpolate({
              inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp'
            });

            return (
              <Animated.View
                key={`bg-${index}`}
                style={[StyleSheet.absoluteFillObject, { opacity: bgOpacity }]}
              >
                <OptimizedImage
                  source={{ uri: event.image }}
                  style={styles.backgroundImage}
                  blurRadius={20}
                  cacheKey={`ekadasi-bg-${event.id}`}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  transition={0}
                />
              </Animated.View>
            );
          })}
          
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Ekadasi</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          {/* Carousel */}
          <View style={styles.carousel}>
            <Animated.FlatList
              ref={flatListRef}
              data={events}
              keyExtractor={keyExtractor}
              getItemLayout={getItemLayout}
              onLayout={handleFlatListLayout}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              contentContainerStyle={styles.carouselContent}
              renderItem={renderCard}
              removeClippedSubviews={Platform.OS === 'android'}
              maxToRenderPerBatch={2}
              windowSize={3}
              initialNumToRender={1}
            />
          </View>

          {/* Bottom Indicators */}
          <View style={styles.indicatorsContainer}>
            <View style={styles.indicators}>
              {events.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentIndex && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Bottom Sheet */}
          {showBottomSheet && (
            <Animated.View 
              style={[styles.bottomSheet, { transform: [{ translateY: bottomSheetY }] }]}
            >
              <View style={styles.sheetHandle} />
              <TouchableOpacity style={styles.sheetClose} onPress={closeBottomSheet}>
                <X size={24} color="#666" />
              </TouchableOpacity>
              
              <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
                <View style={styles.sheetInner}>
                  <Text style={styles.sheetTitle}>{currentEvent.title}</Text>
                  
                  <View style={styles.sheetMeta}>
                    <View style={styles.meta}>
                      <Calendar size={16} color="#8B5CF6" />
                      <Text style={styles.date}>{formattedDates[currentIndex]}</Text>
                    </View>
                    <View style={styles.meta}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.location}>
                        {currentEvent.eventData?.location || 'ISKCON Temple'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.fullDescription}>
                    {currentEvent.content || currentEvent.excerpt || 
                     'Sacred day of fasting and devotion dedicated to Lord Vishnu. Join us for this auspicious observance where devotees engage in prayer, meditation, and spiritual practices.'}
                  </Text>

                  <View style={styles.fullGuidelines}>
                    <Text style={styles.fullGuidelinesTitle}>🍃 Complete Fasting Guidelines</Text>
                    
                    <View style={styles.guidelineSection}>
                      <Text style={styles.sectionTitle}>❌ Avoid These Foods:</Text>
                      <Text style={styles.sectionText}>
                        • All grains (rice, wheat, barley, etc.){'\n'}
                        • All beans and legumes{'\n'}
                        • Onions, garlic, mushrooms{'\n'}
                        • Honey (for strict observers)
                      </Text>
                    </View>

                    <View style={styles.guidelineSection}>
                      <Text style={styles.sectionTitle}>✅ Permitted Foods:</Text>
                      <Text style={styles.sectionText}>
                        • Fresh fruits and vegetables{'\n'}
                        • Dairy products (milk, yogurt, ghee){'\n'}
                        • Nuts and seeds{'\n'}
                        • Water, fresh juices, herbal teas
                      </Text>
                    </View>

                    <View style={styles.guidelineSection}>
                      <Text style={styles.sectionTitle}>🌅 Breaking the Fast:</Text>
                      <Text style={styles.sectionText}>
                        • Fast should be broken after sunrise{'\n'}
                        • First consume water, then light foods{'\n'}
                        • Chant mantras and offer gratitude
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sheetActions}>
                    <TouchableOpacity style={styles.sheetReminderButton}>
                      <Bell size={18} color="#8B5CF6" />
                      <Text style={styles.sheetReminderText}>Set Reminder</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.sheetDonateButton} onPress={handleDonate}>
                      <Heart size={18} color="#fff" />
                      <Text style={styles.sheetDonateText}>Donate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { 
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black', // Fallback color
  },
  modalContent: {
    flex: 1,
    zIndex: 10, // Ensure content appears above background
  },
  
  // Background - FIXED: Now covers full screen including status bar and nav bar
  backgroundContainer: { 
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  backgroundImage: { 
    width: '100%', 
    height: '100%' 
  },
  
  // Header - FIXED: Proper padding for status bar
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + Spacing.lg : 50,
    paddingBottom: Spacing.xl,
    zIndex: 100,
  },
  closeButton: {
    width: 44, 
    height: 44, 
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center', 
    justifyContent: 'center',
  },
  headerCenter: { 
    flex: 1, 
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.titleLarge,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)', 
    textShadowRadius: 3,
  },
  headerSpacer: {
    width: 44,
  },
  
  // Carousel
  carousel: { 
    flex: 1, 
    justifyContent: 'center',
    marginTop: -20,
  },
  carouselContent: { 
    paddingHorizontal: CARD_OFFSET, 
    paddingVertical: Spacing.xl 
  },
  
  // Bottom Indicators
  indicatorsContainer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? Spacing.xxl : Spacing.xxxl,
  },
  indicators: { 
    flexDirection: 'row', 
    gap: 6 
  },
  indicator: {
    width: 6, 
    height: 6, 
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeIndicator: { 
    backgroundColor: '#FFD700', 
    width: 20 
  },
  
  // Card Container - UPDATED: Two separate cards structure
  cardContainer: { 
    width: CARD_WIDTH, 
    height: CARD_HEIGHT, 
    marginRight: CARD_SPACING,
    gap: Spacing.md,
  },
  
  // Top Card
  topCard: {
    backgroundColor: Colors.white, 
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    height: CARD_HEIGHT * 0.45,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  imageContainer: { 
    height: '60%', 
    position: 'relative', 
    padding: 6,
  },
  image: { 
    width: '100%', 
    height: '100%', 
    borderRadius: BorderRadius.lg 
  },
  imageOverlay: {},
  topContent: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  
  // Bottom Card with Glassmorphism
  bottomCardContainer: {
    flex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomCard: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  
  // Content
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  badge: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#81ce8eff',
    paddingHorizontal: Spacing.md, 
    paddingVertical: 6, 
    borderRadius: BorderRadius.lg, 
    gap: 6,
  },
  badgeText: {
    ...Typography.labelMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  countdown: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: Colors.black,
    paddingLeft: 4, 
    paddingVertical: 4, 
    borderRadius: 30, 
    gap: 4,
  },
  countdownText: {
    ...Typography.labelMedium,
    color: '#FFD700',
    fontWeight: '600',
    paddingRight: 14,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.text,
    lineHeight: 28,
  },
  meta: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.sm 
  },
  date: {
    ...Typography.titleMedium,
    color: '#8B5CF6',
  },
  location: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  
  // Description
  descriptionContainer: { 
    padding: 2 
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  readMore: {
    ...Typography.labelLarge,
    color: '#8B5CF6',
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  
  // Guidelines
  guidelines: { 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    padding: Spacing.lg, 
    borderRadius: BorderRadius.md, 
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  guidelinesTitle: {
    ...Typography.titleSmall,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  guidelineItem: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  // Actions
  actions: { 
    flexDirection: 'row', 
    gap: Spacing.md,
  },
  reminderButton: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: 'rgba(243, 232, 255, 0.3)', 
    paddingVertical: Spacing.lg, 
    borderRadius: BorderRadius.md, 
    gap: 6,
    borderWidth: 1, 
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  reminderText: {
    ...Typography.labelLarge,
    color: '#8B5CF6',
  },
  donateButton: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: Colors.error, 
    paddingVertical: Spacing.lg, 
    borderRadius: BorderRadius.md, 
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  donateText: {
    ...Typography.labelLarge,
    color: Colors.white,
  },
  
  // Bottom Sheet
  bottomSheet: {
    position: 'absolute', 
    left: 0, 
    right: 0, 
    bottom: 0, 
    height: height,
    backgroundColor: Colors.white, 
    borderTopLeftRadius: BorderRadius.xxl, 
    borderTopRightRadius: BorderRadius.xxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 16,
  },
  sheetHandle: {
    width: 40, 
    height: 4, 
    backgroundColor: Colors.border, 
    borderRadius: 2,
    alignSelf: 'center', 
    marginTop: Spacing.md,
  },
  sheetClose: {
    position: 'absolute', 
    right: Spacing.xl, 
    top: Spacing.xl, 
    zIndex: 10,
    width: 44, 
    height: 44, 
    borderRadius: BorderRadius.xl, 
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  sheetContent: { 
    flex: 1, 
    paddingTop: Spacing.xl 
  },
  sheetInner: { 
    padding: Spacing.xxl, 
    paddingBottom: Spacing.xxxxl 
  },
  sheetTitle: {
    ...Typography.headlineSmall,
    color: Colors.text,
    marginBottom: Spacing.lg,
    lineHeight: 30,
  },
  sheetMeta: { 
    marginBottom: Spacing.xl, 
    gap: Spacing.sm 
  },
  fullDescription: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
  },
  
  // Full Guidelines
  fullGuidelines: {
    backgroundColor: Colors.surfaceSecondary, 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.lg, 
    marginBottom: Spacing.xxl,
    borderWidth: 1, 
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  fullGuidelinesTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  guidelineSection: { 
    marginBottom: Spacing.lg 
  },
  sectionTitle: {
    ...Typography.titleSmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  sectionText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    paddingLeft: Spacing.sm,
  },
  
  // Sheet Actions
  sheetActions: { 
    flexDirection: 'row', 
    gap: Spacing.md 
  },
  sheetReminderButton: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#F3E8FF', 
    paddingVertical: Spacing.lg, 
    borderRadius: BorderRadius.lg, 
    gap: Spacing.sm,
    borderWidth: 1, 
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  sheetReminderText: {
    ...Typography.titleMedium,
    color: '#8B5CF6',
  },
  sheetDonateButton: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: Colors.error, 
    paddingVertical: Spacing.lg, 
    borderRadius: BorderRadius.lg, 
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  sheetDonateText: {
    ...Typography.titleMedium,
    color: Colors.white,
  },
});