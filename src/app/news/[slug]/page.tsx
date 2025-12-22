import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Star, ExternalLink, Lightbulb, CheckSquare, Wrench, AlertTriangle, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NewsCard } from '@/components/cards';
import { createClient } from '@/lib/supabase-server';
import { categoryToSlug } from '@/lib/utils/categories';
import type { NewsArticle, NewsKnowledge, NewsArticleWithSource } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Revalidate every hour
export const revalidate = 3600;

async function getArticle(slug: string) {
  const supabase = await createClient();

  // Try to find by slug first, then by id
  let { data: article, error } = await supabase
    .from('news_articles')
    .select(`
      *,
      source:news_sources(id, name, slug, logo_url, url)
    `)
    .eq('slug', slug)
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .single();

  if (!article) {
    // Fallback to id
    const result = await supabase
      .from('news_articles')
      .select(`
        *,
        source:news_sources(id, name, slug, logo_url, url)
      `)
      .eq('id', slug)
      .eq('status', 'parsed')
      .eq('is_relevant', true)
      .single();

    article = result.data;
    error = result.error;
  }

  if (error || !article) return null;
  return article as NewsArticle & { source: any[] | null };
}

async function getArticleKnowledge(articleId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('news_knowledge')
    .select('*')
    .eq('article_id', articleId)
    .order('knowledge_type');

  return (data || []) as NewsKnowledge[];
}

async function getRelatedNews(article: NewsArticle) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('news_articles')
    .select(`
      id, slug, url, title, summary, excerpt, image_url,
      category, score, published_at, primary_location, is_local_news,
      source:news_sources(name, slug, logo_url)
    `)
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .neq('id', article.id)
    .or(`category.eq.${article.category},primary_location.eq.${article.primary_location}`)
    .order('published_at', { ascending: false })
    .limit(4);

  return (data || []) as NewsArticleWithSource[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.title,
    description: article.summary || article.excerpt?.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.summary || article.excerpt?.substring(0, 160) || '',
      type: 'article',
      images: article.image_url
        ? [{ url: article.image_url, width: 1200, height: 630 }]
        : [],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const [knowledge, relatedNews] = await Promise.all([
    getArticleKnowledge(article.id),
    getRelatedNews(article),
  ]);

  const source = article.source?.[0];

  // Group knowledge by type
  const insights = knowledge.filter((k) => k.knowledge_type === 'insight');
  const actionItems = knowledge.filter((k) => k.knowledge_type === 'action_item');
  const resources = knowledge.filter((k) => k.knowledge_type === 'resource');
  const mistakes = knowledge.filter((k) => k.knowledge_type === 'mistake');

  return (
    <div className="container py-8 lg:py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image */}
          {article.image_url && (
            <div className="relative aspect-[2/1] mb-6 rounded-lg overflow-hidden bg-muted">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl lg:text-3xl font-bold mb-4">{article.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {source && (
              <span className="flex items-center gap-2">
                {source.logo_url && (
                  <Image
                    src={source.logo_url}
                    alt={source.name}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                )}
                {source.name}
              </span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </span>
            )}
            {article.primary_location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {article.primary_location}
              </span>
            )}
            {article.score && article.score > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Score: {article.score}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {article.category && (
              <Link href={`/topics/${categoryToSlug(article.category)}`}>
                <Badge variant="secondary">{article.category}</Badge>
              </Link>
            )}
            {article.is_local_news && (
              <Badge variant="outline">Local News</Badge>
            )}
            {article.tags?.slice(0, 5).map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Read Original */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-8"
          >
            <Button variant="outline">
              Read Original Article
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>

          {/* Summary */}
          {article.summary && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Summary</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{article.summary}</p>
            </div>
          )}

          {/* Knowledge Sections */}
          {insights.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="text-primary">•</span>
                      <span>{item.content.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {actionItems.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {actionItems.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="text-green-500">✓</span>
                      <div>
                        <span>{item.content.text}</span>
                        {(item.content.effort || item.content.impact) && (
                          <div className="flex gap-2 mt-1">
                            {item.content.effort && (
                              <Badge variant="outline" className="text-xs">
                                Effort: {item.content.effort}
                              </Badge>
                            )}
                            {item.content.impact && (
                              <Badge variant="outline" className="text-xs">
                                Impact: {item.content.impact}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {resources.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5 text-blue-500" />
                  Tools & Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {resources.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="text-blue-500">→</span>
                      <div>
                        {item.content.resource_name && (
                          <span className="font-medium">{item.content.resource_name}: </span>
                        )}
                        <span>{item.content.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {mistakes.length > 0 && (
            <Card className="mb-6 border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Watch Out For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {mistakes.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="text-destructive">⚠</span>
                      <span>{item.content.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Related News */}
          {relatedNews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Related News</h2>
              <div className="space-y-4">
                {relatedNews.map((relatedArticle) => (
                  <NewsCard key={relatedArticle.id} article={relatedArticle} showSource={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
