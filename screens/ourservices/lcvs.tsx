import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { ArrowLeft, Users, BookOpen, Heart, Clock, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceScreenStyles as styles } from '@/styles/ServicesStyles';

export default function LCVSScreen({ onBack }: { onBack?: () => void }) {
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
          source={{ uri: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/12/lcvs5_desktop-2.jpg' }}
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
            <Text style={styles.categoryText}>Education</Text>
          </View>
          <HeadlineText style={styles.heroTitle}>LCVS</HeadlineText>
          <BodyText style={styles.heroSubtitle}>
            London Centre for Vedic Studies - Deepening spiritual understanding
          </BodyText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <BookOpen size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Courses</CaptionText>
            <TitleText style={styles.statValue}>12+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Students</CaptionText>
            <TitleText style={styles.statValue}>200+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Duration</CaptionText>
            <TitleText style={styles.statValue}>6 Months</TitleText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>About LCVS</TitleText>
          <BodyText style={styles.sectionText}>
            The London Centre for Vedic Studies (LCVS) is a comprehensive educational program designed to provide systematic study of Vedic philosophy, culture, and spiritual practices. Our courses offer deep insights into ancient wisdom traditions while making them relevant to modern life.
          </BodyText>
        </View>

        {/* Course Categories */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Course Categories</TitleText>
          <View style={styles.grid}>
            <View style={styles.card}>
              <BookOpen size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitle}>Philosophy</TitleText>
              <BodyText style={styles.cardDescriptionMedium}>
                Study of Bhagavad Gita, Srimad Bhagavatam, and other sacred texts
              </BodyText>
            </View>
            <View style={styles.card}>
              <Heart size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitle}>Devotional Practices</TitleText>
              <BodyText style={styles.cardDescriptionMedium}>
                Learn the art of meditation, kirtan, and spiritual disciplines
              </BodyText>
            </View>
            <View style={styles.card}>
              <Users size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitle}>Community Service</TitleText>
              <BodyText style={styles.cardDescriptionMedium}>
                Practical application of spiritual principles in daily life
              </BodyText>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>What You'll Gain</TitleText>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <View style={styles.iconContainer}>
                <Star size={16} color={Colors.primary} />
              </View>
              <BodyText style={styles.listItemText}>Deep understanding of Vedic philosophy</BodyText>
            </View>
            <View style={styles.listItem}>
              <View style={styles.iconContainer}>
                <Star size={16} color={Colors.primary} />
              </View>
              <BodyText style={styles.listItemText}>Practical spiritual tools for daily life</BodyText>
            </View>
            <View style={styles.listItem}>
              <View style={styles.iconContainer}>
                <Star size={16} color={Colors.primary} />
              </View>
              <BodyText style={styles.listItemText}>Connection with like-minded community</BodyText>
            </View>
            <View style={styles.listItem}>
              <View style={styles.iconContainer}>
                <Star size={16} color={Colors.primary} />
              </View>
              <BodyText style={styles.listItemText}>Certificate of completion</BodyText>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Class Schedule</TitleText>
          <View style={styles.card}>
            <View style={styles.scheduleItem}>
              <TitleText style={styles.scheduleDay}>Saturdays</TitleText>
              <BodyText style={styles.scheduleTime}>10:00 AM - 12:00 PM</BodyText>
              <CaptionText style={styles.scheduleLocation}>Main Hall</CaptionText>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.scheduleItem}>
              <TitleText style={styles.scheduleDay}>Sundays</TitleText>
              <BodyText style={styles.scheduleTime}>2:00 PM - 4:00 PM</BodyText>
              <CaptionText style={styles.scheduleLocation}>Study Room</CaptionText>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TitleText style={styles.ctaTitle}>Join LCVS Today</TitleText>
          <BodyText style={styles.ctaText}>
            Begin your journey of spiritual learning and personal transformation
          </BodyText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Enroll Now</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}