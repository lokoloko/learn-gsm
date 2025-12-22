import type { Metadata } from 'next';
import { CategoryCard } from '@/components/cards';
import { createClient } from '@/lib/supabase-server';
import { ALL_CATEGORY_SLUGS, CATEGORY_META, slugToCategory } from '@/lib/utils/categories';
import type { CategorySlug } from '@/lib/utils/categories';

export const metadata: Metadata = {
  title: 'Topics',
  description:
    'Browse STR hosting topics including getting started, pricing, operations, regulations, and growth strategies.',
};

// Revalidate every hour
export const revalidate = 3600;

interface CategoryCounts {
  videoCount: number;
  newsCount: number;
}

async function getCategoryCounts(): Promise<Record<CategorySlug, CategoryCounts>> {
  const supabase = await createClient();

  // Fetch video counts per category
  const { data: videoCounts } = await supabase
    .from('videos_parsed')
    .select('category')
    .eq('ai_status', 'completed');

  // Fetch news counts per category
  const { data: newsCounts } = await supabase
    .from('news_articles')
    .select('category')
    .eq('status', 'parsed')
    .eq('is_relevant', true);

  // Count by category
  const counts: Record<CategorySlug, CategoryCounts> = {} as Record<CategorySlug, CategoryCounts>;

  ALL_CATEGORY_SLUGS.forEach((slug) => {
    const dbCategory = slugToCategory(slug);
    counts[slug] = {
      videoCount: videoCounts?.filter((v) => v.category === dbCategory).length || 0,
      newsCount: newsCounts?.filter((n) => n.category === dbCategory).length || 0,
    };
  });

  return counts;
}

export default async function TopicsPage() {
  const counts = await getCategoryCounts();

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Topics</h1>
        <p className="text-muted-foreground">
          Explore curated content organized by topic to help you succeed in short-term rentals
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_CATEGORY_SLUGS.map((slug) => (
          <CategoryCard
            key={slug}
            slug={slug}
            videoCount={counts[slug].videoCount}
            newsCount={counts[slug].newsCount}
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          Each topic contains videos from expert creators and the latest news articles.
        </p>
      </div>
    </div>
  );
}
