// styles/DonationStyles.ts
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows, Layout, Buttons, Cards, Inputs } from '@/constants/CommonStyles';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 1.3;
const BEHIND_CARD_HEIGHT = 380;

// =============================================================================
// SHARED STYLES - Used across multiple screens
// =============================================================================
export const sharedStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  
  // Section styles
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  
  // Input container with proper alignment
  inputContainer: {
    ...Layout.flexRow,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.xs,
    minHeight: 56,
  },
  
  // Summary row styles
  summaryRow: {
    ...Layout.flexRow,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  summaryTotalLabel: {
    ...Typography.titleMedium,
    color: Colors.text,
  },
  summaryTotalValue: {
    ...Typography.titleMedium,
    color: Colors.primary,
  },
  
  // Button text styles
  primaryButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
  
  // Error container
  errorContainer: {
    backgroundColor: `${Colors.error}15`,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.error}30`,
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.error,
    flex: 1,
    lineHeight: 20,
  },
});

// =============================================================================
// SCREEN CONTAINER STYLES
// =============================================================================
export const screenStyles = StyleSheet.create({
  // Header styles
  header: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xl,
  },
  title: {
    ...Typography.headlineSmall,
    color: Colors.text,
  },
  
  // Content area
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  
  // Footer styles
  footer: {
    padding: Spacing.xxl,
    backgroundColor: Colors.surface,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  
  // Back button
  backButton: {
    minWidth: 48,
    minHeight: 48,
    ...Layout.center,
    borderRadius: 24,
    top: Platform.select({
      ios: 0,
      android: 20,
    }),
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
});

// =============================================================================
// DONATE SCREEN STYLES
// =============================================================================
export const donateStyles = StyleSheet.create({
  // Main container with keyboard offset support
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  
  // Background and overlay
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlayLight,
  },
  
  // Header styles
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    ...Layout.flexRow,
    ...Layout.centerVertical,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    zIndex: 1000,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...Typography.headlineLarge,
    color: Colors.textLight,
  },
  headerBackButton: {
    ...Buttons.icon,
    backgroundColor: Colors.overlayLight,
    borderRadius: BorderRadius.xxl,
        top: Platform.select({
      ios: 0,
      android: 20,
    }),
  },
  
  // Success message
  successMessage: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 140,
    left: Spacing.xxl,
    right: Spacing.xxl,
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    ...Shadows.xl,
    zIndex: 500,
    gap: Spacing.md,
  },
  successMessageText: {
    ...Typography.labelLarge,
    color: Colors.textLight,
  },
  
  // Card list container
  cardListContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 10,
  },
  flatListContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  
  // Card wrapper and container
  cardWrapper: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    paddingVertical: Spacing.xxxxl,
    paddingHorizontal: 10,
  },
  cardContainer: {
    shadowColor: '#000',
    shadowRadius: 40,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.8,
    elevation: 12,
    backfaceVisibility: 'hidden',
    overflow: 'visible',
    padding: 1,
  },
  
  // Card styles
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.black,
    backfaceVisibility: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardInner: {
    flex: 1,
    borderRadius: BorderRadius.xxl - 1,
    overflow: 'hidden',
    backgroundColor: Colors.black,
  },
  cardImageContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: BorderRadius.xxl - 1,
    backfaceVisibility: 'hidden',
    backgroundColor: Colors.black,
  },
  cardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xxl - 1,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.xxl - 1,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
  },
  cardContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.xxl,
  },
  
  // Card content elements
  cardIconContainer: {
    position: 'absolute',
    top: Spacing.xxl,
    right: Spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    ...Layout.center,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Shadows.md,
  },
  cardTitleContainer: {
    position: 'absolute',
    left: Spacing.xxl,
    bottom: 80,
    right: Spacing.xxl,
  },
  cardTitle: {
    ...Typography.appTitle,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },
  selectedIndicator: {
    position: 'absolute',
    top: Spacing.xxl,
    left: Spacing.xxl,
    borderRadius: 20,
    padding: Spacing.xs,
  },
  
  // Page indicators
  pageIndicators: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    ...Layout.flexRow,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    zIndex: 50,
  },
  pageIndicator: {
    width: 16,
    height: 8,
    borderRadius: BorderRadius.xs,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: Spacing.xs,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Behind card panel
  behindCardPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BEHIND_CARD_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.89)',
    borderRadius: 20,
    zIndex: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.21)',
    ...Shadows.xl,
  },
  panelScrollView: {
    flex: 1,
  },
  panelContent: {
    flexGrow: 1,
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.md,
  },
  
  // Form fields
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  inputWithIcon: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    ...Inputs.base,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  messageInput: {
    ...Typography.bodyMedium,
    flex: 1,
    color: Colors.text,
    minHeight: 40,
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  
  // Amount selection grid
  amountGrid: {
    ...Layout.flexRow,
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  amountButton: {
    ...Buttons.secondary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 10,
    backgroundColor: '#2A2D3A',
    borderColor: '#3A3A3A',
    borderWidth: 2,
    minWidth: 70,
  },
  amountButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.textLight,
    borderWidth: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  amountButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
    fontSize: 14,
  },
  amountButtonTextSelected: {
    ...Typography.buttonText,
    color: Colors.textLight,
    fontSize: 14,
  },
  
  // Custom amount input
  customAmountButton: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  customAmountInput: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: '#2A2D3A',
    borderColor: '#3A3A3A',
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minWidth: 100,
    height: 44,
  },
  currencySymbol: {
    ...Typography.labelLarge,
    color: Colors.textLight,
    marginRight: Spacing.xs,
  },
  customAmountField: {
    ...Typography.labelLarge,
    flex: 1,
    color: Colors.textLight,
    minWidth: 40,
    textAlign: 'center',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  
  // Nitya Seva specific styles
  nityaSevaInfo: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderColor: 'rgba(255, 107, 53, 0.3)',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  nityaSevaInfoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
    textAlign: 'center',
  },
  
  // Control buttons
  controlButtons: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  addButton: {
    ...Buttons.primary,
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.round,
    gap: Spacing.sm,
    minWidth: 150,
  },
  addButtonDisabled: {
    backgroundColor: '#3A3A3A',
  },
  addButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
  addButtonTextDisabled: {
    ...Typography.buttonText,
    color: '#8A8A8A',
  },
});

// =============================================================================
// CART SCREEN STYLES
// =============================================================================
export const cartStyles = StyleSheet.create({
  // Empty cart state
  emptyCart: {
    flex: 1,
    ...Layout.center,
    paddingVertical: 60,
  },
  emptyCartText: {
    ...Typography.titleMedium,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  emptyCartSubtext: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  
  // Cart items
  cartItem: {
    ...Cards.base,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  cartItemHeader: {
    ...Layout.flexRow,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cartItemTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.lg,
  },
  cartItemDetails: {
    ...Layout.flexRow,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cartItemAmount: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    flex: 1,
  },
  
  // Quantity controls
  quantityControls: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surface,
    ...Layout.center,
    ...Shadows.xs,
  },
  quantityText: {
    ...Typography.labelLarge,
    marginHorizontal: Spacing.lg,
    minWidth: 20,
    textAlign: 'center',
    color: Colors.text,
  },
  cartItemTotal: {
    ...Typography.titleMedium,
    color: Colors.primary,
    minWidth: 80,
    textAlign: 'right',
  },
  cartItemMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  
  // Cart summary
  cartSummary: {
    ...Cards.base,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  
  // Checkout button
  checkoutButton: {
    ...Buttons.primary,
    borderRadius: 99,
  },
  checkoutButtonContent: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.sm,
  },
});

// =============================================================================
// ENHANCED GIFT AID STYLES
// =============================================================================
export const enhancedGiftAidStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerGradient: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  headerContent: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
  },
  iconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    ...Layout.center,
    marginRight: Spacing.lg,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.warning + '20',
    ...Layout.center,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.textLight,
    ...Layout.center,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  benefitContainer: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
  },
  sideBySideContainer: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  benefitColumn: {
    flex: 1,
    alignItems: 'center',
  },
  benefitColumnDisabled: {
    opacity: 0.5,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.success + '20',
    ...Layout.center,
    marginBottom: Spacing.sm,
  },
  benefitLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitLabelDisabled: {
    color: Colors.textMuted,
  },
  benefitAmount: {
    ...Typography.titleMedium,
    color: Colors.text,
    textAlign: 'center',
  },
  benefitAmountEnabled: {
    color: Colors.success,
  },
  benefitAmountDisabled: {
    color: Colors.textMuted,
  },
  plusIconHorizontal: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  totalRow: {
    ...Layout.flexRow,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.highlight,
    borderRadius: BorderRadius.sm,
  },
  totalLabel: {
    ...Typography.bodyLarge,
    color: Colors.text,
  },
  totalAmount: {
    ...Typography.titleLarge,
    color: Colors.text,
  },
  totalAmountEnabled: {
    color: Colors.primary,
  },
  infoContainer: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    padding: Spacing.lg,
    backgroundColor: '#5A7A63',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.white,
    flex: 1,
  },
});

// =============================================================================
// PAYMENT SCREEN STYLES
// =============================================================================
export const paymentStyles = StyleSheet.create({
  // Input field with proper alignment
  inputField: {
    ...Typography.bodyLarge,
    flex: 1,
    color: Colors.text,
    marginLeft: Spacing.md,
    padding: 0,
    paddingVertical: Platform.OS === 'android' ? 0 : 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    lineHeight: Platform.OS === 'android' ? 20 : undefined,
  },
  
  // Gift Aid address section
  giftAidAddressHeader: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  giftAidAddressTitle: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  
  // Order summary
  orderSummary: {
    ...Cards.base,
    padding: Spacing.xl,
  },
  orderItem: {
    ...Layout.flexRow,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  orderItemName: {
    ...Typography.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  orderItemPrice: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  orderDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  orderSubtotal: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  orderGiftAid: {
    ...Typography.bodyMedium,
    color: Colors.success,
  },
  orderCharityTotal: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  orderTotal: {
    ...Typography.titleMedium,
    color: Colors.text,
  },
  
  // Pay button
  payButton: {
    ...Buttons.primary,
    paddingHorizontal: Spacing.xxl,
    borderRadius: 999,
  },
  payButtonDisabled: {
    backgroundColor: Colors.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonContent: {
    ...Layout.flexRow,
    ...Layout.center,
    gap: Spacing.md,
  },
  processingContainer: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.md,
  },
  
  // Progress bar
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

// =============================================================================
// PROCESSING AND ERROR OVERLAY STYLES
// =============================================================================
export const overlayStyles = StyleSheet.create({
  // Processing overlay
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    ...Layout.center,
    zIndex: 1000,
  },
  processingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    maxWidth: '85%',
    minWidth: '75%',
    ...Shadows.xl,
  },
  processingHeader: {
    ...Layout.flexColumn,
    alignItems: 'center',
    marginBottom: 5,
  },
  processingTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  processingMessage: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    width: '100%',
    marginVertical: Spacing.lg,
    alignItems: 'center',
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontStyle: 'italic',
  },
  
  // Error overlay
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    ...Layout.center,
    zIndex: 1000,
  },
  errorContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    maxWidth: '85%',
    minWidth: '75%',
    ...Shadows.xl,
  },
  errorHeader: {
    ...Layout.flexColumn,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  errorTitle: {
    ...Typography.titleLarge,
    color: Colors.error,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  errorButton: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    alignItems: 'center',
    ...Shadows.md,
  },
  errorButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
});

// =============================================================================
// SUCCESS SCREEN STYLES
// =============================================================================
export const successStyles = StyleSheet.create({
  // Success screen specific container and layout
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  headerContainer: {
    height: '35%',
    backgroundColor: '#989e6e',
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeElement1: {
    position: 'absolute',
    top: 80,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorativeElement2: {
    position: 'absolute',
    top: 120,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorativeElement3: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  lottieContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  headerNavigation: {
    ...Layout.flexRow,
    alignItems: 'center',
    paddingTop: Platform.select({ ios: 50, android: 30 }),
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    top: Platform.select({
      ios: 0,
      android: 20,
    }),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessageContainer: {
    position: 'absolute',
    bottom: 50,
    left: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    ...Typography.headlineMedium,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successSubtitle: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
    paddingTop: 24,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  cardWrapper: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  giftAidValue: {
    ...Typography.labelLarge,
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  listContainer: {
    gap: Spacing.md,
  },
  listItem: {
    ...Layout.flexRow,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginTop: 6,
    marginRight: Spacing.md,
  },
  listText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Platform.select({ ios: 34, android: Spacing.lg }),
    backgroundColor: Colors.surface,
  },

  // Legacy success screen styles (for backward compatibility)
  successHeader: {
    ...Layout.center,
    paddingVertical: Spacing.xxxxl,
    paddingHorizontal: Spacing.xxl,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 40,
    backgroundColor: Colors.highlight,
    ...Layout.center,
    marginBottom: Spacing.xl,
  },
  
  // Receipt styles
  receiptCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  receiptHeader: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    ...Layout.alignStart,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  receiptId: {
    ...Typography.labelMedium,
    color: Colors.text,
    textAlign: 'left',
    flex: 1,
  },
  receiptDetails: {
    gap: Spacing.xs,
  },
  receiptDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  receiptAmount: {
    ...Typography.labelMedium,
    color: Colors.text,
  },
  emailStatus: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  emailSent: {
    ...Typography.bodySmall,
    color: Colors.success,
  },
  emailPending: {
    ...Typography.bodySmall,
    color: Colors.warning,
  },
  
  // Transaction card
  transactionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionRow: {
    ...Layout.flexRow,
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  transactionLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    flex: 1,
  },
  transactionValue: {
    ...Typography.bodyMedium,
    color: Colors.text,
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  
  // Next steps card
  nextStepsCard: {
    backgroundColor: Colors.highlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  nextStepsText: {
    ...Typography.bodyMedium,
    color: Colors.text,
    lineHeight: 20,
  },
  
  // Done button
  doneButton: {
    ...Buttons.primary,
    borderRadius: 99,
  },
  doneButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
});

// =============================================================================
// FLOATING COMPONENTS
// =============================================================================
export const floatingCartStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: Spacing.xxl,
    right: Spacing.xxl,
    zIndex: 1000,
    alignItems: 'center',
  },
  content: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: Colors.overlayLight,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 50,
    width: 200,
    shadowColor: '#000',
    shadowRadius: 40,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.8,
    elevation: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  iconContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.lg,
    minWidth: 20,
    height: 20,
    ...Layout.center,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: Colors.textLight,
    lineHeight: 14,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    ...Typography.labelSmall,
    color: Colors.textLight,
    marginBottom: 2,
  },
  amount: {
    ...Typography.titleMedium,
    color: Colors.textLight,
  },
});

// =============================================================================
// STATUS INDICATOR STYLES
// =============================================================================
export const statusStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 4,
  },
  readyIndicator: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  readyText: {
    ...Typography.caption,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '600',
  },
  loadingIndicator: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  spinner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: Colors.textLight,
  },
  loadingText: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 6,
    fontWeight: '500',
  },
  errorIndicator: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorIcon: {
    fontSize: 10,
  },
  errorText: {
    ...Typography.caption,
    color: '#ff6b6b',
    marginLeft: 4,
    fontWeight: '600',
  },
});

// =============================================================================
// SUCCESS MESSAGE STYLES
// =============================================================================
export const messageStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.sm,
  },
  text: {
    ...Typography.labelLarge,
    color: Colors.textLight,
  },
});

// =============================================================================
// LEGACY EXPORTS FOR COMPATIBILITY
// =============================================================================
export const mainStyles = screenStyles;
export const floatingAddToCartStyles = floatingCartStyles;