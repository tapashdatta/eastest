// screens/settings/SettingsScreen.tsx - Enhanced with Clear Cache Feature
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { settingsStyles } from '@/styles/SettingsStyles';
import { Colors } from '@/constants/Colors';
import { useContent } from '@/contexts/ContentContext'; // NEW: Import content context
import DailyQuoteSettings from '@/screens/settings/DailyQuoteSettings';
import GiftAidSettings from '@/screens/settings/GiftAidSettings';
import GDPRSettings from '@/screens/settings/GDPRSettings';
import PrivacyPolicyScreen from '@/screens/settings/PrivacyPolicy';

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [clearingCache, setClearingCache] = useState(false); // NEW: Cache clearing state
  
  // NEW: Access content context for cache operations
  const { clearCache, getCacheInfo } = useContent();
  const cacheInfo = getCacheInfo();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Let child components handle their own data loading
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      // Silent error handling - child components will handle their own errors
    } finally {
      setLoading(false);
    }
  };

  const openPrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const closePrivacyPolicy = () => {
    setShowPrivacyPolicy(false);
  };

  // NEW: Handle cache clearing with user confirmation
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached content and reload fresh data from the server.\n\nContinue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: performClearCache,
        },
      ]
    );
  };

  const performClearCache = async () => {
    try {
      setClearingCache(true);
      
      // Clear content cache (this will trigger fresh data fetch with new image URLs)
      await clearCache();
      
      // Show success feedback
      Alert.alert(
        'Cache Cleared',
        'Cache cleared successfully. Fresh content and images will be loaded automatically.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to clear cache. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setClearingCache(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={settingsStyles.container}>
        <View style={settingsStyles.loadingContainer}>
          <View style={settingsStyles.loadingSpinner}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
          <Text style={settingsStyles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={settingsStyles.container}>
      {/* Modern Header */}
      <View style={settingsStyles.header}>
        <TouchableOpacity 
          style={settingsStyles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={settingsStyles.headerContent}>
          <Text style={settingsStyles.headerTitle}>Settings</Text>
          <Text style={settingsStyles.headerSubtitle}>Customize your experience</Text>
        </View>
      </View>

      <ScrollView 
        style={settingsStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={settingsStyles.scrollContent}
      >
        {/* Daily Quote Settings */}
        <DailyQuoteSettings />

        {/* Gift Aid Settings */}
        <GiftAidSettings />

        {/* GDPR Settings */}
        <GDPRSettings onOpenPrivacyPolicy={openPrivacyPolicy} />

        {/* App Info Section */}
        <View style={settingsStyles.section}>
          <View style={settingsStyles.sectionHeader}>
            <View style={[settingsStyles.sectionIcon, settingsStyles.infoIconBg]}>
              <Feather name="info" size={20} color={Colors.accent} />
            </View>
            <Text style={settingsStyles.sectionTitle}>App Information</Text>
          </View>
          
          <View style={settingsStyles.infoGrid}>
            <View style={settingsStyles.infoItem}>
              <Text style={settingsStyles.infoLabel}>Version</Text>
              <Text style={settingsStyles.infoValue}>1.0.0</Text>
            </View>
            <View style={settingsStyles.infoItem}>
              <Text style={settingsStyles.infoLabel}>Build</Text>
              <Text style={settingsStyles.infoValue}>100</Text>
            </View>
            <View style={settingsStyles.infoItem}>
              <Text style={settingsStyles.infoLabel}>Last Synced</Text>
              <Text style={settingsStyles.infoValue}>
                {cacheInfo.ageHours > 0 
                  ? `${Math.round(cacheInfo.ageHours * 10) / 10}h ago` 
                  : `${cacheInfo.ageMinutes}m ago`
                }
              </Text>
            </View>
          </View>

          {/* Clear Cache Button */}
          <TouchableOpacity
            style={[
              settingsStyles.clearCacheButton,
              clearingCache && settingsStyles.clearCacheButtonDisabled
            ]}
            onPress={handleClearCache}
            disabled={clearingCache}
            activeOpacity={0.7}
          >
            {clearingCache ? (
              <>
                <ActivityIndicator size="small" color={Colors.white} />
                <Text style={settingsStyles.clearCacheText}>Clearing Cache...</Text>
              </>
            ) : (
              <>
                <Feather name="refresh-cw" size={18} color={Colors.white} />
                <Text style={settingsStyles.clearCacheText}>Clear Cache</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={settingsStyles.footer}>
          <Text style={settingsStyles.footerText}>
            Thank you for using the app
          </Text>
          <Text style={settingsStyles.footerSubtext}>
            ISKCON London • Made with ❤️
          </Text>
        </View>
      </ScrollView>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyPolicy}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePrivacyPolicy}
      >
        <PrivacyPolicyScreen
          navigation={{
            goBack: closePrivacyPolicy
          }}
          showActions={false}
        />
      </Modal>
    </SafeAreaView>
  );
}