// app/_layout.tsx - Production ready version
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
//import ProfileAvatar from '@/screens/myaccount/ProfileAvatar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppCoordinator } from '@/components/AppCoordinator';
import { usePaymentConfig } from '@/services/PaymentService';
import Logger from '@/utils/Logger';

// Keep the splash screen visible until we're completely ready
SplashScreen.preventAutoHideAsync();

// ================================
// LOADING COMPONENT
// ================================
const LoadingView = ({ message }: { message: string }) => (
  <View style={{ 
    flex: 1, 
    backgroundColor: '#F8FAF9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  }}>
    <ActivityIndicator size="large" color="#7C9885" style={{ marginBottom: 16 }} />
    <Text style={{ 
      color: '#7C9885', 
      fontSize: 16,
      textAlign: 'center',
      fontWeight: '500',
    }}>
      {message}
    </Text>
  </View>
);

// ================================
// STRIPE PROVIDER WRAPPER
// ================================
const StripeProviderWrapper: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { publishableKey, isReady, config } = usePaymentConfig();
  
  // Don't render Stripe provider until we have a valid key
  if (!isReady || !publishableKey) {
    return children;
  }

  try {
    return (
      <StripeProvider 
        publishableKey={publishableKey}
        merchantIdentifier="merchant.com.iskconlondon.app"
        threeDSecureParams={{
          timeout: 5,
        }}
      >
        {children}
      </StripeProvider>
    );
  } catch (error) {
    Logger.error('Stripe provider error', error);
    return children; // Fallback to children without Stripe
  }
};

// ================================
// ERROR FALLBACK COMPONENT
// ================================
const ErrorFallback = ({ error }: { error: Error | string }) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#F8FAF9',
      padding: 20 
    }}>
      <Text style={{ 
        fontSize: 24, 
        color: '#7C9885', 
        marginBottom: 16,
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        ISKCON London
      </Text>
      <Text style={{ 
        fontSize: 18, 
        color: '#333', 
        marginBottom: 20, 
        textAlign: 'center' 
      }}>
        App Loading Error
      </Text>
      <Text style={{ 
        fontSize: 14, 
        color: '#666', 
        marginBottom: 10, 
        textAlign: 'center',
        lineHeight: 20 
      }}>
        {error instanceof Error ? error.message : String(error)}
      </Text>
      <Text style={{ 
        fontSize: 12, 
        color: '#999', 
        textAlign: 'center',
        fontStyle: 'italic' 
      }}>
        Please restart the app or contact support if this persists.
      </Text>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
    </View>
  </GestureHandlerRootView>
);

// ================================
// MAIN ROOT LAYOUT
// ================================
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    'InstrumentSans-Regular': InstrumentSans_400Regular,
    'InstrumentSans-Medium': InstrumentSans_500Medium,
    'InstrumentSans-SemiBold': InstrumentSans_600SemiBold,
    'InstrumentSans-Bold': InstrumentSans_700Bold,
  });

  // ================================
  // INITIALIZATION
  // ================================
  useEffect(() => {
    try {
      if (Logger && Logger.info) {
        Logger.info('ISKCON London App started', {
          platform: Platform.OS,
          isDev: __DEV__,
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }, 'App', 'startup');
      }
    } catch (error) {
      // Silent fallback - no console.error in production
    }
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Short delay to ensure smooth transition
        if (Platform.OS !== 'web') {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        if (Logger && Logger.warn) {
          Logger.warn('App preparation warning', {
            error: error instanceof Error ? error.message : String(error),
            platform: Platform.OS
          }, 'App', 'preparation_warning');
        }
      } finally {
        setAppIsReady(true);
      }
    }
    
    if (fontsLoaded || fontError) {
      prepare();
    }
  }, [fontsLoaded, fontError]);

  // Hide splash screen after everything is ready
  useEffect(() => {
    if (appIsReady) {
      const hideTimer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
      
      if (Logger && Logger.info) {
        Logger.info('App ready and splash screen scheduled to hide', {
          fontsLoaded: !!fontsLoaded,
          fontError: !!fontError,
          platform: Platform.OS,
          readyTime: new Date().toISOString()
        }, 'App', 'ready');
      }
      
      return () => clearTimeout(hideTimer);
    }
  }, [appIsReady, fontsLoaded]);

  // ================================
  // ERROR HANDLING
  // ================================
  useEffect(() => {
    if (fontError) {
      if (Logger && Logger.error) {
        Logger.error('Font loading failed', {
          error: fontError.message,
          platform: Platform.OS
        }, 'App', 'font_error');
      }
    }
  }, [fontError]);

  // ================================
  // LOADING STATES
  // ================================
  if (!fontsLoaded && !fontError) {
    return <LoadingView message="Loading fonts..." />;
  }

  if (!appIsReady) {
    return <LoadingView message="Preparing app..." />;
  }

  // ================================
  // APP CONTENT
  // ================================
  const AppContent = (): React.ReactElement => (
    <View style={{ flex: 1, backgroundColor: '#F8FAF9' }}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="splash" 
          options={{
            headerShown: false,
            animation: 'none',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="(auth)" 
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="settings" 
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_right',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      
    </View>
  );

  // ================================
  // MAIN RENDER WITH ERROR HANDLING
  // ================================
  try {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#F8FAF9' }}>
        <ErrorBoundary>
            <AppCoordinator>
              <StripeProviderWrapper>
                <AppContent />
              </StripeProviderWrapper>
            </AppCoordinator>
        </ErrorBoundary>
      </GestureHandlerRootView>
    );
  } catch (error) {
    return <ErrorFallback error={error instanceof Error ? error : 'Unknown error occurred'} />;
  }
}