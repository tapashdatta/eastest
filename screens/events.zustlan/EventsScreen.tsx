// screens/events/EventsScreen.tsx - Simplified to prevent infinite loops
import React, { useCallback, useMemo, useRef } from 'react';
import { View, FlatList, TouchableOpacity, TextInput, RefreshControl, Image, Platform, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows } from '@/constants/CommonStyles';
import { Text, HeadlineText, TitleText, BodyText, LabelText, CaptionText } from '@/components/Text';
import { useEventData, useEventCart, useEventSearch } from '@/stores/eventStore';
import { CiviEvent } from '@/types/event';
import { formatDate } from '@/utils/dateUtils';
import Logger from '@/utils/Logger';
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Search,
  Filter,
  ArrowLeft,
  ShoppingCart,
  Star,
  Ticket,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader
} from 'lucide-react-native';
import FloatingEventCart from '@/screens/events/FloatingEventCart';

const { width } = Dimensions.get('window');

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: any };
};

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// ================================
// OPTIMIZED EVENT CARD COMPONENT
// ================================

interface EventCardProps {
  event: CiviEvent;
  onPress: () => void;
  index: number;
}

const EventCard: React.FC<EventCardProps> = React.memo(({ event, onPress, index }) => {
  const getEventStatus = useCallback((startDate: string, endDate?: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (now < start) return 'upcoming';
    if (end && now > end) return 'completed';
    return 'ongoing';
  }, []);

  const statusConfig = useMemo(() => {
    const status = getEventStatus(event.start_date, event.end_date);
    
    const configs = {
      upcoming: { color: Colors.success, icon: Calendar, text: 'Upcoming' },
      ongoing: { color: Colors.warning, icon: TrendingUp, text: 'Ongoing' },
      completed: { color: Colors.textMuted, icon: CheckCircle2, text: 'Completed' }
    };
    
    return configs[status as keyof typeof configs];
  }, [event.start_date, event.end_date, getEventStatus]);

  const isFull = useMemo(() => 
    event.max_participants && event.current_participants && 
    event.current_participants >= event.max_participants,
    [event.max_participants, event.current_participants]
  );

  const imageUrl = useMemo(() => 
    event.image || `https://picsum.photos/400/250?random=${event.id}`,
    [event.image, event.id]
  );

  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity 
      style={[
        styles.eventCard,
        index % 2 === 0 ? styles.eventCardLeft : styles.eventCardRight
      ]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={styles.eventImageContainer}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.eventImage}
          defaultSource={require('@/assets/images/icon.png')}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
          style={styles.eventImageOverlay}
        />
        
        {/* Status Badge */}
        <BlurView intensity={20} style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <View style={[styles.statusBadgeInner, { backgroundColor: statusConfig.color }]}>
            <StatusIcon size={12} color={Colors.textLight} />
            <CaptionText style={styles.statusText}>{statusConfig.text}</CaptionText>
          </View>
        </BlurView>
        
        {/* Full Badge */}
        {isFull && (
          <BlurView intensity={20} style={[styles.fullBadge, { backgroundColor: Colors.error + '20' }]}>
            <View style={[styles.statusBadgeInner, { backgroundColor: Colors.error }]}>
              <AlertCircle size={12} color={Colors.textLight} />
              <CaptionText style={styles.fullText}>FULL</CaptionText>
            </View>
          </BlurView>
        )}

        {/* Event Type Badge */}
        <View style={[styles.eventTypeBadge, { backgroundColor: Colors.primary + '90' }]}>
          <Star size={10} color={Colors.textLight} />
          <CaptionText style={styles.eventTypeText}>{event.event_type_name}</CaptionText>
        </View>
      </View>
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <TitleText style={styles.eventTitle} numberOfLines={2}>{event.title}</TitleText>
          
          {event.is_monetary && (
            <View style={styles.priceIndicator}>
              <Ticket size={14} color={Colors.primary} />
              <CaptionText style={styles.priceText}>Paid</CaptionText>
            </View>
          )}
        </View>
        
        {event.summary && (
          <BodyText style={styles.eventSummary} numberOfLines={2}>
            {event.summary}
          </BodyText>
        )}
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailItem}>
            <Calendar size={14} color={Colors.textSecondary} />
            <LabelText style={styles.eventDetailText}>
              {formatDate(new Date(event.start_date), { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </LabelText>
          </View>
          
          <View style={styles.eventDetailItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <LabelText style={styles.eventDetailText}>
              {new Date(event.start_date).toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </LabelText>
          </View>
          
          {event.address && (
            <View style={styles.eventDetailItem}>
              <MapPin size={14} color={Colors.textSecondary} />
              <LabelText style={styles.eventDetailText} numberOfLines={1}>
                {event.address.city || 'London'}
              </LabelText>
            </View>
          )}
        </View>
        
        {event.max_participants && (
          <View style={styles.participantInfo}>
            <Users size={14} color={Colors.textSecondary} />
            <LabelText style={styles.participantText}>
              {event.current_participants || 0} / {event.max_participants} registered
            </LabelText>
            <View style={styles.participantProgress}>
              <View style={[
                styles.participantProgressFill,
                { width: `${Math.min(100, ((event.current_participants || 0) / event.max_participants) * 100)}%` }
              ]} />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
          <LabelText style={styles.viewDetailsText}>View Details</LabelText>
          <ChevronRight size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

EventCard.displayName = 'EventCard';

// ================================
// MAIN EVENTS SCREEN COMPONENT (SIMPLIFIED)
// ================================

const EventsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // Store hooks (these are now stable)
  const { events, eventsLoading, eventsError, loadEvents, refreshEvents } = useEventData();
  const { cart } = useEventCart();
  const { searchQuery, selectedFilter, setSearchQuery, setSelectedFilter } = useEventSearch();
  
  const [refreshing, setRefreshing] = React.useState(false);
  const loadingRef = useRef(false);

  // Load events on mount (FIXED)
  React.useEffect(() => {
    const initializeEvents = async () => {
      if (loadingRef.current) return;
      
      try {
        loadingRef.current = true;
        console.log('🎯 Initializing events (one time only)...');
        await loadEvents();
      } catch (error) {
        console.error('Failed to initialize events:', error);
      } finally {
        loadingRef.current = false;
      }
    };

    // Only load if we don't have events
    if (events.length === 0 && !eventsLoading) {
      initializeEvents();
    }
  }, []); // Empty dependency array - this only runs once

  // Memoized filtered events
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    // Apply client-side filtering
    if (selectedFilter === 'upcoming') {
      filtered = filtered.filter(event => 
        new Date(event.start_date) > new Date()
      );
    } else if (selectedFilter === 'ongoing') {
      filtered = filtered.filter(event => {
        const now = new Date();
        const start = new Date(event.start_date);
        const end = event.end_date ? new Date(event.end_date) : null;
        return start <= now && (!end || end >= now);
      });
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.summary?.toLowerCase().includes(query) ||
        event.event_type_name.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [events, selectedFilter, searchQuery]);

  // Stable navigation handlers
  const handleEventPress = useCallback((event: CiviEvent) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('EventCart');
  }, [navigation]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Search and filter handlers
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, [setSearchQuery]);

  const handleFilterChange = useCallback((filter: 'all' | 'upcoming' | 'ongoing') => {
    setSelectedFilter(filter);
  }, [setSelectedFilter]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshEvents();
    } finally {
      setRefreshing(false);
    }
  }, [refreshEvents]);

  // Stable render functions
  const renderEventCard = useCallback(({ item, index }: { item: CiviEvent; index: number }) => (
    <EventCard 
      event={item} 
      onPress={() => handleEventPress(item)}
      index={index}
    />
  ), [handleEventPress]);

  const keyExtractor = useCallback((item: CiviEvent) => item.id.toString(), []);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Calendar size={64} color={Colors.textMuted} />
      <TitleText style={styles.emptyStateTitle}>No events found</TitleText>
      <BodyText style={styles.emptyStateMessage}>
        {searchQuery 
          ? 'Try adjusting your search or filter settings'
          : 'Check back later for upcoming events'
        }
      </BodyText>
      <TouchableOpacity style={styles.emptyStateButton} onPress={handleRefresh}>
        <LabelText style={styles.emptyStateButtonText}>Refresh</LabelText>
      </TouchableOpacity>
    </View>
  ), [searchQuery, handleRefresh]);

  const renderErrorState = useCallback(() => (
    <View style={styles.errorState}>
      <AlertCircle size={64} color={Colors.error} />
      <TitleText style={styles.errorTitle}>Unable to load events</TitleText>
      <BodyText style={styles.errorMessage}>{eventsError}</BodyText>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <LabelText style={styles.retryButtonText}>Retry</LabelText>
      </TouchableOpacity>
    </View>
  ), [eventsError, handleRefresh]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <HeadlineText style={styles.headerTitle}>Events</HeadlineText>
          <CaptionText style={styles.headerSubtitle}>
            Discover upcoming events
          </CaptionText>
        </View>
        <TouchableOpacity onPress={handleCartPress} style={styles.headerButton}>
          <ShoppingCart size={24} color={Colors.text} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <CaptionText style={styles.cartBadgeText}>{cart.length}</CaptionText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor={Colors.textMuted}
          />
        </View>
        
        <View style={styles.filterContainer}>
          {(['upcoming', 'ongoing', 'all'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <LabelText style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.filterButtonTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </LabelText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Events List */}
      {eventsError ? (
        renderErrorState()
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={6}
          updateCellsBatchingPeriod={100}
          windowSize={10}
          numColumns={2}
          columnWrapperStyle={styles.row}
          getItemLayout={(data, index) => ({
            length: 320, // Approximate item height
            offset: 320 * Math.floor(index / 2),
            index,
          })}
        />
      )}
      
      <FloatingEventCart cart={cart} onPress={handleCartPress} />
    </View>
  );
};

// ================================
// STYLES (same as before)
// ================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    ...Typography.headlineMedium,
    color: Colors.text,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  
  // Search and filter styles
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.md,
    paddingVertical: Spacing.lg,
    fontSize: 16,
    color: Colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.textLight,
  },
  
  // List styles
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  
  // Event card styles (same as before - keeping them compact)
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    width: (width - Spacing.xl) / 2,
    ...Shadows.md,
  },
  eventCardLeft: {
    marginRight: Spacing.xs,
  },
  eventCardRight: {
    marginLeft: Spacing.xs,
  },
  eventImageContainer: {
    position: 'relative',
    height: 140,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  statusBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  statusBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  fullBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  fullText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  eventTypeBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  eventTypeText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  eventContent: {
    padding: Spacing.lg,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 20,
    marginRight: Spacing.md,
  },
  priceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  eventSummary: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.md,
  },
  eventDetails: {
    marginBottom: Spacing.md,
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  eventDetailText: {
    color: Colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  participantText: {
    color: Colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  participantProgress: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  participantProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary + '10',
  },
  viewDetailsText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Empty and error states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.xxxl,
  },
  emptyStateTitle: {
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptyStateMessage: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyStateButtonText: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.xxxl,
  },
  errorTitle: {
    color: Colors.error,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: Colors.textLight,
    fontWeight: '600',
  },
});

export default EventsScreen;