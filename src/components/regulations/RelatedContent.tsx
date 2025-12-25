import Link from 'next/link';
import { ArrowRight, PlayCircle, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RelatedContentProps {
  jurisdictionName: string;
  className?: string;
}

/**
 * Stub component for related videos and news.
 * Will be integrated with actual content in Phase 3.
 */
export function RelatedContent({ jurisdictionName, className }: RelatedContentProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Related Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Learn more about STR regulations and hosting tips.
        </p>

        {/* Videos Link */}
        <Link
          href={`/videos?category=regulations-compliance`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted group-hover:bg-background">
              <PlayCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Regulations Videos</p>
              <p className="text-xs text-muted-foreground">
                Expert advice on STR compliance
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        {/* News Link */}
        <Link
          href={`/news?category=regulations-compliance`}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted group-hover:bg-background">
              <Newspaper className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Regulations News</p>
              <p className="text-xs text-muted-foreground">
                Latest STR policy updates
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </CardContent>
    </Card>
  );
}
