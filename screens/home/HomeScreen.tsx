// screens/home/HomeScreen.tsx - Self-contained with inline styles

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StatusBar,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Typography } from '@/constants/Typography';

// Import the additional sections
import { FeaturedEvents } from './FeaturedEvents';
import { EkadasiSection } from './EkadasiSection';
import { TodaysSchedule } from './TodaysSchedule';
import { SPQuotesSection } from './SPQuotesSection';

const { width, height } = Dimensions.get('window');

// ================================
// LOCAL STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  homeScrollContainer: {
    flexGrow: 1,
  },
  heroContainer: {
    position: 'relative',
    width: width,
    height: height,
  },
  slideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  slide: {
    width: width,
    height: height,
    justifyContent: 'center',
  },
  slideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  slideContent: {
    position: 'absolute',
    bottom: 280,
    left: 24,
    right: 24,
    zIndex: 2,
  },
  heroTitle: {
    ...Typography.displayMedium,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
    maxWidth: '85%',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  additionalSections: {
    backgroundColor: '#1C1C1E',
    paddingTop: 0,
    paddingBottom: 48,
  },
  floatingWelcome: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 100,
    ...Typography.titleMedium,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

// --- 1. Hero Data with Local Images ---
const heroData = [
  {
    id: '1',
    title: 'Community Spirit',
    subtitle: 'House in which The Whole World can live',
    cta: 'Learn More',
    image: require('@/assets/home/slide1.jpg'),
  },
  {
    id: '2',
    title: 'Spiritual',
    subtitle: 'Feel the spiritual jingles',
    cta: 'View Gallery',
    image: require('@/assets/home/slide2.jpg'),
  },
  {
    id: '3',
    title: 'Devotion',
    subtitle: 'Fill the heart in boundless joy',
    cta: 'See Schedule',
    image: require('@/assets/home/slide3.jpg'),
  },
  {
    id: '4',
    title: 'Experience',
    subtitle: 'The celebration in utmost bliss',
    cta: 'Learn More',
    image: require('@/assets/home/slide4.jpg'),
  },
  {
    id: '5',
    title: 'Experience',
    subtitle: 'The celebration in utmost bliss',
    cta: 'View Gallery',
    image: require('@/assets/home/slide5.jpg'),
  },
  {
    id: '6',
    title: 'Favourite',
    subtitle: 'Deity of Srila Prabhupada in ISKCON',
    cta: 'See Schedule',
    image: require('@/assets/home/slide6.jpg'),
  },
];

// --- 2. Main HomeScreen Component ---
export const HomeScreen: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Create animated values for each slide
  const slideAnimations = useRef(
    heroData.map((_, index) => new Animated.Value(index === 0 ? 1 : 0))
  ).current;
  
  const intervalRef = useRef<number | null>(null);

  // Use your actual authentication context
  const { user, isAuthenticated } = useAuth();

  // Modern crossfade functionality
  useEffect(() => {
    const startCrossfade = () => {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % heroData.length;
          
          // Create crossfade animation: fade out current, fade in next
          Animated.parallel([
            // Fade out current slide
            Animated.timing(slideAnimations[prevIndex], {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
            // Fade in next slide
            Animated.timing(slideAnimations[nextIndex], {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]).start();
          
          return nextIndex;
        });
      }, 5000);
    };

    startCrossfade();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slideAnimations]);

  // Function to get welcome message
  const getWelcomeMessage = () => {
    if (isAuthenticated && user?.first_name) {
      return `Welcome, ${user.first_name}`;
    }
    return 'Welcome, Guest';
  };

  // 🎯 EASY REORDERING: Just change the order of components in this array!
  const bottomSections = [
    FeaturedEvents,
    EkadasiSection,
    SPQuotesSection
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeScrollContainer}
      >
        {/* Hero Section with Modern Crossfade Animation */}
        <View style={styles.heroContainer}>
          {/* Render all slides stacked on top of each other */}
          {heroData.map((slide, index) => (
            <Animated.View
              key={slide.id}
              style={[
                styles.slideContainer,
                { opacity: slideAnimations[index] }
              ]}
            >
              <ImageBackground 
                source={slide.image} 
                style={styles.slide} 
                resizeMode="cover"
              >
                <View style={styles.slideOverlay} />
                {/* Hero Text on the image */}
                <View style={styles.slideContent}>
                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                </View>
              </ImageBackground>
            </Animated.View>
          ))}

          {/* Today's Schedule Section with Linear Gradient */}
          <LinearGradient
            colors={[
              'rgba(185, 185, 185, 0.5)',
              'rgba(31, 29, 29, 0.5)',
              '#1C1C1E'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.bottomSection}
          >
            <TodaysSchedule />
          </LinearGradient>
        </View>
        {/* Additional Sections at the Bottom - Reorderable */}
        <View style={styles.additionalSections}>
              {bottomSections.map((SectionComponent, index) => (
            <SectionComponent key={index} />
          ))}
        </View>
      </ScrollView>

      {/* Floating Welcome Message */}
      <Text style={styles.floatingWelcome}>
        {getWelcomeMessage()}
      </Text>
    </View>
  );
};