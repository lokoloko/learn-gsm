import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, AlertCircle, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-server';
import { StrictnessBadge } from '@/components/regulations/StrictnessBadge';
import { AtAGlance } from '@/components/regulations/AtAGlance';
import { KnowledgeSection } from '@/components/regulations/KnowledgeSection';
import { SourcesList } from '@/components/regulations/SourcesList';
import { RelatedContent } from '@/components/regulations/RelatedContent';
import { ApplicationSteps } from '@/components/regulations/ApplicationSteps';
import { LockedContent } from '@/components/regulations/LockedContent';
import { MarketCard } from '@/components/cards';
import {
  deriveStrictness,
  formatConfidence,
  areSTRsAllowed,
} from '@/lib/utils/regulations';
import {
  getRegulationAccess,
  canAccessMarket,
} from '@/lib/auth/get-user-tier';
import type {
  Jurisdiction,
  Regulation,
  RegulationKnowledge,
  RegulationSource,
  JurisdictionForDirectory,
} from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import type { StrictnessLevel } from '@/lib/utils/regulations';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate JSON-LD structured data for SEO
function generateJsonLd(
  jurisdiction: Jurisdiction,
  regulation: Regulation | null,
  strictness: StrictnessLevel
) {
  const fee =
    regulation?.registration?.city?.fee ||
    regulation?.registration?.county?.fee ||
    null;

  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: `${jurisdiction.name} Short-Term Rental Regulations`,
    description:
      regulation?.summary ||
      `Short-term rental regulations for ${jurisdiction.name}, ${jurisdiction.state_name}`,
    serviceType: 'Short-Term Rental Licensing',
    areaServed: {
      '@type': jurisdiction.jurisdiction_type === 'city' ? 'City' : 'AdministrativeArea',
      name: jurisdiction.name,
      containedInPlace: {
        '@type': 'State',
        name: jurisdiction.state_name,
      },
    },
    provider: {
      '@type': 'GovernmentOrganization',
      name: `${jurisdiction.name} ${jurisdiction.jurisdiction_type === 'city' ? 'City' : 'County'} Government`,
    },
    ...(fee && {
      offers: {
        '@type': 'Offer',
        price: fee,
        priceCurrency: 'USD',
        description: 'STR Permit/License Fee',
      },
    }),
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'Regulation Strictness',
      value: strictness,
    },
  };
}

// Revalidate every hour
export const revalidate = 3600;

async function getJurisdiction(slug: string): Promise<Jurisdiction | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('jurisdictions')
    .select('*')
    .eq('slug', slug)
    .in('coverage_status', ['partial', 'full', 'verified'])
    .single();

  if (error || !data) return null;
  return data as Jurisdiction;
}

async function getRegulation(jurisdictionId: string): Promise<Regulation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('regulations')
    .select('*')
    .eq('jurisdiction_id', jurisdictionId)
    .single();

  if (error || !data) return null;
  return data as Regulation;
}

async function getKnowledge(jurisdictionId: string): Promise<RegulationKnowledge[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('regulations_knowledge')
    .select('*')
    .eq('jurisdiction_id', jurisdictionId)
    .order('knowledge_type');

  return (data || []) as RegulationKnowledge[];
}

async function getSources(jurisdictionId: string): Promise<RegulationSource[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('regulation_sources')
    .select('*')
    .eq('jurisdiction_id', jurisdictionId)
    .eq('status', 'active');

  return (data || []) as RegulationSource[];
}

async function getRelatedMarkets(
  stateCode: string,
  excludeId: string
): Promise<JurisdictionForDirectory[]> {
  const supabase = await createClient();

  const { data } = await supabase
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
    .eq('state_code', stateCode)
    .neq('id', excludeId)
    .order('population', { ascending: false })
    .limit(4);

  return (data || []).map((item) => ({
    ...item,
    regulation: item.regulations?.[0] || null,
  })) as unknown as JurisdictionForDirectory[];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const jurisdiction = await getJurisdiction(slug);

  if (!jurisdiction) {
    return { title: 'Market Not Found' };
  }

  const regulation = await getRegulation(jurisdiction.id);

  return {
    title: `${jurisdiction.name} STR Regulations`,
    description:
      regulation?.summary ||
      `Short-term rental regulations, Airbnb rules, and permit requirements for ${jurisdiction.name}, ${jurisdiction.state_name}.`,
    openGraph: {
      title: `${jurisdiction.name} STR Regulations | Learn STR`,
      description:
        regulation?.summary ||
        `Complete guide to STR rules in ${jurisdiction.name}`,
      type: 'article',
    },
  };
}

