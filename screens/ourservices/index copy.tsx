import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  TouchableOpacity, 
  ImageBackground, 
  Dimensions, 
  StatusBar,
  Pressable,
  FlatList,
  Modal,
  PanResponder,
  Vibration,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  History, 
  Users, 
  BookOpen, 
  Calendar, 
  Camera, 
  Truck, 
  Heart, 
  Archive, 
  MessageCircle,
  ArrowRight,
  Home
} from 'lucide-react-native';
import { HomeIcon } from '@/assets/icons';

// Import all your service screens
import HistoryScreen from '@/screens/ourservices/history';
import LCVSScreen from '@/screens/ourservices/lcvs';
import VISAScreen from '@/screens/ourservices/visa';
import KrishnaClubScreen from '@/screens/ourservices/krishna-club';
import DailyDarshanScreen from '@/screens/ourservices/daily-darshan';
import BookDistributionScreen from '@/screens/ourservices/book-distribution';
import NityaSevaScreen from '@/screens/ourservices/nitya-seva';
import RussianCommunityScreen from '@/screens/ourservices/russian-community';

const { width, height } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(Animated.FlatList);

const _indicatorSize = 6;
const _spacing = 14;
const _buttonSize = 64;

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  component: React.ComponentType<{ onBack?: () => void }>;
  bgColor: [string, string];
  image: string;
  featured?: boolean;
  category: string;
}

// Simple working Service Item Component
const ServiceItem = ({ item, index }: { 
  item: ServiceItem; 
  index: number;
}) => {
  const IconComponent = item.icon;
  
  return (
    <ImageBackground
      source={{ uri: item.image }}
      style={styles.slideBackground}
      imageStyle={styles.slideImage}
      onError={() => console.warn('Failed to load image:', item.image)}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
        style={styles.slideOverlay}
      >
        {/* Subtle icon in background */}
        <View style={styles.backgroundIcon}>
          <IconComponent size={70} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

// Service Details Component with Animation
const ServiceDetails = ({ scrollY, item, index }: { 
  scrollY: Animated.SharedValue<number>; 
  item: ServiceItem; 
  index: number; 
}) => {
  const stylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [index - 1, index, index + 1],
        [0, 1, 0],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [index - 1, index, index + 1],
            [30, 0, -30],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <View
      style={{
        position: 'absolute',
        width: '100%',
        zIndex: 1000 - index,
        overflow: 'hidden',
      }}
    >
      <Animated.View style={stylez}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <HeadlineText style={styles.serviceTitle}>{item.title}</HeadlineText>
        <BodyText style={styles.serviceDescription}>{item.description}</BodyText>
        <CaptionText style={styles.serviceExtra}>
          Tap to explore this service
        </CaptionText>
      </Animated.View>
    </View>
  );
};

// Details Wrapper Component
const DetailsWrapper = ({ scrollY, data }: { 
  scrollY: Animated.SharedValue<number>; 
  data: ServiceItem[]; 
}) => {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: _spacing * 2 + _buttonSize + 100,
        left: _spacing * 2,
        right: _spacing * 2,
        zIndex: 100,
        paddingHorizontal: _spacing,
        paddingVertical: 20,
      }}
      pointerEvents="none"
    >
      {data.map((item, index) => (
        <ServiceDetails 
          key={item.id}
          item={item} 
          index={index} 
          scrollY={scrollY} 
        />
      ))}
    </View>
  );
};

// Pagination Dot Component
const PaginationDot = ({ scrollY, index }: { 
  scrollY: Animated.SharedValue<number>; 
  index: number; 
}) => {
  const stylez = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [index - 1, index, index + 1],
        [_indicatorSize, _indicatorSize * 6, _indicatorSize],
        Extrapolate.CLAMP
      ),
      opacity: interpolate(
        scrollY.value,
        [index - 1, index, index + 1],
        [0.6, 1, 0.6],
        Extrapolate.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: _indicatorSize,
          height: _indicatorSize,
          borderRadius: _indicatorSize / 2,
          backgroundColor: 'white',
          marginBottom: _indicatorSize / 2,
        },
        stylez,
      ]}
    />
  );
};

