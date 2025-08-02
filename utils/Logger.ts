// utils/Logger.ts - Clean logger without complex dependencies
import { Platform } from 'react-native';

interface LogEntry {
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  message: string;
  platform: 'react-native';
  data?: any;
  app_version: string;
  os_version: string;
  device_model: string;
  timestamp?: string;
  user_id?: string | null;
  session_id?: string;
  component?: string;
  action?: string;
  stack_trace?: string;
}

interface LoggerConfig {
  enableWordPressLogging: boolean;
  enableConsoleLogging: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  apiEndpoint: string;
  batchSize: number;
  flushInterval: number;
}

class CleanLogger {
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private sessionId: string;
  private userId: string | null = null;
  private authToken: string | null = null;
  private flushTimer: any = null; // Use 'any' to handle both Node.js and browser timers
  private isOnline: boolean = true;

  constructor(config?: Partial<LoggerConfig>) {
// In CleanLogger constructor
this.config = {
  // Enable in production OR if explicitly enabled via env var
  enableWordPressLogging: true,
  enableConsoleLogging: __DEV__,
  logLevel: __DEV__ ? 'debug' : 'info',
  apiEndpoint: '/wp-json/mobile-app/v108/logs',
  batchSize: 10,
  flushInterval: 30000,
  ...config
};

    this.sessionId = this.generateSessionId();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private shouldLog(level: LogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warning', 'error', 'critical'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLogLevel = levels.indexOf(level);
    return messageLogLevel >= currentLevelIndex;
  }

  private async getDeviceInfo() {
    try {
      return {
        app_version: '1.0.0', // You can get this from your app config
        os_version: Platform.OS === 'ios' ? `iOS ${Platform.Version}` : `Android ${Platform.Version}`,
        device_model: 'Unknown Device', // Simplified for now
        platform: 'react-native' as const,
        session_id: this.sessionId,
        user_id: this.userId
      };
    } catch (error) {
      return {
        app_version: '1.0.0',
        os_version: Platform.OS,
        device_model: 'Unknown',
        platform: 'react-native' as const,
        session_id: this.sessionId,
        user_id: this.userId
      };
    }
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  setOnlineStatus(isOnline: boolean) {
    this.isOnline = isOnline;
    if (isOnline && this.logQueue.length > 0) {
      this.flushLogs();
    }
  }

  private async createLogEntry(
    level: LogEntry['level'],
    message: string,
    data?: any,
    component?: string,
    action?: string
  ): Promise<LogEntry> {
    const deviceInfo = await this.getDeviceInfo();
    
    let stackTrace: string | undefined;
    if (level === 'error' || level === 'critical') {
      try {
        throw new Error('Stack trace');
      } catch (e: any) {
        stackTrace = e.stack;
      }
    }

    return {
      level,
      message,
      ...deviceInfo,
      data: data ? (typeof data === 'string' ? data : JSON.stringify(data)) : undefined,
      timestamp: new Date().toISOString(),
      component,
      action,
      stack_trace: stackTrace
    };
  }

  private async sendToWordPress(logEntry: LogEntry): Promise<boolean> {
    if (!this.config.enableWordPressLogging || !this.isOnline) {
      return false;
    }

    try {
      const baseUrl = process.env.EXPO_PUBLIC_WORDPRESS_BASE_URL || 'https://iskconlondon.com';
      const url = `${baseUrl}${this.config.apiEndpoint}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(logEntry),
      });

      return response.ok;
    } catch (error) {
      if (__DEV__) {
        console.warn('WordPress logging error:', error);
      }
      return false;
    }
  }

  private async sendBatchToWordPress(logEntries: LogEntry[]): Promise<boolean> {
    let successCount = 0;
    for (const entry of logEntries) {
      const success = await this.sendToWordPress(entry);
      if (success) successCount++;
    }
    return successCount > 0;
  }

  private startPeriodicFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flushLogs();
    }, this.config.flushInterval);
  }

  private async flushLogs() {
    if (this.logQueue.length === 0) return;

    const logsToSend = this.logQueue.splice(0, this.config.batchSize);
    
    try {
      await this.sendBatchToWordPress(logsToSend);
    } catch (error) {
      // If sending fails, add logs back to queue for retry
      this.logQueue.unshift(...logsToSend);
      
      // Limit queue size to prevent memory issues
      if (this.logQueue.length > 100) {
        this.logQueue = this.logQueue.slice(-50);
      }
    }
  }

  private async log(
    level: LogEntry['level'],
    message: string,
    data?: any,
    component?: string,
    action?: string
  ) {
    if (!this.shouldLog(level)) return;

    // Always log to console in development
    if (this.config.enableConsoleLogging) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      const logMessage = component ? `${prefix} [${component}] ${message}` : `${prefix} ${message}`;
      
      switch (level) {
        case 'debug':
          console.log(logMessage, data);
          break;
        case 'info':
          console.info(logMessage, data);
          break;
        case 'warning':
          console.warn(logMessage, data);
          break;
        case 'error':
        case 'critical':
          console.error(logMessage, data);
          break;
      }
    }

    // Create log entry and add to queue for WordPress
    try {
      const logEntry = await this.createLogEntry(level, message, data, component, action);
      this.logQueue.push(logEntry);

      // Flush immediately for critical errors
      if (level === 'critical' || level === 'error') {
        this.flushLogs();
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to create log entry:', error);
      }
    }
  }

  // Public logging methods
  debug(message: string, data?: any, component?: string, action?: string) {
    this.log('debug', message, data, component, action);
  }

  info(message: string, data?: any, component?: string, action?: string) {
    this.log('info', message, data, component, action);
  }

  warn(message: string, data?: any, component?: string, action?: string) {
    this.log('warning', message, data, component, action);
  }

  error(message: string, data?: any, component?: string, action?: string) {
    this.log('error', message, data, component, action);
  }

  critical(message: string, data?: any, component?: string, action?: string) {
    this.log('critical', message, data, component, action);
  }

  // Specialized methods for common scenarios
  logUserAction(action: string, component: string, data?: any) {
    this.info(`User action: ${action}`, data, component, action);
  }

  logError(error: any, component: string, action?: string) {
    const errorData = {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      statusCode: error?.statusCode
    };
    
    this.error(
      error?.message || 'Unknown error occurred',
      errorData,
      component,
      action
    );
  }

  logCrash(error: any, component: string, action?: string) {
    const crashData = {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      componentStack: error?.componentStack,
      errorBoundary: true
    };
    
    this.critical(
      `App crash: ${error?.message || 'Unknown crash'}`,
      crashData,
      component,
      action
    );
  }

  // Cart-specific logging methods
  logCartAction(action: string, cartData?: any, error?: any) {
    if (error) {
      this.error(
        `Cart action failed: ${action}`,
        { action, cartData, error: error?.message },
        'DonationCart',
        action
      );
    } else {
      this.info(
        `Cart action: ${action}`,
        { action, cartData },
        'DonationCart',
        action
      );
    }
  }

  logPaymentAction(action: string, paymentData?: any, error?: any) {
    if (error) {
      this.error(
        `Payment action failed: ${action}`,
        { action, paymentData, error: error?.message },
        'Payment',
        action
      );
    } else {
      this.info(
        `Payment action: ${action}`,
        { action, paymentData },
        'Payment',
        action
      );
    }
  }

  // Force flush all pending logs
  async forceFlush(): Promise<void> {
    if (this.logQueue.length > 0) {
      await this.flushLogs();
    }
  }

  // Clean up resources
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.forceFlush();
  }
}

// Create singleton instance
const Logger = new CleanLogger();

export default Logger;