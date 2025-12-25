# GoStudioM Knowledge Base - Claude Project Context

## What This Is

GoStudioM has a comprehensive STR (Short-Term Rental / Airbnb) knowledge base with three data sources:

1. **Regulations Database** (cp-gsm) - Municipal STR regulations for 120+ US markets
2. **Video Knowledge** (learn-gsm) - AI-processed YouTube content from STR educators
3. **News Knowledge** (learn-gsm) - AI-processed industry news and articles

## Quick Stats

| Source | Items | Description |
|--------|-------|-------------|
| Regulations Knowledge | ~15,000+ | Searchable facts from 120+ markets |
| Video Knowledge | 100,625 | Insights from YouTube videos |
| News Knowledge | 6,108 | Insights from news articles |
| **Total** | **120,000+** | Combined searchable knowledge |

**Note**: Markets have `coverage_status` field - only `'covered'` markets appear in the public UI.

## Regulations Data Structure

### Key Tables
- `jurisdictions` - Cities/counties (120+ markets, ~51 currently covered)
- `regulations` - Full regulatory data per jurisdiction
- `regulations_knowledge` - Searchable knowledge items (~48/market)
- `regulation_sources` - Official government URLs

### Important New Fields (Dec 2024)

**`regulations.application_steps`** (JSONB array):
```json
[
  {
    "step": 1,
    "title": "Verify Eligibility",
    "description": "Check zoning and property type requirements",
    "url": "https://...",
    "documents_needed": ["Proof of ownership", "ID"],
    "estimated_time": "1-2 days",
    "cost": null
  }
]
```

**`regulations.key_gotchas`** (TEXT array):
```json
[
  "ADUs are prohibited even if main home is eligible",
  "Must display permit number in listing",
  "Fire inspection required BEFORE permit approval"
]
```

### Coverage (expanding to 120+ markets)
- **California**: 15+ markets (LA, SF, San Diego, Palm Springs, etc.)
- **Florida**: 12+ markets (Miami Beach, Orlando, Key West, etc.)
- **Colorado**: 8+ markets (Denver, Aspen, Breckenridge, etc.)
- **Arizona**: 8+ markets (Phoenix, Scottsdale, Sedona, etc.)
- **Texas**: 8+ markets (Austin, Houston, Dallas, San Antonio, etc.)
- **30+ other states**: Various markets

## Video & News Data Structure

### Video Tables
- `videos_channels` - YouTube channels monitored
- `videos_raw` - Raw video data from API
- `videos_parsed` - AI-processed summaries, tags, scores
- `videos_knowledge` - Extracted insights/action items

### News Tables  
- `news_sources` - RSS feeds and Google News queries
- `news_articles` - Fetched articles with AI processing
- `news_knowledge` - Extracted insights

### Content Categories (shared across all sources)
1. Getting Started
2. Your Listing
3. Pricing & Profitability
4. Hosting Operations
5. Regulations & Compliance
6. Growth & Marketing

### Knowledge Types
- `insight` - Key learning or trend
- `action_item` - Actionable step
- `resource` - Tool or link
- `definition` - Term explanation
- `mistake` - Common error to avoid

## Common Queries

### Search all knowledge
```sql
SELECT 'regulation' as source, content, searchable_text 
FROM regulations_knowledge WHERE searchable_text ILIKE '%permit%'
UNION ALL
SELECT 'video' as source, content::text, searchable_text 
FROM videos_knowledge WHERE searchable_text ILIKE '%permit%'
UNION ALL
SELECT 'news' as source, content::text, searchable_text 
FROM news_knowledge WHERE searchable_text ILIKE '%permit%';
```

### Get regulation details for a market
```sql
SELECT j.name, j.state_code, r.plain_english, 
       r.application_steps, r.key_gotchas,
       r.registration->'city'->>'fee' as permit_fee
FROM jurisdictions j
JOIN regulations r ON r.jurisdiction_id = j.id
WHERE j.slug = 'austin-tx';
```

