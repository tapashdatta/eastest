// screens/events/EventsComingSoonScreen.tsx - SIMPLIFIED COMING SOON
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius, Layout, Containers, Buttons } from '@/constants/CommonStyles';
import { HeadlineText, TitleText, BodyText, ButtonText } from '@/components/Text';
import { ArrowLeft, Calendar, Bell, ShoppingCart } from 'lucide-react-native';

type EventStackParamList = {
  Events: undefined;
  EventDetails: { eventId: number };
  EventCart: undefined;
  EventPayment: undefined;
  EventSuccess: { result: any };
};

type NavigationProp = NativeStackNavigationProp<EventStackParamList>;

// Decorative Flag Component
const Flag: React.FC<{ color: string; style?: any }> = ({ color, style }) => (
  <View style={[styles.flag, { backgroundColor: color }, style]} />
);

// Bunting Component
const Bunting: React.FC = () => (
  <View style={styles.buntingContainer}>
    <View style={styles.buntingRow}>
      <Flag color={Colors.categoryRed} />
      <Flag color={Colors.categoryBlue} />
      <Flag color={Colors.categoryYellow} />
      <Flag color={Colors.categoryRed} />
      <Flag color={Colors.categoryPurple} />
      <Flag color={Colors.categoryYellow} />
    </View>
    <View style={[styles.buntingRow, styles.buntingRowOffset]}>
      <Flag color={Colors.categoryPurple} />
      <Flag color={Colors.categoryYellow} />
      <Flag color={Colors.categoryBlue} />
      <Flag color={Colors.categoryRed} />
      <Flag color={Colors.categoryTeal} />
      <Flag color={Colors.categoryBlue} />
    </View>
  </View>
);

// Feature Preview Component
const FeaturePreview: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}> = ({ icon, title, description }) => (
  <View style={[Layout.flexRow, styles.featureItem]}>
    <View style={styles.featureIcon}>
      {icon}
    </View>
    <View style={Layout.flex1}>
      <TitleText style={styles.featureTitle}>{title}</TitleText>
      <BodyText style={styles.featureDescription}>{description}</BodyText>
    </View>
  </View>
);

const EventsComingSoonScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleKnowMore = () => {
    // You can replace this with your actual contact/info action
    Linking.openURL('mailto:info@iskcon.london?subject=Events%20Feature%20Inquiry');
  };

  return (
    <View style={Containers.screen}>
      {/* Header */}
      <View style={[Containers.header, Layout.flexRow, Layout.centerVertical]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={Layout.flex1} />
      </View>

      {/* Decorative Bunting */}
      <Bunting />

      {/* Main Content */}
      <View style={[Layout.flex1, Layout.center, styles.content]}>
        {/* Coming Soon Text */}
        <View style={[Layout.centerHorizontal, styles.mainTextContainer]}>
          <HeadlineText style={styles.comingSoonText}>Coming</HeadlineText>
          <HeadlineText style={styles.comingSoonText}>Soon</HeadlineText>
          <BodyText style={styles.subtitle}>
            We're building something amazing for you
          </BodyText>
        </View>

        {/* Feature Preview */}
        <View style={styles.featuresContainer}>
          <TitleText style={styles.featuresTitle}>What's Coming</TitleText>
          
          <FeaturePreview
            icon={<Calendar size={24} color={Colors.primary} />}
            title="Explore Events"
            description="Browse and discover exciting events offered by ISKCON London"
          />
          
          <FeaturePreview
            icon={<ShoppingCart size={24} color={Colors.primary} />}
            title="Multiple Event Registration"
            description="Quick and seamless event registration process with secure payment integration"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[Buttons.primary, styles.primaryButton]}
          onPress={handleKnowMore}
        >
          <Bell size={20} color={Colors.textLight} />
          <ButtonText style={styles.primaryButtonText}>Notify Me</ButtonText>
        </TouchableOpacity>
      </View>
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
  
  // Bunting Styles
  buntingContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxxl,
  },
  buntingRow: {
    ...Layout.flexRow,
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  buntingRowOffset: {
    marginLeft: Spacing.xl,
    marginRight: -Spacing.xl,
  },
  flag: {
    width: 32,
    height: 40,
    transform: [{ rotate: '45deg' }],
    borderRadius: BorderRadius.xs,
  },
  
  // Main Content
  content: {
    paddingHorizontal: Spacing.xxxl,
  },
  mainTextContainer: {
    marginBottom: Spacing.xxxxxl,
  },
  comingSoonText: {
    ...Typography.displayMedium,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '800',
    lineHeight: 48,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 24,
  },
  
  // Features
  featuresContainer: {
    width: '100%',
    gap: Spacing.lg,
  },
  featuresTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  featureItem: {
    ...Layout.centerVertical,
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceSecondary,
    ...Layout.center,
  },
  featureTitle: {
    ...Typography.titleSmall,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Actions
  actionsContainer: {
    padding: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.surface,
  },
  primaryButton: {
    ...Layout.flexRow,
    gap: Spacing.md,
    borderRadius: 50,
  },
  primaryButtonText: {
    ...Typography.buttonText,
    color: Colors.textLight,
  },
});

export default EventsComingSoonScreen;