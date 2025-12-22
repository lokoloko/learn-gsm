import Link from 'next/link';
import {
  Rocket,
  Home,
  DollarSign,
  Settings,
  Shield,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type CategorySlug, CATEGORY_META } from '@/lib/utils/categories';

const iconMap: Record<string, LucideIcon> = {
  rocket: Rocket,
  home: Home,
  'dollar-sign': DollarSign,
  settings: Settings,
  shield: Shield,
  'trending-up': TrendingUp,
};

interface CategoryCardProps {
  slug: CategorySlug;
  videoCount?: number;
  newsCount?: number;
}

export function CategoryCard({ slug, videoCount, newsCount }: CategoryCardProps) {
  const meta = CATEGORY_META[slug];
  const Icon = iconMap[meta.icon] || Rocket;

  return (
    <Link href={`/topics/${slug}`}>
      <Card className="group hover:shadow-lg hover:border-primary/50 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                {meta.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {meta.description}
              </p>
              {(videoCount !== undefined || newsCount !== undefined) && (
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  {videoCount !== undefined && (
                    <span>{videoCount} videos</span>
                  )}
                  {newsCount !== undefined && (
                    <span>{newsCount} articles</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