### Total knowledge count
```sql
SELECT 
  (SELECT COUNT(*) FROM regulations_knowledge) +
  (SELECT COUNT(*) FROM videos_knowledge) +
  (SELECT COUNT(*) FROM news_knowledge) as total_knowledge;
```

## Projects

| Project | Purpose | Key Features |
|---------|---------|--------------|
| **cp-gsm** | Control panel, regulations pipeline | Research CLI, import/export, knowledge generation |
| **learn-gsm** | Public Learn platform | Video/news display, search, **regulations UI with tiered access** |
| **listings-gsm** | Listing analyzer | Uses regulation data for compliance checks |

## Regulations UI (learn-gsm)

### Routes
- `/regulations` - Directory page with search, popular markets, state grouping
- `/regulations/[slug]` - Detail page (e.g., `/regulations/miami-beach-fl`)

### Access Tiers

| Tier | Auth State | Access |
|------|------------|--------|
| **Public** | No session | Summary, strictness badge, boolean flags, tax rate (SEO layer) |
| **Free** | Logged in, `subscription_tier='free'` | Full details for ONE market of their choice |
| **Pro** | `subscription_tier` in `['starter','pro']` + `status='active'` | All markets + application steps |

Free users select their market on first view; stored in `user_settings.selected_regulation_market`.

### Key Components
- `StrictnessBadge` - Color-coded badge (strict/moderate/permissive)
- `MarketCard` - Directory listing card with flags
- `AtAGlance` - Quick facts grid (permit, fees, limits, taxes)
- `KnowledgeSection` - Grouped knowledge items by type
- `SourcesList` - Official government source links
- `ApplicationSteps` - Pro-only step-by-step permit guide
- `LockedContent` - Blur overlay with signup/upgrade CTA

### Strictness Derivation
Calculated from regulation data (not confidence score):
- High fees (>$500) = stricter
- Night caps = stricter
- Primary residence required = stricter
- High penalties (>$10k) = stricter

```typescript
import { deriveStrictness } from '@/lib/utils/regulations';
const level = deriveStrictness(regulation); // 'strict' | 'moderate' | 'permissive'
```

### Auth Helper
```typescript
import { getRegulationAccess, canAccessMarket } from '@/lib/auth/get-user-tier';

const access = await getRegulationAccess();
// { tier, userId, canViewFullContent, canViewApplicationSteps, canViewAllMarkets, selectedMarket }

const hasAccess = canAccessMarket(access, 'miami-beach-fl');
```

## CLI Commands (cp-gsm)

```bash
# Research a new market
npm run regulations -- research "City" -s ST -c "County"

# Batch research
npm run regulations -- research-batch -f markets.txt

# Import regulations
npm run regulations -- import data.json --update-existing

# Generate knowledge items
npm run regulations -- generate-knowledge --all --data-file data.json

# List jurisdictions
npm run regulations -- list --state CA
```

## When Building Features

### Already Built (learn-gsm)
- ✅ **Market Pages**: `/regulations/[slug]` with full regulation details
- ✅ **Market Directory**: `/regulations` with search, state grouping, popular markets
- ✅ **Tiered Access**: Public SEO layer, free (1 market), pro (all + steps)
- ✅ **Application Steps**: Pro-only `ApplicationSteps` component using `application_steps`
- ✅ **Key Gotchas**: Displayed in detail page using `key_gotchas` array
- ✅ **Sitemap**: All covered markets included for SEO
- ✅ **JSON-LD**: Structured data for search engines

### Future Opportunities
1. **Permit Wizard**: Interactive flow using `application_steps` with progress tracking
2. **Compliance Checker**: Cross-reference listing data with `regulations` fields
3. **Market Comparison**: Side-by-side regulation comparison tool
4. **Regulation Alerts**: Notify users when their market's regulations change
5. **Search**: Full-text search across `*_knowledge` tables with `searchable_text`
6. **Content Feed**: Query `videos_parsed` and `news_articles` filtered by regulation topics
