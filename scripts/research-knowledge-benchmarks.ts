/**
 * Research Script: Extract Benchmarks from videos_knowledge
 * 
 * Run with: npx ts-node scripts/research-knowledge-benchmarks.ts
 * 
 * This script analyzes your 102k+ knowledge items to find:
 * 1. Quantitative insights (numbers, percentages, benchmarks)
 * 2. Amenity mentions and importance
 * 3. Common mistakes by category
 * 4. Action items with effort/impact ratings
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load env
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface KnowledgeItem {
  id: string;
  knowledge_type: string;
  content: {
    text: string;
    term?: string;
    effort?: string;
    impact?: string;
    resource_name?: string;
    resource_type?: string;
  };
  category: string;
  skill_level: string;
  searchable_text: string;
}

interface ResearchResults {
  summary: {
    totalItems: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  };
  quantitativeInsights: Array<{
    text: string;
    category: string;
    numbers: string[];
    topic: string;
  }>;
  amenityMentions: Record<string, {
    count: number;
    examples: string[];
    categories: string[];
  }>;
  mistakesByCategory: Record<string, Array<{
    text: string;
    keywords: string[];
  }>>;
  highImpactActions: Array<{
    text: string;
    category: string;
    effort: string;
    impact: string;
  }>;
  listingSpecificInsights: Array<{
    text: string;
    category: string;
    relatesTo: string;
  }>;
}

async function fetchAllKnowledge(): Promise<KnowledgeItem[]> {
  console.log('Fetching all knowledge items...');
  
  const allItems: KnowledgeItem[] = [];
  let offset = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('videos_knowledge')
      .select('id, knowledge_type, content, category, skill_level, searchable_text')
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching:', error);
      break;
    }
    
    if (!data || data.length === 0) break;
    
    allItems.push(...data);
    console.log(`  Fetched ${allItems.length} items...`);
    
    if (data.length < limit) break;
    offset += limit;
  }
  
  console.log(`Total items fetched: ${allItems.length}`);
  return allItems;
}

function extractNumbers(text: string): string[] {
  // Match various number patterns
  const patterns = [
    /\d+(?:\.\d+)?%/g,           // Percentages: 20%, 4.5%
    /\$\d+(?:,\d{3})*(?:\.\d+)?/g, // Dollar amounts: $100, $1,500.00
    /\d+(?:-|\s*to\s*)\d+/g,     // Ranges: 20-30, 20 to 30
    /\d+\+/g,                     // Minimums: 30+, 50+
    /\d+x/gi,                     // Multipliers: 2x, 3X
    /\b\d+(?:\.\d+)?\s*(?:hours?|nights?|days?|weeks?|months?|photos?|reviews?|guests?|properties|listings?)\b/gi,
  ];
  
  const numbers: string[] = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      numbers.push(...matches);
    }
  }
  
  return [...new Set(numbers)];
}

function categorizeTopic(text: string): string {
  const textLower = text.toLowerCase();
  
  const topics: Record<string, string[]> = {
    'photos': ['photo', 'picture', 'image', 'gallery'],
    'pricing': ['price', 'pricing', 'rate', 'adr', 'nightly', 'discount', 'fee'],
    'reviews': ['review', 'rating', 'star', 'feedback', 'testimonial'],
    'occupancy': ['occupancy', 'booking', 'vacancy', 'booked', 'calendar'],
    'instant_book': ['instant book', 'instantbook', 'instant-book'],
    'response': ['response time', 'response rate', 'reply', 'message'],
    'amenities': ['amenity', 'amenities', 'wifi', 'parking', 'pool', 'hot tub', 'workspace'],
    'cleaning': ['cleaning', 'turnover', 'cleaner', 'housekeeping'],
    'minimum_stay': ['minimum stay', 'min stay', 'night minimum', 'minimum night'],
    'superhost': ['superhost', 'super host'],
    'title': ['title', 'headline', 'listing name'],
    'description': ['description', 'listing description', 'about'],
    'cancellation': ['cancellation', 'cancel policy', 'refund'],
    'revenue': ['revenue', 'income', 'earnings', 'profit'],
    'expenses': ['expense', 'cost', 'spending', 'supplies'],
  };
  
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      return topic;
    }
  }
  
  return 'general';
}

const AMENITY_KEYWORDS = [
  'wifi', 'wi-fi', 'internet',
  'parking', 'garage', 'driveway',
  'pool', 'swimming pool',
  'hot tub', 'jacuzzi', 'spa',
  'workspace', 'desk', 'office', 'work from home', 'remote work',
  'self check-in', 'self check in', 'keypad', 'smart lock', 'lockbox',
  'air conditioning', 'ac', 'a/c', 'heating', 'hvac',
  'washer', 'dryer', 'laundry',
  'kitchen', 'full kitchen', 'kitchenette',
  'coffee', 'coffee maker', 'keurig', 'nespresso',
  'tv', 'television', 'smart tv', 'netflix', 'streaming',
  'grill', 'bbq', 'barbecue',
  'fire pit', 'firepit', 'fireplace',
  'patio', 'deck', 'balcony', 'outdoor space',
  'ev charger', 'electric vehicle', 'tesla charger',
  'pet friendly', 'pets allowed', 'dog friendly',
  'gym', 'fitness', 'exercise',
  'game room', 'games', 'board games', 'video games',
  'crib', 'high chair', 'baby', 'child friendly',
];

function extractAmenityMentions(text: string): string[] {
  const textLower = text.toLowerCase();
  const found: string[] = [];
  
  for (const amenity of AMENITY_KEYWORDS) {
    if (textLower.includes(amenity)) {
      // Normalize to standard names
      let normalized = amenity;
      if (['wifi', 'wi-fi', 'internet'].includes(amenity)) normalized = 'wifi';
      if (['workspace', 'desk', 'office', 'work from home', 'remote work'].includes(amenity)) normalized = 'workspace';
      if (['self check-in', 'self check in', 'keypad', 'smart lock', 'lockbox'].includes(amenity)) normalized = 'self_check_in';
      if (['hot tub', 'jacuzzi', 'spa'].includes(amenity)) normalized = 'hot_tub';
      if (['pool', 'swimming pool'].includes(amenity)) normalized = 'pool';
      if (['washer', 'dryer', 'laundry'].includes(amenity)) normalized = 'laundry';
      if (['grill', 'bbq', 'barbecue'].includes(amenity)) normalized = 'bbq';
      if (['fire pit', 'firepit'].includes(amenity)) normalized = 'fire_pit';
      if (['patio', 'deck', 'balcony', 'outdoor space'].includes(amenity)) normalized = 'outdoor_space';
      if (['pet friendly', 'pets allowed', 'dog friendly'].includes(amenity)) normalized = 'pet_friendly';
      if (['ev charger', 'electric vehicle', 'tesla charger'].includes(amenity)) normalized = 'ev_charger';
      if (['crib', 'high chair', 'baby', 'child friendly'].includes(amenity)) normalized = 'family_friendly';
      if (['tv', 'television', 'smart tv', 'netflix', 'streaming'].includes(amenity)) normalized = 'tv_streaming';
      if (['air conditioning', 'ac', 'a/c', 'heating', 'hvac'].includes(amenity)) normalized = 'climate_control';
      
      if (!found.includes(normalized)) {
        found.push(normalized);
      }
    }
  }
  
  return found;
}

function extractKeywords(text: string): string[] {
  const textLower = text.toLowerCase();
  const keywords: string[] = [];
  
  const importantTerms = [
    'instant book', 'photos', 'pricing', 'reviews', 'response',
    'cleaning', 'turnover', 'amenities', 'title', 'description',
    'minimum stay', 'cancellation', 'superhost', 'occupancy',
    'smart pricing', 'dynamic pricing', 'calendar', 'availability'
  ];
  
  for (const term of importantTerms) {
    if (textLower.includes(term)) {
      keywords.push(term);
    }
  }
  
  return keywords;
}

function getListingAttribute(text: string): string {
  const textLower = text.toLowerCase();
  
  const attributes: Record<string, string[]> = {
    'instant_book': ['instant book'],
    'photo_count': ['photo', 'picture', 'image'],
    'review_count': ['review', 'rating'],
    'response_rate': ['response rate', 'response time'],
    'minimum_stay': ['minimum stay', 'min stay'],
    'cleaning_fee': ['cleaning fee'],
    'nightly_price': ['price', 'nightly rate', 'adr'],
    'title': ['title', 'headline'],
    'description': ['description'],
    'amenities': ['amenity', 'amenities'],
    'cancellation_policy': ['cancellation', 'cancel policy'],
    'superhost': ['superhost'],
    'occupancy': ['occupancy', 'booked'],
  };
  
  for (const [attr, keywords] of Object.entries(attributes)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      return attr;
    }
  }
  
  return 'general';
}

async function analyzeKnowledge(items: KnowledgeItem[]): Promise<ResearchResults> {
  console.log('\nAnalyzing knowledge items...\n');
  
  const results: ResearchResults = {
    summary: {
      totalItems: items.length,
      byType: {},
      byCategory: {},
    },
    quantitativeInsights: [],
    amenityMentions: {},
    mistakesByCategory: {},
    highImpactActions: [],
    listingSpecificInsights: [],
  };
  
  // Summary counts
  for (const item of items) {
    results.summary.byType[item.knowledge_type] = (results.summary.byType[item.knowledge_type] || 0) + 1;
    results.summary.byCategory[item.category] = (results.summary.byCategory[item.category] || 0) + 1;
  }
  
  // Analyze each item
  for (const item of items) {
    const text = item.content?.text || item.searchable_text || '';
    if (!text) continue;
    
    // 1. Quantitative insights (has numbers)
    if (item.knowledge_type === 'insight') {
      const numbers = extractNumbers(text);
      if (numbers.length > 0) {
        results.quantitativeInsights.push({
          text,
          category: item.category,
          numbers,
          topic: categorizeTopic(text),
        });
      }
    }
    
    // 2. Amenity mentions
    const amenities = extractAmenityMentions(text);
    for (const amenity of amenities) {
      if (!results.amenityMentions[amenity]) {
        results.amenityMentions[amenity] = { count: 0, examples: [], categories: [] };
      }
      results.amenityMentions[amenity].count++;
      if (results.amenityMentions[amenity].examples.length < 3) {
        results.amenityMentions[amenity].examples.push(text.substring(0, 200));
      }
      if (!results.amenityMentions[amenity].categories.includes(item.category)) {
        results.amenityMentions[amenity].categories.push(item.category);
      }
    }
    
    // 3. Mistakes by category
    if (item.knowledge_type === 'mistake') {
      if (!results.mistakesByCategory[item.category]) {
        results.mistakesByCategory[item.category] = [];
      }
      results.mistakesByCategory[item.category].push({
        text,
        keywords: extractKeywords(text),
      });
    }
    
    // 4. High-impact action items
    if (item.knowledge_type === 'action_item') {
      const effort = item.content?.effort || 'medium';
      const impact = item.content?.impact || 'medium';
      if (impact === 'high') {
        results.highImpactActions.push({
          text,
          category: item.category,
          effort,
          impact,
        });
      }
    }
    
    // 5. Listing-specific insights (for Listing Analyzer)
    if (item.category === 'Your Listing' || item.category === 'Pricing & Profitability') {
      const relatesTo = getListingAttribute(text);
      if (relatesTo !== 'general') {
        results.listingSpecificInsights.push({
          text,
          category: item.category,
          relatesTo,
        });
      }
    }
  }
  
  return results;
}

function generateReport(results: ResearchResults): string {
  let report = `# Knowledge Benchmark Research Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Knowledge Items**: ${results.summary.totalItems.toLocaleString()}

### By Type
${Object.entries(results.summary.byType)
  .sort((a, b) => b[1] - a[1])
  .map(([type, count]) => `- ${type}: ${count.toLocaleString()}`)
  .join('\n')}

### By Category
${Object.entries(results.summary.byCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, count]) => `- ${cat}: ${count.toLocaleString()}`)
  .join('\n')}

---

## Quantitative Insights (${results.quantitativeInsights.length} found)

These insights contain specific numbers, percentages, or benchmarks.

### By Topic

${(() => {
  const byTopic: Record<string, typeof results.quantitativeInsights> = {};
  for (const insight of results.quantitativeInsights) {
    if (!byTopic[insight.topic]) byTopic[insight.topic] = [];
    byTopic[insight.topic].push(insight);
  }
  
  return Object.entries(byTopic)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 15) // Top 15 topics
    .map(([topic, insights]) => {
      const examples = insights.slice(0, 5).map(i => 
        `  - "${i.text.substring(0, 150)}${i.text.length > 150 ? '...' : ''}" [${i.numbers.join(', ')}]`
      ).join('\n');
      return `#### ${topic} (${insights.length} insights)\n${examples}`;
    })
    .join('\n\n');
})()}

---

## Amenity Importance Ranking

Ranked by number of expert mentions across all videos.

| Rank | Amenity | Mentions | Categories |
|------|---------|----------|------------|
${Object.entries(results.amenityMentions)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 25)
  .map(([amenity, data], i) => 
    `| ${i + 1} | ${amenity} | ${data.count} | ${data.categories.slice(0, 2).join(', ')} |`
  )
  .join('\n')}

### Top Amenity Quotes

${Object.entries(results.amenityMentions)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 10)
  .map(([amenity, data]) => 
    `**${amenity}** (${data.count} mentions)\n${data.examples.map(e => `> "${e}..."`).join('\n')}`
  )
  .join('\n\n')}

---

## Mistakes by Category

Common mistakes hosts make, organized by category.

${Object.entries(results.mistakesByCategory)
  .sort((a, b) => b[1].length - a[1].length)
  .map(([category, mistakes]) => {
    const examples = mistakes.slice(0, 8).map(m => 
      `- ${m.text.substring(0, 150)}${m.text.length > 150 ? '...' : ''}`
    ).join('\n');
    return `### ${category} (${mistakes.length} mistakes)\n${examples}`;
  })
  .join('\n\n')}

---

## High-Impact Action Items (${results.highImpactActions.length} found)

Action items marked as high impact by AI extraction.

### Low Effort / High Impact (Quick Wins)
${results.highImpactActions
  .filter(a => a.effort === 'low')
  .slice(0, 15)
  .map(a => `- [${a.category}] ${a.text.substring(0, 150)}`)
  .join('\n')}

### Medium Effort / High Impact
${results.highImpactActions
  .filter(a => a.effort === 'medium')
  .slice(0, 15)
  .map(a => `- [${a.category}] ${a.text.substring(0, 150)}`)
  .join('\n')}

### High Effort / High Impact (Strategic)
${results.highImpactActions
  .filter(a => a.effort === 'high')
  .slice(0, 10)
  .map(a => `- [${a.category}] ${a.text.substring(0, 150)}`)
  .join('\n')}

---

## Listing-Specific Insights (${results.listingSpecificInsights.length} found)

Insights that relate to specific listing attributes we can score.

${(() => {
  const byAttribute: Record<string, typeof results.listingSpecificInsights> = {};
  for (const insight of results.listingSpecificInsights) {
    if (!byAttribute[insight.relatesTo]) byAttribute[insight.relatesTo] = [];
    byAttribute[insight.relatesTo].push(insight);
  }
  
  return Object.entries(byAttribute)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([attr, insights]) => {
      const examples = insights.slice(0, 5).map(i => 
        `- ${i.text.substring(0, 150)}${i.text.length > 150 ? '...' : ''}`
      ).join('\n');
      return `### ${attr} (${insights.length} insights)\n${examples}`;
    })
    .join('\n\n');
})()}

---

## Recommended Benchmarks to Extract

Based on this analysis, here are the benchmarks we should create:

### Photo Benchmarks
- Poor: < 15 photos
- Good: 20-30 photos  
- Excellent: 30+ photos

### Instant Book
- Recommendation: Enable for most listings
- Exception: Luxury properties requiring vetting

### Response Rate
- Superhost requirement: 90%+
- Target: 95%+

### Review Count
- Credibility threshold: 10+ reviews
- Strong social proof: 50+ reviews

### Minimum Stay
- Urban markets: 1-2 nights recommended
- Resort markets: 2-3 nights acceptable

### Amenities
- Essential: WiFi, Kitchen, AC/Heating, TV
- High-impact: Workspace, Self Check-in, Washer/Dryer
- Premium differentiators: Pool, Hot Tub, EV Charger

---

## Raw Data Export

Full results exported to: research-knowledge-results.json
`;

  return report;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Knowledge Benchmark Research');
  console.log('='.repeat(60));
  
  try {
    // Fetch all knowledge
    const items = await fetchAllKnowledge();
    
    if (items.length === 0) {
      console.error('No knowledge items found!');
      return;
    }
    
    // Analyze
    const results = await analyzeKnowledge(items);
    
    // Generate report
    const report = generateReport(results);
    
    // Save outputs
    const outputDir = './scripts/research-output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(`${outputDir}/research-knowledge-report.md`, report);
    fs.writeFileSync(`${outputDir}/research-knowledge-results.json`, JSON.stringify(results, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('Research complete!');
    console.log('='.repeat(60));
    console.log(`\nOutputs saved to ${outputDir}/`);
    console.log('- research-knowledge-report.md (human-readable)');
    console.log('- research-knowledge-results.json (raw data)');
    console.log('\nOpen the markdown report to see findings.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
