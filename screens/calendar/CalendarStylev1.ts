// screens/calendar/CalendarStyles.ts - Separated Styles

import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  // ================================
  // CONTAINER & LAYOUT
  // ================================
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ================================
  // BACK BUTTON
  // ================================
  backButtonContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // ================================
  // MODERN HEADER
  // ================================
  headerContainer: {
    position: 'relative',
    zIndex: 1,
  },
  gradient: {
    paddingBottom: 20,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    opacity: 0.1,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sparkleIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    flex: 1,
  },
  monthBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  monthBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },

  // ================================
  // STATISTICS CONTAINER
  // ================================
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 16,
  },

  // ================================
  // CALENDAR SECTION
  // ================================
  calendarSection: {
    backgroundColor: 'white',
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  monthNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },

  // ================================
  // CALENDAR GRID
  // ================================
  calendarContainer: {
    backgroundColor: 'transparent',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  weekDayText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: SCREEN_WIDTH / 7 - 4,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 12,
    marginVertical: 3,
    marginHorizontal: 2,
  },
  todayCell: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCell: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cellWithEvents: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },

  // ================================
  // CALENDAR DAY STYLING
  // ================================
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  dayNumberWithEvents: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  todayText: {
    color: 'white',
    fontWeight: '700',
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
  },

  // ================================
  // EVENT INDICATORS
  // ================================
  eventIndicatorContainer: {
    position: 'absolute',
    bottom: 6,
    flexDirection: 'row',
    gap: 3,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  selectedEventDot: {
    backgroundColor: 'white',
  },
  eventCountBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedEventBadge: {
    backgroundColor: 'white',
  },
  eventCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  selectedEventText: {
    color: Colors.primary,
  },

  // ================================
  // EVENTS SECTION
  // ================================
  eventsSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eventsSectionHeader: {
    marginBottom: 20,
  },
  selectedDateContainer: {
    alignItems: 'center',
  },
  eventsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  eventsCount: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  eventsListContainer: {
    gap: 16,
  },

  // ================================
  // EVENT CARDS
  // ================================
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  eventCardGradient: {
    borderRadius: 16,
  },
  eventCardContent: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 1,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  eventTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventTypeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  eventSubtype: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  eventExcerpt: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },

  // ================================
  // EVENT META INFORMATION
  // ================================
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },

  // ================================
  // NO EVENTS STATE
  // ================================
  noEventsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  noEventsGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noEventsSubtext: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
  },
  hintText: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
  },

  // ================================
  // LOADING STATE
  // ================================
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontSize: 14,
  },

  // ================================
  // ERROR STATE
  // ================================
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error,
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // ================================
  // RESPONSIVE DESIGN HELPERS
  // ================================
  smallScreen: {
    fontSize: 14,
  },
  mediumScreen: {
    fontSize: 16,
  },
  largeScreen: {
    fontSize: 18,
  },

  // ================================
  // ACCESSIBILITY & INTERACTION
  // ================================
  touchableArea: {
    minHeight: 44,
    minWidth: 44,
  },
  focusRing: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  pressedState: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // ================================
  // ANIMATION HELPERS
  // ================================
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0,
  },
  slideInFromRight: {
    transform: [{ translateX: 0 }],
  },
  slideOutToLeft: {
    transform: [{ translateX: -100 }],
  },
  scaleIn: {
    transform: [{ scale: 1 }],
  },
  scaleOut: {
    transform: [{ scale: 0.9 }],
  },

  // ================================
  // THEME VARIATIONS
  // ================================
  lightTheme: {
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  darkTheme: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
  },
  primaryAccent: {
    color: Colors.primary,
  },
  secondaryAccent: {
    color: Colors.textSecondary,
  },

  // ================================
  // SPACING UTILITIES
  // ================================
  marginSmall: {
    margin: 8,
  },
  marginMedium: {
    margin: 16,
  },
  marginLarge: {
    margin: 24,
  },
  paddingSmall: {
    padding: 8,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },

  // ================================
  // BORDER RADIUS UTILITIES
  // ================================
  roundedSmall: {
    borderRadius: 8,
  },
  roundedMedium: {
    borderRadius: 12,
  },
  roundedLarge: {
    borderRadius: 16,
  },
  roundedFull: {
    borderRadius: 999,
  },

  // ================================
  // SHADOW UTILITIES
  // ================================
  shadowSmall: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
});