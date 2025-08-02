// constants/CommonStyles.ts
import { StyleSheet, Platform } from 'react-native';
import { Colors } from './Colors';

// Standardized spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
  xxxxxl: 48,
} as const;

// Standardized border radius
export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999,
} as const;

// Standardized shadow definitions
export const Shadows = StyleSheet.create({
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
});

// Common flex layouts
export const Layout = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerHorizontal: {
    alignItems: 'center',
  },
  centerVertical: {
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  spaceEvenly: {
    justifyContent: 'space-evenly',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
});

// Common button styles - consolidated and improved
export const Buttons = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Layout.center,
    ...Shadows.sm,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Layout.center,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.xs,
  },
  outline: {
    backgroundColor: Colors.transparent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Layout.center,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ghost: {
    backgroundColor: Colors.transparent,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    ...Layout.center,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    ...Layout.center,
    backgroundColor: Colors.overlayLight,
  },
  iconSolid: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    ...Layout.center,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
});

// Common card styles
export const Cards = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  interactive: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  featured: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
});

// Common input styles - improved
export const Inputs = StyleSheet.create({
  base: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 56,
  },
  focused: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  disabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
    opacity: 0.6,
  },
  error: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
});

// Common container styles
export const Containers = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xxxl,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
  },
});

// Animation durations (matching appConfig but centralized)
export const AnimationDuration = {
  fast: Platform.OS === 'android' ? 250 : 200,
  medium: Platform.OS === 'android' ? 350 : 300,
  slow: Platform.OS === 'android' ? 550 : 500,
} as const;

// Common backdrop/overlay styles
export const Overlays = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  picker: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
});

// Helper functions to create consistent spacing
export const createGap = (size: keyof typeof Spacing) => ({
  gap: Spacing[size],
});

export const createPadding = (
  vertical?: keyof typeof Spacing,
  horizontal?: keyof typeof Spacing
) => ({
  ...(vertical && { paddingVertical: Spacing[vertical] }),
  ...(horizontal && { paddingHorizontal: Spacing[horizontal] }),
});

export const createMargin = (
  vertical?: keyof typeof Spacing,
  horizontal?: keyof typeof Spacing
) => ({
  ...(vertical && { marginVertical: Spacing[vertical] }),
  ...(horizontal && { marginHorizontal: Spacing[horizontal] }),
});

// Export spacing and layout types
export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;