// contexts/ContentContext.tsx - Production Version

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { contentManager } from '@/services/ContentManager';
import { 
  Post, 
  PostType,
  ContentFilter, 
  ContentState, 
  mapEventTypeToPostType, 
  WordPressEventType,
  getAllWordPressEventTypes,
  getEventTypesWithDates
} from '@/types/content';

interface ContentContextType extends ContentState {
  refresh: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => Promise<void>;
  getFilteredPosts: (filter?: ContentFilter) => Post[];
  getPostsByEventType: (eventType: WordPressEventType | WordPressEventType[], limit?: number) => Post[];
  getUpcomingEvents: (limit?: number) => Post[];
  getFeaturedPosts: (limit?: number) => Post[];
  searchPosts: (query: string, limit?: number) => Post[];
  getPostsByCategory: (category: string, limit?: number) => Post[];
  getCacheInfo: () => {
    isValid: boolean;
    isStale: boolean;
    age: number;
    ageMinutes: number;
    ageHours: number;
    totalPosts: number;
    lastUpdate: string | null;
    version: string;
    isRefreshing: boolean;
    eventTypeBreakdown: Record<string, number>;
    lastValidationCheck: string | null;
    validationAge: number;
    trackedModifications: number;
  };
  invalidatePost: (postId: number) => Promise<void>;
  getEventTypeStats: () => Record<WordPressEventType, number>;
  getAvailableEventTypes: () => WordPressEventType[];
  getPostsCountByEventType: (eventType: WordPressEventType) => number;
}

interface ContentProviderProps {
  children: ReactNode;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const generateEventTypeStats = useCallback((posts: Post[]): Record<WordPressEventType, number> => {
    const stats: Record<WordPressEventType, number> = {
      ekadasi: 0,
      festival: 0,
      courses: 0,
      guest_speaker: 0,
      news: 0,
      bio_lcvs_speaker: 0,
      bio_recent_vip: 0,
      bio_team_member: 0,
      daily_darshan: 0
    };
    
    posts.forEach(post => {
      const eventType = post.eventData?.eventType?.toLowerCase() as WordPressEventType;
      if (eventType && stats.hasOwnProperty(eventType)) {
        stats[eventType]++;
      } else {
        stats['news']++;
      }
    });
    
    return stats;
  }, []);

  const [state, setState] = useState<ContentState>({
    posts: [],
    loading: true,
    error: null,
    lastSync: 0,
    isStale: false,
    categories: [],
    tags: [],
    stats: {
      totalPosts: 0,
      postsByType: {} as Record<PostType, number>,
      postsByEventType: {
        ekadasi: 0,
        festival: 0,
        courses: 0,
        guest_speaker: 0,
        news: 0,
        bio_lcvs_speaker: 0,
        bio_recent_vip: 0,
        bio_team_member: 0,
        daily_darshan: 0
      } as Record<WordPressEventType, number>,
      lastUpdate: ''
    }
  });

  useEffect(() => {
    initializeContent();
    const cleanup = setupAppStateListener();
    
    const unsubscribe = contentManager.subscribeToUpdates((freshPosts: Post[]) => {
      const cacheInfo = contentManager.getCacheInfo();
      updateStateFromResponse(freshPosts, cacheInfo, null);
    });
    
    return () => {
      cleanup();
      unsubscribe();
    };
  }, []);

