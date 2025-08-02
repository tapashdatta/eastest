import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Text } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function MyAccount() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Hide on specific pages
  const shouldHide = 
                    pathname.includes('/splash') || 
                    pathname.includes('/welcome') || 
                    pathname.includes('/account') || 
                    pathname.includes('/(auth)');

  
  // Animation for press feedback
  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    router.push('/(tabs)/account');
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: shouldHide ? withTiming(0, { duration: 200 }) : withTiming(opacity.value, { duration: 200 }),
      pointerEvents: shouldHide ? 'none' : 'auto',
    };
  });

  if (shouldHide) {
    return null;
  }

  return (
    <AnimatedTouchableOpacity
      style={[styles.floatingButton, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {isAuthenticated && user?.first_name ? (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user.first_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        ) : (
          <View style={styles.guestContainer}>
            <User size={20} color={Colors.text} strokeWidth={2.5} />
          </View>
        )}
      </View>
      
      {/* Subtle glow effect */}
      <View style={styles.glowEffect} />
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.titleMedium,
    color: Colors.textLight,
    fontWeight: '700',
  },
  guestContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    opacity: 0.1,
    zIndex: -1,
  },
});