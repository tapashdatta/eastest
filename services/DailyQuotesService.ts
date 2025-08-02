// services/DailyQuotesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, QuoteSettings, QuoteStatus, DailyQuote } from '@/types/quotes';
import { quotesData } from '@/config/quotesData';

/**
 * Enhanced Daily Quotes Service with leap year support
 * Maintains compatibility with existing splash screen integration
 */
export class DailyQuotesService {
  
  // ================================
  // PUBLIC METHODS (Compatible with existing splash screen)
  // ================================

  /**
   * Check if daily quote should be shown today
   * Used by splash screen - maintains existing interface
   */
  static async shouldShowQuoteToday(): Promise<boolean> {
    try {
      const isEnabled = await this.getDailyQuotesEnabled();
      if (!isEnabled) {
        console.log('📱 Daily quotes are disabled in settings');
        return false;
      }

      const lastShownDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_QUOTE_SHOWN_DATE);
      const today = new Date().toDateString();
      
      if (__DEV__) {
        console.log('📅 Checking quote status:', {
          today,
          lastShownDate,
          shouldShow: lastShownDate !== today
        });
      }
      
      return lastShownDate !== today;
    } catch (error) {
      console.error('Error checking if quote should be shown:', error);
      return false;
    }
  }

  /**
   * Mark quote as shown for today
   * Used by splash screen - maintains existing interface
   */
  static async markQuoteShownToday(): Promise<boolean> {
    try {
      const today = new Date().toDateString();
      const timestamp = new Date().toISOString();
      
      if (__DEV__) {
        console.log('✅ Marking quote as shown for:', today);
      }
      
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LAST_QUOTE_SHOWN_DATE, today],
        [STORAGE_KEYS.LAST_QUOTE_TIMESTAMP, timestamp]
      ]);
      
      return true;
    } catch (error) {
      console.error('Error marking quote as shown:', error);
      return false;
    }
  }

  // ================================
  // SETTINGS MANAGEMENT
  // ================================

  /**
   * Get daily quotes enabled setting
   */
  static async getDailyQuotesEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_QUOTES_ENABLED);
      return value !== null ? JSON.parse(value) : true; // Default to enabled
    } catch (error) {
      console.error('Error getting daily quotes setting:', error);
      return true;
    }
  }

  /**
   * Set daily quotes enabled setting
   */
  static async setDailyQuotesEnabled(enabled: boolean): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_QUOTES_ENABLED, JSON.stringify(enabled));
      
      if (__DEV__) {
        console.log(`📱 Daily quotes ${enabled ? 'enabled' : 'disabled'}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error setting daily quotes setting:', error);
      return false;
    }
  }

  // ================================
  // QUOTE RETRIEVAL WITH LEAP YEAR SUPPORT
  // ================================

  /**
   * Get today's quote with proper leap year handling
   */
  static getTodaysQuote(): DailyQuote {
    const date = new Date();
    return this.getQuoteByDate(date);
  }

  /**
   * Get quote for a specific date with leap year handling
   */
  static getQuoteByDate(date: Date): DailyQuote {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based (0=Jan, 1=Feb, etc.)
    const day = date.getDate();
    
    // Check if it's a leap year
    const isLeapYear = this.isLeapYear(year);
    
    // Special case: February 29th in leap year gets the special leap day quote
    if (isLeapYear && month === 1 && day === 29) {
      if (__DEV__) {
        console.log('🗓️ Leap day detected - showing special leap day quote');
      }
      return quotesData[365]; // Index 365 = Leap day quote
    }
    
    // Calculate day of year (1-based)
    const start = new Date(year, 0, 0);
    const diff = date.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    let quoteIndex: number;
    
    if (isLeapYear && dayOfYear > 59) {
      // After Feb 29 in leap year - shift back by 1 to maintain alignment
      quoteIndex = dayOfYear - 2; // -1 for 0-based index, -1 for leap day adjustment
    } else {
      // Normal case (non-leap year or before/on Feb 29 in leap year)
      quoteIndex = dayOfYear - 1; // Convert to 0-based index
    }
    
    // Ensure we stay within bounds for regular quotes (0-364)
    quoteIndex = Math.max(0, Math.min(364, quoteIndex));
    
    return quotesData[quoteIndex] || quotesData[0];
  }

  /**
   * Get quote by day number (1-365, or 366 for leap day)
   */
  static getQuoteByDay(dayNumber: number, isLeapDay: boolean = false): DailyQuote {
    if (isLeapDay && dayNumber === 366) {
      return quotesData[365]; // Special leap day quote
    }
    const index = Math.max(0, Math.min(364, dayNumber - 1));
    return quotesData[index] || quotesData[0];
  }

  /**
   * Get the special leap day quote
   */
  static getLeapDayQuote(): DailyQuote {
    return quotesData[365];
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Check if a year is a leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Check if quote was already shown today
   */
  static async wasQuoteShownToday(): Promise<boolean> {
    try {
      const lastShownDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_QUOTE_SHOWN_DATE);
      const today = new Date().toDateString();
      return lastShownDate === today;
    } catch (error) {
      console.error('Error checking if quote was shown today:', error);
      return false;
    }
  }

  /**
   * Force show quote (for testing/debugging)
   */
  static async forceShowQuoteToday(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_QUOTE_SHOWN_DATE);
      if (__DEV__) {
        console.log('🔄 Forced quote to show - removed last shown date');
      }
      return true;
    } catch (error) {
      console.error('Error forcing quote to show:', error);
      return false;
    }
  }

  /**
   * Get comprehensive quote status for debugging
   */
  static async getQuoteStatus(): Promise<QuoteStatus> {
    try {
      const isEnabled = await this.getDailyQuotesEnabled();
      const lastShownDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_QUOTE_SHOWN_DATE);
      const lastTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_QUOTE_TIMESTAMP);
      const today = new Date().toDateString();
      const wasShownToday = lastShownDate === today;
      const shouldShow = await this.shouldShowQuoteToday();

      return {
        isEnabled,
        today,
        lastShownDate,
        lastTimestamp,
        wasShownToday,
        shouldShow,
      };
    } catch (error) {
      console.error('Error getting quote status:', error);
      return {
        isEnabled: true,
        today: new Date().toDateString(),
        lastShownDate: null,
        lastTimestamp: null,
        wasShownToday: false,
        shouldShow: false,
      };
    }
  }

  /**
   * Get all settings as an object
   */
  static async getAllSettings(): Promise<QuoteSettings> {
    try {
      const dailyQuotesEnabled = await this.getDailyQuotesEnabled();
      const lastQuoteShownDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_QUOTE_SHOWN_DATE);
      const lastQuoteTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_QUOTE_TIMESTAMP);
      
      return {
        dailyQuotesEnabled,
        lastQuoteShownDate,
        lastQuoteTimestamp,
      };
    } catch (error) {
      console.error('Error getting all settings:', error);
      return {
        dailyQuotesEnabled: true,
        lastQuoteShownDate: null,
        lastQuoteTimestamp: null,
      };
    }
  }

  /**
   * Clear all settings (for reset functionality)
   */
  static async clearAllSettings(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.DAILY_QUOTES_ENABLED,
        STORAGE_KEYS.LAST_QUOTE_SHOWN_DATE,
        STORAGE_KEYS.LAST_QUOTE_TIMESTAMP,
      ]);
      
      if (__DEV__) {
        console.log('🗑️ All quote settings cleared');
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing settings:', error);
      return false;
    }
  }

  // ================================
  // RANDOM BACKGROUND IMAGE
  // ================================

  /**
   * Get a random background image from the available set
   */
  static getRandomBackgroundImage(): any {
    const backgroundImages = [
      require('@/assets/quotes/bg1.jpg'),
      require('@/assets/quotes/bg2.jpg'),
      require('@/assets/quotes/bg3.jpg'),
      require('@/assets/quotes/bg4.jpg'),
      require('@/assets/quotes/bg5.jpg'),
      require('@/assets/quotes/bg6.jpg'),
      require('@/assets/quotes/bg7.jpg'),
      require('@/assets/quotes/bg8.jpg'),
      require('@/assets/quotes/bg9.jpg'),
      require('@/assets/quotes/bg10.jpg'),
      require('@/assets/quotes/bg11.jpg'),
      require('@/assets/quotes/bg12.jpg'),
    ];

    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    return backgroundImages[randomIndex];
  }
}