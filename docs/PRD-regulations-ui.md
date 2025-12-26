# PRD: Regulation Intelligence System

> **Project:** learn-gsm (Knowledge Hub)  
> **Related:** See cp-gsm/docs/PRD-regulation-pipeline.md for backend CLI & data ingestion  
> **Focus:** Frontend UI, SEO pages, RAG integration  
> **Last Updated:** December 2024

## Overview

Build the user-facing regulations section for the Knowledge Hub. Transform complex legal documents into plain English guidance that hosts can understand and act on.

**Tagline:** "Know your local STR rules before you list"

**Problem:** Hosts face a maze of overlapping regulations from state, county, and city levels. Getting it wrong means fines, delisting, or legal action. Current solutions require expensive lawyers or hours of research.

**Solution:** AI-powered regulation research with plain English explanations, step-by-step application guides, and jurisdiction-aware lookup.

---

## Current Data (December 2024)

| Metric | Value |
|--------|-------|
| Markets covered | 51 |
| Knowledge items | 1,740 |
| Source URLs | 610 |
| With citations | 100% |
| Avg items/market | 34.1 |
| Avg confidence | 93.5% |
| Markets with application steps | 50 (98%) |
| Prohibited markets | 1 (Anaheim - no steps needed) |

### Data Structure

Each market includes:
- **Summary** - Plain English overview
- **Key Gotchas** - Common mistakes hosts make
- **Registration** - Permit requirements, fees, agencies
- **Eligibility** - Primary residence, property types, zones
- **Limits** - Night caps, guest limits, stay length
- **Taxes** - TOT rates, platform collection status
- **Safety** - Required detectors, inspections
- **Penalties** - Fines, enforcement actions
- **Application Steps** - Step-by-step process with URLs, costs, time estimates
- **Source URLs** - Official government sources with citations

---

## URL Structure

```
/regulations                    # Directory page - browse all markets
/regulations/[slug]             # Market detail (e.g., /regulations/miami-beach-fl)
```

**Navigation:** Display as "Rules" in nav, but use `/regulations` URL for SEO
- Nav shows: `Videos | News | Rules | Topics`
- URL/content uses: "Regulations" for search ranking

---

## Access Tiers

### Tier 1: Public (No Account) - SEO Layer

What Google crawls and casual visitors see:

```
/regulations/santa-monica-ca

✅ VISIBLE:
• Plain English summary
• Complexity badge (STRICT / MODERATE / PERMISSIVE)
• Boolean flags: "Permits required" / "Night limits apply" / "Primary residence only"
• Total tax rate
• Last updated date
• "X gotchas hosts commonly miss" (count only)

🔒 HIDDEN (blurred/locked):
• Specific fees and costs
• Application steps
• Required documents
• Full knowledge items (34 per market)
• Source links with citations
• Key gotchas content
```

**Purpose:** Rank in search, create curiosity, drive signups

**CTA:** "Create free account to see full requirements"

---

### Tier 2: Free Account (1 Property Users)

Users on free tier of any GoStudioM product:

```
✅ VISIBLE (for ONE market - their property location):
• Everything from Tier 1
• Full fees and costs
• All knowledge items
• Key gotchas content
• Source links with citations

🔒 HIDDEN:
• Application steps (Pro feature)
• Required documents checklist
• Access to OTHER markets (limited to their city)
```

**Purpose:** Serve their immediate need, demonstrate value, create upgrade desire

**CTA:** "Get step-by-step application guide with any paid plan"

---

### Tier 3: Pro (Any Paid Subscription)

Full access for paying customers:

```
✅ FULL ACCESS:
• Unlimited market access (all 51+ markets)
• Step-by-step application process
  - Each step with title, description, URL
  - Estimated time and cost per step
  - Required documents per step
• Required documents checklist
• All knowledge items with full citations
• Downloadable compliance checklist (future)
• Change alerts for saved locations (future)
```

**Purpose:** Retention, perceived value, reduce churn

---

## Application Steps Feature (Pro Only)

### What It Includes

Each market has 4-6 application steps, for example Miami Beach:

| Step | Title | Description | Time | Cost |
|------|-------|-------------|------|------|
| 1 | Verify Zoning Eligibility | Use city's official map to confirm property is in permitted zone | 1 day | Free |
| 2 | Obtain State License | Apply through Florida DBPR for vacation rental license | 2-4 weeks | ~$200 |
| 3 | Register for State/County Taxes | Register with FL DOR and Miami-Dade Tax Collector | 1 week | Free |
| 4 | Apply for City License | Submit to Miami Beach Building Dept with required documents | 2-4 weeks | $520 |
| 5 | Update Listing | Add license numbers to all platforms | 1 day | Free |

