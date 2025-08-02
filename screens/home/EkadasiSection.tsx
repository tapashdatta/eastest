// screens/home/EkadasiSection.tsx - Self-contained with styles

import React, { useMemo, useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Calendar, Clock, ArrowUpRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useContent } from '@/contexts/ContentContext';
import { Typography } from '@/constants/Typography';
import OptimizedImage from '@/components/OptimizedImage';
import { imageManager } from '@/services/ImageManager';
import { EkadasiModal } from './EkadasiModal';

// Create animated TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// ================================
// LOCAL STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 14,
  },
  stackContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  backgroundCard2: {
    position: 'absolute',
    top: -20,
    left: 36,
    right: 36,
    bottom: 0,
    backgroundColor: 'rgba(183, 183, 183, 0.5)',
    borderRadius: 24,
    zIndex: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  backgroundCard: {
    position: 'absolute',
    top: -10,
    left: 18,
    right: 18,
    bottom: 0,
    backgroundColor: 'rgba(230, 230, 230, 0.8)',
    borderRadius: 24,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    zIndex: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  countdownBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countdownText: {
    ...Typography.labelLarge,
    color: '#FFFFFF',
    paddingRight: 6,
  },
  expandButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eeeeee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    marginBottom: 16,
  },
  cardTitle: {
    ...Typography.titleLarge,
    color: '#3C3C43',
    marginBottom: 4,
  },
  cardSubtitle: {
    ...Typography.bodyMedium,
    color: '#8E8E93',
  },
  imageBox: {
    width: 'auto',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginHorizontal: -8,
    marginBottom: -8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 16,
  },
});

