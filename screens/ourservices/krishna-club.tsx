import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { ArrowLeft, Users, Calendar, Music, CircleCheck as CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceScreenStyles as styles } from '@/styles/ServicesStyles';

export default function KrishnaClubScreen({ onBack }: { onBack?: () => void }) {
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
          source={{ uri: 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/08/KK2-1-jpeg.avif' }}
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
            <Text style={styles.categoryText}>Youth</Text>
          </View>
          <HeadlineText style={styles.heroTitle}>Krishna Club</HeadlineText>
          <BodyText style={styles.heroSubtitle}>
            Youth and community programs for spiritual growth and fellowship
          </BodyText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Members</CaptionText>
            <TitleText style={styles.statValue}>150+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Calendar size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Events</CaptionText>
            <TitleText style={styles.statValue}>Monthly</TitleText>
          </View>
          <View style={styles.statItem}>
            <Music size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Activities</CaptionText>
            <TitleText style={styles.statValue}>10+</TitleText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>About Krishna Club</TitleText>
          <BodyText style={styles.sectionText}>
            Krishna Club is a vibrant community for young people interested in exploring Krishna consciousness. We provide a supportive environment where youth can learn, grow, and connect with like-minded individuals through various spiritual and cultural activities.
          </BodyText>
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Our Activities</TitleText>
          <View style={styles.gridRowWrap}>
            <View style={styles.cardHalf}>
              <Music size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Kirtan Sessions</TitleText>
              <BodyText style={styles.cardDescription}>
                Weekly devotional singing and music sessions
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Users size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Study Groups</TitleText>
              <BodyText style={styles.cardDescription}>
                Interactive discussions on spiritual topics
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Users size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Service Projects</TitleText>
              <BodyText style={styles.cardDescription}>
                Community service and outreach programs
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Calendar size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Cultural Events</TitleText>
              <BodyText style={styles.cardDescription}>
                Festivals, drama, and cultural celebrations
              </BodyText>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Why Join Krishna Club?</TitleText>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Connect with like-minded youth</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Learn spiritual practices in a fun environment</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Develop leadership skills</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Participate in cultural programs</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Make lifelong friendships</BodyText>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Meeting Schedule</TitleText>
          <View style={styles.card}>
            <View style={styles.scheduleItem}>
              <TitleText style={styles.scheduleDay}>Every Saturday</TitleText>
              <BodyText style={styles.scheduleTime}>6:00 PM - 8:00 PM</BodyText>
              <CaptionText style={styles.scheduleLocation}>Youth Hall</CaptionText>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.scheduleItem}>
              <TitleText style={styles.scheduleDay}>Special Events</TitleText>
              <BodyText style={styles.scheduleTime}>Monthly</BodyText>
              <CaptionText style={styles.scheduleLocation}>Various Locations</CaptionText>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TitleText style={styles.ctaTitle}>Join Krishna Club</TitleText>
          <BodyText style={styles.ctaText}>
            Be part of our vibrant youth community and grow spiritually together
          </BodyText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Join Now</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}