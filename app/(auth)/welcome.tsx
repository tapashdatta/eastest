// app/(auth)/welcome.tsx - Updated with design system
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, HeadlineText, BodyText, ButtonText } from '@/components/Text';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows, Layout, Containers } from '@/constants/CommonStyles';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Auto-play the animation when component mounts
    animationRef.current?.play();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* BACKGROUND LAYERS */}
      {/* Top White Background with curved bottom */}
      <View style={styles.topBackground} />
      
      {/* Bottom Gradient Background */}
      <LinearGradient
        //OLD Gradient colors={['#7C9885', '#5A7A63', '#3E5B47']}
        colors={['#989e6e','#b1b28d', '#5A7A63', '#3E5B47']}
        style={styles.bottomBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      {/* CONTENT CONTAINER - 85% of screen */}
      <View style={styles.contentContainer}>
        {/* Brand Section */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>WELCOME</Text>
          <Text style={styles.brandSubtitle}>TO ISKCON LONDON</Text>
        </View>
        
        {/* Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            ref={animationRef}
            source={require('@/assets/animation/splash.json')}
            autoPlay={true}
            loop={true}
            speed={0.8}
            style={styles.lottieAnimation}
            resizeMode="contain"
          />
        </View>
        
        {/* Text Content */}
        <View style={styles.textContainer}>
          <HeadlineText style={styles.title}>
            Discover Yourself
          </HeadlineText>
          <BodyText style={styles.subtitle}>
            Connect with your inner self through{'\n'}spiritual practice and community.
          </BodyText>
        </View>
      </View>
      
      {/* BOTTOM SECTION - 15% of screen */}
      <View style={styles.bottomSection}>
        {/* Overlapping Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.8}
            >
              <ButtonText style={styles.primaryButtonText}>Register</ButtonText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <ButtonText style={styles.secondaryButtonText}>Sign In</ButtonText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Continue as Guest */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <ButtonText style={styles.skipButtonText}>Continue as Guest</ButtonText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  /* BACKGROUND LAYERS */
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.46, // 50% of screen
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 1,
  },
  bottomBackground: {
    position: 'absolute',
    top: height * 0.4, // Start at 50%
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  
  /* CONTENT CONTAINER - 85% */
  contentContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.8, // 85% of screen
    paddingHorizontal: Spacing.xxxl,
    paddingTop: 80,
    paddingBottom: 20,
    justifyContent: 'space-around', // Space between alignment
    alignItems: 'center',
    zIndex: 10,
  },
  
  /* BRAND SECTION */
  brandContainer: {
    alignItems: 'center',
  },
  brandTitle: {
    ...Typography.displaySmall,
    color: Colors.primary,
    letterSpacing: 6,
    fontSize: 34,
    fontWeight: '700',
  },
  brandSubtitle: {
    color: Colors.textMuted,
    letterSpacing: 6,
    textTransform: 'uppercase',
    fontSize: 12,
    marginTop: 4,
  },
  
  /* ANIMATION */
  animationContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  
  /* TEXT CONTENT */
  textContainer: {
    alignItems: 'center',
  },
  title: {
    ...Typography.headlineLarge,
    color: '#fff',
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '700',
    fontSize: 28,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  
  /* BOTTOM SECTION - 15% */
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.15, // 15% of screen
    paddingHorizontal: Spacing.xxxl,
    paddingBottom: 40,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  
  /* BUTTONS */
  buttonContainer: {
    marginTop: -30, // Overlap into the content area
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
  },
  primaryButtonText: {
    ...Typography.buttonText,
    color: '#7C9885',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    ...Typography.buttonText,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  
  /* SKIP BUTTON */
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    ...Typography.labelLarge,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    opacity: 0.8,
    fontSize: 14,
  },
});
