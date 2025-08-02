// services/WordPressContentAPI.ts - Production Version

import Logger from '@/utils/Logger';
import { Post } from '@/types/content';

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  title: {
    rendered: string;
  } | string;
  content: {
    rendered: string;
    protected: boolean;
  } | string;
  excerpt: {
    rendered: string;
    protected: boolean;
  } | string;
  featured_media?: number;
  meta: {
    _iskcon_event_type?: string;
    _iskcon_start_date?: string;
    _iskcon_end_date?: string;
    _iskcon_countdown_date?: string;
    _iskcon_location?: string;
    _iskcon_breakfast_info?: string;
    _iskcon_dietary_restrictions?: string;
    _iskcon_donation_link?: string;
    _iskcon_registration_url?: string;
    [key: string]: any;
  };
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: {
          full?: { source_url: string };
          large?: { source_url: string };
          medium?: { source_url: string };
        };
      };
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
    author?: Array<{
      id: number;
      name: string;
    }>;
  };
}

interface PostValidationInfo {
  id: number;
  modified: string;
  featured_media?: number;
}

export interface ValidationResponse {
  outdatedPostIds: number[];
  validationTimestamp: number;
}

export interface AppPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  modified: string;
  readTime: string;
  rating: number;
  location: string;
  likes: number;
  comments: number;
  views: number;
  isBookmarked: boolean;
  isLiked: boolean;
  slug: string;
  author: string;
  tags: string[];
  event_type?: string;
  start_date?: string;
  end_date?: string;
  countdown_date?: string;
  breakfast_info?: string;
  dietary_restrictions?: string;
  donation_link?: string;
  registration_url?: string;
}

export interface APIError {
  code: string;
  message: string;
  data?: {
    status: number;
  };
}

export interface IskconPostParams {
  per_page?: number;
  page?: number;
  event_type?: string | string[];
  orderby?: 'date' | 'title' | 'meta_value' | 'modified';
  order?: 'asc' | 'desc';
  meta_key?: string;
  search?: string;
  _fields?: string;
}

class WordPressContentAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_WORDPRESS_BASE_URL || '';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.baseURL) {
      throw new Error('WordPress base URL not configured');
    }

    const url = `${this.baseURL}/wp-json/wp/v2${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: APIError;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            code: 'http_error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            data: { status: response.status }
          };
        }

        Logger.error('WordPress API Error', errorData);
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      Logger.error('WordPress API Request Failed', { url, error });
      throw error;
    }
  }

  // ================================
  // SMART VALIDATION
  // ================================

  async validatePostModifications(cachedPosts: Post[]): Promise<ValidationResponse> {
    try {
      const queryParams = new URLSearchParams({
        per_page: '100',
        _fields: 'id,modified,featured_media',
        orderby: 'modified',
        order: 'desc'
      });

      const endpoint = `/iskcon_post?${queryParams.toString()}`;
      const serverPosts = await this.makeRequest<PostValidationInfo[]>(endpoint);
      
      const outdatedPostIds: number[] = [];
      
      serverPosts.forEach(serverPost => {
        const cachedPost = cachedPosts.find(p => p.id === serverPost.id);
        
        if (!cachedPost) {
          outdatedPostIds.push(serverPost.id);
        } else {
          const serverModified = new Date(serverPost.modified);
          const cachedModified = new Date(cachedPost.modified);
          
          if (serverModified > cachedModified) {
            outdatedPostIds.push(serverPost.id);
          }
        }
      });
      
      return {
        outdatedPostIds,
        validationTimestamp: Date.now()
      };
      
    } catch (error) {
      Logger.error('Validation request failed', error);
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ================================
  // POST TRANSFORMATION
  // ================================

  private transformPost(post: WordPressPost): AppPost {
    let title = 'Untitled Post';
    if (typeof post.title === 'string') {
      title = post.title;
    } else if (post.title && typeof post.title === 'object' && 'rendered' in post.title) {
      title = post.title.rendered;
    }

    let excerpt = 'No description available';
    if (typeof post.excerpt === 'string') {
      excerpt = post.excerpt.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();
    } else if (post.excerpt && typeof post.excerpt === 'object' && 'rendered' in post.excerpt) {
      excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();
    }

    let content = '';
    if (typeof post.content === 'string') {
      content = post.content.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();
    } else if (post.content && typeof post.content === 'object' && 'rendered' in post.content) {
      content = post.content.rendered.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim();
    }

    const featuredImage = this.extractFeaturedImage(post);
    
    const categories = post._embedded?.['wp:term']?.[0] || [];
    const primaryCategory = categories[0]?.name || 'ISKCON Post';

    const author = post._embedded?.author?.[0]?.name || 'ISKCON London';
    const tags = post._embedded?.['wp:term']?.[1]?.map(tag => tag.name) || [];

    const wordCount = content ? content.split(' ').length : 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 200)) + ' min read';

    const eventType = post.meta?._iskcon_event_type || '';
    const startDate = post.meta?._iskcon_start_date || '';
    const endDate = post.meta?._iskcon_end_date || '';
    const countdownDate = post.meta?._iskcon_countdown_date || '';
    const location = post.meta?._iskcon_location || 'ISKCON London';
    const breakfastInfo = post.meta?._iskcon_breakfast_info || '';
    const dietaryRestrictions = post.meta?._iskcon_dietary_restrictions || '';
    const donationLink = post.meta?._iskcon_donation_link || '/donate';
    const registrationUrl = post.meta?._iskcon_registration_url || '';

    return {
      id: post.id,
      title: title,
      excerpt: excerpt || 'Join us for this special post.',
      content: content || excerpt || 'More details coming soon.',
      image: featuredImage,
      category: primaryCategory,
      date: post.date || new Date().toISOString(),
      modified: post.modified || post.date || new Date().toISOString(),
      readTime: readTime,
      rating: 4 + Math.random(),
      location: location,
      likes: Math.floor(Math.random() * 200) + 50,
      comments: Math.floor(Math.random() * 50) + 5,
      views: Math.floor(Math.random() * 2000) + 100,
      isBookmarked: false,
      isLiked: false,
      slug: post.slug || post.id.toString(),
      author: author,
      tags: tags,
      event_type: eventType,
      start_date: startDate,
      end_date: endDate,
      countdown_date: countdownDate,
      breakfast_info: breakfastInfo,
      dietary_restrictions: dietaryRestrictions,
      donation_link: donationLink,
      registration_url: registrationUrl,
    };
  }

  private extractFeaturedImage(post: WordPressPost): string {
    const embeddedImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (embeddedImage && this.isValidImageUrl(embeddedImage)) {
      return embeddedImage;
    }

    const altEmbeddedImage = post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.full?.source_url;
    if (altEmbeddedImage && this.isValidImageUrl(altEmbeddedImage)) {
      return altEmbeddedImage;
    }

    const contentImage = this.extractImageFromContent(post.content);
    if (contentImage && this.isValidImageUrl(contentImage)) {
      return contentImage;
    }

    const eventType = post.meta?._iskcon_event_type;
    return this.getEventTypeFallback(eventType);
  }

  private extractImageFromContent(content: any): string | null {
    if (!content) return null;
    
    const contentString = typeof content === 'string' ? content : content.rendered || '';
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = contentString.match(imgRegex);
    
    return match ? match[1] : null;
  }

  private getEventTypeFallback(eventType?: string): string {
    const fallbacks = {
      'ekadasi': 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/08/arati.webp',
      'festival': 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/04/photogallery.webp',
      'courses': 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/12/lcvs5_desktop-2.jpg',
      'guest_speaker': 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2024/07/events-meditation-music_desktop-jpg.avif',
      'news': 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/08/arati.webp',
      'daily_darshan': 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/08/arati.webp'
    };
    
    return fallbacks[eventType as keyof typeof fallbacks] || 'https://cdn-iskcon-london.s3-accelerate.amazonaws.com/wp-content/uploads/2025/08/arati.webp';
  }

  private isValidImageUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    
    try {
      new URL(url);
    } catch {
      return false;
    }
    
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i;
    const hasImageExtension = imageExtensions.test(url);
    
    const imageServices = /(unsplash|pexels|images\.pexels|images\.unsplash|wp-content\/uploads)/i;
    const isFromImageService = imageServices.test(url);
    
    return hasImageExtension || isFromImageService;
  }

  // ================================
  // MAIN API METHODS
  // ================================

  async getIskconPosts(params: IskconPostParams = {}): Promise<AppPost[]> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('per_page', (params.per_page || 50).toString());
    queryParams.append('_embed', 'true');
    
    if (params._fields) {
      queryParams.append('_fields', params._fields);
    }
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);
    if (params.meta_key) queryParams.append('meta_key', params.meta_key);

    const endpoint = `/iskcon_post?${queryParams.toString()}`;
    
    try {
      const posts = await this.makeRequest<WordPressPost[]>(endpoint);
      let transformedPosts = posts.map(post => this.transformPost(post));
      
      if (params.event_type) {
        const eventTypes = Array.isArray(params.event_type) ? params.event_type : [params.event_type];
        transformedPosts = transformedPosts.filter(post => 
          post.event_type && eventTypes.includes(post.event_type)
        );
      }
      
      return transformedPosts;
      
    } catch (error) {
      Logger.error('Error fetching ISKCON posts', error);
      throw error;
    }
  }

  async getIskconPostsByEventType(eventType: string | string[], params: Omit<IskconPostParams, 'event_type'> = {}): Promise<AppPost[]> {
    return this.getIskconPosts({
      ...params,
      event_type: eventType
    });
  }

  async getUpcomingIskconEvents(params: Omit<IskconPostParams, 'orderby' | 'meta_key'> = {}): Promise<AppPost[]> {
    const posts = await this.getIskconPosts({
      ...params,
      orderby: 'meta_value',
      meta_key: '_iskcon_start_date',
      order: 'asc'
    });
    
    const now = new Date();
    return posts.filter(post => {
      if (!post.start_date) return false;
      
      try {
        const startDate = new Date(post.start_date);
        return startDate > now;
      } catch {
        return false;
      }
    });
  }

  async getIskconPost(id: number): Promise<AppPost> {
    const post = await this.makeRequest<WordPressPost>(`/iskcon_post/${id}?_embed=true`);
    return this.transformPost(post);
  }

  async searchIskconPosts(query: string, params: Omit<IskconPostParams, 'search'> = {}): Promise<AppPost[]> {
    return this.getIskconPosts({
      ...params,
      search: query
    });
  }

  async getFeaturedIskconPosts(params: { per_page?: number } = {}): Promise<AppPost[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('sticky', 'true');
    queryParams.append('per_page', (params.per_page || 5).toString());
    queryParams.append('_embed', 'true');

    const endpoint = `/iskcon_post?${queryParams.toString()}`;
    
    const posts = await this.makeRequest<WordPressPost[]>(endpoint);
    return posts.map(post => this.transformPost(post));
  }

  // ================================
  // LEGACY COMPATIBILITY
  // ================================

  async getFestivalEvents(params: any = {}): Promise<AppPost[]> {
    return this.getIskconPostsByEventType(['festival', 'ekadasi'], params);
  }

  async getPostsByType(postType: string, params: any = {}): Promise<AppPost[]> {
    const eventTypeMapping: { [key: string]: string | string[] } = {
      'festival_event': ['festival', 'ekadasi'],
      'daily-darshan': ['daily_darshan'],
      'news': ['news'],
      'posts': [],
      'lcvs-speaker': ['bio_lcvs_speaker'],
      'guest-speaker': ['guest_speaker'],
      'courses': ['courses'],
      'teams': ['bio_team_member'],
      'recent-vip': ['bio_recent_vip']
    };
    
    const eventType = eventTypeMapping[postType];
    
    if (eventType && eventType.length > 0) {
      return this.getIskconPostsByEventType(eventType, params);
    } else {
      return this.getIskconPosts(params);
    }
  }

  async getPost(id: number, postType: string = 'iskcon_post'): Promise<AppPost> {
    return this.getIskconPost(id);
  }

  async searchPosts(query: string, params: any = {}): Promise<AppPost[]> {
    return this.searchIskconPosts(query, params);
  }

  async getFeaturedPosts(params: { per_page?: number } = {}): Promise<AppPost[]> {
    return this.getFeaturedIskconPosts(params);
  }
}

export const wordPressContentAPI = new WordPressContentAPIService();
export { WordPressContentAPIService };