import Link from 'next/link';
import { MapPin, FileCheck, Moon, Home, Percent } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StrictnessBadge } from '@/components/regulations/StrictnessBadge';
import {
  type JurisdictionForDirectory,
  getRegulationUrl,
} from '@/types/database';
import {
  deriveStrictness,
  extractPublicFlags,
  type RegulationFlags,
} from '@/lib/utils/regulations';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  market: JurisdictionForDirectory;
  className?: string;
}

function FlagItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-foreground">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function MarketCard({ market, className }: MarketCardProps) {
  const regulationUrl = getRegulationUrl(market);
  const strictness = market.regulation
    ? deriveStrictness(market.regulation)
    : 'permissive';

  // Extract public flags for display
  const flags: RegulationFlags = market.regulation
    ? extractPublicFlags(market.regulation, 0)
    : {
        permitRequired: false,
        nightLimitsApply: false,
        primaryResidenceOnly: false,
        totalTaxRate: null,
        gotchaCount: 0,
      };

  return (
    <Card className={cn('group hover:shadow-lg transition-shadow', className)}>
      <Link href={regulationUrl} className="block">
        <CardContent className="p-4">
          {/* Header: Name + Badge */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                {market.name}
              </h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{market.state_name}</span>
              </p>
            </div>
            <StrictnessBadge level={strictness} size="sm" showLabel={true} />
          </div>

          {/* Summary (truncated) */}
          {market.regulation?.summary && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {market.regulation.summary}
            </p>
          )}

          {/* Boolean Flags - only show active ones */}
          {(flags.permitRequired || flags.nightLimitsApply || flags.primaryResidenceOnly) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3">
              {flags.permitRequired && (
                <FlagItem icon={FileCheck} label="Permit required" />
              )}
              {flags.nightLimitsApply && (
                <FlagItem icon={Moon} label="Night limits" />
              )}
              {flags.primaryResidenceOnly && (
                <FlagItem icon={Home} label="Primary residence" />
              )}
            </div>
          )}

          {/* Tax Rate - only show if available */}
          {flags.totalTaxRate && (
            <div className="flex items-center pt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Percent className="h-3 w-3" />
                {flags.totalTaxRate} total tax
              </span>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
