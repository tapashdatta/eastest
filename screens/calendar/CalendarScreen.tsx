// screens/calendar/CalendarScreen.tsx - Self-contained with styles

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  StatusBar,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Typography } from '@/constants/Typography';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, Layout, Shadows } from '@/constants/CommonStyles';
import { Text, HeadlineText, TitleText, CaptionText } from '@/components/Text';
import { 
  useContent, 
  useUpcomingEvents, 
  useEventTypeStats 
} from '@/contexts/ContentContext';
import { ThumbnailImage, useEventImagePreloader } from '@/components/OptimizedImage';
import { 
  Post, 
  ContentFilter, 
  getEventTypesWithDates,
  getEventTypeDisplayName
} from '@/types/content';
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Clock, 
  Sparkles,
  CalendarDays,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// ================================
// TYPES & INTERFACES
// ================================

interface HorizontalDay {
  date: Date;
  day: number;
  dayName: string;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
  eventCount: number;
}

interface EventsByDate {
  [dateKey: string]: Post[];
}

// ================================
// CONSTANTS & UTILITIES
// ================================

const SCREEN_WIDTH = Dimensions.get('window').width;

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

const getDaysUntilNextEvent = (events: Post[]): number => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const upcomingEvents = events
    .filter(event => {
      if (!event.eventData?.startDate) return false;
      const eventDate = new Date(event.eventData.startDate);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      return eventDay >= today;
    })
    .sort((a, b) => {
      const dateA = new Date(a.eventData!.startDate!);
      const dateB = new Date(b.eventData!.startDate!);
      return dateA.getTime() - dateB.getTime();
    });

  if (upcomingEvents.length === 0) return -1;
  
  const nextEventDate = new Date(upcomingEvents[0].eventData!.startDate!);
  const nextEventDay = new Date(nextEventDate.getFullYear(), nextEventDate.getMonth(), nextEventDate.getDate());
  
  const diffTime = nextEventDay.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getEventTypeColor = (eventType?: string): string => {
  const colors: { [key: string]: string } = {
    'festival': '#FF6B6B',
    'ekadasi': '#FF6B6B', 
    'courses': '#45B7D1',
    'guest_speaker': '#4ECDC4',
    'news': '#DDA0DD',
  };
  
  return eventType ? colors[eventType] || '#667eea' : '#667eea';
};

// ================================
// LOCAL STYLES
// ================================

