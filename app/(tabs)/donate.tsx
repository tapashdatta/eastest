// app/(tabs)/donate.tsx - Updated with Simplified System
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Colors } from '@/constants/Colors';
import { RefreshCw, AlertCircle } from 'lucide-react-native';
import { usePaymentConfig } from '@/services/PaymentService';
import { useSystemStatus } from '@/components/AppCoordinator';

// Import donation screens
import DonateScreen from '@/screens/donation/DonateScreen';
import CartScreen from '@/screens/donation/CartScreen';
import PaymentScreen from '@/screens/donation/PaymentScreen';
import SuccessScreen from '@/screens/donation/SuccessScreen';

// ================================
// DONATION STACK NAVIGATION
// ================================

export type DonationStackParamList = {
  Donate: undefined;
  Cart: undefined;
  Payment: undefined;
  Success: { result: any };
};

const Stack = createNativeStackNavigator<DonationStackParamList>();

// ================================
// ERROR SCREEN COMPONENT
// ================================

const DonationErrorScreen: React.FC<{
  title: string;
  message: string;
  onRetry?: () => void;
  showContactSupport?: boolean;
}> = ({ title, message, onRetry, showContactSupport = false }) => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.background,
    padding: 20 
  }}>
    <AlertCircle size={48} color={Colors.error} style={{ marginBottom: 16 }} />
    
    <Text style={{ 
      fontSize: 18,
      color: Colors.error,
      textAlign: 'center',
      marginBottom: 12,
      fontWeight: '600'
    }}>
      {title}
    </Text>
    
    <Text style={{ 
      fontSize: 14,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20
    }}>
      {message}
    </Text>
    
    {onRetry && (
      <TouchableOpacity
        onPress={onRetry}
        style={{
          backgroundColor: Colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
          marginBottom: showContactSupport ? 12 : 0,
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <RefreshCw size={16} color={Colors.textLight} style={{ marginRight: 8 }} />
        <Text style={{ color: Colors.textLight, fontSize: 16, fontWeight: '600' }}>
          Try Again
        </Text>
      </TouchableOpacity>
    )}
    
    {showContactSupport && (
      <Text style={{
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic'
      }}>
        If this issue persists, please contact our support team
      </Text>
    )}
  </View>
);

// ================================
// DONATION NAVIGATOR COMPONENT
// ================================

const DonationNavigator: React.FC = () => {
  const { config, isReady, error, refreshConfig } = usePaymentConfig();
  const { isSystemReady, canMakePayments } = useSystemStatus();

  // Show loading state while system is initializing
  if (!isSystemReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors.background 
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ 
          marginTop: 16, 
          color: Colors.textSecondary,
          fontSize: 16 
        }}>
          Setting up donation system...
        </Text>
      </View>
    );
  }

  // Show error if payment system is not available
  if (!canMakePayments || !isReady || error) {
    return (
      <DonationErrorScreen
        title="Donation System Unavailable"
        message={error || "The donation system is temporarily unavailable. Our team has been notified and is working to resolve this issue."}
        onRetry={refreshConfig}
        showContactSupport={true}
      />
    );
  }

  // Show error if Stripe is not properly configured
  if (!config?.stripe_enabled || !config?.publishable_key) {
    return (
      <DonationErrorScreen
        title="Payment System Not Configured"
        message="The payment system is not properly configured. Please contact our support team for assistance."
        onRetry={refreshConfig}
        showContactSupport={true}
      />
    );
  }

  // All systems ready - render donation navigator
  return (
    <Stack.Navigator
      initialRouteName="Donate"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen 
        name="Donate" 
        component={DonateScreen}
        options={{
          title: 'Donate',
          gestureEnabled: false, // Don't allow swipe back from main donate screen
        }}
      />
      
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Cart',
          gestureEnabled: true,
        }}
      />
      
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{
          title: 'Checkout',
          gestureEnabled: false, // Don't allow accidental swipe back during payment
        }}
      />
      
      <Stack.Screen 
        name="Success" 
        component={SuccessScreen}
        options={{
          title: 'Success',
          gestureEnabled: false, // Don't allow swipe back from success screen
        }}
      />
    </Stack.Navigator>
  );
};

// ================================
// MAIN DONATE TAB COMPONENT
// ================================

export default function DonateTab() {
  console.log('🎯 DonateTab component rendering...');

  return <DonationNavigator />;
}

// ================================
// DEBUGGING HELPERS
// ================================

// Debug component for development
const DonationDebugInfo: React.FC = () => {
  const { config, isReady, publishableKey } = usePaymentConfig();
  const { isSystemReady, canMakePayments, getSystemHealth } = useSystemStatus();

  if (!__DEV__) {
    return null;
  }

  const systemHealth = getSystemHealth();

  return (
    <View style={{ 
      position: 'absolute',
      top: 100,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: 10,
      borderRadius: 4,
      maxWidth: 200,
      zIndex: 9999
    }}>
      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>
        DEBUG INFO
      </Text>
      <Text style={{ color: 'white', fontSize: 8 }}>
        System Ready: {isSystemReady ? '✅' : '❌'}{'\n'}
        Can Pay: {canMakePayments ? '✅' : '❌'}{'\n'}
        Payment Ready: {isReady ? '✅' : '❌'}{'\n'}
        Has Key: {publishableKey ? '✅' : '❌'}{'\n'}
        Test Mode: {config?.test_mode ? '✅' : '❌'}{'\n'}
        Currency: {config?.currency || 'N/A'}{'\n'}
        Health: {JSON.stringify(systemHealth, null, 1)}
      </Text>
    </View>
  );
};

// Export debug component for development use
export { DonationDebugInfo };