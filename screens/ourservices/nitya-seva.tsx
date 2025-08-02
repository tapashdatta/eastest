import React from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Text, HeadlineText, TitleText, BodyText, CaptionText } from '@/components/Text';
import { ArrowLeft, Heart, Clock, Users, CircleCheck as CheckCircle, Gift } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ServiceScreenStyles as styles } from '@/styles/ServicesStyles';

export default function NityaSevaScreen({ onBack }: { onBack?: () => void }) {
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
          source={{ uri: 'https://images.pexels.com/photos/8636707/pexels-photo-8636707.jpeg' }}
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
            <Text style={styles.categoryText}>Service</Text>
          </View>
          <HeadlineText style={styles.heroTitle}>Nitya Seva</HeadlineText>
          <BodyText style={styles.heroSubtitle}>
            Daily service programs for spiritual growth and devotion
          </BodyText>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Heart size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Services</CaptionText>
            <TitleText style={styles.statValue}>15+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Users size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Volunteers</CaptionText>
            <TitleText style={styles.statValue}>100+</TitleText>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color={Colors.primary} />
            <CaptionText style={styles.statLabel}>Daily</CaptionText>
            <TitleText style={styles.statValue}>6 Hours</TitleText>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>About Nitya Seva</TitleText>
          <BodyText style={styles.sectionText}>
            Nitya Seva means "daily service" and represents the various ways devotees can serve the temple and the deities. These services range from deity worship and temple maintenance to cooking prasadam and assisting with programs. Each service is an opportunity for spiritual growth and devotional practice.
          </BodyText>
        </View>

        {/* Service Categories */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Service Opportunities</TitleText>
          <View style={styles.gridRowWrap}>
            <View style={styles.cardHalf}>
              <Heart size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Deity Worship</TitleText>
              <BodyText style={styles.cardDescription}>
                Assist with daily deity care, dressing, and offerings
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Gift size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Prasadam Service</TitleText>
              <BodyText style={styles.cardDescription}>
                Help prepare and distribute sanctified food
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Users size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Guest Services</TitleText>
              <BodyText style={styles.cardDescription}>
                Welcome and assist temple visitors
              </BodyText>
            </View>
            <View style={styles.cardHalf}>
              <Clock size={24} color={Colors.primary} />
              <TitleText style={styles.cardTitleSmall}>Temple Maintenance</TitleText>
              <BodyText style={styles.cardDescription}>
                Keep the temple clean and well-maintained
              </BodyText>
            </View>
          </View>
        </View>

        {/* Benefits of Service */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Benefits of Seva</TitleText>
          <View style={styles.list}>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Develop humility and devotion</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Purify the heart through service</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Connect with the temple community</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Learn practical spiritual skills</BodyText>
            </View>
            <View style={styles.listItem}>
              <CheckCircle size={20} color={Colors.success} />
              <BodyText style={styles.listItemText}>Receive spiritual guidance</BodyText>
            </View>
          </View>
        </View>

        {/* Service Schedule */}
        <View style={styles.section}>
          <TitleText style={styles.sectionTitle}>Daily Service Schedule</TitleText>
          <View style={styles.list}>
            <View style={styles.card}>
              <TitleText style={styles.scheduleDayPrimary}>4:00 AM - 6:00 AM</TitleText>
              <BodyText style={styles.scheduleTimeSecondary}>Morning Deity Care</BodyText>
              <CaptionText style={styles.scheduleDescription}>
                Deity dressing, altar decoration, and mangal arati preparation
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.scheduleDayPrimary}>6:00 AM - 8:00 AM</TitleText>
              <BodyText style={styles.scheduleTimeSecondary}>Breakfast Preparation</BodyText>
              <CaptionText style={styles.scheduleDescription}>
                Cooking and offering morning prasadam
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.scheduleDayPrimary}>11:00 AM - 2:00 PM</TitleText>
              <BodyText style={styles.scheduleTimeSecondary}>Lunch Service</BodyText>
              <CaptionText style={styles.scheduleDescription}>
                Preparing and serving the main meal of the day
              </CaptionText>
            </View>
            <View style={styles.card}>
              <TitleText style={styles.scheduleDayPrimary}>6:00 PM - 8:00 PM</TitleText>
              <BodyText style={styles.scheduleTimeSecondary}>Evening Programs</BodyText>
              <CaptionText style={styles.scheduleDescription}>
                Assisting with classes, arati, and evening activities
              </CaptionText>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <TitleText style={styles.ctaTitle}>Join Nitya Seva</TitleText>
          <BodyText style={styles.ctaText}>
            Serve the divine and grow spiritually through daily temple service
          </BodyText>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Start Serving</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing for Tab Bar */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}