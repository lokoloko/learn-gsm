/**
 * Extract Listing Analyzer Benchmarks from videos_knowledge
 * 
 * This script focuses specifically on extracting benchmarks that can be used
 * to score listings in the Listing Analyzer app.
 * 
 * Run with: npx ts-node scripts/extract-listing-benchmarks.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Listing attributes we can score
const SCORABLE_ATTRIBUTES = [
  'photo_count',
  'instant_book', 
  'review_count',
  'overall_rating',
  'response_rate',
  'response_time',
  'minimum_stay',
  'cleaning_fee',
  'title',
  'description',
  'amenities',
  'cancellation_policy',
  'is_superhost',
  'nightly_price',
];

interface BenchmarkCandidate {
  attribute: string;
  insight: string;
  numbers: string[];
  confidence: 'high' | 'medium' | 'low';
  source_category: string;
  knowledge_type: string;
}

interface AmenityImportance {
  amenity: string;
  normalized_name: string;
  mention_count: number;
  insight_examples: string[];
  categories: string[];
  tier: 'essential' | 'high_impact' | 'nice_to_have' | 'premium';
}

interface MistakeRule {
  trigger_attribute: string;
  condition_hint: string;
  mistake_text: string;
  severity: 'critical' | 'warning' | 'info';
  source_category: string;
}

async function searchKnowledge(query: string, knowledgeType?: string, limit = 100) {
  let queryBuilder = supabase
    .from('videos_knowledge')
    .select('id, knowledge_type, content, category, searchable_text')
    .textSearch('searchable_text', query, { type: 'websearch' })
    .limit(limit);
  
  if (knowledgeType) {
    queryBuilder = queryBuilder.eq('knowledge_type', knowledgeType);
  }
  
  const { data, error } = await queryBuilder;
  if (error) {
    console.error(`Error searching for "${query}":`, error);
    return [];
  }
  return data || [];
}

async function getKnowledgeByCategory(category: string, knowledgeType?: string, limit = 500) {
  let queryBuilder = supabase
    .from('videos_knowledge')
    .select('id, knowledge_type, content, category, searchable_text')
    .eq('category', category)
    .limit(limit);
  
  if (knowledgeType) {
    queryBuilder = queryBuilder.eq('knowledge_type', knowledgeType);
  }
  
  const { data, error } = await queryBuilder;
  if (error) {
    console.error(`Error fetching category "${category}":`, error);
    return [];
  }
  return data || [];
}

function extractNumbers(text: string): string[] {
  const patterns = [
    /\d+(?:\.\d+)?%/g,
    /\$\d+(?:,\d{3})*(?:\.\d+)?/g,
    /\d+(?:-|\s*to\s*)\d+/g,
    /\d+\+/g,
    /\d+x/gi,
  ];
  
  const numbers: string[] = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) numbers.push(...matches);
  }
  return [...new Set(numbers)];
}

function determineAttribute(text: string): string | null {
  const textLower = text.toLowerCase();
  
  const attributePatterns: Record<string, string[]> = {
    'photo_count': ['photo', 'picture', 'image', 'gallery', 'photos'],
    'instant_book': ['instant book', 'instantbook'],
    'review_count': ['review', 'reviews', 'testimonial'],
    'overall_rating': ['rating', 'star', 'stars', '4.8', '4.9', '5.0'],
    'response_rate': ['response rate'],
    'response_time': ['response time', 'respond within', 'reply time'],
    'minimum_stay': ['minimum stay', 'min stay', 'night minimum', '1 night', '2 night', '3 night'],
    'cleaning_fee': ['cleaning fee', 'cleaning cost'],
    'title': ['title', 'headline', 'listing name', 'listing title'],
    'description': ['description', 'listing description', 'about section'],
    'amenities': ['amenity', 'amenities', 'feature', 'features'],
    'cancellation_policy': ['cancellation', 'cancel policy', 'refund'],
    'is_superhost': ['superhost', 'super host'],
    'nightly_price': ['price', 'pricing', 'nightly rate', 'adr', 'average daily'],
  };
  
  for (const [attr, keywords] of Object.entries(attributePatterns)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      return attr;
    }
  }
  return null;
}

async function extractBenchmarkCandidates(): Promise<BenchmarkCandidate[]> {
  console.log('Extracting benchmark candidates...\n');
  const candidates: BenchmarkCandidate[] = [];
  
  // Search for each attribute
  const searches = [
    { query: 'photos increase bookings', attr: 'photo_count' },
    { query: 'photo count conversion', attr: 'photo_count' },
    { query: '30 photos 50 photos', attr: 'photo_count' },
    { query: 'instant book bookings', attr: 'instant_book' },
    { query: 'instant book visibility', attr: 'instant_book' },
    { query: 'reviews credibility trust', attr: 'review_count' },
    { query: 'reviews bookings conversion', attr: 'review_count' },
    { query: 'response rate superhost', attr: 'response_rate' },
    { query: 'response time bookings', attr: 'response_time' },
    { query: 'minimum stay occupancy', attr: 'minimum_stay' },
    { query: 'night minimum bookings', attr: 'minimum_stay' },
    { query: 'cleaning fee pricing', attr: 'cleaning_fee' },
    { query: 'title click through', attr: 'title' },
    { query: 'description bookings', attr: 'description' },
    { query: 'cancellation policy bookings', attr: 'cancellation_policy' },
    { query: 'superhost benefits', attr: 'is_superhost' },
    { query: 'pricing strategy occupancy', attr: 'nightly_price' },
    { query: 'dynamic pricing revenue', attr: 'nightly_price' },
  ];
  
  for (const search of searches) {
    console.log(`  Searching: "${search.query}"...`);
    const results = await searchKnowledge(search.query, 'insight', 50);
    
    for (const item of results) {
      const text = item.content?.text || item.searchable_text || '';
      const numbers = extractNumbers(text);
      
      if (numbers.length > 0) {
        candidates.push({
          attribute: search.attr,
          insight: text,
          numbers,
          confidence: numbers.length >= 2 ? 'high' : 'medium',
          source_category: item.category,
          knowledge_type: item.knowledge_type,
        });
      }
    }
  }
  
  // Deduplicate
  const seen = new Set<string>();
  return candidates.filter(c => {
    const key = c.insight.substring(0, 100);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function extractAmenityImportance(): Promise<AmenityImportance[]> {
  console.log('\nExtracting amenity importance...\n');
  
  const amenitySearches = [
    { search: 'wifi essential', normalized: 'wifi' },
    { search: 'wifi internet', normalized: 'wifi' },
    { search: 'workspace remote work', normalized: 'dedicated_workspace' },
    { search: 'desk work from home', normalized: 'dedicated_workspace' },
    { search: 'self check-in keypad', normalized: 'self_check_in' },
    { search: 'smart lock keyless', normalized: 'self_check_in' },
    { search: 'hot tub jacuzzi', normalized: 'hot_tub' },
    { search: 'pool swimming', normalized: 'pool' },
    { search: 'parking garage', normalized: 'parking' },
    { search: 'washer dryer laundry', normalized: 'laundry' },
    { search: 'kitchen cooking', normalized: 'kitchen' },
    { search: 'coffee maker', normalized: 'coffee_maker' },
    { search: 'air conditioning heating', normalized: 'climate_control' },
    { search: 'tv netflix streaming', normalized: 'streaming' },
    { search: 'ev charger electric vehicle', normalized: 'ev_charger' },
    { search: 'pet friendly dog', normalized: 'pet_friendly' },
    { search: 'fire pit outdoor', normalized: 'fire_pit' },
    { search: 'grill bbq barbecue', normalized: 'bbq_grill' },
    { search: 'patio balcony outdoor', normalized: 'outdoor_space' },
    { search: 'crib baby family', normalized: 'family_friendly' },
  ];
  
  const amenities: AmenityImportance[] = [];
  
  for (const { search, normalized } of amenitySearches) {
    console.log(`  Searching: "${search}"...`);
    const results = await searchKnowledge(search, undefined, 100);
    
    const examples: string[] = [];
    const categories = new Set<string>();
    
    for (const item of results) {
      const text = item.content?.text || item.searchable_text || '';
      if (examples.length < 3 && text.length > 20) {
        examples.push(text.substring(0, 200));
      }
      categories.add(item.category);
    }
    
    // Determine tier based on mention count
    let tier: AmenityImportance['tier'] = 'nice_to_have';
    if (results.length > 50) tier = 'essential';
    else if (results.length > 25) tier = 'high_impact';
    else if (['hot_tub', 'pool', 'ev_charger'].includes(normalized)) tier = 'premium';
    
    amenities.push({
      amenity: search.split(' ')[0],
      normalized_name: normalized,
      mention_count: results.length,
      insight_examples: examples,
      categories: [...categories],
      tier,
    });
  }
  
  return amenities.sort((a, b) => b.mention_count - a.mention_count);
}

async function extractMistakeRules(): Promise<MistakeRule[]> {
  console.log('\nExtracting mistake rules...\n');
  
  const rules: MistakeRule[] = [];
  
  // Get all mistakes from relevant categories
  const categories = ['Your Listing', 'Pricing & Profitability', 'Hosting Operations'];
  
  for (const category of categories) {
    console.log(`  Fetching mistakes from: "${category}"...`);
    const mistakes = await getKnowledgeByCategory(category, 'mistake', 200);
    
    for (const item of mistakes) {
      const text = item.content?.text || item.searchable_text || '';
      const attr = determineAttribute(text);
      
      if (attr) {
        // Determine severity based on keywords
        let severity: MistakeRule['severity'] = 'warning';
        const textLower = text.toLowerCase();
        if (textLower.includes('never') || textLower.includes('critical') || textLower.includes('biggest mistake')) {
          severity = 'critical';
        } else if (textLower.includes('consider') || textLower.includes('might') || textLower.includes('optional')) {
          severity = 'info';
        }
        
        // Try to extract a condition hint
        let conditionHint = '';
        if (attr === 'instant_book' && textLower.includes('disable')) conditionHint = 'instant_book === false';
        if (attr === 'photo_count' && textLower.includes('few')) conditionHint = 'photo_count < 20';
        if (attr === 'minimum_stay' && textLower.includes('high')) conditionHint = 'minimum_stay > 3';
        if (attr === 'cleaning_fee' && textLower.includes('high')) conditionHint = 'cleaning_fee_ratio > 0.5';
        if (attr === 'response_rate') conditionHint = 'response_rate < 90';
        
        rules.push({
          trigger_attribute: attr,
          condition_hint: conditionHint,
          mistake_text: text,
          severity,
          source_category: category,
        });
      }
    }
  }
  
  // Deduplicate
  const seen = new Set<string>();
  return rules.filter(r => {
    const key = r.mistake_text.substring(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateSQL(
  benchmarks: BenchmarkCandidate[],
  amenities: AmenityImportance[],
  mistakes: MistakeRule[]
): string {
  return `-- Generated Benchmark Tables for Listing Analyzer
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Industry Benchmarks Table
-- ============================================

CREATE TABLE IF NOT EXISTS listings.industry_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric text NOT NULL UNIQUE,
  threshold_poor numeric,
  threshold_good numeric,
  threshold_excellent numeric,
  source_description text,
  expert_mentions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed with extracted benchmarks (customize based on research)
INSERT INTO listings.industry_benchmarks (metric, threshold_poor, threshold_good, threshold_excellent, source_description, expert_mentions)
VALUES
  ('photo_count', 15, 25, 40, 'Top performers have 30-50+ photos', ${benchmarks.filter(b => b.attribute === 'photo_count').length}),
  ('review_count_credibility', 3, 10, 50, 'Credibility threshold is 10+ reviews', ${benchmarks.filter(b => b.attribute === 'review_count').length}),
  ('response_rate_pct', 80, 90, 98, 'Superhost requires 90%+', ${benchmarks.filter(b => b.attribute === 'response_rate').length}),
  ('overall_rating', 4.5, 4.7, 4.9, 'Guest Favorite threshold is 4.9+', ${benchmarks.filter(b => b.attribute === 'overall_rating').length}),
  ('cleaning_fee_ratio_max', 0.6, 0.4, 0.25, 'Cleaning fee should be <40% of nightly rate', ${benchmarks.filter(b => b.attribute === 'cleaning_fee').length}),
  ('min_stay_urban_max', 5, 2, 1, 'Urban markets: 2+ nights limits bookings', ${benchmarks.filter(b => b.attribute === 'minimum_stay').length})
ON CONFLICT (metric) DO UPDATE SET
  source_description = EXCLUDED.source_description,
  expert_mentions = EXCLUDED.expert_mentions,
  updated_at = now();

-- ============================================
-- 2. Amenity Importance Table
-- ============================================

CREATE TABLE IF NOT EXISTS listings.amenity_importance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amenity_name text NOT NULL,
  normalized_name text NOT NULL UNIQUE,
  tier text NOT NULL CHECK (tier IN ('essential', 'high_impact', 'nice_to_have', 'premium')),
  mention_count integer DEFAULT 0,
  sample_insight text,
  created_at timestamptz DEFAULT now()
);

-- Seed with extracted amenity importance
INSERT INTO listings.amenity_importance (amenity_name, normalized_name, tier, mention_count, sample_insight)
VALUES
${amenities.slice(0, 20).map(a => 
  `  ('${a.amenity}', '${a.normalized_name}', '${a.tier}', ${a.mention_count}, '${(a.insight_examples[0] || '').replace(/'/g, "''")}')` 
).join(',\n')}
ON CONFLICT (normalized_name) DO UPDATE SET
  tier = EXCLUDED.tier,
  mention_count = EXCLUDED.mention_count,
  sample_insight = EXCLUDED.sample_insight;

-- ============================================
-- 3. Mistake Rules Table
-- ============================================

CREATE TABLE IF NOT EXISTS listings.mistake_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_attribute text NOT NULL,
  condition_hint text,
  mistake_text text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  source_category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed with extracted mistake rules
INSERT INTO listings.mistake_rules (trigger_attribute, condition_hint, mistake_text, severity, source_category)
VALUES
${mistakes.slice(0, 30).map(m => 
  `  ('${m.trigger_attribute}', '${m.condition_hint}', '${m.mistake_text.substring(0, 300).replace(/'/g, "''")}', '${m.severity}', '${m.source_category}')`
).join(',\n')};

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_amenity_importance_tier ON listings.amenity_importance(tier);
CREATE INDEX IF NOT EXISTS idx_mistake_rules_attribute ON listings.mistake_rules(trigger_attribute);
CREATE INDEX IF NOT EXISTS idx_mistake_rules_active ON listings.mistake_rules(is_active) WHERE is_active = true;
`;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Listing Analyzer Benchmark Extraction');
  console.log('='.repeat(60));
  
  try {
    // Extract data
    const benchmarks = await extractBenchmarkCandidates();
    console.log(`\nFound ${benchmarks.length} benchmark candidates`);
    
    const amenities = await extractAmenityImportance();
    console.log(`Found ${amenities.length} amenity importance entries`);
    
    const mistakes = await extractMistakeRules();
    console.log(`Found ${mistakes.length} mistake rules`);
    
    // Generate outputs
    const outputDir = './scripts/research-output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Save JSON
    const data = { benchmarks, amenities, mistakes };
    fs.writeFileSync(`${outputDir}/listing-benchmarks.json`, JSON.stringify(data, null, 2));
    
    // Generate SQL
    const sql = generateSQL(benchmarks, amenities, mistakes);
    fs.writeFileSync(`${outputDir}/listing-benchmarks.sql`, sql);
    
    // Generate markdown report
    const report = `# Listing Analyzer Benchmarks

Generated: ${new Date().toISOString()}

## Benchmark Candidates (${benchmarks.length})

### By Attribute
${SCORABLE_ATTRIBUTES.map(attr => {
  const items = benchmarks.filter(b => b.attribute === attr);
  if (items.length === 0) return '';
  return `
#### ${attr} (${items.length} insights)
${items.slice(0, 5).map(b => `- "${b.insight.substring(0, 150)}..." [${b.numbers.join(', ')}]`).join('\n')}
`;
}).filter(Boolean).join('\n')}

## Amenity Importance Ranking

| Rank | Amenity | Tier | Mentions |
|------|---------|------|----------|
${amenities.map((a, i) => `| ${i + 1} | ${a.normalized_name} | ${a.tier} | ${a.mention_count} |`).join('\n')}

## Mistake Rules (${mistakes.length})

### Critical
${mistakes.filter(m => m.severity === 'critical').slice(0, 10).map(m => `- [${m.trigger_attribute}] ${m.mistake_text.substring(0, 100)}...`).join('\n')}

### Warning
${mistakes.filter(m => m.severity === 'warning').slice(0, 10).map(m => `- [${m.trigger_attribute}] ${m.mistake_text.substring(0, 100)}...`).join('\n')}

## Files Generated

- \`listing-benchmarks.json\` - Raw extracted data
- \`listing-benchmarks.sql\` - Ready-to-run Supabase migration
`;

    fs.writeFileSync(`${outputDir}/listing-benchmarks-report.md`, report);
    
    console.log('\n' + '='.repeat(60));
    console.log('Extraction complete!');
    console.log('='.repeat(60));
    console.log(`\nOutputs saved to ${outputDir}/`);
    console.log('- listing-benchmarks.json');
    console.log('- listing-benchmarks.sql');
    console.log('- listing-benchmarks-report.md');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
