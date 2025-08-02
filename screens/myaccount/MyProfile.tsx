import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { HeadlineText, TitleText, BodyText, LabelText, ButtonText, CaptionText } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import { 
  IdCard, 
  User, 
  Mail, 
  MapPin, 
  Bell, 
  Shield, 
  CircleHelp as HelpCircle, 
  Route, 
  LogOut, 
  UserPen, 
  Save, 
  X, 
  CreditCard, 
  Calendar, 
  ArrowLeft, 
  Receipt, 
  History, 
  RefreshCw, 
  UserRoundCog, 
  Smartphone,
  Settings // Settings icon for app settings
} from 'lucide-react-native';
import KeyboardAwareContainer from '@/components/KeyboardAwareContainer';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming
} from 'react-native-reanimated';
import { SimpleDatePicker } from '@/components/DatePicker';
import { CreditCardIcon, SettingsIcon, NotificationIcon } from '@/assets/icons';

// Import helpers
import { accountStyles } from '@/styles/MyProfileStyles';
import {
  ProfileData,
  navigateToLogin,
  navigateToRegister,
  navigateBack,
  navigateToSettings, // FIXED: Use the new helper function
  handleLogoutConfirmation,
  handleProfileUpdate,
  getMenuItems,
  initializeProfileData,
  fetchRecentDonations,
  fetchDonationStats,
  sendReceipt,
  fetchContactId,
} from '@/services/helpers';

// Use API types directly
import { DonationHistoryItem, DonationStats } from '@/services/WordPressAPI';

interface MyAccountProps {
  onShowDonationHistory?: () => void;
  onShowDevices?: () => void;
}

