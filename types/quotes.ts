// types/quotes.ts
export interface DailyQuote {
  date: string;
  quote: string;
  subtitle: string;
}

export interface QuoteSettings {
  dailyQuotesEnabled: boolean;
  lastQuoteShownDate: string | null;
  lastQuoteTimestamp: string | null;
}

export interface QuoteStatus {
  isEnabled: boolean;
  today: string;
  lastShownDate: string | null;
  lastTimestamp: string | null;
  wasShownToday: boolean;
  shouldShow: boolean;
}

export interface DailyQuoteScreenProps {
  onClose: () => void;
}

export interface SettingsItem {
  id: string;
  title: string;
  description?: string;
  type: 'toggle' | 'action' | 'info' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon?: any;
  color?: string;
  destructive?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  items: SettingsItem[];
}

// Background image type
export interface BackgroundImage {
  id: number;
  source: any; // require() result
}

// Utility types
export type DateString = string; // Format: "January 1st", "February 29th", etc.
export type QuoteIndex = number; // 0-365 (366 total)

// Constants
export const TOTAL_QUOTES = 366; // 365 regular + 1 leap day
export const LEAP_DAY_INDEX = 365;
export const REGULAR_QUOTES_COUNT = 365;

// Storage keys
export const STORAGE_KEYS = {
  DAILY_QUOTES_ENABLED: '@daily_quotes_enabled',
  LAST_QUOTE_SHOWN_DATE: '@last_quote_shown_date',
  LAST_QUOTE_TIMESTAMP: '@last_quote_timestamp',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];