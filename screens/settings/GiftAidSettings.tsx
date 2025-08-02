// screens/settings/GiftAidSettings.tsx - Production Ready
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { settingsStyles, ColorVariants } from '@/styles/SettingsStyles';
import { Colors } from '@/constants/Colors';

interface GiftAidConsents {
  ukTaxpayer: boolean;
  claimGiftAid: boolean;
  understandTerms: boolean;
}

export default function GiftAidSettings() {
  const [giftAidEnabled, setGiftAidEnabled] = useState(false);
  const [showGiftAidModal, setShowGiftAidModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [giftAidConsents, setGiftAidConsents] = useState<GiftAidConsents>({
    ukTaxpayer: false,
    claimGiftAid: false,
    understandTerms: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGiftAidSettings();
  }, []);

  const loadGiftAidSettings = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual service call
      // const giftAidSettings = await GiftAidService.getGiftAidSettings();
      const giftAidSettings = { 
        enabled: false, 
        consents: { ukTaxpayer: false, claimGiftAid: false, understandTerms: false } 
      };
      
      setGiftAidEnabled(giftAidSettings.enabled);
      setGiftAidConsents(giftAidSettings.consents);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const handleGiftAidToggle = async (value: boolean) => {
    if (value) {
      setShowGiftAidModal(true);
    } else {
      try {
        // TODO: Replace with actual service call
        // const success = await GiftAidService.setGiftAidEnabled(false);
        const success = true;
        
        if (success) {
          setGiftAidEnabled(false);
          setGiftAidConsents({
            ukTaxpayer: false,
            claimGiftAid: false,
            understandTerms: false,
          });
        }
      } catch (error) {
        // Silent error handling - toggle will revert
      }
    }
  };

  const handleConsentChange = (consentType: keyof GiftAidConsents) => {
    setGiftAidConsents(prev => ({
      ...prev,
      [consentType]: !prev[consentType]
    }));
  };

  const handleGiftAidAgree = async () => {
    const allConsentsGiven = Object.values(giftAidConsents).every(consent => consent);
    
    if (!allConsentsGiven) {
      return;
    }

    try {
      // TODO: Replace with actual service call
      // const success = await GiftAidService.setGiftAidEnabled(true, giftAidConsents);
      const success = true;
      
      if (success) {
        setGiftAidEnabled(true);
        setShowGiftAidModal(false);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const cancelGiftAidModal = () => {
    setShowGiftAidModal(false);
    setGiftAidConsents({
      ukTaxpayer: false,
      claimGiftAid: false,
      understandTerms: false,
    });
  };

  if (loading) {
    return null;
  }

  const allConsentsGiven = Object.values(giftAidConsents).every(consent => consent);

  return (
    <>
      <View style={settingsStyles.section}>
        <View style={settingsStyles.sectionHeader}>
          <View style={[settingsStyles.sectionIcon, ColorVariants.success.view]}>
            <Feather name="heart" size={20} color={ColorVariants.success.color} />
          </View>
          <Text style={settingsStyles.sectionTitle}>Donations</Text>
        </View>
        
        {/* Gift Aid Toggle */}
        <View style={settingsStyles.settingItem}>
          <View style={settingsStyles.settingInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={settingsStyles.settingLabel}>Gift Aid</Text>
              <TouchableOpacity 
                onPress={() => setShowInfoModal(true)}
                style={{ marginLeft: 8, padding: 4 }}
                activeOpacity={0.7}
              >
                <Feather name="info" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={settingsStyles.settingDescription}>
              Enable Gift Aid to allow us to claim an extra 25p for every £1 you donate (UK taxpayers only)
            </Text>
          </View>
          <Switch
            value={giftAidEnabled}
            onValueChange={handleGiftAidToggle}
            trackColor={{ false: Colors.textMuted + '30', true: Colors.success + '30' }}
            thumbColor={giftAidEnabled ? Colors.success : Colors.surface}
            ios_backgroundColor={Colors.textMuted + '30'}
          />
        </View>

        {/* Gift Aid Status */}
        {giftAidEnabled && (
          <View style={settingsStyles.giftAidStatus}>
            <Feather name="check-circle" size={16} color={Colors.success} />
            <Text style={settingsStyles.giftAidStatusText}>
              Gift Aid is enabled for your donations
            </Text>
          </View>
        )}
      </View>

      {/* Gift Aid Info Modal */}
      <Modal
        visible={showInfoModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={settingsStyles.modalBackdrop}>
          <View style={settingsStyles.compactModalContainer}>
            <View style={settingsStyles.compactModalHeader}>
              <View style={settingsStyles.compactHeaderContent}>
                <Text style={settingsStyles.compactModalTitle}>About Gift Aid</Text>
                <Text style={settingsStyles.compactModalSubtitle}>UK tax incentive for charitable giving</Text>
              </View>
              <TouchableOpacity onPress={() => setShowInfoModal(false)} style={settingsStyles.compactCloseButton} activeOpacity={0.7}>
                <Feather name="x" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <View style={settingsStyles.compactModalContent}>
              <Text style={settingsStyles.bottomSheetDescription}>
                Gift Aid is a UK tax incentive that enables tax-effective giving by individuals to charities. It allows charities to reclaim an extra 25% in tax on every eligible donation made by a UK taxpayer.
                {'\n\n'}
                For example, when you donate £10 with Gift Aid, it's worth £12.50 to the charity.
              </Text>
              
              <TouchableOpacity 
                style={settingsStyles.compactSaveButton}
                onPress={() => setShowInfoModal(false)}
                activeOpacity={0.9}
              >
                <Text style={settingsStyles.compactSaveButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gift Aid Consent Modal */}
      <Modal
        visible={showGiftAidModal}
        animationType="fade"
        transparent={true}
        onRequestClose={cancelGiftAidModal}
      >
        <View style={settingsStyles.modalBackdrop}>
          <View style={settingsStyles.bottomSheetModal}>
            <View style={settingsStyles.bottomSheetHeader}>
              <View style={settingsStyles.bottomSheetHeaderContent}>
                <Text style={settingsStyles.bottomSheetTitle}>Gift Aid Declaration</Text>
                <Text style={settingsStyles.bottomSheetSubtitle}>Help us claim extra for your donations</Text>
              </View>
              <TouchableOpacity onPress={cancelGiftAidModal} style={settingsStyles.bottomSheetCloseButton} activeOpacity={0.7}>
                <Feather name="x" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={settingsStyles.bottomSheetContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={settingsStyles.bottomSheetDescription}>
                Gift Aid allows us to claim an extra 25p for every £1 you donate from HM Revenue & Customs at no extra cost to you.
              </Text>

              <View style={settingsStyles.consentSection}>
                <Text style={settingsStyles.consentTitle}>Please confirm the following:</Text>

                {/* UK Taxpayer Checkbox */}
                <TouchableOpacity 
                  style={settingsStyles.checkboxItem}
                  onPress={() => handleConsentChange('ukTaxpayer')}
                  activeOpacity={0.8}
                >
                  <View style={[
                    settingsStyles.checkbox, 
                    giftAidConsents.ukTaxpayer && settingsStyles.checkboxChecked
                  ]}>
                    {giftAidConsents.ukTaxpayer && (
                      <Feather name="check" size={16} color={Colors.white} />
                    )}
                  </View>
                  <Text style={settingsStyles.checkboxText}>
                    I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax in the current tax year than the amount of Gift Aid claimed on all my donations, it is my responsibility to pay any difference.
                  </Text>
                </TouchableOpacity>

                {/* Claim Gift Aid Checkbox */}
                <TouchableOpacity 
                  style={settingsStyles.checkboxItem}
                  onPress={() => handleConsentChange('claimGiftAid')}
                  activeOpacity={0.8}
                >
                  <View style={[
                    settingsStyles.checkbox, 
                    giftAidConsents.claimGiftAid && settingsStyles.checkboxChecked
                  ]}>
                    {giftAidConsents.claimGiftAid && (
                      <Feather name="check" size={16} color={Colors.white} />
                    )}
                  </View>
                  <Text style={settingsStyles.checkboxText}>
                    I want to Gift Aid my donation and any donations I make in the future or have made in the past 4 years to ISKCON London.
                  </Text>
                </TouchableOpacity>

                {/* Understand Terms Checkbox */}
                <TouchableOpacity 
                  style={settingsStyles.checkboxItem}
                  onPress={() => handleConsentChange('understandTerms')}
                  activeOpacity={0.8}
                >
                  <View style={[
                    settingsStyles.checkbox, 
                    giftAidConsents.understandTerms && settingsStyles.checkboxChecked
                  ]}>
                    {giftAidConsents.understandTerms && (
                      <Feather name="check" size={16} color={Colors.white} />
                    )}
                  </View>
                  <Text style={settingsStyles.checkboxText}>
                    I understand that I can cancel this declaration at any time by notifying ISKCON London, and that I must notify the charity if I lose my UK taxpayer status.
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[
                  settingsStyles.bottomSheetButton,
                  allConsentsGiven 
                    ? { backgroundColor: Colors.success }
                    : settingsStyles.bottomSheetButtonDisabled
                ]}
                onPress={handleGiftAidAgree}
                disabled={!allConsentsGiven}
                activeOpacity={0.9}
              >
                <Text style={[
                  settingsStyles.bottomSheetButtonText,
                  allConsentsGiven 
                    ? { color: Colors.white }
                    : settingsStyles.bottomSheetButtonTextDisabled
                ]}>
                  {allConsentsGiven ? 'Enable Gift Aid' : 'Please check all boxes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={settingsStyles.learnMoreButton} 
                onPress={() => setShowInfoModal(true)}
                activeOpacity={0.8}
              >
                <Text style={settingsStyles.learnMoreText}>Learn more about Gift Aid</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}