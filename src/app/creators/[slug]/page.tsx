import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { VideoCard } from '@/components/cards';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-server';
import { categoryToSlug, CATEGORY_META } from '@/lib/utils/categories';
import type { CategorySlug } from '@/lib/utils/categories';
import type { Channel, VideoWithChannel } from '@/types/database';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: channel } = await supabase
    .from('videos_channels')
    .select('title, description')
    .or(`slug.eq.${slug},channel_id.eq.${slug}`)
    .eq('status', 'active')
    .single();

  if (!channel) {
    return { title: 'Creator Not Found' };
  }

  return {
    title: channel.title,
    description: channel.description || `Videos from ${channel.title} on short-term rentals`,
  };
}

// Revalidate every hour
export const revalidate = 3600;

const ITEMS_PER_PAGE = 24;

function formatSubscriberCount(count: number | null): string {
  if (!count) return '';
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M subscribers`;
  }
  if (count >= 1000) {
    return `${Math.round(count / 1000)}K subscribers`;
  }
  return `${count} subscribers`;
}

async function getCreatorData(slug: string, category?: string, page = 1) {
  const supabase = await createClient();

  // Fetch channel by slug or channel_id
  const { data: channel } = await supabase
    .from('videos_channels')
    .select('*')
    .or(`slug.eq.${slug},channel_id.eq.${slug}`)
    .eq('status', 'active')
    .single();

  if (!channel) {
    return null;
  }

  // Fetch videos by this creator
  let videosQuery = supabase
    .from('videos_parsed')
    .select(`
      id, slug, youtube_video_id, title, summary, thumbnail_url,
      category, skill_level, score, duration, view_count, published_at, channel_id, channel_title,
      channel:videos_channels!channel_id(slug, title, thumbnail_url)
    `)
    .eq('ai_status', 'completed')
    .eq('channel_id', channel.channel_id)
    .order('published_at', { ascending: false });

  // Apply category filter if provided
  if (category) {
    const dbCategory = Object.entries(CATEGORY_META).find(
      ([slug]) => slug === category
    )?.[1]?.name;
    if (dbCategory) {
      videosQuery = videosQuery.eq('category', dbCategory);
    }
  }

  // Pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  videosQuery = videosQuery.range(from, to);

  const { data: videos } = await videosQuery;

  // Get category distribution
  const { data: allVideos } = await supabase
    .from('videos_parsed')
    .select('category')
    .eq('ai_status', 'completed')
    .eq('channel_id', channel.channel_id);

  const categoryDistribution: Record<string, number> = {};
  allVideos?.forEach((v) => {
    if (v.category) {
      categoryDistribution[v.category] = (categoryDistribution[v.category] || 0) + 1;
    }
  });

  return {
    channel: channel as Channel,
    videos: (videos || []) as VideoWithChannel[],
    categoryDistribution,
    totalVideos: allVideos?.length || 0,
  };
}

export default async function CreatorPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { category, page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);

  const data = await getCreatorData(slug, category, page);

  if (!data) {
    notFound();
  }

  const { channel, videos, categoryDistribution, totalVideos } = data;

  return (
    <div className="container py-8 lg:py-12">
      {/* Back Link */}
      <Link
        href="/creators"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        &larr; All Creators
      </Link>

      {/* Creator Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {channel.thumbnail_url ? (
            <Image
              src={channel.thumbnail_url}
              alt={channel.title}
              width={120}
              height={120}
              className="rounded-full"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
              {channel.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-1">{channel.title}</h1>
          {channel.handle && (
            <p className="text-muted-foreground mb-2">{channel.handle}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            {channel.subscriber_count && (
              <span>{formatSubscriberCount(channel.subscriber_count)}</span>
            )}
            <span>{totalVideos} videos</span>
          </div>
          {channel.description && (
            <p className="text-muted-foreground line-clamp-3">{channel.description}</p>
          )}
        </div>

        {/* YouTube Link */}
        <div className="flex-shrink-0">
          <a
            href={`https://www.youtube.com/channel/${channel.channel_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              View on YouTube &rarr;
            </Button>
          </a>
        </div>
      </div>

      {/* Category Distribution */}
      {Object.keys(categoryDistribution).length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-3">Topics covered</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={`/creators/${slug}`}>
              <Badge
                variant={!category ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                All ({totalVideos})
              </Badge>
            </Link>
            {Object.entries(categoryDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => {
                const catSlug = categoryToSlug(cat);
                return (
                  <Link key={cat} href={`/creators/${slug}?category=${catSlug}`}>
                    <Badge
                      variant={category === catSlug ? 'default' : 'outline'}
                      className="cursor-pointer"
                    >
                      {cat} ({count})
                    </Badge>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} showChannel={false} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            No videos found{category ? ' for this category' : ''}
          </p>
          {category && (
            <Link href={`/creators/${slug}`}>
              <Button variant="outline">Clear filter</Button>
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {videos.length === ITEMS_PER_PAGE && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/creators/${slug}?${category ? `category=${category}&` : ''}page=${page - 1}`}
            >
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <Link
            href={`/creators/${slug}?${category ? `category=${category}&` : ''}page=${page + 1}`}
          >
            <Button variant="outline">Next</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
