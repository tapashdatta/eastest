// screens/home/TodaysSchedule.tsx - Self-contained with styles

import React, { useMemo, useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Animated,
  StyleSheet,
} from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';
import { Typography } from '@/constants/Typography';

const { width } = Dimensions.get('window');

// Constants
const CARD_WIDTH = width * 0.45;
const CARD_SPACING = 16;
const AUTO_SCROLL_DELAY = 3000;
const INITIAL_SCROLL_DELAY = 1500;

// ================================
// LOCAL STYLES
// ================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.titleLarge,
    fontSize: 18,
    lineHeight: 22,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  scheduleCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    position: 'relative',
  },
  liveCard: {
    // Additional styles for live cards if needed
  },
  upcomingCard: {
    // Additional styles for upcoming cards if needed
  },
  cardTypePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTypePillText: {
    ...Typography.labelSmall,
    fontSize: 10,
    lineHeight: 12,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  scheduleCardTitle: {
    ...Typography.titleMedium,
    lineHeight: 20,
    marginBottom: 8,
  },
  scheduleCardTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  scheduleCardTimeText: {
    ...Typography.bodyMedium,
    lineHeight: 16,
    color: '#8E8E93',
    marginLeft: 6,
  },
  upcomingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    zIndex: 2,
  },
  upcomingBadgeText: {
    ...Typography.labelSmall,
    fontSize: 9,
    lineHeight: 10,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  pulseContainer: {
    position: 'absolute',
    top: 0,
    right: 8,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  wave1: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  wave2: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  wave3: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    zIndex: 10,
  },
  liveText: {
    ...Typography.labelSmall,
    fontSize: 10,
    lineHeight: 10,
    color: '#FF3B30',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 0,
    marginTop: 5,
    height: 10,
    textAlignVertical: 'center',
  },
});

// ✅ BALANCED CENTERING: Smaller side margins that look proportional to card spacing
const calculateBalancedMargins = () => {
  // Use spacing-proportional margins instead of perfect centering
  // This creates a more balanced visual relationship
  const proportionalSideMargin = CARD_SPACING * 0.75; // 12px when CARD_SPACING is 16px
  
  return {
    side: proportionalSideMargin,
    between: CARD_SPACING
  };
};

const MARGINS = calculateBalancedMargins();

/* ------------------------------------------------------------------------- */
/* Enhanced Live Pulse Indicator Component with Radio Waves                */
/* ------------------------------------------------------------------------- */

const LivePulseIndicator: React.FC<{ isLive: boolean }> = React.memo(({ isLive }) => {
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  const opacityWave1 = useRef(new Animated.Value(0)).current;
  const opacityWave2 = useRef(new Animated.Value(0)).current;
  const opacityWave3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLive) return;

    const createWaveAnimation = (scaleAnim: Animated.Value, opacityAnim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(opacityAnim, {
                toValue: 0.8,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 1800,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      createWaveAnimation(wave1Anim, opacityWave1, 0),
      createWaveAnimation(wave2Anim, opacityWave2, 400),
      createWaveAnimation(wave3Anim, opacityWave3, 800),
    ];

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, [isLive, wave1Anim, wave2Anim, wave3Anim, opacityWave1, opacityWave2, opacityWave3]);

  if (!isLive) return null;

  return (
    <View style={styles.pulseContainer}>
      <View style={styles.waveContainer}>
        <Animated.View style={[styles.wave, styles.wave1, {
          opacity: opacityWave1,
          transform: [{ scale: wave1Anim }],
        }]} />
        <Animated.View style={[styles.wave, styles.wave2, {
          opacity: opacityWave2,
          transform: [{ scale: wave2Anim }],
        }]} />
        <Animated.View style={[styles.wave, styles.wave3, {
          opacity: opacityWave3,
          transform: [{ scale: wave3Anim }],
        }]} />
        <View style={styles.centerDot} />
      </View>
      <Text style={styles.liveText}>NOW</Text>
    </View>
  );
});

LivePulseIndicator.displayName = 'LivePulseIndicator';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  type: 'program' | 'darshan' | 'class' | 'prasadam' | 'closed';
  isOngoing?: boolean;
  isUpcoming?: boolean;
}

