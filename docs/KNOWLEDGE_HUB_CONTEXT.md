# Knowledge Hub Data Context

## Overview

The GoStudioM Knowledge Hub aggregates STR (Short-Term Rental) educational content from three sources:
1. **YouTube Videos** - Curated channels teaching hosting strategies
2. **News Articles** - Industry news via RSS feeds and Google News
3. **Regulations** - Municipal STR regulations (76+ markets)

All knowledge is extracted via AI and stored in searchable formats for the Learn platform.

## Database Schema

### Video Pipeline Tables

#### `videos_channels`
YouTube channels being monitored.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| channel_id | TEXT | YouTube channel ID |
| title | TEXT | Channel name |
| subscriber_count | INTEGER | Subscriber count |
| video_count | INTEGER | Total videos |
| status | ENUM | 'active', 'paused', 'inactive' |
| last_checked_at | TIMESTAMPTZ | Last API fetch |

#### `videos_raw`
Raw video data from YouTube API.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| youtube_video_id | TEXT | YouTube video ID |
| channel_id | TEXT | FK to channel |
| title | TEXT | Video title |
| description | TEXT | Video description |
| published_at | TIMESTAMPTZ | Publish date |
| view_count | INTEGER | Views |
| like_count | INTEGER | Likes |
| duration | TEXT | ISO 8601 duration |
| has_captions | BOOLEAN | Has transcribable captions |
| ai_status | ENUM | 'pending', 'processing', 'completed', 'failed', 'skipped' |

#### `videos_parsed`
AI-processed video content.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| video_id | UUID | FK to videos_raw |
| summary | TEXT | AI-generated summary |
| tags | TEXT[] | Content tags |
| category | ENUM | Content category |
| skill_level | ENUM | 'beginner', 'intermediate', 'advanced' |
| score | INTEGER | Quality score (0-100) |
| ai_confidence | DECIMAL | AI confidence (0-1) |
| transcript | TEXT | Full transcript |

#### `videos_knowledge`
Extracted knowledge items from videos.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| video_id | UUID | FK to videos_raw |
| knowledge_type | ENUM | 'insight', 'action_item', 'resource', 'definition', 'mistake' |
| content | JSONB | Knowledge content |
| category | ENUM | Content category |
| skill_level | ENUM | Skill level |
| searchable_text | TEXT | For full-text search |

### News Pipeline Tables

#### `news_sources`
RSS feeds and Google News queries.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Source name |
| slug | TEXT | URL-friendly ID |
| source_type | ENUM | 'rss', 'google_news' |
| source_category | ENUM | 'industry', 'platform', 'mainstream', 'creator', 'real_estate', 'travel' |
| url | TEXT | Feed URL or query |
| is_active | BOOLEAN | Currently fetching |
| articles_count | INTEGER | Total articles |

#### `news_articles`
Fetched articles with AI processing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| source_id | UUID | FK to news_sources |
| url | TEXT | Article URL |
| title | TEXT | Article title |
| excerpt | TEXT | Preview text |
| full_text | TEXT | Full article content |
| published_at | TIMESTAMPTZ | Publish date |
| status | ENUM | 'pending', 'processing', 'parsed', 'skipped', 'failed' |
| summary | TEXT | AI summary |
| category | TEXT | Content category |
| skill_level | TEXT | Skill level |
| tags | TEXT[] | Content tags |
| score | INTEGER | Quality score (0-100) |
| is_relevant | BOOLEAN | Passes relevance filter |
| locations_mentioned | TEXT[] | Geographic locations |
| primary_location | TEXT | Main location |
| is_local_news | BOOLEAN | Location-specific news |

#### `news_knowledge`
Extracted knowledge from articles.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| article_id | UUID | FK to news_articles |
| knowledge_type | TEXT | 'insight', 'action_item', 'resource', 'definition', 'mistake' |
| content | JSONB | Knowledge content |
| category | TEXT | Content category |
| searchable_text | TEXT | For search |

### Regulations Tables

#### `jurisdictions`
Geographic entities with STR rules.

#### `regulations`
Full regulatory data including:
- `application_steps` (JSONB) - Step-by-step permit guide
- `key_gotchas` (TEXT[]) - Common mistakes

#### `regulations_knowledge`
Searchable knowledge items (~48 per market).

## Content Categories

