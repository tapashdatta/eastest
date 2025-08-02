import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewStyle,
  RefreshControlProps,
} from 'react-native';
import Animated, {
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardAwareContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollEnabled?: boolean;
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
  enableAutomaticScroll?: boolean;
  extraScrollHeight?: number;
  showsVerticalScrollIndicator?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export default function KeyboardAwareContainer({
  children,
  style,
  scrollEnabled = true,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset,
  enableAutomaticScroll = true,
  extraScrollHeight = 50, // Increased default for better message visibility
  showsVerticalScrollIndicator = false,
  refreshControl,
}: KeyboardAwareContainerProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useSharedValue(0);

  // Calculate default keyboard offset based on platform and safe area
  const defaultKeyboardOffset = Platform.select({
    ios: insets.bottom > 0 ? 0 : 20,
    android: 40, // Increased for better Android handling
    default: 0,
  });

  const finalKeyboardOffset = keyboardVerticalOffset ?? defaultKeyboardOffset;

  useEffect(() => {
    const { Keyboard } = require('react-native');

    const keyboardWillShow = (event: any) => {
      const { height } = event;
      
      // Smooth animation when keyboard appears
      keyboardHeight.value = withSpring(height, {
        damping: 15, // Reduced damping for faster response
        stiffness: 400, // Increased stiffness for quicker animation
        mass: 0.8,
      });
    };

    const keyboardWillHide = () => {
      // Smooth animation when keyboard disappears
      keyboardHeight.value = withSpring(0, {
        damping: 20,
        stiffness: 400,
        mass: 0.8,
      });
    };

    const keyboardDidShow = (event: any) => {
      if (event?.endCoordinates?.height) {
        keyboardHeight.value = event.endCoordinates.height;
      }
    };

    const keyboardDidHide = () => {
      keyboardHeight.value = 0;
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideSubscription = Keyboard.addListener(hideEvent, keyboardWillHide);
    const didShowSubscription = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
    const didHideSubscription = Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
      didShowSubscription?.remove();
      didHideSubscription?.remove();
    };
  }, []);

  // Improved animated style for better keyboard handling
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: Platform.OS === 'android' ? -keyboardHeight.value * 0.1 : 0,
        },
      ],
      paddingBottom: Platform.OS === 'ios' ? keyboardHeight.value * 0.2 : 0, // Add padding to lift content
    };
  });

  const containerStyle = [
    styles.container,
    style,
    animatedStyle,
  ];

  if (scrollEnabled) {
    return (
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={behavior}
        keyboardVerticalOffset={finalKeyboardOffset}
      >
        <Animated.View style={containerStyle}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: extraScrollHeight }]}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            keyboardShouldPersistTaps="handled"
            bounces={Platform.OS === 'ios'}
            overScrollMode={Platform.OS === 'android' ? 'never' : 'always'}
            refreshControl={refreshControl}
            // Improved scroll behavior for keyboard
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            automaticallyAdjustContentInsets={Platform.OS === 'ios'}
            contentInsetAdjustmentBehavior="automatic"
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={behavior}
      keyboardVerticalOffset={finalKeyboardOffset}
    >
      <Animated.View style={containerStyle}>
        {children}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});