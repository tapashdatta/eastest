// utils/PerformanceUtils.ts - Optimization Helpers (Fixed)

import React, { useState, useEffect, useCallback } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';

// ================================
// OPTIMIZED IMAGE COMPONENT
// ================================

interface OptimizedImageProps extends ImageProps {
  fallbackColor?: string;
  showLoader?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  fallbackColor = Colors.surfaceSecondary,
  showLoader = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <View style={[style, { position: 'relative' }]}>
      {!error && (
        <Image
          {...props}
          style={[style, { opacity: loading ? 0 : 1 }]}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {(loading || error) && (
        <View
          style={[
            style,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: fallbackColor,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
        >
          {loading && showLoader && (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}
        </View>
      )}
    </View>
  );
};

// ================================
// DEBOUNCE HOOK
// ================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ================================
// THROTTLE HOOK
// ================================

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const [lastRun, setLastRun] = useState(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun >= delay) {
        callback(...args);
        setLastRun(Date.now());
      }
    }) as T,
    [callback, delay, lastRun]
  );
}

// ================================
// LAZY LOADING HOOK
// ================================

export const useLazyLoading = (threshold: number = 1000) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const ref = useCallback((node: any) => {
    if (!node) return;

    // Check if IntersectionObserver is available (web only)
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasBeenVisible(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: `${threshold}px`,
        }
      );

      observer.observe(node);
      
      return () => observer.disconnect();
    } else {
      // Fallback for React Native - just set as visible
      setIsVisible(true);
      setHasBeenVisible(true);
    }
  }, [threshold]);

  return { ref, isVisible, hasBeenVisible };
};

// ================================
// MEMORY USAGE TRACKER
// ================================

export const useMemoryTracker = (componentName: string) => {
  useEffect(() => {
    if (__DEV__ && typeof performance !== 'undefined') {
      // Type assertion for memory property which may not exist in all environments
      const perfWithMemory = performance as any;
      if (perfWithMemory.memory) {
        const memoryInfo = perfWithMemory.memory;
        console.log(`[${componentName}] Memory Usage:`, {
          used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) + ' MB',
          total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024) + ' MB',
          limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024) + ' MB',
        });
      }
    }
  }, [componentName]);
};

// ================================
// RENDER TRACKER
// ================================

export const useRenderTracker = (componentName: string, props?: any) => {
  const renderCount = React.useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (__DEV__) {
      console.log(`[${componentName}] Render #${renderCount.current}`, props);
    }
  });

  return renderCount.current;
};

// ================================
// PERFORMANCE TIMER
// ================================

export const usePerformanceTimer = (operationName: string) => {
  const startTimer = useCallback(() => {
    if (__DEV__) {
      console.time(operationName);
    }
  }, [operationName]);

  const endTimer = useCallback(() => {
    if (__DEV__) {
      console.timeEnd(operationName);
    }
  }, [operationName]);

  return { startTimer, endTimer };
};

// ================================
// CACHE SIZE TRACKER
// ================================

export const useCacheSize = () => {
  const [cacheSize, setCacheSize] = useState(0);

  const updateCacheSize = useCallback(async () => {
    try {
      // This is a rough estimation - in a real app you'd track actual cache size
      const keys = ['@iskcon_content_cache_v3', '@jwt_token', '@user_profile'];
      let totalSize = 0;

      // Dynamic import for AsyncStorage
      const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
        module => module.default
      );

      for (const key of keys) {
        try {
          const item = await AsyncStorage.getItem(key);
          if (item) {
            // Use string length as rough size estimate (React Native compatible)
            totalSize += item.length * 2; // Multiply by 2 for Unicode characters
          }
        } catch (error) {
          // Ignore errors for individual items
        }
      }

      setCacheSize(totalSize);
    } catch (error) {
      console.warn('Failed to calculate cache size:', error);
    }
  }, []);

  useEffect(() => {
    updateCacheSize();
  }, [updateCacheSize]);

  return {
    cacheSize,
    cacheSizeMB: Math.round(cacheSize / 1024 / 1024 * 100) / 100,
    updateCacheSize
  };
};

// ================================
// BATCH OPERATIONS
// ================================

export function useBatchProcessor<T>(
  batchSize: number = 10,
  delay: number = 100
) {
  const [queue, setQueue] = useState<T[]>([]);
  const [processing, setProcessing] = useState(false);

  const addToQueue = useCallback((items: T[]) => {
    setQueue(prev => [...prev, ...items]);
  }, []);

  const processBatch = useCallback(async (
    processor: (batch: T[]) => Promise<void>
  ) => {
    if (queue.length === 0 || processing) return;

    setProcessing(true);
    
    try {
      const currentQueue = [...queue];
      setQueue([]);
      
      while (currentQueue.length > 0) {
        const batch = currentQueue.splice(0, batchSize);
        await processor(batch);
        
        if (currentQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } finally {
      setProcessing(false);
    }
  }, [queue, batchSize, delay, processing]);

  return {
    addToQueue,
    processBatch,
    queueLength: queue.length,
    processing
  };
}

// ================================
// EXPORT ALL
// ================================

const PerformanceUtils = {
  OptimizedImage,
  useDebounce,
  useThrottle,
  useLazyLoading,
  useMemoryTracker,
  useRenderTracker,
  usePerformanceTimer,
  useCacheSize,
  useBatchProcessor
};

export default PerformanceUtils;