// 🎯 SCHEDULE DATA
const weekdaySchedule: Omit<ScheduleItem, 'isOngoing' | 'isUpcoming'>[] = [
  { id: '1', time: '04:30', title: 'Mangala Arati', type: 'darshan' },
  { id: '2', time: '05:10', title: 'Tulasi Puja, Japa Till 7:00', type: 'program' },
  { id: '3', time: '07:00', title: 'Deity Greetings, SP Guru Puja', type: 'darshan' },
  { id: '4', time: '07:30', title: 'SB or CC Class', type: 'class' },
  { id: '5', time: '09:00', title: 'Breakfast Served', type: 'prasadam' },
  { id: '7', time: '10:00', title: 'Darshan Open Till 11:45', type: 'darshan' },
  { id: '8', time: '12:30', title: 'Raj Bhoga Arati', type: 'darshan' },
  { id: '9', time: '13:00', title: 'Introductory Class', type: 'class' },
  { id: '10', time: '14:00', title: 'Lunch Served', type: 'prasadam' },
  { id: '11', time: '15:00', title: 'Deities Resting, Darshan Closed', type: 'closed' },
  { id: '12', time: '16:15', title: 'Dhupa Arati, Darshan Till 18:00', type: 'darshan' },
  { id: '13', time: '18:00', title: 'Bhagavad-gītā Class', type: 'class' },
  { id: '14', time: '19:00', title: 'Sandhya Arati', type: 'darshan' },
  { id: '15', time: '19:30', title: 'Darshan Closed (Until 21:00)', type: 'closed' },
  { id: '16', time: '21:00', title: 'Sayana Darshan', type: 'darshan' },
  { id: '17', time: '21:30', title: 'Temple Closed (Until 4:30)', type: 'closed' },
];

const sundaySchedule: Omit<ScheduleItem, 'isOngoing' | 'isUpcoming'>[] = [
  { id: '1', time: '04:30', title: 'Sunday Mangala Arati', type: 'darshan' },
  { id: '2', time: '05:10', title: 'Sunday Tulasi Puja and Chanting', type: 'program' },
  { id: '3', time: '07:00', title: 'Sunday Deity Greetings and SP Guru Puja', type: 'darshan' },
  { id: '4', time: '07:30', title: 'Sunday SB or CC Class', type: 'class' },
  { id: '5', time: '09:00', title: 'Sunday Breakfast Prasadam', type: 'prasadam' },
  { id: '6', time: '10:00', title: 'Sunday Feast Preparation', type: 'program' },
  { id: '7', time: '11:00', title: 'Darshan Open', type: 'darshan' },
  { id: '8', time: '12:30', title: 'Raj Bhoga Arati', type: 'darshan' },
  { id: '9', time: '13:00', title: 'Sunday Feast Program', type: 'program' },
  { id: '10', time: '14:00', title: 'Grand Sunday Feast', type: 'prasadam' },
  { id: '11', time: '15:30', title: 'Deities Rest, Darshan Closed', type: 'closed' },
  { id: '12', time: '16:15', title: 'Dhupa Arati', type: 'darshan' },
  { id: '13', time: '17:30', title: 'Sunday Evening Program', type: 'program' },
  { id: '14', time: '19:00', title: 'Sandhya Arati', type: 'darshan' },
  { id: '15', time: '19:30', title: 'Darshan Closed', type: 'closed' },
  { id: '16', time: '21:00', title: 'Sayana Darshan', type: 'darshan' },
  { id: '17', time: '21:30', title: 'Temple Closed (Until 4:30)', type: 'closed' },
];