### Data Structure

```typescript
interface ApplicationStep {
  step: number;           // 1, 2, 3...
  title: string;          // "Verify Zoning Eligibility"
  description: string;    // Detailed instructions
  url: string | null;     // Direct link to application/info
  documents_needed: string[] | null;  // ["Deed", "ID", "Insurance"]
  estimated_time: string | null;      // "2-4 weeks"
  cost: number | null;    // 520 (dollars)
}
```

### UI Treatment

**Public/Free:** Show step count only
```
📋 5-Step Application Process
   Unlock with any paid plan →
```

**Pro:** Full expandable steps
```
📋 HOW TO GET PERMITTED

Step 1: Verify Zoning Eligibility
├── Use city's official zoning map to confirm...
├── 🔗 Miami Beach Zoning Map
├── ⏱️ 1 day
└── 💰 Free

Step 2: Obtain State License
├── Apply through Florida DBPR...
├── 🔗 DBPR Application Portal
├── ⏱️ 2-4 weeks
├── 💰 ~$200
└── 📄 Documents: Proof of ownership, Insurance cert

[Continue for all steps...]
```

---

## Pages

### 1. Directory Page (`/regulations`)

**Purpose:** Browse all markets, search, popular markets

- Search bar for markets
- Popular markets grid with strictness badges
- Browse by state (grouped)
- "Request a market" CTA

### 2. Market Detail Page (`/regulations/[slug]`)

**Purpose:** Full regulation details for a specific market

Sections:
1. Header with name, strictness badge, confidence score
2. Plain English summary
3. Key gotchas (locked for public)
4. Application steps (locked for free)
5. At-a-glance facts grid
6. Detailed requirements by category (tabbed)
7. Official sources list
8. Related news/videos
9. Disclaimer

---

## SEO Strategy

### Target Keywords

| Page | Target Keywords |
|------|-----------------|
| Directory | "str regulations by city", "airbnb rules lookup" |
| Miami Beach | "miami beach airbnb rules", "miami beach str permit" |
| Austin | "austin airbnb regulations", "austin str license" |
| Los Angeles | "los angeles airbnb laws", "la str permit" |

### Meta Tags

```typescript
// /regulations/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const regulation = await getRegulation(params.slug);
  
  return {
    title: `${regulation.name} STR Regulations | Airbnb Rules & Permits`,
    description: `Complete guide to short-term rental regulations in ${regulation.name}. ${regulation.summary.slice(0, 100)}...`,
    openGraph: {
      title: `${regulation.name} STR Regulations`,
      description: regulation.summary,
      type: 'article',
    },
  };
}
```

---

## Implementation Phases

### Phase 1: Pipeline ✅ COMPLETE
- [x] CLI tool for researching markets
- [x] Gemini Deep Research integration
- [x] Structured data extraction
- [x] Knowledge item generation
- [x] Application steps generation
- [x] 51 markets researched

### Phase 2: Frontend UI (Current)
- [x] Add "Rules" to Header navigation (links to /regulations)
- [ ] Create `/regulations` directory page
- [ ] Create `/regulations/[slug]` detail page
- [ ] Implement tiered access (public/free/pro)
- [ ] Add regulations section to homepage

### Phase 3: Integration
- [ ] RAG chat integration
- [ ] Related news/videos on detail pages
- [ ] Listing Analyzer integration (show relevant regs)

### Phase 4: Enhancement
- [ ] Change detection and alerts
- [ ] Downloadable compliance checklists
- [ ] Market comparison tool
- [ ] User-requested market pipeline

---

## Files to Create

```
src/
├── app/
│   └── regulations/
│       ├── page.tsx              # Directory page
│       └── [slug]/
│           └── page.tsx          # Detail page
├── components/
│   └── regulations/
│       ├── MarketCard.tsx        # Card for directory
│       ├── StrictnessBadge.tsx   # STRICT/MODERATE/PERMISSIVE
│       ├── ApplicationSteps.tsx  # Step-by-step (Pro only)
│       ├── KnowledgeSection.tsx  # Grouped knowledge items
│       ├── AtAGlance.tsx         # Quick facts grid
│       └── SourcesList.tsx       # Official sources
└── lib/
    └── queries/
        └── regulations.ts        # Supabase queries
```

---

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Markets covered | 100 | Q1 2025 |
| Organic traffic to /regulations | 5K/month | Q2 2025 |
| SEO rankings | Top 20 for "[city] airbnb rules" | Q2 2025 |
| Pro conversion from regulations | 2% | Q2 2025 |