const styles = StyleSheet.create({
  // ===== MAIN CONTAINER =====
  container: {
    ...Layout.flex1,
    backgroundColor: Colors.transparent,
  },
  centerContent: {
    ...Layout.center,
  },

  // ===== LOADING STATE =====
  loadingGradient: {
    ...Layout.flex1,
    ...Layout.center,
    padding: Spacing.xl,
    backgroundColor: Colors.transparent,
  },
  loadingText: {
    ...Typography.titleLarge,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  loadingSubtext: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // ===== CALENDAR HEADER =====
  calendarHeaderSimple: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  monthTitleSimple: {
    ...Typography.titleLarge,
    color: Colors.white,
    textAlign: 'center',
  },

  // ===== HORIZONTAL CALENDAR =====
  horizontalCalendarContainer: {
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  horizontalCalendar: {
    flexGrow: 0,
  },
  horizontalCalendarContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  horizontalDateItem: {
    width: 70,
    height: 100,
    ...Layout.center,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: Spacing.md,
    position: 'relative',
  },
  selectedDateItem: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  todayDateItem: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalDayName: {
    ...Typography.labelMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  horizontalDayNumber: {
    ...Typography.titleLarge,
    color: Colors.white,
  },
  selectedDateText: {
    color: Colors.white,
  },
  todayDateText: {
    color: Colors.white,
  },
  horizontalEventDot: {
    position: 'absolute',
    bottom: Spacing.sm,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  selectedEventDot: {
    backgroundColor: Colors.white,
  },
  todayEventDot: {
    backgroundColor: Colors.white,
  },
  eventCountBadge: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: Spacing.xl,
    ...Layout.centerHorizontal,
  },
  selectedEventBadge: {
    backgroundColor: Colors.white,
  },
  eventCountText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  selectedEventText: {
    color: Colors.primary,
  },

  // ===== EVENTS LIST =====
  eventsListContainer: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },

  // ===== EVENT CARDS =====
  modernEventCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.xs,
    marginHorizontal: 2,
    minHeight: 100,
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.sm,
  },
  modernEventContent: {
    position: 'relative',
    minHeight: 100,
    flex: 1,
    padding: 0,
    margin: 0,
  },
  eventAvatar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 130,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  eventAvatarCircle: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    ...Layout.center,
  },
  eventAvatarText: {
    ...Typography.titleMedium,
    color: Colors.white,
  },
  modernEventDetails: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginLeft: 142, // 130px image + 12px spacing
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginBottom: 6,
  },
  eventTypeBadgeText: {
    ...Typography.labelSmall,
    color: Colors.white,
    textTransform: 'uppercase',
  },
  modernEventTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: 6,
  },
  modernEventMeta: {
    marginBottom: Spacing.sm,
  },
  modernEventTime: {
    ...Typography.bodySmall,
    color: 'rgba(0, 0, 0, 0.9)',
    marginBottom: 2,
  },

  // ===== NO EVENTS STATE =====
  noEventsContainer: {
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.md,
  },
  noEventsGradient: {
    ...Layout.center,
    padding: Spacing.xxxxl,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  noEventsText: {
    ...Typography.titleMedium,
    color: Colors.white,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  noEventsSubtext: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  // ===== ERROR STATE =====
  errorContainer: {
    ...Layout.center,
    padding: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.5)',
    ...Shadows.md,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    ...Typography.labelLarge,
    color: Colors.primary,
  },
});

// ================================
// MAIN COMPONENT
// ================================

