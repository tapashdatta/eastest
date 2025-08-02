// screens/home/FeaturedEvents.tsx - Self-contained with styles

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useContent } from '@/contexts/ContentContext';
import { Post } from '@/types/content';
import { Calendar, MapPin, Heart, ChevronRight, Star, Blocks } from 'lucide-react-native';
import { Typography } from '@/constants/Typography';
import { FeaturedEventsCarousel } from './FeaturedEventsCarousel';
import OptimizedImage, { useEventImagePreloader } from '@/components/OptimizedImage';
import { imageManager } from '@/services/ImageManager';

const { width } = Dimensions.get('window');

// ✅ CENTERING CALCULATION for Featured Events
const CARD_WIDTH = width * 0.94;
const CARD_MARGIN_HORIZONTAL = 14;
const TOTAL_CARD_WIDTH = CARD_WIDTH + (CARD_MARGIN_HORIZONTAL * 2);
const CENTERING_PADDING = Math.max(0, (width - CARD_WIDTH) / 2);

// ================================
// LOCAL STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
    paddingBottom: 24,
  },
  eventCard: {
    width: CARD_WIDTH,
    height: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 3,
  },
  heartBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    zIndex: 1,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBadge: {
    borderRadius: 99,
    overflow: 'hidden',
    marginRight: 12,
  },
  ratingBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    borderRadius: 99,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  buttonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 4,
    paddingVertical: 4,
    backgroundColor: 'rgba(160, 160, 160, 0.3)',
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerBox: {
    marginHorizontal: 14,
    marginBottom: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextArea: {
    flex: 1,
    paddingRight: 16,
  },
  headerIconArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    ...Typography.titleLarge,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  mainSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
});

