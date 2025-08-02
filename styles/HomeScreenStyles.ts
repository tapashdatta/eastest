// styles/HomeScreenStyles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { 
  Spacing, 
  BorderRadius, 
  Shadows, 
  Layout, 
  Containers, 
  Cards,
  Buttons 
} from '@/constants/CommonStyles';

const { width } = Dimensions.get('window');

export const homeStyles = StyleSheet.create({
  container: {
    ...Containers.screen,
  },
  
  // Header Section
  header: {
    ...Containers.header,
  },
  headerTop: {
    marginBottom: Spacing.xxl,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...Typography.headlineLarge,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  searchBar: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    backgroundColor: Colors.inputBackground,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderWidth: 0,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  searchPlaceholder: {
    ...Typography.bodyMedium,
    color: Colors.textMuted,
  },
  
  // Trip/Event Section
  tripSection: {
    paddingHorizontal: Spacing.xxl,
  },
  sectionTitle: {
    ...Typography.headlineSmall,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  categoryTabs: {
    ...Layout.flexRow,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  categoryTab: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xxl,
    backgroundColor: Colors.inputBackground,
    borderWidth: 0,
    borderColor: Colors.border,
  },
  activeCategoryTab: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryTabText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  activeCategoryTabText: {
    color: Colors.textLight,
  },
  
  // Upcoming Events Section
  upcomingSection: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xxxl,
  },
  sectionHeader: {
    ...Layout.flexRow,
    ...Layout.spaceBetween,
    ...Layout.centerVertical,
    marginBottom: Spacing.xl,
  },
  seeAllButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  seeAllText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
  eventsScrollContainer: {
    paddingRight: Spacing.xxl,
  },
  eventCard: {
    width: 200,
    ...Cards.interactive,
    marginRight: Spacing.lg,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: Spacing.lg,
  },
  eventTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  eventTime: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  eventMeta: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.md,
  },
  eventRating: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.xs,
  },
  eventRatingText: {
    ...Typography.caption,
    color: Colors.text,
  },
  eventReviews: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  eventFavorite: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.overlayLight,
    ...Layout.center,
  },
  
  // Additional Section
  additionalSection: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xxxl,
  },
  exploreCard: {
    ...Layout.flexRow,
    ...Cards.interactive,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  exploreImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  exploreContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  exploreHeader: {
    ...Layout.flexRow,
    ...Layout.spaceBetween,
    ...Layout.centerVertical,
    marginBottom: Spacing.sm,
  },
  exploreCategory: {
    ...Typography.caption,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  exploreTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  exploreExcerpt: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  exploreMeta: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.md,
  },
  exploreRating: {
    ...Layout.flexRow,
    ...Layout.centerVertical,
    gap: Spacing.xs,
  },
  exploreRatingText: {
    ...Typography.caption,
    color: Colors.text,
  },
  exploreViews: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  
  // Bottom spacing
  bottomSpacing: {
    height: 120,
  },
});