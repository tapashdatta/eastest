// types/content.ts - Updated for Smart Cache System

export interface Post {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  slug: string;
  date: string;
  modified: string; // IMPORTANT: Added for smart cache validation
  
  // Category & Taxonomy
  category: string;
  categories: string[];
  tags: string[];
  
  // Author & Meta
  author: string;
  authorId: number;
  
  // Post Type & Status
  postType: PostType;
  status: 'publish' | 'draft' | 'private';
  
  // Event Fields (optional) - enhanced for new meta fields
  eventData?: {
    startDate?: string;           // _iskcon_start_date
    endDate?: string;             // _iskcon_end_date
    countdownDate?: string;       // _iskcon_countdown_date
    location?: string;            // _iskcon_location
    eventType?: string;           // _iskcon_event_type (display name)
    breakfastInfo?: string;       // _iskcon_breakfast_info
    dietaryRestrictions?: string; // _iskcon_dietary_restrictions
    donationLink?: string;        // _iskcon_donation_link
    registrationUrl?: string;     // _iskcon_registration_url
    isUpcoming?: boolean;
    hasEnded?: boolean;
  };
  
  // Engagement (can be generated or real)
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  
  // App-specific fields
  readTime: string;
  rating: number;
  isFeatured: boolean;
  isBookmarked: boolean;
  isLiked: boolean;
}

// Updated PostType enum to map to new event_type values
export type PostType = 
  | 'posts'              // General/default posts
  | 'festival_event'     // Maps to event_type: 'festival' or 'ekadasi'
  | 'courses'            // Maps to event_type: 'courses'
  | 'guest-speaker'      // Maps to event_type: 'guest_speaker'
  | 'news'               // Maps to event_type: 'news'
  | 'lcvs-speaker'       // Maps to event_type: 'bio_lcvs_speaker'
  | 'recent-vip'         // Maps to event_type: 'bio_recent_vip'
  | 'teams'              // Maps to event_type: 'bio_team_member'
  | 'daily-darshan'      // Maps to event_type: 'daily_darshan'
  | 'service';           // For future use

// WordPress event_type values (from _iskcon_event_type meta field)
export type WordPressEventType = 
  | 'ekadasi'
  | 'festival'
  | 'courses'
  | 'guest_speaker'
  | 'news'
  | 'bio_lcvs_speaker'
  | 'bio_recent_vip'
  | 'bio_team_member'
  | 'daily_darshan';

export interface ContentFilter {
  postTypes?: PostType[];
  eventTypes?: WordPressEventType[]; // New: filter by WordPress event types
  categories?: string[];
  tags?: string[];
  search?: string;
  isUpcoming?: boolean;
  isFeatured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'title' | 'views' | 'rating' | 'eventDate';
  sortOrder?: 'asc' | 'desc';
}

// Enhanced cache interface with smart validation
export interface ContentCache {
  posts: Post[];
  timestamp: number;
  version: string;
  postTypeCount: Record<PostType, number>;
  eventTypeCount: Record<WordPressEventType, number>; // New: track by WordPress event types
  categories: string[];
  tags: string[];
  postModificationMap: Record<number, string>; // NEW: postId -> modified date
  lastValidationCheck: number; // NEW: when we last checked for updates
}

export interface ContentState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  lastSync: number;
  isStale: boolean;
  categories: string[];
  tags: string[];
  stats: {
    totalPosts: number;
    postsByType: Record<PostType, number>;
    postsByEventType: Record<WordPressEventType, number>; // New: stats by event type
    lastUpdate: string;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Helper function to map WordPress event types to app post types
export function mapEventTypeToPostType(eventType?: string): PostType {
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

// Helper function to get display name for event types
export function getEventTypeDisplayName(eventType?: string): string {
  if (!eventType) return 'Post';
  
  switch (eventType as WordPressEventType) {
    case 'festival':
      return 'Festival';
    case 'ekadasi':
      return 'Ekadasi';
    case 'courses':
      return 'Course';
    case 'guest_speaker':
      return 'Guest Speaker';
    case 'news':
      return 'News';
    case 'bio_lcvs_speaker':
      return 'LCVS Speaker';
    case 'bio_recent_vip':
      return 'Recent VIP';
    case 'bio_team_member':
      return 'Team Member';
    case 'daily_darshan':
      return 'Daily Darshan';
    default:
      return 'Post';
  }
}

// Helper to check if event type has extended fields
export function hasExtendedEventFields(eventType?: string): boolean {
  const simpleTypes: WordPressEventType[] = ['bio_lcvs_speaker', 'bio_recent_vip', 'bio_team_member', 'daily_darshan'];
  return eventType ? !simpleTypes.includes(eventType as WordPressEventType) : false;
}

// Helper to get all available WordPress event types
export function getAllWordPressEventTypes(): WordPressEventType[] {
  return [
    'ekadasi',
    'festival',
    'courses',
    'guest_speaker',
    'news',
    'bio_lcvs_speaker',
    'bio_recent_vip',
    'bio_team_member',
    'daily_darshan'
  ];
}

// Helper to get event types that have date/time fields
export function getEventTypesWithDates(): WordPressEventType[] {
  return [
    'ekadasi',
    'festival',
    'courses',
    'guest_speaker'
  ];
}