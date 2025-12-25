/**
 * Database types for learn.gostudiom.com
 * Based on videos_* and news_* tables in shared Supabase project
 */

// Enums
export type VideoCategory =
  | 'Getting Started'
  | 'Your Listing'
  | 'Pricing & Profitability'
  | 'Hosting Operations'
  | 'Regulations & Compliance'
  | 'Growth & Marketing';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export type KnowledgeType =
  | 'insight'
  | 'action_item'
  | 'resource'
  | 'definition'
  | 'mistake';

// Channel
export interface Channel {
  id: string;
  channel_id: string;
  title: string;
  description: string | null;
  handle: string | null;
  slug: string | null;
  thumbnail_url: string | null;
  subscriber_count: number | null;
  video_count: number | null;
  status: 'active' | 'paused' | 'inactive';
  created_at: string;
}

// Video (from videos_parsed)
export interface Video {
  id: string;
  video_id: string;
  youtube_video_id: string;
  slug: string | null;
  channel_id: string | null;
  channel_title: string | null;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  summary: string | null;
  tags: string[];
  category: VideoCategory | null;
  skill_level: SkillLevel;
  score: number;
  ai_confidence: number | null;
  ai_status: string | null;
  transcript: string | null;
  duration: number | null;
  view_count: number | null;
  like_count: number | null;
  published_at: string | null;
  created_at: string;
}

// Video for list views (no channel join)
export interface VideoWithChannel {
  id: string;
  youtube_video_id: string;
  channel_id: string | null;
  channel_title: string | null;
  title: string | null;
  thumbnail_url: string | null;
  summary: string | null;
  category: VideoCategory | null;
  skill_level: SkillLevel;
  score: number;
  duration: number | null;
  view_count: number | null;
  published_at: string | null;
}

// Video Knowledge
export interface VideoKnowledge {
  id: string;
  video_id: string;
  knowledge_type: KnowledgeType;
  content: {
    text: string;
    term?: string; // for definitions
    effort?: 'low' | 'medium' | 'high'; // for action_items
    impact?: 'low' | 'medium' | 'high'; // for action_items
    resource_name?: string; // for resources
    resource_type?: 'tool' | 'service' | 'website' | 'book' | 'course' | 'app';
    url_hint?: string; // for resources
  };
  category: VideoCategory | null;
  skill_level: SkillLevel;
  searchable_text: string | null;
  created_at: string;
}

// News Source
export interface NewsSource {
  id: string;
  name: string;
  slug: string;
  source_type: 'rss' | 'google_news';
  source_category:
    | 'industry'
    | 'platform'
    | 'mainstream'
    | 'creator'
    | 'real_estate'
    | 'travel';
  url: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  articles_count: number;
  created_at: string;
}

// News Article
export interface NewsArticle {
  id: string;
  source_id: string;
  slug: string | null;
  url: string;
  title: string;
  excerpt: string | null;
  full_text: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
  status: 'pending' | 'processing' | 'parsed' | 'skipped' | 'failed';
  summary: string | null;
  category: VideoCategory | null;
  skill_level: SkillLevel | null;
  tags: string[];
  score: number | null;
  confidence: number | null;
  is_relevant: boolean | null;
  locations_mentioned: string[];
  primary_location: string | null;
  is_local_news: boolean;
  parsed_at: string | null;
  created_at: string;
}

// News Article with source join (partial for list views)
export interface NewsArticleWithSource {
  id: string;
  slug: string | null;
  url: string;
  title: string;
  summary: string | null;
  excerpt: string | null;
  image_url: string | null;
  category: VideoCategory | null;
  score: number | null;
  published_at: string | null;
  primary_location: string | null;
  is_local_news: boolean;
  source: Pick<NewsSource, 'name' | 'slug' | 'logo_url'>[] | null;
}

// News Knowledge
export interface NewsKnowledge {
  id: string;
  article_id: string;
  knowledge_type: KnowledgeType;
  content: {
    text: string;
    term?: string;
    effort?: 'low' | 'medium' | 'high';
    impact?: 'low' | 'medium' | 'high';
    resource_name?: string;
    resource_type?: 'tool' | 'service' | 'website' | 'book' | 'course' | 'app';
    url_hint?: string;
  };
  category: VideoCategory | null;
  skill_level: SkillLevel | null;
  searchable_text: string | null;
  created_at: string;
}

