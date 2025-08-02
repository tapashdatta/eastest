import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { HeadlineText, TitleText, BodyText, LabelText, CaptionText } from '@/components/Text';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, CreditCard, RefreshCw, Filter, Receipt } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { accountStyles } from '@/styles/MyProfileStyles';

// Import helpers and types
import { 
  fetchAllDonations, 
  fetchDonationStats, 
  sendReceipt
} from '@/services/helpers';
import { DonationHistoryItem, DonationStats } from '@/services/WordPressAPI';

interface DonationHistoryScreenProps {
  onBack?: () => void;
}

const ITEMS_PER_PAGE = 12; // Optimized for server load (10-15 range)

export default function DonationHistoryScreen({ onBack }: DonationHistoryScreenProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [donations, setDonations] = useState<DonationHistoryItem[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingReceipt, setSendingReceipt] = useState<{ [key: number]: boolean }>({});

  // Fetch donations when component mounts
  useEffect(() => {
    if (user?.email) {
      fetchDonations(false);
    } else {
      setLoading(false);
    }
  }, [user?.email]);

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const fetchDonations = async (isRefresh: boolean = false) => {
    if (!user?.email) return;

    try {
      setError(null);
      if (!isRefresh) {
        setLoading(true);
      }

      // Fetch all donations and stats
      const [donationList, donationStats] = await Promise.all([
        fetchAllDonations(),
        fetchDonationStats()
      ]);
      
      setDonations(donationList);
      setStats(donationStats);
      
    } catch (error) {
      console.error('[DonationHistoryScreen] Failed to fetch donations:', error);
      setError('Failed to load donation history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDonations(true);
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
      console.error('Failed to send receipt:', error);
      Alert.alert('Error', 'Failed to send receipt. Please try again.');
    } finally {
      setSendingReceipt(prev => ({ ...prev, [donation.id]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    const symbol = currency === 'GBP' ? '£' : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Enhanced donation item rendering with ISKLDN receipt ID pattern
  const renderDonationItem = ({ item }: { item: DonationHistoryItem }) => (
    <View style={accountStyles.donationHistoryItem}>
      <View style={accountStyles.donationHistoryItemHeader}>
        <View style={accountStyles.donationHistoryItemInfo}>
          <LabelText style={accountStyles.donationHistoryItemPurpose}>{item.purpose}</LabelText>
          <View style={accountStyles.donationHistoryItemMeta}>
            <CaptionText style={accountStyles.donationHistoryItemDate}>
              {formatDate(item.date)}
            </CaptionText>
            {/* FIXED: Show receipt ID in ISKLDN pattern */}
            <CaptionText style={accountStyles.donationHistoryItemReceiptId}>
              • {item.receipt_id}
            </CaptionText>
            {/* REMOVED: Status field as requested */}
          </View>
        </View>
        <View style={accountStyles.donationHistoryItemAmountContainer}>
          <TitleText style={accountStyles.donationHistoryItemAmount}>
            {formatCurrency(item.amount, item.currency)}
          </TitleText>
          <TouchableOpacity
            style={[
              accountStyles.receiptButton,
              sendingReceipt[item.id] && accountStyles.receiptButtonDisabled
            ]}
            onPress={() => handleSendReceipt(item)}
            disabled={sendingReceipt[item.id]}
          >
            {sendingReceipt[item.id] ? (
              <ActivityIndicator size="small" color={Colors.textLight} />
            ) : (
              <Receipt size={12} color={Colors.textLight} />
            )}
            <CaptionText style={accountStyles.receiptButtonText}>
              {sendingReceipt[item.id] ? 'Sending...' : 'Receipt'}
            </CaptionText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={accountStyles.donationHistoryHeaderSection}>
      {stats && stats.success && (
        <View style={accountStyles.donationHistoryStatsContainer}>
          <TitleText style={accountStyles.donationHistoryStatsTitle}>Summary</TitleText>
          <View style={accountStyles.statsGrid}>
            <View style={accountStyles.statCard}>
              <CreditCard size={24} color={Colors.primary} />
              <TitleText style={accountStyles.statNumber}>
                {stats.total_donations}
              </TitleText>
              <CaptionText style={accountStyles.statLabel}>Donations</CaptionText>
            </View>
            <View style={accountStyles.statCard}>
              <CreditCard size={24} color={Colors.success} />
              <TitleText style={accountStyles.statNumber}>
                {formatCurrency(stats.total_amount)}
              </TitleText>
              <CaptionText style={accountStyles.statLabel}>Total Contribution</CaptionText>
            </View>
          </View>
          
          {/* Show additional stats if available */}
          {stats.average_donation > 0 && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <CaptionText style={{ color: Colors.textSecondary, fontSize: 14 }}>Average Donation</CaptionText>
                <BodyText style={{ color: Colors.text, fontSize: 14, fontWeight: '600' }}>
                  {formatCurrency(stats.average_donation)}
                </BodyText>
              </View>
              {stats.last_donation_date && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                  <CaptionText style={{ color: Colors.textSecondary, fontSize: 14 }}>Last Donation</CaptionText>
                  <BodyText style={{ color: Colors.text, fontSize: 14, fontWeight: '600' }}>
                    {formatDate(stats.last_donation_date)}
                  </BodyText>
                </View>
              )}
            </View>
          )}
          
          <View style={accountStyles.contactNotice}>
            <CaptionText style={accountStyles.contactNoticeText}>
              For a copy of your tax receipts, tap on receipt button or please contact us at{' '}
              <LabelText style={accountStyles.contactEmail}>info@iskcon.london</LabelText>
            </CaptionText>
          </View>
        </View>
      )}
      
      <View style={accountStyles.donationHistoryListHeader}>
        <TitleText style={accountStyles.donationHistoryListTitle}>All Donations</TitleText>
        <TouchableOpacity style={accountStyles.donationHistoryFilterButton}>
          <Filter size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={accountStyles.donationHistoryEmptyState}>
      <CreditCard size={48} color={Colors.textSecondary} />
      <TitleText style={accountStyles.donationHistoryEmptyTitle}>No Donations</TitleText>
      <BodyText style={accountStyles.donationHistoryEmptyText}>
        No donation history is available at this time.
      </BodyText>
    </View>
  );

  const renderError = () => (
    <View style={accountStyles.donationHistoryErrorState}>
      <TitleText style={accountStyles.donationHistoryErrorTitle}>Unable to Load Donations</TitleText>
      <BodyText style={accountStyles.donationHistoryErrorText}>{error}</BodyText>
      <TouchableOpacity style={accountStyles.donationHistoryRetryButton} onPress={() => fetchDonations(false)}>
        <LabelText style={accountStyles.donationHistoryRetryButtonText}>Try Again</LabelText>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <CaptionText style={{ color: Colors.textSecondary, fontStyle: 'italic' }}>
          {donations.length > 0 ? "You've reached the end of your donation history" : ""}
        </CaptionText>
      </View>
    );
  };

  return (
    <View style={[accountStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={accountStyles.donationHistoryHeader}>
        <TouchableOpacity style={accountStyles.donationHistoryBackButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <HeadlineText style={accountStyles.donationHistoryHeaderTitle}>Donation History</HeadlineText>
        <TouchableOpacity style={accountStyles.donationHistoryHeaderAction} onPress={handleRefresh}>
          <RefreshCw size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={accountStyles.donationHistoryLoadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <BodyText style={accountStyles.donationHistoryLoadingText}>Loading donation history...</BodyText>
        </View>
      ) : error ? (
        renderError()
      ) : donations.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={donations}
          renderItem={renderDonationItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={accountStyles.donationHistoryListContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={ITEMS_PER_PAGE}
          maxToRenderPerBatch={ITEMS_PER_PAGE}
          windowSize={3}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
        />
      )}
    </View>
  );
}