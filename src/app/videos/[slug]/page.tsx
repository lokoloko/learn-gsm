import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Eye, Star, Calendar, User, Lightbulb, CheckSquare, Wrench, AlertTriangle, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoCard } from '@/components/cards';
import { createClient } from '@/lib/supabase-server';
import { categoryToSlug } from '@/lib/utils/categories';
import type { Video, VideoKnowledge, VideoWithChannel } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Revalidate every hour
export const revalidate = 3600;

async function getVideo(slug: string) {
  const supabase = await createClient();

  // Try to find by slug first, then by youtube_video_id
  let { data: video, error } = await supabase
    .from('videos_parsed')
    .select('*')
    .eq('slug', slug)
    .eq('ai_status', 'completed')
    .single();

  if (!video) {
    // Fallback to youtube_video_id
    const result = await supabase
      .from('videos_parsed')
      .select('*')
      .eq('youtube_video_id', slug)
      .eq('ai_status', 'completed')
      .single();

    video = result.data;
    error = result.error;
  }

  if (error || !video) return null;
  return video as Video;
}

async function getVideoKnowledge(videoId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('videos_knowledge')
    .select('*')
    .eq('video_id', videoId)
    .order('knowledge_type');

  return (data || []) as VideoKnowledge[];
}

async function getRelatedVideos(video: Video) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('videos_parsed')
    .select(`
      id, youtube_video_id, title, summary, thumbnail_url,
      category, skill_level, score, duration, view_count, published_at, channel_id, channel_title
    `)
    .eq('ai_status', 'completed')
    .neq('id', video.id)
    .or(`category.eq.${video.category},channel_id.eq.${video.channel_id}`)
    .order('score', { ascending: false })
    .limit(4);

  return (data || []) as VideoWithChannel[];
}

async function getChannel(channelId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('videos_channels')
    .select('id, channel_id, slug, title, thumbnail_url, handle, subscriber_count')
    .eq('channel_id', channelId)
    .eq('status', 'active')
    .single();

  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) {
    return { title: 'Video Not Found' };
  }

  return {
    title: video.title,
    description: video.summary || video.description?.substring(0, 160),
    openGraph: {
      title: video.title || 'Video',
      description: video.summary || video.description?.substring(0, 160) || '',
      type: 'video.other',
      images: video.thumbnail_url
        ? [{ url: video.thumbnail_url, width: 1280, height: 720 }]
        : [],
    },
  };
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  }
  return `${mins}m ${secs}s`;
}

function formatViewCount(count: number | null): string {
  if (!count) return '0';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

const knowledgeIcons: Record<string, typeof Lightbulb> = {
  insight: Lightbulb,
  action_item: CheckSquare,
  resource: Wrench,
  mistake: AlertTriangle,
  definition: BookOpen,
};

export default async function VideoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) {
    notFound();
  }

  const [knowledge, relatedVideos, channel] = await Promise.all([
    getVideoKnowledge(video.video_id),
    getRelatedVideos(video),
    video.channel_id ? getChannel(video.channel_id) : Promise.resolve(null),
  ]);

  // Group knowledge by type
  const insights = knowledge.filter((k) => k.knowledge_type === 'insight');
  const actionItems = knowledge.filter((k) => k.knowledge_type === 'action_item');
  const resources = knowledge.filter((k) => k.knowledge_type === 'resource');
  const mistakes = knowledge.filter((k) => k.knowledge_type === 'mistake');
  const definitions = knowledge.filter((k) => k.knowledge_type === 'definition');

  return (
    <div className="container py-8 lg:py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Embed */}
          <div className="relative aspect-video mb-6 rounded-lg overflow-hidden bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${video.youtube_video_id}`}
              title={video.title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Title & Meta */}
          <h1 className="text-2xl font-bold mb-4">{video.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {video.view_count && (
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {formatViewCount(video.view_count)} views
              </span>
            )}
            {video.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(video.published_at), { addSuffix: true })}
              </span>
            )}
            {video.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(video.duration)}
              </span>
            )}
            {video.score > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Score: {video.score}
              </span>
            )}
          </div>

          {/* Channel */}
          {channel && (
            <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-muted/50">
              {channel.thumbnail_url ? (
                <Image
                  src={channel.thumbnail_url}
                  alt={channel.title || 'Channel'}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                  {channel.title?.[0] || 'C'}
                </div>
              )}
              <div>
                <p className="font-medium">{channel.title}</p>
                {channel.handle && (
                  <p className="text-sm text-muted-foreground">@{channel.handle.replace('@', '')}</p>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {video.category && (
              <Link href={`/topics/${categoryToSlug(video.category)}`}>
                <Badge variant="secondary">{video.category}</Badge>
              </Link>
            )}
            {video.skill_level && (
              <Badge variant="outline" className="capitalize">
                {video.skill_level}
              </Badge>
            )}
            {video.tags?.slice(0, 5).map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Summary */}
          {video.summary && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3">Summary</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{video.summary}</p>
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
                        {item.content.url_hint && (
                          <span className="text-muted-foreground text-sm ml-1">
                            ({item.content.url_hint})
                          </span>
                        )}
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
                  Common Mistakes
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
          {/* Related Videos */}
          {relatedVideos.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <VideoCard key={relatedVideo.id} video={relatedVideo} showChannel={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
