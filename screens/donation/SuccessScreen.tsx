import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Text, HeadlineText, TitleText, BodyText } from '@/components/Text';
import { useDonationCart } from '@/contexts/DonationContext';
import { ProcessedDonationResult } from '@/hooks/useDonation';
import { Check, Receipt, TriangleAlert as AlertTriangle, ArrowLeft, Mail } from 'lucide-react-native';
import { 
  successStyles,
  sharedStyles 
} from '@/styles/DonationStyles';
import Logger from '@/utils/Logger';

type DonationStackParamList = {
  Donate: undefined;
  Cart: undefined;
  Payment: undefined;
  Success: { result: ProcessedDonationResult };
};

type SuccessScreenRouteProp = RouteProp<DonationStackParamList, 'Success'>;
type NavigationProp = NativeStackNavigationProp<DonationStackParamList>;

const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>();
  const { result } = route.params;
  const { clearCart } = useDonationCart();

  // Clear cart when success screen mounts
  useEffect(() => {
    Logger.info('✅ Success screen mounted, clearing cart');
    clearCart();
  }, [clearCart]);

  const handleGoHome = () => {
    try {
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Donate' }],
        });
        parentNavigation.navigate('index');
      } else {
        navigation.navigate('index' as any);
      }
    } catch (error) {
      Logger.error('Navigation to home failed', error);
      navigation.goBack();
      navigation.goBack();
      navigation.goBack();
    }
  };

  const handleDonateAgain = () => {
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Donate' }],
      });
      Logger.info('Navigation reset to Donate screen from Success');
    } catch (error) {
      Logger.error('Navigation reset to donate failed', error);
      navigation.navigate('Donate');
    }
  };

  return (
    <View style={successStyles.container}>
      {/* Header with gradient background */}
      <View style={successStyles.headerContainer}>
        {/* Decorative Background Elements */}
        <View style={successStyles.decorativeElement1} />
        <View style={successStyles.decorativeElement2} />
        <View style={successStyles.decorativeElement3} />

        {/* Lottie Animation */}
        <View style={successStyles.lottieContainer}>
          <LottieView
            source={require('@/assets/animation/thankyou.json')}
            autoPlay
            loop={false}
            style={successStyles.lottieAnimation}
            resizeMode="cover"
          />
        </View>

        {/* Header Navigation */}
        <View style={successStyles.headerNavigation}>
          <TouchableOpacity 
            onPress={handleGoHome} 
            style={successStyles.backButton}
            accessible={true}
            accessibilityLabel="Return to home"
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Success Message */}
        <View style={successStyles.successMessageContainer}>
          <View style={successStyles.checkmarkContainer}>
            <Check size={32} color="white" strokeWidth={3} />
          </View>
          
          <TitleText style={successStyles.successTitle}>
            Donation Complete!
          </TitleText>
          <BodyText style={successStyles.successSubtitle}>
            Thank you for your generous support
          </BodyText>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={successStyles.contentArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={successStyles.scrollContent}
        >
          {/* Donation Summary Card */}
          <View style={successStyles.cardWrapper}>
            <View style={successStyles.card}>
              <TitleText style={sharedStyles.sectionTitle}>
                Donation Summary
              </TitleText>
              
              <View style={sharedStyles.summaryRow}>
                <BodyText style={sharedStyles.summaryLabel}>Total Amount</BodyText>
                <BodyText style={sharedStyles.summaryValue}>
                  £{result.total_amount.toFixed(2)}
                </BodyText>
              </View>
              
              {(result.gift_aid_total ?? 0) > 0 && (
                <View style={sharedStyles.summaryRow}>
                  <BodyText style={sharedStyles.summaryLabel}>Gift Aid</BodyText>
                  <BodyText style={successStyles.giftAidValue}>
                    £{result.gift_aid_total?.toFixed(2) ?? '0.00'}
                  </BodyText>
                </View>
              )}
              
              <View style={successStyles.divider} />
              
              <View style={[sharedStyles.summaryRow, sharedStyles.summaryTotal]}>
                <TitleText style={sharedStyles.summaryTotalLabel}>Total Value to Charity</TitleText>
                <TitleText style={sharedStyles.summaryTotalValue}>
                  £{(result.total_amount + (result.gift_aid_total ?? 0)).toFixed(2)}
                </TitleText>
              </View>
            </View>
          </View>

          {/* Receipt Information Card */}
          <View style={successStyles.cardWrapper}>
            <View style={successStyles.card}>
              <TitleText style={sharedStyles.sectionTitle}>
                Receipt Details
              </TitleText>
              
              {result.receipts && result.receipts.length > 0 ? (
                result.receipts?.map((receipt: any, index: number) => (
                  <View key={receipt?.receipt_id || index} style={successStyles.receiptCard}>
                    <View style={successStyles.receiptHeader}>
                      <Receipt size={20} color={Colors.primary} />
                      <Text style={successStyles.receiptId}>
                        {receipt?.receipt_id || `ISKLDN-${result.transaction_id}`}
                      </Text>
                    </View>
                    <View style={successStyles.receiptDetails}>
                      <BodyText style={successStyles.receiptDate}>
                        Date: {new Date(receipt?.receipt_date || result.payment_timestamp).toLocaleDateString('en-GB')}
                      </BodyText>
                      <BodyText style={successStyles.receiptAmount}>
                        Amount: £{(receipt?.total_amount || result.total_amount).toFixed(2)}
                      </BodyText>
                      <View style={successStyles.emailStatus}>
                        {receipt?.email_sent !== false ? (
                          <>
                            <Mail size={16} color={Colors.success} />
                            <Text style={successStyles.emailSent}>
                              Email Receipt Sent
                            </Text>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={16} color={Colors.warning} />
                            <Text style={successStyles.emailPending}>
                              Email pending
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={successStyles.receiptCard}>
                  <View style={successStyles.receiptHeader}>
                    <Receipt size={20} color={Colors.primary} />
                    <Text style={successStyles.receiptId}>
                      ISKLDN-{result.transaction_id}
                    </Text>
                  </View>
                  <View style={successStyles.receiptDetails}>
                    <BodyText style={successStyles.receiptDate}>
                      Date: {new Date(result.payment_timestamp).toLocaleDateString('en-GB')}
                    </BodyText>
                    <BodyText style={successStyles.receiptAmount}>
                      Amount: £{result.total_amount.toFixed(2)}
                    </BodyText>
                    <View style={successStyles.emailStatus}>
                      <Check size={16} color={Colors.success} />
                      <Text style={successStyles.emailSent}>
                        Receipt will be emailed
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* What's Next Card */}
          <View style={successStyles.cardWrapper}>
            <View style={successStyles.card}>
              <TitleText style={sharedStyles.sectionTitle}>
                What's Next?
              </TitleText>
              <View style={successStyles.listContainer}>
                <View style={successStyles.listItem}>
                  <View style={successStyles.bullet} />
                  <BodyText style={successStyles.listText}>
                    You will receive email receipts for tax purposes
                  </BodyText>
                </View>
                <View style={successStyles.listItem}>
                  <View style={successStyles.bullet} />
                  <BodyText style={successStyles.listText}>
                    Your donation will be processed within 24 hours
                  </BodyText>
                </View>
                <View style={successStyles.listItem}>
                  <View style={successStyles.bullet} />
                  <BodyText style={successStyles.listText}>
                    Thank you for supporting ISKCON London Temple
                  </BodyText>
                </View>
                <View style={successStyles.listItem}>
                  <View style={successStyles.bullet} />
                  <BodyText style={successStyles.listText}>
                    Your generosity helps maintain our sacred space
                  </BodyText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={successStyles.footer}>
          <TouchableOpacity 
            style={successStyles.doneButton}
            onPress={handleDonateAgain}
            accessible={true}
            accessibilityLabel="Make another donation"
            accessibilityRole="button"
            activeOpacity={0.9}
          >
            <Text style={successStyles.doneButtonText}>
              Donate Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SuccessScreen;