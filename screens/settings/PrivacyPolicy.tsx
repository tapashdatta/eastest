import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

interface PrivacyPolicyScreenProps {
  navigation?: any;
  onAccept?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.collapsibleContainer}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.collapsibleTitle}>{title}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
      {expanded && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
};

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
  navigation,
  onAccept,
  onDecline,
  showActions = false,
}) => {
  const openEmail = async () => {
    const email = 'privacy@iskcon.london';
    const subject = 'Privacy Policy Inquiry';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open email client');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open email client');
    }
  };

  const openPhone = async () => {
    const phoneNumber = 'tel:+442074373662';
    try {
      const canOpen = await Linking.canOpenURL(phoneNumber);
      if (canOpen) {
        await Linking.openURL(phoneNumber);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to make phone call');
    }
  };

  const openICO = async () => {
    const url = 'https://ico.org.uk';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open website');
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline();
    } else {
      Alert.alert(
        'Privacy Policy Required',
        'You must accept the privacy policy to use this app.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Privacy Policy</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Introduction */}
          <View style={styles.introSection}>
              {/* Logo */}
                <View style={{ alignItems: 'center',  marginBottom: 10 }}>
                      <Image
                        source={require('../../assets/images/GoldLogo.png')}
                        style={{ width: 80, height: 80 }}
                        resizeMode="contain"
                      />
                </View>
            <Text style={styles.title}>ISKCON London</Text>
            <Text style={styles.subtitle}>International society for Krishna Consciousness London</Text>
            <Text style={styles.subtitle}>Privacy Policy</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>Effective Date: 01 August 2025</Text>
              <Text style={styles.dateText}>Version: 4.0</Text>
            </View>
          </View>

          {/* Quick Contact */}
          <View style={styles.contactQuick}>
            <Text style={styles.sectionTitle}>Quick Contact</Text>
            <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
              <Ionicons name="mail" size={20} color="#007AFF" />
              <Text style={styles.contactText}>privacy@iskcon.london</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactItem} onPress={openPhone}>
              <Ionicons name="call" size={20} color="#007AFF" />
              <Text style={styles.contactText}>+44 (0)20 7437 3662</Text>
            </TouchableOpacity>
          </View>

          {/* About This Policy */}
          <CollapsibleSection title="1. About This Policy" defaultExpanded={true}>
            <Text style={styles.bodyText}>
              ISKCON London (International society for Krishna Consciousness London) is registered with the Information Commissioner's Office: ZA437679, operates this mobile application. 
              We understand the importance of your personal data and are committed to protecting your privacy in accordance 
              with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and other applicable 
              data protection legislation.
            </Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressTitle}>Our Contact Details:</Text>
              <Text style={styles.addressText}>ISKCON London</Text>
              <Text style={styles.addressText}>Radha-Krishna Temple</Text>
              <Text style={styles.addressText}>9-10 Soho Street</Text>
              <Text style={styles.addressText}>London W1D 3DL, United Kingdom</Text>
            </View>
          </CollapsibleSection>

          {/* Information We Collect */}
          <CollapsibleSection title="2. Information We Collect">
            <Text style={styles.subSectionTitle}>2.1 Information You Provide Directly</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>• Account Information: Name, email address, phone number</Text>
              <Text style={styles.bulletPoint}>• Profile Information: Date of birth, gender, spiritual interests</Text>
              <Text style={styles.bulletPoint}>• Communication Data: Messages, feedback, support requests</Text>
              <Text style={styles.bulletPoint}>• Donation Information: Payment details for charitable contributions</Text>
              <Text style={styles.bulletPoint}>• Event Registration: Details for courses, events, and activities</Text>
            </View>

            <Text style={styles.subSectionTitle}>2.2 Information Collected Automatically</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>• Device Information: Device type, operating system, unique device identifiers</Text>
              <Text style={styles.bulletPoint}>• Usage Data: App features used, time spent in app, crash reports</Text>
              <Text style={styles.bulletPoint}>• Location Data: Approximate location (with your permission) for local temple services</Text>
              <Text style={styles.bulletPoint}>• Technical Data: IP address, app version, error logs, performance data</Text>
            </View>

            <Text style={styles.subSectionTitle}>2.3 Third-Party Information</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>• Information from social media platforms (if you choose to connect accounts)</Text>
              <Text style={styles.bulletPoint}>• Public information from event registration platforms</Text>
            </View>
          </CollapsibleSection>

          {/* How We Use Your Information */}
          <CollapsibleSection title="3. How We Use Your Information">
            <Text style={styles.bodyText}>
              We process your personal data based on the following legal grounds under UK GDPR:
            </Text>

            <Text style={styles.subSectionTitle}>3.1 Legitimate Interest</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>• Providing and improving our app services</Text>
              <Text style={styles.bulletPoint}>• Analyzing usage patterns to enhance user experience</Text>
              <Text style={styles.bulletPoint}>• Preventing fraud and ensuring app security</Text>
              <Text style={styles.bulletPoint}>• Managing our relationship with users</Text>
            </View>

            <Text style={styles.subSectionTitle}>3.2 Consent</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>• Sending marketing communications (where you've opted in)</Text>
              <Text style={styles.bulletPoint}>• Using location services</Text>
              <Text style={styles.bulletPoint}>• Processing optional profile information</Text>
              <Text style={styles.bulletPoint}>• Using cookies and similar technologies</Text>
            </View>

            <Text style={styles.subSectionTitle}>3.3 Religious/Charitable Purposes</Text>
            <Text style={styles.bodyText}>
              Under Article 9(2)(d) UK GDPR, we process information related to religious activities and 
              charitable donations.
            </Text>
          </CollapsibleSection>

          {/* App Permissions */}
          <CollapsibleSection title="7. App Permissions">
            <Text style={styles.subSectionTitle}>Required Permissions</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>• Internet Access: To connect to our services</Text>
              <Text style={styles.bulletPoint}>• Network State: To check connectivity</Text>
            </View>

            <Text style={styles.subSectionTitle}>Optional Permissions (with your consent)</Text>
            <View style={styles.bulletContainer}>
              <Text style={styles.bulletPoint}>• Location: To find nearby temples and events</Text>
              <Text style={styles.bulletPoint}>• Camera: To capture and share spiritual moments</Text>
              <Text style={styles.bulletPoint}>• Photo Library: To select images for profile or sharing</Text>
              <Text style={styles.bulletPoint}>• Push Notifications: To receive updates about events and spiritual content</Text>
              <Text style={styles.bulletPoint}>• Microphone: For audio content or voice messages (if applicable)</Text>
            </View>

            <View style={styles.noteContainer}>
              <Ionicons name="information-circle" size={16} color="#007AFF" />
              <Text style={styles.noteText}>
                You can manage these permissions through your device settings at any time.
              </Text>
            </View>
          </CollapsibleSection>

          {/* Your Rights */}
          <CollapsibleSection title="6. Your Rights Under UK GDPR">
            <Text style={styles.bodyText}>
              You have the following rights regarding your personal data:
            </Text>
            <View style={styles.rightsContainer}>
              <View style={styles.rightItem}>
                <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.rightText}>Right to Information</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="eye-outline" size={20} color="#007AFF" />
                <Text style={styles.rightText}>Right of Access</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="create-outline" size={20} color="#007AFF" />
                <Text style={styles.rightText}>Right to Rectification</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="trash-outline" size={20} color="#007AFF" />
                <Text style={styles.rightText}>Right to Erasure</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="pause-outline" size={20} color="#007AFF" />
                <Text style={styles.rightText}>Right to Restrict Processing</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="download-outline" size={20} color="#007AFF" />
                <Text style={styles.rightText}>Right to Data Portability</Text>
              </View>
              <View style={styles.rightItem}>
                <Ionicons name="close-circle-outline" size={20} color="#007AFF" />
                <Text style={styles.rightText}>Right to Object</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={openEmail}>
              <Text style={styles.contactButtonText}>Exercise Your Rights</Text>
            </TouchableOpacity>
          </CollapsibleSection>

          {/* Data Security */}
          <CollapsibleSection title="8. Data Security">
            <Text style={styles.bodyText}>
              We implement appropriate technical and organizational measures to protect your data:
            </Text>
            <View style={styles.securityContainer}>
              <View style={styles.securityItem}>
                <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Encryption in transit and at rest</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="people" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Limited access on need-to-know basis</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="sync" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Regular security updates and monitoring</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="cloud" size={20} color="#4CAF50" />
                <Text style={styles.securityText}>Secure hosting with certified providers</Text>
              </View>
            </View>
          </CollapsibleSection>

          {/* Contact and Complaints */}
          <CollapsibleSection title="13. Contact Us & Complaints">
            <Text style={styles.bodyText}>
              For any questions about this privacy policy or our data practices:
            </Text>
            
            <View style={styles.fullContactContainer}>
              <TouchableOpacity style={styles.fullContactItem} onPress={openEmail}>
                <Ionicons name="mail" size={24} color="#007AFF" />
                <View>
                  <Text style={styles.fullContactTitle}>Email</Text>
                  <Text style={styles.fullContactDetail}>privacy@iskcon.london</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.fullContactItem} onPress={openPhone}>
                <Ionicons name="call" size={24} color="#007AFF" />
                <View>
                  <Text style={styles.fullContactTitle}>Phone</Text>
                  <Text style={styles.fullContactDetail}>+44 (0)20 7437 3662</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.fullContactItem}>
                <Ionicons name="location" size={24} color="#007AFF" />
                <View>
                  <Text style={styles.fullContactTitle}>Address</Text>
                  <Text style={styles.fullContactDetail}>
                    Data Protection Manager{'\n'}
                    ISKCON London{'\n'}
                    Radha-Krishna Temple{'\n'}
                    9-10 Soho Street{'\n'}
                    London W1D 3DL, United Kingdom
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.icoContainer}>
              <Text style={styles.icoTitle}>Lodge a Complaint:</Text>
              <TouchableOpacity style={styles.icoButton} onPress={openICO}>
                <Text style={styles.icoButtonText}>UK Information Commissioner's Office (ICO)</Text>
                <Ionicons name="open-outline" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.responseTimeContainer}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.responseTimeText}>
                Response Time: We aim to respond to all privacy inquiries within 30 days.
              </Text>
            </View>
          </CollapsibleSection>

          {/* ICO Registration */}
          <View style={styles.registrationContainer}>
            <Text style={styles.registrationText}>
              ICO Registration Number: ZA437679
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This policy was created specifically for the ISKCON London mobile application and is designed to 
              comply with UK GDPR, Apple App Store, and Google Play Store requirements.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {showActions && (
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>Accept & Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  contactQuick: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 12,
  },
  collapsibleContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  collapsibleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  collapsibleContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginBottom: 12,
  },
  bulletContainer: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginBottom: 6,
  },
  addressContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  noteText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
    flex: 1,
  },
  rightsContainer: {
    marginTop: 12,
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  rightText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  contactButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityContainer: {
    marginTop: 12,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 12,
    fontWeight: '500',
  },
  fullContactContainer: {
    marginTop: 16,
  },
  fullContactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 12,
  },
  fullContactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
    marginBottom: 4,
  },
  fullContactDetail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 18,
  },
  icoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff3e0',
    borderRadius: 8,
  },
  icoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  icoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  icoButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  responseTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  responseTimeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  registrationContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 24,
  },
  registrationText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginRight: 8,
  },
  declineButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    marginLeft: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default PrivacyPolicyScreen;