export const EkadasiSection: React.FC = () => {
  const { posts, loading, error } = useContent();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [sourceCardPosition, setSourceCardPosition] = useState<{ x: number; y: number; width: number; height: number } | undefined>();
  const cardRef = useRef<any>(null);
  const cardScale = useRef(new Animated.Value(1)).current;

  const ekadasiPosts = useMemo(() => {
    return posts.filter(post => 
      post.eventData?.eventType?.toLowerCase() === 'ekadasi'
    );
  }, [posts]);

  const upcomingEkadasiPosts = useMemo(() => {
    if (ekadasiPosts.length === 0) return [];

    const now = new Date();
    
    const upcoming = ekadasiPosts
      .filter(post => {
        if (!post.eventData?.startDate) return false;
        try {
          const startDate = new Date(post.eventData.startDate);
          return startDate > now;
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.eventData!.startDate!).getTime();
        const dateB = new Date(b.eventData!.startDate!).getTime();
        return dateA - dateB;
      });

    const past = ekadasiPosts
      .filter(post => {
        if (!post.eventData?.startDate) return true;
        try {
          const startDate = new Date(post.eventData.startDate);
          return startDate <= now;
        } catch {
          return true;
        }
      })
      .sort((a, b) => {
        const dateA = a.eventData?.startDate ? new Date(a.eventData.startDate).getTime() : new Date(a.date).getTime();
        const dateB = b.eventData?.startDate ? new Date(b.eventData.startDate).getTime() : new Date(b.date).getTime();
        return dateB - dateA;
      });

    const combined = [...upcoming, ...past];
    return combined.slice(0, 10);
  }, [ekadasiPosts]);

  const nextEkadasi = useMemo(() => {
    return upcomingEkadasiPosts[0] || null;
  }, [upcomingEkadasiPosts]);

  useEffect(() => {
    if (upcomingEkadasiPosts.length > 0) {
      const imageUris = upcomingEkadasiPosts
        .map(post => post.image)
        .filter(Boolean);

      if (imageUris.length > 0) {
        const highPriorityImages = imageUris.slice(0, 3);
        const normalPriorityImages = imageUris.slice(3);

        imageManager.preloadImages(highPriorityImages, {
          priority: 'high',
          cachePolicy: 'memory-disk'
        }).then(() => {
          setImagesPreloaded(true);
        });

        if (normalPriorityImages.length > 0) {
          imageManager.preloadImages(normalPriorityImages, {
            priority: 'low',
            cachePolicy: 'memory-disk'
          });
        }
      } else {
        setImagesPreloaded(true);
      }
    }
  }, [upcomingEkadasiPosts]);

  const daysUntilEkadasi = useMemo(() => {
    if (!nextEkadasi?.eventData?.startDate) return null;
    
    try {
      const now = new Date();
      const ekadasiDate = new Date(nextEkadasi.eventData.startDate);
      const timeDiff = ekadasiDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < 0) return null;
      if (daysDiff === 0) return 'Today';
      if (daysDiff === 1) return 'Tomorrow';
      return `${daysDiff}d left`;
    } catch {
      return null;
    }
  }, [nextEkadasi]);

  const formatEkadasiDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }, []);

  useEffect(() => {
    if (!modalVisible) {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 400,
        friction: 12,
      }).start();
    }
  }, [modalVisible, cardScale]);

  const handleCardPressIn = useCallback(() => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 400,
      friction: 12,
    }).start();
  }, [cardScale]);

  const handleCardPressOut = useCallback(() => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 12,
    }).start();
  }, [cardScale]);

  const handleCardPress = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setSourceCardPosition({ x: pageX, y: pageY, width, height });
        setModalInitialIndex(0);
        setModalVisible(true);
      });
    } else {
      setModalInitialIndex(0);
      setModalVisible(true);
    }
  }, []);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => {
      setSourceCardPosition(undefined);
    }, 500);
  }, []);

  const handleNavigateToDonate = useCallback(() => {
    try {
      router.push('/(tabs)/donate');
      requestAnimationFrame(() => {
        setModalVisible(false);
        setSourceCardPosition(undefined);
      });
    } catch (error) {
      console.warn('Navigation to donate screen failed:', error);
      try {
        router.push('/donate');
        requestAnimationFrame(() => {
          setModalVisible(false);
          setSourceCardPosition(undefined);
        });
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
        setModalVisible(false);
        setSourceCardPosition(undefined);
      }
    }
  }, []);

  if (loading || error || !nextEkadasi || upcomingEkadasiPosts.length === 0) {
    return null;
  }

  const isUpcoming = daysUntilEkadasi !== null;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.stackContainer}>
          <View style={styles.backgroundCard} />
          <View style={styles.backgroundCard2} />
          
          <AnimatedTouchableOpacity 
            ref={cardRef}
            style={[
              styles.mainContainer,
              {
                transform: [{ scale: cardScale }],
              },
            ]}
            activeOpacity={0.9}
            onPressIn={handleCardPressIn}
            onPressOut={handleCardPressOut}
            onPress={handleCardPress}
          >
            <View style={styles.topBar}>
              {isUpcoming && daysUntilEkadasi && (
                <View style={styles.countdownBadge}>
                  <Clock size={24} color="#000000ff" fill="#FFD700"/>
                  <Text style={styles.countdownText}>
                    {daysUntilEkadasi}
                  </Text>
                </View>
              )}
              
              <View style={styles.expandButton}>
                <ArrowUpRight size={20} color="#666666" />
              </View>
            </View>

            <View style={styles.textSection}>
              <Text style={styles.cardTitle}>
                {nextEkadasi.title}
              </Text>
              
              <Text style={styles.cardSubtitle}>
                {nextEkadasi.eventData?.startDate 
                  ? formatEkadasiDate(nextEkadasi.eventData.startDate)
                  : 'Join us for this sacred day'
                }
              </Text>
            </View>

            <View style={styles.imageBox}>
              <OptimizedImage 
                source={{ uri: nextEkadasi.image }}
                style={styles.cardImage}
                optimizeFor="thumbnail"
                priority="normal"
                placeholder="skeleton"
                cacheKey={`ekadasi-${nextEkadasi.id}-${nextEkadasi.modified}`}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
                showActivityIndicator={true}
                activityIndicatorProps={{
                  size: 'small',
                  color: '#FFD700'
                }}
              />
            </View>
          </AnimatedTouchableOpacity>
        </View>
      </View>

      <EkadasiModal
        events={upcomingEkadasiPosts}
        isVisible={modalVisible}
        onClose={handleModalClose}
        initialIndex={modalInitialIndex}
        imagesPreloaded={imagesPreloaded}
        sourceCardPosition={sourceCardPosition}
        onNavigateToDonate={handleNavigateToDonate}
      />
    </>
  );
};