import type { Metadata } from 'next';
import { NewsCard } from '@/components/cards';
import { createClient } from '@/lib/supabase-server';
import { slugToCategory, isValidCategorySlug, ALL_CATEGORY_SLUGS, CATEGORY_META } from '@/lib/utils/categories';
import type { NewsArticleWithSource } from '@/types/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'News',
  description:
    'Stay updated with the latest STR industry news, regulations, and market trends.',
};

// Revalidate every 30 minutes
export const revalidate = 1800;

interface PageProps {
  searchParams: Promise<{ category?: string; location?: string; page?: string }>;
}

const ITEMS_PER_PAGE = 20;

async function getNews(category?: string, location?: string, page = 1) {
  const supabase = await createClient();

  let query = supabase
    .from('news_articles')
    .select(`
      id, slug, url, title, summary, excerpt, image_url,
      category, score, published_at, primary_location, is_local_news,
      source:news_sources(name, slug, logo_url)
    `)
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .order('published_at', { ascending: false });

  // Apply category filter
  if (category && isValidCategorySlug(category)) {
    const dbCategory = slugToCategory(category);
    query = query.eq('category', dbCategory);
  }

  // Apply location filter
  if (location) {
    query = query.eq('primary_location', location);
  }

  // Pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return (data || []) as NewsArticleWithSource[];
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.category;
  const location = params.location;
  const page = parseInt(params.page || '1', 10);

  const news = await getNews(category, location, page);

  return (
    <div className="container py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">News</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest STR industry news and regulations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Link href="/news">
            <Badge
              variant={!category ? 'default' : 'outline'}
              className="cursor-pointer"
            >
              All
            </Badge>
          </Link>
          {ALL_CATEGORY_SLUGS.map((slug) => (
            <Link key={slug} href={`/news?category=${slug}`}>
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

      {/* News Grid */}
      {news.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {news.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No news articles found</p>
          <Link href="/news">
            <Button variant="outline">Clear filters</Button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {news.length === ITEMS_PER_PAGE && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link
              href={`/news?${category ? `category=${category}&` : ''}${location ? `location=${location}&` : ''}page=${page - 1}`}
            >
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          <Link
            href={`/news?${category ? `category=${category}&` : ''}${location ? `location=${location}&` : ''}page=${page + 1}`}
          >
            <Button variant="outline">Next</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
