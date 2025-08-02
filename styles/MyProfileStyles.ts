import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

export const accountStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  headerTitle: {
    ...Typography.headlineMedium,
    color: Colors.text,
    marginBottom: 4,
  },
  headerNickname: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  memberIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.categoryTeal,
    borderRadius: 12,
  },
  memberId: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: 12,
  },
  headerSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
        paddingBottom: 14,
        alignItems: 'center',
  },
  editButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(231, 111, 81, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(231, 111, 81, 0.2)',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: 'rgba(127, 176, 105, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(127, 176, 105, 0.2)',
  },
  successText: {
    color: Colors.success,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Profile summary styles (consolidated)
  profileSummary: {
    gap: 16,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,


  },
  profileSummaryItem: {
    flex: 1,
  },
  profileSummaryAddress: {

  },
  profileSummaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileSummaryValue: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  profileSummaryLabelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },

  // New input field styles with icons inside
  inputFieldContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  inputIconContainer: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInputWithIcon: {
    backgroundColor: Colors.background || '#f8f9fa',
    borderWidth: 0,
    borderColor: Colors.border || '#e1e5e9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingLeft: 50, // Space for icon
    paddingRight: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 54,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputHelperText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 50, // Align with input text
    fontStyle: 'italic',
  },
  datePickerContainer: {
    backgroundColor: Colors.background || '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.border || '#e1e5e9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingLeft: 50, // Space for icon
    paddingRight: 16,
    minHeight: 54,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Original detailed edit styles (keep for compatibility)
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileLabel: {
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  profileValue: {
    color: Colors.text,
  },
  editInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.text,
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  datePickerButton: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Enhanced edit actions (consolidated)
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background || '#f8f9fa',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    gap: 8,
  },
  cancelButtonText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: Colors.textLight || '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Stats section
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Donation history section
  donationHistory: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  donationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  donationInfo: {
    flex: 1,
  },
  donationPurpose: {
    color: Colors.text,
    marginBottom: 2,
  },
  donationDate: {
    color: Colors.textSecondary,
  },
  donationAmount: {
    color: Colors.primary,
  },

  // Enhanced "View More Donations" button
  viewMoreDonationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewMoreDonationsText: {
    color: Colors.textLight,
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '600',
  },
  viewMoreArrow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  viewMoreArrowText: {
    color: Colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },

  // Menu section
  menuList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemText: {
    color: Colors.text,
    marginLeft: 12,
  },

  // Logout button
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: 50,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.error,
    zIndex: 9999,
  },
  logoutText: {
    color: Colors.white,
    marginLeft: 8,
    fontSize: 14,
  },

  // Guest user styles
  loginPrompt: {
    padding: 40,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  loginButtonText: {
    color: Colors.textLight,
  },
  registerPrompt: {
    alignItems: 'center',
  },
  registerPromptText: {
    color: Colors.textSecondary,
  },
  registerLink: {
    color: Colors.primary,
  },
  guestFeatures: {
    paddingHorizontal: 20,
  },
  guestFeaturesTitle: {
    color: Colors.text,
    marginBottom: 16,
  },

  // Loading and status styles
  accountLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  accountLoadingText: {
    marginLeft: 8,
    color: Colors.textSecondary,
  },
  accountReceiptId: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  accountDonationAmountContainer: {
    alignItems: 'flex-end',
  },
  accountRecurringBadge: {
    color: Colors.primary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  accountNoDonationsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  accountNoDonationsText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  accountContactSupportText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
  },

  // Receipt button styles
  accountReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  accountReceiptButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  accountReceiptButtonText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  accountRecurringIcon: {
    padding: 4,
    marginRight: 2,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    opacity: 0.7,
  },
  receiptButtonText: {
    color: Colors.textLight,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Notice styles
  contactNotice: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 123, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.1)',
  },
  contactNoticeText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  contactEmail: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Device Management Button
  deviceManagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceButtonTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  deviceButtonTitle: {
    ...Typography.labelLarge,
    color: Colors.text,
    marginBottom: 4,
  },
  deviceButtonSubtitle: {
    color: Colors.textSecondary,
  },

  // Donation History Screen styles
  donationHistoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  donationHistoryBackButton: {
    padding: 8,
  },
  donationHistoryHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  donationHistoryHeaderAction: {
    padding: 8,
  },
  donationHistoryLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    
  },
  donationHistoryLoadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
  },
  donationHistoryErrorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  donationHistoryErrorTitle: {
    color: Colors.error,
    marginBottom: 8,
  },
  donationHistoryErrorText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  donationHistoryRetryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  donationHistoryRetryButtonText: {
    color: Colors.textLight,
  },
  donationHistoryEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  donationHistoryEmptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  donationHistoryEmptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  donationHistoryListContainer: {
    paddingBottom: 20,
    
  },
  donationHistoryHeaderSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  donationHistoryStatsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    
  },
  donationHistoryStatsTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  donationHistoryListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  donationHistoryListTitle: {
    color: Colors.text,
  },
  donationHistoryFilterButton: {
    padding: 8,
  },
  donationHistoryItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
        borderWidth: 1,
    borderColor: Colors.border,
  },
  donationHistoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  donationHistoryItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  donationHistoryItemPurpose: {
    color: Colors.text,
    marginBottom: 4,
  },
  donationHistoryItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  donationHistoryItemDate: {
    color: Colors.textSecondary,
  },
  donationHistoryItemReceiptId: {
    color: Colors.textSecondary,
  },
  donationHistoryItemAmountContainer: {
    alignItems: 'flex-end',
  },
  donationHistoryItemAmount: {
    color: Colors.primary,
    marginBottom: 2,
  },
  donationHistoryItemDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  donationHistoryDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  donationHistoryDetailText: {
    marginLeft: 6,
    color: Colors.textSecondary,
  },
  donationHistoryItemMessage: {
    marginTop: 8,
    fontStyle: 'italic',
    color: Colors.textSecondary,
  },

  // Utility styles
  bottomSpacing: {
    height: 120,
  },
  activityPadding: {
    height: 20,
  },
});
