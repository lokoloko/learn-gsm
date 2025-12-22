/**
 * Database types for learn.gostudiom.com
 * Based on videos_* and news_* tables in shared Supabase project
 */

// Enums
export type VideoCategory =
  | 'Getting Started'
  | 'Your Listing'
  | 'Pricing & Profitability'
  | 'Hosting Operations'
  | 'Regulations & Compliance'
  | 'Growth & Marketing';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type KnowledgeType =
  | 'insight'
  | 'action_item'
  | 'resource'
  | 'definition'
  | 'mistake';

// Channel
export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  handle: string | null;
  slug: string | null;
  thumbnail_url: string | null;
  subscriber_count: number | null;
  video_count: number | null;
  status: 'active' | 'paused' | 'inactive';
  created_at: string;
}

// Video (from videos_parsed)
export interface Video {
  id: string;
  video_id: string;
  youtube_video_id: string;
  slug: string | null;
  channel_id: string | null;
  channel_title: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  summary: string | null;
  tags: string[];
  category: VideoCategory | null;
  skill_level: SkillLevel;
  score: number;
  ai_confidence: number | null;
  ai_status: string | null;
  transcript: string | null;
  duration: number | null;
  view_count: number | null;
  like_count: number | null;
  published_at: string | null;
  created_at: string;
}

// Video for list views (no channel join)
export interface VideoWithChannel {
  id: string;
  youtube_video_id: string;
  channel_id: string | null;
  channel_title: string | null;
  title: string | null;
  thumbnail_url: string | null;
  summary: string | null;
  category: VideoCategory | null;
  skill_level: SkillLevel;
  score: number;
  duration: number | null;
  view_count: number | null;
  published_at: string | null;
}

// Video Knowledge
export interface VideoKnowledge {
  id: string;
  video_id: string;
  knowledge_type: KnowledgeType;
  content: {
    text: string;
    term?: string; // for definitions
    effort?: 'low' | 'medium' | 'high'; // for action_items
    impact?: 'low' | 'medium' | 'high'; // for action_items
    resource_name?: string; // for resources
    resource_type?: 'tool' | 'service' | 'website' | 'book' | 'course' | 'app';
    url_hint?: string; // for resources
  };
  category: VideoCategory | null;
  skill_level: SkillLevel;
  searchable_text: string | null;
  created_at: string;
}

// News Source
export interface NewsSource {
  id: string;
  name: string;
  slug: string;
  source_type: 'rss' | 'google_news';
  source_category:
    | 'industry'
    | 'platform'
    | 'mainstream'
    | 'creator'
    | 'real_estate'
    | 'travel';
  url: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  articles_count: number;
  created_at: string;
}

// News Article
export interface NewsArticle {
  id: string;
  source_id: string;
  slug: string | null;
  url: string;
  title: string;
  excerpt: string | null;
  full_text: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
  status: 'pending' | 'processing' | 'parsed' | 'skipped' | 'failed';
  summary: string | null;
  category: VideoCategory | null;
  skill_level: SkillLevel | null;
  tags: string[];
  score: number | null;
  confidence: number | null;
  is_relevant: boolean | null;
  locations_mentioned: string[];
  primary_location: string | null;
  is_local_news: boolean;
  parsed_at: string | null;
  created_at: string;
}

// News Article with source join (partial for list views)
export interface NewsArticleWithSource {
  id: string;
  slug: string | null;
  url: string;
  title: string;
  summary: string | null;
  excerpt: string | null;
  image_url: string | null;
  category: VideoCategory | null;
  score: number | null;
  published_at: string | null;
  primary_location: string | null;
  is_local_news: boolean;
  source: Pick<NewsSource, 'name' | 'slug' | 'logo_url'>[] | null;
}

// News Knowledge
export interface NewsKnowledge {
  id: string;
  article_id: string;
  knowledge_type: KnowledgeType;
  content: {
    text: string;
    term?: string;
    effort?: 'low' | 'medium' | 'high';
    impact?: 'low' | 'medium' | 'high';
    resource_name?: string;
    resource_type?: 'tool' | 'service' | 'website' | 'book' | 'course' | 'app';
    url_hint?: string;
  };
  category: VideoCategory | null;
  skill_level: SkillLevel | null;
  searchable_text: string | null;
  created_at: string;
}

// Helper type for URL generation
export function getVideoUrl(video: Pick<VideoWithChannel, 'youtube_video_id'>): string {
  return `/videos/${video.youtube_video_id}`;
}

export function getNewsUrl(article: Pick<NewsArticle, 'slug' | 'id'>): string {
  return `/news/${article.slug || article.id}`;
}
