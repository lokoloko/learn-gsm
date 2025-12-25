# Database Schema

This document describes the Supabase tables used by Learn STR. These tables are part of a shared GoStudioM Supabase instance.

## Quick Reference

| Domain | Tables | Records |
|--------|--------|---------|
| Videos | `videos_channels`, `videos_parsed`, `videos_knowledge` | 100k+ knowledge items |
| News | `news_sources`, `news_articles`, `news_knowledge` | 6k+ knowledge items |
| Regulations | `jurisdictions`, `regulations`, `regulations_knowledge`, `regulation_sources` | 120+ markets, 15k+ knowledge items |
| Auth | `profiles`, `user_settings` | Shared with GoStudioM apps |

## Enums

### videos_category
```
'Getting Started' | 'Your Listing' | 'Pricing & Profitability' |
'Hosting Operations' | 'Regulations & Compliance' | 'Growth & Marketing'
```

### videos_skill_level
```
'beginner' | 'intermediate' | 'advanced'
```

### videos_knowledge_type
```
'insight' | 'action_item' | 'resource' | 'definition' | 'mistake'
```

### videos_channel_status
```
'active' | 'paused' | 'inactive'
```

### news_article_status
```
'pending' | 'processing' | 'parsed' | 'skipped' | 'failed'
```

### news_source_type
```
'rss' | 'google_news'
```

### news_source_category
```
'industry' | 'platform' | 'mainstream' | 'creator' | 'real_estate' | 'travel'
```

### jurisdiction_type
```
'city' | 'county'
```

### coverage_status
```
'covered' | 'pending' | 'research' | 'not_applicable'
```

### regulation_status
```
'draft' | 'published' | 'archived'
```

### regulation_knowledge_type
```
'eligibility' | 'requirement' | 'fee' | 'limit' | 'tax' | 'penalty' | 'safety' | 'exemption' | 'process' | 'gotcha'
```

### subscription_tier (profiles)
```
'free' | 'starter' | 'pro'
```

### subscription_status (profiles)
```
'active' | 'canceled' | 'past_due' | 'trialing'
```

## Tables

### videos_channels

YouTube channels being tracked for STR content.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| channel_id | text | NO | | YouTube channel ID |
| title | text | NO | | Channel name |
| description | text | YES | | Channel description |
| handle | text | YES | | YouTube @handle |
| slug | text | YES | | URL-friendly slug |
| thumbnail_url | text | YES | | Channel avatar URL |
| uploads_playlist_id | text | YES | | YouTube uploads playlist |
| subscriber_count | integer | YES | | Subscriber count |
| video_count | integer | YES | | Total video count |
| status | videos_channel_status | YES | 'active' | Channel status |
| is_active | boolean | YES | true | Whether to process |
| priority_tier | integer | YES | 3 | Processing priority (1-3) |
| last_checked_at | timestamptz | YES | | Last sync time |
| subscriber_count_updated_at | timestamptz | YES | | Stats refresh time |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

### videos_parsed

Parsed video data with AI-extracted metadata.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| video_id | uuid | NO | | FK to videos_raw |
| youtube_video_id | text | NO | | YouTube video ID |
| slug | text | YES | | URL-friendly slug |
| channel_id | text | YES | | YouTube channel ID |
| channel_title | text | YES | | Denormalized channel name |
| title | text | YES | | Video title |
| description | text | YES | | Video description |
| thumbnail_url | text | YES | | Thumbnail URL |
| summary | text | YES | | AI-generated summary |
| tags | text[] | YES | '{}' | AI-extracted tags |
| category | videos_category | YES | | Content category |
| skill_level | videos_skill_level | YES | 'beginner' | Target audience |
| score | integer | YES | 0 | Quality/relevance score |
| ai_confidence | numeric | YES | | AI confidence score |
| ai_status | text | YES | 'pending' | AI processing status |
| ai_failed | boolean | YES | false | Whether AI parsing failed |
| ai_retries | integer | YES | 0 | Number of AI retries |
| ai_parsed_at | timestamptz | YES | | When AI processed |
| transcript | text | YES | | Video transcript |
| has_captions | boolean | YES | false | Has captions available |
| duration | integer | YES | | Duration in seconds |
| view_count | integer | YES | 0 | YouTube views |
| like_count | integer | YES | 0 | YouTube likes |
| comment_count | integer | YES | 0 | YouTube comments |
| stat_velocity | jsonb | YES | | View velocity metrics |
| stats_updated_at | timestamptz | YES | | Stats refresh time |
| published_at | timestamptz | YES | | YouTube publish date |
| is_available | boolean | YES | true | Still on YouTube |
| availability_checked_at | timestamptz | YES | | Last availability check |
| availability_check_count | integer | YES | 0 | Check count |
| ingestion_run_id | uuid | YES | | Batch ingestion ID |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

