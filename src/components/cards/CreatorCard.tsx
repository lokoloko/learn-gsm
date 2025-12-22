import Link from 'next/link';
import Image from 'next/image';
import { Users, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type Channel, getChannelUrl } from '@/types/database';

interface CreatorCardProps {
  channel: Channel;
  showStats?: boolean;
}

function formatSubscriberCount(count: number | null): string {
  if (!count) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
  return count.toString();
}

export function CreatorCard({ channel, showStats = true }: CreatorCardProps) {
  const channelUrl = getChannelUrl(channel);

  return (
    <Link href={channelUrl}>
      <Card className="group hover:shadow-lg hover:border-primary/50 transition-all">
        <CardContent className="p-4 flex items-center gap-4">
          {/* Avatar */}
          {channel.thumbnail_url ? (
            <Image
              src={channel.thumbnail_url}
              alt={channel.title}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
              {channel.title[0]}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {channel.title}
            </h3>
            {channel.handle && (
              <p className="text-xs text-muted-foreground truncate">
                @{channel.handle.replace('@', '')}
              </p>
            )}
            {showStats && (
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                {channel.subscriber_count && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatSubscriberCount(channel.subscriber_count)}
                  </span>
                )}
                {channel.video_count && (
                  <span className="flex items-center gap-1">
                    <PlayCircle className="h-3 w-3" />
                    {channel.video_count} videos
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
