// screens/calendar/CalendarScreen.tsx - With Animations & Back Button

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  StatusBar,
  BackHandler
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { useContent } from '@/contexts/ContentContext';
import { Post } from '@/types/content';
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Clock, 
  MapPin, 
  Users,
  RefreshCw,
  AlertCircle,
  Sparkles,
  CalendarDays,
  ArrowLeft
} from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './CalendarStylesv1';

// ================================
// TYPES & INTERFACES
// ================================

interface CalendarDay {
  day: number | null;
  date: Date | null;
  isToday: boolean;
  isSelected: boolean;
  hasEvents: boolean;
  eventCount: number;
}

interface EventsByDate {
  [dateKey: string]: Post[];
}

// ================================
// UTILITY FUNCTIONS
// ================================

const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateKey(date1) === formatDateKey(date2);
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

const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'Festival': '#FF6B6B',
    'Festivals': '#FF6B6B', 
    'Events': '#4ECDC4',
    'Class': '#45B7D1',
    'Classes': '#45B7D1',
    'Worship': '#96CEB4',
    'Community': '#FFEAA7',
    'News': '#DDA0DD',
    'Daily': '#98D8C8',
    'Darshan': '#F7DC6F',
  };
  
  const matchingKey = Object.keys(colors).find(key => 
    category.toLowerCase().includes(key.toLowerCase())
  );
  
  return matchingKey ? colors[matchingKey] : Colors.primary;
};

// ================================
// MAIN COMPONENT
// ================================

