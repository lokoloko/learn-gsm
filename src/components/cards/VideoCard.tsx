import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type VideoWithChannel, getVideoUrl } from '@/types/database';
import { categoryToSlug } from '@/lib/utils/categories';

interface VideoCardProps {
  video: VideoWithChannel;
  showChannel?: boolean;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatViewCount(count: number | null): string {
  if (!count) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function VideoCard({ video, showChannel = true }: VideoCardProps) {
  const videoUrl = getVideoUrl(video);
  const thumbnailUrl =
    video.thumbnail_url ||
    `https://img.youtube.com/vi/${video.youtube_video_id}/mqdefault.jpg`;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={videoUrl}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={thumbnailUrl}
            alt={video.title || 'Video thumbnail'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Title */}
        <Link href={videoUrl}>
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {video.title}
          </h3>
        </Link>

        {/* Channel */}
        {showChannel && video.channel_title && (
          <p className="text-xs text-muted-foreground truncate mb-2">
            {video.channel_title}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {video.view_count && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViewCount(video.view_count)} views
            </span>
          )}
          {video.score > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {video.score}
            </span>
          )}
        </div>

        {/* Category & Skill Level */}
        <div className="flex flex-wrap gap-1.5">
          {video.category && (
            <Link href={`/topics/${categoryToSlug(video.category)}`}>
              <Badge variant="secondary" className="text-xs">
                {video.category}
              </Badge>
            </Link>
          )}
          {video.skill_level && (
            <Badge
              variant="outline"
              className="text-xs capitalize"
            >
              {video.skill_level}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
