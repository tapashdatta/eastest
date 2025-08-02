// screens/ourservices/ServiceScreenStyles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows, Layout, Cards, Buttons } from '@/constants/CommonStyles';

const { width, height } = Dimensions.get('window');

export const ServiceScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
    paddingHorizontal: Spacing.xl,
  },
  backButton: {
    ...Buttons.icon,
    backgroundColor: Colors.overlayLight,
  },
  heroContent: {
    position: 'absolute',
    bottom: Spacing.xxxxl,
    left: Spacing.xl,
    right: Spacing.xl,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  heroTitle: {
    ...Typography.displaySmall,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textLight,
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    marginTop: -BorderRadius.xxl,
    paddingTop: BorderRadius.xxl,
  },
  statsRow: {
    ...Layout.flexRow,
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: BorderRadius.xxl,
    ...Shadows.md,
  },
  statItem: {
    ...Layout.center,
    gap: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statValue: {
    ...Typography.titleLarge,
    color: Colors.text,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxxl,
  },
  sectionTitle: {
    ...Typography.headlineSmall,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  sectionText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  grid: {
    gap: Spacing.lg,
  },
  gridRowWrap: {
    ...Layout.flexRow,
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  card: {
    ...Cards.elevated,
    padding: Spacing.xl,
  },
  cardHalf: {
    ...Cards.elevated,
    padding: Spacing.xl,
    width: (width - 56) / 2, // Account for margins and gap
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitleSmall: {
    ...Typography.titleSmall,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardDescriptionMedium: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardPrice: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  list: {
    gap: Spacing.lg,
  },
  listSmall: {
    gap: Spacing.sm,
  },
  listItem: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.md,
  },
  listItemText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    flex: 1,
  },
  listItemTextSmall: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.highlight,
    ...Layout.center,
  },
  iconContainerLarge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.highlight,
    ...Layout.center,
    marginRight: Spacing.lg,
  },
  scheduleItem: {
    ...Layout.center,
  },
  scheduleItemRow: {
    ...Cards.elevated,
    padding: Spacing.xl,
    ...Layout.flexRow,
    ...Layout.centerVertical,
  },
  scheduleDay: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: 4,
  },
  scheduleDayPrimary: {
    ...Typography.titleMedium,
    color: Colors.primary,
    marginBottom: 4,
  },
  scheduleTime: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginBottom: 4,
  },
  scheduleTimeSecondary: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  scheduleLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scheduleProgram: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  scheduleDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  timeline: {
    paddingLeft: Spacing.xl,
  },
  timelineItem: {
    ...Layout.flexRow,
    alignItems: 'flex-start',
    marginBottom: BorderRadius.xxl,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginRight: Spacing.lg,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineYear: {
    ...Typography.titleMedium,
    color: Colors.primary,
    marginBottom: 4,
  },
  timelineText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  gallery: {
    marginTop: Spacing.lg,
  },
  galleryImage: {
    width: 200,
    height: 120,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.lg,
  },
  testimonialText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    alignItems: 'flex-end',
  },
  authorName: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: 4,
  },
  authorTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  contactText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  contactDetails: {
    ...Typography.bodyMedium,
    color: Colors.text,
    lineHeight: 20,
  },
  weekTitle: {
    ...Typography.titleMedium,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  weekTopic: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  weekDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  worshipInfo: {
    flex: 1,
  },
  worshipName: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: 4,
  },
  worshipTime: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    marginBottom: 4,
  },
  worshipDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  ctaSection: {
    ...Cards.elevated,
    margin: Spacing.xl,
    padding: BorderRadius.xxl,
    borderRadius: Spacing.xl,
    ...Layout.center,
    ...Shadows.lg,
  },
  ctaTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  ctaText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  ctaButton: {
    ...Buttons.primary,
    paddingHorizontal: Spacing.xxxl,
  },
  ctaButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
  bottomSpacing: {
    height: 120,
  },
});