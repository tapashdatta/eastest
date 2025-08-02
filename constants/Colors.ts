// constants/Colors.ts
export const Colors = {
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Core brand colors
  primary: '#212529',
  primaryDark: '#1C1C1E',
  primaryLight: '#48484A',
  secondary: '#8E8E93',
  accent: '#007AFF',
  
  // Background system
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7', // Also used for borderLight, inputBackground
  surfaceElevated: '#FFFFFF',
  
  // Text system
  text: '#000000',
  textSecondary: '#3C3C43',
  textLight: '#FFFFFF',
  textMuted: '#8E8E93', // Same as secondary
  textSubtle: '#C7C7CC',
  
  // Border system - consolidated
  border: '#E5E5EA', // Also used for divider
  borderLight: '#F2F2F7', // Same as surfaceSecondary
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF', // Same as accent
  
  // Shadow system
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',
  
  // Overlay system - consolidated
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Component-specific colors
  highlight: '#F2F2F7', // Same as surfaceSecondary
  disabled: '#C7C7CC', // Same as textSubtle
  
  // Category colors
  categoryRed: '#FF6B6B',
  categoryTeal: '#4ECDC4',
  categoryBlue: '#45B7D1',
  categoryYellow: '#F7B731',
  categoryGreen: '#2ECC71',
  categoryPurple: '#9B59B6',
  
  // Semantic colors
  star: '#FFD700',
  like: '#FF3B30', // Same as error
  bookmark: '#007AFF', // Same as accent/info
  share: '#8E8E93', // Same as secondary/textMuted
  verified: '#34C759', // Same as success
  
  // Gray scale - consolidated (many duplicates removed)
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E0E0E0',
  gray300: '#CCCCCC',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#555555',
  gray700: '#404040',
  gray800: '#2A2A2A',
  gray900: '#1A1A1A',

  inputBackground: '#F2F2F7',
} as const;

// Semantic color mappings for better developer experience
export const SemanticColors = {
  // Interactive states
  buttonPrimary: Colors.primary,
  buttonSecondary: Colors.surface,
  buttonText: Colors.textLight,
  buttonTextSecondary: Colors.text,
  
  // Form elements
  inputBorder: Colors.border,
  inputBorderFocused: Colors.primary,
  inputBackground: Colors.surfaceSecondary,
  inputText: Colors.text,
  inputPlaceholder: Colors.textMuted,
  
  // Cards and surfaces
  cardShadow: Colors.shadow,
  cardBorder: Colors.border,
  cardBackground: Colors.surface,
  
  // Navigation
  navBackground: Colors.surface,
  navBorder: Colors.border,
  navActive: Colors.primary,
  navInactive: Colors.textMuted,
  
  // Modal and overlays
  modalBackground: Colors.overlay,
  pickerBackground: Colors.surface,
  pickerBorder: Colors.border,
  pickerCancel: Colors.gray500,
  pickerDone: Colors.accent,
} as const;

// Type definitions
export type ColorKey = keyof typeof Colors;
export type SemanticColorKey = keyof typeof SemanticColors;

// Helper functions
export const getColorWithOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  }
  return color;
};

export default Colors;