  const initializeContent = useCallback(async (): Promise<void> => {
    try {
      const response = await contentManager.getContent(undefined, false);
      const cacheInfo = contentManager.getCacheInfo();
      
      if (response.success && response.data) {
        updateStateFromResponse(response.data, cacheInfo, null);
      } else {
        updateStateFromResponse([], cacheInfo, response.error || 'Failed to load content');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateStateFromResponse([], contentManager.getCacheInfo(), errorMessage);
    }
  }, []);

  const setupAppStateListener = useCallback((): (() => void) => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkForStaleContent();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const checkForStaleContent = useCallback(async (): Promise<void> => {
    const cacheInfo = contentManager.getCacheInfo();
    
    if (cacheInfo.isStale && !state.loading && !cacheInfo.isRefreshing) {
      refreshContentInBackground();
    }
  }, [state.loading]);

  const refresh = useCallback(async (forceRefresh = true): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = forceRefresh 
        ? await contentManager.refreshContent()
        : await contentManager.getContent();
        
      const cacheInfo = contentManager.getCacheInfo();
      
      if (response.success && response.data) {
        const freshPosts = [...response.data];
        updateStateFromResponse(freshPosts, cacheInfo, null);
      } else {
        const existingPosts = [...state.posts];
        updateStateFromResponse(existingPosts, cacheInfo, response.error || 'Refresh failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Refresh failed';
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
    }
  }, [state.posts]);

  const refreshContentInBackground = useCallback(async (): Promise<void> => {
    try {
      const response = await contentManager.getContent(undefined, false);
      const cacheInfo = contentManager.getCacheInfo();
      
      if (response.success && response.data) {
        const freshPosts = [...response.data];
        updateStateFromResponse(freshPosts, cacheInfo, null);
      }
    } catch (error) {
      // Silent fail for background refresh
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      await contentManager.clearCache();
      
      setState({
        posts: [],
        loading: true,
        error: null,
        lastSync: 0,
        isStale: false,
        categories: [],
        tags: [],
        stats: {
          totalPosts: 0,
          postsByType: {} as Record<PostType, number>,
          postsByEventType: {
            ekadasi: 0,
            festival: 0,
            courses: 0,
            guest_speaker: 0,
            news: 0,
            bio_lcvs_speaker: 0,
            bio_recent_vip: 0,
            bio_team_member: 0,
            daily_darshan: 0
          } as Record<WordPressEventType, number>,
          lastUpdate: ''
        }
      });
      
      await initializeContent();
      
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to clear cache' 
      }));
    }
  }, [initializeContent]);

  const invalidatePost = useCallback(async (postId: number): Promise<void> => {
    try {
      await contentManager.invalidatePost(postId);
    } catch (error) {
      // Silent fail
    }
  }, []);

  const getFilteredPosts = useCallback((filter?: ContentFilter): Post[] => {
    if (!filter) return state.posts;
    
    return state.posts.filter(post => {
      if (filter.postTypes?.length && !filter.postTypes.includes(post.postType)) {
        return false;
      }
      
      if (filter.eventTypes?.length) {
        const postEventType = post.eventData?.eventType?.toLowerCase();
        if (!postEventType || !filter.eventTypes.some(et => et === postEventType)) {
          return false;
        }
      }
      
      if (filter.categories?.length) {
        const hasMatchingCategory = filter.categories.some(cat =>
          post.categories.some(postCat =>
            postCat.toLowerCase().includes(cat.toLowerCase())
          )
        );
        if (!hasMatchingCategory) return false;
      }
      
      if (filter.tags?.length) {
        const hasMatchingTag = filter.tags.some(tag =>
          post.tags.some(postTag =>
            postTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = [
          post.title,
          post.excerpt,
          post.content,
          post.author,
          ...post.categories,
          ...post.tags
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      if (filter.isUpcoming !== undefined) {
        if (filter.isUpcoming && !post.eventData?.isUpcoming) return false;
        if (!filter.isUpcoming && post.eventData?.isUpcoming) return false;
      }
      
      if (filter.isFeatured !== undefined && post.isFeatured !== filter.isFeatured) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      const sortBy = filter.sortBy || 'date';
      const sortOrder = filter.sortOrder || 'desc';
      
      let aValue: any, bValue: any;
      
      switch (sortBy) {
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
      
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    })
    .slice(filter.offset || 0, filter.limit ? (filter.offset || 0) + filter.limit : undefined);
  }, [state.posts]);

  const getPostsByEventType = useCallback((eventType: WordPressEventType | WordPressEventType[], limit?: number): Post[] => {
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType];
    const mappedPostTypes = eventTypes.map(et => mapEventTypeToPostType(et)).filter((pt, index, arr) => arr.indexOf(pt) === index);
    
    return getFilteredPosts({
      postTypes: mappedPostTypes as any,
      limit,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, [getFilteredPosts]);

  const getUpcomingEvents = useCallback((limit?: number): Post[] => {
    const eventTypesWithDates = getEventTypesWithDates();
    const mappedPostTypes = eventTypesWithDates.map(et => mapEventTypeToPostType(et)).filter((pt, index, arr) => arr.indexOf(pt) === index);
    
    return getFilteredPosts({
      postTypes: mappedPostTypes as any,
      isUpcoming: true,
      limit,
      sortBy: 'eventDate',
      sortOrder: 'asc'
    });
  }, [getFilteredPosts]);

  const getFeaturedPosts = useCallback((limit?: number): Post[] => {
    return getFilteredPosts({
      isFeatured: true,
      limit,
      sortBy: 'views',
      sortOrder: 'desc'
    });
  }, [getFilteredPosts]);

  const searchPosts = useCallback((query: string, limit?: number): Post[] => {
    if (!query.trim()) return [];
    
    return getFilteredPosts({
      search: query,
      limit,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, [getFilteredPosts]);

  const getPostsByCategory = useCallback((category: string, limit?: number): Post[] => {
    return getFilteredPosts({
      categories: [category],
      limit,
      sortBy: 'date',
      sortOrder: 'desc'
    });
  }, [getFilteredPosts]);

  const getEventTypeStats = useCallback((): Record<WordPressEventType, number> => {
    return generateEventTypeStats(state.posts);
  }, [state.posts, generateEventTypeStats]);

  const getAvailableEventTypes = useCallback((): WordPressEventType[] => {
    return getAllWordPressEventTypes();
  }, []);

  const getPostsCountByEventType = useCallback((eventType: WordPressEventType): number => {
    const stats = getEventTypeStats();
    return stats[eventType] || 0;
  }, [getEventTypeStats]);

  const getCacheInfo = useCallback(() => {
    const info = contentManager.getCacheInfo();
    return {
      ...info,
      eventTypeBreakdown: generateEventTypeStats(state.posts) as Record<string, number>
    };
  }, [state.posts, generateEventTypeStats]);

  const updateStateFromResponse = useCallback((
    posts: Post[], 
    cacheInfo: ReturnType<typeof contentManager.getCacheInfo>, 
    error: string | null
  ): void => {
    const freshPosts = [...posts];
    
    setState({
      posts: freshPosts,
      loading: false,
      error,
      lastSync: Date.now(),
      isStale: cacheInfo.isStale,
      categories: [...(cacheInfo.categories || [])],
      tags: [...(cacheInfo.tags || [])],
      stats: {
        totalPosts: freshPosts.length,
        postsByType: { ...(cacheInfo.postsByType || {}) },
        postsByEventType: generateEventTypeStats(freshPosts) as Record<WordPressEventType, number>,
        lastUpdate: cacheInfo.lastUpdate || ''
      }
    });
  }, [generateEventTypeStats]);

  const contextValue: ContentContextType = React.useMemo(() => ({
    ...state,
    refresh,
    clearCache,
    getFilteredPosts,
    getPostsByEventType,
    getUpcomingEvents,
    getFeaturedPosts,
    searchPosts,
    getPostsByCategory,
    getCacheInfo,
    invalidatePost,
    getEventTypeStats,
    getAvailableEventTypes,
    getPostsCountByEventType
  }), [
    state, 
    refresh, 
    clearCache, 
    getFilteredPosts, 
    getPostsByEventType,
    getUpcomingEvents,
    getFeaturedPosts,
    searchPosts,
    getPostsByCategory,
    getCacheInfo, 
    invalidatePost,
    getEventTypeStats,
    getAvailableEventTypes,
    getPostsCountByEventType
  ]);

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

// Convenience Hooks
export const usePostsByType = (postType: string | string[], limit?: number) => {
  const { getFilteredPosts, loading, error } = useContent();
  
  const posts = React.useMemo(() => getFilteredPosts({
    postTypes: Array.isArray(postType) ? postType as any : [postType as any],
    limit,
    sortBy: 'date',
    sortOrder: 'desc'
  }), [getFilteredPosts, postType, limit]);
  
  return { posts, loading, error };
};

export const usePostsByEventType = (eventType: WordPressEventType | WordPressEventType[], limit?: number) => {
  const { getPostsByEventType, loading, error } = useContent();
  
  const posts = React.useMemo(() => 
    getPostsByEventType(eventType, limit)
  , [getPostsByEventType, eventType, limit]);
  
  return { posts, loading, error };
};

export const useUpcomingEvents = (limit?: number) => {
  const { getUpcomingEvents, loading, error } = useContent();
  
  const events = React.useMemo(() => 
    getUpcomingEvents(limit)
  , [getUpcomingEvents, limit]);
  
  return { events, loading, error };
};

export const useFeaturedPosts = (limit?: number) => {
  const { getFeaturedPosts, loading, error } = useContent();
  
  const posts = React.useMemo(() => 
    getFeaturedPosts(limit)
  , [getFeaturedPosts, limit]);
  
  return { posts, loading, error };
};

export const useSearchPosts = (query: string, limit?: number) => {
  const { searchPosts, loading, error } = useContent();
  
  const posts = React.useMemo(() => 
    searchPosts(query, limit)
  , [searchPosts, query, limit]);
  
  return { posts, loading, error };
};

export const usePostsByCategory = (category: string, limit?: number) => {
  const { getPostsByCategory, loading, error } = useContent();
  
  const posts = React.useMemo(() => 
    getPostsByCategory(category, limit)
  , [getPostsByCategory, category, limit]);
  
  return { posts, loading, error };
};

export const useEventTypeStats = () => {
  const { getEventTypeStats } = useContent();
  return React.useMemo(() => getEventTypeStats(), [getEventTypeStats]);
};

export const useAvailableEventTypes = () => {
  const { getAvailableEventTypes } = useContent();
  return React.useMemo(() => getAvailableEventTypes(), [getAvailableEventTypes]);
};

export const useFestivals = (limit?: number) => {
  return usePostsByEventType(['festival', 'ekadasi'], limit);
};

export const useCourses = (limit?: number) => {
  return usePostsByEventType('courses', limit);
};

export const useNews = (limit?: number) => {
  return usePostsByEventType('news', limit);
};

export const useSpeakers = (limit?: number) => {
  return usePostsByEventType(['guest_speaker', 'bio_lcvs_speaker'], limit);
};

export const useTeamMembers = (limit?: number) => {
  return usePostsByEventType('bio_team_member', limit);
};

export const useDailyDarshan = (limit?: number) => {
  return usePostsByEventType('daily_darshan', limit);
};

export const useContentStats = () => {
  const { posts, stats } = useContent();
  const eventTypeStats = useEventTypeStats();
  
  return React.useMemo(() => ({
    totalPosts: posts.length,
    totalEvents: posts.filter(p => p.eventData).length,
    upcomingEvents: posts.filter(p => p.eventData?.isUpcoming).length,
    featuredPosts: posts.filter(p => p.isFeatured).length,
    postsByType: stats.postsByType,
    postsByEventType: eventTypeStats,
    lastUpdate: stats.lastUpdate
  }), [posts, stats, eventTypeStats]);
};

export default ContentProvider;