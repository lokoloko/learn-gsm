import { ExternalLink, FileText, Scale, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RegulationSource } from '@/types/database';
import { cn } from '@/lib/utils';

interface SourcesListProps {
  sources: RegulationSource[];
  className?: string;
}

function getSourceIcon(sourceType: string) {
  switch (sourceType.toLowerCase()) {
    case 'ordinance':
    case 'municipal_code':
      return Scale;
    case 'application':
    case 'permit':
      return FileText;
    case 'city':
    case 'county':
    case 'government':
      return Building2;
    default:
      return ExternalLink;
  }
}

function formatDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}

export function SourcesList({ sources, className }: SourcesListProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Official Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Information sourced from official government websites and legal documents.
        </p>
        <ul className="space-y-3">
          {sources.map((source) => {
            const Icon = getSourceIcon(source.source_type);

            return (
              <li key={source.id}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-background">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                      {source.source_name || source.source_type}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDomain(source.url)}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
