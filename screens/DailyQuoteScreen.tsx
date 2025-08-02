// screens/DailyQuoteScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView, ExperimentalBlurMethod } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Text, TitleText, BodyText, CaptionText } from '@/components/Text';
import { DailyQuotesService } from '@/services/DailyQuotesService';
import { DailyQuoteScreenProps, DailyQuote } from '@/types/quotes';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COUNTDOWN_DURATION = 300;
const CIRCLE_RADIUS = 22;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const SWIPE_THRESHOLD = { distance: -120, velocity: -1000 };
const COLORS = {
  white: (opacity: number) => `rgba(255,255,255,${opacity})`,
  black: (opacity: number) => `rgba(0,0,0,${opacity})`,
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DailyQuoteScreen({ onClose }: DailyQuoteScreenProps) {
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [backgroundImage, setBackgroundImage] = useState<any>(null);
  const [todaysQuote, setTodaysQuote] = useState<DailyQuote | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const progressValue = useSharedValue(0);
  const countdownScale = useSharedValue(1);
  const countdownOpacity = useSharedValue(0.9);

  const animateEntrance = () => {
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  useEffect(() => {
    setTodaysQuote(DailyQuotesService.getTodaysQuote());
    setBackgroundImage(DailyQuotesService.getRandomBackgroundImage());
    setStartTime(Date.now());
    animateEntrance();
  }, []);

  useEffect(() => {
    if (isPaused || !startTime) return;

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
      
      setCountdown(Math.ceil(remaining));
      progressValue.value = Math.min(elapsed / COUNTDOWN_DURATION, 1);
      
      if (remaining <= 0) {
        clearInterval(timer);
        onClose();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isPaused, startTime, onClose, progressValue]);

  const handleClose = () => {
    setTimeout(() => onClose(), 300);
  };

  const handleCountdownInteraction = (isPressed: boolean) => {
    if (isPressed) {
      if (!isPaused && startTime) {
        setElapsedTime((Date.now() - startTime) / 1000);
      }
      setIsPaused(true);
    } else {
      if (isPaused) {
        setStartTime(Date.now() - (elapsedTime * 1000));
      }
      setIsPaused(false);
    }
    
    countdownScale.value = withSpring(isPressed ? 1.1 : 1, { damping: 15, stiffness: 300 });
    countdownOpacity.value = withTiming(isPressed ? 1 : 0.9, { duration: 200 });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY > 0 ? event.translationY * 0.3 : event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY < SWIPE_THRESHOLD.distance || event.velocityY < SWIPE_THRESHOLD.velocity) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 400 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const swipeAwareStyle = useAnimatedStyle(() => {
    const swipeProgress = interpolate(translateY.value, [-200, 0], [1, 0], Extrapolation.CLAMP);
    return {
      opacity: 1 - swipeProgress,
      transform: [{ translateY: interpolate(translateY.value, [-200, 0], [-20, 0], Extrapolation.CLAMP) }],
    };
  });

  const countdownStyle = useAnimatedStyle(() => ({
    opacity: countdownOpacity.value,
    transform: [{ scale: countdownScale.value }],
  }));

  const progressProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progressValue.value),
  }));

  if (!todaysQuote || !backgroundImage) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground source={backgroundImage} style={styles.background}>
        <LinearGradient
          colors={[COLORS.black(0), COLORS.black(0.6), COLORS.black(0.7)]}
          locations={[0, 0.6, 1]}
          style={styles.overlay}
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.content, containerStyle]}>
              <View style={styles.header} />
              <View style={styles.centeredContent} />

              <Animated.View style={[styles.bottomSection, swipeAwareStyle]}>
                {Platform.OS === 'ios' ? (
                  <BlurView intensity={40} tint="light" style={styles.quoteCard}>
                    <LinearGradient
                      colors={[COLORS.white(0.15), COLORS.white(0.05)]}
                      style={styles.quoteCardGradient}
                    >
                      <View style={styles.datePill}>
                        <TitleText style={styles.dateText}>{todaysQuote.date}</TitleText>
                      </View>
                      <View style={styles.quoteMark}>
                        <Ionicons name="chatbox-outline" size={32} color={COLORS.white(0.3)} />
                      </View>
                      <Text style={styles.quoteText}>"{todaysQuote.quote}"</Text>
                      <View style={styles.authorContainer}>
                        <View style={styles.authorLine} />
                        <BodyText style={styles.subtitleText}>{todaysQuote.subtitle}</BodyText>
                      </View>
                    </LinearGradient>
                  </BlurView>
                ) : (
                  <BlurView
                    intensity={50}
                    tint="light"
                    experimentalBlurMethod="none"
                    style={styles.quoteCard}
                  >
                    <LinearGradient
                      colors={[COLORS.white(0.15), COLORS.white(0.05)]}
                      style={styles.quoteCardGradient}
                    >
                      <View style={styles.datePill}>
                        <TitleText style={styles.dateText}>{todaysQuote.date}</TitleText>
                      </View>
                      <View style={styles.quoteMark}>
                        <Ionicons name="chatbox-outline" size={32} color={COLORS.white(0.3)} />
                      </View>
                      <Text style={styles.quoteText}>"{todaysQuote.quote}"</Text>
                      <View style={styles.authorContainer}>
                        <View style={styles.authorLine} />
                        <BodyText style={styles.subtitleText}>{todaysQuote.subtitle}</BodyText>
                      </View>
                    </LinearGradient>
                  </BlurView>
                )}

                <Animated.View style={[styles.countdownContainer, countdownStyle]}>
                  <TouchableOpacity
                    onPressIn={() => handleCountdownInteraction(true)}
                    onPressOut={() => handleCountdownInteraction(false)}
                    activeOpacity={0.8}
                    style={styles.countdownButton}
                  >
                    <View style={styles.modernCountdownContainer}>
                      <Svg style={styles.progressSvg}>
                        <Circle
                          cx={27} cy={27} r={CIRCLE_RADIUS}
                          stroke={COLORS.white(0.2)} strokeWidth="3" fill="transparent"
                        />
                        <AnimatedCircle
                          cx={27} cy={27} r={CIRCLE_RADIUS}
                          stroke={COLORS.white(0.95)} strokeWidth="3" fill="transparent"
                          strokeDasharray={CIRCLE_CIRCUMFERENCE} strokeLinecap="round"
                          animatedProps={progressProps}
                          transform="rotate(-90 27 27)"
                        />
                      </Svg>
                      <View style={styles.countdownNumber}>
                        {isPaused ? (
                          <Ionicons name="play" size={14} color="#FFFFFF" />
                        ) : (
                          <Text style={styles.modernCountdownText}>{countdown}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.swipeIndicator}>
                  {Platform.OS === 'ios' ? (
                    <BlurView intensity={60} tint="light" style={styles.swipeTextContainer}>
                      <Ionicons name="chevron-up" size={16} color={COLORS.white(0.9)} />
                      <CaptionText style={styles.swipeText}>Slide Here To Skip</CaptionText>
                    </BlurView>
                  ) : (
                    <BlurView
                      intensity={70}
                      tint="light"
                      experimentalBlurMethod="none"
                      style={styles.swipeTextContainer}
                    >
                      <Ionicons name="chevron-up" size={16} color={COLORS.white(0.9)} />
                      <CaptionText style={styles.swipeText}>Slide Here To Skip</CaptionText>
                    </BlurView>
                  )}
                  <View style={styles.swipeHandle} />
                </View>
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, resizeMode: 'cover' },
  overlay: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  header: { height: 60 },
  centeredContent: { flex: 1 },
  bottomSection: {
    alignItems: 'center',
    width: '100%',
  },
  quoteCard: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    marginHorizontal: 10,
  },
  quoteCardGradient: { padding: 32, alignItems: 'center' },
  quoteMark: { position: 'absolute', top: 20, right: 20, opacity: 1 },
  dateText: {
    color: '#3a3a3aff',
    fontSize: 18,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 1,
  },
  datePill: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 99,
    marginBottom: 20,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'justify',
    lineHeight: 24,
    marginBottom: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  authorLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.white(0.5),
    marginRight: 12,
  },
  subtitleText: {
    color: COLORS.white(0.9),
    fontSize: 16,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  countdownContainer: { 
    marginBottom: 20,
    marginTop: 40,
  },
  countdownButton: { borderRadius: 32, overflow: 'visible' },
  modernCountdownContainer: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressSvg: {
    position: 'absolute',
    width: 54,
    height: 54,
    top: 0,
    left: 0,
  },
  countdownNumber: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black(0.3),
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.white(0.1),
  },
  modernCountdownText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  swipeIndicator: { alignItems: 'center' },
  swipeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  swipeText: {
    color: COLORS.white(0.9),
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  swipeHandle: {
    width: 90,
    height: 3,
    backgroundColor: COLORS.white(0.1),
    borderRadius: 3,
  },
});