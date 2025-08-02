// services/ImageManager.ts - Production Version

import { Image } from 'expo-image';
import Logger from '@/utils/Logger';

interface ImageCache {
  [key: string]: {
    uri: string;
    preloaded: boolean;
    preloading: boolean;
    error?: boolean;
    preloadPromise?: Promise<boolean>;
  };
}

interface ImagePreloadOptions {
  priority: 'high' | 'normal' | 'low';
  timeout?: number;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
}

class ImageManager {
  private cache: ImageCache = {};
  private readonly DEFAULT_TIMEOUT = 10000;

  async preloadImages(uris: string[], options: ImagePreloadOptions = { priority: 'normal' }): Promise<void> {
    const preloadPromises = uris.map(uri => this.preloadImage(uri, options));
    
    try {
      await Promise.allSettled(preloadPromises);
    } catch (error) {
      Logger.error('Batch preload failed', error);
    }
  }

  async preloadImage(uri: string, options: ImagePreloadOptions = { priority: 'normal' }): Promise<boolean> {
    if (!uri || typeof uri !== 'string') return false;

    const cacheKey = this.getCacheKey(uri);
    
    if (this.cache[cacheKey]?.preloaded) {
      return true;
    }

    if (this.cache[cacheKey]?.preloading && this.cache[cacheKey]?.preloadPromise) {
      return this.cache[cacheKey].preloadPromise!;
    }

    const preloadPromise = this.createExpoImagePreloadPromise(uri, options);
    
    this.cache[cacheKey] = {
      uri,
      preloaded: false,
      preloading: true,
      preloadPromise
    };

    try {
      const success = await preloadPromise;
      this.cache[cacheKey] = {
        ...this.cache[cacheKey],
        preloaded: success,
        preloading: false,
        error: !success
      };
      return success;
    } catch (error) {
      this.cache[cacheKey] = {
        ...this.cache[cacheKey],
        preloaded: false,
        preloading: false,
        error: true
      };
      return false;
    }
  }

  isImagePreloaded(uri: string): boolean {
    const cacheKey = this.getCacheKey(uri);
    return this.cache[cacheKey]?.preloaded === true;
  }

  isImagePreloading(uri: string): boolean {
    const cacheKey = this.getCacheKey(uri);
    return this.cache[cacheKey]?.preloading === true;
  }

  getOptimizedImageURI(uri: string, width?: number, height?: number, format?: 'webp' | 'jpeg' | 'png'): string {
    if (!uri) return '';

    if (uri.includes('unsplash.com')) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('auto', 'format');
      params.append('fit', 'crop');
      params.append('q', '80');
      if (format) params.append('fm', format);
      
      const separator = uri.includes('?') ? '&' : '?';
      return `${uri}${separator}${params.toString()}`;
    }

    if (uri.includes('pexels.com')) {
      return uri;
    }

    return uri;
  }

  async clearCache(): Promise<void> {
    try {
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
      this.cache = {};
    } catch (error) {
      Logger.error('Failed to clear image cache', error);
    }
  }

  async getCacheInfo() {
    const entries = Object.values(this.cache);
    
    return {
      totalImages: entries.length,
      preloadedImages: entries.filter(e => e.preloaded).length,
      failedImages: entries.filter(e => e.error).length,
      preloadingImages: entries.filter(e => e.preloading).length,
      cacheHitRate: entries.length > 0 ? entries.filter(e => e.preloaded).length / entries.length : 0,
      diskCacheSize: `${entries.length} tracked images`
    };
  }

  private createExpoImagePreloadPromise(uri: string, options: ImagePreloadOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = options.timeout || this.DEFAULT_TIMEOUT;
      
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      Image.prefetch(uri, options.cachePolicy || 'memory-disk')
        .then(() => {
          clearTimeout(timeoutId);
          resolve(true);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          resolve(false);
        });
    });
  }

  private getCacheKey(uri: string): string {
    let hash = 0;
    for (let i = 0; i < uri.length; i++) {
      const char = uri.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }
}

export const imageManager = new ImageManager();

export const ExpoImageUtils = {
  clearMemoryCache: () => Image.clearMemoryCache(),
  clearDiskCache: () => Image.clearDiskCache(),
  prefetch: (uri: string, cachePolicy?: 'memory' | 'disk' | 'memory-disk') => 
    Image.prefetch(uri, cachePolicy || 'memory-disk'),
};