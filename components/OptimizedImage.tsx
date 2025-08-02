// components/OptimizedImage.tsx - Production Version

import React, { useState, useCallback, useEffect, memo } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { imageManager } from '@/services/ImageManager';
import { Colors } from '@/constants/Colors';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedImageProps {
  source: ImageSource | string;
  style?: any;
  placeholder?: ImageSource | string | 'blurhash' | 'gradient' | 'skeleton';
  blurhash?: string;
  blurRadius?: number;
  showActivityIndicator?: boolean;
  activityIndicatorProps?: {
    size?: 'small' | 'large';
    color?: string;
  };
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  priority?: 'low' | 'normal' | 'high';
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
  optimizeFor?: 'carousel' | 'thumbnail' | 'full' | 'background';
  fallbackSource?: ImageSource | string;
  cacheKey?: string;
  contentFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  transition?: number;
  allowDownscaling?: boolean;
  autoplay?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder = 'gradient',
  blurhash,
  blurRadius,
  showActivityIndicator = true,
  activityIndicatorProps = { size: 'large', color: Colors.primary },
  onLoad,
  onError,
  onLoadStart,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  optimizeFor = 'full',
  fallbackSource,
  cacheKey,
  contentFit = 'cover',
  transition = 200,
  allowDownscaling = true,
  autoplay = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSource | string>('');

  const getOptimizedDimensions = useCallback(() => {
    const flattenedStyle = StyleSheet.flatten(style) as any;
    const width = flattenedStyle?.width || screenWidth;
    const height = flattenedStyle?.height || screenWidth * 0.6;

    switch (optimizeFor) {
      case 'thumbnail':
        return { width: Math.min(width, 300), height: Math.min(height, 300) };
      case 'carousel':
        return { width: Math.min(width, screenWidth), height: Math.min(height, screenWidth) };
      case 'background':
        return { width: screenWidth, height: screenWidth };
      default:
        return { width, height };
    }
  }, [style, optimizeFor]);

  useEffect(() => {
    const uri = typeof source === 'string' ? source : source?.uri;
    if (!uri) return;

    const dimensions = getOptimizedDimensions();
    const optimizedUri = imageManager.getOptimizedImageURI(
      uri,
      dimensions.width,
      dimensions.height,
      'webp'
    );
    
    setImageSource(optimizedUri);
  }, [source, getOptimizedDimensions]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((errorEvent: any) => {
    setLoading(false);
    setError(true);
    
    if (fallbackSource && imageSource !== fallbackSource) {
      const fallbackUri = typeof fallbackSource === 'string' ? fallbackSource : fallbackSource?.uri;
      if (fallbackUri) {
        setImageSource(fallbackUri);
        setError(false);
        setLoading(true);
        return;
      }
    }
    
    onError?.(errorEvent);
  }, [onError, fallbackSource, imageSource]);

  useEffect(() => {
    if (priority === 'high' && imageSource && typeof imageSource === 'string') {
      imageManager.preloadImage(imageSource, { priority, cachePolicy });
    }
  }, [imageSource, priority, cachePolicy]);

  const getPlaceholderSource = useCallback((): ImageSource | undefined => {
    if (!placeholder) return undefined;
    
    if (typeof placeholder === 'string') {
      switch (placeholder) {
        case 'gradient':
        case 'skeleton':
          return undefined;
        default:
          return { uri: placeholder };
      }
    }
    
    return placeholder;
  }, [placeholder]);

  const renderCustomPlaceholder = () => {
    if (typeof placeholder !== 'string') return null;
    
    switch (placeholder) {
      case 'gradient':
        return (
          <View style={[StyleSheet.absoluteFillObject, styles.placeholderContainer]}>
            <LinearGradient
              colors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        );
      case 'skeleton':
        return <SkeletonPlaceholder style={StyleSheet.absoluteFillObject} />;
      default:
        return null;
    }
  };

  if (!imageSource) {
    return (
      <View style={[styles.container, style]}>
        {renderCustomPlaceholder()}
        {showActivityIndicator && (
          <View style={styles.activityIndicatorContainer}>
            <ActivityIndicator
              size={activityIndicatorProps.size}
              color={activityIndicatorProps.color}
            />
          </View>
        )}
      </View>
    );
  }

  const finalImageSource: ImageSource = typeof imageSource === 'string' 
    ? { uri: imageSource }
    : imageSource;

  const placeholderSource = getPlaceholderSource();

  return (
    <View style={[styles.container, style]}>
      {renderCustomPlaceholder()}
      
      <Image
        source={finalImageSource}
        placeholder={placeholderSource}
        style={StyleSheet.absoluteFillObject}
        contentFit={contentFit}
        priority={priority}
        cachePolicy={cachePolicy}
        transition={transition}
        blurRadius={blurRadius}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
      />

      {showActivityIndicator && (loading || error) && (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator
            size={activityIndicatorProps.size}
            color={activityIndicatorProps.color}
          />
        </View>
      )}
    </View>
  );
};

const SkeletonPlaceholder: React.FC<{ style?: ViewStyle }> = memo(({ style }) => {
  return (
    <View style={[styles.skeleton, style]}>
      <LinearGradient
        colors={['#f0f0f0', '#e8e8e8', '#f0f0f0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  placeholderContainer: {
    backgroundColor: 'transparent',
  },
  activityIndicatorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  skeleton: {
    backgroundColor: '#f0f0f0',
  },
});

export default memo(OptimizedImage);

export const CarouselImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage 
    {...props} 
    optimizeFor="carousel"
    priority={props.priority || "high"}
    transition={props.transition || 300}
    cachePolicy={props.cachePolicy || "memory-disk"}
  />
);

export const ThumbnailImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage 
    {...props} 
    optimizeFor="thumbnail"
    priority={props.priority || "normal"}
    transition={props.transition || 150}
    cachePolicy={props.cachePolicy || "memory"}
  />
);

export const BackgroundImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage 
    {...props} 
    optimizeFor="background"
    priority={props.priority || "high"}
    contentFit={props.contentFit || "cover"}
    cachePolicy={props.cachePolicy || "memory-disk"}
    transition={props.transition || 500}
    blurRadius={props.blurRadius}
  />
);

export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage 
    {...props} 
    optimizeFor="full" 
    priority={props.priority || "high"}
    transition={props.transition || 500}
    cachePolicy={props.cachePolicy || "memory-disk"}
  />
);

import { Post } from '@/types/content';

export const useEventImagePreloader = (events: Post[]) => {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (events.length === 0) {
      setReady(true);
      return;
    }

    const imageUris = events
      .map(event => event.image)
      .filter(Boolean)
      .slice(0, 5);

    if (imageUris.length === 0) {
      setReady(true);
      return;
    }

    let loadedCount = 0;
    const targetCount = imageUris.length;

    const preloadPromises = imageUris.map(async (uri) => {
      try {
        const success = await imageManager.preloadImage(uri, { 
          priority: 'high',
          cachePolicy: 'memory-disk'
        });
        loadedCount++;
        setProgress(loadedCount / targetCount);
        return success;
      } catch {
        loadedCount++;
        setProgress(loadedCount / targetCount);
        return false;
      }
    });

    Promise.allSettled(preloadPromises).then(() => {
      setReady(true);
    });

  }, [events]);

  return { ready, progress };
};