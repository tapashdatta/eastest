import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  useEffect(() => {
    // Framework initialization for mobile platforms
    if (Platform.OS !== 'web') {
      // Mobile-specific initialization
      console.log('Framework ready for mobile platform');
    }
  }, []);
}