export default function AccountScreen({ onShowDonationHistory, onShowDevices }: MyAccountProps) {
  const { user, isAuthenticated, logout, updateUserProfile, refreshProfile } = useAuth();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedProfile, setEditedProfile] = useState<ProfileData>(() => 
    initializeProfileData(user)
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Donation data state
  const [donationHistory, setDonationHistory] = useState<DonationHistoryItem[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [sendingReceipt, setSendingReceipt] = useState<{ [key: number]: boolean }>({});
  const [contactId, setContactId] = useState<number | null>(null);

  // Get menu items (settings already filtered out)
  const menuItems = getMenuItems();

  // Fetch data when user is available
  useEffect(() => {
    if (isFocused && user?.email) {
      fetchUserData();
    }
  }, [user?.email, isAuthenticated, isFocused]);

  // Trigger animation when tab is focused
  useEffect(() => {
    if (isFocused) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(20, { duration: 200 });
    }
  }, [isFocused]);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setEditedProfile(initializeProfileData(user));
    }
  }, [user]);

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  // FIXED: Use silent refresh to prevent unwanted navigation
  const fetchUserData = async () => {
    if (!user?.email || !isAuthenticated) {
      return;
    }

    try {
      setLoadingProfile(true);
      
      // FIXED: Use silent refresh to prevent unwanted navigation
      const profileRefreshSuccess = await refreshProfile(true); // Silent refresh
      
      // Fetch donation data
      setLoadingDonations(true);
      
      const [recentDonations, stats, civicrmContactId] = await Promise.all([
        fetchRecentDonations(5),
        fetchDonationStats(),
        fetchContactId()
      ]);
      
      setDonationHistory(recentDonations);
      setDonationStats(stats);
      setContactId(civicrmContactId);

    } catch (error) {
      console.error('[AccountScreen] Failed to fetch user data:', error);
      setDonationHistory([]);
      setDonationStats(null);
    } finally {
      setLoadingDonations(false);
      setLoadingProfile(false);
      setRefreshing(false);
    }
  };

  // Event handlers
  const handleSaveProfile = () => handleProfileUpdate(
    editedProfile,
    updateUserProfile,
    setError,
    setSuccess,
    setIsSaving,
    setIsEditing
  );

  const handleCancelEdit = () => {
    if (user) {
      setEditedProfile(initializeProfileData(user));
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => handleLogoutConfirmation(
    isAuthenticated,
    user,
    logout
  );

  const handleManageDevices = () => {
    if (onShowDevices) {
      onShowDevices();
    } else {
      router.push('./devices');
    }
  };

  // Receipt sending
  const handleSendReceipt = async (donation: DonationHistoryItem) => {
    if (!user?.email) {
      Alert.alert('Error', 'Unable to send receipt. Please try refreshing your profile.');
      return;
    }

    const donorName = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.email;

    if (!donorName) {
      Alert.alert('Error', 'Unable to determine donor name. Please update your profile.');
      return;
    }

    try {
      setSendingReceipt(prev => ({ ...prev, [donation.id]: true }));

      const result = await sendReceipt(donation.id, donorName);

      if (result.success) {
        Alert.alert(
          'Receipt Sent',
          `Receipt for ${formatCurrency(donation.amount, donation.currency)} donation has been sent to ${user.email}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to send receipt. Please try again.');
      }
    } catch (error) {
      console.error('[AccountScreen] Failed to send receipt:', error);
      Alert.alert('Error', 'Failed to send receipt. Please try again.');
    } finally {
      setSendingReceipt(prev => ({ ...prev, [donation.id]: false }));
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    const symbol = currency === 'GBP' ? '£' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return dateString;
    }
  };

  const handleDateChange = (dateString: string) => {
    setEditedProfile({ ...editedProfile, date_of_birth: dateString });
  };

  const handleViewAllDonations = () => {
    if (onShowDonationHistory) {
      onShowDonationHistory();
    } else {
      router.push('./DonationHistoryScreen');
    }
  };

  // FIXED: Use silent refresh in handleRefresh as well
  const handleRefresh = async () => {
    if (!user?.email || !isAuthenticated) {
      return;
    }

    setRefreshing(true);
    await fetchUserData(); // This will now use silent refresh
  };

  // Guest user view
  if (!isAuthenticated) {
    return (
      <Animated.View style={[accountStyles.container, animatedStyle]}>
        <TouchableOpacity 
          style={[accountStyles.backButton, { top: insets.top + 10 }]} 
          onPress={navigateBack}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>

        <KeyboardAwareContainer scrollEnabled={false} style={accountStyles.keyboardContainer}>
          <View style={[accountStyles.header, { paddingTop: insets.top + 60 }]}>
            <View style={accountStyles.headerContent}>
              <User size={64} color={Colors.primary} />
              <HeadlineText style={accountStyles.headerTitle}>My Account</HeadlineText>
              <BodyText style={accountStyles.headerSubtitle}>
                Sign in to manage your profile and activity
              </BodyText>
            </View>
          </View>

          <View style={accountStyles.loginPrompt}>
            <TouchableOpacity style={accountStyles.loginButton} onPress={navigateToLogin}>
              <ButtonText style={accountStyles.loginButtonText}>Sign In</ButtonText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={accountStyles.registerPrompt}
              onPress={navigateToRegister}
            >
              <BodyText style={accountStyles.registerPromptText}>
                Don't have an account? <LabelText style={accountStyles.registerLink}>Sign Up</LabelText>
              </BodyText>
            </TouchableOpacity>
          </View>

          <View style={accountStyles.guestFeatures}>
            <TitleText style={accountStyles.guestFeaturesTitle}>Guest User Settings</TitleText>
            
            {/* App Settings for Guest Users - SINGLE ENTRY */}
            <TouchableOpacity style={accountStyles.menuItem} onPress={navigateToSettings}>
              <SettingsIcon size={20} color={Colors.primary} />
              <View>
                <BodyText style={accountStyles.menuItemText}>App Settings</BodyText>
                <CaptionText style={{ color: Colors.textSecondary, fontSize: 12, marginLeft: 12 }}>
                  Daily quotes and app preferences
                </CaptionText>
              </View>
            </TouchableOpacity>

            {/* Other menu items */}
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={accountStyles.menuItem} onPress={item.action}>
                {item.id === 'notifications' && <Bell size={20} color={Colors.primary} />}
                {item.id === 'privacy' && <Shield size={20} color={Colors.primary} />}
                {item.id === 'help' && <HelpCircle size={20} color={Colors.primary} />}
                <BodyText style={accountStyles.menuItemText}>{item.title}</BodyText>
              </TouchableOpacity>
            ))}
          </View>
        </KeyboardAwareContainer>
      </Animated.View>
    );
  }

  // Authenticated user view
  return (
    <Animated.View style={[accountStyles.container, animatedStyle]}>  
      <TouchableOpacity 
        style={[accountStyles.backButton, { top: insets.top + 10 }]} 
        onPress={navigateBack}
      >
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>

      <KeyboardAwareContainer
        style={accountStyles.keyboardContainer} 
        showsVerticalScrollIndicator={false}
        extraScrollHeight={isEditing ? 120 : 120}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={[accountStyles.header, { paddingTop: insets.top + 0 }]}>
          <View style={accountStyles.headerContent}>
            <View style={accountStyles.profileImageContainer}>
              <View style={accountStyles.profileImagePlaceholder}>
                <User size={32} color={Colors.primary} />
              </View>
            </View>
            <HeadlineText style={accountStyles.headerTitle}>
              {user?.first_name && user?.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : 'User'}
            </HeadlineText>
            {user?.nickname && (
              <BodyText style={accountStyles.headerNickname}>({user.nickname})</BodyText>
            )}
            {contactId && (
              <View style={accountStyles.memberIdContainer}>
                <IdCard size={16} color={Colors.white} />
                <LabelText style={accountStyles.memberId}>Member ID: {contactId}</LabelText>
              </View>
            )}
            <BodyText style={accountStyles.headerSubtitle}>{user?.email}</BodyText>
          </View>
        </View>

        {/* Profile Information */}
        <View style={accountStyles.section}>
          <View style={accountStyles.sectionHeader}>
            <TitleText style={accountStyles.sectionTitle}>My Information</TitleText>
            <TouchableOpacity
              style={accountStyles.editButton}
              onPress={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
            >
              {isEditing ? (
                <X size={20} color={Colors.error} />
              ) : (
                <UserPen size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={accountStyles.errorContainer}>
              <LabelText style={accountStyles.errorText}>{error}</LabelText>
            </View>
          ) : null}

          {success ? (
            <View style={accountStyles.successContainer}>
              <LabelText style={accountStyles.successText}>{success}</LabelText>
            </View>
          ) : null}

          <View style={accountStyles.profileCard}>
            {loadingProfile && (
              <View style={accountStyles.accountLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <CaptionText style={accountStyles.accountLoadingText}>Refreshing profile...</CaptionText>
              </View>
            )}
            
            {!isEditing ? (
              // Condensed view when not editing
              <View style={accountStyles.profileSummary}>
                <View style={accountStyles.profileSummaryRow}>
                  <View style={accountStyles.profileSummaryItem}>
                    <View style={accountStyles.profileSummaryLabelWithIcon}>
                      <Smartphone size={16} color={Colors.primary} />
                      <CaptionText style={accountStyles.profileSummaryLabel}>Phone</CaptionText>
                    </View>
                    <BodyText style={accountStyles.profileSummaryValue}>
                      {editedProfile.phone_primary || 'Not provided'}
                    </BodyText>
                  </View>
                  <View style={accountStyles.profileSummaryItem}>
                    <View style={accountStyles.profileSummaryLabelWithIcon}>
                      <Calendar size={16} color={Colors.primary} />
                      <CaptionText style={accountStyles.profileSummaryLabel}>Birth Date</CaptionText>
                    </View>
                    <BodyText style={accountStyles.profileSummaryValue}>
                      {editedProfile.date_of_birth ? formatDate(editedProfile.date_of_birth) : 'Not provided'}
                    </BodyText>
                  </View>
                </View>
                
                <View style={accountStyles.profileSummaryAddress}>
                  <View style={accountStyles.profileSummaryLabelWithIcon}>
                    <MapPin size={16} color={Colors.primary} />
                    <CaptionText style={accountStyles.profileSummaryLabel}>Address</CaptionText>
                  </View>
                  <BodyText style={accountStyles.profileSummaryValue}>
                    {editedProfile.street_address ? (
                      [
                        editedProfile.street_address,
                        editedProfile.city && `, ${editedProfile.city}`,
                        editedProfile.postal_code && `, ${editedProfile.postal_code}`,
                        editedProfile.country && `, ${editedProfile.country}`
                      ].filter(Boolean).join('')
                    ) : (
                      'Not provided'
                    )}
                  </BodyText>
                </View>
              </View>
            ) : (
              // Detailed edit view
              <>
                {/* First Name */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <User size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.first_name}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, first_name: text })}
                    placeholder="First Name"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="next"
                  />
                </View>

                {/* Last Name */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <User size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.last_name}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, last_name: text })}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="next"
                  />
                </View>

                {/* Nickname */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <UserRoundCog size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.nickname}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, nickname: text })}
                    placeholder="Initiated Name"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="next"
                  />
                </View>

                {/* Email */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <Mail size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.email}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
                    placeholder="Email Address"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>

                {/* Phone */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <Smartphone size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.phone_primary}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, phone_primary: text })}
                    placeholder="Phone Number"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>

                {/* Date of Birth */}
                <View style={accountStyles.inputFieldContainer}>
                  <SimpleDatePicker
                    value={editedProfile.date_of_birth}
                    onChange={handleDateChange}
                    placeholder="Select Date of Birth"
                    maximumDate={new Date()}
                    minimumDate={new Date(1900, 0, 1)}
                    label="Date of Birth"
                  />
                </View>

                {/* Street Address */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <Route size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.street_address}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, street_address: text })}
                    placeholder="Street Address"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="next"
                  />
                </View>

                {/* City */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <MapPin size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.city}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, city: text })}
                    placeholder="City"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="next"
                  />
                </View>

                {/* Postal Code */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <MapPin size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.postal_code}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, postal_code: text })}
                    placeholder="Postal Code"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="next"
                  />
                </View>

                {/* Country */}
                <View style={accountStyles.inputFieldContainer}>
                  <View style={accountStyles.inputIconContainer}>
                    <MapPin size={18} color={Colors.textSecondary} />
                  </View>
                  <TextInput
                    style={accountStyles.editInputWithIcon}
                    value={editedProfile.country}
                    onChangeText={(text) => setEditedProfile({ ...editedProfile, country: text })}
                    placeholder="Country"
                    placeholderTextColor={Colors.textSecondary}
                    returnKeyType="done"
                  />
                </View>

                <View style={accountStyles.editActions}>
                  <TouchableOpacity 
                    style={accountStyles.cancelButton} 
                    onPress={handleCancelEdit}
                    disabled={isSaving}
                  >
                    <X size={16} color={Colors.error} />
                    <LabelText style={accountStyles.cancelButtonText}>Cancel</LabelText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[accountStyles.saveButton, isSaving && accountStyles.saveButtonDisabled]} 
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                  >
                    <Save size={16} color={Colors.textLight} />
                    <LabelText style={accountStyles.saveButtonText}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </LabelText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={accountStyles.section}>
          <TitleText style={accountStyles.sectionTitle}>My Contributions</TitleText>
          <View style={accountStyles.statsGrid}>
            <View style={accountStyles.statCard}>
              <CreditCardIcon size={24} color={Colors.primary} />
              <TitleText style={accountStyles.statNumber}>
                {loadingDonations ? '...' : (donationStats?.success ? donationStats.total_donations : 0)}
              </TitleText>
              <CaptionText style={accountStyles.statLabel}>Donations</CaptionText>
            </View>
            {donationStats?.success && donationStats.total_amount > 0 && (
              <View style={accountStyles.statCard}>
                <CreditCardIcon size={24} color={Colors.success} />
                <TitleText style={accountStyles.statNumber}>
                  {formatCurrency(donationStats.total_amount)}
                </TitleText>
                <CaptionText style={accountStyles.statLabel}>Contributed</CaptionText>
              </View>
            )}
          </View>
        </View>

        {/* Donation History */}
        <View style={accountStyles.section}>
          <TitleText style={accountStyles.sectionTitle}>Recent Donations</TitleText>
          <View style={accountStyles.donationHistory}>
            {loadingDonations ? (
              <View style={accountStyles.accountLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <CaptionText style={accountStyles.accountLoadingText}>Loading donation history...</CaptionText>
              </View>
            ) : donationHistory.length > 0 ? (
              <>
                {donationHistory.map((donation) => (
                  <View key={donation.id} style={accountStyles.donationItem}>
                    <View style={accountStyles.donationInfo}>
                      <LabelText style={accountStyles.donationPurpose}>{donation.purpose}</LabelText>
                      <CaptionText style={accountStyles.donationDate}>
                        {formatDate(donation.date)}
                      </CaptionText>
                      <CaptionText style={accountStyles.accountReceiptId}>
                        Receipt: {donation.receipt_id}
                      </CaptionText>
                    </View>
                    <View style={accountStyles.accountDonationAmountContainer}>
                      <TitleText style={accountStyles.donationAmount}>
                        {formatCurrency(donation.amount, donation.currency)}
                      </TitleText>
                      <TouchableOpacity
                        style={[
                          accountStyles.accountReceiptButton,
                          sendingReceipt[donation.id] && accountStyles.accountReceiptButtonDisabled
                        ]}
                        onPress={() => handleSendReceipt(donation)}
                        disabled={sendingReceipt[donation.id]}
                      >
                        {sendingReceipt[donation.id] ? (
                          <ActivityIndicator size="small" color={Colors.textLight} />
                        ) : (
                          <Receipt size={10} color={Colors.textLight} />
                        )}
                        <CaptionText style={accountStyles.accountReceiptButtonText}>
                          {sendingReceipt[donation.id] ? 'Sending...' : 'Receipt'}
                        </CaptionText>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                <TouchableOpacity style={accountStyles.viewMoreDonationsButton} onPress={handleViewAllDonations}>
                  <History size={16} color={Colors.textLight} />
                  <LabelText style={accountStyles.viewMoreDonationsText}>Show All</LabelText>
                  <View style={accountStyles.viewMoreArrow}>
                    <LabelText style={accountStyles.viewMoreArrowText}>→</LabelText>
                  </View>
                </TouchableOpacity>
                
                <View style={accountStyles.contactNotice}>
                  <CaptionText style={accountStyles.contactNoticeText}>
                    A tax receipt can be obtained by tapping on the receipt button or please contact us at{' '}
                    <LabelText style={accountStyles.contactEmail}>info@iskcon.london</LabelText>
                  </CaptionText>
                </View>
              </>
            ) : (
              <View style={accountStyles.accountNoDonationsContainer}>
                <CreditCard size={32} color={Colors.textSecondary} />
                <BodyText style={accountStyles.accountNoDonationsText}>
                  No completed donation history found.
                </BodyText>
                <CaptionText style={accountStyles.accountContactSupportText}>
                  Complete a donation to see your history here.
                </CaptionText>
              </View>
            )}
          </View>
        </View>

        {/* Device Management Section */}
        <View style={accountStyles.section}>
          <TitleText style={accountStyles.sectionTitle}>My Devices</TitleText>
          <TouchableOpacity 
            style={accountStyles.deviceManagementButton} 
            onPress={handleManageDevices}
          >
            <View style={accountStyles.deviceButtonContent}>
              <Smartphone size={24} color={Colors.primary} />
              <View style={accountStyles.deviceButtonTextContainer}>
                <LabelText style={accountStyles.deviceButtonTitle}>Manage Devices</LabelText>
                <CaptionText style={accountStyles.deviceButtonSubtitle}>
                  View and manage devices used to access your account
                </CaptionText>
              </View>
            </View>
            <ArrowLeft 
              size={20} 
              color={Colors.textSecondary} 
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>
        </View>

        {/* Account Settings Section - FIXED: Single App Settings Entry */}
        <View style={accountStyles.section}>
          <TitleText style={accountStyles.sectionTitle}>Account Settings</TitleText>
          <View style={accountStyles.menuList}>
            
            {/* FIXED: Single App Settings Entry using helper function */}
            <TouchableOpacity 
              style={accountStyles.menuItem} 
              onPress={navigateToSettings}
              activeOpacity={0.7}
            >
              <SettingsIcon size={20} color={Colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <BodyText style={accountStyles.menuItemText}>App Settings</BodyText>
                <CaptionText style={{ color: Colors.textSecondary, fontSize: 12 }}>
                  Daily quotes, notifications, and preferences
                </CaptionText>
              </View>
              <ArrowLeft 
                size={16} 
                color={Colors.textSecondary} 
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>

            {/* Other Menu Items */}
            {menuItems.map((item) => (
              <TouchableOpacity key={item.id} style={accountStyles.menuItem} onPress={item.action}>
                {item.id === 'notifications' && <NotificationIcon size={20} color={Colors.primary} />}
                {item.id === 'privacy' && <Shield size={20} color={Colors.primary} />}
                {item.id === 'help' && <HelpCircle size={20} color={Colors.primary} />}
                <BodyText style={accountStyles.menuItemText}>{item.title}</BodyText>
                <ArrowLeft 
                  size={16} 
                  color={Colors.textSecondary} 
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={accountStyles.section}>
          <TouchableOpacity style={accountStyles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.white} />
            <LabelText style={accountStyles.logoutText}>Logout</LabelText>
          </TouchableOpacity>
        </View>

        <View style={accountStyles.bottomSpacing} />
      </KeyboardAwareContainer>
    </Animated.View>   
  );
}