export default function CalendarScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  
  // ===== HOOKS & CONTEXT =====
  const { 
    loading, 
    error, 
    refresh, 
    getFilteredPosts 
  } = useContent();
  
  const { events: upcomingEvents } = useUpcomingEvents(100);
  const eventTypeStats = useEventTypeStats();
  
  // ===== STATE =====
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // ===== ANIMATIONS =====
  const screenOpacity = useSharedValue(0);
  const screenTranslateX = useSharedValue(50);

  // ===== GESTURE HANDLING =====
  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.x < 50 && event.translationX > 0 && Math.abs(event.velocityX) > Math.abs(event.velocityY)) {
        screenTranslateX.value = Math.max(0, event.translationX * 0.5);
        screenOpacity.value = Math.max(0.7, 1 - (event.translationX / 300));
      }
    })
    .onEnd((event) => {
      if (event.translationX > 100 && event.velocityX > 300) {
        screenTranslateX.value = withTiming(300, { duration: 200 });
        screenOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleGoBack)();
        });
      } else {
        screenTranslateX.value = withSpring(0);
        screenOpacity.value = withSpring(1);
      }
    })
    .shouldCancelWhenOutside(false);

  // ===== DATA PROCESSING =====
  const eventsWithDates = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const eventTypesWithDates = getEventTypesWithDates();
    
    const filter: ContentFilter = {
      eventTypes: eventTypesWithDates,
      sortBy: 'eventDate',
      sortOrder: 'asc'
    };
    
    const eventPosts = getFilteredPosts(filter);
    const upcomingEventsList = upcomingEvents || [];
    
    const allEventIds = new Set<number>();
    const combinedEvents: Post[] = [];
    
    [...eventPosts, ...upcomingEventsList].forEach(event => {
      if (!allEventIds.has(event.id) && event.eventData?.startDate) {
        allEventIds.add(event.id);
        combinedEvents.push(event);
      }
    });
    
    const filteredEvents = combinedEvents.filter(post => {
      if (!post.eventData?.startDate) return false;
      
      const eventDate = new Date(post.eventData.startDate);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      if (eventDay >= today) {
        return true;
      }
      
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      return eventDay >= thirtyDaysAgo;
    });

    return filteredEvents;
  }, [getFilteredPosts, upcomingEvents]);

  const { ready: imagesReady } = useEventImagePreloader(eventsWithDates);

  const eventsByDate: EventsByDate = useMemo(() => {
    const grouped: EventsByDate = {};
    
    eventsWithDates.forEach(event => {
      if (event.eventData?.startDate) {
        const eventDate = new Date(event.eventData.startDate);
        const dateKey = formatDateKey(eventDate);
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });
    
    return grouped;
  }, [eventsWithDates]);

  const monthlyStats = useMemo(() => {
    const today = new Date();
    const todayKey = formatDateKey(today);
    
    const eventsThisMonth = eventsWithDates.filter(event => {
      const eventDate = new Date(event.eventData?.startDate || event.date);
      return eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;

    const eventsToday = eventsByDate[todayKey] ? eventsByDate[todayKey].length : 0;
    const daysUntilNext = getDaysUntilNextEvent(eventsWithDates);

    return {
      eventsThisMonth,
      eventsToday,
      daysUntilNext
    };
  }, [eventsWithDates, currentMonth, eventsByDate]);

  const selectedDateEvents = useMemo(() => {
    const dateKey = formatDateKey(selectedDate);
    return eventsByDate[dateKey] || [];
  }, [eventsByDate, selectedDate]);

  // ===== EVENT HANDLERS =====
  const handlePreviousMonth = useCallback(() => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  }, [currentMonth]);

  const handleDayPress = useCallback((day: HorizontalDay) => {
    if (day.date) {
      setSelectedDate(day.date);
    }
  }, []);

  const handleEventPress = useCallback((event: Post) => {
    const postForNavigation = {
      id: event.id,
      title: event.title,
      excerpt: event.excerpt,
      content: event.content,
      image: event.image,
      category: event.category,
      date: event.date,
      readTime: event.readTime,
      likes: event.stats.likes,
      comments: event.stats.comments,
      views: event.stats.views,
      isBookmarked: event.isBookmarked,
      isLiked: event.isLiked,
    };
    
    router.push({
      pathname: '/PostDetail',
      params: { post: JSON.stringify(postForNavigation) }
    });
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh(true);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // ===== EFFECTS =====
  useEffect(() => {
    if (isFocused) {
      screenOpacity.value = 0;
      screenTranslateX.value = 50;
      
      screenOpacity.value = withTiming(1, { duration: 300 });
      screenTranslateX.value = withTiming(0, { duration: 300 });
      
      const today = new Date();
      setCurrentMonth(today);
      
      const todayKey = formatDateKey(today);
      const allEventDates = Object.keys(eventsByDate).sort();
      
      if (eventsByDate[todayKey] && eventsByDate[todayKey].length > 0) {
        setSelectedDate(today);
        return;
      }
      
      const currentMonthEvents = allEventDates.filter(dateKey => {
        const eventDate = new Date(dateKey);
        return eventDate.getMonth() === today.getMonth() && 
               eventDate.getFullYear() === today.getFullYear();
      });
      
      if (currentMonthEvents.length > 0) {
        const upcomingInMonth = currentMonthEvents.filter(dateKey => dateKey >= todayKey);
        const selectedDateKey = upcomingInMonth.length > 0 ? upcomingInMonth[0] : currentMonthEvents[0];
        setSelectedDate(new Date(selectedDateKey));
        return;
      }
      
      setSelectedDate(today);
    }
  }, [isFocused, eventsByDate]);

  useEffect(() => {
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    const currentMonth_ = currentMonth.getMonth();
    const currentYear = currentMonth.getFullYear();
    
    if (selectedMonth !== currentMonth_ || selectedYear !== currentYear) {
      const currentMonthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      
      const currentMonthEvents = Object.keys(eventsByDate).filter(dateKey => {
        return dateKey.startsWith(currentMonthKey);
      });
      
      if (currentMonthEvents.length > 0) {
        setSelectedDate(new Date(currentMonthEvents[0]));
      } else {
        const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        setSelectedDate(firstOfMonth);
      }
    }
  }, [currentMonth, eventsByDate]);

  // ===== ANIMATED STYLES =====
  const screenAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: screenOpacity.value,
      transform: [{ translateX: screenTranslateX.value }],
    };
  });

  // ================================
  // RENDER FUNCTIONS
  // ================================

  // ===== HEADER SECTION =====
  const renderHeader = () => (
    <View
      style={{
        paddingTop: Platform.OS === 'ios' ? 0 : insets.top,
        paddingBottom: Spacing.xl,
        paddingHorizontal: Spacing.xl,
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        marginBottom: Spacing.sm,
      }}>
        <TouchableOpacity 
          onPress={handleGoBack}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={{
          flex: 1,
          alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <Calendar size={24} color="rgba(255,255,255,0.9)" />
            <HeadlineText style={{
              ...Typography.headlineMedium,
              color: 'white',
              textAlign: 'center',
            }}>
              Calendar
            </HeadlineText>
          </View>
        </View>

        <View style={{ width: 44, height: 44 }} />
      </View>

      <Text style={{
        ...Typography.bodyMedium,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        marginBottom: Spacing.lg,
      }}>
        Discover temple activities and celebrations
      </Text>

      <View style={{
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <CalendarDays size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 8 }} />
          <Text style={{
            ...Typography.headlineSmall,
            color: 'white',
            marginBottom: 4,
          }}>
            {monthlyStats.eventsThisMonth}
          </Text>
          <Text style={{
            ...Typography.labelMedium,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}>
            Events This Month
          </Text>
        </View>

        <View style={{
          width: 1,
          height: 40,
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginHorizontal: Spacing.lg,
        }} />

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Clock size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 8 }} />
          <Text style={{
            ...Typography.headlineSmall,
            color: 'white',
            marginBottom: 4,
          }}>
            {monthlyStats.eventsToday}
          </Text>
          <Text style={{
            ...Typography.labelMedium,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}>
            Events Today
          </Text>
        </View>

        <View style={{
          width: 1,
          height: 40,
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginHorizontal: 16,
        }} />

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Sparkles size={20} color="rgba(255,255,255,0.9)" style={{ marginBottom: 8 }} />
          <Text style={{
            ...Typography.headlineSmall,
            color: 'white',
            marginBottom: 4,
          }}>
            {monthlyStats.daysUntilNext === -1 ? '∞' : monthlyStats.daysUntilNext === 0 ? 'Today' : monthlyStats.daysUntilNext}
          </Text>
          <Text style={{
            ...Typography.labelMedium,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}>
            {monthlyStats.daysUntilNext === -1 ? 'No Upcoming' : monthlyStats.daysUntilNext === 0 ? 'Next Event' : monthlyStats.daysUntilNext === 1 ? 'Day Until Next' : 'Days Until Next'}
          </Text>
        </View>
      </View>
    </View>
  );

  // ===== CALENDAR HEADER =====
  const renderCalendarHeader = () => (
    <View style={styles.calendarHeaderSimple}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl }}>
        <TouchableOpacity 
          onPress={handlePreviousMonth}
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.md,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            ...Shadows.xs,
          }}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={Colors.white} />
        </TouchableOpacity>
        
        <TitleText style={styles.monthTitleSimple}>
          {getMonthName(currentMonth)}
        </TitleText>
        
        <TouchableOpacity 
          onPress={handleNextMonth}
          style={{
            padding: Spacing.md,
            borderRadius: BorderRadius.md,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            ...Shadows.xs,
          }}
          activeOpacity={0.7}
        >
          <ChevronRight size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ===== HORIZONTAL CALENDAR =====
  const renderHorizontalCalendar = () => {
    const generateEventDays = () => {
      const days: HorizontalDay[] = [];
      const today = new Date();
      
      const allEventDates = Object.keys(eventsByDate)
        .map(dateKey => {
          const date = new Date(dateKey);
          return {
            originalKey: dateKey,
            date: date,
            isInCurrentMonth: date.getMonth() === currentMonth.getMonth() && 
                              date.getFullYear() === currentMonth.getFullYear()
          };
        })
        .filter(item => item.isInCurrentMonth)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      
      allEventDates.forEach(item => {
        const date = item.date;
        const dateKey = item.originalKey;
        const dayEvents = eventsByDate[dateKey] || [];
        
        days.push({
          date: date,
          day: date.getDate(),
          dayName: date.toLocaleDateString('en-GB', { weekday: 'short' }),
          isToday: isSameDay(date, today),
          isSelected: isSameDay(date, selectedDate),
          hasEvents: dayEvents.length > 0,
          eventCount: dayEvents.length
        });
      });
      
      return days;
    };

    const eventDays = generateEventDays();
    
    if (eventDays.length === 0) {
      return null;
    }

    const selectedIndex = eventDays.findIndex(day => day.isSelected);
    const todayIndex = eventDays.findIndex(day => day.isToday);
    const scrollToIndex = selectedIndex !== -1 ? selectedIndex : Math.max(0, todayIndex);

    return (
      <View style={styles.horizontalCalendarContainer}>
        <ScrollView
          ref={(ref) => {
            if (ref && scrollToIndex !== -1 && eventDays.length > 0) {
              setTimeout(() => {
                ref.scrollTo({ 
                  x: Math.max(0, (scrollToIndex * 82) - 100), 
                  animated: true 
                });
              }, 100);
            }
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalCalendar}
          contentContainerStyle={styles.horizontalCalendarContent}
          decelerationRate="fast"
          snapToInterval={82}
          snapToAlignment="start"
          scrollsToTop={false}
          alwaysBounceVertical={false}
          bounces={Platform.OS === 'ios'}
          scrollEnabled={true}
        >
          {eventDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.horizontalDateItem,
                day.isSelected && styles.selectedDateItem,
                day.isToday && !day.isSelected && styles.todayDateItem,
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.horizontalDayName,
                day.isSelected && styles.selectedDateText,
                day.isToday && !day.isSelected && styles.todayDateText,
              ]}>
                {day.dayName}
              </Text>
              
              <Text style={[
                styles.horizontalDayNumber,
                day.isSelected && styles.selectedDateText,
                day.isToday && !day.isSelected && styles.todayDateText,
              ]}>
                {day.day}
              </Text>
              
              {day.eventCount > 1 && (
                <View style={[
                  styles.eventCountBadge,
                  day.isSelected && styles.selectedEventBadge,
                ]}>
                  <Text style={[
                    styles.eventCountText,
                    day.isSelected && styles.selectedEventText,
                  ]}>
                    {day.eventCount}
                  </Text>
                </View>
              )}
              
              {day.eventCount === 1 && (
                <View style={[
                  styles.horizontalEventDot,
                  day.isSelected && styles.selectedEventDot,
                  day.isToday && !day.isSelected && styles.todayEventDot,
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // ===== EVENT CARD =====
  const renderEventCard = (event: Post) => (
    <View key={event.id} style={{ padding: 4, marginVertical: 4 }}>
      <TouchableOpacity 
        style={styles.modernEventCard}
        onPress={() => handleEventPress(event)}
        activeOpacity={0.8}
      >
        <View style={styles.modernEventContent}>
          <View style={styles.eventAvatar}>
            {event.image ? (
              <ThumbnailImage
                source={{ uri: event.image }}
                style={styles.eventImage}
                contentFit="cover"
                placeholder="gradient"
                showActivityIndicator={true}
                priority="normal"
                cachePolicy="memory"
              />
            ) : (
              <View style={[
                styles.eventAvatarCircle,
                { backgroundColor: getEventTypeColor(event.eventData?.eventType) }
              ]}>
                <Text style={styles.eventAvatarText}>
                  {event.title.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.modernEventDetails}>
            {event.eventData?.eventType && (
              <View style={[
                styles.eventTypeBadge,
                { backgroundColor: getEventTypeColor(event.eventData.eventType) }
              ]}>
                <Text style={styles.eventTypeBadgeText}>
                  {getEventTypeDisplayName(event.eventData.eventType)}
                </Text>
              </View>
            )}
            
            <TitleText style={styles.modernEventTitle} numberOfLines={1}>
              {event.title}
            </TitleText>
            
            <View style={styles.modernEventMeta}>
              {event.eventData?.startDate && (
                <Text style={styles.modernEventTime}>
                  {new Date(event.eventData.startDate).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {event.eventData.endDate && ` - ${new Date(event.eventData.endDate).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}`}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // ===== EVENTS SECTION =====
  const renderEventsSection = () => {
    const selectedInCurrentMonth = selectedDate.getMonth() === currentMonth.getMonth() && 
                                   selectedDate.getFullYear() === currentMonth.getFullYear();
    
    const currentMonthHasEvents = Object.keys(eventsByDate).some(dateKey => {
      const eventDate = new Date(dateKey);
      return eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    });
    
    return (
      <>
        {selectedDateEvents.length > 0 ? (
          <View style={styles.eventsListContainer}>
            {!selectedInCurrentMonth && (
              <View style={{ 
                padding: Spacing.md, 
                backgroundColor: 'rgba(255, 204, 0, 0.2)', 
                borderRadius: BorderRadius.sm, 
                marginBottom: Spacing.md,
                marginHorizontal: Spacing.lg,
                borderLeftWidth: 4, 
                borderLeftColor: 'rgba(255, 204, 0, 0.8)' 
              }}>
                <Text style={{ 
                  ...Typography.labelLarge,
                  color: Colors.white, 
                }}>
                  📅 Showing events from {selectedDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </Text>
                <Text style={{ 
                  ...Typography.bodySmall, 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  marginTop: 4 
                }}>
                  Navigate to that month to see it in the calendar view
                </Text>
              </View>
            )}
            <View style={{ paddingHorizontal: Spacing.lg }}>
              {selectedDateEvents.map(renderEventCard)}
            </View>
          </View>
        ) : (
          <View style={styles.noEventsContainer}>
            <View style={styles.noEventsGradient}>
              <Calendar size={48} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.noEventsText}>
                {!currentMonthHasEvents 
                  ? "No events this month"
                  : "No events scheduled"
                }
              </Text>
              <CaptionText style={styles.noEventsSubtext}>
                {!currentMonthHasEvents
                  ? "Try navigating to a different month"
                  : selectedInCurrentMonth 
                    ? "Select a different date to see events"
                    : `No events on ${formatDateKey(selectedDate)}`
                }
              </CaptionText>
            </View>
          </View>
        )}
      </>
    );
  };

  // ================================
  // LOADING STATE
  // ================================

  if (loading && eventsWithDates.length === 0) {
    return (
      <>
        <Stack.Screen 
          options={{
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        
        <View style={[styles.container, styles.centerContent]}>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <LinearGradient
            colors={['#092658ff', '#14233dff', '#5a67d8', '#080f2eff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.loadingGradient}
          >
            <RefreshCw size={32} color="white" style={{ marginBottom: 16 }} />
            <Text style={styles.loadingText}>Loading Events...</Text>
            <CaptionText style={styles.loadingSubtext}>
              Fetching events from temple calendar
            </CaptionText>
          </LinearGradient>
        </View>
      </>
    );
  }

  // ================================
  // MAIN RENDER
  // ================================

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.container, screenAnimatedStyle]}>
          <LinearGradient
            colors={['#092658ff', '#14233dff', '#5a67d8', '#051042ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: Spacing.xxxxxl }}
              bounces={true}
              alwaysBounceVertical={false}
              scrollsToTop={false}
              directionalLockEnabled={true}
              contentInsetAdjustmentBehavior="automatic"
              decelerationRate={Platform.OS === 'ios' ? 'normal' : 0.98}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Colors.white}
                  colors={[Colors.white]}
                />
              }
            >
              {renderHeader()}
              {renderCalendarHeader()}
              {renderHorizontalCalendar()}
              {renderEventsSection()}

              {error && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={24} color={Colors.white} />
                  <Text style={styles.errorText}>Unable to load events</Text>
                  <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </>
  );
}