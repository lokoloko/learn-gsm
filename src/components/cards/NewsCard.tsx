import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type NewsArticleWithSource, getNewsUrl } from '@/types/database';
import { categoryToSlug } from '@/lib/utils/categories';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: NewsArticleWithSource;
  showSource?: boolean;
}

export function NewsCard({ article, showSource = true }: NewsCardProps) {
  const articleUrl = getNewsUrl(article);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={articleUrl}>
        {/* Image (if available) */}
        {article.image_url && (
          <div className="relative aspect-[2/1] overflow-hidden bg-muted">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        )}
      </Link>

      <CardContent className={article.image_url ? 'p-4' : 'p-4 pt-4'}>
        {/* Source */}
        {showSource && article.source && article.source[0] && (
          <div className="flex items-center gap-2 mb-2">
            {article.source[0].logo_url ? (
              <Image
                src={article.source[0].logo_url}
                alt={article.source[0].name}
                width={16}
                height={16}
                className="rounded"
              />
            ) : (
              <div className="w-4 h-4 rounded bg-muted flex items-center justify-center text-[10px] font-medium">
                {article.source[0].name[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {article.source[0].name}
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={articleUrl}>
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {article.title}
          </h3>
        </Link>

        {/* Summary */}
        {article.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(article.published_at), {
                addSuffix: true,
              })}
            </span>
          )}
          {article.primary_location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {article.primary_location}
            </span>
          )}
          {article.score && article.score > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {article.score}
            </span>
          )}
        </div>

        {/* Category & Location Tags */}
        <div className="flex flex-wrap gap-1.5">
          {article.category && (
            <Link href={`/topics/${categoryToSlug(article.category)}`}>
              <Badge variant="secondary" className="text-xs">
                {article.category}
              </Badge>
            </Link>
          )}
          {article.is_local_news && (
            <Badge variant="outline" className="text-xs">
              Local News
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
