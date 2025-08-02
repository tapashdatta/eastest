import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { ArrowLeft, Calendar, Users, MapPin, Heart, Share } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceScreenStyles as styles } from '@/styles/ServicesStyles';

interface HistoryScreenProps {
  onBack?: () => void;
}

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const handleBackPress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/07/large.ShrilaBhaktiVedantaSwamiPrabhupada-LondonBuryPlace-MorningWalks88.jpg.d8a29c2001571f13ef148de754512388-jpg.avif' }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.heroOverlay}
        />
        
        {/* Header Controls */}
        <View style={styles.headerControls}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Hero Content */}
        <View style={styles.heroContent}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>Heritage</Text>
          </View>
          <HeadlineText style={styles.heroTitle}>Temple History</HeadlineText>
          <BodyText style={styles.heroSubtitle}>
            Discover the rich heritage and spiritual journey of ISKCON London
          </BodyText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Calendar size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Founded</CaptionText>
            <TitleText style={styles.statValue}>1969</TitleText>
          </View>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Community</CaptionText>
            <TitleText style={styles.statValue}>5000+</TitleText>
          </View>
          <View style={styles.statItem}>
            <MapPin size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Location</CaptionText>
            <TitleText style={styles.statValue}>Soho</TitleText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Our Beginning</TitleText>
          <BodyText style={styles.sectionText}>
            ISKCON London was established in 1969 when Srila Prabhupada, the founder-acharya of the International Society for Krishna Consciousness, first arrived in London. The temple has since become a beacon of spiritual light in the heart of the city, serving thousands of devotees and visitors from around the world.
          </BodyText>
        </View>

        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Spiritual Legacy</TitleText>
          <BodyText style={styles.sectionText}>
            For over five decades, our temple has been dedicated to sharing the timeless wisdom of the Vedas and the teachings of Lord Krishna. We have witnessed countless transformations, hosted numerous festivals, and created a spiritual home for people from all walks of life.
          </BodyText>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Key Milestones</TitleText>
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <TitleText style={styles.timelineYear}>1969</TitleText>
                <BodyText style={styles.timelineText}>Temple established in central London</BodyText>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <TitleText style={styles.timelineYear}>1973</TitleText>
                <BodyText style={styles.timelineText}>First Ratha Yatra festival in London</BodyText>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <TitleText style={styles.timelineYear}>1979</TitleText>
                <BodyText style={styles.timelineText}>Moved to current Soho Street location</BodyText>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <TitleText style={styles.timelineYear}>2019</TitleText>
                <BodyText style={styles.timelineText}>Celebrated 50 years of service</BodyText>
              </View>
            </View>
          </View>
        </View>

        {/* Image Gallery */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Through the Years</TitleText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/8636707/pexels-photo-8636707.jpeg' }}
              style={styles.galleryImage}
            />
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg' }}
              style={styles.galleryImage}
            />
            <Image 
              source={{ uri: 'https://images.pexels.com/photos/8636707/pexels-photo-8636707.jpeg' }}
              style={styles.galleryImage}
            />
          </ScrollView>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TitleText style={styles.ctaTitle}>Visit Our Temple</TitleText>
          <BodyText style={styles.ctaText}>
            Experience the spiritual atmosphere and rich history firsthand
          </BodyText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Plan Your Visit</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}