export default function CalendarScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const { getFilteredPosts, loading, error, refresh } = useContent();
  
  // State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const screenOpacity = useSharedValue(0);
  const screenTranslateX = useSharedValue(50);
  const headerScale = useSharedValue(1);
  const backButtonOpacity = useSharedValue(0);
  const calendarTranslateY = useSharedValue(30);
  const eventsTranslateY = useSharedValue(50);

  // ================================
  // DATA PROCESSING
  // ================================

  const eventsWithDates = useMemo(() => {
    const now = new Date();
    const allPosts = getFilteredPosts();
    
    const potentialEvents = allPosts.filter(post => {
      const hasEventData = post.eventData?.startDate;
      const isEventType = ['festival_event', 'kirtan-event', 'daily-darshan'].includes(post.postType);
      const hasEventCategory = post.category.toLowerCase().includes('event') || 
                              post.category.toLowerCase().includes('festival') ||
                              post.category.toLowerCase().includes('kirtan');
      
      return hasEventData || isEventType || hasEventCategory;
    });

    const processedEvents = potentialEvents.map(post => {
      if (!post.eventData?.startDate) {
        const eventDate = new Date(post.date);
        const endOfDay = new Date(eventDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const isUpcoming = eventDate > now;
        const hasEnded = endOfDay < now;
        
        return {
          ...post,
          eventData: {
            startDate: post.date,
            endDate: undefined,
            location: 'ISKCON London',
            eventType: post.category,
            isUpcoming,
            hasEnded
          }
        };
      }
      return post;
    });

    return processedEvents.filter(post => {
      if (post.eventData?.hasEnded) return false;
      
      if (post.eventData?.startDate) {
        const eventDate = new Date(post.eventData.startDate);
        const endOfDay = new Date(eventDate);
        endOfDay.setHours(23, 59, 59, 999);
        return endOfDay >= now;
      }
      
      return true;
    });
  }, [getFilteredPosts]);

  const eventsByDate: EventsByDate = useMemo(() => {
    const grouped: EventsByDate = {};
    
    eventsWithDates.forEach(event => {
      if (event.eventData?.startDate) {
        const dateKey = formatDateKey(new Date(event.eventData.startDate));
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });
    
    return grouped;
  }, [eventsWithDates]);

  const selectedDateEvents = useMemo(() => {
    const dateKey = formatDateKey(selectedDate);
    return eventsByDate[dateKey] || [];
  }, [eventsByDate, selectedDate]);

  // Calculate statistics
  const monthlyStats = useMemo(() => {
    const eventsThisMonth = eventsWithDates.filter(event => {
      const eventDate = new Date(event.eventData?.startDate || event.date);
      return eventDate.getMonth() === currentMonth.getMonth() && 
             eventDate.getFullYear() === currentMonth.getFullYear();
    }).length;

    const daysUntilNext = getDaysUntilNextEvent(eventsWithDates);

    return {
      eventsThisMonth,
      daysUntilNext
    };
  }, [eventsWithDates, currentMonth]);

  // ================================
  // CALENDAR LOGIC - MONDAY START
  // ================================

  const getDaysInMonth = useCallback((date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Convert Sunday-based (0-6) to Monday-based (0-6) where Monday = 0
    let startingDayOfWeek = firstDay.getDay() - 1;
    if (startingDayOfWeek < 0) startingDayOfWeek = 6; // Sunday becomes 6
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        day: null,
        date: null,
        isToday: false,
        isSelected: false,
        hasEvents: false,
        eventCount: 0
      });
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateKey = formatDateKey(dayDate);
      const dayEvents = eventsByDate[dateKey] || [];
      
      days.push({
        day: i,
        date: dayDate,
        isToday: isSameDay(dayDate, today),
        isSelected: isSameDay(dayDate, selectedDate),
        hasEvents: dayEvents.length > 0,
        eventCount: dayEvents.length
      });
    }
    
    return days;
  }, [eventsByDate, selectedDate]);

  const calendarDays = useMemo(() => getDaysInMonth(currentMonth), [getDaysInMonth, currentMonth]);

  // ================================
  // HANDLERS
  // ================================

  const handleGoBack = useCallback(() => {
    // Animate out
    screenOpacity.value = withTiming(0, { duration: 200 });
    screenTranslateX.value = withTiming(50, { duration: 200 }, () => {
      runOnJS(router.back)();
    });
  }, [router, screenOpacity, screenTranslateX]);

  const handleDayPress = useCallback((day: CalendarDay) => {
    if (day.date) {
      setSelectedDate(day.date);
      headerScale.value = withTiming(0.98, { duration: 100 }, () => {
        headerScale.value = withTiming(1, { duration: 100 });
      });
    }
  }, [headerScale]);

  const handlePreviousMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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
      rating: event.rating,
      location: event.eventData?.location || 'ISKCON London',
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
      await refresh();
    } catch (error) {
      // Error handled by useContent hook
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  // ================================
  // EFFECTS
  // ================================

  // Entry animation
  useEffect(() => {
    if (isFocused) {
      // Reset values
      screenOpacity.value = 0;
      screenTranslateX.value = 50;
      backButtonOpacity.value = 0;
      calendarTranslateY.value = 30;
      eventsTranslateY.value = 50;
      
      // Animate in sequence
      screenOpacity.value = withTiming(1, { duration: 300 });
      screenTranslateX.value = withTiming(0, { duration: 300 });
      
      // Stagger other animations
      backButtonOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));
      calendarTranslateY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 300 }));
      eventsTranslateY.value = withDelay(300, withSpring(0, { damping: 20, stiffness: 300 }));
    }
  }, [isFocused]);

  // Hardware back button handler
  useEffect(() => {
    const backAction = () => {
      if (isFocused) {
        handleGoBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFocused, handleGoBack]);

  // ================================
  // ANIMATED STYLES
  // ================================

  const screenAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: screenOpacity.value,
      transform: [{ translateX: screenTranslateX.value }],
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }],
    };
  });

  const backButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backButtonOpacity.value,
    };
  });

  const calendarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: calendarTranslateY.value }],
    };
  });

  const eventsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: eventsTranslateY.value }],
    };
  });

  // ================================
  // RENDER FUNCTIONS
  // ================================

  const renderBackButton = () => (
    <Animated.View style={[styles.backButtonContainer, backButtonAnimatedStyle]}>
      <TouchableOpacity 
        onPress={handleGoBack}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <ArrowLeft size={24} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderModernHeader = () => (
    <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: (StatusBar.currentHeight || 44) + 10 }]}
      >
        {/* Overlay pattern */}
        <View style={styles.patternOverlay} />
        
        {/* Back button */}
        {renderBackButton()}
        
        {/* Content */}
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.titleContainer}>
              <Sparkles size={28} color="rgba(255,255,255,0.9)" style={styles.sparkleIcon} />
              <HeadlineText style={styles.headerTitle}>Events Calendar</HeadlineText>
            </View>
            <View style={styles.monthBadge}>
              <Text style={styles.monthBadgeText}>
                {new Date().toLocaleDateString('en-GB', { month: 'short' })}
              </Text>
            </View>
          </View>
          
          <Text style={styles.headerSubtitle}>
            Discover temple activities and celebrations
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <CalendarDays size={20} color="rgba(255,255,255,0.9)" style={styles.statIcon} />
              <Text style={styles.statNumber}>{monthlyStats.eventsThisMonth}</Text>
              <Text style={styles.statLabel}>Events This Month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={20} color="rgba(255,255,255,0.9)" style={styles.statIcon} />
              <Text style={styles.statNumber}>
                {monthlyStats.daysUntilNext === -1 ? '∞' : monthlyStats.daysUntilNext === 0 ? 'Today' : monthlyStats.daysUntilNext}
              </Text>
              <Text style={styles.statLabel}>
                {monthlyStats.daysUntilNext === -1 ? 'No Upcoming' : monthlyStats.daysUntilNext === 0 ? 'Next Event' : monthlyStats.daysUntilNext === 1 ? 'Day Until Next' : 'Days Until Next'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCalendarHeader = () => (
    <View style={styles.calendarHeader}>
      <TouchableOpacity onPress={handlePreviousMonth} style={styles.monthNavButton}>
        <ChevronLeft size={24} color={Colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.monthTitleContainer}>
        <TitleText style={styles.monthTitle}>{getMonthName(currentMonth)}</TitleText>
      </View>
      
      <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavButton}>
        <ChevronRight size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderCalendar = () => (
    <View style={styles.calendarContainer}>
      {/* Week Day Headers - Monday Start */}
      <View style={styles.weekDaysRow}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <View key={day} style={styles.weekDayCell}>
            <CaptionText style={styles.weekDayText}>{day}</CaptionText>
          </View>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarCell,
              day.isToday && styles.todayCell,
              day.isSelected && styles.selectedCell,
              day.hasEvents && !day.isSelected && !day.isToday && styles.cellWithEvents,
            ]}
            onPress={() => handleDayPress(day)}
            disabled={!day.date}
            activeOpacity={0.7}
          >
            {day.day && (
              <>
                <Text style={[
                  styles.dayNumber,
                  day.hasEvents && styles.dayNumberWithEvents,
                  day.isToday && styles.todayText,
                  day.isSelected && styles.selectedText,
                ]}>
                  {day.day}
                </Text>
                
                {/* Event Indicators */}
                {day.hasEvents && (
                  <View style={styles.eventIndicatorContainer}>
                    {day.eventCount <= 3 ? (
                      Array.from({ length: Math.min(day.eventCount, 3) }).map((_, i) => (
                        <View key={i} style={[
                          styles.eventDot,
                          day.isSelected && styles.selectedEventDot
                        ]} />
                      ))
                    ) : (
                      <View style={[
                        styles.eventCountBadge,
                        day.isSelected && styles.selectedEventBadge
                      ]}>
                        <Text style={[
                          styles.eventCountText,
                          day.isSelected && styles.selectedEventText
                        ]}>
                          {day.eventCount}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEventCard = (event: Post) => (
    <Animated.View
      key={event.id}
      entering={FadeIn.delay(100).duration(300)}
      exiting={FadeOut.duration(200)}
    >
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => handleEventPress(event)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[getCategoryColor(event.category) + '15', getCategoryColor(event.category) + '05']}
          style={styles.eventCardGradient}
        >
          <View style={styles.eventCardContent}>
            <View style={styles.eventCardHeader}>
              <View style={[
                styles.eventTypeBadge, 
                { backgroundColor: getCategoryColor(event.category) }
              ]}>
                <CaptionText style={styles.eventTypeBadgeText}>
                  {event.category}
                </CaptionText>
              </View>
              
              {event.eventData?.eventType && event.eventData.eventType !== event.category && (
                <CaptionText style={styles.eventSubtype}>
                  {event.eventData.eventType}
                </CaptionText>
              )}
            </View>
            
            <TitleText style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </TitleText>
            
            <BodyText style={styles.eventExcerpt} numberOfLines={2}>
              {event.excerpt}
            </BodyText>
            
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color={Colors.textSecondary} />
                <CaptionText style={styles.metaText}>
                  {new Date(event.eventData?.startDate || event.date).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CaptionText>
              </View>
              
              <View style={styles.metaItem}>
                <MapPin size={16} color={Colors.textSecondary} />
                <CaptionText style={styles.metaText}>
                  {event.eventData?.location || 'ISKCON London'}
                </CaptionText>
              </View>
              
              <View style={styles.metaItem}>
                <Users size={16} color={Colors.textSecondary} />
                <CaptionText style={styles.metaText}>
                  {event.stats.views}
                </CaptionText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEventsSection = () => (
    <Animated.View style={[styles.eventsSection, eventsAnimatedStyle]}>
      <View style={styles.eventsSectionHeader}>
        <View style={styles.selectedDateContainer}>
          <TitleText style={styles.eventsSectionTitle}>
            {selectedDate.toLocaleDateString('en-GB', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </TitleText>
          <CaptionText style={styles.eventsCount}>
            {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
          </CaptionText>
        </View>
      </View>
      
      {selectedDateEvents.length > 0 ? (
        <View style={styles.eventsListContainer}>
          {selectedDateEvents.map(renderEventCard)}
        </View>
      ) : (
        <Animated.View 
          style={styles.noEventsContainer}
          entering={FadeIn.delay(200).duration(400)}
        >
          <LinearGradient
            colors={['#f8f9fa', '#e9ecef']}
            style={styles.noEventsGradient}
          >
            <Calendar size={48} color={Colors.textMuted} />
            <Text style={styles.noEventsText}>No events scheduled</Text>
            <CaptionText style={styles.noEventsSubtext}>
              Select a different date to see events
            </CaptionText>
            
            {eventsWithDates.length > 0 && (
              <CaptionText style={styles.hintText}>
                {eventsWithDates.length} events available this month
              </CaptionText>
            )}
          </LinearGradient>
        </Animated.View>
      )}
    </Animated.View>
  );

  // ================================
  // LOADING & ERROR STATES
  // ================================

  if (loading && eventsWithDates.length === 0) {
    return (
      <Animated.View 
        style={[styles.container, styles.centerContent]}
        entering={FadeIn.duration(300)}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.loadingGradient}
        >
          <RefreshCw size={32} color="white" style={{ marginBottom: 16 }} />
          <Text style={styles.loadingText}>Loading Events...</Text>
          <CaptionText style={styles.loadingSubtext}>
            Fetching events from temple calendar
          </CaptionText>
        </LinearGradient>
      </Animated.View>
    );
  }

  // ================================
  // MAIN RENDER
  // ================================

  return (
    <Animated.View style={[styles.container, screenAnimatedStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressViewOffset={50}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        {renderModernHeader()}
        
        {/* Calendar Section */}
        <Animated.View style={[styles.calendarSection, calendarAnimatedStyle]}>
          {renderCalendarHeader()}
          {renderCalendar()}
        </Animated.View>

        {/* Events Section */}
        {renderEventsSection()}

        {/* Error State */}
        {error && (
          <Animated.View 
            style={styles.errorContainer}
            entering={FadeIn.delay(200).duration(300)}
            exiting={FadeOut.duration(200)}
          >
            <AlertCircle size={24} color={Colors.error} />
            <Text style={styles.errorText}>Failed to load events</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </Animated.View>
  );
}