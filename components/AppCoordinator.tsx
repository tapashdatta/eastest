// providers/AppCoordinator.tsx - FIXED VERSION
import React, { useState, useEffect, ReactNode } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EventProvider } from '@/contexts/EventContext'; // FIXED: Single provider
import { ContentProvider } from '@/contexts/ContentContext';
import { DonationProvider } from '@/contexts/DonationContext';
import { wordPressAPI } from '@/services/WordPressAPI';
import { usePayment } from '@/services/PaymentService';
import Logger from '@/utils/Logger';

// ================================
// BACKGROUND SERVICE CHECKER
// ================================

enum StartupPhase {
  INITIALIZING = 'initializing',
  CHECKING_SERVICES = 'checking_services',
  APP_READY = 'app_ready',
  ERROR = 'error'
}

interface AppCoordinatorProps {
  children: ReactNode;
}

// ================================
// BACKGROUND STARTUP MANAGER (NO UI OVERRIDE)
// ================================

const BackgroundStartupManager: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { status: authStatus, isInitialized } = useAuth();
  const [phase, setPhase] = useState<StartupPhase>(StartupPhase.INITIALIZING);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    performBackgroundStartup();
  }, []);

  const performBackgroundStartup = async () => {
    try {
      Logger.info('Background startup process began');
      
      // Start background checks immediately - don't wait for anything
      Logger.debug('Starting background service checks...');
      setPhase(StartupPhase.CHECKING_SERVICES);
      
      // Test API connection in background (non-blocking)
      setTimeout(async () => {
        try {
          const connectionTest = await Promise.race([
            wordPressAPI.testConnection(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Connection timeout')), 10000)
            )
          ]) as any;
          
          if (connectionTest.success) {
            Logger.info('Backend services connected successfully');
          } else {
            Logger.warn('Backend connection failed, but continuing anyway', connectionTest.details);
          }
        } catch (error) {
          Logger.warn('Backend connection error, but app can work in limited mode', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (errorMessage.includes('not allowed') || errorMessage.includes('permission')) {
            setError('Backend API permissions issue. The app will work in limited mode.');
            setPhase(StartupPhase.ERROR);
            return;
          }
          
          Logger.info('Continuing with limited functionality');
        }

        // Payment service initializes in background automatically
        Logger.debug('Payment service initializing in background');

        // Background startup completed
        setPhase(StartupPhase.APP_READY);
        Logger.info('Background startup completed');
      }, 100); // Small delay to let splash screen render first

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown startup error';
      Logger.error('Background startup failed', error);
      
      setError(errorMessage);
      setPhase(StartupPhase.ERROR);
    }
  };

  // ALWAYS render children - never block the UI
  // The splash screen and normal app flow will handle the user experience
  return <>{children}</>;
};

// ================================
// MAIN APP COORDINATOR - FIXED
// ================================

export const AppCoordinator: React.FC<AppCoordinatorProps> = ({ children }) => {
  return (
    <AuthProvider>
      <EventProvider>
        <DonationProvider>
          <ContentProvider> 
          <BackgroundStartupManager>
            {children}
          </BackgroundStartupManager>
          </ContentProvider>
        </DonationProvider>
      </EventProvider>
    </AuthProvider>
  );
};

// ================================
// SYSTEM STATUS HOOK WITH GRACEFUL HANDLING
// ================================

export const useSystemStatus = () => {
  const { status: authStatus, isAuthenticated, error: authError, isInitialized } = useAuth();
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'limited'>('checking');
  
  // Use the new payment service status
  const { isReady: paymentReady, isInitializing: paymentInitializing } = usePayment();

  useEffect(() => {
    checkSystemStatusGracefully();
  }, []);

  const checkSystemStatusGracefully = async () => {
    // Check API status with graceful handling
    try {
      const connectionTest = await wordPressAPI.testConnection();
      setApiStatus(connectionTest.success ? 'connected' : 'limited');
    } catch {
      setApiStatus('limited'); // Not 'error' - just limited functionality
    }
  };

  return {
    // Always consider system ready for graceful degradation
    isSystemReady: authStatus !== 'initializing',
    
    // Service status
    authStatus,
    isAuthenticated,
    authError,
    isInitialized,
    
    apiStatus,
    isApiConnected: apiStatus === 'connected',
    
    // Updated payment status
    paymentStatus: paymentInitializing ? 'checking' : paymentReady ? 'ready' : 'limited',
    canMakePayments: paymentReady || paymentInitializing, // Allow payments while initializing
    
    // Actions
    refreshSystemStatus: checkSystemStatusGracefully,
    
    // Helper methods
    getSystemHealth: () => ({
      overall: authStatus !== 'initializing',
      auth: authStatus !== 'error',
      api: apiStatus !== 'limited',
      payment: paymentReady,
    }),
    
    // Graceful status checks
    isLimitedMode: apiStatus === 'limited',
    canMakeDonations: true, // Always allow donations - payment service handles errors gracefully
    canRegisterForEvents: true, // Always allow event registration - service handles errors gracefully
    hasBackendConnection: apiStatus === 'connected',
  };
};

// ================================
// OPTIONAL: ERROR BANNER COMPONENT
// ================================
// You can use this component anywhere in your app to show connection status
export const ConnectionStatusBanner: React.FC = () => {
  const { isLimitedMode, hasBackendConnection } = useSystemStatus();
  
  if (hasBackendConnection) {
    return null; // Don't show anything when everything is working
  }
  
  return (
    <View style={{
      backgroundColor: '#FFF3CD',
      borderBottomWidth: 1,
      borderBottomColor: '#FFE69C',
      paddingHorizontal: 16,
      paddingVertical: 8,
    }}>
      <Text style={{
        fontSize: 12,
        color: '#856404',
        textAlign: 'center',
      }}>
        Limited connectivity - some features may not be available
      </Text>
    </View>
  );
};

export default AppCoordinator;