export default async function RegulationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const jurisdiction = await getJurisdiction(slug);

  if (!jurisdiction) {
    notFound();
  }

  const [regulation, knowledge, sources, relatedMarkets, access] =
    await Promise.all([
      getRegulation(jurisdiction.id),
      getKnowledge(jurisdiction.id),
      getSources(jurisdiction.id),
      getRelatedMarkets(jurisdiction.state_code, jurisdiction.id),
      getRegulationAccess(),
    ]);

  const strictness = regulation ? deriveStrictness(regulation) : 'permissive';

  // Check if this user can access full content for this market
  const hasMarketAccess = canAccessMarket(access, slug);
  const canSeeFullContent = access.canViewFullContent && hasMarketAccess;
  const canSeeApplicationSteps = access.canViewApplicationSteps;

  // Determine lock type for gated content
  const getLockType = (): 'signup' | 'upgrade' | 'market-limit' => {
    if (access.tier === 'public') return 'signup';
    if (!hasMarketAccess) return 'market-limit';
    return 'upgrade';
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd(jurisdiction, regulation, strictness)),
        }}
      />

      <div className="container py-8 lg:py-12">
        {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/regulations">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            All Markets
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{jurisdiction.name}</h1>
              <StrictnessBadge level={strictness} size="md" />
              {/* STRs Allowed/Prohibited status - visible to all */}
              {regulation && (
                areSTRsAllowed(regulation) ? (
                  <Badge variant="outline" className="gap-1 text-green-700 border-green-300 dark:text-green-400 dark:border-green-800">
                    <CheckCircle className="h-3 w-3" />
                    STRs Allowed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-red-700 border-red-300 dark:text-red-400 dark:border-red-800">
                    <XCircle className="h-3 w-3" />
                    STRs Prohibited
                  </Badge>
                )
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {jurisdiction.state_name}
              </span>
              {regulation?.updated_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Updated{' '}
                  {formatDistanceToNow(new Date(regulation.updated_at), {
                    addSuffix: true,
                  })}
                </span>
              )}
              {regulation?.confidence_score != null && (
                <Badge variant="outline" className="text-xs">
                  {formatConfidence(regulation.confidence_score)} confidence
                </Badge>
              )}
            </div>
          </div>

          {/* Summary - visible to all users */}
          {regulation?.summary && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {regulation.summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Plain English - authenticated+ only */}
          {regulation?.plain_english && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">In Plain English</h2>
                {canSeeFullContent ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {regulation.plain_english}
                  </p>
                ) : (
                  <LockedContent
                    type={getLockType()}
                    featureLabel="Plain English Guide"
                    marketName={jurisdiction.name}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* At A Glance */}
          {regulation && <AtAGlance regulation={regulation} />}

          {/* Key Gotchas (count visible to all, content to free+) */}
          {regulation?.key_gotchas && regulation.key_gotchas.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-semibold">
                    {regulation.key_gotchas.length} Things Hosts Often Miss
                  </h2>
                </div>
                {canSeeFullContent ? (
                  <ul className="space-y-2">
                    {regulation.key_gotchas.map((gotcha, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          {idx + 1}.
                        </span>
                        {gotcha}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <LockedContent
                    type={getLockType()}
                    featureLabel="Key Gotchas"
                    marketName={jurisdiction.name}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Knowledge Items - free+ only */}
          {knowledge.length > 0 && (
            canSeeFullContent ? (
              <KnowledgeSection items={knowledge} />
            ) : (
              <LockedContent
                type={getLockType()}
                featureLabel="Full Regulation Details"
                marketName={jurisdiction.name}
              />
            )
          )}

          {/* Application Steps - Pro only */}
          {regulation?.application_steps &&
            regulation.application_steps.length > 0 && (
              canSeeApplicationSteps ? (
                <ApplicationSteps
                  steps={regulation.application_steps}
                  marketName={jurisdiction.name}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-lg font-semibold mb-4">
                      Step-by-Step Application Guide
                    </h2>
                    <LockedContent
                      type="upgrade"
                      featureLabel={`${regulation.application_steps.length}-Step Application Guide`}
                      marketName={jurisdiction.name}
                    />
                  </CardContent>
                </Card>
              )
            )}

          {/* Disclaimer */}
          <Card className="border-border bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">
                    Disclaimer
                  </p>
                  <p className="text-muted-foreground">
                    This information is for general guidance only and should not
                    be considered legal advice. Regulations change frequently.
                    Always verify current requirements with local government
                    authorities before operating a short-term rental.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sources - free+ only */}
          {sources.length > 0 && (
            canSeeFullContent ? (
              <SourcesList sources={sources} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Official Sources</h3>
                  <LockedContent
                    type={getLockType()}
                    featureLabel={`${sources.length} Official Sources`}
                    marketName={jurisdiction.name}
                    className="py-4"
                  />
                </CardContent>
              </Card>
            )
          )}

          {/* Related Content */}
          <RelatedContent jurisdictionName={jurisdiction.name} />

          {/* Related Markets */}
          {relatedMarkets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Other {jurisdiction.state_name} Markets
              </h3>
              <div className="space-y-4">
                {relatedMarkets.map((market) => (
                  <MarketCard key={market.id} market={market} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