All content is categorized into:

| Category | Description |
|----------|-------------|
| Getting Started | New host basics, first listing |
| Your Listing | Photos, descriptions, amenities |
| Pricing & Profitability | Revenue, pricing strategies |
| Hosting Operations | Cleaning, maintenance, guests |
| Regulations & Compliance | Permits, taxes, legal |
| Growth & Marketing | Direct bookings, scaling |

## Knowledge Types

| Type | Description | Example |
|------|-------------|---------|
| insight | Key learning or trend | "Hosts in Austin see 20% higher bookings with professional photos" |
| action_item | Actionable step | "Add your permit number to your listing title" |
| resource | Tool or link | "Use PriceLabs for dynamic pricing" |
| definition | Term explanation | "TOT = Transient Occupancy Tax, collected on stays under 30 days" |
| mistake | Common error | "Don't forget to register for city tax even if Airbnb collects it" |

## Querying Examples

### Get all knowledge for a topic
```sql
-- Search across all knowledge sources
SELECT 'video' as source, content, searchable_text 
FROM videos_knowledge 
WHERE searchable_text ILIKE '%pricing%'
UNION ALL
SELECT 'news' as source, content::text, searchable_text 
FROM news_knowledge 
WHERE searchable_text ILIKE '%pricing%'
UNION ALL
SELECT 'regulation' as source, content, searchable_text 
FROM regulations_knowledge 
WHERE searchable_text ILIKE '%pricing%'
LIMIT 50;
```

### Get recent high-quality content
```sql
-- Top videos by score
SELECT vr.title, vp.score, vp.category, vp.summary
FROM videos_parsed vp
JOIN videos_raw vr ON vr.id = vp.video_id
WHERE vp.score >= 70
ORDER BY vr.published_at DESC
LIMIT 20;

-- Recent relevant news
SELECT title, summary, score, published_at
FROM news_articles
WHERE status = 'parsed' AND is_relevant = true AND score >= 60
ORDER BY published_at DESC
LIMIT 20;
```

### Get regulation steps for a market
```sql
SELECT 
  j.name,
  r.plain_english,
  r.application_steps,
  r.key_gotchas
FROM jurisdictions j
JOIN regulations r ON r.jurisdiction_id = j.id
WHERE j.slug = 'austin-tx';
```

### Count total knowledge
```sql
SELECT 
  (SELECT COUNT(*) FROM videos_knowledge) as video_knowledge,
  (SELECT COUNT(*) FROM news_knowledge) as news_knowledge,
  (SELECT COUNT(*) FROM regulations_knowledge) as regulation_knowledge,
  (
    (SELECT COUNT(*) FROM videos_knowledge) +
    (SELECT COUNT(*) FROM news_knowledge) +
    (SELECT COUNT(*) FROM regulations_knowledge)
  ) as total;
```

## Data Stats (as of December 2024)

### Regulations
| Metric | Value |
|--------|-------|
| Jurisdictions | 76 |
| Knowledge items | ~9,800 |
| Avg per market | ~48 |
| With application_steps | 75 |
| With key_gotchas | 76 |

### Videos
| Metric | Value |
|--------|-------|
| Knowledge items | 100,625 |

### News
| Metric | Value |
|--------|-------|
| Knowledge items | 6,108 |

### Combined Total
| Source | Items |
|--------|-------|
| Regulations | 9,815 |
| Videos | 100,625 |
| News | 6,108 |
| **TOTAL** | **116,548** |

## Integration Notes

1. **Search**: Use `searchable_text` columns with `ILIKE` or `to_tsvector` for full-text search
2. **Categories**: All three sources use the same 6 categories for unified filtering
3. **Skill Levels**: beginner/intermediate/advanced for content difficulty
4. **Scores**: 0-100 quality scores (higher = better content)
5. **Regulations**: Use `application_steps` for permit wizards, `key_gotchas` for warnings

## API Endpoints to Build

Suggested endpoints for the Learn platform:

- `GET /api/knowledge/search?q={query}` - Search all knowledge
- `GET /api/knowledge/category/{category}` - By category
- `GET /api/regulations/{slug}` - Full regulation data
- `GET /api/regulations/{slug}/steps` - Just the permit steps
- `GET /api/videos/recent` - Latest processed videos
- `GET /api/news/recent` - Latest relevant articles