export const FeaturedEvents: React.FC = () => {
  const { posts } = useContent();
  const [carouselVisible, setCarouselVisible] = useState<boolean>(false);
  const [carouselInitialIndex, setCarouselInitialIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [preloadingCarousel, setPreloadingCarousel] = useState<boolean>(false);

  const featuredEventsByType = useMemo(() => {
    if (!posts.length) return [];

    const now = new Date();
    const eventTypes = ['festival', 'courses', 'guest_speaker', 'news'];
    const featuredEvents: Post[] = [];

    eventTypes.forEach(targetType => {
      const postsOfType = posts.filter(post =>
        post.eventData?.eventType?.toLowerCase() === targetType
      );

      if (postsOfType.length === 0) return;

      const upcomingEvents = postsOfType.filter(post => {
        if (!post.eventData?.startDate) return false;
        try {
          const startDate = new Date(post.eventData.startDate);
          return startDate > now;
        } catch {
          return false;
        }
      }).sort((a, b) => {
        const dateA = new Date(a.eventData!.startDate!).getTime();
        const dateB = new Date(b.eventData!.startDate!).getTime();
        return dateA - dateB;
      });

      const pastEvents = postsOfType.filter(post => {
        if (!post.eventData?.startDate) return true;
        try {
          const startDate = new Date(post.eventData.startDate);
          return startDate <= now;
        } catch {
          return true;
        }
      }).sort((a, b) => {
        const dateA = a.eventData?.startDate ? new Date(a.eventData.startDate).getTime() : new Date(a.date).getTime();
        const dateB = b.eventData?.startDate ? new Date(b.eventData.startDate).getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      });

      const selectedPost = upcomingEvents[0] || pastEvents[0];
      if (selectedPost) {
        featuredEvents.push(selectedPost);
      }
    });

    return featuredEvents.slice(0, 5);
  }, [posts]);

  const { ready: imagesPreloaded, progress: preloadProgress } = useEventImagePreloader(featuredEventsByType);

  useEffect(() => {
    if (featuredEventsByType.length > 0) {
      const imageUris = featuredEventsByType
        .map(event => event.image)
        .filter(Boolean);
      
      imageManager.preloadImages(imageUris, { 
        priority: 'normal',
        cachePolicy: 'memory-disk'
      });
    }
  }, [featuredEventsByType]);

  const formatEventDate = useCallback((dateString: string): { text: string; isUpcoming: boolean } => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isUpcoming = date > today;

      if (date.toDateString() === today.toDateString()) {
        return {
          text: `Today ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
          isUpcoming: false
        };
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return {
          text: `Tomorrow ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
          isUpcoming: true
        };
      } else if (isUpcoming) {
        return {
          text: date.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          isUpcoming: true
        };
      } else {
        return {
          text: `${date.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric'
          })} (Past)`,
          isUpcoming: false
        };
      }
    } catch {
      return { text: dateString, isUpcoming: false };
    }
  }, []);

  const getEventTypeDisplayName = useCallback((eventType?: string): string => {
    const names: Record<string, string> = {
      'ekadasi': 'Ekadasi',
      'festival': 'Festival',
      'courses': 'Course',
      'guest_speaker': 'Guest Speaker',
      'news': 'News',
      'bio_lcvs_speaker': 'LCVS Speaker',
      'bio_recent_vip': 'Recent VIP',
      'bio_team_member': 'Team Member',
      'daily_darshan': 'Daily Darshan'
    };
    return eventType ? names[eventType.toLowerCase()] || eventType : 'Event';
  }, []);

  const getEventRating = useCallback((): string => (4.0 + Math.random() * 1.0).toFixed(1), []);
  const getReviewCount = useCallback((): string => (Math.floor(Math.random() * 200) + 50).toString(), []);

  const handleEventPress = useCallback(async (index: number): Promise<void> => {
    setCarouselInitialIndex(index);
    setPreloadingCarousel(true);

    const carouselImageUris = featuredEventsByType
      .map(event => event.image)
      .filter(Boolean);

    try {
      await imageManager.preloadImages(carouselImageUris, { 
        priority: 'high',
        cachePolicy: 'memory-disk'
      });
    } catch (error) {
      // Continue even if preloading fails
    } finally {
      setPreloadingCarousel(false);
      setCarouselVisible(true);
    }
  }, [featuredEventsByType]);

  const toggleFavorite = useCallback((eventId: string): void => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  }, []);

  const renderEventCard = useCallback((event: Post, index: number) => {
    const eventRating: string = getEventRating();
    const eventReviewCount: string = getReviewCount();
    const eventId: string = event.id.toString();
    const isFavorite: boolean = favorites.has(eventId);
    const eventLocation: string = event.eventData?.location || 'ISKCON Temple';
    const eventType: string = getEventTypeDisplayName(event.eventData?.eventType);

    return (
      <TouchableOpacity
        key={`${event.id}-${index}`}
        style={styles.eventCard}
        activeOpacity={0.95}
        onPress={() => handleEventPress(index)}
        disabled={preloadingCarousel}
      >
        <OptimizedImage
          source={{ uri: event.image }}
          style={styles.eventImage}
          optimizeFor="carousel"
          priority="normal"
          placeholder="skeleton"
          cacheKey={`featured-${event.id}-${event.modified}-v2`}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />

        <TouchableOpacity
          style={styles.heartIcon}
          onPress={() => toggleFavorite(eventId)}
          activeOpacity={0.8}
        >
          <BlurView
            intensity={60}
            tint="light"
            style={styles.heartBlur}
          >
            <Heart 
              size={20} 
              color={isFavorite ? '#FF6B6B' : '#666'} 
              fill={isFavorite ? '#FF6B6B' : 'transparent'}
            />
          </BlurView>
        </TouchableOpacity>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.85)']}
          locations={[0, 0.1, 0.5, 0.7, 1]}
          style={styles.gradientOverlay}
        />

        <View style={styles.contentOverlay}>
          <Text style={[Typography.labelLarge, {
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 4,
            letterSpacing: 1,
          }]}>
            {eventType}
          </Text>

          <Text style={[Typography.headlineMedium, {
            color: '#FFFFFF',
            marginBottom: 12,
          }]}>
            {event.title}
          </Text>

          <View style={styles.ratingContainer}>
            <TouchableOpacity style={styles.ratingBadge}>
              <BlurView
                intensity={40}
                tint="light"
                style={styles.ratingBlur}
              >
                <Star size={14} color="#fff" />
                <Text style={[Typography.labelLarge, {
                  color: '#FFFFFF',
                  marginLeft: 4,
                }]}>
                  {eventRating}
                </Text>
              </BlurView>
            </TouchableOpacity>

            <Text style={[Typography.bodyMedium, {
              color: 'rgba(255, 255, 255, 0.8)',
            }]}>
              {eventReviewCount} reviews
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text style={[Typography.bodyMedium, {
                color: 'rgba(255, 255, 255, 0.8)',
                marginLeft: 6,
              }]}>
                {eventLocation}
              </Text>
            </View>

            {event.eventData?.startDate && (
              <View style={styles.dateContainer}>
                <Calendar size={14} color="rgba(255, 255, 255, 0.8)" />
                <Text style={[Typography.bodyMedium, {
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginLeft: 6,
                }]}>
                  {formatEventDate(event.eventData.startDate).text}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleEventPress(index)}
            activeOpacity={0.8}
            disabled={preloadingCarousel}
          >
            <BlurView
              intensity={40}
              tint="dark"
              style={styles.buttonBlur}
            >
              <Text style={[Typography.buttonText, {
                color: '#FFFFFF',
                textAlign: 'center',
                flex: 1,
                paddingVertical: 8,
              }]}>
                {preloadingCarousel ? 'Loading...' : 'Learn More'}
              </Text>

              <View style={styles.buttonIcon}>
                <ChevronRight size={30} color="#858585" strokeWidth={2} />
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [
    getEventRating,
    getReviewCount,
    favorites,
    getEventTypeDisplayName,
    formatEventDate,
    handleEventPress,
    toggleFavorite,
    preloadingCarousel
  ]);

  return (
    <View style={styles.container}>
      {/* CARDS SECTION */}
      {featuredEventsByType.length > 0 ? (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={TOTAL_CARD_WIDTH}
            snapToAlignment="start"
            contentContainerStyle={{ 
              paddingLeft: CENTERING_PADDING - CARD_MARGIN_HORIZONTAL,
              paddingRight: CENTERING_PADDING - CARD_MARGIN_HORIZONTAL,
              paddingTop: 24,
              paddingBottom: 32,
            }}
          >
            {featuredEventsByType.map(renderEventCard)}
          </ScrollView>
        </>
      ) : (
        <View style={[styles.emptyState, { marginTop: 24, paddingBottom: 32 }]}>
          <Text style={[Typography.titleLarge, {
            color: '#000000',
            marginBottom: 8,
            textAlign: 'center',
          }]}>
            Loading events....
          </Text>
          <Text style={[Typography.bodyMedium, {
            color: '#8E8E93',
            textAlign: 'center',
          }]}>
            Check back soon for updates!
          </Text>
        </View>
      )}

      {/* HEADER SECTION */}
      <View style={styles.headerBox}>
        <LinearGradient
          colors={['#092658ff', '#14233dff', '#5a67d8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerTextArea}>
              <Text style={styles.mainTitle}>Featured Events</Text>
              <Text style={styles.mainSubtitle}>
                Discover upcoming spiritual programs and celebrations
              </Text>
              {!imagesPreloaded && preloadProgress > 0 && (
                <Text style={[styles.mainSubtitle, { fontSize: 12, marginTop: 4 }]}>
                  Loading images... {Math.round(preloadProgress * 100)}%
                </Text>
              )}
            </View>
            <View style={styles.headerIconArea}>
              <View style={styles.iconCircle}>
                <Blocks size={28} color="#FFD700" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* CAROUSEL */}
      <FeaturedEventsCarousel
        events={featuredEventsByType}
        isVisible={carouselVisible}
        onClose={() => setCarouselVisible(false)}
        initialIndex={carouselInitialIndex}
      />
    </View>
  );
};