// Helper type for URL generation
export function getVideoUrl(video: Pick<VideoWithChannel, 'youtube_video_id'>): string {
  return `/videos/${video.youtube_video_id}`;
}

export function getNewsUrl(article: Pick<NewsArticle, 'slug' | 'id'>): string {
  return `/news/${article.slug || article.id}`;
}

// ============================================================================
// REGULATIONS TYPES
// ============================================================================

export type JurisdictionType = 'city' | 'county' | 'state';
export type CoverageStatus = 'none' | 'pending' | 'covered' | 'needs_update';
export type RegulationStatus = 'draft' | 'published' | 'archived';

export type RegulationKnowledgeType =
  | 'eligibility'
  | 'exemption'
  | 'fee'
  | 'limit'
  | 'penalty'
  | 'process'
  | 'requirement'
  | 'safety'
  | 'tax';

// Jurisdiction (from jurisdictions table)
export interface Jurisdiction {
  id: string;
  jurisdiction_type: JurisdictionType;
  parent_id: string | null;
  name: string;
  full_name: string | null;
  slug: string;
  state_code: string;
  state_name: string;
  county_name: string | null;
  city_name: string | null;
  is_unincorporated: boolean;
  is_consolidated: boolean;
  crosses_state_lines: boolean;
  population: number | null;
  str_market_tier: string | null;
  timezone: string | null;
  status: string;
  coverage_status: CoverageStatus;
  created_at: string;
  updated_at: string;
}

// Jurisdiction for list views (minimal fields)
export interface JurisdictionSummary {
  id: string;
  slug: string;
  name: string;
  full_name: string | null;
  state_code: string;
  state_name: string;
  jurisdiction_type: JurisdictionType;
  population: number | null;
  coverage_status: CoverageStatus;
}

// JSONB field types for Regulation
export interface RegistrationLevel {
  fee: number | null;
  agency: string | null;
  fee_unit: string | null;
  required: boolean | null;
  permit_name: string | null;
  extended_fee: number | null;
  permit_classes: string[] | null;
  processing_time: string | null;
  renewal_required: boolean | null;
  extended_fee_note: string | null;
  reporting_required: boolean | null;
  required_documents: string[];
  reporting_frequency: string | null;
  display_permit_on_listing: boolean | null;
  primary_residence_required: boolean | null;
  primary_residence_definition: string | null;
}

export interface RegistrationData {
  city?: Partial<RegistrationLevel>;
  county?: Partial<RegistrationLevel>;
}

export interface EligibilityData {
  rso_note: string | null;
  zones_allowed: string[];
  cohost_allowed: boolean | null;
  tenant_can_host: boolean | null;
  hoa_can_prohibit: boolean | null;
  zones_prohibited: string[];
  tenant_requirements: string | null;
  host_present_required: boolean | null;
  property_types_allowed: string[];
  owner_occupied_required: boolean | null;
  max_properties_per_owner: number | null;
  property_types_prohibited: string[];
  primary_residence_required: boolean | null;
  primary_residence_definition: string | null;
}

export interface LimitsLevel {
  max_guests: number | null;
  quiet_hours: string | null;
  can_exceed_cap: boolean | null;
  max_stay_nights: number | null;
  min_stay_nights: number | null;
  nights_per_year: number | null;
  nights_applies_to: string | null;
  max_guests_formula: string | null;
  hosted_exempt_from_cap: boolean | null;
  max_bookings_per_night: number | null;
  exceed_cap_requirements: string | null;
}

export interface LimitsData {
  city?: Partial<LimitsLevel>;
  county?: Partial<LimitsLevel>;
}

export interface TaxesLevel {
  tot_name: string | null;
  tot_rate: number | null;
  platform_remits: boolean | null;
  platform_remits_note: string | null;
  applies_to_stays_under: number | null;
}

export interface TaxesData {
  city?: Partial<TaxesLevel>;
  county?: Partial<TaxesLevel>;
  state_sales_tax: number | null;
  total_tax_rate_city: number | null;
  total_tax_rate_county: number | null;
}

