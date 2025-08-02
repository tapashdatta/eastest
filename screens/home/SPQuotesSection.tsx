// screens/home/SPQuotesSection.tsx - Self-contained with styles

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/Typography';
import { DailyQuotesService } from '@/services/DailyQuotesService';
import { DailyQuote } from '@/types/quotes';
import { quotesData } from '@/config/quotesData';

// ================================
// LOCAL STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 14,
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    borderRadius: 24,
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    flex: 1,
  },
  animatedContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    ...Typography.titleLarge,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 16,
  },
  newButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  dateText: {
    ...Typography.labelMedium,
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '600',
  },
  text: {
    ...Typography.bodyLarge,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: 'serif',
    textAlign: 'justify',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  authorLine: {
    width: 30,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 10,
  },
  authorText: {
    ...Typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});

export const SPQuotesSection: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<DailyQuote | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<any>(null);
  const [isChanging, setIsChanging] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const heightAnim = useRef(new Animated.Value(320)).current;

  // Helper function to calculate height
  const calculateHeight = (quote: DailyQuote): number => {
    const headerHeight = 80; // Header section height
    const badgeHeight = 40;  // Date badge height
    const authorHeight = 30; // Author section height
    const padding = 60;      // Total padding and margins
    
    // Estimate text height more generously (accounting for justification and wrapping)
    const charsPerLine = 35; // Conservative estimate for justified text
    const lineHeight = 22;
    const estimatedLines = Math.ceil(quote.quote.length / charsPerLine);
    const textHeight = estimatedLines * lineHeight;
    
    const totalHeight = headerHeight + badgeHeight + textHeight + authorHeight + padding;
    return Math.max(320, totalHeight + 0); // Add extra buffer
  };

  useEffect(() => {
    loadInitialQuote();
  }, []);

  const loadInitialQuote = () => {
    const todaysQuote = DailyQuotesService.getTodaysQuote();
    const backgroundImg = DailyQuotesService.getRandomBackgroundImage();
    
    setCurrentQuote(todaysQuote);
    setBackgroundImage(backgroundImg);
    
    // Calculate and set proper height for initial quote
    const initialHeight = calculateHeight(todaysQuote);
    heightAnim.setValue(initialHeight);
  };

  const getNewRandomQuote = () => {
    if (isChanging) return; // Prevent multiple rapid taps
    
    setIsChanging(true);
    
    // Fade out current quote
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      // Update quote and background
      const randomIndex = Math.floor(Math.random() * 365);
      const randomQuote = quotesData[randomIndex];
      
      setCurrentQuote(randomQuote);
      setBackgroundImage(DailyQuotesService.getRandomBackgroundImage());
      
      // Calculate estimated height using helper function
      const estimatedHeight = calculateHeight(randomQuote);
      
      // Animate to new height and fade in
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: estimatedHeight,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        })
      ]).start(() => {
        setIsChanging(false);
      });
    });
  };

  if (!currentQuote || !backgroundImage) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Single Self-Contained Quote Card */}
      <Animated.View style={[styles.cardContainer, { height: heightAnim }]}>
        <View style={styles.cardTouchable}>
          <ImageBackground 
            source={backgroundImage} 
            style={styles.card}
            imageStyle={styles.backgroundImage}
          >
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
              locations={[0, 0.5, 1]}
              style={styles.gradientOverlay}
            >
              {/* Quote Content with Fade Animation */}
              <Animated.View style={[styles.animatedContent, { opacity: fadeAnim }]}>
                {/* Header inside card */}
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <Ionicons name="chatbox-ellipses" size={28} color="#FFD700" />
                    <View style={styles.headerText}>
                      <Text style={styles.cardTitle}>Quotes</Text>
                      <Text style={styles.cardSubtitle}>Daily Dose Of Wisdom</Text>
                    </View>
                  </View>
                  
                  {/* New Quote Button - Only tappable element */}
                  <TouchableOpacity 
                    style={[styles.newButton, { opacity: isChanging ? 0.5 : 1 }]}
                    onPress={getNewRandomQuote}
                    activeOpacity={0.8}
                    disabled={isChanging}
                  >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Quote Section */}
                <View>
                  <View style={styles.badge}>
                    <Text style={styles.dateText}>{currentQuote.date}</Text>
                  </View>
                  
                  <Text style={styles.text}>"{currentQuote.quote}"</Text>
                  
                  <View style={styles.authorContainer}>
                    <View style={styles.authorLine} />
                    <Text style={styles.authorText}>{currentQuote.subtitle}</Text>
                  </View>
                </View>
              </Animated.View>
            </LinearGradient>
          </ImageBackground>
        </View>
      </Animated.View>
    </View>
  );
};