**Key filters for display:**
- `ai_status = 'completed'` - Only show fully parsed videos

### videos_knowledge

Extracted knowledge items from videos (insights, action items, resources, etc.).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| video_id | uuid | NO | | FK to videos_parsed |
| knowledge_type | videos_knowledge_type | NO | | Type of knowledge |
| content | jsonb | NO | | Structured content (see below) |
| category | videos_category | YES | | Inherited from video |
| skill_level | videos_skill_level | YES | 'beginner' | Target audience |
| searchable_text | text | YES | | Full-text search field |
| created_at | timestamptz | YES | now() | |

**content JSONB structure:**
```json
{
  "text": "Main content text",
  "term": "For definitions only",
  "effort": "low|medium|high",      // action_items
  "impact": "low|medium|high",      // action_items
  "resource_name": "Tool name",     // resources
  "resource_type": "tool|service|website|book|course|app",
  "url_hint": "example.com"         // resources
}
```

### news_sources

RSS feeds and news sources for STR industry news.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | | Source display name |
| slug | text | NO | | URL-friendly slug |
| source_type | news_source_type | NO | 'rss' | Feed type |
| source_category | news_source_category | NO | 'industry' | Source category |
| url | text | NO | | Feed URL |
| keywords | text[] | YES | '{}' | Search keywords |
| logo_url | text | YES | | Source logo |
| description | text | YES | | Source description |
| is_active | boolean | YES | true | Whether to fetch |
| articles_count | integer | YES | 0 | Total articles |
| last_checked_at | timestamptz | YES | | Last fetch time |
| last_error | text | YES | | Last error message |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

### news_articles

News articles fetched from sources.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| source_id | uuid | NO | | FK to news_sources |
| slug | text | YES | | URL-friendly slug |
| external_id | text | YES | | Source's article ID |
| url | text | NO | | Article URL |
| url_hash | text | YES | | URL hash for dedup |
| title | text | NO | | Article title |
| excerpt | text | YES | | Short excerpt |
| full_text | text | YES | | Full article text |
| image_url | text | YES | | Featured image |
| author | text | YES | | Article author |
| published_at | timestamptz | YES | | Publish date |
| status | news_article_status | YES | 'pending' | Processing status |
| retries | integer | YES | 0 | Parse retry count |
| last_error | text | YES | | Last error message |
| summary | text | YES | | AI-generated summary |
| category | text | YES | | Content category |
| skill_level | text | YES | | Target audience |
| tags | text[] | YES | '{}' | AI-extracted tags |
| score | integer | YES | | Quality/relevance score |
| confidence | numeric | YES | | AI confidence |
| is_relevant | boolean | YES | | STR relevance flag |
| locations_mentioned | text[] | YES | '{}' | Locations in article |
| primary_location | text | YES | | Main location |
| is_local_news | boolean | YES | false | Local vs national |
| parsed_at | timestamptz | YES | | When AI processed |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

**Key filters for display:**
- `status = 'parsed'` - Only show parsed articles
- `is_relevant = true` - Only show STR-relevant articles

### news_knowledge

Extracted knowledge items from news articles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| article_id | uuid | NO | | FK to news_articles |
| knowledge_type | text | NO | | Type of knowledge |
| content | jsonb | NO | | Structured content |
| category | text | YES | | Content category |
| skill_level | text | YES | | Target audience |
| searchable_text | text | YES | | Full-text search field |
| created_at | timestamptz | YES | now() | |

