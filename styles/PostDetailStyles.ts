// styles/PostDetailStyles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { 
  Spacing, 
  BorderRadius, 
  Shadows, 
  Layout, 
  Containers, 
  Buttons 
} from '@/constants/CommonStyles';

const { height } = Dimensions.get('window');

export const detailStyles = StyleSheet.create({
  container: {
    ...Containers.screen,
  },
  
  // Hero Section
  heroContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    ...Layout.flexRow,
    ...Layout.spaceBetween,
    paddingHorizontal: Spacing.xxl,
  },
  backButton: {
    ...Buttons.icon,
  },
  bookmarkButton: {
    ...Buttons.icon,
  },
  
  // Hero Content
  heroContent: {
    position: 'absolute',
    bottom: Spacing.xxxxl,
    left: Spacing.xxl,
    right: Spacing.xxl,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.textLight,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...Typography.displayMedium,
    color: Colors.textLight,
    marginBottom: Spacing.md,
    lineHeight: 40,
  },
  heroMeta: {
    ...Layout.flexRow,
    gap: Spacing.lg,
  },
  metaItem: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.labelMedium,
    color: Colors.textLight,
  },
  
  // Content Section
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    marginTop: -Spacing.xxl,
    paddingTop: Spacing.xxl,
  },
  
  // Tab Navigation
  tabContainer: {
    ...Layout.flexRow,
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  activeTab: {
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  tabText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  activeTabText: {
    ...Typography.labelLarge,
    color: Colors.text,
  },
  
  // Stats Row
  statsRow: {
    ...Layout.flexRow,
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.lg,
  },
  statItem: {
    ...Layout.center,
    gap: Spacing.sm,
  },
  statText: {
    ...Typography.labelMedium,
    color: Colors.text,
  },
  
  // Engagement Row
  engagementRow: {
    ...Layout.flexRow,
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  engagementButton: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  engagementText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  
  // Content Scroll
  contentScroll: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  contentText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  
  // Section Styles
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  
  // Action Container
  actionContainer: {
    ...Layout.flexRow,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionButton: {
    ...Buttons.primary,
    flex: 1,
  },
  actionButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
  shareButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
    ...Layout.center,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});