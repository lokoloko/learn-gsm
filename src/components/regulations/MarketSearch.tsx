'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StrictnessBadge } from './StrictnessBadge';
import { deriveStrictness } from '@/lib/utils/regulations';
import { getRegulationUrl, type JurisdictionForDirectory } from '@/types/database';
import { cn } from '@/lib/utils';

interface MarketSearchProps {
  markets: JurisdictionForDirectory[];
  className?: string;
}

export function MarketSearch({ markets, className }: MarketSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredMarkets = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase().trim();
    return markets
      .filter((market) => {
        const name = market.name.toLowerCase();
        const fullName = market.full_name?.toLowerCase() || '';
        const state = market.state_name.toLowerCase();
        const stateCode = market.state_code.toLowerCase();

        return (
          name.includes(searchTerm) ||
          fullName.includes(searchTerm) ||
          state.includes(searchTerm) ||
          stateCode.includes(searchTerm) ||
          `${name}, ${stateCode}`.includes(searchTerm) ||
          `${name}, ${state}`.includes(searchTerm)
        );
      })
      .slice(0, 8); // Limit results
  }, [query, markets]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleResultClick = useCallback(() => {
    setQuery('');
    setIsFocused(false);
  }, []);

  const showResults = isFocused && query.trim().length > 0;

  return (
    <div className={cn('relative w-full max-w-md mx-auto', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by city or state..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on results
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {filteredMarkets.length > 0 ? (
            <ul className="divide-y divide-border">
              {filteredMarkets.map((market) => {
                const strictness = market.regulation
                  ? deriveStrictness(market.regulation)
                  : 'permissive';

                return (
                  <li key={market.id}>
                    <Link
                      href={getRegulationUrl(market)}
                      onClick={handleResultClick}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{market.name}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          , {market.state_code}
                        </span>
                      </div>
                      <StrictnessBadge level={strictness} size="sm" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No markets found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try searching for a different city or state</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