## Regulations Tables

### jurisdictions

Markets/cities with STR regulation coverage.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| slug | text | NO | | URL-friendly slug (e.g., 'miami-beach-fl') |
| name | text | NO | | Display name (e.g., 'Miami Beach') |
| full_name | text | YES | | Full name with state |
| state_code | text | NO | | Two-letter state code |
| state_name | text | NO | | Full state name |
| jurisdiction_type | text | NO | | 'city' or 'county' |
| coverage_status | text | YES | | 'covered', 'pending', etc. |
| population | integer | YES | | City/county population |
| timezone | text | YES | | IANA timezone |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

**Key filters for display:**
- `coverage_status = 'covered'` - Only show markets with regulation data

### regulations

STR regulation details for each jurisdiction.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| jurisdiction_id | uuid | NO | | FK to jurisdictions |
| primary_source_id | uuid | YES | | FK to regulation_sources |
| summary | text | YES | | Plain text summary |
| plain_english | text | YES | | Simplified explanation |
| registration | jsonb | YES | | Permit/registration data (see below) |
| eligibility | jsonb | YES | | Eligibility requirements |
| limits | jsonb | YES | | Night caps, guest limits |
| taxes | jsonb | YES | | Tax rates and fees |
| insurance | jsonb | YES | | Insurance requirements |
| safety | jsonb | YES | | Safety requirements |
| penalties | jsonb | YES | | Fines and enforcement |
| exemptions | jsonb | YES | | Exemptions and exceptions |
| preemption | jsonb | YES | | State preemption info |
| application_steps | jsonb | YES | | Step-by-step permit guide (Pro only) |
| key_gotchas | text[] | YES | | Common host mistakes |
| effective_date | date | YES | | When regulations took effect |
| last_amended | date | YES | | Last amendment date |
| next_review_date | date | YES | | Scheduled review |
| law_reference | text | YES | | Legal citation |
| confidence_score | numeric | YES | | AI parsing confidence (0-1) |
| needs_review | boolean | YES | false | Flagged for manual review |
| verified_at | timestamptz | YES | | Last manual verification |
| verified_by | uuid | YES | | FK to auth.users |
| verification_notes | text | YES | | Review notes |
| status | text | YES | 'draft' | 'draft', 'published', 'archived' |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

**JSONB field structures:**

All JSONB fields use city/county nesting pattern:

**registration:**
```json
{
  "city": {
    "required": true,
    "fee": 520,
    "agency": "City Planning Department",
    "processing_time": "2-4 weeks",
    "required_documents": ["ID", "Proof of ownership"],
    "renewal_period": "annual"
  },
  "county": { "required": false }
}
```

**eligibility:**
```json
{
  "city": {
    "primary_residence_required": true,
    "owner_occupied": false,
    "property_types_allowed": ["single_family", "condo"],
    "zones_allowed": ["R1", "R2", "MU"]
  }
}
```

**limits:**
```json
{
  "city": {
    "max_nights_per_year": 90,
    "max_guests": 10,
    "min_stay_nights": 2,
    "max_properties_per_owner": 1
  }
}
```

**taxes:**
```json
{
  "city": {
    "total_rate": "13.5%",
    "transient_occupancy_tax": 12,
    "tourism_fee": 1.5
  },
  "state": { "sales_tax": 6 }
}
```

**penalties:**
```json
{
  "city": {
    "first_offense": 1000,
    "max_fine": 15000,
    "daily_fine": 500,
    "can_revoke_license": true
  }
}
```

**application_steps (Pro only):**
```json
[
  {
    "step": 1,
    "title": "Verify Zoning Eligibility",
    "description": "Check city zoning map...",
    "url": "https://example.com/zoning",
    "documents_needed": ["Proof of ownership"],
    "estimated_time": "1 day",
    "cost": 0
  }
]
```

**key_gotchas (text array):**
```json
[
  "ADUs are prohibited even if main home is eligible",
  "Must display permit number in listing",
  "Fire inspection required BEFORE permit approval"
]
```

### regulations_knowledge

