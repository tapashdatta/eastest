// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React, { useCallback, useState, useMemo, useEffect } from "react";
import { Dimensions, StyleSheet, View, TouchableOpacity, Text, TouchableWithoutFeedback, Platform } from "react-native";
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  FadeInDown,
  FadeOutDown,
  interpolateColor,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { router, usePathname } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { EventsIcon, ServicesIcon, LCVSIcon, ProfileIcon, DonateIcon, MenuIcon, HomeIcon, SettingsIcon } from '@/assets/icons';

// Types
type AppRoute = '/' | '/donate' | '/events' | '/calendar' | '/services' | '/account' | '/settings';

interface IconProps {
  size: number;
  color: string;
  strokeWidth?: number;
}

interface MenuButtonProps {
  icon: React.ComponentType<IconProps>;
  text: string;
  onPress: () => void;
  delay?: number;
}

interface MenuBackdropProps {
  onPress: () => void;
  style: any;
}

interface MenuItemConfig {
  icon: React.ComponentType<IconProps>;
  text: string;
  route: AppRoute;
  delay: number;
}

// Constants
const { width: WIDTH, height: HEIGHT } = Dimensions.get("screen");
const MENU_BUTTON_SIZE = 60;
const MENU_CONTENT_TOP_OFFSET = MENU_BUTTON_SIZE + 10;
const ANIMATION_DURATION = 200;
const SPRING_CONFIG = { damping: 12, stiffness: 200 };
const COLLAPSE_TIMING_CONFIG = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
};
const COLLAPSE_SPRING_CONFIG = { damping: 18, stiffness: 180 };
const MENU_WIDTH_RATIO = 0.8;
const MENU_TOP_POSITION = 50;
const BOTTOM_MARGIN = 80;
const MAX_MENU_HEIGHT = HEIGHT - MENU_TOP_POSITION - BOTTOM_MARGIN;
const ESTIMATED_MENU_HEIGHT = Math.min(320, MAX_MENU_HEIGHT);

// Menu items configuration
const MENU_ITEMS: readonly MenuItemConfig[] = [
  { icon: HomeIcon, text: "Visit Featured", route: "/", delay: 50 },
  { icon: DonateIcon, text: "Make Donations", route: "/donate", delay: 100 },
  { icon: LCVSIcon, text: "Register For Courses", route: "/events", delay: 150 },
  { icon: EventsIcon, text: "View Events Calendar", route: "/calendar", delay: 200 },
  { icon: ServicesIcon, text: "Browse More Services", route: "/services", delay: 250 },
  { icon: ProfileIcon, text: "Manage Profile", route: "/account", delay: 300 },
  { icon: SettingsIcon, text: "Security & Preferences", route: "/settings", delay: 300 },
] as const;

/**
 * A reusable animated button component for the menu items.
 */
const MenuButton = React.memo<MenuButtonProps>(({ icon: IconComponent, text, onPress, delay = 0 }) => {
  const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
  return (
    <AnimatedTouchable
      style={styles.menuButton}
      onPress={onPress}
      entering={FadeInDown.delay(delay)}
      exiting={FadeOutDown}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      <IconComponent size={24} color={Colors.textLight} strokeWidth={2} />
      <Text style={styles.menuText}>{text}</Text>
    </AnimatedTouchable>
  );
});

/**
 * Platform-agnostic backdrop component with blur effect
 */
const MenuBackdrop = React.memo<MenuBackdropProps>(({ onPress, style }) => (
  <TouchableWithoutFeedback 
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel="Close menu"
  >
    <Animated.View style={[styles.backdrop, style]}>
      <BlurView 
        intensity={20} 
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod="dimezisBlurView"
      />
    </Animated.View>
  </TouchableWithoutFeedback>
));

/**
 * A floating menu that expands from a single settings icon.
 * It is positioned absolutely and closes when an option is selected or the user taps outside.
 */
function CustomFloatingMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  // Animated values
  const animatedWidth = useSharedValue(MENU_BUTTON_SIZE);
  const animatedHeight = useSharedValue(MENU_BUTTON_SIZE);
  const animatedBorderRadius = useSharedValue(MENU_BUTTON_SIZE / 2);
  const backdropOpacity = useSharedValue(0);
  const menuProgress = useSharedValue(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        animatedWidth.value = MENU_BUTTON_SIZE;
        animatedHeight.value = MENU_BUTTON_SIZE;
        backdropOpacity.value = 0;
        menuProgress.value = 0;
      } catch (error) {
        // Silent cleanup - animations may already be disposed
      }
    };
  }, []);

  // Memoized target values
  const targetValues = useMemo(() => ({
    width: WIDTH * MENU_WIDTH_RATIO,
    height: ESTIMATED_MENU_HEIGHT,
    borderRadius: 30,
  }), []);

  // Check if current route should have white icon
  const shouldShowWhiteIcon = useMemo(() => {
    return pathname === '/' || pathname === '/donate/Donate' || pathname === '/calendar' || pathname === '/services';
  }, [pathname]);

  // Animation completion handler
  const onAnimationComplete = useCallback((expanded: boolean) => {
    'worklet';
    runOnJS(setIsAnimating)(false);
    if (expanded) {
      runOnJS(setShowMenu)(true);
    }
  }, []);

  // Toggles the menu between its expanded and collapsed states.
  const toggleMenu = useCallback(() => {
    try {
      if (isAnimating) return;

      setIsAnimating(true);
      
      if (showMenu) {
        // Smooth Collapse Animation
        setShowMenu(false);
        
        backdropOpacity.value = withTiming(0, COLLAPSE_TIMING_CONFIG);
        menuProgress.value = withTiming(0, COLLAPSE_TIMING_CONFIG);

        animatedWidth.value = withSpring(MENU_BUTTON_SIZE, COLLAPSE_SPRING_CONFIG);
        animatedHeight.value = withSpring(MENU_BUTTON_SIZE, COLLAPSE_SPRING_CONFIG, 
          () => onAnimationComplete(false)
        );
        animatedBorderRadius.value = withSpring(MENU_BUTTON_SIZE / 2, COLLAPSE_SPRING_CONFIG);
      } else {
        // Expand Animation
        backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
        menuProgress.value = withTiming(1, { duration: ANIMATION_DURATION });

        animatedWidth.value = withSpring(targetValues.width, SPRING_CONFIG);
        animatedHeight.value = withSpring(targetValues.height, SPRING_CONFIG);
        animatedBorderRadius.value = withSpring(targetValues.borderRadius, 
          SPRING_CONFIG, 
          () => onAnimationComplete(true)
        );
      }
    } catch (error) {
      // Reset state on error
      setIsAnimating(false);
      setShowMenu(false);
    }
  }, [showMenu, isAnimating, targetValues, onAnimationComplete, animatedWidth, animatedHeight, animatedBorderRadius, backdropOpacity, menuProgress]);

  // Handles navigation from a menu item and collapses the menu.
  const handleMenuNavigation = useCallback((route: AppRoute) => {
    try {
      toggleMenu();
      router.push(route);
    } catch (error) {
      // Fallback: at least close the menu
      setShowMenu(false);
      setIsAnimating(false);
    }
  }, [toggleMenu]);

  // Animated styles
  const menuContainerAnimatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
    height: animatedHeight.value,
    borderRadius: animatedBorderRadius.value,
    backgroundColor: interpolateColor(
      menuProgress.value,
      [0, 1],
      ['transparent', Colors.gray800]
    ),
  }), []);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }), []);

  // Handle menu content layout with height constraint
  const handleContentLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    try {
      const contentHeight = event.nativeEvent.layout.height;
      const calculatedHeight = contentHeight + MENU_CONTENT_TOP_OFFSET;
      const finalHeight = Math.min(calculatedHeight, MAX_MENU_HEIGHT);
      animatedHeight.value = withSpring(finalHeight, SPRING_CONFIG);
    } catch (error) {
      // Keep default height on error
    }
  }, [animatedHeight]);

  // Render menu items
  const renderMenuItems = useMemo(() => 
    MENU_ITEMS.map((item) => (
      <MenuButton
        key={item.route}
        icon={item.icon}
        text={item.text}
        onPress={() => handleMenuNavigation(item.route)}
        delay={item.delay}
      />
    )), [handleMenuNavigation]);

  // Determine icon color based on menu state and current route
  const getIconColor = () => {
    if (showMenu) {
      return Colors.textLight;
    }
    return shouldShowWhiteIcon ? Colors.textLight : Colors.gray800;
  };

  return (
    <>
      {/* Platform-agnostic backdrop with blur */}
      {showMenu && (
        <MenuBackdrop 
          onPress={toggleMenu}
          style={backdropAnimatedStyle}
        />
      )}

      <View style={styles.widgetContainer}>
        <Animated.View style={[styles.menuContainer, menuContainerAnimatedStyle]}>
          {showMenu && (
            <View style={styles.menuContent} onLayout={handleContentLayout}>
              {renderMenuItems}
            </View>
          )}

          <TouchableOpacity 
            onPress={toggleMenu} 
            style={styles.plusButtonContainer} 
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showMenu ? "Close navigation menu" : "Open navigation menu"}
            accessibilityHint="Double tap to toggle menu"
          >
            <View style={styles.plusButtonInner}>
              <MenuIcon size={36} color={getIconColor()} />
            </View>
          </TouchableOpacity>
          
          {showMenu && (
            <Animated.Text 
              style={styles.headerText}
              entering={FadeInDown.delay(10)}
              exiting={FadeOutDown}
              accessible={true}
              accessibilityRole="header"
            >
              Explore Us
            </Animated.Text>
          )}
        </Animated.View>
      </View>
    </>
  );
}

export default function TabLayout() {
  return (
    <>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="donate" options={{ href: null }} />
        <Tabs.Screen name="calendar" options={{ href: null }} />
        <Tabs.Screen name="services" options={{ href: null }} />
        <Tabs.Screen name="account" options={{ href: null }} />
      </Tabs>
      <CustomFloatingMenu />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  widgetContainer: {
    position: 'absolute',
    top: MENU_TOP_POSITION,
    right: 20,
    zIndex: 10,
  },
  menuContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  menuContent: {
    position: 'absolute',
    top: MENU_CONTENT_TOP_OFFSET,
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  plusButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: MENU_BUTTON_SIZE,
    height: MENU_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12,
    backgroundColor: Colors.transparent,
  },
  headerText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MENU_BUTTON_SIZE,
    paddingLeft: MENU_BUTTON_SIZE + 20,
    paddingRight: 20,
    ...Typography.bodyMedium,
    color: Colors.textLight,
    fontWeight: '500',
    textAlignVertical: 'center',
    lineHeight: MENU_BUTTON_SIZE,
    zIndex: 11,
  },
  plusButtonInner: {
    width: MENU_BUTTON_SIZE - 10,
    height: MENU_BUTTON_SIZE - 10,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
        // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  menuButton: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 16,
    alignItems: "center",
    width: '100%',
  },
  menuText: {
    ...Typography.bodyLarge,
    color: Colors.textLight,
  },
});