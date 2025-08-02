import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { ArrowLeft, Users, Heart, Clock, MapPin, Star, Share, CircleCheck as CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceScreenStyles as styles } from '@/styles/ServicesStyles';

export default function VISAScreen({ onBack }: { onBack?: () => void }) {
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
          source={{ uri: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/06/visa1.webp' }}
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
            <Text style={styles.categoryText}>Newcomers</Text>
          </View>
          <HeadlineText style={styles.heroTitle}>V.I.S.A Program</HeadlineText>
          <BodyText style={styles.heroSubtitle}>
            Vedic Introduction for Spiritual Aspirants - Your journey begins here
          </BodyText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Participants</CaptionText>
            <TitleText style={styles.statValue}>50+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Duration</CaptionText>
            <TitleText style={styles.statValue}>4 Weeks</TitleText>
          </View>
          <View style={styles.statItem}>
            <MapPin size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Format</CaptionText>
            <TitleText style={styles.statValue}>In-Person</TitleText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Welcome to V.I.S.A</TitleText>
          <BodyText style={styles.sectionText}>
            The V.I.S.A (Vedic Introduction for Spiritual Aspirants) program is specially designed for newcomers to Krishna consciousness. This comprehensive introduction provides a warm, welcoming environment to explore ancient wisdom and spiritual practices.
          </BodyText>
        </View>

        {/* Program Features */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>What's Included</TitleText>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Introduction to Vedic philosophy</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Basic meditation techniques</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Vegetarian cooking classes</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Temple tour and orientation</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Community fellowship</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Personal mentorship</BodyText>
            </View>
          </View>
        </View>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Weekly Schedule</TitleText>
          <View style={styles.grid}>
            <View style={styles.card}>
              <TitleText style={styles.weekTitle}>Week 1</TitleText>
              <BodyText style={styles.weekTopic}>Introduction & Philosophy</BodyText>
              <CaptionText style={styles.weekDescription}>
                Basic concepts of Krishna consciousness and Vedic wisdom
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.weekTitle}>Week 2</TitleText>
              <BodyText style={styles.weekTopic}>Meditation & Mantras</BodyText>
              <CaptionText style={styles.weekDescription}>
                Learn the art of meditation and chanting
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.weekTitle}>Week 3</TitleText>
              <BodyText style={styles.weekTopic}>Lifestyle & Practice</BodyText>
              <CaptionText style={styles.weekDescription}>
                Integrating spiritual practices into daily life
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.weekTitle}>Week 4</TitleText>
              <BodyText style={styles.weekTopic}>Community & Service</BodyText>
              <CaptionText style={styles.weekDescription}>
                Finding your place in the spiritual community
              </CaptionText>
            </View>
          </View>
        </View>

        {/* Testimonials */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>What Participants Say</TitleText>
          <View style={styles.card}>
            <BodyText style={styles.testimonialText}>
              "The V.I.S.A program was the perfect introduction to spiritual life. The mentors were incredibly supportive and the community was so welcoming."
            </BodyText>
            <View style={styles.testimonialAuthor}>
              <TitleText style={styles.authorName}>Sarah M.</TitleText>
              <CaptionText style={styles.authorTitle}>Program Graduate</CaptionText>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TitleText style={styles.ctaTitle}>Start Your Spiritual Journey</TitleText>
          <BodyText style={styles.ctaText}>
            Join our next V.I.S.A program and discover the path to inner peace
          </BodyText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Register Now</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}