Extracted knowledge items from regulations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| regulation_id | uuid | YES | | FK to regulations |
| jurisdiction_id | uuid | NO | | FK to jurisdictions |
| knowledge_type | text | NO | | Type (see below) |
| content | text | NO | | Knowledge content |
| searchable_text | text | YES | | Full-text search field |
| applies_to | text | YES | | Property type filter |
| source_id | uuid | YES | | FK to regulation_sources |
| created_at | timestamptz | YES | now() | |

**knowledge_type values:**
- `eligibility` - Who can apply
- `requirement` - What's required
- `fee` - Costs and fees
- `limit` - Restrictions
- `tax` - Tax information
- `penalty` - Fines/enforcement
- `safety` - Safety requirements
- `exemption` - Exceptions
- `process` - Application steps
- `gotcha` - Common mistakes

### regulation_sources

Official government sources for regulations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| jurisdiction_id | uuid | NO | | FK to jurisdictions |
| url | text | NO | | Source URL |
| source_type | text | YES | | 'government', 'ordinance', 'application' |
| source_name | text | YES | | Display name |
| scrape_method | text | YES | | 'playwright', 'fetch', 'manual' |
| scrape_frequency | text | YES | | 'daily', 'weekly', 'monthly' |
| last_scraped_at | timestamptz | YES | | Last scrape time |
| last_changed_at | timestamptz | YES | | Last content change |
| last_error | text | YES | | Last error message |
| error_count | integer | YES | 0 | Consecutive errors |
| status | text | YES | 'active' | 'active', 'paused', 'error' |
| notes | text | YES | | Internal notes |
| added_by | uuid | YES | | FK to auth.users |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

**Key filters for display:**
- `status = 'active'` - Only show active sources

## Auth Tables

### profiles

User profiles with subscription information. Shared across all GoStudioM apps.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | | Primary key (matches auth.users.id) |
| email | text | YES | | User email |
| full_name | text | YES | | Display name |
| avatar_url | text | YES | | Profile image |
| subscription_tier | text | YES | 'free' | 'free', 'starter', 'pro' |
| subscription_status | text | YES | | 'active', 'canceled', 'past_due', 'trialing' |
| subscription_ends_at | timestamptz | YES | | When subscription expires |
| stripe_customer_id | text | YES | | Stripe customer ID |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

**Access tier logic for regulations:**
- `public` - No session (SEO layer only)
- `free` - Logged in, `subscription_tier = 'free'` (one market)
- `pro` - `subscription_tier` in `['starter', 'pro']` AND `subscription_status = 'active'` (all markets + steps)

### user_settings

User preferences including free user's selected regulation market.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | | FK to auth.users |
| selected_regulation_market | text | YES | | Free user's chosen market slug |
| created_at | timestamptz | YES | now() | |
| updated_at | timestamptz | YES | now() | |

**Unique constraint:** `user_id`

**Usage:** Free users can view full regulation details for ONE market. When they first view a market's details, they're prompted to select it. The slug is stored here.

---

## Other Tables

### learn_chat_rate_limits

Rate limiting for anonymous chat users.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| identifier | text | NO | | Client identifier (IP + UA hash) |
| date | date | NO | CURRENT_DATE | Rate limit date |
| message_count | integer | YES | 1 | Messages sent today |

**Unique constraint:** `(identifier, date)`

## RPC Functions

### search_all_knowledge(search_query, result_limit)

Full-text search across all video and news knowledge items.

**Parameters:**
- `search_query` (text) - Search terms
- `result_limit` (integer) - Max results to return

**Returns:**
| Column | Type | Description |
|--------|------|-------------|
| source_type | text | 'video' or 'news' |
| source_id | uuid | ID of video/article |
| source_title | text | Video/article title |
| source_url | text | YouTube URL or article URL |
| knowledge_type | text | Type of knowledge item |
| content | text | searchable_text content |
| category | text | Content category |
| skill_level | text | Target audience |
| rank | real | Full-text search rank (videos boosted 1.2x) |

### increment_learn_chat_rate_limit(p_identifier, p_date)

Upserts rate limit counter for anonymous users.

**Parameters:**
- `p_identifier` (text) - Client identifier
- `p_date` (date) - Current date

**Returns:** New message count (integer)