// Drag Preview Window
const DragPreviewWindow = ({ 
  services, 
  currentIndex, 
  isVisible 
}: { 
  services: ServiceItem[]; 
  currentIndex: number; 
  isVisible: boolean;
}) => {
  if (!isVisible) return null;

  const twoBackService = currentIndex > 1 ? services[currentIndex - 2] : null;
  const previousService = currentIndex > 0 ? services[currentIndex - 1] : null;
  const currentService = services[currentIndex];
  const nextService = currentIndex < services.length - 1 ? services[currentIndex + 1] : null;
  const twoAheadService = currentIndex < services.length - 2 ? services[currentIndex + 2] : null;

  return (
    <Animated.View 
      style={[
        styles.dragPreviewWindow,
        { opacity: isVisible ? 1 : 0 }
      ]}
    >
      {twoBackService && (
        <Text style={styles.previewTextFar}>
          {twoBackService.title}
        </Text>
      )}
      
      {previousService && (
        <Text style={styles.previewTextPrevious}>
          {previousService.title}
        </Text>
      )}
      
      <Text style={styles.previewTextCurrent}>
        {currentService.title}
      </Text>
      
      {nextService && (
        <Text style={styles.previewTextNext}>
          {nextService.title}
        </Text>
      )}
      
      {twoAheadService && (
        <Text style={styles.previewTextFar}>
          {twoAheadService.title}
        </Text>
      )}
    </Animated.View>
  );
};

