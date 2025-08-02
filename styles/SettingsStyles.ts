// styles/SettingsStyles.ts - Clean & Consolidated Production Ready
import { StyleSheet } from 'react-native';
import { Colors, SemanticColors } from '@/constants/Colors';
import { Spacing, BorderRadius, Layout, Shadows, Containers } from '@/constants/CommonStyles';
import { Typography } from '@/constants/Typography';

// Color variants for different UI states
export const ColorVariants = {
  accent: { view: { backgroundColor: Colors.accent + '15' }, color: Colors.accent },
  success: { view: { backgroundColor: Colors.success + '15' }, color: Colors.success },
  warning: { view: { backgroundColor: Colors.warning + '15' }, color: Colors.warning },
  error: { view: { backgroundColor: Colors.error + '15' }, color: Colors.error },
  info: { view: { backgroundColor: Colors.accent + '10' }, color: Colors.accent },
};

export const settingsStyles = StyleSheet.create({
  // Main Layout
  container: { ...Containers.safeArea, backgroundColor: Colors.surfaceSecondary },
  content: { ...Layout.flex1 },
  scrollContent: { paddingBottom: Spacing.xxxl },
  
  // Loading
  loadingContainer: { ...Layout.flex1, ...Layout.center, padding: Spacing.xl },
  loadingSpinner: { padding: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.round, ...Shadows.md },
  loadingText: { ...Typography.bodyMedium, color: Colors.textMuted, marginTop: Spacing.lg, textAlign: 'center' },
  
  // Header
  header: {
    ...Layout.flexRow, ...Layout.centerVertical, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, 
    paddingBottom: Spacing.lg, backgroundColor: Colors.surface, borderBottomWidth: 1, 
    borderBottomColor: Colors.border, ...Shadows.sm
  },
  backButton: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceSecondary, ...Layout.center, marginRight: Spacing.md },
  headerContent: { ...Layout.flex1 },
  headerTitle: { ...Typography.titleMedium, color: Colors.text, fontWeight: '700' },
  headerSubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 2 },
  
  // Sections
  section: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, 
    borderRadius: BorderRadius.lg, padding: Spacing.xl, ...Shadows.md, borderWidth: 1, borderColor: Colors.border
  },
  sectionHeader: { ...Layout.flexRow, ...Layout.centerVertical, marginBottom: Spacing.lg },
  sectionIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, ...Layout.center, marginRight: Spacing.md },
  sectionTitle: { ...Typography.titleLarge, color: Colors.text, fontWeight: '600', textAlign: 'left' },
  infoIconBg: { backgroundColor: Colors.accent + '15' },
  
  // Settings Items
  settingItem: {
    ...Layout.flexRow, ...Layout.centerVertical, ...Layout.spaceBetween, paddingVertical: Spacing.md, 
    borderBottomWidth: 1, borderBottomColor: Colors.border + '30'
  },
  settingInfo: { ...Layout.flex1, marginRight: Spacing.lg },
  settingLabel: { ...Typography.titleMedium, color: Colors.text, fontWeight: '600', marginBottom: Spacing.xs },
  settingDescription: { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 20 },
  
  // CTA Items
  ctaItem: {
    ...Layout.flexRow, ...Layout.centerVertical, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceSecondary + '50', borderRadius: BorderRadius.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border + '50'
  },
  ctaIcon: { width: 44, height: 44, borderRadius: BorderRadius.md, ...Layout.center, marginRight: Spacing.md },
  ctaContent: { ...Layout.flex1 },
  ctaLabel: { ...Typography.titleMedium, color: Colors.text, fontWeight: '600', marginBottom: Spacing.xs },
  ctaDescription: { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 18 },
  ctaArrow: { marginLeft: Spacing.sm },
  
  // Status Indicators
  giftAidStatus: {
    marginTop: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.success + '10', borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.success + '30', ...Layout.flexRow, ...Layout.centerVertical
  },
  giftAidStatusText: { ...Typography.labelLarge, color: Colors.success, fontWeight: '600', marginLeft: Spacing.sm },
  
  preferencesStatus: {
    marginTop: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.surfaceSecondary, 
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border
  },
  statusHeader: { ...Layout.flexRow, ...Layout.centerVertical, marginBottom: Spacing.md },
  statusTitle: { ...Typography.titleMedium, color: Colors.text, fontWeight: '600', marginLeft: Spacing.sm },
  statusTags: { ...Layout.flexRow, flexWrap: 'wrap', gap: Spacing.sm },
  statusTag: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.accent + '15',
    borderRadius: BorderRadius.round, borderWidth: 1, borderColor: Colors.accent + '30'
  },
  statusTagText: { ...Typography.labelMedium, color: Colors.accent, fontWeight: '600' },
  
  // Modal Backdrops
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  
  // Unified Bottom Sheet Modal (auto-sizing based on content)
  bottomSheetModal: {
    backgroundColor: Colors.surface, 
    borderTopLeftRadius: BorderRadius.xl, 
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%'
  },
  bottomSheetHeader: {
    ...Layout.flexRow, ...Layout.centerVertical, ...Layout.spaceBetween, 
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, 
    borderBottomWidth: 1, borderBottomColor: Colors.border
  },
  bottomSheetHeaderContent: { ...Layout.flex1 },
  bottomSheetTitle: { ...Typography.titleLarge, color: Colors.text, fontWeight: '700' },
  bottomSheetSubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4 },
  bottomSheetCloseButton: { 
    width: 32, height: 32, borderRadius: BorderRadius.md, 
    backgroundColor: Colors.surfaceSecondary, ...Layout.center 
  },
  bottomSheetContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  bottomSheetDescription: { 
    ...Typography.bodyMedium, color: Colors.textSecondary, 
    marginBottom: Spacing.lg, textAlign: 'center' 
  },
  
  // Bottom Sheet Form Elements
  bottomSheetDisclaimer: {
    ...Layout.flexRow, ...Layout.alignStart, backgroundColor: Colors.warning + '10', 
    borderWidth: 1, borderColor: Colors.warning + '30', borderRadius: BorderRadius.md, 
    padding: Spacing.md, marginVertical: Spacing.md
  },
  bottomSheetDisclaimerText: { 
    ...Typography.bodySmall, color: Colors.text, marginLeft: Spacing.sm, ...Layout.flex1 
  },
  
  // Bottom Sheet Buttons
  bottomSheetButton: {
    paddingVertical: Spacing.md, borderRadius: BorderRadius.md, 
    ...Layout.centerHorizontal, marginTop: Spacing.md, marginBottom: Spacing.md
  },
  bottomSheetButtonEnabled: { backgroundColor: Colors.accent },
  bottomSheetButtonDisabled: { backgroundColor: Colors.disabled },
  bottomSheetButtonText: { ...Typography.labelLarge, fontWeight: '700' },
  bottomSheetButtonTextEnabled: { color: Colors.white },
  bottomSheetButtonTextDisabled: { color: Colors.textMuted },
  
  // GDPR Compact Options (for communication preferences only)
  compactModalContainer: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%'
  },
  compactModalHeader: {
    ...Layout.flexRow, ...Layout.centerVertical, ...Layout.spaceBetween, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border
  },
  compactHeaderContent: { ...Layout.flex1 },
  compactModalTitle: { ...Typography.titleLarge, color: Colors.text, fontWeight: '700' },
  compactModalSubtitle: { ...Typography.bodyMedium, color: Colors.textSecondary, marginTop: 4 },
  compactCloseButton: { width: 32, height: 32, borderRadius: BorderRadius.md, backgroundColor: Colors.surfaceSecondary, ...Layout.center },
  compactModalContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl },
  
  // GDPR Options
  compactOptionsContainer: { ...Layout.flexRow, ...Layout.spaceEvenly, paddingVertical: Spacing.xl },
  compactOptionWrapper: { ...Layout.flex1, marginHorizontal: Spacing.xs },
  compactOptionItem: {
    ...Layout.centerHorizontal, padding: Spacing.md, backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md, borderWidth: 2, borderColor: Colors.border, minHeight: 100
  },
  compactOptionIcon: {
    width: 48, height: 48, borderRadius: BorderRadius.md, backgroundColor: Colors.surface,
    ...Layout.center, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border
  },
  compactOptionIconSelected: { backgroundColor: Colors.accent + '15', borderColor: Colors.accent },
  compactOptionTitle: { ...Typography.labelLarge, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  compactOptionTitleSelected: { color: Colors.accent },
  compactCheckmark: {
    position: 'absolute', top: 6, right: 6, backgroundColor: Colors.accent, borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
  },
  compactSaveButton: {
    backgroundColor: Colors.accent, paddingVertical: Spacing.md, borderRadius: BorderRadius.round,
    ...Layout.centerHorizontal, ...Shadows.sm, marginTop: Spacing.md, marginBottom: Spacing.lg
  },
  compactSaveButtonText: { ...Typography.labelLarge, color: Colors.white, fontWeight: '700' },
  
  // Form Fields (consolidated for all bottom sheet modals)
  fieldContainer: { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.labelLarge, color: Colors.text, fontWeight: '600', marginBottom: Spacing.sm },
  fieldInput: {
    backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, ...Typography.bodyMedium, color: Colors.text, height: 48
  },
  fieldInputMultiline: {
    backgroundColor: Colors.surfaceSecondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, ...Typography.bodyMedium, color: Colors.text, height: 80
  },
  
  // Gift Aid Consent Styles (for bottom sheet)
  consentSection: {
    backgroundColor: Colors.surfaceSecondary + '50', borderRadius: BorderRadius.md, 
    padding: Spacing.lg, marginVertical: Spacing.md, borderWidth: 1, borderColor: Colors.border + '50'
  },
  consentTitle: { ...Typography.titleMedium, color: Colors.text, fontWeight: '600', marginBottom: Spacing.md },
  checkboxItem: {
    ...Layout.flexRow, ...Layout.alignStart, marginBottom: Spacing.md, padding: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border + '30'
  },
  checkbox: {
    width: 24, height: 24, borderWidth: 2, borderColor: Colors.border, borderRadius: BorderRadius.xs,
    marginRight: Spacing.sm, marginTop: 2, ...Layout.center, backgroundColor: Colors.surface
  },
  checkboxChecked: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkboxText: { ...Layout.flex1, ...Typography.bodySmall, color: Colors.text, lineHeight: 18 },
  
  // Common Elements
  learnMoreButton: { paddingVertical: Spacing.md, ...Layout.centerHorizontal, marginTop: Spacing.sm },
  learnMoreText: { ...Typography.labelMedium, color: Colors.accent, fontWeight: '600' },
  
  // App Info & Footer
  infoGrid: { ...Layout.flexRow, ...Layout.spaceBetween, marginTop: Spacing.md },
  infoItem: {
    ...Layout.flex1, ...Layout.center, padding: Spacing.lg, backgroundColor: Colors.surfaceSecondary + '50',
    borderRadius: BorderRadius.md, marginHorizontal: Spacing.xs, borderWidth: 1, borderColor: Colors.border + '50'
  },
  infoLabel: { ...Typography.labelMedium, color: Colors.textSecondary, marginBottom: Spacing.xs, textAlign: 'center' },
  infoValue: { ...Typography.titleMedium, color: Colors.text, fontWeight: '700', textAlign: 'center' },
  
  footer: { padding: Spacing.xxxl, ...Layout.centerHorizontal, marginTop: Spacing.lg },
  footerText: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.md },
  footerSubtext: { ...Typography.labelMedium, color: Colors.textMuted, textAlign: 'center', fontStyle: 'italic' },
  // Add these styles to your existing SettingsStyles.ts file

// Clear Cache Button Styles (simplified)
clearCacheButton: {
  backgroundColor: Colors.warning,
  borderRadius: 12,
  padding: 16,
  marginTop: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: Colors.warning,
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},

clearCacheButtonDisabled: {
  backgroundColor: Colors.border,
  shadowOpacity: 0,
  elevation: 0,
},

clearCacheText: {
  color: Colors.white,
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 8,
},
});

// Export with modern naming convention
export const SettingsStyles = settingsStyles;