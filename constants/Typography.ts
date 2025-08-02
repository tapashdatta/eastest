import { TextStyle } from 'react-native';

// Font families - Instrument Sans for modern digital interfaces
export const FontFamilies = {
  regular: 'InstrumentSans-Regular',
  medium: 'InstrumentSans-Medium',
  semiBold: 'InstrumentSans-SemiBold',
  bold: 'InstrumentSans-Bold',
} as const;

// Typography scale using Instrument Sans exclusively for modern digital readability
export const Typography = {
  // Display styles - For hero sections and major headings
  displayLarge: {
    fontFamily: FontFamilies.bold,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  } as TextStyle,
  displayMedium: {
    fontFamily: FontFamilies.bold,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  } as TextStyle,
  displaySmall: {
    fontFamily: FontFamilies.bold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  } as TextStyle,
  
  // Headline styles - For section headers
  headlineLarge: {
    fontFamily: FontFamilies.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  } as TextStyle,
  headlineMedium: {
    fontFamily: FontFamilies.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  } as TextStyle,
  headlineSmall: {
    fontFamily: FontFamilies.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  } as TextStyle,
  
  // Title styles - For card titles and important labels
  titleLarge: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  } as TextStyle,
  titleMedium: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  } as TextStyle,
  titleSmall: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,
  
  // Body styles - For main content (Instrument Sans excels here)
  bodyLarge: {
    fontFamily: FontFamilies.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  } as TextStyle,
  bodyMedium: {
    fontFamily: FontFamilies.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  } as TextStyle,
  bodySmall: {
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  } as TextStyle,
  
  // Label styles - For buttons and form labels
  labelLarge: {
    fontFamily: FontFamilies.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  } as TextStyle,
  labelMedium: {
    fontFamily: FontFamilies.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,
  labelSmall: {
    fontFamily: FontFamilies.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  } as TextStyle,
  
  // Custom app-specific styles
  appTitle: {
    fontFamily: FontFamilies.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  } as TextStyle,
  appSubtitle: {
    fontFamily: FontFamilies.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  } as TextStyle,
  buttonText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.1,
  } as TextStyle,
  caption: {
    fontFamily: FontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  } as TextStyle,
} as const;

// Helper function to get font family by weight
export const getFontFamily = (weight: 'regular' | 'medium' | 'semiBold' | 'bold' = 'regular') => {
  return FontFamilies[weight];
};

// Helper function to create text style with consistent font
export const createTextStyle = (
  fontSize: number,
  weight: keyof typeof FontFamilies = 'regular',
  lineHeight?: number,
  letterSpacing?: number
): TextStyle => ({
  fontFamily: FontFamilies[weight],
  fontSize,
  lineHeight: lineHeight || fontSize * 1.4,
  letterSpacing: letterSpacing || 0,
});