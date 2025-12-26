'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StrictnessBadge } from './StrictnessBadge';
import { groupByState, deriveStrictness } from '@/lib/utils/regulations';
import { getRegulationUrl, type JurisdictionForDirectory } from '@/types/database';
import { cn } from '@/lib/utils';

interface StateGrouperProps {
  markets: JurisdictionForDirectory[];
  className?: string;
}

export function StateGrouper({ markets, className }: StateGrouperProps) {
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());

  const groupedMarkets = useMemo(() => {
    return groupByState(markets);
  }, [markets]);

  const toggleState = (stateCode: string) => {
    setExpandedStates((prev) => {
      // If already expanded, collapse it
      if (prev.has(stateCode)) {
        return new Set();
      }
      // Otherwise, expand only this state (accordion behavior)
      return new Set([stateCode]);
    });
  };

  const expandAll = () => {
    setExpandedStates(new Set(groupedMarkets.keys()));
  };

  const collapseAll = () => {
    setExpandedStates(new Set());
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Expand/Collapse Controls */}
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={expandAll}
          className="text-xs"
        >
          Expand All
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={collapseAll}
          className="text-xs"
        >
          Collapse All
        </Button>
      </div>

      {/* State Groups - Grid layout keeps items in fixed positions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {[...groupedMarkets.entries()].map(([stateCode, { stateName, items }]) => {
          const isExpanded = expandedStates.has(stateCode);

          return (
            <div
              key={stateCode}
              className="relative border border-border rounded-lg bg-background"
            >
              {/* State Header */}
              <button
                onClick={() => toggleState(stateCode)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors text-left rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{stateName}</span>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {items.length} {items.length === 1 ? 'market' : 'markets'}
                </span>
              </button>

              {/* Markets List - Absolute positioned dropdown */}
              {isExpanded && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-0.5 border border-border rounded-lg bg-background shadow-lg divide-y divide-border max-h-80 overflow-y-auto">
                  {items.map((market) => {
                    const strictness = market.regulation
                      ? deriveStrictness(market.regulation)
                      : 'permissive';

                    return (
                      <li key={market.id}>
                        <Link
                          href={getRegulationUrl(market)}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors"
                        >
                          <span className="text-sm">{market.name}</span>
                          <StrictnessBadge
                            level={strictness}
                            size="sm"
                            variant="icon-only"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {groupedMarkets.size === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No markets available yet.</p>
        </div>
      )}
    </div>
  );
}
