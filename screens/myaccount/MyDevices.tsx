import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { HeadlineText, TitleText, BodyText, LabelText, CaptionText } from '@/components/Text';
import { useAuth, useDeviceManagement } from '@/contexts/AuthContext';
import { ArrowLeft, Smartphone, Trash2, RefreshCw, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DeviceResponse } from '@/services/WordPressAPI';
import Logger from '@/utils/Logger';
import * as Device from 'expo-device';


interface DevicesScreenProps {
  onBack?: () => void;
}

export default function DevicesScreen({ onBack }: DevicesScreenProps) {
  const { isAuthenticated } = useAuth();
  const { getUserDevices, deactivateDevice } = useDeviceManagement();
  const insets = useSafeAreaInsets();
  
  const [devices, setDevices] = useState<DeviceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  // Get current device ID on mount
  useEffect(() => {
    const getCurrentDeviceId = async () => {
      try {
        const deviceId = Device.modelId || Device.modelName || 'unknown';
        setCurrentDeviceId(deviceId);
        Logger.debug('Current device ID set', { deviceId });
      } catch (error) {
        Logger.error('Error getting current device ID', error);
      }
    };
    
    getCurrentDeviceId();
  }, []);

  // Load devices on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadDevices();
    }
  }, [isAuthenticated]);

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const loadDevices = async () => {
    try {
      setError(null);
      setLoading(true);
      
      Logger.debug('Loading user devices');
      const devicesList = await getUserDevices();
      
      Logger.debug('Devices loaded successfully', { count: devicesList.length });
      setDevices(devicesList);
    } catch (error) {
      Logger.error('Error loading devices', error);
      setError('Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDevices();
  };

  const handleDeactivateDevice = (deviceId: string, deviceName: string) => {
    if (deviceId === currentDeviceId) {
      Alert.alert(
        'Cannot Deactivate',
        'You cannot deactivate the device you are currently using.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Deactivate Device',
      `Are you sure you want to deactivate "${deviceName}"? This will log out that device.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Deactivate', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              Logger.debug('Deactivating device', { deviceId, deviceName });
              
              const success = await deactivateDevice(deviceId);
              
              if (success) {
                setDevices(devices.filter(d => d.device_id !== deviceId));
                Alert.alert('Success', 'Device has been deactivated successfully.');
                Logger.info('Device deactivated successfully', { deviceId });
              } else {
                Alert.alert('Error', 'Failed to deactivate device. Please try again.');
                Logger.warn('Device deactivation failed', { deviceId });
              }
            } catch (error) {
              Logger.error('Error deactivating device', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderDeviceItem = ({ item }: { item: DeviceResponse }) => {
    const isCurrentDevice = item.device_id === currentDeviceId;
    
    return (
      <View style={[
        styles.deviceCard,
        isCurrentDevice && styles.currentDeviceCard
      ]}>
        <View style={styles.deviceIconContainer}>
          <Smartphone size={24} color={Colors.primary} />
        </View>
        
        <View style={styles.deviceInfo}>
          <View style={styles.deviceHeader}>
            <TitleText style={styles.deviceName}>
              {item.device_name || 'Unknown Device'}
            </TitleText>
            {isCurrentDevice && (
              <View style={styles.currentDeviceBadge}>
                <CaptionText style={styles.currentDeviceText}>Current</CaptionText>
              </View>
            )}
          </View>
          
          <BodyText style={styles.deviceModel}>
            {item.os_name || 'Unknown OS'} • {item.device_type || 'Unknown'}
          </BodyText>
          
          <View style={styles.deviceMeta}>
            <CaptionText style={styles.deviceMetaText}>
              Last active: {item.last_seen_human || 'Unknown'}
            </CaptionText>
            <CaptionText style={styles.deviceMetaText}>
              Status: {item.is_active ? 'Active' : 'Inactive'}
            </CaptionText>
          </View>
        </View>
        
        {!isCurrentDevice && (
          <TouchableOpacity 
            style={styles.deactivateButton}
            onPress={() => handleDeactivateDevice(item.device_id, item.device_name || 'this device')}
          >
            <Trash2 size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Smartphone size={64} color={Colors.textSecondary} />
      <TitleText style={styles.emptyTitle}>No Devices Found</TitleText>
      <BodyText style={styles.emptyText}>
        You don't have any registered devices yet.
      </BodyText>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <AlertTriangle size={64} color={Colors.error} />
      <TitleText style={styles.errorTitle}>Error Loading Devices</TitleText>
      <BodyText style={styles.errorText}>{error}</BodyText>
      
      <TouchableOpacity style={styles.retryButton} onPress={loadDevices}>
        <RefreshCw size={16} color={Colors.textLight} />
        <LabelText style={styles.retryButtonText}>Try Again</LabelText>
      </TouchableOpacity>
    </View>
  );

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <HeadlineText style={styles.headerTitle}>My Devices</HeadlineText>
        </View>
        
        <View style={styles.emptyContainer}>
          <Smartphone size={64} color={Colors.textSecondary} />
          <TitleText style={styles.emptyTitle}>Sign In Required</TitleText>
          <BodyText style={styles.emptyText}>
            Please sign in to view your registered devices.
          </BodyText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <HeadlineText style={styles.headerTitle}>My Devices</HeadlineText>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <BodyText style={styles.loadingText}>Loading your devices...</BodyText>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={devices}
          renderItem={renderDeviceItem}
          keyExtractor={(item) => item.device_id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Info Section */}
      <View style={styles.infoSection}>
        <TitleText style={styles.infoTitle}>About Device Management</TitleText>
        <BodyText style={styles.infoText}>
          For security reasons, we keep track of devices used to access your account. You can deactivate devices you no longer use to enhance your account security.
        </BodyText>
        <BodyText style={styles.infoText}>
          Deactivating a device will log it out immediately. You cannot deactivate the device you are currently using.
        </BodyText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...Typography.headlineSmall,
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Balance with back button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  deviceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentDeviceCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.highlight,
  },
  deviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginRight: 8,
  },
  currentDeviceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currentDeviceText: {
    color: Colors.textLight,
    fontSize: 10,
  },
  deviceModel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  deviceMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deviceMetaText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  deactivateButton: {
    padding: 8,
    alignSelf: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    ...Typography.titleLarge,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    ...Typography.titleLarge,
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 15,
  },
  retryButtonText: {
    color: Colors.textLight,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
});