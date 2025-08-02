import React, { useRef, useEffect } from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Text, HeadlineText, BodyText, ButtonText } from '@/components/Text';
import LottieView from 'lottie-react-native';
import { Home } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function NotFoundScreen() {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    // Auto-play the animation when component mounts
    animationRef.current?.play();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <StatusBar style="dark" />
      
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Lottie Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={animationRef}
              source={require('@/assets/animation/notfound.json')}
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
              Page Not Found
            </HeadlineText>
            <BodyText style={styles.subtitle}>
              Sorry, we couldn't find the page you're looking for.
            </BodyText>
          </View>

          {/* Navigation Link */}
          <View style={styles.linkContainer}>
            <Link href="/(tabs)" style={styles.link}>
              <View style={styles.linkContent}>
                <ButtonText style={styles.linkText}>Go Back Home</ButtonText>
                
                {/* Home Icon */}
                <View style={styles.iconContainer}>
                  <Home size={24} color="#7C9885" strokeWidth={2} />
                </View>
              </View>
            </Link>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3E2D',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7B6B',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  linkContainer: {
    alignItems: 'center',
  },
  link: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#B8D4B8',
    shadowColor: 'rgba(124, 152, 133, 0.25)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  linkContent: {
    alignItems: 'center',
  },
  linkText: {
    color: '#2D3E2D',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});