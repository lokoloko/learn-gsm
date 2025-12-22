import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';
import { ALL_CATEGORY_SLUGS } from '@/lib/utils/categories';

// Allow up to 60 seconds for sitemap generation (pagination + large dataset)
export const maxDuration = 60;

// Trim any trailing whitespace from env variable
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://learn.gostudiom.com').trim();

// Batch size for pagination (Supabase default limit is 1000)
const BATCH_SIZE = 1000;

// Helper to fetch all rows with pagination
async function fetchAllRows<T>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  select: string,
  filters: { column: string; value: string }[],
  orderBy: { column: string; ascending: boolean }
): Promise<T[]> {
  const allRows: T[] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from(table)
      .select(select)
      .range(offset, offset + BATCH_SIZE - 1)
      .order(orderBy.column, { ascending: orderBy.ascending });

    // Apply filters
    for (const filter of filters) {
      query = query.eq(filter.column, filter.value);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`[Sitemap] Error fetching ${table}:`, error);
      break;
    }

    if (data && data.length > 0) {
      allRows.push(...(data as T[]));
      offset += BATCH_SIZE;
      hasMore = data.length === BATCH_SIZE;
    } else {
      hasMore = false;
    }
  }

  return allRows;
}

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

  // Video pages - use slug for SEO-friendly URLs (paginated to bypass 1000 row limit)
  type VideoRow = { slug: string | null; youtube_video_id: string; updated_at: string | null };
  const videos = await fetchAllRows<VideoRow>(
    supabase,
    'videos_parsed',
    'slug, youtube_video_id, updated_at',
    [{ column: 'ai_status', value: 'completed' }],
    { column: 'score', ascending: false }
  );

  const videoPages: MetadataRoute.Sitemap = videos.map((video) => ({
    url: `${BASE_URL}/videos/${video.slug || video.youtube_video_id}`,
    lastModified: video.updated_at ? new Date(video.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // News pages - slug column exists for news_articles (paginated)
  type NewsRow = { slug: string | null; id: string; updated_at: string | null };
  const news = await fetchAllRows<NewsRow>(
    supabase,
    'news_articles',
    'slug, id, updated_at',
    [
      { column: 'status', value: 'parsed' },
      { column: 'is_relevant', value: 'true' },
    ],
    { column: 'published_at', ascending: false }
  );

  const newsPages: MetadataRoute.Sitemap = news.map((article) => ({
    url: `${BASE_URL}/news/${article.slug || article.id}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const totalUrls = staticPages.length + topicPages.length + videoPages.length + newsPages.length;
  console.log(`[Sitemap] Generated ${totalUrls} URLs: ${staticPages.length} static, ${topicPages.length} topics, ${videoPages.length} videos, ${newsPages.length} news`);

  return [...staticPages, ...topicPages, ...videoPages, ...newsPages];
}
