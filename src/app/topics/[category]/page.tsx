import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VideoCard, NewsCard, CreatorCard } from '@/components/cards';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-server';
import {
  ALL_CATEGORY_SLUGS,
  CATEGORY_META,
  isValidCategorySlug,
  slugToCategory,
} from '@/lib/utils/categories';
import type { CategorySlug } from '@/lib/utils/categories';
import type { VideoWithChannel, NewsArticleWithSource, Channel } from '@/types/database';

interface PageProps {
  params: Promise<{ category: string }>;
}

// Generate static paths for all categories
export function generateStaticParams() {
  return ALL_CATEGORY_SLUGS.map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;

  if (!isValidCategorySlug(category)) {
    return { title: 'Topic Not Found' };
  }

  const meta = CATEGORY_META[category as CategorySlug];

  return {
    title: meta.name,
    description: meta.description,
  };
}

// Revalidate every hour
export const revalidate = 3600;

async function getTopicData(categorySlug: string) {
  if (!isValidCategorySlug(categorySlug)) {
    return null;
  }

  const supabase = await createClient();
  const dbCategory = slugToCategory(categorySlug);

  // Fetch top videos for this category
  const { data: videos } = await supabase
    .from('videos_parsed')
    .select(`
      id, slug, youtube_video_id, title, summary, thumbnail_url,
      category, skill_level, score, duration, view_count, published_at, channel_id, channel_title,
      channel:videos_channels!channel_id(slug, title, thumbnail_url)
    `)
    .eq('ai_status', 'completed')
    .eq('category', dbCategory)
    .order('score', { ascending: false })
    .limit(8);

  // Fetch latest news for this category
  const { data: news } = await supabase
    .from('news_articles')
    .select(`
      id, slug, url, title, summary, excerpt, image_url,
      category, score, published_at, primary_location, is_local_news,
      source:news_sources(name, slug, logo_url)
    `)
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .eq('category', dbCategory)
    .order('published_at', { ascending: false })
    .limit(4);

  // Fetch top creators in this category (channels with most videos in category)
  const { data: channelVideoCounts } = await supabase
    .from('videos_parsed')
    .select('channel_id')
    .eq('ai_status', 'completed')
    .eq('category', dbCategory);

  // Count videos per channel
  const channelCounts: Record<string, number> = {};
  channelVideoCounts?.forEach((v) => {
    if (v.channel_id) {
      channelCounts[v.channel_id] = (channelCounts[v.channel_id] || 0) + 1;
    }
  });

  // Get top 6 channels by video count in this category
  const topChannelIds = Object.entries(channelCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([id]) => id);

  let creators: Channel[] = [];
  if (topChannelIds.length > 0) {
    const { data: channels } = await supabase
      .from('videos_channels')
      .select('*')
      .in('channel_id', topChannelIds)
      .eq('status', 'active');
    creators = channels || [];
  }

  return {
    videos: (videos || []) as VideoWithChannel[],
    news: (news || []) as NewsArticleWithSource[],
    creators,
    meta: CATEGORY_META[categorySlug as CategorySlug],
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { category } = await params;
  const data = await getTopicData(category);

  if (!data) {
    notFound();
  }

  const { videos, news, creators, meta } = data;

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/topics"
          className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
        >
          &larr; All Topics
        </Link>
        <h1 className="text-3xl font-bold mb-2">{meta.name}</h1>
        <p className="text-muted-foreground">{meta.description}</p>
      </div>

      {/* Latest News */}
      {news.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Latest News</h2>
            <Link href={`/news?category=${category}`}>
              <Button variant="ghost" size="sm">
                View all &rarr;
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Top Videos */}
      {videos.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Top Videos</h2>
            <Link href={`/videos?category=${category}`}>
              <Button variant="ghost" size="sm">
                View all &rarr;
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* Top Creators */}
      {creators.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Top Creators</h2>
            <Link href="/creators">
              <Button variant="ghost" size="sm">
                View all &rarr;
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {creators.map((channel) => (
              <CreatorCard key={channel.id} channel={channel} showStats={false} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {videos.length === 0 && news.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No content available for this topic yet.
          </p>
          <Link href="/topics">
            <Button variant="outline">Browse other topics</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
