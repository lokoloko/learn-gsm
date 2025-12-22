import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';
import { ALL_CATEGORY_SLUGS } from '@/lib/utils/categories';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://learn.gostudiom.com';

// Sitemap limits (standard sitemap max is 50,000 URLs)
const VIDEO_LIMIT = 50000;
const NEWS_LIMIT = 10000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/videos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/topics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/chat`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Topic pages
  const topicPages: MetadataRoute.Sitemap = ALL_CATEGORY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/topics/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Video pages - use slug for SEO-friendly URLs
  const { data: videos, error: videoError } = await supabase
    .from('videos_parsed')
    .select('slug, youtube_video_id, updated_at')
    .eq('ai_status', 'completed')
    .order('score', { ascending: false })
    .limit(VIDEO_LIMIT);

  if (videoError) {
    console.error('[Sitemap] Video query error:', videoError);
  }

  const videoPages: MetadataRoute.Sitemap = (videos || []).map((video) => ({
    url: `${BASE_URL}/videos/${video.slug || video.youtube_video_id}`,
    lastModified: video.updated_at ? new Date(video.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // News pages - slug column exists for news_articles
  const { data: news, error: newsError } = await supabase
    .from('news_articles')
    .select('slug, id, updated_at')
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .order('published_at', { ascending: false })
    .limit(NEWS_LIMIT);

  if (newsError) {
    console.error('[Sitemap] News query error:', newsError);
  }

  const newsPages: MetadataRoute.Sitemap = (news || []).map((article) => ({
    url: `${BASE_URL}/news/${article.slug || article.id}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const totalUrls = staticPages.length + topicPages.length + videoPages.length + newsPages.length;
  console.log(`[Sitemap] Generated ${totalUrls} URLs: ${staticPages.length} static, ${topicPages.length} topics, ${videoPages.length} videos, ${newsPages.length} news`);

  return [...staticPages, ...topicPages, ...videoPages, ...newsPages];
}
