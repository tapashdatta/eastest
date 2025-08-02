// screens/home/FeaturedEventsCarousel.tsx - Self-contained with styles

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Calendar, MapPin, ArrowLeft, ChevronUp } from 'lucide-react-native';
import { Typography } from '@/constants/Typography';
import { Post } from '@/types/content';
import OptimizedImage, { CarouselImage } from '@/components/OptimizedImage';

const { width, height } = Dimensions.get('screen');
const IMAGE_WIDTH = width;
const IMAGE_HEIGHT = height * 0.4;
const DETAIL_SHEET_HEIGHT = height * 0.7;

interface FeaturedEventsCarouselProps {
  events: Post[];
  isVisible: boolean;
  onClose: () => void;
  onDonate?: () => void;
  initialIndex?: number;
}

// ================================
// LOCAL STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 100,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.titleLarge,
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  headerSpacer: { width: 40 },
  centerEventInfo: {
    position: 'absolute',
    top: '25%',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 50,
  },
  eventTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  eventTypeBadgeText: {
    ...Typography.labelLarge,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  eventTitle: {
    ...Typography.headlineMedium,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  eventExcerpt: {
    ...Typography.bodyLarge,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 20,
  },
  eventMeta: {
    alignItems: 'center',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    ...Typography.bodyLarge,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  swipeIndicator: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  swipeText: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  carouselCard: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  cardEventTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardEventTypeBadgeText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: '#FFFFFF',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
  },
  detailSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DETAIL_SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 300,
  },
  detailSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  detailSheetContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  detailTitle: {
    ...Typography.headlineSmall,
    color: '#000000',
    marginBottom: 16,
  },
  detailContent: {
    ...Typography.bodyLarge,
    color: '#3C3C43',
    marginBottom: 24,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailMetaText: {
    ...Typography.bodyLarge,
    color: '#000000',
    marginLeft: 12,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  detailPrimaryButton: {
    flex: 1,
    backgroundColor: '#212529',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailPrimaryButtonText: {
    ...Typography.buttonText,
    color: '#FFFFFF',
  },
  detailSecondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  detailSecondaryButtonText: {
    ...Typography.buttonText,
    color: '#000000',
  },
});

// Simple utility functions
const getEventTypeInfo = (eventType?: string) => {
  const eventInfo = {
    'ekadasi': { name: 'Ekadasi', color: '#9B59B6' },
    'festival': { name: 'Festival', color: '#FF9500' },
    'courses': { name: 'Course', color: '#34C759' },
    'guest_speaker': { name: 'Guest Speaker', color: '#007AFF' },
    'news': { name: 'News', color: '#FF3B30' },
  };
  return eventInfo[eventType as keyof typeof eventInfo] || { name: 'Event', color: '#8E8E93' };
};

const formatEventDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date > today 
      ? date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : `${date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} (Past)`;
  } catch {
    return dateString;
  }
};

