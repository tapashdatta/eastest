// services/GDPRService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GDPRSettings {
  pushNotifications: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
  lastUpdated: string;
  version: string;
}

export interface GDPRConsentRecord {
  settings: GDPRSettings;
  timestamp: string;
  userAgent: string;
  ipAddress?: string;
  consentMethod: 'settings' | 'onboarding' | 'update';
}

class GDPRServiceClass {
  private readonly STORAGE_KEY = '@gdpr_settings';
  private readonly CONSENT_HISTORY_KEY = '@gdpr_consent_history';
  private readonly API_ENDPOINT = '/api/gdpr'; // Your backend endpoint

  /**
   * Get current GDPR settings
   */
  async getGDPRSettings(): Promise<GDPRSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default settings if none exist
      return this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading GDPR settings:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Save GDPR settings with consent tracking
   */
  async saveGDPRSettings(
    settings: Omit<GDPRSettings, 'lastUpdated' | 'version'>,
    consentMethod: GDPRConsentRecord['consentMethod'] = 'settings'
  ): Promise<boolean> {
    try {
      const fullSettings: GDPRSettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      };

      // Save locally
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(fullSettings));

      // Record consent for compliance
      await this.recordConsent(fullSettings, consentMethod);

      // Sync with backend
      await this.syncWithBackend(fullSettings);

      return true;
    } catch (error) {
      console.error('Error saving GDPR settings:', error);
      return false;
    }
  }

  /**
   * Record consent for GDPR compliance tracking
   */
  private async recordConsent(
    settings: GDPRSettings,
    consentMethod: GDPRConsentRecord['consentMethod']
  ): Promise<void> {
    try {
      const consentRecord: GDPRConsentRecord = {
        settings,
        timestamp: new Date().toISOString(),
        userAgent: 'React Native App', // You might want to get actual user agent
        consentMethod,
      };

      // Store consent history locally
      const historyKey = this.CONSENT_HISTORY_KEY;
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history: GDPRConsentRecord[] = existingHistory 
        ? JSON.parse(existingHistory) 
        : [];
      
      history.push(consentRecord);
      
      // Keep only last 10 consent records locally
      const limitedHistory = history.slice(-10);
      await AsyncStorage.setItem(historyKey, JSON.stringify(limitedHistory));

      // Send to backend for compliance
      await this.sendConsentToBackend(consentRecord);
    } catch (error) {
      console.error('Error recording consent:', error);
      // Don't throw - consent recording failure shouldn't block user
    }
  }

  /**
   * Get consent history for transparency
   */
  async getConsentHistory(): Promise<GDPRConsentRecord[]> {
    try {
      const stored = await AsyncStorage.getItem(this.CONSENT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading consent history:', error);
      return [];
    }
  }

  /**
   * Check if user has given any marketing consent
   */
  async hasMarketingConsent(): Promise<boolean> {
    const settings = await this.getGDPRSettings();
    return settings.emailMarketing || settings.smsMarketing || settings.pushNotifications;
  }

  /**
   * Revoke all marketing consent (Right to withdraw)
   */
  async revokeAllConsent(): Promise<boolean> {
    const revokedSettings = {
      pushNotifications: false,
      emailMarketing: false,
      smsMarketing: false,
    };
    
    return await this.saveGDPRSettings(revokedSettings, 'update');
  }

  /**
   * Delete all GDPR data (Right to erasure)
   */
  async deleteAllGDPRData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([this.STORAGE_KEY, this.CONSENT_HISTORY_KEY]);
      
      // Notify backend to delete user's GDPR records
      await this.requestDataDeletion();
      
      return true;
    } catch (error) {
      console.error('Error deleting GDPR data:', error);
      return false;
    }
  }

  /**
   * Export user's GDPR data (Right to data portability)
   */
  async exportGDPRData(): Promise<{
    settings: GDPRSettings;
    consentHistory: GDPRConsentRecord[];
    exportDate: string;
  }> {
    const settings = await this.getGDPRSettings();
    const consentHistory = await this.getConsentHistory();
    
    return {
      settings,
      consentHistory,
      exportDate: new Date().toISOString(),
    };
  }

  /**
   * Sync settings with backend
   */
  private async syncWithBackend(settings: GDPRSettings): Promise<void> {
    try {
      // Replace with your actual API call
      const response = await fetch(`${this.API_ENDPOINT}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth headers here
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Backend sync failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Backend sync error:', error);
      // Don't throw - offline functionality should still work
    }
  }

  /**
   * Send consent record to backend for compliance
   */
  private async sendConsentToBackend(consent: GDPRConsentRecord): Promise<void> {
    try {
      await fetch(`${this.API_ENDPOINT}/consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth headers here
        },
        body: JSON.stringify(consent),
      });
    } catch (error) {
      console.error('Consent recording error:', error);
      // Store locally for later sync if backend fails
      await this.storeFailedConsent(consent);
    }
  }

  /**
   * Request data deletion from backend
   */
  private async requestDataDeletion(): Promise<void> {
    try {
      await fetch(`${this.API_ENDPOINT}/delete-user-data`, {
        method: 'DELETE',
        headers: {
          // Add your auth headers here
        },
      });
    } catch (error) {
      console.error('Data deletion request failed:', error);
      // You might want to retry this later or notify user
    }
  }

  /**
   * Store failed consent for later sync
   */
  private async storeFailedConsent(consent: GDPRConsentRecord): Promise<void> {
    try {
      const failedKey = '@gdpr_failed_consents';
      const existing = await AsyncStorage.getItem(failedKey);
      const failed = existing ? JSON.parse(existing) : [];
      failed.push(consent);
      await AsyncStorage.setItem(failedKey, JSON.stringify(failed));
    } catch (error) {
      console.error('Error storing failed consent:', error);
    }
  }

  /**
   * Get default GDPR settings
   */
  private getDefaultSettings(): GDPRSettings {
    return {
      pushNotifications: false,
      emailMarketing: false,
      smsMarketing: false,
      lastUpdated: new Date().toISOString(),
      version: '1.0',
    };
  }

  /**
   * Validate settings object
   */
  private validateSettings(settings: any): settings is GDPRSettings {
    return (
      typeof settings === 'object' &&
      typeof settings.pushNotifications === 'boolean' &&
      typeof settings.emailMarketing === 'boolean' &&
      typeof settings.smsMarketing === 'boolean' &&
      typeof settings.lastUpdated === 'string' &&
      typeof settings.version === 'string'
    );
  }

  /**
   * Retry failed consent submissions
   */
  async retryFailedConsents(): Promise<void> {
    try {
      const failedKey = '@gdpr_failed_consents';
      const stored = await AsyncStorage.getItem(failedKey);
      
      if (!stored) return;
      
      const failedConsents: GDPRConsentRecord[] = JSON.parse(stored);
      const retryPromises = failedConsents.map(consent => 
        this.sendConsentToBackend(consent)
      );
      
      await Promise.all(retryPromises);
      
      // Clear failed consents after successful retry
      await AsyncStorage.removeItem(failedKey);
    } catch (error) {
      console.error('Error retrying failed consents:', error);
    }
  }
}

// Export singleton instance
export const GDPRService = new GDPRServiceClass();

// For testing purposes, export the class as well
export { GDPRServiceClass };