export const TodaysSchedule: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef<boolean>(false);
  
  // ✅ Proper UK time handling
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    const ukFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const ukTimeString = ukFormatter.format(now);
    return parseInt(ukTimeString.replace(':', ''), 10);
  });

  // Update current time every minute with proper UK time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const ukFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const ukTimeString = ukFormatter.format(now);
      setCurrentTime(parseInt(ukTimeString.replace(':', ''), 10));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // 🎯 DETERMINE SCHEDULE AND TITLE BASED ON DAY
  const { scheduleData, title } = useMemo(() => {
    const now = new Date();
    const ukDateString = now.toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
    const ukDate = new Date(ukDateString + 'T12:00:00');
    const isSunday = ukDate.getDay() === 0;
    
    return {
      scheduleData: isSunday ? sundaySchedule : weekdaySchedule,
      title: isSunday ? "Sunday's Schedule" : "Today's Schedule"
    };
  }, []);

  const schedule = useMemo<ScheduleItem[]>(() => {
    const itemsWithStatus = scheduleData.map((item, index) => {
      const itemTime = parseInt(item.time.replace(':', ''), 10);
      const nextIndex = (index + 1) % scheduleData.length;
      const nextItemTime = parseInt(scheduleData[nextIndex].time.replace(':', ''), 10);
      
      let isOngoing = false;
      
      if (item.id === '17') { // Temple Closed
        isOngoing = currentTime >= 2130 || currentTime < 430;
      } else {
        if (nextIndex === 0) {
          isOngoing = currentTime >= itemTime && currentTime < 2130;
        } else {
          isOngoing = currentTime >= itemTime && currentTime < nextItemTime;
        }
      }
      
      return {
        ...item,
        isOngoing,
        isUpcoming: false,
      };
    });

    const ongoingIndex = itemsWithStatus.findIndex(item => item.isOngoing);
    
    if (ongoingIndex !== -1) {
      const upcomingIndex = (ongoingIndex + 1) % itemsWithStatus.length;
      itemsWithStatus[upcomingIndex].isUpcoming = true;
    } else {
      for (let i = 0; i < itemsWithStatus.length; i++) {
        const itemTime = parseInt(itemsWithStatus[i].time.replace(':', ''), 10);
        if (itemTime > currentTime || (currentTime >= 2130 && itemTime < 430)) {
          itemsWithStatus[i].isUpcoming = true;
          break;
        }
      }
    }

    return itemsWithStatus;
  }, [currentTime, scheduleData]);

  const getTypeColor = useCallback((type: ScheduleItem['type']) => {
    const colorMap = {
      program: '#34C759',
      darshan: '#FF9500',
      class: '#007AFF',
      prasadam: '#FF3B30',
      closed: '#8E8E93',
    };
    return colorMap[type];
  }, []);

  const getCardStyle = useCallback((item: ScheduleItem) => {
    if (item.isOngoing) {
      return [styles.scheduleCard, styles.liveCard];
    }
    if (item.isUpcoming) {
      return [styles.scheduleCard, styles.upcomingCard];
    }
    return styles.scheduleCard;
  }, []);

  // ✅ FIXED: Proportional margins that look balanced with card spacing
  const getCardMarginStyle = useCallback((index: number, totalLength: number) => {
    if (index === 0) {
      // First card: balanced side margin + consistent spacing
      return { 
        marginLeft: MARGINS.side,
        marginRight: MARGINS.between
      };
    } else if (index === totalLength - 1) {
      // Last card: no additional margins (handled by ScrollView padding)
      return {};
    } else {
      // Middle cards: only right margin for consistent spacing
      return { 
        marginRight: MARGINS.between
      };
    }
  }, []);

const scrollToLiveCard = useCallback((animated: boolean = true) => {
  const liveCardIndex = schedule.findIndex(item => item.isOngoing);
  const upcomingCardIndex = schedule.findIndex(item => item.isUpcoming);
  const targetIndex = liveCardIndex !== -1 ? liveCardIndex : upcomingCardIndex;
  
  if (targetIndex !== -1 && scrollViewRef.current) {
    let scrollPosition;
    
    if (targetIndex === 0) {
      scrollPosition = 0;
    } else {
      // ✅ Use your existing margin system for consistency
      const COMFORTABLE_LEFT_MARGIN = MARGINS.side; // Or MARGINS.between
      const cardPosition = MARGINS.side + (targetIndex * (CARD_WIDTH + MARGINS.between));
      scrollPosition = Math.max(0, cardPosition - COMFORTABLE_LEFT_MARGIN);
    }
    
    isAutoScrollingRef.current = true;
    
    scrollViewRef.current.scrollTo({
      x: scrollPosition,
      animated,
    });
    
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, animated ? 500 : 0);
  }
}, [schedule]);

  const handleScrollEnd = useCallback(() => {
    if (isAutoScrollingRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      scrollToLiveCard(true);
    }, AUTO_SCROLL_DELAY);
  }, [scrollToLiveCard]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToLiveCard(true);
    }, INITIAL_SCROLL_DELAY);

    return () => {
      clearTimeout(timer);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollToLiveCard]);

  const renderScheduleCard = useCallback((item: ScheduleItem, index: number) => (
    <View 
      key={item.id} 
      style={[
        getCardStyle(item),
        getCardMarginStyle(index, schedule.length)
      ]}
    >
      <LivePulseIndicator isLive={!!item.isOngoing} />

      {item.isUpcoming && !item.isOngoing && (
        <View style={styles.upcomingBadge}>
          <Text style={styles.upcomingBadgeText}>NEXT</Text>
        </View>
      )}

      <View style={[styles.cardTypePill, { backgroundColor: getTypeColor(item.type) }]}>
        <Text style={styles.cardTypePillText}>{item.type}</Text>
      </View>

      <Text style={[
        styles.scheduleCardTitle,
        { color: item.isOngoing ? '#000000' : '#8E8E93' }
      ]}>
        {item.title}
      </Text>

      <View style={styles.scheduleCardTimeContainer}>
        <Clock size={14} color="#8E8E93" />
        <Text style={styles.scheduleCardTimeText}>{item.time}</Text>
      </View>
    </View>
  ), [getCardStyle, getTypeColor, getCardMarginStyle, schedule.length]);

  return (
    <View>
      <View style={styles.headerContainer}>
        <Calendar size={20} color="#FFFFFF" />
        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingRight: MARGINS.side } // ✅ FIXED: Right padding to match centering
        ]}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      >
        {schedule.map(renderScheduleCard)}
      </ScrollView>
    </View>
  );
};