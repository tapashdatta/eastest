// screens/settings/DailyQuoteSettings.tsx - Production Ready
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { DailyQuotesService } from '@/services/DailyQuotesService';
import { settingsStyles, ColorVariants } from '@/styles/SettingsStyles';
import { Colors } from '@/constants/Colors';

export default function DailyQuoteSettings() {
  const [dailyQuotesEnabled, setDailyQuotesEnabled] = useState(true);
  const [showQuoteAgain, setShowQuoteAgain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadDailyQuoteSettings();
  }, []);

  const loadDailyQuoteSettings = async () => {
    try {
      setLoading(true);
      const enabled = await DailyQuotesService.getDailyQuotesEnabled();
      setDailyQuotesEnabled(enabled);
    } catch (error) {
      // Silent error handling - use default state
    } finally {
      setLoading(false);
    }
  };

  const handleDailyQuotesToggle = async (value: boolean) => {
    try {
      const success = await DailyQuotesService.setDailyQuotesEnabled(value);
      if (success) {
        setDailyQuotesEnabled(value);
      }
    } catch (error) {
      // Silent error handling - toggle will revert to previous state
    }
  };

  const handleShowQuoteAgain = async (value: boolean) => {
    if (!value) {
      return;
    }
    
    try {
      setShowQuoteAgain(true);
      
      // Visual feedback animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      await DailyQuotesService.forceShowQuoteToday();
      
      // Reset after delay for visual feedback
      setTimeout(() => {
        setShowQuoteAgain(false);
      }, 1000);
      
    } catch (error) {
      // Silent error handling
      setShowQuoteAgain(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <View style={settingsStyles.section}>
      <View style={settingsStyles.sectionHeader}>
        <View style={[settingsStyles.sectionIcon, ColorVariants.accent.view]}>
          <Feather name="sunrise" size={20} color={ColorVariants.accent.color} />
        </View>
        <Text style={settingsStyles.sectionTitle}>Prabhupada Vani</Text>
      </View>
      
      {/* Daily Inspiration Toggle */}
      <View style={settingsStyles.settingItem}>
        <View style={settingsStyles.settingInfo}>
          <Text style={settingsStyles.settingLabel}>Daily Inspiration</Text>
          <Text style={settingsStyles.settingDescription}>
            Receive inspirational quotes from Srila Prabhupada on app startup
          </Text>
        </View>
        <Switch
          value={dailyQuotesEnabled}
          onValueChange={handleDailyQuotesToggle}
          trackColor={{ false: Colors.textMuted + '30', true: Colors.accent + '30' }}
          thumbColor={dailyQuotesEnabled ? Colors.accent : Colors.surface}
          ios_backgroundColor={Colors.textMuted + '30'}
        />
      </View>

      {/* Show Quote Again Action */}
      {dailyQuotesEnabled && (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={[settingsStyles.settingItem, { borderBottomWidth: 0 }]}>
            <View style={settingsStyles.settingInfo}>
              <Text style={settingsStyles.settingLabel}>Show Today's Quote Again</Text>
              <Text style={settingsStyles.settingDescription}>
                Display today's inspirational quote again on next app startup
              </Text>
            </View>
            <Switch
              value={showQuoteAgain}
              onValueChange={handleShowQuoteAgain}
              trackColor={{ false: Colors.textMuted + '30', true: Colors.warning + '30' }}
              thumbColor={showQuoteAgain ? Colors.warning : Colors.surface}
              ios_backgroundColor={Colors.textMuted + '30'}
            />
          </View>
        </Animated.View>
      )}

      {/* Status Indicator */}
      {dailyQuotesEnabled && (
        <View style={[settingsStyles.giftAidStatus, { 
          backgroundColor: Colors.accent + '10',
          borderColor: Colors.accent + '30',
        }]}>
          <Feather name="check-circle" size={16} color={Colors.accent} />
          <Text style={[settingsStyles.giftAidStatusText, { color: Colors.accent }]}>
            Daily inspiration is active
          </Text>
        </View>
      )}
    </View>
  );
}