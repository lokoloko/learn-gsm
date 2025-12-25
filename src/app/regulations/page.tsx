import type { Metadata } from 'next';
import { Search, MapPin, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase-server';
import { MarketCard } from '@/components/cards';
import { MarketSearch } from '@/components/regulations/MarketSearch';
import { StateGrouper } from '@/components/regulations/StateGrouper';
import { RequestMarketCTA } from '@/components/regulations/RequestMarketCTA';
import type { JurisdictionForDirectory } from '@/types/database';

export const metadata: Metadata = {
  title: 'STR Regulations by City',
  description:
    'Find short-term rental regulations, Airbnb rules, and permit requirements for your city. Plain English guides for 51+ US markets.',
  openGraph: {
    title: 'STR Regulations by City | Learn STR',
    description:
      'Find short-term rental regulations, Airbnb rules, and permit requirements for your city. Plain English guides for 51+ US markets.',
  },
};

// Revalidate every hour
export const revalidate = 3600;

async function getMarkets(): Promise<JurisdictionForDirectory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jurisdictions')
    .select(`
      id, slug, name, full_name, state_code, state_name,
      jurisdiction_type, population,
      regulations (
        summary, confidence_score, status,
        registration, eligibility, limits, taxes, penalties,
        updated_at
      )
    `)
    .in('coverage_status', ['partial', 'full', 'verified'])
    .order('population', { ascending: false });

  if (error) {
    console.error('Error fetching jurisdictions:', error);
    return [];
  }

  // Transform to match JurisdictionForDirectory interface
  return (data || []).map((item) => ({
    ...item,
    regulation: item.regulations?.[0] || null,
  })) as unknown as JurisdictionForDirectory[];
}

export default async function RegulationsPage() {
  const markets = await getMarkets();
  const popularMarkets = markets.slice(0, 8);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="gradient-bg py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Know Your Local STR Rules
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Plain English guides to short-term rental regulations. Find permit
              requirements, fees, and compliance rules for {markets.length}+ US markets.
            </p>

            {/* Search Bar */}
            <MarketSearch markets={markets} />
          </div>
        </div>
      </section>

      {/* Popular Markets */}
      {popularMarkets.length > 0 && (
        <section className="py-8 lg:py-12">
          <div className="container">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Popular Markets</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularMarkets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by State */}
      <section className="py-8 lg:py-12 bg-muted/30">
        <div className="container">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">Browse by State</h2>
          </div>
          <StateGrouper markets={markets} />
        </div>
      </section>

      {/* Request a Market CTA */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <RequestMarketCTA />
        </div>
      </section>
    </div>
  );
}
