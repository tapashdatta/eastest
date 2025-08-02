// screens/events/EventsScreen.tsx - SIMPLIFIED VERSION WITH DESIGN SYSTEM
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, TextInput, RefreshControl, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Shadows, Layout, Cards, Inputs, Containers } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, LabelText, CaptionText } from '@/components/Text';
import { useEventCart } from '@/contexts/EventContext';
import { eventAPI } from '@/services/EventAPI';
import { CiviEvent } from '@/types/event';
import { formatDate } from '@/utils/dateUtils';
import { 
  Calendar,
  MapPin,
  Clock,
  Search,
  ArrowLeft,
  ShoppingCart
} from 'lucide-react-native';

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: any };
};

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// Simplified Event Card
const EventCard: React.FC<{ event: CiviEvent; onPress: () => void }> = ({ event, onPress }) => {
  const isUpcoming = new Date(event.start_date) > new Date();
  const isFull = event.max_participants && event.current_participants && 
                 event.current_participants >= event.max_participants;

  return (
    <TouchableOpacity style={[Cards.interactive, styles.card]} onPress={onPress}>
      <Image 
        source={{ uri: event.image || `https://picsum.photos/400/200?random=${event.id}` }} 
        style={styles.cardImage}
      />
      
      <View style={styles.cardContent}>
        <TitleText style={styles.cardTitle} numberOfLines={2}>
          {event.title}
        </TitleText>
        
        <View style={[Layout.flexRow, styles.cardDetails]}>
          <View style={[Layout.flexRow, Layout.centerVertical, styles.detail]}>
            <Calendar size={14} color={Colors.textSecondary} />
            <LabelText style={styles.detailText}>
              {formatDate(new Date(event.start_date), { month: 'short', day: 'numeric' })}
            </LabelText>
          </View>
          
          <View style={[Layout.flexRow, Layout.centerVertical, styles.detail]}>
            <Clock size={14} color={Colors.textSecondary} />
            <LabelText style={styles.detailText}>
              {new Date(event.start_date).toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </LabelText>
          </View>
          
          {event.address?.city && (
            <View style={[Layout.flexRow, Layout.centerVertical, styles.detail]}>
              <MapPin size={14} color={Colors.textSecondary} />
              <LabelText style={styles.detailText}>{event.address.city}</LabelText>
            </View>
          )}
        </View>
        
        <View style={[Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
          <View>
            {event.is_monetary && (
              <CaptionText style={styles.priceText}>Paid Event</CaptionText>
            )}
          </View>
          <View>
            {isFull ? (
              <CaptionText style={styles.fullText}>FULL</CaptionText>
            ) : isUpcoming ? (
              <CaptionText style={styles.upcomingText}>Upcoming</CaptionText>
            ) : (
              <CaptionText style={styles.pastText}>Past</CaptionText>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Simplified Header
const Header: React.FC<{ onBack: () => void; onCart: () => void; cartCount: number }> = ({ 
  onBack, 
  onCart, 
  cartCount 
}) => (
  <View style={[Containers.header, Layout.flexRow, Layout.spaceBetween, Layout.centerVertical]}>
    <TouchableOpacity onPress={onBack} style={styles.headerButton}>
      <ArrowLeft size={24} color={Colors.text} />
    </TouchableOpacity>
    
    <HeadlineText>Events</HeadlineText>
    
    <TouchableOpacity onPress={onCart} style={styles.headerButton}>
      <ShoppingCart size={24} color={Colors.text} />
      {cartCount > 0 && (
        <View style={styles.cartBadge}>
          <CaptionText style={styles.cartBadgeText}>{cartCount}</CaptionText>
        </View>
      )}
    </TouchableOpacity>
  </View>
);

// Simplified Search
const SearchBar: React.FC<{ value: string; onChange: (text: string) => void }> = ({ 
  value, 
  onChange 
}) => (
  <View style={[Layout.flexRow, Layout.centerVertical, Inputs.base, styles.searchContainer]}>
    <Search size={20} color={Colors.textMuted} />
    <TextInput
      style={styles.searchInput}
      placeholder="Search events..."
      value={value}
      onChangeText={onChange}
      placeholderTextColor={Colors.textMuted}
    />
  </View>
);

// Main Component
const EventsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { cart } = useEventCart();
  
  const [events, setEvents] = useState<CiviEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Simplified fetch function
  const fetchEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await eventAPI.getEvents({
        limit: 50,
        search: searchQuery || undefined
      });
      
      if (response.success) {
        setEvents(response.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Simple filtered events
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    return event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           event.summary?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleEventPress = (event: CiviEvent) => {
    navigation.navigate('EventDetails', { eventId: event.id });
  };

  if (loading) {
    return (
      <View style={Containers.screen}>
        <Header 
          onBack={() => navigation.goBack()} 
          onCart={() => navigation.navigate('EventCart')} 
          cartCount={cart.length} 
        />
        <View style={[Layout.flex1, Layout.center]}>
          <BodyText>Loading events...</BodyText>
        </View>
      </View>
    );
  }

  return (
    <View style={Containers.screen}>
      <Header 
        onBack={() => navigation.goBack()} 
        onCart={() => navigation.navigate('EventCart')} 
        cartCount={cart.length} 
      />
      
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      
      <FlatList
        data={filteredEvents}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => handleEventPress(item)} 
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchEvents(true)} />
        }
        ListEmptyComponent={
          <View style={[Layout.flex1, Layout.center]}>
            <BodyText>No events found</BodyText>
          </View>
        }
      />
    </View>
  );
};

// Styles using Design System
const styles = StyleSheet.create({
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surfaceSecondary,
    ...Layout.center,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.round,
    minWidth: 20,
    height: 20,
    ...Layout.center,
    paddingHorizontal: Spacing.xs,
  },
  cartBadgeText: {
    color: Colors.textLight,
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    margin: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
  },
  cardDetails: {
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  detail: {
    gap: Spacing.xs,
  },
  detailText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  priceText: {
    ...Typography.labelSmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  upcomingText: {
    ...Typography.labelSmall,
    color: Colors.success,
    fontWeight: '600',
  },
  fullText: {
    ...Typography.labelSmall,
    color: Colors.error,
    fontWeight: '600',
  },
  pastText: {
    ...Typography.labelSmall,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});

export default EventsScreen;