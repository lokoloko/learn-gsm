# Learn STR by GoStudioM - Testing Instructions

**URL:** https://learn.gostudiom.com
**Last Updated:** December 23, 2025

---

## Overview

Learn STR is a knowledge hub for short-term rental hosts featuring:
- Curated video content from STR experts
- Industry news and articles
- Topic-based content organization
- AI-powered chat assistant

---

## Test Environment Setup

1. Open https://learn.gostudiom.com in your browser
2. Recommended: Use Chrome or Safari
3. Test on both desktop and mobile (or use browser dev tools to simulate mobile)

---

## Test Cases

### 1. Homepage

**What to test:**
- [ ] Page loads without errors
- [ ] Header shows GoStudioM logo (links to homepage)
- [ ] Navigation shows: Videos, News, Topics (centered)
- [ ] "Ask AI" button visible in header
- [ ] Hero section displays with chat input
- [ ] "Trending News" section shows 4 news cards
- [ ] "Popular Videos" section shows 8 video cards
- [ ] "Browse by Topic" section shows 6 category cards
- [ ] Footer displays with all links working
- [ ] Page title shows "Learn STR by GoStudioM - Knowledge Hub..."

**Expected behavior:**
- All sections load with content (not empty)
- Images display correctly
- Links are clickable

---

### 2. Videos Section

#### 2.1 Videos List Page (/videos)

**What to test:**
- [ ] Navigate to /videos
- [ ] Page title shows "Videos | Learn STR by GoStudioM"
- [ ] Video cards display with:
  - Thumbnail image
  - Video title
  - Channel name (no icon)
  - View count
  - Score
  - Category badge
  - Skill level badge
- [ ] Pagination works (if more than 24 videos)
- [ ] Filter by category works
- [ ] Filter by skill level works

#### 2.2 Video Detail Page (/videos/[slug])

**What to test:**
- [ ] Click on any video card
- [ ] YouTube video player embeds and plays
- [ ] Video title displays
- [ ] Metadata shows: views, date, duration, score
- [ ] Channel name displays (no icon or handle)
- [ ] Category and skill level badges show
- [ ] Summary section displays
- [ ] "Watch on YouTube" button appears after summary
- [ ] "Watch on YouTube" button opens YouTube in new tab
- [ ] Knowledge sections display (if available):
  - Key Insights
  - Action Items
  - Tools & Resources
  - Common Mistakes
- [ ] Related Videos sidebar shows similar content

---

### 3. News Section

#### 3.1 News List Page (/news)

**What to test:**
- [ ] Navigate to /news
- [ ] Page title shows "News | Learn STR by GoStudioM"
- [ ] News cards display with:
  - Article title
  - Summary/excerpt
  - Source name
  - Published date
  - Location tag (if applicable)
- [ ] Pagination works
- [ ] Filters work (if available)

#### 3.2 News Detail Page (/news/[slug])

**What to test:**
- [ ] Click on any news card
- [ ] Article title displays
- [ ] Source information shows
- [ ] Summary/content displays
- [ ] Knowledge sections display (if available)
- [ ] Related news shows

---

### 4. Topics Section

#### 4.1 Topics Index Page (/topics)

**What to test:**
- [ ] Navigate to /topics
- [ ] All 6 categories display:
  - Getting Started
  - Your Listing
  - Pricing & Profitability
  - Hosting Operations
  - Regulations & Compliance
  - Growth & Marketing
- [ ] Each category card is clickable

#### 4.2 Topic Detail Page (/topics/[category])

**What to test:**
- [ ] Click on any topic card
- [ ] Topic name displays as page title
- [ ] Videos in this category show
- [ ] News in this category show
- [ ] Breadcrumb navigation works

---

### 5. AI Chat

#### 5.1 Chat Page (/chat)

**What to test:**
- [ ] Navigate to /chat (or click "Ask AI" button)
- [ ] Empty state shows:
  - Welcome message
  - Chat input field
  - Starter prompts/suggestions
- [ ] Type a question and submit
- [ ] Response streams in (typing effect)
- [ ] Response includes relevant information
- [ ] Response cites sources when applicable
- [ ] Can ask follow-up questions
- [ ] Chat history persists during session
- [ ] Footer is visible (page scrolls)

**Sample questions to test:**
1. "How do I price my Airbnb listing?"
2. "What are the best practices for guest communication?"
3. "How do I handle cleaning between guests?"
4. "What should I include in my house rules?"
5. "How do I become a Superhost?"

#### 5.2 Rate Limiting (Anonymous Users)

**What to test:**
- [ ] After 5 messages, rate limit warning appears
- [ ] Cannot send more messages after limit reached
- [ ] Sign-up prompt displays

#### 5.3 Homepage Chat Widget

**What to test:**
- [ ] Chat input on homepage works
- [ ] Submitting redirects to /chat with answer

---

### 6. Navigation & Links

**What to test:**
- [ ] Logo links to homepage
- [ ] Videos link goes to /videos
- [ ] News link goes to /news
- [ ] Topics link goes to /topics
- [ ] "Ask AI" button goes to /chat
- [ ] Mobile menu works (hamburger icon)
- [ ] Footer links work:
  - Product links (external GoStudioM apps)
  - Legal links (Privacy, Terms, etc.)

---

### 7. SEO & Meta

**What to test:**
- [ ] Page titles include "GoStudioM"
- [ ] Favicon displays in browser tab
- [ ] Sharing a link shows:
  - Correct title
  - Description
  - Image (if applicable)

**How to test sharing:**
1. Copy a page URL
2. Paste into Slack, Discord, or Twitter
3. Preview should show correct metadata

---

### 8. Mobile Responsiveness

**What to test:**
- [ ] Homepage displays correctly on mobile
- [ ] Navigation collapses to hamburger menu
- [ ] Video cards stack vertically
- [ ] Chat input is usable on mobile
- [ ] Text is readable without zooming
- [ ] Buttons are tappable (not too small)

---

### 9. Performance

**What to test:**
- [ ] Pages load within 3 seconds
- [ ] Images lazy load (don't block page)
- [ ] No console errors (open browser dev tools)
- [ ] Chat responses start streaming within 2-3 seconds

---

## Bug Reporting

When reporting a bug, include:

1. **Page URL** where the issue occurred
2. **Steps to reproduce** (what you did)
3. **Expected behavior** (what should happen)
4. **Actual behavior** (what happened instead)
5. **Screenshot** (if applicable)
6. **Device/Browser** (e.g., "iPhone 14, Safari" or "Windows, Chrome")

---

## Contact

Report issues to the development team or create a GitHub issue.