export interface SafetyData {
  fire_extinguisher: boolean | null;
  smoke_detectors: boolean | null;
  carbon_monoxide_detectors: boolean | null;
  emergency_exit_plan: boolean | null;
  first_aid_kit: boolean | null;
  inspection_required: boolean | null;
  inspection_frequency: string | null;
  inspection_agency: string | null;
  other_requirements: string[];
}

export interface PenaltiesLevel {
  notes: string | null;
  max_fine: number | null;
  daily_fine: number | null;
  first_offense: string | null;
  second_offense: string | null;
  third_offense: string | null;
  platform_removal: boolean | null;
  permit_revocation: boolean | null;
  criminal_penalties: boolean | null;
}

export interface PenaltiesData {
  city?: Partial<PenaltiesLevel>;
  county?: Partial<PenaltiesLevel>;
}

export interface ExemptionsData {
  hosted_stays: boolean | null;
  long_term_rentals: boolean | null;
  owner_occupied: boolean | null;
  other: string[];
}

export interface PreemptionData {
  state_preempts_local: boolean | null;
  notes: string | null;
}

export interface InsuranceData {
  required: boolean | null;
  minimum_coverage: number | null;
  coverage_type: string | null;
  notes: string | null;
}

// Application step for Pro-only permit guide
export interface ApplicationStep {
  step: number;
  title: string;
  description: string;
  url: string | null;
  documents_needed: string[] | null;
  estimated_time: string | null;
  cost: number | null;
}

// Main Regulation interface
export interface Regulation {
  id: string;
  jurisdiction_id: string;
  primary_source_id: string | null;
  summary: string | null;
  plain_english: string | null;
  registration: RegistrationData | null;
  eligibility: EligibilityData | null;
  limits: LimitsData | null;
  taxes: TaxesData | null;
  insurance: InsuranceData | null;
  safety: SafetyData | null;
  penalties: PenaltiesData | null;
  exemptions: ExemptionsData | null;
  preemption: PreemptionData | null;
  application_steps: ApplicationStep[] | null;
  key_gotchas: string[] | null;
  effective_date: string | null;
  last_amended: string | null;
  next_review_date: string | null;
  law_reference: string | null;
  confidence_score: number;
  needs_review: boolean;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  status: RegulationStatus;
  created_at: string;
  updated_at: string;
}

// Regulation for list views with joined jurisdiction
export interface RegulationWithJurisdiction {
  id: string;
  summary: string | null;
  confidence_score: number;
  status: RegulationStatus;
  updated_at: string;
  jurisdiction: JurisdictionSummary;
}

// Regulation Source
export interface RegulationSource {
  id: string;
  jurisdiction_id: string;
  url: string;
  source_type: string;
  source_name: string | null;
  scrape_method: string;
  scrape_frequency: string;
  last_scraped_at: string | null;
  last_changed_at: string | null;
  last_error: string | null;
  error_count: number;
  status: string;
  notes: string | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

// Regulation Knowledge Item
export interface RegulationKnowledge {
  id: string;
  regulation_id: string | null;
  jurisdiction_id: string;
  knowledge_type: RegulationKnowledgeType;
  content: string;
  searchable_text: string;
  applies_to: string | null;
  source_id: string | null;
  created_at: string;
}

// Jurisdiction with nested regulation (for detail page)
export interface JurisdictionWithRegulation {
  jurisdiction: Jurisdiction;
  regulation: Regulation | null;
  knowledge: RegulationKnowledge[];
  sources: RegulationSource[];
}

// Jurisdiction for directory listing (with partial regulation data)
export interface JurisdictionForDirectory {
  id: string;
  slug: string;
  name: string;
  full_name: string | null;
  state_code: string;
  state_name: string;
  jurisdiction_type: JurisdictionType;
  population: number | null;
  regulation: {
    summary: string | null;
    confidence_score: number;
    status: RegulationStatus;
    registration: RegistrationData | null;
    eligibility: EligibilityData | null;
    limits: LimitsData | null;
    taxes: TaxesData | null;
    penalties: PenaltiesData | null;
    updated_at: string;
  } | null;
}

// URL helper
export function getRegulationUrl(jurisdiction: Pick<Jurisdiction, 'slug'>): string {
  return `/regulations/${jurisdiction.slug}`;
}
