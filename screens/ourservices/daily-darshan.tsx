import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  PanResponder,
  Animated,
  FlatList,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import {
  Text,
  HeadlineText,
  TitleText,
  BodyText,
  CaptionText,
} from "@/components/Text";
import {
  ArrowLeft,
  Camera,
  Clock,
  Heart,
  Share,
  Eye,
  Sun,
  Moon,
  Image as ImageIcon,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "@/styles/DailyDarshanStyles";

const { width, height } = Dimensions.get('screen');
const THUMB_SIZE = 80;

interface DrivePhoto {
  id: string;
  name: string;
  thumbnailUrl: string;
  fullUrl: string;
  createdTime: string;
}

export default function DailyDarshanScreen({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<"schedule" | "gallery">("schedule");
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<DrivePhoto | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [infoExpanded, setInfoExpanded] = useState(false);

  // Gallery navigation refs
  const maxRef = useRef<FlatList>(null);
  const thumbRef = useRef<FlatList>(null);

  // Environment variables
  const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  const FOLDER_ID = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_FOLDER_ID;
  const [apiError, setApiError] = useState(false);

  // Empty static photos array - no fallback images
  const STATIC_PHOTOS: DrivePhoto[] = [];

  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  // Helper function to create proper Google Drive URLs
  const createDriveUrls = (fileId: string) => {
    return {
      thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w400-h400-c`,
      fullUrl: `https://lh3.googleusercontent.com/d/${fileId}=w1200-h1200`,
      fallbackThumbnail: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`,
      fallbackFull: `https://drive.google.com/uc?export=view&id=${fileId}`,
    };
  };

  // Helper function to format filename for display
  const formatFileName = (filename: string) => {
    // Remove common prefixes like "Copy of "
    let cleanName = filename.replace(/^(Copy of |copy of )/i, '');
    
    // Remove file extensions
    cleanName = cleanName.replace(/\.(jpg|jpeg|png|gif|webp|avif)$/i, '');
    
    // Replace underscores and hyphens with spaces
    cleanName = cleanName.replace(/[_-]/g, ' ');
    
    // Capitalize first letter of each word
    cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase());
    
    // If still too long, truncate intelligently
    if (cleanName.length > 30) {
      const words = cleanName.split(' ');
      if (words.length > 3) {
        cleanName = words.slice(0, 3).join(' ') + '...';
      } else if (cleanName.length > 35) {
        cleanName = cleanName.substring(0, 32) + '...';
      }
    }
    
    return cleanName || 'Darshan Photo';
  };

  // Fetch photos from Google Drive API
  const fetchPhotos = async () => {
    setLoading(true);
    setApiError(false);

    if (GOOGLE_API_KEY && FOLDER_ID) {
      try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}' in parents and mimeType contains 'image/'&key=${GOOGLE_API_KEY}&fields=files(id,name,createdTime,thumbnailLink,webViewLink)&orderBy=createdTime desc&pageSize=20`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();

          if (data.files && data.files.length > 0) {
            const drivePhotos: DrivePhoto[] = data.files.map((file: any) => {
              const urls = createDriveUrls(file.id);
              
              return {
                id: file.id,
                name: file.name || "Darshan Photo",
                thumbnailUrl: urls.thumbnailUrl,
                fullUrl: urls.fullUrl,
                createdTime: file.createdTime || new Date().toISOString(),
              };
            });

            setPhotos(drivePhotos);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        // API failed
      }
    }

    // No photos available
    setApiError(true);
    setPhotos([]);
    setLoading(false);
  };

  // Gallery navigation function
  const scrollToIndex = (index: number) => {
    if (index === selectedPhotoIndex) {
      return;
    }
    
    maxRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    if (index * (THUMB_SIZE + 10) - THUMB_SIZE / 2 > width / 2) {
      thumbRef?.current?.scrollToOffset({
        offset: index * (THUMB_SIZE + 10) - width / 2 + THUMB_SIZE / 2,
        animated: true,
      });
    } else {
      thumbRef?.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }

    setSelectedPhotoIndex(index);
    setSelectedPhoto(photos[index]);
  };

  // Navigation functions for modal
  const goToNextPhoto = () => {
    if (selectedPhotoIndex < photos.length - 1) {
      const nextIndex = selectedPhotoIndex + 1;
      const nextPhoto = photos[nextIndex];
      setSelectedPhotoIndex(nextIndex);
      setSelectedPhoto(nextPhoto);
      // Only show loading if image hasn't been loaded before
      setImageLoading(!loadedImages.has(nextPhoto.fullUrl));
    }
  };

  const goToPreviousPhoto = () => {
    if (selectedPhotoIndex > 0) {
      const prevIndex = selectedPhotoIndex - 1;
      const prevPhoto = photos[prevIndex];
      setSelectedPhotoIndex(prevIndex);
      setSelectedPhoto(prevPhoto);
      // Only show loading if image hasn't been loaded before
      setImageLoading(!loadedImages.has(prevPhoto.fullUrl));
    }
  };

  // Handle image load success
  const handleImageLoad = (imageUrl: string) => {
    setImageLoading(false);
    setLoadedImages(prev => new Set([...prev, imageUrl]));
  };

  // Handle image load start
  const handleImageLoadStart = (imageUrl: string) => {
    // Only show loading spinner if image hasn't been loaded before
    if (!loadedImages.has(imageUrl)) {
      setImageLoading(true);
    }
  };

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderGrant: () => {
      slideAnim.extractOffset();
    },
    onPanResponderMove: (evt, gestureState) => {
      slideAnim.setValue(gestureState.dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      slideAnim.flattenOffset();
      
      if (gestureState.dx > 50) {
        // Swipe right - go to previous photo
        goToPreviousPhoto();
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else if (gestureState.dx < -50) {
        // Swipe left - go to next photo
        goToNextPhoto();
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else {
        // Snap back to center
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  // Load photos when gallery tab is selected
  useEffect(() => {
    if (activeTab === "gallery" && photos.length === 0 && !loading) {
      fetchPhotos();
    }
  }, [activeTab]);

  // Reset slide animation when modal opens and clear loaded images when photos change
  useEffect(() => {
    if (showModal) {
      slideAnim.setValue(0);
      setInfoExpanded(false); // Reset info panel when modal opens
    }
  }, [showModal]);

  // Clear loaded images cache when photos array changes
  useEffect(() => {
    setLoadedImages(new Set());
  }, [photos]);

  const renderTabButton = (
    tab: "schedule" | "gallery",
    label: string,
    icon: React.ReactNode,
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Photo Grid with error state
  const PhotoGrid = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <BodyText style={styles.loadingText}>
            Loading darshan photos...
          </BodyText>
        </View>
      );
    }

    if (apiError || photos.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ImageIcon size={48} color={Colors.textSecondary} />
          <TitleText style={styles.errorTitle}>
            Sorry, images are not available
          </TitleText>
          <BodyText style={styles.errorText}>
            Photos could not be loaded at this time. Please try again later.
          </BodyText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPhotos}>
            <RefreshCw size={16} color={Colors.primary} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.photoScrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoItem}
              onPress={() => {
                const photoIndex = photos.findIndex(p => p.id === photo.id);
                setSelectedPhotoIndex(photoIndex);
                setSelectedPhoto(photo);
                setShowModal(true);
                // Only show loading if image hasn't been loaded before
                setImageLoading(!loadedImages.has(photo.fullUrl));
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: photo.thumbnailUrl }}
                style={styles.photoImage}
                resizeMode="cover"
              />
              <View style={styles.photoOverlay}>
                <CaptionText style={styles.photoDate}>
                  {new Date(photo.createdTime).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </CaptionText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Gallery Content
  const renderGalleryContent = () => {
    return (
      <View style={styles.galleryContainer}>
        <View style={styles.galleryHeader}>
          <View style={styles.headerInfo}>
            <BodyText style={styles.galleryTitle}>Darshan Photos</BodyText>
            <CaptionText style={styles.gallerySubtitle}>
              {loading
                ? "Loading..."
                : apiError || photos.length === 0
                ? "Images unavailable"
                : `${photos.length} photo${photos.length !== 1 ? "s" : ""} available`}
            </CaptionText>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchPhotos}>
            <RefreshCw size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <PhotoGrid />
      </View>
    );
  };

  // Schedule Content
  const renderScheduleContent = () => (
    <>
      <View style={styles.section}>
        <TitleText style={styles.sectionTitle}>About Darshan</TitleText>
        <BodyText style={styles.sectionText}>
          Darshan means "sacred viewing" and refers to the opportunity to see
          and be seen by the deities. Our temple offers five daily darshan
          times, each with its own special significance and atmosphere.
        </BodyText>
      </View>

      <View style={styles.section}>
        <TitleText style={styles.sectionTitle}>Daily Darshan Times</TitleText>
        <View style={styles.scheduleList}>
          {[
            {
              name: "Mangal Arati",
              time: "4:30 AM - 5:00 AM",
              desc: "Morning awakening of the deities with prayers and offerings",
              icon: Sun,
              color: Colors.primary,
            },
            {
              name: "Dhupa Arati",
              time: "7:00 AM - 7:30 AM",
              desc: "Morning incense offering with melodious kirtan",
              icon: Sun,
              color: Colors.warning,
            },
            {
              name: "Raj Bhoga Arati",
              time: "12:30 PM - 1:00 PM",
              desc: "Midday offering of sumptuous feast to the deities",
              icon: Sun,
              color: Colors.warning,
            },
            {
              name: "Dhupa Arati",
              time: "6:00 PM - 6:30 PM",
              desc: "Evening incense offering with community participation",
              icon: Sun,
              color: Colors.secondary,
            },
            {
              name: "Sandhya Arati",
              time: "7:30 PM - 8:00 PM",
              desc: "Evening prayers and final darshan of the day",
              icon: Moon,
              color: Colors.primary,
            },
          ].map((darshan, index) => (
            <View key={index} style={styles.darshanCard}>
              <View style={styles.timeIcon}>
                <darshan.icon size={20} color={darshan.color} />
              </View>
              <View style={styles.darshanInfo}>
                <TitleText style={styles.darshanName}>{darshan.name}</TitleText>
                <BodyText style={styles.darshanTime}>{darshan.time}</BodyText>
                <CaptionText style={styles.darshanDescription}>
                  {darshan.desc}
                </CaptionText>
              </View>
              <TouchableOpacity style={styles.liveButton}>
                <Camera size={16} color={Colors.textLight} />
                <CaptionText style={styles.liveText}>Live</CaptionText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.ctaSection}>
        <TitleText style={styles.ctaTitle}>Experience Divine Darshan</TitleText>
        <BodyText style={styles.ctaText}>
          Join us for these sacred moments of connection with the divine
        </BodyText>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Watch Live Stream</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: "https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/01/donate.webp",
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.7)"]}
            style={styles.heroOverlay}
          />

          <View style={styles.headerControls}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Worship</Text>
            </View>
            <HeadlineText style={styles.heroTitle}>Daily Darshan</HeadlineText>
            <BodyText style={styles.heroSubtitle}>
              Sacred viewing of the deities throughout the day
            </BodyText>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Eye size={20} color={Colors.primary} />
              <CaptionText style={styles.statLabel}>Daily</CaptionText>
              <TitleText style={styles.statValue}>5 Times</TitleText>
            </View>
            
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => setActiveTab("schedule")}
              activeOpacity={0.7}
            >
              <Clock size={20} color={activeTab === "schedule" ? Colors.primary : Colors.textSecondary} />
              <CaptionText style={[styles.statLabel, activeTab === "schedule" && { color: Colors.primary }]}>
                Schedule
              </CaptionText>
              <TitleText style={[styles.statValue, activeTab === "schedule" && { color: Colors.primary }]}>
                Interactive
              </TitleText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statItem}
              onPress={() => setActiveTab("gallery")}
              activeOpacity={0.7}
            >
              <Camera size={20} color={activeTab === "gallery" ? Colors.primary : Colors.textSecondary} />
              <CaptionText style={[styles.statLabel, activeTab === "gallery" && { color: Colors.primary }]}>
                Darshan
              </CaptionText>
              <TitleText style={[styles.statValue, activeTab === "gallery" && { color: Colors.primary }]}>
                Gallery
              </TitleText>
            </TouchableOpacity>
          </View>

          {activeTab === "schedule"
            ? renderScheduleContent()
            : renderGalleryContent()}

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
      
      {/* Gallery Modal - Index.jsx Style */}
      {showModal && selectedPhoto && (
        <Modal
          visible={showModal}
          transparent={false}
          animationType="fade"
          onRequestClose={() => {
            setShowModal(false);
            setSelectedPhoto(null);
          }}
          statusBarTranslucent={true}
        >
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* Close Button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 50,
                right: 20,
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 20,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setShowModal(false);
                setSelectedPhoto(null);
              }}
            >
              <Text style={{ color: Colors.textLight, fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>

            {/* Photo Counter */}
            <View style={{
              position: 'absolute',
              top: 50,
              left: 20,
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 15,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}>
              <Text style={{ color: Colors.textLight, fontSize: 14 }}>
                {selectedPhotoIndex + 1} of {photos.length}
              </Text>
            </View>

            {/* Main Image FlatList */}
            <FlatList
              ref={maxRef}
              data={photos}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={selectedPhotoIndex}
              getItemLayout={(data, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              onMomentumScrollEnd={(ev) => {
                const newIndex = Math.floor(ev.nativeEvent.contentOffset.x / width);
                scrollToIndex(newIndex);
              }}
              renderItem={({ item }) => {
                return (
                  <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
                    <Image
                      source={{ uri: item.fullUrl }}
                      style={{ width: width - 40, height: height - 200 }}
                      resizeMode="contain"
                      onLoadStart={() => handleImageLoadStart(item.fullUrl)}
                      onLoad={() => handleImageLoad(item.fullUrl)}
                      onError={() => setImageLoading(false)}
                    />
                  </View>
                );
              }}
            />

            {/* Loading Indicator */}
            {imageLoading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ color: Colors.textLight, marginTop: 10, fontSize: 16 }}>
                  Loading image...
                </Text>
              </View>
            )}

            {/* Thumbnail FlatList */}
            <FlatList
              ref={thumbRef}
              data={photos}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              horizontal
              style={{ 
                position: 'absolute', 
                bottom: 140,
                height: THUMB_SIZE + 20,
              }}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      scrollToIndex(index);
                    }}
                    style={{ marginRight: 10 }}
                  >
                    <Image
                      source={{ uri: item.thumbnailUrl }}
                      style={{
                        width: THUMB_SIZE,
                        height: THUMB_SIZE,
                        borderRadius: 12,
                        borderWidth: 3,
                        borderColor: selectedPhotoIndex === index ? Colors.primary : 'rgba(255,255,255,0.3)',
                      }}
                      resizeMode="cover"
                    />
                    {/* Image Date Overlay */}
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                    }}>
                      <Text 
                        numberOfLines={1}
                        style={{
                          color: Colors.textLight,
                          fontSize: 8,
                          textAlign: 'center',
                        }}
                      >
                        {new Date(item.createdTime).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            {/* Image Info Panel */}
            <View style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              backgroundColor: 'rgba(0,0,0,0.8)',
              borderRadius: 12,
              padding: 16,
            }}>
              <Text style={{
                color: Colors.textLight,
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 4,
              }}>
                {formatFileName(selectedPhoto.name)}
              </Text>
              <Text style={{
                color: Colors.textSecondary,
                fontSize: 14,
              }}>
                {new Date(selectedPhoto.createdTime).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}