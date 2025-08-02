import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Device Manager Service - Handles device information collection for Expo
 */
export interface DeviceInfo {
  device_id: string;
  device_name?: string;
  device_type?: string;
  device_model?: string;
  device_brand?: string;
  os_name?: string;
  os_version?: string;
  app_version?: string;
  push_token?: string;
}

class DeviceManagerService {
  private deviceIdKey = 'device_id';

  /**
   * Get complete device information for authentication
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Get or generate device ID
      const deviceId = await this.getOrGenerateDeviceId();

      // Get device name with proper error handling
      const deviceName = await this.getDeviceName();

      // Get device type
      const deviceType = this.getDeviceType();

      // Get app version safely
      const appVersion = await this.getAppVersion();

      const deviceInfo = {
        device_id: deviceId,
        device_name: deviceName,
        device_type: deviceType,
        device_model: Device.modelName || 'Unknown Model',
        device_brand: Device.brand || (Platform.OS === 'ios' ? 'Apple' : 'Unknown Brand'),
        os_name: Device.osName || Platform.OS,
        os_version: Device.osVersion || Platform.Version?.toString() || 'Unknown',
        app_version: appVersion,
      };

      return deviceInfo;
      
    } catch (error) {
      // Return minimal fallback info
      return this.getFallbackDeviceInfo();
    }
  }

  /**
   * Get or generate a persistent device ID
   */
  private async getOrGenerateDeviceId(): Promise<string> {
    try {
      // Try to get stored device ID first
      const storedId = await AsyncStorage.getItem(this.deviceIdKey);
      if (storedId) {
        return storedId;
      }

      // Generate a new device ID
      let newId: string;

      // Try different methods to get a unique ID
      try {
        // Method 1: Try Application.getInstallationIdAsync (check if it exists)
        if ('getInstallationIdAsync' in Application && typeof Application.getInstallationIdAsync === 'function') {
          newId = await (Application as any).getInstallationIdAsync();
        } else {
          throw new Error('getInstallationIdAsync not available');
        }
      } catch (installationError) {
        // Method 2: Try to get Android ID or iOS identifier
        try {
          if (Platform.OS === 'android' && 'getAndroidId' in Application) {
            const androidId = await (Application as any).getAndroidId();
            newId = androidId || this.generateRandomId();
          } else {
            newId = this.generateRandomId();
          }
        } catch (platformError) {
          newId = this.generateRandomId();
        }
      }

      // Store the new ID
      await AsyncStorage.setItem(this.deviceIdKey, newId);
      return newId;
      
    } catch (error) {
      const fallbackId = this.generateRandomId();
      return fallbackId;
    }
  }

  /**
   * Generate a random device ID
   */
  private generateRandomId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const id = `${Platform.OS}_${timestamp}_${random}`;
    return id;
  }

  /**
   * Get device name with proper error handling
   */
  private async getDeviceName(): Promise<string> {
    try {
      // Check if the function exists and is callable (using type assertion)
      if ('getDeviceNameAsync' in Device && typeof (Device as any).getDeviceNameAsync === 'function') {
        try {
          const name = await (Device as any).getDeviceNameAsync();
          
          if (name && name.trim()) {
            return name.trim();
          }
        } catch (asyncError) {
          // Continue to fallback
        }
      }

      // Fallback: construct name from available properties
      const brand = Device.brand || '';
      const model = Device.modelName || '';
      
      if (brand && model) {
        const constructedName = `${brand} ${model}`;
        return constructedName;
      } else if (brand) {
        return brand;
      } else if (model) {
        return model;
      }

      // Platform-specific fallback
      const platformName = this.getPlatformFallbackName();
      return platformName;
      
    } catch (error) {
      return 'Mobile Device';
    }
  }

  /**
   * Get platform-specific fallback name
   */
  private getPlatformFallbackName(): string {
    switch (Platform.OS) {
      case 'ios':
        return 'iOS Device';
      case 'android':
        return 'Android Device';
      case 'web':
        return 'Web Browser';
      default:
        return 'Unknown Device';
    }
  }

  /**
   * Get device type with better detection
   */
  private getDeviceType(): string {
    try {
      // Check for web environment first (type-safe way)
      if ((Platform.OS as string) === 'web') {
        return 'web';
      }

      // Map Expo device types to our types
      if (Device.deviceType === Device.DeviceType.PHONE) {
        return 'mobile';
      } else if (Device.deviceType === Device.DeviceType.TABLET) {
        return 'tablet';
      } else if (Device.deviceType === Device.DeviceType.DESKTOP) {
        return 'desktop';
      } else if (Device.deviceType === Device.DeviceType.TV) {
        return 'tv';
      }

      // Default fallback
      const fallbackType = (Platform.OS as string) === 'web' ? 'web' : 'mobile';
      return fallbackType;
      
    } catch (error) {
      return (Platform.OS as string) === 'web' ? 'web' : 'mobile';
    }
  }

  /**
   * Get app version safely
   */
  private async getAppVersion(): Promise<string> {
    try {
      const nativeVersion = Application.nativeApplicationVersion;
      const buildVersion = Application.nativeBuildVersion;
      
      if (nativeVersion && buildVersion) {
        return `${nativeVersion} (${buildVersion})`;
      } else if (nativeVersion) {
        return nativeVersion;
      } else {
        return '1.0.0';
      }
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * Get fallback device info when errors occur
   */
  private getFallbackDeviceInfo(): DeviceInfo {
    const deviceId = this.generateRandomId();
    
    // Try to store this fallback ID for consistency
    AsyncStorage.setItem(this.deviceIdKey, deviceId).catch(() => {
      // Silently fail
    });
    
    const fallbackInfo = {
      device_id: deviceId,
      device_name: this.getPlatformFallbackName(),
      device_type: (Platform.OS as string) === 'web' ? 'web' : 'mobile',
      device_model: 'Unknown Model',
      device_brand: Platform.OS === 'ios' ? 'Apple' : 'Unknown Brand',
      os_name: Platform.OS,
      os_version: Platform.Version?.toString() || 'Unknown',
      app_version: '1.0.0',
    };
    
    return fallbackInfo;
  }

  /**
   * Get device display name for UI
   */
  getDeviceDisplayName(): string {
    try {
      const brand = Device.brand || '';
      const model = Device.modelName || '';
      
      if (brand && model) {
        return `${brand} ${model}`;
      } else if (brand) {
        return brand;
      } else if (model) {
        return model;
      } else {
        return this.getPlatformFallbackName();
      }
    } catch (error) {
      return 'Mobile Device';
    }
  }
}

export const deviceManager = new DeviceManagerService();