export const FeaturedEventsCarousel: React.FC<FeaturedEventsCarouselProps> = ({
  events,
  isVisible,
  onClose,
  onDonate,
  initialIndex = 0,
}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList>(null);
  const detailSheetY = useRef(new Animated.Value(DETAIL_SHEET_HEIGHT)).current;
  const [currentEventIndex, setCurrentEventIndex] = useState(initialIndex);
  const [detailSheetVisible, setDetailSheetVisible] = useState(false);

  const currentEvent = events[currentEventIndex] || events[0];
  const currentEventTypeInfo = getEventTypeInfo(currentEvent?.eventData?.eventType);
  const formattedDate = currentEvent?.eventData?.startDate ? formatEventDate(currentEvent.eventData.startDate) : null;

  const handleShowDetails = useCallback(() => {
    setDetailSheetVisible(true);
    Animated.spring(detailSheetY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const hideDetailSheet = useCallback(() => {
    Animated.timing(detailSheetY, {
      toValue: DETAIL_SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setDetailSheetVisible(false));
  }, []);

  const handleDonate = useCallback(() => {
    hideDetailSheet();
    setTimeout(() => onDonate?.(), 200);
  }, [onDonate, hideDetailSheet]);

  useEffect(() => {
    if (isVisible && flatListRef.current) {
      setCurrentEventIndex(initialIndex);
      
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialIndex * IMAGE_WIDTH,
          animated: false,
        });
      }, 100);

      return () => clearTimeout(timer);
    }
    
    if (!isVisible) {
      setDetailSheetVisible(false);
      detailSheetY.setValue(DETAIL_SHEET_HEIGHT);
    }
  }, [isVisible, initialIndex]);

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const index = Math.round(value / IMAGE_WIDTH);
      if (index !== currentEventIndex && index >= 0 && index < events.length) {
        setCurrentEventIndex(index);
      }
    });

    return () => scrollX.removeListener(listener);
  }, [currentEventIndex, events.length]);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / IMAGE_WIDTH);
    if (index !== currentEventIndex && index >= 0 && index < events.length) {
      setCurrentEventIndex(index);
    }
  }, [currentEventIndex, events.length]);

  const handleScrollEndDrag = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / IMAGE_WIDTH);
    if (index !== currentEventIndex && index >= 0 && index < events.length) {
      setCurrentEventIndex(index);
    }
  }, [currentEventIndex, events.length]);

  const renderCarouselItem = useCallback(({ item, index }: { item: Post; index: number }) => {
    const inputRange = [(index - 1) * IMAGE_WIDTH, index * IMAGE_WIDTH, (index + 1) * IMAGE_WIDTH];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    const eventTypeInfo = getEventTypeInfo(item.eventData?.eventType);

    return (
      <TouchableOpacity onPress={handleShowDetails} activeOpacity={0.9}>
        <Animated.View style={[styles.carouselCard, { transform: [{ scale }], opacity }]}>
          <CarouselImage
            source={{ uri: item.image }}
            style={styles.carouselImage}
            priority="high"
            placeholder="skeleton"
            cacheKey={`carousel-${item.id}-${item.modified}`}
            contentFit="cover"
            transition={400}
            cachePolicy="memory-disk"
          />
          
          <View style={styles.cardOverlay}>
            <View style={[styles.cardEventTypeBadge, { backgroundColor: eventTypeInfo.color }]}>
              <Text style={styles.cardEventTypeBadgeText}>{eventTypeInfo.name}</Text>
            </View>
            
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  }, [scrollX, handleShowDetails]);

  if (!isVisible || events.length === 0) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        
        {/* Background with cross-platform blur */}
        {currentEvent && (
          <>
            {Platform.OS === 'ios' ? (
              <>
                <OptimizedImage
                  key={`bg-${currentEventIndex}`}
                  source={{ uri: currentEvent.image }}
                  style={StyleSheet.absoluteFillObject}
                  optimizeFor="background"
                  priority="high"
                  placeholder="gradient"
                  cacheKey={`bg-${currentEvent.id}-${currentEvent.modified}-${currentEventIndex}`}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
              </>
            ) : (
              <Image
                key={`bg-android-${currentEventIndex}`}
                source={{ uri: currentEvent.image }}
                style={StyleSheet.absoluteFillObject}
                blurRadius={40}
                resizeMode="cover"
              />
            )}
            <View style={styles.backgroundOverlay} />
          </>
        )}
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Featured Events</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View key={`event-info-${currentEventIndex}`} style={styles.centerEventInfo}>
          <View style={[styles.eventTypeBadge, { backgroundColor: currentEventTypeInfo.color }]}>
            <Text style={styles.eventTypeBadgeText}>{currentEventTypeInfo.name}</Text>
          </View>

          <Text style={styles.eventTitle} numberOfLines={3}>
            {currentEvent?.title}
          </Text>
          
          <Text style={styles.eventExcerpt} numberOfLines={2}>
            {currentEvent?.excerpt}
          </Text>

          <View style={styles.eventMeta}>
            {formattedDate && (
              <View style={styles.metaRow}>
                <Calendar size={18} color="#FFFFFF" />
                <Text style={styles.metaText}>{formattedDate}</Text>
              </View>
            )}
            
            <View style={styles.metaRow}>
              <MapPin size={18} color="#FFFFFF" />
              <Text style={styles.metaText}>
                {currentEvent?.eventData?.location || 'ISKCON Temple'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.carouselContainer}>
          <TouchableOpacity style={styles.swipeIndicator} onPress={handleShowDetails}>
            <ChevronUp size={20} color="#FFFFFF" />
            <Text style={styles.swipeText}>Tap for details</Text>
          </TouchableOpacity>

          <Animated.FlatList
            ref={flatListRef}
            data={events}
            keyExtractor={(item) => `carousel-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            onScrollEndDrag={handleScrollEndDrag}
            snapToInterval={IMAGE_WIDTH}
            decelerationRate="fast"
            renderItem={renderCarouselItem}
            removeClippedSubviews={true}
            maxToRenderPerBatch={3}
            windowSize={5}
            initialNumToRender={3}
            getItemLayout={(data, index) => ({
              length: IMAGE_WIDTH,
              offset: IMAGE_WIDTH * index,
              index,
            })}
          />
        </View>

        {detailSheetVisible && (
          <>
            <TouchableOpacity 
              style={styles.backdrop}
              activeOpacity={1}
              onPress={hideDetailSheet}
            />
            
            <Animated.View
              style={[styles.detailSheet, { transform: [{ translateY: detailSheetY }] }]}
            >
              <View style={styles.detailSheetHandle} />
              
              <ScrollView style={styles.detailSheetContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.detailTitle}>{currentEvent?.title}</Text>
                
                <Text style={styles.detailContent}>
                  {currentEvent?.content || currentEvent?.excerpt}
                </Text>
                
                {formattedDate && (
                  <View style={styles.detailMetaRow}>
                    <Calendar size={20} color="#212529" />
                    <Text style={styles.detailMetaText}>{formattedDate}</Text>
                  </View>
                )}
                
                <View style={styles.detailMetaRow}>
                  <MapPin size={20} color="#212529" />
                  <Text style={styles.detailMetaText}>
                    {currentEvent?.eventData?.location || 'ISKCON Temple'}
                  </Text>
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.detailPrimaryButton} onPress={handleDonate}>
                    <Text style={styles.detailPrimaryButtonText}>Donate</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.detailSecondaryButton} onPress={hideDetailSheet}>
                    <Text style={styles.detailSecondaryButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </>
        )}
      </View>
    </Modal>
  );
};