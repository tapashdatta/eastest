// services/ContentManager.ts - Production Version

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Post, PostType, APIResponse, ContentFilter, WordPressEventType } from '@/types/content';
import { wordPressContentAPI, AppPost } from './WordPressContentAPI';
import Logger from '@/utils/Logger';

interface ContentCache {
  posts: Post[];
  timestamp: number;
  version: string;
  postTypeCount: Record<PostType, number>;
  eventTypeCount: Record<WordPressEventType, number>;
  categories: string[];
  tags: string[];
  postModificationMap: Record<number, string>;
  lastValidationCheck: number;
}

type UIUpdateCallback = (posts: Post[]) => void;

class ContentManager {
  private cache: ContentCache | null = null;
  private readonly CACHE_KEY = '@iskcon_content_cache_v9';
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
  private readonly STALE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly VALIDATION_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private isRefreshing = false;
  private isValidating = false;
  private validationTimer: number | null = null;
  private uiUpdateCallbacks: UIUpdateCallback[] = [];

  constructor() {
    this.initializeCache();
    this.startValidationTimer();
  }

  // ================================
  // UI NOTIFICATION SYSTEM
  // ================================

  public subscribeToUpdates(callback: UIUpdateCallback): () => void {
    this.uiUpdateCallbacks.push(callback);
    
    return () => {
      const index = this.uiUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.uiUpdateCallbacks.splice(index, 1);
      }
    };
  }

  private notifyUIComponents(): void {
    if (this.cache && this.uiUpdateCallbacks.length > 0) {
      const freshPosts = [...this.cache.posts];
      this.uiUpdateCallbacks.forEach(callback => {
        try {
          callback(freshPosts);
        } catch (error) {
          Logger.error('Error in UI update callback', error);
        }
      });
    }
  }

  // ================================
  // VALIDATION TIMER
  // ================================

  private startValidationTimer(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
    }

    this.validationTimer = setInterval(() => {
      if (this.shouldValidateCache() && !this.isRefreshing && !this.isValidating) {
        this.performSmartValidation().catch(() => {
          // Silent fail for background validation
        });
      }
    }, 5 * 60 * 1000) as unknown as number; // Check every 5 minutes
  }

  private stopValidationTimer(): void {
    if (this.validationTimer) {
      clearInterval(this.validationTimer);
      this.validationTimer = null;
    }
  }

  // ================================
  // INITIALIZATION
  // ================================

  private async initializeCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        
        // Migrate old cache structure
        if (parsedCache && !parsedCache.postModificationMap) {
          parsedCache.postModificationMap = {};
          parsedCache.lastValidationCheck = 0;
          
          if (parsedCache.posts && Array.isArray(parsedCache.posts)) {
            parsedCache.posts.forEach((post: Post) => {
              parsedCache.postModificationMap[post.id] = post.modified;
            });
          }
          
          parsedCache.version = '9.0';
          await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(parsedCache));
        }
        
        this.cache = parsedCache;
        
        if (this.cache && this.cache.version !== '9.0') {
          await this.clearCache();
        }
      }
    } catch (error) {
      Logger.error('Failed to load cache', error);
      await this.clearCache();
    }
  }

  // ================================
  // PUBLIC API
  // ================================

  async getContent(filter?: ContentFilter, forceRefresh = false): Promise<APIResponse<Post[]>> {
    try {
      if (forceRefresh) {
        return await this.fetchFreshContent(filter, true);
      }

      if (this.cache && this.isCacheValid()) {
        const filteredPosts = this.filterPosts(this.cache.posts, filter);
        
        if (this.shouldValidateCache()) {
          this.performSmartValidation().catch(() => {
            // Silent fail for background validation
          });
        }
        
        return {
          success: true,
          data: filteredPosts,
          timestamp: this.cache.timestamp
        };
      }
      
      return await this.fetchFreshContent(filter, false);
      
    } catch (error) {
      Logger.error('Error getting content', error);
      
      if (this.cache && this.cache.posts.length > 0) {
        const filteredPosts = this.filterPosts(this.cache.posts, filter);
        return {
          success: false,
          data: filteredPosts,
          error: 'Using cached data due to fetch error',
          timestamp: this.cache.timestamp
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load content',
        timestamp: Date.now()
      };
    }
  }

  async refreshContent(filter?: ContentFilter): Promise<APIResponse<Post[]>> {
    return await this.fetchFreshContent(filter, true);
  }

  getCacheInfo() {
    if (!this.cache) {
      return {
        isValid: false,
        isStale: false,
        age: 0,
        ageMinutes: 0,
        ageHours: 0,
        totalPosts: 0,
        lastUpdate: null,
        postsByType: {} as Record<PostType, number>,
        eventTypeCount: {} as Record<WordPressEventType, number>,
        categories: [] as string[],
        tags: [] as string[],
        version: 'none',
        isRefreshing: this.isRefreshing,
        lastValidationCheck: null,
        validationAge: 0,
        trackedModifications: 0
      };
    }
    
    const age = Date.now() - this.cache.timestamp;
    const ageMinutes = Math.floor(age / (1000 * 60));
    const ageHours = Math.floor(age / (1000 * 60 * 60));
    const validationAge = this.getValidationAge();
    
    return {
      isValid: this.isCacheValid(),
      isStale: this.isCacheStale(),
      age,
      ageMinutes,
      ageHours,
      totalPosts: this.cache.posts.length,
      lastUpdate: new Date(this.cache.timestamp).toISOString(),
      postsByType: this.cache.postTypeCount,
      eventTypeCount: this.cache.eventTypeCount,
      categories: this.cache.categories,
      tags: this.cache.tags,
      version: this.cache.version,
      isRefreshing: this.isRefreshing,
      lastValidationCheck: this.cache.lastValidationCheck ? new Date(this.cache.lastValidationCheck).toISOString() : null,
      validationAge: validationAge,
      trackedModifications: Object.keys(this.cache.postModificationMap).length
    };
  }

  async clearCache(): Promise<void> {
    this.cache = null;
    this.isRefreshing = false;
    this.isValidating = false;
    await AsyncStorage.removeItem(this.CACHE_KEY);
    
    // Clear old cache versions
    const oldCacheKeys = [
      '@iskcon_content_cache_v3',
      '@iskcon_content_cache_v4',
      '@iskcon_content_cache_v5',
      '@iskcon_content_cache_v6',
      '@iskcon_content_cache_v7',
      '@iskcon_content_cache_v8'
    ];
    
    for (const key of oldCacheKeys) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        // Ignore errors when clearing old cache
      }
    }
  }

  async invalidatePost(postId: number): Promise<void> {
    if (!this.cache) return;
    
    this.cache.posts = this.cache.posts.filter(post => post.id !== postId);
    delete this.cache.postModificationMap[postId];
    
    await this.saveCache();
    this.notifyUIComponents();
  }

  shouldRefreshContent(): boolean {
    return !this.cache || this.isCacheStale() || this.cache.posts.length === 0;
  }

  // ================================
  // SMART VALIDATION
  // ================================

  private shouldValidateCache(): boolean {
    if (!this.cache || this.isValidating) return false;
    
    const timeSinceLastValidation = Date.now() - (this.cache.lastValidationCheck || 0);
    return timeSinceLastValidation > this.VALIDATION_INTERVAL;
  }

  private getValidationAge(): number {
    if (!this.cache || !this.cache.lastValidationCheck) return Infinity;
    return Math.floor((Date.now() - this.cache.lastValidationCheck) / (1000 * 60));
  }

  private async performSmartValidation(): Promise<void> {
    if (!this.cache || this.isRefreshing || this.isValidating) {
      return;
    }
    
    this.isValidating = true;
    
    try {
      const validation = await wordPressContentAPI.validatePostModifications(this.cache.posts);
      
      if (validation.outdatedPostIds.length > 0) {
        if (validation.outdatedPostIds.length > 20) {
          this.refreshContentInBackground();
        } else {
          await this.updateSpecificPosts(validation.outdatedPostIds);
        }
      } else {
        this.cache.lastValidationCheck = validation.validationTimestamp;
        await this.saveCache();
      }
      
    } catch (error) {
      if (this.cache) {
        this.cache.lastValidationCheck = Date.now();
        await this.saveCache();
      }
    } finally {
      this.isValidating = false;
    }
  }

  private async updateSpecificPosts(postIds: number[]): Promise<void> {
    if (postIds.length === 0) return;
    
    try {
      const updatedPosts: Post[] = [];
      
      for (const postId of postIds) {
        try {
          const freshPost = await wordPressContentAPI.getIskconPost(postId);
          const transformedPost = this.transformAppPostToPost(freshPost);
          updatedPosts.push(transformedPost);
        } catch (error) {
          // Continue with other posts if one fails
        }
      }
      
      if (!this.cache || updatedPosts.length === 0) return;
      
      const updatedCache = { ...this.cache };
      
      updatedPosts.forEach(updatedPost => {
        const existingIndex = updatedCache.posts.findIndex(p => p.id === updatedPost.id);
        
        if (existingIndex >= 0) {
          updatedCache.posts[existingIndex] = updatedPost;
        } else {
          updatedCache.posts.unshift(updatedPost);
        }
        
        updatedCache.postModificationMap[updatedPost.id] = updatedPost.modified;
      });
      
      updatedCache.posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      updatedCache.timestamp = Date.now();
      updatedCache.lastValidationCheck = Date.now();
      
      this.updateCacheCounts(updatedCache);
      
      this.cache = updatedCache;
      await this.saveCache();
      
      this.notifyUIComponents();
      
    } catch (error) {
      Logger.error('Failed to update specific posts', error);
    }
  }

  // ================================
  // PRIVATE METHODS
  // ================================

  private async fetchFreshContent(filter?: ContentFilter, bypassCache = false): Promise<APIResponse<Post[]>> {
    if (this.isRefreshing && !bypassCache) {
      while (this.isRefreshing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.cache) {
        const filteredPosts = this.filterPosts(this.cache.posts, filter);
        return {
          success: true,
          data: filteredPosts,
          timestamp: this.cache.timestamp
        };
      }
    }
    
    this.isRefreshing = true;
    
    try {
      const appPosts = await wordPressContentAPI.getIskconPosts({
        per_page: 100,
        orderby: 'date',
        order: 'desc'
      });
      
      const transformedPosts = appPosts.map(appPost => this.transformAppPostToPost(appPost));
      const validPosts = this.filterExpiredEvents(transformedPosts);
      
      this.cache = {
        posts: validPosts,
        timestamp: Date.now(),
        version: '9.0',
        postTypeCount: {} as Record<PostType, number>,
        eventTypeCount: {} as Record<WordPressEventType, number>,
        categories: [],
        tags: [],
        postModificationMap: {},
        lastValidationCheck: Date.now()
      };
      
      this.updateCacheCounts(this.cache);
      this.updateModificationTracking(this.cache);
      
      await this.saveCache();
      this.notifyUIComponents();
      
      const filteredPosts = this.filterPosts(validPosts, filter);
      
      return {
        success: true,
        data: filteredPosts,
        timestamp: this.cache.timestamp
      };
      
    } catch (error) {
      Logger.error('Failed to fetch fresh content', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fetch failed',
        timestamp: Date.now()
      };
    } finally {
      this.isRefreshing = false;
    }
  }

  private updateCacheCounts(cache: ContentCache): void {
    const postTypeCount: Record<PostType, number> = {} as Record<PostType, number>;
    const eventTypeCount: Record<WordPressEventType, number> = {} as Record<WordPressEventType, number>;
    const categoriesSet = new Set<string>();
    const tagsSet = new Set<string>();
    
    cache.posts.forEach(post => {
      const postType = post.postType;
      postTypeCount[postType] = (postTypeCount[postType] || 0) + 1;
      
      const eventType = post.eventData?.eventType?.toLowerCase() as WordPressEventType;
      if (eventType) {
        eventTypeCount[eventType] = (eventTypeCount[eventType] || 0) + 1;
      }
      
      post.categories.forEach(cat => categoriesSet.add(cat));
      post.tags.forEach(tag => tagsSet.add(tag));
    });
    
    cache.postTypeCount = postTypeCount;
    cache.eventTypeCount = eventTypeCount;
    cache.categories = Array.from(categoriesSet).sort();
    cache.tags = Array.from(tagsSet).sort();
  }

  private updateModificationTracking(cache: ContentCache): void {
    cache.postModificationMap = {};
    cache.posts.forEach(post => {
      cache.postModificationMap[post.id] = post.modified;
    });
  }

  private transformAppPostToPost(appPost: AppPost): Post {
    const now = new Date();
    
    const hasEventData = !!(
      appPost.start_date || 
      appPost.end_date ||
      appPost.event_type
    );
    
    let eventData: Post['eventData'] = undefined;
    
    if (hasEventData || this.isExtendedEventType(appPost.event_type)) {
      const startDate = appPost.start_date;
      const endDate = appPost.end_date;
      
      let isUpcoming = false;
      let hasEnded = false;
      
      if (startDate) {
        let startDateTime: Date;
        
        if (startDate.includes('T') || startDate.includes('-')) {
          startDateTime = new Date(startDate);
        } else {
          const currentYear = new Date().getFullYear();
          startDateTime = new Date(`${startDate} ${currentYear}`);
        }
        
        if (endDate) {
          let endDateTime: Date;
          if (endDate.includes('T') || endDate.includes('-')) {
            endDateTime = new Date(endDate);
          } else {
            const currentYear = new Date().getFullYear();
            endDateTime = new Date(`${endDate} ${currentYear}`);
          }
          
          hasEnded = endDateTime < now;
          isUpcoming = !hasEnded && startDateTime > now;
        } else {
          const endOfStartDay = new Date(startDateTime);
          endOfStartDay.setHours(23, 59, 59, 999);
          
          hasEnded = endOfStartDay < now;
          isUpcoming = startDateTime > now;
        }
      }
      
      eventData = {
        startDate,
        endDate,
        countdownDate: appPost.countdown_date,
        location: appPost.location || 'ISKCON London',
        eventType: appPost.event_type,
        breakfastInfo: appPost.breakfast_info,
        dietaryRestrictions: appPost.dietary_restrictions,
        donationLink: appPost.donation_link,
        registrationUrl: appPost.registration_url,
        isUpcoming,
        hasEnded
      };
    }

    const mappedPostType = this.mapEventTypeToPostType(appPost.event_type);

    return {
      id: appPost.id,
      title: appPost.title,
      excerpt: appPost.excerpt,
      content: appPost.content,
      image: appPost.image,
      slug: appPost.slug,
      date: appPost.date,
      modified: appPost.modified || appPost.date,
      
      category: appPost.category,
      categories: [appPost.category],
      tags: appPost.tags,
      
      author: appPost.author,
      authorId: 1,
      
      postType: mappedPostType,
      status: 'publish' as const,
      
      eventData,
      
      stats: {
        views: appPost.views,
        likes: appPost.likes,
        comments: appPost.comments,
        shares: Math.floor(appPost.views * 0.01)
      },
      
      readTime: appPost.readTime,
      rating: appPost.rating,
      isFeatured: Math.random() > 0.8,
      isBookmarked: appPost.isBookmarked || false,
      isLiked: appPost.isLiked || false
    };
  }

  private isExtendedEventType(eventType?: string): boolean {
    const extendedTypes = ['ekadasi', 'festival', 'courses', 'guest_speaker'];
    return eventType ? extendedTypes.includes(eventType) : false;
  }

  private mapEventTypeToPostType(eventType?: string): PostType {
    if (!eventType) return 'posts';
    
    switch (eventType as WordPressEventType) {
      case 'festival':
      case 'ekadasi':
        return 'festival_event';
      case 'courses':
        return 'courses';
      case 'guest_speaker':
        return 'guest-speaker';
      case 'news':
        return 'news';
      case 'bio_lcvs_speaker':
        return 'lcvs-speaker';
      case 'bio_recent_vip':
        return 'recent-vip';
      case 'bio_team_member':
        return 'teams';
      case 'daily_darshan':
        return 'daily-darshan';
      default:
        return 'posts';
    }
  }

  private filterPosts(posts: Post[], filter?: ContentFilter): Post[] {
    if (!filter) return posts;
    
    let filtered = [...posts];
    
    if (filter.postTypes?.length) {
      filtered = filtered.filter(post => filter.postTypes!.includes(post.postType));
    }
    
    if (filter.eventTypes?.length) {
      filtered = filtered.filter(post => {
        const postEventType = post.eventData?.eventType?.toLowerCase() as WordPressEventType;
        return postEventType && filter.eventTypes!.includes(postEventType);
      });
    }
    
    if (filter.categories?.length) {
      filtered = filtered.filter(post => 
        filter.categories!.some(cat => 
          post.categories.some(postCat => 
            postCat.toLowerCase().includes(cat.toLowerCase())
          )
        )
      );
    }
    
    if (filter.tags?.length) {
      filtered = filtered.filter(post => 
        filter.tags!.some(tag => 
          post.tags.some(postTag => 
            postTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }
    
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.toLowerCase().includes(searchTerm) ||
        post.categories.some(cat => cat.toLowerCase().includes(searchTerm)) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filter.isUpcoming !== undefined) {
      filtered = filtered.filter(post => 
        filter.isUpcoming 
          ? post.eventData?.isUpcoming === true
          : post.eventData?.isUpcoming !== true
      );
    }
    
    if (filter.isFeatured !== undefined) {
      filtered = filtered.filter(post => post.isFeatured === filter.isFeatured);
    }
    
    if (filter.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filter.sortBy) {
          case 'date':
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'views':
            aValue = a.stats.views;
            bValue = b.stats.views;
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'eventDate':
            aValue = a.eventData?.startDate ? new Date(a.eventData.startDate).getTime() : 0;
            bValue = b.eventData?.startDate ? new Date(b.eventData.startDate).getTime() : 0;
            break;
          default:
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
        }
        
        if (filter.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    
    if (filter.offset || filter.limit) {
      const start = filter.offset || 0;
      const end = filter.limit ? start + filter.limit : undefined;
      filtered = filtered.slice(start, end);
    }
    
    return filtered;
  }

  private filterExpiredEvents(posts: Post[]): Post[] {
    const now = new Date();
    
    return posts.filter(post => {
      if (!post.eventData) return true;
      
      if (post.eventData.hasEnded) return false;
      
      if (post.eventData.endDate) {
        const endDate = new Date(post.eventData.endDate);
        if (endDate < now) return false;
      }
      
      if (post.eventData.startDate) {
        const startDate = new Date(post.eventData.startDate);
        const endOfDay = new Date(startDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        if (endOfDay < now) return false;
      }
      
      return true;
    });
  }

  private isCacheValid(): boolean {
    if (!this.cache) return false;
    const age = Date.now() - this.cache.timestamp;
    return age < this.CACHE_DURATION;
  }

  private isCacheStale(): boolean {
    if (!this.cache) return true;
    const age = Date.now() - this.cache.timestamp;
    return age > this.STALE_DURATION;
  }

  private async saveCache(): Promise<void> {
    if (!this.cache) return;
    
    try {
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      Logger.error('Failed to save cache', error);
    }
  }

  private async refreshContentInBackground(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }
    
    try {
      await this.fetchFreshContent();
    } catch (error) {
      // Silent fail for background refresh
    }
  }

  public cleanup(): void {
    this.stopValidationTimer();
    this.uiUpdateCallbacks = [];
  }
}

export const contentManager = new ContentManager();