// Pagination Component
const Pagination = ({ 
  scrollY, 
  data, 
  onShowQuickSelection,
  onDragToIndex,
  onDragStart,
  onDragEnd 
}: { 
  scrollY: Animated.SharedValue<number>; 
  data: ServiceItem[]; 
  onShowQuickSelection: () => void;
  onDragToIndex: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const lastTickIndex = useRef<number>(-1);

  const triggerTick = () => {
    try {
      Vibration.vibrate([0, 10]);
    } catch (error) {
      // Silent fail
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    
    onPanResponderGrant: (evt) => {
      const touchY = evt.nativeEvent.locationY;
      const dotSpacing = _indicatorSize + _indicatorSize / 2;
      const startOffset = 20;
      const index = Math.max(0, Math.min(data.length - 1, 
        Math.floor((touchY - startOffset) / dotSpacing)
      ));
      setDraggedIndex(index);
      lastTickIndex.current = index;
      triggerTick();
      onDragStart(index);
    },

    onPanResponderMove: (evt, gestureState) => {
      const touchY = evt.nativeEvent.locationY;
      const dotSpacing = _indicatorSize + _indicatorSize / 2;
      const startOffset = 20;
      const newIndex = Math.max(0, Math.min(data.length - 1, 
        Math.floor((touchY - startOffset) / dotSpacing)
      ));
      
      if (newIndex !== draggedIndex && newIndex !== lastTickIndex.current) {
        setDraggedIndex(newIndex);
        lastTickIndex.current = newIndex;
        triggerTick();
        onDragToIndex(newIndex);
      }
    },

    onPanResponderRelease: () => {
      setDraggedIndex(null);
      lastTickIndex.current = -1;
      onDragEnd();
    },
  });

  return (
    <View 
      style={styles.pagination}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        onPress={onShowQuickSelection}
        style={styles.paginationTouchArea}
        activeOpacity={1}
      >
        {data.map((_, index) => (
          <PaginationDot key={index} index={index} scrollY={scrollY} />
        ))}
      </TouchableOpacity>
    </View>
  );
};

// Quick Selection List Component
const QuickSelectionList = ({ 
  services, 
  onSelectService, 
  currentIndex 
}: { 
  services: ServiceItem[]; 
  onSelectService: (index: number) => void;
  currentIndex: number;
}) => {
  return (
    <View style={styles.quickSelectionContainer}>
      <View style={styles.quickSelectionList}>
        {services.map((service, index) => {
          const isActive = index === currentIndex;
          
          return (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.quickSelectionItem,
                isActive && styles.quickSelectionItemActive
              ]}
              onPress={() => onSelectService(index)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.quickSelectionTitle,
                isActive && styles.quickSelectionTitleActive
              ]}>
                {service.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function ServicesScreen() {
  const isFocused = useIsFocused();
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showQuickSelection, setShowQuickSelection] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewIndex, setDragPreviewIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Simple animation values
  const opacity = useSharedValue(0);
  const scrollY = useSharedValue(0);
  
  const services: ServiceItem[] = [
    // ... services array stays the same
        {
      id: 'daily-darshan',
      title: 'Daily Darshan',
      description: 'Live deity darshan times and sacred viewing opportunities',
      icon: Camera,
      component: DailyDarshanScreen,
      bgColor: ['#4facfe', '#00f2fe'],
      image: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/01/donate.webp',
      category: 'Worship',
    },
    {
      id: 'lcvs',
      title: 'LCVS',
      description: 'London Centre for Vedic Studies - Systematic spiritual education',
      icon: BookOpen,
      component: LCVSScreen,
      bgColor: ['#667eea', '#764ba2'],
      image: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/12/lcvs5_desktop-2.jpg',
      featured: true,
      category: 'Education',
    },
    {
      id: 'visa',
      title: 'V.I.S.A Program',
      description: 'Vedic Introduction for Spiritual Aspirants - Perfect for newcomers',
      icon: Users,
      component: VISAScreen,
      bgColor: ['#f093fb', '#f5576c'],
      image: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/06/visa1.webp',
      featured: true,
      category: 'Newcomers',
    },
    {
      id: 'krishna-club',
      title: 'Krishna Club',
      description: 'Youth programs and community fellowship for spiritual growth',
      icon: Heart,
      component: KrishnaClubScreen,
      bgColor: ['#43e97b', '#38f9d7'],
      image: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/08/KK2-1-jpeg.avif',
      category: 'Youth',
    },
    {
      id: 'book-distribution',
      title: 'Book Distribution',
      description: 'Sharing spiritual wisdom through sacred literature',
      icon: Truck,
      component: BookDistributionScreen,
      bgColor: ['#ffecd2', '#fcb69f'],
      image: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/10/IMG_4088.jpg',
      category: 'Outreach',
    },
    {
      id: 'nitya-seva',
      title: 'Nitya Seva',
      description: 'Daily service programs for spiritual development',
      icon: Heart,
      component: NityaSevaScreen,
      bgColor: ['#ffd89b', '#19547b'],
      image: 'https://images.pexels.com/photos/8636707/pexels-photo-8636707.jpeg',
      category: 'Service',
    },
    {
      id: 'russian-community',
      title: 'Russian Community',
      description: 'Services and programs in Russian language',
      icon: MessageCircle,
      component: RussianCommunityScreen,
      bgColor: ['#ff9a9e', '#fecfef'],
      image: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/12/russianspeakers.jpg',
      category: 'Community',
    },
   {
      id: 'history',
      title: 'Temple History',
      description: 'Rich heritage and spiritual journey of ISKCON London',
      icon: History,
      component: HistoryScreen,
      bgColor: ['#a8edea', '#fed6e3'],
      image: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/07/large.ShrilaBhaktiVedantaSwamiPrabhupada-LondonBuryPlace-MorningWalks88.jpg.d8a29c2001571f13ef148de754512388-jpg.avif',
      category: 'Heritage',
    },
  ];

  // Simple focus animation
  useEffect(() => {
    if (isFocused) {
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isFocused]);

  // Reset to main screen when focused
  useEffect(() => {
    if (isFocused) {
      setActiveService(null);
    }
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: (ev) => {
      scrollY.value = ev.contentOffset.y / height;
    },
    onMomentumEnd: (ev) => {
      scrollY.value = Math.round(ev.contentOffset.y / height);
    },
  });

  const handleServicePress = (serviceId: string) => {
    setActiveService(serviceId);
  };

  const handleBackPress = () => {
    setActiveService(null);
  };

  const handleHomePress = () => {
    router.push('/');
  };

  const handleShowQuickSelection = () => {
    setShowQuickSelection(true);
  };

  const handleDragStart = (index: number) => {
    setIsDragging(true);
    setDragPreviewIndex(index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragToIndex = (index: number) => {
    setDragPreviewIndex(index);
    flatListRef.current?.scrollToIndex({ 
      index, 
      animated: true
    });
    scrollY.value = withTiming(index, { duration: 200 });
  };

  const handleQuickServiceSelect = (index: number) => {
    flatListRef.current?.scrollToIndex({ 
      index, 
      animated: true 
    });
    scrollY.value = withTiming(index, { duration: 300 });
    setShowQuickSelection(false);
  };

  // Render active service screen as overlay instead of replacement
  const renderActiveService = () => {
    if (!activeService) return null;
    
    const service = services.find(s => s.id === activeService);
    if (service) {
      const ServiceComponent = service.component;
      return (
        <View style={styles.serviceOverlay}>
          <ServiceComponent onBack={handleBackPress} />
        </View>
      );
    }
    return null;
  };

  // Main render - always show carousel, overlay service when active
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <StatusBar hidden />

      {/* Home Button */}
      <TouchableOpacity onPress={handleHomePress} style={styles.homeButton}>
        <HomeIcon size={24} color="white" />
      </TouchableOpacity>

      {/* Main Carousel - Always rendered */}
      <AnimatedFlatList
        ref={flatListRef}
        data={services}
        renderItem={({ item, index }: any) => 
          <ServiceItem 
            item={item as ServiceItem} 
            index={index} 
          />
        }
        onScroll={onScroll}
        scrollEventThrottle={16}
        pagingEnabled
        decelerationRate="fast"
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: any) => (item as ServiceItem).id}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          console.warn('Scroll to index failed:', info);
        }}
      />

      {/* Pagination */}
      <Pagination 
        scrollY={scrollY} 
        data={services} 
        onShowQuickSelection={handleShowQuickSelection}
        onDragToIndex={handleDragToIndex}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      {/* Drag Preview Window */}
      <DragPreviewWindow
        services={services}
        currentIndex={dragPreviewIndex}
        isVisible={isDragging}
      />

      {/* Service Details Overlay */}
      <DetailsWrapper scrollY={scrollY} data={services} />

      {/* Action Button */}
      <Pressable
        onPress={() => {
          const currentIndex = Math.round(scrollY.value);
          const currentService = services[currentIndex];
          if (currentService) {
            handleServicePress(currentService.id);
          }
        }}
        style={styles.actionButton}
      >
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.actionButtonGradient}
        >
          <ArrowRight size={_buttonSize / 2} color="white" />
        </LinearGradient>
      </Pressable>

      {/* Quick Selection Modal */}
      <Modal
        visible={showQuickSelection}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuickSelection(false)}
      >
        <Pressable 
          style={styles.quickSelectionModal}
          onPress={() => setShowQuickSelection(false)}
        >
          <QuickSelectionList
            services={services}
            onSelectService={handleQuickServiceSelect}
            currentIndex={Math.round(scrollY.value)}
          />
        </Pressable>
      </Modal>

      {/* Service Screen Overlay */}
      {renderActiveService()}
    </Animated.View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    backgroundColor: '#000',
  },
  serviceOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000',
  },
  slideBackground: {
    width,
    height,
    backgroundColor: '#000',
  },
  slideImage: {
    flex: 1,
    resizeMode: 'cover' as const,
    opacity: 0.8,
  },
  slideOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  backgroundIcon: {
    position: 'absolute' as const,
    bottom: height * 0.45,
    left: width * 0.1,
    opacity: 0.5,
  },
  homeButton: {
    position: 'absolute' as const,
    top: 60,
    left: _spacing * 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
  },
  pagination: {
    position: 'absolute' as const,
    left: _spacing,
    top: height * 0.4,
    zIndex: 100,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  paginationTouchArea: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  dragPreviewWindow: {
    position: 'absolute' as const,
    left: _spacing + 70,
    top: height * 0.4,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    minWidth: 140,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  previewTextFar: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 9,
    fontWeight: '300' as const,
    marginBottom: 3,
    textAlign: 'center' as const,
  },
  previewTextPrevious: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '400' as const,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  previewTextCurrent: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  previewTextNext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '400' as const,
    marginBottom: 3,
    textAlign: 'center' as const,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start' as const,
    marginBottom: 12,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryText: {
    ...Typography.caption,
    color: 'white',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
    fontSize: 10,
  },
  serviceTitle: {
    color: '#fff',
    fontWeight: '900' as const,
    fontSize: 28,
    marginBottom: _spacing / 2,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  serviceDescription: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: _spacing,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  serviceExtra: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '400' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButton: {
    position: 'absolute' as const,
    bottom: _spacing * 2,
    right: _spacing * 2,
    width: _buttonSize,
    height: _buttonSize,
    borderRadius: _buttonSize / 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonGradient: {
    width: _buttonSize,
    height: _buttonSize,
    borderRadius: _buttonSize / 2,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  quickSelectionModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
  },
  quickSelectionContainer: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    maxHeight: height * 0.6,
    width: width * 0.5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickSelectionList: {
    gap: 4,
  },
  quickSelectionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center' as const,
  },
  quickSelectionItemActive: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.4)',
  },
  quickSelectionTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
  },
  quickSelectionTitleActive: {
    color: 'white',
    fontWeight: '600' as const,
  },
};