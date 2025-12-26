import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoCard, NewsCard, CategoryCard } from '@/components/cards';
import { createClient } from '@/lib/supabase-server';
import { ALL_CATEGORY_SLUGS } from '@/lib/utils/categories';
import type { VideoWithChannel, NewsArticleWithSource } from '@/types/database';
import { HeroChatInput } from '@/components/chat/HeroChatInput';

// Revalidate every 5 minutes
export const revalidate = 300;

async function getHomeData() {
  const supabase = await createClient();

  // Fetch popular videos
  const { data: videos } = await supabase
    .from('videos_parsed')
    .select(`
      id, youtube_video_id, title, summary, thumbnail_url,
      category, skill_level, score, duration, view_count, published_at, channel_id, channel_title
    `)
    .eq('ai_status', 'completed')
    .order('score', { ascending: false })
    .limit(8);

  // Fetch trending news
  const { data: news } = await supabase
    .from('news_articles')
    .select(`
      id, slug, url, title, summary, excerpt, image_url,
      category, score, published_at, primary_location, is_local_news,
      source:news_sources(name, slug, logo_url)
    `)
    .eq('status', 'parsed')
    .eq('is_relevant', true)
    .order('published_at', { ascending: false })
    .limit(4);

  return {
    videos: (videos || []) as VideoWithChannel[],
    news: (news || []) as NewsArticleWithSource[],
  };
}

export default async function HomePage() {
  const { videos, news } = await getHomeData();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="gradient-bg py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Learn Short-Term Rental Hosting
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              The knowledge hub for Airbnb and VRBO hosts. Watch curated videos,
              read industry news, and chat with AI to level up your STR business.
            </p>

            {/* Chat Input */}
            <HeroChatInput />
          </div>
        </div>
      </section>

      {/* Trending News */}
      {news.length > 0 && (
        <section className="py-8 lg:py-12">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Trending News</h2>
              <Link href="/news">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {news.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Videos */}
      {videos.length > 0 && (
        <section className="py-8 lg:py-12 bg-muted/30">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular Videos</h2>
              <Link href="/videos">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by Topic */}
      <section className="py-8 lg:py-12">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse by Topic</h2>
            <Link href="/topics">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_CATEGORY_SLUGS.map((slug) => (
              <CategoryCard key={slug} slug={slug} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 gradient-bg">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to level up your STR business?
            </h2>
            <p className="text-muted-foreground mb-8">
              Get instant answers to your hosting questions with our AI-powered chat.
              Trained on hundreds of expert videos and industry articles.
            </p>
            <Link href="/chat">
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chatting
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
