# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Learn STR by GoStudioM is a knowledge hub for short-term rental (STR) hosts. It aggregates curated YouTube videos and industry news articles, then provides an AI-powered chat interface to answer hosting questions using this knowledge base.

Production URL: https://learn.gostudiom.com

## Commands

```bash
npm run dev        # Start development server at localhost:3000
npm run build      # Production build
npm run lint       # ESLint check
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm test -- path/to/test.ts  # Run a single test file
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router (React 19)
- **Database**: Supabase (shared instance with other GoStudioM apps)
- **AI**: Google Gemini via Vercel AI SDK for chat feature
- **Styling**: Tailwind CSS v4

### Source Structure (`src/`)

```
app/                    # Next.js App Router pages
  api/chat/route.ts     # Streaming chat API with RAG
  videos/[slug]/        # Video detail pages (slug = youtube_video_id)
  news/[slug]/          # News article pages
  topics/[category]/    # Topic/category pages
  chat/                 # Full chat interface

lib/
  supabase-server.ts    # Server-side Supabase client (SSR)
  supabase-browser.ts   # Browser-side Supabase client (singleton)
  supabase-admin.ts     # Admin client with service role (bypasses RLS)
  supabase-config.ts    # Cross-subdomain SSO cookie config
  utils/categories.ts   # Category slug ↔ database value mapping

components/
  ui/                   # shadcn/ui primitives
  cards/                # VideoCard, NewsCard, CategoryCard
  chat/                 # Chat UI components
  layout/               # Header, Footer

types/database.ts       # TypeScript interfaces for Supabase tables
```

### Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full table definitions.

Key tables (all in shared Supabase instance):
- `videos_parsed` - YouTube videos with AI-extracted metadata
- `videos_knowledge` - Extracted knowledge items from videos
- `news_articles` - Industry news articles
- `news_knowledge` - Extracted knowledge from articles
- `learn_chat_rate_limits` - Anonymous chat rate limiting

Key RPC: `search_all_knowledge(search_query, result_limit)` - Full-text search across all knowledge

### Category System

Database stores Title Case (`"Getting Started"`), URLs use kebab-case (`getting-started`). See `src/lib/utils/categories.ts` for the mapping. Six categories:
- Getting Started, Your Listing, Pricing & Profitability
- Hosting Operations, Regulations & Compliance, Growth & Marketing

### Supabase Client Usage

- **Server Components/Route Handlers**: Use `createClient()` from `supabase-server.ts`
- **Client Components**: Use `getSupabaseBrowserClient()` from `supabase-browser.ts`
- **Admin operations** (bypass RLS): Use `getSupabaseAdmin()` from `supabase-admin.ts`

Cookie domain is set to `.gostudiom.com` in production for cross-subdomain SSO.

### Chat API

The `/api/chat` route implements RAG:
1. Searches knowledge base via `search_all_knowledge` RPC
2. Injects results into system prompt
3. Streams response via Gemini 2.0 Flash
4. Rate-limited to 5 messages/day per anonymous user

## Environment Variables

See `.env.example`. Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - For admin operations
- `GEMINI_API_KEY` - Google Gemini API key

## Testing

Tests use Jest with React Testing Library. Test files live in `src/__tests__/` mirroring the source structure.

```bash
npm test -- --testPathPattern=categories  # Run tests matching pattern
npm run test:coverage                      # Generate coverage report
```

The `jest.setup.tsx` mocks `next/navigation`, `next/image`, and environment variables.
