import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { ArrowLeft, BookOpen, Users, Truck, CircleCheck as CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceScreenStyles as styles } from '@/styles/ServicesStyles';

export default function BookDistributionScreen({ onBack }: { onBack?: () => void }) {
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
          source={{ uri: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/10/IMG_4088.jpg' }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
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
            <Text style={styles.categoryText}>Literature</Text>
          </View>
          <HeadlineText style={styles.heroTitle}>Book Distribution</HeadlineText>
          <BodyText style={styles.heroSubtitle}>
            Sharing spiritual wisdom through sacred literature
          </BodyText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <BookOpen size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Books</CaptionText>
            <TitleText style={styles.statValue}>100+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Volunteers</CaptionText>
            <TitleText style={styles.statValue}>25+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Truck size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Distributed</CaptionText>
            <TitleText style={styles.statValue}>10K+</TitleText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>About Book Distribution</TitleText>
          <BodyText style={styles.sectionText}>
            Book distribution is one of the most important services at ISKCON London. We share the timeless wisdom of Vedic literature with people from all walks of life. Our volunteers distribute books on the streets, at events, and through our temple bookstore, spreading spiritual knowledge and consciousness.
          </BodyText>
        </View>

        {/* Available Books */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Popular Books</TitleText>
          <View style={styles.gridRowWrap}>
            <View style={styles.cardHalf}>
              <BookOpen size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Bhagavad Gita As It Is</TitleText>
              <BodyText style={styles.cardDescription}>
                The complete guide to spiritual realization
              </BodyText>
              <CaptionText style={styles.cardPrice}>£15.00</CaptionText>
            </View>
            <View style={styles.cardHalf}>
              <BookOpen size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Srimad Bhagavatam</TitleText>
              <BodyText style={styles.cardDescription}>
                The beautiful story of Krishna's pastimes
              </BodyText>
              <CaptionText style={styles.cardPrice}>£20.00</CaptionText>
            </View>
            <View style={styles.cardHalf}>
              <BookOpen size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Krishna Book</TitleText>
              <BodyText style={styles.cardDescription}>
                The supreme personality of Godhead
              </BodyText>
              <CaptionText style={styles.cardPrice}>£12.00</CaptionText>
            </View>
            <View style={styles.cardHalf}>
              <BookOpen size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Science of Self-Realization</TitleText>
              <BodyText style={styles.cardDescription}>
                Practical spiritual wisdom for modern life
              </BodyText>
              <CaptionText style={styles.cardPrice}>£10.00</CaptionText>
            </View>
          </View>
        </View>

        {/* How to Get Involved */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>How to Get Involved</TitleText>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Join our weekly book distribution team</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Sponsor books for distribution</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Help with bookstore operations</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Organize book distribution events</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Share books with friends and family</BodyText>
            </View>
          </View>
        </View>

        {/* Distribution Schedule */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Distribution Schedule</TitleText>
          <View style={styles.card}>
            <View style={styles.scheduleItem}>
              <TitleText style={styles.scheduleDay}>Saturdays</TitleText>
              <BodyText style={styles.scheduleTime}>10:00 AM - 4:00 PM</BodyText>
              <CaptionText style={styles.scheduleLocation}>Oxford Street & Covent Garden</CaptionText>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.scheduleItem}>
              <TitleText style={styles.scheduleDay}>Sundays</TitleText>
              <BodyText style={styles.scheduleTime}>12:00 PM - 6:00 PM</BodyText>
              <CaptionText style={styles.scheduleLocation}>Hyde Park & Camden Market</CaptionText>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TitleText style={styles.ctaTitle}>Join Book Distribution</TitleText>
          <BodyText style={styles.ctaText}>
            Help us share spiritual wisdom with the world through sacred literature
          </BodyText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Become a Volunteer</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}