import type { Metadata } from 'next';
import { VideoCard } from '@/components/cards';
import { createClient } from '@/lib/supabase-server';
import { slugToCategory, isValidCategorySlug, ALL_CATEGORY_SLUGS, CATEGORY_META } from '@/lib/utils/categories';
import type { VideoWithChannel } from '@/types/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Videos',
  description:
    'Watch curated educational videos from top STR creators. Learn hosting tips, pricing strategies, and more.',
};

// Revalidate every hour
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{ category?: string; skill?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 24;

async function getVideos(category?: string, skillLevel?: string, page = 1) {
  const supabase = await createClient();

  let query = supabase
    .from('videos_parsed')
    .select(`
      id, slug, youtube_video_id, title, summary, thumbnail_url,
      category, skill_level, score, duration, view_count, published_at, channel_id, channel_title,
      channel:videos_channels!channel_id(slug, title, thumbnail_url)
    `)
    .eq('ai_status', 'completed')
    .order('score', { ascending: false });

  // Apply category filter
  if (category && isValidCategorySlug(category)) {
    const dbCategory = slugToCategory(category);
    query = query.eq('category', dbCategory);
  }

  // Apply skill level filter
  if (skillLevel && ['beginner', 'intermediate', 'advanced'].includes(skillLevel)) {
    query = query.eq('skill_level', skillLevel);
  }

  // Pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching videos:', error);
    return [];
  }

  return (data || []) as VideoWithChannel[];
}

export default async function VideosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const skill = params.skill;
  const page = parseInt(params.page || '1', 10);

  const videos = await getVideos(category, skill, page);

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Videos</h1>
        <p className="text-muted-foreground">
          Curated educational content from top STR creators
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Link href="/videos">
            <Badge
              variant={!category ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              All
            </Badge>
          </Link>
          {ALL_CATEGORY_SLUGS.map((slug) => (
            <Link key={slug} href={`/videos?category=${slug}`}>
              <Badge
                variant={category === slug ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                {CATEGORY_META[slug].name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Skill Level Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-sm text-muted-foreground mr-2">Skill Level:</span>
        <Link href={category ? `/videos?category=${category}` : '/videos'}>
          <Badge
            variant={!skill ? 'secondary' : 'outline'}
            className="cursor-pointer"
          >
            All Levels
          </Badge>
        </Link>
        {['beginner', 'intermediate', 'advanced'].map((level) => (
          <Link
            key={level}
            href={
              category
                ? `/videos?category=${category}&skill=${level}`
                : `/videos?skill=${level}`
            }
          >
            <Badge
              variant={skill === level ? 'secondary' : 'outline'}
              className="cursor-pointer capitalize"
            >
              {level}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No videos found</p>
          <Link href="/videos">
            <Button variant="outline">Clear filters</Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {videos.length === ITEMS_PER_PAGE && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/videos?${category ? `category=${category}&` : ''}${skill ? `skill=${skill}&` : ''}page=${page - 1}`}
            >
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <Link
            href={`/videos?${category ? `category=${category}&` : ''}${skill ? `skill=${skill}&` : ''}page=${page + 1}`}
          >
            <Button variant="outline">Next</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
