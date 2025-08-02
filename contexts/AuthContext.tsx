// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wordPressAPI, User, DeviceInfo, DeviceResponse } from '@/services/WordPressAPI';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// ================================
// TYPES
// ================================

type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextType {
  // State
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;
  
  // Computed properties
  isAuthenticated: boolean;
  canMakeDonations: boolean;
  isInitialized: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  updateUserProfile: (profileData: Partial<User>) => Promise<boolean>;
  refreshProfile: (silent?: boolean) => Promise<boolean>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
  
  // Device management
  getUserDevices: () => Promise<DeviceResponse[]>;
  deactivateDevice: (deviceId: string) => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ================================
// CONTEXT CREATION
// ================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ================================
// DEVICE INFO HELPER
// ================================

const getDeviceInfo = (): DeviceInfo => {
  return {
    device_id: Device.modelId || Device.modelName || 'unknown',
    device_name: Device.deviceName || Device.modelName || 'Unknown Device',
    device_type: Device.deviceType === Device.DeviceType.PHONE ? 'phone' : 'tablet',
    os_name: Platform.OS === 'ios' ? 'iOS' : 'Android',
  };
};

// ================================
// AUTH PROVIDER COMPONENT
// ================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('unauthenticated');
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ================================
  // BACKGROUND INITIALIZATION (NON-BLOCKING)
  // ================================

  useEffect(() => {
    initializeAuthInBackground();
  }, []);

  const initializeAuthInBackground = async (): Promise<void> => {
    try {
      if (wordPressAPI.isAuthenticated()) {
        const userProfile = await wordPressAPI.getProfile();
        setUser(userProfile);
        setStatus('authenticated');
        registerCurrentDeviceInBackground();
      }
    } catch (error) {
      await wordPressAPI.logout();
    } finally {
      setIsInitialized(true);
    }
  };

  const registerCurrentDeviceInBackground = async (): Promise<void> => {
    try {
      const deviceInfo = getDeviceInfo();
      await wordPressAPI.registerDevice(deviceInfo);
    } catch (error) {
      // Handle error silently in production
    }
  };

  // ================================
  // AUTH ACTIONS
  // ================================

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setStatus('initializing');
      setError(null);
      
      const deviceInfo = getDeviceInfo();
      const response = await wordPressAPI.login({
        email,
        password,
        device_info: deviceInfo,
      });

      if (response.success) {
        setUser(response.user);
        setStatus('authenticated');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      setStatus('error');
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setStatus('initializing');
      setError(null);
      
      const deviceInfo = getDeviceInfo();
      const response = await wordPressAPI.register({
        ...userData,
        device_info: deviceInfo,
      });

      if (response.success) {
        setUser(response.user);
        setStatus('authenticated');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      setStatus('error');
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await wordPressAPI.logout();
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
    } catch (error) {
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      const response = await wordPressAPI.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.user);
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    }
  };

  const updateUserProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      await updateProfile(profileData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const refreshProfile = async (silent: boolean = false): Promise<boolean> => {
    try {
      if (!wordPressAPI.isAuthenticated()) {
        if (!silent) {
          setStatus('unauthenticated');
        }
        return false;
      }

      const userProfile = await wordPressAPI.getProfile();
      setUser(userProfile);
      
      // Only update status if not already authenticated or if not silent
      if (status !== 'authenticated' || !silent) {
        setStatus('authenticated');
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      if (!wordPressAPI.isAuthenticated()) {
        setStatus('unauthenticated');
        return;
      }

      const refreshResponse = await wordPressAPI.refreshToken();
      
      if (refreshResponse.success) {
        setUser(refreshResponse.user);
        setStatus('authenticated');
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      await logout();
    }
  };

  const clearError = (): void => {
    setError(null);
    if (status === 'error') {
      setStatus(wordPressAPI.isAuthenticated() ? 'authenticated' : 'unauthenticated');
    }
  };

  // ================================
  // DEVICE MANAGEMENT
  // ================================

  const getUserDevices = async (): Promise<DeviceResponse[]> => {
    try {
      const devices = await wordPressAPI.getUserDevices();
      return devices;
    } catch (error) {
      throw error;
    }
  };

  const deactivateDevice = async (deviceId: string): Promise<boolean> => {
    try {
      const result = await wordPressAPI.deactivateDevice(deviceId);
      
      if (result.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // ================================
  // COMPUTED PROPERTIES
  // ================================

  const isLoading = status === 'initializing';
  const isAuthenticated = status === 'authenticated' && !!user;
  const canMakeDonations = true;

  // ================================
  // CONTEXT VALUE
  // ================================

  const contextValue: AuthContextType = {
    // State
    user,
    status,
    isLoading,
    error,
    
    // Computed properties
    isAuthenticated,
    canMakeDonations,
    isInitialized,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    updateUserProfile,
    refreshProfile,
    clearError,
    refreshAuth,
    
    // Device management
    getUserDevices,
    deactivateDevice,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ================================
// ADDITIONAL HOOKS
// ================================

export const useUserProfile = () => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  
  return {
    user,
    updateProfile,
    isAuthenticated,
    hasProfile: !!user,
    fullName: user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user?.email || 'User',
  };
};

export const useAuthActions = () => {
  const { login, register, logout, refreshAuth, clearError } = useAuth();
  
  return {
    login,
    register,
    logout,
    refreshAuth,
    clearError,
  };
};

export const useAuthStatus = () => {
  const { status, isLoading, error, isAuthenticated, canMakeDonations, isInitialized } = useAuth();
  
  return {
    status,
    isLoading,
    error,
    isAuthenticated,
    canMakeDonations,
    isReady: status !== 'initializing',
    isInitialized,
    hasError: !!error,
  };
};